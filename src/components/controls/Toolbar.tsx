// 툴바 컴포넌트
// 왼쪽 세로 툴바 - 도구 모드 전환 및 노드 추가 버튼

import { NodeType } from '../../types/nodes'

export type ToolMode = 'select' | 'pan'

export interface ToolbarProps {
  mode: ToolMode
  onModeChange: (mode: ToolMode) => void
  onAddNode: (type: NodeType) => void
}

/** 툴바 버튼 스타일 생성 */
function btnStyle(active: boolean): React.CSSProperties {
  return {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    background: active ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.05)',
    color: active ? '#818cf8' : '#94a3b8',
    transition: 'all 0.15s',
  }
}

/** 카테고리 구분선 */
function Divider() {
  return (
    <div
      style={{
        width: '24px',
        height: '1px',
        background: 'rgba(255,255,255,0.1)',
        margin: '4px 0',
      }}
    />
  )
}

/** 노드 추가 버튼 목록 */
const NODE_BUTTONS: Array<{ type: NodeType; label: string; title: string }> = [
  // Basic
  { type: NodeType.TEXT, label: 'T', title: '텍스트 노드 추가 (Text)' },
  { type: NodeType.COMMENT, label: '💬', title: '메모 노드 추가 (Comment)' },
  { type: NodeType.IMAGE, label: '🖼', title: '이미지 노드 추가 (Image)' },
  { type: NodeType.AUDIO, label: '🎵', title: '오디오 노드 추가 (Audio)' },
  // AI
  { type: NodeType.ASSISTANT, label: '✨', title: 'AI 어시스턴트 노드 추가 (Assistant)' },
  { type: NodeType.MODEL, label: '👤', title: 'AI 모델 노드 추가 (Model)' },
  { type: NodeType.VTON, label: '👗', title: '가상 피팅 노드 추가 (VTON)' },
  { type: NodeType.STORYBOARD, label: '📋', title: '스토리보드 노드 추가 (Storyboard)' },
  { type: NodeType.SCRIPT, label: '📝', title: '스크립트 노드 추가 (Script)' },
  { type: NodeType.GRID_SHOT, label: '⊞', title: '그리드 샷 노드 추가 (GridShot)' },
  { type: NodeType.IMAGE_MODIFY, label: '✏️', title: '이미지 편집 노드 추가 (ImageModify)' },
  // Video
  { type: NodeType.VIDEO, label: '🎬', title: '비디오 노드 추가 (Video)' },
  { type: NodeType.CAMERA, label: '📷', title: '카메라 노드 추가 (Camera)' },
  // Data
  { type: NodeType.ARRAY, label: '[]', title: '배열 노드 추가 (Array)' },
  { type: NodeType.LIST, label: '≡', title: '목록 노드 추가 (List)' },
  { type: NodeType.COMPOSITE, label: '⊕', title: '합성 노드 추가 (Composite)' },
  { type: NodeType.STITCH, label: '⊞', title: '스티치 노드 추가 (Stitch)' },
  { type: NodeType.GRID_EXTRACTOR, label: '⊠', title: '그리드 추출 노드 추가 (GridExtractor)' },
  { type: NodeType.GROUP, label: '⬡', title: '그룹 노드 추가 (Group)' },
]

// @MX:ANCHOR: 노드 생성 진입점 - App.tsx와 강하게 연결됨
// @MX:REASON: 모든 노드 타입 추가 경로의 단일 진입점
export function Toolbar({ mode, onModeChange, onAddNode }: ToolbarProps) {
  return (
    <div
      style={{
        width: '48px',
        height: '100%',
        background: 'rgba(15,15,26,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 6px',
        gap: '4px',
        overflowY: 'auto',
        zIndex: 10,
      }}
    >
      {/* 도구 모드 */}
      <button
        title="선택 모드 (V)"
        aria-pressed={mode === 'select'}
        style={btnStyle(mode === 'select')}
        onClick={() => onModeChange('select')}
      >
        ↖
      </button>
      <button
        title="패닝 모드 (H)"
        aria-pressed={mode === 'pan'}
        style={btnStyle(mode === 'pan')}
        onClick={() => onModeChange('pan')}
      >
        ✋
      </button>

      <Divider />

      {/* 노드 추가 버튼 */}
      {NODE_BUTTONS.map(({ type, label, title }) => (
        <button
          key={type}
          title={title}
          style={btnStyle(false)}
          onClick={() => onAddNode(type)}
        >
          <span style={{ fontSize: label.length > 1 ? '10px' : '14px' }}>{label}</span>
        </button>
      ))}
    </div>
  )
}
