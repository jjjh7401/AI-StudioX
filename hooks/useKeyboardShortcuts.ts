// useKeyboardShortcuts: 키보드 단축키 관리 훅 (B, Delete, Ctrl+D, Ctrl+Z, Ctrl+A 등)
// SPEC-UI-001 M5 — REQ-PROJ-009: 키보드 단축키 이벤트 처리

import { useEffect, useCallback } from 'react';

// @MX:ANCHOR: useKeyboardShortcuts 훅의 옵션 인터페이스
// @MX:REASON: App.tsx의 handleKeyDown 로직을 대체하는 핵심 옵션
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VoidCallback = (...args: any[]) => any;

export interface UseKeyboardShortcutsOptions {
  /** Delete/Backspace 키: 선택 항목 삭제 */
  onDelete: VoidCallback;
  /** Ctrl+D: 선택 항목 복제 */
  onDuplicate: VoidCallback;
  /** Ctrl+Z: 실행 취소 */
  onUndo: VoidCallback;
  /** B 키: bypass 토글 */
  onBypass: VoidCallback;
  /** Ctrl+A: 전체 선택 */
  onSelectAll: VoidCallback;
  /** 단축키 활성화 여부 (기본값: true) */
  enabled?: boolean;
}

// input/textarea 요소에 포커스된 경우 대부분 단축키를 무시해야 함
function isTypingInInput(): boolean {
  const activeEl = document.activeElement;
  if (!activeEl) return false;
  const tag = activeEl.tagName.toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA';
}

// @MX:ANCHOR: 키보드 단축키 이벤트 리스너 등록/해제 훅
// @MX:REASON: App.tsx의 keydown 이벤트 핸들러를 캡슐화하여 재사용성 향상
// @MX:SPEC: SPEC-UI-001 M5
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions): void {
  const {
    onDelete,
    onDuplicate,
    onUndo,
    onBypass,
    onSelectAll,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 비활성화 상태면 무시
    if (!enabled) return;

    const isCtrlOrMeta = event.ctrlKey || event.metaKey;
    const key = event.key;
    const keyLower = key.toLowerCase();

    // Ctrl 조합 단축키: input/textarea 포커스 여부와 무관하게 처리하는 경우도 있으나
    // 표준 텍스트 편집 단축키(Ctrl+Z)는 input에서 무시
    if (isCtrlOrMeta) {
      switch (keyLower) {
        case 'z':
          // 텍스트 입력 중일 때 기본 undo 동작에 맡김
          if (isTypingInInput()) return;
          event.preventDefault();
          onUndo();
          return;
        case 'd':
          if (isTypingInInput()) return;
          event.preventDefault();
          onDuplicate();
          return;
        case 'a':
          if (isTypingInInput()) return;
          event.preventDefault();
          onSelectAll();
          return;
        default:
          return;
      }
    }

    // 텍스트 입력 중일 때는 일반 키 단축키 무시
    if (isTypingInInput()) return;

    switch (key) {
      case 'Delete':
      case 'Backspace':
        onDelete();
        break;
      case 'b':
      case 'B':
        onBypass();
        break;
      default:
        break;
    }
  }, [enabled, onDelete, onDuplicate, onUndo, onBypass, onSelectAll]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
