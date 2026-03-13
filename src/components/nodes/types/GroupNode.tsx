import type { GroupNode as GroupNodeType } from '../../../types/nodes'
interface GroupNodeProps { node: GroupNodeType; onUpdate?: (data: Partial<GroupNodeType['data']>) => void; isSelected?: boolean }
export function GroupNode({ node, onUpdate, isSelected }: GroupNodeProps) {
  return (
    <div data-testid="group-node" data-node-id={node.id}
      style={{ background: 'rgba(30,30,60,0.5)', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(148,163,184,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '300px', minHeight: '200px', color: '#e2e8f0' }}>
      <div data-testid="group-node-ports" style={{ display: 'none' }}>
        <span data-port="no-ports" data-port-type="ANY" data-port-direction="INPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>GROUP</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <input value={node.data.label} onChange={(e) => onUpdate?.({ label: e.target.value })}
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#e2e8f0', fontWeight: 600, fontSize: '13px', outline: 'none' }} />
        <button onClick={() => onUpdate?.({ collapsed: !node.data.collapsed })}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#94a3b8', cursor: 'pointer', padding: '2px 8px', fontSize: '11px' }}>
          {node.data.collapsed ? '펼치기' : '접기'}
        </button>
      </div>
      {!node.data.collapsed && (
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{node.data.nodeIds.length}개 노드 포함</div>
      )}
    </div>
  )
}
