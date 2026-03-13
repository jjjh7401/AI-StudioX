// 키보드 단축키 훅
// 캔버스 모드 전환 및 주요 작업 단축키 처리

import { useState, useEffect, useCallback } from 'react'

export type CanvasMode = 'select' | 'pan' | 'comment'

export interface KeyboardShortcutHandlers {
  onAddComment: () => void
  onCopy: () => void
  onPaste: () => void
  onSave: () => void
  onDelete: () => void
  onBypass?: () => void
}

export interface UseKeyboardShortcutsReturn {
  mode: CanvasMode
  setMode: (mode: CanvasMode) => void
}

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
): UseKeyboardShortcutsReturn {
  const [mode, setMode] = useState<CanvasMode>('select')

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 텍스트 입력 중에는 단축키 무시 (textarea, input 포커스)
      const target = e.target as HTMLElement
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
        // Ctrl 키 조합은 입력 중에도 처리
        if (!e.ctrlKey && !e.metaKey) return
      }

      const key = e.key.toLowerCase()

      // Ctrl/Meta 조합 단축키 처리
      if (e.ctrlKey || e.metaKey) {
        switch (key) {
          case 'c':
            e.preventDefault()
            handlers.onCopy()
            return
          case 'v':
            e.preventDefault()
            handlers.onPaste()
            return
          case 's':
            e.preventDefault()
            handlers.onSave()
            return
          case 'b':
            e.preventDefault()
            handlers.onBypass?.()
            return
        }
        return
      }

      // 단일 키 단축키 처리
      switch (key) {
        case 'v':
          setMode('select')
          break
        case 'h':
          setMode('pan')
          break
        case 'c':
          handlers.onAddComment()
          break
        case 'delete':
        case 'backspace':
          handlers.onDelete()
          break
        case 'escape':
          setMode('select')
          break
      }
    },
    [handlers],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return { mode, setMode }
}
