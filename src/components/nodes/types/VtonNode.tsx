import type { VtonNode as VtonNodeType } from '../../../types/nodes'
interface VtonNodeProps { node: VtonNodeType; onUpdate?: (data: Partial<VtonNodeType['data']>) => void; isSelected?: boolean }
export function VtonNode({ node, isSelected }: VtonNodeProps) {
  return (
    <div data-testid="vton-node" data-node-id={node.id}
      style={{ background: '#1e2a3a', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(56,189,248,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '240px', color: '#e2e8f0' }}>
      <div data-testid="vton-node-ports" style={{ display: 'none' }}>
        <span data-port="outfit-in" data-port-type="IMAGE" data-port-direction="INPUT" />
        <span data-port="pose-in" data-port-type="IMAGE" data-port-direction="INPUT" />
        <span data-port="image-out" data-port-type="IMAGE" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '4px' }}>VIRTUAL TRY-ON</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>VTON</div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1, height: '80px', border: '2px dashed rgba(56,189,248,0.3)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>
          의상 이미지
          {node.data.outfitImage && <img src={node.data.outfitImage} alt="outfit" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />}
        </div>
        <div style={{ flex: 1, height: '80px', border: '2px dashed rgba(56,189,248,0.3)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>
          포즈 이미지
          {node.data.poseImage && <img src={node.data.poseImage} alt="pose" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div data-testid="input-port-IMAGE-outfit" title="Outfit Image" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
          <div data-testid="input-port-IMAGE-pose" title="Pose Image" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
        </div>
        <div data-testid="output-port-IMAGE" title="Image Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
