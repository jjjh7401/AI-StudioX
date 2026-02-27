import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Node, ImageModifyNodeData, HistoryAsset } from '../../types';
import { 
  PencilIcon, 
  Square3Stack3DIcon, 
  ArrowLongRightIcon, 
  LanguageIcon, 
  HandRaisedIcon,
  TrashIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import * as d3 from 'd3';

interface ImageModifyNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<ImageModifyNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  connectedImageUrl: string | null;
  onAssetGenerated: (asset: Omit<HistoryAsset, 'id'>) => void;
  isCollapsed: boolean;
}

const ImageModifyNode: React.FC<ImageModifyNodeProps> = ({ 
  node, 
  onDataChange, 
  onGenerate, 
  connectedImageUrl, 
  onAssetGenerated, 
  isCollapsed 
}) => {
  const data = node.data as ImageModifyNodeData;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markupCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Sync internal PanZoom
  useEffect(() => {
    const container = d3.select(containerRef.current);
    if (!container.node() || isCollapsed) return;

    const zoom = d3.zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.1, 10])
      .filter((event) => {
        if (event.type === 'wheel') return true;
        if (event.type === 'mousedown' && (data.activeTool === 'pan' || event.button === 1)) return true;
        return false;
      })
      .on('zoom', (event) => {
        onDataChange(node.id, { internalPanZoom: event.transform });
      });

    container.call(zoom);
    container.call(zoom.transform, d3.zoomIdentity.translate(data.internalPanZoom.x, data.internalPanZoom.y).scale(data.internalPanZoom.k));

    return () => { container.on('.zoom', null); };
  }, [node.id, isCollapsed, data.activeTool]);

  // Handle Image Loading onto Canvas
  useEffect(() => {
    const url = connectedImageUrl || data.inputImageUrl;
    if (!url || !canvasRef.current) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = canvasRef.current!;
      const markup = markupCanvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      markup.width = img.width;
      markup.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      
      // If we have previous markup, restore it (simplified for demo, usually store in data)
    };
  }, [connectedImageUrl, data.inputImageUrl, isCollapsed]);

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = markupCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const k = data.internalPanZoom.k;
    return {
      x: (e.clientX - rect.left) / (rect.width / canvas.width),
      y: (e.clientY - rect.top) / (rect.height / canvas.height)
    };
  };

  const startInteraction = (e: React.MouseEvent) => {
    if (data.activeTool === 'pan') return;
    setIsDrawing(true);
    setStartPos(getCanvasCoords(e));
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !markupCanvasRef.current || data.activeTool === 'pan') return;
    const ctx = markupCanvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const current = getCanvasCoords(e);
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 10 / data.internalPanZoom.k;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (data.activeTool === 'brush') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
      setStartPos(current);
    }
  };

  const endInteraction = (e: React.MouseEvent) => {
    if (!isDrawing || !markupCanvasRef.current) return;
    const ctx = markupCanvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const end = getCanvasCoords(e);
    ctx.strokeStyle = '#FF0000';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.lineWidth = 5;

    if (data.activeTool === 'box') {
      ctx.strokeRect(startPos.x, startPos.y, end.x - startPos.x, end.y - startPos.y);
      ctx.fillRect(startPos.x, startPos.y, end.x - startPos.x, end.y - startPos.y);
    } else if (data.activeTool === 'arrow') {
      const headlen = 20; 
      const angle = Math.atan2(end.y - startPos.y, end.x - startPos.x);
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    } else if (data.activeTool === 'text') {
      const text = prompt("Enter text guidance:");
      if (text) {
        ctx.font = 'bold 40px sans-serif';
        ctx.fillStyle = '#FF0000';
        ctx.fillText(text, end.x, end.y);
      }
    }
    
    setIsDrawing(false);
    onDataChange(node.id, { markupDataUrl: markupCanvasRef.current.toDataURL() });
  };

  const handleClear = () => {
    const markup = markupCanvasRef.current;
    if (markup) {
      markup.getContext('2d')?.clearRect(0, 0, markup.width, markup.height);
      onDataChange(node.id, { markupDataUrl: null });
    }
  };

  const handleOutpaint = () => {
      onDataChange(node.id, { prompt: "Expand the background to 16:9 cinematic ratio, preserving the central subject and style perfectly." });
      onGenerate(node.id);
  };

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            {data.outputImageUrl ? (
                <img src={data.outputImageUrl} crossOrigin="anonymous" className="w-full h-full object-contain rounded-sm" />
            ) : (
                <SparklesIcon className="w-8 h-8 text-indigo-400" />
            )}
        </div>
    );
  }

  const toolClass = (tool: string) => `p-2 rounded-lg transition-all ${data.activeTool === tool ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`;

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Retouching Viewer */}
      <div 
        ref={containerRef}
        className="flex-grow bg-gray-950 rounded-xl border border-gray-700 relative overflow-hidden group shadow-inner"
        style={{ cursor: data.activeTool === 'pan' ? 'grab' : 'crosshair' }}
      >
        <div 
            className="absolute inset-0 origin-top-left"
            style={{ transform: `translate(${data.internalPanZoom.x}px, ${data.internalPanZoom.y}px) scale(${data.internalPanZoom.k})` }}
        >
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
            <canvas 
                ref={markupCanvasRef} 
                className="absolute inset-0"
                onMouseDown={startInteraction}
                onMouseMove={draw}
                onMouseUp={endInteraction}
                onMouseLeave={() => setIsDrawing(false)}
            />
        </div>

        {/* View Controls Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            <button onClick={() => onDataChange(node.id, { activeTool: 'brush' })} className={toolClass('brush')} title="Brush (Freeform Mark)"><PencilIcon className="w-5 h-5"/></button>
            <button onClick={() => onDataChange(node.id, { activeTool: 'box' })} className={toolClass('box')} title="Box (Area Target)"><Square3Stack3DIcon className="w-5 h-5"/></button>
            <button onClick={() => onDataChange(node.id, { activeTool: 'arrow' })} className={toolClass('arrow')} title="Arrow (Directional Guidance)"><ArrowLongRightIcon className="w-5 h-5"/></button>
            <button onClick={() => onDataChange(node.id, { activeTool: 'text' })} className={toolClass('text')} title="Text (Label Placement)"><LanguageIcon className="w-5 h-5"/></button>
            <div className="h-px bg-gray-700 my-1"/>
            <button onClick={() => onDataChange(node.id, { activeTool: 'pan' })} className={toolClass('pan')} title="Pan (Middle Click / H)"><HandRaisedIcon className="w-5 h-5"/></button>
            <button onClick={handleClear} className="p-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50" title="Clear Markings"><TrashIcon className="w-5 h-5"/></button>
        </div>

        {/* Zoom Indicator */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur rounded text-[10px] font-mono text-indigo-400 border border-indigo-500/30">
            {Math.round(data.internalPanZoom.k * 100)}% ZOOM
        </div>

        {data.isLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <ArrowPathIcon className="w-10 h-10 text-indigo-500 animate-spin mb-2" />
                <p className="text-xs font-black uppercase tracking-widest text-indigo-300">{data.loadingMessage || 'AI Modifying...'}</p>
            </div>
        )}
      </div>

      {/* Control Area */}
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 space-y-3">
          <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Modification Prompt</label>
              <textarea 
                value={data.prompt}
                onChange={(e) => onDataChange(node.id, { prompt: e.target.value })}
                className="w-full h-20 bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                placeholder="e.g. Change bottle cap color to matte gold, make text sharper..."
              />
          </div>

          <div className="flex gap-2">
              <button 
                onClick={() => onGenerate(node.id)}
                disabled={data.isLoading || (!connectedImageUrl && !data.inputImageUrl)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 disabled:bg-gray-800 disabled:text-gray-600 transition-all active:scale-95"
              >
                  <SparklesIcon className="w-4 h-4" />
                  Apply AI Retouching
              </button>
              <button 
                onClick={handleOutpaint}
                disabled={data.isLoading || (!connectedImageUrl && !data.inputImageUrl)}
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                title="Expand to 16:9 background"
              >
                  <ArrowsPointingOutIcon className="w-4 h-4" />
                  16:9 Outpaint
              </button>
          </div>
      </div>
    </div>
  );
};

export default ImageModifyNode;