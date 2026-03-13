// 플레이그라운드 모달 컴포넌트
// AI 기능 테스트를 위한 풀스크린 모달

import { useState } from 'react'
import { generateText, generateImage, initializeClient } from '../../services/geminiService'

export interface PlaygroundModalProps {
  isOpen: boolean
  onClose: () => void
}

type GenerateMode = 'text' | 'image'

export function PlaygroundModal({ isOpen, onClose }: PlaygroundModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('gemini-2.0-flash')
  const [mode, setMode] = useState<GenerateMode>('text')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (apiKey) {
        initializeClient(apiKey)
      }

      if (mode === 'text') {
        const text = await generateText(prompt)
        setResult(text)
      } else {
        const imageUrl = await generateImage(prompt)
        setResult(imageUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '720px',
          maxWidth: '95vw',
          maxHeight: '85vh',
          background: '#0f0f1a',
          border: '1px solid rgba(129,140,248,0.3)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '16px' }}>AI Playground</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* API 키 */}
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
              Gemini API 키 (선택사항)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API 키를 입력하세요"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 모델 선택 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                모델
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '13px',
                }}
              >
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
                생성 타입
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['text', 'image'] as GenerateMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1,
                      background: mode === m ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${mode === m ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      color: mode === m ? '#818cf8' : '#94a3b8',
                      borderRadius: '6px',
                      padding: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {m === 'text' ? '텍스트' : '이미지'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 프롬프트 */}
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>
              프롬프트
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="프롬프트를 입력하세요..."
              rows={4}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '13px',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            style={{
              background: loading ? 'rgba(129,140,248,0.1)' : 'rgba(129,140,248,0.2)',
              border: '1px solid rgba(129,140,248,0.5)',
              color: '#818cf8',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '14px',
              cursor: loading ? 'wait' : 'pointer',
              fontWeight: 600,
            }}
          >
            {loading ? '생성 중...' : '생성하기'}
          </button>

          {/* 오류 */}
          {error && (
            <div style={{ color: '#f87171', fontSize: '12px', padding: '8px', background: 'rgba(248,113,113,0.1)', borderRadius: '6px' }}>
              {error}
            </div>
          )}

          {/* 결과 */}
          {result && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>결과</div>
              {mode === 'image' && result.startsWith('data:') ? (
                <img
                  src={result}
                  alt="생성된 이미지"
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              ) : (
                <div
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '6px',
                    padding: '12px',
                    color: '#e2e8f0',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {result}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
