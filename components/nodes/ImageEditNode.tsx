
import React from 'react';
import { Node, ImageEditNodeData, HistoryAsset } from '../../types';
import { PencilSquareIcon, ArrowUpTrayIcon, ArrowsPointingOutIcon, StopIcon } from '@heroicons/react/24/outline';
import { removeBackground, expandImage, upscaleImage } from '../../services/geminiService';

interface ImageEditNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<ImageEditNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  connectedImageUrl: string | null;
  onAssetGenerated: (asset: Omit<HistoryAsset, 'id'>) => void;
  isCollapsed: boolean;
}

const ImageEditNode: React.FC<ImageEditNodeProps> = ({ node, onDataChange, onGenerate, connectedImageUrl, onAssetGenerated, isCollapsed }) => {
  const data = node.data as ImageEditNodeData;

  const handleGenerate = () => {
    onGenerate(node.id);
  };

  const handleAction = async (action: 'RMBG' | 'Expand' | 'Upscale') => {
    const sourceImage = connectedImageUrl || data.outputImageUrl || data.inputImageUrl;

    if (!sourceImage) {
        alert("Please connect an image input or generate an edit first.");
        return;
    }

    onDataChange(node.id, { isLoading: true });

    try {
        let result: string | null = null;
        
        if (action === 'RMBG') {
            result = await removeBackground(sourceImage);
        } else if (action === 'Expand') {
            result = await expandImage(sourceImage);
        } else if (action === 'Upscale') {
            result = await upscaleImage(sourceImage);
        }

        if (result) {
            const res = await fetch(result);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            onDataChange(node.id, { outputImageUrl: blobUrl, isLoading: false, loadingMessage: undefined });
            onAssetGenerated({ type: 'image', url: blobUrl });
        } else {
            onDataChange(node.id, { isLoading: false });
        }
    } catch (error) {
        console.error(`Error during ${action}:`, error);
        onDataChange(node.id, { isLoading: false, loadingMessage: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center">
            {data.outputImageUrl ? (
                <img src={data.outputImageUrl} crossOrigin="anonymous" alt="thumbnail" className="w-full h-full object-contain rounded-sm" />
            ) : (
                <PencilSquareIcon className="w-6 h-6 text-gray-500" />
            )}
        </div>
    )
  }

  return (
    <div className="space-y-3 flex flex-col h-full">
        <div className="bg-gray-900 w-full flex-grow rounded-md flex items-center justify-center border border-gray-700 relative overflow-hidden min-h-0">
            {data.isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              {data.loadingMessage && <p className="text-xs text-indigo-400 text-center px-2">{data.loadingMessage}</p>}
            </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full relative">
                {data.outputImageUrl ? (
                  <img src={data.outputImageUrl} crossOrigin="anonymous" alt="Generated" className="w-full h-full object-contain rounded-md" />
                ) : connectedImageUrl ? (
                    <img src={connectedImageUrl} crossOrigin="anonymous" alt="Input" className="w-full h-full object-contain rounded-md opacity-50" />
                ) : null}
                {data.loadingMessage && data.loadingMessage.startsWith('Error:') && (
                  <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center p-2">
                    <p className="text-red-400 text-[10px] text-center break-words w-full">{data.loadingMessage}</p>
                  </div>
                )}
              </div>
            )}
        </div>
      <button
        onClick={handleGenerate}
        disabled={data.isLoading}
        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {data.isLoading ? `Generating ${data.imageSize || '1K'}...` : `Generate ${data.imageSize || '1K'} Edit`}
      </button>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-400 whitespace-nowrap">Resolution</label>
        <div className="flex flex-grow gap-1">
          {['1K', '2K', '4K'].map((size) => (
            <button
              key={size}
              onClick={() => onDataChange(node.id, { imageSize: size as '1K' | '2K' | '4K' })}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-colors ${
                (data.imageSize || '1K') === size
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction('RMBG')}
            disabled={data.isLoading}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove Background"
          >
              <StopIcon className="w-4 h-4" />
              RMBG
          </button>
          <button
            onClick={() => handleAction('Expand')}
            disabled={data.isLoading}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Expand Image (Outpainting)"
          >
              <ArrowsPointingOutIcon className="w-4 h-4" />
              Expand
          </button>
          <button
            onClick={() => handleAction('Upscale')}
            disabled={data.isLoading}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upscale to 4K"
          >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Upscale
          </button>
      </div>
    </div>
  );
};

export default ImageEditNode;
