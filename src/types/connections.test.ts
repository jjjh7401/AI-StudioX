import { describe, it, expect } from 'vitest'
import {
  PortDataType,
  COMPATIBILITY_MATRIX,
  type Connection,
} from './connections'

describe('PortDataType enum', () => {
  it('should define all required data types', () => {
    expect(PortDataType.TEXT).toBeDefined()
    expect(PortDataType.IMAGE).toBeDefined()
    expect(PortDataType.VIDEO).toBeDefined()
    expect(PortDataType.ARRAY).toBeDefined()
    expect(PortDataType.ANY).toBeDefined()
    expect(PortDataType.AUDIO).toBeDefined()
  })
})

describe('Connection interface', () => {
  it('should have required fields', () => {
    const conn: Connection = {
      id: 'conn-1',
      sourceNodeId: 'node-1',
      sourcePort: 'output',
      targetNodeId: 'node-2',
      targetPort: 'input',
      dataType: PortDataType.TEXT,
    }
    expect(conn.id).toBe('conn-1')
    expect(conn.sourceNodeId).toBe('node-1')
    expect(conn.targetNodeId).toBe('node-2')
    expect(conn.dataType).toBe(PortDataType.TEXT)
  })
})

describe('COMPATIBILITY_MATRIX', () => {
  it('TEXT should be compatible with TEXT, ASSISTANT, MODEL, STORYBOARD, SCRIPT, VTON, GRID_SHOT', () => {
    const textCompatibles = COMPATIBILITY_MATRIX[PortDataType.TEXT]
    expect(textCompatibles).toContain(PortDataType.TEXT)
    expect(textCompatibles).toContain(PortDataType.ASSISTANT)
    expect(textCompatibles).toContain(PortDataType.MODEL)
    expect(textCompatibles).toContain(PortDataType.STORYBOARD)
    expect(textCompatibles).toContain(PortDataType.SCRIPT)
    expect(textCompatibles).toContain(PortDataType.VTON)
    expect(textCompatibles).toContain(PortDataType.GRID_SHOT)
  })

  it('IMAGE should be compatible with IMAGE, ASSISTANT, VIDEO, VTON, COMPOSITE, STITCH, IMAGE_MODIFY, ARRAY, GRID_EXTRACTOR', () => {
    const imageCompatibles = COMPATIBILITY_MATRIX[PortDataType.IMAGE]
    expect(imageCompatibles).toContain(PortDataType.IMAGE)
    expect(imageCompatibles).toContain(PortDataType.ASSISTANT)
    expect(imageCompatibles).toContain(PortDataType.VIDEO)
    expect(imageCompatibles).toContain(PortDataType.VTON)
    expect(imageCompatibles).toContain(PortDataType.COMPOSITE)
    expect(imageCompatibles).toContain(PortDataType.STITCH)
    expect(imageCompatibles).toContain(PortDataType.IMAGE_MODIFY)
    expect(imageCompatibles).toContain(PortDataType.ARRAY)
    expect(imageCompatibles).toContain(PortDataType.GRID_EXTRACTOR)
  })

  it('VIDEO should be compatible with VIDEO only', () => {
    const videoCompatibles = COMPATIBILITY_MATRIX[PortDataType.VIDEO]
    expect(videoCompatibles).toContain(PortDataType.VIDEO)
    expect(videoCompatibles).not.toContain(PortDataType.TEXT)
    expect(videoCompatibles).not.toContain(PortDataType.IMAGE)
  })

  it('ARRAY should be compatible with ARRAY, LIST, COMPOSITE, STITCH', () => {
    const arrayCompatibles = COMPATIBILITY_MATRIX[PortDataType.ARRAY]
    expect(arrayCompatibles).toContain(PortDataType.ARRAY)
    expect(arrayCompatibles).toContain(PortDataType.LIST)
    expect(arrayCompatibles).toContain(PortDataType.COMPOSITE)
    expect(arrayCompatibles).toContain(PortDataType.STITCH)
  })

  it('ANY should be compatible with all types', () => {
    const anyCompatibles = COMPATIBILITY_MATRIX[PortDataType.ANY]
    expect(anyCompatibles).toContain(PortDataType.TEXT)
    expect(anyCompatibles).toContain(PortDataType.IMAGE)
    expect(anyCompatibles).toContain(PortDataType.VIDEO)
    expect(anyCompatibles).toContain(PortDataType.ARRAY)
    expect(anyCompatibles).toContain(PortDataType.ANY)
  })
})
