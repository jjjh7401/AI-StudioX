// geminiService 테스트
// Gemini AI 서비스 동작 정의 - 나노바나나2(이미지), Veo 3 Fast(비디오)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// @google/genai 모킹
vi.mock('@google/genai', () => {
  const mockGenerateContent = vi.fn()
  const mockGenerateVideos = vi.fn()
  const mockGetVideosOperation = vi.fn()

  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
        generateVideos: mockGenerateVideos,
      },
      operations: {
        getVideosOperation: mockGetVideosOperation,
      },
    })),
    __mockGenerateContent: mockGenerateContent,
    __mockGenerateVideos: mockGenerateVideos,
    __mockGetVideosOperation: mockGetVideosOperation,
  }
})

import {
  initializeClient,
  generateText,
  generateImage,
  generateVideo,
  generateStoryboard,
  ApiKeyNotSetError,
  resetClient,
} from './geminiService'

describe('geminiService', () => {
  beforeEach(() => {
    resetClient()
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetClient()
  })

  describe('ApiKeyNotSetError', () => {
    it('API 키 미설정 시 generateText 예외 발생', async () => {
      await expect(generateText('hello')).rejects.toThrow(ApiKeyNotSetError)
    })

    it('API 키 미설정 시 generateImage 예외 발생', async () => {
      await expect(generateImage('a cat')).rejects.toThrow(ApiKeyNotSetError)
    })

    it('API 키 미설정 시 generateVideo 예외 발생', async () => {
      await expect(generateVideo('', 'a cat running')).rejects.toThrow(ApiKeyNotSetError)
    })
  })

  describe('initializeClient', () => {
    it('API 키 설정 후 클라이언트 초기화', () => {
      expect(() => initializeClient('test-api-key')).not.toThrow()
    })
  })

  describe('generateText', () => {
    beforeEach(async () => {
      const genai = await import('@google/genai')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mock = genai as any
      mock.__mockGenerateContent.mockResolvedValue({
        text: 'Hello from Gemini',
      })
      initializeClient('test-api-key')
    })

    it('텍스트 생성 성공', async () => {
      const result = await generateText('Write a poem')
      expect(result).toBe('Hello from Gemini')
    })

    it('시스템 프롬프트와 함께 텍스트 생성', async () => {
      const result = await generateText('Write a poem', 'You are a poet')
      expect(result).toBe('Hello from Gemini')
    })
  })

  describe('generateImage - 나노바나나2 (gemini-3.1-flash-image-preview)', () => {
    beforeEach(async () => {
      const genai = await import('@google/genai')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mock = genai as any
      // generateContent가 이미지 인라인데이터를 반환하는 구조로 모킹
      mock.__mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: 'base64encodedimagedata',
                    mimeType: 'image/png',
                  },
                },
              ],
            },
          },
        ],
        text: null,
      })
      initializeClient('test-api-key')
    })

    it('이미지 생성 성공 - base64 data URL 반환', async () => {
      const result = await generateImage('a beautiful sunset')
      expect(result).toMatch(/^data:image\//)
      expect(result).toContain('base64encodedimagedata')
    })

    it('gemini-3.1-flash-image-preview 모델로 호출', async () => {
      const genai = await import('@google/genai')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mock = genai as any
      await generateImage('test prompt')
      expect(mock.__mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-3.1-flash-image-preview',
        }),
      )
    })

    it('응답에 이미지 없으면 에러 발생', async () => {
      const genai = await import('@google/genai')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mock = genai as any
      mock.__mockGenerateContent.mockResolvedValue({
        candidates: [{ content: { parts: [{ text: 'no image' }] } }],
        text: 'no image',
      })
      await expect(generateImage('test')).rejects.toThrow('이미지 생성에 실패했습니다.')
    })
  })

  describe('generateVideo - Veo 3 Fast (veo-3.1-fast-generate-preview)', () => {
    beforeEach(async () => {
      const genai = await import('@google/genai')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mock = genai as any
      // generateVideos가 즉시 done: true 반환 (폴링 불필요)
      mock.__mockGenerateVideos.mockResolvedValue({
        name: 'operations/test-video-op',
        done: true,
        response: {
          generatedVideos: [
            {
              video: {
                videoBytes: 'base64encodedvideodata',
              },
            },
          ],
        },
      })
      initializeClient('test-api-key')
    })

    it('비디오 생성 성공 - base64 data URL 반환', async () => {
      const result = await generateVideo('', 'a cat running in the park')
      expect(result).toMatch(/^data:video\/mp4;base64,/)
      expect(result).toContain('base64encodedvideodata')
    })

    it('veo-3.1-fast-generate-preview 모델로 호출', async () => {
      const genai = await import('@google/genai')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mock = genai as any
      await generateVideo('', 'test prompt')
      expect(mock.__mockGenerateVideos).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'veo-3.1-fast-generate-preview',
        }),
      )
    })
  })

  describe('generateStoryboard', () => {
    beforeEach(async () => {
      const genai = await import('@google/genai')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mock = genai as any
      mock.__mockGenerateContent.mockResolvedValue({
        text: JSON.stringify([
          { scene: 1, description: 'Scene 1', visual: 'Visual 1', narration: 'Narration 1' },
          { scene: 2, description: 'Scene 2', visual: 'Visual 2', narration: 'Narration 2' },
          { scene: 3, description: 'Scene 3', visual: 'Visual 3', narration: 'Narration 3' },
          { scene: 4, description: 'Scene 4', visual: 'Visual 4', narration: 'Narration 4' },
          { scene: 5, description: 'Scene 5', visual: 'Visual 5', narration: 'Narration 5' },
        ]),
      })
      initializeClient('test-api-key')
    })

    it('스토리보드 5개 씬 생성', async () => {
      const scenes = await generateStoryboard('Coffee brand', 'Premium coffee beans')
      expect(scenes).toHaveLength(5)
      expect(scenes[0]).toHaveProperty('scene')
      expect(scenes[0]).toHaveProperty('description')
    })
  })

  describe('에러 처리', () => {
    it('네트워크 오류 시 에러 throw', async () => {
      const genai = await import('@google/genai')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mock = genai as any
      mock.__mockGenerateContent.mockRejectedValue(new Error('Network error'))
      initializeClient('test-api-key')

      await expect(generateText('hello')).rejects.toThrow()
    })
  })
})
