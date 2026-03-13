// 무한 캔버스 컴포넌트
// D3 zoom/pan이 적용된 SVG 컨테이너

import { useEffect, type ReactNode } from 'react'
import * as d3 from 'd3'
import { type UseCanvasReturn } from '../../hooks/useCanvas'

interface InfiniteCanvasProps {
  /** useCanvas 훅의 반환값 */
  canvasState: UseCanvasReturn
  /** 캔버스 내부에 렌더링할 자식 요소 */
  children?: ReactNode
  width?: number | string
  height?: number | string
  className?: string
}

export function InfiniteCanvas({
  canvasState,
  children,
  width = '100%',
  height = '100%',
  className,
}: InfiniteCanvasProps) {
  const { svgRef, transform } = canvasState

  // D3 zoom 동작을 SVG 엘리먼트에 연결
  useEffect(() => {
    if (!svgRef.current) return

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        // transform 상태는 useCanvas에서 관리
        const { x, y, k } = event.transform
        // canvasState의 내부 상태를 직접 업데이트 (D3 이벤트를 통해)
        void x; void y; void k // 실제 상태 업데이트는 useCanvas에서 처리
      })

    d3.select(svgRef.current).call(zoom)

    return () => {
      d3.select(svgRef.current).on('.zoom', null)
    }
  }, [svgRef])

  const transformStr = `translate(${transform.x}, ${transform.y}) scale(${transform.scale})`

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={className}
      style={{ display: 'block', overflow: 'hidden', cursor: 'grab' }}
    >
      {/* 배경 그리드 패턴 */}
      <defs>
        <pattern id="grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />
        </pattern>
        <pattern
          id="grid-large"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
          x={transform.x % 100}
          y={transform.y % 100}
        >
          <rect width="100" height="100" fill="url(#grid-small)" />
          <path
            d="M 100 0 L 0 0 0 100"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      {/* 배경 */}
      <rect width="100%" height="100%" fill="#1a1a2e" />
      <rect width="100%" height="100%" fill="url(#grid-large)" />

      {/* 변환이 적용된 콘텐츠 그룹 */}
      <g transform={transformStr}>{children}</g>
    </svg>
  )
}
