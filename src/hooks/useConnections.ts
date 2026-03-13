// 연결 상태 관리 훅
// useImmer 기반 연결 CRUD + 유효성 검사 + 데이터 전파

import { useCallback } from 'react'
import { useImmer } from 'use-immer'
import { type Connection, PortDataType } from '../types/connections'
import { isCompatible, hasCyclic } from '../utils/connectionValidator'

export interface UseConnectionsReturn {
  connections: Connection[]
  /** 연결 추가. sourceType/targetType 생략 시 conn.dataType 기반 자가 호환 검사 */
  addConnection: (
    conn: Connection,
    sourceType?: PortDataType,
    targetType?: PortDataType,
  ) => boolean
  removeConnection: (id: string) => void
  getConnectionsForNode: (nodeId: string) => Connection[]
  /** 소스 노드 출력 데이터를 연결된 타겟 노드들에 전파 */
  propagateData: (
    sourceNodeId: string,
    outputData: unknown,
    callback: (targetNodeId: string, data: unknown) => void,
  ) => void
}

export function useConnections(): UseConnectionsReturn {
  const [connections, updateConnections] = useImmer<Connection[]>([])

  // @MX:ANCHOR: 연결 추가의 핵심 진입점 - 호환성 + 순환 검사 모두 수행
  // @MX:REASON: 이 함수는 여러 컴포넌트(ConnectionComponent, Toolbar, App)에서 호출됨
  const addConnection = useCallback(
    (
      conn: Connection,
      sourceType?: PortDataType,
      targetType?: PortDataType,
    ): boolean => {
      // sourceType/targetType이 명시된 경우 호환성 검사
      const src = sourceType ?? conn.dataType
      const tgt = targetType ?? conn.dataType

      if (!isCompatible(src, tgt)) {
        return false
      }

      // 순환 연결 검사
      if (hasCyclic(connections, conn)) {
        return false
      }

      updateConnections((draft) => {
        draft.push(conn)
      })
      return true
    },
    [connections, updateConnections],
  )

  const removeConnection = useCallback(
    (id: string) => {
      updateConnections((draft) => {
        const idx = draft.findIndex((c) => c.id === id)
        if (idx !== -1) draft.splice(idx, 1)
      })
    },
    [updateConnections],
  )

  const getConnectionsForNode = useCallback(
    (nodeId: string): Connection[] => {
      return connections.filter(
        (c) => c.sourceNodeId === nodeId || c.targetNodeId === nodeId,
      )
    },
    [connections],
  )

  const propagateData = useCallback(
    (
      sourceNodeId: string,
      outputData: unknown,
      callback: (targetNodeId: string, data: unknown) => void,
    ) => {
      // 소스 노드의 출력 포트에 연결된 타겟들에 데이터 전달
      const outgoing = connections.filter((c) => c.sourceNodeId === sourceNodeId)
      for (const conn of outgoing) {
        callback(conn.targetNodeId, outputData)
      }
    },
    [connections],
  )

  return { connections, addConnection, removeConnection, getConnectionsForNode, propagateData }
}
