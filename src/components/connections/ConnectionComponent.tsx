// SVG 연결선 컴포넌트
// 두 노드 포트 간의 베지어 곡선 경로를 렌더링

import type { Connection } from '../../types/connections'
import type { BaseNode } from '../../types/nodes'

/** 노드의 포트 위치 계산 (노드 위치 + 오프셋) */
function getPortPosition(
  node: BaseNode,
  portId: string,
  isOutput: boolean,
): { x: number; y: number } {
  // 노드 크기를 180x80으로 가정 (NodeComponent 기본값)
  const NODE_WIDTH = 180
  const NODE_HEIGHT = 80
  const x = node.position.x + (isOutput ? NODE_WIDTH : 0)
  const y = node.position.y + NODE_HEIGHT / 2
  // portId는 현재 사용하지 않지만 추후 멀티포트 지원을 위해 파라미터 유지
  void portId
  return { x, y }
}

/** 두 점 사이의 큐빅 베지어 SVG path 문자열 생성 */
function buildCubicPath(
  sx: number, sy: number,
  tx: number, ty: number,
): string {
  const dx = Math.abs(tx - sx) * 0.5
  return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`
}

export interface ConnectionComponentProps {
  connection: Connection
  nodes: BaseNode[]
  onDelete: (id: string) => void
  onConnectionStart?: (sourceNodeId: string, sourcePort: string, x: number, y: number) => void
  onConnectionEnd?: (targetNodeId: string, targetPort: string) => void
}

// @MX:ANCHOR: 연결선 렌더링 컴포넌트 - App, InfiniteCanvas에서 참조됨
// @MX:REASON: 소스/타겟 노드 위치 기반 SVG path 계산의 핵심 컴포넌트
export function ConnectionComponent({
  connection,
  nodes,
  onDelete,
}: ConnectionComponentProps) {
  const sourceNode = nodes.find((n) => n.id === connection.sourceNodeId)
  const targetNode = nodes.find((n) => n.id === connection.targetNodeId)

  // 노드를 찾지 못하면 렌더링 안 함
  if (!sourceNode || !targetNode) return null

  const src = getPortPosition(sourceNode, connection.sourcePort, true)
  const tgt = getPortPosition(targetNode, connection.targetPort, false)
  const d = buildCubicPath(src.x, src.y, tgt.x, tgt.y)

  // 화살표 방향 계산 (타겟 포인트 기준)
  const arrowSize = 8
  const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x)
  const ax1 = tgt.x - arrowSize * Math.cos(angle - Math.PI / 6)
  const ay1 = tgt.y - arrowSize * Math.sin(angle - Math.PI / 6)
  const ax2 = tgt.x - arrowSize * Math.cos(angle + Math.PI / 6)
  const ay2 = tgt.y - arrowSize * Math.sin(angle + Math.PI / 6)

  return (
    <g>
      {/* 클릭 영역 확장용 투명 두꺼운 경로 */}
      <path
        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        style={{ cursor: 'pointer' }}
        onClick={() => onDelete(connection.id)}
      />
      {/* 실제 연결선 */}
      <path
        d={d}
        fill="none"
        stroke="#818cf8"
        strokeWidth={2}
        strokeLinecap="round"
        pointerEvents="none"
      />
      {/* 화살표 */}
      <polygon
        points={`${tgt.x},${tgt.y} ${ax1},${ay1} ${ax2},${ay2}`}
        fill="#818cf8"
        pointerEvents="none"
      />
    </g>
  )
}
