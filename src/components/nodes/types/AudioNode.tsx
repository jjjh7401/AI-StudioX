import type { AudioNode as AudioNodeType } from '../../../types/nodes'
interface AudioNodeProps { node: AudioNodeType; isSelected?: boolean }
export function AudioNode({ node, isSelected }: AudioNodeProps) {
  return (
    <div data-testid="audio-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(167,243,208,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '200px', color: '#e2e8f0' }}>
      <div data-testid="audio-node-ports" style={{ display: 'none' }}>
        <span data-port="audio-out" data-port-type="AUDIO" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#6ee7b7', marginBottom: '4px' }}>AUDIO</div>
      <div style={{ fontWeight: 600, fontSize: '13px' }}>{node.data.label ?? 'Audio'}</div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
        <div data-testid="output-port-AUDIO" title="Audio Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6ee7b7', border: '2px solid #10b981', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
