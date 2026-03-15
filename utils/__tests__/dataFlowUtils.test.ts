// dataFlowUtils.test.ts: 데이터 흐름 유틸리티 TDD 테스트
import { describe, it, expect } from 'vitest';
import { NodeType, ConnectorType } from '../../types';
import type { Connection, Node } from '../../types';
import {
  isImmediatePropagationNode,
  getNodeOutputKey,
  filterActiveConnections,
} from '../dataFlowUtils';

// 테스트용 최소 Node 생성 헬퍼
function makeNode(id: string, type: NodeType, isBypassed = false): Node {
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    data: {} as never,
    inputs: [],
    outputs: [],
    isBypassed,
    isCollapsed: false,
  };
}

describe('isImmediatePropagationNode', () => {
  it('Text 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.Text)).toBe(true);
  });

  it('Preset 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.Preset)).toBe(true);
  });

  it('Camera 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.Camera)).toBe(true);
  });

  it('CameraPreset 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.CameraPreset)).toBe(true);
  });

  it('List 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.List)).toBe(true);
  });

  it('Array 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.Array)).toBe(true);
  });

  it('ImageLoad 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.ImageLoad)).toBe(true);
  });

  it('VideoLoad 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.VideoLoad)).toBe(true);
  });

  it('ImagePreview 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.ImagePreview)).toBe(true);
  });

  it('SelectImage 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.SelectImage)).toBe(true);
  });

  it('PromptConcatenator 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.PromptConcatenator)).toBe(true);
  });

  it('Comment 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.Comment)).toBe(true);
  });

  it('Group 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.Group)).toBe(true);
  });

  it('Assistant 노드는 즉시 전파 노드여야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.Assistant)).toBe(true);
  });

  it('Image 노드는 즉시 전파 노드가 아니어야 한다 (Generate 필요)', () => {
    expect(isImmediatePropagationNode(NodeType.Image)).toBe(false);
  });

  it('Video 노드는 즉시 전파 노드가 아니어야 한다 (Generate 필요)', () => {
    expect(isImmediatePropagationNode(NodeType.Video)).toBe(false);
  });

  it('Model 노드는 즉시 전파 노드가 아니어야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.Model)).toBe(false);
  });

  it('Vton 노드는 즉시 전파 노드가 아니어야 한다', () => {
    expect(isImmediatePropagationNode(NodeType.Vton)).toBe(false);
  });
});

describe('getNodeOutputKey', () => {
  it('Text 노드의 출력 키는 "text"여야 한다', () => {
    expect(getNodeOutputKey(NodeType.Text)).toBe('text');
  });

  it('Preset 노드의 출력 키는 "text"여야 한다', () => {
    expect(getNodeOutputKey(NodeType.Preset)).toBe('text');
  });

  it('Camera 노드의 출력 키는 "text"여야 한다', () => {
    expect(getNodeOutputKey(NodeType.Camera)).toBe('text');
  });

  it('ImageLoad 노드의 출력 키는 "imageUrls"여야 한다', () => {
    expect(getNodeOutputKey(NodeType.ImageLoad)).toBe('imageUrls');
  });

  it('VideoLoad 노드의 출력 키는 "videoUrl"여야 한다', () => {
    expect(getNodeOutputKey(NodeType.VideoLoad)).toBe('videoUrl');
  });

  it('CameraPreset 노드의 출력 키는 "prompt"여야 한다', () => {
    expect(getNodeOutputKey(NodeType.CameraPreset)).toBe('prompt');
  });

  it('Comment 노드의 출력 키는 "text"여야 한다', () => {
    expect(getNodeOutputKey(NodeType.Comment)).toBe('text');
  });

  it('List 노드의 출력 키는 "output"여야 한다', () => {
    expect(getNodeOutputKey(NodeType.List)).toBe('output');
  });

  it('Array 노드의 출력 키는 "items"여야 한다', () => {
    expect(getNodeOutputKey(NodeType.Array)).toBe('items');
  });

  it('PromptConcatenator 노드의 출력 키는 "concatenatedText"여야 한다', () => {
    expect(getNodeOutputKey(NodeType.PromptConcatenator)).toBe('concatenatedText');
  });

  it('SelectImage 노드의 출력 키는 "outputUrl"여야 한다', () => {
    expect(getNodeOutputKey(NodeType.SelectImage)).toBe('outputUrl');
  });

  it('출력 데이터 키가 없는 노드는 null을 반환해야 한다', () => {
    expect(getNodeOutputKey(NodeType.Storyboard)).toBeNull();
  });
});

describe('filterActiveConnections', () => {
  it('바이패스된 소스 노드의 커넥션을 필터링해야 한다', () => {
    const nodes: Record<string, Node> = {
      A: makeNode('A', NodeType.Text, true), // 바이패스됨
      B: makeNode('B', NodeType.Image, false),
    };
    const connections: Connection[] = [
      { id: 'c1', fromNodeId: 'A', fromConnectorId: 'out', toNodeId: 'B', toConnectorId: 'in' },
    ];
    const result = filterActiveConnections(connections, nodes);
    expect(result).toHaveLength(0);
  });

  it('활성 소스 노드의 커넥션은 유지해야 한다', () => {
    const nodes: Record<string, Node> = {
      A: makeNode('A', NodeType.Text, false), // 활성
      B: makeNode('B', NodeType.Image, false),
    };
    const connections: Connection[] = [
      { id: 'c1', fromNodeId: 'A', fromConnectorId: 'out', toNodeId: 'B', toConnectorId: 'in' },
    ];
    const result = filterActiveConnections(connections, nodes);
    expect(result).toHaveLength(1);
  });

  it('혼합 상태: 바이패스된 노드의 커넥션만 필터링해야 한다', () => {
    const nodes: Record<string, Node> = {
      A: makeNode('A', NodeType.Text, true),  // 바이패스됨
      B: makeNode('B', NodeType.Camera, false), // 활성
      C: makeNode('C', NodeType.Image, false),
    };
    const connections: Connection[] = [
      { id: 'c1', fromNodeId: 'A', fromConnectorId: 'out', toNodeId: 'C', toConnectorId: 'in' },
      { id: 'c2', fromNodeId: 'B', fromConnectorId: 'out', toNodeId: 'C', toConnectorId: 'in2' },
    ];
    const result = filterActiveConnections(connections, nodes);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c2');
  });

  it('소스 노드가 존재하지 않는 커넥션은 필터링해야 한다', () => {
    const nodes: Record<string, Node> = {
      B: makeNode('B', NodeType.Image, false),
    };
    const connections: Connection[] = [
      { id: 'c1', fromNodeId: 'nonexistent', fromConnectorId: 'out', toNodeId: 'B', toConnectorId: 'in' },
    ];
    const result = filterActiveConnections(connections, nodes);
    expect(result).toHaveLength(0);
  });

  it('빈 커넥션 목록은 빈 배열을 반환해야 한다', () => {
    const nodes: Record<string, Node> = {
      A: makeNode('A', NodeType.Text, false),
    };
    const result = filterActiveConnections([], nodes);
    expect(result).toHaveLength(0);
  });
});
