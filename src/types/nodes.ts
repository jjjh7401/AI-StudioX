// AI-StudioX 노드 타입 정의 모듈
// 27가지 노드 타입과 관련 인터페이스 정의

/** 노드 타입 열거형 - 27가지 */
export enum NodeType {
  TEXT = 'TEXT',
  ASSISTANT = 'ASSISTANT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  CAMERA = 'CAMERA',
  MODEL = 'MODEL',
  VTON = 'VTON',
  COMMENT = 'COMMENT',
  STORYBOARD = 'STORYBOARD',
  SCRIPT = 'SCRIPT',
  ARRAY = 'ARRAY',
  LIST = 'LIST',
  COMPOSITE = 'COMPOSITE',
  STITCH = 'STITCH',
  GRID_SHOT = 'GRID_SHOT',
  GRID_EXTRACTOR = 'GRID_EXTRACTOR',
  IMAGE_MODIFY = 'IMAGE_MODIFY',
  GROUP = 'GROUP',
  AUDIO = 'AUDIO',
  TRANSCRIBE = 'TRANSCRIBE',
  TRANSLATE = 'TRANSLATE',
  SUMMARY = 'SUMMARY',
  KEYWORD = 'KEYWORD',
  SENTIMENT = 'SENTIMENT',
  CLASSIFY = 'CLASSIFY',
  DETECT = 'DETECT',
  SEGMENT = 'SEGMENT',
}

/** 포트 방향 */
export enum PortDirection {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

/** 노드 위치 */
export interface Position {
  x: number
  y: number
}

/** 포트 정의 */
export interface Port {
  id: string
  direction: PortDirection
  dataType: string
  label?: string
}

/** 기본 노드 인터페이스 */
export interface BaseNode {
  id: string
  type: NodeType
  position: Position
  data: Record<string, unknown>
  ports?: Port[]
  selected?: boolean
  width?: number
  height?: number
}

// ---------- 특화 노드 타입들 ----------

/** 텍스트 입력 노드 */
export interface TextNode extends BaseNode {
  type: NodeType.TEXT
  data: {
    text: string
    label?: string
  }
}

/** AI 어시스턴트 노드 - 텍스트/이미지 프롬프트 처리 */
export interface AssistantNode extends BaseNode {
  type: NodeType.ASSISTANT
  data: {
    prompt: string
    model: string
    isRunning: boolean
    result?: string
    systemInstruction?: string
  }
}

/** 이미지 표시/업로드 노드 */
export interface ImageNode extends BaseNode {
  type: NodeType.IMAGE
  data: {
    src: string | null
    label?: string
    mimeType?: string
  }
}

/** 비디오 출력/입력 노드 */
export interface VideoNode extends BaseNode {
  type: NodeType.VIDEO
  data: {
    src: string | null
    label?: string
    duration?: number
  }
}

/** 웹캠 캡처 노드 */
export interface CameraNode extends BaseNode {
  type: NodeType.CAMERA
  data: {
    isCapturing: boolean
    capturedImage: string | null
    deviceId?: string
  }
}

/** AI 패션 모델 생성 노드 */
export interface ModelNode extends BaseNode {
  type: NodeType.MODEL
  data: {
    gender: 'female' | 'male' | 'neutral'
    age: number
    hairStyle: string
    skinTone?: string
    bodyType?: string
  }
}

/** 가상 피팅 (Virtual Try-On) 노드 */
export interface VtonNode extends BaseNode {
  type: NodeType.VTON
  data: {
    outfitImage: string | null
    poseImage: string | null
    result?: string | null
  }
}

/** 주석/스티커 노트 노드 */
export interface CommentNode extends BaseNode {
  type: NodeType.COMMENT
  data: {
    text: string
    color: string
    fontSize?: number
  }
}

/** 스토리보드 시퀀스 노드 - 5개 장면 */
export interface StoryboardScene {
  id: string
  description: string
  imageUrl?: string | null
}

export interface StoryboardNode extends BaseNode {
  type: NodeType.STORYBOARD
  data: {
    scenes: StoryboardScene[]
    maxScenes: number
  }
}

/** 상품 분석 파이프라인 노드 */
export interface ScriptNode extends BaseNode {
  type: NodeType.SCRIPT
  data: {
    productName: string
    targetAudience?: string
    tone?: string
    output?: string
  }
}

/** 배열 처리 노드 */
export interface ArrayNode extends BaseNode {
  type: NodeType.ARRAY
  data: {
    items: unknown[]
    label?: string
  }
}

/** 리스트 처리 노드 */
export interface ListNode extends BaseNode {
  type: NodeType.LIST
  data: {
    items: unknown[]
    displayMode?: 'ordered' | 'unordered'
  }
}

/** 이미지 합성 노드 */
export interface CompositeNode extends BaseNode {
  type: NodeType.COMPOSITE
  data: {
    layers: (string | null)[]
    blendMode?: string
    result?: string | null
  }
}

/** 이미지 스티칭 노드 */
export interface StitchNode extends BaseNode {
  type: NodeType.STITCH
  data: {
    images: (string | null)[]
    direction?: 'horizontal' | 'vertical'
    result?: string | null
  }
}

/** 그리드 레이아웃 생성 노드 */
export interface GridShotNode extends BaseNode {
  type: NodeType.GRID_SHOT
  data: {
    columns: number
    rows: number
    prompt?: string
    result?: string | null
  }
}

/** 그리드에서 이미지 추출 노드 */
export interface GridExtractorNode extends BaseNode {
  type: NodeType.GRID_EXTRACTOR
  data: {
    sourceImage: string | null
    columns: number
    rows: number
    extractedImages?: (string | null)[]
  }
}

/** AI 기반 선택적 이미지 편집 노드 */
export interface ImageModifyNode extends BaseNode {
  type: NodeType.IMAGE_MODIFY
  data: {
    sourceImage: string | null
    prompt: string
    mask?: string | null
    result?: string | null
  }
}

/** 노드 그룹 노드 */
export interface GroupNode extends BaseNode {
  type: NodeType.GROUP
  data: {
    nodeIds: string[]
    label: string
    collapsed?: boolean
  }
}

/** 오디오 노드 */
export interface AudioNode extends BaseNode {
  type: NodeType.AUDIO
  data: {
    src: string | null
    label?: string
    duration?: number
  }
}

/** 음성 텍스트 변환 노드 */
export interface TranscribeNode extends BaseNode {
  type: NodeType.TRANSCRIBE
  data: {
    audioSrc: string | null
    transcript?: string
    language?: string
  }
}

/** 텍스트 번역 노드 */
export interface TranslateNode extends BaseNode {
  type: NodeType.TRANSLATE
  data: {
    sourceText: string
    sourceLang?: string
    targetLang: string
    translatedText?: string
  }
}

/** 텍스트 요약 노드 */
export interface SummaryNode extends BaseNode {
  type: NodeType.SUMMARY
  data: {
    sourceText: string
    maxLength?: number
    summary?: string
  }
}

/** 키워드 추출 노드 */
export interface KeywordNode extends BaseNode {
  type: NodeType.KEYWORD
  data: {
    sourceText: string
    maxKeywords?: number
    keywords?: string[]
  }
}

/** 감성 분석 노드 */
export interface SentimentNode extends BaseNode {
  type: NodeType.SENTIMENT
  data: {
    sourceText: string
    sentiment?: 'positive' | 'negative' | 'neutral'
    confidence?: number
  }
}

/** 이미지 분류 노드 */
export interface ClassifyNode extends BaseNode {
  type: NodeType.CLASSIFY
  data: {
    sourceImage: string | null
    categories?: string[]
    result?: string
    confidence?: number
  }
}

/** 객체 감지 노드 */
export interface DetectNode extends BaseNode {
  type: NodeType.DETECT
  data: {
    sourceImage: string | null
    detections?: Array<{ label: string; confidence: number; bbox?: number[] }>
  }
}

/** 이미지 세그멘테이션 노드 */
export interface SegmentNode extends BaseNode {
  type: NodeType.SEGMENT
  data: {
    sourceImage: string | null
    segments?: Array<{ label: string; mask?: string | null }>
  }
}

/** 모든 노드 타입의 유니온 */
export type AnyNode =
  | TextNode
  | AssistantNode
  | ImageNode
  | VideoNode
  | CameraNode
  | ModelNode
  | VtonNode
  | CommentNode
  | StoryboardNode
  | ScriptNode
  | ArrayNode
  | ListNode
  | CompositeNode
  | StitchNode
  | GridShotNode
  | GridExtractorNode
  | ImageModifyNode
  | GroupNode
  | AudioNode
  | TranscribeNode
  | TranslateNode
  | SummaryNode
  | KeywordNode
  | SentimentNode
  | ClassifyNode
  | DetectNode
  | SegmentNode
