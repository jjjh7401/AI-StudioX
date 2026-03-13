// AI 어시스턴트 노드 - 텍스트/이미지 프롬프트 처리
import type { AssistantNode as AssistantNodeType } from '../../../types/nodes'

interface AssistantNodeProps {
  node: AssistantNodeType
  onUpdate?: (data: Partial<AssistantNodeType['data']>) => void
  isSelected?: boolean
}

export function AssistantNode({ node, onUpdate, isSelected }: AssistantNodeProps) {
  return (
    <div
      data-testid="assistant-node"
      data-node-id={node.id}
      style={{
        background: '#1e1e3a',
        border: `2px solid ${isSelected ? '#6366f1' : 'rgba(139,92,246,0.4)'}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '240px',
        color: '#e2e8f0',
      }}
    >
      {/* 포트 메타데이터 */}
      <div data-testid="assistant-node-ports" style={{ display: 'none' }}>
        <span data-port="text-in" data-port-type="TEXT" data-port-direction="INPUT" />
        <span data-port="image-in" data-port-type="IMAGE" data-port-direction="INPUT" />
        <span data-port="text-out" data-port-type="TEXT" data-port-direction="OUTPUT" />
      </div>

      <div style={{ fontSize: '11px', color: '#a78bfa', marginBottom: '4px' }}>
        ASSISTANT
      </div>

      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
        AI Assistant
      </div>

      {/* 입력 포트 표시 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div data-testid="input-port-TEXT" title="Text Input"
          style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
        <div data-testid="input-port-IMAGE" title="Image Input"
          style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', border: '2px solid #16a34a', cursor: 'crosshair' }} />
      </div>

      <textarea
        value={node.data.prompt}
        onChange={(e) => onUpdate?.({ prompt: e.target.value })}
        placeholder="프롬프트를 입력하세요..."
        rows={3}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px', color: '#e2e8f0', padding: '6px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <button
          onClick={() => onUpdate?.({ isRunning: !node.data.isRunning })}
          disabled={node.data.isRunning}
          style={{
            background: node.data.isRunning ? '#6b21a8' : '#7c3aed',
            border: 'none', borderRadius: '4px', color: '#fff', cursor: node.data.isRunning ? 'wait' : 'pointer',
            padding: '4px 12px', fontSize: '12px',
          }}
        >
          {node.data.isRunning ? '실행 중...' : '실행'}
        </button>
        <div data-testid="output-port-TEXT" title="Text Output"
          style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8', border: '2px solid #4f46e5', cursor: 'crosshair' }} />
      </div>

      {node.data.result && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8', padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
          {node.data.result}
        </div>
      )}
    </div>
  )
}
