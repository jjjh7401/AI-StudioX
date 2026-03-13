import { describe, it, expect } from 'vitest'
import { isCompatible, hasCyclic } from './connectionValidator'
import { PortDataType, type Connection } from '../types/connections'

// ==================== isCompatible 테스트 ====================
describe('isCompatible', () => {
  // TEXT 소스 호환성 테스트
  it('TEXT -> TEXT should be compatible', () => {
    expect(isCompatible(PortDataType.TEXT, PortDataType.TEXT)).toBe(true)
  })

  it('TEXT -> ASSISTANT should be compatible', () => {
    expect(isCompatible(PortDataType.TEXT, PortDataType.ASSISTANT)).toBe(true)
  })

  it('TEXT -> MODEL should be compatible', () => {
    expect(isCompatible(PortDataType.TEXT, PortDataType.MODEL)).toBe(true)
  })

  it('TEXT -> STORYBOARD should be compatible', () => {
    expect(isCompatible(PortDataType.TEXT, PortDataType.STORYBOARD)).toBe(true)
  })

  it('TEXT -> SCRIPT should be compatible', () => {
    expect(isCompatible(PortDataType.TEXT, PortDataType.SCRIPT)).toBe(true)
  })

  // IMAGE 소스 호환성 테스트
  it('IMAGE -> IMAGE should be compatible', () => {
    expect(isCompatible(PortDataType.IMAGE, PortDataType.IMAGE)).toBe(true)
  })

  it('IMAGE -> ASSISTANT should be compatible', () => {
    expect(isCompatible(PortDataType.IMAGE, PortDataType.ASSISTANT)).toBe(true)
  })

  it('IMAGE -> VIDEO should be compatible', () => {
    expect(isCompatible(PortDataType.IMAGE, PortDataType.VIDEO)).toBe(true)
  })

  it('IMAGE -> COMPOSITE should be compatible', () => {
    expect(isCompatible(PortDataType.IMAGE, PortDataType.COMPOSITE)).toBe(true)
  })

  it('IMAGE -> STITCH should be compatible', () => {
    expect(isCompatible(PortDataType.IMAGE, PortDataType.STITCH)).toBe(true)
  })

  // VIDEO 소스 호환성 테스트
  it('VIDEO -> VIDEO should be compatible', () => {
    expect(isCompatible(PortDataType.VIDEO, PortDataType.VIDEO)).toBe(true)
  })

  it('VIDEO -> TEXT should NOT be compatible', () => {
    expect(isCompatible(PortDataType.VIDEO, PortDataType.TEXT)).toBe(false)
  })

  it('VIDEO -> IMAGE should NOT be compatible', () => {
    expect(isCompatible(PortDataType.VIDEO, PortDataType.IMAGE)).toBe(false)
  })

  // ARRAY 소스 호환성 테스트
  it('ARRAY -> ARRAY should be compatible', () => {
    expect(isCompatible(PortDataType.ARRAY, PortDataType.ARRAY)).toBe(true)
  })

  it('ARRAY -> LIST should be compatible', () => {
    expect(isCompatible(PortDataType.ARRAY, PortDataType.LIST)).toBe(true)
  })

  it('ARRAY -> COMPOSITE should be compatible', () => {
    expect(isCompatible(PortDataType.ARRAY, PortDataType.COMPOSITE)).toBe(true)
  })

  it('ARRAY -> STITCH should be compatible', () => {
    expect(isCompatible(PortDataType.ARRAY, PortDataType.STITCH)).toBe(true)
  })

  // ANY 타입 호환성 테스트
  it('ANY -> TEXT should be compatible', () => {
    expect(isCompatible(PortDataType.ANY, PortDataType.TEXT)).toBe(true)
  })

  it('ANY -> IMAGE should be compatible', () => {
    expect(isCompatible(PortDataType.ANY, PortDataType.IMAGE)).toBe(true)
  })

  it('TEXT -> VIDEO should NOT be compatible', () => {
    expect(isCompatible(PortDataType.TEXT, PortDataType.VIDEO)).toBe(false)
  })

  it('IMAGE -> TEXT should NOT be compatible', () => {
    expect(isCompatible(PortDataType.IMAGE, PortDataType.TEXT)).toBe(false)
  })
})

// ==================== hasCyclic 테스트 ====================
describe('hasCyclic', () => {
  it('should return false when there are no connections', () => {
    const connections: Connection[] = []
    const newConn: Connection = {
      id: 'conn-new',
      sourceNodeId: 'A',
      sourcePort: 'out',
      targetNodeId: 'B',
      targetPort: 'in',
      dataType: PortDataType.TEXT,
    }
    expect(hasCyclic(connections, newConn)).toBe(false)
  })

  it('should detect direct cycle (A -> B -> A)', () => {
    const connections: Connection[] = [
      {
        id: 'conn-1',
        sourceNodeId: 'A',
        sourcePort: 'out',
        targetNodeId: 'B',
        targetPort: 'in',
        dataType: PortDataType.TEXT,
      },
    ]
    const newConn: Connection = {
      id: 'conn-new',
      sourceNodeId: 'B',
      sourcePort: 'out',
      targetNodeId: 'A',
      targetPort: 'in',
      dataType: PortDataType.TEXT,
    }
    expect(hasCyclic(connections, newConn)).toBe(true)
  })

  it('should detect indirect cycle (A -> B -> C -> A)', () => {
    const connections: Connection[] = [
      {
        id: 'conn-1',
        sourceNodeId: 'A',
        sourcePort: 'out',
        targetNodeId: 'B',
        targetPort: 'in',
        dataType: PortDataType.TEXT,
      },
      {
        id: 'conn-2',
        sourceNodeId: 'B',
        sourcePort: 'out',
        targetNodeId: 'C',
        targetPort: 'in',
        dataType: PortDataType.TEXT,
      },
    ]
    const newConn: Connection = {
      id: 'conn-new',
      sourceNodeId: 'C',
      sourcePort: 'out',
      targetNodeId: 'A',
      targetPort: 'in',
      dataType: PortDataType.TEXT,
    }
    expect(hasCyclic(connections, newConn)).toBe(true)
  })

  it('should return false for valid linear chain (A -> B -> C)', () => {
    const connections: Connection[] = [
      {
        id: 'conn-1',
        sourceNodeId: 'A',
        sourcePort: 'out',
        targetNodeId: 'B',
        targetPort: 'in',
        dataType: PortDataType.TEXT,
      },
    ]
    const newConn: Connection = {
      id: 'conn-new',
      sourceNodeId: 'B',
      sourcePort: 'out',
      targetNodeId: 'C',
      targetPort: 'in',
      dataType: PortDataType.TEXT,
    }
    expect(hasCyclic(connections, newConn)).toBe(false)
  })

  it('should return false for branching connections (A -> B, A -> C)', () => {
    const connections: Connection[] = [
      {
        id: 'conn-1',
        sourceNodeId: 'A',
        sourcePort: 'out',
        targetNodeId: 'B',
        targetPort: 'in',
        dataType: PortDataType.TEXT,
      },
    ]
    const newConn: Connection = {
      id: 'conn-new',
      sourceNodeId: 'A',
      sourcePort: 'out',
      targetNodeId: 'C',
      targetPort: 'in',
      dataType: PortDataType.TEXT,
    }
    expect(hasCyclic(connections, newConn)).toBe(false)
  })

  it('should detect self-loop (A -> A)', () => {
    const connections: Connection[] = []
    const newConn: Connection = {
      id: 'conn-new',
      sourceNodeId: 'A',
      sourcePort: 'out',
      targetNodeId: 'A',
      targetPort: 'in',
      dataType: PortDataType.TEXT,
    }
    expect(hasCyclic(connections, newConn)).toBe(true)
  })
})
