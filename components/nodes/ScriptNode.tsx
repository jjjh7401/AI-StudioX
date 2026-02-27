import React, { useRef, useEffect } from 'react';
import { Node, ScriptNodeData, HistoryAsset } from '../../types';
import { SCRIPT_STYLES, CATEGORY_STYLES } from '../../data/scriptStyles';
import { ArrowUpTrayIcon, PhotoIcon, TrashIcon, FilmIcon, PlusCircleIcon, UserPlusIcon, ShoppingBagIcon, GlobeAltIcon, ArrowPathIcon, ChevronUpIcon, ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
// Fix: removed non-existent extractFramesFromVideoUrl import which was causing an error
import { captureImagesFromUrl, extractFramesFromVideo, analyzeProductInfo, generateScriptFromStyle, generateFinalPrompt, constructPromptFromShot, generateConsistentImage, generateImage, preprocessImageForOutpainting } from '../../services/geminiService';
import { ConnectorType } from '../../types';

interface ScriptNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<ScriptNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  isCollapsed: boolean;
}

const ImageUploadArea: React.FC<{
    title: string;
    images: { id: string, url: string }[];
    onFilesAdded: (files: FileList) => void;
    onImageDeleted: (id: string) => void;
}> = ({ title, images, onFilesAdded, onImageDeleted }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFilesAdded(e.target.files);
            e.target.value = ''; // Reset for same file upload
        }
    };
    
    const onDragOver = (e: React.DragEvent) => e.preventDefault();
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onFilesAdded(e.dataTransfer.files);
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        e.stopPropagation(); // Prevent global paste
        const items = e.clipboardData.items;
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) files.push(file);
            }
        }
        if (files.length > 0) {
            // Create a FileList-like object
            const dt = new DataTransfer();
            files.forEach(f => dt.items.add(f));
            onFilesAdded(dt.files);
        }
    };

    return (
        <div 
            className="bg-gray-800/50 p-2 rounded-lg h-full flex flex-col border border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            tabIndex={0}
            onPaste={handlePaste}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <h4 className="text-[10px] font-bold mb-2 text-gray-400 uppercase tracking-wider flex justify-between">
                {title}
                <span className="text-[9px] font-normal text-gray-600">Paste/Drop here</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
                {images.map(img => (
                    <div key={img.id} className="relative group aspect-square">
                        <img src={img.url} className="w-full h-full object-cover rounded-md border border-gray-600" />
                        <button onClick={() => onImageDeleted(img.id)} className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity">
                            <TrashIcon className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                <div 
                    className="aspect-square rounded-md border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-400 cursor-pointer transition-colors bg-gray-800/30 hover:bg-gray-800"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    <span className="text-[9px] mt-1">ADD</span>
                </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
        </div>
    );
};


const ScriptNode: React.FC<ScriptNodeProps> = ({ node, onDataChange, onGenerate, isCollapsed }) => {
    const data = node.data as ScriptNodeData;
    const videoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!data.videoDuration) {
            onDataChange(node.id, { videoDuration: '15s' });
        }
    }, [data.videoDuration, node.id, onDataChange]);

    const handleFilesAdded = (fileList: FileList, type: 'product' | 'model') => {
        // Use URL.createObjectURL for immediate, memory-efficient preview
        const newImages = Array.from(fileList).map(file => ({
            id: `img-${Date.now()}-${Math.random()}`, 
            url: URL.createObjectURL(file)
        }));

        if (type === 'product') {
            onDataChange(node.id, { productImages: [...data.productImages, ...newImages] });
        } else {
            onDataChange(node.id, { modelImages: [...data.modelImages, ...newImages] });
        }
    };

    const handleImageDeleted = (id: string, type: 'product' | 'model') => {
        if (type === 'product') {
            onDataChange(node.id, { productImages: data.productImages.filter(img => img.id !== id) });
        } else {
            onDataChange(node.id, { modelImages: data.modelImages.filter(img => img.id !== id) });
        }
    };

    const handleAnalyzeInput = async () => {
        const input = data.url?.trim() || '';
        
        // Treat as Page URL (fetch images)
        if (input.startsWith('http') && !input.match(/\.(mp4|webm|mov)$/i)) {
            onDataChange(node.id, { isCapturing: true, loadingMessage: 'Capturing images from URL...' });
            try {
                const captured = await captureImagesFromUrl(input);
                onDataChange(node.id, { capturedImages: captured || [], isCapturing: false });
            } catch (error) {
                console.error("Image capture failed:", error);
                onDataChange(node.id, { isCapturing: false, loadingMessage: 'Capture failed' });
            }
        }
    };
    
    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        onDataChange(node.id, { loadingMessage: 'Extracting frames from video...', isCapturing: true });
        try {
            const frames = await extractFramesFromVideo(file, 5);
            onDataChange(node.id, { videoFrames: frames, isCapturing: false });
        } catch (error) {
            console.error("Frame extraction failed", error);
            onDataChange(node.id, { isCapturing: false });
        }
    };

    const addImageToCategory = (imageUrl: string, category: 'product' | 'model') => {
        const newImage = { id: `img-${Date.now()}-${Math.random()}`, url: imageUrl };
        if (category === 'product') {
            if (!data.productImages.some(p => p.url === imageUrl)) {
                onDataChange(node.id, { productImages: [...data.productImages, newImage] });
            }
        } else {
             if (!data.modelImages.some(p => p.url === imageUrl)) {
                onDataChange(node.id, { modelImages: [...data.modelImages, newImage] });
            }
        }
    };

    const handleImageDragStart = (e: React.DragEvent, imageUrl: string) => {
        const asset: HistoryAsset = { id: `asset-${Date.now()}`, type: 'image', url: imageUrl };
        e.dataTransfer.setData('application/x-cosmos-asset', JSON.stringify(asset));
    };
    
    const handleAnalyze = async () => {
        onDataChange(node.id, { isLoading: true, loadingMessage: 'Performing Multi-modal Analysis...' });
        
        const input = {
            url: data.url && data.url.startsWith('http') && !data.url.match(/\.(mp4|webm|mov)$/i) ? data.url : undefined,
            text: data.description || undefined,
            videoFrames: data.videoFrames,
            images: [
                ...data.productImages.map(i => i.url),
                ...data.modelImages.map(i => i.url)
            ]
        };

        try {
            const result = await analyzeProductInfo(input);
            if (result) {
                 onDataChange(node.id, { 
                     isLoading: false, 
                     isAnalyzed: true,
                     scriptData: {
                         ...data.scriptData,
                         productName: result.productName,
                         category: result.category,
                         concept: result.concept,
                         duration: data.videoDuration || "15s", format: "", narrativeSummary: "", visualIdentity: "", motionRules: "", negativePrompts: "", shotList: []
                     },
                     sceneConcepts: result.sceneConcepts
                 });
            } else {
                 onDataChange(node.id, { isLoading: false });
            }
        } catch (error) {
            console.error(error);
            onDataChange(node.id, { isLoading: false });
        }
    };

    const handleGenerateStoryboard = async () => {
        if (!data.isAnalyzed || !data.scriptData) {
            alert("Please analyze the product info first.");
            return;
        }
        
        // Check if we should clear existing shots or not. 
        // Since this is the main "Generate" button, we assume user wants to create/reset the storyboard.
        // However, we should preserve analysis.
        
        onDataChange(node.id, { isLoading: true, loadingMessage: 'Generating Script & Storyboard...', finalPrompt: null });
        
        // Trigger the execution in App.tsx which handles script generation + image generation
        onGenerate(node.id);
    };

    const handleMoveShot = (index: number, direction: -1 | 1) => {
        if (!data.scriptData || !data.scriptData.shotList) return;
        const newList = [...data.scriptData.shotList];
        const targetIndex = index + direction;
        
        if (targetIndex < 0 || targetIndex >= newList.length) return;
        
        [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
        
        onDataChange(node.id, { 
            scriptData: { ...data.scriptData, shotList: newList } 
        });
    };

    const handleTextChange = (index: number, field: 'description' | 'englishPrompt', value: string) => {
        if (!data.scriptData || !data.scriptData.shotList) return;
        const newList = data.scriptData.shotList.map((shot, i) => {
            if (i === index) {
                return { ...shot, [field]: value };
            }
            return shot;
        });
        
        onDataChange(node.id, { 
            scriptData: { ...data.scriptData, shotList: newList } 
        });
    };

    const handleRegenerateShot = async (index: number) => {
        if (!data.scriptData || !data.scriptData.shotList) return;
        const shot = data.scriptData.shotList[index];
        const prevShot = index > 0 ? data.scriptData.shotList[index - 1] : null;
        
        // Set loading state
        const loadingList = data.scriptData.shotList.map((s, i) => i === index ? { ...s, isLoading: true } : s);
        onDataChange(node.id, { scriptData: { ...data.scriptData, shotList: loadingList } });

        try {
            const prompt = constructPromptFromShot(shot);
            const aspectRatio = data.aspectRatio || '16:9';
            let newImageUrl: string | null = null;

            // Prepare context images
            const referenceImages = [...data.productImages.map(img => img.url), ...data.modelImages.map(img => img.url)].slice(0, 3);
            const processedRefs = await Promise.all(referenceImages.map(url => preprocessImageForOutpainting(url, aspectRatio)));

            if (prevShot && prevShot.imageUrl) {
                 // If we have a previous shot, use it for consistency
                 // We need base64 for context if possible, but preprocess accepts URL too
                 // Ideally we use the blob URL directly or re-fetch it
                 processedRefs.push(await preprocessImageForOutpainting(prevShot.imageUrl, aspectRatio));
            }

            let resultBase64: string | null = null;
            if (processedRefs.length > 0) {
                 resultBase64 = await generateConsistentImage(prompt, processedRefs, aspectRatio);
            } else {
                 const res = await generateImage(prompt, aspectRatio, []);
                 resultBase64 = res ? res[0] : null;
            }

            if (resultBase64) {
                const res = await fetch(resultBase64);
                const blob = await res.blob();
                newImageUrl = URL.createObjectURL(blob);
            }

            const updatedList = data.scriptData.shotList.map((s, i) => 
                i === index ? { ...s, imageUrl: newImageUrl, isLoading: false } : s
            );
            
            onDataChange(node.id, { scriptData: { ...data.scriptData, shotList: updatedList } });

        } catch (error) {
            console.error("Failed to regenerate shot", error);
            const errorList = data.scriptData.shotList.map((s, i) => i === index ? { ...s, isLoading: false } : s);
            onDataChange(node.id, { scriptData: { ...data.scriptData, shotList: errorList } });
        }
    };

    const handleGenerateFinalPrompt = async () => {
        if (!data.scriptData) return;
        
        onDataChange(node.id, { isLoading: true, loadingMessage: 'Creating Final Prompt...' });
        try {
            const prompt = await generateFinalPrompt(data.scriptData, data.aspectRatio);
            onDataChange(node.id, { finalPrompt: prompt, isLoading: false });
        } catch (error) {
            console.error("Failed to generate final prompt", error);
            onDataChange(node.id, { isLoading: false, loadingMessage: 'Prompt Gen Failed' });
        }
    };

    if (isCollapsed) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <p className="font-bold text-white">{data.scriptData?.productName || 'New Script'}</p>
                <p className="text-xs">{data.isAnalyzed ? 'Analyzed' : 'Ready'}</p>
            </div>
        );
    }

    return (
        <div 
            className="w-full h-full flex flex-col space-y-4 text-white overflow-y-auto pr-1 -mr-3 custom-scrollbar"
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* SECTION 0: CATEGORY SELECTION */}
            <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-700/50 shadow-sm">
                 <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">1. Select Product Category</label>
                 <select
                    value={data.productCategory || ''}
                    onChange={(e) => onDataChange(node.id, { productCategory: e.target.value })}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">-- Select Category --</option>
                    {Object.keys(CATEGORY_STYLES).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                {data.productCategory && (
                    <p className="text-[9px] text-gray-500 mt-1 line-clamp-1">{CATEGORY_STYLES[data.productCategory]}</p>
                )}
            </div>

            {/* SECTION 1: INPUTS (URL/Description + Video) */}
            <div className="grid grid-cols-2 gap-3 bg-gray-900/40 p-3 rounded-xl border border-gray-700/50 shadow-sm">
                {/* LEFT: URL & Description */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                         <GlobeAltIcon className="w-3 h-3" />
                         2. URL & Description
                    </label>
                     <div className="flex flex-col gap-2 h-full">
                        <input
                            type="text"
                            value={data.url || ''}
                            onChange={(e) => onDataChange(node.id, { url: e.target.value })}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-200 text-xs"
                            placeholder="https://... (URL)"
                        />
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => onDataChange(node.id, { description: e.target.value })}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="flex-grow p-2 bg-gray-800/50 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-200 resize-none text-xs leading-relaxed min-h-[60px]"
                            placeholder="Product description, key features..."
                        />
                         <button 
                            onClick={handleAnalyzeInput}
                            disabled={data.isCapturing || !data.url?.trim()}
                            className="w-full py-1.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 text-xs font-bold rounded-md disabled:opacity-50 border border-gray-600 transition-colors"
                        >
                            {data.isCapturing && !data.videoInputUrl ? '...' : 'Fetch Info (URL)'}
                        </button>
                     </div>
                </div>
                
                {/* RIGHT: Video Ref */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                        <FilmIcon className="w-3 h-3" />
                        Reference Video
                    </label>
                    <div className="flex flex-col gap-2 h-full">
                         {/* File Upload Area */}
                         <div 
                            className="flex-grow bg-gray-800/50 border border-dashed border-gray-600 hover:border-indigo-500 hover:bg-gray-800 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[50px] relative overflow-hidden"
                            onClick={() => videoInputRef.current?.click()}
                        >
                            {data.videoFrames && data.videoFrames.length > 0 ? (
                                <>
                                    <img 
                                        src={data.videoFrames[0]} 
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                                        alt="Video Thumbnail" 
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <ArrowUpTrayIcon className="w-5 h-5 text-white shadow-lg" />
                                        <span className="text-[9px] text-white font-bold mt-1 shadow-lg">Change MP4</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ArrowUpTrayIcon className="w-4 h-4 text-gray-500 group-hover:text-indigo-400" />
                                    <span className="text-[9px] text-gray-400 group-hover:text-gray-200 mt-1">Upload MP4</span>
                                </>
                            )}
                        </div>
                    </div>
                 </div>
                 <input type="file" ref={videoInputRef} onChange={handleVideoUpload} className="hidden" accept="video/*" />
            </div>

            {/* Extracted/Fetched Images Display */}
             {(data.capturedImages.length > 0 || data.videoFrames.length > 0) && (
                <div className="bg-gray-800/30 p-2 rounded-lg border border-gray-700/30">
                    <p className="text-[9px] text-gray-500 mb-1 uppercase font-bold tracking-wide">Detected Assets</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-600">
                        {[...data.capturedImages, ...data.videoFrames.map((f,i) => ({id:`vf-${i}`, url:f}))].map(img => (
                             <div key={img.id} className="relative group flex-shrink-0 w-16 h-16 cursor-pointer hover:ring-1 hover:ring-indigo-500 rounded overflow-hidden">
                                <img src={img.url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                    <button onClick={() => addImageToCategory(img.url, 'product')} className="p-1 bg-emerald-600 rounded-full text-white" title="Add to Product">
                                        <ShoppingBagIcon className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => addImageToCategory(img.url, 'model')} className="p-1 bg-purple-600 rounded-full text-white" title="Add to Model">
                                        <UserPlusIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

             {/* SECTION 2: IMAGE INPUTS */}
            <div className="grid grid-cols-2 gap-3 bg-gray-900/40 p-3 rounded-xl border border-gray-700/50 shadow-sm">
                 <label className="col-span-2 text-[10px] font-bold text-gray-500 uppercase">3. Upload Reference Images</label>
                 <ImageUploadArea 
                    title="Product"
                    images={data.productImages}
                    onFilesAdded={(files) => handleFilesAdded(files, 'product')}
                    onImageDeleted={(id) => handleImageDeleted(id, 'product')}
                 />
                 <ImageUploadArea 
                    title="Model"
                    images={data.modelImages}
                    onFilesAdded={(files) => handleFilesAdded(files, 'model')}
                    onImageDeleted={(id) => handleImageDeleted(id, 'model')}
                 />
            </div>
            
            {/* STEP 1 ACTION: ANALYZE */}
            <button
                onClick={handleAnalyze}
                disabled={data.isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-[0.99] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
            >
                {data.isLoading && !data.isAnalyzed ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        {data.loadingMessage || 'Analyzing...'}
                    </span>
                ) : '4. Analyze & Generate Plan'}
            </button>

            {/* SECTION 3: SETTINGS & GENERATE (Visible after Analysis) */}
            <div className={`bg-gray-900/40 p-4 rounded-xl border border-gray-700/50 transition-all duration-300 ${!data.isAnalyzed ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                <h3 className="text-xs font-bold text-gray-200 mb-3 uppercase tracking-wider border-b border-gray-700/50 pb-2">5. Storyboard Settings</h3>
                
                {data.isAnalyzed && data.scriptData && (
                    <div className="mb-4 text-[11px] space-y-1 bg-emerald-900/20 p-2 rounded border border-emerald-800/50">
                        <p><span className="text-emerald-400 font-semibold">Product:</span> {data.scriptData.productName}</p>
                        <p><span className="text-emerald-400 font-semibold">Concept:</span> {data.scriptData.concept}</p>
                    </div>
                )}

                <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Aspect Ratio</label>
                        <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700">
                            {['16:9', '9:16'].map(ratio => (
                                <button 
                                    key={ratio}
                                    onClick={() => onDataChange(node.id, { aspectRatio: ratio as '16:9' | '9:16' })}
                                    className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${data.aspectRatio === ratio ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Duration</label>
                        <select 
                            value={data.videoDuration} 
                            onChange={(e) => onDataChange(node.id, { videoDuration: e.target.value })}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full py-1 px-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:ring-1 focus:ring-indigo-500 h-[28px]"
                        >
                            <option value="10s">10s (Short)</option>
                            <option value="15s">15s (Default)</option>
                            <option value="20s">20s (Standard)</option>
                            <option value="30s">30s (Max)</option>
                        </select>
                    </div>
                </div>

                 <div className="relative mb-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Script Style</label>
                    <select
                        value={data.selectedScriptStyle}
                        onChange={(e) => onDataChange(node.id, { selectedScriptStyle: e.target.value })}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-full appearance-none bg-gray-800 border border-gray-700 rounded-lg text-xs text-white py-2 pl-3 pr-8 focus:ring-1 focus:ring-indigo-500"
                    >
                       {Object.entries(SCRIPT_STYLES).map(([category, styles]) => (
                           <optgroup key={category} label={category}>
                               {Object.entries(styles).map(([id, name]) => (
                                   <option key={id} value={id}>{id}: {name}</option>
                               ))}
                           </optgroup>
                       ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 top-5">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>

                <button
                    onClick={handleGenerateStoryboard}
                    disabled={data.isLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-white shadow-lg transition-colors disabled:bg-gray-700 disabled:text-gray-500 text-xs uppercase tracking-wider"
                >
                    {data.isLoading && data.isAnalyzed ? (
                        <span className="flex items-center justify-center gap-2">
                             <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                             6. Generating Storyboard...
                        </span>
                    ) : '6. Generate Storyboard'}
                </button>
            </div>
            
            {/* --- Results Display --- */}
            {data.scriptData && data.scriptData.shotList && data.scriptData.shotList.length > 0 && (
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <h3 className="text-xs font-bold text-gray-300 mb-3 uppercase tracking-wider">Visualized Storyboard</h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-700">
                        {data.scriptData.shotList.map((shot, index) => (
                            <div key={shot.id} className="flex flex-col gap-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 relative group">
                               {/* Header with Reordering */}
                               <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">{index + 1}</span>
                                        <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 rounded border border-gray-700">{shot.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleMoveShot(index, -1)} disabled={index === 0} className="p-1 text-gray-400 hover:text-white disabled:opacity-30">
                                            <ChevronUpIcon className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => handleMoveShot(index, 1)} disabled={index === data.scriptData!.shotList.length - 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-30">
                                            <ChevronDownIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                               </div>

                               <div className="flex gap-3">
                                   {/* Image Preview & Regen */}
                                    <div className="w-32 flex-shrink-0 flex flex-col gap-2">
                                        <div className="w-full aspect-video bg-black rounded-md flex items-center justify-center relative overflow-hidden border border-gray-700">
                                                {shot.isLoading ? (
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
                                                ) : shot.imageUrl ? (
                                                    <img 
                                                        src={shot.imageUrl} 
                                                        alt={`Shot ${index + 1}`} 
                                                        className="w-full h-full object-cover"
                                                        draggable
                                                        onDragStart={(e) => handleImageDragStart(e, shot.imageUrl!)}
                                                    />
                                                ) : (
                                                    <PhotoIcon className="w-8 h-8 text-gray-600" />
                                                )}
                                        </div>
                                        <button 
                                            onClick={() => handleRegenerateShot(index)}
                                            disabled={shot.isLoading}
                                            className="w-full py-1 bg-gray-700 hover:bg-indigo-600 text-gray-300 hover:text-white text-[9px] rounded flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                                        >
                                            <ArrowPathIcon className={`w-3 h-3 ${shot.isLoading ? 'animate-spin' : ''}`} />
                                            Regenerate Image
                                        </button>
                                    </div>

                                    {/* Editable Text Fields */}
                                    <div className="flex-grow min-w-0 space-y-2">
                                        <input 
                                            type="text"
                                            value={shot.title}
                                            onChange={(e) => {
                                                // Title update logic if needed, for now reusing generic handler pattern logic
                                                const newList = data.scriptData!.shotList.map((s, i) => i === index ? { ...s, title: e.target.value } : s);
                                                onDataChange(node.id, { scriptData: { ...data.scriptData!, shotList: newList } });
                                            }}
                                            className="w-full bg-transparent text-xs font-bold text-indigo-300 border-b border-transparent hover:border-gray-600 focus:border-indigo-500 focus:outline-none"
                                        />
                                        
                                        <div>
                                            <label className="text-[9px] text-gray-500 block mb-0.5">Description (KR)</label>
                                            <textarea 
                                                value={shot.description}
                                                onChange={(e) => handleTextChange(index, 'description', e.target.value)}
                                                rows={2}
                                                className="w-full bg-gray-900/50 border border-gray-700 rounded p-1.5 text-[10px] text-gray-300 focus:border-indigo-500 focus:outline-none resize-none"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="text-[9px] text-gray-500 block mb-0.5">Visual Prompt (EN)</label>
                                            <textarea 
                                                value={shot.englishPrompt}
                                                onChange={(e) => handleTextChange(index, 'englishPrompt', e.target.value)}
                                                rows={3}
                                                className="w-full bg-gray-900/50 border border-gray-700 rounded p-1.5 text-[10px] text-gray-400 focus:border-indigo-500 focus:outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                               </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Generate Final Prompt Button */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <button 
                            onClick={handleGenerateFinalPrompt}
                            disabled={data.isLoading}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white shadow-lg transition-colors disabled:bg-gray-700 disabled:text-gray-500 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            {data.isLoading && data.loadingMessage?.includes('Prompt') ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            ) : <FilmIcon className="w-4 h-4" />}
                            Generate Final Prompt (JSON)
                        </button>
                    </div>
                </div>
            )}

            {data.finalPrompt && (
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" />
                            Final Prompt Ready
                        </h3>
                        <button 
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-900/30 px-2 py-1 rounded border border-indigo-800"
                            onClick={() => navigator.clipboard.writeText(data.finalPrompt || '')}
                        >
                            COPY JSON
                        </button>
                    </div>
                    <pre className="w-full h-32 p-2 bg-black/50 border border-gray-700 rounded-md text-green-400 text-[10px] font-mono overflow-auto whitespace-pre-wrap">
                        {data.finalPrompt}
                    </pre>
                </div>
            )}
        </div>
    );
};

// Add missing CheckCircleIcon import stub if needed or ensure it's in imports
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default ScriptNode;