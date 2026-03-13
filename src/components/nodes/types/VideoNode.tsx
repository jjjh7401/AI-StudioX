import type { VideoNode as VideoNodeType } from '../../../types/nodes'
interface VideoNodeProps { node: VideoNodeType; isSelected?: boolean }
export function VideoNode({ node, isSelected }: VideoNodeProps) {
  return (
    <div data-testid="video-node" data-node-id={node.id}
      style={{ background: '#1a2e1a', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(74,222,128,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '220px', color: '#e2e8f0' }}>
      <div data-testid="video-node-ports" style={{ display: 'none' }}>
        <span data-port="image-in" data-port-type="IMAGE" data-port-direction="INPUT" />
        <span data-port="video-out" data-port-type="VIDEO" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#4ade80', marginBottom: '4px' }}>VIDEO</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>{node.data.label ?? 'Video'}</div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div data-testid="input-port-IMAGE" title="Image Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
      </div>
      {node.data.src ? (
        <video src={node.data.src} controls style={{ width: '100%', borderRadius: '4px' }} />
      ) : (
        <div style={{ height: '80px', border: '2px dashed rgba(74,222,128,0.3)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>
          비디오 없음
        </div>
      )}
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
        <div data-testid="output-port-VIDEO" title="Video Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
