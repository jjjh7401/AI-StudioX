

import React from 'react';
import { Node, ImagePreviewNodeData } from '../../types';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface ImagePreviewNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<ImagePreviewNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  isCollapsed: boolean;
}

const ImagePreviewNode: React.FC<ImagePreviewNodeProps> = ({ node, onDataChange, onGenerate, isCollapsed }) => {
  const data = node.data as ImagePreviewNodeData;

  const handleGenerate = () => {
    onGenerate(node.id);
  };
  
  const selectClasses = "appearance-none bg-gray-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 text-gray-200 text-xs py-1.5 pl-3 pr-8 bg-no-repeat disabled:cursor-not-allowed";

  const customDropdownArrow = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: `right 0.25rem center`,
    backgroundSize: `1.5em 1.5em`,
  };
  
  const displayUrl = data.imageUrls?.find(url => url);

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center">
            {displayUrl ? (
                <img src={displayUrl} crossOrigin="anonymous" alt="thumbnail" className="w-full h-full object-contain rounded-sm" />
            ) : (
                <PhotoIcon className="w-6 h-6 text-gray-500" />
            )}
        </div>
    )
  }

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="bg-gray-900 w-full flex-grow rounded-md flex items-center justify-center border border-gray-700 relative overflow-hidden">
        {data.isLoading ? (
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        ) : displayUrl ? (
          <img src={displayUrl} crossOrigin="anonymous" alt="Generated" className="w-full h-full object-contain rounded-md" />
        ) : (
          <p className="text-gray-500 text-center text-xs">Flash Preview Mode</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-400 whitespace-nowrap">Aspect Ratio</label>
        <div className="relative flex-grow">
          <select
            value={data.aspectRatio}
            onChange={(e) => onDataChange(node.id, { aspectRatio: e.target.value })}
            className={`${selectClasses} w-full`}
            style={customDropdownArrow}
            title="Select aspect ratio"
          >
            <option value="1:1">1:1</option>
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
            <option value="4:3">4:3</option>
            <option value="3:4">3:4</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleGenerate}
        disabled={data.isLoading}
        className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-auto"
      >
        {data.isLoading ? 'Generating Preview...' : 'Generate Preview'}
      </button>
    </div>
  );
};

export default ImagePreviewNode;