// AI-StudioX 메인 애플리케이션
// 무한 캔버스 기반 AI 워크플로우 에디터 - Phase A~G 통합

import { useCallback, useEffect, useState } from 'react'
import { InfiniteCanvas } from './components/canvas/InfiniteCanvas'
import { ZoomControls } from './components/controls/ZoomControls'
import { Toolbar } from './components/controls/Toolbar'
import { ProjectControls } from './components/controls/ProjectControls'
import { HistoryPanel } from './components/panels/HistoryPanel'
import { NodeComponent } from './components/nodes/NodeComponent'
import { ConnectionComponent } from './components/connections/ConnectionComponent'
import { PlaygroundModal } from './components/modals/PlaygroundModal'
import { useCanvas } from './hooks/useCanvas'
import { useNodes } from './hooks/useNodes'
import { useSelection } from './hooks/useSelection'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useConnections } from './hooks/useConnections'
import { useProject } from './hooks/useProject'
import { useHistory } from './hooks/useHistory'
import { NodeType } from './types/nodes'
import type { ToolMode } from './components/controls/Toolbar'

export default function App() {
  const canvasState = useCanvas()
  const { nodes, addNode, removeNode, updateNode, moveNode } = useNodes()
  const { selectedIds, selectNode, clearSelection, isSelected } = useSelection()
  const { connections, removeConnection } = useConnections()
  const {
    currentProject,
    isDirty,
    newProject,
    saveCurrentProject,
    markDirty,
    updateCurrentProject,
  } = useProject()
  const { historyItems, clearHistory } = useHistory()

  const [toolMode, setToolMode] = useState<ToolMode>('select')
  const [showPlayground, setShowPlayground] = useState(false)

  // 앱 시작 시 새 프로젝트 초기화
  useEffect(() => {
    newProject()
  }, [newProject])

  // 페이지 이탈 전 unsaved 경고
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = '저장되지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?'
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleSave = useCallback(async () => {
    // 현재 노드/연결 상태를 프로젝트에 반영
    updateCurrentProject({ nodes, connections })
    await saveCurrentProject()
  }, [nodes, connections, updateCurrentProject, saveCurrentProject])

  const handleAddComment = useCallback(() => {
    addNode(NodeType.COMMENT, {
      x: 200 + Math.random() * 400,
      y: 200 + Math.random() * 300,
    })
    markDirty()
  }, [addNode, markDirty])

  const handleCopy = useCallback(() => {
    console.log('Copy:', Array.from(selectedIds))
  }, [selectedIds])

  const handlePaste = useCallback(() => {
    console.log('Paste')
  }, [])

  const handleDelete = useCallback(() => {
    for (const id of selectedIds) {
      removeNode(id)
    }
    markDirty()
  }, [selectedIds, removeNode, markDirty])

  const { mode: kbMode } = useKeyboardShortcuts({
    onAddComment: handleAddComment,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onSave: handleSave,
    onDelete: handleDelete,
  })

  const handleCanvasClick = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  const handleAddNode = useCallback(
    (type: NodeType) => {
      addNode(type, {
        x: 200 + Math.random() * 400,
        y: 150 + Math.random() * 300,
      })
      markDirty()
    },
    [addNode, markDirty],
  )

  const handleModeChange = useCallback((m: ToolMode) => {
    setToolMode(m)
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f0f1a' }}>
      {/* 상단 툴바 */}
      <div
        style={{
          height: '48px',
          background: 'rgba(15,15,26,0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px',
          zIndex: 10,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#818cf8' }}>AI-StudioX</div>

        <div style={{ flex: 1 }} />

        {/* 프로젝트 컨트롤 */}
        {currentProject && (
          <ProjectControls
            projectName={currentProject.name}
            isDirty={isDirty}
            onSave={handleSave}
            onNew={newProject}
            onNameChange={(name) => updateCurrentProject({ name })}
          />
        )}

        {/* 플레이그라운드 버튼 */}
        <button
          onClick={() => setShowPlayground(true)}
          style={{
            background: 'rgba(129,140,248,0.1)',
            border: '1px solid rgba(129,140,248,0.3)',
            color: '#818cf8',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Playground
        </button>

        {/* 모드 표시 */}
        <div
          style={{
            fontSize: '11px',
            color: '#94a3b8',
            background: 'rgba(255,255,255,0.05)',
            padding: '3px 8px',
            borderRadius: '4px',
          }}
        >
          {kbMode === 'pan' || toolMode === 'pan' ? 'PAN (H)' : 'SELECT (V)'}
        </div>
      </div>

      {/* 메인 레이아웃 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 왼쪽 툴바 */}
        <Toolbar
          mode={toolMode}
          onModeChange={handleModeChange}
          onAddNode={handleAddNode}
        />

        {/* 캔버스 영역 */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} onClick={handleCanvasClick}>
          <InfiniteCanvas canvasState={canvasState} width="100%" height="100%">
            {/* 연결선 렌더링 */}
            {connections.map((conn) => (
              <ConnectionComponent
                key={conn.id}
                connection={conn}
                nodes={nodes}
                onDelete={removeConnection}
              />
            ))}

            {/* 노드들 렌더링 */}
            {nodes.map((node) => (
              <foreignObject
                key={node.id}
                x={0}
                y={0}
                width="100%"
                height="100%"
                style={{ overflow: 'visible', pointerEvents: 'none' }}
              >
                <div style={{ pointerEvents: 'auto', display: 'inline-block' }}>
                  <NodeComponent
                    node={node}
                    isSelected={isSelected(node.id)}
                    onUpdate={(id, data) => { updateNode(id, data); markDirty() }}
                    onMove={(id, x, y) => { moveNode(id, { x, y }); markDirty() }}
                    onSelect={(id) => selectNode(id)}
                  />
                </div>
              </foreignObject>
            ))}
          </InfiniteCanvas>

          {/* 빈 캔버스 안내 */}
          {nodes.length === 0 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                color: '#4a5568',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⬡</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>AI-StudioX</div>
              <div style={{ fontSize: '13px' }}>왼쪽 툴바에서 노드를 추가하거나 단축키를 사용하세요</div>
              <div style={{ fontSize: '12px', marginTop: '12px', color: '#374151' }}>
                V: 선택 | H: 패닝 | C: 메모 | Ctrl+S: 저장
              </div>
            </div>
          )}

          {/* 줌 컨트롤 */}
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 10 }}>
            <ZoomControls canvasState={canvasState} />
          </div>
        </div>

        {/* 오른쪽 히스토리 패널 */}
        <HistoryPanel
          items={historyItems}
          onClear={clearHistory}
        />
      </div>

      {/* 플레이그라운드 모달 */}
      <PlaygroundModal
        isOpen={showPlayground}
        onClose={() => setShowPlayground(false)}
      />
    </div>
  )
}
