// IndexedDB 기반 프로젝트 영속성 서비스
// 프로젝트 저장, 로드, 삭제, 목록 조회 기능

import type { Project, ProjectMeta } from '../types/project'

const DB_NAME = 'ai-studiox'
const DB_VERSION = 1
const STORE_PROJECTS = 'projects'

/** 프로젝트 요약 정보 (목록용) */
export interface ProjectSummary {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  thumbnail?: string | null
}

// DB 인스턴스 캐시
let dbInstance: IDBDatabase | null = null

/** DB 연결 획득 */
function openDb(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' })
      }
    }

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result
      resolve(dbInstance)
    }

    request.onerror = () => reject(request.error)
  })
}

/** 테스트 격리용 DB 리셋 */
export async function resetDb(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve() // 블록된 경우도 계속 진행
  })
}

/**
 * 프로젝트 저장 (신규 또는 업데이트)
 * @param project - 저장할 프로젝트
 */
export async function saveProject(project: Project): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readwrite')
    const store = tx.objectStore(STORE_PROJECTS)
    const request = store.put(project)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * 프로젝트 로드
 * @param id - 프로젝트 ID
 * @returns 프로젝트 또는 null (없는 경우)
 */
export async function loadProject(id: string): Promise<Project | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readonly')
    const store = tx.objectStore(STORE_PROJECTS)
    const request = store.get(id)
    request.onsuccess = () => resolve((request.result as Project) ?? null)
    request.onerror = () => reject(request.error)
  })
}

/**
 * 프로젝트 삭제
 * @param id - 삭제할 프로젝트 ID
 */
export async function deleteProject(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readwrite')
    const store = tx.objectStore(STORE_PROJECTS)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * 프로젝트 목록 조회 (요약 정보만)
 * @returns ProjectSummary 배열 (updatedAt 내림차순)
 */
export async function listProjects(): Promise<ProjectSummary[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readonly')
    const store = tx.objectStore(STORE_PROJECTS)
    const request = store.getAll()
    request.onsuccess = () => {
      const projects = request.result as Project[]
      // 요약 정보만 추출 (무거운 nodes/connections 제외)
      const summaries: ProjectSummary[] = projects.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        thumbnail: p.thumbnail,
      }))
      // 최근 수정순 정렬
      summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      resolve(summaries)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * 스토리지 할당량 확인
 * @returns 사용량과 가용량 (바이트)
 */
export async function checkStorageQuota(): Promise<{ used: number; available: number }> {
  if (!navigator.storage?.estimate) {
    return { used: 0, available: Infinity }
  }
  const estimate = await navigator.storage.estimate()
  return {
    used: estimate.usage ?? 0,
    available: (estimate.quota ?? Infinity) - (estimate.usage ?? 0),
  }
}

// ProjectMeta 타입 재수출 (하위 호환성)
export type { ProjectMeta }
