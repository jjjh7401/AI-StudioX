// useProjectManager: IndexedDB 기반 프로젝트 저장/로드/삭제 훅
// SPEC-UI-001 M5 — REQ-PROJ-001~003: 프로젝트 관리

import { useState, useEffect, useCallback } from 'react';
import { saveProjectsList, getProjectsList } from '../services/dbService';
import type { Project, ProjectState } from '../types';

// @MX:ANCHOR: useProjectManager 훅의 옵션 인터페이스
// @MX:REASON: App.tsx의 현재 상태를 가져오는 getter와 복원 콜백을 주입받아야 함
export interface UseProjectManagerOptions {
  /** 현재 앱 상태를 반환하는 getter */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getState: (...args: any[]) => any;
  /** 프로젝트 로드/새 프로젝트 생성 시 상태 복원 콜백 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onStateLoaded: (...args: any[]) => any;
}

// @MX:ANCHOR: 프로젝트 목록 간략 정보 (UI 표시용)
// @MX:REASON: ProjectControls에서 프로젝트 목록 렌더링에 사용됨
export interface ProjectInfo {
  id: string;
  name: string;
  createdAt: string;
}

// @MX:ANCHOR: useProjectManager 훅이 반환하는 값 인터페이스
// @MX:REASON: App.tsx의 프로젝트 저장/로드 로직을 교체하는 핵심 인터페이스
export interface UseProjectManagerReturn {
  /** 저장된 프로젝트 목록 */
  projects: Project[];
  /** 현재 로드된 프로젝트 id */
  currentProjectId: string | undefined;
  /** 현재 상태를 새 프로젝트로 저장 */
  saveProject: (name?: string) => Promise<void>;
  /** 지정 id의 프로젝트를 로드하여 상태 복원 */
  loadProject: (projectId: string) => void;
  /** 지정 id의 프로젝트를 삭제 */
  deleteProject: (projectId: string) => Promise<void>;
  /** 빈 상태로 새 프로젝트 생성 */
  createNewProject: () => void;
  /** IndexedDB 작업 중 여부 */
  isLoading: boolean;
}

// 빈 ProjectState 생성 헬퍼
function createEmptyProjectState(): ProjectState {
  return {
    nodes: {},
    connections: [],
    history: [],
    panZoom: { x: 0, y: 0, k: 1 },
    nodeRenderOrder: [],
  };
}

// @MX:ANCHOR: IndexedDB 기반 프로젝트 관리 훅
// @MX:REASON: App.tsx의 handleSaveProject/handleLoadProject/handleDeleteProject를 캡슐화
// @MX:SPEC: SPEC-UI-001 M5
export function useProjectManager(options: UseProjectManagerOptions): UseProjectManagerReturn {
  const { getState, onStateLoaded } = options;

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // 마운트 시 IndexedDB에서 프로젝트 목록 로드
  useEffect(() => {
    let cancelled = false;
    const loadProjects = async () => {
      try {
        const saved = await getProjectsList();
        if (!cancelled) {
          setProjects(saved || []);
        }
      } catch (error) {
        console.error('프로젝트 목록 로드 실패:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadProjects();
    return () => { cancelled = true; };
  }, []);

  // 현재 상태를 새 프로젝트로 저장
  const saveProject = useCallback(async (name: string = '새 프로젝트') => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      state: getState(),
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    setCurrentProjectId(newProject.id);
    try {
      await saveProjectsList(updated);
    } catch (error) {
      console.error('프로젝트 저장 실패:', error);
    }
  }, [projects, getState]);

  // 지정 id의 프로젝트를 로드하여 onStateLoaded 콜백 호출
  const loadProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    setCurrentProjectId(projectId);
    onStateLoaded(project.state);
  }, [projects, onStateLoaded]);

  // 지정 id의 프로젝트를 삭제하고 IndexedDB 업데이트
  const deleteProject = useCallback(async (projectId: string) => {
    const updated = projects.filter(p => p.id !== projectId);
    setProjects(updated);
    if (currentProjectId === projectId) {
      setCurrentProjectId(undefined);
    }
    try {
      await saveProjectsList(updated);
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
    }
  }, [projects, currentProjectId]);

  // 빈 상태로 새 프로젝트 생성 (현재 id 초기화)
  const createNewProject = useCallback(() => {
    setCurrentProjectId(undefined);
    onStateLoaded(createEmptyProjectState());
  }, [onStateLoaded]);

  return {
    projects,
    currentProjectId,
    saveProject,
    loadProject,
    deleteProject,
    createNewProject,
    isLoading,
  };
}
