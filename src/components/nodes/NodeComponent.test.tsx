import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NodeComponent } from './NodeComponent'
import { NodeType, type BaseNode } from '../../types/nodes'

// react-draggable를 모킹 (DOM 환경에서 drag 동작 제한)
vi.mock('react-draggable', () => ({
  default: ({ children, onStop, onMouseDown }: {
    children: React.ReactNode
    onStop?: (e: unknown, data: { x: number; y: number }) => void
    onMouseDown?: () => void
  }) => (
    <div
      onMouseDown={onMouseDown}
      onDragEnd={() => onStop?.({}, { x: 0, y: 0 })}
    >
      {children}
    </div>
  ),
}))

function createNode(type: NodeType, id = 'test-node'): BaseNode {
  return {
    id,
    type,
    position: { x: 100, y: 200 },
    data: {},
  }
}

describe('NodeComponent', () => {
  it('renders TextNode for TEXT type', () => {
    const node = { ...createNode(NodeType.TEXT), data: { text: 'hello', label: 'Text' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('text-node')).toBeDefined()
  })

  it('renders CommentNode for COMMENT type', () => {
    const node = { ...createNode(NodeType.COMMENT), data: { text: '', color: '#fff9c4' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('comment-node')).toBeDefined()
  })

  it('renders ImageNode for IMAGE type', () => {
    const node = { ...createNode(NodeType.IMAGE), data: { src: null, label: 'Image' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('image-node')).toBeDefined()
  })

  it('renders AssistantNode for ASSISTANT type', () => {
    const node = { ...createNode(NodeType.ASSISTANT), data: { prompt: '', model: 'gemini-2.0-flash', isRunning: false } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('assistant-node')).toBeDefined()
  })

  it('renders VideoNode for VIDEO type', () => {
    const node = { ...createNode(NodeType.VIDEO), data: { src: null, label: 'Video' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('video-node')).toBeDefined()
  })

  it('renders CameraNode for CAMERA type', () => {
    const node = { ...createNode(NodeType.CAMERA), data: { isCapturing: false, capturedImage: null } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('camera-node')).toBeDefined()
  })

  it('renders ModelNode for MODEL type', () => {
    const node = { ...createNode(NodeType.MODEL), data: { gender: 'female', age: 25, hairStyle: 'straight' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('model-node')).toBeDefined()
  })

  it('renders VtonNode for VTON type', () => {
    const node = { ...createNode(NodeType.VTON), data: { outfitImage: null, poseImage: null } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('vton-node')).toBeDefined()
  })

  it('renders StoryboardNode for STORYBOARD type', () => {
    const node = { ...createNode(NodeType.STORYBOARD), data: { scenes: [], maxScenes: 5 } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('storyboard-node')).toBeDefined()
  })

  it('renders ScriptNode for SCRIPT type', () => {
    const node = { ...createNode(NodeType.SCRIPT), data: { productName: '', targetAudience: '', tone: 'professional' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('script-node')).toBeDefined()
  })

  it('renders ArrayNode for ARRAY type', () => {
    const node = { ...createNode(NodeType.ARRAY), data: { items: [], label: 'Array' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('array-node')).toBeDefined()
  })

  it('renders ListNode for LIST type', () => {
    const node = { ...createNode(NodeType.LIST), data: { items: [], displayMode: 'unordered' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('list-node')).toBeDefined()
  })

  it('renders CompositeNode for COMPOSITE type', () => {
    const node = { ...createNode(NodeType.COMPOSITE), data: { layers: [], blendMode: 'normal', result: null } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('composite-node')).toBeDefined()
  })

  it('renders StitchNode for STITCH type', () => {
    const node = { ...createNode(NodeType.STITCH), data: { images: [], direction: 'horizontal', result: null } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('stitch-node')).toBeDefined()
  })

  it('renders GridShotNode for GRID_SHOT type', () => {
    const node = { ...createNode(NodeType.GRID_SHOT), data: { columns: 3, rows: 3, prompt: '', result: null } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('grid-shot-node')).toBeDefined()
  })

  it('renders GridExtractorNode for GRID_EXTRACTOR type', () => {
    const node = { ...createNode(NodeType.GRID_EXTRACTOR), data: { sourceImage: null, columns: 3, rows: 3, extractedImages: [] } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('grid-extractor-node')).toBeDefined()
  })

  it('renders ImageModifyNode for IMAGE_MODIFY type', () => {
    const node = { ...createNode(NodeType.IMAGE_MODIFY), data: { sourceImage: null, prompt: '', mask: null, result: null } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('image-modify-node')).toBeDefined()
  })

  it('renders GroupNode for GROUP type', () => {
    const node = { ...createNode(NodeType.GROUP), data: { nodeIds: [], label: 'Group', collapsed: false } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('group-node')).toBeDefined()
  })

  it('renders AudioNode for AUDIO type', () => {
    const node = { ...createNode(NodeType.AUDIO), data: { src: null, label: 'Audio' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('audio-node')).toBeDefined()
  })

  it('renders TranscribeNode for TRANSCRIBE type', () => {
    const node = { ...createNode(NodeType.TRANSCRIBE), data: { audioSrc: null, transcript: '' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('transcribe-node')).toBeDefined()
  })

  it('renders TranslateNode for TRANSLATE type', () => {
    const node = { ...createNode(NodeType.TRANSLATE), data: { sourceText: '', targetLang: 'en' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('translate-node')).toBeDefined()
  })

  it('renders SummaryNode for SUMMARY type', () => {
    const node = { ...createNode(NodeType.SUMMARY), data: { sourceText: '', maxLength: 200 } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('summary-node')).toBeDefined()
  })

  it('renders KeywordNode for KEYWORD type', () => {
    const node = { ...createNode(NodeType.KEYWORD), data: { sourceText: '', maxKeywords: 10, keywords: [] } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('keyword-node')).toBeDefined()
  })

  it('renders SentimentNode for SENTIMENT type', () => {
    const node = { ...createNode(NodeType.SENTIMENT), data: { sourceText: '' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('sentiment-node')).toBeDefined()
  })

  it('renders ClassifyNode for CLASSIFY type', () => {
    const node = { ...createNode(NodeType.CLASSIFY), data: { sourceImage: null, categories: [] } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('classify-node')).toBeDefined()
  })

  it('renders DetectNode for DETECT type', () => {
    const node = { ...createNode(NodeType.DETECT), data: { sourceImage: null, detections: [] } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('detect-node')).toBeDefined()
  })

  it('renders SegmentNode for SEGMENT type', () => {
    const node = { ...createNode(NodeType.SEGMENT), data: { sourceImage: null, segments: [] } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('segment-node')).toBeDefined()
  })

  it('should show input/output ports on TextNode', () => {
    const node = { ...createNode(NodeType.TEXT), data: { text: '', label: 'Text' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('output-port-TEXT')).toBeDefined()
  })

  it('should show input/output ports on ImageNode', () => {
    const node = { ...createNode(NodeType.IMAGE), data: { src: null, label: 'Image' } }
    render(<NodeComponent node={node} />)
    expect(screen.getByTestId('output-port-IMAGE')).toBeDefined()
  })
})
