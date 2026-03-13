// 노드 선택 상태 관리 훅
import { useState, useCallback } from 'react'

export interface UseSelectionReturn {
  selectedIds: Set<string>
  selectNode: (id: string, multi?: boolean) => void
  selectMultiple: (ids: string[]) => void
  toggleNode: (id: string) => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
}

export function useSelection(): UseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const selectNode = useCallback((id: string, multi = false) => {
    setSelectedIds((prev) => {
      if (multi) {
        // 멀티 선택: 기존 선택에 추가
        const next = new Set(prev)
        next.add(id)
        return next
      }
      // 단일 선택: 이전 선택 초기화
      return new Set([id])
    })
  }, [])

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const toggleNode = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  )

  return { selectedIds, selectNode, selectMultiple, toggleNode, clearSelection, isSelected }
}
