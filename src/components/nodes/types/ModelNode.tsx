import type { ModelNode as ModelNodeType } from '../../../types/nodes'
interface ModelNodeProps { node: ModelNodeType; onUpdate?: (data: Partial<ModelNodeType['data']>) => void; isSelected?: boolean }
export function ModelNode({ node, onUpdate, isSelected }: ModelNodeProps) {
  return (
    <div data-testid="model-node" data-node-id={node.id}
      style={{ background: '#2d1b4e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(168,85,247,0.4)'}`, borderRadius: '8px', padding: '12px', minWidth: '220px', color: '#e2e8f0' }}>
      <div data-testid="model-node-ports" style={{ display: 'none' }}>
        <span data-port="text-in" data-port-type="TEXT" data-port-direction="INPUT" />
        <span data-port="image-out" data-port-type="IMAGE" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#a855f7', marginBottom: '4px' }}>AI MODEL</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Fashion Model</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '11px', color: '#94a3b8' }}>
          성별:
          <select value={node.data.gender} onChange={(e) => onUpdate?.({ gender: e.target.value as 'female' | 'male' | 'neutral' })}
            style={{ marginLeft: '8px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '4px', fontSize: '11px' }}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="neutral">Neutral</option>
          </select>
        </label>
        <label style={{ fontSize: '11px', color: '#94a3b8' }}>
          나이:
          <input type="number" value={node.data.age} min={18} max={70}
            onChange={(e) => onUpdate?.({ age: parseInt(e.target.value) })}
            style={{ marginLeft: '8px', width: '50px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '4px', padding: '2px 4px', fontSize: '11px' }} />
        </label>
      </div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-TEXT" title="Text Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
        <div data-testid="output-port-IMAGE" title="Image Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
