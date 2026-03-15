// useKeyboardShortcuts.test.ts: 키보드 단축키 관리 훅 TDD 스펙 테스트
// RED-GREEN-REFACTOR 사이클로 구현 (SPEC-UI-001 M5)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { VoidCallback } from '../useKeyboardShortcuts';

// ========================
// 테스트 헬퍼: KeyboardEvent 발생
// ========================
function fireKeyDown(key: string, options: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, ...options });
  window.dispatchEvent(event);
  return event;
}

// vi.fn()을 VoidCallback 타입으로 캐스팅하는 헬퍼
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockFn(): VoidCallback & { mock: any; mockClear: () => void; } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return vi.fn() as any;
}

describe('useKeyboardShortcuts 훅', () => {
  let onDelete: VoidCallback;
  let onDuplicate: VoidCallback;
  let onUndo: VoidCallback;
  let onBypass: VoidCallback;
  let onSelectAll: VoidCallback;

  beforeEach(() => {
    onDelete = mockFn();
    onDuplicate = mockFn();
    onUndo = mockFn();
    onBypass = mockFn();
    onSelectAll = mockFn();
  });

  // ========================
  // Cycle 1: 'B' 키 → onBypass
  // ========================
  describe('Cycle 1: B 키 → onBypass', () => {
    it("'b' 키 입력 시 onBypass가 호출되어야 한다", async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      fireKeyDown('b');
      expect(vi.mocked(onBypass)).toHaveBeenCalledTimes(1);
    });

    it("'B' 대문자 키 입력 시 onBypass가 호출되어야 한다", async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      fireKeyDown('B');
      expect(vi.mocked(onBypass)).toHaveBeenCalledTimes(1);
    });
  });

  // ========================
  // Cycle 2: Delete/Backspace 키 → onDelete
  // ========================
  describe('Cycle 2: Delete/Backspace 키 → onDelete', () => {
    it("'Delete' 키 입력 시 onDelete가 호출되어야 한다", async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      fireKeyDown('Delete');
      expect(vi.mocked(onDelete)).toHaveBeenCalledTimes(1);
    });

    it("'Backspace' 키 입력 시 onDelete가 호출되어야 한다", async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      fireKeyDown('Backspace');
      expect(vi.mocked(onDelete)).toHaveBeenCalledTimes(1);
    });
  });

  // ========================
  // Cycle 3: Ctrl+Z → onUndo
  // ========================
  describe('Cycle 3: Ctrl+Z → onUndo', () => {
    it('Ctrl+Z 입력 시 onUndo가 호출되어야 한다', async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      fireKeyDown('z', { ctrlKey: true });
      expect(vi.mocked(onUndo)).toHaveBeenCalledTimes(1);
    });

    it('Input 요소에 포커스된 경우 Ctrl+Z 입력 시 onUndo가 호출되지 않아야 한다', async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      // input 요소를 DOM에 추가하고 포커스
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      fireKeyDown('z', { ctrlKey: true });
      expect(vi.mocked(onUndo)).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('Textarea 요소에 포커스된 경우 Ctrl+Z 입력 시 onUndo가 호출되지 않아야 한다', async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      fireKeyDown('z', { ctrlKey: true });
      expect(vi.mocked(onUndo)).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });
  });

  // ========================
  // Cycle 4: Ctrl+D → onDuplicate
  // ========================
  describe('Cycle 4: Ctrl+D → onDuplicate', () => {
    it('Ctrl+D 입력 시 onDuplicate가 호출되어야 한다', async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      fireKeyDown('d', { ctrlKey: true });
      expect(vi.mocked(onDuplicate)).toHaveBeenCalledTimes(1);
    });
  });

  // ========================
  // Cycle 5: Ctrl+A → onSelectAll
  // ========================
  describe('Cycle 5: Ctrl+A → onSelectAll', () => {
    it('Ctrl+A 입력 시 onSelectAll가 호출되어야 한다', async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      fireKeyDown('a', { ctrlKey: true });
      expect(vi.mocked(onSelectAll)).toHaveBeenCalledTimes(1);
    });
  });

  // ========================
  // Cycle 6: enabled=false 시 이벤트 무시
  // ========================
  describe('Cycle 6: enabled=false 시 이벤트 무시', () => {
    it('enabled=false 시 Delete 키 입력 시 onDelete가 호출되지 않아야 한다', async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll, enabled: false })
      );

      fireKeyDown('Delete');
      expect(vi.mocked(onDelete)).not.toHaveBeenCalled();
    });
  });

  // ========================
  // Cycle 6 (추가): contenteditable 및 비입력 요소 포커스 시 단축키 동작
  // ========================
  describe('Cycle 6 (추가): contenteditable 포커스 시 동작', () => {
    it('contenteditable 요소에 포커스 시 Delete 키가 호출되어야 한다 (INPUT/TEXTAREA가 아니므로)', async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      // contenteditable div는 INPUT/TEXTAREA가 아니므로 isTypingInInput이 false
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      document.body.appendChild(div);
      div.focus();

      // contenteditable은 INPUT/TEXTAREA가 아니므로 단축키 차단되지 않음
      // (단, 실제 훅 구현이 tagName으로만 체크하면 호출됨)
      fireKeyDown('Delete');
      // isTypingInInput은 INPUT/TEXTAREA만 체크하므로 onDelete는 호출되어야 함
      expect(vi.mocked(onDelete)).toHaveBeenCalled();

      document.body.removeChild(div);
    });

    it('일반 div에 포커스 시 Ctrl+Z는 onUndo를 호출해야 한다', async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      const div = document.createElement('div');
      div.setAttribute('tabindex', '0');
      document.body.appendChild(div);
      div.focus();

      fireKeyDown('z', { ctrlKey: true });
      expect(vi.mocked(onUndo)).toHaveBeenCalledTimes(1);

      document.body.removeChild(div);
    });

    it('Input 요소에 포커스된 경우 Delete 키 입력 시 onDelete가 호출되지 않아야 한다', async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      fireKeyDown('Delete');
      expect(vi.mocked(onDelete)).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });
  });

  // ========================
  // Cycle 7: 언마운트 시 이벤트 리스너 제거
  // ========================
  describe('Cycle 7: 언마운트 시 정리', () => {
    it('언마운트 후 Delete 키 입력 시 onDelete가 호출되지 않아야 한다', async () => {
      const { useKeyboardShortcuts } = await import('../useKeyboardShortcuts');
      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({ onDelete, onDuplicate, onUndo, onBypass, onSelectAll })
      );

      unmount();
      fireKeyDown('Delete');
      expect(vi.mocked(onDelete)).not.toHaveBeenCalled();
    });
  });
});
