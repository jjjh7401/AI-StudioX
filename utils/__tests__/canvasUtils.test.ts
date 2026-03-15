// canvasUtils.test.ts: 캔버스 좌표 변환 및 뷰포트 컬링 함수 TDD 테스트
import { describe, it, expect } from 'vitest';
import { screenToWorld, worldToScreen, isNodeInViewport } from '../canvasUtils';

describe('screenToWorld', () => {
  it('기본 변환: 오프셋과 스케일이 기본값일 때 좌표가 동일해야 한다', () => {
    const result = screenToWorld(100, 200, { x: 0, y: 0, k: 1 });
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
  });

  it('오프셋 적용: transform.x/y 만큼 역산해야 한다', () => {
    const result = screenToWorld(150, 250, { x: 50, y: 100, k: 1 });
    expect(result.x).toBe(100);
    expect(result.y).toBe(150);
  });

  it('스케일 적용: 스케일로 나눠야 한다', () => {
    const result = screenToWorld(200, 400, { x: 0, y: 0, k: 2 });
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
  });

  it('오프셋+스케일 동시 적용', () => {
    // world = (screen - offset) / scale
    // x: (300 - 100) / 2 = 100
    // y: (500 - 200) / 2 = 150
    const result = screenToWorld(300, 500, { x: 100, y: 200, k: 2 });
    expect(result.x).toBe(100);
    expect(result.y).toBe(150);
  });

  it('소수점 스케일 처리', () => {
    const result = screenToWorld(50, 50, { x: 0, y: 0, k: 0.5 });
    expect(result.x).toBeCloseTo(100);
    expect(result.y).toBeCloseTo(100);
  });
});

describe('worldToScreen', () => {
  it('기본 변환: 오프셋과 스케일이 기본값일 때 좌표가 동일해야 한다', () => {
    const result = worldToScreen(100, 200, { x: 0, y: 0, k: 1 });
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
  });

  it('오프셋 적용: transform.x/y 만큼 더해야 한다', () => {
    const result = worldToScreen(100, 150, { x: 50, y: 100, k: 1 });
    expect(result.x).toBe(150);
    expect(result.y).toBe(250);
  });

  it('스케일 적용: 스케일을 곱해야 한다', () => {
    const result = worldToScreen(100, 200, { x: 0, y: 0, k: 2 });
    expect(result.x).toBe(200);
    expect(result.y).toBe(400);
  });

  it('오프셋+스케일 동시 적용', () => {
    // screen = world * scale + offset
    // x: 100 * 2 + 100 = 300
    // y: 150 * 2 + 200 = 500
    const result = worldToScreen(100, 150, { x: 100, y: 200, k: 2 });
    expect(result.x).toBe(300);
    expect(result.y).toBe(500);
  });

  it('screenToWorld의 역연산이어야 한다', () => {
    const transform = { x: 150, y: 80, k: 1.5 };
    const world = screenToWorld(300, 240, transform);
    const screen = worldToScreen(world.x, world.y, transform);
    expect(screen.x).toBeCloseTo(300);
    expect(screen.y).toBeCloseTo(240);
  });
});

describe('isNodeInViewport', () => {
  it('노드가 뷰포트 완전히 안에 있을 때 true를 반환해야 한다', () => {
    const node = { x: 100, y: 100, width: 200, height: 100 };
    const viewport = { x: 0, y: 0, width: 800, height: 600, k: 1 };
    expect(isNodeInViewport(node, viewport)).toBe(true);
  });

  it('노드가 뷰포트 완전히 밖에 있을 때 false를 반환해야 한다', () => {
    const node = { x: 1000, y: 1000, width: 200, height: 100 };
    const viewport = { x: 0, y: 0, width: 800, height: 600, k: 1 };
    expect(isNodeInViewport(node, viewport)).toBe(false);
  });

  it('노드가 뷰포트와 일부 겹칠 때 true를 반환해야 한다', () => {
    const node = { x: 700, y: 500, width: 200, height: 200 };
    const viewport = { x: 0, y: 0, width: 800, height: 600, k: 1 };
    expect(isNodeInViewport(node, viewport)).toBe(true);
  });

  it('노드가 뷰포트 왼쪽 밖에 있을 때 false를 반환해야 한다', () => {
    const node = { x: -300, y: 100, width: 200, height: 100 };
    const viewport = { x: 0, y: 0, width: 800, height: 600, k: 1 };
    expect(isNodeInViewport(node, viewport)).toBe(false);
  });

  it('스케일 적용 시 뷰포트 월드 범위를 올바르게 계산해야 한다', () => {
    // viewport.x=0, y=0, width=800, height=600, k=2
    // 월드 좌표 기준 뷰포트 범위: x=[0, 400], y=[0, 300]
    // 노드 (0, 0, 100, 100) -> 범위 안에 있음
    const node = { x: 0, y: 0, width: 100, height: 100 };
    const viewport = { x: 0, y: 0, width: 800, height: 600, k: 2 };
    expect(isNodeInViewport(node, viewport)).toBe(true);
  });

  it('스케일 적용 시 뷰포트 밖 노드 false를 반환해야 한다', () => {
    // viewport.x=0, y=0, width=800, height=600, k=2
    // 월드 좌표 기준 뷰포트 범위: x=[0, 400], y=[0, 300]
    // 노드 (500, 0, 100, 100) -> x=500+100=600 > 400 이므로 밖
    const node = { x: 500, y: 0, width: 100, height: 100 };
    const viewport = { x: 0, y: 0, width: 800, height: 600, k: 2 };
    expect(isNodeInViewport(node, viewport)).toBe(false);
  });
});
