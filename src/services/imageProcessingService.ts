// 이미지 처리 서비스
// Canvas API를 활용한 이미지 리사이즈, 변환, 크롭 기능

/** 크롭 영역 정의 */
export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * File 객체를 base64 data URL로 변환
 * @param file - 변환할 파일
 */
export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * base64 data URL을 Blob으로 변환
 * @param base64 - base64 data URL (data:image/xxx;base64,...)
 * @param mimeType - MIME 타입
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  // data URL 헤더 제거
  const base64Data = base64.replace(/^data:[^;]+;base64,/, '')
  const byteString = atob(base64Data)
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeType })
}

/**
 * 이미지를 최대 바이트 이하로 리사이즈
 * @param base64 - 원본 이미지 base64 data URL
 * @param maxBytes - 최대 허용 바이트 수 (기본 4MB)
 */
export async function resizeImage(
  base64: string,
  maxBytes: number = 4 * 1024 * 1024,
): Promise<string> {
  // 현재 크기 체크
  const currentSize = Math.ceil((base64.length * 3) / 4)
  if (currentSize <= maxBytes) {
    return base64
  }

  // 이미지 로드
  const img = await loadImage(base64)
  const ratio = Math.sqrt(maxBytes / currentSize)
  const newWidth = Math.floor(img.naturalWidth * ratio)
  const newHeight = Math.floor(img.naturalHeight * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = newWidth
  canvas.height = newHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D 컨텍스트를 가져올 수 없습니다.')

  ctx.drawImage(img as unknown as CanvasImageSource, 0, 0, newWidth, newHeight)
  return canvas.toDataURL('image/jpeg', 0.85)
}

/**
 * 이미지의 특정 영역을 크롭
 * @param base64 - 원본 이미지 base64 data URL
 * @param rect - 크롭 영역
 */
export async function cropImage(
  base64: string,
  rect: CropRect,
): Promise<string> {
  const img = await loadImage(base64)

  const canvas = document.createElement('canvas')
  canvas.width = rect.width
  canvas.height = rect.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D 컨텍스트를 가져올 수 없습니다.')

  ctx.drawImage(
    img as unknown as CanvasImageSource,
    rect.x, rect.y, rect.width, rect.height,
    0, 0, rect.width, rect.height,
  )
  return canvas.toDataURL('image/png')
}

/** 이미지 로드 헬퍼 */
function loadImage(src: string): Promise<{ naturalWidth: number; naturalHeight: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
