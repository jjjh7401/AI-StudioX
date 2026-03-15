// useCanvas.test.ts: useCanvas 훅 TDD 스펙 테스트
// RED-GREEN-REFACTOR 사이클로 구현

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Node } from '../../types';

// D3 모킹: DOM 없는 환경에서도 테스트 가능하도록
// zoom behavior의 핵심 동작만 흉내냄
const mockScaleExtent = vi.fn().mockReturnThis();
const mockFilter = vi.fn().mockReturnThis();
const mockZoomOn = vi.fn().mockReturnThis();
const mockScaleBy = vi.fn();
const mockZoomTransformFn = vi.fn();

// D3 zoom behavior 모킹 객체
const mockZoomBehavior = {
  scaleExtent: mockScaleExtent,
  filter: mockFilter,
  on: mockZoomOn,
  scaleBy: mockScaleBy,
  transform: mockZoomTransformFn,
};

// D3 selection call 추적용
const mockTransitionCall = vi.fn().mockReturnThis();
const mockTransitionDuration = vi.fn().mockReturnValue({ call: mockTransitionCall });
const mockTransition = vi.fn().mockReturnValue({
  call: mockTransitionCall,
  duration: mockTransitionDuration,
});
const mockSelectionCall = vi.fn().mockReturnThis();
const mockSelectionOn = vi.fn().mockReturnThis();
const mockSelectionNode = vi.fn().mockReturnValue(null);

const mockSelection = {
  call: mockSelectionCall,
  on: mockSelectionOn,
  transition: mockTransition,
  node: mockSelectionNode,
};

// D3 zoomTransform invert 모킹
const mockInvert = vi.fn((coords: [number, number]) => coords);
const mockZoomTransformReturn = { invert: mockInvert, x: 0, y: 0, k: 1 };
const mockZoomTransformCall = vi.fn(() => mockZoomTransformReturn);

// D3 zoomIdentity 모킹
const mockZoomIdentityTranslate = vi.fn().mockReturnValue({
  scale: vi.fn().mockReturnValue({ x: 100, y: 50, k: 1.5 }),
});

vi.mock('d3', () => ({
  zoom: vi.fn(() => mockZoomBehavior),
  select: vi.fn(() => mockSelection),
  zoomTransform: mockZoomTransformCall,
  zoomIdentity: {
    translate: mockZoomIdentityTranslate,
  },
}));

// 테스트용 svgRef 생성 헬퍼
function createMockSvgRef(element: SVGSVGElement | null = null) {
  return { current: element };
}

// 가상의 SVGSVGElement 생성
function createMockSvgElement(): SVGSVGElement {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;
  return el;
}

describe('useCanvas 훅', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 메서드 체이닝 재설정
    mockScaleExtent.mockReturnValue(mockZoomBehavior);
    mockFilter.mockReturnValue(mockZoomBehavior);
    mockZoomOn.mockReturnValue(mockZoomBehavior);
    mockSelectionCall.mockReturnValue(mockSelection);
    mockSelectionOn.mockReturnValue(mockSelection);
    mockSelectionNode.mockReturnValue(null);
    mockTransition.mockReturnValue({ call: mockTransitionCall, duration: mockTransitionDuration });
    mockTransitionCall.mockReturnValue(mockSelection);
    mockTransitionDuration.mockReturnValue({ call: mockTransitionCall });
    mockZoomTransformCall.mockReturnValue(mockZoomTransformReturn);
    mockInvert.mockImplementation((coords: [number, number]) => coords);
    mockZoomIdentityTranslate.mockReturnValue({
      scale: vi.fn().mockReturnValue({ x: 0, y: 0, k: 1 }),
    });
  });

  // -------------------------
  // TASK-M1-002: panZoom 초기 상태 테스트
  // -------------------------
  describe('panZoom 초기 상태', () => {
    it('초기 panZoom은 {x:0, y:0, k:1} 이어야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgRef = createMockSvgRef(createMockSvgElement());
      const onPanZoomChange = vi.fn();

      const { result } = renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      expect(result.current.panZoom).toEqual({ x: 0, y: 0, k: 1 });
    });
  });

  // -------------------------
  // TASK-M1-002: restoreTransform 테스트
  // -------------------------
  describe('restoreTransform', () => {
    it('restoreTransform({x:100, y:50, k:1.5}) 호출 시 panZoom 상태가 업데이트되어야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgRef = createMockSvgRef(null); // svg 없는 상황 - 상태만 업데이트됨
      const onPanZoomChange = vi.fn();

      const { result } = renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      act(() => {
        result.current.restoreTransform({ x: 100, y: 50, k: 1.5 });
      });

      expect(result.current.panZoom).toEqual({ x: 100, y: 50, k: 1.5 });
    });

    it('restoreTransform 호출 시 onPanZoomChange 콜백이 호출되어야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgRef = createMockSvgRef(null);
      const onPanZoomChange = vi.fn();

      const { result } = renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      act(() => {
        result.current.restoreTransform({ x: 100, y: 50, k: 1.5 });
      });

      expect(onPanZoomChange).toHaveBeenCalledWith({ x: 100, y: 50, k: 1.5 });
    });
  });

  // -------------------------
  // TASK-M1-004: D3 zoom behavior 초기화 테스트
  // -------------------------
  describe('D3 zoom 초기화', () => {
    it('scaleExtent가 [0.2, 3] 으로 설정되어야 한다', async () => {
      const d3 = await import('d3');
      const { useCanvas } = await import('../useCanvas');
      const svgRef = createMockSvgRef(createMockSvgElement());
      // svg node()가 truthy를 반환하도록 설정
      mockSelectionNode.mockReturnValue(createMockSvgElement());
      const onPanZoomChange = vi.fn();

      renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      expect(d3.zoom).toHaveBeenCalled();
      expect(mockScaleExtent).toHaveBeenCalledWith([0.2, 3]);
    });

    it('zoom filter 함수가 등록되어야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgRef = createMockSvgRef(createMockSvgElement());
      mockSelectionNode.mockReturnValue(createMockSvgElement());
      const onPanZoomChange = vi.fn();

      renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      expect(mockFilter).toHaveBeenCalled();
    });

    it('zoom filter: wheel 이벤트는 항상 허용되어야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgRef = createMockSvgRef(createMockSvgElement());
      mockSelectionNode.mockReturnValue(createMockSvgElement());
      const onPanZoomChange = vi.fn();

      renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      // filter 함수 추출
      const filterCalls = mockFilter.mock.calls;
      expect(filterCalls.length).toBeGreaterThan(0);
      const filterFn = filterCalls[filterCalls.length - 1][0];

      const wheelEvent = { type: 'wheel', target: document.createElement('div') };
      expect(filterFn(wheelEvent)).toBe(true);
    });

    it('zoom filter: .node-body 요소 위에서는 이벤트가 차단되어야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgRef = createMockSvgRef(createMockSvgElement());
      mockSelectionNode.mockReturnValue(createMockSvgElement());
      const onPanZoomChange = vi.fn();

      renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      const filterCalls = mockFilter.mock.calls;
      const filterFn = filterCalls[filterCalls.length - 1][0];

      // node-body 클래스가 있는 요소 생성
      const nodeBodyDiv = document.createElement('div');
      nodeBodyDiv.className = 'node-body';
      document.body.appendChild(nodeBodyDiv);

      const wheelEventOnNode = { type: 'wheel', target: nodeBodyDiv };
      expect(filterFn(wheelEventOnNode)).toBe(false);

      document.body.removeChild(nodeBodyDiv);
    });
  });

  // -------------------------
  // TASK-M1-006: Zoom API 테스트
  // -------------------------
  describe('zoomIn', () => {
    it('zoomIn() 호출 시 transition().call(scaleBy, 1.2)가 실행되어야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgElement = createMockSvgElement();
      const svgRef = createMockSvgRef(svgElement);
      mockSelectionNode.mockReturnValue(svgElement);
      const onPanZoomChange = vi.fn();

      const { result } = renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      // 초기화 시 call된 것들 초기화
      mockTransitionCall.mockClear();
      mockTransition.mockClear();

      act(() => {
        result.current.zoomIn();
      });

      // transition이 호출되고 call(scaleBy, 1.2)가 실행되어야 함
      expect(mockTransition).toHaveBeenCalled();
      expect(mockTransitionCall).toHaveBeenCalledWith(mockZoomBehavior.scaleBy, 1.2);
    });
  });

  describe('zoomOut', () => {
    it('zoomOut() 호출 시 transition().call(scaleBy, 0.8)이 실행되어야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgElement = createMockSvgElement();
      const svgRef = createMockSvgRef(svgElement);
      mockSelectionNode.mockReturnValue(svgElement);
      const onPanZoomChange = vi.fn();

      const { result } = renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      mockTransitionCall.mockClear();
      mockTransition.mockClear();

      act(() => {
        result.current.zoomOut();
      });

      expect(mockTransition).toHaveBeenCalled();
      expect(mockTransitionCall).toHaveBeenCalledWith(mockZoomBehavior.scaleBy, 0.8);
    });
  });

  describe('zoomToFit', () => {
    it('zoomToFit([]) 호출 시 아무것도 하지 않아야 한다 (노드 없음)', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgElement = createMockSvgElement();
      const svgRef = createMockSvgRef(svgElement);
      mockSelectionNode.mockReturnValue(svgElement);
      const onPanZoomChange = vi.fn();

      const { result } = renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      mockTransition.mockClear();

      act(() => {
        result.current.zoomToFit([]);
      });

      // 노드가 없으면 transition이 호출되지 않아야 함
      expect(mockTransition).not.toHaveBeenCalled();
    });

    it('zoomToFit: hidden 노드만 있을 때도 아무것도 하지 않아야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgElement = createMockSvgElement();
      const svgRef = createMockSvgRef(svgElement);
      mockSelectionNode.mockReturnValue(svgElement);
      const onPanZoomChange = vi.fn();

      const { result } = renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      mockTransition.mockClear();

      const hiddenNodes: Partial<Node>[] = [
        { hidden: true, position: { x: 0, y: 0 }, size: { width: 100, height: 100 } },
      ];

      act(() => {
        result.current.zoomToFit(hiddenNodes as Node[]);
      });

      expect(mockTransition).not.toHaveBeenCalled();
    });
  });

  // -------------------------
  // TASK-M1-008: getWorldPosition 테스트
  // -------------------------
  describe('getWorldPosition', () => {
    it('항등 변환: getWorldPosition(100, 200)는 [100, 200]을 반환해야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgElement = createMockSvgElement();
      const svgRef = createMockSvgRef(svgElement);
      const onPanZoomChange = vi.fn();

      // 항등 변환 설정
      mockInvert.mockImplementation((coords: [number, number]) => coords);
      mockZoomTransformCall.mockReturnValue({ invert: mockInvert, x: 0, y: 0, k: 1 });

      const { result } = renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      const pos = result.current.getWorldPosition(100, 200);
      expect(pos).toEqual([100, 200]);
    });

    it('스케일 2배: getWorldPosition(200, 400)는 [100, 200]을 반환해야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgElement = createMockSvgElement();
      const svgRef = createMockSvgRef(svgElement);
      const onPanZoomChange = vi.fn();

      // 스케일 2배 invert는 /2 연산
      mockInvert.mockImplementation(([x, y]: [number, number]) => [x / 2, y / 2]);
      mockZoomTransformCall.mockReturnValue({ invert: mockInvert, x: 0, y: 0, k: 2 });

      const { result } = renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      const pos = result.current.getWorldPosition(200, 400);
      expect(pos).toEqual([100, 200]);
    });

    it('svgRef.current가 null일 때 입력 좌표를 그대로 반환해야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgRef = createMockSvgRef(null);
      const onPanZoomChange = vi.fn();

      const { result } = renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      const pos = result.current.getWorldPosition(100, 200);
      expect(pos).toEqual([100, 200]);
    });
  });

  // -------------------------
  // isMiddleMousePanning 초기 상태 테스트
  // -------------------------
  describe('isMiddleMousePanning 초기 상태', () => {
    it('초기 isMiddleMousePanning은 false이어야 한다', async () => {
      const { useCanvas } = await import('../useCanvas');
      const svgRef = createMockSvgRef(createMockSvgElement());
      const onPanZoomChange = vi.fn();

      const { result } = renderHook(() =>
        useCanvas({ svgRef, activeTool: 'select', onPanZoomChange })
      );

      expect(result.current.isMiddleMousePanning).toBe(false);
    });
  });
});
