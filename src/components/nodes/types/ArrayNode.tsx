import type { ArrayNode as ArrayNodeType } from '../../../types/nodes'
interface ArrayNodeProps { node: ArrayNodeType; onUpdate?: (data: Partial<ArrayNodeType['data']>) => void; isSelected?: boolean }
export function ArrayNode({ node, isSelected }: ArrayNodeProps) {
  return (
    <div data-testid="array-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(248,113,113,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '200px', color: '#e2e8f0' }}>
      <div data-testid="array-node-ports" style={{ display: 'none' }}>
        <span data-port="array-in" data-port-type="ARRAY" data-port-direction="INPUT" />
        <span data-port="array-out" data-port-type="ARRAY" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#f87171', marginBottom: '4px' }}>ARRAY</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>{node.data.label ?? 'Array'}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8' }}>항목 수: {node.data.items.length}</div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-ARRAY" title="Array Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171', border: '2px solid #dc2626', cursor: 'crosshair' }} />
        <div data-testid="output-port-ARRAY" title="Array Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171', border: '2px solid #dc2626', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
