// useUndoRedo: 상태 히스토리 스택 기반 Undo/Redo 훅
// SPEC-UI-001 M5 — REQ-PROJ-008: Ctrl+Z undo, Ctrl+Shift+Z redo

import { useReducer, useCallback } from 'react';

// @MX:ANCHOR: useUndoRedo 훅의 옵션 인터페이스
// @MX:REASON: maxHistory 제한을 외부에서 설정 가능하게 하여 유연성 확보
export interface UseUndoRedoOptions {
  /** 유지할 최대 히스토리 수 (기본값: 50) */
  maxHistory?: number;
}

// @MX:ANCHOR: useUndoRedo 훅이 반환하는 값 인터페이스
// @MX:REASON: App.tsx의 undo/redo 로직 교체 시 이 인터페이스를 참조함
export interface UseUndoRedoReturn<T> {
  /** 새 상태를 히스토리 스택에 추가 */
  pushState: (state: T) => void;
  /** 이전 상태로 되돌리기 (없으면 undefined) */
  undo: () => T | undefined;
  /** 되돌린 상태 다시 적용 (없으면 undefined) */
  redo: () => T | undefined;
  /** undo 가능 여부 */
  canUndo: boolean;
  /** redo 가능 여부 */
  canRedo: boolean;
  /** 히스토리 전체 초기화 */
  clear: () => void;
}

// 내부 리듀서 상태 타입
interface UndoRedoState<T> {
  past: T[];
  future: T[];
  /** undo/redo가 반환할 값 (마지막 pop 결과) */
  lastResult: T | undefined;
}

// 액션 타입 정의
type UndoRedoAction<T> =
  | { type: 'PUSH'; payload: T; maxHistory: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' };

// 리듀서: 모든 상태 전환을 동기적으로 처리
function undoRedoReducer<T>(
  state: UndoRedoState<T>,
  action: UndoRedoAction<T>
): UndoRedoState<T> {
  switch (action.type) {
    case 'PUSH': {
      // past에 추가 후 maxHistory 초과 시 가장 오래된 항목 제거
      const next = [...state.past, action.payload];
      const trimmed = next.length > action.maxHistory
        ? next.slice(next.length - action.maxHistory)
        : next;
      return { past: trimmed, future: [], lastResult: undefined };
    }
    case 'UNDO': {
      if (state.past.length === 0) {
        return { ...state, lastResult: undefined };
      }
      const popped = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, state.past.length - 1),
        future: [popped, ...state.future],
        lastResult: popped,
      };
    }
    case 'REDO': {
      if (state.future.length === 0) {
        return { ...state, lastResult: undefined };
      }
      const popped = state.future[0];
      return {
        past: [...state.past, popped],
        future: state.future.slice(1),
        lastResult: popped,
      };
    }
    case 'CLEAR': {
      return { past: [], future: [], lastResult: undefined };
    }
  }
}

// @MX:ANCHOR: 상태 히스토리 스택 관리 훅 (useReducer 기반, 동기 처리)
// @MX:REASON: App.tsx의 undo/redo 상태를 교체하는 핵심 훅
// @MX:SPEC: SPEC-UI-001 M5
export function useUndoRedo<T>(options?: UseUndoRedoOptions): UseUndoRedoReturn<T> {
  const maxHistory = options?.maxHistory ?? 50;

  const [state, dispatch] = useReducer(undoRedoReducer<T>, {
    past: [] as T[],
    future: [] as T[],
    lastResult: undefined,
  } as UndoRedoState<T>);

  // 새 상태를 past에 push, future 초기화
  const pushState = useCallback((s: T) => {
    dispatch({ type: 'PUSH', payload: s, maxHistory });
  }, [maxHistory]);

  // past에서 최근 상태를 꺼내 반환
  const undo = useCallback((): T | undefined => {
    if (state.past.length === 0) return undefined;
    const popped = state.past[state.past.length - 1];
    dispatch({ type: 'UNDO' });
    return popped;
  }, [state.past]);

  // future에서 최근 undo 상태를 꺼내 반환
  const redo = useCallback((): T | undefined => {
    if (state.future.length === 0) return undefined;
    const popped = state.future[0];
    dispatch({ type: 'REDO' });
    return popped;
  }, [state.future]);

  // past/future 초기화
  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  return {
    pushState,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    clear,
  };
}
