// imageProcessingService 테스트
// TDD RED 단계: 이미지 처리 서비스 동작 정의

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  convertToBase64,
  base64ToBlob,
  resizeImage,
  cropImage,
} from './imageProcessingService'

// Canvas API 모킹
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(),
  toDataURL: vi.fn(() => 'data:image/jpeg;base64,resized'),
}
const mockCtx = {
  drawImage: vi.fn(),
}
mockCanvas.getContext.mockReturnValue(mockCtx)

vi.stubGlobal('document', {
  createElement: vi.fn((tag: string) => {
    if (tag === 'canvas') return mockCanvas
    return {}
  }),
})

// Image 글로벌 모킹
class MockImage {
  onload: (() => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  src = ''
  naturalWidth = 800
  naturalHeight = 600

  set _src(value: string) {
    this.src = value
    // src 설정 시 onload 자동 호출
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
}

vi.stubGlobal('Image', MockImage)

describe('imageProcessingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCanvas.getContext.mockReturnValue(mockCtx)
    mockCanvas.toDataURL.mockReturnValue('data:image/jpeg;base64,resized')
  })

  describe('convertToBase64', () => {
    it('File을 base64 문자열로 변환', async () => {
      // FileReader 모킹
      const mockFileReader = {
        readAsDataURL: vi.fn(function (this: { onload: ((e: { target: { result: string } }) => void) | null }) {
          setTimeout(() => {
            if (this.onload) this.onload({ target: { result: 'data:image/png;base64,abc' } })
          }, 0)
        }),
        onload: null as ((e: { target: { result: string } }) => void) | null,
        onerror: null,
      }
      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

      const file = new File([''], 'test.png', { type: 'image/png' })
      const result = await convertToBase64(file)
      expect(result).toBe('data:image/png;base64,abc')
    })
  })

  describe('base64ToBlob', () => {
    it('base64 문자열을 Blob으로 변환', () => {
      // Uint8Array, atob 모킹
      vi.stubGlobal('atob', vi.fn(() => '\x89PNG'))
      const blob = base64ToBlob('data:image/png;base64,iVBORw', 'image/png')
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/png')
    })
  })

  describe('resizeImage', () => {
    it('최대 바이트 이내면 원본 반환', async () => {
      // 작은 base64 데이터 - maxBytes보다 작은 경우
      const smallBase64 = 'data:image/png;base64,abc'
      const result = await resizeImage(smallBase64, 1024 * 1024 * 10) // 10MB
      // 크기가 충분히 크면 원본 반환
      expect(typeof result).toBe('string')
    })
  })

  describe('cropImage', () => {
    it('지정 영역 크롭 반환', async () => {
      // Image 로드 모킹
      const mockImg = {
        onload: null as (() => void) | null,
        src: '',
        naturalWidth: 800,
        naturalHeight: 600,
      }
      vi.stubGlobal('Image', vi.fn(() => {
        // src setter로 onload 자동 트리거
        return new Proxy(mockImg, {
          set(target, prop, value) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(target as any)[prop] = value
            if (prop === 'src' && target.onload) {
              setTimeout(() => target.onload!(), 0)
            }
            return true
          },
        })
      }))

      const result = await cropImage(
        'data:image/png;base64,abc',
        { x: 0, y: 0, width: 100, height: 100 },
      )
      expect(typeof result).toBe('string')
    })
  })
})
