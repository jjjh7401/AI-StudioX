// 줌 컨트롤 컴포넌트
// +/- 버튼 및 현재 줌 레벨 표시

import { type UseCanvasReturn } from '../../hooks/useCanvas'

interface ZoomControlsProps {
  canvasState: UseCanvasReturn
  className?: string
}

export function ZoomControls({ canvasState, className }: ZoomControlsProps) {
  const { transform, zoomIn, zoomOut, resetTransform } = canvasState
  const zoomPercent = Math.round(transform.scale * 100)

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(30, 30, 50, 0.9)',
        borderRadius: '8px',
        padding: '4px 8px',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <button
        onClick={zoomOut}
        aria-label="Zoom out"
        style={buttonStyle}
        title="줌 아웃 (-)"
      >
        −
      </button>

      <button
        onClick={resetTransform}
        aria-label="Reset zoom"
        style={{ ...buttonStyle, minWidth: '52px', fontSize: '12px' }}
        title="줌 초기화"
      >
        {zoomPercent}%
      </button>

      <button
        onClick={zoomIn}
        aria-label="Zoom in"
        style={buttonStyle}
        title="줌 인 (+)"
      >
        +
      </button>
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.8)',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: 1,
  transition: 'background 0.15s',
}
