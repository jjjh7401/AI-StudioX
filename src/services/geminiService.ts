// Gemini AI 서비스
// Google Gemini API와의 통신 담당 - 텍스트/이미지/비디오 생성

import { GoogleGenAI, type Part } from '@google/genai'

/** API 키 미설정 에러 */
export class ApiKeyNotSetError extends Error {
  constructor() {
    super('Gemini API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해 주세요.')
    this.name = 'ApiKeyNotSetError'
  }
}

/** 스토리보드 씬 */
export interface StoryboardScene {
  scene: number
  description: string
  visual: string
  narration: string
}

/** 스크립트 생성 결과 */
export interface ScriptResult {
  title: string
  hook: string
  body: string
  cta: string
}

/** 모델 생성 옵션 */
export interface ModelOptions {
  gender: 'male' | 'female'
  age: number
  hairStyle: string
  outfit?: string
  background?: string
}

// 싱글턴 클라이언트 인스턴스
let client: GoogleGenAI | null = null

/**
 * Gemini 클라이언트 초기화
 * API 키는 로컬에만 저장되며 Gemini API 외 어디에도 전송되지 않음
 */
export function initializeClient(apiKey: string): void {
  client = new GoogleGenAI({ apiKey })
}

/** 테스트 격리용 클라이언트 초기화 리셋 */
export function resetClient(): void {
  client = null
}

/** 클라이언트 유효성 확인 */
function requireClient(): GoogleGenAI {
  if (!client) throw new ApiKeyNotSetError()
  return client
}

/**
 * 텍스트 생성
 * @param prompt - 사용자 프롬프트
 * @param systemPrompt - 선택적 시스템 지시사항
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
): Promise<string> {
  const ai = requireClient()

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    ...(systemPrompt ? { config: { systemInstruction: systemPrompt } } : {}),
  })
  return response.text as string
}

/**
 * 이미지 생성 - base64 data URL 반환
 * @param prompt - 이미지 설명 프롬프트
 */
export async function generateImage(prompt: string): Promise<string> {
  const ai = requireClient()

  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt,
    config: { numberOfImages: 1 },
  })

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes
  if (!imageBytes) {
    throw new Error('이미지 생성에 실패했습니다.')
  }

  return `data:image/png;base64,${imageBytes}`
}

/**
 * 이미지 편집 - 마스크 기반 인페인팅
 * @param imageBase64 - 원본 이미지 base64
 * @param maskBase64 - 마스크 이미지 base64 (null이면 전체 편집)
 * @param editPrompt - 편집 지시사항
 */
export async function editImage(
  imageBase64: string,
  maskBase64: string | null,
  editPrompt: string,
): Promise<string> {
  const ai = requireClient()

  const parts: Part[] = [
    { text: editPrompt },
    { inlineData: { data: imageBase64.replace(/^data:image\/\w+;base64,/, ''), mimeType: 'image/png' } },
  ]

  if (maskBase64) {
    parts.push({
      inlineData: {
        data: maskBase64.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: 'image/png',
      },
    })
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ parts }],
  })

  return response.text as string
}

/**
 * 비디오 생성
 * @param imageBase64 - 참조 이미지 base64
 * @param prompt - 비디오 생성 프롬프트
 */
export async function generateVideo(
  imageBase64: string,
  prompt: string,
): Promise<string> {
  const ai = requireClient()

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        parts: [
          { text: `Generate video description: ${prompt}` },
          {
            inlineData: {
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: 'image/jpeg',
            },
          },
        ],
      },
    ],
  })

  return response.text as string
}

/**
 * 스토리보드 생성 - 5개 씬 반환
 * @param prompt - 광고 컨셉 프롬프트
 * @param productInfo - 제품 정보
 */
export async function generateStoryboard(
  prompt: string,
  productInfo: string,
): Promise<StoryboardScene[]> {
  const ai = requireClient()

  const systemPrompt = `당신은 광고 스토리보드 전문가입니다.
제품 정보와 컨셉을 바탕으로 5개의 광고 씬을 JSON 배열로 생성하세요.
각 씬은 다음 형식이어야 합니다:
[{"scene": 1, "description": "씬 설명", "visual": "시각적 요소", "narration": "나레이션"}, ...]
JSON만 반환하세요.`

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `제품: ${productInfo}\n컨셉: ${prompt}`,
    config: { systemInstruction: systemPrompt },
  })

  const text = response.text as string
  // JSON 파싱 - 마크다운 코드블록 제거
  const jsonText = text.replace(/```(?:json)?\n?/g, '').trim()
  return JSON.parse(jsonText) as StoryboardScene[]
}

/**
 * 제품 URL 기반 스크립트 생성
 * @param productUrl - 제품 URL 또는 설명
 */
export async function generateScript(productUrl: string): Promise<ScriptResult> {
  const ai = requireClient()

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `다음 제품의 광고 스크립트를 JSON으로 생성하세요: ${productUrl}
형식: {"title": "제목", "hook": "훅 문구", "body": "본문", "cta": "행동유도 문구"}
JSON만 반환하세요.`,
  })

  const text = response.text as string
  const jsonText = text.replace(/```(?:json)?\n?/g, '').trim()
  return JSON.parse(jsonText) as ScriptResult
}

/**
 * AI 패션 모델 이미지 생성
 * @param options - 모델 옵션 (성별, 나이, 헤어스타일 등)
 */
export async function generateModel(options: ModelOptions): Promise<string> {
  const ai = requireClient()

  const prompt = `Professional fashion model photo:
- Gender: ${options.gender}
- Age: approximately ${options.age} years old
- Hair style: ${options.hairStyle}
${options.outfit ? `- Outfit: ${options.outfit}` : ''}
${options.background ? `- Background: ${options.background}` : '- Background: studio white'}
High quality, professional lighting, full body shot`

  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt,
    config: { numberOfImages: 1 },
  })

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes
  if (!imageBytes) {
    throw new Error('모델 이미지 생성에 실패했습니다.')
  }

  return `data:image/png;base64,${imageBytes}`
}

/**
 * 가상 피팅 - 의상과 포즈 이미지를 합성
 * @param outfitBase64 - 의상 이미지 base64
 * @param poseBase64 - 포즈/모델 이미지 base64
 */
export async function generateVton(
  outfitBase64: string,
  poseBase64: string,
): Promise<string> {
  const ai = requireClient()

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        parts: [
          { text: 'Generate a virtual try-on result: combine the outfit from the first image with the model pose from the second image. Create a realistic wearing result.' },
          { inlineData: { data: outfitBase64.replace(/^data:image\/\w+;base64,/, ''), mimeType: 'image/png' } },
          { inlineData: { data: poseBase64.replace(/^data:image\/\w+;base64,/, ''), mimeType: 'image/png' } },
        ],
      },
    ],
  })

  return response.text as string
}

/**
 * 그리드 샷 생성
 * @param prompt - 이미지 생성 프롬프트
 * @param layout - 그리드 레이아웃 (예: "3x3", "2x2")
 */
export async function generateGridShot(
  prompt: string,
  layout: string,
): Promise<string> {
  const ai = requireClient()

  const fullPrompt = `Create a ${layout} grid layout product shot: ${prompt}.
Multiple angles and variations in a clean grid format.`

  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: fullPrompt,
    config: { numberOfImages: 1 },
  })

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes
  if (!imageBytes) {
    throw new Error('그리드 샷 생성에 실패했습니다.')
  }

  return `data:image/png;base64,${imageBytes}`
}
