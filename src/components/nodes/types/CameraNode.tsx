import type { CameraNode as CameraNodeType } from '../../../types/nodes'
interface CameraNodeProps { node: CameraNodeType; onUpdate?: (data: Partial<CameraNodeType['data']>) => void; isSelected?: boolean }
export function CameraNode({ node, onUpdate, isSelected }: CameraNodeProps) {
  return (
    <div data-testid="camera-node" data-node-id={node.id}
      style={{ background: '#1a1a2e', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(251,191,36,0.3)'}`, borderRadius: '8px', padding: '12px', minWidth: '220px', color: '#e2e8f0' }}>
      <div data-testid="camera-node-ports" style={{ display: 'none' }}>
        <span data-port="image-out" data-port-type="IMAGE" data-port-direction="OUTPUT" />
      </div>
      <div style={{ fontSize: '11px', color: '#fbbf24', marginBottom: '4px' }}>CAMERA</div>
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Webcam Capture</div>
      {node.data.capturedImage ? (
        <img src={node.data.capturedImage} alt="Captured" style={{ width: '100%', borderRadius: '4px' }} />
      ) : (
        <div style={{ height: '120px', border: '2px dashed rgba(251,191,36,0.3)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>
          카메라 미리보기
        </div>
      )}
      <button onClick={() => onUpdate?.({ isCapturing: !node.data.isCapturing })}
        style={{ marginTop: '8px', background: node.data.isCapturing ? '#dc2626' : '#d97706', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', padding: '4px 12px', fontSize: '12px', width: '100%' }}>
        {node.data.isCapturing ? '촬영 중지' : '촬영 시작'}
      </button>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
        <div data-testid="output-port-IMAGE" title="Image Output" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
      </div>
    </div>
  )
}
