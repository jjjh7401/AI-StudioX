/// <reference types="vite/client" />
import { GoogleGenAI, Modality, GenerateContentResponse, Type } from "@google/genai";
import { MODEL_FACE_SHAPES, MODEL_HAIR_STYLES, MODEL_HAIR_COLORS } from '../data/constants';
import { SCRIPT_STYLES_MASTER_PROMPT } from '../data/scriptStyles';
import { ScriptData, ScriptShot } from "../types";
import { urlToDataURL, urlToResizedDataURL } from './imageProcessingService'; 

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

/**
 * Helper to perform a task with exponential backoff on 429/quota errors.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
    let lastError: any;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const errorMsg = error.message || JSON.stringify(error);
            const isQuotaError = errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED") || error.status === 429;
            const isSessionError = 
                errorMsg.includes("Requested entity was not found.") || 
                errorMsg.includes("API_KEY_INVALID") || 
                errorMsg.includes("API key not valid") ||
                errorMsg.includes("API_KEY_SERVICE_BLOCKED");
            
            if (isSessionError) {
                console.warn("API Key error detected, attempting to open selection window...");
                if (window.aistudio?.openSelectKey) {
                    await window.aistudio.openSelectKey();
                    throw new Error("API Key is invalid or missing. Please select a valid API key in the platform dialog and try again.");
                } else {
                    throw new Error("API Key is invalid or missing. If you are using the deployed app, please set the GEMINI_API_KEY environment variable in the settings.");
                }
            }

            if (isQuotaError && i < maxRetries) {
                const delay = Math.pow(2, i) * 5000;
                console.warn(`Quota reached (429). Retrying attempt ${i + 1}/${maxRetries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

/**
 * Always creates a fresh GoogleGenAI instance using process.env.API_KEY.
 * Removed forced key selection to allow using user's own environment key.
 */
const getFreshGenAI = async (): Promise<GoogleGenAI> => {
    // We use a dummy key because the actual key is injected by the backend proxy.
    // The proxy runs on the same host, so we use a relative path.
    return new GoogleGenAI({ 
        apiKey: 'proxy-key', 
        httpOptions: { 
            baseUrl: window.location.origin + '/api/gemini' 
        } 
    });
};

const resizeImageForVideo = async (url: string, width: number, height: number): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return url;
  
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = url;
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve;
  });
  
  if (!img.complete || img.naturalWidth === 0) return url;

  const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
  const x = (canvas.width / 2) - (img.width / 2) * scale;
  const y = (canvas.height / 2) - (img.height / 2) * scale;
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  
  return canvas.toDataURL('image/jpeg', 0.9);
};

export const preprocessImageForOutpainting = (imageUrl: string, aspectRatio: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas failed'));
    const targetDimensions: { [key: string]: { width: number; height: number } } = {
      '16:9': { width: 1344, height: 768 }, '9:16': { width: 768, height: 1344 }, '1:1': { width: 1024, height: 1024 },
    };
    const dims = targetDimensions[aspectRatio] || targetDimensions['16:9'];
    canvas.width = dims.width; canvas.height = dims.height;
    ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image(); img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
      const sw = img.width * ratio; const sh = img.height * ratio;
      ctx.drawImage(img, (canvas.width - sw) / 2, (canvas.height - sh) / 2, sw, sh);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = imageUrl;
  });
};

const extractStartAndEndFrames = async (videoUrl: string): Promise<{ first: string, last: string }> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.crossOrigin = 'anonymous';
        video.src = videoUrl;
        video.muted = true;
        video.playsInline = true;

        const timeout = setTimeout(() => reject("Frame extraction timed out"), 15000);

        video.onloadedmetadata = async () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Canvas context error");

                video.currentTime = 0.01; 
                await new Promise(r => video.onseeked = r);
                ctx.drawImage(video, 0, 0);
                const first = canvas.toDataURL('image/jpeg', 0.85);

                video.currentTime = Math.max(0, video.duration - 0.1);
                await new Promise(r => video.onseeked = r);
                ctx.drawImage(video, 0, 0);
                const last = canvas.toDataURL('image/jpeg', 0.85);

                clearTimeout(timeout);
                resolve({ first, last });
            } catch (err) {
                reject(err);
            }
        };
        video.onerror = () => {
            clearTimeout(timeout);
            reject("Video load error during frame extraction");
        };
    });
};

export const extractFramesFromVideo = async (file: File, frameCount: number = 5): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const objectUrl = URL.createObjectURL(file);
        video.src = objectUrl;
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = async () => {
            const frames: string[] = [];
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error("Canvas context failed"));

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const duration = video.duration;
            const interval = duration / (frameCount + 1);

            try {
                for (let i = 1; i <= frameCount; i++) {
                    video.currentTime = i * interval;
                    await new Promise(r => {
                        const onSeeked = () => {
                            video.removeEventListener('seeked', onSeeked);
                            r(null);
                        };
                        video.addEventListener('seeked', onSeeked);
                    });
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    frames.push(canvas.toDataURL('image/jpeg', 0.7));
                }
                URL.revokeObjectURL(objectUrl);
                resolve(frames);
            } catch (err) {
                URL.revokeObjectURL(objectUrl);
                reject(err);
            }
        };
        video.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Video loading error"));
        };
    });
};

export const generateText = async (prompt: string, base64Images: string[] | null = null, systemPrompt: string | null = null): Promise<string> => {
  return withRetry(async () => {
    const ai = await getFreshGenAI();
    const parts: any[] = [{ text: prompt }];
    if (base64Images) {
        for (const url of base64Images) {
            const dataUrl = await urlToResizedDataURL(url);
            const mimeType = dataUrl.match(/data:(.*?);/)?.[1] || 'image/jpeg';
            parts.push({ inlineData: { data: dataUrl.split(',')[1], mimeType } });
        }
    }
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts },
        config: systemPrompt ? { systemInstruction: systemPrompt } : undefined
    });
    return response.text || "";
  });
};

export const generateImage = async (prompt: string, aspectRatio: string, referenceImages: string[], modelName: string = 'gemini-2.5-flash-image', imageSize: '1K' | '2K' | '4K' = '1K'): Promise<string[] | null> => {
    return withRetry(async () => {
        const ai = await getFreshGenAI();
        const supportsConfig = modelName === 'gemini-3-pro-image-preview' || modelName === 'gemini-3.1-flash-image-preview';
        const parts: any[] = [];
        
        for (const url of referenceImages) {
            const dataUrl = await urlToResizedDataURL(url);
            const mimeType = dataUrl.match(/data:(.*?);/)?.[1] || 'image/jpeg';
            parts.push({ inlineData: { data: dataUrl.split(',')[1], mimeType } });
        }
        parts.push({ text: prompt + "\n\nCRITICAL: No text or logos allowed in the image." });

        const config: any = {};
        if (supportsConfig) {
            config.imageConfig = { 
                aspectRatio: aspectRatio || "1:1",
                imageSize: imageSize || "1K"
            };
        } else if (modelName === 'gemini-2.5-flash-image') {
            config.imageConfig = {
                aspectRatio: aspectRatio || "1:1"
            };
        }

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: Object.keys(config).length > 0 ? config : undefined
        });
        
        const candidate = response.candidates?.[0];
        if (!candidate) {
            throw new Error("No response generated. The prompt might have been blocked by safety filters.");
        }
        
        if (candidate.finishReason === 'SAFETY') {
            throw new Error("Image generation blocked by safety filters. Please try a different prompt.");
        }

        const images = candidate.content?.parts
            ?.filter(p => p.inlineData)
            .map(p => `data:${p.inlineData!.mimeType || 'image/png'};base64,${p.inlineData!.data}`) || [];
        
        if (images.length === 0) {
            const textParts = candidate.content?.parts?.filter(p => p.text).map(p => p.text).join('\n');
            if (textParts) {
                throw new Error(`Model returned text instead of an image: ${textParts}`);
            }
            throw new Error("Model did not return an image.");
        }
        
        return images;
    });
};

export const editImage = async (prompt: string, base64Images: string[], imageSize: '1K' | '2K' | '4K' = '1K'): Promise<string | null> => {
    const res = await generateImage(prompt, '1:1', base64Images, 'gemini-3.1-flash-image-preview', imageSize);
    return res ? res[0] : null;
};

export const removeBackground = async (base64Image: string): Promise<string | null> => {
    const prompt = "Isolate the main subject and fill the background with pure white (#FFFFFF). Pure visual scene, no checkerboard.";
    const res = await generateImage(prompt, '1:1', [base64Image], 'gemini-2.5-flash-image');
    return res ? res[0] : null;
};

export const expandImage = async (base64Image: string): Promise<string | null> => {
    const prompt = "Outpaint the image edges to expand the scene naturally.";
    const res = await generateImage(prompt, '16:9', [base64Image], 'gemini-3.1-flash-image-preview');
    return res ? res[0] : null;
};

export const upscaleImage = async (base64Image: string): Promise<string | null> => {
    const prompt = "Upscale this image to 4K resolution, enhancing sharpness and fine textures.";
    const res = await generateImage(prompt, '1:1', [base64Image], 'gemini-3.1-flash-image-preview');
    return res ? res[0] : null;
};

/**
 * Veo 3.1 비디오 생성.
 */
export const generateVideo = async (
    prompt: string, 
    firstImage: string | null, 
    lastImage: string | null, 
    resolution: '720p' | '1080p', 
    inputVideo: any | null, 
    onProgress: (message: string) => void, 
    referenceImages: string[] = [],
    aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<any> => {
    onProgress("Initializing session...");

    const videoConfig: any = {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: aspectRatio
    };

    const requestPayload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'A high-quality cinematic video.',
    };

    if (referenceImages.length > 0 || inputVideo) {
        requestPayload.model = 'veo-3.1-generate-preview';
        videoConfig.resolution = '720p';
        if (referenceImages.length > 0) videoConfig.aspectRatio = aspectRatio;
    }

    const dim = resolution === '1080p' 
        ? (aspectRatio === '16:9' ? { w: 1920, h: 1080 } : { w: 1080, h: 1920 })
        : (aspectRatio === '16:9' ? { w: 1280, h: 720 } : { w: 720, h: 1280 });

    if (firstImage) {
        onProgress("Processing start frame...");
        const resized = await resizeImageForVideo(firstImage, dim.w, dim.h);
        requestPayload.image = { imageBytes: resized.split(',')[1], mimeType: 'image/jpeg' };
    }

    if (lastImage) {
        onProgress("Processing end frame...");
        const resized = await resizeImageForVideo(lastImage, dim.w, dim.h);
        videoConfig.lastFrame = { imageBytes: resized.split(',')[1], mimeType: 'image/jpeg' };
    }

    if (referenceImages.length > 0) {
        onProgress("Processing reference images...");
        videoConfig.referenceImages = await Promise.all(referenceImages.slice(0, 3).map(async (url) => {
            const resized = await resizeImageForVideo(url, dim.w, dim.h);
            return {
                image: { imageBytes: resized.split(',')[1], mimeType: 'image/jpeg' },
                referenceType: "ASSET"
            };
        }));
    }

    if (inputVideo) requestPayload.video = inputVideo;
    requestPayload.config = videoConfig;

    try {
        let ai = await getFreshGenAI();
        let operation: any;
        
        onProgress("Requesting generation (Queuing)...");
        operation = await withRetry(() => ai.models.generateVideos(requestPayload));
        
        onProgress("Generating video (1-3 mins)...");

        while (!operation.done) {
            await new Promise(r => setTimeout(r, 12000));
            ai = await getFreshGenAI(); 
            operation = await withRetry(() => ai.operations.getVideosOperation({ operation }));
            
            if (operation.error) {
                throw new Error(operation.error.message || "Generation failed on the server.");
            }
        }

        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!uri) throw new Error("Generation finished but no output URI was provided.");
        
        onProgress("Fetching binary...");
        // Replace the base URL with our proxy URL
        const proxyUri = uri.replace('https://generativelanguage.googleapis.com', window.location.origin + '/api/gemini');
        const videoRes = await fetch(proxyUri);
        if (!videoRes.ok) throw new Error("Failed to download video.");
        const videoBlob = await videoRes.blob();
        const videoBlobUrl = URL.createObjectURL(videoBlob);

        onProgress("Finalizing frames...");
        let extractedFrames = { first: firstImage || "", last: lastImage || "" };
        try {
            extractedFrames = await extractStartAndEndFrames(videoBlobUrl);
        } catch (fError) {
            console.warn("Frame extraction failed", fError);
        }

        onProgress("Completed!");
        
        return { 
            videoUrl: videoBlobUrl, 
            firstFrameUrl: extractedFrames.first, 
            lastFrameUrl: extractedFrames.last, 
            videoObject: operation.response?.generatedVideos?.[0]?.video 
        };
    } catch (error: any) {
        console.error("Critical Video Generation Error:", error);
        throw error;
    }
};

export const generateVirtualModel = async (p: any) => {
    const parts = [];
    parts.push(`Full body studio portrait of a ${p.age} years old ${p.nationality} ${p.gender}.`);
    
    if (p.faceShape && p.faceShape.toLowerCase() !== 'random') {
        parts.push(`${p.faceShape} face shape.`);
    }
    
    const hairStyle = p.hairStyle && p.hairStyle.toLowerCase() !== 'random' ? p.hairStyle : '';
    const hairColor = p.hairColor && p.hairColor.toLowerCase() !== 'random' ? p.hairColor : '';
    if (hairStyle || hairColor) {
        parts.push(`${hairColor} ${hairStyle} hair.`.trim());
    }
    
    parts.push(`Standing in an A-pose, neutral expression, plain white background.`);
    
    if (p.additionalPrompt && p.additionalPrompt.trim() !== '') {
        parts.push(`Detailed description: ${p.additionalPrompt}`);
    } else {
        parts.push(`Wearing blue jeans, a white short-sleeve t-shirt, and white sneakers.`);
    }
    
    const prompt = parts.join(' ');
    const res = await generateImage(prompt, '3:4', [], 'gemini-3.1-flash-image-preview');
    return res ? res[0] : null;
};

export const generateModelFromImage = async (img: string) => {
    const prompt = "Transform this person into a full-body studio portrait, standing, neutral expression, white t-shirt and jeans, white background.";
    const res = await generateImage(prompt, '3:4', [img], 'gemini-2.5-flash-image');
    return res ? res[0] : null;
};

export const generateVtonImage = async (m: string, o: string, p: string) => {
    const prompt = `Virtual try-on. Image 1 is a person, Image 2 is an outfit. Seamlessly put the outfit from image 2 on the person from image 1. Pose: ${p}. Professional studio lighting, high resolution, photorealistic.`;
    const res = await generateImage(prompt, '3:4', [m, o], 'gemini-2.5-flash-image');
    return res ? res[0] : null;
};

export const generateStoryboardScenario = async (prompt: string, img: string) => {
    return withRetry(async () => {
        const ai = await getFreshGenAI();
        const dataUrl = await urlToResizedDataURL(img);
        const mimeType = dataUrl.match(/data:(.*?);/)?.[1] || 'image/jpeg';
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: { parts: [{ text: prompt }, { inlineData: { data: dataUrl.split(',')[1], mimeType } }] },
            config: { 
                systemInstruction: "Generate a 5-scene video storyboard JSON array with 'koreanDescription' and 'englishPrompt'.",
                responseMimeType: 'application/json'
            }
        });
        return JSON.parse(response.text);
    });
};

export const generateConsistentImage = async (p: string, refs: string[], ratio: string) => {
    const res = await generateImage(p, ratio, refs, 'gemini-2.5-flash-image');
    return res ? res[0] : null;
};

export const analyzeProductInfo = async (input: any) => {
    return withRetry(async () => {
        const ai = await getFreshGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: "Analyze inputs and return JSON: {productName, category, concept, sceneConcepts[]}",
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text);
    });
};

export const captureImagesFromUrl = async (url: string) => {
    return [{ id: '1', url: 'https://via.placeholder.com/300' }];
};

export const generateScriptFromStyle = async (info: any, style: string, dur: string, guide: string) => {
    return withRetry(async () => {
        const ai = await getFreshGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: `Create script style ${style} for ${info.productName}`,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text);
    });
};

export const generateFinalPrompt = async (data: any, ratio: string) => JSON.stringify(data);

export const constructPromptFromShot = (shot: any) => shot.englishPrompt;

export const detectGridItems = async (imageUrl: string): Promise<{ items: { bbox: [number, number, number, number], label: string }[] } | null> => {
    return withRetry(async () => {
        const ai = await getFreshGenAI();
        const systemInstruction = `Analyze this file explorer screenshot. It contains a grid of panoramic thumbnails with labels below them.
1. Detect every thumbnail image.
2. Provide precise [ymin, xmin, ymax, xmax] coordinates (0-1000) for each thumbnail.
3. Ensure the box ONLY covers the image part, not the text below.
4. Extract the exact text label found immediately below each thumbnail.
Return the result as a JSON object with an "items" array.`;

        const imageDataUrl = await urlToResizedDataURL(imageUrl);
        const mimeType = imageDataUrl.match(/data:(.*?);/)?.[1] || 'image/jpeg';
        const imagePart = { inlineData: { data: imageDataUrl.split(',')[1], mimeType } };

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: { parts: [imagePart, { text: "Detect all thumbnails and labels in this grid." }] },
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    bbox: {
                                        type: Type.ARRAY,
                                        items: { type: Type.NUMBER },
                                        minItems: 4,
                                        maxItems: 4,
                                        description: '[ymin, xmin, ymax, xmax] scaled 0-1000'
                                    },
                                    label: { type: Type.STRING }
                                },
                                required: ['bbox', 'label']
                            }
                        }
                    },
                    required: ['items']
                }
            }
        });

        const text = response.text || "{}";
        return JSON.parse(text);
    });
};