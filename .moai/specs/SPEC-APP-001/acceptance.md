# SPEC-APP-001: 수락 기준

> **SPEC 참조**: [spec.md](./spec.md)
> **구현 계획**: [plan.md](./plan.md)

---

## 1. 핵심 기능 테스트 시나리오

### 시나리오 1: 무한 캔버스 조작 (REQ-CANVAS-001, REQ-CANVAS-003)

```gherkin
Feature: 무한 캔버스 팬 및 줌

  Scenario: 캔버스 줌 인/아웃
    Given 캔버스가 기본 줌 레벨(100%)로 표시되어 있다
    When 사용자가 마우스 휠을 위로 스크롤한다
    Then 캔버스가 줌 인되고 줌 레벨 표시가 증가한다
    And 노드와 연결선의 크기가 비례하여 확대된다

  Scenario: 캔버스 팬 이동
    Given 캔버스에 노드가 배치되어 있다
    And 팬 모드(H키)가 활성화되어 있다
    When 사용자가 캔버스를 마우스로 드래그한다
    Then 캔버스 뷰포트가 드래그 방향으로 이동한다
    And 모든 노드와 연결선이 함께 이동하여 보인다

  Scenario: 노드 드래그 앤 드롭 배치
    Given 캔버스 위에 Text 노드가 존재한다
    When 사용자가 노드를 클릭하고 드래그한다
    Then 노드가 마우스 위치를 따라 이동한다
    And 연결된 연결선이 실시간으로 업데이트된다
```

### 시나리오 2: AI 이미지 생성 (REQ-AI-001, REQ-AI-010)

```gherkin
Feature: AI 이미지 생성

  Scenario: Assistant 노드를 통한 이미지 생성 성공
    Given Gemini API 키가 설정되어 있다
    And 캔버스에 Assistant 노드가 존재한다
    When 사용자가 "고양이 일러스트를 그려줘"라는 프롬프트를 입력한다
    And 실행 버튼을 클릭한다
    Then 노드에 로딩 상태가 표시된다
    And Gemini API 호출이 수행된다
    And 생성된 이미지가 노드에 표시된다
    And History Panel에 결과가 추가된다

  Scenario: API 키 미설정 시 생성 차단
    Given Gemini API 키가 설정되어 있지 않다
    And 캔버스에 Assistant 노드가 존재한다
    When 사용자가 프롬프트를 입력하고 실행을 시도한다
    Then API 키 입력 안내 메시지가 표시된다
    And AI 생성 요청이 실행되지 않는다

  Scenario: AI 생성 중 중복 요청 방지
    Given Assistant 노드에서 AI 생성이 진행 중이다
    When 사용자가 동일 노드에서 다시 실행을 클릭한다
    Then 중복 요청이 차단된다
    And "생성 진행 중" 상태가 유지된다
```

### 시나리오 3: 노드 연결 시스템 (REQ-CONN-001, REQ-CONN-010, REQ-CONN-030, REQ-CONN-031)

```gherkin
Feature: 노드 간 타입 기반 연결

  Scenario: 호환 타입 간 연결 생성
    Given 캔버스에 Text 노드와 Assistant 노드가 존재한다
    When 사용자가 Text 노드의 출력 포트에서 Assistant 노드의 입력 포트로 드래그한다
    Then 두 노드 사이에 연결선이 생성된다
    And 연결선에 데이터 흐름 방향이 표시된다

  Scenario: 비호환 타입 간 연결 차단
    Given 캔버스에 Video 노드와 Text 입력만 받는 노드가 존재한다
    When 사용자가 Video 출력에서 Text 전용 입력으로 연결을 시도한다
    Then 연결이 생성되지 않는다
    And 비호환 타입임을 시각적으로 피드백한다

  Scenario: 순환 연결 방지
    Given 노드 A -> 노드 B -> 노드 C로 연결되어 있다
    When 사용자가 노드 C의 출력에서 노드 A의 입력으로 연결을 시도한다
    Then 순환 연결이 감지된다
    And 연결이 생성되지 않는다
```

### 시나리오 4: 프로젝트 저장 및 복원 (REQ-PROJ-001, REQ-PROJ-010, REQ-PROJ-011)

```gherkin
Feature: 프로젝트 영속화

  Scenario: 프로젝트 수동 저장
    Given 캔버스에 3개의 노드와 2개의 연결이 존재한다
    When 사용자가 Ctrl+S를 입력한다
    Then 현재 프로젝트 상태가 IndexedDB에 저장된다
    And 저장 완료 피드백이 표시된다

  Scenario: 앱 재시작 시 프로젝트 복원
    Given 이전에 프로젝트가 저장된 상태이다
    When 앱을 새로고침(F5)한다
    Then 저장된 프로젝트가 자동으로 로드된다
    And 모든 노드가 이전 위치에 복원된다
    And 모든 연결이 이전 상태로 복원된다
    And 캔버스 줌/팬 위치가 복원된다

  Scenario: 미저장 변경사항 보호
    Given 캔버스에 저장되지 않은 변경사항이 있다
    When 사용자가 브라우저 탭을 닫으려 한다
    Then "저장되지 않은 변경사항이 있습니다" 확인 대화상자가 표시된다
```

### 시나리오 5: 특수 노드 파이프라인 (REQ-AI-011, REQ-AI-012, REQ-AI-013, REQ-AI-014)

```gherkin
Feature: 특수 AI 노드 파이프라인

  Scenario: Storyboard 노드 5씬 생성
    Given Gemini API 키가 설정되어 있다
    And 캔버스에 Storyboard 노드가 존재한다
    When 사용자가 스토리 설명을 입력하고 실행한다
    Then 5개의 씬 이미지가 순차적으로 생성된다
    And 각 씬의 진행 상태가 표시된다
    And 완료 후 5개 이미지가 노드에 모두 표시된다

  Scenario: Script 노드 파이프라인 실행
    Given Gemini API 키가 설정되어 있다
    And 캔버스에 Script 노드가 존재한다
    When 사용자가 상품 정보를 입력하고 실행한다
    Then 1단계: 상품 분석이 수행된다
    And 2단계: 분석 기반 스크립트가 생성된다
    And 3단계: 씬별 이미지가 생성된다
    And 각 단계의 진행 상태가 표시된다

  Scenario: Model 노드 AI 패션 모델 생성
    Given Gemini API 키가 설정되어 있다
    And 캔버스에 Model 노드가 존재한다
    When 사용자가 성별(여성), 나이(20대), 헤어스타일(긴 머리)을 설정하고 실행한다
    Then 설정에 맞는 AI 패션 모델 이미지가 생성된다

  Scenario: VTON 가상 피팅
    Given Gemini API 키가 설정되어 있다
    And 캔버스에 VTON 노드가 존재한다
    And 의상 이미지가 입력되어 있다
    When 사용자가 포즈를 선택하고 실행한다
    Then 의상이 적용된 가상 피팅 이미지가 생성된다
```

---

## 2. 엣지 케이스 테스트

### 캔버스 엣지 케이스

```gherkin
  Scenario: 대량 노드 환경에서의 성능
    Given 캔버스에 100개 이상의 노드가 배치되어 있다
    When 사용자가 줌/팬 조작을 수행한다
    Then 프레임 드롭 없이 부드럽게 동작한다 (30fps 이상)

  Scenario: 빈 캔버스에서의 연결 시도
    Given 캔버스에 노드가 하나도 없다
    When 사용자가 빈 영역에서 드래그를 시도한다
    Then 팬 동작이 정상적으로 수행된다
    And 에러가 발생하지 않는다

  Scenario: 멀티 셀렉트 후 그룹 이동
    Given 캔버스에서 5개의 노드가 멀티 셀렉트되어 있다
    When 선택된 노드 중 하나를 드래그한다
    Then 5개 노드 전체가 동일한 오프셋으로 이동한다
    And 노드 간 연결선이 실시간 업데이트된다
```

### AI 생성 엣지 케이스

```gherkin
  Scenario: 네트워크 끊김 시 AI 생성
    Given AI 생성 요청이 전송된 후 네트워크가 끊어졌다
    When API 응답 타임아웃이 발생한다
    Then 노드에 에러 상태가 표시된다
    And "네트워크 오류" 메시지와 함께 재시도 옵션이 제공된다

  Scenario: 빈 프롬프트로 AI 생성 시도
    Given Assistant 노드에 프롬프트가 비어있다
    When 사용자가 실행 버튼을 클릭한다
    Then 프롬프트 입력 요청 메시지가 표시된다
    And API 호출이 수행되지 않는다

  Scenario: 매우 큰 이미지 입력
    Given 10MB 이상의 이미지가 노드에 입력되었다
    When AI 처리를 위해 API에 전송하려 한다
    Then 이미지가 적절한 크기로 리사이즈된다
    And API 제한 내에서 정상 처리된다
```

### 프로젝트 관리 엣지 케이스

```gherkin
  Scenario: IndexedDB 접근 불가
    Given 브라우저의 IndexedDB가 비활성화되어 있다
    When 앱이 시작된다
    Then 저장 기능이 비활성화됨을 사용자에게 알린다
    And 앱은 저장 없이 정상 동작한다

  Scenario: 손상된 저장 데이터 복원 시도
    Given IndexedDB에 손상된 프로젝트 데이터가 저장되어 있다
    When 앱이 데이터를 로드하려 한다
    Then 데이터 파싱 오류가 감지된다
    And 사용자에게 복구 옵션(새로 시작/재시도)을 제공한다
    And 빈 캔버스로 정상 시작이 가능하다
```

---

## 3. 성능 기준

### 렌더링 성능

| 항목 | 기준 | 측정 방법 |
|------|------|----------|
| 초기 로딩 시간 | 3초 이내 (LCP) | Lighthouse, Web Vitals |
| 캔버스 줌/팬 프레임레이트 | 30fps 이상 (노드 50개 기준) | Chrome DevTools Performance |
| 노드 드래그 반응 지연 | 16ms 이하 | requestAnimationFrame 측정 |
| 연결선 렌더링 지연 | 노드 이동과 동기화 | 시각적 확인 |

### AI 생성 성능

| 항목 | 기준 | 비고 |
|------|------|------|
| API 응답 타임아웃 | 30초 | 사용자 취소 가능 |
| 동시 API 요청 | 최대 3개 | 초과 시 큐잉 |
| 이미지 표시 지연 | 생성 완료 후 1초 이내 | 디코딩 포함 |

### 프로젝트 저장 성능

| 항목 | 기준 | 비고 |
|------|------|------|
| 저장 소요 시간 | 1초 이내 (노드 50개 기준) | IndexedDB 쓰기 |
| 프로젝트 로드 시간 | 2초 이내 (노드 50개 기준) | IndexedDB 읽기 + 렌더링 |
| 자동 저장 주기 | - | Optional Goal에서 결정 |

### 번들 크기

| 항목 | 기준 | 비고 |
|------|------|------|
| 초기 JS 번들 | 500KB 이하 (gzip) | 코드 스플리팅 적용 시 |
| 전체 에셋 크기 | 2MB 이하 | 폰트, 아이콘 포함 |

---

## 4. Quality Gate (품질 게이트)

### 코드 품질

- [ ] TypeScript strict 모드 활성화, 타입 에러 0건
- [ ] ESLint 경고 0건
- [ ] 미사용 import 및 변수 0건

### 기능 완전성

- [ ] 27개 노드 타입 모두 생성 및 렌더링 가능
- [ ] 모든 노드 타입 간 연결 호환성 매트릭스 준수
- [ ] 키보드 단축키 6종 모두 동작
- [ ] 프로젝트 저장/복원 정상 동작
- [ ] Gemini API 에러 시 사용자 알림 제공

### 브라우저 호환성

- [ ] Chrome 최신 2개 버전 정상 동작
- [ ] Edge 최신 2개 버전 정상 동작
- [ ] Firefox 최신 2개 버전 정상 동작

---

## 5. Definition of Done (완료 정의)

하나의 마일스톤이 "완료"되려면 다음 조건을 충족해야 한다:

1. **기능 동작**: 관련 Given/When/Then 시나리오가 모두 통과
2. **타입 안전**: TypeScript 컴파일 에러 0건
3. **린트 통과**: ESLint 에러 0건
4. **빌드 성공**: `vite build` 에러 없이 완료
5. **성능 기준**: 명시된 성능 기준 충족
6. **회귀 없음**: 기존 배포 기능에 회귀가 없음
7. **배포 확인**: Vercel 프리뷰 배포에서 정상 동작 확인
