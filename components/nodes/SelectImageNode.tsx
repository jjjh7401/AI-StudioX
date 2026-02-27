import React from 'react';
import { Node, SelectImageNodeData } from '../../types';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface SelectImageNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<SelectImageNodeData>) => void;
  isCollapsed: boolean;
}

const SelectImageNode: React.FC<SelectImageNodeProps> = ({ node, onDataChange, isCollapsed }) => {
  const data = node.data as SelectImageNodeData;

  const handleIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const index = isNaN(val) ? 0 : Math.max(0, val);
    const outputUrl = data.imageList?.[index] || null;
    onDataChange(node.id, { index, outputUrl });
  };

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gray-900 rounded-lg">
            {data.outputUrl ? (
                <img src={data.outputUrl} crossOrigin="anonymous" className="w-full h-full object-contain rounded-sm" />
            ) : (
                <PhotoIcon className="w-6 h-6 text-gray-500" />
            )}
            <span className="text-[8px] text-gray-500 mt-1 font-bold">Selected #{data.index}</span>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3">
        <div className="bg-gray-950 w-full flex-grow rounded-xl border border-gray-700/50 relative overflow-hidden flex items-center justify-center shadow-inner group">
            {data.outputUrl ? (
                <img src={data.outputUrl} crossOrigin="anonymous" className="w-full h-full object-contain" alt="selected item" />
            ) : (
                <div className="text-gray-600 flex flex-col items-center gap-2">
                    <PhotoIcon className="w-12 h-12 opacity-10" />
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">No Image Selected</p>
                </div>
            )}
            {data.outputUrl && (
                <div className="absolute top-2 left-2 bg-indigo-600/90 text-white text-[10px] px-2 py-0.5 font-black rounded-md shadow-lg border border-indigo-400/50">
                    IMAGE #{data.index + 1}
                </div>
            )}
        </div>

        <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selection Index</label>
                <span className="text-[10px] font-mono text-indigo-400">0 - {Math.max(0, (data.imageList?.length || 0) - 1)}</span>
            </div>
            <div className="flex items-center gap-3">
                <input 
                    type="number"
                    value={data.index}
                    min={0}
                    max={Math.max(0, (data.imageList?.length || 0) - 1)}
                    onChange={handleIndexChange}
                    className="flex-grow bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <div className="bg-indigo-600/20 text-indigo-400 text-xs px-3 py-2 rounded-lg border border-indigo-500/20 font-bold">
                    OF {data.imageList?.length || 0}
                </div>
            </div>
        </div>

        <div className="px-1">
            <p className="text-[9px] text-gray-500 font-medium leading-relaxed italic">
                Connect to Grid Extractor's Image List to select a specific item.
            </p>
        </div>
    </div>
  );
};

export default SelectImageNode;