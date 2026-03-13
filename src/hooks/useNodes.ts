// 노드 상태 관리 훅
// useImmer를 사용한 불변 상태 업데이트로 노드 CRUD 제공

import { useCallback } from 'react'
import { useImmer } from 'use-immer'
import { NodeType, type BaseNode, type Position } from '../types/nodes'

/** 노드 초기 데이터 팩토리 */
function createInitialData(type: NodeType): Record<string, unknown> {
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
      return { sourceText: '', sourceLang: 'ko', targetLang: 'en', translatedText: '' }
    case NodeType.SUMMARY:
      return { sourceText: '', maxLength: 200, summary: '' }
    case NodeType.KEYWORD:
      return { sourceText: '', maxKeywords: 10, keywords: [] }
    case NodeType.SENTIMENT:
      return { sourceText: '', sentiment: undefined, confidence: undefined }
    case NodeType.CLASSIFY:
      return { sourceImage: null, categories: [], result: undefined, confidence: undefined }
    case NodeType.DETECT:
      return { sourceImage: null, detections: [] }
    case NodeType.SEGMENT:
      return { sourceImage: null, segments: [] }
    default:
      return {}
  }
}

/** 고유 노드 ID 생성 */
function generateNodeId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface UseNodesReturn {
  nodes: BaseNode[]
  addNode: (type: NodeType, position: Position) => string
  removeNode: (id: string) => void
  updateNode: (id: string, data: Record<string, unknown>) => void
  moveNode: (id: string, position: Position) => void
}

export function useNodes(): UseNodesReturn {
  const [nodes, updateNodes] = useImmer<BaseNode[]>([])

  const addNode = useCallback(
    (type: NodeType, position: Position): string => {
      const id = generateNodeId()
      updateNodes((draft) => {
        draft.push({
          id,
          type,
          position,
          data: createInitialData(type),
        })
      })
      return id
    },
    [updateNodes],
  )

  const removeNode = useCallback(
    (id: string) => {
      updateNodes((draft) => {
        const index = draft.findIndex((n) => n.id === id)
        if (index !== -1) {
          draft.splice(index, 1)
        }
      })
    },
    [updateNodes],
  )

  const updateNode = useCallback(
    (id: string, data: Record<string, unknown>) => {
      updateNodes((draft) => {
        const node = draft.find((n) => n.id === id)
        if (node) {
          node.data = { ...node.data, ...data }
        }
      })
    },
    [updateNodes],
  )

  const moveNode = useCallback(
    (id: string, position: Position) => {
      updateNodes((draft) => {
        const node = draft.find((n) => n.id === id)
        if (node) {
          node.position = position
        }
      })
    },
    [updateNodes],
  )

  return { nodes, addNode, removeNode, updateNode, moveNode }
}
