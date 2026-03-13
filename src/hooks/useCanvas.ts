// 무한 캔버스 D3 zoom 훅
// D3 zoom 동작을 useRef로 격리하고 React 상태로 변환 정보 노출

import { useRef, useState, useCallback } from 'react'
import type { RefObject } from 'react'
import * as d3 from 'd3'
import type { CanvasTransform } from '../types/project'

// 캔버스 스케일 경계값
const MIN_SCALE = 0.1
const MAX_SCALE = 10
const ZOOM_STEP = 1.2 // 줌 인/아웃 한 단계 배율

export interface UseCanvasReturn {
  /** SVG 엘리먼트 참조 (D3 zoom 연결용) */
  svgRef: RefObject<SVGSVGElement | null>
  /** 현재 캔버스 변환 상태 */
  transform: CanvasTransform
  /** 줌 초기화 */
  resetTransform: () => void
  /** 줌 인 (ZOOM_STEP 배율로) */
  zoomIn: () => void
  /** 줌 아웃 (ZOOM_STEP 배율로) */
  zoomOut: () => void
  /** 특정 스케일로 줌 */
  zoomTo: (scale: number) => void
}

export function useCanvas(): UseCanvasReturn {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 })

  // D3 zoom 인스턴스를 useRef로 격리 (React 렌더 사이클과 분리)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  const getZoomBehavior = useCallback(() => {
    if (!zoomBehaviorRef.current) {
      zoomBehaviorRef.current = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([MIN_SCALE, MAX_SCALE])
        .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
          const { x, y, k } = event.transform
          setTransform({ x, y, scale: k })
        })
    }
    return zoomBehaviorRef.current
  }, [])

  const resetTransform = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 })
    if (svgRef.current) {
      const zoom = getZoomBehavior()
      d3.select(svgRef.current).call(zoom.transform, d3.zoomIdentity)
    }
  }, [getZoomBehavior])

  const zoomIn = useCallback(() => {
    setTransform((prev) => {
      const newScale = Math.min(prev.scale * ZOOM_STEP, MAX_SCALE)
      if (svgRef.current) {
        const zoom = getZoomBehavior()
        d3.select(svgRef.current).call(zoom.scaleTo, newScale)
      }
      return { ...prev, scale: newScale }
    })
  }, [getZoomBehavior])

  const zoomOut = useCallback(() => {
    setTransform((prev) => {
      const newScale = Math.max(prev.scale / ZOOM_STEP, MIN_SCALE)
      if (svgRef.current) {
        const zoom = getZoomBehavior()
        d3.select(svgRef.current).call(zoom.scaleTo, newScale)
      }
      return { ...prev, scale: newScale }
    })
  }, [getZoomBehavior])

  const zoomTo = useCallback(
    (scale: number) => {
      const clampedScale = Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE)
      setTransform((prev) => {
        if (svgRef.current) {
          const zoom = getZoomBehavior()
          d3.select(svgRef.current).call(zoom.scaleTo, clampedScale)
        }
        return { ...prev, scale: clampedScale }
      })
    },
    [getZoomBehavior],
  )

  return {
    svgRef,
    transform,
    resetTransform,
    zoomIn,
    zoomOut,
    zoomTo,
  }
}
