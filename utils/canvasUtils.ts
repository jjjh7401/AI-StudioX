// canvasUtils: 캔버스 좌표 변환, 뷰포트 경계 계산, Viewport Culling 유틸리티
// TODO: App.tsx의 coordinate transform 인라인 코드를 순수 함수로 추출

/**
 * 변환(pan/zoom) 정보를 담는 타입
 */
export interface Transform {
  x: number;
  y: number;
  k: number;
}

/**
 * 2D 좌표를 담는 타입
 */
export interface Vec2 {
  x: number;
  y: number;
}

/**
 * 노드의 월드 좌표 경계를 담는 타입
 */
export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 뷰포트 정보를 담는 타입
 */
export interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  k: number;
}

/**
 * 화면 좌표(screen)를 월드 좌표(world)로 변환한다.
 * 공식: world = (screen - offset) / scale
 *
 * @param screenX - 화면 기준 X 좌표
 * @param screenY - 화면 기준 Y 좌표
 * @param transform - 현재 pan/zoom 변환값 { x, y, k }
 * @returns 월드 좌표 { x, y }
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  transform: Transform
): Vec2 {
  return {
    x: (screenX - transform.x) / transform.k,
    y: (screenY - transform.y) / transform.k,
  };
}

/**
 * 월드 좌표(world)를 화면 좌표(screen)로 변환한다.
 * 공식: screen = world * scale + offset
 *
 * @param worldX - 월드 기준 X 좌표
 * @param worldY - 월드 기준 Y 좌표
 * @param transform - 현재 pan/zoom 변환값 { x, y, k }
 * @returns 화면 좌표 { x, y }
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  transform: Transform
): Vec2 {
  return {
    x: worldX * transform.k + transform.x,
    y: worldY * transform.k + transform.y,
  };
}

/**
 * 노드가 현재 뷰포트 내에 보이는지 확인한다 (Viewport Culling).
 * 노드와 뷰포트의 월드 좌표 범위가 겹치면 true를 반환한다.
 *
 * @param node - 노드의 월드 좌표 경계 { x, y, width, height }
 * @param viewport - 뷰포트 정보 { x, y, width, height, k }
 *   - x, y: pan 오프셋 (화면 기준)
 *   - width, height: 화면(캔버스) 크기
 *   - k: 현재 줌 스케일
 * @returns 노드가 뷰포트와 겹치면 true, 완전히 밖에 있으면 false
 */
export function isNodeInViewport(
  node: NodeBounds,
  viewport: ViewportBounds
): boolean {
  // 뷰포트의 월드 좌표 범위 계산
  // 화면 좌표 (0, 0) -> 월드: (-x / k, -y / k)
  // 화면 좌표 (width, height) -> 월드: ((width - x) / k, (height - y) / k)
  const viewLeft = -viewport.x / viewport.k;
  const viewTop = -viewport.y / viewport.k;
  const viewRight = (viewport.width - viewport.x) / viewport.k;
  const viewBottom = (viewport.height - viewport.y) / viewport.k;

  // 노드의 월드 좌표 범위
  const nodeLeft = node.x;
  const nodeTop = node.y;
  const nodeRight = node.x + node.width;
  const nodeBottom = node.y + node.height;

  // AABB 교차 검사 (겹치지 않는 조건의 부정)
  const noOverlap =
    nodeRight < viewLeft ||
    nodeLeft > viewRight ||
    nodeBottom < viewTop ||
    nodeTop > viewBottom;

  return !noOverlap;
}
