
// components/nodes/RMBGNode.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Node, RMBGNodeData, HistoryAsset } from '../../types';
import { CubeTransparentIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { RMBG_DEFAULT_BACKGROUND_COLOR, RMBG_COLOR_PRESETS } from '../../data/constants';

interface RMBGNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<RMBGNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  connectedImageUrl: string | null;
  onAssetGenerated: (asset: Omit<HistoryAsset, 'id'>) => void;
  isCollapsed: boolean;
}

const RMBGNode: React.FC<RMBGNodeProps> = ({ node, onDataChange, onGenerate, connectedImageUrl, isCollapsed }) => {
  const data = node.data as RMBGNodeData;
  const [displayColorInput, setDisplayColorInput] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Sync connected image to inputImageUrl in node data
  useEffect(() => {
    if (connectedImageUrl && connectedImageUrl !== data.inputImageUrl) {
      onDataChange(node.id, { inputImageUrl: connectedImageUrl, outputImageUrl: null }); // Clear output on new input
    } else if (!connectedImageUrl && data.inputImageUrl) {
        onDataChange(node.id, { inputImageUrl: null, outputImageUrl: null });
    }
  }, [connectedImageUrl, data.inputImageUrl, node.id, onDataChange]);

  // Set default background color if not already set (e.g., for old nodes or initial state)
  useEffect(() => {
    if (!data.backgroundColor) {
      onDataChange(node.id, { backgroundColor: RMBG_DEFAULT_BACKGROUND_COLOR });
    }
  }, [data.backgroundColor, node.id, onDataChange]);

  const handleGenerate = () => {
    onGenerate(node.id);
  };

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange(node.id, { backgroundColor: e.target.value });
  };
  
  const handlePresetColorClick = (colorHex: string) => {
      onDataChange(node.id, { backgroundColor: colorHex });
      setDisplayColorInput(false);
  }

  const handleOpenColorPicker = () => {
      setDisplayColorInput(true);
      // Timeout to ensure input is rendered before focus
      setTimeout(() => colorInputRef.current?.click(), 0);
  }

  const currentDisplayImage = data.outputImageUrl || data.inputImageUrl;

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            {currentDisplayImage ? (
                <img src={currentDisplayImage} crossOrigin="anonymous" alt="thumbnail" className="w-full h-full object-contain rounded-sm" />
            ) : (
                <CubeTransparentIcon className="w-8 h-8 text-gray-500" />
            )}
        </div>
    );
  }

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="bg-gray-900 w-full flex-grow rounded-md flex items-center justify-center border border-gray-700 relative overflow-hidden min-h-0">
        {data.isLoading ? (
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        ) : currentDisplayImage ? (
            <img src={currentDisplayImage} crossOrigin="anonymous" alt="Processed" className="w-full h-full object-contain rounded-md" />
        ) : (
          <p className="text-gray-500 text-center text-sm">Connect an image to remove its background.</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-400 whitespace-nowrap">Background:</label>
        <div className="flex-grow flex items-center gap-2 flex-wrap">
            {RMBG_COLOR_PRESETS.map((preset) => (
                <button
                    key={preset.name}
                    onClick={() => handlePresetColorClick(preset.hex)}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${data.backgroundColor === preset.hex ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                    disabled={data.isLoading}
                >
                    {preset.name}
                </button>
            ))}
            <div className="relative flex-1 min-w-[100px]">
                <button
                    onClick={handleOpenColorPicker}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${!RMBG_COLOR_PRESETS.some(p => p.hex === data.backgroundColor) && data.backgroundColor !== 'transparent' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                    disabled={data.isLoading}
                    title="Custom Color"
                >
                    <PaintBrushIcon className="w-4 h-4" /> Custom
                </button>
                {/* Hidden color input, triggered by the button */}
                <input
                    type="color"
                    ref={colorInputRef}
                    value={data.backgroundColor} // Direct bind to data.backgroundColor
                    onChange={handleBackgroundColorChange}
                    className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" // Hide visually but make clickable
                    style={{ zIndex: displayColorInput ? 10 : 0 }} // Bring to front when ready to pick
                    disabled={data.isLoading}
                />
            </div>
        </div>
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={data.isLoading || !data.inputImageUrl}
        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-auto"
      >
        {data.isLoading ? 'Processing...' : 'Remove Background'}
      </button>
    </div>
  );
};

export default RMBGNode;