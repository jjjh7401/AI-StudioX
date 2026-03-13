# SPEC-APP-001: 구현 계획

> **SPEC 참조**: [spec.md](./spec.md)
> **수락 기준**: [acceptance.md](./acceptance.md)

---

## 1. 구현 전략 개요

AI-StudioX는 현재 모놀리식 구조(App.tsx 127KB)로 동작 중인 앱이다. 구현 계획은 **기존 기능의 안정적 유지**를 최우선으로 하며, 점진적으로 모듈화와 기능 확장을 진행한다.

### 핵심 원칙

- **동작하는 코드 우선**: 현재 배포된 기능을 깨뜨리지 않는 것이 최우선
- **점진적 리팩토링**: 대규모 재작성 대신 기능 단위로 분리
- **타입 안전성 강화**: TypeScript의 타입 시스템을 최대한 활용
- **사용자 경험 유지**: 리팩토링 과정에서 UX 변화 최소화

---

## 2. 기술 스택 명세

### 핵심 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.x | UI 프레임워크 |
| TypeScript | 5.x | 타입 안전성 |
| Vite | 6.x | 빌드/개발 서버 |
| D3.js | v7.x | 무한 캔버스 (줌/팬/SVG) |
| @google/genai | ^1.29.0 | Gemini AI API 클라이언트 |

### 상태 관리 및 UI

| 기술 | 용도 |
|------|------|
| useImmer | 불변 상태 업데이트 |
| react-draggable | 노드 드래그 상호작용 |
| react-compare-slider | 이미지 비교 UI |
| @heroicons/react | 아이콘 시스템 |

### 데이터 저장

| 기술 | 용도 |
|------|------|
| IndexedDB | 프로젝트 데이터 로컬 영속화 |

### 배포

| 기술 | 용도 |
|------|------|
| Vercel | 정적 호스팅 및 CDN |

---

## 3. 컴포넌트 아키텍처

### 현재 구조 (As-Is)

```
App.tsx (127KB) - 모든 로직이 집중된 모놀리식 컴포넌트
  |-- 캔버스 관리 (D3 줌/팬)
  |-- 노드 상태 관리 (27개 타입)
  |-- 연결 상태 관리
  |-- 프로젝트 저장/로드
  |-- 키보드 단축키
  |-- 멀티 셀렉트
  |-- 복사/붙여넣기
```

### 목표 구조 (To-Be)

```
src/
  App.tsx                    (축소: 레이아웃 + 라우팅만)
  hooks/
    useCanvas.ts             (D3 줌/팬 관리)
    useNodes.ts              (노드 CRUD + 상태)
    useConnections.ts        (연결 관리 + 타입 검증)
    useProject.ts            (IndexedDB 저장/로드)
    useKeyboardShortcuts.ts  (단축키 바인딩)
    useSelection.ts          (멀티 셀렉트 + 복사)
    useHistory.ts            (생성 이력 관리)
  components/
    canvas/
      InfiniteCanvas.tsx     (D3 기반 캔버스 컨테이너)
      CanvasOverlay.tsx      (선택 박스, 연결선 프리뷰)
    nodes/
      NodeComponent.tsx      (노드 렌더링 디스패처)
      NodeFactory.ts         (노드 타입별 생성 팩토리)
      types/                 (노드 타입별 컴포넌트)
        TextNode.tsx
        AssistantNode.tsx
        ImageNode.tsx
        VideoNode.tsx
        ModelNode.tsx
        VtonNode.tsx
        StoryboardNode.tsx
        ScriptNode.tsx
        GridShotNode.tsx
        ImageModifyNode.tsx
        CompositeNode.tsx
        ...
    connections/
      ConnectionComponent.tsx (연결선 렌더링)
      ConnectionValidator.ts  (타입 호환성 검증)
    panels/
      HistoryPanel.tsx        (생성 이력)
      ToolsPanel.tsx          (도구 패널)
    modals/
      PlaygroundModal.tsx     (AI 테스트)
    controls/
      Toolbar.tsx             (메인 툴바)
      ProjectControls.tsx     (프로젝트 관리 UI)
      ZoomControls.tsx        (줌 컨트롤)
  services/
    geminiService.ts          (Gemini API 통합)
    dbService.ts              (IndexedDB CRUD)
    imageProcessingService.ts (이미지 처리 유틸리티)
  types/
    nodes.ts                  (노드 타입 정의)
    connections.ts            (연결 타입 정의)
    project.ts                (프로젝트 타입 정의)
    api.ts                    (API 응답 타입)
```

---

## 4. 마일스톤 (우선순위 기반)

### Primary Goal: 핵심 기능 안정화 및 타입 강화

**목표**: 현재 동작하는 모든 기능의 타입 안전성 확보 및 기초 테스트 구축

| 태스크 | 설명 | 관련 요구사항 |
|--------|------|-------------|
| T-001 | types.ts의 27개 노드 타입 정의 검증 및 보강 | REQ-CANVAS-002 |
| T-002 | 연결 타입 호환성 매트릭스 구현/검증 | REQ-CONN-001, REQ-CONN-030, REQ-CONN-031 |
| T-003 | Gemini API 서비스 에러 핸들링 강화 | REQ-AI-020, REQ-AI-021, REQ-AI-031 |
| T-004 | IndexedDB 서비스 안정성 확보 | REQ-PROJ-001, REQ-PROJ-002, REQ-PROJ-020 |
| T-005 | 키보드 단축키 시스템 검증 | REQ-CANVAS-013 |

### Secondary Goal: App.tsx 모듈 분해

**목표**: 127KB 모놀리식 App.tsx를 커스텀 훅과 하위 컴포넌트로 분리

| 태스크 | 설명 | 관련 요구사항 |
|--------|------|-------------|
| T-010 | useCanvas 훅 추출 (D3 줌/팬 로직) | REQ-CANVAS-001 |
| T-011 | useNodes 훅 추출 (노드 CRUD 상태) | REQ-CANVAS-002, REQ-CANVAS-003 |
| T-012 | useConnections 훅 추출 | REQ-CONN-001, REQ-CONN-010~012 |
| T-013 | useProject 훅 추출 (저장/로드) | REQ-PROJ-001, REQ-PROJ-010~012 |
| T-014 | useSelection 훅 추출 (멀티 셀렉트/복사) | REQ-CANVAS-011, REQ-CANVAS-012 |
| T-015 | useKeyboardShortcuts 훅 추출 | REQ-CANVAS-013 |

### Third Goal: 컴포넌트 세분화

**목표**: 대형 컴포넌트를 기능 단위로 분리

| 태스크 | 설명 | 관련 요구사항 |
|--------|------|-------------|
| T-020 | NodeComponent.tsx (42.5KB) -> 노드 타입별 컴포넌트 분리 | REQ-CANVAS-002 |
| T-021 | PlaygroundModal.tsx (65.3KB) -> 기능별 하위 컴포넌트 분리 | REQ-AI-040 |
| T-022 | InfiniteCanvas 컴포넌트 독립화 | REQ-CANVAS-001 |
| T-023 | ConnectionValidator 유틸리티 분리 | REQ-CONN-001, REQ-CONN-030 |

### Optional Goal: 성능 최적화 및 UX 개선

**목표**: 대규모 캔버스 성능 최적화 및 추가 기능

| 태스크 | 설명 | 관련 요구사항 |
|--------|------|-------------|
| T-030 | 가시 영역 기반 노드 렌더링 최적화 (가상화) | REQ-CANVAS-020 |
| T-031 | AI 생성 요청 큐잉 및 동시성 제한 | REQ-AI-021 |
| T-032 | 프로젝트 자동 저장 구현 | REQ-PROJ-030 |
| T-033 | 다크 모드 지원 | REQ-UI-040 |
| T-034 | 노드 검색/필터링 | REQ-UI-041 |

---

## 5. API 통합 계획 (Gemini API)

### 5.1 서비스 구조

```
geminiService.ts
  |-- initializeClient(apiKey)     // API 클라이언트 초기화
  |-- generateText(prompt, config) // 텍스트 생성
  |-- generateImage(prompt, config)// 이미지 생성
  |-- editImage(image, mask, prompt)// 이미지 부분 편집
  |-- generateVideo(image, prompt) // 이미지 기반 비디오 생성
  |-- generateStoryboard(prompt)   // 5씬 시퀀스 생성
  |-- generateScript(product)      // 상품 스크립트 파이프라인
  |-- generateModel(options)       // AI 모델 이미지 생성
  |-- generateVton(outfit, pose)   // 가상 피팅
  |-- generateGridShot(prompt)     // 그리드 레이아웃 생성
```

### 5.2 에러 처리 전략

| 에러 유형 | 처리 방식 |
|----------|----------|
| API 키 미설정 | 설정 안내 UI 표시, 생성 요청 차단 |
| 네트워크 오류 | 재시도 로직 (최대 3회, 지수 백오프) |
| API 할당량 초과 | 사용자 알림 + 대기 시간 안내 |
| 잘못된 요청 | 프롬프트/파라미터 검증 피드백 |
| 타임아웃 | 30초 타임아웃, 사용자 취소 옵션 제공 |

### 5.3 요청 최적화

- 동일 프롬프트에 대한 결과 캐싱 (세션 단위)
- 동시 요청 수 제한 (최대 3개)
- 이미지 업로드 시 리사이즈 전처리 (최대 4MB)
- 프로그레스 콜백을 통한 실시간 상태 표시

---

## 6. 리스크 분석

### 기술적 리스크

| 리스크 | 심각도 | 가능성 | 대응 방안 |
|--------|--------|--------|----------|
| App.tsx 분해 시 기능 회귀 | Priority High | 중간 | 분해 전 통합 테스트 작성, 점진적 추출 |
| D3 + React 통합 복잡성 | Priority High | 낮음 | useRef 기반 D3 격리, 이벤트 충돌 방지 |
| Gemini API 변경/중단 | Priority High | 낮음 | API 추상 레이어, 인터페이스 기반 설계 |
| IndexedDB 용량 한계 | Priority Medium | 중간 | 이미지 압축 저장, 오래된 데이터 정리 정책 |
| 대규모 캔버스 성능 저하 | Priority Medium | 중간 | 가시 영역 렌더링, React.memo 활용 |

### 의존성 리스크

| 의존성 | 리스크 | 대응 |
|--------|--------|------|
| @google/genai | 메이저 버전 변경 | 서비스 레이어 추상화로 변경 영향 최소화 |
| D3 v7 | React 19 호환성 | useRef로 DOM 직접 관리, React 렌더 사이클과 분리 |
| react-draggable | 유지보수 중단 가능성 | 대안 라이브러리 목록 유지 (dnd-kit 등) |
| IndexedDB | 브라우저 호환성 | idb 래퍼 라이브러리 사용 검토 |

### 완화 전략

1. **기능 회귀 방지**: 리팩토링 전 E2E 테스트 스냅샷 확보
2. **API 추상화**: geminiService를 인터페이스 기반으로 설계하여 프로바이더 교체 가능
3. **점진적 마이그레이션**: 한 번에 하나의 훅/컴포넌트만 추출, 각 단계 후 동작 검증
4. **성능 모니터링**: React DevTools Profiler로 렌더링 성능 지속 측정

---

## 7. 참고 사항

### 제외 범위

- 백엔드 서버 구축 (클라이언트 전용 앱)
- 사용자 인증/인가 시스템 (로컬 앱)
- 멀티유저 실시간 협업
- 모바일 앱 네이티브 지원

### 전문가 상담 권장

- **expert-frontend**: React 19 + D3 통합 패턴, 대규모 컴포넌트 분해 전략
- **expert-frontend**: 무한 캔버스 성능 최적화 (가상화, 레이어링)
- **design-uiux**: 노드 기반 에디터 UX 패턴, 접근성 검토
