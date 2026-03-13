import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

function fireKeydown(key: string, ctrlKey = false) {
  const event = new KeyboardEvent('keydown', {
    key,
    ctrlKey,
    bubbles: true,
  })
  document.dispatchEvent(event)
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with SELECT mode', () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts({
        onAddComment: vi.fn(),
        onCopy: vi.fn(),
        onPaste: vi.fn(),
        onSave: vi.fn(),
        onDelete: vi.fn(),
      }),
    )
    expect(result.current.mode).toBe('select')
  })

  it('should switch to pan mode on H key', () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts({
        onAddComment: vi.fn(),
        onCopy: vi.fn(),
        onPaste: vi.fn(),
        onSave: vi.fn(),
        onDelete: vi.fn(),
      }),
    )
    act(() => {
      fireKeydown('h')
    })
    expect(result.current.mode).toBe('pan')
  })

  it('should switch to select mode on V key', () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts({
        onAddComment: vi.fn(),
        onCopy: vi.fn(),
        onPaste: vi.fn(),
        onSave: vi.fn(),
        onDelete: vi.fn(),
      }),
    )
    act(() => {
      fireKeydown('h') // 먼저 pan 모드로
      fireKeydown('v') // 다시 select 모드로
    })
    expect(result.current.mode).toBe('select')
  })

  it('should call onAddComment on C key', () => {
    const onAddComment = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts({
        onAddComment,
        onCopy: vi.fn(),
        onPaste: vi.fn(),
        onSave: vi.fn(),
        onDelete: vi.fn(),
      }),
    )
    act(() => {
      fireKeydown('c')
    })
    expect(onAddComment).toHaveBeenCalledOnce()
  })

  it('should call onCopy on Ctrl+C', () => {
    const onCopy = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts({
        onAddComment: vi.fn(),
        onCopy,
        onPaste: vi.fn(),
        onSave: vi.fn(),
        onDelete: vi.fn(),
      }),
    )
    act(() => {
      fireKeydown('c', true)
    })
    expect(onCopy).toHaveBeenCalledOnce()
  })

  it('should call onPaste on Ctrl+V', () => {
    const onPaste = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts({
        onAddComment: vi.fn(),
        onCopy: vi.fn(),
        onPaste,
        onSave: vi.fn(),
        onDelete: vi.fn(),
      }),
    )
    act(() => {
      fireKeydown('v', true)
    })
    expect(onPaste).toHaveBeenCalledOnce()
  })

  it('should call onSave on Ctrl+S', () => {
    const onSave = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts({
        onAddComment: vi.fn(),
        onCopy: vi.fn(),
        onPaste: vi.fn(),
        onSave,
        onDelete: vi.fn(),
      }),
    )
    act(() => {
      fireKeydown('s', true)
    })
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('should call onDelete on Delete/Backspace key', () => {
    const onDelete = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts({
        onAddComment: vi.fn(),
        onCopy: vi.fn(),
        onPaste: vi.fn(),
        onSave: vi.fn(),
        onDelete,
      }),
    )
    act(() => {
      fireKeydown('Delete')
    })
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
