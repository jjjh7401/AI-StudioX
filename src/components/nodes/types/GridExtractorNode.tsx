import type { GridExtractorNode as GridExtractorNodeType } from '../../../types/nodes'
interface GridExtractorNodeProps { node: GridExtractorNodeType; isSelected?: boolean }
export function GridExtractorNode({ node, isSelected }: GridExtractorNodeProps) {
  return (
    <div data-testid="grid-extractor-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(245,158,11,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '240px', color: '#e2e8f0' }}>
      <div data-testid="grid-extractor-node-ports" style={{ display: 'none' }}>
        <span data-port="image-in" data-port-type="IMAGE" data-port-direction="INPUT" />
        <span data-port="array-out" data-port-type="ARRAY" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#f59e0b', marginBottom: '4px' }}>GRID EXTRACTOR</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Grid Extract</div>
      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{node.data.columns}×{node.data.rows} 그리드</div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div data-testid="input-port-IMAGE" title="Image Input" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
        <div data-testid="output-port-ARRAY" title="Array Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171', border: '2px solid #dc2626', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
