import type { TranslateNode as TranslateNodeType } from '../../../types/nodes'
interface TranslateNodeProps { node: TranslateNodeType; onUpdate?: (data: Partial<TranslateNodeType['data']>) => void; isSelected?: boolean }
export function TranslateNode({ node, onUpdate, isSelected }: TranslateNodeProps) {
  return (
    <div data-testid="translate-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(165,243,252,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '200px', color: '#e2e8f0' }}>
      <div data-testid="translate-node-ports" style={{ display: 'none' }}>
        <span data-port="text-in" data-port-type="TEXT" data-port-direction="INPUT" />
        <span data-port="text-out" data-port-type="TEXT" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#a5f3fc', marginBottom: '4px' }}>TRANSLATE</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Translate</div>
      <div style={{ display: 'flex', gap: '4px', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
        <select value={node.data.targetLang ?? 'en'} onChange={(e) => onUpdate?.({ targetLang: e.target.value })}
          style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '4px', fontSize: '11px' }}>
          <option value="en">영어</option><option value="ko">한국어</option><option value="ja">일본어</option><option value="zh">중국어</option>
        </select>
      </div>
      <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-TEXT" title="Text Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
        <div data-testid="output-port-TEXT" title="Text Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
