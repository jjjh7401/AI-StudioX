---
id: SPEC-APP-001
version: 1.0.0
status: completed
created: 2026-03-13
updated: 2026-03-13
author: jjjh7401
priority: high
issue_number: 0
---

# SPEC-APP-001: AI-StudioX - 무한 캔버스 AI 콘텐츠 생성 앱

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-03-13 | jjjh7401 | 초기 SPEC 작성 |

---

## 1. 개요

AI-StudioX는 무한 캔버스 위에서 에이전트와 노드를 사용하여 원하는 콘텐츠(이미지, 비디오, 텍스트)를 생성하는 비주얼 AI 워크플로우 앱이다.

- **배포 URL**: https://ai-studio-x-lime.vercel.app
- **핵심 가치**: 시각적 노드 기반 인터페이스를 통해 복잡한 AI 콘텐츠 생성 파이프라인을 직관적으로 구성

---

## 2. Environment (환경)

### 2.1 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| UI 프레임워크 | React | 19.x |
| 언어 | TypeScript | 5.x |
| 빌드 도구 | Vite | 6.x |
| AI API | Google Gemini (@google/genai) | ^1.29.0 |
| 캔버스/줌/팬 | D3.js | v7.x |
| 상태 관리 | useImmer | latest |
| 드래그 | react-draggable | latest |
| 이미지 비교 | react-compare-slider | latest |
| 아이콘 | @heroicons/react | latest |
| 데이터 저장 | IndexedDB | 브라우저 내장 |

### 2.2 배포 환경

- **호스팅**: Vercel
- **빌드**: Vite 6 기반 정적 빌드
- **대상 브라우저**: Chrome, Edge, Firefox (최신 2개 버전)

### 2.3 현재 아키텍처

```
src/
  App.tsx              (127KB - 모놀리식 메인 컴포넌트)
  types.ts             (9.8KB - 27개 노드 타입 정의)
  components/
    NodeComponent.tsx   (42.5KB)
    HistoryPanel.tsx    (15.7KB)
    PlaygroundModal.tsx (65.3KB)
    ProjectControls.tsx (14.3KB)
    Toolbar.tsx         (9.8KB)
    ToolsPanel.tsx
    ConnectionComponent.tsx
    ZoomControls.tsx
    nodes/              (노드별 세부 컴포넌트)
  services/
    geminiService.ts    (21.8KB)
    dbService.ts        (3.9KB)
    imageProcessingService.ts (7.2KB)
```

---

## 3. Assumptions (가정)

- **A1**: 사용자는 Google Gemini API 키를 보유하고 있다
- **A2**: 브라우저의 IndexedDB가 정상 동작하는 환경이다
- **A3**: 네트워크 연결이 안정적이어서 Gemini API 호출이 가능하다
- **A4**: 캔버스에 동시에 배치되는 노드 수는 일반적으로 100개 이하이다
- **A5**: 단일 사용자 로컬 앱이며, 멀티유저 동시 편집은 고려하지 않는다
- **A6**: 이미지/비디오 생성은 Gemini API에 전적으로 의존한다

---

## 4. Requirements (요구사항)

### 모듈 1: 캔버스 & 노드 시스템 (Canvas & Node System)

#### 유비쿼터스 요구사항 (Ubiquitous)

- **REQ-CANVAS-001**: 시스템은 **항상** D3.js 기반 무한 캔버스를 제공하여 팬(pan), 줌(zoom) 조작이 가능해야 한다
- **REQ-CANVAS-002**: 시스템은 **항상** 27개 노드 타입(Text, Assistant, Image, Video, Camera, Model, Vton, Comment, Storyboard, Script, Array, List, Composite, Stitch, GridShot, GridExtractor, ImageModify, Group 등)을 지원해야 한다
- **REQ-CANVAS-003**: 시스템은 **항상** 노드의 드래그 앤 드롭 배치를 지원해야 한다

#### 이벤트 기반 요구사항 (Event-Driven)

- **REQ-CANVAS-010**: **WHEN** 사용자가 툴바에서 노드 타입을 선택 **THEN** 캔버스 위에 해당 노드가 생성되어야 한다
- **REQ-CANVAS-011**: **WHEN** 사용자가 Alt+드래그 조작을 수행 **THEN** 선택된 노드가 복제(Copy Mode)되어야 한다
- **REQ-CANVAS-012**: **WHEN** 사용자가 마우스로 영역을 드래그 **THEN** 해당 영역 내의 모든 노드가 멀티 선택되어야 한다
- **REQ-CANVAS-013**: **WHEN** 사용자가 키보드 단축키를 입력 **THEN** 대응하는 동작이 실행되어야 한다
  - V: 선택 모드
  - H: 팬 모드
  - C: 코멘트 노드 생성
  - Ctrl+B: 바이패스 토글
  - Ctrl+C/V: 복사/붙여넣기
  - Ctrl+S: 프로젝트 저장

#### 상태 기반 요구사항 (State-Driven)

- **REQ-CANVAS-020**: **IF** 캔버스에 100개 이상의 노드가 존재 **THEN** 가시 영역 외의 노드 렌더링을 최적화하여 성능을 유지해야 한다
- **REQ-CANVAS-021**: **IF** 노드가 그룹 내에 포함 **THEN** 그룹 이동 시 하위 노드들이 함께 이동해야 한다

#### 금지 요구사항 (Unwanted)

- **REQ-CANVAS-030**: 시스템은 노드 타입 간 호환되지 않는 연결을 생성**하지 않아야 한다**
- **REQ-CANVAS-031**: 시스템은 캔버스 조작 중 사용자의 작업 데이터를 손실**시키지 않아야 한다**

---

### 모듈 2: AI 콘텐츠 생성 (AI Content Generation)

#### 유비쿼터스 요구사항 (Ubiquitous)

- **REQ-AI-001**: 시스템은 **항상** Google Gemini API를 통해 이미지, 비디오, 텍스트 콘텐츠를 생성할 수 있어야 한다
- **REQ-AI-002**: 시스템은 **항상** AI 생성 요청의 진행 상태를 사용자에게 표시해야 한다

#### 이벤트 기반 요구사항 (Event-Driven)

- **REQ-AI-010**: **WHEN** 사용자가 Assistant 노드에서 프롬프트를 입력하고 실행 **THEN** Gemini API를 호출하여 텍스트/이미지 응답을 생성해야 한다
- **REQ-AI-011**: **WHEN** 사용자가 Storyboard 노드를 실행 **THEN** 5개 씬(scene)의 이미지 시퀀스를 생성해야 한다
- **REQ-AI-012**: **WHEN** 사용자가 Script 노드를 실행 **THEN** 상품 분석 -> 스크립트 작성 -> 씬 이미지 생성의 파이프라인을 수행해야 한다
- **REQ-AI-013**: **WHEN** 사용자가 Model 노드를 실행 **THEN** 지정된 성별, 나이, 헤어스타일의 AI 패션 모델 이미지를 생성해야 한다
- **REQ-AI-014**: **WHEN** 사용자가 VTON(Virtual Try-On) 노드를 실행 **THEN** 의상 아이템과 포즈를 조합한 가상 피팅 이미지를 생성해야 한다
- **REQ-AI-015**: **WHEN** 사용자가 ImageModify 노드에서 마크업 기반 편집을 수행 **THEN** 선택 영역만 AI로 수정해야 한다
- **REQ-AI-016**: **WHEN** 사용자가 Video 노드를 실행 **THEN** 이미지를 기반으로 비디오를 생성해야 한다
- **REQ-AI-017**: **WHEN** 사용자가 GridShot 노드를 실행 **THEN** 그리드 레이아웃으로 이미지를 생성해야 한다

#### 상태 기반 요구사항 (State-Driven)

- **REQ-AI-020**: **IF** Gemini API 키가 미설정 **THEN** API 키 입력을 안내하고 생성 요청을 차단해야 한다
- **REQ-AI-021**: **IF** AI 생성 요청이 진행 중 **THEN** 해당 노드에 로딩 상태를 표시하고 중복 요청을 방지해야 한다

#### 금지 요구사항 (Unwanted)

- **REQ-AI-030**: 시스템은 API 키를 평문으로 외부에 전송**하지 않아야 한다** (로컬 저장만 허용)
- **REQ-AI-031**: 시스템은 API 호출 실패 시 사용자에게 에러를 알리지 않고 무시**하지 않아야 한다**

#### 선택 요구사항 (Optional)

- **REQ-AI-040**: **가능하면** Playground Modal을 통한 AI 테스트 인터페이스를 제공
- **REQ-AI-041**: **가능하면** 생성된 콘텐츠의 비교(Compare Slider) 기능을 제공

---

### 모듈 3: 연결 시스템 (Connection System)

#### 유비쿼터스 요구사항 (Ubiquitous)

- **REQ-CONN-001**: 시스템은 **항상** 노드 간 연결을 타입 기반으로 검증해야 한다 (Text, Image, Video, Array)
- **REQ-CONN-002**: 시스템은 **항상** 연결선을 시각적으로 렌더링하고 데이터 흐름 방향을 표시해야 한다

#### 이벤트 기반 요구사항 (Event-Driven)

- **REQ-CONN-010**: **WHEN** 사용자가 출력 포트에서 입력 포트로 드래그 **THEN** 타입 호환성을 검사하고 연결을 생성해야 한다
- **REQ-CONN-011**: **WHEN** 연결된 소스 노드의 출력이 변경 **THEN** 연결된 대상 노드에 데이터를 전달해야 한다
- **REQ-CONN-012**: **WHEN** 사용자가 연결선을 클릭하여 삭제 **THEN** 해당 연결을 즉시 제거해야 한다

#### 금지 요구사항 (Unwanted)

- **REQ-CONN-030**: 시스템은 순환 연결(circular dependency)을 허용**하지 않아야 한다**
- **REQ-CONN-031**: 시스템은 타입이 호환되지 않는 노드 간 연결을 생성**하지 않아야 한다**

---

### 모듈 4: 프로젝트 관리 (Project Management)

#### 유비쿼터스 요구사항 (Ubiquitous)

- **REQ-PROJ-001**: 시스템은 **항상** IndexedDB를 사용하여 프로젝트 데이터를 로컬에 영속화해야 한다
- **REQ-PROJ-002**: 시스템은 **항상** 프로젝트의 전체 상태(노드, 연결, 캔버스 위치)를 저장/복원할 수 있어야 한다

#### 이벤트 기반 요구사항 (Event-Driven)

- **REQ-PROJ-010**: **WHEN** 사용자가 Ctrl+S를 입력 **THEN** 현재 프로젝트 상태를 IndexedDB에 저장해야 한다
- **REQ-PROJ-011**: **WHEN** 앱이 시작되고 저장된 프로젝트가 존재 **THEN** 마지막 상태를 자동으로 복원해야 한다
- **REQ-PROJ-012**: **WHEN** 사용자가 프로젝트를 새로 생성 **THEN** 빈 캔버스로 초기화해야 한다

#### 상태 기반 요구사항 (State-Driven)

- **REQ-PROJ-020**: **IF** IndexedDB 저장 용량이 부족 **THEN** 사용자에게 경고를 표시해야 한다

#### 금지 요구사항 (Unwanted)

- **REQ-PROJ-030**: 시스템은 저장되지 않은 변경사항이 있을 때 확인 없이 페이지를 이탈**시키지 않아야 한다**

---

### 모듈 5: UI/UX 인터페이스 (UI/UX Interface)

#### 유비쿼터스 요구사항 (Ubiquitous)

- **REQ-UI-001**: 시스템은 **항상** 반응형 레이아웃을 제공하여 다양한 화면 크기에 대응해야 한다
- **REQ-UI-002**: 시스템은 **항상** History Panel을 통해 생성된 에셋(이미지, 비디오) 이력을 조회할 수 있어야 한다
- **REQ-UI-003**: 시스템은 **항상** 툴바를 통해 노드 생성, 모드 전환, 도구 접근을 제공해야 한다

#### 이벤트 기반 요구사항 (Event-Driven)

- **REQ-UI-010**: **WHEN** AI 콘텐츠 생성이 완료 **THEN** History Panel에 결과를 자동으로 추가해야 한다
- **REQ-UI-011**: **WHEN** 사용자가 History Panel의 에셋을 클릭 **THEN** 해당 에셋의 상세 정보를 표시해야 한다
- **REQ-UI-012**: **WHEN** 사용자가 Playground Modal을 열기 **THEN** 독립된 AI 테스트 인터페이스를 제공해야 한다
- **REQ-UI-013**: **WHEN** 줌 컨트롤을 조작 **THEN** 캔버스의 줌 레벨을 반영하고 현재 레벨을 표시해야 한다

#### 선택 요구사항 (Optional)

- **REQ-UI-040**: **가능하면** 다크 모드 지원을 제공
- **REQ-UI-041**: **가능하면** 노드 검색 및 필터링 기능을 제공

---

## 5. Specifications (명세)

### 5.1 노드 타입 명세

| 노드 타입 | 입력 | 출력 | 설명 |
|-----------|------|------|------|
| Text | - | Text | 텍스트 입력/편집 |
| Assistant | Text, Image | Text, Image | AI 대화형 생성 |
| Image | - | Image | 이미지 표시/업로드 |
| Video | Image | Video | 비디오 생성 |
| Camera | - | Image | 웹캠 캡처 |
| Model | Text | Image | AI 패션 모델 생성 (성별/나이/헤어) |
| Vton | Image, Text | Image | 가상 피팅 (의상+포즈) |
| Comment | - | - | 주석용 메모 |
| Storyboard | Text | Image[] | 5씬 시퀀스 생성 |
| Script | Text | Image[], Text | 상품분석->스크립트->씬이미지 |
| Array | Image[] | Image[] | 이미지 배열 처리 |
| List | Any[] | Any[] | 범용 리스트 |
| Composite | Image[] | Image | 이미지 합성 |
| Stitch | Image[] | Image | 이미지 스티칭 |
| GridShot | Text | Image | 그리드 레이아웃 생성 |
| GridExtractor | Image | Image[] | 그리드에서 개별 이미지 추출 |
| ImageModify | Image | Image | 마크업 기반 선택 편집 |
| Group | Node[] | Node[] | 노드 그룹핑 |

### 5.2 연결 타입 호환성 매트릭스

| 소스 타입 | 호환 대상 타입 |
|----------|--------------|
| Text | Text, Assistant, Model, Storyboard, Script, Vton, GridShot |
| Image | Image, Assistant, Video, Vton, Composite, Stitch, ImageModify, Array, GridExtractor |
| Video | Video |
| Array | Array, List, Composite, Stitch |

### 5.3 Gemini API 통합 명세

- **서비스**: geminiService.ts (21.8KB)
- **API**: @google/genai ^1.29.0
- **주요 기능**:
  - 텍스트 생성 (채팅 기반)
  - 이미지 생성 (프롬프트 기반)
  - 이미지 편집 (마스크 기반)
  - 비디오 생성 (이미지-to-비디오)
  - 멀티모달 입력 처리 (텍스트+이미지)

---

## 6. Traceability (추적성)

| 요구사항 ID | 모듈 | 관련 컴포넌트 | 우선순위 |
|------------|------|-------------|---------|
| REQ-CANVAS-001~003 | 캔버스 | App.tsx, D3 | Priority High |
| REQ-CANVAS-010~013 | 캔버스 | App.tsx, Toolbar.tsx | Priority High |
| REQ-AI-001~002 | AI 생성 | geminiService.ts | Priority High |
| REQ-AI-010~017 | AI 생성 | NodeComponent.tsx, geminiService.ts | Priority High |
| REQ-CONN-001~002 | 연결 | ConnectionComponent.tsx | Priority High |
| REQ-CONN-010~012 | 연결 | App.tsx, ConnectionComponent.tsx | Priority Medium |
| REQ-PROJ-001~002 | 프로젝트 | dbService.ts | Priority Medium |
| REQ-PROJ-010~012 | 프로젝트 | ProjectControls.tsx, dbService.ts | Priority Medium |
| REQ-UI-001~003 | UI/UX | Toolbar.tsx, HistoryPanel.tsx | Priority Medium |
| REQ-UI-010~013 | UI/UX | HistoryPanel.tsx, PlaygroundModal.tsx, ZoomControls.tsx | Priority Low |

---

## 7. 구현 노트 (Implementation Notes)

> 추가 일자: 2026-03-13
> 구현 완료: SPEC-APP-001 v1.0.0

### 구현 완료 현황

| 모듈 | 상태 | 비고 |
|------|------|------|
| 캔버스 & 노드 시스템 | ✅ 완료 | 27개 노드 타입 전체 구현 |
| AI 콘텐츠 생성 | ✅ 완료 | 8개 파이프라인 + 에러 핸들링 |
| 연결 시스템 | ✅ 완료 | 타입 검증 + 순환 감지 |
| 프로젝트 관리 | ✅ 완료 | IndexedDB 영속성 |
| UI/UX | ✅ 완료 | Toolbar, History, Playground |

### 구현 접근 방식

- **신규 빌드**: 기존 코드 없이 SPEC-APP-001 요구사항으로 처음부터 구축
- **아키텍처**: 커스텀 훅 기반 관심사 분리 (useCanvas, useNodes, useConnections, useProject 등)
- **테스트**: TDD 방법론, 159개 테스트 통과

### 범위 변경 사항

- 추가 구현된 노드 타입: AudioNode, ClassifyNode, DetectNode, KeywordNode, SegmentNode, SentimentNode, SummaryNode, TranscribeNode, TranslateNode (27개 이상 지원)
- 번들 크기: 617KB (권고 500KB 초과 - @google/genai lazy import로 개선 가능)

### 잔여 개선 사항

- 연결 드래그 UX (포트→포트 드래그 인터랙션) 완성
- AI 노드 실행 버튼 세부 연결
- 번들 크기 최적화 (lazy import)
