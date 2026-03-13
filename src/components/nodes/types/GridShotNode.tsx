import type { GridShotNode as GridShotNodeType } from '../../../types/nodes'
interface GridShotNodeProps { node: GridShotNodeType; onUpdate?: (data: Partial<GridShotNodeType['data']>) => void; isSelected?: boolean }
export function GridShotNode({ node, onUpdate, isSelected }: GridShotNodeProps) {
  return (
    <div data-testid="grid-shot-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(234,179,8,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '240px', color: '#e2e8f0' }}>
      <div data-testid="grid-shot-node-ports" style={{ display: 'none' }}>
        <span data-port="text-in" data-port-type="TEXT" data-port-direction="INPUT" />
        <span data-port="image-out" data-port-type="IMAGE" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#eab308', marginBottom: '4px' }}>GRID SHOT</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Grid Layout</div>
      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
        <label>열: <input type="number" value={node.data.columns} min={1} max={6}
          onChange={(e) => onUpdate?.({ columns: parseInt(e.target.value) })}
          style={{ width: '36px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '4px', padding: '2px', fontSize: '12px' }} />
        </label>
        <label>행: <input type="number" value={node.data.rows} min={1} max={6}
          onChange={(e) => onUpdate?.({ rows: parseInt(e.target.value) })}
          style={{ width: '36px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '4px', padding: '2px', fontSize: '12px' }} />
        </label>
      </div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-TEXT" title="Text Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
        <div data-testid="output-port-IMAGE" title="Image Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
