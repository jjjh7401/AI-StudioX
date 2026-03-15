// useUndoRedo.test.ts: 상태 히스토리 스택 기반 Undo/Redo 훅 TDD 스펙 테스트
// RED-GREEN-REFACTOR 사이클로 구현 (SPEC-UI-001 M5)

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ========================
// Cycle 1: pushState, undo, redo 기본 동작
// ========================
describe('useUndoRedo 훅', () => {
  describe('Cycle 1: 초기 상태', () => {
    it('초기 canUndo는 false여야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());
      expect(result.current.canUndo).toBe(false);
    });

    it('초기 canRedo는 false여야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());
      expect(result.current.canRedo).toBe(false);
    });

    it('초기 undo() 호출 시 undefined를 반환해야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());
      let ret: string | undefined;
      act(() => { ret = result.current.undo(); });
      expect(ret).toBeUndefined();
    });

    it('초기 redo() 호출 시 undefined를 반환해야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());
      let ret: string | undefined;
      act(() => { ret = result.current.redo(); });
      expect(ret).toBeUndefined();
    });
  });

  // ========================
  // Cycle 2: pushState 후 canUndo/undo 동작
  // ========================
  describe('Cycle 2: pushState 후 undo 동작', () => {
    it('pushState 호출 후 canUndo는 true여야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());

      act(() => { result.current.pushState('state-A'); });
      expect(result.current.canUndo).toBe(true);
    });

    it('pushState 한 번 호출 후 undo()는 push된 상태를 반환해야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());

      act(() => { result.current.pushState('state-A'); });

      let ret: string | undefined;
      act(() => { ret = result.current.undo(); });
      expect(ret).toBe('state-A');
    });

    it('pushState 두 번 호출 후 undo()는 최신 상태를 반환해야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());

      act(() => {
        result.current.pushState('state-A');
        result.current.pushState('state-B');
      });

      let ret: string | undefined;
      act(() => { ret = result.current.undo(); });
      expect(ret).toBe('state-B');
    });

    it('undo() 후 canUndo가 이전 스택 상태를 반영해야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());

      act(() => {
        result.current.pushState('state-A');
        result.current.pushState('state-B');
      });

      act(() => { result.current.undo(); });
      // 아직 state-A가 남아 있으므로 canUndo는 true
      expect(result.current.canUndo).toBe(true);

      act(() => { result.current.undo(); });
      // state-A까지 undo했으므로 canUndo는 false
      expect(result.current.canUndo).toBe(false);
    });
  });

  // ========================
  // Cycle 3: redo 동작
  // ========================
  describe('Cycle 3: redo 동작', () => {
    it('undo 후 canRedo는 true여야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());

      act(() => { result.current.pushState('state-A'); });
      act(() => { result.current.undo(); });
      expect(result.current.canRedo).toBe(true);
    });

    it('undo 후 redo()는 undo된 상태를 반환해야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());

      act(() => {
        result.current.pushState('state-A');
        result.current.pushState('state-B');
      });

      act(() => { result.current.undo(); }); // state-B를 undo
      let ret: string | undefined;
      act(() => { ret = result.current.redo(); }); // state-B를 redo
      expect(ret).toBe('state-B');
    });

    it('새로운 pushState 후 redo 스택은 초기화되어야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());

      act(() => {
        result.current.pushState('state-A');
        result.current.pushState('state-B');
      });

      act(() => { result.current.undo(); }); // redo 스택에 state-B 추가됨
      expect(result.current.canRedo).toBe(true);

      act(() => { result.current.pushState('state-C'); }); // 새 push → redo 초기화
      expect(result.current.canRedo).toBe(false);
    });
  });

  // ========================
  // Cycle 3 (추가): 여러 번 undo 및 redo 사이클
  // ========================
  describe('Cycle 3 (추가): 여러 번 undo 및 redo 사이클', () => {
    it('여러 번 undo 시 future 스택에 상태가 누적되어야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());

      act(() => {
        result.current.pushState('state-A');
        result.current.pushState('state-B');
        result.current.pushState('state-C');
      });

      // 첫 번째 undo: state-C
      let ret1: string | undefined;
      act(() => { ret1 = result.current.undo(); });
      expect(ret1).toBe('state-C');
      expect(result.current.canRedo).toBe(true);

      // 두 번째 undo: state-B
      let ret2: string | undefined;
      act(() => { ret2 = result.current.undo(); });
      expect(ret2).toBe('state-B');
      expect(result.current.canRedo).toBe(true);

      // 세 번째 undo: state-A
      let ret3: string | undefined;
      act(() => { ret3 = result.current.undo(); });
      expect(ret3).toBe('state-A');
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });

    it('undo 후 redo 전체 사이클: 상태가 올바르게 복원되어야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());

      act(() => {
        result.current.pushState('state-A');
        result.current.pushState('state-B');
      });

      // undo → undo → redo → redo
      act(() => { result.current.undo(); }); // state-B 꺼냄
      act(() => { result.current.undo(); }); // state-A 꺼냄
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);

      let r1: string | undefined;
      act(() => { r1 = result.current.redo(); }); // state-A 복원
      expect(r1).toBe('state-A');
      expect(result.current.canRedo).toBe(true);

      let r2: string | undefined;
      act(() => { r2 = result.current.redo(); }); // state-B 복원
      expect(r2).toBe('state-B');
      expect(result.current.canRedo).toBe(false);
    });
  });

  // ========================
  // Cycle 4: maxHistory 제한
  // ========================
  describe('Cycle 4: maxHistory 제한', () => {
    it('maxHistory=3 설정 시 3개 초과한 가장 오래된 항목은 삭제되어야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>({ maxHistory: 3 }));

      act(() => {
        result.current.pushState('state-1');
        result.current.pushState('state-2');
        result.current.pushState('state-3');
        result.current.pushState('state-4'); // state-1이 밀려남
      });

      // undo 3번 해서 총 3개만 되돌릴 수 있어야 함
      let r1: string | undefined;
      let r2: string | undefined;
      let r3: string | undefined;
      act(() => { r1 = result.current.undo(); });
      act(() => { r2 = result.current.undo(); });
      act(() => { r3 = result.current.undo(); });
      expect(r1).toBe('state-4');
      expect(r2).toBe('state-3');
      expect(r3).toBe('state-2'); // state-1은 이미 삭제됨
      expect(result.current.canUndo).toBe(false);
    });

    it('기본 maxHistory는 50이어야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<number>());

      // 51개 push — 50개만 유지되어야 함
      act(() => {
        for (let i = 0; i < 51; i++) {
          result.current.pushState(i);
        }
      });

      // canUndo가 true이고, 50번 undo 후 canUndo가 false가 되어야 함
      // 각 undo를 개별 act()로 호출해 React 상태 동기화
      let undoCount = 0;
      for (let i = 0; i < 55; i++) {
        if (!result.current.canUndo) break;
        act(() => { result.current.undo(); });
        undoCount++;
      }
      expect(undoCount).toBe(50);
    });
  });

  // ========================
  // Cycle 5: clear 동작
  // ========================
  describe('Cycle 5: clear 동작', () => {
    it('clear() 호출 시 canUndo와 canRedo 모두 false가 되어야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());

      act(() => {
        result.current.pushState('state-A');
        result.current.pushState('state-B');
      });
      act(() => { result.current.undo(); }); // redo 스택에 state-B 추가

      act(() => { result.current.clear(); });

      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('clear() 후 undo()는 undefined를 반환해야 한다', async () => {
      const { useUndoRedo } = await import('../useUndoRedo');
      const { result } = renderHook(() => useUndoRedo<string>());

      act(() => { result.current.pushState('state-A'); });
      act(() => { result.current.clear(); });

      let ret: string | undefined;
      act(() => { ret = result.current.undo(); });
      expect(ret).toBeUndefined();
    });
  });
});
