import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvas } from './useCanvas'

describe('useCanvas', () => {
  it('should initialize with default transform values', () => {
    const { result } = renderHook(() => useCanvas())
    expect(result.current.transform.x).toBe(0)
    expect(result.current.transform.y).toBe(0)
    expect(result.current.transform.scale).toBe(1)
  })

  it('should expose svgRef for D3 attachment', () => {
    const { result } = renderHook(() => useCanvas())
    expect(result.current.svgRef).toBeDefined()
  })

  it('should zoomIn increase scale', () => {
    const { result } = renderHook(() => useCanvas())
    const initialScale = result.current.transform.scale
    act(() => {
      result.current.zoomIn()
    })
    expect(result.current.transform.scale).toBeGreaterThan(initialScale)
  })

  it('should zoomOut decrease scale', () => {
    const { result } = renderHook(() => useCanvas())
    act(() => {
      result.current.zoomOut()
    })
    expect(result.current.transform.scale).toBeLessThan(1)
  })

  it('should resetTransform return to default', () => {
    const { result } = renderHook(() => useCanvas())
    act(() => {
      result.current.zoomIn()
      result.current.zoomIn()
    })
    act(() => {
      result.current.resetTransform()
    })
    expect(result.current.transform.x).toBe(0)
    expect(result.current.transform.y).toBe(0)
    expect(result.current.transform.scale).toBe(1)
  })

  it('should zoomTo set specific scale', () => {
    const { result } = renderHook(() => useCanvas())
    act(() => {
      result.current.zoomTo(2.5)
    })
    expect(result.current.transform.scale).toBe(2.5)
  })

  it('should clamp scale within min/max bounds on zoomIn', () => {
    const { result } = renderHook(() => useCanvas())
    // 최대값까지 줌인
    for (let i = 0; i < 20; i++) {
      act(() => {
        result.current.zoomIn()
      })
    }
    expect(result.current.transform.scale).toBeLessThanOrEqual(10)
  })

  it('should clamp scale within min/max bounds on zoomOut', () => {
    const { result } = renderHook(() => useCanvas())
    // 최소값까지 줌아웃
    for (let i = 0; i < 20; i++) {
      act(() => {
        result.current.zoomOut()
      })
    }
    expect(result.current.transform.scale).toBeGreaterThanOrEqual(0.1)
  })
})
