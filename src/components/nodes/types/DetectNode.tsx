import type { DetectNode as DetectNodeType } from '../../../types/nodes'
interface DetectNodeProps { node: DetectNodeType; isSelected?: boolean }
export function DetectNode({ node, isSelected }: DetectNodeProps) {
  return (
    <div data-testid="detect-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(251,113,133,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '200px', color: '#e2e8f0' }}>
      <div data-testid="detect-node-ports" style={{ display: 'none' }}>
        <span data-port="image-in" data-port-type="IMAGE" data-port-direction="INPUT" />
        <span data-port="array-out" data-port-type="ARRAY" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#fb7185', marginBottom: '4px' }}>DETECT</div>
      <div style={{ fontWeight: 600, fontSize: '13px' }}>Object Detection</div>
      {node.data.detections && node.data.detections.length > 0 && (
        <div style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>{node.data.detections.length}개 감지됨</div>
      )}
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-IMAGE" title="Image Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
        <div data-testid="output-port-ARRAY" title="Array Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171', border: '2px solid #dc2626', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
