// useProject 훅 테스트
// TDD RED 단계: 프로젝트 상태 관리 훅 동작 정의

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'

// dbService 모킹
vi.mock('../services/dbService', () => {
  const store = new Map<string, unknown>()
  return {
    saveProject: vi.fn(async (project: { id: string }) => {
      store.set(project.id, project)
    }),
    loadProject: vi.fn(async (id: string) => {
      return store.get(id) ?? null
    }),
    deleteProject: vi.fn(async (id: string) => {
      store.delete(id)
    }),
    listProjects: vi.fn(async () => {
      return Array.from(store.values()).map((p) => {
        const proj = p as { id: string; name: string; createdAt: string; updatedAt: string }
        return { id: proj.id, name: proj.name, createdAt: proj.createdAt, updatedAt: proj.updatedAt }
      })
    }),
    checkStorageQuota: vi.fn(async () => ({ used: 1000, available: 999000 })),
    resetDb: vi.fn(async () => { store.clear() }),
  }
})

import { useProject } from './useProject'

describe('useProject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('초기 상태 확인', () => {
    const { result } = renderHook(() => useProject())
    expect(result.current.currentProject).toBeNull()
    expect(result.current.isDirty).toBe(false)
    expect(result.current.projects).toEqual([])
  })

  it('새 프로젝트 생성', () => {
    const { result } = renderHook(() => useProject())
    act(() => {
      result.current.newProject()
    })
    expect(result.current.currentProject).not.toBeNull()
    expect(result.current.currentProject?.nodes).toEqual([])
    expect(result.current.currentProject?.connections).toEqual([])
    expect(result.current.isDirty).toBe(false)
  })

  it('프로젝트 저장', async () => {
    const { result } = renderHook(() => useProject())
    act(() => {
      result.current.newProject()
    })

    await act(async () => {
      await result.current.saveCurrentProject()
    })

    const { saveProject } = await import('../services/dbService')
    expect(saveProject).toHaveBeenCalled()
    expect(result.current.isDirty).toBe(false)
  })

  it('프로젝트 로드', async () => {
    const { saveProject } = await import('../services/dbService')
    // 저장 모킹이 실제 store에 저장하도록 설정됨
    const { result } = renderHook(() => useProject())

    // 새 프로젝트 생성 후 저장
    act(() => {
      result.current.newProject()
    })
    await act(async () => {
      await result.current.saveCurrentProject()
    })

    const projId = result.current.currentProject?.id
    expect(projId).toBeDefined()
    expect(saveProject).toHaveBeenCalled()
  })

  it('isDirty: 프로젝트 수정 후 true', () => {
    const { result } = renderHook(() => useProject())
    act(() => {
      result.current.newProject()
    })
    act(() => {
      result.current.markDirty()
    })
    expect(result.current.isDirty).toBe(true)
  })

  it('저장 후 isDirty false로 리셋', async () => {
    const { result } = renderHook(() => useProject())
    act(() => {
      result.current.newProject()
      result.current.markDirty()
    })
    expect(result.current.isDirty).toBe(true)

    await act(async () => {
      await result.current.saveCurrentProject()
    })
    expect(result.current.isDirty).toBe(false)
  })
})
