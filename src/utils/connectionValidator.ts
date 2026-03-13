// 연결 유효성 검사 유틸리티
// 포트 호환성 확인 및 순환 감지 기능 제공

import { PortDataType, COMPATIBILITY_MATRIX, type Connection } from '../types/connections'

/**
 * 두 포트 데이터 타입이 호환되는지 확인
 * @param sourceType - 소스 포트의 데이터 타입
 * @param targetType - 타겟 포트의 데이터 타입
 * @returns 호환 여부
 */
export function isCompatible(sourceType: PortDataType, targetType: PortDataType): boolean {
  const compatibles = COMPATIBILITY_MATRIX[sourceType]
  if (!compatibles) return false
  return compatibles.includes(targetType)
}

/**
 * 새 연결 추가 시 순환(cycle)이 발생하는지 DFS로 검사
 * @param connections - 기존 연결 목록
 * @param newConnection - 추가하려는 새 연결
 * @returns 순환 발생 여부
 */
export function hasCyclic(connections: Connection[], newConnection: Connection): boolean {
  // 자기 자신으로의 연결은 즉시 순환
  if (newConnection.sourceNodeId === newConnection.targetNodeId) {
    return true
  }

  // 인접 리스트 (소스 -> 타겟들) 구성
  const adjacency = new Map<string, string[]>()

  for (const conn of connections) {
    const targets = adjacency.get(conn.sourceNodeId) ?? []
    targets.push(conn.targetNodeId)
    adjacency.set(conn.sourceNodeId, targets)
  }

  // 새 연결 임시 추가
  const newTargets = adjacency.get(newConnection.sourceNodeId) ?? []
  newTargets.push(newConnection.targetNodeId)
  adjacency.set(newConnection.sourceNodeId, newTargets)

  // DFS로 순환 감지: newConnection의 타겟에서 소스로 도달 가능한지 확인
  const visited = new Set<string>()

  function dfs(nodeId: string): boolean {
    if (nodeId === newConnection.sourceNodeId) {
      return true // 소스로 돌아왔으므로 순환
    }
    if (visited.has(nodeId)) {
      return false
    }
    visited.add(nodeId)

    const neighbors = adjacency.get(nodeId) ?? []
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true
    }
    return false
  }

  return dfs(newConnection.targetNodeId)
}
