// useProjectManager.test.ts: IndexedDB 기반 프로젝트 관리 훅 TDD 스펙 테스트
// RED-GREEN-REFACTOR 사이클로 구현 (SPEC-UI-001 M5)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ProjectState, Project } from '../../types';

// ========================
// dbService 모킹
// ========================
vi.mock('../../services/dbService', () => ({
  saveProjectsList: vi.fn().mockResolvedValue(undefined),
  getProjectsList: vi.fn().mockResolvedValue([]),
}));

// 모킹된 함수 참조
import * as dbService from '../../services/dbService';
const mockSaveProjectsList = vi.mocked(dbService.saveProjectsList);
const mockGetProjectsList = vi.mocked(dbService.getProjectsList);

// ========================
// 테스트용 ProjectState 팩토리
// ========================
function createMockProjectState(overrides: Partial<ProjectState> = {}): ProjectState {
  return {
    nodes: {},
    connections: [],
    history: [],
    panZoom: { x: 0, y: 0, k: 1 },
    nodeRenderOrder: [],
    ...overrides,
  };
}

function createMockProject(id: string, name: string): Project {
  return {
    id,
    name,
    createdAt: new Date().toISOString(),
    state: createMockProjectState(),
  };
}

describe('useProjectManager 훅', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let getState: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let onStateLoaded: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProjectsList.mockResolvedValue([]);
    mockSaveProjectsList.mockResolvedValue(undefined);

    getState = vi.fn(() => createMockProjectState());
    onStateLoaded = vi.fn();
  });

  // ========================
  // Cycle 1: 초기 상태
  // ========================
  describe('Cycle 1: 초기 상태', () => {
    it('초기 projects는 빈 배열이어야 한다', async () => {
      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.projects).toEqual([]);
    });

    it('초기 currentProjectId는 undefined여야 한다', async () => {
      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentProjectId).toBeUndefined();
    });

    it('마운트 시 getProjectsList가 호출되어야 한다', async () => {
      const { useProjectManager } = await import('../useProjectManager');
      renderHook(() => useProjectManager({ getState, onStateLoaded }));

      await waitFor(() => {
        expect(mockGetProjectsList).toHaveBeenCalledTimes(1);
      });
    });

    it('IndexedDB에 저장된 프로젝트가 있으면 projects에 로드되어야 한다', async () => {
      const savedProjects = [createMockProject('proj-1', '프로젝트1')];
      mockGetProjectsList.mockResolvedValue(savedProjects);

      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => {
        expect(result.current.projects).toHaveLength(1);
      });

      expect(result.current.projects[0].name).toBe('프로젝트1');
    });
  });

  // ========================
  // Cycle 2: saveProject
  // ========================
  describe('Cycle 2: saveProject', () => {
    it('saveProject 호출 시 saveProjectsList가 호출되어야 한다', async () => {
      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.saveProject('테스트 프로젝트');
      });

      expect(mockSaveProjectsList).toHaveBeenCalled();
    });

    it('saveProject 호출 시 getState가 호출되어야 한다', async () => {
      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.saveProject('테스트 프로젝트');
      });

      expect(getState).toHaveBeenCalled();
    });

    it('saveProject 후 projects 배열에 새 프로젝트가 추가되어야 한다', async () => {
      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.saveProject('새 프로젝트');
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].name).toBe('새 프로젝트');
    });
  });

  // ========================
  // Cycle 3: loadProject
  // ========================
  describe('Cycle 3: loadProject', () => {
    it('loadProject 호출 시 onStateLoaded가 해당 프로젝트 state로 호출되어야 한다', async () => {
      const mockState = createMockProjectState({ nodeRenderOrder: ['node-1'] });
      const savedProjects = [
        { id: 'proj-1', name: '프로젝트1', createdAt: new Date().toISOString(), state: mockState },
      ];
      mockGetProjectsList.mockResolvedValue(savedProjects);

      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => expect(result.current.projects).toHaveLength(1));

      act(() => {
        result.current.loadProject('proj-1');
      });

      expect(onStateLoaded).toHaveBeenCalledWith(mockState);
    });

    it('loadProject 후 currentProjectId가 로드된 프로젝트 id로 설정되어야 한다', async () => {
      const savedProjects = [createMockProject('proj-1', '프로젝트1')];
      mockGetProjectsList.mockResolvedValue(savedProjects);

      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => expect(result.current.projects).toHaveLength(1));

      act(() => {
        result.current.loadProject('proj-1');
      });

      expect(result.current.currentProjectId).toBe('proj-1');
    });

    it('존재하지 않는 id로 loadProject 호출 시 onStateLoaded가 호출되지 않아야 한다', async () => {
      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.loadProject('non-existent-id');
      });

      expect(onStateLoaded).not.toHaveBeenCalled();
    });
  });

  // ========================
  // Cycle 4: deleteProject
  // ========================
  describe('Cycle 4: deleteProject', () => {
    it('deleteProject 호출 시 projects 배열에서 해당 프로젝트가 제거되어야 한다', async () => {
      const savedProjects = [
        createMockProject('proj-1', '프로젝트1'),
        createMockProject('proj-2', '프로젝트2'),
      ];
      mockGetProjectsList.mockResolvedValue(savedProjects);

      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => expect(result.current.projects).toHaveLength(2));

      await act(async () => {
        await result.current.deleteProject('proj-1');
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].id).toBe('proj-2');
    });

    it('deleteProject 호출 시 saveProjectsList가 호출되어야 한다', async () => {
      const savedProjects = [createMockProject('proj-1', '프로젝트1')];
      mockGetProjectsList.mockResolvedValue(savedProjects);

      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => expect(result.current.projects).toHaveLength(1));

      await act(async () => {
        await result.current.deleteProject('proj-1');
      });

      // getProjectsList 로드 시 saveProjectsList가 호출될 수 있으므로
      // 최소 1번은 호출되어야 함
      expect(mockSaveProjectsList).toHaveBeenCalled();
    });
  });

  // ========================
  // Cycle 5: createNewProject
  // ========================
  describe('Cycle 5: createNewProject', () => {
    it('createNewProject 호출 시 onStateLoaded가 빈 상태로 호출되어야 한다', async () => {
      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.createNewProject();
      });

      expect(onStateLoaded).toHaveBeenCalledWith(
        expect.objectContaining({
          nodes: {},
          connections: [],
          nodeRenderOrder: [],
        })
      );
    });

    it('createNewProject 호출 시 currentProjectId가 undefined가 되어야 한다', async () => {
      const savedProjects = [createMockProject('proj-1', '프로젝트1')];
      mockGetProjectsList.mockResolvedValue(savedProjects);

      const { useProjectManager } = await import('../useProjectManager');
      const { result } = renderHook(() =>
        useProjectManager({ getState, onStateLoaded })
      );

      await waitFor(() => expect(result.current.projects).toHaveLength(1));

      // 먼저 프로젝트 로드
      act(() => { result.current.loadProject('proj-1'); });
      expect(result.current.currentProjectId).toBe('proj-1');

      // 새 프로젝트 생성
      act(() => { result.current.createNewProject(); });
      expect(result.current.currentProjectId).toBeUndefined();
    });
  });
});
