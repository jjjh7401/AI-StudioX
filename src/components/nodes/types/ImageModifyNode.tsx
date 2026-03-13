import type { ImageModifyNode as ImageModifyNodeType } from '../../../types/nodes'
interface ImageModifyNodeProps { node: ImageModifyNodeType; onUpdate?: (data: Partial<ImageModifyNodeType['data']>) => void; isSelected?: boolean }
export function ImageModifyNode({ node, onUpdate, isSelected }: ImageModifyNodeProps) {
  return (
    <div data-testid="image-modify-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(236,72,153,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '240px', color: '#e2e8f0' }}>
      <div data-testid="image-modify-node-ports" style={{ display: 'none' }}>
        <span data-port="image-in" data-port-type="IMAGE" data-port-direction="INPUT" />
        <span data-port="image-out" data-port-type="IMAGE" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#ec4899', marginBottom: '4px' }}>IMAGE MODIFY</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>AI Image Edit</div>
      <textarea value={node.data.prompt} onChange={(e) => onUpdate?.({ prompt: e.target.value })}
        placeholder="수정 프롬프트..."
        rows={2}
        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#e2e8f0', padding: '4px 6px', fontSize: '12px', resize: 'none', boxSizing: 'border-box' }} />
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-IMAGE" title="Image Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
        <div data-testid="output-port-IMAGE" title="Image Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
