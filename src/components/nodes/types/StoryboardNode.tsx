import type { StoryboardNode as StoryboardNodeType } from '../../../types/nodes'
interface StoryboardNodeProps { node: StoryboardNodeType; onUpdate?: (data: Partial<StoryboardNodeType['data']>) => void; isSelected?: boolean }
export function StoryboardNode({ node, isSelected }: StoryboardNodeProps) {
  return (
    <div data-testid="storyboard-node" data-node-id={node.id}
      style={{ background: '#1e1e2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(249,115,22,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '300px', color: '#e2e8f0' }}>
      <div data-testid="storyboard-node-ports" style={{ display: 'none' }}>
        <span data-port="text-in" data-port-type="TEXT" data-port-direction="INPUT" />
        <span data-port="image-out" data-port-type="IMAGE" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#f97316', marginBottom: '4px' }}>STORYBOARD</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Storyboard ({node.data.scenes.length}/{node.data.maxScenes})</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {Array.from({ length: node.data.maxScenes }, (_, i) => (
          <div key={i} style={{ width: '80px', height: '60px', border: '2px dashed rgba(249,115,22,0.3)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#94a3b8' }}>
            {node.data.scenes[i] ? '장면' : `${i + 1}`}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-TEXT" title="Text Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
        <div data-testid="output-port-IMAGE" title="Image Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
