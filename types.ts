export enum NodeType {
  Text = 'Text',
  Assistant = 'Assistant',
  Image = 'Image',
  ImagePreview = 'ImagePreview',
  ImageEdit = 'ImageEdit',
  ImageLoad = 'ImageLoad',
  Video = 'Video',
  VideoLoad = 'VideoLoad',
  VideoStitch = 'VideoStitch',
  Camera = 'Camera',
  Preset = 'Preset',
  CameraPreset = 'CameraPreset', // Added CameraPreset
  Model = 'Model',
  Vton = 'VTON',
  Comment = 'Comment',
  Storyboard = 'Storyboard',
  Script = 'Script',
  Array = 'Array',
  List = 'List',
  PromptConcatenator = 'PromptConcatenator',
  Composite = 'Composite',
  Stitch = 'Stitch',
  RMBG = 'RMBG',
  Group = 'Group',
  GridShot = 'GridShot',
  GridExtractor = 'GridExtractor',
  SelectImage = 'SelectImage',
  ImageModify = 'ImageModify',
  OutfitDetail = 'OutfitDetail',
}

export interface Point {
  x: number;
  y: number;
}

export enum ConnectorType {
  Text = 'Text',
  Image = 'Image',
  Video = 'Video',
  Array = 'Array',
}

export interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
}

// Added Connection interface to fix export errors in App.tsx and NodeComponent.tsx
export interface Connection {
  id: string;
  fromNodeId: string;
  fromConnectorId: string;
  toNodeId: string;
  toConnectorId: string;
}

// Added HistoryAsset interface to fix export errors in App.tsx and other components
export interface HistoryAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
}

// Added Tool type to fix export errors in App.tsx and ToolsPanel.tsx
export type Tool = 'select' | 'pan' | 'comment';

// Added PanZoom interface to fix export errors and use in node data
export interface PanZoom {
  x: number;
  y: number;
  k: number;
}

export interface TextNodeData {
  text: string;
  presetKey?: string | null;
  textScale?: number;
}

export interface AssistantNodeData {
  prompt: string;
  response: string;
  isLoading: boolean;
  systemPrompt: string;
}

export interface ImageNodeData {
  imageUrls: (string | null)[];
  isLoading: boolean;
  loadingMessage?: string;
  model: string;
  aspectRatio: string;
  numberOfImages: number;
  imageSize?: '1K' | '2K' | '4K';
}

export interface ImagePreviewNodeData extends ImageNodeData {}

export interface CameraControlData {
  rotation: number;
  zoom: number;
  verticalAngle: number;
  wideAngle: boolean;
}

export interface ImageEditNodeData {
    inputImageUrl: string | null;
    outputImageUrl: string | null;
    isLoading: boolean;
    loadingMessage?: string;
    imageSize?: '1K' | '2K' | '4K';
}

export interface ImageLoadNodeData {
    imageUrls: string[];
    imageUrl?: string | null; 
}

export interface VideoNodeData {
  firstImageUrl: string | null;
  lastImageUrl: string | null;
  videoUrl: string | null;
  isLoading: boolean;
  loadingMessage: string;
  resolution: '720p' | '1080p';
  aspectRatio: '16:9' | '9:16';
  lastFrameUrl: string | null;
  firstFrameUrl: string | null;
  videoObject: any | null;
}

export interface VideoLoadNodeData {
  videoUrl: string | null;
  fileName: string | null;
  videoObject?: any | null;
}

export interface VideoStitchNodeData {
  video1Url: string | null;
  video2Url: string | null;
  outputVideoUrl: string | null;
  stitchedVideoUrl?: string | null;
  isLoading: boolean;
  stitchProgress?: number;
  video1TrimFrames: number;
  video2TrimFrames: number;
}

export interface CameraNodeData {
  controls: CameraControlData;
  text: string;
}

export interface CameraPresetNodeData {
  direction: string | null;
  focalLength: string;
  angle: string;
  shotSize: string;
  prompt: string;
}

export interface PresetNodeData {
  selectedPrompts: string[];
  text: string;
}

export interface ModelNodeData {
    gender: 'Woman' | 'Man';
    age: string;
    nationality: string;
    faceShape: string;
    hairStyle: string;
    hairColor: string;
    additionalPrompt: string;
    outputImageUrl: string | null;
    isLoading: boolean;
    useAppliedOptionsNext?: boolean;
    appliedOptions?: {
        gender: 'Woman' | 'Man';
        age: string;
        nationality: string;
        faceShape: string;
        hairStyle: string;
        hairColor: string;
        additionalPrompt: string;
    };
}

export interface VtonOutfitItem {
    id: string;
    url: string;
}

export interface VtonStylingItem {
    id: string;
    url: string;
    outfitId: string;
    pose: string;
    sourceImageUrl: string;
}

export interface VtonNodeData {
    mainImageUrl: string | null;
    baseModelUrl: string | null;
    outfitItems: VtonOutfitItem[];
    selectedOutfitId: string | null;
    pose: string;
    stylingList: VtonStylingItem[];
    selectedStylingId: string | 'base';
    isLoading: boolean;
    outputImageUrl: string | null;
}

export interface CommentNodeData {
  text: string;
  textScale?: number;
}

export interface StoryboardScene {
  id: string;
  koreanDescription: string;
  englishPrompt: string;
  imageUrl: string | null;
  isLoading: boolean;
}

export interface StoryboardNodeData {
  scenes: StoryboardScene[];
  isLoading: boolean;
  aspectRatio: '16:9' | '9:16';
}

export interface ScriptShot {
    id: string;
    time: string;
    title: string;
    description: string;
    englishPrompt: string;
    camera: string;
    lens: string;
    motion: string;
    lighting: string;
    transition: string;
    soundEffect: string;
    imageUrl?: string | null;
    isLoading?: boolean;
}

export interface ScriptData {
    productName: string;
    category: string;
    concept: string;
    duration: string;
    format: string;
    narrativeSummary: string;
    visualIdentity: string;
    motionRules: string;
    negativePrompts: string;
    shotList: ScriptShot[];
}

export interface ScriptNodeData {
    productCategory?: string;
    url: string;
    description: string;
    videoInputUrl?: string;
    videoFrames: string[];
    capturedImages: { id: string, url: string }[];
    productImages: { id: string, url: string }[];
    modelImages: { id: string, url: string }[];
    isLoading: boolean;
    isCapturing: boolean;
    loadingMessage: string;
    isAnalyzed: boolean;
    selectedScriptStyle: string;
    scriptData: ScriptData | null;
    finalPrompt: string | null;
    sceneConcepts?: string[];
    aspectRatio: '16:9' | '9:16';
    videoDuration: string;
}

export interface ArrayNodeData {
    text: string;
    separator: string;
    items: string[];
}

export interface ListNodeData {
    arrayInput: string[];
    index: number;
    output: string;
}

export interface PromptConcatenatorNodeData {
    concatenatedText: string;
    separator: string;
}

export interface CompositeLayer {
    id: string;
    url: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    originalWidth: number;
    originalHeight: number;
}

export interface CompositeNodeData {
    layers: CompositeLayer[];
    outputImageUrl: string | null;
    isLoading: boolean;
    internalPanZoom?: PanZoom;
}

export interface StitchNodeData {
    inputImageUrls: string[];
    outputImageUrl: string | null;
    isLoading: boolean;
    direction: 'horizontal' | 'vertical';
}

export interface RMBGNodeData {
    inputImageUrl: string | null;
    outputImageUrl: string | null;
    isLoading: boolean;
    backgroundColor: string;
}

export interface GroupNodeData {
    title: string;
    containedNodeIds?: string[];
}

export interface GridShotNodeData {
    prompt: string;
    gridSize: string; // "3x2", "4x3", "5x4", "7x6"
    outputImageUrl: string | null;
    outputVideoUrl: string | null;
    isLoading: boolean;
    loadingMessage: string;
}

export interface ExtractedItem {
    id: string;
    url: string;
    label: string;
    bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface GridExtractorNodeData {
    inputImageUrl: string | null;
    extractedItems: ExtractedItem[];
    isLoading: boolean;
    loadingMessage: string;
}

export interface SelectImageNodeData {
    index: number;
    outputUrl: string | null;
    imageList: string[];
}

export interface ImageModifyNodeData {
    inputImageUrl: string | null;
    outputImageUrl: string | null;
    markupDataUrl: string | null;
    isLoading: boolean;
    loadingMessage: string;
    prompt: string;
    internalPanZoom: PanZoom;
    activeTool: 'brush' | 'box' | 'arrow' | 'text' | 'pan';
}

export interface OutfitDetailNodeData {
    inputImageUrl: string | null;
    technicalSpec: string;
    isLoading: boolean;
}

// Added ProjectState interface to fix export errors in App.tsx
export interface ProjectState {
  nodes: Record<string, Node>;
  connections: Connection[];
  history: HistoryAsset[];
  panZoom: PanZoom;
  nodeRenderOrder: string[];
}

// Added Project interface to fix export errors in App.tsx and ProjectControls.tsx
export interface Project {
  id: string;
  name: string;
  createdAt: string;
  state: ProjectState;
  type?: 'Playground';
}

export type NodeData = TextNodeData | AssistantNodeData | ImageNodeData | ImagePreviewNodeData | ImageEditNodeData | ImageLoadNodeData | VideoNodeData | VideoLoadNodeData | VideoStitchNodeData | CameraNodeData | PresetNodeData | CameraPresetNodeData | ModelNodeData | VtonNodeData | CommentNodeData | StoryboardNodeData | ScriptNodeData | ArrayNodeData | ListNodeData | PromptConcatenatorNodeData | CompositeNodeData | StitchNodeData | RMBGNodeData | GroupNodeData | GridShotNodeData | GridExtractorNodeData | SelectImageNodeData | ImageModifyNodeData | OutfitDetailNodeData;

export interface Node {
  id: string;
  type: NodeType;
  position: Point;
  size: { width: number; height: number; };
  data: NodeData;
  inputs: Connector[];
  outputs: Connector[];
  isCollapsed?: boolean;
  expandedSize?: { width: number, height: number };
  // Added missing properties to fix property existence errors in App.tsx and PlaygroundModal.tsx
  isBypassed: boolean;
  hidden?: boolean;
}