<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/56774983-37c7-4576-b8ab-4c74115ab57b

## Architecture (Updated 2026-03-15)

StudioX v1 uses a **hooks-based custom architecture** with TDD approach:

### 커스텀 훅 (7개)
- `useCanvas` — D3 pan/zoom 관리
- `useNodes` — 노드 CRUD/선택/이동
- `useConnections` — 커넥션 시스템
- `useNodeGeneration` — AI 생성 상태
- `useProjectManager` — IndexedDB 저장
- `useKeyboardShortcuts` — 키보드 단축키
- `useUndoRedo` — 히스토리 스택

### 순수 유틸리티 (3개)
- `canvasUtils` — 좌표 변환
- `graphUtils` — 그래프 검증/순환 감지
- `dataFlowUtils` — 데이터 흐름 전파

### 팩토리 + 데이터
- `nodeFactory` — 노드 생성 자동화
- `nodeDefaults` — 타입별 기본값

**테스트**: 349개 테스트 통과 (TypeScript 0 오류, ~84% 커버리지)

---

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
