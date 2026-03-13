// HistoryPanel 컴포넌트 테스트
// TDD RED 단계: 히스토리 패널 동작 정의

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HistoryPanel } from './HistoryPanel'
import type { HistoryItem } from '../../hooks/useHistory'

const makeItems = (): HistoryItem[] => [
  {
    id: 'h1',
    type: 'image',
    thumbnailUrl: 'data:image/png;base64,abc',
    prompt: 'A sunset',
    nodeId: 'n1',
    timestamp: '2026-01-01T00:00:00Z',
  },
  {
    id: 'h2',
    type: 'text',
    thumbnailUrl: null,
    prompt: 'Write a poem',
    nodeId: 'n2',
    timestamp: '2026-01-01T01:00:00Z',
  },
]

describe('HistoryPanel', () => {
  it('히스토리 아이템 렌더링', () => {
    render(
      <HistoryPanel
        items={makeItems()}
        onClear={vi.fn()}
      />
    )
    expect(screen.getByText('A sunset')).toBeDefined()
    expect(screen.getByText('Write a poem')).toBeDefined()
  })

  it('아이템 없을 때 빈 상태 표시', () => {
    render(
      <HistoryPanel
        items={[]}
        onClear={vi.fn()}
      />
    )
    expect(screen.getByText(/히스토리/i)).toBeDefined()
  })

  it('Clear 버튼 클릭 시 onClear 호출', () => {
    const onClear = vi.fn()
    render(
      <HistoryPanel
        items={makeItems()}
        onClear={onClear}
      />
    )
    // 전체 삭제 버튼
    const clearBtn = screen.getByTitle(/전체 삭제/i)
    fireEvent.click(clearBtn)
    expect(onClear).toHaveBeenCalled()
  })

  it('이미지 타입 아이템에 썸네일 표시', () => {
    const { container } = render(
      <HistoryPanel
        items={makeItems()}
        onClear={vi.fn()}
      />
    )
    const imgs = container.querySelectorAll('img')
    // 썸네일이 있는 이미지 타입 아이템
    expect(imgs.length).toBeGreaterThan(0)
  })
})
