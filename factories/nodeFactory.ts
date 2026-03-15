// nodeFactory: 28개 노드 타입별 기본값 생성 팩토리
// App.tsx의 addNode switch문(대형 분기)을 팩토리 패턴으로 추출
import type { Node, Point } from '../types';
import { NodeType } from '../types';
import { NODE_DEFAULTS } from '../data/nodeDefaults';

// @MX:ANCHOR: 모든 노드 생성의 단일 진입점
// @MX:REASON: 28개 NodeType의 기본값을 일관되게 생성하기 위한 팩토리

/**
 * 주어진 NodeType과 위치로 Node 객체를 생성
 * NODE_DEFAULTS에서 크기, 커넥터, 데이터 기본값을 가져와 조합
 */
export function createNode(type: NodeType, id: string, position: Point): Node {
  const defaults = NODE_DEFAULTS[type];

  return {
    id,
    type,
    position,
    size: { ...defaults.defaultSize },
    data: { ...defaults.defaultData } as unknown as Node['data'],
    inputs: defaults.inputs.map((input) => ({ ...input })),
    outputs: defaults.outputs.map((output) => ({ ...output })),
    isCollapsed: false,
    isBypassed: false,
  };
}
