// nodeDefaults: 28개 노드 타입별 기본 크기, 커넥터, 데이터 정의
// App.tsx의 addNode switch문에서 추출한 정적 데이터
import { NodeType, ConnectorType } from '../types';
import type { Connector } from '../types';

export interface NodeDefault {
  defaultSize: { width: number; height: number };
  inputs: Array<{ id: string; name: string; type: ConnectorType }>;
  outputs: Array<{ id: string; name: string; type: ConnectorType }>;
  defaultData: Record<string, unknown>;
}

// 커넥터 생성 헬퍼
function conn(id: string, name: string, type: ConnectorType): Connector {
  return { id, name, type };
}

// Storyboard 장면 초기값 생성 헬퍼
function makeStoryboardScenes(count: number): unknown[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `scene-${i + 1}`,
    koreanDescription: '',
    englishPrompt: '',
    imageUrl: null,
    isLoading: false,
  }));
}

// @MX:ANCHOR: 28개 NodeType 기본값 정의 - nodeFactory에서 참조
// @MX:REASON: 모든 노드 생성의 단일 진실 소스 (single source of truth)
export const NODE_DEFAULTS: Record<NodeType, NodeDefault> = {
  [NodeType.Text]: {
    defaultSize: { width: 350, height: 250 },
    inputs: [],
    outputs: [conn('text-out', 'Text Out', ConnectorType.Text)],
    defaultData: { text: '', textScale: 1 },
  },

  [NodeType.Assistant]: {
    defaultSize: { width: 400, height: 500 },
    inputs: [
      conn('text-in-0', 'Text In 1', ConnectorType.Text),
      conn('text-in-1', 'Text In 2', ConnectorType.Text),
      conn('image-in-0', 'Image In 1', ConnectorType.Image),
      conn('image-in-1', 'Image In 2', ConnectorType.Image),
      conn('reference-in', 'Reference In', ConnectorType.Image),
    ],
    outputs: [conn('prompt-out', 'Text(Prompt) Out', ConnectorType.Text)],
    defaultData: {
      prompt: '',
      response: '',
      isLoading: false,
      systemPrompt: '',
    },
  },

  [NodeType.Image]: {
    defaultSize: { width: 400, height: 500 },
    inputs: [
      conn('text-in-0', 'Text(Prompt) In 1', ConnectorType.Text),
      conn('text-in-1', 'Text(Prompt) In 2', ConnectorType.Text),
      conn('image-in', 'Image In', ConnectorType.Image),
      conn('reference-in', 'Reference In', ConnectorType.Image),
    ],
    outputs: [conn('image-out', 'Image Out', ConnectorType.Image)],
    defaultData: {
      imageUrls: [],
      isLoading: false,
      model: 'gemini-3.1-flash-image-preview',
      aspectRatio: '16:9',
      numberOfImages: 1,
      imageSize: '1K',
    },
  },

  [NodeType.ImagePreview]: {
    defaultSize: { width: 400, height: 500 },
    inputs: [
      conn('text-in-0', 'Text(Prompt) In 1', ConnectorType.Text),
      conn('text-in-1', 'Text(Prompt) In 2', ConnectorType.Text),
      conn('image-in', 'Image In', ConnectorType.Image),
      conn('reference-in', 'Reference In', ConnectorType.Image),
    ],
    outputs: [conn('image-out', 'Image Out', ConnectorType.Image)],
    defaultData: {
      imageUrls: [],
      isLoading: false,
      model: 'gemini-2.5-flash-image',
      aspectRatio: '16:9',
      numberOfImages: 1,
    },
  },

  [NodeType.ImageEdit]: {
    defaultSize: { width: 400, height: 500 },
    inputs: [
      conn('text-in-0', 'Text(Prompt) In 1', ConnectorType.Text),
      conn('text-in-1', 'Text(Prompt) In 2', ConnectorType.Text),
      conn('image-in', 'Image In', ConnectorType.Image),
      conn('reference-in', 'Reference In', ConnectorType.Image),
    ],
    outputs: [conn('image-out', 'Image Out', ConnectorType.Image)],
    defaultData: {
      inputImageUrl: null,
      outputImageUrl: null,
      isLoading: false,
      imageSize: '1K',
    },
  },

  [NodeType.ImageLoad]: {
    defaultSize: { width: 300, height: 300 },
    inputs: [],
    outputs: [conn('image-out', 'Image Out', ConnectorType.Image)],
    defaultData: { imageUrls: [] },
  },

  [NodeType.Video]: {
    defaultSize: { width: 450, height: 500 },
    inputs: [
      conn('text-in-0', 'Prompt', ConnectorType.Text),
      conn('first-image-in', 'Start Frame', ConnectorType.Image),
      conn('last-image-in', 'End Frame', ConnectorType.Image),
      conn('video-in', 'Extend Video', ConnectorType.Video),
      conn('reference-image-in', 'Reference Frame', ConnectorType.Image),
    ],
    outputs: [
      conn('start-frame-out', 'Start Frame', ConnectorType.Image),
      conn('end-frame-out', 'End Frame', ConnectorType.Image),
      conn('video-out', 'Video Out', ConnectorType.Video),
    ],
    defaultData: {
      firstImageUrl: null,
      lastImageUrl: null,
      videoUrl: null,
      isLoading: false,
      loadingMessage: '',
      resolution: '720p',
      aspectRatio: '16:9',
      lastFrameUrl: null,
      firstFrameUrl: null,
      videoObject: null,
    },
  },

  [NodeType.VideoLoad]: {
    defaultSize: { width: 300, height: 300 },
    inputs: [],
    outputs: [conn('video-out', 'Video Out', ConnectorType.Video)],
    defaultData: { videoUrl: null, fileName: null },
  },

  [NodeType.VideoStitch]: {
    defaultSize: { width: 400, height: 500 },
    inputs: [
      conn('video-in-1', 'Video In 1', ConnectorType.Video),
      conn('video-in-2', 'Video In 2', ConnectorType.Video),
    ],
    outputs: [conn('video-out', 'Video Out', ConnectorType.Video)],
    defaultData: {
      video1Url: null,
      video2Url: null,
      outputVideoUrl: null,
      isLoading: false,
      video1TrimFrames: 10,
      video2TrimFrames: 10,
    },
  },

  [NodeType.Camera]: {
    defaultSize: { width: 380, height: 270 },
    inputs: [],
    outputs: [conn('text-out', 'Text Out', ConnectorType.Text)],
    defaultData: {
      controls: { rotation: 0, zoom: 0, verticalAngle: 0, wideAngle: false },
      text: '',
    },
  },

  [NodeType.Preset]: {
    defaultSize: { width: 350, height: 500 },
    inputs: [],
    outputs: [conn('text-out', 'Text Out', ConnectorType.Text)],
    defaultData: { selectedPrompts: [], text: '' },
  },

  [NodeType.CameraPreset]: {
    defaultSize: { width: 350, height: 480 },
    inputs: [],
    outputs: [conn('text-out', 'Prompt Out', ConnectorType.Text)],
    defaultData: {
      direction: 'center',
      focalLength: '50mm',
      angle: 'Eye Level',
      shotSize: 'Medium Shot',
      prompt:
        'Professional Medium Shot, eye-level straight perspective photography, captured with a 50mm standard prime lens. The subject is shown from a front view, straight-on.',
    },
  },

  [NodeType.Model]: {
    defaultSize: { width: 550, height: 700 },
    inputs: [conn('image-in', 'Image In', ConnectorType.Image)],
    outputs: [conn('image-out', 'Image Out', ConnectorType.Image)],
    defaultData: {
      gender: 'Woman',
      age: '25',
      nationality: 'Korean',
      faceShape: 'random',
      hairStyle: 'random',
      hairColor: 'random',
      additionalPrompt: '',
      outputImageUrl: null,
      isLoading: false,
    },
  },

  [NodeType.Vton]: {
    defaultSize: { width: 900, height: 700 },
    inputs: [
      conn('model-in', 'Model In', ConnectorType.Image),
      conn('outfit-in', 'Outfit In', ConnectorType.Image),
    ],
    outputs: [conn('image-out', 'Styling Out', ConnectorType.Image)],
    defaultData: {
      mainImageUrl: null,
      baseModelUrl: null,
      outfitItems: [],
      selectedOutfitId: null,
      pose: '',
      stylingList: [],
      selectedStylingId: 'base',
      isLoading: false,
      outputImageUrl: null,
    },
  },

  [NodeType.Comment]: {
    defaultSize: { width: 250, height: 150 },
    inputs: [],
    outputs: [],
    defaultData: { text: 'New Comment' },
  },

  [NodeType.Storyboard]: {
    defaultSize: { width: 750, height: 1100 },
    inputs: [
      conn('image-in', 'Image In', ConnectorType.Image),
      conn('prompt-in', 'Prompt In', ConnectorType.Text),
    ],
    outputs: [
      ...Array.from({ length: 5 }, (_, i) =>
        conn(`image-out-${i + 1}`, `Image Out ${i + 1}`, ConnectorType.Image)
      ),
      ...Array.from({ length: 5 }, (_, i) =>
        conn(`prompt-out-${i + 1}`, `Prompt Out ${i + 1}`, ConnectorType.Text)
      ),
    ],
    defaultData: {
      isLoading: false,
      aspectRatio: '16:9',
      scenes: makeStoryboardScenes(5),
    },
  },

  [NodeType.Script]: {
    defaultSize: { width: 800, height: 1200 },
    inputs: [],
    outputs: [conn('prompt-out', 'Final Prompt', ConnectorType.Text)],
    defaultData: {
      url: '',
      description: '',
      videoInputUrl: '',
      videoFrames: [],
      capturedImages: [],
      productImages: [],
      modelImages: [],
      isLoading: false,
      isCapturing: false,
      loadingMessage: '분석 시작',
      isAnalyzed: false,
      selectedScriptStyle: '1-1',
      scriptData: null,
      finalPrompt: null,
      sceneConcepts: null,
      aspectRatio: '16:9',
      videoDuration: '15s',
    },
  },

  [NodeType.Array]: {
    defaultSize: { width: 300, height: 300 },
    inputs: [conn('text-in', 'Text In', ConnectorType.Text)],
    outputs: [conn('array-out', 'Array Out', ConnectorType.Array)],
    defaultData: { text: '', separator: '*', items: [] },
  },

  [NodeType.List]: {
    defaultSize: { width: 200, height: 150 },
    inputs: [conn('array-in', 'Array In', ConnectorType.Array)],
    outputs: [conn('text-out', 'Text Out', ConnectorType.Text)],
    defaultData: { arrayInput: [], index: 0, output: '' },
  },

  [NodeType.PromptConcatenator]: {
    defaultSize: { width: 300, height: 250 },
    inputs: [conn('text-in-0', 'Text In 1', ConnectorType.Text)],
    outputs: [conn('text-out', 'Text Out', ConnectorType.Text)],
    defaultData: { concatenatedText: '', separator: '\n' },
  },

  [NodeType.Composite]: {
    defaultSize: { width: 400, height: 500 },
    inputs: [
      conn('image-in-0', 'Image In 1', ConnectorType.Image),
      conn('image-in-1', 'Image In 2', ConnectorType.Image),
    ],
    outputs: [conn('image-out', 'Image Out', ConnectorType.Image)],
    defaultData: {
      layers: [],
      outputImageUrl: null,
      isLoading: false,
      internalPanZoom: { x: 0, y: 0, k: 1 },
    },
  },

  [NodeType.Stitch]: {
    defaultSize: { width: 400, height: 500 },
    inputs: [
      conn('image-in-0', 'Image In 1', ConnectorType.Image),
      conn('image-in-1', 'Image In 2', ConnectorType.Image),
    ],
    outputs: [conn('image-out', 'Image Out', ConnectorType.Image)],
    defaultData: {
      inputImageUrls: [],
      outputImageUrl: null,
      isLoading: false,
      direction: 'horizontal',
    },
  },

  [NodeType.RMBG]: {
    defaultSize: { width: 400, height: 400 },
    inputs: [conn('image-in', 'Image In', ConnectorType.Image)],
    outputs: [conn('image-out', 'Image Out', ConnectorType.Image)],
    defaultData: {
      inputImageUrl: null,
      outputImageUrl: null,
      isLoading: false,
      backgroundColor: '#ffffff',
    },
  },

  [NodeType.Group]: {
    defaultSize: { width: 500, height: 400 },
    inputs: [],
    outputs: [],
    defaultData: { title: 'Group' },
  },

  [NodeType.GridShot]: {
    defaultSize: { width: 450, height: 600 },
    inputs: [
      conn('text-in-0', 'Prompt In', ConnectorType.Text),
      conn('image-in', 'Subject Ref', ConnectorType.Image),
    ],
    outputs: [
      conn('image-out', 'Grid Image', ConnectorType.Image),
      conn('video-out', 'Connect Video', ConnectorType.Video),
    ],
    defaultData: {
      prompt: '',
      gridSize: '7x6',
      outputImageUrl: null,
      outputVideoUrl: null,
      isLoading: false,
      loadingMessage: '',
    },
  },

  [NodeType.GridExtractor]: {
    defaultSize: { width: 450, height: 650 },
    inputs: [conn('image-in', 'Grid Image In', ConnectorType.Image)],
    outputs: [conn('image-list-out', 'Image List', ConnectorType.Array)],
    defaultData: {
      inputImageUrl: null,
      extractedItems: [],
      isLoading: false,
      loadingMessage: '',
    },
  },

  [NodeType.SelectImage]: {
    defaultSize: { width: 300, height: 350 },
    inputs: [conn('image-list-in', 'Image List In', ConnectorType.Array)],
    outputs: [conn('image-out', 'Image Out', ConnectorType.Image)],
    defaultData: { index: 0, outputUrl: null, imageList: [] },
  },

  [NodeType.ImageModify]: {
    defaultSize: { width: 600, height: 750 },
    inputs: [
      conn('text-in-0', 'Instruction', ConnectorType.Text),
      conn('image-in', 'Image In', ConnectorType.Image),
    ],
    outputs: [conn('image-out', 'Modified Out', ConnectorType.Image)],
    defaultData: {
      inputImageUrl: null,
      outputImageUrl: null,
      markupDataUrl: null,
      isLoading: false,
      loadingMessage: '',
      prompt: '',
      internalPanZoom: { x: 0, y: 0, k: 1 },
      activeTool: 'brush',
    },
  },

  [NodeType.OutfitDetail]: {
    defaultSize: { width: 600, height: 450 },
    inputs: [conn('image-in', 'Image In', ConnectorType.Image)],
    outputs: [conn('text-out', 'Spec Out', ConnectorType.Text)],
    defaultData: {
      inputImageUrl: null,
      technicalSpec: '',
      isLoading: false,
    },
  },
};
