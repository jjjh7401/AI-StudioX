import { describe, it, expect } from 'vitest'
import {
  NodeType,
  type BaseNode,
  type TextNode,
  type AssistantNode,
  type ImageNode,
  type VideoNode,
  type CameraNode,
  type ModelNode,
  type VtonNode,
  type CommentNode,
  type StoryboardNode,
  type ArrayNode,
  type ListNode,
  type GroupNode,
  type AudioNode,
  type TranscribeNode,
  type TranslateNode,
  type SummaryNode,
  type KeywordNode,
  type SentimentNode,
  type ClassifyNode,
  type DetectNode,
  type SegmentNode,
  PortDirection,
} from './nodes'

// 27개 NodeType enum 값이 모두 존재하는지 확인
describe('NodeType enum', () => {
  it('should define all 27 node types', () => {
    const expectedTypes = [
      'TEXT',
      'ASSISTANT',
      'IMAGE',
      'VIDEO',
      'CAMERA',
      'MODEL',
      'VTON',
      'COMMENT',
      'STORYBOARD',
      'SCRIPT',
      'ARRAY',
      'LIST',
      'COMPOSITE',
      'STITCH',
      'GRID_SHOT',
      'GRID_EXTRACTOR',
      'IMAGE_MODIFY',
      'GROUP',
      'AUDIO',
      'TRANSCRIBE',
      'TRANSLATE',
      'SUMMARY',
      'KEYWORD',
      'SENTIMENT',
      'CLASSIFY',
      'DETECT',
      'SEGMENT',
    ]
    expect(Object.keys(NodeType)).toHaveLength(27)
    for (const t of expectedTypes) {
      expect(NodeType).toHaveProperty(t)
    }
  })
})

// BaseNode 인터페이스 구조 확인
describe('BaseNode structure', () => {
  it('should have required fields: id, type, position, data', () => {
    const node: BaseNode = {
      id: 'node-1',
      type: NodeType.TEXT,
      position: { x: 100, y: 200 },
      data: {},
    }
    expect(node.id).toBe('node-1')
    expect(node.type).toBe(NodeType.TEXT)
    expect(node.position.x).toBe(100)
    expect(node.position.y).toBe(200)
  })
})

// 각 특화 노드 타입 구조 확인
describe('Specific node types', () => {
  it('TextNode should have correct structure', () => {
    const node: TextNode = {
      id: 'text-1',
      type: NodeType.TEXT,
      position: { x: 0, y: 0 },
      data: { text: 'Hello World', label: 'Text Input' },
    }
    expect(node.data.text).toBe('Hello World')
  })

  it('AssistantNode should have correct structure', () => {
    const node: AssistantNode = {
      id: 'assistant-1',
      type: NodeType.ASSISTANT,
      position: { x: 0, y: 0 },
      data: { prompt: 'Analyze this', model: 'gemini-2.0-flash', isRunning: false },
    }
    expect(node.data.prompt).toBe('Analyze this')
    expect(node.data.isRunning).toBe(false)
  })

  it('ImageNode should have correct structure', () => {
    const node: ImageNode = {
      id: 'image-1',
      type: NodeType.IMAGE,
      position: { x: 0, y: 0 },
      data: { src: null, label: 'Image Input' },
    }
    expect(node.data.src).toBeNull()
  })

  it('VideoNode should have correct structure', () => {
    const node: VideoNode = {
      id: 'video-1',
      type: NodeType.VIDEO,
      position: { x: 0, y: 0 },
      data: { src: null, label: 'Video Output' },
    }
    expect(node.data.src).toBeNull()
  })

  it('CameraNode should have correct structure', () => {
    const node: CameraNode = {
      id: 'camera-1',
      type: NodeType.CAMERA,
      position: { x: 0, y: 0 },
      data: { isCapturing: false, capturedImage: null },
    }
    expect(node.data.isCapturing).toBe(false)
  })

  it('ModelNode should have correct structure', () => {
    const node: ModelNode = {
      id: 'model-1',
      type: NodeType.MODEL,
      position: { x: 0, y: 0 },
      data: { gender: 'female', age: 25, hairStyle: 'straight' },
    }
    expect(node.data.gender).toBe('female')
  })

  it('VtonNode should have correct structure', () => {
    const node: VtonNode = {
      id: 'vton-1',
      type: NodeType.VTON,
      position: { x: 0, y: 0 },
      data: { outfitImage: null, poseImage: null },
    }
    expect(node.data.outfitImage).toBeNull()
  })

  it('CommentNode should have correct structure', () => {
    const node: CommentNode = {
      id: 'comment-1',
      type: NodeType.COMMENT,
      position: { x: 0, y: 0 },
      data: { text: 'This is a note', color: '#fff9c4' },
    }
    expect(node.data.text).toBe('This is a note')
  })

  it('StoryboardNode should have correct structure', () => {
    const node: StoryboardNode = {
      id: 'storyboard-1',
      type: NodeType.STORYBOARD,
      position: { x: 0, y: 0 },
      data: { scenes: [], maxScenes: 5 },
    }
    expect(node.data.scenes).toHaveLength(0)
    expect(node.data.maxScenes).toBe(5)
  })

  it('GroupNode should have correct structure', () => {
    const node: GroupNode = {
      id: 'group-1',
      type: NodeType.GROUP,
      position: { x: 0, y: 0 },
      data: { nodeIds: ['node-1', 'node-2'], label: 'Group 1' },
    }
    expect(node.data.nodeIds).toHaveLength(2)
  })
})

// 포트 방향 enum 확인
describe('PortDirection enum', () => {
  it('should have INPUT and OUTPUT directions', () => {
    expect(PortDirection.INPUT).toBeDefined()
    expect(PortDirection.OUTPUT).toBeDefined()
  })
})

// 타입들이 올바르게 타입 추론되는지 확인
describe('Type inference', () => {
  it('all node types should be type-safe', () => {
    const nodes: BaseNode[] = [
      { id: '1', type: NodeType.TEXT, position: { x: 0, y: 0 }, data: {} } as TextNode,
      { id: '2', type: NodeType.ASSISTANT, position: { x: 0, y: 0 }, data: {} } as AssistantNode,
      { id: '3', type: NodeType.IMAGE, position: { x: 0, y: 0 }, data: {} } as ImageNode,
      { id: '4', type: NodeType.ARRAY, position: { x: 0, y: 0 }, data: {} } as ArrayNode,
      { id: '5', type: NodeType.LIST, position: { x: 0, y: 0 }, data: {} } as ListNode,
      { id: '6', type: NodeType.AUDIO, position: { x: 0, y: 0 }, data: {} } as AudioNode,
      { id: '7', type: NodeType.TRANSCRIBE, position: { x: 0, y: 0 }, data: {} } as TranscribeNode,
      { id: '8', type: NodeType.TRANSLATE, position: { x: 0, y: 0 }, data: {} } as TranslateNode,
      { id: '9', type: NodeType.SUMMARY, position: { x: 0, y: 0 }, data: {} } as SummaryNode,
      { id: '10', type: NodeType.KEYWORD, position: { x: 0, y: 0 }, data: {} } as KeywordNode,
      { id: '11', type: NodeType.SENTIMENT, position: { x: 0, y: 0 }, data: {} } as SentimentNode,
      { id: '12', type: NodeType.CLASSIFY, position: { x: 0, y: 0 }, data: {} } as ClassifyNode,
      { id: '13', type: NodeType.DETECT, position: { x: 0, y: 0 }, data: {} } as DetectNode,
      { id: '14', type: NodeType.SEGMENT, position: { x: 0, y: 0 }, data: {} } as SegmentNode,
    ]
    expect(nodes).toHaveLength(14)
  })
})
