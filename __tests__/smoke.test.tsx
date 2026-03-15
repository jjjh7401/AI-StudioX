// smoke.test.tsx: 기본 타입 임포트 및 유틸리티 함수 동작 확인 스모크 테스트
// D3 및 브라우저 API에 의존하는 React 컴포넌트 렌더링은 제외
import { describe, it, expect } from 'vitest';
import type { Node, Connection, PanZoom, Point } from '../types';
import { NodeType, ConnectorType } from '../types';

describe('타입 임포트 스모크 테스트', () => {
  it('NodeType enum을 임포트할 수 있어야 한다', () => {
    expect(NodeType.Text).toBe('Text');
    expect(NodeType.Image).toBe('Image');
    expect(NodeType.Assistant).toBe('Assistant');
  });

  it('ConnectorType enum을 임포트할 수 있어야 한다', () => {
    expect(ConnectorType.Text).toBe('Text');
    expect(ConnectorType.Image).toBe('Image');
  });

  it('PanZoom 타입이 올바른 구조를 가져야 한다', () => {
    const panZoom: PanZoom = { x: 100, y: 200, k: 1.5 };
    expect(panZoom.x).toBe(100);
    expect(panZoom.y).toBe(200);
    expect(panZoom.k).toBe(1.5);
  });

  it('Point 타입이 올바른 구조를 가져야 한다', () => {
    const point: Point = { x: 10, y: 20 };
    expect(point.x).toBe(10);
    expect(point.y).toBe(20);
  });

  it('Connection 타입이 올바른 구조를 가져야 한다', () => {
    const conn: Connection = {
      id: 'conn-1',
      fromNodeId: 'node-a',
      fromConnectorId: 'out-0',
      toNodeId: 'node-b',
      toConnectorId: 'in-0',
    };
    expect(conn.id).toBe('conn-1');
    expect(conn.fromNodeId).toBe('node-a');
  });

  it('Node 타입이 올바른 구조를 가져야 한다', () => {
    const node: Node = {
      id: 'node-1',
      type: NodeType.Text,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 100 },
      data: { text: '테스트' },
      inputs: [],
      outputs: [],
      isBypassed: false,
    };
    expect(node.id).toBe('node-1');
    expect(node.type).toBe(NodeType.Text);
    expect(node.isBypassed).toBe(false);
  });
});
