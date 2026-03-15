# StudioX v1 - 프로젝트 구조 문서

## 프로젝트 디렉토리 트리

```
StudioX_v1/
│
├── 📄 App.tsx                          # 메인 애플리케이션 진입점
├── 📄 index.tsx                        # React DOM 렌더링 진입점
├── 📄 types.ts                         # 전역 TypeScript 타입 정의
├── 📄 vite.config.ts                   # Vite 빌드 설정
├── 📄 tsconfig.json                    # TypeScript 설정
├── 📄 package.json                     # 프로젝트 의존성 관리
├── 📄 index.html                       # HTML 진입점
├── 📦 public/                          # 정적 자산 (아이콘, 이미지 등)
│
├── 📁 src/
│   │
│   ├── 📁 hooks/                       # 커스텀 훅 (2026-03-15 신규)
│   │   ├── 📄 useCanvas.ts             # D3 pan/zoom 캡슐화
│   │   ├── 📄 useNodes.ts              # 노드 CRUD/선택/이동/복제 관리
│   │   ├── 📄 useConnections.ts        # 커넥션 생성/삭제/선택/검증
│   │   ├── 📄 useNodeGeneration.ts     # AI 노드 생성 상태 관리
│   │   ├── 📄 useProjectManager.ts     # IndexedDB 프로젝트 관리
│   │   ├── 📄 useKeyboardShortcuts.ts  # 키보드 단축키 처리
│   │   ├── 📄 useUndoRedo.ts           # 실행취소/다시실행 스택
│   │   │
│   │   └── 📁 __tests__/               # 훅 테스트 (7개 파일, 142개 테스트)
│   │       ├── 📄 useCanvas.test.ts
│   │       ├── 📄 useNodes.test.ts
│   │       ├── 📄 useConnections.test.ts
│   │       ├── 📄 useNodeGeneration.test.ts
│   │       ├── 📄 useProjectManager.test.ts
│   │       ├── 📄 useKeyboardShortcuts.test.ts
│   │       └── 📄 useUndoRedo.test.ts
│   │
│   ├── 📁 utils/                       # 순수 유틸리티 (2026-03-15 신규)
│   │   ├── 📄 canvasUtils.ts           # 캔버스 변환/좌표 계산
│   │   ├── 📄 graphUtils.ts            # 그래프 검증/순환 감지
│   │   ├── 📄 dataFlowUtils.ts         # 데이터 흐름 전파
│   │   │
│   │   └── 📁 __tests__/               # 유틸리티 테스트 (3개 파일, 59개 테스트)
│   │       ├── 📄 canvasUtils.test.ts
│   │       ├── 📄 graphUtils.test.ts
│   │       └── 📄 dataFlowUtils.test.ts
│   │
│   ├── 📁 factories/                   # 팩토리 패턴 (2026-03-15 신규)
│   │   ├── 📄 nodeFactory.ts           # 노드 생성 팩토리
│   │   │
│   │   └── 📁 __tests__/               # 팩토리 테스트 (1개 파일, 21개 테스트)
│   │       └── 📄 nodeFactory.test.ts
│   │
│   ├── 📁 data/                        # 상수/기본값 (2026-03-15 확장)
│   │   ├── 📄 nodeDefaults.ts          # 노드 타입별 기본값 (신규)
│   │   ├── 📄 constants.ts             # 전역 상수
│   │   ├── 📄 presets.ts               # 프리셋 템플릿
│   │   ├── 📄 scriptStyles.ts          # 스크립트 스타일
│   │   ├── 📄 systemPrompts.ts         # AI 시스템 프롬프트
│   │   │
│   │   └── 📁 __tests__/               # 데이터 테스트 (1개 파일, 13개 테스트)
│   │       └── 📄 nodeDefaults.test.ts
│   │
│   ├── 📁 components/                  # React 컴포넌트 모음
│   │   ├── 📄 NodeComponent.tsx        # 개별 노드 렌더링 컴포넌트
│   │   ├── 📄 ConnectionComponent.tsx  # 노드 간 연결선 렌더링
│   │   ├── 📄 Toolbar.tsx              # 상단 도구 모음
│   │   ├── 📄 ToolsPanel.tsx           # 왼쪽 노드 선택 패널
│   │   ├── 📄 HistoryPanel.tsx         # 실행 히스토리 표시 패널
│   │   ├── 📄 ZoomControls.tsx         # 캔버스 줌 컨트롤
│   │   ├── 📄 ProjectControls.tsx      # 프로젝트 저장/로드 제어
│   │   ├── 📄 PlaygroundModal.tsx      # AI 테스트 모달
│   │   │
│   │   └── 📁 nodes/                   # 30개 이상의 노드 컴포넌트
│   │       ├── 📄 ImageNode.tsx        # 이미지 노드
│   │       ├── 📄 VideoNode.tsx        # 비디오 노드
│   │       ├── 📄 TextNode.tsx         # 텍스트 입력 노드
│   │       ├── 📄 AssistantNode.tsx    # AI 어시스턴트 노드
│   │       ├── 📄 ImageEditNode.tsx    # 이미지 편집 노드
│   │       ├── 📄 ImageLoadNode.tsx    # 이미지 로드 노드
│   │       ├── 📄 ImageModifyNode.tsx  # 이미지 수정 노드
│   │       ├── 📄 ImagePreviewNode.tsx # 이미지 미리보기 노드
│   │       ├── 📄 VideoLoadNode.tsx    # 비디오 로드 노드
│   │       ├── 📄 VideoStitchNode.tsx  # 비디오 스티칭 노드
│   │       ├── 📄 ModelNode.tsx        # AI 모델 선택 노드
│   │       ├── 📄 VtonNode.tsx         # Virtual Try-On 노드
│   │       ├── 📄 CameraNode.tsx       # 카메라 설정 노드
│   │       ├── 📄 CameraPresetNode.tsx # 카메라 프리셋 노드
│   │       ├── 📄 PresetNode.tsx       # 일반 프리셋 노드
│   │       ├── 📄 CommentNode.tsx      # 주석 노드
│   │       ├── 📄 StoryboardNode.tsx   # 스토리보드 노드
│   │       ├── 📄 ScriptNode.tsx       # 스크립트 노드
│   │       ├── 📄 ArrayNode.tsx        # 배열 처리 노드
│   │       ├── 📄 ListNode.tsx         # 리스트 처리 노드
│   │       ├── 📄 PromptConcatenatorNode.tsx  # 프롬프트 연결 노드
│   │       ├── 📄 CompositeNode.tsx    # 이미지 합성 노드
│   │       ├── 📄 StitchNode.tsx       # 스티칭 노드
│   │       ├── 📄 RmbgNode.tsx         # 배경 제거 노드
│   │       ├── 📄 GroupNode.tsx        # 노드 그룹화 노드
│   │       ├── 📄 GridShotNode.tsx     # 그리드샷 노드
│   │       ├── 📄 GridExtractorNode.tsx # 그리드 추출 노드
│   │       ├── 📄 SelectImageNode.tsx  # 이미지 선택 노드
│   │       └── 📄 OutfitDetailNode.tsx # 아웃핏 디테일 노드
│   │
│   ├── 📁 services/                    # 비즈니스 로직 및 API 통합
│   │   ├── 📄 geminiService.ts         # Google Gemini API 통합
│   │   │   ├─ generateImage()          # 텍스트→이미지 생성
│   │   │   ├─ generateVideo()          # 텍스트→비디오 생성
│   │   │   ├─ editImage()              # 이미지 편집
│   │   │   ├─ removeBackground()       # 배경 제거 (RMBG)
│   │   │   ├─ virtualTryOn()           # Virtual Try-On
│   │   │   └─ analyzeImage()           # 이미지 분석
│   │   │
│   │   ├── 📄 imageProcessingService.ts # Canvas API 기반 이미지 처리
│   │   │   ├─ compositeImages()        # 이미지 합성
│   │   │   ├─ stitchImages()           # 이미지 스티칭
│   │   │   ├─ resizeImage()            # 이미지 리사이징
│   │   │   ├─ filterImage()            # 필터 적용
│   │   │   └─ extractGrid()            # 그리드 추출
│   │   │
│   │   └── 📄 dbService.ts             # IndexedDB 로컬 저장소 관리
│   │       ├─ saveProject()            # 프로젝트 저장
│   │       ├─ loadProject()            # 프로젝트 로드
│   │       ├─ deleteProject()          # 프로젝트 삭제
│   │       ├─ listProjects()           # 프로젝트 목록
│   │       └─ exportProject()          # 프로젝트 내보내기
│   │
│   └── 📁 data/                        # 상수, 프리셋, 설정 데이터
│       ├── 📄 constants.ts             # 전역 상수
│       │   ├─ NODE_TYPES              # 노드 타입 정의
│       │   ├─ CONNECTOR_COLORS         # 커넥터 색상 정의
│       │   └─ DEFAULT_SETTINGS         # 기본 설정값
│       │
│       ├── 📄 presets.ts               # 프리셋 템플릿
│       │   ├─ FASHION_PRESETS          # 패션 워크플로우 프리셋
│       │   ├─ MARKETING_PRESETS        # 마케팅 콘텐츠 프리셋
│       │   ├─ VIDEO_PRESETS            # 비디오 제작 프리셋
│       │   └─ BATCH_PRESETS            # 배치 처리 프리셋
│       │
│       ├── 📄 scriptStyles.ts          # 스크립트 스타일 정의
│       │   ├─ CINEMATIC                # 영화 스타일
│       │   ├─ DOCUMENTARY              # 다큐멘터리 스타일
│       │   ├─ ADVERTISEMENT            # 광고 스타일
│       │   └─ SOCIAL_MEDIA             # 소셜 미디어 스타일
│       │
│       └── 📄 systemPrompts.ts         # AI 시스템 프롬프트
│           ├─ IMAGE_GENERATION         # 이미지 생성 프롬프트
│           ├─ VIDEO_GENERATION         # 비디오 생성 프롬프트
│           ├─ VTON_PROMPTS             # Virtual Try-On 프롬프트
│           └─ ASSISTANT_ROLES          # 어시스턴트 역할 정의
│
├── 📁 .moai/                           # MoAI-ADK 프로젝트 관리
│   ├── 📁 config/                      # 프로젝트 설정
│   ├── 📁 specs/                       # 프로젝트 요구사항 문서
│   ├── 📁 docs/                        # 생성된 문서
│   └── 📁 project/                     # 프로젝트 메타데이터
│
├── 📁 .claude/                         # Claude Code 설정
│   ├── 📁 skills/                      # 커스텀 스킬
│   ├── 📁 agents/                      # 커스텀 에이전트
│   ├── 📁 commands/                    # 커스텀 명령어
│   ├── 📁 rules/                       # 프로젝트 규칙
│   └── 📄 CLAUDE.md                    # MoAI 실행 지침
│
└── 📁 node_modules/                    # npm 의존성 (gitignore됨)
```

---

## 디렉토리별 상세 설명

### 루트 디렉토리

**App.tsx** - 메인 애플리케이션 컴포넌트
- 프로젝트 상태 관리 (App State: nodes, connections, history, panZoom)
- Redux 또는 Immer 기반 불변 상태 관리
- 커스텀 훅(useCanvas, useNodes, useConnections 등)을 통한 로직 위임
- 노드/커넥션 렌더링 및 이벤트 핸들링
- **리팩토링 완료** (2026-03-15): 3000+ 라인에서 약 1200 라인으로 단순화

**index.tsx** - React DOM 진입점
- React 18+ StrictMode 활성화
- 루트 DOM 요소에 App 마운트
- 전역 스타일 초기화

### src/hooks/ - 커스텀 훅 (2026-03-15 신규)

**useCanvas.ts** - D3 pan/zoom 캡슐화
- panZoom 상태 관리
- zoomIn/zoomOut/zoomToFit 기능
- getWorldPosition 좌표 변환
- restoreTransform 상태 복원
- isMiddleMousePanning 마우스 상태 추적
- 테스트: 15개 스펙

**useNodes.ts** - 노드 CRUD/선택/이동 관리
- addNode, deleteNodes, duplicateNode 기능
- updateNodeData, moveNodes, resizeNode
- toggleCollapse, toggleBypass, selectNode
- bringToFront, loadNodes
- onNodesDeleted 콜백으로 커넥션 정리
- 테스트: 34개 스펙

**useConnections.ts** - 커넥션 생성/삭제/검증
- startConnection, completeConnection, cancelConnection
- deleteConnections, deleteConnectionsForNodes
- selectConnection, loadConnections
- isValidConnection 검증 (자기 참조, 중복, 순환 방지)
- onConnectionsChanged 콜백
- 테스트: 20개 스펙

**useNodeGeneration.ts** - AI 노드 생성 상태 관리
- generateForNode, cancelGeneration
- isGenerating 상태 추적
- generatingNodeIds Set 기반 다중 노드 추적
- executeNodeFn 콜백 래핑
- 테스트: 13개 스펙

**useProjectManager.ts** - IndexedDB 프로젝트 관리
- saveProject, loadProject, deleteProject
- createNewProject, isLoading
- dbService 추상화
- 마운트 시 자동 로드
- 테스트: 14개 스펙

**useKeyboardShortcuts.ts** - 키보드 단축키
- B(Bypass), Delete/Backspace, Ctrl+Z, Ctrl+D, Ctrl+A
- input/textarea 포커스 시 무시
- enabled 옵션 지원
- 테스트: 11개 스펙

**useUndoRedo.ts** - 실행취소/다시실행
- pushState, undo, redo
- canUndo, canRedo
- maxHistory 제한 (기본 50)
- clear 기능
- 테스트: 15개 스펙

### src/utils/ - 순수 유틸리티 (2026-03-15 신규)

**canvasUtils.ts** - 캔버스 변환/좌표
- getTransformFromElement: SVG 변환 추출
- getWorldCoordinates: 스크린→월드 좌표 변환
- getScreenCoordinates: 월드→스크린 좌표 변환
- 테스트: 18개 스펙

**graphUtils.ts** - 그래프 검증/순환 감지
- isValidConnection: 타입/방향/순환 검증
- detectCycle: DFS 기반 순환 감지
- findPath: 노드 간 경로 찾기
- getConnectedNodes: 관련 노드 조회
- 테스트: 25개 스펙

**dataFlowUtils.ts** - 데이터 흐름 전파
- propagateDataFlow: 업스트림 변경 다운스트림 전파
- getExecutionOrder: 토폴로지 정렬로 실행 순서 계산
- collectInputs: 노드 입력값 수집
- 테스트: 16개 스펙

### src/factories/ - 팩토리 패턴 (2026-03-15 신규)

**nodeFactory.ts** - 노드 생성 팩토리
- createNode: 타입별 노드 생성
- createConnectors: 노드별 커넥터 자동 생성
- applyDefaults: 기본값 적용
- 테스트: 21개 스펙

### src/data/ - 상수/기본값 (2026-03-15 확장)

**nodeDefaults.ts** - 노드 타입별 기본값 (신규)
- 28개 노드 타입별 입출력 커넥터 정의
- 타입별 기본 데이터 값
- 커넥터 색상 스키마
- 테스트: 13개 스펙

**types.ts** - 타입 정의
- `ProjectState`: 프로젝트의 전체 상태
- `Node`: 노드 데이터 구조
- `Connection`: 두 노드 간 연결
- `ConnectorType`: TEXT, IMAGE, VIDEO, ARRAY 등
- `NodeData`: 각 노드 고유 데이터

**vite.config.ts** - Vite 빌드 설정
- React 플러그인 설정
- 개발 서버 포트 설정 (기본 5173)
- 빌드 최적화 설정
- Alias 경로 설정

### src/components/ - UI 컴포넌트

**NodeComponent.tsx**
- 캔버스에 표시되는 개별 노드의 UI 렌더링
- 노드 입력/출력 커넥터 렌더링
- 드래그 기능 (react-draggable 사용)
- 노드 선택/해제 시각화
- Bypass/Collapse 버튼

**ConnectionComponent.tsx**
- 두 노드 간 연결선 SVG 렌더링
- 곡선 경로 생성 (Bezier curve)
- 연결선 선택 가능
- 연결선 삭제 기능
- 커넥터 타입별 색상 표시

**Toolbar.tsx**
- 파일 메뉴 (새 프로젝트, 열기, 저장, 내보내기)
- 편집 메뉴 (언두/리도, 잘라내기/복사/붙여넣기)
- 실행/일시정지 버튼
- 설정/도움말 링크

**ToolsPanel.tsx**
- 왼쪽 사이드바 노드 타입 목록
- 각 노드의 아이콘 및 설명
- 노드 검색 기능
- 노드 드래그앤드롭 준비

**HistoryPanel.tsx**
- 최근 실행 결과 표시
- 노드 실행 로그
- 에러 메시지 및 경고
- 결과 이미지/비디오 미리보기

**ZoomControls.tsx**
- 줌인/줌아웃 버튼
- 전체 맞춤 버튼
- 줌 레벨 표시 (%)

**ProjectControls.tsx**
- 프로젝트 이름 입력
- 저장 버튼
- 마지막 저장 시간 표시
- 자동 저장 토글

**PlaygroundModal.tsx**
- AI 기능 테스트 모달
- 프롬프트 입력
- API 매개변수 조정
- 결과 미리보기

### src/components/nodes/ - 노드 컴포넌트들

각 노드는 다음 구조를 따릅니다:

**기본 노드들** (시각/데이터 입출력)
- `ImageNode.tsx`: 이미지 입출력
- `VideoNode.tsx`: 비디오 입출력
- `TextNode.tsx`: 텍스트 입력
- `ArrayNode.tsx`: 배열 처리
- `ListNode.tsx`: 리스트 처리

**AI 생성 노드들** (Google Gemini API 활용)
- `AssistantNode.tsx`: 일반 AI 어시스턴트
- `ImageEditNode.tsx`: AI 기반 이미지 편집
- `VtonNode.tsx`: Virtual Try-On AI

**처리 노드들** (이미지/비디오 처리)
- `ImageModifyNode.tsx`: 필터, 리사이징 등
- `RmbgNode.tsx`: 배경 제거
- `CompositeNode.tsx`: 이미지 합성
- `StitchNode.tsx`: 이미지/비디오 스티칭
- `GridShotNode.tsx`: 그리드 이미지 생성

**로드/저장 노드들**
- `ImageLoadNode.tsx`: 로컬 이미지 로드
- `VideoLoadNode.tsx`: 로컬 비디오 로드
- `ImagePreviewNode.tsx`: 결과 미리보기

**고급 기능 노드들**
- `StoryboardNode.tsx`: 영상 스토리보드
- `ScriptNode.tsx`: 영상 스크립트 관리
- `CameraNode.tsx`: 카메라 파라미터
- `PresetNode.tsx`: 저장된 프리셋 로드
- `ModelNode.tsx`: AI 모델 선택

### src/services/ - 비즈니스 로직

**geminiService.ts** - Google Gemini API 통합 서비스

주요 기능:
- `initializeGemini()`: API 초기화
- `generateImage(prompt, params)`: 텍스트→이미지 생성
- `generateVideo(prompt, duration)`: 텍스트→비디오 생성
- `editImage(image, instruction)`: 지정된 지시에 따라 이미지 편집
- `removeBackground(image)`: 자동 배경 제거
- `virtualTryOn(garment, model)`: 가상 착용 시뮬레이션
- `analyzeImage(image)`: 이미지 내용 분석
- `error handling`: API 에러 처리 및 재시도 로직

**imageProcessingService.ts** - Canvas 기반 이미지 처리

주요 기능:
- `compositeImages(base, overlay, options)`: 여러 이미지 합성
- `stitchImages(images, direction)`: 이미지 수평/수직 스티칭
- `resizeImage(image, width, height)`: 이미지 리사이징
- `applyFilter(image, filterType)`: 필터 적용 (밝기, 대비 등)
- `cropImage(image, rect)`: 이미지 자르기
- `extractGrid(image, rows, cols)`: 그리드 추출
- `canvasToBlob()`: Canvas→Blob 변환

**dbService.ts** - IndexedDB 프로젝트 관리

주요 기능:
- `initializeDB()`: IndexedDB 초기화 (CosmosAssetsDB)
- `saveProject(projectId, projectState)`: 프로젝트 저장
- `loadProject(projectId)`: 프로젝트 로드
- `deleteProject(projectId)`: 프로젝트 삭제
- `listProjects()`: 저장된 프로젝트 목록 조회
- `exportProject(projectId)`: 프로젝트 JSON 내보내기
- `importProject(jsonData)`: JSON에서 프로젝트 가져오기

### src/data/ - 설정 및 상수

**constants.ts** - 전역 상수 정의
```
NODE_TYPES: {
  IMAGE, VIDEO, TEXT, ASSISTANT, IMAGE_EDIT,
  IMAGE_LOAD, ... (30개 이상)
}

CONNECTOR_TYPES: {
  TEXT: 'blue',
  IMAGE: 'purple',
  VIDEO: 'yellow',
  ARRAY: 'green'
}

DEFAULT_NODE_SIZE: { width: 200, height: 100 }
CANVAS_GRID_SIZE: 20
MAX_ZOOM: 4.0
MIN_ZOOM: 0.1
```

**presets.ts** - 워크플로우 프리셋

패션 워크플로우 프리셋:
- 배경 제거 → 필터 → Virtual Try-On
- 상품 촬영 → 배경 변경 → 내보내기

마케팅 프리셋:
- 텍스트 입력 → AI 이미지 생성 → 배치 처리

비디오 프리셋:
- 스토리보드 → 장면별 생성 → 스티칭 → 최종 비디오

**scriptStyles.ts** - 스크립트 스타일

- CINEMATIC: 영화 스타일 지시
- DOCUMENTARY: 다큐멘터리 톤
- ADVERTISEMENT: 광고 톤
- SOCIAL_MEDIA: SNS 최적화 포맷

**systemPrompts.ts** - AI 시스템 프롬프트

- 이미지 생성 프롬프트 템플릿
- 비디오 생성 프롬프트 템플릿
- VTON 특화 프롬프트
- 어시스턴트 역할 정의

---

## 핵심 데이터 구조

### ProjectState (App.tsx)
```
{
  nodes: Node[],           // 모든 노드 배열
  connections: Connection[], // 연결선 배열
  history: ProjectState[], // 언두/리도 히스토리
  panZoom: {              // 캔버스 이동/줌
    x: number,
    y: number,
    scale: number
  },
  nodeRenderOrder: string[] // 노드 렌더링 순서
}
```

### Node
```
{
  id: string,              // 고유 ID
  type: NodeType,          // 노드 타입
  position: { x, y },      // 캔버스 위치
  size: { width, height }, // 노드 크기
  data: NodeData,          // 노드별 고유 데이터
  inputs: Connector[],     // 입력 커넥터
  outputs: Connector[],    // 출력 커넥터
  isBypassed: boolean,     // Bypass 상태
  isCollapsed: boolean     // Collapse 상태
}
```

### Connection
```
{
  id: string,
  fromNodeId: string,
  fromConnectorId: string,
  toNodeId: string,
  toConnectorId: string
}
```

---

## 모듈 구성도

```
┌─────────────────────────────────────────────┐
│         App.tsx (상태 관리)                  │
│    ▼              ▼              ▼           │
├─────────────────────────────────────────────┤
│  Toolbar  │  Canvas  │  ToolsPanel  │ Panels│
│  (제어)   │ (렌더)   │  (노드선택)  │(결과) │
├─────────────────────────────────────────────┤
│         NodeComponent  ConnectionComponent   │
│         (30+ 노드 컴포넌트)                  │
├─────────────────────────────────────────────┤
│  Service Layer (비즈니스 로직)              │
│  ├─ geminiService (AI API)                 │
│  ├─ imageProcessingService (처리)          │
│  └─ dbService (저장소)                     │
├─────────────────────────────────────────────┤
│  Data Layer (상수 & 프리셋)                │
│  ├─ constants.ts                           │
│  ├─ presets.ts                             │
│  ├─ scriptStyles.ts                        │
│  └─ systemPrompts.ts                       │
└─────────────────────────────────────────────┘
```

---

## 중요 파일 위치

| 기능 | 파일 위치 |
|------|---------|
| 상태 관리 | `src/App.tsx` |
| 타입 정의 | `src/types.ts` |
| Google Gemini API | `src/services/geminiService.ts` |
| 이미지 처리 | `src/services/imageProcessingService.ts` |
| 데이터 저장 | `src/services/dbService.ts` |
| 노드 렌더링 | `src/components/NodeComponent.tsx` |
| 연결선 렌더링 | `src/components/ConnectionComponent.tsx` |
| 노드 목록 | `src/components/nodes/*.tsx` (30개 파일) |
| 설정 상수 | `src/data/constants.ts` |
| 프리셋 | `src/data/presets.ts` |
| 스크립트 스타일 | `src/data/scriptStyles.ts` |
| 프롬프트 | `src/data/systemPrompts.ts` |

---

## 개발 시 주의사항

### 새로운 노드 추가 시
1. `src/components/nodes/` 디렉토리에 새 컴포넌트 파일 생성
2. `src/types.ts`에 새 NodeType 추가
3. `src/data/constants.ts`에 노드 메타데이터 등록
4. 필요시 `src/services/`에 새 함수 추가
5. App.tsx의 노드 렌더링 로직에 추가

### Google Gemini API 사용 시
- API 키는 환경 변수로 관리
- 요청 비용 고려하여 배치 처리 최적화
- 에러 처리 및 재시도 로직 필수
- 타임아웃 설정 필수

### 성능 최적화
- 30개 이상의 노드: Virtual rendering 검토
- 큰 이미지: Canvas 처리 최적화
- IndexedDB: 정기적 정리 작업 필요
- React memo/useMemo로 재렌더링 최소화

---

**작성일**: 2026-03-14
**최종 수정**: 2026-03-14
