// 히스토리 패널 컴포넌트
// AI 생성 결과물의 히스토리를 표시하는 접이식 우측 패널

import { useState } from 'react'
import type { HistoryItem, HistoryItemType } from '../../hooks/useHistory'

export interface HistoryPanelProps {
  items: HistoryItem[]
  onClear: () => void
}

type FilterType = 'all' | HistoryItemType

/** 타입별 이모지 레이블 */
function typeLabel(type: HistoryItemType): string {
  switch (type) {
    case 'image': return '🖼'
    case 'video': return '🎬'
    case 'text': return '📝'
  }
}

/** 타임스탬프 포맷 */
function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export function HistoryPanel({ items, onClear }: HistoryPanelProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter)

  return (
    <div
      style={{
        width: '220px',
        height: '100%',
        background: 'rgba(15,15,26,0.95)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        color: '#e2e8f0',
        fontSize: '12px',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontWeight: 600, color: '#818cf8' }}>히스토리</span>
        <button
          title="전체 삭제"
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '11px',
            padding: '2px 4px',
          }}
        >
          전체 삭제
        </button>
      </div>

      {/* 필터 탭 */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '4px 8px',
          gap: '4px',
        }}
      >
        {(['all', 'image', 'video', 'text'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'rgba(129,140,248,0.2)' : 'transparent',
              border: 'none',
              color: filter === f ? '#818cf8' : '#64748b',
              cursor: 'pointer',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {f === 'all' ? '전체' : f === 'image' ? '이미지' : f === 'video' ? '비디오' : '텍스트'}
          </button>
        ))}
      </div>

      {/* 아이템 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {filtered.length === 0 ? (
          <div style={{ color: '#475569', textAlign: 'center', marginTop: '24px', fontSize: '11px' }}>
            생성된 결과물이 없습니다
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              style={{
                marginBottom: '8px',
                padding: '8px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '6px',
                cursor: 'pointer',
                border: selectedItem?.id === item.id
                  ? '1px solid rgba(129,140,248,0.4)'
                  : '1px solid transparent',
              }}
            >
              {/* 썸네일 */}
              {item.thumbnailUrl && (
                <img
                  src={item.thumbnailUrl}
                  alt={item.prompt}
                  style={{
                    width: '100%',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '6px',
                  }}
                />
              )}
              {/* 메타 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <span>{typeLabel(item.type)}</span>
                <span style={{ color: '#475569', fontSize: '10px' }}>{formatTime(item.timestamp)}</span>
              </div>
              {/* 프롬프트 */}
              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '11px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.prompt}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 상세 보기 */}
      {selectedItem && (
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '10px',
            background: 'rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
            {typeLabel(selectedItem.type)} {selectedItem.type.toUpperCase()}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', wordBreak: 'break-all' }}>
            {selectedItem.prompt}
          </div>
          {selectedItem.thumbnailUrl && (
            <img
              src={selectedItem.thumbnailUrl}
              alt={selectedItem.prompt}
              style={{ width: '100%', marginTop: '8px', borderRadius: '4px' }}
            />
          )}
          <button
            onClick={() => setSelectedItem(null)}
            style={{
              marginTop: '8px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#64748b',
              fontSize: '10px',
              cursor: 'pointer',
              padding: '2px 8px',
              borderRadius: '4px',
              width: '100%',
            }}
          >
            닫기
          </button>
        </div>
      )}
    </div>
  )
}
