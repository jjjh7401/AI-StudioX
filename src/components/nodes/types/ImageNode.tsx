// 이미지 표시/업로드 노드 컴포넌트
import { useRef } from 'react'
import type { ImageNode as ImageNodeType } from '../../../types/nodes'

interface ImageNodeProps {
  node: ImageNodeType
  onUpdate?: (data: Partial<ImageNodeType['data']>) => void
  isSelected?: boolean
}

export function ImageNode({ node, onUpdate, isSelected }: ImageNodeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      onUpdate?.({
        src: event.target?.result as string,
        mimeType: file.type,
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      data-testid="image-node"
      data-node-id={node.id}
      style={{
        background: '#1e2a4a',
        border: `2px solid ${isSelected ? '#6366f1' : 'rgba(34,197,94,0.3)'}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '220px',
        color: '#e2e8f0',
        userSelect: 'none',
      }}
    >
      {/* 포트 메타데이터 */}
      <div data-testid="image-node-ports" style={{ display: 'none' }}>
        <span data-port="image-in" data-port-type="IMAGE" data-port-direction="INPUT" />
        <span data-port="image-out" data-port-type="IMAGE" data-port-direction="OUTPUT" />
      </div>

      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
        IMAGE
      </div>

      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
        {node.data.label ?? 'Image'}
      </div>

      {/* 이미지 미리보기 또는 업로드 버튼 */}
      {node.data.src ? (
        <div style={{ position: 'relative' }}>
          <img
            src={node.data.src}
            alt="Node image"
            style={{
              width: '100%',
              maxHeight: '180px',
              objectFit: 'contain',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
          <button
            onClick={() => onUpdate?.({ src: null })}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              padding: '2px 6px',
              fontSize: '11px',
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            height: '120px',
            border: '2px dashed rgba(34,197,94,0.3)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#94a3b8',
            background: 'rgba(34,197,94,0.05)',
          }}
        >
          이미지 업로드
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* 출력 포트 */}
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
        <div
          data-testid="output-port-IMAGE"
          title="Image Output"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#4ade80',
            border: '2px solid #16a34a',
            cursor: 'crosshair',
          }}
        />
      </div>
    </div>
  )
}
