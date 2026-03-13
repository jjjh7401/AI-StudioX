// ConnectionComponent 테스트
// TDD RED 단계: SVG 연결선 컴포넌트 동작 정의

import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ConnectionComponent } from './ConnectionComponent'
import { PortDataType } from '../../types/connections'
import type { Connection } from '../../types/connections'
import type { BaseNode } from '../../types/nodes'
import { NodeType } from '../../types/nodes'

const makeNode = (id: string, x: number, y: number): BaseNode => ({
  id,
  type: NodeType.TEXT,
  position: { x, y },
  data: {},
})

const makeConn = (): Connection => ({
  id: 'conn-1',
  sourceNodeId: 'node-a',
  sourcePort: 'output',
  targetNodeId: 'node-b',
  targetPort: 'input',
  dataType: PortDataType.TEXT,
})

describe('ConnectionComponent', () => {
  it('SVG path 요소를 렌더링한다', () => {
    const { container } = render(
      <svg>
        <ConnectionComponent
          connection={makeConn()}
          nodes={[makeNode('node-a', 100, 100), makeNode('node-b', 300, 200)]}
          onDelete={vi.fn()}
        />
      </svg>,
    )
    const path = container.querySelector('path')
    expect(path).not.toBeNull()
  })

  it('클릭 시 onDelete 콜백 호출', () => {
    const onDelete = vi.fn()
    const { container } = render(
      <svg>
        <ConnectionComponent
          connection={makeConn()}
          nodes={[makeNode('node-a', 100, 100), makeNode('node-b', 300, 200)]}
          onDelete={onDelete}
        />
      </svg>,
    )
    const path = container.querySelector('path')
    expect(path).not.toBeNull()
    if (path) fireEvent.click(path)
    expect(onDelete).toHaveBeenCalledWith('conn-1')
  })

  it('소스/타겟 노드가 없어도 렌더링 안 해도 됨 (null 반환)', () => {
    const { container } = render(
      <svg>
        <ConnectionComponent
          connection={makeConn()}
          nodes={[makeNode('node-a', 100, 100)]} // node-b 없음
          onDelete={vi.fn()}
        />
      </svg>,
    )
    // path가 없거나, 렌더링이 없어야 함
    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(0)
  })
})
