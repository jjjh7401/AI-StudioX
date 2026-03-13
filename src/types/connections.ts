// 연결 타입 정의 모듈
// 노드 간 연결과 포트 데이터 타입 호환성 매트릭스 정의

/** 포트 데이터 타입 열거형 */
export enum PortDataType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  ARRAY = 'ARRAY',
  ANY = 'ANY',
  AUDIO = 'AUDIO',
  // 노드 타입 참조용 (호환성 매트릭스에서 사용)
  ASSISTANT = 'ASSISTANT',
  MODEL = 'MODEL',
  STORYBOARD = 'STORYBOARD',
  SCRIPT = 'SCRIPT',
  VTON = 'VTON',
  GRID_SHOT = 'GRID_SHOT',
  COMPOSITE = 'COMPOSITE',
  STITCH = 'STITCH',
  IMAGE_MODIFY = 'IMAGE_MODIFY',
  GRID_EXTRACTOR = 'GRID_EXTRACTOR',
  LIST = 'LIST',
  SUMMARY = 'SUMMARY',
  KEYWORD = 'KEYWORD',
  SENTIMENT = 'SENTIMENT',
  TRANSLATE = 'TRANSLATE',
  TRANSCRIBE = 'TRANSCRIBE',
  CLASSIFY = 'CLASSIFY',
  DETECT = 'DETECT',
  SEGMENT = 'SEGMENT',
}

/** 노드 간 연결 인터페이스 */
export interface Connection {
  id: string
  sourceNodeId: string
  sourcePort: string
  targetNodeId: string
  targetPort: string
  dataType: PortDataType
  /** 연결 경로 좌표 (렌더링용) */
  path?: string
}

/**
 * 포트 데이터 타입 호환성 매트릭스
 * key: 소스 타입, value: 허용되는 타겟 타입 배열
 *
 * SPEC 기반 호환성 규칙:
 * TEXT → TEXT, ASSISTANT, MODEL, STORYBOARD, SCRIPT, VTON, GRIDSHOT
 * IMAGE → IMAGE, ASSISTANT, VIDEO, VTON, COMPOSITE, STITCH, IMAGE_MODIFY, ARRAY, GRID_EXTRACTOR
 * VIDEO → VIDEO
 * ARRAY → ARRAY, LIST, COMPOSITE, STITCH
 */
export const COMPATIBILITY_MATRIX: Record<PortDataType, PortDataType[]> = {
  [PortDataType.TEXT]: [
    PortDataType.TEXT,
    PortDataType.ASSISTANT,
    PortDataType.MODEL,
    PortDataType.STORYBOARD,
    PortDataType.SCRIPT,
    PortDataType.VTON,
    PortDataType.GRID_SHOT,
    PortDataType.SUMMARY,
    PortDataType.KEYWORD,
    PortDataType.SENTIMENT,
    PortDataType.TRANSLATE,
    PortDataType.ANY,
  ] as PortDataType[],
  [PortDataType.IMAGE]: [
    PortDataType.IMAGE,
    PortDataType.ASSISTANT,
    PortDataType.VIDEO,
    PortDataType.VTON,
    PortDataType.COMPOSITE,
    PortDataType.STITCH,
    PortDataType.IMAGE_MODIFY,
    PortDataType.ARRAY,
    PortDataType.GRID_EXTRACTOR,
    PortDataType.CLASSIFY,
    PortDataType.DETECT,
    PortDataType.SEGMENT,
    PortDataType.ANY,
  ] as PortDataType[],
  [PortDataType.VIDEO]: [
    PortDataType.VIDEO,
    PortDataType.ANY,
  ],
  [PortDataType.ARRAY]: [
    PortDataType.ARRAY,
    PortDataType.LIST,
    PortDataType.COMPOSITE,
    PortDataType.STITCH,
    PortDataType.ANY,
  ],
  [PortDataType.AUDIO]: [
    PortDataType.AUDIO,
    PortDataType.TRANSCRIBE,
    PortDataType.ANY,
  ] as PortDataType[],
  [PortDataType.ANY]: [
    PortDataType.TEXT,
    PortDataType.IMAGE,
    PortDataType.VIDEO,
    PortDataType.ARRAY,
    PortDataType.AUDIO,
    PortDataType.ANY,
    PortDataType.ASSISTANT,
    PortDataType.MODEL,
    PortDataType.STORYBOARD,
    PortDataType.SCRIPT,
    PortDataType.VTON,
    PortDataType.GRID_SHOT,
    PortDataType.COMPOSITE,
    PortDataType.STITCH,
    PortDataType.IMAGE_MODIFY,
    PortDataType.GRID_EXTRACTOR,
    PortDataType.LIST,
  ],
  // 노드 타입 참조용 - 이들은 타겟으로만 사용됨
  [PortDataType.ASSISTANT]: [PortDataType.ANY],
  [PortDataType.MODEL]: [PortDataType.ANY],
  [PortDataType.STORYBOARD]: [PortDataType.ANY],
  [PortDataType.SCRIPT]: [PortDataType.ANY],
  [PortDataType.VTON]: [PortDataType.ANY],
  [PortDataType.GRID_SHOT]: [PortDataType.ANY],
  [PortDataType.COMPOSITE]: [PortDataType.ANY],
  [PortDataType.STITCH]: [PortDataType.ANY],
  [PortDataType.IMAGE_MODIFY]: [PortDataType.ANY],
  [PortDataType.GRID_EXTRACTOR]: [PortDataType.ANY],
  [PortDataType.LIST]: [PortDataType.ANY],
  [PortDataType.SUMMARY]: [PortDataType.ANY],
  [PortDataType.KEYWORD]: [PortDataType.ANY],
  [PortDataType.SENTIMENT]: [PortDataType.ANY],
  [PortDataType.TRANSLATE]: [PortDataType.ANY],
  [PortDataType.TRANSCRIBE]: [PortDataType.ANY],
  [PortDataType.CLASSIFY]: [PortDataType.ANY],
  [PortDataType.DETECT]: [PortDataType.ANY],
  [PortDataType.SEGMENT]: [PortDataType.ANY],
}
