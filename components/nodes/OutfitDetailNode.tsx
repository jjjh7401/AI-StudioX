import React from 'react';
import { Node, OutfitDetailNodeData } from '../../types';
import { SparklesIcon, ClipboardIcon } from '@heroicons/react/24/outline';

interface OutfitDetailNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<OutfitDetailNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  connectedImageUrl: string | null;
  isCollapsed: boolean;
}

const OutfitDetailNode: React.FC<OutfitDetailNodeProps> = ({ node, onDataChange, onGenerate, connectedImageUrl, isCollapsed }) => {
  const data = node.data as OutfitDetailNodeData;

  const handleCopy = () => {
    if (data.technicalSpec) {
      navigator.clipboard.writeText(data.technicalSpec);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2">
        {connectedImageUrl || data.inputImageUrl ? (
          <img 
            src={connectedImageUrl || data.inputImageUrl || ''} 
            crossOrigin="anonymous" 
            alt="outfit" 
            className="w-full h-full object-contain rounded-md" 
          />
        ) : (
          <SparklesIcon className="w-8 h-8 text-indigo-400" />
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-3" onMouseDown={(e) => e.stopPropagation()}>
      <div className="flex-grow flex space-x-3 min-h-0">
        {/* Left: Input Image */}
        <div className="w-1/2 h-full bg-gray-900 rounded-lg border border-gray-700 overflow-hidden flex items-center justify-center relative">
          {connectedImageUrl || data.inputImageUrl ? (
            <img 
              src={connectedImageUrl || data.inputImageUrl || ''} 
              crossOrigin="anonymous" 
              alt="outfit" 
              className="w-full h-full object-contain" 
            />
          ) : (
            <div className="text-gray-500 text-xs text-center px-4">
              Connect an image to analyze outfit details.
            </div>
          )}
          {(connectedImageUrl || data.inputImageUrl) && (
             <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-indigo-400 uppercase tracking-wider border border-indigo-500/30">
                Input Image
             </div>
          )}
        </div>

        {/* Right: Technical Spec */}
        <div className="w-1/2 h-full bg-gray-900 rounded-lg border border-gray-700 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 px-3 py-2 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Technical Specification</span>
            {data.technicalSpec && (
              <button 
                onClick={handleCopy}
                className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                title="Copy to clipboard"
              >
                <ClipboardIcon className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex-grow p-3 overflow-y-auto custom-scrollbar">
            {data.isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                <span className="text-[10px] text-gray-500 animate-pulse">Analyzing garment construction...</span>
              </div>
            ) : data.technicalSpec ? (
              <pre className="text-[11px] font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                {data.technicalSpec}
              </pre>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px] italic text-center px-4">
                Technical details will appear here after generation.
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => onGenerate(node.id)}
        disabled={data.isLoading || (!connectedImageUrl && !data.inputImageUrl)}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
      >
        <SparklesIcon className="w-4 h-4" />
        {data.isLoading ? 'Analyzing...' : 'Extract Outfit Details'}
      </button>
    </div>
  );
};

export default OutfitDetailNode;
