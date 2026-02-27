
import React, { useState, useRef } from 'react';
import { Node, VideoStitchNodeData, HistoryAsset } from '../../types';
import { RectangleGroupIcon, FilmIcon, ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface VideoStitchNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<VideoStitchNodeData>) => void;
  onAssetGenerated: (asset: Omit<HistoryAsset, 'id'>) => void;
  isCollapsed: boolean;
}

const VideoStitchNode: React.FC<VideoStitchNodeProps> = ({ node, onDataChange, onAssetGenerated, isCollapsed }) => {
  const data = node.data as VideoStitchNodeData;
  const isBothConnected = !!(data.video1Url && data.video2Url);
  const isAnyConnected = !!(data.video1Url || data.video2Url);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.stitchedVideoUrl) return;
    const a = document.createElement('a');
    a.href = data.stitchedVideoUrl;
    a.download = `seamless-stitch-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleStartStitch = async () => {
    if (!data.video1Url || !data.video2Url || data.isLoading) return;

    onDataChange(node.id, { isLoading: true, stitchProgress: 0, stitchedVideoUrl: null });

    try {
      const FPS = 30;
      const TRIM_V1_FRAMES = data.video1TrimFrames ?? 10;
      const TRIM_V2_FRAMES = data.video2TrimFrames ?? 10;
      
      const TRIM_V1_TIME = TRIM_V1_FRAMES / FPS;
      const TRIM_V2_TIME = TRIM_V2_FRAMES / FPS;

      const v1 = document.createElement('video');
      const v2 = document.createElement('video');
      [v1, v2].forEach(v => {
        v.muted = true;
        v.crossOrigin = 'anonymous';
        v.playsInline = true;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error("Could not get canvas context");

      // Improved loadVideo: wait for seeked to ensure first frame is ready
      const loadVideo = (v: HTMLVideoElement, url: string) => new Promise((resolve, reject) => {
        v.src = url;
        v.onloadedmetadata = () => {
          v.currentTime = 0;
          v.onseeked = () => resolve(true);
        };
        v.onerror = () => reject(new Error("Failed to load video: " + url));
      });

      await Promise.all([loadVideo(v1, data.video1Url), loadVideo(v2, data.video2Url)]);

      // DYNAMIC ASPECT RATIO DETECTION:
      // Set canvas size based on the first video's natural dimensions to preserve aspect ratio (e.g. 9:16)
      canvas.width = v1.videoWidth || 1280;
      canvas.height = v1.videoHeight || 720;

      // Helper to draw a frame to canvas
      const drawVideoToCanvas = (video: HTMLVideoElement) => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;
        const scale = Math.min(canvas.width / vWidth, canvas.height / vHeight);
        const x = (canvas.width - vWidth * scale) / 2;
        const y = (canvas.height - vHeight * scale) / 2;
        ctx.drawImage(video, x, y, vWidth * scale, vHeight * scale);
      };

      // Pre-warm the decoder for V2 by briefly playing and pausing
      v2.play().then(() => v2.pause());
      v2.currentTime = 0;

      // Pre-render the first frame of V1
      drawVideoToCanvas(v1);

      const stream = canvas.captureStream(FPS); 
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 12000000 
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      let activeVideo = v1;
      let isStitchingFinished = false;
      let v2Warmed = false;
      const v1Duration = v1.duration;
      const v2Duration = v2.duration;
      const switchTime = v1Duration - TRIM_V1_TIME;

      const render = () => {
        if (isStitchingFinished) return;

        drawVideoToCanvas(activeVideo);

        if (activeVideo === v1) {
          // Progress reporting
          const p = (v1.currentTime / switchTime) * 50;
          onDataChange(node.id, { stitchProgress: Math.min(49, Math.round(p)) });
          
          // Pre-warming V2 logic: 0.5s before switch
          if (!v2Warmed && v1.currentTime >= Math.max(0, switchTime - 0.5)) {
            v2.play(); // Start V2 in background to warm decoder
            v2Warmed = true;
          }

          if (v1.currentTime >= switchTime || v1.ended) {
            activeVideo = v2;
            if (!v2Warmed) {
                v2.play();
                v2Warmed = true;
            }
          }
        } else {
          const effectiveV2Duration = v2Duration - TRIM_V2_TIME;
          const p = 50 + (v2.currentTime / effectiveV2Duration) * 50;
          onDataChange(node.id, { stitchProgress: Math.min(99, Math.round(p)) });

          if (v2.currentTime >= effectiveV2Duration || v2.ended) {
            isStitchingFinished = true;
            mediaRecorder.stop();
            return;
          }
        }

        requestAnimationFrame(render);
      };

      mediaRecorder.start();
      v1.play();
      render();

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        onDataChange(node.id, { 
          isLoading: false, 
          stitchedVideoUrl: url, 
          outputVideoUrl: url,
          stitchProgress: 100 
        });
        onAssetGenerated({ type: 'video', url });
      };

    } catch (error) {
      console.error("Stitching error:", error);
      onDataChange(node.id, { isLoading: false, stitchProgress: 0 });
      alert("Failed to perform seamless stitch.");
    }
  };

  const handleReset = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDataChange(node.id, { stitchedVideoUrl: null, outputVideoUrl: null, stitchProgress: 0 });
  };

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            {data.stitchedVideoUrl || isAnyConnected ? (
                <div className="w-full h-full bg-black rounded-sm flex items-center justify-center">
                    <FilmIcon className="w-6 h-6 text-indigo-400" />
                </div>
            ) : (
                <RectangleGroupIcon className="w-8 h-8 text-gray-500" />
            )}
        </div>
    );
  }

  const currentDisplayUrl = data.stitchedVideoUrl || data.video1Url || data.video2Url;

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="bg-gray-900 w-full flex-grow rounded-md flex flex-col border border-gray-700 relative overflow-hidden">
        {isAnyConnected || data.stitchedVideoUrl ? (
          <div className="flex-grow flex flex-col">
              <div className="flex-grow bg-black flex items-center justify-center relative group">
                  <video 
                    key={currentDisplayUrl}
                    src={currentDisplayUrl || undefined} 
                    className="w-full h-full object-contain" 
                    controls 
                    autoPlay 
                    muted={false}
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <div className="bg-indigo-600/80 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg backdrop-blur-sm">
                        {data.stitchedVideoUrl ? 'Trimmed Result' : 'Input Preview'}
                    </div>
                  </div>
              </div>
              <div className="p-2 border-t border-gray-800 bg-gray-900/50 space-y-3">
                  <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${data.video1Url ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'bg-gray-600'}`}></span>
                              <span className={`${data.video1Url ? 'text-gray-200 font-bold' : 'text-gray-500'} truncate`}>
                                  Input 1 {data.video1Url ? 'Ready' : 'Waiting...'}
                              </span>
                          </div>
                          <span className="text-indigo-400 font-mono">Trim: {data.video1TrimFrames}f</span>
                      </div>
                      <input 
                        type="range" min="0" max="30" step="1" 
                        value={data.video1TrimFrames} 
                        onChange={(e) => onDataChange(node.id, { video1TrimFrames: parseInt(e.target.value) })}
                        disabled={!!data.stitchedVideoUrl || data.isLoading}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                  </div>
                  
                  <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${data.video2Url ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]' : 'bg-gray-600'}`}></span>
                              <span className={`${data.video2Url ? 'text-gray-200 font-bold' : 'text-gray-500'} truncate`}>
                                  Input 2 {data.video2Url ? 'Ready' : 'Waiting...'}
                              </span>
                          </div>
                          <span className="text-indigo-400 font-mono">Trim: {data.video2TrimFrames}f</span>
                      </div>
                      <input 
                        type="range" min="0" max="30" step="1" 
                        value={data.video2TrimFrames} 
                        onChange={(e) => onDataChange(node.id, { video2TrimFrames: parseInt(e.target.value) })}
                        disabled={!!data.stitchedVideoUrl || data.isLoading}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                  </div>
              </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-500 text-center text-sm p-4 space-y-2">
            <RectangleGroupIcon className="w-12 h-12 opacity-20" />
            <p>Connect two videos to merge them seamlessly by selecting tail trim frames.</p>
          </div>
        )}
      </div>
      
      <div className="px-1">
          <p className="text-[10px] text-gray-500 font-medium">
              {data.stitchedVideoUrl 
                ? `Merge complete! (V1: -${data.video1TrimFrames}f, V2: -${data.video2TrimFrames}f)` 
                : isBothConnected 
                    ? "Seamless merge ready. Adjust sliders to trim tail artifacts." 
                    : "Connect two videos to begin."}
          </p>
      </div>

      {!data.stitchedVideoUrl ? (
          <button 
            onClick={handleStartStitch}
            disabled={!isBothConnected || data.isLoading}
            className={`w-full px-4 py-2 rounded-lg text-center text-xs font-bold transition-all duration-300 border flex items-center justify-center gap-2 ${
              isBothConnected && !data.isLoading
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow-lg' 
                : 'bg-gray-700/30 text-gray-600 border-gray-700 cursor-not-allowed'
            }`}
          >
            {data.isLoading ? (
                <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Merging... {data.stitchProgress}%
                </>
            ) : (
                <>
                    <FilmIcon className="w-4 h-4" />
                    Start Seamless Stitch
                </>
            )}
          </button>
      ) : (
          <div className="flex gap-2">
              <button 
                onClick={handleDownload}
                className="flex-grow px-4 py-2 rounded-lg text-center text-xs font-bold transition-all duration-300 border bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-lg flex items-center justify-center gap-2"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download Video
              </button>
              <button 
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white transition-all shadow-lg flex items-center justify-center"
                title="Adjust Trims & Re-stitch"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
          </div>
      )}
    </div>
  );
};

export default VideoStitchNode;
