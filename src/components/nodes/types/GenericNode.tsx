// 제네릭 노드 - 미구현 노드 타입을 위한 폴백
import type { BaseNode } from '../../../types/nodes'
interface GenericNodeProps { node: BaseNode; isSelected?: boolean }
export function GenericNode({ node, isSelected }: GenericNodeProps) {
  return (
    <div data-testid="generic-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(148,163,184,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '180px', color: '#e2e8f0' }}>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{node.type}</div>
      <div style={{ fontWeight: 600, fontSize: '13px' }}>{node.type}</div>
    </div>
  )
}
