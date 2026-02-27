import React, { useRef, useEffect, useCallback } from 'react';
import { Node, VtonNodeData, HistoryAsset, VtonOutfitItem, VtonStylingItem } from '../../types';
import { generateVtonImage } from '../../services/geminiService';
import { POSE_PRESETS } from '../../data/constants';
import { ArrowUpTrayIcon, ArrowPathIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface VtonNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<VtonNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  connectedModelUrl: string | null;
  connectedOutfitUrl: string | null;
  onAssetGenerated: (asset: Omit<HistoryAsset, 'id'>) => void;
  isCollapsed: boolean;
}

const VtonNode: React.FC<VtonNodeProps> = ({ node, onDataChange, onGenerate, connectedModelUrl, connectedOutfitUrl, onAssetGenerated, isCollapsed }) => {
    const data = node.data as VtonNodeData;
    const outfitFileInputRef = useRef<HTMLInputElement>(null);

    // Effect to update base model when connected input changes
    useEffect(() => {
        if (connectedModelUrl && connectedModelUrl !== data.baseModelUrl) {
            const updates: Partial<VtonNodeData> = { baseModelUrl: connectedModelUrl };
            if (data.selectedStylingId === 'base') {
                updates.mainImageUrl = connectedModelUrl;
            }
            onDataChange(node.id, updates);
        }
    }, [connectedModelUrl, data.baseModelUrl, data.selectedStylingId, node.id, onDataChange]);
    
    // Effect to update outfit items when connected input changes
    useEffect(() => {
        if (connectedOutfitUrl) {
            const existingOutfit = data.outfitItems.find(item => item.url === connectedOutfitUrl);
            if (!existingOutfit) {
                const newId = `outfit-conn-${Date.now()}`;
                const newOutfit: VtonOutfitItem = { id: newId, url: connectedOutfitUrl };
                onDataChange(node.id, { 
                    outfitItems: [...data.outfitItems, newOutfit],
                    selectedOutfitId: newId 
                });
            } else if (data.selectedOutfitId !== existingOutfit.id) {
                onDataChange(node.id, { selectedOutfitId: existingOutfit.id });
            }
        }
    }, [connectedOutfitUrl, data.outfitItems, data.selectedOutfitId, node.id, onDataChange]);

    const processFiles = useCallback((files: FileList | null) => {
        if (!files) return;
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        const newOutfitItems = [...data.outfitItems];
        let loadedCount = 0;

        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                const newId = `outfit-${Date.now()}-${Math.random()}`;
                newOutfitItems.push({ id: newId, url: imageUrl });

                loadedCount++;
                if (loadedCount === imageFiles.length) {
                    onDataChange(node.id, { outfitItems: newOutfitItems });
                }
            };
            reader.readAsDataURL(file);
        });
    }, [data.outfitItems, node.id, onDataChange]);
    
    const handleOutfitFileChange = (e: React.ChangeEvent<HTMLInputElement>) => processFiles(e.target.files);
    const handleOutfitDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        processFiles(e.dataTransfer.files);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            processFiles(e.clipboardData.files);
        }
    };

    const handlePoseChange = (newPose: string) => {
        onDataChange(node.id, { pose: newPose });
    };

    const handleGenerate = async (regenItem?: VtonStylingItem) => {
        let sourceImageUrl: string | null = null;
        let outfitForGeneration: VtonOutfitItem | undefined;
        const poseForGeneration = data.pose;
    
        if (regenItem) {
            sourceImageUrl = regenItem.sourceImageUrl;
            outfitForGeneration = data.outfitItems.find(o => o.id === regenItem.outfitId);
        } else {
            if (data.selectedStylingId === 'base') {
                sourceImageUrl = data.baseModelUrl;
            } else {
                const selectedStyling = data.stylingList.find(s => s.id === data.selectedStylingId);
                sourceImageUrl = selectedStyling ? selectedStyling.url : data.baseModelUrl;
            }
            outfitForGeneration = data.outfitItems.find(o => o.id === data.selectedOutfitId);
        }
    
        if (!sourceImageUrl || !outfitForGeneration || !poseForGeneration) {
            alert('Please provide a Base Model, select an Outfit, and choose a Pose.');
            return;
        }
    
        onDataChange(node.id, { isLoading: true });
    
        const result = await generateVtonImage(sourceImageUrl, outfitForGeneration.url, poseForGeneration);
        
        if (result) {
            onAssetGenerated({ type: 'image', url: result });
    
            if (regenItem) {
                 const updatedStylingList = data.stylingList.map(item => 
                    item.id === regenItem.id ? { ...item, url: result, pose: poseForGeneration } : item
                );
                 onDataChange(node.id, { isLoading: false, mainImageUrl: result, stylingList: updatedStylingList, selectedStylingId: regenItem.id, outputImageUrl: result });
    
            } else {
                const newItem: VtonStylingItem = {
                    id: `styling-${Date.now()}`,
                    url: result,
                    outfitId: outfitForGeneration.id,
                    pose: poseForGeneration,
                    sourceImageUrl: sourceImageUrl,
                };
                const newStylingList = [...data.stylingList, newItem];
                onDataChange(node.id, { 
                    isLoading: false, 
                    mainImageUrl: result, 
                    stylingList: newStylingList, 
                    selectedStylingId: newItem.id,
                    outputImageUrl: result 
                });
            }
        } else {
            onDataChange(node.id, { isLoading: false });
        }
    };

    const TShirtIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 7.5l-3.5-2.5-3.5 2.5m7 0V4.5a1.5 1.5 0 00-1.5-1.5h-7A1.5 1.5 0 003.5 4.5v3m14 0v10.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013.5 18V7.5m14 0h-14" />
        </svg>
    );

    if (isCollapsed) {
        return (
           <div className="w-full h-full flex items-center justify-center p-1">
               {data.mainImageUrl ? (
                   <img src={data.mainImageUrl} crossOrigin="anonymous" alt="thumbnail" className="w-full h-full object-contain rounded-sm" />
               ) : (
                   <TShirtIcon />
               )}
           </div>
       )
    }

    return (
        <div className="w-full h-full flex space-x-4" onMouseDown={(e) => e.stopPropagation()}>
            <input type="file" ref={outfitFileInputRef} onChange={handleOutfitFileChange} className="hidden" accept="image/*" multiple />
            
            {/* Main Content Area */}
            <div className="w-2/3 h-full flex flex-col space-y-3">
                <div className="flex-grow bg-gray-900 w-full rounded-md flex items-center justify-center border border-gray-700 relative overflow-hidden min-h-0">
                    {data.isLoading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    ) : data.mainImageUrl ? (
                        <img src={data.mainImageUrl} crossOrigin="anonymous" alt="VTON" className="w-full h-full object-contain" />
                    ) : (
                        <p className="text-gray-500 text-center">Connect or drag a base model image to start.</p>
                    )}
                </div>
                
                <div className="flex-shrink-0 bg-gray-900/50 p-2 rounded-lg">
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        {POSE_PRESETS.map(p => (
                            <button 
                                key={p} 
                                onClick={() => handlePoseChange(p)} 
                                className={`text-[10px] p-1.5 rounded-md transition-colors ${data.pose === p ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={data.pose} 
                            onChange={(e) => handlePoseChange(e.target.value)} 
                            placeholder="Or type a custom pose..." 
                            className="flex-grow bg-gray-800 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        />
                        <button 
                            onClick={() => handleGenerate()} 
                            disabled={data.isLoading} 
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md font-bold text-white disabled:bg-gray-600 transition-colors shadow-lg"
                        >
                            Generate
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Area */}
            <div 
                className="w-1/3 h-full bg-gray-900/50 rounded-lg p-3 flex flex-col space-y-4 outline-none focus:ring-1 focus:ring-indigo-500"
                onPaste={handlePaste}
                tabIndex={0}
            >
                {/* Base Model */}
                <div className="flex-shrink-0">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Base Model</h3>
                    <div 
                        className={`aspect-square w-20 rounded-lg bg-gray-800 border-2 ${data.selectedStylingId === 'base' ? 'border-indigo-500' : 'border-transparent'} overflow-hidden cursor-pointer shadow-md transition-all hover:scale-105`}
                        onClick={() => onDataChange(node.id, { selectedStylingId: 'base', mainImageUrl: data.baseModelUrl })}
                    >
                        {data.baseModelUrl ? <img src={data.baseModelUrl} crossOrigin="anonymous" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-500">No Image</div>}
                    </div>
                </div>

                {/* Styling List */}
                <div className="flex-grow flex flex-col min-h-0">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Styling History</h3>
                    <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-2 custom-scrollbar">
                        {data.stylingList.length === 0 && <p className="text-[10px] text-gray-600 italic">No styling generated yet.</p>}
                        {data.stylingList.map((item, index) => (
                            <div 
                                key={item.id}
                                className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all border ${data.selectedStylingId === item.id ? 'bg-indigo-600/30 border-indigo-500/50 shadow-sm' : 'hover:bg-gray-700/50 border-transparent'}`}
                                onClick={() => onDataChange(node.id, { selectedStylingId: item.id, mainImageUrl: item.url })}
                            >
                                <div className="w-4 h-4 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-400">{index + 1}</div>
                                <img src={item.url} crossOrigin="anonymous" className="w-10 h-10 object-cover rounded-md flex-shrink-0 border border-gray-700" />
                                <div className="flex-grow min-w-0">
                                    <p className="text-[9px] text-gray-300 truncate font-bold">{item.pose}</p>
                                    <p className="text-[8px] text-gray-500">Styling Result</p>
                                </div>
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); handleGenerate(item); }} title="Regenerate" className="p-0.5 text-gray-400 hover:text-indigo-400"><ArrowPathIcon className="w-3 h-3" /></button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        const newStylingList = data.stylingList.filter(s => s.id !== item.id);
                                        let newSelectedId = data.selectedStylingId;
                                        let newMainImage = data.mainImageUrl;
                                        if (data.selectedStylingId === item.id) {
                                            newSelectedId = 'base';
                                            newMainImage = data.baseModelUrl;
                                        }
                                        onDataChange(node.id, { stylingList: newStylingList, selectedStylingId: newSelectedId, mainImageUrl: newMainImage });
                                    }} title="Delete" className="p-0.5 text-gray-400 hover:text-red-500"><TrashIcon className="w-3 h-3" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Outfit List */}
                <div className="flex-shrink-0 flex flex-col min-h-[140px]">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Outfits</h3>
                        <button onClick={() => onDataChange(node.id, { outfitItems: [], selectedOutfitId: null })} className="text-[10px] text-gray-500 hover:text-red-400 transition-colors">Clear</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[120px] pr-1 custom-scrollbar">
                        {data.outfitItems.map(item => (
                            <div 
                                key={item.id} 
                                className={`relative group aspect-square cursor-pointer rounded-md overflow-hidden border-2 transition-all ${data.selectedOutfitId === item.id ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20' : 'border-transparent hover:border-gray-600'}`} 
                                onClick={() => onDataChange(node.id, { selectedOutfitId: item.id })}
                            >
                                <img src={item.url} crossOrigin="anonymous" className="w-full h-full object-cover" />
                                {data.selectedOutfitId === item.id && (
                                    <div className="absolute top-1 right-1">
                                        <CheckCircleIcon className="w-4 h-4 text-indigo-400 drop-shadow-md"/>
                                    </div>
                                )}
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const newOutfits = data.outfitItems.filter(o => o.id !== item.id);
                                        let newSelectedId = data.selectedOutfitId;
                                        if (data.selectedOutfitId === item.id) {
                                            newSelectedId = null;
                                        }
                                        onDataChange(node.id, { outfitItems: newOutfits, selectedOutfitId: newSelectedId });
                                    }}
                                    className="absolute bottom-0 right-0 p-1 bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all rounded-tl-md"
                                >
                                    <TrashIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        ))}
                        <div 
                            className="aspect-square rounded-md border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-gray-600 hover:border-indigo-500 hover:text-indigo-400 cursor-pointer transition-all bg-gray-800/30 hover:bg-gray-800"
                            onClick={() => outfitFileInputRef.current?.click()}
                            onDrop={handleOutfitDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <ArrowUpTrayIcon className="w-4 h-4" />
                            <span className="text-[8px] mt-1 font-bold">ADD</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VtonNode;