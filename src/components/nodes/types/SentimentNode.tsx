import type { SentimentNode as SentimentNodeType } from '../../../types/nodes'
interface SentimentNodeProps { node: SentimentNodeType; isSelected?: boolean }
export function SentimentNode({ node, isSelected }: SentimentNodeProps) {
  const sentimentColor = node.data.sentiment === 'positive' ? '#4ade80' : node.data.sentiment === 'negative' ? '#f87171' : '#94a3b8'
  return (
    <div data-testid="sentiment-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(52,211,153,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '200px', color: '#e2e8f0' }}>
      <div data-testid="sentiment-node-ports" style={{ display: 'none' }}>
        <span data-port="text-in" data-port-type="TEXT" data-port-direction="INPUT" />
        <span data-port="text-out" data-port-type="TEXT" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#34d399', marginBottom: '4px' }}>SENTIMENT</div>
      <div style={{ fontWeight: 600, fontSize: '13px' }}>Sentiment Analysis</div>
      {node.data.sentiment && (
        <div style={{ marginTop: '6px', color: sentimentColor, fontSize: '13px', fontWeight: 600 }}>{node.data.sentiment.toUpperCase()}</div>
      )}
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-TEXT" title="Text Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
        <div data-testid="output-port-TEXT" title="Text Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
