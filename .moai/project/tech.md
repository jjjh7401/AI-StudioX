# StudioX v1 - 기술 스택 및 개발 문서

## 기술 스택 개요

### 언어 및 프레임워크

| 항목 | 버전 | 목적 |
|------|------|------|
| **TypeScript** | 5.8.2 | 정적 타입 언어로 안정성 보장 |
| **React** | 19.2.0 | UI 컴포넌트 기반 프론트엔드 개발 |
| **Vite** | 6.2.0 | 극빠른 개발 서버 및 빌드 도구 |
| **Node.js** | 18+ | 런타임 환경 |

### UI/캔버스

| 라이브러리 | 버전 | 목적 |
|-----------|------|------|
| **D3.js** | 7.9.0 | 무한 캔버스 팬/줌 및 SVG 렌더링 |
| **react-draggable** | 4.5.0 | 노드 드래그앤드롭 기능 |
| **use-immer** | 0.11.0 | 불변 상태 관리 (Immer) |
| **react-compare-slider** | 3.1.0 | 이미지 비교 슬라이더 |

### API 및 서비스

| 서비스 | 버전 | 목적 |
|--------|------|------|
| **@google/genai** | 1.29.0 | Google Gemini API 통합 |
| **IndexedDB** | Native | 브라우저 로컬 데이터베이스 |

### 개발 도구

| 도구 | 버전 | 목적 |
|------|------|------|
| **npm** | 10+ | 패키지 관리 |
| **TypeScript Compiler** | 5.8.2 | 타입스크립트 컴파일 |
| **Vite Dev Server** | 6.2.0 | 개발 서버 |

---

## 프레임워크 선택 이유

### React 선택 사유

**컴포넌트 기반 아키텍처**
- 30개 이상의 노드를 개별 컴포넌트로 관리
- 각 노드의 독립적인 상태 및 렌더링
- 코드 재사용성과 유지보수성 극대화

**성숙한 생태계**
- 풍부한 라이브러리 및 커뮤니티
- D3, Draggable 등 캔버스 라이브러리와의 호환성
- 풍부한 튜토리얼 및 문서

**성능 최적화**
- Virtual rendering으로 대량 노드 처리 가능
- React Concurrent 기능으로 UI 반응성 향상
- Fiber 아키텍처로 부드러운 애니메이션

**개발자 경험**
- Hot Module Replacement (HMR) 지원
- React DevTools로 디버깅 용이
- 큰 개발팀으로 인한 활발한 유지보수

### Vite 선택 사유

**극빠른 개발 속도**
- ES Module 기반 번들링으로 로드 시간 1초 이하
- HMR이 거의 즉시 반영 (100ms 이내)
- 개발 생산성 30-40% 향상

**최적화된 빌드**
- 프로덕션 빌드 시 Rollup 기반으로 매우 빠름
- Tree-shaking으로 최종 번들 크기 감소
- Code splitting으로 초기 로드 시간 개선

**TypeScript 지원**
- 내장 TypeScript 지원으로 별도 설정 불필요
- 타입 검사 및 컴파일 자동화

**최신 기술**
- ESM 기반으로 미래 기술 표준에 부합
- 플러그인 생태계 성장 중

### TypeScript 선택 사유

**타입 안정성**
- 개발 시 에러 조기 발견
- 노드 연결 시 타입 불일치 방지
- API 응답 데이터 검증

**개발자 경험**
- IDE 자동완성 기능 (VS Code 완벽 지원)
- Refactoring 시 안전성 보장
- 문서화 역할 (타입이 곧 인터페이스)

**팀 협업**
- 함수 시그니처 명확화로 의도 전달 용이
- 버그 감소 및 코드 리뷰 효율성 향상
- 새로운 개발자의 빠른 온보딩

**장기 유지보수**
- 대규모 프로젝트 확장 시 필수
- 리팩토링 시 파급 효과 최소화
- 코드 품질 일관성 유지

---

## 개발 환경 요구사항

### 시스템 요구사항

**최소 사양**
- **OS**: Windows 10+, macOS 10.14+, Linux (Ubuntu 18.04+)
- **CPU**: Intel Core i5 이상 또는 동등 사양
- **RAM**: 8GB 이상 권장 (4GB 최소)
- **디스크**: 5GB 여유 공간 (node_modules 포함)

**권장 사양**
- **OS**: Windows 11, macOS 12+, Linux (Ubuntu 22.04+)
- **CPU**: Intel Core i7 이상
- **RAM**: 16GB 이상
- **디스크**: 10GB 이상 (고속 SSD)

### 필수 소프트웨어

**Node.js 및 npm**
- Node.js 18.0.0 이상 필수
- npm 9.0.0 이상 필수
- nvm (Node Version Manager) 권장

설치 확인:
```bash
node --version   # v18.0.0 이상
npm --version    # 9.0.0 이상
```

**Git**
- Git 2.30.0 이상 필수
- GitHub 계정 필요 (프로젝트 저장소 접근)

**IDE/에디터**
- **VS Code** (권장): TypeScript 지원 최고
- **WebStorm**: JetBrains IDE (유료)
- **Sublime Text**: 경량 에디터
- **Vim/Neovim**: 커스텀 설정 필수

### VS Code 확장 프로그램 (권장)

필수 확장:
- **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
- **TypeScript Vue Plugin** (Vue.vscode-typescript-vue-plugin)
- **Prettier - Code formatter** (esbenp.prettier-vscode)

권장 확장:
- **ESLint** (dbaeumer.vscode-eslint)
- **Debugger for Chrome** (msjsdiag.debugger-for-chrome)
- **REST Client** (humao.rest-client)
- **GitLens** (eamodio.gitlens)

---

## 빌드 및 배포 설정

### 개발 환경 구성

**프로젝트 클론 및 설치**

```bash
# 1. 저장소 클론
git clone <repository-url>
cd StudioX_v1

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local에 VITE_GOOGLE_GEMINI_API_KEY 설정
```

**개발 서버 실행**

```bash
# 개발 서버 시작 (http://localhost:5173)
npm run dev

# 포트 변경 (예: 3000)
npm run dev -- --port 3000
```

개발 중 자동으로 HMR이 적용되어 코드 변경 시 즉시 반영됩니다.

### 빌드 설정 (package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx"
  }
}
```

**빌드 프로세스**

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 타입 체크
npm run type-check

# 린트 검사
npm run lint
```

빌드 결과는 `dist/` 디렉토리에 생성되며, 정적 파일로 배포 가능합니다.

### Vite 설정 (vite.config.ts)

**핵심 설정**

```
React 플러그인 활성화: @vitejs/plugin-react
개발 서버 포트: 5173 (기본값)
프록시 설정: API 요청 라우팅
환경 변수: .env.local에서 로드
빌드 최적화:
  - CSS 미니피케이션
  - JavaScript 미니피케이션
  - 소스맵 생성 (개발용)
```

### 배포 전략

**Vercel 배포 (권장)**

Vercel은 Next.js와 유사한 최적화를 제공합니다.

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

Vercel 설정:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

**GitHub Pages 배포**

```bash
# 빌드
npm run build

# GitHub Pages에 배포
# dist/ 폴더를 gh-pages 브랜치로 푸시
```

**Docker 배포**

```dockerfile
# Dockerfile 예시
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

**환경 변수 관리**

```
.env.local (로컬 개발)
├─ VITE_GOOGLE_GEMINI_API_KEY

.env.production (프로덕션)
├─ VITE_GOOGLE_GEMINI_API_KEY
├─ VITE_API_BASE_URL
├─ VITE_ENVIRONMENT: "production"
```

---

## Google Gemini API 통합

### API 설정

**API 키 획득**

1. Google Cloud Console 접속: https://console.cloud.google.com
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "Generative AI API" 활성화
4. API 키 생성 (Application restriction 설정)
5. `.env.local`에 추가

**API 초기화** (geminiService.ts)

```
1. @google/genai 라이브러리 로드
2. API 키를 사용하여 클라이언트 초기화
3. 각 기능별 엔드포인트 설정
4. 요청/응답 타입 정의
```

### 지원 기능

**이미지 생성** (`generateImage`)
- 입력: 프롬프트 텍스트
- 출력: 생성된 이미지 (PNG)
- 제약: 최대 해상도 1024x1024px

**비디오 생성** (`generateVideo`)
- 입력: 프롬프트, 기간 (초)
- 출력: 생성된 비디오 (MP4)
- 제약: 최대 10초

**이미지 편집** (`editImage`)
- 입력: 기본 이미지 + 편집 지시
- 출력: 편집된 이미지
- 기능: 배경 변경, 객체 추가/제거 등

**배경 제거** (`removeBackground`)
- 입력: 이미지
- 출력: 투명 배경 이미지 (PNG)

**Virtual Try-On** (`virtualTryOn`)
- 입력: 의류 이미지 + 사람 이미지
- 출력: 의류를 입은 사람 이미지

**이미지 분석** (`analyzeImage`)
- 입력: 이미지
- 출력: 이미지 설명, 객체 감지, 텍스트 추출

### API 호출 예제

```typescript
// 이미지 생성
const image = await geminiService.generateImage(
  "A red sweater on a white background",
  { quality: "high", style: "product_photo" }
);

// Virtual Try-On
const vtonResult = await geminiService.virtualTryOn(
  garmentImage,
  modelImage
);

// 에러 처리
try {
  const result = await geminiService.generateImage(prompt);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // 재시도 로직
  } else {
    // 일반 에러 처리
  }
}
```

### 비용 및 한계

**비용 추정**
- 이미지 생성: 1,000 이미지 당 약 $1-5
- 비디오 생성: 1분 당 약 $0.5-2
- 배경 제거: 1,000 이미지 당 약 $0.5-1

**API 제한**
- 요청 제한: 분당 최대 100 요청
- 동시 요청: 최대 10개
- 타임아웃: 60초

**최적화 팁**
- 배치 처리로 요청 수 최소화
- 캐싱으로 중복 요청 방지
- 에러 발생 시 재시도 로직 구현

---

## 데이터 저장소 (IndexedDB)

### 데이터베이스 스키마

**데이터베이스명**: `CosmosAssetsDB`

**저장소 구조**

```
projects (Object Store)
├─ Key: projectId
├─ Value:
│  ├─ id: string
│  ├─ name: string
│  ├─ state: ProjectState (nodes, connections, history)
│  ├─ createdAt: timestamp
│  ├─ updatedAt: timestamp
│  └─ thumbnail: Blob (프로젝트 미리보기)

assets (Object Store)
├─ Key: assetId
├─ Value:
│  ├─ id: string
│  ├─ projectId: string
│  ├─ type: 'image' | 'video'
│  ├─ data: Blob
│  ├─ metadata: { width, height, duration, ... }
│  └─ createdAt: timestamp
```

### 주요 작업

**프로젝트 저장**
```typescript
await dbService.saveProject(projectId, projectState);
```

**프로젝트 로드**
```typescript
const project = await dbService.loadProject(projectId);
```

**자동 저장**
- 프로젝트 상태 변경 시 자동으로 저장 (3초 디바운스)
- 로컬 저장소 활용으로 오프라인에서도 작동

**저장소 용량**
- 일반적으로 50GB 이상 (브라우저 허가 필요)
- 용량 초과 시 사용자 확인 후 증가 요청

---

## 성능 최적화

### 렌더링 최적화

**React 최적화**
- React.memo로 노드 컴포넌트 메모이제이션
- useMemo로 계산 비용 높은 작업 캐싱
- useCallback으로 함수 참조 유지
- Virtual rendering으로 보이지 않는 노드 렌더링 생략

**D3 캔버스 최적화**
- SVG 렌더링 최적화 (경로 단순화)
- 연결선 재계산 최소화
- 줌 레벨에 따른 디테일 조정

### 로드 시간 최적화

**번들 크기**
- Tree-shaking으로 불필요한 코드 제거
- Code splitting으로 필요할 때만 로드
- Lazy loading으로 초기 번들 크기 감소

**네트워크 최적화**
- 이미지 압축 및 WebP 포맷 사용
- Gzip 압축 활성화
- CDN을 통한 정적 파일 배포

**API 최적화**
- 요청 배치 처리
- 응답 캐싱
- 재시도 로직과 타임아웃 설정

---

## 개발 워크플로우

### 브랜치 전략

```
main (프로덕션)
├─ develop (개발 메인)
│  ├─ feature/노드명 (새 노드 개발)
│  ├─ fix/버그명 (버그 수정)
│  └─ refactor/내용 (리팩토링)
└─ hotfix/버그명 (긴급 패치)
```

### 커밋 메시지 규칙

```
<type>(<scope>): <subject>

<body>

<footer>
```

타입:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `perf`: 성능 개선
- `test`: 테스트 추가/수정

### 코드 리뷰 프로세스

1. 기능 완성 후 PR 생성
2. 최소 1명 이상 리뷰 필수
3. CI/CD 통과 필수 (타입 체크, 린트)
4. 모든 코멘트 해결 후 머지

---

## 도움말 및 리소스

### 공식 문서
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **TypeScript**: https://www.typescriptlang.org
- **Google Gemini API**: https://ai.google.dev
- **D3.js**: https://d3js.org

### 주요 라이브러리 문서
- **React Draggable**: https://github.com/react-grid-layout/react-draggable
- **use-immer**: https://github.com/immerjs/use-immer
- **IndexedDB MDN**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

### 커뮤니티
- **Stack Overflow**: React, TypeScript 태그
- **GitHub Discussions**: StudioX 저장소
- **Discord**: React 개발자 커뮤니티

---

## 문제 해결

### 일반적인 문제

**개발 서버 시작 실패**
- Node.js 버전 확인 (18.0.0 이상)
- npm 캐시 정리: `npm cache clean --force`
- node_modules 재설치: `rm -rf node_modules && npm install`

**API 오류**
- API 키 확인
- 네트워크 연결 확인
- 콘솔에서 상세 오류 메시지 확인

**성능 저하**
- 브라우저 DevTools Performance 탭 사용
- React DevTools Profiler로 렌더링 분석
- 이미지 크기 최소화

**IndexedDB 초기화 실패**
- 브라우저 캐시 정리
- 개인 정보 보호 모드 비활성화
- IndexedDB 용량 확인

---

**작성일**: 2026-03-14
**최종 수정**: 2026-03-14
**유지보수**: 기술 스택 관리 팀
