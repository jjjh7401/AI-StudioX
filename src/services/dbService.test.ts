// dbService 테스트
// TDD RED 단계: IndexedDB 프로젝트 저장소 동작 정의

import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  saveProject,
  loadProject,
  deleteProject,
  listProjects,
  resetDb,
} from './dbService'
import type { Project } from '../types/project'

const makeProject = (id: string): Project => ({
  id,
  name: `Test Project ${id}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [],
  connections: [],
  canvasTransform: { x: 0, y: 0, scale: 1 },
  description: 'Test description',
  thumbnail: null,
})

describe('dbService', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('프로젝트 저장 및 로드', async () => {
    const project = makeProject('proj-001')
    await saveProject(project)

    const loaded = await loadProject('proj-001')
    expect(loaded).not.toBeNull()
    expect(loaded?.id).toBe('proj-001')
    expect(loaded?.name).toBe('Test Project proj-001')
  })

  it('존재하지 않는 프로젝트 로드 시 null 반환', async () => {
    const result = await loadProject('nonexistent')
    expect(result).toBeNull()
  })

  it('프로젝트 삭제', async () => {
    const project = makeProject('proj-002')
    await saveProject(project)

    await deleteProject('proj-002')
    const loaded = await loadProject('proj-002')
    expect(loaded).toBeNull()
  })

  it('프로젝트 목록 조회', async () => {
    await saveProject(makeProject('proj-a'))
    await saveProject(makeProject('proj-b'))
    await saveProject(makeProject('proj-c'))

    const list = await listProjects()
    expect(list).toHaveLength(3)
    const ids = list.map((p) => p.id)
    expect(ids).toContain('proj-a')
    expect(ids).toContain('proj-b')
    expect(ids).toContain('proj-c')
  })

  it('프로젝트 업데이트 (덮어쓰기)', async () => {
    const project = makeProject('proj-upd')
    await saveProject(project)

    const updated = { ...project, name: 'Updated Name' }
    await saveProject(updated)

    const loaded = await loadProject('proj-upd')
    expect(loaded?.name).toBe('Updated Name')
  })

  it('목록은 ProjectSummary 형태 (전체 데이터 아님)', async () => {
    await saveProject(makeProject('proj-sum'))
    const list = await listProjects()
    expect(list[0]).toHaveProperty('id')
    expect(list[0]).toHaveProperty('name')
    expect(list[0]).toHaveProperty('updatedAt')
    // nodes, connections 같은 무거운 필드 없음
    expect(list[0]).not.toHaveProperty('nodes')
  })
})
