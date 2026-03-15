// useNodes.test.ts: useNodes 훅 TDD 스펙 테스트
// RED-GREEN-REFACTOR 사이클로 구현 (SPEC-UI-001 M2)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { NodeType } from '../../types';
import type { Node, PanZoom, NodeData } from '../../types';

// createNode 팩토리 모킹: 실제 팩토리가 DOM이나 복잡한 의존성을 필요로 하지 않으므로 실제 구현 사용
vi.mock('../../factories/nodeFactory', () => ({
  createNode: (type: NodeType, id: string, position: { x: number; y: number }): Node => ({
    id,
    type,
    position,
    size: { width: 300, height: 200 },
    data: { text: '' } as NodeData,
    inputs: [],
    outputs: [],
    isCollapsed: false,
    isBypassed: false,
  }),
}));

// getWorldPosition 모킹 헬퍼: 화면 중앙 -> 월드 좌표 반환
function createMockGetWorldPosition(worldX = 500, worldY = 400) {
  return vi.fn((_sx: number, _sy: number): [number, number] => [worldX, worldY]);
}

const DEFAULT_PAN_ZOOM: PanZoom = { x: 0, y: 0, k: 1 };

// ========================
// Cycle 1: 노드 CRUD 테스트
// ========================
describe('useNodes 훅', () => {
  describe('Cycle 1: 노드 CRUD', () => {
    describe('addNode', () => {
      it('addNode 호출 시 nodes에 새 노드가 추가되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition(500, 400);
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });

        const nodeValues = Object.values(result.current.nodes);
        expect(nodeValues).toHaveLength(1);
        expect(nodeValues[0].type).toBe(NodeType.Text);
      });

      it('addNode 호출 시 nodeRenderOrder에 노드 ID가 추가되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });

        const nodeId = Object.keys(result.current.nodes)[0];
        expect(result.current.nodeRenderOrder).toContain(nodeId);
      });

      it('Group 타입 addNode 시 nodeRenderOrder의 맨 앞에 추가되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        // 먼저 일반 노드 추가
        act(() => {
          result.current.addNode(NodeType.Text);
        });

        // 그룹 노드 추가
        act(() => {
          result.current.addNode(NodeType.Group);
        });

        const groupId = Object.keys(result.current.nodes).find(
          id => result.current.nodes[id].type === NodeType.Group
        )!;
        expect(result.current.nodeRenderOrder[0]).toBe(groupId);
      });

      it('addNode 노드 위치는 getWorldPosition 결과를 기반으로 설정되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition(500, 400);
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });

        const node = Object.values(result.current.nodes)[0];
        // 기본 오프셋(-150, -100) 적용된 위치
        expect(node.position.x).toBe(500 - 150);
        expect(node.position.y).toBe(400 - 100);
      });
    });

    describe('deleteNodes', () => {
      it('deleteNodes 호출 시 해당 노드가 nodes에서 제거되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.deleteNodes([nodeId]);
        });

        expect(result.current.nodes[nodeId]).toBeUndefined();
      });

      it('deleteNodes 호출 시 nodeRenderOrder에서도 제거되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.deleteNodes([nodeId]);
        });

        expect(result.current.nodeRenderOrder).not.toContain(nodeId);
      });

      it('deleteNodes 호출 시 onNodesDeleted 콜백이 삭제된 ID 배열로 호출되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const onNodesDeleted = vi.fn();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM, onNodesDeleted })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.deleteNodes([nodeId]);
        });

        expect(onNodesDeleted).toHaveBeenCalledWith([nodeId]);
      });

      it('deleteNodes로 여러 노드 한꺼번에 삭제할 수 있어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        act(() => {
          result.current.addNode(NodeType.Image);
        });

        const nodeIds = Object.keys(result.current.nodes);
        expect(nodeIds).toHaveLength(2);

        act(() => {
          result.current.deleteNodes(nodeIds);
        });

        expect(Object.keys(result.current.nodes)).toHaveLength(0);
      });
    });

    describe('duplicateNode', () => {
      it('duplicateNode 호출 시 동일 타입의 복사 노드가 생성되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const originalId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.duplicateNode(originalId);
        });

        expect(Object.keys(result.current.nodes)).toHaveLength(2);
        const newNode = Object.values(result.current.nodes).find(n => n.id !== originalId)!;
        expect(newNode.type).toBe(NodeType.Text);
      });

      it('duplicateNode 시 복사된 노드는 +20px 오프셋 위치에 생성되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const originalId = Object.keys(result.current.nodes)[0];
        const originalNode = result.current.nodes[originalId];

        act(() => {
          result.current.duplicateNode(originalId);
        });

        const newNode = Object.values(result.current.nodes).find(n => n.id !== originalId)!;
        expect(newNode.position.x).toBe(originalNode.position.x + 20);
        expect(newNode.position.y).toBe(originalNode.position.y + 20);
      });

      it('duplicateNode 시 새 노드의 isBypassed는 false여야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const originalId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.duplicateNode(originalId);
        });

        const newNode = Object.values(result.current.nodes).find(n => n.id !== originalId)!;
        expect(newNode.isBypassed).toBe(false);
      });

      it('존재하지 않는 노드 ID로 duplicateNode 호출 시 아무것도 하지 않아야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.duplicateNode('non-existent-id');
        });

        expect(Object.keys(result.current.nodes)).toHaveLength(0);
      });
    });
  });

  // ========================
  // Cycle 2: 노드 상태 업데이트
  // ========================
  describe('Cycle 2: 노드 상태 업데이트', () => {
    describe('updateNodeData', () => {
      it('updateNodeData 호출 시 노드 data가 부분 업데이트되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.updateNodeData(nodeId, { text: 'Hello World' } as Partial<NodeData>);
        });

        expect((result.current.nodes[nodeId].data as any).text).toBe('Hello World');
      });

      it('존재하지 않는 노드 ID로 updateNodeData 호출 시 에러 없이 처리되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        expect(() => {
          act(() => {
            result.current.updateNodeData('non-existent', { text: 'test' } as Partial<NodeData>);
          });
        }).not.toThrow();
      });
    });

    describe('toggleCollapse', () => {
      it('toggleCollapse 호출 시 isCollapsed가 true로 변경되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];
        expect(result.current.nodes[nodeId].isCollapsed).toBeFalsy();

        act(() => {
          result.current.toggleCollapse(nodeId);
        });

        expect(result.current.nodes[nodeId].isCollapsed).toBe(true);
      });

      it('toggleCollapse 두 번 호출 시 isCollapsed가 다시 false가 되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.toggleCollapse(nodeId);
        });
        act(() => {
          result.current.toggleCollapse(nodeId);
        });

        expect(result.current.nodes[nodeId].isCollapsed).toBe(false);
      });

      it('Non-Group 노드 collapse 시 크기가 {width:200, height:40}으로 변경되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.toggleCollapse(nodeId);
        });

        expect(result.current.nodes[nodeId].size).toEqual({ width: 200, height: 40 });
      });
    });

    describe('toggleBypass', () => {
      it('toggleBypass 호출 시 isBypassed가 true로 변경되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.toggleBypass(nodeId);
        });

        expect(result.current.nodes[nodeId].isBypassed).toBe(true);
      });

      it('toggleBypass 두 번 호출 시 isBypassed가 다시 false가 되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.toggleBypass(nodeId);
        });
        act(() => {
          result.current.toggleBypass(nodeId);
        });

        expect(result.current.nodes[nodeId].isBypassed).toBe(false);
      });
    });
  });

  // ========================
  // Cycle 3: 노드 이동 및 크기 변경
  // ========================
  describe('Cycle 3: 노드 이동 및 크기 변경', () => {
    describe('moveNodes', () => {
      it('moveNodes 호출 시 노드 위치가 delta만큼 이동되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];
        const originalPos = { ...result.current.nodes[nodeId].position };

        act(() => {
          result.current.moveNodes(nodeId, 50, 30);
        });

        expect(result.current.nodes[nodeId].position.x).toBe(originalPos.x + 50);
        expect(result.current.nodes[nodeId].position.y).toBe(originalPos.y + 30);
      });

      it('선택된 노드가 여러 개일 때 moveNodes 호출 시 선택 노드 전체가 이동되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        act(() => {
          result.current.addNode(NodeType.Image);
        });
        const [id1, id2] = Object.keys(result.current.nodes);

        // 두 노드 선택
        act(() => {
          result.current.selectNode(id1);
        });
        act(() => {
          result.current.selectNode(id2, true); // shift 선택
        });

        const pos1Before = { ...result.current.nodes[id1].position };
        const pos2Before = { ...result.current.nodes[id2].position };

        act(() => {
          result.current.moveNodes(id1, 10, 20);
        });

        expect(result.current.nodes[id1].position.x).toBe(pos1Before.x + 10);
        expect(result.current.nodes[id2].position.x).toBe(pos2Before.x + 10);
      });
    });

    describe('resizeNode', () => {
      it('resizeNode 호출 시 노드 크기가 변경되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.resizeNode(nodeId, 400, 300);
        });

        expect(result.current.nodes[nodeId].size).toEqual({ width: 400, height: 300 });
      });

      it('resizeNode 시 최소 크기(250x150) 미만으로 설정되지 않아야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.resizeNode(nodeId, 100, 50);
        });

        expect(result.current.nodes[nodeId].size.width).toBeGreaterThanOrEqual(250);
        expect(result.current.nodes[nodeId].size.height).toBeGreaterThanOrEqual(150);
      });

      it('Group 노드 resizeNode 시 최소 크기(200x150)가 적용되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Group);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.resizeNode(nodeId, 50, 50);
        });

        expect(result.current.nodes[nodeId].size.width).toBeGreaterThanOrEqual(200);
        expect(result.current.nodes[nodeId].size.height).toBeGreaterThanOrEqual(150);
      });
    });
  });

  // ========================
  // Cycle 4: 선택 및 z-order
  // ========================
  describe('Cycle 4: 선택 및 z-order', () => {
    describe('selectNode', () => {
      it('selectNode 호출 시 selectedNodeIds에 해당 노드 ID가 포함되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.selectNode(nodeId);
        });

        expect(result.current.selectedNodeIds.has(nodeId)).toBe(true);
      });

      it('isMulti=false 단일 선택 시 기존 선택이 해제되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        act(() => {
          result.current.addNode(NodeType.Image);
        });
        const [id1, id2] = Object.keys(result.current.nodes);

        act(() => {
          result.current.selectNode(id1);
        });
        act(() => {
          result.current.selectNode(id2, false); // 단일 선택
        });

        expect(result.current.selectedNodeIds.has(id1)).toBe(false);
        expect(result.current.selectedNodeIds.has(id2)).toBe(true);
      });

      it('isMulti=true 멀티 선택 시 기존 선택에 노드가 추가되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        act(() => {
          result.current.addNode(NodeType.Image);
        });
        const [id1, id2] = Object.keys(result.current.nodes);

        act(() => {
          result.current.selectNode(id1);
        });
        act(() => {
          result.current.selectNode(id2, true); // 멀티 선택
        });

        expect(result.current.selectedNodeIds.has(id1)).toBe(true);
        expect(result.current.selectedNodeIds.has(id2)).toBe(true);
      });

      it('이미 선택된 노드를 isMulti=true로 다시 선택 시 선택 해제되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.selectNode(nodeId);
        });
        act(() => {
          result.current.selectNode(nodeId, true); // 이미 선택된 상태에서 멀티 토글
        });

        expect(result.current.selectedNodeIds.has(nodeId)).toBe(false);
      });
    });

    describe('clearSelection', () => {
      it('clearSelection 호출 시 selectedNodeIds가 비어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        const nodeId = Object.keys(result.current.nodes)[0];

        act(() => {
          result.current.selectNode(nodeId);
        });
        act(() => {
          result.current.clearSelection();
        });

        expect(result.current.selectedNodeIds.size).toBe(0);
      });
    });

    describe('bringToFront', () => {
      it('bringToFront 호출 시 해당 노드가 nodeRenderOrder의 마지막에 위치해야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        act(() => {
          result.current.addNode(NodeType.Text);
        });
        act(() => {
          result.current.addNode(NodeType.Image);
        });
        const [id1] = Object.keys(result.current.nodes);

        act(() => {
          result.current.bringToFront(id1);
        });

        const order = result.current.nodeRenderOrder;
        expect(order[order.length - 1]).toBe(id1);
      });
    });
  });

  // ========================
  // Cycle 3 (추가): Group 노드 이동 시 자식 노드 함께 이동
  // ========================
  describe('Cycle 3 (추가): Group 노드 이동', () => {
    it('Group 노드 이동 시 그룹 경계 내부의 자식 노드도 함께 이동되어야 한다', async () => {
      const { useNodes } = await import('../useNodes');
      const getWorldPosition = createMockGetWorldPosition(500, 400);
      const { result } = renderHook(() =>
        useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
      );

      // Group 노드와 자식 노드 한 번에 추가
      act(() => {
        result.current.addNode(NodeType.Group);
        result.current.addNode(NodeType.Text);
      });

      const groupId = Object.keys(result.current.nodes).find(
        id => result.current.nodes[id].type === NodeType.Group
      )!;
      const childId = Object.keys(result.current.nodes).find(
        id => result.current.nodes[id].type === NodeType.Text
      )!;

      // 한 번에 위치/크기 설정
      act(() => {
        result.current.setNodes((draft) => {
          draft[groupId].position = { x: 0, y: 0 };
          draft[groupId].size = { width: 1000, height: 1000 };
          draft[groupId].isCollapsed = false;
          draft[childId].position = { x: 10, y: 10 };
          draft[childId].size = { width: 50, height: 50 };
          draft[childId].hidden = false;
        });
      });

      const childPosBefore = { ...result.current.nodes[childId].position };

      // Group 노드 선택 후 이동
      act(() => {
        result.current.selectNode(groupId);
      });
      act(() => {
        result.current.moveNodes(groupId, 20, 30);
      });

      // 자식 노드도 동일한 delta만큼 이동되어야 함
      expect(result.current.nodes[childId].position.x).toBe(childPosBefore.x + 20);
      expect(result.current.nodes[childId].position.y).toBe(childPosBefore.y + 30);
    });
  });

  // ========================
  // Cycle 2 (추가): Group 노드 toggleCollapse expand 방향
  // ========================
  describe('Cycle 2 (추가): Group 노드 toggleCollapse expand', () => {
    it('Group 노드 isCollapsed=true → toggleCollapse 호출 시 자식 노드가 unhide되어야 한다', async () => {
      const { useNodes } = await import('../useNodes');
      const getWorldPosition = createMockGetWorldPosition(500, 400);
      const { result } = renderHook(() =>
        useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
      );

      // Group 노드 추가 후 자식 노드 추가를 한 번에 처리
      act(() => {
        result.current.addNode(NodeType.Group);
        result.current.addNode(NodeType.Text);
      });

      const groupId = Object.keys(result.current.nodes).find(
        id => result.current.nodes[id].type === NodeType.Group
      )!;
      const childId = Object.keys(result.current.nodes).find(
        id => result.current.nodes[id].type === NodeType.Text
      )!;

      // Group을 (0,0) 크기 (1000,1000)으로, 자식을 그룹 내부로 설정
      act(() => {
        result.current.setNodes((draft) => {
          draft[groupId].position = { x: 0, y: 0 };
          draft[groupId].size = { width: 1000, height: 1000 };
          draft[childId].position = { x: 10, y: 10 };
          draft[childId].size = { width: 50, height: 50 };
          draft[childId].hidden = false;
        });
      });

      // collapse (자식 노드 hidden=true)
      act(() => {
        result.current.toggleCollapse(groupId);
      });
      expect(result.current.nodes[childId].hidden).toBe(true);

      // expand (자식 노드 hidden=false)
      act(() => {
        result.current.toggleCollapse(groupId);
      });
      expect(result.current.nodes[childId].hidden).toBe(false);
    });

    it('Group 노드 expand 시 isCollapsed가 false가 되어야 한다', async () => {
      const { useNodes } = await import('../useNodes');
      const getWorldPosition = createMockGetWorldPosition(500, 400);
      const { result } = renderHook(() =>
        useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
      );

      act(() => {
        result.current.addNode(NodeType.Group);
      });
      const groupId = Object.keys(result.current.nodes).find(
        id => result.current.nodes[id].type === NodeType.Group
      )!;

      // collapse 후 expand
      act(() => { result.current.toggleCollapse(groupId); });
      expect(result.current.nodes[groupId].isCollapsed).toBe(true);

      act(() => { result.current.toggleCollapse(groupId); });
      expect(result.current.nodes[groupId].isCollapsed).toBe(false);
    });
  });

  // ========================
  // Cycle 2 (추가): Group 노드 toggleBypass
  // ========================
  describe('Cycle 2 (추가): Group 노드 toggleBypass', () => {
    it('Group 노드 bypass 시 그룹 경계 내부 자식 노드도 bypass되어야 한다', async () => {
      const { useNodes } = await import('../useNodes');
      const getWorldPosition = createMockGetWorldPosition(500, 400);
      const { result } = renderHook(() =>
        useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
      );

      // Group 노드와 자식 노드를 한 번에 추가
      act(() => {
        result.current.addNode(NodeType.Group);
        result.current.addNode(NodeType.Text);
      });

      const groupId = Object.keys(result.current.nodes).find(
        id => result.current.nodes[id].type === NodeType.Group
      )!;
      const childId = Object.keys(result.current.nodes).find(
        id => result.current.nodes[id].type === NodeType.Text
      )!;

      // 한 번에 위치 설정
      act(() => {
        result.current.setNodes((draft) => {
          draft[groupId].position = { x: 0, y: 0 };
          draft[groupId].size = { width: 1000, height: 1000 };
          draft[childId].position = { x: 10, y: 10 };
          draft[childId].size = { width: 50, height: 50 };
        });
      });

      // Group bypass 활성화
      act(() => {
        result.current.toggleBypass(groupId);
      });

      expect(result.current.nodes[groupId].isBypassed).toBe(true);
      expect(result.current.nodes[childId].isBypassed).toBe(true);
    });

    it('Group 노드 bypass 해제 시 자식 노드도 bypass 해제되어야 한다', async () => {
      const { useNodes } = await import('../useNodes');
      const getWorldPosition = createMockGetWorldPosition(500, 400);
      const { result } = renderHook(() =>
        useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
      );

      act(() => {
        result.current.addNode(NodeType.Group);
        result.current.addNode(NodeType.Text);
      });

      const groupId = Object.keys(result.current.nodes).find(
        id => result.current.nodes[id].type === NodeType.Group
      )!;
      const childId = Object.keys(result.current.nodes).find(
        id => result.current.nodes[id].type === NodeType.Text
      )!;

      act(() => {
        result.current.setNodes((draft) => {
          draft[groupId].position = { x: 0, y: 0 };
          draft[groupId].size = { width: 1000, height: 1000 };
          draft[childId].position = { x: 10, y: 10 };
          draft[childId].size = { width: 50, height: 50 };
        });
      });

      // bypass 활성화 후 해제
      act(() => { result.current.toggleBypass(groupId); });
      act(() => { result.current.toggleBypass(groupId); });

      expect(result.current.nodes[groupId].isBypassed).toBe(false);
      expect(result.current.nodes[childId].isBypassed).toBe(false);
    });
  });

  // ========================
  // Cycle 4 (추가): selectNode Group 재정렬 및 Storyboard/Script 위치 오프셋
  // ========================
  describe('Cycle 4 (추가): selectNode Group 재정렬', () => {
    it('Group 노드 선택 시 nodeRenderOrder에서 그룹은 일반 노드보다 앞에 위치해야 한다', async () => {
      const { useNodes } = await import('../useNodes');
      const getWorldPosition = createMockGetWorldPosition(500, 400);
      const { result } = renderHook(() =>
        useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
      );

      // 일반 노드와 Group 노드 추가
      act(() => { result.current.addNode(NodeType.Text); });
      act(() => { result.current.addNode(NodeType.Group); });

      const textId = Object.keys(result.current.nodes).find(
        id => result.current.nodes[id].type === NodeType.Text
      )!;
      const groupId = Object.keys(result.current.nodes).find(
        id => result.current.nodes[id].type === NodeType.Group
      )!;

      // Group 노드 선택
      act(() => { result.current.selectNode(groupId); });

      const order = result.current.nodeRenderOrder;
      const groupIdx = order.indexOf(groupId);
      const textIdx = order.indexOf(textId);

      // 그룹 노드는 일반 노드보다 앞에 위치
      expect(groupIdx).toBeLessThan(textIdx);
    });
  });

  describe('Cycle 1 (추가): addNode Storyboard/Script 위치 오프셋', () => {
    it('Storyboard 타입 addNode 시 위치가 특수 오프셋으로 설정되어야 한다', async () => {
      const { useNodes } = await import('../useNodes');
      const getWorldPosition = createMockGetWorldPosition(500, 400);
      const { result } = renderHook(() =>
        useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
      );

      act(() => {
        result.current.addNode(NodeType.Storyboard);
      });

      const node = Object.values(result.current.nodes)[0];
      // Storyboard 오프셋: x = worldX - 375, y = worldY - 550
      expect(node.position.x).toBe(500 - 375);
      expect(node.position.y).toBe(400 - 550);
    });

    it('Script 타입 addNode 시 위치가 특수 오프셋으로 설정되어야 한다', async () => {
      const { useNodes } = await import('../useNodes');
      const getWorldPosition = createMockGetWorldPosition(500, 400);
      const { result } = renderHook(() =>
        useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
      );

      act(() => {
        result.current.addNode(NodeType.Script);
      });

      const node = Object.values(result.current.nodes)[0];
      // Script 오프셋: x = worldX - 400, y = worldY - 450
      expect(node.position.x).toBe(500 - 400);
      expect(node.position.y).toBe(400 - 450);
    });
  });

  // ========================
  // Cycle 5: 유틸리티 (loadNodes, setNodes)
  // ========================
  describe('Cycle 5: 유틸리티', () => {
    describe('loadNodes', () => {
      it('loadNodes 호출 시 nodes와 nodeRenderOrder가 초기화되어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        const loadedNode: Node = {
          id: 'loaded-1',
          type: NodeType.Text,
          position: { x: 100, y: 200 },
          size: { width: 300, height: 200 },
          data: { text: 'loaded' } as NodeData,
          inputs: [],
          outputs: [],
          isBypassed: false,
        };

        act(() => {
          result.current.loadNodes({ 'loaded-1': loadedNode }, ['loaded-1']);
        });

        expect(result.current.nodes['loaded-1']).toEqual(loadedNode);
        expect(result.current.nodeRenderOrder).toEqual(['loaded-1']);
      });
    });

    describe('초기 상태', () => {
      it('초기 nodes는 빈 객체여야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        expect(result.current.nodes).toEqual({});
      });

      it('초기 selectedNodeIds는 빈 Set이어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        expect(result.current.selectedNodeIds).toBeInstanceOf(Set);
        expect(result.current.selectedNodeIds.size).toBe(0);
      });

      it('초기 nodeRenderOrder는 빈 배열이어야 한다', async () => {
        const { useNodes } = await import('../useNodes');
        const getWorldPosition = createMockGetWorldPosition();
        const { result } = renderHook(() =>
          useNodes({ getWorldPosition, panZoom: DEFAULT_PAN_ZOOM })
        );

        expect(result.current.nodeRenderOrder).toEqual([]);
      });
    });
  });
});
