import type { ListNode as ListNodeType } from '../../../types/nodes'
interface ListNodeProps { node: ListNodeType; isSelected?: boolean }
export function ListNode({ node, isSelected }: ListNodeProps) {
  return (
    <div data-testid="list-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(251,146,60,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '200px', color: '#e2e8f0' }}>
      <div data-testid="list-node-ports" style={{ display: 'none' }}>
        <span data-port="array-in" data-port-type="ARRAY" data-port-direction="INPUT" />
        <span data-port="list-out" data-port-type="LIST" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#fb923c', marginBottom: '4px' }}>LIST</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>List</div>
      <div style={{ fontSize: '12px', color: '#94a3b8' }}>항목 수: {node.data.items.length}</div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-ARRAY" title="Array Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171', border: '2px solid #dc2626', cursor: 'crosshair' }} />
        <div data-testid="output-port-LIST" title="List Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fb923c', border: '2px solid #ea580c', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
