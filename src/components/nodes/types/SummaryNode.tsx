import type { SummaryNode as SummaryNodeType } from '../../../types/nodes'
interface SummaryNodeProps { node: SummaryNodeType; isSelected?: boolean }
export function SummaryNode({ node, isSelected }: SummaryNodeProps) {
  return (
    <div data-testid="summary-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(196,181,253,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '200px', color: '#e2e8f0' }}>
      <div data-testid="summary-node-ports" style={{ display: 'none' }}>
        <span data-port="text-in" data-port-type="TEXT" data-port-direction="INPUT" />
        <span data-port="text-out" data-port-type="TEXT" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#c4b5fd', marginBottom: '4px' }}>SUMMARY</div>
      <div style={{ fontWeight: 600, fontSize: '13px' }}>Text Summary</div>
      {node.data.summary && <div style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>{node.data.summary}</div>}
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-TEXT" title="Text Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
        <div data-testid="output-port-TEXT" title="Text Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
