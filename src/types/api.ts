// API 타입 정의 모듈
// Gemini API 관련 타입 정의

/** Gemini 텍스트 생성 요청 */
export interface GeminiTextRequest {
  prompt: string
  model?: string
  systemInstruction?: string
  maxOutputTokens?: number
  temperature?: number
}

/** Gemini 텍스트 생성 응답 */
export interface GeminiTextResponse {
  text: string
  modelVersion?: string
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

/** Gemini 이미지 생성 요청 */
export interface GeminiImageRequest {
  prompt: string
  model?: string
  numberOfImages?: number
  aspectRatio?: string
}

/** Gemini 이미지 생성 응답 */
export interface GeminiImageResponse {
  images: Array<{
    base64Data: string
    mimeType: string
  }>
}

/** Gemini 멀티모달 파트 */
export interface GeminiImagePart {
  inlineData: {
    data: string
    mimeType: string
  }
}

export interface GeminiTextPart {
  text: string
}

export type GeminiPart = GeminiImagePart | GeminiTextPart

/** API 에러 */
export interface ApiError {
  code: string
  message: string
  status?: number
}

/** API 결과 */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError }
