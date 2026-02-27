
// components/nodes/StitchNode.tsx

import React from 'react';
import { Node, StitchNodeData } from '../../types';
import { RectangleGroupIcon } from '@heroicons/react/24/outline';

interface StitchNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<StitchNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  isCollapsed: boolean;
}

const StitchNode: React.FC<StitchNodeProps> = ({ node, onDataChange, onGenerate, isCollapsed }) => {
  const data = node.data as StitchNodeData;

  const handleGenerate = () => {
    onGenerate(node.id);
  };

  const handleDirectionChange = (direction: 'horizontal' | 'vertical') => {
    onDataChange(node.id, { direction });
  };

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            {data.outputImageUrl ? (
                <img src={data.outputImageUrl} crossOrigin="anonymous" alt="stitch thumbnail" className="w-full h-full object-contain rounded-sm" />
            ) : (
                <RectangleGroupIcon className="w-8 h-8 text-gray-500" />
            )}
        </div>
    );
  }

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="bg-gray-900 w-full flex-grow rounded-md flex items-center justify-center border border-gray-700 relative overflow-hidden">
        {data.isLoading ? (
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        ) : data.outputImageUrl ? (
          <img src={data.outputImageUrl} crossOrigin="anonymous" alt="Stitch Output" className="w-full h-full object-contain rounded-md" />
        ) : (
          <p className="text-gray-500 text-center text-sm">Connect multiple image inputs to stitch them.</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-400 whitespace-nowrap">Direction:</label>
        <div className="flex-grow flex items-center gap-4">
          <label className="flex items-center text-sm text-gray-200 cursor-pointer">
            <input 
              type="radio" 
              name={`stitch-direction-${node.id}`} 
              value="horizontal" 
              checked={data.direction === 'horizontal'} 
              onChange={() => handleDirectionChange('horizontal')} 
              className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" 
            />
            <span className="ml-2">Horizontal</span>
          </label>
          <label className="flex items-center text-sm text-gray-200 cursor-pointer">
            <input 
              type="radio" 
              name={`stitch-direction-${node.id}`} 
              value="vertical" 
              checked={data.direction === 'vertical'} 
              onChange={() => handleDirectionChange('vertical')} 
              className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" 
            />
            <span className="ml-2">Vertical</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={data.isLoading || data.inputImageUrls.length < 2}
        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-auto"
      >
        {data.isLoading ? 'Stitching...' : 'Stitch Images'}
      </button>
    </div>
  );
};

export default StitchNode;