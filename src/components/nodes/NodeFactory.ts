// 노드 팩토리 - 노드 타입별 인스턴스 생성
import { NodeType, type BaseNode, type Position } from '../../types/nodes'

/** 고유 ID 생성 */
function generateId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** 노드 타입에 따른 기본 크기 반환 */
function getDefaultSize(type: NodeType): { width: number; height: number } {
  switch (type) {
    case NodeType.COMMENT:
      return { width: 200, height: 150 }
    case NodeType.STORYBOARD:
      return { width: 400, height: 300 }
    case NodeType.GROUP:
      return { width: 300, height: 250 }
    case NodeType.GRID_SHOT:
    case NodeType.GRID_EXTRACTOR:
      return { width: 280, height: 280 }
    default:
      return { width: 220, height: 180 }
  }
}

/** 노드 타입에 따른 기본 데이터 반환 */
function getDefaultData(type: NodeType): Record<string, unknown> {
  switch (type) {
    case NodeType.TEXT:
      return { text: '', label: 'Text' }
    case NodeType.ASSISTANT:
      return { prompt: '', model: 'gemini-2.0-flash', isRunning: false }
    case NodeType.IMAGE:
      return { src: null, label: 'Image' }
    case NodeType.VIDEO:
      return { src: null, label: 'Video' }
    case NodeType.CAMERA:
      return { isCapturing: false, capturedImage: null }
    case NodeType.MODEL:
      return { gender: 'female', age: 25, hairStyle: 'straight' }
    case NodeType.VTON:
      return { outfitImage: null, poseImage: null }
    case NodeType.COMMENT:
      return { text: '', color: '#fff9c4' }
    case NodeType.STORYBOARD:
      return { scenes: [], maxScenes: 5 }
    case NodeType.SCRIPT:
      return { productName: '', targetAudience: '', tone: 'professional' }
    case NodeType.ARRAY:
      return { items: [], label: 'Array' }
    case NodeType.LIST:
      return { items: [], displayMode: 'unordered' }
    case NodeType.COMPOSITE:
      return { layers: [], blendMode: 'normal', result: null }
    case NodeType.STITCH:
      return { images: [], direction: 'horizontal', result: null }
    case NodeType.GRID_SHOT:
      return { columns: 3, rows: 3, prompt: '', result: null }
    case NodeType.GRID_EXTRACTOR:
      return { sourceImage: null, columns: 3, rows: 3, extractedImages: [] }
    case NodeType.IMAGE_MODIFY:
      return { sourceImage: null, prompt: '', mask: null, result: null }
    case NodeType.GROUP:
      return { nodeIds: [], label: 'Group', collapsed: false }
    case NodeType.AUDIO:
      return { src: null, label: 'Audio' }
    case NodeType.TRANSCRIBE:
      return { audioSrc: null, transcript: '', language: 'ko' }
    case NodeType.TRANSLATE:
      return { sourceText: '', sourceLang: 'ko', targetLang: 'en' }
    case NodeType.SUMMARY:
      return { sourceText: '', maxLength: 200, summary: '' }
    case NodeType.KEYWORD:
      return { sourceText: '', maxKeywords: 10, keywords: [] }
    case NodeType.SENTIMENT:
      return { sourceText: '' }
    case NodeType.CLASSIFY:
      return { sourceImage: null, categories: [] }
    case NodeType.DETECT:
      return { sourceImage: null, detections: [] }
    case NodeType.SEGMENT:
      return { sourceImage: null, segments: [] }
    default:
      return {}
  }
}

/** 노드 팩토리 - 타입과 위치로 BaseNode 생성 */
export const NodeFactory = {
  create(type: NodeType, position: Position): BaseNode {
    const { width, height } = getDefaultSize(type)
    return {
      id: generateId(),
      type,
      position,
      data: getDefaultData(type),
      width,
      height,
      selected: false,
    }
  },
}
