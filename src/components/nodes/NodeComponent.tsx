// 노드 컴포넌트 디스패처
// 노드 타입에 따라 적절한 컴포넌트를 렌더링

import Draggable from 'react-draggable'
import { useRef } from 'react'
import { NodeType, type BaseNode, type AnyNode } from '../../types/nodes'
import { TextNode } from './types/TextNode'
import { CommentNode } from './types/CommentNode'
import { ImageNode } from './types/ImageNode'
import { AssistantNode } from './types/AssistantNode'
import { VideoNode } from './types/VideoNode'
import { CameraNode } from './types/CameraNode'
import { ModelNode } from './types/ModelNode'
import { VtonNode } from './types/VtonNode'
import { StoryboardNode } from './types/StoryboardNode'
import { ScriptNode } from './types/ScriptNode'
import { ArrayNode } from './types/ArrayNode'
import { ListNode } from './types/ListNode'
import { CompositeNode } from './types/CompositeNode'
import { StitchNode } from './types/StitchNode'
import { GridShotNode } from './types/GridShotNode'
import { GridExtractorNode } from './types/GridExtractorNode'
import { ImageModifyNode } from './types/ImageModifyNode'
import { GroupNode } from './types/GroupNode'
import { AudioNode } from './types/AudioNode'
import { TranscribeNode } from './types/TranscribeNode'
import { TranslateNode } from './types/TranslateNode'
import { SummaryNode } from './types/SummaryNode'
import { KeywordNode } from './types/KeywordNode'
import { SentimentNode } from './types/SentimentNode'
import { ClassifyNode } from './types/ClassifyNode'
import { DetectNode } from './types/DetectNode'
import { SegmentNode } from './types/SegmentNode'
import { GenericNode } from './types/GenericNode'

interface NodeComponentProps {
  node: BaseNode
  isSelected?: boolean
  onUpdate?: (id: string, data: Record<string, unknown>) => void
  onMove?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function NodeComponent({
  node,
  isSelected = false,
  onUpdate,
  onMove,
  onSelect,
}: NodeComponentProps) {
  const nodeRef = useRef<HTMLDivElement>(null)

  const handleUpdate = (data: Record<string, unknown>) => {
    onUpdate?.(node.id, data)
  }

  const renderNodeContent = () => {
    const anyNode = node as AnyNode
    switch (node.type) {
      case NodeType.TEXT:
        return (
          <TextNode
            node={anyNode as Parameters<typeof TextNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.COMMENT:
        return (
          <CommentNode
            node={anyNode as Parameters<typeof CommentNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.IMAGE:
        return (
          <ImageNode
            node={anyNode as Parameters<typeof ImageNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.ASSISTANT:
        return (
          <AssistantNode
            node={anyNode as Parameters<typeof AssistantNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.VIDEO:
        return (
          <VideoNode
            node={anyNode as Parameters<typeof VideoNode>[0]['node']}
            isSelected={isSelected}
          />
        )
      case NodeType.CAMERA:
        return (
          <CameraNode
            node={anyNode as Parameters<typeof CameraNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.MODEL:
        return (
          <ModelNode
            node={anyNode as Parameters<typeof ModelNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.VTON:
        return (
          <VtonNode
            node={anyNode as Parameters<typeof VtonNode>[0]['node']}
            isSelected={isSelected}
          />
        )
      case NodeType.STORYBOARD:
        return (
          <StoryboardNode
            node={anyNode as Parameters<typeof StoryboardNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.SCRIPT:
        return (
          <ScriptNode
            node={anyNode as Parameters<typeof ScriptNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.ARRAY:
        return (
          <ArrayNode
            node={anyNode as Parameters<typeof ArrayNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.LIST:
        return (
          <ListNode
            node={anyNode as Parameters<typeof ListNode>[0]['node']}
            isSelected={isSelected}
          />
        )
      case NodeType.COMPOSITE:
        return (
          <CompositeNode
            node={anyNode as Parameters<typeof CompositeNode>[0]['node']}
            isSelected={isSelected}
          />
        )
      case NodeType.STITCH:
        return (
          <StitchNode
            node={anyNode as Parameters<typeof StitchNode>[0]['node']}
            isSelected={isSelected}
          />
        )
      case NodeType.GRID_SHOT:
        return (
          <GridShotNode
            node={anyNode as Parameters<typeof GridShotNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.GRID_EXTRACTOR:
        return (
          <GridExtractorNode
            node={anyNode as Parameters<typeof GridExtractorNode>[0]['node']}
            isSelected={isSelected}
          />
        )
      case NodeType.IMAGE_MODIFY:
        return (
          <ImageModifyNode
            node={anyNode as Parameters<typeof ImageModifyNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.GROUP:
        return (
          <GroupNode
            node={anyNode as Parameters<typeof GroupNode>[0]['node']}
            onUpdate={handleUpdate}
            isSelected={isSelected}
          />
        )
      case NodeType.AUDIO:
        return <AudioNode node={anyNode as Parameters<typeof AudioNode>[0]['node']} isSelected={isSelected} />
      case NodeType.TRANSCRIBE:
        return <TranscribeNode node={anyNode as Parameters<typeof TranscribeNode>[0]['node']} isSelected={isSelected} />
      case NodeType.TRANSLATE:
        return <TranslateNode node={anyNode as Parameters<typeof TranslateNode>[0]['node']} onUpdate={handleUpdate} isSelected={isSelected} />
      case NodeType.SUMMARY:
        return <SummaryNode node={anyNode as Parameters<typeof SummaryNode>[0]['node']} isSelected={isSelected} />
      case NodeType.KEYWORD:
        return <KeywordNode node={anyNode as Parameters<typeof KeywordNode>[0]['node']} isSelected={isSelected} />
      case NodeType.SENTIMENT:
        return <SentimentNode node={anyNode as Parameters<typeof SentimentNode>[0]['node']} isSelected={isSelected} />
      case NodeType.CLASSIFY:
        return <ClassifyNode node={anyNode as Parameters<typeof ClassifyNode>[0]['node']} isSelected={isSelected} />
      case NodeType.DETECT:
        return <DetectNode node={anyNode as Parameters<typeof DetectNode>[0]['node']} isSelected={isSelected} />
      case NodeType.SEGMENT:
        return <SegmentNode node={anyNode as Parameters<typeof SegmentNode>[0]['node']} isSelected={isSelected} />
      default:
        return <GenericNode node={node} isSelected={isSelected} />
    }
  }

  return (
    <Draggable
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
      position={{ x: node.position.x, y: node.position.y }}
      onStop={(_e, data) => onMove?.(node.id, data.x, data.y)}
      onMouseDown={() => onSelect?.(node.id)}
    >
      <div
        ref={nodeRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
        data-testid={`node-${node.id}`}
      >
        {renderNodeContent()}
      </div>
    </Draggable>
  )
}
