import type { KeywordNode as KeywordNodeType } from '../../../types/nodes'
interface KeywordNodeProps { node: KeywordNodeType; isSelected?: boolean }
export function KeywordNode({ node, isSelected }: KeywordNodeProps) {
  return (
    <div data-testid="keyword-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(253,186,116,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '200px', color: '#e2e8f0' }}>
      <div data-testid="keyword-node-ports" style={{ display: 'none' }}>
        <span data-port="text-in" data-port-type="TEXT" data-port-direction="INPUT" />
        <span data-port="array-out" data-port-type="ARRAY" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#fdba74', marginBottom: '4px' }}>KEYWORD</div>
      <div style={{ fontWeight: 600, fontSize: '13px' }}>Keyword Extract</div>
      {node.data.keywords && node.data.keywords.length > 0 && (
        <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {node.data.keywords.map((kw, i) => (
            <span key={i} style={{ background: 'rgba(253,186,116,0.2)', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', color: '#fdba74' }}>{kw}</span>
          ))}
        </div>
      )}
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-TEXT" title="Text Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
        <div data-testid="output-port-ARRAY" title="Array Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171', border: '2px solid #dc2626', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
