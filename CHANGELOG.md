# Changelog

모든 주요 변경 사항이 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따릅니다.

## [1.0.0] - 2026-03-13

### 추가됨

#### 캔버스 & 노드 시스템
- D3.js 기반 무한 캔버스 (팬/줌/변환)
- 27개 노드 타입 지원 (Text, Assistant, Image, Video, Camera, Model, Vton, Comment, Storyboard, Script, Array, List, Composite, Stitch, GridShot, GridExtractor, ImageModify, Group 등)
- react-draggable 기반 노드 드래그 앤 드롭
- NodeFactory 패턴으로 노드 타입별 생성 지원
- Alt+드래그 노드 복제 (Copy Mode)
- 영역 드래그 멀티 선택

#### AI 콘텐츠 생성
- Google Gemini API 통합 (텍스트, 이미지, 비디오 생성)
- 8개 AI 실행 파이프라인 (Assistant, Storyboard, Script, Model, Vton, ImageModify, Video, GridShot)
- API 키 로컬 저장 (외부 전송 없음)
- 중복 요청 방지 로딩 상태 관리

#### 연결 시스템
- 타입 기반 노드 연결 검증 (Text, Image, Video, Array)
- SVG 베지어 곡선 연결선 렌더링
- 순환 연결 감지 및 차단
- ConnectionValidator 유틸리티

#### 프로젝트 관리
- IndexedDB 로컬 영속성
- Ctrl+S 저장, 앱 시작 시 자동 복원
- 미저장 변경사항 이탈 보호 (beforeunload)
- 스토리지 용량 모니터링

#### UI/UX
- 세로 Toolbar (19개 노드 생성 버튼)
- ZoomControls (줌 레벨 표시)
- HistoryPanel (AI 생성 이력)
- PlaygroundModal (독립 AI 테스트)
- 키보드 단축키 (V, H, C, Ctrl+B, Ctrl+C/V, Ctrl+S, Delete)

#### 개발
- TDD 방법론 (RED-GREEN-REFACTOR)
- 159개 테스트 (17개 파일)
- TypeScript strict 모드
- Vite 6 + Vitest 빌드 환경

### 기술 스택
- React 19.x + TypeScript 5.x + Vite 6.x
- D3.js v7 (무한 캔버스)
- @google/genai ^1.29.0 (Gemini API)
- useImmer (불변 상태)
- react-draggable (드래그)
- IndexedDB (로컬 저장)

---
SPEC: SPEC-APP-001
