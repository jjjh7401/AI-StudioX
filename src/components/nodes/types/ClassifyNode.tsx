import type { ClassifyNode as ClassifyNodeType } from '../../../types/nodes'
interface ClassifyNodeProps { node: ClassifyNodeType; isSelected?: boolean }
export function ClassifyNode({ node, isSelected }: ClassifyNodeProps) {
  return (
    <div data-testid="classify-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(129,140,248,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '200px', color: '#e2e8f0' }}>
      <div data-testid="classify-node-ports" style={{ display: 'none' }}>
        <span data-port="image-in" data-port-type="IMAGE" data-port-direction="INPUT" />
        <span data-port="text-out" data-port-type="TEXT" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#818cf8', marginBottom: '4px' }}>CLASSIFY</div>
      <div style={{ fontWeight: 600, fontSize: '13px' }}>Image Classify</div>
      {node.data.result && <div style={{ marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>{node.data.result}</div>}
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-IMAGE" title="Image Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
        <div data-testid="output-port-TEXT" title="Text Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
