import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Node, NodeType, TextNodeData, ImageLoadNodeData, ImageNodeData, VideoNodeData, AssistantNodeData, ScriptNodeData, VtonNodeData, ImageEditNodeData, ModelNodeData, PresetNodeData, GroupNodeData, CameraNodeData, CameraControlData, StoryboardNodeData, VtonOutfitItem, VtonStylingItem, HistoryAsset, OutfitDetailNodeData } from '../types';
import { XMarkIcon, PlayIcon, ArrowPathIcon, ChevronDownIcon, ChevronRightIcon, AdjustmentsHorizontalIcon, ArrowUpTrayIcon, TrashIcon, CheckCircleIcon, ArrowDownTrayIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { PhotoIcon, FilmIcon, ChatBubbleLeftRightIcon, ExclamationCircleIcon, UserCircleIcon, ClipboardDocumentListIcon, CameraIcon, ShoppingBagIcon, UserPlusIcon, GlobeAltIcon, PlusCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { PRESET_LIBRARY } from '../data/presets';
import { MODEL_NATIONALITIES, MODEL_FACE_SHAPES, MODEL_HAIR_STYLES, MODEL_HAIR_COLORS, POSE_PRESETS } from '../data/constants';
import { generateVtonImage, analyzeProductInfo, captureImagesFromUrl, extractFramesFromVideo, generateFinalPrompt, constructPromptFromShot, generateConsistentImage, generateImage, preprocessImageForOutpainting } from '../services/geminiService';
import { SCRIPT_STYLES, CATEGORY_STYLES } from '../data/scriptStyles';

interface PlaygroundModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: Record<string, Node>;
    onDataChange: (id: string, data: any) => void;
    onRun: () => void;
    onGenerateSingle: (nodeId: string) => void;
    isGenerating: boolean;
}

interface GroupBucket {
    id: string;
    title: string;
    inputs: Node[];
    outputs: Node[];
}

const isNodeInsideGroup = (node: Node, group: Node): boolean => {
    return (
        node.position.x >= group.position.x &&
        node.position.y >= group.position.y &&
        node.position.x + node.size.width <= group.position.x + group.size.width &&
        node.position.y + node.size.height <= group.position.y + group.size.height
    );
};

const PlaygroundModal: React.FC<PlaygroundModalProps> = ({ isOpen, onClose, nodes, onDataChange, onRun, onGenerateSingle, isGenerating }) => {
    if (!isOpen) return null;

    // Categorize nodes into Groups
    const groupedNodes = useMemo(() => {
        const nodeList = (Object.values(nodes) as Node[]).filter(n => !n.hidden);
        const groupNodes = nodeList.filter(n => n.type === NodeType.Group);
        
        // Initialize buckets for each group
        const buckets: Record<string, GroupBucket> = {};
        
        // Create bucket for Ungrouped
        buckets['ungrouped'] = { id: 'ungrouped', title: 'Ungrouped', inputs: [], outputs: [] };

        // Create buckets for actual groups
        groupNodes.forEach(g => {
            buckets[g.id] = { 
                id: g.id, 
                title: (g.data as GroupNodeData).title || 'Group', 
                inputs: [], 
                outputs: [] 
            };
        });

        // Distribute nodes
        nodeList.forEach(node => {
            if (node.type === NodeType.Group) return; // Skip group nodes themselves

            let assignedGroupId = 'ungrouped';
            
            // Check if node belongs to any group
            for (const g of groupNodes) {
                if (isNodeInsideGroup(node, g)) {
                    assignedGroupId = g.id;
                    break; 
                }
            }

            const targetBucket = buckets[assignedGroupId];
            
            // Classify as Input or Output for Playground display
            if (node.type === NodeType.Text || node.type === NodeType.ImageLoad || node.type === NodeType.Preset || node.type === NodeType.Camera) {
                targetBucket.inputs.push(node);
            } else if ([
                NodeType.Image, NodeType.ImagePreview, NodeType.Video, NodeType.Assistant, 
                NodeType.Script, NodeType.Vton, NodeType.ImageEdit, NodeType.Model, 
                NodeType.Composite, NodeType.Stitch, NodeType.RMBG, NodeType.Storyboard,
                NodeType.OutfitDetail
            ].includes(node.type)) {
                targetBucket.outputs.push(node);
            }
        });

        // Sort nodes within buckets by position
        Object.values(buckets).forEach(bucket => {
            bucket.inputs.sort((a, b) => a.position.y - b.position.y);
            bucket.outputs.sort((a, b) => a.position.y - b.position.y);
        });

        // Convert to array and sort groups based on Numeric Prefix then Title
        return Object.values(buckets)
            .filter(b => b.inputs.length > 0 || b.outputs.length > 0) // Only show groups with content
            .sort((a, b) => {
                if (a.id === 'ungrouped') return 1; // Ungrouped always last
                if (b.id === 'ungrouped') return -1;

                const getOrder = (title: string) => {
                    const match = title.match(/^(\d+)[.)]/); // Matches "1.", "2)", etc.
                    return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
                };

                const orderA = getOrder(a.title);
                const orderB = getOrder(b.title);

                if (orderA !== orderB) return orderA - orderB;
                return a.title.localeCompare(b.title);
            });

    }, [nodes]);

    return (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-900 z-40 flex flex-col overflow-hidden animate-fade-in border-l border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                        <PlayIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Playground Runner</h1>
                        <p className="text-xs text-gray-400">Simplified Workflow Interface</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onRun}
                        disabled={isGenerating}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <PlayIcon className="w-5 h-5" />
                                Run Workflow
                            </>
                        )}
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white">
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                </div>
            </div>

            {/* Main Content - Single Scroll Container */}
            <div className="flex-grow overflow-y-auto custom-scrollbar bg-gray-900 scroll-smooth pb-20">
                {groupedNodes.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                        <PlayIcon className="w-16 h-16 mb-4" />
                        <p>No nodes found. Add nodes to the canvas to start.</p>
                    </div>
                )}

                {groupedNodes.map(group => (
                    <div key={group.id} className="border-b-8 border-gray-900 shadow-md">
                        {/* Sticky Group Header */}
                        <div className="sticky top-0 z-30 bg-gray-800/95 backdrop-blur px-6 py-3 shadow-lg flex items-center border-b border-gray-700/50">
                            {group.id !== 'ungrouped' && <span className="text-blue-400 font-bold mr-3 text-xl opacity-80">#</span>}
                            <h2 className="text-lg font-bold text-gray-100">{group.title}</h2>
                        </div>

                        <div className="flex min-h-[150px] relative bg-gray-800/20">
                            {/* Inputs Column */}
                            <div className="w-5/12 border-r border-gray-700/50 p-6 flex flex-col gap-6 bg-gray-800/30">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2 sticky top-14 z-10">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Inputs
                                </h3>
                                {group.inputs.length === 0 ? (
                                    <p className="text-gray-600 text-xs italic p-4 text-center">No inputs in this group.</p>
                                ) : (
                                    group.inputs.map(node => (
                                        <div key={node.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm hover:border-indigo-500/50 transition-colors">
                                            <div className="flex justify-between items-center mb-4 border-b border-gray-700/50 pb-2">
                                                <span className={`text-xs font-bold text-white px-2 py-1 rounded-md flex items-center gap-2 ${
                                                    node.type === NodeType.Text ? 'bg-sky-600' : 
                                                    node.type === NodeType.Preset ? 'bg-purple-600' : 
                                                    node.type === NodeType.Camera ? 'bg-amber-600' :
                                                    'bg-fuchsia-600'
                                                }`}>
                                                    {node.type === NodeType.Text ? 'Text' : 
                                                     node.type === NodeType.Preset ? 'Preset' : 
                                                     node.type === NodeType.Camera ? <><CameraIcon className="w-3 h-3"/> Camera</> : 
                                                     'Image'}
                                                </span>
                                            </div>

                                            {node.type === NodeType.Text && (
                                                <textarea
                                                    value={(node.data as TextNodeData).text}
                                                    onChange={(e) => onDataChange(node.id, { text: e.target.value })}
                                                    className="w-full h-40 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
                                                    placeholder="Enter text prompt here..."
                                                />
                                            )}

                                            {node.type === NodeType.ImageLoad && (
                                                <div className="h-64">
                                                    <ImageInputAdapter node={node} onDataChange={onDataChange} />
                                                </div>
                                            )}

                                            {node.type === NodeType.Preset && (
                                                <PlaygroundPresetAdapter node={node} onDataChange={onDataChange} />
                                            )}

                                            {node.type === NodeType.Camera && (
                                                <CameraInputAdapter node={node} onDataChange={onDataChange} />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Outputs Column */}
                            <div className="w-7/12 p-6 flex flex-col gap-6 bg-transparent">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2 sticky top-14 z-10">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Outputs
                                </h3>
                                {group.outputs.length === 0 ? (
                                    <p className="text-gray-600 text-xs italic p-4 text-center">No outputs in this group.</p>
                                ) : (
                                    group.outputs.map(node => (
                                        <div key={node.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg flex flex-col">
                                            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    {node.type === NodeType.Video ? <FilmIcon className="w-4 h-4 text-amber-500" /> : 
                                                    node.type === NodeType.Assistant ? <ChatBubbleLeftRightIcon className="w-4 h-4 text-sky-500" /> : 
                                                    node.type === NodeType.Script ? <ClipboardDocumentListIcon className="w-4 h-4 text-green-500" /> :
                                                    node.type === NodeType.Model ? <UserCircleIcon className="w-4 h-4 text-pink-500" /> :
                                                    node.type === NodeType.Vton ? <UserCircleIcon className="w-4 h-4 text-indigo-400" /> :
                                                    node.type === NodeType.OutfitDetail ? <SparklesIcon className="w-4 h-4 text-indigo-400" /> :
                                                    <PhotoIcon className="w-4 h-4 text-fuchsia-500" />}
                                                    <h3 className="font-bold text-white text-sm">{node.type} Result</h3>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {(node.data as any).isLoading && (
                                                        <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
                                                            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                                            Generating...
                                                        </div>
                                                    )}
                                                    {node.type !== NodeType.Vton && node.type !== NodeType.Script && (
                                                        <button
                                                            onClick={() => onGenerateSingle(node.id)}
                                                            disabled={(node.data as any).isLoading || isGenerating}
                                                            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed shadow-sm"
                                                            title="Run this node"
                                                        >
                                                            <PlayIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gray-900/50 flex-grow flex flex-col relative gap-3">
                                                <OutputResultRenderer 
                                                    node={node} 
                                                    onDataChange={onDataChange} 
                                                    onGenerateSingle={onGenerateSingle}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ... [Existing Input Adapters: Camera, Preset, ImageLoad] ...
// --- Camera Input Adapter ---
const CameraInputAdapter: React.FC<{ node: Node, onDataChange: (id: string, data: any) => void }> = ({ node, onDataChange }) => {
    const data = node.data as CameraNodeData;
    const controls = data.controls;

    const generateCameraPrompt = (c: CameraControlData): string => {
        const parts: string[] = [];
        if (c.rotation !== 0) parts.push(`Rotate ${Math.abs(c.rotation)}° ${c.rotation > 0 ? 'right' : 'left'}.`);
        if (c.zoom > 0) parts.push(`Zoom level ${c.zoom}/10.`);
        if (c.verticalAngle !== 0) parts.push(`${c.verticalAngle > 0 ? 'Bird\'s-eye' : 'Worm\'s-eye'} view (${Math.abs(c.verticalAngle)}/10).`);
        if (c.wideAngle) parts.push('Wide-angle lens.');
        return parts.join(' ');
    };

    const updateControl = (field: keyof CameraControlData, value: number | boolean) => {
        const newControls = { ...controls, [field]: value };
        onDataChange(node.id, { controls: newControls, text: generateCameraPrompt(newControls) });
    };

    return (
        <div className="flex flex-col gap-4 text-sm">
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Rotation</span>
                    <span>{controls.rotation}°</span>
                </div>
                <input 
                    type="range" min="-90" max="90" step="15" value={controls.rotation} 
                    onChange={(e) => updateControl('rotation', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Zoom</span>
                    <span>{controls.zoom}</span>
                </div>
                <input 
                    type="range" min="0" max="10" step="1" value={controls.zoom} 
                    onChange={(e) => updateControl('zoom', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Vertical Angle</span>
                    <span>{controls.verticalAngle}</span>
                </div>
                <input 
                    type="range" min="-10" max="10" step="1" value={controls.verticalAngle} 
                    onChange={(e) => updateControl('verticalAngle', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" checked={controls.wideAngle} 
                    onChange={(e) => updateControl('wideAngle', e.target.checked)}
                    className="w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 rounded focus:ring-amber-500"
                />
                <span className="text-gray-300 text-xs">Wide Angle Lens</span>
            </div>
            <div className="p-2 bg-black/30 rounded border border-gray-700 text-xs font-mono text-gray-400 h-16 overflow-y-auto">
                {data.text || "No camera effects applied."}
            </div>
        </div>
    );
};

// --- Preset Input Adapter ---
const PlaygroundPresetAdapter: React.FC<{ node: Node, onDataChange: (id: string, data: any) => void }> = ({ node, onDataChange }) => {
    const data = node.data as PresetNodeData;
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleCat = (cat: string) => setExpanded(prev => ({...prev, [cat]: !prev[cat]}));

    const togglePreset = (preset: { name: string, prompt: string }) => {
        const isSelected = data.selectedPrompts.includes(preset.prompt);
        let newPrompts;
        if (isSelected) {
            newPrompts = data.selectedPrompts.filter(p => p !== preset.prompt);
        } else {
            newPrompts = [...data.selectedPrompts, preset.prompt];
        }
        onDataChange(node.id, { selectedPrompts: newPrompts, text: newPrompts.join(', ') });
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-wrap gap-1 mb-2 min-h-[24px]">
                {data.selectedPrompts.length === 0 && <span className="text-xs text-gray-500 italic">Select presets from categories below.</span>}
                {data.selectedPrompts.map((p, i) => (
                    <span key={i} className="text-[10px] bg-purple-900/50 text-purple-200 px-2 py-1 rounded-full border border-purple-700/50 truncate max-w-full">
                        {PRESET_LIBRARY.flatMap(c => c.presets).find(libP => libP.prompt === p)?.name || 'Unknown'}
                    </span>
                ))}
            </div>
            
            {PRESET_LIBRARY.map(cat => (
                <div key={cat.name} className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900/30">
                    <button 
                        onClick={() => toggleCat(cat.name)}
                        className="w-full flex items-center justify-between p-3 text-xs font-bold text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                        {cat.name}
                        {expanded[cat.name] ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
                    </button>
                    {expanded[cat.name] && (
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-900/50 border-t border-gray-700">
                            {cat.presets.map(preset => {
                                const active = data.selectedPrompts.includes(preset.prompt);
                                return (
                                    <button 
                                        key={preset.name}
                                        onClick={() => togglePreset(preset)}
                                        className={`text-[10px] px-2 py-2 rounded text-left transition-colors truncate border ${
                                            active 
                                            ? 'bg-purple-600 text-white border-purple-500 shadow-md' 
                                            : 'bg-gray-800 text-gray-400 border-transparent hover:bg-gray-700 hover:text-white hover:border-gray-600'
                                        }`}
                                        title={preset.name}
                                    >
                                        {preset.name}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// --- Image Input Adapter ---
const ImageInputAdapter: React.FC<{ node: Node, onDataChange: (id: string, data: any) => void }> = ({ node, onDataChange }) => {
    const data = node.data as ImageLoadNodeData;
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const images = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    onDataChange(node.id, { imageUrls: [...images, e.target.result as string] });
                }
            };
            reader.readAsDataURL(file as Blob);
        });
    };

    return (
        <div className="w-full h-full flex flex-col gap-2">
            <div 
                className="flex-grow bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-gray-800 transition-colors p-4"
                onClick={() => fileInputRef.current?.click()}
            >
                {images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 w-full h-full overflow-y-auto pr-1 custom-scrollbar">
                        {images.map((url, i) => (
                            <img key={i} src={url} className="w-full aspect-square object-cover rounded-md border border-gray-700" />
                        ))}
                        <div className="flex flex-col items-center justify-center bg-gray-800 rounded-md aspect-square border border-gray-700 text-gray-500">
                            <span className="text-2xl">+</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <PhotoIcon className="w-10 h-10 mx-auto mb-2" />
                        <span className="text-xs font-semibold">Click to Upload Images</span>
                    </div>
                )}
            </div>
            <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} className="hidden" multiple accept="image/*" />
        </div>
    );
}

// --- V-TON Adapter ---
const PlaygroundVtonAdapter: React.FC<{ node: Node, onDataChange: (id: string, data: any) => void }> = ({ node, onDataChange }) => {
    const data = node.data as VtonNodeData;
    const outfitFileInputRef = useRef<HTMLInputElement>(null);

    const handleOutfitFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newOutfitItems = [...data.outfitItems];
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if(ev.target?.result) {
                        newOutfitItems.push({ id: `outfit-${Date.now()}-${Math.random()}`, url: ev.target.result as string });
                        onDataChange(node.id, { outfitItems: newOutfitItems });
                    }
                };
                reader.readAsDataURL(file as Blob);
            });
        }
    };

    const handleGenerate = async (regenItem?: VtonStylingItem) => {
        let sourceImageUrl = data.selectedStylingId === 'base' ? data.baseModelUrl : data.stylingList.find(s => s.id === data.selectedStylingId)?.url || data.baseModelUrl;
        const outfitForGeneration = data.outfitItems.find(o => o.id === data.selectedOutfitId);
        
        if (regenItem) {
            sourceImageUrl = regenItem.sourceImageUrl;
        }

        if (!sourceImageUrl || !outfitForGeneration || !data.pose) {
            alert('Please provide a Base Model, select an Outfit, and choose a Pose.');
            return;
        }

        onDataChange(node.id, { isLoading: true });
        const result = await generateVtonImage(sourceImageUrl, outfitForGeneration.url, data.pose);
        
        if (result) {
            if (regenItem) {
                 const updatedStylingList = data.stylingList.map(item => item.id === regenItem.id ? { ...item, url: result, pose: data.pose } : item);
                 onDataChange(node.id, { isLoading: false, mainImageUrl: result, stylingList: updatedStylingList, selectedStylingId: regenItem.id, outputImageUrl: result });
            } else {
                const newItem: VtonStylingItem = {
                    id: `styling-${Date.now()}`,
                    url: result,
                    outfitId: outfitForGeneration.id,
                    pose: data.pose,
                    sourceImageUrl: sourceImageUrl!,
                };
                onDataChange(node.id, { isLoading: false, mainImageUrl: result, stylingList: [...data.stylingList, newItem], selectedStylingId: newItem.id, outputImageUrl: result });
            }
        } else {
            onDataChange(node.id, { isLoading: false });
        }
    };

    return (
        <div className="flex gap-4 h-[500px]">
            {/* Main Content */}
            <div className="w-2/3 flex flex-col space-y-3">
                <div className="flex-grow bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 relative overflow-hidden">
                    {data.isLoading ? <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div> :
                    data.mainImageUrl ? <img src={data.mainImageUrl} className="w-full h-full object-contain" /> :
                    <p className="text-gray-500 text-sm">Select a base model or styling</p>}
                </div>
                <div className="flex-shrink-0 bg-gray-800/50 p-3 rounded-lg flex items-center gap-3">
                    <select value={data.pose} onChange={(e) => onDataChange(node.id, { pose: e.target.value })} className="flex-grow bg-gray-900 border border-gray-600 rounded text-sm p-2 text-white">
                        {POSE_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button onClick={() => handleGenerate()} disabled={data.isLoading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-bold text-white text-sm">Generate V-TON</button>
                </div>
            </div>
            
            {/* Sidebar */}
            <div className="w-1/3 bg-gray-800/50 rounded-lg p-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                {/* Base Model */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-2">Base Model</h3>
                    <div onClick={() => onDataChange(node.id, { selectedStylingId: 'base', mainImageUrl: data.baseModelUrl })} className={`aspect-square w-20 rounded-lg bg-gray-700 cursor-pointer overflow-hidden border-2 ${data.selectedStylingId === 'base' ? 'border-indigo-500' : 'border-transparent'}`}>
                        {data.baseModelUrl && <img src={data.baseModelUrl} className="w-full h-full object-cover" />}
                    </div>
                </div>
                {/* Outfit List */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-gray-400">Outfits</h3>
                        <button onClick={() => outfitFileInputRef.current?.click()} className="text-xs text-indigo-400 hover:text-indigo-300">Upload</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {data.outfitItems.map(item => (
                            <div key={item.id} onClick={() => onDataChange(node.id, { selectedOutfitId: item.id })} className="relative aspect-square cursor-pointer">
                                <img src={item.url} className={`w-full h-full object-cover rounded-md border-2 ${data.selectedOutfitId === item.id ? 'border-indigo-500' : 'border-gray-600'}`} />
                            </div>
                        ))}
                    </div>
                    <input type="file" ref={outfitFileInputRef} onChange={handleOutfitFileChange} className="hidden" accept="image/*" multiple />
                </div>
                {/* Styling List */}
                <div className="flex-grow">
                    <h3 className="text-xs font-bold text-gray-400 mb-2">History</h3>
                    <div className="space-y-2">
                        {data.stylingList.map(item => (
                            <div key={item.id} onClick={() => onDataChange(node.id, { selectedStylingId: item.id, mainImageUrl: item.url })} className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer ${data.selectedStylingId === item.id ? 'bg-indigo-600/30' : 'hover:bg-gray-700'}`}>
                                <img src={item.url} className="w-8 h-8 object-cover rounded" />
                                <span className="text-[10px] text-gray-400 flex-grow truncate">{item.pose}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Script Adapter ---
const PlaygroundScriptAdapter: React.FC<{ node: Node, onDataChange: (id: string, data: any) => void, onGenerate: () => void }> = ({ node, onDataChange, onGenerate }) => {
    const data = node.data as ScriptNodeData;
    const videoInputRef = useRef<HTMLInputElement>(null);
    const productInputRef = useRef<HTMLInputElement>(null);
    const modelInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'model') => {
        if(e.target.files) {
            const newImages = Array.from(e.target.files).map(f => ({ id: `img-${Date.now()}-${Math.random()}`, url: URL.createObjectURL(f as Blob) }));
            if(type === 'product') onDataChange(node.id, { productImages: [...(data.productImages || []), ...newImages] }); // Safe spread
            else onDataChange(node.id, { modelImages: [...(data.modelImages || []), ...newImages] }); // Safe spread
        }
    };

    const handleImageDeleted = (id: string, type: 'product' | 'model') => {
        if (type === 'product') {
            onDataChange(node.id, { productImages: (data.productImages || []).filter(img => img.id !== id) });
        } else {
            onDataChange(node.id, { modelImages: (data.modelImages || []).filter(img => img.id !== id) });
        }
    };

    const handleAnalyzeInput = async () => {
        const input = data.url?.trim() || '';
        if (input.startsWith('http') && !input.match(/\.(mp4|webm|mov)$/i)) {
            onDataChange(node.id, { isCapturing: true, loadingMessage: 'Capturing images from URL...' });
            try {
                const captured = await captureImagesFromUrl(input);
                onDataChange(node.id, { capturedImages: captured || [], isCapturing: false });
            } catch (error) {
                console.error("Image capture failed:", error);
                onDataChange(node.id, { isCapturing: false, loadingMessage: 'Capture failed' });
            }
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onDataChange(node.id, { loadingMessage: 'Extracting frames...', isCapturing: true });
        try {
            const frames = await extractFramesFromVideo(file, 5);
            onDataChange(node.id, { videoFrames: frames, isCapturing: false });
        } catch (error) {
            console.error(error);
            onDataChange(node.id, { isCapturing: false });
        }
    };

    const addImageToCategory = (imageUrl: string, category: 'product' | 'model') => {
        const newImage = { id: `img-${Date.now()}-${Math.random()}`, url: imageUrl };
        if (category === 'product') {
            if (!(data.productImages || []).some(p => p.url === imageUrl)) {
                onDataChange(node.id, { productImages: [...(data.productImages || []), newImage] });
            }
        } else {
             if (!(data.modelImages || []).some(p => p.url === imageUrl)) {
                onDataChange(node.id, { modelImages: [...(data.modelImages || []), newImage] });
            }
        }
    };

    const handleAnalyze = async () => {
        onDataChange(node.id, { isLoading: true, loadingMessage: 'Analyzing Product...' });
        const input = {
            url: data.url && data.url.startsWith('http') ? data.url : undefined,
            text: data.description,
            videoFrames: data.videoFrames,
            images: [...(data.productImages || []).map(i => i.url), ...(data.modelImages || []).map(i => i.url)]
        };
        try {
            const result = await analyzeProductInfo(input);
            if(result) {
                onDataChange(node.id, { 
                    isLoading: false, 
                    isAnalyzed: true, 
                    sceneConcepts: result.sceneConcepts, 
                    scriptData: { 
                        ...(data.scriptData || {}),
                        productName: result.productName, 
                        category: result.category, 
                        concept: result.concept 
                    } 
                });
            } else onDataChange(node.id, { isLoading: false });
        } catch(e) { console.error(e); onDataChange(node.id, { isLoading: false }); }
    };

    const handleGenerateStoryboard = () => onGenerate();

    return (
        <div className="flex flex-col gap-4 text-white h-[650px] overflow-y-auto custom-scrollbar pr-2 pb-10">
            {/* 1. Category */}
            <div className="bg-gray-800 p-3 rounded-lg space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">1. Category & Info</label>
                <select value={data.productCategory || ''} onChange={(e) => onDataChange(node.id, { productCategory: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded text-xs p-2 text-white">
                    <option value="">Select Category</option>
                    {Object.keys(CATEGORY_STYLES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {data.productCategory && <p className="text-[9px] text-gray-500">{CATEGORY_STYLES[data.productCategory]}</p>}
            </div>

            {/* 2. URL & Description & Fetch */}
            <div className="grid grid-cols-2 gap-3 bg-gray-800 p-3 rounded-lg">
                <div className="space-y-2 flex flex-col">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><GlobeAltIcon className="w-3 h-3"/> 2. URL & Desc</label>
                    <input type="text" value={data.url} onChange={(e) => onDataChange(node.id, { url: e.target.value })} placeholder="Product URL" className="w-full bg-gray-900 border border-gray-700 rounded text-xs p-2" />
                    <textarea value={data.description} onChange={(e) => onDataChange(node.id, { description: e.target.value })} placeholder="Description" rows={3} className="w-full bg-gray-900 border border-gray-700 rounded text-xs p-2 resize-none flex-grow" />
                    <button onClick={handleAnalyzeInput} disabled={data.isCapturing || !data.url?.trim()} className="w-full py-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-emerald-400 text-xs font-bold rounded">
                        {data.isCapturing && !data.videoFrames ? '...' : 'Fetch Info (URL)'}
                    </button>
                </div>
                <div className="space-y-2 flex flex-col">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><FilmIcon className="w-3 h-3"/> Video Ref</label>
                    <div 
                        className="flex-grow bg-gray-900 border border-dashed border-gray-600 rounded flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 relative overflow-hidden min-h-[100px]"
                        onClick={() => videoInputRef.current?.click()}
                    >
                        {data.videoFrames && data.videoFrames.length > 0 ? (
                            <>
                                <img src={data.videoFrames[0]} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                <span className="relative z-10 bg-black/50 px-2 py-1 rounded text-[10px] text-white font-bold">Change MP4</span>
                            </>
                        ) : (
                            <div className="text-center text-gray-500">
                                <ArrowUpTrayIcon className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-[10px]">Upload MP4</span>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={videoInputRef} onChange={handleVideoUpload} className="hidden" accept="video/*" />
                </div>
            </div>

            {/* 3. Detected Assets */}
            {(data.capturedImages.length > 0 || (data.videoFrames && data.videoFrames.length > 0)) && (
                <div className="bg-gray-800 p-2 rounded-lg border border-gray-700">
                    <p className="text-[9px] text-gray-500 mb-1 uppercase font-bold tracking-wide">Detected Assets</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {[...data.capturedImages, ...(data.videoFrames || []).map((f,i) => ({id:`vf-${i}`, url:f}))].map(img => (
                             <div key={img.id} className="relative group flex-shrink-0 w-12 h-12 cursor-pointer hover:ring-1 hover:ring-indigo-500 rounded overflow-hidden">
                                <img src={img.url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                    <button onClick={() => addImageToCategory(img.url, 'product')} className="p-0.5 bg-emerald-600 rounded-full text-white"><ShoppingBagIcon className="w-3 h-3" /></button>
                                    <button onClick={() => addImageToCategory(img.url, 'model')} className="p-0.5 bg-purple-600 rounded-full text-white"><UserPlusIcon className="w-3 h-3" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. Reference Images Upload */}
            <div className="grid grid-cols-2 gap-3 bg-gray-800 p-3 rounded-lg">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">3. Product</label>
                        <button onClick={() => productInputRef.current?.click()} className="text-[10px] text-indigo-400 hover:text-indigo-300">Upload</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {(data.productImages || []).map(img => (
                            <div key={img.id} className="relative group aspect-square">
                                <img src={img.url} className="w-full h-full object-cover rounded border border-gray-600" />
                                <button onClick={() => handleImageDeleted(img.id, 'product')} className="absolute top-0 right-0 p-0.5 bg-black/50 rounded-bl text-white opacity-0 group-hover:opacity-100 hover:bg-red-500"><TrashIcon className="w-3 h-3" /></button>
                            </div>
                        ))}
                        <div onClick={() => productInputRef.current?.click()} className="aspect-square rounded border border-dashed border-gray-600 flex items-center justify-center hover:border-indigo-500 cursor-pointer text-gray-500"><PlusCircleIcon className="w-5 h-5"/></div>
                    </div>
                    <input type="file" ref={productInputRef} onChange={(e) => handleImageUpload(e, 'product')} className="hidden" multiple />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Model</label>
                        <button onClick={() => modelInputRef.current?.click()} className="text-[10px] text-indigo-400 hover:text-indigo-300">Upload</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {(data.modelImages || []).map(img => (
                            <div key={img.id} className="relative group aspect-square">
                                <img src={img.url} className="w-full h-full object-cover rounded border border-gray-600" />
                                <button onClick={() => handleImageDeleted(img.id, 'model')} className="absolute top-0 right-0 p-0.5 bg-black/50 rounded-bl text-white opacity-0 group-hover:opacity-100 hover:bg-red-500"><TrashIcon className="w-3 h-3" /></button>
                            </div>
                        ))}
                        <div onClick={() => modelInputRef.current?.click()} className="aspect-square rounded border border-dashed border-gray-600 flex items-center justify-center hover:border-indigo-500 cursor-pointer text-gray-500"><PlusCircleIcon className="w-5 h-5"/></div>
                    </div>
                    <input type="file" ref={modelInputRef} onChange={(e) => handleImageUpload(e, 'model')} className="hidden" multiple />
                </div>
            </div>

            {/* 5. Analyze Button */}
            <button onClick={handleAnalyze} disabled={data.isLoading} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold shadow uppercase tracking-wide disabled:bg-gray-700 disabled:text-gray-500">
                {data.isLoading && !data.isAnalyzed ? 'Analyzing...' : '4. Analyze Product Info'}
            </button>

            {/* New: Analysis Result Display */}
            {data.isAnalyzed && data.scriptData && (
                <div className="bg-gray-900/80 p-3 rounded-xl border border-emerald-500/30 shadow-lg animate-fade-in mt-2">
                    <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3" /> Analysis Result
                    </h3>
                    <div className="space-y-1 text-[11px]">
                        <p className="flex gap-2">
                            <span className="font-bold text-emerald-400 whitespace-nowrap">Product:</span>
                            <span className="text-gray-200">{data.scriptData.productName}</span>
                        </p>
                        <p className="flex gap-2">
                            <span className="font-bold text-emerald-400 whitespace-nowrap">Concept:</span>
                            <span className="text-gray-200">{data.scriptData.concept}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* 6. Settings (Aspect Ratio, Duration, Style) */}
            <div className={`bg-gray-800 p-3 rounded-lg space-y-3 transition-opacity ${!data.isAnalyzed ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                <h3 className="text-xs font-bold text-gray-300 uppercase border-b border-gray-700 pb-1">5. Script Settings</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Aspect Ratio</label>
                        <div className="flex bg-gray-900 rounded p-0.5">
                            {['16:9', '9:16'].map(r => (
                                <button key={r} onClick={() => onDataChange(node.id, { aspectRatio: r })} className={`flex-1 text-[10px] py-1 rounded ${data.aspectRatio === r ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>{r}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Duration</label>
                        <select value={data.videoDuration} onChange={(e) => onDataChange(node.id, { videoDuration: e.target.value })} className="w-full bg-gray-900 border-none rounded text-xs p-1 text-white h-[26px]">
                            <option value="15s">15s</option><option value="30s">30s</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Script Style</label>
                    <select value={data.selectedScriptStyle} onChange={(e) => onDataChange(node.id, { selectedScriptStyle: e.target.value })} className="w-full bg-gray-900 border-none rounded text-xs p-1.5 text-white">
                        {Object.entries(SCRIPT_STYLES).map(([cat, styles]) => (
                            <optgroup key={cat} label={cat}>
                                {Object.entries(styles).map(([id, name]) => <option key={id} value={id}>{id}: {name}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <button onClick={handleGenerateStoryboard} disabled={data.isLoading} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold shadow uppercase tracking-wide disabled:bg-gray-700 disabled:text-gray-500">
                    {data.isLoading ? 'Generating...' : '6. Generate Storyboard'}
                </button>
            </div>

            {/* 7. Results (Shot List) */}
            {data.scriptData?.shotList && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-300 border-b border-gray-700 pb-2">Storyboard Shots</h3>
                    {data.scriptData.shotList.map((shot, i) => (
                        <div key={shot.id} className="flex gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
                            <div className="w-24 aspect-video bg-black rounded overflow-hidden flex-shrink-0 relative">
                                {shot.imageUrl ? <img src={shot.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">Generating...</div>}
                                <div className="absolute top-0 left-0 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-br">{i+1}</div>
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs font-bold text-indigo-300 truncate">{shot.title}</span>
                                    <span className="text-[9px] text-gray-500 bg-gray-900 px-1 rounded">{shot.time}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 line-clamp-2">{shot.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Renderer for different output types ---
const OutputResultRenderer: React.FC<{ node: Node, onDataChange: (id: string, data: any) => void, onGenerateSingle: (id: string) => void }> = ({ node, onDataChange, onGenerateSingle }) => {
    const loadingMessage = (node.data as any).loadingMessage;

    if (node.type === NodeType.Vton) {
        return <PlaygroundVtonAdapter node={node} onDataChange={onDataChange} />;
    }

    if (node.type === NodeType.Script) {
        return <PlaygroundScriptAdapter node={node} onDataChange={onDataChange} onGenerate={() => onGenerateSingle(node.id)} />;
    }

    // --- Assistant Node (Result + Input Control) ---
    if (node.type === NodeType.Assistant) {
        const data = node.data as AssistantNodeData;
        return (
            <div className="w-full flex flex-col gap-3 h-full">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Input Prompt</label>
                    <textarea 
                        value={data.prompt}
                        onChange={(e) => onDataChange(node.id, { prompt: e.target.value })}
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                        rows={3}
                        placeholder="Enter instruction for assistant..."
                    />
                </div>
                <div className="flex flex-col gap-1 flex-grow min-h-0">
                    <label className="text-xs font-bold text-gray-500 uppercase">Response</label>
                    <div className="w-full h-full min-h-[200px] bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-y-auto text-sm text-gray-300 whitespace-pre-wrap font-mono custom-scrollbar">
                        {data.response || "No response generated yet."}
                    </div>
                </div>
            </div>
        );
    }

    // --- Model Node (Settings + Result) ---
    if (node.type === NodeType.Model) {
        const data = node.data as ModelNodeData;
        return (
            <div className="flex flex-col md:flex-row gap-4 h-full">
                {/* Settings Panel */}
                <div className="w-full md:w-1/3 bg-black/20 p-3 rounded-lg border border-gray-700 space-y-3">
                    <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wide flex items-center gap-2"><AdjustmentsHorizontalIcon className="w-4 h-4"/> Settings</h4>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                        <div>
                            <label className="text-[10px] text-gray-500 block">Gender</label>
                            <select value={data.gender} onChange={(e) => onDataChange(node.id, { gender: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded text-xs p-1.5 text-white">
                                <option value="Woman">Woman</option><option value="Man">Man</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 block">Age</label>
                            <input type="number" value={data.age} onChange={(e) => onDataChange(node.id, { age: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded text-xs p-1.5 text-white"/>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 block">Nationality</label>
                            <select value={data.nationality} onChange={(e) => onDataChange(node.id, { nationality: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded text-xs p-1.5 text-white">
                                {MODEL_NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 block">Face</label>
                            <select value={data.faceShape} onChange={(e) => onDataChange(node.id, { faceShape: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded text-xs p-1.5 text-white">
                                {MODEL_FACE_SHAPES.slice(0,10).map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="text-[10px] text-gray-500 block">Hair</label>
                            <select value={data.hairStyle} onChange={(e) => onDataChange(node.id, { hairStyle: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded text-xs p-1.5 text-white">
                                {MODEL_HAIR_STYLES.slice(0,10).map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                {/* Result Image */}
                <div className="flex-grow flex items-center justify-center bg-black/40 rounded-lg min-h-[300px]">
                    {data.outputImageUrl ? (
                        <img src={data.outputImageUrl} className="max-h-[400px] w-auto rounded shadow-lg object-contain" />
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center">
                            <UserCircleIcon className="w-12 h-12 mb-2 opacity-30"/>
                            <span className="text-xs">Model not generated</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Storyboard Node ---
    if (node.type === NodeType.OutfitDetail) {
        const data = node.data as OutfitDetailNodeData;
        return (
            <div className="flex gap-4 h-[400px]">
                <div className="w-1/2 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden">
                    {(node.data as any).inputImageUrl ? (
                        <img src={(node.data as any).inputImageUrl} className="w-full h-full object-contain" />
                    ) : (
                        <p className="text-gray-600 text-xs italic">No input image</p>
                    )}
                </div>
                <div className="w-1/2 bg-gray-800 rounded-lg p-3 border border-gray-700 overflow-y-auto custom-scrollbar">
                    {data.isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                            <ArrowPathIcon className="w-6 h-6 text-indigo-500 animate-spin" />
                            <span className="text-[10px] text-gray-500">Analyzing...</span>
                        </div>
                    ) : data.technicalSpec ? (
                        <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {data.technicalSpec}
                        </pre>
                    ) : (
                        <p className="text-gray-600 text-xs italic text-center mt-10">Run to see technical details</p>
                    )}
                </div>
            </div>
        );
    }

    if (node.type === NodeType.Storyboard) {
        const data = node.data as StoryboardNodeData;
        return (
            <div className="flex flex-col gap-4 w-full h-full min-h-[400px]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 overflow-y-auto pr-1 custom-scrollbar max-h-[500px]">
                    {data.scenes.map((scene, i) => (
                        <div key={scene.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex flex-col">
                            <div className="aspect-[9/16] bg-black relative group">
                                {scene.imageUrl ? (
                                    <img src={scene.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600"><PhotoIcon className="w-8 h-8"/></div>
                                )}
                                <div className="absolute top-1 left-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md">
                                    {i + 1}
                                </div>
                            </div>
                            <div className="p-2 h-20 overflow-y-auto">
                                <p className="text-[10px] text-gray-300 leading-tight">{scene.koreanDescription || "No description"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- Image / Video / Visual Nodes (Generic) ---
    if ([NodeType.Image, NodeType.ImagePreview, NodeType.ImageEdit, NodeType.Composite, NodeType.Stitch, NodeType.RMBG].includes(node.type)) {
        const data = node.data as (ImageNodeData | ImageEditNodeData);
        let url = null;
        if ('imageUrls' in data && data.imageUrls?.[0]) url = data.imageUrls[0];
        if ('outputImageUrl' in data) url = data.outputImageUrl;
        
        // --- Aspect Ratio Control for Image/Preview Nodes ---
        const showAspectRatio = node.type === NodeType.Image || node.type === NodeType.ImagePreview;
        
        return (
            <div className="flex flex-col h-full gap-2 items-center justify-center w-full">
                {showAspectRatio && (
                    <div className="w-full flex items-center justify-between bg-gray-800 p-2 rounded-lg border border-gray-700 mb-2">
                        <label className="text-xs font-semibold text-gray-400">Aspect Ratio</label>
                        <select
                            value={(data as ImageNodeData).aspectRatio}
                            onChange={(e) => onDataChange(node.id, { aspectRatio: e.target.value })}
                            className="bg-gray-700 border-none rounded-md text-xs text-white px-2 py-1 focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="1:1">1:1</option>
                            <option value="16:9">16:9</option>
                            <option value="9:16">9:16</option>
                            <option value="4:3">4:3</option>
                            <option value="3:4">3:4</option>
                        </select>
                    </div>
                )}

                {url ? (
                    <img src={url} className="max-h-[500px] max-w-full object-contain rounded-lg shadow-md" />
                ) : (
                    <div className="flex flex-col items-center text-gray-500 text-sm py-10">
                        {loadingMessage ? (
                            <>
                                <ExclamationCircleIcon className="w-8 h-8 text-yellow-500 mb-2 animate-pulse" />
                                <span className="text-center max-w-[200px] text-yellow-200">{loadingMessage}</span>
                            </>
                        ) : (
                            <>
                                <PhotoIcon className="w-12 h-12 mb-2 opacity-20" />
                                <span>Waiting for generation...</span>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (node.type === NodeType.Video) {
        const data = node.data as VideoNodeData;
        if (!data.videoUrl) {
             return (
                <div className="flex flex-col items-center text-gray-500 text-sm py-10">
                    {loadingMessage ? (
                        <>
                            {loadingMessage.includes("Error") ? <ExclamationCircleIcon className="w-8 h-8 text-red-500 mb-2" /> : <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mb-2"></div>}
                            <span className="text-center max-w-[250px]">{loadingMessage}</span>
                        </>
                    ) : (
                        <>
                            <FilmIcon className="w-12 h-12 mb-2 opacity-20" />
                            <span>Waiting for video...</span>
                        </>
                    )}
                </div>
            );
        }
        return <video src={data.videoUrl} controls className="max-h-[500px] max-w-full rounded-lg shadow-md" />;
    }

    return <div>Unsupported View</div>;
}

export default PlaygroundModal;