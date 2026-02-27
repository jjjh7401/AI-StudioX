
import React, { useEffect } from 'react';
import { Node, GridExtractorNodeData, HistoryAsset, ExtractedItem } from '../../types';
import { TableCellsIcon, ArrowDownTrayIcon, PhotoIcon, RectangleStackIcon, SparklesIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface GridExtractorNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<GridExtractorNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  onAssetGenerated: (asset: Omit<HistoryAsset, 'id'>) => void;
  isCollapsed: boolean;
  connectedImageUrl: string | null;
}

const GridExtractorNode: React.FC<GridExtractorNodeProps> = ({ node, onDataChange, onGenerate, onAssetGenerated, isCollapsed, connectedImageUrl }) => {
  const data = node.data as GridExtractorNodeData;

  // Sync connected image from canvas to node data
  useEffect(() => {
    if (connectedImageUrl && connectedImageUrl !== data.inputImageUrl) {
      onDataChange(node.id, { inputImageUrl: connectedImageUrl, extractedItems: [] });
    } else if (!connectedImageUrl && data.inputImageUrl) {
      onDataChange(node.id, { inputImageUrl: null, extractedItems: [] });
    }
  }, [connectedImageUrl, data.inputImageUrl, node.id, onDataChange]);

  const handleExtract = () => {
    onGenerate(node.id);
  };

  const handleDownloadAll = async () => {
    if (data.extractedItems.length === 0) return;
    for (const item of data.extractedItems) {
        const link = document.createElement('a');
        link.href = item.url;
        link.download = `${item.label || 'extracted_item'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Small delay to prevent browser bulk download blocking
        await new Promise(r => setTimeout(r, 300));
    }
  };

  const handleDownloadSingle = (item: ExtractedItem) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = `${item.label || 'extracted'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gray-900 rounded-lg">
            <ScissorsIcon className="w-6 h-6 text-indigo-400" />
            <span className="text-[8px] text-gray-500 mt-1 font-bold">{data.extractedItems.length} items</span>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Step 1: AI Detection & Input Preview */}
      <div className="bg-gray-950 w-full h-44 rounded-xl border border-gray-700/50 relative overflow-hidden flex items-center justify-center group shadow-inner">
        {data.inputImageUrl ? (
            <img src={data.inputImageUrl} crossOrigin="anonymous" className={`w-full h-full object-contain transition-opacity duration-500 ${data.isLoading ? 'opacity-30' : 'opacity-60 group-hover:opacity-100'}`} alt="input grid" />
        ) : (
            <div className="text-gray-600 flex flex-col items-center gap-2">
                <PhotoIcon className="w-10 h-10 opacity-20" />
                <p className="text-[10px] uppercase font-bold tracking-widest">Awaiting Grid Input</p>
            </div>
        )}
        
        {data.isLoading && (
            <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
                <div className="relative">
                    <ArrowPathIcon className="w-10 h-10 text-indigo-500 animate-spin" />
                    <SparklesIcon className="w-4 h-4 text-white absolute top-0 right-0 animate-pulse" />
                </div>
                <p className="mt-3 text-xs text-white font-bold bg-gray-900/90 px-4 py-1.5 rounded-full border border-indigo-500/50 shadow-2xl">
                    {data.loadingMessage}
                </p>
            </div>
        )}
      </div>

      {/* Step 2 & 3: Extracted Assets & Refinement Results */}
      <div className="flex-grow flex flex-col min-h-0 bg-gray-900/50 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between bg-gray-800/40">
              <div className="flex items-center gap-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Extracted Clean PNGs</h4>
                  <span className="bg-indigo-600/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded-md font-black border border-indigo-500/20">
                    {data.extractedItems.length}
                  </span>
              </div>
              <button 
                onClick={handleDownloadAll}
                disabled={data.extractedItems.length === 0 || data.isLoading}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-[10px] font-black rounded-lg shadow-lg transition-all active:scale-95"
              >
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                  SAVE ALL
              </button>
          </div>

          <div className="flex-grow overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {data.extractedItems.length === 0 && !data.isLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-700 py-10">
                      <TableCellsIcon className="w-12 h-12 mb-3 opacity-10" />
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-center px-4">Upload a Grid screenshot and run AI Extractor</p>
                  </div>
              )}

              {data.extractedItems.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/30 rounded-xl p-2.5 group hover:border-indigo-500/40 hover:bg-gray-800/60 transition-all">
                      <div className="relative w-20 h-14 bg-black rounded-lg border border-gray-700 overflow-hidden flex-shrink-0 shadow-lg">
                          <img src={item.url} className="w-full h-full object-contain" alt={item.label} />
                          <div className="absolute top-0 left-0 bg-indigo-600/90 text-white text-[8px] px-1.5 py-0.5 font-black rounded-br shadow-md">
                              {idx + 1}
                          </div>
                      </div>
                      <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[8px] bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded font-black border border-emerald-500/20 flex items-center gap-1">
                                  <CheckCircleIcon className="w-2.5 h-2.5" />
                                  CLEAN PNG
                              </span>
                          </div>
                          <p className="text-[11px] font-bold text-gray-200 truncate pr-2" title={item.label}>
                            {item.label || `asset_index_${idx}`}
                          </p>
                      </div>
                      <button 
                        onClick={() => handleDownloadSingle(item)}
                        className="p-2 text-gray-500 hover:text-white hover:bg-indigo-600 rounded-xl transition-all shadow-sm"
                        title="Download Asset"
                      >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                  </div>
              ))}
          </div>
      </div>

      <button
        onClick={handleExtract}
        disabled={data.isLoading || !data.inputImageUrl}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-white text-[11px] font-black rounded-xl shadow-2xl shadow-indigo-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest"
      >
        {data.isLoading ? (
            <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Processing Grid...
            </>
        ) : (
            <>
                <RectangleStackIcon className="w-4 h-4" />
                Run AI Grid Extractor
            </>
        )}
      </button>
    </div>
  );
};

export default GridExtractorNode;
