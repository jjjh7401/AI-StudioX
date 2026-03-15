---
id: SPEC-UI-001
type: plan
version: "1.0.0"
spec_ref: SPEC-UI-001/spec.md
---

# SPEC-UI-001 구현 계획

## 1. 구현 접근 방식

### 1.1 핵심 전략: 점진적 리팩토링 + 기능 완성

현재 코드베이스는 작동하는 프로토타입 수준이며, App.tsx 단일 파일(3000+ 라인)에 모든 로직이 집중되어 있다. 구현 전략은 다음과 같다:

1. **기존 기능 보존**: 현재 동작하는 28개 노드 타입과 AI 통합 기능을 그대로 유지
2. **점진적 모듈 분리**: App.tsx의 로직을 커스텀 훅과 컨텍스트로 단계적 분리
3. **프로덕션 품질 강화**: 에러 처리, 성능 최적화, 사용자 경험 개선

### 1.2 기술 스택 결정

| 영역 | 현재 기술 | 유지/변경 | 근거 |
|------|----------|----------|------|
| UI 프레임워크 | React 19.2.0 | 유지 | 현재 코드베이스 전체가 React 기반 |
| 언어 | TypeScript 5.8.2 | 유지 | 타입 안전성 확보 |
| 번들러 | Vite 6.2.0 | 유지 | 빠른 HMR 및 빌드 |
| 캔버스 | D3 ^7.9.0 | 유지 | pan/zoom 동작 안정적 |
| 노드 드래그 | react-draggable ^4.5.0 | 유지 | 현재 잘 작동 중 |
| 상태관리 | use-immer ^0.11.0 | 유지 | 불변 상태 패턴 적합 |
| AI API | @google/genai ^1.29.0 | 유지 | Gemini 통합 완료 |
| 스타일링 | Tailwind CSS | 유지 | 유틸리티 기반 스타일링 |
| 로컬 저장소 | IndexedDB | 유지 | 대용량 바이너리 저장에 적합 |

### 1.3 추가 검토 기술

| 기술 | 용도 | 도입 시기 |
|------|------|----------|
| React.memo / useMemo / useCallback | 렌더링 최적화 | Milestone 1 |
| Context API | 전역 상태 공유 (캔버스, 프로젝트) | Milestone 2 |
| 커스텀 훅 분리 | useCanvas, useNodes, useConnections 등 | Milestone 2 |
| Web Worker (선택적) | 무거운 이미지 처리 오프로드 | Milestone 4 |
| Vitest | 단위 테스트 프레임워크 | 전 구간 |

---

## 2. 마일스톤 (우선순위 기반)

### Milestone 1: 캔버스 시스템 안정화 [Priority: High]

**목표**: D3 기반 무한 캔버스의 pan/zoom 동작을 안정화하고 성능을 최적화한다.

**작업 분해**:

- [ ] 1-1. 캔버스 pan/zoom 로직을 `useCanvas` 커스텀 훅으로 분리
  - D3 zoom behavior 초기화 및 이벤트 핸들링 캡슐화
  - panZoom 상태(x, y, k) 관리 로직 분리
  - 줌 레벨 제어(ZoomControls) 연동
- [ ] 1-2. 뷰포트 기반 노드 가시성 최적화 (Viewport Culling)
  - 현재 뷰포트 밖의 노드는 렌더링을 건너뜀
  - 뷰포트 경계 계산 유틸리티 구현
- [ ] 1-3. 캔버스 배경 그리드/도트 패턴 렌더링
  - 줌 레벨에 따른 그리드 밀도 조절
- [ ] 1-4. 미니맵 구현 (선택적)
  - 전체 노드 분포를 축소하여 표시
  - 현재 뷰포트 영역 하이라이트

**관련 요구사항**: REQ-CANVAS-001~006

---

### Milestone 2: 노드 아키텍처 리팩토링 [Priority: High]

**목표**: App.tsx에 집중된 노드 관리 로직을 체계적으로 분리하고, 노드 추가/수정이 용이한 구조를 구축한다.

**작업 분해**:

- [ ] 2-1. 노드 상태 관리를 `useNodes` 커스텀 훅으로 분리
  - 노드 CRUD(생성, 읽기, 수정, 삭제) 로직
  - 노드 선택/다중 선택 관리
  - 노드 드래그/리사이즈 핸들링
  - 노드 복제 로직
- [ ] 2-2. 노드 팩토리 패턴 구현
  - `createNodeFactory(type: NodeType)` 함수로 노드 생성 표준화
  - 각 노드 타입별 기본 데이터, 커넥터 정의를 별도 설정 파일로 분리
  - 현재 App.tsx `createNode` 함수의 거대 switch문 해소
- [ ] 2-3. 노드 렌더 순서(z-index) 관리 최적화
  - nodeRenderOrder 배열 관리 로직 분리
  - 선택된 노드 최상위 이동 로직
- [ ] 2-4. Group 노드 containment 로직 개선
  - 노드 드래그 시 그룹 내 포함 여부 자동 감지
  - 그룹 크기 자동 조절(fitGroup) 안정화
- [ ] 2-5. 다중 선택 기능 강화
  - Shift+Click 다중 선택
  - 드래그 박스 선택 (Marquee Selection) 구현
  - 선택된 노드 일괄 이동/삭제

**관련 요구사항**: REQ-NODE-001~010

---

### Milestone 3: 커넥션 시스템 완성 [Priority: High]

**목표**: 노드 간 데이터 흐름(커넥션)을 안정적으로 관리하고, 데이터 전파 메커니즘을 완성한다.

**작업 분해**:

- [ ] 3-1. 커넥션 상태 관리를 `useConnections` 커스텀 훅으로 분리
  - 커넥션 CRUD 로직
  - 드래그 중 임시 커넥션 렌더링
  - 커넥션 타입 호환성 검증
- [ ] 3-2. 데이터 전파 엔진 구현
  - 커넥션 그래프 기반 토폴로지 정렬
  - 출력 노드 데이터 변경 시 다운스트림 자동 갱신
  - 순환 참조 감지 및 방지
- [ ] 3-3. 커넥션 라인 렌더링 개선
  - 베지어 곡선 경로 최적화
  - 커넥션 위에 데이터 타입 아이콘 표시
  - 선택된 커넥션 하이라이트 강화
- [ ] 3-4. 커넥션 재연결 (Reconnection) 기능
  - 기존 커넥션의 한쪽 끝을 드래그하여 다른 커넥터로 연결 변경

**관련 요구사항**: REQ-CONN-001~006

---

### Milestone 4: AI 통합 강화 [Priority: Medium]

**목표**: Google Gemini API 통합을 안정화하고, AI 생성 파이프라인의 에러 처리 및 사용자 경험을 개선한다.

**작업 분해**:

- [ ] 4-1. AI 서비스 계층 리팩토링
  - geminiService의 에러 핸들링 표준화
  - 재시도(retry) 로직 추가 (최대 3회, 지수 백오프)
  - API 요청 큐 관리 (동시 요청 제한)
- [ ] 4-2. 노드별 AI 생성 로직 분리
  - App.tsx의 `handleGenerate` 거대 함수를 노드 타입별 핸들러로 분리
  - 각 핸들러를 `useNodeGeneration` 커스텀 훅으로 캡슐화
- [ ] 4-3. AI 생성 진행 상태 개선
  - 노드별 로딩 프로그레스 바 (가능한 경우)
  - 에러 메시지 사용자 친화적 표시
  - 생성 취소 기능 (AbortController 활용)
- [ ] 4-4. Storyboard/Script 파이프라인 최적화
  - 다중 장면 순차 생성의 안정성 강화
  - 실패 장면 재시도 기능
  - 일관된 스타일 유지를 위한 시드 관리
- [ ] 4-5. 이미지 처리 파이프라인
  - Composite(합성), Stitch(이어붙이기) 노드의 처리 안정성 개선
  - 대용량 이미지 메모리 관리 최적화
  - Web Worker를 통한 무거운 이미지 처리 오프로드 (선택적)

**관련 요구사항**: REQ-AI-001~011

---

### Milestone 5: 프로젝트 관리 및 UI 완성 [Priority: Medium]

**목표**: 프로젝트 저장/로드를 안정화하고, UI/UX를 프로덕션 수준으로 완성한다.

**작업 분해**:

- [ ] 5-1. 프로젝트 저장/로드 안정화
  - IndexedDB 저장 시 대용량 이미지 데이터 처리 최적화
  - 프로젝트 내보내기/가져오기 (JSON 형식)
  - 자동 저장(Auto-save) 기능 구현
- [ ] 5-2. Undo/Redo 시스템 구현
  - 상태 히스토리 스택 관리
  - Ctrl+Z(Undo), Ctrl+Shift+Z(Redo) 단축키
  - 히스토리 크기 제한 (메모리 관리)
- [ ] 5-3. 키보드 단축키 체계 구축
  - B: Bypass 토글
  - Delete/Backspace: 선택 항목 삭제
  - Ctrl+D: 노드 복제
  - Ctrl+A: 전체 선택
  - Space+Drag: 캔버스 팬
  - 단축키 도움말 패널
- [ ] 5-4. UI 컴포넌트 개선
  - Toolbar 노드 카테고리 분류 (AI 생성, 데이터 처리, 유틸리티 등)
  - ToolsPanel 레이아웃 최적화
  - HistoryPanel 에셋 미리보기 개선
  - 노드 검색/필터링 기능
- [ ] 5-5. 다크 테마 및 접근성
  - 현재 다크 테마 기반 일관성 확보
  - 색상 대비 WCAG AA 기준 준수
  - 키보드 내비게이션 지원

**관련 요구사항**: REQ-PROJ-001~009

---

## 3. 아키텍처 설계 방향

### 3.1 모듈 구조 (목표)

```
src/
  App.tsx                       # 최상위 조합 컴포넌트 (경량화)
  types.ts                      # 전역 타입 정의
  contexts/
    CanvasContext.tsx            # 캔버스 panZoom 상태
    ProjectContext.tsx           # 프로젝트 상태 관리
  hooks/
    useCanvas.ts                # D3 pan/zoom 로직
    useNodes.ts                 # 노드 CRUD, 선택, 이동
    useConnections.ts           # 커넥션 관리, 데이터 전파
    useNodeGeneration.ts        # AI 생성 실행 로직
    useProjectManager.ts        # 프로젝트 저장/로드
    useKeyboardShortcuts.ts     # 키보드 단축키 관리
    useUndoRedo.ts              # Undo/Redo 상태 관리
  components/
    Canvas/
      InfiniteCanvas.tsx        # 캔버스 컨테이너
      CanvasGrid.tsx            # 배경 그리드
      MiniMap.tsx               # 미니맵 (선택적)
    NodeComponent.tsx           # 노드 렌더링 (기존 유지)
    ConnectionComponent.tsx     # 커넥션 렌더링 (기존 유지)
    Toolbar.tsx                 # 노드 추가 도구바
    ToolsPanel.tsx              # 도구 선택 패널
    HistoryPanel.tsx            # 에셋 히스토리
    ZoomControls.tsx            # 줌 컨트롤
    ProjectControls.tsx         # 프로젝트 관리
    nodes/                      # 28개 노드 타입별 컴포넌트 (기존 유지)
  services/
    geminiService.ts            # Gemini API 통합 (기존 유지)
    imageProcessingService.ts   # 이미지 처리 (기존 유지)
    dbService.ts                # IndexedDB 저장소 (기존 유지)
  factories/
    nodeFactory.ts              # 노드 생성 팩토리
    connectorFactory.ts         # 커넥터 정의
  utils/
    canvasUtils.ts              # 좌표 변환, 뷰포트 계산
    graphUtils.ts               # 토폴로지 정렬, 순환 감지
    dataFlowUtils.ts            # 데이터 전파 유틸리티
  data/
    constants.ts                # 상수 정의 (기존 유지)
    systemPrompts.ts            # AI 시스템 프롬프트 (기존 유지)
    scriptStyles.ts             # 스크립트 스타일 (기존 유지)
    nodeDefaults.ts             # 노드 타입별 기본값 정의
```

### 3.2 데이터 흐름

```
사용자 인터랙션
    |
    v
커스텀 훅 (useNodes, useConnections, useCanvas)
    |
    v
Immer 기반 상태 업데이트
    |
    v
React 리렌더링 (memo로 최적화)
    |
    v
SVG(커넥션) + foreignObject(노드) 렌더링
    |
    v
D3 Transform 적용 (pan/zoom)
```

---

## 4. 리스크 분석

### 리스크 1: App.tsx 리팩토링 중 기능 회귀

- **가능성**: 높음
- **영향**: 높음
- **대응**: 각 리팩토링 단계에서 기존 기능 동작을 검증하는 통합 테스트 작성. 점진적으로 한 모듈씩 분리.

### 리스크 2: 대규모 노드(100+) 시 성능 저하

- **가능성**: 중간
- **영향**: 높음
- **대응**: Viewport Culling, React.memo 최적화, SVG 커넥션 렌더링 최적화. 필요 시 Canvas 2D API 전환 검토.

### 리스크 3: Gemini API 비용 및 Rate Limit

- **가능성**: 중간
- **영향**: 중간
- **대응**: API 요청 큐, 요청 간 지연, 결과 캐싱, 사용량 모니터링 대시보드.

### 리스크 4: IndexedDB 용량 제한

- **가능성**: 낮음
- **영향**: 중간
- **대응**: 이미지 데이터를 Blob으로 저장하여 공간 효율화. 오래된 에셋 정리 기능 제공. 저장 용량 경고.

### 리스크 5: 커넥션 데이터 전파 순환 참조

- **가능성**: 낮음
- **영향**: 높음
- **대응**: 커넥션 생성 시 토폴로지 정렬 기반 순환 감지. 순환이 감지되면 커넥션 생성 거부.

---

## 5. 의존성 관계

```
Milestone 1 (캔버스) ──> Milestone 2 (노드) ──> Milestone 3 (커넥션)
                                                         |
                                                         v
                                               Milestone 4 (AI 통합)
                                                         |
                                                         v
                                               Milestone 5 (프로젝트/UI)
```

- Milestone 1, 2는 독립적으로 시작 가능하나, 완전한 통합은 순차적
- Milestone 3은 Milestone 2의 노드 구조에 의존
- Milestone 4, 5는 병렬 진행 가능

---

## 6. 다음 단계

SPEC 검토 완료 후:

1. `/moai:2-run SPEC-UI-001` 실행으로 Milestone 1부터 구현 시작
2. 각 Milestone 완료 시 `/moai:3-sync SPEC-UI-001`로 문서 동기화
3. 리팩토링 진행 중 발견되는 추가 요구사항은 SPEC 업데이트로 반영
