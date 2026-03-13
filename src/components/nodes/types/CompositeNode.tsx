import type { CompositeNode as CompositeNodeType } from '../../../types/nodes'
interface CompositeNodeProps { node: CompositeNodeType; isSelected?: boolean }
export function CompositeNode({ node, isSelected }: CompositeNodeProps) {
  return (
    <div data-testid="composite-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(6,182,212,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '220px', color: '#e2e8f0' }}>
      <div data-testid="composite-node-ports" style={{ display: 'none' }}>
        <span data-port="image-in1" data-port-type="IMAGE" data-port-direction="INPUT" />
        <span data-port="image-in2" data-port-type="IMAGE" data-port-direction="INPUT" />
        <span data-port="array-in" data-port-type="ARRAY" data-port-direction="INPUT" />
        <span data-port="image-out" data-port-type="IMAGE" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#06b6d4', marginBottom: '4px' }}>COMPOSITE</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Image Composite</div>
      <div style={{ fontSize: '12px', color: '#94a3b8' }}>레이어 수: {node.data.layers.length}</div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div data-testid="input-port-IMAGE" title="Image Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
          <div data-testid="input-port-ARRAY" title="Array Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171', border: '2px solid #dc2626', cursor: 'crosshair' }} />
        </div>
        <div data-testid="output-port-IMAGE" title="Image Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
