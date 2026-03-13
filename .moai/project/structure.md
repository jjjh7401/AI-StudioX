---
project: AI-StudioX
version: 1.0.0
updated: 2026-03-13
---

# AI-StudioX 프로젝트 구조

## 프로젝트 아키텍처 개요

AI-StudioX는 커스텀 훅 기반의 관심사 분리 패턴을 따릅니다. 비즈니스 로직은 훅 레이어에 집중되어 있으며, UI 컴포넌트는 이러한 훅을 소비하는 방식으로 설계되었습니다.

## 디렉토리 구조

```
src/
├── App.tsx                        # 레이아웃 + 라우팅
├── hooks/                         # 비즈니스 로직 레이어
│   ├── useCanvas.ts               # D3 줌/팬 관리
│   ├── useNodes.ts                # 노드 CRUD + 상태
│   ├── useConnections.ts          # 연결 관리 + 타입 검증
│   ├── useProject.ts              # IndexedDB 저장/로드
│   ├── useKeyboardShortcuts.ts    # 단축키 바인딩
│   ├── useSelection.ts            # 멀티 셀렉트 + 복사
│   └── useHistory.ts              # 생성 이력 관리
├── components/                    # UI 레이어
│   ├── canvas/
│   │   └── InfiniteCanvas.tsx     # D3 기반 캔버스 컨테이너
│   ├── nodes/
│   │   ├── NodeComponent.tsx      # 노드 렌더링 디스패처
│   │   ├── NodeFactory.ts         # 노드 타입별 생성 팩토리
│   │   └── types/                 # 노드 타입별 컴포넌트
│   │       ├── TextNode.tsx
│   │       ├── AssistantNode.tsx
│   │       ├── ImageNode.tsx
│   │       ├── VideoNode.tsx
│   │       ├── CameraNode.tsx
│   │       ├── ModelNode.tsx
│   │       ├── VtonNode.tsx
│   │       ├── CommentNode.tsx
│   │       ├── StoryboardNode.tsx
│   │       ├── ScriptNode.tsx
│   │       ├── ArrayNode.tsx
│   │       ├── ListNode.tsx
│   │       ├── CompositeNode.tsx
│   │       ├── StitchNode.tsx
│   │       ├── GridShotNode.tsx
│   │       ├── GridExtractorNode.tsx
│   │       ├── ImageModifyNode.tsx
│   │       └── GroupNode.tsx
│   ├── connections/
│   │   ├── ConnectionComponent.tsx # 연결 시각화
│   │   └── ConnectionValidator.ts  # 연결 타입 검증
│   ├── panels/
│   │   ├── HistoryPanel.tsx        # 생성 이력 패널
│   │   └── ToolsPanel.tsx          # 도구 패널
│   ├── modals/
│   │   └── PlaygroundModal.tsx     # AI 테스트 인터페이스
│   └── controls/
│       ├── Toolbar.tsx             # 메인 툴바
│       ├── ProjectControls.tsx     # 프로젝트 관리 컨트롤
│       └── ZoomControls.tsx        # 줌 제어 패널
├── services/                      # 외부 API 및 유틸리티
│   ├── geminiService.ts           # Google Gemini API 통합
│   ├── dbService.ts               # IndexedDB 서비스
│   └── imageProcessingService.ts  # 이미지 처리 유틸
├── types/                         # TypeScript 타입 정의
│   ├── nodes.ts                   # 노드 타입 정의
│   ├── connections.ts             # 연결 타입 정의
│   ├── project.ts                 # 프로젝트 타입 정의
│   └── api.ts                     # API 타입 정의
├── styles/                        # 스타일시트
│   └── index.css
└── main.tsx                       # 엔트리 포인트
```

## 주요 디렉토리 설명

### hooks/ (비즈니스 로직)

**useCanvas.ts**
- D3.js를 사용한 캔버스 줌/팬 기능 관리
- 캔버스 변환(transform) 상태 관리
- 좌표 계산 유틸리티

**useNodes.ts**
- 노드의 생성, 읽기, 업데이트, 삭제(CRUD) 로직
- 노드 상태 관리 (위치, 크기, 속성)
- 노드 선택 상태 관리

**useConnections.ts**
- 노드 간 연결 관리
- 연결 타입 검증 (호환성 확인)
- 연결 추가/제거 로직

**useProject.ts**
- IndexedDB를 통한 프로젝트 영속화
- 프로젝트 저장 및 로드
- 자동 저장 기능

**useKeyboardShortcuts.ts**
- 키보드 단축키 바인딩
- 단축키 처리 로직

**useSelection.ts**
- 다중 노드 선택
- 복사/붙여넣기 기능
- 선택 상태 관리

**useHistory.ts**
- 생성된 에셋 이력 추적
- 이력 패널 데이터 관리
- 버전 관리

### components/ (UI 레이어)

**canvas/InfiniteCanvas.tsx**
- D3 기반 SVG 렌더링
- 마우스 이벤트 처리
- 캔버스 화면 업데이트

**nodes/NodeComponent.tsx**
- 노드 렌더링 디스패처
- 노드 타입별 컴포넌트 선택

**nodes/NodeFactory.ts**
- 노드 타입별 생성 팩토리 패턴
- 노드 기본값 설정

**nodes/types/**
- 각 노드 타입의 개별 컴포넌트
- 노드별 UI 및 인터랙션 로직

**connections/ConnectionComponent.tsx**
- 연결선 시각화
- 연결 인터랙션

**connections/ConnectionValidator.ts**
- 연결 가능 여부 검증
- 호환성 체크

**panels/HistoryPanel.tsx**
- 생성 이력 표시
- 과거 결과물 관리

**panels/ToolsPanel.tsx**
- 도구 및 옵션 표시

**modals/PlaygroundModal.tsx**
- AI 기능 테스트 인터페이스
- 프롬프트 입력 및 결과 표시

**controls/Toolbar.tsx**
- 메인 툴바 (새 노드, 저장, 내보내기 등)

**controls/ProjectControls.tsx**
- 프로젝트 관리 컨트롤

**controls/ZoomControls.tsx**
- 줌 레벨 표시 및 제어

### services/ (외부 API 및 유틸리티)

**geminiService.ts**
- Google Gemini API 호출 관리
- 이미지/비디오/텍스트 생성 요청
- API 응답 처리 및 오류 처리

**dbService.ts**
- IndexedDB CRUD 작업
- 데이터베이스 초기화 및 마이그레이션
- 쿼리 헬퍼 함수

**imageProcessingService.ts**
- 이미지 리사이징 및 변환
- 캔버스 이미지 처리
- 메타데이터 추출

### types/ (TypeScript 타입)

**nodes.ts**
- Node 기본 인터페이스
- 각 노드 타입별 확장 타입
- NodeType 유니온 타입

**connections.ts**
- Connection 인터페이스
- 연결 타입 정의
- 호환성 규칙

**project.ts**
- Project 인터페이스
- 프로젝트 메타데이터
- 저장 형식 정의

**api.ts**
- API 요청/응답 타입
- Gemini API 타입
- 에러 타입

## 아키텍처 패턴

### 관심사 분리

- **Hooks**: 비즈니스 로직, 상태 관리, API 호출
- **Components**: UI 렌더링, 사용자 인터랙션
- **Services**: 외부 API, 데이터베이스, 유틸리티 함수
- **Types**: TypeScript 타입 정의

### 상태 관리

모든 주요 상태는 커스텀 훅을 통해 관리됩니다:
- 캔버스 상태: `useCanvas`
- 노드 상태: `useNodes`
- 연결 상태: `useConnections`
- 프로젝트 상태: `useProject`
- 선택 상태: `useSelection`
- 이력 상태: `useHistory`

### 데이터 흐름

1. 사용자가 UI에서 액션 수행
2. 컴포넌트가 훅의 액션 함수 호출
3. 훅이 상태 업데이트 및 서비스 호출
4. 컴포넌트가 업데이트된 상태를 리렌더링

## 확장성 고려사항

### 노드 타입 추가

1. `types/nodes.ts`에 새로운 노드 타입 정의
2. `components/nodes/types/` 디렉토리에 컴포넌트 생성
3. `components/nodes/NodeFactory.ts`에 팩토리 로직 추가
4. `hooks/useNodes.ts`에 기본값 설정

### 새로운 기능 추가

1. 필요시 새로운 훅 생성 (`hooks/`)
2. UI 컴포넌트 생성 또는 기존 컴포넌트 수정
3. 서비스 함수 추가 (필요시 `services/` 확장)
4. 타입 정의 추가 (`types/`)

## 개발 워크플로우

### 로컬 개발

```bash
npm install          # 의존성 설치
npm run dev         # 개발 서버 시작
npm run build       # 프로덕션 빌드
npm run preview     # 빌드 결과 미리보기
```

### 테스트

```bash
npm run test        # 테스트 실행
npm run test:watch  # 감시 모드 테스트
npm run test:coverage # 커버리지 리포트
```

### 배포

```bash
# Vercel에 배포 (GitHub 연동)
git push origin main
```
