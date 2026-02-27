
import React, { useRef, useCallback } from 'react';
import { Node, VideoLoadNodeData } from '../../types';
import { ArrowUpTrayIcon, TrashIcon, FilmIcon } from '@heroicons/react/24/outline';

interface VideoLoadNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<VideoLoadNodeData>) => void;
  isCollapsed: boolean;
}

const VideoLoadNode: React.FC<VideoLoadNodeProps> = ({ node, onDataChange, isCollapsed }) => {
  const data = node.data as VideoLoadNodeData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
        alert('Please select a video file.');
        return;
    }
    const videoUrl = URL.createObjectURL(file);
    onDataChange(node.id, { videoUrl, fileName: file.name });
  }, [node.id, onDataChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
    if (e.target) e.target.value = '';
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  
  const removeVideo = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDataChange(node.id, { videoUrl: null, fileName: null });
  };

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center p-1 bg-gray-900">
            {data.videoUrl ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black rounded-sm overflow-hidden">
                     <FilmIcon className="w-6 h-6 text-gray-300 opacity-50" />
                </div>
            ) : (
                <ArrowUpTrayIcon className="w-6 h-6 text-gray-500" />
            )}
        </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="video/*"
      />
      
      {data.videoUrl ? (
          <div className="flex-grow flex flex-col p-2 space-y-2 relative overflow-hidden">
             <div className="flex-grow bg-black rounded-md border border-gray-700 overflow-hidden flex items-center justify-center relative group">
                 <video src={data.videoUrl} className="w-full h-full object-contain" controls />
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={removeVideo}
                        className="p-1 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors shadow-sm"
                        title="Remove video"
                     >
                         <TrashIcon className="w-4 h-4" />
                     </button>
                 </div>
             </div>
             <div className="text-[10px] text-gray-400 truncate px-1">
                 {data.fileName || 'Loaded video'}
             </div>
          </div>
      ) : (
          <div
            className="w-full h-full bg-gray-900 rounded-md flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-colors cursor-pointer"
            onClick={handleContainerClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center text-gray-500 p-4">
                <FilmIcon className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold text-sm">Click to upload video</p>
                <p className="text-xs">or drag & drop</p>
            </div>
          </div>
      )}
    </div>
  );
};

export default VideoLoadNode;
