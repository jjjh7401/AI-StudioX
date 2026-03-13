import type { StitchNode as StitchNodeType } from '../../../types/nodes'
interface StitchNodeProps { node: StitchNodeType; isSelected?: boolean }
export function StitchNode({ node, isSelected }: StitchNodeProps) {
  return (
    <div data-testid="stitch-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(20,184,166,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '220px', color: '#e2e8f0' }}>
      <div data-testid="stitch-node-ports" style={{ display: 'none' }}>
        <span data-port="array-in" data-port-type="ARRAY" data-port-direction="INPUT" />
        <span data-port="image-out" data-port-type="IMAGE" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#14b8a6', marginBottom: '4px' }}>STITCH</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Image Stitch</div>
      <div style={{ fontSize: '12px', color: '#94a3b8' }}>방향: {node.data.direction}</div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-ARRAY" title="Array Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171', border: '2px solid #dc2626', cursor: 'crosshair' }} />
        <div data-testid="output-port-IMAGE" title="Image Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
