// 프로젝트 타입 정의 모듈
import type { BaseNode } from './nodes'
import type { Connection } from './connections'

/** 캔버스 변환 상태 (위치 및 스케일) */
export interface CanvasTransform {
  x: number
  y: number
  scale: number
}

/** AI-StudioX 프로젝트 */
export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  nodes: BaseNode[]
  connections: Connection[]
  canvasTransform: CanvasTransform
  description?: string
  thumbnail?: string | null
}

/** 프로젝트 메타데이터 (목록 표시용) */
export interface ProjectMeta {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  thumbnail?: string | null
}
