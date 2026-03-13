// 텍스트 입력 노드 컴포넌트
import type { TextNode as TextNodeType } from '../../../types/nodes'

interface TextNodeProps {
  node: TextNodeType
  onUpdate?: (data: Partial<TextNodeType['data']>) => void
  isSelected?: boolean
}

export function TextNode({ node, onUpdate, isSelected }: TextNodeProps) {
  return (
    <div
      data-testid="text-node"
      data-node-id={node.id}
      style={{
        background: '#1e2a4a',
        border: `2px solid ${isSelected ? '#6366f1' : 'rgba(99,102,241,0.3)'}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '200px',
        color: '#e2e8f0',
        userSelect: 'none',
      }}
    >
      {/* 입력 포트 */}
      <div data-testid="text-node-ports" style={{ display: 'none' }}>
        <span data-port="text-out" data-port-type="TEXT" data-port-direction="OUTPUT" />
      </div>

      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
        TEXT
      </div>

      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
        {node.data.label ?? 'Text Input'}
      </div>

      <textarea
        value={node.data.text}
        onChange={(e) => onUpdate?.({ text: e.target.value })}
        placeholder="텍스트를 입력하세요..."
        rows={3}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          color: '#e2e8f0',
          padding: '6px',
          fontSize: '12px',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />

      {/* 출력 포트 표시 */}
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
        <div
          data-testid="output-port-TEXT"
          title="Text Output"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#818cf8',
            border: '2px solid #4f46e5',
            cursor: 'crosshair',
          }}
        />
      </div>
    </div>
  )
}
