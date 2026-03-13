// 프로젝트 상태 관리 훅
// 현재 프로젝트, 저장/로드, 변경 감지 기능 제공

import { useState, useCallback } from 'react'
import type { Project } from '../types/project'
import {
  saveProject as dbSave,
  loadProject as dbLoad,
  deleteProject as dbDelete,
  listProjects as dbList,
  checkStorageQuota,
  type ProjectSummary,
} from '../services/dbService'

/** 새 프로젝트 초기 상태 생성 */
function createNewProject(): Project {
  const now = new Date().toISOString()
  return {
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '새 프로젝트',
    createdAt: now,
    updatedAt: now,
    nodes: [],
    connections: [],
    canvasTransform: { x: 0, y: 0, scale: 1 },
    thumbnail: null,
  }
}

export interface UseProjectReturn {
  currentProject: Project | null
  projects: ProjectSummary[]
  isDirty: boolean
  newProject: () => void
  saveCurrentProject: () => Promise<void>
  loadProject: (id: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  refreshProjects: () => Promise<void>
  markDirty: () => void
  updateCurrentProject: (updates: Partial<Project>) => void
}

// @MX:ANCHOR: 프로젝트 상태의 중앙 관리 훅
// @MX:REASON: App.tsx, Toolbar, ProjectControls에서 참조됨
export function useProject(): UseProjectReturn {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [isDirty, setIsDirty] = useState(false)

  const newProject = useCallback(() => {
    setCurrentProject(createNewProject())
    setIsDirty(false)
  }, [])

  const saveCurrentProject = useCallback(async () => {
    if (!currentProject) return

    const updated: Project = {
      ...currentProject,
      updatedAt: new Date().toISOString(),
    }

    // 스토리지 용량 확인
    const quota = await checkStorageQuota()
    if (quota.available < 1024 * 1024) {
      // 1MB 미만 남으면 경고 (실제로는 toast 표시)
      console.warn('스토리지 용량이 부족합니다.')
    }

    await dbSave(updated)
    setCurrentProject(updated)
    setIsDirty(false)
  }, [currentProject])

  const loadProject = useCallback(async (id: string) => {
    const project = await dbLoad(id)
    if (project) {
      setCurrentProject(project)
      setIsDirty(false)
    }
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    await dbDelete(id)
    if (currentProject?.id === id) {
      setCurrentProject(null)
      setIsDirty(false)
    }
    // 목록 갱신
    const list = await dbList()
    setProjects(list)
  }, [currentProject])

  const refreshProjects = useCallback(async () => {
    const list = await dbList()
    setProjects(list)
  }, [])

  const markDirty = useCallback(() => {
    setIsDirty(true)
  }, [])

  const updateCurrentProject = useCallback((updates: Partial<Project>) => {
    setCurrentProject((prev) => prev ? { ...prev, ...updates } : null)
    setIsDirty(true)
  }, [])

  return {
    currentProject,
    projects,
    isDirty,
    newProject,
    saveCurrentProject,
    loadProject,
    deleteProject,
    refreshProjects,
    markDirty,
    updateCurrentProject,
  }
}
