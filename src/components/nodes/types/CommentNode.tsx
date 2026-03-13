// 주석/스티커 노트 노드 컴포넌트
import type { CommentNode as CommentNodeType } from '../../../types/nodes'

interface CommentNodeProps {
  node: CommentNodeType
  onUpdate?: (data: Partial<CommentNodeType['data']>) => void
  isSelected?: boolean
}

const COMMENT_COLORS = ['#fff9c4', '#f8d7da', '#d4edda', '#d1ecf1', '#e2d9f3']

export function CommentNode({ node, onUpdate, isSelected }: CommentNodeProps) {
  return (
    <div
      data-testid="comment-node"
      data-node-id={node.id}
      style={{
        background: node.data.color,
        border: `2px solid ${isSelected ? '#6366f1' : 'rgba(0,0,0,0.15)'}`,
        borderRadius: '4px',
        padding: '12px',
        minWidth: '200px',
        minHeight: '120px',
        color: '#1a1a2e',
        userSelect: 'none',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      {/* 색상 선택 */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {COMMENT_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onUpdate?.({ color })}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: color,
              border: node.data.color === color ? '2px solid #333' : '1px solid rgba(0,0,0,0.2)',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>

      <textarea
        value={node.data.text}
        onChange={(e) => onUpdate?.({ text: e.target.value })}
        placeholder="메모를 입력하세요..."
        rows={4}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: '#1a1a2e',
          padding: '4px',
          fontSize: '13px',
          resize: 'vertical',
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
