// graphUtils: 토폴로지 정렬, 순환 감지, 다운스트림 노드 탐색 알고리즘
// 커넥션 그래프 기반 순수 함수 구현
import type { Connection } from '../types';

// @MX:ANCHOR: 그래프 알고리즘의 핵심 진입점 - 여러 컴포넌트에서 사용
// @MX:REASON: 토폴로지 정렬, 순환 감지 등 핵심 그래프 연산 제공

/**
 * Kahn's Algorithm을 사용한 토폴로지 정렬
 * 노드 ID 목록과 커넥션을 받아 업스트림 노드가 먼저 오는 순서로 반환
 * 순환 참조가 있으면 Error를 던진다
 */
export function topologicalSort(
  nodeIds: string[],
  connections: Connection[]
): string[] {
  if (nodeIds.length === 0) return [];

  // 인접 리스트 및 진입 차수 계산
  const inDegree: Map<string, number> = new Map();
  const adjList: Map<string, string[]> = new Map();

  // 모든 노드를 초기화
  for (const id of nodeIds) {
    inDegree.set(id, 0);
    adjList.set(id, []);
  }

  // 커넥션으로 그래프 구성 (nodeIds에 포함된 노드만)
  const nodeSet = new Set(nodeIds);
  for (const conn of connections) {
    const { fromNodeId, toNodeId } = conn;
    if (!nodeSet.has(fromNodeId) || !nodeSet.has(toNodeId)) continue;
    adjList.get(fromNodeId)!.push(toNodeId);
    inDegree.set(toNodeId, (inDegree.get(toNodeId) ?? 0) + 1);
  }

  // 진입 차수가 0인 노드를 큐에 추가
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const result: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    for (const neighbor of adjList.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  if (result.length !== nodeIds.length) {
    throw new Error('순환 참조(Cycle)가 감지되었습니다. 토폴로지 정렬을 수행할 수 없습니다.');
  }

  return result;
}

/**
 * fromNodeId → toNodeId 커넥션 추가 시 순환이 발생하는지 감지
 * DFS 기반으로 toNodeId에서 시작해 fromNodeId에 도달 가능한지 확인
 */
export function hasCycle(
  connections: Connection[],
  fromNodeId: string,
  toNodeId: string
): boolean {
  // toNodeId에서 시작해 fromNodeId에 도달할 수 있으면 순환
  const visited = new Set<string>();
  const stack: string[] = [toNodeId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === fromNodeId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    // current에서 나가는 커넥션 탐색
    for (const conn of connections) {
      if (conn.fromNodeId === current && !visited.has(conn.toNodeId)) {
        stack.push(conn.toNodeId);
      }
    }
  }

  return false;
}

/**
 * 특정 노드에서 BFS로 도달 가능한 모든 다운스트림 노드 ID 반환
 * nodeId 자체는 포함하지 않으며 중복 없이 반환
 */
export function getDownstreamNodes(
  nodeId: string,
  connections: Connection[]
): string[] {
  const visited = new Set<string>();
  const queue: string[] = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const conn of connections) {
      if (conn.fromNodeId === current && !visited.has(conn.toNodeId)) {
        visited.add(conn.toNodeId);
        queue.push(conn.toNodeId);
      }
    }
  }

  return Array.from(visited);
}

/**
 * 특정 노드에 직접 연결된 다운스트림 노드 ID만 반환 (1단계 자식만)
 * 중복 없이 반환
 */
export function getDirectDownstream(
  nodeId: string,
  connections: Connection[]
): string[] {
  const result = new Set<string>();

  for (const conn of connections) {
    if (conn.fromNodeId === nodeId) {
      result.add(conn.toNodeId);
    }
  }

  return Array.from(result);
}

/**
 * 커넥션 추가 가능 여부 검사
 * - 자기 참조 불허
 * - 중복 커넥션 불허
 * - 순환 참조 불허
 */
export function isValidConnection(
  fromNodeId: string,
  fromConnectorId: string,
  toNodeId: string,
  toConnectorId: string,
  existingConnections: Connection[]
): { valid: boolean; reason?: string } {
  // 자기 자신에게 연결
  if (fromNodeId === toNodeId) {
    return { valid: false, reason: '자기 자신에게 연결할 수 없습니다.' };
  }

  // 중복 커넥션 검사
  const isDuplicate = existingConnections.some(
    (conn) =>
      conn.fromNodeId === fromNodeId &&
      conn.fromConnectorId === fromConnectorId &&
      conn.toNodeId === toNodeId &&
      conn.toConnectorId === toConnectorId
  );
  if (isDuplicate) {
    return { valid: false, reason: '이미 동일한 커넥션이 존재합니다.' };
  }

  // 순환 참조 감지
  if (hasCycle(existingConnections, fromNodeId, toNodeId)) {
    return { valid: false, reason: '이 커넥션을 추가하면 순환 참조가 발생합니다.' };
  }

  return { valid: true };
}
