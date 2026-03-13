import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNodes } from './useNodes'
import { NodeType } from '../types/nodes'

describe('useNodes', () => {
  it('should initialize with empty nodes array', () => {
    const { result } = renderHook(() => useNodes())
    expect(result.current.nodes).toEqual([])
  })

  it('should addNode with given type and position', () => {
    const { result } = renderHook(() => useNodes())
    act(() => {
      result.current.addNode(NodeType.TEXT, { x: 100, y: 200 })
    })
    expect(result.current.nodes).toHaveLength(1)
    expect(result.current.nodes[0]?.type).toBe(NodeType.TEXT)
    expect(result.current.nodes[0]?.position.x).toBe(100)
    expect(result.current.nodes[0]?.position.y).toBe(200)
  })

  it('should generate unique id for each added node', () => {
    const { result } = renderHook(() => useNodes())
    act(() => {
      result.current.addNode(NodeType.TEXT, { x: 0, y: 0 })
      result.current.addNode(NodeType.IMAGE, { x: 50, y: 50 })
    })
    const ids = result.current.nodes.map((n) => n.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('should removeNode by id', () => {
    const { result } = renderHook(() => useNodes())
    let nodeId = ''
    act(() => {
      result.current.addNode(NodeType.TEXT, { x: 0, y: 0 })
    })
    nodeId = result.current.nodes[0]!.id
    act(() => {
      result.current.removeNode(nodeId)
    })
    expect(result.current.nodes).toHaveLength(0)
  })

  it('should updateNode data by id', () => {
    const { result } = renderHook(() => useNodes())
    act(() => {
      result.current.addNode(NodeType.TEXT, { x: 0, y: 0 })
    })
    const nodeId = result.current.nodes[0]!.id
    act(() => {
      result.current.updateNode(nodeId, { text: 'Updated text' })
    })
    expect(result.current.nodes[0]?.data).toMatchObject({ text: 'Updated text' })
  })

  it('should moveNode position by id', () => {
    const { result } = renderHook(() => useNodes())
    act(() => {
      result.current.addNode(NodeType.TEXT, { x: 0, y: 0 })
    })
    const nodeId = result.current.nodes[0]!.id
    act(() => {
      result.current.moveNode(nodeId, { x: 300, y: 400 })
    })
    expect(result.current.nodes[0]?.position).toEqual({ x: 300, y: 400 })
  })

  it('should not fail when removing non-existent node', () => {
    const { result } = renderHook(() => useNodes())
    expect(() => {
      act(() => {
        result.current.removeNode('non-existent-id')
      })
    }).not.toThrow()
  })

  it('should maintain immutability when updating', () => {
    const { result } = renderHook(() => useNodes())
    act(() => {
      result.current.addNode(NodeType.TEXT, { x: 0, y: 0 })
    })
    const nodeId = result.current.nodes[0]!.id
    const beforeUpdate = result.current.nodes
    act(() => {
      result.current.updateNode(nodeId, { text: 'New text' })
    })
    // useImmer로 불변성 보장 확인
    expect(result.current.nodes).not.toBe(beforeUpdate)
  })
})
