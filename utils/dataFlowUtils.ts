// dataFlowUtils: 노드 간 데이터 전파 유틸리티
// App.tsx의 propagateImmediateUpdates 로직을 순수 함수로 분리
import { NodeType } from '../types';
import type { Connection, Node } from '../types';

// 즉시 전파 가능한 노드 타입 집합
// App.tsx의 propagateImmediateUpdates 내부 immediateNodeTypes 목록 기반
const IMMEDIATE_PROPAGATION_TYPES = new Set<NodeType>([
  NodeType.Text,
  NodeType.Preset,
  NodeType.Camera,
  NodeType.CameraPreset,
  NodeType.List,
  NodeType.Array,
  NodeType.ImageLoad,
  NodeType.VideoLoad,
  NodeType.ImagePreview,
  NodeType.SelectImage,
  NodeType.PromptConcatenator,
  NodeType.Comment,
  NodeType.Group,
  NodeType.Assistant,
]);

/**
 * 해당 노드 타입이 즉시 데이터 전파가 가능한지 반환
 * 즉시 전파 노드: 사용자 액션 없이 데이터가 자동으로 흐르는 노드
 * 비즉시 노드: Image, Video 등 Generate 버튼 필요
 */
export function isImmediatePropagationNode(nodeType: NodeType): boolean {
  return IMMEDIATE_PROPAGATION_TYPES.has(nodeType);
}

/**
 * 특정 노드 타입의 출력 데이터 키 반환
 * 데이터 전파 시 어떤 프로퍼티를 전달할지 결정하는 데 사용
 * 명확한 출력 데이터가 없는 경우 null 반환
 */
export function getNodeOutputKey(nodeType: NodeType): string | null {
  switch (nodeType) {
    case NodeType.Text:
      return 'text';
    case NodeType.Preset:
      return 'text';
    case NodeType.Camera:
      return 'text';
    case NodeType.CameraPreset:
      return 'prompt';
    case NodeType.Comment:
      return 'text';
    case NodeType.ImageLoad:
      return 'imageUrls';
    case NodeType.VideoLoad:
      return 'videoUrl';
    case NodeType.List:
      return 'output';
    case NodeType.Array:
      return 'items';
    case NodeType.PromptConcatenator:
      return 'concatenatedText';
    case NodeType.SelectImage:
      return 'outputUrl';
    default:
      return null;
  }
}

/**
 * 바이패스된 소스 노드가 있는 커넥션을 필터링하여 활성 커넥션만 반환
 * 바이패스된 노드의 출력은 하위 노드로 전달되지 않아야 한다
 * 소스 노드가 존재하지 않는 커넥션도 필터링
 */
export function filterActiveConnections(
  connections: Connection[],
  nodes: Record<string, Node>
): Connection[] {
  return connections.filter((conn) => {
    const sourceNode = nodes[conn.fromNodeId];
    // 소스 노드가 없거나 바이패스된 경우 필터링
    if (!sourceNode || sourceNode.isBypassed) return false;
    return true;
  });
}
