
// services/imageProcessingService.ts

import { CompositeLayer } from '../types';

export const urlToDataURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Image load timeout")), 20000);
    const cleanup = () => clearTimeout(timeout);

    if (url.startsWith('data:image')) {
        cleanup();
        return resolve(url);
    }

    const readBlob = (blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            cleanup();
            resolve(reader.result as string);
        };
        reader.onerror = () => {
            cleanup();
            reject(new Error('FileReader failed'));
        }
        reader.readAsDataURL(blob);
    };

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Direct fetch failed: ${response.status}`);
            return response.blob();
        })
        .then(blob => {
            if (!blob.type.startsWith('image/')) throw new Error(`Not an image: ${blob.type}`);
            readBlob(blob);
        })
        .catch(() => {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`; 
            fetch(proxyUrl)
                .then(response => response.blob())
                .then(blob => readBlob(blob))
                .catch(err => {
                    cleanup();
                    reject(err);
                });
        });
  });
};

export const compositeImages = async (layers: CompositeLayer[], canvasWidth: number, canvasHeight: number): Promise<string | null> => {
    if (layers.length === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth; canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    for (const layer of layers) {
        const img = new Image(); img.crossOrigin = 'Anonymous';
        img.src = layer.url;
        await new Promise(r => img.onload = r);
        ctx.save();
        const sw = layer.originalWidth * layer.scale;
        const sh = layer.originalHeight * layer.scale;
        ctx.translate(layer.x, layer.y);
        ctx.rotate(layer.rotation * Math.PI / 180);
        ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();
    }
    return canvas.toDataURL('image/png');
};

export const stitchImages = async (imageUrls: string[], direction: 'horizontal' | 'vertical'): Promise<string | null> => {
    if (imageUrls.length === 0) return null;
    const imgs = await Promise.all(imageUrls.map(url => {
        const i = new Image(); i.crossOrigin = 'Anonymous'; i.src = url;
        return new Promise<HTMLImageElement>(r => i.onload = () => r(i));
    }));
    const canvas = document.createElement('canvas');
    let totalW = 0, totalH = 0;
    if (direction === 'horizontal') {
        totalH = Math.min(...imgs.map(i => i.height));
        imgs.forEach(i => totalW += (i.width * (totalH / i.height)));
    } else {
        totalW = Math.min(...imgs.map(i => i.width));
        imgs.forEach(i => totalH += (i.height * (totalW / i.width)));
    }
    canvas.width = totalW; canvas.height = totalH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    let cx = 0, cy = 0;
    imgs.forEach(i => {
        if (direction === 'horizontal') {
            const w = i.width * (totalH / i.height);
            ctx.drawImage(i, cx, 0, w, totalH); cx += w;
        } else {
            const h = i.height * (totalW / i.width);
            ctx.drawImage(i, 0, cy, totalW, h); cy += h;
        }
    });
    return canvas.toDataURL('image/png');
};

export const addSolidBackground = async (base64Image: string, color: string): Promise<string | null> => {
    const img = new Image(); img.src = base64Image;
    await new Promise(r => img.onload = r);
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = color; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
};

/**
 * Grid Extractor Helper: Maps AI coords and trims results.
 */
export const cropAndTrimImage = async (
    imageUrl: string,
    bbox: [number, number, number, number]
): Promise<string | null> => {
    try {
        const dataUrl = await urlToDataURL(imageUrl);
        const img = new Image();
        img.src = dataUrl;
        await img.decode();

        const [ymin, xmin, ymax, xmax] = bbox;
        const realX = (xmin / 1000) * img.naturalWidth;
        const realY = (ymin / 1000) * img.naturalHeight;
        const realW = ((xmax - xmin) / 1000) * img.naturalWidth;
        const realH = ((ymax - ymin) / 1000) * img.naturalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, realW);
        canvas.height = Math.max(1, realH);
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(img, realX, realY, realW, realH, 0, 0, realW, realH);
        
        // Final pixel-perfect trim to remove whitespace/background artifacts
        return refinedSmartTrim(canvas);
    } catch (error) {
        console.error("cropAndTrimImage error:", error);
        return null;
    }
};

/**
 * refinedSmartTrim: 
 * Scans pixels to detect actual content bounds and removes empty/white/near-gray space.
 */
function refinedSmartTrim(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas.toDataURL();

    const width = canvas.width;
    const height = canvas.height;
    const pixels = ctx.getImageData(0, 0, width, height);
    const data = pixels.data;
    
    let minX = width, minY = height, maxX = -1, maxY = -1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];

            // Detection logic for backgrounds (transparency or near-white/gray)
            // Near-white/gray check: all channels > 235
            const isTransparent = a < 20;
            const isNearBackground = r > 235 && g > 235 && b > 235; 
            
            if (!isTransparent && !isNearBackground) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    // Return original if no content found
    if (maxX === -1) return canvas.toDataURL();

    const trimWidth = maxX - minX + 1;
    const trimHeight = maxY - minY + 1;

    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = trimWidth;
    trimmedCanvas.height = trimHeight;
    const trimmedCtx = trimmedCanvas.getContext('2d');
    if (!trimmedCtx) return canvas.toDataURL();

    trimmedCtx.drawImage(canvas, minX, minY, trimWidth, trimHeight, 0, 0, trimWidth, trimHeight);

    return trimmedCanvas.toDataURL('image/png');
}
