// Toolbar 컴포넌트 테스트
// TDD RED 단계: 툴바 동작 정의

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Toolbar } from './Toolbar'
import { NodeType } from '../../types/nodes'

describe('Toolbar', () => {
  it('툴바 컴포넌트 렌더링', () => {
    render(
      <Toolbar
        mode="select"
        onModeChange={vi.fn()}
        onAddNode={vi.fn()}
      />
    )
    // 기본 툴 버튼들 존재
    expect(screen.getByTitle(/선택/i)).toBeDefined()
    expect(screen.getByTitle(/패닝/i)).toBeDefined()
  })

  it('SELECT 모드 전환', () => {
    const onModeChange = vi.fn()
    render(
      <Toolbar
        mode="pan"
        onModeChange={onModeChange}
        onAddNode={vi.fn()}
      />
    )
    const selectBtn = screen.getByTitle(/선택/i)
    fireEvent.click(selectBtn)
    expect(onModeChange).toHaveBeenCalledWith('select')
  })

  it('PAN 모드 전환', () => {
    const onModeChange = vi.fn()
    render(
      <Toolbar
        mode="select"
        onModeChange={onModeChange}
        onAddNode={vi.fn()}
      />
    )
    const panBtn = screen.getByTitle(/패닝/i)
    fireEvent.click(panBtn)
    expect(onModeChange).toHaveBeenCalledWith('pan')
  })

  it('Text 노드 추가 버튼', () => {
    const onAddNode = vi.fn()
    render(
      <Toolbar
        mode="select"
        onModeChange={vi.fn()}
        onAddNode={onAddNode}
      />
    )
    const textBtn = screen.getByTitle(/텍스트 노드/i)
    fireEvent.click(textBtn)
    expect(onAddNode).toHaveBeenCalledWith(NodeType.TEXT)
  })

  it('AI Assistant 노드 추가 버튼', () => {
    const onAddNode = vi.fn()
    render(
      <Toolbar
        mode="select"
        onModeChange={vi.fn()}
        onAddNode={onAddNode}
      />
    )
    const aiBtn = screen.getByTitle(/어시스턴트/i)
    fireEvent.click(aiBtn)
    expect(onAddNode).toHaveBeenCalledWith(NodeType.ASSISTANT)
  })

  it('현재 활성 모드 강조 표시', () => {
    const { rerender } = render(
      <Toolbar
        mode="select"
        onModeChange={vi.fn()}
        onAddNode={vi.fn()}
      />
    )
    const selectBtn = screen.getByTitle(/선택/i)
    // 활성화된 버튼에 aria-pressed 또는 data-active 속성
    expect(selectBtn.getAttribute('aria-pressed')).toBe('true')

    rerender(
      <Toolbar
        mode="pan"
        onModeChange={vi.fn()}
        onAddNode={vi.fn()}
      />
    )
    const panBtn = screen.getByTitle(/패닝/i)
    expect(panBtn.getAttribute('aria-pressed')).toBe('true')
  })
})
