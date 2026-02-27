import React from 'react';
import { Node, GridShotNodeData, HistoryAsset } from '../../types';
import { TableCellsIcon, FilmIcon, ArrowPathIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { generateVideo } from '../../services/geminiService';

interface GridShotNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<GridShotNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  onAssetGenerated: (asset: Omit<HistoryAsset, 'id'>) => void;
  isCollapsed: boolean;
}

const GridShotNode: React.FC<GridShotNodeProps> = ({ node, onDataChange, onGenerate, onAssetGenerated, isCollapsed }) => {
  const data = node.data as GridShotNodeData;

  const handleGenerateImage = () => {
    onGenerate(node.id);
  };

  const handleGenerateVideo = async () => {
    if (!data.outputImageUrl) {
        alert("Please generate the grid image first.");
        return;
    }

    onDataChange(node.id, { isLoading: true, loadingMessage: 'Generating cinematic video...' });

    try {
        const videoPrompt = `Take the human subject from the reference image. Create a high-energy cinematic montage connecting all the different camera angles and techniques shown in the grid. Smoothly transition between aerial shots, close-ups, and wide angles. Photorealistic 4K, 8 seconds.`;
        
        const result = await generateVideo(
            videoPrompt,
            data.outputImageUrl,
            null,
            '720p',
            null,
            (msg) => onDataChange(node.id, { loadingMessage: msg }),
            [data.outputImageUrl]
        );

        if (result.videoUrl) {
            onDataChange(node.id, { outputVideoUrl: result.videoUrl, isLoading: false });
            onAssetGenerated({ type: 'video', url: result.videoUrl });
        } else {
            onDataChange(node.id, { isLoading: false });
        }
    } catch (error) {
        console.error("Grid video generation error:", error);
        onDataChange(node.id, { isLoading: false, loadingMessage: 'Video failed' });
    }
  };

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center">
            {data.outputImageUrl ? (
                <img src={data.outputImageUrl} crossOrigin="anonymous" alt="thumbnail" className="w-full h-full object-contain rounded-sm" />
            ) : (
                <TableCellsIcon className="w-8 h-8 text-gray-500" />
            )}
        </div>
    );
  }

  const gridOptions = [
      { label: '6장 (3x2)', value: '3x2' },
      { label: '12장 (4x3)', value: '4x3' },
      { label: '20장 (5x4)', value: '5x4' },
      { label: '42장 (7x6)', value: '7x6' }
  ];

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="bg-gray-900 w-full flex-grow rounded-md flex flex-col items-center justify-center border border-gray-700 relative overflow-hidden group">
        {data.isLoading ? (
           <div className="text-center p-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                <p className="text-[10px] text-indigo-300 font-mono">{data.loadingMessage}</p>
           </div>
        ) : data.outputVideoUrl ? (
            <video src={data.outputVideoUrl} className="w-full h-full object-contain" controls autoPlay loop />
        ) : data.outputImageUrl ? (
            <img src={data.outputImageUrl} crossOrigin="anonymous" alt="Grid Result" className="w-full h-full object-contain" />
        ) : (
            <div className="text-center text-gray-600 p-4">
                <TableCellsIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-xs">Select grid size and run.</p>
            </div>
        )}
        
        {data.outputVideoUrl && !data.isLoading && (
            <button 
                onClick={() => onDataChange(node.id, { outputVideoUrl: null })}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-900/50 transition-all"
                title="Switch back to image"
            >
                <PhotoIcon className="w-4 h-4" />
            </button>
        )}
      </div>

      <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700 space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Grid Configuration</label>
          <div className="grid grid-cols-2 gap-1.5">
              {gridOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onDataChange(node.id, { gridSize: opt.value })}
                    className={`text-[10px] py-1.5 rounded-md font-bold transition-all border ${
                        data.gridSize === opt.value 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/20' 
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                  >
                      {opt.label}
                  </button>
              ))}
          </div>
      </div>

      <div className="flex gap-2">
          <button
            onClick={handleGenerateImage}
            disabled={data.isLoading}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-white shadow-lg transition-all disabled:bg-gray-700 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-2"
          >
            {data.isLoading && !data.outputVideoUrl ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <TableCellsIcon className="w-4 h-4" />}
            Generate Grid
          </button>
          <button
            onClick={handleGenerateVideo}
            disabled={data.isLoading || !data.outputImageUrl}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white shadow-lg transition-all disabled:bg-gray-700 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-2"
            title="Convert grid shots into a harmonious video"
          >
            {data.isLoading && data.outputVideoUrl ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <FilmIcon className="w-4 h-4" />}
            Connect Video
          </button>
      </div>
    </div>
  );
};

export default GridShotNode;