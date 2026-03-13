import type { TranscribeNode as TranscribeNodeType } from '../../../types/nodes'
interface TranscribeNodeProps { node: TranscribeNodeType; isSelected?: boolean }
export function TranscribeNode({ node, isSelected }: TranscribeNodeProps) {
  return (
    <div data-testid="transcribe-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(103,232,249,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '200px', color: '#e2e8f0' }}>
      <div data-testid="transcribe-node-ports" style={{ display: 'none' }}>
        <span data-port="audio-in" data-port-type="AUDIO" data-port-direction="INPUT" />
        <span data-port="text-out" data-port-type="TEXT" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#67e8f9', marginBottom: '4px' }}>TRANSCRIBE</div>
      <div style={{ fontWeight: 600, fontSize: '13px' }}>Speech to Text</div>
      {node.data.transcript && <div style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>{node.data.transcript}</div>}
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-AUDIO" title="Audio Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6ee7b7', border: '2px solid #10b981', cursor: 'crosshair' }} />
        <div data-testid="output-port-TEXT" title="Text Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
