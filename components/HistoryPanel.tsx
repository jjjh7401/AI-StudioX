
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { HistoryAsset } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, PhotoIcon, FilmIcon, ArrowDownTrayIcon, XMarkIcon, ArrowLeftIcon, ArrowRightIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/solid';

interface HistoryPanelProps {
  history: HistoryAsset[];
}

// Helper to format bytes to human readable string
const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const AssetModal: React.FC<{
    assets: HistoryAsset[];
    startIndex: number;
    onClose: () => void;
}> = ({ assets, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [metadata, setMetadata] = useState<{ width: number, height: number, size: string } | null>(null);
    
    // Zoom & Pan State
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const panStart = useRef({ x: 0, y: 0 });

    const currentAsset = assets[currentIndex];

    // Reset state when asset changes
    useEffect(() => {
        setMetadata(null);
        setZoom(1);
        setPan({ x: 0, y: 0 });

        if (currentAsset.type === 'image') {
            // Fetch file size
            fetch(currentAsset.url)
                .then(res => res.blob())
                .then(blob => {
                    setMetadata(prev => ({
                        width: prev?.width || 0,
                        height: prev?.height || 0,
                        size: formatBytes(blob.size)
                    }));
                })
                .catch(err => console.error("Failed to fetch image size", err));
        }
    }, [currentAsset]);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setMetadata(prev => ({
            width: img.naturalWidth,
            height: img.naturalHeight,
            size: prev?.size || 'Loading...'
        }));
    };

    const handleDownload = useCallback(async () => {
        const asset = assets[currentIndex];
        if (!asset) return;

        try {
            const response = await fetch(asset.url);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = objectUrl;

            if (asset.type === 'video') {
                a.download = `cosmos-asset-${asset.id}.mp4`;
            } else {
                // Direct download of the original blob to preserve 4K resolution
                let ext = 'png';
                if (blob.type === 'image/jpeg') ext = 'jpg';
                else if (blob.type === 'image/webp') ext = 'webp';
                
                a.download = `cosmos-asset-${asset.id}.${ext}`;
            }

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error("Download failed:", error);
        }
    }, [currentIndex, assets]);
    
    const navigate = useCallback((direction: 'next' | 'prev') => {
        if (assets.length <= 1) return;
        const newIndex = direction === 'next'
            ? (currentIndex + 1) % assets.length
            : (currentIndex - 1 + assets.length) % assets.length;
        setCurrentIndex(newIndex);
    }, [currentIndex, assets.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') navigate('next');
            else if (e.key === 'ArrowLeft') navigate('prev');
            else if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, onClose]);

    // Zoom Handlers
    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const scaleAmount = -e.deltaY * 0.001;
        const newZoom = Math.min(Math.max(0.5, zoom + scaleAmount), 5); // Min 0.5x, Max 5x
        setZoom(newZoom);
    };

    // Pan Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            e.preventDefault();
            setIsDragging(true);
            dragStart.current = { x: e.clientX, y: e.clientY };
            panStart.current = { x: pan.x, y: pan.y };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            e.preventDefault();
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            setPan({
                x: panStart.current.x + dx,
                y: panStart.current.y + dy
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center overflow-hidden" onClick={onClose}>
            <div 
                className="relative w-full h-full flex items-center justify-center" 
                onClick={e => e.stopPropagation()}
                onWheel={currentAsset.type === 'image' ? handleWheel : undefined}
            >
                {/* Information Overlay */}
                {currentAsset.type === 'image' && metadata && (
                    <div className="absolute top-4 left-4 z-20 bg-black/60 text-white p-3 rounded-lg border border-gray-700/50 backdrop-blur-sm text-xs space-y-1 select-none pointer-events-none">
                        <p><span className="text-gray-400">File:</span> {currentAsset.id}</p>
                        <p><span className="text-gray-400">Resolution:</span> {metadata.width} x {metadata.height}</p>
                        <p><span className="text-gray-400">Size:</span> {metadata.size}</p>
                        <p><span className="text-gray-400">Zoom:</span> {Math.round(zoom * 100)}%</p>
                    </div>
                )}

                {/* Navigation Buttons */}
                {assets.length > 1 && (
                    <>
                        <button onClick={() => navigate('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-gray-800 transition-colors z-20">
                            <ArrowLeftIcon className="w-6 h-6"/>
                        </button>
                        <button onClick={() => navigate('next')} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-gray-800 transition-colors z-20">
                            <ArrowRightIcon className="w-6 h-6"/>
                        </button>
                    </>
                )}

                {/* Main Content */}
                <div 
                    className="relative w-full h-full flex items-center justify-center overflow-hidden"
                    onMouseDown={currentAsset.type === 'image' ? handleMouseDown : undefined}
                    onMouseMove={currentAsset.type === 'image' ? handleMouseMove : undefined}
                    onMouseUp={currentAsset.type === 'image' ? handleMouseUp : undefined}
                    onMouseLeave={currentAsset.type === 'image' ? handleMouseUp : undefined}
                    style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                >
                    {currentAsset.type === 'image' ? (
                        <img 
                            src={currentAsset.url} 
                            crossOrigin="anonymous" 
                            alt="Enlarged history asset" 
                            onLoad={handleImageLoad}
                            className="max-w-full max-h-full object-contain transition-transform duration-75 ease-linear will-change-transform"
                            style={{ 
                                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                            }}
                            draggable={false}
                        />
                    ) : (
                        <video src={currentAsset.url} crossOrigin="anonymous" controls autoPlay loop className="max-w-full max-h-full object-contain" />
                    )}
                </div>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-black/50 rounded-full text-white hover:bg-red-900/50 hover:text-red-200 transition-colors z-20">
                    <XMarkIcon className="w-6 h-6"/>
                </button>

                {/* Download Button */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                    <button onClick={handleDownload} className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 shadow-lg transition-transform hover:scale-110 flex items-center gap-2 px-6" title="Download Asset (Original Quality)">
                        <ArrowDownTrayIcon className="w-5 h-5"/>
                        <span className="font-bold text-sm">Download Original</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; index: number | null }>({ isOpen: false, index: null });

  const imageHistory = history.filter(asset => asset.type === 'image');

  const handleDragStart = (e: React.DragEvent, asset: HistoryAsset) => {
    if (asset.type === 'image') {
      e.dataTransfer.setData('application/x-cosmos-asset', JSON.stringify(asset));
    } else {
      e.preventDefault();
    }
  };

  const handleDownloadAll = async () => {
    if (imageHistory.length === 0) return;

    for (let i = 0; i < imageHistory.length; i++) {
        const asset = imageHistory[i];
        try {
            const response = await fetch(asset.url);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = objectUrl;
            
            // Detect extension for bulk download as well
            let ext = 'png';
            if (blob.type === 'image/jpeg') ext = 'jpg';
            else if (blob.type === 'image/webp') ext = 'webp';

            a.download = `cosmos-asset-${asset.id}.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);
            await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
        } catch (error) {
            console.error(`Failed to download ${asset.id}:`, error);
        }
    }
  };

  const panelWidth = isCollapsed ? 'w-12' : 'w-64';

  return (
    <>
      <div className={`flex-shrink-0 bg-gray-800/80 backdrop-blur-sm transition-all duration-300 ease-in-out relative border-r border-gray-700 ${panelWidth}`}>
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 p-3 flex items-center justify-between border-b border-gray-700 h-[52px]">
            {!isCollapsed && <h2 className="text-lg font-bold text-white">History</h2>}
             {!isCollapsed && (
                <button 
                  onClick={handleDownloadAll}
                  disabled={imageHistory.length === 0}
                  className="text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                  title="Download all images"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
             )}
          </div>
          
          <div className={`flex-grow p-2 overflow-y-auto overflow-x-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            {history.length === 0 && !isCollapsed && (
              <p className="text-gray-400 text-sm text-center mt-4 px-2">Generated assets will appear here.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {history.map((asset, index) => {
                  if (asset.type === 'image') {
                      return (
                          <div
                              key={asset.id}
                              className="aspect-square bg-gray-900 rounded-md overflow-hidden relative group"
                              draggable
                              onDragStart={(e) => handleDragStart(e, asset)}
                              onClick={() => setModalState({ isOpen: true, index })}
                              title="Click to view. Drag to canvas."
                              style={{ cursor: 'pointer' }}
                          >
                              <img src={asset.url} crossOrigin="anonymous" className="w-full h-full object-cover" alt="Generated asset" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <MagnifyingGlassPlusIcon className="w-6 h-6 text-white"/>
                              </div>
                          </div>
                      );
                  }
                  // Non-image assets (video)
                  return (
                      <div
                          key={asset.id}
                          className="aspect-square bg-gray-900 rounded-md overflow-hidden relative group"
                          onClick={() => setModalState({ isOpen: true, index })}
                          title="Click to view video"
                          style={{ cursor: 'pointer' }}
                      >
                          <video src={asset.url} crossOrigin="anonymous" className="w-full h-full object-cover" loop muted autoPlay playsInline />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <FilmIcon className="w-8 h-8 text-white"/>
                          </div>
                      </div>
                  );
              })}
            </div>
          </div>
        </div>
         <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-16 bg-gray-700 hover:bg-indigo-600 rounded-r-lg z-20 flex items-center justify-center"
            title={isCollapsed ? "Show History" : "Hide History"}
          >
            {isCollapsed ? <ChevronRightIcon className="w-5 h-5 text-white" /> : <ChevronLeftIcon className="w-5 h-5 text-white" />}
          </button>
      </div>

      {modalState.isOpen && modalState.index !== null && (
          <AssetModal 
              assets={history}
              startIndex={modalState.index}
              onClose={() => setModalState({ isOpen: false, index: null })}
          />
      )}
    </>
  );
};

export default HistoryPanel;
