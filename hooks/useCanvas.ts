// useCanvas.ts: D3 기반 pan/zoom 캔버스 로직을 캡슐화하는 React 훅
// App.tsx에서 캔버스 관련 상태와 로직을 분리하기 위해 추출

import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { PanZoom, Node } from '../types';

// @MX:ANCHOR: useCanvas 훅의 입력 옵션 인터페이스
// @MX:REASON: App.tsx의 svgRef, activeTool 등 핵심 의존성을 주입받아야 함
export interface UseCanvasOptions {
  svgRef: React.RefObject<SVGSVGElement | null>;
  activeTool: string;
  onPanZoomChange: (panZoom: PanZoom) => void;
}

// @MX:ANCHOR: useCanvas 훅이 반환하는 값 인터페이스
// @MX:REASON: ZoomControls, 노드 드래그, 좌표 변환 등 여러 곳에서 참조됨
export interface UseCanvasReturn {
  panZoom: PanZoom;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: (nodes: Node[]) => void;
  getWorldPosition: (screenX: number, screenY: number) => [number, number];
  restoreTransform: (panZoom: PanZoom) => void;
  isMiddleMousePanning: boolean;
}

// @MX:ANCHOR: 캔버스 pan/zoom 상태 및 D3 zoom behavior를 관리하는 훅
// @MX:REASON: App.tsx의 panZoom, zoomBehaviorRef, isMiddleMousePanning 상태를 대체함
// @MX:SPEC: SPEC-UI-001 M1
export function useCanvas(options: UseCanvasOptions): UseCanvasReturn {
  const { svgRef, activeTool, onPanZoomChange } = options;

  // 캔버스 pan/zoom 상태 (초기값: 원점, 스케일 1)
  const [panZoom, setPanZoom] = useState<PanZoom>({ x: 0, y: 0, k: 1 });
  // 중간 버튼 패닝 상태
  const [isMiddleMousePanning, setIsMiddleMousePanning] = useState(false);
  // D3 zoom behavior 참조
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // D3 zoom 초기화 useEffect
  // activeTool이 변경될 때마다 zoom 필터를 재설정해야 하므로 의존성에 포함
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .filter((event: Event) => {
        // node-body 위에서는 zoom/pan 비활성화
        const isNode = !!(event.target as Element).closest?.('.node-body');
        if (isNode) return false;
        // wheel 이벤트는 항상 허용
        if (event.type === 'wheel') return true;
        // pan 도구일 때 마우스다운 허용
        if (event.type === 'mousedown' && activeTool === 'pan') return true;
        // select 도구 + 중간 버튼 클릭 허용
        if (event.type === 'mousedown' && activeTool === 'select' && (event as MouseEvent).button === 1) {
          return true;
        }
        return false;
      })
      .on('start', (event) => {
        // 중간 버튼 패닝 시작 감지
        if (activeTool === 'select' && event.sourceEvent && (event.sourceEvent as MouseEvent).button === 1) {
          setIsMiddleMousePanning(true);
        }
      })
      .on('zoom', (event) => {
        // zoom 이벤트: panZoom 상태 업데이트 및 콜백 호출
        const transform = event.transform as PanZoom;
        setPanZoom(transform);
        onPanZoomChange(transform);
      })
      .on('end', () => {
        setIsMiddleMousePanning(false);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);
    // 더블클릭 zoom 비활성화
    svg.on('dblclick.zoom', null);

    return () => {
      svg.on('.zoom', null);
    };
  }, [activeTool, svgRef, onPanZoomChange]);

  // zoom in: 현재 뷰에서 1.2배 확대
  const zoomIn = useCallback(() => {
    if (!zoomBehaviorRef.current || !svgRef.current) return;
    d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 1.2);
  }, [svgRef]);

  // zoom out: 현재 뷰에서 0.8배 축소
  const zoomOut = useCallback(() => {
    if (!zoomBehaviorRef.current || !svgRef.current) return;
    d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 0.8);
  }, [svgRef]);

  // zoom to fit: 모든 노드가 화면에 맞도록 변환
  const zoomToFit = useCallback((nodes: Node[]) => {
    if (!zoomBehaviorRef.current || !svgRef.current) return;
    const visibleNodes = nodes.filter((n: Node) => !n.hidden);
    // 노드가 없으면 아무것도 하지 않음
    if (visibleNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const parent = svg.node()?.parentElement;
    if (!parent) return;

    const { width, height } = parent.getBoundingClientRect();
    const x0 = Math.min(...visibleNodes.map((n: Node) => n.position.x));
    const x1 = Math.max(...visibleNodes.map((n: Node) => n.position.x + n.size.width));
    const y0 = Math.min(...visibleNodes.map((n: Node) => n.position.y));
    const y1 = Math.max(...visibleNodes.map((n: Node) => n.position.y + n.size.height));

    // 여백 10%를 두고 최대 zoom 3배까지 맞춤
    const k = Math.min(3, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height));
    const x = (width - k * (x0 + x1)) / 2;
    const y = (height - k * (y0 + y1)) / 2;

    svg
      .transition()
      .duration(750)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(x, y).scale(k));
  }, [svgRef]);

  // 스크린 좌표 -> 월드 좌표 변환
  // D3 zoomTransform의 invert 메서드를 래핑
  const getWorldPosition = useCallback(
    (screenX: number, screenY: number): [number, number] => {
      if (!svgRef.current) return [screenX, screenY];
      const currentTransform = d3.zoomTransform(svgRef.current);
      return currentTransform.invert([screenX, screenY]) as [number, number];
    },
    [svgRef]
  );

  // 저장된 panZoom 값으로 캔버스 변환 복원
  // 프로젝트 로드 시 사용
  const restoreTransform = useCallback(
    (savedPanZoom: PanZoom) => {
      if (!zoomBehaviorRef.current || !svgRef.current) {
        // svg가 아직 준비되지 않았으면 상태만 업데이트
        setPanZoom(savedPanZoom);
        onPanZoomChange(savedPanZoom);
        return;
      }
      const transform = d3.zoomIdentity
        .translate(savedPanZoom.x, savedPanZoom.y)
        .scale(savedPanZoom.k);
      d3.select(svgRef.current).call(zoomBehaviorRef.current.transform, transform);
    },
    [svgRef, onPanZoomChange]
  );

  return {
    panZoom,
    zoomIn,
    zoomOut,
    zoomToFit,
    getWorldPosition,
    restoreTransform,
    isMiddleMousePanning,
  };
}
