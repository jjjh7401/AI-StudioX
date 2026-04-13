import React, { useEffect } from 'react';
import { Node, VideoNodeData, Connection } from '../../types';
import { ArrowDownTrayIcon, FilmIcon, KeyIcon } from '@heroicons/react/24/outline';

interface VideoNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<VideoNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  connections: Connection[];
  isCollapsed: boolean;
}

const VideoNode: React.FC<VideoNodeProps> = ({ node, onDataChange, onGenerate, connections, isCollapsed }) => {
  const data = node.data as VideoNodeData;
  const isExtendingVideo = connections.some(c => c.toNodeId === node.id && c.toConnectorId === 'video-in');

  useEffect(() => {
    if (isExtendingVideo && data.resolution !== '720p') {
        onDataChange(node.id, { resolution: '720p' });
    }
  }, [isExtendingVideo, data.resolution, onDataChange, node.id]);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
        await window.aistudio.openSelectKey();
    }
  };

  const handleDownload = () => {
    if (!data.videoUrl) return;
    const a = document.createElement('a');
    a.href = data.videoUrl;
    a.download = `cosmos-video-${node.id}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGenerate = async () => {
    onGenerate(node.id);
  };

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center">
            {data.videoUrl ? (
                <video src={data.videoUrl} crossOrigin="anonymous" className="w-full h-full object-contain rounded-sm" muted playsInline loop />
            ) : (
                <FilmIcon className="w-6 h-6 text-gray-500" />
            )}
        </div>
    )
  }

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="bg-gray-900 w-full flex-grow rounded-md flex flex-col items-center justify-center border border-gray-700 p-2 relative">
        {data.videoUrl && !data.isLoading && (
            <button
                onClick={handleDownload}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-indigo-600 transition-colors z-10"
                title="Download Video"
            >
                <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
        )}
        {data.isLoading ? (
           <div className="text-center px-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-indigo-300 text-xs font-bold leading-relaxed">{data.loadingMessage}</p>
           </div>
        ) : data.videoUrl ? (
          <div className="flex flex-col items-center justify-center w-full h-full relative">
            <video src={data.videoUrl} crossOrigin="anonymous" controls autoPlay loop className="w-full h-full object-contain rounded-md" />
            {data.loadingMessage && data.loadingMessage.startsWith('Error:') && (
              <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center p-2">
                <p className="text-red-400 text-[10px] text-center break-words w-full">{data.loadingMessage}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4">
             <FilmIcon className="w-12 h-12 text-gray-700 mx-auto mb-2" />
             <p className="text-gray-500 text-xs">Connect inputs and click generate.</p>
             {data.loadingMessage && data.loadingMessage.startsWith('Error:') && (
                <p className="text-red-400 text-[10px] mt-2 text-center break-words w-full">{data.loadingMessage}</p>
             )}
          </div>
        )}
      </div>

       <div className="space-y-3">
         <div className="flex items-center justify-between px-1">
            <label className="text-xs font-semibold text-gray-400">Aspect Ratio</label>
            <div className="flex items-center gap-1 rounded-lg bg-gray-700 p-1">
                <button 
                    onClick={() => onDataChange(node.id, { aspectRatio: '16:9' })}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${data.aspectRatio === '16:9' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-gray-600 text-gray-300'}`}
                >
                    16:9
                </button>
                <button 
                    onClick={() => onDataChange(node.id, { aspectRatio: '9:16' })}
                     className={`px-3 py-1 text-xs rounded-md transition-colors ${data.aspectRatio === '9:16' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-gray-600 text-gray-300'}`}
                >
                    9:16
                </button>
            </div>
         </div>
         <div className="flex items-center justify-between px-1">
              <label className="text-xs font-semibold text-gray-400">Resolution</label>
              <div className="flex items-center gap-1 rounded-lg bg-gray-700 p-1">
                  <button 
                      onClick={() => onDataChange(node.id, { resolution: '720p' })}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${data.resolution === '720p' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-gray-600 text-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isExtendingVideo}
                  >
                      720p
                  </button>
                  <button 
                      onClick={() => onDataChange(node.id, { resolution: '1080p' })}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${data.resolution === '1080p' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-gray-600 text-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isExtendingVideo}
                  >
                      1080p
                  </button>
              </div>
          </div>
       </div>

      <button
        onClick={handleGenerate}
        disabled={data.isLoading}
        className={`w-full px-4 py-2.5 rounded-lg font-black text-xs shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${
            data.isLoading 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
        }`}
      >
        {data.isLoading ? 'Processing Video...' : 'GENERATE VIDEO'}
      </button>

      <button 
        onClick={handleSelectKey}
        className="w-full text-[10px] font-black text-gray-500 hover:text-indigo-400 uppercase tracking-widest transition-colors flex items-center justify-center gap-1 mt-1"
      >
        <KeyIcon className="w-3 h-3" />
        SELECT API KEY
      </button>
    </div>
  );
};

export default VideoNode;