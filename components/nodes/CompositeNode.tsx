// components/nodes/CompositeNode.tsx

import React, { useRef, useState, useEffect, useCallback, MouseEvent } from 'react';
import { Node, CompositeNodeData, CompositeLayer, PanZoom } from '../../types';
import { Squares2X2Icon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import * as d3 from 'd3';
import { COMPOSITE_NODE_HEADER_HEIGHT, COMPOSITE_NODE_CONTENT_PADDING_X, COMPOSITE_NODE_CONTENT_PADDING_Y_TOP, COMPOSITE_NODE_CONTENT_PADDING_Y_BOTTOM, COMPOSITE_NODE_BUTTON_HEIGHT, COMPOSITE_NODE_INTERNAL_SPACING } from '../../data/constants';

interface CompositeNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<CompositeNodeData>) => void;
  onGenerate: (nodeId: string) => void;
  isCollapsed: boolean;
  panZoomK: number; // ADDED: panZoomK from App.tsx -> NodeComponent -> CompositeNode
}

interface ActiveInteraction {
    layerId: string;
    type: 'drag' | 'resize' | 'rotate';
    startMouseX: number; // Screen X
    startMouseY: number; // Screen Y
    startLayer: CompositeLayer; // State of the layer when interaction started
    layerRect: DOMRect; // DOMRect of the layer's container at start (screen coords)
    startRotationOffset: number; // For rotate, difference between mouse angle and layer rotation
}

interface ImageLayerEditorProps {
    layer: CompositeLayer;
    containerWidth: number; // Actual pixel width of the CompositeNode's content area (at internalPanZoom.k=1)
    containerHeight: number; // Actual pixel height of the CompositeNode's content area (at internalPanZoom.k=1)
    onInteractionStart: (layerId: string, type: ActiveInteraction['type'], e: MouseEvent, layerRef: React.RefObject<HTMLDivElement>) => void;
    onRemoveLayer: (layerId: string) => void;
    isSelected: boolean;
    zIndex: number;
    // For visual consistency of handles if they are to scale with content
    internalZoomK: number; 
}

const ImageLayerEditor: React.FC<ImageLayerEditorProps> = React.memo(({
    layer,
    containerWidth,
    containerHeight,
    onInteractionStart,
    onRemoveLayer,
    isSelected,
    zIndex,
    internalZoomK,
}) => {
    const layerRef = useRef<HTMLDivElement>(null);

    // Calculate actual pixel width/height of the image within the editor based on scale
    const currentWidth = layer.scale * layer.originalWidth;
    const currentHeight = layer.scale * layer.originalHeight;

    const transformStyle: React.CSSProperties = {
        position: 'absolute',
        // layer.x, layer.y are center pixel coordinates relative to the container's top-left (at internalZoomK=1)
        left: `${layer.x}px`, 
        top: `${layer.y}px`,  
        width: `${currentWidth}px`,
        height: `${currentHeight}px`,
        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`, // Apply translate to center the element
        zIndex: zIndex,
        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
    };

    // Scale handles inversely to internalZoomK so they maintain a consistent visual size
    const handleScale = 1 / internalZoomK;

    return (
        <div
            ref={layerRef}
            id={`layer-${layer.id}`} // Add ID for direct DOM access if needed
            className={`flex items-center justify-center transition-all duration-75 ease-linear group ${isSelected ? 'border-2 border-indigo-500' : ''}`}
            style={transformStyle}
            onMouseDown={(e) => onInteractionStart(layer.id, 'drag', e, layerRef)}
        >
            <img 
                src={layer.url} 
                crossOrigin="anonymous" 
                alt="composite layer" 
                className="pointer-events-none object-contain" // pointer-events-none ensures clicks go to the parent div
                style={{ width: '100%', height: '100%' }}
            />
            {isSelected && (
                <>
                    {/* Remove button */}
                    <button 
                        className="absolute bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-500 z-20"
                        style={{ 
                            top: `${-12 * handleScale}px`, 
                            right: `${-12 * handleScale}px`,
                            transform: `scale(${handleScale})`
                        }}
                        onClick={(e) => { e.stopPropagation(); onRemoveLayer(layer.id); }}
                    >
                        <XMarkIcon className="w-3 h-3" />
                    </button>
                    {/* Resize handle (bottom-right) */}
                    <div 
                        className="absolute bg-indigo-600 rounded-full cursor-se-resize flex items-center justify-center text-white text-xs z-20 hover:scale-110"
                        style={{ 
                            bottom: `${-12 * handleScale}px`, 
                            right: `${-12 * handleScale}px`,
                            width: `${24 * handleScale}px`, 
                            height: `${24 * handleScale}px`,
                            transform: `scale(${handleScale})` // Scale handles
                        }}
                        onMouseDown={(e) => onInteractionStart(layer.id, 'resize', e, layerRef)}
                    >
                        <div className="w-2 h-2 border-r-2 border-b-2"></div>
                    </div>
                     {/* Rotate handle (top-center) */}
                     <div 
                        className="absolute bg-indigo-600 rounded-full cursor-grab flex items-center justify-center text-white text-xs z-20 hover:scale-110"
                        style={{ 
                            top: `${-12 * handleScale}px`, 
                            left: `50%`, 
                            transform: `translate(-50%, 0) scale(${handleScale})`,
                            width: `${24 * handleScale}px`, 
                            height: `${24 * handleScale}px`,
                        }}
                        onMouseDown={(e) => onInteractionStart(layer.id, 'rotate', e, layerRef)}
                    >
                        <ArrowPathIcon className="w-3 h-3" />
                    </div>
                </>
            )}
        </div>
    );
});

const CompositeNode: React.FC<CompositeNodeProps> = ({ node, onDataChange, onGenerate, isCollapsed, panZoomK }) => {
  const data = node.data as CompositeNodeData;
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null); // For D3 zoom target
  const layersWrapperRef = useRef<HTMLDivElement>(null); // For applying internal Pan/Zoom transform
  const [activeInteraction, setActiveInteraction] = useState<ActiveInteraction | null>(null);
  const internalZoomBehaviorRef = useRef<d3.ZoomBehavior<HTMLDivElement, unknown> | null>(null);

  // Sync internalPanZoom from node.data to local state
  const [internalPanZoom, setInternalPanZoom] = useState<PanZoom>(data.internalPanZoom || { x: 0, y: 0, k: 1 });
  useEffect(() => {
    setInternalPanZoom(data.internalPanZoom || { x: 0, y: 0, k: 1 });
  }, [data.internalPanZoom]);

  const handleGenerate = () => {
    onGenerate(node.id); // Trigger App.tsx's executeNode for this node
  };

  const handleLayerChange = useCallback((updatedLayer: CompositeLayer) => {
    onDataChange(node.id, {
        layers: data.layers.map(layer => layer.id === updatedLayer.id ? updatedLayer : layer)
    });
  }, [node.id, data.layers, onDataChange]);

  const handleRemoveLayer = useCallback((layerId: string) => {
      onDataChange(node.id, {
          layers: data.layers.filter(layer => layer.id !== layerId)
      });
      if (selectedLayerId === layerId) {
          setSelectedLayerId(null);
      }
  }, [node.id, data.layers, onDataChange, selectedLayerId]);

  const handleContainerClick = useCallback((e: MouseEvent) => {
      // Only deselect if click on the container background, not on a layer
      if (e.target === containerRef.current || e.target === layersWrapperRef.current) {
        setSelectedLayerId(null);
      }
  }, []);

  const handleInteractionStart = useCallback((layerId: string, type: ActiveInteraction['type'], e: MouseEvent, layerRef: React.RefObject<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent container click from deselecting
    setSelectedLayerId(layerId);

    if (!layerRef.current) return;
    const layer = data.layers.find(l => l.id === layerId);
    if (!layer) return;

    // Get layer's rect in screen coordinates
    const layerRect = layerRef.current.getBoundingClientRect();

    let startRotationOffset = 0;
    if (type === 'rotate') {
        const centerScreenX = layerRect.left + layerRect.width / 2;
        const centerScreenY = layerRect.top + layerRect.height / 2;
        const initialMouseAngle = Math.atan2(e.clientY - centerScreenY, e.clientX - centerScreenX) * 180 / Math.PI;
        startRotationOffset = layer.rotation - initialMouseAngle;
    }

    setActiveInteraction({
        layerId,
        type,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startLayer: { ...layer }, // Deep copy
        layerRect, // Screen coordinates
        startRotationOffset,
    });
  }, [data.layers, setSelectedLayerId]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!activeInteraction || !layersWrapperRef.current || !containerRef.current) return;

    e.preventDefault(); // Prevent text selection etc.

    const currentLayer = data.layers.find(l => l.id === activeInteraction.layerId);
    if (!currentLayer) return;

    let updatedLayer: CompositeLayer = { ...currentLayer };

    // Get the inverse transform of the *internal* zoom behavior for accurate world coordinates
    const internalTransform = d3.zoomTransform(containerRef.current);
    
    // Mouse movement delta in screen coordinates
    const dx_screen = e.clientX - activeInteraction.startMouseX;
    const dy_screen = e.clientY - activeInteraction.startMouseY;

    // Convert screen delta to the *unscaled, unpanned* internal editor coordinate system
    // The key is to divide by the main canvas zoom (panZoomK) AND the internal zoom (internalTransform.k)
    const dx_editor_world = dx_screen / (panZoomK * internalTransform.k);
    const dy_editor_world = dy_screen / (panZoomK * internalTransform.k);

    switch (activeInteraction.type) {
        case 'drag': {
            updatedLayer.x = activeInteraction.startLayer.x + dx_editor_world;
            updatedLayer.y = activeInteraction.startLayer.y + dy_editor_world;
            break;
        }
        case 'resize': {
            // Recalculate based on mouse position relative to layer center in screen space
            const layerCenterScreenX = activeInteraction.layerRect.left + activeInteraction.layerRect.width / 2;
            const layerCenterScreenY = activeInteraction.layerRect.top + activeInteraction.layerRect.height / 2;
            
            const initialMouseToCenterX = activeInteraction.startMouseX - layerCenterScreenX;
            const initialMouseToCenterY = activeInteraction.startMouseY - layerCenterScreenY;
            const initialDistanceFromCenter = Math.sqrt(initialMouseToCenterX**2 + initialMouseToCenterY**2);
            
            const currentMouseToCenterX = e.clientX - layerCenterScreenX;
            const currentMouseToCenterY = e.clientY - layerCenterScreenY;
            const currentDistanceFromCenter = Math.sqrt(currentMouseToCenterX**2 + currentMouseToCenterY**2);
            
            if (initialDistanceFromCenter > 1) { // Avoid division by zero
                const scaleFactor = currentDistanceFromCenter / initialDistanceFromCenter;
                // Min scale is 5% of original (at scale 1)
                const newScale = Math.max(0.05, activeInteraction.startLayer.scale * scaleFactor); 
                updatedLayer.scale = newScale;
            }
            break;
        }
        case 'rotate': {
            // Use screen coordinates for angle calculation, relative to layer's screen center
            const layerCenterScreenX = activeInteraction.layerRect.left + activeInteraction.layerRect.width / 2;
            const layerCenterScreenY = activeInteraction.layerRect.top + activeInteraction.layerRect.height / 2;
            const currentAngle = Math.atan2(e.clientY - layerCenterScreenY, e.clientX - layerCenterScreenX) * 180 / Math.PI;
            updatedLayer.rotation = currentAngle + activeInteraction.startRotationOffset;
            break;
        }
    }
    handleLayerChange(updatedLayer);

  }, [activeInteraction, panZoomK, data.layers, handleLayerChange]);

  const handleMouseUp = useCallback(() => {
    setActiveInteraction(null);
  }, []);

  useEffect(() => {
    if (activeInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Ensure the mouseup listener is always removed
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [activeInteraction, handleMouseMove, handleMouseUp]);

  // D3 Zoom for internal pan/zoom
  useEffect(() => {
    const container = d3.select(containerRef.current);
    if (!container.node()) return;

    const zoom = d3.zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.1, 10]) // Zoom from 10% to 1000%
      .filter((event: any) => {
        // Allow wheel for zoom
        if (event.type === 'wheel') return true;
        // Allow left-click drag for pan IF not interacting with a layer handle
        if (event.type === 'mousedown' && event.button === 0 && event.target === container.node()) {
            return true;
        }
        return false;
      })
      .on('zoom', (event: any) => {
        const newInternalPanZoom = event.transform;
        setInternalPanZoom(newInternalPanZoom);
        onDataChange(node.id, { internalPanZoom: newInternalPanZoom }); // Persist to node data
      });
    
    internalZoomBehaviorRef.current = zoom;
    container.call(zoom);

    return () => {
      container.on('.zoom', null);
    };
  }, [node.id, onDataChange]); // Depend on node.id and onDataChange to re-init if node changes

  if (isCollapsed) {
    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            {data.outputImageUrl ? (
                <img src={data.outputImageUrl} crossOrigin="anonymous" alt="composite thumbnail" className="w-full h-full object-contain rounded-sm" />
            ) : (
                <Squares2X2Icon className="w-8 h-8 text-gray-500" />
            )}
        </div>
    );
  }

  // Calculate the content area dimensions based on node size and defined constants
  const contentWidth = node.size.width - COMPOSITE_NODE_CONTENT_PADDING_X;
  const contentHeight = node.size.height - COMPOSITE_NODE_HEADER_HEIGHT - COMPOSITE_NODE_CONTENT_PADDING_Y_TOP - COMPOSITE_NODE_CONTENT_PADDING_Y_BOTTOM - COMPOSITE_NODE_BUTTON_HEIGHT - COMPOSITE_NODE_INTERNAL_SPACING;

  // Use a sensible default if calculated dimensions are problematic
  const currentContainerWidth = Math.max(1, contentWidth);
  const currentContainerHeight = Math.max(1, contentHeight);

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div 
        ref={containerRef} // D3 zoom attaches here
        className="bg-gray-900 w-full flex-grow rounded-md flex items-center justify-center border border-gray-700 relative overflow-hidden"
        onClick={handleContainerClick}
        onMouseDown={handleContainerClick} // Deselect on mousedown on empty space
        style={{ cursor: activeInteraction ? 'grabbing' : (internalPanZoom.k > 1 ? 'grab' : 'default') }} // Change cursor
      >
        {data.isLoading ? (
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        ) : data.outputImageUrl ? ( // Only show output if present
            <img 
                src={data.outputImageUrl} 
                crossOrigin="anonymous" 
                alt="Composite Output" 
                className="absolute inset-0 w-full h-full object-contain"
            />
        ) : ( // Otherwise, show interactive layers or placeholder
            <div 
                ref={layersWrapperRef} 
                className="absolute inset-0 origin-top-left" // Important: origin-top-left for D3 transform
                style={{ 
                    transform: `translate(${internalPanZoom.x}px, ${internalPanZoom.y}px) scale(${internalPanZoom.k})`,
                    width: `${currentContainerWidth}px`, // Logical width for content at k=1
                    height: `${currentContainerHeight}px`, // Logical height for content at k=1
                }}
            >
                {data.layers.length > 0 ? (
                    data.layers.map((layer, index) => (
                        <ImageLayerEditor
                            key={layer.id}
                            layer={layer}
                            containerWidth={currentContainerWidth}
                            containerHeight={currentContainerHeight}
                            onInteractionStart={handleInteractionStart}
                            onRemoveLayer={handleRemoveLayer}
                            isSelected={selectedLayerId === layer.id}
                            zIndex={index + 1} // +1 to ensure positive z-index
                            internalZoomK={internalPanZoom.k}
                        />
                    ))
                ) : (
                    <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500 text-center text-sm w-full">
                        Connect multiple image inputs to composite them.
                    </p>
                )}
            </div>
        )}
      </div>
      <button
        onClick={handleGenerate}
        disabled={data.isLoading || data.layers.length < 2}
        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-auto"
      >
        {data.isLoading ? 'Compositing...' : 'Composite Images'}
      </button>
    </div>
  );
};

export default CompositeNode;
