// graphUtils.test.ts: 그래프 알고리즘 유틸리티 TDD 테스트
import { describe, it, expect } from 'vitest';
import type { Connection } from '../../types';
import {
  topologicalSort,
  hasCycle,
  getDownstreamNodes,
  getDirectDownstream,
  isValidConnection,
} from '../graphUtils';

// 테스트용 커넥션 생성 헬퍼
function makeConn(id: string, fromNodeId: string, toNodeId: string): Connection {
  return { id, fromNodeId, fromConnectorId: 'out', toNodeId, toConnectorId: 'in' };
}

describe('topologicalSort', () => {
  it('빈 그래프: 빈 배열을 반환해야 한다', () => {
    const result = topologicalSort([], []);
    expect(result).toEqual([]);
  });

  it('단일 노드: 노드 자체를 반환해야 한다', () => {
    const result = topologicalSort(['A'], []);
    expect(result).toEqual(['A']);
  });

  it('선형 체인 A→B→C: 순서대로 반환해야 한다', () => {
    const connections: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'B', 'C'),
    ];
    const result = topologicalSort(['A', 'B', 'C'], connections);
    // A가 B보다 앞, B가 C보다 앞이어야 한다
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'));
    expect(result.indexOf('B')).toBeLessThan(result.indexOf('C'));
  });

  it('다이아몬드 패턴 A→B→D, A→C→D: A가 B,C보다 앞, B,C가 D보다 앞이어야 한다', () => {
    const connections: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'A', 'C'),
      makeConn('c3', 'B', 'D'),
      makeConn('c4', 'C', 'D'),
    ];
    const result = topologicalSort(['A', 'B', 'C', 'D'], connections);
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'));
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('C'));
    expect(result.indexOf('B')).toBeLessThan(result.indexOf('D'));
    expect(result.indexOf('C')).toBeLessThan(result.indexOf('D'));
  });

  it('연결되지 않은 노드들: 모든 노드가 결과에 포함되어야 한다', () => {
    const result = topologicalSort(['A', 'B', 'C'], []);
    expect(result).toHaveLength(3);
    expect(result).toContain('A');
    expect(result).toContain('B');
    expect(result).toContain('C');
  });

  it('순환 참조가 있을 때 Error를 던져야 한다', () => {
    const connections: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'B', 'C'),
      makeConn('c3', 'C', 'A'),
    ];
    expect(() => topologicalSort(['A', 'B', 'C'], connections)).toThrow();
  });
});

describe('topologicalSort - 추가 경계 케이스', () => {
  it('nodeIds에 없는 노드를 참조하는 커넥션은 무시해야 한다', () => {
    // A,B만 포함, C는 없음 - A→C 커넥션은 무시됨
    const connections: Connection[] = [
      makeConn('c1', 'A', 'C'),
    ];
    const result = topologicalSort(['A', 'B'], connections);
    expect(result).toHaveLength(2);
    expect(result).toContain('A');
    expect(result).toContain('B');
  });
});

describe('hasCycle', () => {
  it('커넥션이 없을 때 순환은 발생하지 않는다', () => {
    expect(hasCycle([], 'A', 'B')).toBe(false);
  });

  it('단순 선형 체인에서 새 연결이 순환을 만들지 않는다', () => {
    const connections: Connection[] = [makeConn('c1', 'A', 'B')];
    // B→C 추가: A→B→C, 순환 없음
    expect(hasCycle(connections, 'B', 'C')).toBe(false);
  });

  it('A→B→C 상태에서 C→A 추가 시 순환을 감지해야 한다', () => {
    const connections: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'B', 'C'),
    ];
    expect(hasCycle(connections, 'C', 'A')).toBe(true);
  });

  it('A→B 상태에서 B→A 추가 시 순환을 감지해야 한다', () => {
    const connections: Connection[] = [makeConn('c1', 'A', 'B')];
    expect(hasCycle(connections, 'B', 'A')).toBe(true);
  });

  it('다이아몬드 패턴에서 역방향 연결 시 순환을 감지해야 한다', () => {
    const connections: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'A', 'C'),
      makeConn('c3', 'B', 'D'),
      makeConn('c4', 'C', 'D'),
    ];
    // D→A 추가: 순환 발생
    expect(hasCycle(connections, 'D', 'A')).toBe(true);
  });

  it('독립적인 노드 간 연결 시 순환이 없다', () => {
    const connections: Connection[] = [makeConn('c1', 'A', 'B')];
    // C→D 추가: A,B와 독립
    expect(hasCycle(connections, 'C', 'D')).toBe(false);
  });

  it('이미 방문한 노드를 다시 탐색하지 않아야 한다 (복잡한 그래프)', () => {
    // A→B, A→C, B→D, C→D: D에서 A로 연결 시도 - 순환 감지
    const connections: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'A', 'C'),
      makeConn('c3', 'B', 'D'),
      makeConn('c4', 'C', 'D'),
    ];
    expect(hasCycle(connections, 'D', 'A')).toBe(true);
  });
});

describe('getDownstreamNodes', () => {
  it('커넥션이 없을 때 빈 배열을 반환해야 한다', () => {
    expect(getDownstreamNodes('A', [])).toEqual([]);
  });

  it('직접 연결된 노드를 반환해야 한다', () => {
    const connections: Connection[] = [makeConn('c1', 'A', 'B')];
    const result = getDownstreamNodes('A', connections);
    expect(result).toContain('B');
    expect(result).not.toContain('A');
  });

  it('선형 체인 A→B→C에서 A의 다운스트림은 B와 C 모두여야 한다', () => {
    const connections: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'B', 'C'),
    ];
    const result = getDownstreamNodes('A', connections);
    expect(result).toContain('B');
    expect(result).toContain('C');
    expect(result).not.toContain('A');
  });

  it('다이아몬드 A→B→D, A→C→D에서 A의 다운스트림에 중복 없이 B,C,D가 포함되어야 한다', () => {
    const connections: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'A', 'C'),
      makeConn('c3', 'B', 'D'),
      makeConn('c4', 'C', 'D'),
    ];
    const result = getDownstreamNodes('A', connections);
    expect(result).toContain('B');
    expect(result).toContain('C');
    expect(result).toContain('D');
    // 중복 없음
    expect(new Set(result).size).toBe(result.length);
  });

  it('중간 노드에서의 다운스트림: B의 다운스트림은 C만이어야 한다', () => {
    const connections: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'B', 'C'),
    ];
    const result = getDownstreamNodes('B', connections);
    expect(result).toContain('C');
    expect(result).not.toContain('A');
    expect(result).not.toContain('B');
  });
});

describe('getDirectDownstream', () => {
  it('커넥션이 없을 때 빈 배열을 반환해야 한다', () => {
    expect(getDirectDownstream('A', [])).toEqual([]);
  });

  it('직접 연결된 노드만 반환해야 한다', () => {
    const connections: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'B', 'C'),
    ];
    // A의 직접 다운스트림은 B만 (C는 간접)
    const result = getDirectDownstream('A', connections);
    expect(result).toContain('B');
    expect(result).not.toContain('C');
  });

  it('여러 직접 다운스트림 노드를 반환해야 한다', () => {
    const connections: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'A', 'C'),
      makeConn('c3', 'A', 'D'),
    ];
    const result = getDirectDownstream('A', connections);
    expect(result).toContain('B');
    expect(result).toContain('C');
    expect(result).toContain('D');
    expect(result).toHaveLength(3);
  });

  it('동일 노드로의 중복 커넥션 시 중복 없이 반환해야 한다', () => {
    const connections: Connection[] = [
      { id: 'c1', fromNodeId: 'A', fromConnectorId: 'out1', toNodeId: 'B', toConnectorId: 'in1' },
      { id: 'c2', fromNodeId: 'A', fromConnectorId: 'out2', toNodeId: 'B', toConnectorId: 'in2' },
    ];
    const result = getDirectDownstream('A', connections);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('B');
  });
});

describe('isValidConnection', () => {
  it('정상적인 새 커넥션은 valid여야 한다', () => {
    const result = isValidConnection('A', 'out', 'B', 'in', []);
    expect(result.valid).toBe(true);
  });

  it('자기 자신에게 연결 시 invalid여야 한다', () => {
    const result = isValidConnection('A', 'out', 'A', 'in', []);
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('이미 존재하는 동일 커넥션은 invalid여야 한다', () => {
    const existing: Connection[] = [
      { id: 'c1', fromNodeId: 'A', fromConnectorId: 'out', toNodeId: 'B', toConnectorId: 'in' },
    ];
    const result = isValidConnection('A', 'out', 'B', 'in', existing);
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('순환을 만드는 커넥션은 invalid여야 한다', () => {
    const existing: Connection[] = [
      makeConn('c1', 'A', 'B'),
      makeConn('c2', 'B', 'C'),
    ];
    // C→A 추가 시 순환
    const result = isValidConnection('C', 'out', 'A', 'in', existing);
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('순환이 없는 정상 커넥션은 valid여야 한다', () => {
    const existing: Connection[] = [makeConn('c1', 'A', 'B')];
    // B→C: 순환 없음
    const result = isValidConnection('B', 'out', 'C', 'in', existing);
    expect(result.valid).toBe(true);
  });
});
