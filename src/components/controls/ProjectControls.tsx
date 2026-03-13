// 프로젝트 컨트롤 컴포넌트
// 저장, 새 프로젝트, 이름 편집 버튼 제공

import { useState } from 'react'

export interface ProjectControlsProps {
  projectName: string
  isDirty: boolean
  onSave: () => void
  onNew: () => void
  onNameChange: (name: string) => void
}

export function ProjectControls({
  projectName,
  isDirty,
  onSave,
  onNew,
  onNameChange,
}: ProjectControlsProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(projectName)

  const handleNameSubmit = () => {
    onNameChange(editValue.trim() || '새 프로젝트')
    setEditing(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* 프로젝트 이름 */}
      {editing ? (
        <input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
          autoFocus
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(129,140,248,0.5)',
            color: '#e2e8f0',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '13px',
            width: '140px',
          }}
        />
      ) : (
        <span
          onClick={() => { setEditing(true); setEditValue(projectName) }}
          style={{
            color: '#94a3b8',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '4px',
            maxWidth: '160px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title="클릭하여 이름 변경"
        >
          {projectName}
          {isDirty && <span style={{ color: '#f59e0b', marginLeft: '4px' }}>●</span>}
        </span>
      )}

      {/* 저장 버튼 */}
      <button
        onClick={onSave}
        title="프로젝트 저장 (Ctrl+S)"
        style={{
          background: isDirty ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isDirty ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.1)'}`,
          color: isDirty ? '#818cf8' : '#64748b',
          borderRadius: '5px',
          padding: '3px 8px',
          fontSize: '11px',
          cursor: 'pointer',
        }}
      >
        저장
      </button>

      {/* 새 프로젝트 버튼 */}
      <button
        onClick={onNew}
        title="새 프로젝트"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#64748b',
          borderRadius: '5px',
          padding: '3px 8px',
          fontSize: '11px',
          cursor: 'pointer',
        }}
      >
        새 프로젝트
      </button>
    </div>
  )
}
