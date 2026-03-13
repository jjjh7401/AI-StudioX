import type { ScriptNode as ScriptNodeType } from '../../../types/nodes'
interface ScriptNodeProps { node: ScriptNodeType; onUpdate?: (data: Partial<ScriptNodeType['data']>) => void; isSelected?: boolean }
export function ScriptNode({ node, onUpdate, isSelected }: ScriptNodeProps) {
  return (
    <div data-testid="script-node" data-node-id={node.id}
      style={{ background: '#1e2a1e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(132,204,22,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '240px', color: '#e2e8f0' }}>
      <div data-testid="script-node-ports" style={{ display: 'none' }}>
        <span data-port="text-in" data-port-type="TEXT" data-port-direction="INPUT" />
        <span data-port="text-out" data-port-type="TEXT" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#84cc16', marginBottom: '4px' }}>SCRIPT</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Product Analysis</div>
      <input value={node.data.productName} onChange={(e) => onUpdate?.({ productName: e.target.value })}
        placeholder="상품명..."
        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#e2e8f0', padding: '4px 6px', fontSize: '12px', boxSizing: 'border-box', marginBottom: '4px' }} />
      {node.data.output && (
        <div style={{ fontSize: '11px', color: '#94a3b8', padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>{node.data.output}</div>
      )}
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-TEXT" title="Text Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
        <div data-testid="output-port-TEXT" title="Text Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
