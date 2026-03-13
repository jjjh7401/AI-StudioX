---
project: AI-StudioX
version: 1.0.0
updated: 2026-03-13
---

# AI-StudioX 기술 스택

## 프로젝트 정보

**프로젝트명**: AI-StudioX
**주요 언어**: TypeScript 5.x
**프레임워크**: React 19.x
**빌드 도구**: Vite 6.x
**배포**: Vercel

## 주요 의존성

### 프론트엔드 핵심

**React 및 관련 라이브러리**
- React 19.x: UI 렌더링 엔진
- React DOM 19.x: DOM 렌더링

**빌드 및 개발 도구**
- Vite 6.x: 차세대 빌드 도구 및 개발 서버
- TypeScript 5.x: 정적 타입 검사

### 캔버스 및 시각화

**D3.js v7**
- 무한 캔버스 구현
- 줌 및 팬(Pan) 기능
- SVG 기반 렌더링
- 상호작용 기능

### AI 및 API 통합

**Google Generative AI**
- @google/genai ^1.29.0: Google Gemini API 클라이언트
- 이미지 생성
- 비디오 생성
- 텍스트 생성
- 멀티모달 처리

### 상태 관리 및 유틸리티

**immer**
- useImmer: 불변 상태 관리
- 상태 업데이트 간소화
- 깊은 업데이트 지원

**react-draggable**
- 노드 드래그 기능
- 터치 이벤트 지원

**react-compare-slider**
- 이미지 비교 슬라이더
- Before/After 이미지 비교

**@heroicons/react**
- UI 아이콘 라이브러리
- 24x24, 20x20 사이즈 지원

### 상태 지속화

**IndexedDB**
- 브라우저 로컬 저장소
- 큰 바이너리 데이터 저장
- 비동기 데이터베이스 API
- 프로젝트 영속화

## 개발 의존성

### 빌드 및 번들링
- @vitejs/plugin-react: Vite React 플러그인
- vite: 빌드 도구

### 타입 검사
- TypeScript: 정적 타입 검사
- @types/react: React 타입 정의
- @types/react-dom: React DOM 타입 정의
- @types/d3: D3.js 타입 정의
- @types/node: Node.js 타입 정의

### 코드 품질
- ESLint: 코드 린팅
- Prettier: 코드 포매팅
- @typescript-eslint/eslint-plugin: TypeScript 린팅

### 테스트
- Vitest: 테스트 프레임워크
- @testing-library/react: React 테스트 유틸리티
- @testing-library/jest-dom: DOM 매처

## 배포 환경

### Vercel
- 정적 빌드 배포
- CDN을 통한 글로벌 배포
- 자동 배포 (GitHub 푸시 시)
- 환경 변수 관리
- 성능 최적화

## 빌드 및 실행

### 필수 요구사항
- Node.js 18.0 이상
- npm 9.0 이상 또는 yarn, pnpm

### 빌드 명령어

**개발 서버**
```bash
npm run dev
```
Vite 개발 서버 시작, HMR 지원

**프로덕션 빌드**
```bash
npm run build
```
최적화된 프로덕션 번들 생성

**빌드 결과 미리보기**
```bash
npm run preview
```
로컬에서 프로덕션 빌드 미리보기

**타입 검사**
```bash
npm run type-check
```
TypeScript 타입 검사

**린팅**
```bash
npm run lint
```
ESLint 실행

**코드 포매팅**
```bash
npm run format
```
Prettier 코드 포매팅

## 환경 변수 설정

필수 환경 변수:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**설정 방법**
1. 프로젝트 루트에 `.env.local` 파일 생성
2. 위 변수 추가
3. 개발 서버 재시작

## 버전 정보

### React 및 TypeScript 최신 버전 사용

**React 19.x 특징**
- 더 빠른 렌더링
- 개선된 개발자 경험
- 새로운 훅 API

**TypeScript 5.x 특징**
- 더 빠른 컴파일
- 개선된 타입 추론
- 새로운 언어 기능

**Vite 6.x 특징**
- Rollup 4 기반
- 더 빠른 빌드
- 개선된 HMR
- Turbopack 호환성

## 성능 최적화

### Vite 기반 최적화
- 번들 분할 (Code Splitting)
- 필요한 코드만 로드 (Dynamic Import)
- 트리 쉐이킹 (Tree Shaking)

### D3.js 최적화
- 캔버스 줌/팬 성능 최적화
- SVG 렌더링 효율화

### 이미지 최적화
- 이미지 압축
- 레이지 로딩

## 보안 고려사항

### API 보안
- Gemini API 키는 환경 변수로 관리
- 프론트엔드에서 민감한 데이터 노출 금지
- CORS 정책 준수

### 데이터 보안
- IndexedDB 데이터는 로컬 저장
- HTTPS 배포 (Vercel)
- 입력 검증 및 살리이제이션

## 개발 워크플로우

### 로컬 개발
1. 저장소 클론
2. `npm install` 실행
3. `.env.local` 파일 생성
4. `npm run dev` 실행
5. 브라우저에서 `http://localhost:5173` 접속

### 테스트
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### 배포
```bash
git add .
git commit -m "메시지"
git push origin main
# Vercel이 자동으로 배포
```

## 의존성 관리

### 의존성 업데이트 확인
```bash
npm outdated
```

### 의존성 업데이트
```bash
npm update
```

### 의존성 감사
```bash
npm audit
npm audit fix
```

## 성능 지표 목표

- First Contentful Paint (FCP): < 1.5초
- Largest Contentful Paint (LCP): < 2.5초
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3초

## 지원되는 브라우저

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 라이선스

프로젝트 라이선스 정보는 별도 문서 참고

## 참고 자료

### 공식 문서
- React: https://react.dev
- Vite: https://vitejs.dev
- TypeScript: https://www.typescriptlang.org
- D3.js: https://d3js.org
- Google Gemini API: https://ai.google.dev

### 커뮤니티
- React 커뮤니티: https://react.dev/community
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Vite 토론: https://github.com/vitejs/vite/discussions
