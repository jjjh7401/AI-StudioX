
import React from 'react';
import { MinusIcon, PlusIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToFit: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomLevel, onZoomIn, onZoomOut, onZoomToFit }) => {
  const zoomPercentage = Math.round(zoomLevel * 100);

  return (
    <div className="absolute bottom-4 left-4 z-10 p-2 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl flex items-center gap-4 text-white">
      <button 
        onClick={onZoomOut} 
        className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        title="Zoom Out (-)"
      >
        <MinusIcon className="w-5 h-5" />
      </button>
      
      <span className="font-semibold text-sm w-16 text-center tabular-nums">
        {zoomPercentage}%
      </span>

      <button 
        onClick={onZoomIn} 
        className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        title="Zoom In (+)"
      >
        <PlusIcon className="w-5 h-5" />
      </button>

      <div className="border-l border-gray-600 h-6"></div>

      <button 
        onClick={onZoomToFit} 
        className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        title="Zoom to Fit"
      >
        <ArrowsPointingOutIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ZoomControls;
