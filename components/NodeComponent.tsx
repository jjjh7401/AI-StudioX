import React, { useRef, useEffect, useCallback } from 'react';
import { Node, Point, Connector, ConnectorType, NodeType, CameraControlData, CameraNodeData, CameraPresetNodeData, Connection, ImageNodeData, ImageEditNodeData, ImagePreviewNodeData, ImageLoadNodeData, VideoLoadNodeData, VideoStitchNodeData, ModelNodeData, VtonNodeData, VideoNodeData, HistoryAsset, StoryboardNodeData, ScriptNodeData, ArrayNodeData, ListNodeData, PromptConcatenatorNodeData, CompositeNodeData, StitchNodeData, RMBGNodeData, GroupNodeData, TextNodeData, CommentNodeData, GridShotNodeData, GridExtractorNodeData, SelectImageNodeData, ImageModifyNodeData } from '../types';
import { TrashIcon, DocumentDuplicateIcon, DocumentTextIcon, PhotoIcon, FilmIcon, ArrowPathIcon, PencilSquareIcon, UserCircleIcon, ArrowUpTrayIcon, ListBulletIcon, QueueListIcon, LinkIcon, Squares2X2Icon, RectangleGroupIcon, PlusIcon, MinusIcon, CameraIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import TextNode from './nodes/TextNode';
import AssistantNode from './nodes/AssistantNode';
import ImageNode from './nodes/ImageNode';
import ImagePreviewNode from './nodes/ImagePreviewNode';
import ImageEditNode from './nodes/ImageEditNode';
import VideoNode from './nodes/VideoNode';
import VideoLoadNode from './nodes/VideoLoadNode';
import VideoStitchNode from './nodes/VideoStitchNode';
import ImageLoadNode from './nodes/ImageLoadNode';
import PresetNode from './nodes/PresetNode';
import CameraPresetNode from './nodes/CameraPresetNode'; // Added
import ModelNode from './nodes/ModelNode';
import VtonNode from './nodes/VtonNode';
import CommentNode from './nodes/CommentNode';
import StoryboardNode from './nodes/StoryboardNode';
import ScriptNode from './nodes/ScriptNode';
import ArrayNode from './nodes/ArrayNode';
import ListNode from './nodes/ListNode';
import PromptConcatenatorNode from './nodes/PromptConcatenatorNode';
import CompositeNode from './nodes/CompositeNode'; 
import StitchNode from './nodes/StitchNode';
import RMBGNode from './nodes/RMBGNode';
import GroupNode from './nodes/GroupNode';
import GridShotNode from './nodes/GridShotNode';
import GridExtractorNode from './nodes/GridExtractorNode';
import SelectImageNode from './nodes/SelectImageNode';
import ImageModifyNode from './nodes/ImageModifyNode';
import OutfitDetailNode from './nodes/OutfitDetailNode';

const CollapseIcon = () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <rect y="9" width="14" height="2" rx="1" x="3" />
    </svg>
);

const ExpandIcon = () => (
     <svg viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2" fill="none" className="w-4 h-4">
        <rect x="5" width="10" height="10" rx="1" y="5" />
    </svg>
);


const getZoomTerm = (zoom: number) => {
    if (zoom <= 3) return 'close-up';
    if (zoom <= 7) return 'medium close-up';
    return 'extreme close-up';
};
  
const generateCameraPrompt = (controls: CameraControlData): string => {
    const parts: string[] = [];
    if (controls.rotation !== 0) {
        parts.push(`Rotate the camera ${Math.abs(controls.rotation)} degrees to the ${controls.rotation > 0 ? 'right' : 'left'}.`);
    }
    if (controls.zoom > 0) {
        parts.push(`Move forward for a ${getZoomTerm(controls.zoom)} (level ${controls.zoom}/10).`);
    }
    if (controls.verticalAngle !== 0) {
        if (controls.verticalAngle > 0) {
        parts.push(`Turn the camera to bird's-eye view (level ${controls.verticalAngle}/10).`);
        } else {
        parts.push(`Turn the camera to worm's-eye view (level ${Math.abs(controls.verticalAngle)}/10).`);
        }
    }
    if (controls.wideAngle) {
        parts.push('Use a wide-angle lens.');
    }
    return parts.join(' ');
};

const CameraControls: React.FC<{
    controls: CameraControlData,
    onChange: (newControls: Partial<CameraControlData>) => void;
}> = ({ controls, onChange }) => {
    const rotationSteps = [-90, -60, -45, -30, 0, 30, 45, 60, 90];

    const findClosestIndex = (val: number) => {
        return rotationSteps.reduce((closestIndex, currentVal, index) => {
            const closestVal = rotationSteps[closestIndex];
            return (Math.abs(currentVal - val) < Math.abs(closestVal - val) ? index : closestIndex);
        }, 0);
    };

    const currentRotationIndex = rotationSteps.indexOf(controls.rotation);
    const rotationIndex = currentRotationIndex > -1 ? currentRotationIndex : findClosestIndex(controls.rotation);

    const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const index = parseInt(e.target.value, 10);
        if (index >= 0 && index < rotationSteps.length) {
            onChange({ rotation: rotationSteps[index] });
        }
    };

    const handleValueChange = (field: keyof CameraControlData, value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            onChange({ [field]: numValue });
        }
    };
    
    const otherControlConfigs = [
        {
            label: "Move Forward → Close-Up",
            field: "zoom",
            value: controls.zoom,
            min: 0,
            max: 10,
            step: 1,
            defaultValue: 0,
        },
        {
            label: "Vertical Angle (Worm ↔ Bird)",
            field: "verticalAngle",
            value: controls.verticalAngle,
            min: -10,
            max: 10,
            step: 1,
            defaultValue: 0,
        },
    ];

    return (
        <div className="bg-slate-900/70 rounded-lg p-4 space-y-4 text-sm text-gray-300 h-full flex flex-col justify-center">
            <h4 className="font-bold text-amber-400">Camera Controls</h4>
            <hr className="border-t border-amber-500/50 -mt-2" />
            
            <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-400">Rotate Right-Left (degrees)</label>
                <div className="flex items-center gap-2">
                    <input
                        type="range"
                        min={0}
                        max={rotationSteps.length - 1}
                        step={1}
                        value={rotationIndex}
                        onChange={handleRotationChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <input
                        type="number"
                        value={controls.rotation}
                        readOnly
                        className="w-16 bg-gray-800 text-white text-center rounded-md border-gray-600 focus:outline-none text-xs p-1"
                    />
                    <button onClick={() => onChange({ rotation: 0 })} title="Reset value">
                        <ArrowPathIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                </div>
            </div>

            {otherControlConfigs.map(config => (
                <div key={config.field} className="space-y-1">
                    <label className="block text-xs font-medium text-gray-400">{config.label}</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            value={config.value}
                            onChange={(e) => onChange({ [config.field]: parseInt(e.target.value, 10) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <input
                            type="number"
                            value={config.value}
                            onChange={(e) => handleValueChange(config.field as keyof CameraControlData, e.target.value)}
                            className="w-16 bg-gray-700 text-white text-center rounded-md border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-xs p-1"
                        />
                        <button onClick={() => onChange({ [config.field]: config.defaultValue })} title="Reset value">
                            <ArrowPathIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                    </div>
                </div>
            ))}
            
            <div className="flex items-center gap-2 pt-2">
                <input
                    type="checkbox"
                    id="wideAngle"
                    checked={controls.wideAngle}
                    onChange={(e) => onChange({ wideAngle: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="wideAngle" className="text-xs font-medium text-gray-300">Wide-Angle Lens</label>
            </div>
        </div>
    );
};

interface NodeComponentProps {
  node: Node;
  nodes: Record<string, Node>;
  isSelected: boolean;
  onSizeChange: (id: string, size: { width: number, height: number }) => void;
  onDataChange: (id: string, data: any) => void;
  onStartConnection: (fromNodeId: string, fromConnector: Connector, e: React.MouseEvent) => void;
  onEndConnection: (toNodeId: string, toConnector: Connector) => void;
  onDeleteNode: (id: string) => void;
  onCopyNode: (id: string) => void;
  onSelectNode: (id: string, e?: React.MouseEvent) => void;
  onGenerateNode: (nodeId: string) => void;
  onAssetGenerated: (asset: Omit<HistoryAsset, 'id'>) => void;
  onToggleCollapse: (id: string) => void;
  onToggleBypass: (id: string) => void;
  onFitGroup?: (id: string) => void;
  connections: Connection[];
  panZoomK: number;
}

const NodeComponent: React.FC<NodeComponentProps> = ({ 
    node, 
    nodes,
    isSelected,
    onSizeChange, 
    onDataChange, 
    onStartConnection, 
    onEndConnection, 
    onDeleteNode, 
    onCopyNode,
    onSelectNode,
    onGenerateNode,
    onAssetGenerated,
    onToggleCollapse,
    onToggleBypass,
    onFitGroup,
    connections,
    panZoomK
}) => {
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = resizeHandleRef.current;
    if (!handle) return;
    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        const startSize = node.size;
        const startPosition = { x: e.clientX, y: e.clientY };
        const handleMouseMove = (e: MouseEvent) => {
            const dx = (e.clientX - startPosition.x) / panZoomK;
            const dy = (e.clientY - startPosition.y) / panZoomK;
            const minWidth = node.type === NodeType.Group ? 200 : 250;
            const minHeight = node.type === NodeType.Group ? 150 : 150;
            const newWidth = Math.max(startSize.width + dx, minWidth);
            const newHeight = Math.max(startSize.height + dy, minHeight);
            onSizeChange(node.id, { width: newWidth, height: newHeight });
        };
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };
    handle.addEventListener('mousedown', handleMouseDown);
    return () => { handle.removeEventListener('mousedown', handleMouseDown); };
  }, [node.id, node.size, onSizeChange, panZoomK, node.type]);

  const renderNodeContent = () => {
    const commonProps = {
        node,
        onDataChange,
        onGenerate: onGenerateNode,
        isCollapsed: !!node.isCollapsed,
        onAssetGenerated
    };
    switch (node.type) {
      case NodeType.Text:
        return <TextNode node={node} onDataChange={onDataChange} isCollapsed={!!node.isCollapsed} />;
      case NodeType.Assistant:
        return <AssistantNode {...commonProps} />;
      case NodeType.Image:
        return <ImageNode {...commonProps} />;
      case NodeType.ImagePreview:
        return <ImagePreviewNode {...commonProps} />;
      case NodeType.ImageEdit: {
        const imageInputConnection = connections.find(c => c.toNodeId === node.id && (c.toConnectorId === 'image-in' || c.toConnectorId === 'reference-in'));
        let connectedImageUrl: string | null = null;
        if (imageInputConnection) {
            const sourceNode = nodes[imageInputConnection.fromNodeId];
            if (sourceNode) {
                switch(sourceNode.type) {
                    case NodeType.Image: connectedImageUrl = (sourceNode.data as ImageNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImagePreview: connectedImageUrl = (sourceNode.data as ImagePreviewNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImageEdit: connectedImageUrl = (sourceNode.data as ImageEditNodeData).outputImageUrl; break;
                    case NodeType.ImageLoad: { const d = sourceNode.data as ImageLoadNodeData; connectedImageUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : (d.imageUrl || null); break; }
                    case NodeType.Model: connectedImageUrl = (sourceNode.data as ModelNodeData).outputImageUrl; break;
                    case NodeType.Vton: connectedImageUrl = (sourceNode.data as VtonNodeData).outputImageUrl; break;
                    case NodeType.Video: connectedImageUrl = (sourceNode.data as VideoNodeData).lastFrameUrl; break;
                    case NodeType.Storyboard: { const storyboardData = sourceNode.data as StoryboardNodeData; const outputIndex = parseInt(imageInputConnection.fromConnectorId.split('-').pop() || '1', 10) - 1; connectedImageUrl = storyboardData.scenes?.[outputIndex]?.imageUrl || null; break; }
                     case NodeType.Script: { const scriptData = sourceNode.data as ScriptNodeData; const outputIndex = parseInt(imageInputConnection.fromConnectorId.split('-').pop() || '1', 10) - 1; connectedImageUrl = scriptData.scriptData?.shotList?.[outputIndex]?.imageUrl || null; break; }
                    case NodeType.Composite: { const compositeData = sourceNode.data as CompositeNodeData; connectedImageUrl = compositeData.outputImageUrl; break; }
                    case NodeType.Stitch: { const stitchData = sourceNode.data as StitchNodeData; connectedImageUrl = stitchData.outputImageUrl; break; }
                    case NodeType.RMBG: { const rmbgData = sourceNode.data as RMBGNodeData; connectedImageUrl = rmbgData.outputImageUrl; break; }
                    case NodeType.GridShot: { connectedImageUrl = (sourceNode.data as GridShotNodeData).outputImageUrl; break; }
                    case NodeType.SelectImage: { connectedImageUrl = (sourceNode.data as SelectImageNodeData).outputUrl; break; }
                }
            }
        }
        return <ImageEditNode {...commonProps} connectedImageUrl={connectedImageUrl} onAssetGenerated={onAssetGenerated} />;
      }
      case NodeType.ImageLoad:
        return <ImageLoadNode node={node} onDataChange={onDataChange} isCollapsed={!!node.isCollapsed} />;
      case NodeType.VideoLoad:
        return <VideoLoadNode node={node} onDataChange={onDataChange} isCollapsed={!!node.isCollapsed} />;
      case NodeType.VideoStitch:
        return <VideoStitchNode {...commonProps} />;
      case NodeType.Model: {
        const isImageConnected = connections.some(c => c.toNodeId === node.id && c.toConnectorId === 'image-in');
        return <ModelNode {...commonProps} isImageConnected={isImageConnected} />;
      }
      case NodeType.Vton: {
        const modelInputConnection = connections.find(c => c.toNodeId === node.id && c.toConnectorId === 'model-in');
        let connectedModelUrl: string | null = null;
        if (modelInputConnection) {
            const sourceNode = nodes[modelInputConnection.fromNodeId];
            if (sourceNode) {
                switch(sourceNode.type) {
                    case NodeType.Image: connectedModelUrl = (sourceNode.data as ImageNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImagePreview: connectedModelUrl = (sourceNode.data as ImagePreviewNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImageEdit: connectedModelUrl = (sourceNode.data as ImageEditNodeData).outputImageUrl; break;
                    case NodeType.ImageLoad: { const d = sourceNode.data as ImageLoadNodeData; connectedModelUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : (d.imageUrl || null); break; }
                    case NodeType.Model: connectedModelUrl = (sourceNode.data as ModelNodeData).outputImageUrl; break;
                    case NodeType.Vton: connectedModelUrl = (sourceNode.data as VtonNodeData).outputImageUrl; break;
                    case NodeType.Video: connectedModelUrl = (sourceNode.data as VideoNodeData).lastFrameUrl; break;
                    case NodeType.Storyboard: { const storyboardData = sourceNode.data as StoryboardNodeData; const outputIndex = parseInt(modelInputConnection.fromConnectorId.split('-').pop() || '1', 10) - 1; connectedModelUrl = storyboardData.scenes?.[outputIndex]?.imageUrl || null; break; }
                     case NodeType.Script: { const scriptData = sourceNode.data as ScriptNodeData; const outputIndex = parseInt(modelInputConnection.fromConnectorId.split('-').pop() || '1', 10) - 1; connectedModelUrl = scriptData.scriptData?.shotList?.[outputIndex]?.imageUrl || null; break; }
                    case NodeType.Composite: { const compositeData = sourceNode.data as CompositeNodeData; connectedModelUrl = compositeData.outputImageUrl; break; }
                    case NodeType.Stitch: { const stitchData = sourceNode.data as StitchNodeData; connectedModelUrl = stitchData.outputImageUrl; break; }
                    case NodeType.RMBG: { const rmbgData = sourceNode.data as RMBGNodeData; connectedModelUrl = rmbgData.outputImageUrl; break; }
                    case NodeType.GridShot: { connectedModelUrl = (sourceNode.data as GridShotNodeData).outputImageUrl; break; }
                    case NodeType.SelectImage: { connectedModelUrl = (sourceNode.data as SelectImageNodeData).outputUrl; break; }
                }
            }
        }
        const outfitInputConnection = connections.find(c => c.toNodeId === node.id && c.toConnectorId === 'outfit-in');
        let connectedOutfitUrl: string | null = null;
        if (outfitInputConnection) {
            const sourceNode = nodes[outfitInputConnection.fromNodeId];
            if (sourceNode) {
                 switch(sourceNode.type) {
                    case NodeType.Image: connectedOutfitUrl = (sourceNode.data as ImageNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImagePreview: connectedOutfitUrl = (sourceNode.data as ImagePreviewNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImageEdit: connectedOutfitUrl = (sourceNode.data as ImageEditNodeData).outputImageUrl; break;
                    case NodeType.ImageLoad: { const d = sourceNode.data as ImageLoadNodeData; connectedOutfitUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : (d.imageUrl || null); break; }
                    case NodeType.Model: connectedOutfitUrl = (sourceNode.data as ModelNodeData).outputImageUrl; break;
                    case NodeType.Vton: connectedOutfitUrl = (sourceNode.data as VtonNodeData).outputImageUrl; break;
                    case NodeType.Video: connectedOutfitUrl = (sourceNode.data as VideoNodeData).lastFrameUrl; break;
                    case NodeType.Storyboard: { const storyboardData = sourceNode.data as StoryboardNodeData; const outputIndex = parseInt(outfitInputConnection.fromConnectorId.split('-').pop() || '1', 10) - 1; connectedOutfitUrl = storyboardData.scenes?.[outputIndex]?.imageUrl || null; break; }
                     case NodeType.Script: { const scriptData = sourceNode.data as ScriptNodeData; const outputIndex = parseInt(outfitInputConnection.fromConnectorId.split('-').pop() || '1', 10) - 1; connectedOutfitUrl = scriptData.scriptData?.shotList?.[outputIndex]?.imageUrl || null; break; }
                    case NodeType.Composite: { const compositeData = sourceNode.data as CompositeNodeData; connectedOutfitUrl = compositeData.outputImageUrl; break; }
                    case NodeType.Stitch: { const stitchData = sourceNode.data as StitchNodeData; connectedOutfitUrl = stitchData.outputImageUrl; break; }
                    case NodeType.RMBG: { const rmbgData = sourceNode.data as RMBGNodeData; connectedOutfitUrl = rmbgData.outputImageUrl; break; }
                    case NodeType.GridShot: { connectedOutfitUrl = (sourceNode.data as GridShotNodeData).outputImageUrl; break; }
                    case NodeType.SelectImage: { connectedOutfitUrl = (sourceNode.data as SelectImageNodeData).outputUrl; break; }
                }
            }
        }
        return <VtonNode {...commonProps} connectedModelUrl={connectedModelUrl} connectedOutfitUrl={connectedOutfitUrl} onAssetGenerated={onAssetGenerated} />;
      }
      case NodeType.Video:
        return <VideoNode {...commonProps} connections={connections} />;
      case NodeType.Camera: {
        const data = node.data as CameraNodeData;
        const handleChange = (newControls: Partial<CameraControlData>) => {
            const controls = { ...data.controls, ...newControls };
            const text = generateCameraPrompt(controls);
            onDataChange(node.id, { controls, text });
        };
        return <CameraControls controls={data.controls} onChange={handleChange} />;
      }
      case NodeType.CameraPreset:
        return <CameraPresetNode node={node} onDataChange={onDataChange} isCollapsed={!!node.isCollapsed} />;
      case NodeType.Preset:
        return <PresetNode node={node} onDataChange={onDataChange} isCollapsed={!!node.isCollapsed} />;
      case NodeType.Comment:
        return <CommentNode node={node} onDataChange={onDataChange} isCollapsed={!!node.isCollapsed} />;
      case NodeType.Storyboard:
        return <StoryboardNode {...commonProps} />;
      case NodeType.Script:
        return <ScriptNode {...commonProps} />;
      case NodeType.Array:
        return <ArrayNode node={node} onDataChange={onDataChange} isCollapsed={!!node.isCollapsed} />;
      case NodeType.List:
        return <ListNode node={node} onDataChange={onDataChange} isCollapsed={!!node.isCollapsed} />;
      case NodeType.PromptConcatenator:
        return <PromptConcatenatorNode node={node} onDataChange={onDataChange} isCollapsed={!!node.isCollapsed} />;
      case NodeType.Composite:
        return <CompositeNode {...commonProps} panZoomK={panZoomK} />;
      case NodeType.Stitch:
        return <StitchNode node={node} onDataChange={onDataChange} onGenerate={onGenerateNode} isCollapsed={!!node.isCollapsed} />;
      case NodeType.RMBG: {
        const imageInputConnection = connections.find(c => c.toNodeId === node.id && c.toConnectorId === 'image-in');
        let connectedImageUrl: string | null = null;
        if (imageInputConnection) {
            const sourceNode = nodes[imageInputConnection.fromNodeId];
            if (sourceNode) {
                switch(sourceNode.type) {
                    case NodeType.Image: connectedImageUrl = (sourceNode.data as ImageNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImagePreview: connectedImageUrl = (sourceNode.data as ImagePreviewNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImageEdit: connectedImageUrl = (sourceNode.data as ImageEditNodeData).outputImageUrl; break;
                    case NodeType.ImageLoad: { const d = sourceNode.data as ImageLoadNodeData; connectedImageUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : (d.imageUrl || null); break; }
                    case NodeType.Model: connectedImageUrl = (sourceNode.data as ModelNodeData).outputImageUrl; break;
                    case NodeType.Vton: connectedImageUrl = (sourceNode.data as VtonNodeData).outputImageUrl; break;
                    case NodeType.Video: connectedImageUrl = (sourceNode.data as VideoNodeData).lastFrameUrl; break;
                    case NodeType.Storyboard: { const storyboardData = sourceNode.data as StoryboardNodeData; const outputIndex = parseInt(imageInputConnection.fromConnectorId.split('-').pop() || '1', 10) - 1; connectedImageUrl = storyboardData.scenes?.[outputIndex]?.imageUrl || null; break; }
                     case NodeType.Script: { const scriptData = sourceNode.data as ScriptNodeData; const outputIndex = parseInt(imageInputConnection.fromConnectorId.split('-').pop() || '1', 10) - 1; connectedImageUrl = scriptData.scriptData?.shotList?.[outputIndex]?.imageUrl || null; break; }
                    case NodeType.Composite: { const compositeData = sourceNode.data as CompositeNodeData; connectedImageUrl = compositeData.outputImageUrl; break; }
                    case NodeType.Stitch: { const stitchData = sourceNode.data as StitchNodeData; connectedImageUrl = stitchData.outputImageUrl; break; }
                    case NodeType.RMBG: { const rmbgData = sourceNode.data as RMBGNodeData; connectedImageUrl = rmbgData.outputImageUrl; break; }
                    case NodeType.GridShot: { connectedImageUrl = (sourceNode.data as GridShotNodeData).outputImageUrl; break; }
                    case NodeType.SelectImage: { connectedImageUrl = (sourceNode.data as SelectImageNodeData).outputUrl; break; }
                }
            }
        }
        return <RMBGNode {...commonProps} connectedImageUrl={connectedImageUrl} />;
      }
      case NodeType.GridShot:
        return <GridShotNode {...commonProps} />;
      case NodeType.GridExtractor: {
        const imageInputConnection = connections.find(c => c.toNodeId === node.id && c.toConnectorId === 'image-in');
        let connectedImageUrl: string | null = null;
        if (imageInputConnection) {
            const sourceNode = nodes[imageInputConnection.fromNodeId];
            if (sourceNode) {
                switch(sourceNode.type) {
                    case NodeType.Image: connectedImageUrl = (sourceNode.data as ImageNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImagePreview: connectedImageUrl = (sourceNode.data as ImagePreviewNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImageEdit: connectedImageUrl = (sourceNode.data as ImageEditNodeData).outputImageUrl; break;
                    case NodeType.ImageLoad: { const d = sourceNode.data as ImageLoadNodeData; connectedImageUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : (d.imageUrl || null); break; }
                    case NodeType.Model: connectedImageUrl = (sourceNode.data as ModelNodeData).outputImageUrl; break;
                    case NodeType.Vton: connectedImageUrl = (sourceNode.data as VtonNodeData).outputImageUrl; break;
                    case NodeType.Composite: connectedImageUrl = (sourceNode.data as CompositeNodeData).outputImageUrl; break;
                    case NodeType.Stitch: connectedImageUrl = (sourceNode.data as StitchNodeData).outputImageUrl; break;
                    case NodeType.RMBG: connectedImageUrl = (sourceNode.data as RMBGNodeData).outputImageUrl; break;
                    case NodeType.GridShot: connectedImageUrl = (sourceNode.data as GridShotNodeData).outputImageUrl; break;
                    case NodeType.Video: connectedImageUrl = (sourceNode.data as VideoNodeData).lastFrameUrl; break;
                    case NodeType.SelectImage: connectedImageUrl = (sourceNode.data as SelectImageNodeData).outputUrl; break;
                }
            }
        }
        return <GridExtractorNode {...commonProps} connectedImageUrl={connectedImageUrl} onAssetGenerated={onAssetGenerated} />;
      }
      case NodeType.SelectImage:
        return <SelectImageNode node={node} onDataChange={onDataChange} isCollapsed={!!node.isCollapsed} />;
      case NodeType.ImageModify: {
        const imageInputConnection = connections.find(c => c.toNodeId === node.id && c.toConnectorId === 'image-in');
        let connectedImageUrl: string | null = null;
        if (imageInputConnection) {
            const sourceNode = nodes[imageInputConnection.fromNodeId];
            if (sourceNode) {
                switch(sourceNode.type) {
                    case NodeType.Image: connectedImageUrl = (sourceNode.data as ImageNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImagePreview: connectedImageUrl = (sourceNode.data as ImagePreviewNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImageEdit: connectedImageUrl = (sourceNode.data as ImageEditNodeData).outputImageUrl; break;
                    case NodeType.ImageLoad: { const d = sourceNode.data as ImageLoadNodeData; connectedImageUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : (d.imageUrl || null); break; }
                    case NodeType.Model: connectedImageUrl = (sourceNode.data as ModelNodeData).outputImageUrl; break;
                    case NodeType.Vton: connectedImageUrl = (sourceNode.data as VtonNodeData).outputImageUrl; break;
                    case NodeType.Composite: connectedImageUrl = (sourceNode.data as CompositeNodeData).outputImageUrl; break;
                    case NodeType.Stitch: connectedImageUrl = (sourceNode.data as StitchNodeData).outputImageUrl; break;
                    case NodeType.RMBG: connectedImageUrl = (sourceNode.data as RMBGNodeData).outputImageUrl; break;
                    case NodeType.GridShot: connectedImageUrl = (sourceNode.data as GridShotNodeData).outputImageUrl; break;
                    case NodeType.Video: connectedImageUrl = (sourceNode.data as VideoNodeData).lastFrameUrl; break;
                    case NodeType.SelectImage: connectedImageUrl = (sourceNode.data as SelectImageNodeData).outputUrl; break;
                    case NodeType.ImageModify: connectedImageUrl = (sourceNode.data as ImageModifyNodeData).outputImageUrl; break;
                }
            }
        }
        return <ImageModifyNode {...commonProps} connectedImageUrl={connectedImageUrl} onAssetGenerated={onAssetGenerated} />;
      }
      case NodeType.OutfitDetail: {
        const imageInputConnection = connections.find(c => c.toNodeId === node.id && c.toConnectorId === 'image-in');
        let connectedImageUrl: string | null = null;
        if (imageInputConnection) {
            const sourceNode = nodes[imageInputConnection.fromNodeId];
            if (sourceNode) {
                switch(sourceNode.type) {
                    case NodeType.Image: connectedImageUrl = (sourceNode.data as ImageNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImagePreview: connectedImageUrl = (sourceNode.data as ImagePreviewNodeData).imageUrls?.[0] || null; break;
                    case NodeType.ImageEdit: connectedImageUrl = (sourceNode.data as ImageEditNodeData).outputImageUrl; break;
                    case NodeType.ImageLoad: { const d = sourceNode.data as ImageLoadNodeData; connectedImageUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : (d.imageUrl || null); break; }
                    case NodeType.Model: connectedImageUrl = (sourceNode.data as ModelNodeData).outputImageUrl; break;
                    case NodeType.Vton: connectedImageUrl = (sourceNode.data as VtonNodeData).outputImageUrl; break;
                    case NodeType.Composite: connectedImageUrl = (sourceNode.data as CompositeNodeData).outputImageUrl; break;
                    case NodeType.Stitch: connectedImageUrl = (sourceNode.data as StitchNodeData).outputImageUrl; break;
                    case NodeType.RMBG: connectedImageUrl = (sourceNode.data as RMBGNodeData).outputImageUrl; break;
                    case NodeType.GridShot: connectedImageUrl = (sourceNode.data as GridShotNodeData).outputImageUrl; break;
                    case NodeType.Video: connectedImageUrl = (sourceNode.data as VideoNodeData).lastFrameUrl; break;
                    case NodeType.SelectImage: connectedImageUrl = (sourceNode.data as SelectImageNodeData).outputUrl; break;
                    case NodeType.ImageModify: connectedImageUrl = (sourceNode.data as ImageModifyNodeData).outputImageUrl; break;
                }
            }
        }
        return <OutfitDetailNode {...commonProps} connectedImageUrl={connectedImageUrl} />;
      }
      case NodeType.Group:
        return <GroupNode node={node} onDataChange={onDataChange} isCollapsed={!!node.isCollapsed} onFitGroup={() => onFitGroup?.(node.id)} />;
      default:
        return <div>Unknown Node Type</div>;
    }
  };

  const getConnectorStyle = (type: ConnectorType) => {
    switch (type) {
        case ConnectorType.Text: return { color: 'bg-sky-500', icon: <DocumentTextIcon className="w-4 h-4 text-white" /> };
        case ConnectorType.Image: return { color: 'bg-fuchsia-500', icon: <PhotoIcon className="w-4 h-4 text-white" /> };
        case ConnectorType.Video: return { color: 'bg-yellow-500', icon: <FilmIcon className="w-4 h-4 text-white" /> };
        case ConnectorType.Array: return { color: 'bg-green-500', icon: <QueueListIcon className="w-4 h-4 text-white" /> };
        default: return { color: 'bg-gray-500', icon: null };
    }
  }

  const renderConnectors = (connectors: Connector[], isInput: boolean) => {
    const headerHeight = 40; const connectorSize = 24; const availableHeight = node.size.height - headerHeight;
    if (node.type === NodeType.Storyboard && !isInput) {
        const renderedConnectors = []; const contentPaddingTop = 12; const buttonAreaHeight = 44;
        const sceneContainerHeight = node.size.height - headerHeight - (contentPaddingTop * 2) - buttonAreaHeight;
        const sceneGap = 16; const totalGapHeight = 4 * sceneGap; const sceneBlockHeight = (sceneContainerHeight - totalGapHeight) / 5;
        const totalStep = sceneBlockHeight + sceneGap;
        connectors.forEach((connector) => {
            const isImageConnector = connector.type === ConnectorType.Image;
            const sceneIndex = parseInt(connector.id.split('-').pop() || '1', 10) - 1;
            if (sceneIndex < 0 || sceneIndex > 4) return;
            const sceneTopY = headerHeight + contentPaddingTop + (sceneIndex * totalStep);
            const textConnectorRelativeY = sceneBlockHeight * 0.33; const imageConnectorRelativeY = sceneBlockHeight * 0.66;
            const connectorY = isImageConnector ? sceneTopY + imageConnectorRelativeY : sceneTopY + textConnectorRelativeY;
            const top = connectorY - (connectorSize / 2); const style = getConnectorStyle(connector.type);
            renderedConnectors.push( <div key={connector.id} onMouseDown={(e) => { e.stopPropagation(); onStartConnection(node.id, connector, e); }} className={`absolute w-6 h-6 rounded-full border-2 border-gray-900 hover:scale-125 transition-transform flex items-center justify-center ${style.color}`} style={{ top: `${top}px`, right: '-12px', cursor: 'crosshair' }} title={`${connector.name} (${connector.type})`} > {style.icon} </div> );
        });
        return renderedConnectors;
    } else if (node.type === NodeType.Script && !isInput) {
        const data = node.data as ScriptNodeData; const shotList = data.scriptData?.shotList; const renderedConnectors = [];
        connectors.forEach(connector => {
            const style = getConnectorStyle(connector.type); let top;
            if (connector.type === ConnectorType.Text) { const index = connectors.findIndex(c => c.id === connector.id); top = headerHeight + 40 + (index * 30); }
            else if (connector.type === ConnectorType.Image && shotList) { 
                const storyboardSectionTopOffset = 630; 
                const shotItemTotalHeight = 96; 
                const shotImageHeight = 80; 
                const sceneIndex = parseInt(connector.id.split('-').pop() || '1', 10) - 1; 
                if (sceneIndex < 0 || sceneIndex >= shotList.length) return; 
                const sceneTopY = storyboardSectionTopOffset + (sceneIndex * shotItemTotalHeight); 
                top = sceneTopY + (shotImageHeight / 2); 
            }
            if (top !== undefined) {
                renderedConnectors.push( 
                    <div key={connector.id} onMouseDown={(e) => { e.stopPropagation(); onStartConnection(node.id, connector, e); }} className={`absolute w-6 h-6 rounded-full border-2 border-gray-900 hover:scale-125 transition-transform flex items-center justify-center ${style.color}`} style={{ top: `${top - (connectorSize / 2)}px`, right: '-12px', cursor: 'crosshair' }} title={`${connector.name} (${connector.type})`} > {style.icon} </div> 
                );
            }
        });
        return renderedConnectors;
    }

    const spacing = availableHeight / (connectors.length + 1);
    return connectors.map((connector, index) => {
        const top = headerHeight + (index + 1) * spacing - (connectorSize / 2);
        const style = getConnectorStyle(connector.type);
        return (
            <div
                key={connector.id}
                onMouseDown={(e) => { e.stopPropagation(); onStartConnection(node.id, connector, e); }}
                onMouseUp={() => isInput && onEndConnection(node.id, connector)}
                className={`absolute w-6 h-6 rounded-full border-2 border-gray-900 hover:scale-125 transition-transform flex items-center justify-center ${style.color}`}
                style={{
                    top: `${top}px`,
                    [isInput ? 'left' : 'right']: '-12px',
                    cursor: 'crosshair',
                    pointerEvents: 'auto'
                }}
                title={`${connector.name} (${connector.type})`}
            >
                {style.icon}
            </div>
        );
    });
  };

  const isGroup = node.type === NodeType.Group;
  const nodeColorClass = isSelected ? 'ring-4 ring-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'ring-1 ring-gray-700';
  const backgroundClass = isGroup ? 'bg-gray-800/10 backdrop-blur-none' : 'bg-gray-800/90 backdrop-blur-md';

  return (
    <div 
        className={`node-body relative ${backgroundClass} rounded-2xl flex flex-col transition-all duration-200 group ${nodeColorClass} ${node.isBypassed ? 'opacity-50 grayscale' : ''}`}
        style={{ width: node.size.width, height: node.size.height, pointerEvents: 'auto' }}
        onMouseDown={(e) => onSelectNode(node.id, e)}
    >
      {/* Header / Drag Handle */}
      <div className={`node-drag-handle grid grid-cols-3 items-center px-4 h-10 border-b border-gray-700/50 cursor-move rounded-t-2xl ${isGroup ? 'bg-gray-800/20' : 'bg-gray-800/50'}`}>
        {/* Left: Icon & Type */}
        <div className="flex items-center gap-2">
            <span className="p-1 bg-gray-700 rounded-md">
                {node.type === NodeType.Text && <DocumentTextIcon className="w-4 h-4 text-sky-400" />}
                {node.type === NodeType.Assistant && <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-400" />}
                {node.type === NodeType.Image && <PhotoIcon className="w-4 h-4 text-fuchsia-400" />}
                {node.type === NodeType.Video && <FilmIcon className="w-4 h-4 text-amber-400" />}
                {node.type === NodeType.Model && <UserCircleIcon className="w-4 h-4 text-pink-400" />}
                {node.type === NodeType.Script && <QueueListIcon className="w-4 h-4 text-green-400" />}
                {!['Text', 'Assistant', 'Image', 'Video', 'Model', 'Script'].includes(node.type) && <Squares2X2Icon className="w-4 h-4 text-gray-400" />}
            </span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider truncate">{node.type}</span>
        </div>

        {/* Center: Bypass Toggle */}
        <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 select-none">Bypass</span>
            <button
                onClick={(e) => { e.stopPropagation(); onToggleBypass(node.id); }}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${node.isBypassed ? 'bg-indigo-600' : 'bg-slate-700/80'}`}
                title="Bypass (B)"
            >
                <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${node.isBypassed ? 'translate-x-4.5' : 'translate-x-0.5'}`}
                />
            </button>
        </div>

        {/* Right: Other Actions */}
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onToggleCollapse(node.id); }} className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700" title="Collapse">
                {node.isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onCopyNode(node.id); }} className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700" title="Duplicate">
                <DocumentDuplicateIcon className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }} className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-gray-700" title="Delete">
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow p-3 min-h-0 overflow-hidden">
        {renderNodeContent()}
      </div>

      {/* Connectors */}
      {renderConnectors(node.inputs, true)}
      {renderConnectors(node.outputs, false)}

      {/* Resize Handle */}
      {!node.isCollapsed && (
          <div 
            ref={resizeHandleRef}
            className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize flex items-center justify-center text-gray-600 hover:text-gray-400"
          >
            <div className="w-2 h-2 border-r-2 border-b-2 border-current"></div>
          </div>
      )}
    </div>
  );
};

export default React.memo(NodeComponent);