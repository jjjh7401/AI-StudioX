// useHistory 훅 테스트
// TDD RED 단계: 히스토리 상태 관리 동작 정의

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useHistory } from './useHistory'

describe('useHistory', () => {
  it('초기 상태는 빈 배열', () => {
    const { result } = renderHook(() => useHistory())
    expect(result.current.historyItems).toEqual([])
  })

  it('히스토리 아이템 추가', () => {
    const { result } = renderHook(() => useHistory())
    act(() => {
      result.current.addHistoryItem({
        type: 'image',
        thumbnailUrl: 'data:image/png;base64,abc',
        prompt: 'A beautiful cat',
        nodeId: 'node-1',
      })
    })
    expect(result.current.historyItems).toHaveLength(1)
    expect(result.current.historyItems[0].type).toBe('image')
    expect(result.current.historyItems[0].prompt).toBe('A beautiful cat')
  })

  it('히스토리 아이템에 타임스탬프 자동 추가', () => {
    const { result } = renderHook(() => useHistory())
    act(() => {
      result.current.addHistoryItem({
        type: 'text',
        thumbnailUrl: null,
        prompt: 'Write a poem',
        nodeId: 'node-2',
      })
    })
    expect(result.current.historyItems[0].timestamp).toBeDefined()
    expect(typeof result.current.historyItems[0].timestamp).toBe('string')
  })

  it('히스토리 전체 삭제', () => {
    const { result } = renderHook(() => useHistory())
    act(() => {
      result.current.addHistoryItem({ type: 'image', thumbnailUrl: null, prompt: 'p1', nodeId: 'n1' })
      result.current.addHistoryItem({ type: 'text', thumbnailUrl: null, prompt: 'p2', nodeId: 'n2' })
    })
    expect(result.current.historyItems).toHaveLength(2)

    act(() => {
      result.current.clearHistory()
    })
    expect(result.current.historyItems).toHaveLength(0)
  })

  it('여러 아이템 추가 - 최신 항목이 앞에 위치', () => {
    const { result } = renderHook(() => useHistory())
    act(() => {
      result.current.addHistoryItem({ type: 'image', thumbnailUrl: null, prompt: 'first', nodeId: 'n1' })
      result.current.addHistoryItem({ type: 'text', thumbnailUrl: null, prompt: 'second', nodeId: 'n2' })
    })
    expect(result.current.historyItems[0].prompt).toBe('second')
    expect(result.current.historyItems[1].prompt).toBe('first')
  })
})
