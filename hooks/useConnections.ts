// useConnections: 커넥션 생성/삭제, 타입 검증, 데이터 전파 훅
// SPEC-UI-001 M3: App.tsx의 연결 관련 상태 + 핸들러 추출

import { useState, useCallback, useRef } from 'react';
import { useImmer } from 'use-immer';
import type { Connection, Connector, Node } from '../types';
import { isValidConnection } from '../utils/graphUtils';

// @MX:ANCHOR: useConnections 훅의 단일 진입점 - 모든 커넥션 상태 및 조작 로직을 캡슐화
// @MX:REASON: App.tsx에서 커넥션 관련 로직을 분리하여 관심사 분리 및 재사용성 확보

/** 드래그 중인 커넥션 정보 */
export interface PendingConnection {
  fromNodeId: string;
  fromConnector: Connector;
}

export interface UseConnectionsOptions {
  /** 현재 노드 Record (커넥터 방향 검증에 사용) */
  nodes: Record<string, Node>;
  /** 화면 좌표 → 월드 좌표 변환 함수 */
  getWorldPosition: (screenX: number, screenY: number) => [number, number];
  /** 커넥션 변경 시 외부로 알릴 콜백 */
  onConnectionsChanged?: (connections: Connection[]) => void;
}

export interface UseConnectionsReturn {
  /** 현재 커넥션 배열 */
  connections: Connection[];
  /** 선택된 커넥션 ID */
  selectedConnectionId: string | undefined;
  /** 드래그 중인 커넥션 정보 */
  pendingConnection: PendingConnection | undefined;
  /** 출력 커넥터에서 드래그 시작 */
  startConnection: (fromNodeId: string, fromConnector: Connector, screenX: number, screenY: number) => void;
  /** 마우스 이동 중 경로 좌표 업데이트 (반환값: [worldX, worldY]) */
  updatePendingPath: (screenX: number, screenY: number) => [number, number] | null;
  /** 입력 커넥터에 드롭하여 연결 완성 */
  completeConnection: (toNodeId: string, toConnector: Connector) => void;
  /** 연결 드래그 취소 */
  cancelConnection: () => void;
  /** 커넥션 ID 목록으로 삭제 */
  deleteConnections: (connectionIds: string[]) => void;
  /** 커넥션 ID 선택 / undefined로 선택 해제 */
  selectConnection: (connectionId: string | undefined) => void;
  /** 특정 노드에 연결된 모든 커넥션 삭제 (노드 삭제 시 사용) */
  deleteConnectionsForNodes: (nodeIds: string[]) => void;
  /** 프로젝트 로드 시 커넥션 배열을 외부에서 설정 */
  loadConnections: (connections: Connection[]) => void;
}

// @MX:NOTE: propagateData는 useConnections 외부(App.tsx executeNode/propagateImmediateUpdates)에 의존하므로
// 훅 내부에 포함하지 않고 App.tsx에서 별도 호출한다 (SPEC-UI-001 M3 설계 결정)

export function useConnections({
  nodes,
  getWorldPosition,
  onConnectionsChanged,
}: UseConnectionsOptions): UseConnectionsReturn {
  const [connections, setConnections] = useImmer<Connection[]>([]);
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | undefined>(undefined);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | undefined>(undefined);

  // stale closure 방지를 위한 ref
  // React 배치 업데이트 내에서 최신 상태를 동기적으로 읽기 위해 사용
  const connectionsRef = useRef<Connection[]>(connections);
  connectionsRef.current = connections;
  const pendingConnectionRef = useRef<PendingConnection | undefined>(pendingConnection);
  pendingConnectionRef.current = pendingConnection;
  const nodesRef = useRef<Record<string, Node>>(nodes);
  nodesRef.current = nodes;
  const onConnectionsChangedRef = useRef(onConnectionsChanged);
  onConnectionsChangedRef.current = onConnectionsChanged;

  /** 출력 커넥터에서 드래그 시작 */
  const startConnection = useCallback(
    (fromNodeId: string, fromConnector: Connector, screenX: number, screenY: number) => {
      // getWorldPosition은 SVG 경로 그리기에 사용 (호출자가 path ref 업데이트)
      getWorldPosition(screenX, screenY);
      const next = { fromNodeId, fromConnector };
      pendingConnectionRef.current = next;
      setPendingConnection(next);
    },
    [getWorldPosition]
  );

  /** 마우스 이동 중 현재 월드 좌표 반환 */
  const updatePendingPath = useCallback(
    (screenX: number, screenY: number): [number, number] | null => {
      if (!pendingConnectionRef.current) return null;
      return getWorldPosition(screenX, screenY);
    },
    [getWorldPosition]
  );

  /** 입력 커넥터에 드롭하여 연결 완성 */
  const completeConnection = useCallback(
    (toNodeId: string, toConnector: Connector) => {
      // ref를 통해 동기적으로 최신 pendingConnection 접근
      const currentPending = pendingConnectionRef.current;
      if (!currentPending) return;

      const { fromNodeId, fromConnector } = currentPending;
      const currentConnections = connectionsRef.current;
      const currentNodes = nodesRef.current;

      // 자기 참조 방지 및 기본 유효성 검사 (isValidConnection에서 처리)
      const validation = isValidConnection(
        fromNodeId,
        fromConnector.id,
        toNodeId,
        toConnector.id,
        currentConnections
      );

      // pending 먼저 초기화 (이후 로직이 실패해도 항상 초기화)
      pendingConnectionRef.current = undefined;
      setPendingConnection(undefined);

      if (!validation.valid) {
        return;
      }

      // 타입 호환성 검사
      if (fromConnector.type !== toConnector.type) {
        return;
      }

      // 방향 검증: fromConnector는 노드의 outputs에 있어야 하고
      // toConnector는 노드의 inputs에 있어야 한다
      const fromNode = currentNodes[fromNodeId];
      const toNode = currentNodes[toNodeId];
      if (!fromNode || !toNode) {
        return;
      }

      const isFromOutput = fromNode.outputs.some(c => c.id === fromConnector.id);
      const isToInput = toNode.inputs.some(c => c.id === toConnector.id);

      if (!isFromOutput || !isToInput) {
        return;
      }

      // 커넥션 추가 (Date.now() + random으로 ID 충돌 방지)
      const newConnection: Connection = {
        id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fromNodeId,
        fromConnectorId: fromConnector.id,
        toNodeId,
        toConnectorId: toConnector.id,
      };

      const nextConnections = [...currentConnections, newConnection];
      connectionsRef.current = nextConnections;
      setConnections(() => nextConnections);

      if (onConnectionsChangedRef.current) {
        onConnectionsChangedRef.current(nextConnections);
      }
    },
    [setConnections]
  );

  /** 연결 드래그 취소 */
  const cancelConnection = useCallback(() => {
    pendingConnectionRef.current = undefined;
    setPendingConnection(undefined);
  }, []);

  /** 커넥션 ID 목록으로 삭제 */
  const deleteConnections = useCallback(
    (connectionIds: string[]) => {
      const idSet = new Set(connectionIds);
      const nextConnections = connectionsRef.current.filter(c => !idSet.has(c.id));
      connectionsRef.current = nextConnections;
      setConnections(() => nextConnections);
      if (onConnectionsChangedRef.current) {
        onConnectionsChangedRef.current(nextConnections);
      }
    },
    [setConnections]
  );

  /** 커넥션 ID 선택 / undefined로 선택 해제 */
  const selectConnection = useCallback((connectionId: string | undefined) => {
    setSelectedConnectionId(connectionId);
  }, []);

  /** 특정 노드에 연결된 모든 커넥션 삭제 */
  const deleteConnectionsForNodes = useCallback(
    (nodeIds: string[]) => {
      const nodeSet = new Set(nodeIds);
      const nextConnections = connectionsRef.current.filter(
        c => !nodeSet.has(c.fromNodeId) && !nodeSet.has(c.toNodeId)
      );
      connectionsRef.current = nextConnections;
      setConnections(() => nextConnections);
      if (onConnectionsChangedRef.current) {
        onConnectionsChangedRef.current(nextConnections);
      }
    },
    [setConnections]
  );

  /** 프로젝트 로드 시 커넥션 배열 설정 */
  const loadConnections = useCallback(
    (newConnections: Connection[]) => {
      connectionsRef.current = newConnections;
      setConnections(() => newConnections);
    },
    [setConnections]
  );

  return {
    connections,
    selectedConnectionId,
    pendingConnection,
    startConnection,
    updatePendingPath,
    completeConnection,
    cancelConnection,
    deleteConnections,
    selectConnection,
    deleteConnectionsForNodes,
    loadConnections,
  };
}
