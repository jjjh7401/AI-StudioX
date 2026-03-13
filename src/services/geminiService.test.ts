// geminiService 테스트
// TDD RED 단계: Gemini AI 서비스 동작 정의

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// @google/genai 모킹
vi.mock('@google/genai', () => {
  const mockGenerateContent = vi.fn()
  const mockGenerateImages = vi.fn()

  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
        generateImages: mockGenerateImages,
      },
    })),
    __mockGenerateContent: mockGenerateContent,
    __mockGenerateImages: mockGenerateImages,
  }
})

import {
  initializeClient,
  generateText,
  generateImage,
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

  describe('generateImage', () => {
    beforeEach(async () => {
      const genai = await import('@google/genai')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mock = genai as any
      mock.__mockGenerateImages.mockResolvedValue({
        generatedImages: [
          {
            image: {
              imageBytes: 'base64encodeddata',
            },
          },
        ],
      })
      initializeClient('test-api-key')
    })

    it('이미지 생성 성공 - base64 data URL 반환', async () => {
      const result = await generateImage('a beautiful sunset')
      expect(result).toMatch(/^data:image\//)
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
