# AI-StudioX

무한 캔버스 위에서 AI 에이전트와 노드를 사용하여 이미지, 비디오, 텍스트 콘텐츠를 생성하는 비주얼 AI 워크플로우 앱입니다.

**배포 URL**: https://ai-studio-x-lime.vercel.app

## 주요 기능

- 🎨 **무한 캔버스**: D3.js 기반 팬/줌 지원 캔버스
- 🤖 **27개 노드 타입**: Text, Assistant, Image, Video, Model, Vton, Storyboard, Script 등
- 🔗 **타입 기반 연결 시스템**: 노드 간 데이터 흐름 시각화
- ✨ **Google Gemini API 통합**: 이미지/비디오/텍스트 AI 생성
- 💾 **IndexedDB 영속성**: 로컬 프로젝트 저장/복원
- 📋 **History Panel**: 생성된 에셋 이력 관리
- 🎭 **Playground Modal**: 독립 AI 테스트 인터페이스

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.x | UI 프레임워크 |
| TypeScript | 5.x | 정적 타입 |
| Vite | 6.x | 빌드 도구 |
| D3.js | v7 | 무한 캔버스 |
| @google/genai | ^1.29.0 | Gemini API |
| useImmer | latest | 상태 관리 |
| react-draggable | latest | 노드 드래그 |
| IndexedDB | 브라우저 내장 | 로컬 저장 |

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 시작

```bash
npm run dev
```

### 3. 빌드

```bash
npm run build
```

### 4. 테스트

```bash
npm run test        # 워치 모드
npm run test:run    # 단일 실행
```

## 환경 설정

앱 내에서 Google Gemini API 키를 입력하세요. API 키는 로컬에만 저장됩니다.

## 노드 타입

| 노드 | 입력 | 출력 | 설명 |
|------|------|------|------|
| Text | - | Text | 텍스트 입력/편집 |
| Assistant | Text, Image | Text, Image | AI 대화형 생성 |
| Image | - | Image | 이미지 표시/업로드 |
| Video | Image | Video | 비디오 생성 |
| Camera | - | Image | 웹캠 캡처 |
| Model | Text | Image | AI 패션 모델 생성 |
| Vton | Image, Text | Image | 가상 피팅 |
| Comment | - | - | 주석 메모 |
| Storyboard | Text | Image[] | 5씬 시퀀스 생성 |
| Script | Text | Image[], Text | 상품 스크립트 파이프라인 |
| Array | Image[] | Image[] | 이미지 배열 처리 |
| List | Any[] | Any[] | 범용 리스트 |
| Composite | Image[] | Image | 이미지 합성 |
| Stitch | Image[] | Image | 이미지 스티칭 |
| GridShot | Text | Image | 그리드 레이아웃 생성 |
| GridExtractor | Image | Image[] | 그리드에서 개별 이미지 추출 |
| ImageModify | Image | Image | AI 기반 선택 편집 |
| Group | Node[] | Node[] | 노드 그룹핑 |

## 키보드 단축키

| 단축키 | 동작 |
|--------|------|
| V | 선택 모드 |
| H | 팬 모드 |
| C | 코멘트 노드 추가 |
| Ctrl+B | 바이패스 토글 |
| Ctrl+C/V | 복사/붙여넣기 |
| Ctrl+S | 프로젝트 저장 |
| Delete | 선택 노드 삭제 |

## 프로젝트 구조

```
src/
├── types/          # TypeScript 타입 정의
├── utils/          # 유틸리티 (ConnectionValidator)
├── hooks/          # React 커스텀 훅
├── components/
│   ├── canvas/     # D3 무한 캔버스
│   ├── nodes/      # 노드 컴포넌트 (27개)
│   ├── connections/ # 연결선 SVG 렌더링
│   ├── controls/   # Toolbar, ZoomControls
│   ├── panels/     # HistoryPanel
│   └── modals/     # PlaygroundModal
└── services/       # Gemini API, IndexedDB, 이미지 처리
```

## 배포 상태

- 테스트 통과: 159개 통과
- 빌드 상태: PASS (617KB 번들)
- 노드 타입: 27개 구현
- 구현 단계: Phase A-G 완료

## 라이선스

MIT

---

SPEC: SPEC-APP-001 | 버전: 1.0.0
