import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useImmer } from 'use-immer';
import * as d3 from 'd3';
import Draggable, { DraggableEvent } from 'react-draggable';
import {
  Node,
  NodeType,
  Point,
  Connection,
  NodeData,
  Connector,
  ConnectorType,
  HistoryAsset,
  TextNodeData,
  AssistantNodeData,
  ImageNodeData,
  ImagePreviewNodeData,
  ImageEditNodeData,
  ImageLoadNodeData,
  VideoNodeData,
  VideoLoadNodeData,
  VideoStitchNodeData,
  CameraNodeData,
  CameraPresetNodeData,
  PresetNodeData,
  ModelNodeData,
  VtonNodeData,
  StoryboardNodeData,
  Tool,
  Project,
  ProjectState,
  ScriptNodeData,
  CommentNodeData,
  ArrayNodeData,
  ListNodeData,
  PromptConcatenatorNodeData,
  CompositeNodeData,
  StitchNodeData,
  RMBGNodeData, 
  CompositeLayer,
  GroupNodeData,
  GridShotNodeData,
  GridExtractorNodeData,
  SelectImageNodeData,
  ImageModifyNodeData,
  OutfitDetailNodeData,
  VtonStylingItem,
} from './types';
import NodeComponent from './components/NodeComponent';
import ConnectionComponent from './components/ConnectionComponent';
import Toolbar from './components/Toolbar';
import ToolsPanel from './components/ToolsPanel';
import { PanZoom } from './types';
import HistoryPanel from './components/HistoryPanel';
import { generateText, generateImage, editImage, removeBackground, expandImage, upscaleImage, generateVirtualModel, generateModelFromImage, generateVtonImage, generateStoryboardScenario, generateConsistentImage, analyzeProductInfo, generateScriptFromStyle, captureImagesFromUrl, generateFinalPrompt, constructPromptFromShot, preprocessImageForOutpainting, generateVideo, detectGridItems } from './services/geminiService';
import { compositeImages, stitchImages, urlToDataURL, addSolidBackground, cropAndTrimImage } from './services/imageProcessingService';
import { PlayIcon } from '@heroicons/react/24/outline';
import { COMPOSITE_NODE_HEADER_HEIGHT, COMPOSITE_NODE_CONTENT_PADDING_X, COMPOSITE_NODE_CONTENT_PADDING_Y_TOP, COMPOSITE_NODE_CONTENT_PADDING_Y_BOTTOM, COMPOSITE_NODE_BUTTON_HEIGHT, COMPOSITE_NODE_INTERNAL_SPACING, POSE_PRESETS, RMBG_DEFAULT_BACKGROUND_COLOR, MODEL_NATIONALITIES, MODEL_FACE_SHAPES, MODEL_HAIR_STYLES, MODEL_HAIR_COLORS } from './data/constants';
import { SYSTEM_PROMPTS } from './data/systemPrompts';
import ZoomControls from './components/ZoomControls';
import ProjectControls from './components/ProjectControls';
import { storeAsset, getAsset, dataURLToBlob, saveProjectsList } from './services/dbService';
import { CATEGORY_STYLES } from './data/scriptStyles';
import PlaygroundModal from './components/PlaygroundModal'; // Import Playground Modal
import { createNode } from './factories/nodeFactory';
import { useCanvas } from './hooks/useCanvas';
import { useNodes } from './hooks/useNodes';
import { useConnections } from './hooks/useConnections';
import { useNodeGeneration } from './hooks/useNodeGeneration';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useProjectManager } from './hooks/useProjectManager';

interface DraggableNodeWrapperProps {
  node: Node;
  nodes: Record<string, Node>;
  isSelected: boolean;
  panZoomK: number;
  onSelectNode: (id: string, e?: React.MouseEvent) => void;
  onNodeDrag: (e: DraggableEvent, data: any, draggedNodeId: string) => void;
  onDragStart: (nodeId: string, e: DraggableEvent) => void;
  onSizeChange: (id: string, newSize: { width: number, height: number }) => void;
  onDataChange: (id: string, data: Partial<NodeData>) => void;
  onStartConnection: (fromNodeId: string, fromConnector: Connector, e: React.MouseEvent) => void;
  onEndConnection: (toNodeId: string, toConnector: Connector) => void;
  onDeleteNode: (id: string) => void;
  onCopyNode: (id: string) => void;
  onGenerateNode: (nodeId: string) => void;
  onAssetGenerated: (asset: Omit<HistoryAsset, 'id'>) => void;
  onToggleCollapse: (id: string) => void;
  onToggleBypass: (id: string) => void;
  onFitGroup: (id: string) => void;
  connections: Connection[];
}

const DraggableNodeWrapper: React.FC<DraggableNodeWrapperProps> = React.memo((props) => {
  const { 
    node, 
    nodes,
    onSelectNode, 
    onNodeDrag, 
    onNodeDragStart,
    isSelected,
    onSizeChange,
    onDataChange,
    onStartConnection,
    onEndConnection,
    onDeleteNode,
    onCopyNode,
    onGenerateNode,
    onAssetGenerated,
    onToggleCollapse,
    onToggleBypass,
    onFitGroup,
    connections,
    panZoomK
  } = props;
  const nodeRef = useRef(null);

  return (
    <Draggable
        nodeRef={nodeRef}
        handle=".node-drag-handle"
        position={{ x: node.position.x, y: node.position.y }}
        onStart={(e: DraggableEvent) => onNodeDragStart ? onNodeDragStart(node.id, e) : undefined}
        onDrag={(e, data) => onNodeDrag(e, data, node.id)}
    >
      <foreignObject ref={nodeRef} width={node.size.width} height={node.size.height} style={{overflow: 'visible', cursor: 'move', pointerEvents: 'none'}}>
          {/* Restore pointer-events auto inside NodeComponent */}
          <NodeComponent
              node={node}
              nodes={nodes}
              isSelected={isSelected}
              onSizeChange={onSizeChange}
              onDataChange={onDataChange}
              onStartConnection={onStartConnection}
              onEndConnection={onEndConnection}
              onDeleteNode={onDeleteNode}
              onCopyNode={onCopyNode}
              onSelectNode={onSelectNode}
              onGenerateNode={onGenerateNode}
              onAssetGenerated={onAssetGenerated}
              onToggleCollapse={onToggleCollapse}
              onToggleBypass={onToggleBypass}
              onFitGroup={onFitGroup}
              connections={connections}
              panZoomK={panZoomK}
          />
      </foreignObject>
    </Draggable>
  );
});

// Helper for generating IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const isNodeInsideGroup = (node: Node, group: Node): boolean => {
    const nRight = node.position.x + node.size.width;
    const nBottom = node.position.y + node.size.height;
    const gRight = group.position.x + group.size.width;
    const gBottom = group.position.y + group.size.height;

    return (
        node.position.x >= group.position.x &&
        node.position.y >= group.position.y &&
        nRight <= gRight &&
        nBottom <= gBottom
    );
};

const App: React.FC = () => {
  const nodesRef = useRef<Record<string, Node>>({}); // 이벤트 핸들러 최신 nodes 접근용 ref
  const [history, setHistory] = useImmer<HistoryAsset[]>([]);
  // panZoom 상태는 useCanvas 훅으로 이동됨 (SPEC-UI-001 M1)
  const selectedNodeIdsRef = useRef<string[]>([]); // 이벤트 핸들러 최신 selectedNodeIds 접근용 ref
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const selectionStartPoint = useRef<Point | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pendingConnectionPathRef = useRef<SVGPathElement>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  // useCanvas: D3 zoom/pan 로직을 훅으로 분리 (SPEC-UI-001 M1)
  const {
    panZoom,
    zoomIn,
    zoomOut,
    zoomToFit,
    getWorldPosition,
    restoreTransform,
    isMiddleMousePanning,
  } = useCanvas({
    svgRef,
    activeTool,
    onPanZoomChange: () => {}, // panZoom 상태는 훅 내부에서 관리됨
  });
  // nodeRenderOrderRef는 저장 시 최신값 접근을 위해 유지
  const nodeRenderOrderRef = useRef<string[]>([]);
  // deleteConnectionsForNodesRef: useNodes onNodesDeleted 콜백에서 useConnections 메서드 참조용
  // useConnections 초기화 전에 useNodes가 필요하므로 ref로 순환 의존성 해결
  const deleteConnectionsForNodesRef = useRef<(nodeIds: string[]) => void>(() => {});

  // useNodes: 노드 CRUD, 선택, 이동, 복제, Collapse/Bypass 관리 훅 (SPEC-UI-001 M2)
  // @MX:NOTE: nodes/selectedNodeIds/nodeRenderOrder 상태가 useNodes 훅으로 이동됨
  const {
    nodes,
    nodeRenderOrder,
    addNode: hookAddNode,
    deleteNodes,
    duplicateNode: hookDuplicateNode,
    updateNodeData,
    moveNodes,
    resizeNode: hookResizeNode,
    toggleCollapse: handleToggleCollapse,
    toggleBypass: handleToggleBypass,
    setNodes,
    setNodeRenderOrder,
    setSelectedNodeIds: setSelectedNodeIdsInHook,
    loadNodes,
  } = useNodes({
    getWorldPosition,
    panZoom,
    onNodesDeleted: (nodeIds) => {
      // 삭제된 노드에 연결된 커넥션 제거 (useConnections 훅의 deleteConnectionsForNodes 위임)
      deleteConnectionsForNodesRef.current(nodeIds);
    },
  });

  // useConnections: 커넥션 생성/삭제/선택 훅 (SPEC-UI-001 M3)
  // @MX:NOTE: connections/pendingConnection/selectedConnectionId 상태가 useConnections 훅으로 이동됨
  const {
    connections,
    selectedConnectionId,
    pendingConnection,
    startConnection: hookStartConnection,
    completeConnection: endConnection,
    cancelConnection,
    deleteConnections,
    selectConnection,
    deleteConnectionsForNodes,
    loadConnections,
  } = useConnections({ nodes, getWorldPosition });

  // deleteConnectionsForNodesRef 업데이트: useNodes의 onNodesDeleted에서 참조
  deleteConnectionsForNodesRef.current = deleteConnectionsForNodes;

  // selectedNodeIds: 배열 기반으로 App.tsx 내부 로직에서 사용
  // @MX:NOTE: selectedNodeIds 배열과 useNodes 훅의 Set 상태를 동기화하여 관리 (SPEC-UI-001 M2)
  const [selectedNodeIds, setSelectedNodeIdsLocal] = useState<string[]>([]);

  // setSelectedNodeIds: 로컬 배열 상태 + 훅 Set 상태 + ref 동기화
  const setSelectedNodeIds = useCallback((ids: string[]) => {
    setSelectedNodeIdsLocal(ids);
    setSelectedNodeIdsInHook(ids);
    selectedNodeIdsRef.current = ids;
  }, [setSelectedNodeIdsInHook]);
  
  // useUndoRedo: 노드/커넥션 상태 스냅샷 기반 Undo/Redo (SPEC-UI-001 M5)
  const undoPushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { pushState: pushUndoState, undo: undoState } = useUndoRedo<{
    nodes: Record<string, Node>;
    connections: Connection[];
    nodeRenderOrder: string[];
  }>();

  // useProjectManager: IndexedDB 기반 프로젝트 저장/로드/삭제 (SPEC-UI-001 M5)
  const { projects, saveProject: pmSaveProject, loadProject: pmLoadProject, deleteProject: pmDeleteProject } = useProjectManager({
    getState: () => ({ nodes, connections, history, panZoom, nodeRenderOrder }),
    onStateLoaded: (state) => {
      loadNodes(state.nodes, state.nodeRenderOrder || Object.keys(state.nodes));
      loadConnections(state.connections);
      setHistory(state.history);
      restoreTransform(state.panZoom);
    },
  });

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false); // Playground State
  
  const clipboardRef = useRef<{ nodes: Node[], connections: Connection[] } | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        setHasApiKey(true); // Fallback if API is not available
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Assume success to avoid race conditions
    }
  };

  // Keep nodesRef updated
  useEffect(() => {
      nodesRef.current = nodes;
  }, [nodes]);

  // Keep selectedNodeIdsRef updated
  useEffect(() => {
      selectedNodeIdsRef.current = selectedNodeIds;
  }, [selectedNodeIds]);

  // 노드/커넥션 변경 시 undo 히스토리에 스냅샷 저장 (300ms 디바운스, SPEC-UI-001 M5)
  useEffect(() => {
    if (undoPushTimerRef.current) clearTimeout(undoPushTimerRef.current);
    undoPushTimerRef.current = setTimeout(() => {
      pushUndoState({ nodes, connections, nodeRenderOrder });
    }, 300);
    return () => { if (undoPushTimerRef.current) clearTimeout(undoPushTimerRef.current); };
  }, [nodes, connections, nodeRenderOrder, pushUndoState]);

  const getConnectorPosition = useCallback((nodeId: string, connectorId: string, isInput: boolean): Point => {
    const node = nodes[nodeId];
    if (!node || node.hidden) return { x: 0, y: 0 };

    if (node.isCollapsed) {
        const y = node.position.y + (node.size.height / 2);
        const x = isInput ? node.position.x : node.position.x + node.size.width;
        return { x, y };
    }

    if ((node.type === NodeType.Storyboard || node.type === NodeType.Script) && !isInput) {
        const headerHeight = 40;
        const contentPaddingTop = 12;
        
        const connector = node.outputs.find(c => c.id === connectorId);
        if (!connector) return { x: 0, y: 0 }; 

        if (node.type === NodeType.Storyboard) {
            const buttonAreaHeight = 44;
            const sceneContainerHeight = node.size.height - headerHeight - (contentPaddingTop * 2) - buttonAreaHeight;
            const sceneGap = 16;
            const totalScenes = 5;

            const totalGapHeight = (totalScenes - 1) * sceneGap;
            const sceneBlockHeight = (sceneContainerHeight - totalGapHeight) / totalScenes;
            const totalStep = sceneBlockHeight + sceneGap;
            
            const isImageConnector = connector.type === ConnectorType.Image;
            const sceneIndex = parseInt(connector.id.split('-').pop() || '0', 10) - 1;
            
            if (sceneIndex < 0 || sceneIndex >= totalScenes) return { x: 0, y: 0 };
    
            const sceneTopY = headerHeight + contentPaddingTop + (sceneIndex * totalStep);
            
            const textConnectorRelativeY = sceneBlockHeight * 0.33;
            const imageConnectorRelativeY = sceneBlockHeight * 0.66;
            
            const relativeY = isImageConnector 
                ? sceneTopY + imageConnectorRelativeY 
                : sceneTopY + textConnectorRelativeY;
    
            return { x: node.position.x + node.size.width, y: node.position.y + relativeY };

        } else if (node.type === NodeType.Script) {
            const data = node.data as ScriptNodeData;
            const shotList = data.scriptData?.shotList;

            if (connector.type === ConnectorType.Text || !shotList || shotList.length === 0) {
                 const connectors = node.outputs;
                const index = connectors.findIndex(c => c.id === connectorId);
                const y = node.position.y + headerHeight + 40 + (index * 30);
                return { x: node.position.x + node.size.width, y };
            }
            
            const storyboardSectionTopOffset = 630;
            const shotItemTotalHeight = 96;
            const shotImageHeight = 80;
            
            const sceneIndex = parseInt(connector.id.split('-').pop() || '1', 10) - 1;
            if (sceneIndex < 0 || sceneIndex >= shotList.length) return { x: 0, y: 0 };

            const sceneTopY = storyboardSectionTopOffset + (sceneIndex * shotItemTotalHeight);
            const connectorRelativeY = shotImageHeight / 2;
            
            const y = node.position.y + sceneTopY + connectorRelativeY;
            const x = node.position.x + node.size.width; 
            return { x, y };
        }
    }

    const connectors = isInput ? node.inputs : node.outputs;
    const index = connectors.findIndex(c => c.id === connectorId);
    
    if (index === -1) return { x: 0, y: 0 };
    
    const headerHeight = 40;
    const availableHeight = node.size.height - headerHeight;
    const spacing = availableHeight / (connectors.length + 1);
    
    const y = node.position.y + headerHeight + ((index + 1) * spacing);
    const x = isInput ? node.position.x : node.position.x + node.size.width; 
    
    return { x, y };
  }, [nodes]);

  // updateNodeData는 useNodes 훅에서 제공됨 (SPEC-UI-001 M2)

  const onVideoProgress = useCallback((nodeId: string, message: string) => {
    setNodes(draft => {
      const node = draft[nodeId];
      if (node && (node.type === NodeType.Video || node.type === NodeType.GridShot)) {
        (node.data as any).loadingMessage = message;
      }
    });
  }, [setNodes]);

  const onAssetGenerated = useCallback((asset: Omit<HistoryAsset, 'id'>) => {
    setHistory(draft => {
        if (!draft.some(h => h.url === asset.url)) {
            draft.unshift({ ...asset, id: `hist-${Date.now()}` });
        }
    });
  }, [setHistory]);

  const executeNode = useCallback(async (
    nodeId: string,
    allNodes: Record<string, Node>,
    allConnections: Connection[],
    onVideoProgress: (message: string) => void,
    onAssetGenerated: (asset: Omit<HistoryAsset, 'id'>) => void
  ): Promise<Partial<Node>> => {
    const node = allNodes[nodeId];
    if (!node) {
      throw new Error(`Node ${nodeId} not found during execution.`);
    }

    const getTextInputValues = (id: string) => {
        const textInputConnections = allConnections.filter(c => c.toNodeId === id && c.toConnectorId.startsWith('text-in'));
        textInputConnections.sort((a, b) => {
            const indexA = parseInt(a.toConnectorId.split('-').pop() || '0', 10);
            const indexB = parseInt(b.toConnectorId.split('-').pop() || '0', 10);
            return indexA - indexB;
        });

        const prompts: string[] = [];
        textInputConnections.forEach(conn => {
            const sourceNode = allNodes[conn.fromNodeId];
            if (sourceNode) {
                if (sourceNode.type === NodeType.Text) prompts.push((sourceNode.data as TextNodeData).text);
                if (sourceNode.type === NodeType.Assistant) prompts.push((sourceNode.data as AssistantNodeData).response);
                if (sourceNode.type === NodeType.Preset) prompts.push((sourceNode.data as PresetNodeData).text);
                if (sourceNode.type === NodeType.Camera) prompts.push((sourceNode.data as CameraNodeData).text);
                if (sourceNode.type === NodeType.CameraPreset) prompts.push((sourceNode.data as CameraPresetNodeData).prompt); // Added CameraPreset
                if (sourceNode.type === NodeType.List) prompts.push((sourceNode.data as ListNodeData).output);
                if (sourceNode.type === NodeType.Storyboard) {
                    const storyboardData = sourceNode.data as StoryboardNodeData;
                    const outputIndex = parseInt(conn.fromConnectorId.split('-').pop() || '1', 10) - 1;
                    if (storyboardData.scenes[outputIndex]) {
                        prompts.push(storyboardData.scenes[outputIndex].englishPrompt);
                    }
                }
                if (sourceNode.type === NodeType.Script) {
                    prompts.push((sourceNode.data as ScriptNodeData).finalPrompt || '');
                }
                if (sourceNode.type === NodeType.OutfitDetail) prompts.push((sourceNode.data as OutfitDetailNodeData).technicalSpec);
                if (sourceNode.type === NodeType.PromptConcatenator) {
                     prompts.push((sourceNode.data as PromptConcatenatorNodeData).concatenatedText);
                }
            }
        });
        return prompts;
    };
    
    const getImageInputValues = (id: string, prefix: string = 'image-in'): string[] => {
        const imageInputConnections = allConnections.filter(c => c.toNodeId === id && c.toConnectorId.startsWith(prefix));
        imageInputConnections.sort((a, b) => { // Sort to maintain layer/stitch order
            const indexA = parseInt(a.toConnectorId.split('-').pop() || '0', 10);
            const indexB = parseInt(b.toConnectorId.split('-').pop() || '0', 10);
            return indexA - indexB;
        });

        const imageUrls: string[] = [];
        imageInputConnections.forEach(conn => {
            const sourceNode = allNodes[conn.fromNodeId];
            if (!sourceNode) return;
            
            let urlsToAdd: string[] = [];
            if (sourceNode.type === NodeType.Image || sourceNode.type === NodeType.ImagePreview) {
                 const urls = (sourceNode.data as ImageNodeData).imageUrls;
                 urls.forEach(u => { if (u) urlsToAdd.push(u) });
            }
            else if (sourceNode.type === NodeType.ImageEdit) {
                const url = (sourceNode.data as ImageEditNodeData).outputImageUrl;
                if (url) urlsToAdd.push(url);
            }
            else if (sourceNode.type === NodeType.ImageLoad) {
                const loadData = sourceNode.data as ImageLoadNodeData;
                if (loadData.imageUrls && loadData.imageUrls.length > 0) {
                    urlsToAdd.push(...loadData.imageUrls);
                } else if (loadData.imageUrl) {
                    // Backward compatibility
                    urlsToAdd.push(loadData.imageUrl);
                }
            }
            else if (sourceNode.type === NodeType.Model) {
                 const url = (sourceNode.data as ModelNodeData).outputImageUrl;
                 if (url) urlsToAdd.push(url);
            }
            else if (sourceNode.type === NodeType.Vton) {
                 const url = (sourceNode.data as VtonNodeData).outputImageUrl;
                 if (url) urlsToAdd.push(url);
            }
            else if (sourceNode.type === NodeType.Video) {
                 const videoData = sourceNode.data as VideoNodeData;
                 if (conn.fromConnectorId === 'start-frame-out') {
                     if (videoData.firstFrameUrl) urlsToAdd.push(videoData.firstFrameUrl);
                 } else if (conn.fromConnectorId === 'end-frame-out') {
                     if (videoData.lastFrameUrl) urlsToAdd.push(videoData.lastFrameUrl);
                 } else {
                     // Fallback for generic connections
                     if (videoData.lastFrameUrl) urlsToAdd.push(videoData.lastFrameUrl);
                 }
            }
            else if (sourceNode.type === NodeType.Storyboard) {
                const storyboardData = sourceNode.data as StoryboardNodeData;
                const outputIndex = parseInt(conn.fromConnectorId.split('-').pop() || '1', 10) - 1;
                if (storyboardData.scenes[outputIndex] && storyboardData.scenes[outputIndex].imageUrl) {
                    urlsToAdd.push(storyboardData.scenes[outputIndex].imageUrl!);
                }
            } else if (sourceNode.type === NodeType.Script) {
                 const scriptData = sourceNode.data as ScriptNodeData;
                const outputIndex = parseInt(conn.fromConnectorId.split('-').pop() || '1', 10) - 1;
                if (scriptData.scriptData?.shotList[outputIndex] && scriptData.scriptData.shotList[outputIndex].imageUrl) {
                    urlsToAdd.push(scriptData.scriptData.shotList[outputIndex].imageUrl!);
                }
            } else if (sourceNode.type === NodeType.Composite) { // New: Composite output
                const compositeData = sourceNode.data as CompositeNodeData;
                if (compositeData.outputImageUrl) {
                    urlsToAdd.push(compositeData.outputImageUrl);
                }
            } else if (sourceNode.type === NodeType.Stitch) { // New: Stitch output
                const stitchData = sourceNode.data as StitchNodeData;
                if (stitchData.outputImageUrl) {
                    urlsToAdd.push(stitchData.outputImageUrl);
                }
            } else if (sourceNode.type === NodeType.RMBG) { // New: RMBG output
                const rmbgData = sourceNode.data as RMBGNodeData;
                if (rmbgData.outputImageUrl) {
                    urlsToAdd.push(rmbgData.outputImageUrl);
                }
            } else if (sourceNode.type === NodeType.GridShot) {
                const gridData = sourceNode.data as GridShotNodeData;
                if (gridData.outputImageUrl) urlsToAdd.push(gridData.outputImageUrl);
            } else if (sourceNode.type === NodeType.SelectImage) {
                const selData = sourceNode.data as SelectImageNodeData;
                if (selData.outputUrl) urlsToAdd.push(selData.outputUrl);
            } else if (sourceNode.type === NodeType.ImageModify) {
                const modifyData = sourceNode.data as ImageModifyNodeData;
                if (modifyData.outputImageUrl) urlsToAdd.push(modifyData.outputImageUrl);
            }
            
            imageUrls.push(...urlsToAdd);
        });
        return imageUrls;
    };
    
    const getVideoInputValue = (id: string, connectorId: string): any | null => {
        const videoInputConnection = allConnections.find(c => c.toNodeId === id && c.toConnectorId === connectorId);
        if (!videoInputConnection) return null;
        
        const sourceNode = allNodes[videoInputConnection.fromNodeId];
        if (!sourceNode) return null;

        if (sourceNode.type === NodeType.Video) {
          return (sourceNode.data as VideoNodeData).videoObject;
        } else if (sourceNode.type === NodeType.VideoLoad) {
          return (sourceNode.data as VideoLoadNodeData).videoObject;
        } else if (sourceNode.type === NodeType.VideoStitch) {
          return (sourceNode.data as VideoStitchNodeData).outputVideoUrl; // Simple URL pass
        }
        return null;
    };

    const getVideoUrlInputValue = (id: string, connectorId: string): string | null => {
        const conn = allConnections.find(c => c.toNodeId === id && c.toConnectorId === connectorId);
        if (!conn) return null;
        const sourceNode = allNodes[conn.fromNodeId];
        if (!sourceNode) return null;
        if (sourceNode.type === NodeType.Video) return (sourceNode.data as VideoNodeData).videoUrl;
        if (sourceNode.type === NodeType.VideoLoad) return (sourceNode.data as VideoLoadNodeData).videoUrl;
        if (sourceNode.type === NodeType.VideoStitch) return (sourceNode.data as VideoStitchNodeData).outputVideoUrl;
        return null;
    };

    const getArrayInputValue = (id: string, connectorId: string): string[] => {
        const conn = allConnections.find(c => c.toNodeId === id && c.toConnectorId === connectorId);
        if (!conn) return [];
        const sourceNode = allNodes[conn.fromNodeId];
        if (sourceNode && sourceNode.type === NodeType.Array) {
             return (sourceNode.data as ArrayNodeData).items || [];
        }
        if (sourceNode && sourceNode.type === NodeType.GridExtractor) {
            return (sourceNode.data as GridExtractorNodeData).extractedItems.map(item => item.url) || [];
        }
        return [];
    };

    // Bypass Logic
    if (node.isBypassed) {
        const baseUpdate = { isLoading: false, loadingMessage: '' };

        if (node.type === NodeType.Assistant) {
            const inputs = getTextInputValues(nodeId);
            return { data: { ...(node.data as AssistantNodeData), ...baseUpdate, response: inputs.join('\n\n') } as AssistantNodeData };
        }
        if (node.type === NodeType.ImageEdit) {
            const inputs = getImageInputValues(nodeId);
            return { data: { ...(node.data as ImageEditNodeData), ...baseUpdate, outputImageUrl: inputs[0] || null } as ImageEditNodeData };
        }
        if (node.type === NodeType.Image || node.type === NodeType.ImagePreview) {
            const inputs = getImageInputValues(nodeId);
            return { data: { ...(node.data as ImageNodeData), ...baseUpdate, imageUrls: inputs } as ImageNodeData };
        }
        if (node.type === NodeType.Vton) {
            const inputs = getImageInputValues(nodeId, 'model-in');
            return { data: { ...(node.data as VtonNodeData), ...baseUpdate, outputImageUrl: inputs[0] || null } as VtonNodeData };
        }
        if (node.type === NodeType.Model) {
            const inputs = getImageInputValues(nodeId);
            return { data: { ...(node.data as ModelNodeData), ...baseUpdate, outputImageUrl: inputs[0] || null } as ModelNodeData };
        }
        if (node.type === NodeType.Composite) {
            const inputs = getImageInputValues(nodeId);
            const data = node.data as CompositeNodeData;
            const updatedLayers: CompositeLayer[] = [];
            let contentAreaWidth = node.size.width - COMPOSITE_NODE_CONTENT_PADDING_X;
            let contentAreaHeight = node.size.height - COMPOSITE_NODE_HEADER_HEIGHT - COMPOSITE_NODE_CONTENT_PADDING_Y_TOP - COMPOSITE_NODE_CONTENT_PADDING_Y_BOTTOM - COMPOSITE_NODE_BUTTON_HEIGHT - COMPOSITE_NODE_INTERNAL_SPACING;

            contentAreaWidth = Math.max(1, contentAreaWidth);
            contentAreaHeight = Math.max(1, contentAreaHeight);

            inputs.forEach(async (url, idx) => {
                const existingLayer = data.layers.find(layer => layer.url === url);
                if (existingLayer) {
                    updatedLayers.push(existingLayer);
                } else {
                    const img = new Image();
                    img.src = url;
                    await img.decode();
                    
                    const initialScale = Math.min(1, contentAreaWidth / img.width, contentAreaHeight / img.height);
                    
                    updatedLayers.push({
                        id: generateId('layer'),
                        url: url,
                        x: contentAreaWidth / 2 + idx * 10,
                        y: contentAreaHeight / 2 + idx * 10,
                        scale: initialScale,
                        rotation: 0,
                        originalWidth: img.width,
                        originalHeight: img.height,
                    });
                }
            });
            return { data: { ...(node.data as CompositeNodeData), ...baseUpdate, outputImageUrl: inputs[0] || null, layers: updatedLayers, internalPanZoom: data.internalPanZoom } as CompositeNodeData };
        }
        if (node.type === NodeType.Stitch) {
            const inputs = getImageInputValues(nodeId);
            return { data: { ...(node.data as StitchNodeData), ...baseUpdate, outputImageUrl: inputs[0] || null, inputImageUrls: inputs } as StitchNodeData };
        }
        if (node.type === NodeType.RMBG) {
            const inputs = getImageInputValues(nodeId);
            return { data: { ...(node.data as RMBGNodeData), ...baseUpdate, outputImageUrl: inputs[0] || null, inputImageUrl: inputs[0] || null } as RMBGNodeData };
        }
        
        return { data: { ...node.data as NodeData, ...baseUpdate } };
    }

    switch (node.type) {
      case NodeType.Text: {
        const data = node.data as TextNodeData;
        return { data: { ...data } };
      }
      case NodeType.Assistant: {
        const data = node.data as AssistantNodeData;
        const textInputs = getTextInputValues(nodeId);
        const imageInputs = [...getImageInputValues(nodeId, 'image-in'), ...getImageInputValues(nodeId, 'reference-in')];
        const finalPrompt = [data.prompt, ...textInputs].filter(Boolean).join('\n\n');
        
        const responseText = await generateText(finalPrompt, imageInputs.length > 0 ? imageInputs : null, data.systemPrompt);
        return { data: { ...data, response: responseText } };
      }
      case NodeType.Array: {
        const data = node.data as ArrayNodeData;
        const inputs = getTextInputValues(nodeId);
        const inputText = inputs.join('\n');
        let items: string[] = [];

        if (data.separator && inputText) {
            if (data.separator === '*') {
                items = inputText.split('*').map(s => s.trim()).filter(s => s.length > 0);
            } else if (data.separator === '\\n') {
                items = inputText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            } else {
                items = inputText.split(data.separator).map(s => s.trim()).filter(s => s.length > 0);
            }
        } else if (inputText) {
             items = [inputText].filter(s => s.length > 0);
        }
        
        return { data: { ...data, text: inputText, items: items } };
      }
      case NodeType.List: {
        const data = node.data as ListNodeData;
        const arrayInput = getArrayInputValue(nodeId, 'array-in');
        const selectedItem = arrayInput[data.index] || "";
        
        return { data: { ...data, arrayInput: arrayInput, output: selectedItem } };
      }
      case NodeType.SelectImage: {
        const data = node.data as SelectImageNodeData;
        const imageList = getArrayInputValue(nodeId, 'image-list-in');
        const selectedUrl = imageList[data.index] || null;
        return { data: { ...data, imageList, outputUrl: selectedUrl } };
      }
      case NodeType.PromptConcatenator: {
        const data = node.data as PromptConcatenatorNodeData;
        const inputs = getTextInputValues(nodeId);
        let separator = data.separator;
        if (separator === '\\n') separator = '\n';
        
        const result = inputs.join(separator || '\n');
        return { data: { ...data, concatenatedText: result } };
      }
      case NodeType.Composite: {
        const data = node.data as CompositeNodeData;
        const inputImageUrls = getImageInputValues(nodeId); 
        const updatedLayers: CompositeLayer[] = [];

        let contentAreaWidth = node.size.width - COMPOSITE_NODE_CONTENT_PADDING_X;
        let contentAreaHeight = node.size.height - COMPOSITE_NODE_HEADER_HEIGHT - COMPOSITE_NODE_CONTENT_PADDING_Y_TOP - COMPOSITE_NODE_CONTENT_PADDING_Y_BOTTOM - COMPOSITE_NODE_BUTTON_HEIGHT - COMPOSITE_NODE_INTERNAL_SPACING;

        contentAreaWidth = Math.max(1, contentAreaWidth);
        contentAreaHeight = Math.max(1, contentAreaHeight);

        let layerOffset = 0;
        await Promise.all(
            inputImageUrls.map(async (url) => {
                const existingLayer = data.layers.find(layer => layer.url === url);
                if (existingLayer) {
                    updatedLayers.push(existingLayer);
                } else {
                    const img = new Image();
                    img.src = url;
                    await img.decode(); 
                    const initialScale = Math.min(1, contentAreaWidth / img.width, contentAreaHeight / img.height);
                    updatedLayers.push({
                        id: generateId('layer'),
                        url: url,
                        x: contentAreaWidth / 2 + layerOffset,
                        y: contentAreaHeight / 2 + layerOffset,
                        scale: initialScale,
                        rotation: 0,
                        originalWidth: img.width,
                        originalHeight: img.height,
                    });
                    layerOffset += 10;
                }
            })
        );
        const filteredLayers = updatedLayers.filter(layer => inputImageUrls.includes(layer.url));
        filteredLayers.sort((a, b) => {
            const indexA = inputImageUrls.indexOf(a.url);
            const indexB = inputImageUrls.indexOf(b.url);
            return indexA - indexB;
        });
        return { data: { ...data, outputImageUrl: null, layers: filteredLayers, internalPanZoom: data.internalPanZoom || { x: 0, y: 0, k: 1 } } };
      }
      case NodeType.Stitch: {
        const data = node.data as StitchNodeData;
        const inputImages = getImageInputValues(nodeId);
        if (inputImages.length < 2) {
            console.warn("Stitch node requires at least 2 image inputs.");
            return { data: { ...data, outputImageUrl: null, inputImageUrls: inputImages } };
        }
        const result = await stitchImages(inputImages, data.direction);
        if (result) {
            onAssetGenerated({ type: 'image', url: result });
        }
        return { data: { ...data, outputImageUrl: result, inputImageUrls: inputImages } };
      }
      case NodeType.RMBG: {
        const data = node.data as RMBGNodeData;
        const inputImageUrls = getImageInputValues(nodeId);
        if (inputImageUrls.length === 0) {
            console.warn("RMBG node requires an image input.");
            return { data: { ...data, outputImageUrl: null, inputImageUrl: null } };
        }
        return { data: { ...data, inputImageUrl: inputImageUrls[0], outputImageUrl: null } };
      }
      case NodeType.Image: {
        const data = node.data as ImageNodeData;
        const prompts = getTextInputValues(nodeId);
        const referenceImages = [...getImageInputValues(nodeId, 'image-in'), ...getImageInputValues(nodeId, 'reference-in')];
        
        const processedReferenceImages = [];
        if (referenceImages.length > 0) {
            const processedImage = await preprocessImageForOutpainting(referenceImages[0], data.aspectRatio);
            processedReferenceImages.push(processedImage);
            for (let i = 1; i < referenceImages.length; i++) {
                processedReferenceImages.push(await urlToDataURL(referenceImages[i]));
            }
        }

        const result = await generateImage(prompts.join('\n\n'), data.aspectRatio, processedReferenceImages, 'gemini-3.1-flash-image-preview', data.imageSize || '1K');
        if (result && result.length > 0) {
            result.forEach(url => onAssetGenerated({ type: 'image', url }));
        }
        return { data: { ...data, imageUrls: result } };
      }
      case NodeType.ImagePreview: {
        const data = node.data as ImagePreviewNodeData;
        const prompts = getTextInputValues(nodeId);
        const referenceImages = [...getImageInputValues(nodeId, 'image-in'), ...getImageInputValues(nodeId, 'reference-in')];
        
        const processedReferenceImages = [];
        if (referenceImages.length > 0) {
            const processedImage = await preprocessImageForOutpainting(referenceImages[0], data.aspectRatio);
            processedReferenceImages.push(processedImage);
             for (let i = 1; i < referenceImages.length; i++) {
                processedReferenceImages.push(await urlToDataURL(referenceImages[i]));
            }
        }
        const result = await generateImage(prompts.join('\n\n'), data.aspectRatio, processedReferenceImages, 'gemini-2.5-flash-image');
        if (result && result.length > 0) {
            result.forEach(url => onAssetGenerated({ type: 'image', url }));
        }
        return { data: { ...data, imageUrls: result } };
      }
      case NodeType.ImageEdit: {
        const data = node.data as ImageEditNodeData;
        const prompts = getTextInputValues(nodeId);
        const imageInputs = [...getImageInputValues(nodeId, 'image-in'), ...getImageInputValues(nodeId, 'reference-in')];
        if (imageInputs.length === 0) {
          console.error("ImageEditNode requires an image input.");
          return { data: { ...data, outputImageUrl: null } };
        }
        const result = await editImage(prompts.join('\n\n'), imageInputs, data.imageSize || '1K');
        if (result) {
            onAssetGenerated({ type: 'image', url: result });
        }
        return { data: { ...data, outputImageUrl: result } };
      }
      case NodeType.ImageModify: {
        const data = node.data as ImageModifyNodeData;
        const prompts = getTextInputValues(nodeId);
        const imageInputs = [...getImageInputValues(nodeId, 'image-in')];
        const sourceImage = imageInputs[0] || data.inputImageUrl;

        if (!sourceImage) {
            console.error("ImageModifyNode requires an image input.");
            return { data: { ...data, outputImageUrl: null } };
        }

        // Strategy: Provide the original image AND the marked-up image as context.
        // We instruct the model to use the red markings as guidance.
        const combinedPrompt = `${prompts.join('\n\n')}\n\nCRITICAL INSTRUCTION: The red markings in the second reference image specify where modifications should occur. Keep all other parts of the first image pixel-perfect. No text allowed in output.`;
        
        const markupRef = data.markupDataUrl || sourceImage;
        const result = await generateImage(combinedPrompt, '1:1', [sourceImage, markupRef], 'gemini-3.1-flash-image-preview');
        const finalUrl = result?.[0] || null;
        if (finalUrl) {
            onAssetGenerated({ type: 'image', url: finalUrl });
        }
        return { data: { ...data, outputImageUrl: finalUrl } };
      }
      case NodeType.OutfitDetail: {
        const data = node.data as OutfitDetailNodeData;
        const imageInputs = getImageInputValues(nodeId, 'image-in');
        const sourceImage = imageInputs[0] || data.inputImageUrl;

        if (!sourceImage) {
            console.error("OutfitDetailNode requires an image input.");
            return { data: { ...data, isLoading: false } };
        }

        const response = await generateText(
            "Analyze the garment in this image and provide a detailed technical specification following the VTON-Pro Deterministic Reconstruction Engine format.",
            [sourceImage],
            SYSTEM_PROMPTS['VTON Detail']
        );

        return { data: { ...data, technicalSpec: response, inputImageUrl: sourceImage, isLoading: false } };
      }
      case NodeType.GridShot: {
        const data = node.data as GridShotNodeData;
        const prompts = getTextInputValues(nodeId);
        const referenceImages = getImageInputValues(nodeId, 'image-in');
        
        const gridInstruction = data.gridSize ? `Generate a ${data.gridSize} grid.` : "Generate a 7x6 grid.";
        const fullPrompt = `${prompts.join('\n\n')}\n\n${gridInstruction}`;

        const result = await generateImage(fullPrompt, '3:4', referenceImages, 'gemini-3.1-flash-image-preview');
        const imageUrl = result?.[0] || null;
        if (imageUrl) {
            onAssetGenerated({ type: 'image', url: imageUrl });
        }
        return { data: { ...data, outputImageUrl: imageUrl } };
      }
      case NodeType.GridExtractor: {
        const data = node.data as GridExtractorNodeData;
        const inputs = getImageInputValues(nodeId);
        if (inputs.length === 0) return { data: { ...data, isLoading: false } };
        
        const inputUrl = inputs[0];
        updateNodeData(nodeId, { isLoading: true, loadingMessage: 'AI 분석 중...', inputImageUrl: inputUrl });
        
        const detectionResult = await detectGridItems(inputUrl);
        if (!detectionResult || !detectionResult.items || detectionResult.items.length === 0) {
            return { data: { ...data, isLoading: false, loadingMessage: '추출할 이미지를 찾지 못했습니다.' } };
        }
        
        updateNodeData(nodeId, { loadingMessage: `정밀 크롭 및 후처리 중 (0/${detectionResult.items.length})...` });
        
        const extractedItems = [];
        for (let i = 0; i < detectionResult.items.length; i++) {
            const item = detectionResult.items[i];
            updateNodeData(nodeId, { loadingMessage: `정밀 크롭 및 후처리 중 (${i + 1}/${detectionResult.items.length})...` });
            
            try {
                const croppedUrl = await cropAndTrimImage(inputUrl, item.bbox);
                if (croppedUrl) {
                    extractedItems.push({
                        id: generateId('ext'),
                        url: croppedUrl,
                        label: item.label,
                        bbox: item.bbox
                    });
                }
            } catch (err) {
                console.error("Extraction error for item", i, err);
            }
        }
        
        return { 
            data: { 
                ...data, 
                isLoading: false, 
                loadingMessage: '추출 완료', 
                extractedItems,
                inputImageUrl: inputUrl
            } 
        };
      }
      case NodeType.Video: {
        const data = node.data as VideoNodeData;
        const prompts = getTextInputValues(nodeId);
        const firstImageInputs = getImageInputValues(nodeId, 'first-image-in');
        const lastImageInputs = getImageInputValues(nodeId, 'last-image-in');
        const videoInputObject = getVideoInputValue(nodeId, 'video-in');
        const referenceImageInputs = getImageInputValues(nodeId, 'reference-image-in');
        
        const result = await generateVideo(
            prompts.join('\n\n'), 
            firstImageInputs[0] || null, 
            lastImageInputs[0] || null,
            data.resolution,
            videoInputObject,
            (message: string) => updateNodeData(nodeId, { loadingMessage: message }),
            referenceImageInputs,
            data.aspectRatio // Added logic: Passing aspect ratio correctly
        );
        
        if (result.videoUrl) {
            onAssetGenerated({ type: 'video', url: result.videoUrl });
        }
        
        return { 
            data: { 
                ...data, 
                videoUrl: result.videoUrl, 
                lastFrameUrl: result.lastFrameUrl,
                firstFrameUrl: result.firstFrameUrl,
                videoObject: result.videoObject 
            } 
        };
      }
      case NodeType.VideoStitch: {
        const data = node.data as VideoStitchNodeData;
        const v1 = getVideoUrlInputValue(nodeId, 'video-in-1');
        const v2 = getVideoUrlInputValue(nodeId, 'video-in-2');
        
        // Prioritize already stitched result if present, otherwise show inputs as preview
        const output = data.stitchedVideoUrl || v1 || v2;
        return { 
            data: { 
                ...data, 
                video1Url: v1, 
                video2Url: v2, 
                outputVideoUrl: output
            } 
        };
      }
      case NodeType.Model: {
        const data = node.data as ModelNodeData;
        const imageInputs = getImageInputValues(nodeId);
        let result: string | null;
        
        const getRandomItem = (arr: readonly string[]) => {
            const validItems = arr.filter(item => item.toLowerCase() !== 'random');
            return validItems[Math.floor(Math.random() * validItems.length)];
        };

        const appliedOptions = data.useAppliedOptionsNext && data.appliedOptions ? { ...data.appliedOptions } : {
            gender: data.gender,
            age: data.age,
            nationality: data.nationality,
            faceShape: data.faceShape.toLowerCase() === 'random' ? getRandomItem(MODEL_FACE_SHAPES) : data.faceShape,
            hairStyle: data.hairStyle.toLowerCase() === 'random' ? getRandomItem(MODEL_HAIR_STYLES) : data.hairStyle,
            hairColor: data.hairColor.toLowerCase() === 'random' ? getRandomItem(MODEL_HAIR_COLORS) : data.hairColor,
            additionalPrompt: data.additionalPrompt,
        };

        if (imageInputs.length > 0) {
            result = await generateModelFromImage(imageInputs[0]);
        } else {
            result = await generateVirtualModel(appliedOptions);
        }
        if (result) {
            onAssetGenerated({ type: 'image', url: result });
        }
        return { data: { ...data, outputImageUrl: result, appliedOptions, useAppliedOptionsNext: false } };
      }
      case NodeType.Vton: {
        const data = node.data as VtonNodeData;
        const modelInputImages = getImageInputValues(nodeId, 'model-in');
        const outfitInputImages = getImageInputValues(nodeId, 'outfit-in');
        
        if (!modelInputImages[0] || !outfitInputImages[0]) {
            console.error("VTON node requires both model and outfit inputs.");
            return { data: { ...data } };
        }

        const result = await generateVtonImage(modelInputImages[0], outfitInputImages[0], data.pose);
        if (result) {
            onAssetGenerated({ type: 'image', url: result });
            
            // UI의 stylingList와 mainImageUrl 동기화
            const newItem: VtonStylingItem = {
                id: `styling-${Date.now()}`,
                url: result,
                outfitId: 'connected-outfit',
                pose: data.pose,
                sourceImageUrl: modelInputImages[0],
            };
            
            return { 
                data: { 
                    ...data, 
                    outputImageUrl: result, 
                    mainImageUrl: result, 
                    stylingList: [...data.stylingList, newItem],
                    selectedStylingId: newItem.id 
                } 
            };
        }
        return { data: { ...data, outputImageUrl: result } };
      }
      case NodeType.Storyboard: {
        const data = node.data as StoryboardNodeData;
        const promptInput = getTextInputValues(nodeId).join('\n') || 'a fashion model';
        const imageInputs = getImageInputValues(nodeId);
        
        if (imageInputs.length === 0) {
            console.warn("Storyboard node: No image input detected.");
            return { data: { ...data, isLoading: false } };
        }
        
        const keyVisual = imageInputs[0];
        
        let updatedScenes = data.scenes.map((scene, i) => {
             if (i === 0) return { ...scene, imageUrl: keyVisual, isLoading: false };
             return { ...scene, isLoading: true };
        });
        updateNodeData(nodeId, { scenes: updatedScenes, isLoading: true });

        let scenarios = null;
        try {
             scenarios = await generateStoryboardScenario(promptInput, keyVisual);
        } catch (e) {
            console.error("Failed to generate scenarios", e);
            updateNodeData(nodeId, { isLoading: false });
            updatedScenes = updatedScenes.map(s => ({...s, isLoading: false}));
            updateNodeData(nodeId, { scenes: updatedScenes, isLoading: false });
            return { data: { ...data, isLoading: false, scenes: updatedScenes } };
        }

        if (!scenarios || scenarios.length === 0) {
            updatedScenes = updatedScenes.map(s => ({...s, isLoading: false}));
            updateNodeData(nodeId, { scenes: updatedScenes, isLoading: false });
            return { data: { ...data, isLoading: false, scenes: updatedScenes } };
        }
        
        updatedScenes = updatedScenes.map((scene, i) => {
            if (i === 0) return scene;
            if (scenarios && scenarios[i]) return { ...scene, ...scenarios[i] };
            return scene;
        });
        
        updateNodeData(nodeId, { scenes: updatedScenes });
        
        let lastImageUrl = keyVisual;
        let localScenes = updatedScenes.map(s => ({ ...s }));

        for (let i = 1; i < localScenes.length; i++) {
            const scene = localScenes[i];
            
            if (!scene.englishPrompt) {
                localScenes[i].isLoading = false;
                updateNodeData(nodeId, { scenes: localScenes.map(s => ({...s})) });
                continue;
            }
            
            try {
                const processedReference = await preprocessImageForOutpainting(lastImageUrl, data.aspectRatio);
                const newImageUrl = await generateConsistentImage(scene.englishPrompt, [processedReference], data.aspectRatio);
                
                if (newImageUrl) {
                    const res = await fetch(newImageUrl);
                    const blob = await res.blob();
                    const blobUrl = URL.createObjectURL(blob);

                    lastImageUrl = blobUrl; 
                    localScenes[i].imageUrl = blobUrl;
                    onAssetGenerated({ type: 'image', url: blobUrl });
                }
            } catch (error) {
                console.error(`Error generating scene ${i + 1}:`, error);
            } finally {
                localScenes[i].isLoading = false;
                updateNodeData(nodeId, { scenes: localScenes.map(s => ({...s})) }); 
            }
        }
        
        return { data: { ...data, scenes: localScenes, isLoading: false } };
      }
      case NodeType.Script: {
        const data = node.data as ScriptNodeData;

        let productInfo: { productName: string, category: string, concept: string, sceneConcepts: string[] } | null = null;
        let scriptDataFromApi = data.scriptData;

        if (!data.isAnalyzed) {
            updateNodeData(nodeId, { isLoading: true, loadingMessage: '제품 정보 분석 중...' });
            const analysisInput = {
                 url: data.url && data.url.startsWith('http') && !data.url.match(/\.(mp4|webm|mov)$/i) ? data.url : undefined,
                 text: data.description || undefined,
                 videoFrames: data.videoFrames || [],
                 images: [
                     ...(data.productImages || []).map(img => img.url),
                     ...(data.modelImages || []).map(img => img.url)
                 ]
            };

            const pi = await analyzeProductInfo(analysisInput);
            if (!pi) {
                throw new Error("Failed to analyze product info.");
            }
            productInfo = pi;
            updateNodeData(nodeId, { 
                isAnalyzed: true, 
                sceneConcepts: pi.sceneConcepts 
            });
        } else {
             productInfo = {
                productName: data.scriptData?.productName || 'Unknown',
                category: data.scriptData?.category || 'Unknown',
                concept: data.scriptData?.concept || 'Unknown',
                sceneConcepts: data.sceneConcepts || []
            };
        }
        if (!scriptDataFromApi || !scriptDataFromApi.shotList || scriptDataFromApi.shotList.length === 0) {
             updateNodeData(nodeId, { loadingMessage: '스크립트 생성 중...' });
             const categoryGuide = data.productCategory ? CATEGORY_STYLES[data.productCategory] : "";
             const script = await generateScriptFromStyle(
                 productInfo!, 
                 data.selectedScriptStyle, 
                 data.videoDuration,
                 categoryGuide
             );
             if (!script) {
                throw new Error("Failed to generate script from style.");
             }
             scriptDataFromApi = script;
             const shotsWithImages = script.shotList.map(shot => ({ ...shot, imageUrl: null, isLoading: false }));
             scriptDataFromApi.shotList = shotsWithImages;
             updateNodeData(nodeId, { scriptData: scriptDataFromApi });
        }

        updateNodeData(nodeId, { loadingMessage: '장면 이미지 생성 중...' });
        const finalPrompt = null; 
        updateNodeData(nodeId, { scriptData: scriptDataFromApi, finalPrompt });
        const rawReferenceImages = [...(data.productImages || []).map(img => img.url), ...(data.modelImages || []).map(img => img.url)];
        const aspectRatio = data.aspectRatio || '16:9';
        const limitedRefs = rawReferenceImages.slice(0, 4); 
        const staticProcessedRefs = await Promise.all(
            limitedRefs.map(img => preprocessImageForOutpainting(img, aspectRatio))
        );

        let lastGeneratedImageBase64: string | null = null; 
        const newOutputs: Connector[] = [{ id: 'prompt-out', name: 'Final Prompt', type: ConnectorType.Text }];
        let currentShots = [...(scriptDataFromApi?.shotList || [])];

        for (let i = 0; i < currentShots.length; i++) {
            currentShots = currentShots.map((shot, index) => 
                index === i ? { ...shot, isLoading: true } : shot
            );
            updateNodeData(nodeId, { 
                scriptData: { ...scriptDataFromApi!, shotList: currentShots },
                loadingMessage: `장면 생성 중 (${i + 1}/${currentShots.length})` 
            });

            const shotToProcess = currentShots[i];
            const imagePrompt = constructPromptFromShot(shotToProcess);
            const imagesForConsistency = [...staticProcessedRefs];
            if (i > 0 && lastGeneratedImageBase64) {
                imagesForConsistency.push(lastGeneratedImageBase64);
            }

            let newImageUrl: string | null = null;
            try {
                let resultBase64: string | null = null;
                if (imagesForConsistency.length > 0) {
                    resultBase64 = await generateConsistentImage(imagePrompt, imagesForConsistency, aspectRatio);
                } else {
                    const promptWithConstraint = `${imagePrompt}\n\nCRITICAL: The generated image must NOT contain any text, letters, words, or logos of any kind.`;
                    const result = await generateImage(promptWithConstraint, aspectRatio, [], 'gemini-2.5-flash-image');
                    resultBase64 = result?.[0] || null;
                }
                if (resultBase64) {
                    const res = await fetch(resultBase64);
                    const blob = await res.blob();
                    newImageUrl = URL.createObjectURL(blob);
                    lastGeneratedImageBase64 = resultBase64;
                    onAssetGenerated({ type: 'image', url: newImageUrl });
                }
            } catch (error) {
                console.error(`Error generating image for shot ${i + 1}:`, error);
            } finally {
                currentShots = currentShots.map((shot, index) => 
                    index === i ? { ...shot, imageUrl: newImageUrl, isLoading: false } : shot
                );
                newOutputs.push({
                    id: `image-out-${i + 1}`,
                    name: `Image Out ${i + 1}`,
                    type: ConnectorType.Image
                });
                // outputs는 NodeData 타입이 아니므로 setNodes로 직접 업데이트
                setNodes(draft => { if(draft[nodeId]) { draft[nodeId].data = { ...draft[nodeId].data, scriptData: { ...scriptDataFromApi!, shotList: currentShots } } as any; draft[nodeId].outputs = newOutputs; } });
            }
        }

        const finalData = { 
            ...data, 
            scriptData: { ...scriptDataFromApi!, shotList: currentShots }, 
            finalPrompt, 
            isAnalyzed: true, 
            sceneConcepts: productInfo!.sceneConcepts,
            loadingMessage: '완료',
            isLoading: false
        };
        return { data: finalData, outputs: newOutputs };
      }
      case NodeType.ImageLoad: {
        const data = node.data as ImageLoadNodeData;
        return { data: { ...data } };
      }
      case NodeType.VideoLoad: {
        const data = node.data as VideoLoadNodeData;
        return { data: { ...data } };
      }
      case NodeType.Camera: {
        const data = node.data as CameraNodeData;
        return { data: { ...data } };
      }
      case NodeType.CameraPreset: { // Added CameraPreset
        const data = node.data as CameraPresetNodeData;
        return { data: { ...data } };
      }
      case NodeType.Preset: {
        const data = node.data as PresetNodeData;
        return { data: { ...data } };
      }
      case NodeType.Comment: {
        const data = node.data as CommentNodeData;
        return { data: { ...data } };
      }
      case NodeType.Group: {
        return { data: { ...node.data } };
      }
      default: {
        console.warn(`Execution logic for node type ${node.type} not implemented.`);
        return {};
      }
    }
  }, [nodes, connections, updateNodeData, onAssetGenerated]);

  const handleFitGroupToNodes = useCallback((groupId: string) => {
    setNodes(draft => {
      const groupNode = draft[groupId];
      if (!groupNode || groupNode.type !== NodeType.Group) return;

      const padding = 30;
      const headerHeight = 50;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      let hasNodes = false;

      Object.keys(draft).forEach(key => {
          if (key === groupId) return;
          const node = draft[key];
          if (!node || node.hidden) return;
          const nRight = node.position.x + node.size.width;
          const nBottom = node.position.y + node.size.height;
          const gRight = groupNode.position.x + groupNode.size.width;
          const gBottom = groupNode.position.y + groupNode.size.height;
          const isInside = (
              node.position.x >= groupNode.position.x &&
              node.position.y >= groupNode.position.y &&
              nRight <= gRight &&
              nBottom <= gBottom
          );
          if (isInside) {
              hasNodes = true;
              minX = Math.min(minX, node.position.x);
              minY = Math.min(minY, node.position.y);
              maxX = Math.max(maxX, node.position.x + node.size.width);
              maxY = Math.max(maxY, node.position.y + node.size.height);
          }
      });

      if (hasNodes) {
          const newX = minX - padding;
          const newY = minY - padding - headerHeight;
          const newWidth = (maxX + padding) - newX;
          const newHeight = (maxY + padding) - newY;
          groupNode.position = { x: newX, y: newY };
          groupNode.size = { width: Math.max(200, newWidth), height: Math.max(150, newHeight) };
      }
    });
  }, [setNodes]);

  useEffect(() => {
    nodeRenderOrderRef.current = nodeRenderOrder;
  }, [nodeRenderOrder]);

  // D3 zoom useEffect는 useCanvas 훅으로 이동됨 (SPEC-UI-001 M1)

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      const imageUrls: string[] = [];
      let pendingReads = 0;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            pendingReads++;
            const reader = new FileReader();
            reader.onload = (e) => {
              const imageUrl = e.target?.result as string;
              if (imageUrl) { imageUrls.push(imageUrl); }
              pendingReads--;
              if (pendingReads === 0 && imageUrls.length > 0) { createNodeWithImages(imageUrls); }
            };
            reader.readAsDataURL(file);
          }
        }
      }
      if (pendingReads > 0) { event.preventDefault(); }
    };
    
    const createNodeWithImages = (urls: string[]) => {
        const id = `${NodeType.ImageLoad}-${Date.now()}`;
        const newNode: Node = {
          id, type: NodeType.ImageLoad, position: { x: 100, y: 100 }, size: { width: 300, height: 300 }, data: { imageUrls: urls }, inputs: [], outputs: [{ id: 'image-out', name: 'Image Out', type: ConnectorType.Image }], isBypassed: false
        };
        setNodes(draft => { draft[id] = newNode; });
        setNodeRenderOrder(draft => { draft.push(id) });
    };

    window.addEventListener('paste', handlePaste);
    return () => { window.removeEventListener('paste', handlePaste); };
  }, [setNodes, setNodeRenderOrder]);

  const duplicateNodes = useCallback((sourceNodes: Node[], sourceConnections: Connection[], offset: Point, selectNewNodes: boolean) => {
      const idMap: Record<string, string> = {};
      const newNodes: Node[] = sourceNodes.map(node => {
          const newId = generateId(node.type);
          idMap[node.id] = newId;
          return { ...node, id: newId, position: { x: node.position.x + offset.x, y: node.position.y + offset.y }, data: { ...node.data, isLoading: false } };
      });
      const newConnections: Connection[] = sourceConnections.map(conn => ({
          id: generateId('conn'), fromNodeId: idMap[conn.fromNodeId], fromConnectorId: conn.fromConnectorId, toNodeId: idMap[conn.toNodeId], toConnectorId: conn.toConnectorId
      }));
      setNodes(draft => { newNodes.forEach(node => draft[node.id] = node); });
      loadConnections([...connections, ...newConnections]);
      setNodeRenderOrder(draft => {
          newNodes.forEach(node => {
              if (node.type === NodeType.Group) { draft.unshift(node.id); } else { draft.push(node.id); }
          });
      });
      if (selectNewNodes) { setSelectedNodeIds(newNodes.map(n => n.id)); }
  }, [setNodes, loadConnections, connections, setNodeRenderOrder]);

  // useKeyboardShortcuts: Delete/Bypass/Duplicate/Undo/SelectAll 단축키 (SPEC-UI-001 M5)
  useKeyboardShortcuts({
    onDelete: () => {
      if (selectedConnectionId) { deleteConnections([selectedConnectionId]); selectConnection(undefined); }
      if (selectedNodeIds.length > 0) {
        setNodes(draft => { selectedNodeIds.forEach(id => { delete draft[id]; }); });
        deleteConnectionsForNodes(selectedNodeIds);
        setNodeRenderOrder(draft => draft.filter(id => !selectedNodeIds.includes(id)));
        setSelectedNodeIds([]);
      }
    },
    onBypass: () => {
      if (selectedNodeIds.length > 0) { selectedNodeIds.forEach(id => handleToggleBypass(id)); }
    },
    onDuplicate: () => {
      if (selectedNodeIds.length > 0) {
        const nodesToCopy = selectedNodeIds.map(id => nodes[id]).filter(Boolean);
        const connectionsToCopy = connections.filter(c => selectedNodeIds.includes(c.fromNodeId) && selectedNodeIds.includes(c.toNodeId));
        if (nodesToCopy.length > 0) { duplicateNodes(nodesToCopy, connectionsToCopy, { x: 50, y: 50 }, true); }
      }
    },
    onUndo: () => {
      const prev = undoState();
      if (prev) { loadNodes(prev.nodes, prev.nodeRenderOrder); loadConnections(prev.connections); }
    },
    onSelectAll: () => { setSelectedNodeIds(Object.keys(nodes)); },
  });

  // 나머지 단축키 (Ctrl+C/V/S/N, V/H/C 도구 전환) — useKeyboardShortcuts에 포함되지 않는 단축키
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { return; }
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (isCtrlOrMeta && key === 'c') {
        const nodesToCopy = selectedNodeIds.map(id => nodes[id]).filter(Boolean);
        const connectionsToCopy = connections.filter(c => selectedNodeIds.includes(c.fromNodeId) && selectedNodeIds.includes(c.toNodeId));
        if (nodesToCopy.length > 0) { clipboardRef.current = { nodes: nodesToCopy, connections: connectionsToCopy }; }
      } else if (isCtrlOrMeta && key === 'v') {
        if (clipboardRef.current) { duplicateNodes(clipboardRef.current.nodes, clipboardRef.current.connections, { x: 50, y: 50 }, true); }
      } else if (isCtrlOrMeta && key === 's') {
        event.preventDefault(); setIsSaveModalOpen(true);
      } else if (isCtrlOrMeta && key === 'n') {
        event.preventDefault();
        if (confirm("Create new project? Unsaved changes will be lost.")) { loadNodes({}, []); loadConnections([]); setHistory([]); restoreTransform({ x: 0, y: 0, k: 1 }); }
      } else if (!isCtrlOrMeta) {
        switch (key) {
          case 'v': setActiveTool('select'); break;
          case 'h': setActiveTool('pan'); break;
          case 'c': setActiveTool('comment'); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [selectedNodeIds, nodes, connections, duplicateNodes, loadNodes, loadConnections, restoreTransform]);

  // pendingConnection 마우스 이동 이벤트 처리: SVG path ref 업데이트
  const updatePendingPath = useCallback((e: MouseEvent) => {
    if (!pendingConnection || !svgRef.current || !pendingConnectionPathRef.current) return;
    const svgBounds = svgRef.current.getBoundingClientRect();
    const [worldX, worldY] = getWorldPosition(e.clientX - svgBounds.left, e.clientY - svgBounds.top);
    const fromPoint = getConnectorPosition(pendingConnection.fromNodeId, pendingConnection.fromConnector.id, false);
    const toPoint = { x: worldX, y: worldY };
    const pathData = `M ${fromPoint.x} ${fromPoint.y} C ${fromPoint.x + 75} ${fromPoint.y}, ${toPoint.x - 75} ${toPoint.y}, ${toPoint.x} ${toPoint.y}`;
    pendingConnectionPathRef.current.setAttribute('d', pathData);
  }, [pendingConnection, getConnectorPosition, getWorldPosition]);

  // mouseup 시 pendingConnection path 숨기기 및 연결 취소
  const handleWindowMouseUp = useCallback(() => {
    if (pendingConnection) {
      if (pendingConnectionPathRef.current) { pendingConnectionPathRef.current.style.display = 'none'; }
      cancelConnection();
    }
  }, [pendingConnection, cancelConnection]);

  useEffect(() => {
    if (pendingConnection) {
      window.addEventListener('mousemove', updatePendingPath);
      window.addEventListener('mouseup', handleWindowMouseUp);
      return () => {
        window.removeEventListener('mousemove', updatePendingPath);
        window.removeEventListener('mouseup', handleWindowMouseUp);
      };
    }
  }, [pendingConnection, updatePendingPath, handleWindowMouseUp]);

  // addNode: 화면 중앙 좌표를 계산하여 훅의 addNode에 전달
  // useNodes 훅의 getWorldPosition을 화면 중앙 좌표로 호출하기 위해 래퍼 유지
  const addNode = useCallback((type: NodeType) => {
    const id = `${type}-${Date.now()}`;
    let x = 100; let y = 100;
    if (svgRef.current) {
        const svgBounds = svgRef.current.getBoundingClientRect();
        const [worldX, worldY] = getWorldPosition(svgBounds.width / 2, svgBounds.height / 2);
        x = worldX; y = worldY;
    }
    // 대부분의 노드: 기본 위치 오프셋
    let position = { x: x - 150, y: y - 100 };

    // 대형 노드: 위치 오프셋 조정
    if (type === NodeType.Storyboard) position = { x: x - 375, y: y - 550 };
    else if (type === NodeType.Script) position = { x: x - 400, y: y - 450 };

    const newNode = createNode(type, id, position);

    // 동적 상수값이 필요한 노드: 기본값을 상수로 덮어쓰기
    if (type === NodeType.Assistant) {
      (newNode.data as unknown as { systemPrompt: string }).systemPrompt = SYSTEM_PROMPTS['Image & Video'];
    }
    if (type === NodeType.Vton) {
      (newNode.data as unknown as { pose: typeof POSE_PRESETS[0] }).pose = POSE_PRESETS[0];
    }

    setNodes(draft => { draft[id] = newNode; });
    setNodeRenderOrder(draft => { if (type === NodeType.Group) { draft.unshift(id); } else { draft.push(id); } });
  }, [getWorldPosition, setNodes, setNodeRenderOrder]);

  // deleteNode: useNodes 훅의 deleteNodes 래퍼 (단일 노드 삭제)
  const deleteNode = useCallback((id: string) => {
    deleteNodes([id]);
  }, [deleteNodes]);

  // copyNode: useNodes 훅의 duplicateNode 래퍼
  const copyNode = useCallback((id: string) => {
    hookDuplicateNode(id);
  }, [hookDuplicateNode]);

  const handleNodeDrag = (e: DraggableEvent, data: any, draggedNodeId: string) => {
    const deltaX = data.deltaX / panZoom.k;
    const deltaY = data.deltaY / panZoom.k;
    setNodes(draft => {
        const currentSelection = selectedNodeIdsRef.current;
        const idsToMove = currentSelection.length > 1 && currentSelection.includes(draggedNodeId) ? currentSelection : [draggedNodeId];
        idsToMove.forEach(id => {
            const node = draft[id];
            if (node) {
                const childrenIds: string[] = [];
                if (node.type === NodeType.Group && !node.isCollapsed) {
                    Object.keys(draft).forEach(key => {
                        const otherNode = draft[key];
                        if (otherNode.id !== id && !otherNode.hidden && !idsToMove.includes(key) && isNodeInsideGroup(otherNode as unknown as Node, node as unknown as Node)) {
                             childrenIds.push(key);
                        }
                    });
                }
                node.position.x += deltaX; node.position.y += deltaY;
                childrenIds.forEach(childId => {
                    const child = draft[childId];
                    if (child) { child.position.x += deltaX; child.position.y += deltaY; }
                });
            }
        });
    });
  };

  const handleNodeDragStart = (nodeId: string, e: DraggableEvent) => {
    const mouseEvent = e as unknown as React.MouseEvent;
    if (!selectedNodeIdsRef.current.includes(nodeId)) { handleSelectNode(nodeId, mouseEvent); }
    if (mouseEvent.altKey) {
        let effectiveIds = selectedNodeIdsRef.current;
        if (!effectiveIds.includes(nodeId)) { effectiveIds = [nodeId]; }
        const stationaryMap: Record<string, string> = {};
        const newStationaryNodes: Node[] = [];
        effectiveIds.forEach(id => {
            const movingNode = nodes[id]; if (!movingNode) return;
            const stationaryId = generateId(movingNode.type);
            stationaryMap[id] = stationaryId;
            newStationaryNodes.push({ ...movingNode, id: stationaryId });
        });
        setNodes(draft => { newStationaryNodes.forEach(n => { draft[n.id] = n; }); });
        setNodeRenderOrder(draft => { newStationaryNodes.forEach(n => { if (n.type === NodeType.Group) draft.unshift(n.id); else draft.unshift(n.id); }); });
        const extraConnections: Connection[] = [];
        const updatedConnections = connections.map(conn => {
            const srcMoving = effectiveIds.includes(conn.fromNodeId);
            const tgtMoving = effectiveIds.includes(conn.toNodeId);
            if (srcMoving && !tgtMoving) { return { ...conn, fromNodeId: stationaryMap[conn.fromNodeId] }; }
            else if (!srcMoving && tgtMoving) { return { ...conn, toNodeId: stationaryMap[conn.toNodeId] }; }
            else if (srcMoving && tgtMoving) { extraConnections.push({ ...conn, id: generateId('conn'), fromNodeId: stationaryMap[conn.fromNodeId], toNodeId: stationaryMap[conn.toNodeId] }); return conn; }
            return conn;
        });
        loadConnections([...updatedConnections, ...extraConnections]);
    }
  };

  // updateNodeSize: useNodes 훅의 resizeNode 래퍼 (최소 크기 적용 없이 직접 설정)
  // @MX:NOTE: 컴포넌트에서 전달되는 newSize는 이미 최소 크기가 적용된 값
  const updateNodeSize = useCallback((id: string, newSize: {width: number, height: number}) => {
    setNodes(draft => { if(draft[id]) { draft[id].size = newSize; } });
  }, [setNodes]);

  // handleToggleBypass, handleToggleCollapse는 useNodes 훅에서 제공됨 (SPEC-UI-001 M2)

  const handleWindowSelectionMove = useCallback((e: MouseEvent) => {
      if (activeTool !== 'select' || !selectionStartPoint.current || !svgRef.current) return;
      const svgBounds = svgRef.current.getBoundingClientRect();
      const [movedX, movedY] = getWorldPosition(e.clientX - svgBounds.left, e.clientY - svgBounds.top);
      setSelectionBox({
          x: Math.min(selectionStartPoint.current.x, movedX), y: Math.min(selectionStartPoint.current.y, movedY),
          width: Math.abs(selectionStartPoint.current.x - movedX), height: Math.abs(selectionStartPoint.current.y - movedY),
      });
  }, [activeTool, getWorldPosition]);

  const handleWindowSelectionUp = useCallback((e: MouseEvent) => {
      if (activeTool !== 'select' || !selectionStartPoint.current || !svgRef.current) {
           window.removeEventListener('mousemove', handleWindowSelectionMove);
           window.removeEventListener('mouseup', handleWindowSelectionUp);
           return;
      }
      const svgBounds = svgRef.current.getBoundingClientRect();
      const [movedX, movedY] = getWorldPosition(e.clientX - svgBounds.left, e.clientY - svgBounds.top);
      const finalBox = {
          x: Math.min(selectionStartPoint.current.x, movedX), y: Math.min(selectionStartPoint.current.y, movedY),
          width: Math.abs(selectionStartPoint.current.x - movedX), height: Math.abs(selectionStartPoint.current.y - movedY),
      };
      if (finalBox.width > 5 || finalBox.height > 5) {
          const selectedIds: string[] = [];
          Object.values(nodesRef.current).forEach((node: Node) => {
              if (node.hidden) return;
              const nodeRect = { x: node.position.x, y: node.position.y, width: node.size.width, height: node.size.height };
              if ( finalBox.x < nodeRect.x + nodeRect.width && finalBox.x + finalBox.width > nodeRect.x && finalBox.y < nodeRect.y + nodeRect.height && finalBox.y + finalBox.height > nodeRect.y ) { selectedIds.push(node.id); }
          });
          setSelectedNodeIds(selectedIds);
          selectedNodeIdsRef.current = selectedIds;
          if (selectedIds.length > 0) {
               setNodeRenderOrder(currentOrder => {
                  const allGroups = currentOrder.filter(nid => nodesRef.current[nid]?.type === NodeType.Group);
                  const allContent = currentOrder.filter(nid => nodesRef.current[nid]?.type !== NodeType.Group);
                  const selectedGroupIds = selectedIds.filter(nid => nodesRef.current[nid]?.type === NodeType.Group);
                  const selectedContentIds = selectedIds.filter(nid => nodesRef.current[nid]?.type !== NodeType.Group);
                  const reorderedGroups = [...allGroups.filter(nid => !selectedGroupIds.includes(nid)), ...selectedGroupIds];
                  const reorderedContent = [...allContent.filter(nid => !selectedContentIds.includes(nid)), ...selectedContentIds];
                  return [...reorderedGroups, ...reorderedContent];
              });
          }
      }
      setSelectionBox(null); selectionStartPoint.current = null;
      window.removeEventListener('mousemove', handleWindowSelectionMove);
      window.removeEventListener('mouseup', handleWindowSelectionUp);
  }, [activeTool, handleWindowSelectionMove, setNodeRenderOrder, getWorldPosition]);

  const handleSvgMouseUp = (e: React.MouseEvent) => {
      const targetEl = e.target as Element;
      if (activeTool === 'comment' && !selectionStartPoint.current) {
            if (targetEl !== svgRef.current && !targetEl.classList.contains('canvas-background')) return;
            let x = e.clientX; let y = e.clientY;
            if (svgRef.current) {
                const svgBounds = svgRef.current.getBoundingClientRect();
                const [worldX, worldY] = getWorldPosition(e.clientX - svgBounds.left, e.clientY - svgBounds.top);
                x = worldX; y = worldY;
            }
            const id = `${NodeType.Comment}-${Date.now()}`;
            const newNode: Node = { id, type: NodeType.Comment, position: { x: x - 125, y: y - 75 }, size: { width: 250, height: 150 }, data: { text: 'New Comment' }, inputs: [], outputs: [], isBypassed: false };
            setNodes(draft => { draft[id] = newNode; });
            setNodeRenderOrder(draft => { draft.push(id); });
      }
  };

  const handleSvgMouseDown = (e: React.MouseEvent) => {
    const targetEl = e.target as Element;
    if (targetEl !== svgRef.current && !targetEl.classList.contains('canvas-background')) { return; }
    if (e.button !== 0) return;
    if (activeTool === 'select') {
        if (!svgRef.current) return;
        const svgBounds = svgRef.current.getBoundingClientRect();
        const [worldX, worldY] = getWorldPosition(e.clientX - svgBounds.left, e.clientY - svgBounds.top);
        selectionStartPoint.current = { x: worldX, y: worldY }; setSelectionBox({ x: worldX, y: worldY, width: 0, height: 0 });
        window.addEventListener('mousemove', handleWindowSelectionMove);
        window.addEventListener('mouseup', handleWindowSelectionUp);
    }
    setSelectedNodeIds([]); selectedNodeIdsRef.current = []; selectConnection(undefined);
  };
  
  const handleSvgMouseMove = (e: React.MouseEvent) => {};

  const propagateImmediateUpdates = async (startNodeIds: string[], currentNodes: Record<string, Node>, currentConnections: Connection[]) => {
      const queue = [...startNodeIds]; const visited = new Set<string>(); let workingNodes = { ...currentNodes }; let hasUpdates = false;
      while (queue.length > 0) {
          const sourceId = queue.shift()!; if (visited.has(sourceId)) continue; visited.add(sourceId);
          const outgoing = currentConnections.filter(c => c.fromNodeId === sourceId); const downstreamIds = [...new Set(outgoing.map(c => c.toNodeId))];
          for (const targetId of downstreamIds) {
              const targetNode = workingNodes[targetId]; if (!targetNode) continue;
              const immediateNodeTypes = [ NodeType.Array, NodeType.List, NodeType.PromptConcatenator, NodeType.Composite, NodeType.Stitch, NodeType.RMBG, NodeType.VideoStitch, NodeType.SelectImage ];
              if (immediateNodeTypes.includes(targetNode.type)) {
                  try {
                    const result = await executeNode(targetId, workingNodes, currentConnections, (msg) => onVideoProgress(targetId, msg), onAssetGenerated);
                    const updatedNode = { ...targetNode, ...result, data: { ...targetNode.data, ...result.data } } as Node;
                    workingNodes[targetId] = updatedNode; hasUpdates = true; queue.push(targetId);
                  } catch (e) { console.error("Error propagating to", targetId, e); }
              }
          }
      }
      if (hasUpdates) { setNodes(draft => { Object.keys(workingNodes).forEach(id => { if (draft[id]) { if (visited.has(id) || Object.values(workingNodes).some(n => n.id === id)) { draft[id] = workingNodes[id]; } } }); }); }
  };

  // startConnection: useConnections 훅 래퍼 - SVG path ref를 초기화하고 드래그 시작
  const startConnection = (fromNodeId: string, fromConnector: Connector, e: React.MouseEvent) => {
    if (pendingConnectionPathRef.current && svgRef.current) {
      const svgBounds = svgRef.current.getBoundingClientRect();
      const [worldX, worldY] = getWorldPosition(e.clientX - svgBounds.left, e.clientY - svgBounds.top);
      const fromPoint = getConnectorPosition(fromNodeId, fromConnector.id, false);
      const toPoint = { x: worldX, y: worldY };
      const pathData = `M ${fromPoint.x} ${fromPoint.y} C ${fromPoint.x + 75} ${fromPoint.y}, ${toPoint.x - 75} ${toPoint.y}, ${toPoint.x} ${toPoint.y}`;
      pendingConnectionPathRef.current.setAttribute('d', pathData);
      const color = ({ [ConnectorType.Text]: '#38bdf8', [ConnectorType.Image]: '#d946ef', [ConnectorType.Video]: '#f59e0b', [ConnectorType.Array]: '#22c55e', }[fromConnector.type] || '#6B7280');
      pendingConnectionPathRef.current.setAttribute('stroke', color);
      pendingConnectionPathRef.current.style.display = 'block';
    }
    const svgBounds = svgRef.current?.getBoundingClientRect();
    const screenX = svgBounds ? e.clientX - svgBounds.left : e.clientX;
    const screenY = svgBounds ? e.clientY - svgBounds.top : e.clientY;
    hookStartConnection(fromNodeId, fromConnector, screenX, screenY);
  };

  // endConnection: useConnections 훅의 completeConnection 래퍼
  // 커넥션 완성 후 동적 커넥터 확장 로직(Text/Image input) 처리
  const handleEndConnection = (toNodeId: string, toConnector: Connector) => {
    if (!pendingConnection) return;
    const fromNodeId = pendingConnection.fromNodeId;
    const fromConnector = pendingConnection.fromConnector;
    const fromNode = nodes[fromNodeId];
    const toNode = nodes[toNodeId];

    // 기존 connection 수 저장 (추가 여부 감지용)
    const prevCount = connections.length;

    // path 숨기기
    if (pendingConnectionPathRef.current) { pendingConnectionPathRef.current.style.display = 'none'; }

    // useConnections 훅의 completeConnection 호출
    endConnection(toNodeId, toConnector);

    // 연결 추가 여부 확인 후 즉시 실행 노드 처리 및 동적 커넥터 추가
    // (completeConnection은 비동기 상태 업데이트이므로 타이머로 next tick에 확인)
    // @MX:NOTE: 즉시 실행 및 동적 커넥터 확장은 useConnections의 onConnectionsChanged 콜백 대신
    // 여기서 직접 처리 (executeNode 등 App.tsx 의존 로직이 많아 분리 유지)
    setTimeout(() => {
      const newConnections = connectionsStateRef.current;
      if (newConnections.length <= prevCount) return; // 연결이 추가되지 않은 경우 무시
      const newConn = newConnections[newConnections.length - 1];
      if (newConn.toNodeId !== toNodeId) return;

      if (!fromNode || !toNode) return;

      const immediateNodeTypes = [NodeType.Array, NodeType.List, NodeType.PromptConcatenator, NodeType.Composite, NodeType.Stitch, NodeType.RMBG, NodeType.VideoStitch, NodeType.SelectImage];
      if (immediateNodeTypes.includes(toNode.type)) {
        executeNode(toNodeId, nodes, newConnections, (msg) => onVideoProgress(toNodeId, msg), onAssetGenerated)
          .then(result => {
            setNodes(draft => { if (draft[toNodeId]) { Object.assign(draft[toNodeId], result); if (result.data) { draft[toNodeId].data = { ...draft[toNodeId].data, ...result.data }; } } });
            const nextNodes = { ...nodes, [toNodeId]: { ...toNode, ...result, data: { ...toNode.data, ...result.data } } };
            propagateImmediateUpdates([toNodeId], nextNodes, newConnections);
          });
      }

      const targetTextNodeTypes = [NodeType.Assistant, NodeType.Image, NodeType.ImagePreview, NodeType.ImageEdit, NodeType.Video, NodeType.PromptConcatenator, NodeType.GridShot, NodeType.ImageModify];
      if (targetTextNodeTypes.includes(toNode.type) && toConnector.type === ConnectorType.Text) {
        const textInputs = toNode.inputs.filter(c => c.type === ConnectorType.Text);
        const connectedTextInputIds = new Set<string>();
        newConnections.forEach(c => { if (c.toNodeId === toNodeId && toNode.inputs.some(input => input.id === c.toConnectorId && input.type === ConnectorType.Text)) { connectedTextInputIds.add(c.toConnectorId); } });
        if (textInputs.length === connectedTextInputIds.size) {
          setNodes(draft => {
            const nodeToUpdate = draft[toNodeId];
            if (nodeToUpdate) {
              const currentTextInputs = nodeToUpdate.inputs.filter(c => c.type === ConnectorType.Text);
              const newIndex = currentTextInputs.length;
              const baseName = nodeToUpdate.type === NodeType.Assistant ? 'Text In' : 'Text(Prompt) In';
              const newConnector: Connector = { id: `text-in-${newIndex}`, name: `${baseName} ${newIndex + 1}`, type: ConnectorType.Text };
              const lastTextIndex = [...nodeToUpdate.inputs].reverse().findIndex(c => c.type === ConnectorType.Text);
              const actualLastTextIndex = lastTextIndex === -1 ? -1 : nodeToUpdate.inputs.length - 1 - lastTextIndex;
              if (actualLastTextIndex !== -1) { nodeToUpdate.inputs.splice(actualLastTextIndex + 1, 0, newConnector); } else { nodeToUpdate.inputs.push(newConnector); }
            }
          });
        }
      } else if ([NodeType.Composite, NodeType.Stitch, NodeType.RMBG, NodeType.Assistant, NodeType.ImageModify].includes(toNode.type) && toConnector.type === ConnectorType.Image) {
        const imageInputs = toNode.inputs.filter(c => c.type === ConnectorType.Image);
        const connectedImageInputIds = new Set<string>();
        newConnections.forEach(c => { if (c.toNodeId === toNodeId && toNode.inputs.some(input => input.id === c.toConnectorId && input.type === ConnectorType.Image)) { connectedImageInputIds.add(c.toConnectorId); } });
        if (imageInputs.length === connectedImageInputIds.size) {
          setNodes(draft => {
            const nodeToUpdate = draft[toNodeId];
            if (nodeToUpdate) {
              const currentImageInputs = nodeToUpdate.inputs.filter(c => c.type === ConnectorType.Image);
              const newIndex = currentImageInputs.length;
              const newConnector: Connector = { id: `image-in-${newIndex}`, name: `Image In ${newIndex + 1}`, type: ConnectorType.Image };
              const lastImageIndex = [...nodeToUpdate.inputs].reverse().findIndex(c => c.type === ConnectorType.Image);
              const actualLastImageIndex = lastImageIndex === -1 ? -1 : nodeToUpdate.inputs.length - 1 - lastImageIndex;
              if (actualLastImageIndex !== -1) { nodeToUpdate.inputs.splice(actualLastImageIndex + 1, 0, newConnector); } else { nodeToUpdate.inputs.push(newConnector); }
            }
          });
        }
      }
    }, 0);
  };

  // connectionsStateRef: handleEndConnection의 setTimeout에서 최신 connections 접근용
  const connectionsStateRef = useRef<Connection[]>(connections);
  connectionsStateRef.current = connections;

  const handleSelectConnection = (id: string) => { selectConnection(id); setSelectedNodeIds([]); selectedNodeIdsRef.current = []; };

  const handleSelectNode = useCallback((id: string, e?: React.MouseEvent) => {
    selectConnection(undefined);
    const isShiftPressed = e?.shiftKey;
    let finalSelectedIds: string[];
    const currentSelectedIds = selectedNodeIdsRef.current;
    const isAlreadySelected = currentSelectedIds.includes(id);
    if (isShiftPressed) { finalSelectedIds = isAlreadySelected ? currentSelectedIds.filter(selectedId => selectedId !== id) : [...currentSelectedIds, id]; }
    else { finalSelectedIds = [id]; }
    setSelectedNodeIds(finalSelectedIds);
    selectedNodeIdsRef.current = finalSelectedIds;
    if (finalSelectedIds.length > 0) {
        setNodeRenderOrder(currentOrder => {
            const allGroups = currentOrder.filter(nid => nodesRef.current[nid]?.type === NodeType.Group);
            const allContent = currentOrder.filter(nid => nodesRef.current[nid]?.type !== NodeType.Group);
            const selectedGroupIds = finalSelectedIds.filter(nid => nodesRef.current[nid]?.type === NodeType.Group);
            const selectedContentIds = finalSelectedIds.filter(nid => nodesRef.current[nid]?.type !== NodeType.Group);
            const reorderedGroups = [...allGroups.filter(nid => !selectedGroupIds.includes(nid)), ...selectedGroupIds];
            const reorderedContent = [...allContent.filter(nid => !selectedContentIds.includes(nid)), ...selectedContentIds];
            return [...reorderedGroups, ...reorderedContent];
        });
    }
  }, [setNodeRenderOrder]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    const assetDataString = e.dataTransfer.getData('application/x-cosmos-asset');
    if (assetDataString) {
      const asset = JSON.parse(assetDataString) as HistoryAsset;
      if (asset.type === 'image') {
        let x = e.clientX; let y = e.clientY;
        if (svgRef.current) {
            const svgBounds = svgRef.current.getBoundingClientRect();
            const [worldX, worldY] = getWorldPosition(e.clientX - svgBounds.left, e.clientY - svgBounds.top);
            x = worldX; y = worldY;
        }
        const id = `${NodeType.ImageLoad}-${Date.now()}`;
        const newNode: Node = { id, type: NodeType.ImageLoad, position: { x: x - 150, y: y - 150 }, size: { width: 300, height: 300 }, data: { imageUrls: [asset.url] }, inputs: [], outputs: [{ id: 'image-out', name: 'Image Out', type: ConnectorType.Image }], isBypassed: false };
        setNodes(draft => { draft[id] = newNode; });
        setNodeRenderOrder(draft => { draft.push(id); });
      }
      return;
    }
    const jsonFiles = [...e.dataTransfer.files].filter((file) => file.type === 'application/json' || file.name.endsWith('.json'));
    if (jsonFiles.length > 0) {
        const file = jsonFiles[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const project = JSON.parse(content) as Project;
                if (project.id && project.state) { loadNodes(project.state.nodes, project.state.nodeRenderOrder || Object.keys(project.state.nodes)); loadConnections(project.state.connections); setHistory(project.state.history); restoreTransform(project.state.panZoom); if (project.type === 'Playground') { setIsPlaygroundOpen(true); } }
            } catch (error) { console.error("Failed to parse dropped JSON project:", error); }
        };
        reader.readAsText(file); return;
    }
    const imageFiles = [...e.dataTransfer.files].filter((file) => file.type.startsWith('image/'));
    const videoFiles = [...e.dataTransfer.files].filter((file) => file.type.startsWith('video/'));

    let x = e.clientX; let y = e.clientY;
    if (svgRef.current) {
        const svgBounds = svgRef.current.getBoundingClientRect();
        const [worldX, worldY] = getWorldPosition(e.clientX - svgBounds.left, e.clientY - svgBounds.top);
        x = worldX; y = worldY;
    }

    if (videoFiles.length > 0) {
        const file = videoFiles[0];
        const videoUrl = URL.createObjectURL(file);
        const id = `${NodeType.VideoLoad}-${Date.now()}`;
        const newNode: Node = { id, type: NodeType.VideoLoad, position: { x: x - 150, y: y - 150 }, size: { width: 300, height: 300 }, data: { videoUrl, fileName: file.name }, inputs: [], outputs: [{ id: 'video-out', name: 'Video Out', type: ConnectorType.Video }], isBypassed: false };
        setNodes(draft => { draft[id] = newNode; }); setNodeRenderOrder(draft => { draft.push(id); });
        return;
    }

    if (imageFiles.length === 0) return;
    
    const imageUrls: string[] = []; let pendingReads = 0;
    imageFiles.forEach(file => {
        pendingReads++; const reader = new FileReader();
        reader.onload = (event) => {
            const imageUrl = event.target?.result as string; if (imageUrl) { imageUrls.push(imageUrl); } pendingReads--;
            if (pendingReads === 0 && imageUrls.length > 0) {
                const id = `${NodeType.ImageLoad}-${Date.now()}`;
                const newNode: Node = { id, type: NodeType.ImageLoad, position: { x: x - 150, y: y - 150 }, size: { width: 300, height: 300 }, data: { imageUrls }, inputs: [], outputs: [{ id: 'image-out', name: 'Image Out', type: ConnectorType.Image }], isBypassed: false };
                setNodes(draft => { draft[id] = newNode; }); setNodeRenderOrder(draft => { draft.push(id); });
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const getExecutionOrder = (): string[] => {
    const adj: Record<string, string[]> = {}; const inDegree: Record<string, number> = {};
    Object.keys(nodes).forEach(nodeId => { adj[nodeId] = []; inDegree[nodeId] = 0; });
    connections.forEach(conn => { if (adj[conn.fromNodeId] && inDegree[conn.toNodeId] !== undefined) { adj[conn.fromNodeId].push(conn.toNodeId); inDegree[conn.toNodeId]++; } });
    const queue = Object.keys(nodes).filter(nodeId => inDegree[nodeId] === 0); const executionOrder: string[] = [];
    while (queue.length > 0) {
        const u = queue.shift()!; executionOrder.push(u); (adj[u] || []).forEach(v => { inDegree[v]--; if (inDegree[v] === 0) { queue.push(v); } });
    }
    return executionOrder;
  };

  // useNodeGeneration: AI 노드 생성 상태 관리 훅 (SPEC-UI-001 M4)
  // generatingNodeIds, isGenerating, generateForNode, cancelGeneration 제공
  const {
    generateForNode: onGenerateNode,
    generatingNodeIds: generatingNodeIdsFromHook,
    isGenerating: isNodeGenerating,
    cancelGeneration,
  } = useNodeGeneration({
    nodes,
    connections,
    updateNodeData,
    addToHistory: onAssetGenerated,
    // executeNodeFn: 실제 노드 실행 로직 (Composite/RMBG/일반 노드 분기 포함)
    // @MX:NOTE: M4에서는 기존 executeNode 로직을 그대로 래핑하여 안전하게 통합
    executeNodeFn: useCallback(async (nodeId: string): Promise<Partial<Node>> => {
      const node = nodesRef.current[nodeId];
      if (!node) throw new Error(`Node ${nodeId} not found during execution.`);
      let updatedNodePartial: Partial<Node> = {};
      if (node.type === NodeType.Composite) {
          const data = node.data as CompositeNodeData;
          if (data.layers.length < 2) { alert("Composite node requires at least 2 image layers for compositing."); updatedNodePartial = { data: { ...data, isLoading: false } }; } else {
              updatedNodePartial = { data: { ...data, loadingMessage: 'Compositing images...' } };
              const contentAreaWidth = node.size.width - COMPOSITE_NODE_CONTENT_PADDING_X;
              const contentAreaHeight = node.size.height - COMPOSITE_NODE_HEADER_HEIGHT - COMPOSITE_NODE_CONTENT_PADDING_Y_TOP - COMPOSITE_NODE_CONTENT_PADDING_Y_BOTTOM - COMPOSITE_NODE_BUTTON_HEIGHT - COMPOSITE_NODE_INTERNAL_SPACING;
              const result = await compositeImages(data.layers, Math.max(1, contentAreaWidth), Math.max(1, contentAreaHeight));
              if (result) { onAssetGenerated({ type: 'image', url: result }); }
              updatedNodePartial = { data: { ...data, outputImageUrl: result, isLoading: false } };
          }
      } else if (node.type === NodeType.RMBG) {
          const data = node.data as RMBGNodeData;
          if (!data.inputImageUrl) { alert("RMBG node requires an image input."); updatedNodePartial = { data: { ...data, isLoading: false } }; } else {
              updatedNodePartial = { data: { ...data, loadingMessage: 'Removing background...' } };
              let resultWithWhiteBg = await removeBackground(data.inputImageUrl); let finalResult: string | null = null;
              if (resultWithWhiteBg) { if (data.backgroundColor !== '#FFFFFF') { finalResult = await addSolidBackground(resultWithWhiteBg, data.backgroundColor); } else { finalResult = resultWithWhiteBg; } }
              if (finalResult) { onAssetGenerated({ type: 'image', url: finalResult }); }
              updatedNodePartial = { data: { ...data, outputImageUrl: finalResult, isLoading: false } };
          }
      } else {
          updatedNodePartial = await executeNode(nodeId, nodesRef.current, connections, (msg: string) => updateNodeData(nodeId, { loadingMessage: msg }), onAssetGenerated);
      }
      setNodes(draft => { if (draft[nodeId]) { Object.assign(draft[nodeId], updatedNodePartial); if (updatedNodePartial.data) { draft[nodeId].data = { ...draft[nodeId].data, ...updatedNodePartial.data }; } if ('isLoading' in draft[nodeId].data) { (draft[nodeId].data as any).isLoading = false; } } });
      const nextNodes = { ...nodesRef.current, [nodeId]: { ...nodesRef.current[nodeId], ...updatedNodePartial, data: { ...nodesRef.current[nodeId].data, ...updatedNodePartial.data } } } as Record<string, Node>;
      propagateImmediateUpdates([nodeId], nextNodes, connections);
      return updatedNodePartial;
    }, [connections, updateNodeData, onAssetGenerated, setNodes, executeNode]),
  });

  // handleSaveProject: useProjectManager.saveProject 위임 (SPEC-UI-001 M5)
  const handleSaveProject = async (name: string) => {
    setIsSaving(true);
    await pmSaveProject(name);
    setIsSaving(false);
    setIsSaveModalOpen(false);
  };

  // handleLoadProject: useProjectManager.loadProject 위임 (SPEC-UI-001 M5)
  const handleLoadProject = (id: string) => {
    pmLoadProject(id);
    setIsLoadModalOpen(false);
  };

  // handleDeleteProject: useProjectManager.deleteProject 위임 (SPEC-UI-001 M5)
  const handleDeleteProject = async (id: string) => {
    await pmDeleteProject(id);
  };

  const handleExportProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}.json`;
      a.click();
    }
  };

  // handleImportProject: 프로젝트 JSON 파일 가져오기 — 캔버스에 상태 복원 (SPEC-UI-001 M5)
  const handleImportProject = async (project: Project) => {
    if (project && project.state) {
      loadNodes(project.state.nodes, project.state.nodeRenderOrder || Object.keys(project.state.nodes));
      loadConnections(project.state.connections);
      setHistory(project.state.history);
      restoreTransform(project.state.panZoom);

      // 가져온 프로젝트를 목록에 추가 (직접 IndexedDB 저장)
      if (!projects.find(p => p.id === project.id)) {
          const updated = [...projects, project];
          try { await saveProjectsList(updated); } catch (e) { console.error('프로젝트 가져오기 저장 실패:', e); }
      }
    }
  };

  const executeGraph = async () => {
    setIsGeneratingAll(true); const executionOrder = getExecutionOrder(); let currentNodesState = { ...nodes };
    for (const nodeId of executionOrder) {
        const node = currentNodesState[nodeId];
        const generatableNodes = [NodeType.Assistant, NodeType.Image, NodeType.ImagePreview, NodeType.ImageEdit, NodeType.Video, NodeType.Model, NodeType.Vton, NodeType.Storyboard, NodeType.Script, NodeType.Array, NodeType.List, NodeType.PromptConcatenator, NodeType.Composite, NodeType.Stitch, NodeType.RMBG, NodeType.VideoStitch, NodeType.GridShot, NodeType.GridExtractor, NodeType.SelectImage, NodeType.ImageModify, NodeType.OutfitDetail];
        if (generatableNodes.includes(node.type)) {
            setNodes(draft => { if (draft[nodeId]) { if ('isLoading' in draft[nodeId].data && !draft[nodeId].isBypassed) { (draft[nodeId].data as any).isLoading = true; } } });
            try {
                let updatedNodePartial: Partial<Node> = {};
                if (node.type === NodeType.Composite) {
                    const data = node.data as CompositeNodeData;
                    if (data.layers.length < 2) { updatedNodePartial = { data: { ...data, isLoading: false } }; } else {
                        const contentAreaWidth = node.size.width - COMPOSITE_NODE_CONTENT_PADDING_X;
                        const contentAreaHeight = node.size.height - COMPOSITE_NODE_HEADER_HEIGHT - COMPOSITE_NODE_CONTENT_PADDING_Y_TOP - COMPOSITE_NODE_CONTENT_PADDING_Y_BOTTOM - COMPOSITE_NODE_BUTTON_HEIGHT - COMPOSITE_NODE_INTERNAL_SPACING;
                        const result = await compositeImages(data.layers, Math.max(1, contentAreaWidth), Math.max(1, contentAreaHeight));
                        if (result) { onAssetGenerated({ type: 'image', url: result }); }
                        updatedNodePartial = { data: { ...data, outputImageUrl: result, isLoading: false } };
                    }
                } else if (node.type === NodeType.RMBG) {
                    const data = node.data as RMBGNodeData;
                    if (!data.inputImageUrl) { updatedNodePartial = { data: { ...data, isLoading: false } }; } else {
                        let resultWithWhiteBg = await removeBackground(data.inputImageUrl); let finalResult: string | null = null;
                        if (resultWithWhiteBg) { if (data.backgroundColor !== '#FFFFFF') { finalResult = await addSolidBackground(resultWithWhiteBg, data.backgroundColor); } else { finalResult = resultWithWhiteBg; } }
                        if (finalResult) { onAssetGenerated({ type: 'image', url: finalResult }); }
                        updatedNodePartial = { data: { ...data, outputImageUrl: finalResult, isLoading: false } };
                    }
                } else { updatedNodePartial = await executeNode(nodeId, currentNodesState, connections, (message: string) => updateNodeData(nodeId, { loadingMessage: message }), onAssetGenerated); }
                const existingNode = currentNodesState[nodeId]; const updatedNode = { ...existingNode, ...updatedNodePartial, data: { ...existingNode.data, ...updatedNodePartial.data } } as Node;
                if ('isLoading' in updatedNode.data) { (updatedNode.data as any).isLoading = false; }
                currentNodesState = { ...currentNodesState, [nodeId]: updatedNode };
                setNodes(draft => { if (draft[nodeId]) { Object.assign(draft[nodeId], updatedNode); } });
            } catch (error) { console.error(`Error executing node ${nodeId}:`, error); setNodes(draft => { if (draft[nodeId]) { if ('isLoading' in draft[nodeId].data) { (draft[nodeId].data as any).isLoading = false; } if ('loadingMessage' in draft[nodeId].data) { (draft[nodeId].data as any).loadingMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`; } } }); break; }
        }
    }
    setIsGeneratingAll(false);
  };

  return (
    <div className="w-screen h-screen bg-gray-900 text-white flex overflow-hidden font-sans">
      <HistoryPanel history={history} />
      <div className="flex-grow relative" onDragOver={handleDragOver} onDrop={handleDrop}>
        <svg ref={svgRef} className={`w-full h-full ${isMiddleMousePanning ? 'cursor-grabbing' : (activeTool === 'pan' ? 'cursor-grab' : (activeTool === 'comment' ? 'cursor-crosshair' : (activeTool === 'select' ? 'cursor-default' : 'cursor-default')))}`} onMouseDown={handleSvgMouseDown} onMouseMove={handleSvgMouseMove} onMouseUp={handleSvgMouseUp}>
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#4B5563" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" transform={`translate(${panZoom.x % 60}, ${panZoom.y % 60})`} className="canvas-background" />
          <g transform={`translate(${panZoom.x}, ${panZoom.y}) scale(${panZoom.k})`}>
            {/* Layer 1: Background - Group Nodes Only */}
            {nodeRenderOrder.map(nodeId => {
              const node = nodes[nodeId];
              if (!node || node.hidden || node.type !== NodeType.Group) return null;
              return (
                <DraggableNodeWrapper
                  key={node.id}
                  node={node}
                  nodes={nodes}
                  isSelected={selectedNodeIds.includes(node.id)}
                  panZoomK={panZoom.k}
                  onSelectNode={handleSelectNode}
                  onNodeDrag={handleNodeDrag}
                  onNodeDragStart={handleNodeDragStart}
                  onSizeChange={updateNodeSize}
                  onDataChange={updateNodeData}
                  onStartConnection={(fromNodeId, fromConnector, e) => startConnection(fromNodeId, fromConnector, e)}
                  onEndConnection={handleEndConnection}
                  onDeleteNode={deleteNode}
                  onCopyNode={copyNode}
                  onGenerateNode={onGenerateNode}
                  onAssetGenerated={onAssetGenerated}
                  onToggleCollapse={handleToggleCollapse}
                  onToggleBypass={handleToggleBypass}
                  onFitGroup={handleFitGroupToNodes}
                  connections={connections}
                />
              );
            })}

            {/* Layer 2: Middle - Connections */}
            {connections.map(conn => {
              const fromPoint = getConnectorPosition(conn.fromNodeId, conn.fromConnectorId, false);
              const toPoint = getConnectorPosition(conn.toNodeId, conn.toConnectorId, true);
              const fromNode = nodes[conn.fromNodeId]; const toNode = nodes[conn.toNodeId];
              if (!fromNode || !toNode || fromNode.hidden || toNode.hidden) return null;
              const connectorType = fromNode.outputs.find(c => c.id === conn.fromConnectorId)?.type || ConnectorType.Text;
              return ( <ConnectionComponent key={conn.id} id={conn.id} from={fromPoint} to={toPoint} type={connectorType} isSelected={selectedConnectionId === conn.id} onSelect={handleSelectConnection} /> );
            })}
            {selectionBox && ( <rect x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height} className="fill-blue-500/20 stroke-blue-400 stroke-2 stroke-dashed" /> )}

            {/* Layer 3: Foreground - Regular Content Nodes */}
            {nodeRenderOrder.map(nodeId => {
              const node = nodes[nodeId];
              if (!node || node.hidden || node.type === NodeType.Group) return null;
              return (
                <DraggableNodeWrapper
                  key={node.id}
                  node={node}
                  nodes={nodes}
                  isSelected={selectedNodeIds.includes(node.id)}
                  panZoomK={panZoom.k}
                  onSelectNode={handleSelectNode}
                  onNodeDrag={handleNodeDrag}
                  onNodeDragStart={handleNodeDragStart}
                  onSizeChange={updateNodeSize}
                  onDataChange={updateNodeData}
                  onStartConnection={(fromNodeId, fromConnector, e) => startConnection(fromNodeId, fromConnector, e)}
                  onEndConnection={handleEndConnection}
                  onDeleteNode={deleteNode}
                  onCopyNode={copyNode}
                  onGenerateNode={onGenerateNode}
                  onAssetGenerated={onAssetGenerated}
                  onToggleCollapse={handleToggleCollapse}
                  onToggleBypass={handleToggleBypass}
                  onFitGroup={handleFitGroupToNodes}
                  connections={connections}
                />
              );
            })}
            <path ref={pendingConnectionPathRef} fill="none" strokeWidth="3" strokeDasharray="5,5" stroke="#FFF" style={{ display: 'none', pointerEvents: 'none' }} />
          </g>
        </svg>
        
        <Toolbar onAddNode={addNode} isGenerating={isGeneratingAll} onOpenPlayground={() => setIsPlaygroundOpen(true)} />
        <ToolsPanel activeTool={activeTool} setActiveTool={setActiveTool} />
        <ZoomControls
          zoomLevel={panZoom.k}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomToFit={() => zoomToFit(Object.values(nodes))}
        />
        <button onClick={executeGraph} disabled={isGeneratingAll} className="absolute top-4 right-4 z-10 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-2xl text-white font-bold transition-all duration-200 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed"> {isGeneratingAll ? ( <> <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> <span>Generating...</span> </> ) : ( <> <PlayIcon className="w-6 h-6" /> <span>Generate All</span> </> )} </button>
        <ProjectControls onSave={() => setIsSaveModalOpen(true)} isSaveModalOpen={isSaveModalOpen} onCloseSaveModal={() => setIsSaveModalOpen(false)} onSaveProject={handleSaveProject} onLoad={() => setIsLoadModalOpen(true)} isLoadModalOpen={isLoadModalOpen} onCloseLoadModal={() => setIsLoadModalOpen(false)} projects={projects} onLoadProject={handleLoadProject} onDeleteProject={handleDeleteProject} onExportProject={handleExportProject} onImportProject={handleImportProject} isSaving={isSaving} onExportCurrentProject={() => setIsExportModalOpen(true)} isExportModalOpen={isExportModalOpen} onCloseExportModal={() => setIsExportModalOpen(false)} onConfirmExport={(name) => { const currentState: ProjectState = { nodes, connections, history: [], panZoom, nodeRenderOrder: nodeRenderOrderRef.current }; const projectToExport: Project = { id: `proj-exported-${Date.now()}`, name: name, createdAt: new Date().toISOString(), state: currentState }; const dataStr = JSON.stringify(projectToExport, null, 2); const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr); const exportFileDefaultName = `${name.replace(/\s/g, '_')}.json`; const linkElement = document.createElement('a'); linkElement.setAttribute('href', dataUri); linkElement.setAttribute('download', exportFileDefaultName); linkElement.click(); setIsExportModalOpen(false); }} onExportPlayground={() => { const currentState: ProjectState = { nodes, connections, history: [], panZoom, nodeRenderOrder: nodeRenderOrderRef.current }; const projectToExport = { ...{ id: `playground-${Date.now()}`, name: 'Playground Export', createdAt: new Date().toISOString(), state: currentState }, type: 'Playground' }; const dataStr = JSON.stringify(projectToExport, null, 2); const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr); const linkElement = document.createElement('a'); linkElement.setAttribute('href', dataUri); linkElement.setAttribute('download', 'playground_workflow.json'); linkElement.click(); }} />
        <PlaygroundModal isOpen={isPlaygroundOpen} onClose={() => setIsPlaygroundOpen(false)} nodes={nodes} onDataChange={updateNodeData} onRun={executeGraph} onGenerateSingle={onGenerateNode} isGenerating={isGeneratingAll} />
      </div>

      {hasApiKey === false && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md text-center border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">API Key Required</h2>
            <p className="text-gray-300 mb-8">
              To use the advanced image and video generation models, you must select your own Google Gemini API key.
            </p>
            <button
              onClick={handleSelectKey}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-colors shadow-lg"
            >
              Select API Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;