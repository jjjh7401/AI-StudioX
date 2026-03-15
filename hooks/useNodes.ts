// useNodes: 노드 CRUD, 선택, 이동, 복제, Collapse/Bypass 관리 훅
// SPEC-UI-001 M2: App.tsx의 노드 관련 상태 + 핸들러 추출

import { useState, useCallback, useMemo } from 'react';
import { useImmer } from 'use-immer';
import { createNode } from '../factories/nodeFactory';
import { NodeType } from '../types';
import type { Node, NodeData, PanZoom, GroupNodeData } from '../types';

// @MX:ANCHOR: useNodes 훅의 단일 진입점 - 모든 노드 상태 및 조작 로직을 캡슐화
// @MX:REASON: App.tsx에서 노드 관련 로직을 분리하여 관심사 분리 및 재사용성 확보

/** Group 노드인지 체크하여 Group은 맨 앞에, 나머지는 맨 뒤에 추가 */
function isGroupType(type: NodeType): boolean {
  return type === NodeType.Group;
}

/** 일반 노드의 최소 크기 상수 */
const MIN_NODE_SIZE = { width: 250, height: 150 };
/** Group 노드의 최소 크기 상수 */
const MIN_GROUP_SIZE = { width: 200, height: 150 };

/** isNodeInsideGroup: 노드가 그룹 경계 안에 있는지 확인 */
function isNodeInsideGroup(node: Node, group: Node): boolean {
  const nRight = node.position.x + node.size.width;
  const nBottom = node.position.y + node.size.height;
  const gRight = group.position.x + group.size.width;
  const gBottom = group.position.y + group.size.height;
  return (
    node.position.x >= group.position.x &&
    node.position.y >= group.position.y &&
    nRight <= gRight &&
    nBottom <= gBottom
  );
}

export interface UseNodesOptions {
  /** 화면 좌표 → 월드 좌표 변환 함수 */
  getWorldPosition: (screenX: number, screenY: number) => [number, number];
  /** 현재 pan/zoom 상태 (드래그 delta 계산 시 사용) */
  panZoom: PanZoom;
  /** 노드 삭제 시 외부로 알려줄 콜백 (connection 정리 등) */
  onNodesDeleted?: (nodeIds: string[]) => void;
}

export interface UseNodesReturn {
  /** 노드 Record (id -> Node) */
  nodes: Record<string, Node>;
  /** 선택된 노드 ID Set */
  selectedNodeIds: Set<string>;
  /** 렌더링 순서 배열 (뒤가 위에 렌더링됨) */
  nodeRenderOrder: string[];
  /** 새 노드 추가 */
  addNode: (type: NodeType) => void;
  /** 노드 삭제 (여러 ID 한꺼번에 가능) */
  deleteNodes: (nodeIds: string[]) => void;
  /** 노드 복제 (+20px 오프셋) */
  duplicateNode: (nodeId: string) => void;
  /** 노드 data 부분 업데이트 */
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  /** 드래그 이동: 선택된 노드들 전체 이동 */
  moveNodes: (draggedNodeId: string, deltaX: number, deltaY: number) => void;
  /** 노드 크기 변경 (최소 크기 적용) */
  resizeNode: (nodeId: string, width: number, height: number) => void;
  /** collapse/expand 토글 */
  toggleCollapse: (nodeId: string) => void;
  /** bypass 토글 */
  toggleBypass: (nodeId: string) => void;
  /** 노드 선택 (isMulti=true면 다중 선택) */
  selectNode: (nodeId: string, isMulti?: boolean) => void;
  /** 선택 초기화 */
  clearSelection: () => void;
  /** 지정 노드를 렌더 순서의 맨 앞(화면 위)으로 */
  bringToFront: (nodeId: string) => void;
  /** 외부에서 nodes 직접 업데이트 (immer updater) */
  setNodes: (updater: (draft: Record<string, Node>) => void) => void;
  /** 프로젝트 로드: nodes와 renderOrder 일괄 초기화 */
  loadNodes: (nodes: Record<string, Node>, renderOrder: string[]) => void;
  /** 저수준: nodeRenderOrder immer updater (App.tsx 하위 호환용) */
  setNodeRenderOrder: (updater: ((draft: string[]) => void) | ((draft: string[]) => string[])) => void;
  /** 저수준: selectedIds 직접 설정 (App.tsx 하위 호환용) */
  setSelectedNodeIds: (ids: string[]) => void;
}

export function useNodes({
  getWorldPosition,
  panZoom,
  onNodesDeleted,
}: UseNodesOptions): UseNodesReturn {
  // 노드 Record 상태 (immer로 불변 업데이트)
  const [nodes, setNodes] = useImmer<Record<string, Node>>({});
  // 선택된 노드 ID 배열 -> Set으로 외부 노출
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // 렌더링 순서 배열 (immer)
  const [nodeRenderOrder, setNodeRenderOrder] = useImmer<string[]>([]);

  // selectedNodeIds: Set으로 변환하여 O(1) 조회 지원
  const selectedNodeIds = useMemo(() => new Set(selectedIds), [selectedIds]);

  // --- addNode ---
  const addNode = useCallback(
    (type: NodeType) => {
      const id = `${type}-${Date.now()}`;
      const [worldX, worldY] = getWorldPosition(0, 0);

      // 노드 타입별 위치 오프셋
      let position = { x: worldX - 150, y: worldY - 100 };
      if (type === NodeType.Storyboard) position = { x: worldX - 375, y: worldY - 550 };
      else if (type === NodeType.Script) position = { x: worldX - 400, y: worldY - 450 };

      const newNode = createNode(type, id, position);

      setNodes((draft) => {
        draft[id] = newNode;
      });
      setNodeRenderOrder((draft) => {
        if (isGroupType(type)) {
          draft.unshift(id);
        } else {
          draft.push(id);
        }
      });
    },
    [getWorldPosition, setNodes, setNodeRenderOrder],
  );

  // --- deleteNodes ---
  const deleteNodes = useCallback(
    (nodeIds: string[]) => {
      setNodes((draft) => {
        nodeIds.forEach((id) => {
          delete draft[id];
        });
      });
      setNodeRenderOrder((draft) => {
        return draft.filter((id) => !nodeIds.includes(id));
      });
      setSelectedIds((prev) => prev.filter((id) => !nodeIds.includes(id)));
      if (onNodesDeleted) {
        onNodesDeleted(nodeIds);
      }
    },
    [setNodes, setNodeRenderOrder, onNodesDeleted],
  );

  // --- duplicateNode ---
  const duplicateNode = useCallback(
    (nodeId: string) => {
      const originalNode = nodes[nodeId];
      if (!originalNode) return;

      // Date.now() + Math.random()으로 ID 충돌 방지
      const newId = `${originalNode.type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const newNode: Node = {
        ...originalNode,
        id: newId,
        position: {
          x: originalNode.position.x + 20,
          y: originalNode.position.y + 20,
        },
        isBypassed: false,
      };

      setNodes((draft) => {
        draft[newId] = newNode;
      });
      setNodeRenderOrder((draft) => {
        if (isGroupType(newNode.type)) {
          draft.unshift(newId);
        } else {
          draft.push(newId);
        }
      });
    },
    [nodes, setNodes, setNodeRenderOrder],
  );

  // --- updateNodeData ---
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<NodeData>) => {
      setNodes((draft) => {
        if (draft[nodeId]) {
          draft[nodeId].data = { ...draft[nodeId].data, ...data } as NodeData;
        }
      });
    },
    [setNodes],
  );

  // --- moveNodes ---
  const moveNodes = useCallback(
    (draggedNodeId: string, deltaX: number, deltaY: number) => {
      setNodes((draft) => {
        // 선택된 노드가 여럿이고 드래그 대상이 포함되면 전체 이동, 아니면 드래그 대상만
        const idsToMove =
          selectedIds.length > 1 && selectedIds.includes(draggedNodeId)
            ? selectedIds
            : [draggedNodeId];

        idsToMove.forEach((id) => {
          const node = draft[id];
          if (!node) return;

          // Group 노드가 expand 상태일 때 내부 자식 노드도 함께 이동
          const childrenIds: string[] = [];
          if (node.type === NodeType.Group && !node.isCollapsed) {
            Object.keys(draft).forEach((key) => {
              const other = draft[key];
              if (
                other.id !== id &&
                !other.hidden &&
                !idsToMove.includes(key) &&
                isNodeInsideGroup(other as unknown as Node, node as unknown as Node)
              ) {
                childrenIds.push(key);
              }
            });
          }

          node.position.x += deltaX;
          node.position.y += deltaY;

          childrenIds.forEach((childId) => {
            const child = draft[childId];
            if (child) {
              child.position.x += deltaX;
              child.position.y += deltaY;
            }
          });
        });
      });
    },
    [selectedIds, setNodes],
  );

  // --- resizeNode ---
  const resizeNode = useCallback(
    (nodeId: string, width: number, height: number) => {
      setNodes((draft) => {
        const node = draft[nodeId];
        if (!node) return;

        const minSize = isGroupType(node.type as NodeType)
          ? MIN_GROUP_SIZE
          : MIN_NODE_SIZE;

        node.size = {
          width: Math.max(width, minSize.width),
          height: Math.max(height, minSize.height),
        };
      });
    },
    [setNodes],
  );

  // --- toggleCollapse ---
  const toggleCollapse = useCallback(
    (nodeId: string) => {
      setNodes((draft) => {
        const node = draft[nodeId];
        if (!node) return;

        if (node.type === NodeType.Group) {
          const groupData = node.data as GroupNodeData;
          if (node.isCollapsed) {
            // expand: 이전 크기 복원 및 자식 노드 unhide
            node.isCollapsed = false;
            if (node.expandedSize) {
              node.size = node.expandedSize;
            }
            delete node.expandedSize;
            if (groupData.containedNodeIds) {
              groupData.containedNodeIds.forEach((childId) => {
                if (draft[childId]) {
                  draft[childId].hidden = false;
                }
              });
              groupData.containedNodeIds = [];
            }
          } else {
            // collapse: 그룹 내부 노드 숨기고 크기 축소
            node.isCollapsed = true;
            node.expandedSize = node.size;
            node.size = { width: 200, height: 60 };

            const containedIds: string[] = [];
            Object.keys(draft).forEach((key) => {
              const other = draft[key];
              if (
                other.id !== nodeId &&
                !other.hidden &&
                isNodeInsideGroup(other as unknown as Node, node as unknown as Node)
              ) {
                other.hidden = true;
                containedIds.push(other.id);
              }
            });
            groupData.containedNodeIds = containedIds;
          }
        } else {
          // 일반 노드 collapse/expand
          if (node.isCollapsed) {
            node.isCollapsed = false;
            if (node.expandedSize) {
              node.size = node.expandedSize;
            }
            delete node.expandedSize;
          } else {
            node.isCollapsed = true;
            node.expandedSize = node.size;
            node.size = { width: 200, height: 40 };
          }
        }
      });
    },
    [setNodes],
  );

  // --- toggleBypass ---
  const toggleBypass = useCallback(
    (nodeId: string) => {
      setNodes((draft) => {
        const node = draft[nodeId];
        if (!node) return;

        const newBypassState = !node.isBypassed;
        node.isBypassed = newBypassState;

        // Group 노드 bypass 시 내부 자식도 동일하게 bypass
        if (node.type === NodeType.Group) {
          Object.keys(draft).forEach((key) => {
            const other = draft[key];
            if (
              other.id !== nodeId &&
              isNodeInsideGroup(other as unknown as Node, node as unknown as Node)
            ) {
              other.isBypassed = newBypassState;
            }
          });
        }
      });
    },
    [setNodes],
  );

  // --- selectNode ---
  const selectNode = useCallback(
    (nodeId: string, isMulti = false) => {
      setSelectedIds((prev) => {
        if (isMulti) {
          // 멀티 선택: 이미 있으면 토글 제거, 없으면 추가
          return prev.includes(nodeId)
            ? prev.filter((id) => id !== nodeId)
            : [...prev, nodeId];
        } else {
          // 단일 선택
          return [nodeId];
        }
      });

      // 선택 시 해당 노드를 렌더 순서의 앞으로 (그룹/일반 분리 유지)
      setNodeRenderOrder((draft) => {
        const finalIds = isMulti
          ? selectedIds.includes(nodeId)
            ? selectedIds.filter((id) => id !== nodeId)
            : [...selectedIds, nodeId]
          : [nodeId];

        if (finalIds.length === 0) return;

        const allGroups = draft.filter((id) => nodes[id]?.type === NodeType.Group);
        const allContent = draft.filter((id) => nodes[id]?.type !== NodeType.Group);
        const selGroups = finalIds.filter((id) => nodes[id]?.type === NodeType.Group);
        const selContent = finalIds.filter((id) => nodes[id]?.type !== NodeType.Group);

        const reorderedGroups = [
          ...allGroups.filter((id) => !selGroups.includes(id)),
          ...selGroups,
        ];
        const reorderedContent = [
          ...allContent.filter((id) => !selContent.includes(id)),
          ...selContent,
        ];

        draft.splice(0, draft.length, ...reorderedGroups, ...reorderedContent);
      });
    },
    [selectedIds, nodes, setNodeRenderOrder],
  );

  // --- clearSelection ---
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // --- bringToFront ---
  const bringToFront = useCallback(
    (nodeId: string) => {
      setNodeRenderOrder((draft) => {
        const idx = draft.indexOf(nodeId);
        if (idx === -1) return;
        draft.splice(idx, 1);
        draft.push(nodeId);
      });
    },
    [setNodeRenderOrder],
  );

  // --- loadNodes ---
  const loadNodes = useCallback(
    (loadedNodes: Record<string, Node>, renderOrder: string[]) => {
      setNodes(() => loadedNodes);
      setNodeRenderOrder(() => renderOrder);
      setSelectedIds([]);
    },
    [setNodes, setNodeRenderOrder],
  );

  return {
    nodes,
    selectedNodeIds,
    nodeRenderOrder,
    addNode,
    deleteNodes,
    duplicateNode,
    updateNodeData,
    moveNodes,
    resizeNode,
    toggleCollapse,
    toggleBypass,
    selectNode,
    clearSelection,
    bringToFront,
    setNodes,
    loadNodes,
    setNodeRenderOrder,
    setSelectedNodeIds: setSelectedIds,
  };
}
