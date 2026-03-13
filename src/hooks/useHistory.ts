// 히스토리 상태 관리 훅
// AI 생성 결과물(이미지, 비디오, 텍스트) 히스토리 관리

import { useCallback } from 'react'
import { useImmer } from 'use-immer'

export type HistoryItemType = 'image' | 'video' | 'text'

export interface HistoryItem {
  id: string
  type: HistoryItemType
  thumbnailUrl: string | null
  prompt: string
  nodeId: string
  timestamp: string
}

export interface AddHistoryItemInput {
  type: HistoryItemType
  thumbnailUrl: string | null
  prompt: string
  nodeId: string
}

export interface UseHistoryReturn {
  historyItems: HistoryItem[]
  addHistoryItem: (item: AddHistoryItemInput) => void
  clearHistory: () => void
}

export function useHistory(): UseHistoryReturn {
  const [historyItems, updateHistory] = useImmer<HistoryItem[]>([])

  const addHistoryItem = useCallback(
    (input: AddHistoryItemInput) => {
      const item: HistoryItem = {
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...input,
        timestamp: new Date().toISOString(),
      }
      updateHistory((draft) => {
        // 최신 항목이 맨 앞에 위치
        draft.unshift(item)
      })
    },
    [updateHistory],
  )

  const clearHistory = useCallback(() => {
    updateHistory(() => [])
  }, [updateHistory])

  return { historyItems, addHistoryItem, clearHistory }
}
