import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelection } from './useSelection'

describe('useSelection', () => {
  it('should initialize with no selection', () => {
    const { result } = renderHook(() => useSelection())
    expect(result.current.selectedIds).toEqual(new Set())
  })

  it('should select a single node', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.selectNode('node-1')
    })
    expect(result.current.selectedIds.has('node-1')).toBe(true)
  })

  it('should replace selection when selecting without multi flag', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.selectNode('node-1')
      result.current.selectNode('node-2')
    })
    expect(result.current.selectedIds.has('node-1')).toBe(false)
    expect(result.current.selectedIds.has('node-2')).toBe(true)
  })

  it('should add to selection when multi flag is true', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.selectNode('node-1')
      result.current.selectNode('node-2', true)
    })
    expect(result.current.selectedIds.has('node-1')).toBe(true)
    expect(result.current.selectedIds.has('node-2')).toBe(true)
  })

  it('should deselect all nodes', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.selectNode('node-1')
      result.current.selectNode('node-2', true)
      result.current.clearSelection()
    })
    expect(result.current.selectedIds.size).toBe(0)
  })

  it('should select multiple nodes at once', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.selectMultiple(['node-1', 'node-2', 'node-3'])
    })
    expect(result.current.selectedIds.size).toBe(3)
  })

  it('should toggle node selection', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.toggleNode('node-1')
    })
    expect(result.current.selectedIds.has('node-1')).toBe(true)
    act(() => {
      result.current.toggleNode('node-1')
    })
    expect(result.current.selectedIds.has('node-1')).toBe(false)
  })

  it('should check if node is selected', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.selectNode('node-1')
    })
    expect(result.current.isSelected('node-1')).toBe(true)
    expect(result.current.isSelected('node-2')).toBe(false)
  })
})
