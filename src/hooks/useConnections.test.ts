// useConnections 훅 테스트
// TDD RED 단계: 연결 관리 훅의 예상 동작 정의

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useConnections } from './useConnections'
import { PortDataType } from '../types/connections'

const makeConn = (
  id: string,
  sourceNodeId: string,
  targetNodeId: string,
  dataType: PortDataType = PortDataType.TEXT,
) => ({
  id,
  sourceNodeId,
  sourcePort: 'output',
  targetNodeId,
  targetPort: 'input',
  dataType,
})

describe('useConnections', () => {
  it('초기 상태는 빈 배열', () => {
    const { result } = renderHook(() => useConnections())
    expect(result.current.connections).toEqual([])
  })

  it('호환되는 연결 추가 성공', () => {
    const { result } = renderHook(() => useConnections())
    const conn = makeConn('c1', 'node-a', 'node-b', PortDataType.TEXT)

    act(() => {
      const ok = result.current.addConnection(conn)
      expect(ok).toBe(true)
    })
    expect(result.current.connections).toHaveLength(1)
  })

  it('비호환 연결 거부 - IMAGE -> TEXT', () => {
    const { result } = renderHook(() => useConnections())
    // IMAGE는 TEXT 포트에 연결 불가
    const conn = makeConn('c1', 'node-a', 'node-b', PortDataType.IMAGE)
    // targetPort dataType을 TEXT로 설정하려면 addConnection이 sourceDataType/targetDataType을 받아야 함
    // 인터페이스: addConnection(conn, sourceType, targetType)
    act(() => {
      const ok = result.current.addConnection(conn, PortDataType.IMAGE, PortDataType.TEXT)
      expect(ok).toBe(false)
    })
    expect(result.current.connections).toHaveLength(0)
  })

  it('순환 연결 거부', () => {
    const { result } = renderHook(() => useConnections())
    // A -> B -> C -> A 순환
    act(() => {
      result.current.addConnection(makeConn('c1', 'node-a', 'node-b'))
      result.current.addConnection(makeConn('c2', 'node-b', 'node-c'))
    })
    act(() => {
      const ok = result.current.addConnection(makeConn('c3', 'node-c', 'node-a'))
      expect(ok).toBe(false)
    })
    expect(result.current.connections).toHaveLength(2)
  })

  it('연결 삭제', () => {
    const { result } = renderHook(() => useConnections())
    act(() => {
      result.current.addConnection(makeConn('c1', 'node-a', 'node-b'))
    })
    expect(result.current.connections).toHaveLength(1)

    act(() => {
      result.current.removeConnection('c1')
    })
    expect(result.current.connections).toHaveLength(0)
  })

  it('특정 노드의 연결 조회', () => {
    const { result } = renderHook(() => useConnections())
    act(() => {
      result.current.addConnection(makeConn('c1', 'node-a', 'node-b'))
      result.current.addConnection(makeConn('c2', 'node-b', 'node-c'))
      result.current.addConnection(makeConn('c3', 'node-x', 'node-y'))
    })

    const connsForB = result.current.getConnectionsForNode('node-b')
    expect(connsForB).toHaveLength(2) // c1(타겟), c2(소스)
  })

  it('데이터 전파 - 연결된 노드에 출력 데이터 전달', () => {
    const { result } = renderHook(() => useConnections())
    act(() => {
      result.current.addConnection(makeConn('c1', 'node-a', 'node-b'))
    })

    let receivedData: unknown = null
    act(() => {
      result.current.propagateData('node-a', { text: 'hello' }, (targetNodeId, data) => {
        if (targetNodeId === 'node-b') {
          receivedData = data
        }
      })
    })
    expect(receivedData).toEqual({ text: 'hello' })
  })

  it('자기 자신으로의 연결 거부', () => {
    const { result } = renderHook(() => useConnections())
    act(() => {
      const ok = result.current.addConnection(makeConn('c1', 'node-a', 'node-a'))
      expect(ok).toBe(false)
    })
    expect(result.current.connections).toHaveLength(0)
  })
})
