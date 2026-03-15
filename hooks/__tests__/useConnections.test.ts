// useConnections.test.ts: useConnections 훅 TDD 스펙 테스트
// RED-GREEN-REFACTOR 사이클로 구현 (SPEC-UI-001 M3)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ConnectorType, NodeType } from '../../types';
import type { Connection, Connector, Node, NodeData } from '../../types';

// ========================
// 테스트용 헬퍼 팩토리
// ========================

/** 기본 텍스트 출력 커넥터 생성 */
function makeConnector(
  id: string,
  type: ConnectorType = ConnectorType.Text
): Connector {
  return { id, name: id, type };
}

/** 기본 테스트용 노드 생성 */
function makeNode(
  id: string,
  type: NodeType = NodeType.Text,
  inputs: Connector[] = [],
  outputs: Connector[] = []
): Node {
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    size: { width: 300, height: 200 },
    data: { text: 'hello' } as NodeData,
    inputs,
    outputs,
    isCollapsed: false,
    isBypassed: false,
  };
}

/** getWorldPosition 모킹: 화면 좌표를 그대로 반환 */
function createMockGetWorldPosition(worldX = 100, worldY = 200) {
  return vi.fn((_sx: number, _sy: number): [number, number] => [worldX, worldY]);
}

// ========================
// Cycle 1: 커넥션 생성 흐름 테스트
// ========================
describe('useConnections 훅', () => {
  describe('Cycle 1: 커넥션 생성 흐름', () => {
    it('초기 상태: connections가 빈 배열이어야 한다', async () => {
      const { useConnections } = await import('../useConnections');
      const nodeA = makeNode('A', NodeType.Text, [], [makeConnector('out-A')]);
      const nodeB = makeNode('B', NodeType.Image, [makeConnector('in-B')], []);
      const nodes = { A: nodeA, B: nodeB };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );
      expect(result.current.connections).toEqual([]);
    });

    it('초기 상태: pendingConnection이 undefined이어야 한다', async () => {
      const { useConnections } = await import('../useConnections');
      const { result } = renderHook(() =>
        useConnections({ nodes: {}, getWorldPosition: createMockGetWorldPosition() })
      );
      expect(result.current.pendingConnection).toBeUndefined();
    });

    it('startConnection 호출 시 pendingConnection이 설정된다', async () => {
      const { useConnections } = await import('../useConnections');
      const outConnector = makeConnector('out-A', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outConnector]);
      const nodes = { A: nodeA };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      act(() => {
        result.current.startConnection('A', outConnector, 10, 20);
      });

      expect(result.current.pendingConnection).toBeDefined();
      expect(result.current.pendingConnection?.fromNodeId).toBe('A');
      expect(result.current.pendingConnection?.fromConnector.id).toBe('out-A');
    });

    it('completeConnection: 타입이 같은 경우 커넥션이 추가된다', async () => {
      const { useConnections } = await import('../useConnections');
      const outConnector = makeConnector('out-A', ConnectorType.Text);
      const inConnector = makeConnector('in-B', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outConnector]);
      const nodeB = makeNode('B', NodeType.Image, [inConnector], []);
      const nodes = { A: nodeA, B: nodeB };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      act(() => {
        result.current.startConnection('A', outConnector, 10, 20);
      });
      act(() => {
        result.current.completeConnection('B', inConnector);
      });

      expect(result.current.connections).toHaveLength(1);
      const conn = result.current.connections[0];
      expect(conn.fromNodeId).toBe('A');
      expect(conn.fromConnectorId).toBe('out-A');
      expect(conn.toNodeId).toBe('B');
      expect(conn.toConnectorId).toBe('in-B');
    });

    it('completeConnection 후 pendingConnection이 undefined로 초기화된다', async () => {
      const { useConnections } = await import('../useConnections');
      const outConnector = makeConnector('out-A', ConnectorType.Text);
      const inConnector = makeConnector('in-B', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outConnector]);
      const nodeB = makeNode('B', NodeType.Image, [inConnector], []);
      const nodes = { A: nodeA, B: nodeB };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      act(() => {
        result.current.startConnection('A', outConnector, 10, 20);
        result.current.completeConnection('B', inConnector);
      });

      expect(result.current.pendingConnection).toBeUndefined();
    });

    it('cancelConnection 호출 시 pendingConnection이 취소된다', async () => {
      const { useConnections } = await import('../useConnections');
      const outConnector = makeConnector('out-A', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outConnector]);
      const { result } = renderHook(() =>
        useConnections({ nodes: { A: nodeA }, getWorldPosition: createMockGetWorldPosition() })
      );

      act(() => {
        result.current.startConnection('A', outConnector, 10, 20);
      });
      expect(result.current.pendingConnection).toBeDefined();

      act(() => {
        result.current.cancelConnection();
      });
      expect(result.current.pendingConnection).toBeUndefined();
    });
  });

  // ========================
  // Cycle 1 (추가): 타입 호환성 검사
  // ========================
  describe('Cycle 1 (추가): 커넥터 타입 호환성 검사', () => {
    it('EC-004: 타입이 다른 커넥터 간 연결 시도 시 커넥션이 추가되지 않는다', async () => {
      const { useConnections } = await import('../useConnections');
      const outConnector = makeConnector('out-A', ConnectorType.Text);
      const inConnector = makeConnector('in-B', ConnectorType.Image);
      const nodeA = makeNode('A', NodeType.Text, [], [outConnector]);
      const nodeB = makeNode('B', NodeType.Image, [inConnector], []);
      const nodes = { A: nodeA, B: nodeB };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      act(() => {
        result.current.startConnection('A', outConnector, 10, 20);
        result.current.completeConnection('B', inConnector);
      });

      expect(result.current.connections).toHaveLength(0);
    });

    it('EC-004: 타입이 같은 커넥터 간 연결은 허용된다 (Image-Image)', async () => {
      const { useConnections } = await import('../useConnections');
      const outConnector = makeConnector('out-A', ConnectorType.Image);
      const inConnector = makeConnector('in-B', ConnectorType.Image);
      const nodeA = makeNode('A', NodeType.Image, [], [outConnector]);
      const nodeB = makeNode('B', NodeType.Image, [inConnector], []);
      const nodes = { A: nodeA, B: nodeB };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      act(() => {
        result.current.startConnection('A', outConnector, 10, 20);
        result.current.completeConnection('B', inConnector);
      });

      expect(result.current.connections).toHaveLength(1);
    });
  });

  // ========================
  // Cycle 1 (추가): 순환 감지 & 자기 참조 방지
  // ========================
  describe('Cycle 1 (추가): 순환 참조 및 자기 참조 방지', () => {
    it('EC-001: 자기 자신으로의 연결은 허용되지 않는다', async () => {
      const { useConnections } = await import('../useConnections');
      const outConnector = makeConnector('out-A', ConnectorType.Text);
      const inConnector = makeConnector('in-A', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [inConnector], [outConnector]);
      const { result } = renderHook(() =>
        useConnections({ nodes: { A: nodeA }, getWorldPosition: createMockGetWorldPosition() })
      );

      act(() => {
        result.current.startConnection('A', outConnector, 10, 20);
        result.current.completeConnection('A', inConnector);
      });

      expect(result.current.connections).toHaveLength(0);
    });

    it('EC-003: A→B→C 연결 후 C→A 연결은 순환으로 거부된다', async () => {
      const { useConnections } = await import('../useConnections');
      const outA = makeConnector('out-A', ConnectorType.Text);
      const inB = makeConnector('in-B', ConnectorType.Text);
      const outB = makeConnector('out-B', ConnectorType.Text);
      const inC = makeConnector('in-C', ConnectorType.Text);
      const outC = makeConnector('out-C', ConnectorType.Text);
      const inA = makeConnector('in-A', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [inA], [outA]);
      const nodeB = makeNode('B', NodeType.Text, [inB], [outB]);
      const nodeC = makeNode('C', NodeType.Text, [inC], [outC]);
      const nodes = { A: nodeA, B: nodeB, C: nodeC };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      // A→B 연결
      act(() => {
        result.current.startConnection('A', outA, 10, 20);
        result.current.completeConnection('B', inB);
      });
      // B→C 연결
      act(() => {
        result.current.startConnection('B', outB, 10, 20);
        result.current.completeConnection('C', inC);
      });

      expect(result.current.connections).toHaveLength(2);

      // C→A 연결 시도: 순환 발생해야 거부
      act(() => {
        result.current.startConnection('C', outC, 10, 20);
        result.current.completeConnection('A', inA);
      });

      expect(result.current.connections).toHaveLength(2);
    });
  });

  // ========================
  // Cycle 2: 커넥션 삭제 테스트
  // ========================
  describe('Cycle 2: 커넥션 삭제', () => {
    it('deleteConnections: 특정 ID 커넥션이 삭제된다', async () => {
      const { useConnections } = await import('../useConnections');
      const outA = makeConnector('out-A', ConnectorType.Text);
      const inB = makeConnector('in-B', ConnectorType.Text);
      const outA2 = makeConnector('out-A2', ConnectorType.Text);
      const inC = makeConnector('in-C', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outA, outA2]);
      const nodeB = makeNode('B', NodeType.Text, [inB], []);
      const nodeC = makeNode('C', NodeType.Text, [inC], []);
      const nodes = { A: nodeA, B: nodeB, C: nodeC };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      // act 블록을 분리하여 React 배치 업데이트 이슈 방지
      act(() => { result.current.startConnection('A', outA, 10, 20); });
      act(() => { result.current.completeConnection('B', inB); });
      act(() => { result.current.startConnection('A', outA2, 10, 20); });
      act(() => { result.current.completeConnection('C', inC); });

      expect(result.current.connections).toHaveLength(2);
      const idToDelete = result.current.connections[0].id;

      act(() => {
        result.current.deleteConnections([idToDelete]);
      });

      expect(result.current.connections).toHaveLength(1);
      expect(result.current.connections.every(c => c.id !== idToDelete)).toBe(true);
    });

    it('deleteConnectionsForNodes: 노드 ID에 연결된 모든 커넥션이 삭제된다', async () => {
      const { useConnections } = await import('../useConnections');
      const outA = makeConnector('out-A', ConnectorType.Text);
      const inB = makeConnector('in-B', ConnectorType.Text);
      const outB = makeConnector('out-B', ConnectorType.Text);
      const inC = makeConnector('in-C', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outA]);
      const nodeB = makeNode('B', NodeType.Text, [inB], [outB]);
      const nodeC = makeNode('C', NodeType.Text, [inC], []);
      const nodes = { A: nodeA, B: nodeB, C: nodeC };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      act(() => {
        result.current.startConnection('A', outA, 10, 20);
        result.current.completeConnection('B', inB);
      });
      act(() => {
        result.current.startConnection('B', outB, 10, 20);
        result.current.completeConnection('C', inC);
      });

      expect(result.current.connections).toHaveLength(2);

      act(() => {
        result.current.deleteConnectionsForNodes(['B']);
      });

      expect(result.current.connections).toHaveLength(0);
    });

    it('EC-002: 동일한 fromNode/fromConnector/toNode/toConnector 쌍 중복 커넥션은 추가되지 않는다', async () => {
      const { useConnections } = await import('../useConnections');
      const outA = makeConnector('out-A', ConnectorType.Text);
      const inB = makeConnector('in-B', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outA]);
      const nodeB = makeNode('B', NodeType.Image, [inB], []);
      const nodes = { A: nodeA, B: nodeB };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      // 첫 번째 연결
      act(() => {
        result.current.startConnection('A', outA, 10, 20);
        result.current.completeConnection('B', inB);
      });
      expect(result.current.connections).toHaveLength(1);

      // 동일 연결 재시도
      act(() => {
        result.current.startConnection('A', outA, 10, 20);
        result.current.completeConnection('B', inB);
      });

      expect(result.current.connections).toHaveLength(1);
    });
  });

  // ========================
  // Cycle 3: 선택 관리
  // ========================
  describe('Cycle 3: 커넥션 선택 관리', () => {
    it('selectConnection: 특정 커넥션 ID가 선택된다', async () => {
      const { useConnections } = await import('../useConnections');
      const outA = makeConnector('out-A', ConnectorType.Text);
      const inB = makeConnector('in-B', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outA]);
      const nodeB = makeNode('B', NodeType.Image, [inB], []);
      const nodes = { A: nodeA, B: nodeB };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      act(() => {
        result.current.startConnection('A', outA, 10, 20);
        result.current.completeConnection('B', inB);
      });

      const connId = result.current.connections[0].id;
      act(() => {
        result.current.selectConnection(connId);
      });

      expect(result.current.selectedConnectionId).toBe(connId);
    });

    it('selectConnection(undefined): 선택이 해제된다', async () => {
      const { useConnections } = await import('../useConnections');
      const outA = makeConnector('out-A', ConnectorType.Text);
      const inB = makeConnector('in-B', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outA]);
      const nodeB = makeNode('B', NodeType.Image, [inB], []);
      const { result } = renderHook(() =>
        useConnections({ nodes: { A: nodeA, B: nodeB }, getWorldPosition: createMockGetWorldPosition() })
      );

      // act 블록 분리: completeConnection 후 React 렌더링이 완료된 다음 connections[0]에 접근
      act(() => { result.current.startConnection('A', outA, 10, 20); });
      act(() => { result.current.completeConnection('B', inB); });
      // 이 시점에 connections가 업데이트된 상태
      const connId = result.current.connections[0].id;
      act(() => { result.current.selectConnection(connId); });
      act(() => {
        result.current.selectConnection(undefined);
      });

      expect(result.current.selectedConnectionId).toBeUndefined();
    });
  });

  // ========================
  // Cycle 4: loadConnections
  // ========================
  describe('Cycle 4: 커넥션 로드', () => {
    it('loadConnections: 외부에서 주어진 커넥션 배열로 상태가 대체된다', async () => {
      const { useConnections } = await import('../useConnections');
      const { result } = renderHook(() =>
        useConnections({ nodes: {}, getWorldPosition: createMockGetWorldPosition() })
      );

      const externalConnections: Connection[] = [
        { id: 'conn-1', fromNodeId: 'A', fromConnectorId: 'out-A', toNodeId: 'B', toConnectorId: 'in-B' },
        { id: 'conn-2', fromNodeId: 'B', fromConnectorId: 'out-B', toNodeId: 'C', toConnectorId: 'in-C' },
      ];

      act(() => {
        result.current.loadConnections(externalConnections);
      });

      expect(result.current.connections).toHaveLength(2);
      expect(result.current.connections[0].id).toBe('conn-1');
      expect(result.current.connections[1].id).toBe('conn-2');
    });
  });

  // ========================
  // Cycle 5: completeConnection 방향 검증
  // ========================
  describe('Cycle 5: completeConnection 방향 검증', () => {
    it('출력 커넥터(output) → 입력 커넥터(input) 방향만 허용된다', async () => {
      const { useConnections } = await import('../useConnections');
      // outA는 nodeA의 outputs, inB는 nodeB의 inputs
      const outA = makeConnector('out-A', ConnectorType.Text);
      const inB = makeConnector('in-B', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outA]);
      const nodeB = makeNode('B', NodeType.Image, [inB], []);
      const nodes = { A: nodeA, B: nodeB };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      // 정방향: outA(출력) -> inB(입력)
      act(() => {
        result.current.startConnection('A', outA, 10, 20);
        result.current.completeConnection('B', inB);
      });

      expect(result.current.connections).toHaveLength(1);
    });

    it('입력 커넥터 → 입력 커넥터로의 연결은 거부된다', async () => {
      const { useConnections } = await import('../useConnections');
      const inA = makeConnector('in-A', ConnectorType.Text);
      const inB = makeConnector('in-B', ConnectorType.Text);
      // 둘 다 inputs에 배치
      const nodeA = makeNode('A', NodeType.Text, [inA], []);
      const nodeB = makeNode('B', NodeType.Image, [inB], []);
      const nodes = { A: nodeA, B: nodeB };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition() })
      );

      act(() => {
        result.current.startConnection('A', inA, 10, 20);
        result.current.completeConnection('B', inB);
      });

      expect(result.current.connections).toHaveLength(0);
    });
  });

  // ========================
  // Cycle 6: onConnectionsChanged 콜백
  // ========================
  describe('Cycle 6: onConnectionsChanged 콜백', () => {
    it('커넥션 추가 시 onConnectionsChanged 콜백이 호출된다', async () => {
      const { useConnections } = await import('../useConnections');
      const onConnectionsChanged = vi.fn();
      const outA = makeConnector('out-A', ConnectorType.Text);
      const inB = makeConnector('in-B', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outA]);
      const nodeB = makeNode('B', NodeType.Image, [inB], []);
      const nodes = { A: nodeA, B: nodeB };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition(), onConnectionsChanged })
      );

      act(() => {
        result.current.startConnection('A', outA, 10, 20);
        result.current.completeConnection('B', inB);
      });

      expect(onConnectionsChanged).toHaveBeenCalled();
      const callArg = onConnectionsChanged.mock.calls[0][0] as Connection[];
      expect(callArg).toHaveLength(1);
    });

    it('커넥션 삭제 시 onConnectionsChanged 콜백이 호출된다', async () => {
      const { useConnections } = await import('../useConnections');
      const onConnectionsChanged = vi.fn();
      const outA = makeConnector('out-A', ConnectorType.Text);
      const inB = makeConnector('in-B', ConnectorType.Text);
      const nodeA = makeNode('A', NodeType.Text, [], [outA]);
      const nodeB = makeNode('B', NodeType.Image, [inB], []);
      const nodes = { A: nodeA, B: nodeB };
      const { result } = renderHook(() =>
        useConnections({ nodes, getWorldPosition: createMockGetWorldPosition(), onConnectionsChanged })
      );

      act(() => {
        result.current.startConnection('A', outA, 10, 20);
        result.current.completeConnection('B', inB);
      });

      onConnectionsChanged.mockClear();
      const connId = result.current.connections[0].id;

      act(() => {
        result.current.deleteConnections([connId]);
      });

      expect(onConnectionsChanged).toHaveBeenCalled();
    });
  });
});
