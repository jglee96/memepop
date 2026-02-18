# PLANS.md — MemePop Execution Plan

이 문서는 MemePop의 실제 구현 순서와 마일스톤을 정의한다.
AGENTS.md는 전역 원칙을, PLANS.md는 실행 계획을 담당한다.

---

# Milestone 1 — Single Meme E2E (Stateless MVP)

## 🎯 목표

한 개의 밈을 기준으로 아래 흐름을 완성한다:

`/m/[slug]` → 입력 → `/api/generate/:slug` → 결과 출력 → 복사

- 결과 저장 없음
- 사용자 데이터 저장 없음
- permalink 없음
- SEO/AEO 최적화 완료
- Prompt Injection 방어 적용 완료

---

## 1️⃣ Scope

### 포함

- 밈 레지스트리 1개 등록
- `/m/[slug]` 랜딩 + 생성 UI
- `/api/generate/:slug` BFF 구현
- 입력 검증 + 레이트리밋
- 프롬프트 보안 방어
- 출력 정제
- Copy UX
- SEO 메타 구성
- Lighthouse 점검

### 제외 (MVP 비포함)

- 결과 저장
- 추천 알고리즘
- 관리자 페이지
- 밈 다수 관리 UI

---

## 2️⃣ Architecture Plan (Feature-Sliced Design)

본 프로젝트는 **Feature-Sliced Design(FSD)** 구조를 따른다.

레이어 원칙:

- `app/` — Next.js 라우팅 엔트리 (얇게 유지)
- `features/` — 기능 단위 슬라이스 (meme-generate 등)
- `entities/` — 도메인 엔티티 (meme registry 등)
- `shared/` — 공용 유틸, 보안, rate limit, 타입

### Folder Structure (권장)

```
app/
  m/[slug]/page.tsx
  api/generate/[slug]/route.ts

features/
  meme-generate/
    ui/
      MemeForm.tsx
      MemeResult.tsx
    model/
      generateMeme.ts
      schema.ts

entities/
  meme/
    registry.ts
    types.ts

shared/
  lib/
    rateLimit.ts
  security/
    inputValidation.ts
    promptPolicy.ts
    outputSanitizer.ts
  config/
    constants.ts
```

### 구조 원칙

- `app/` 레이어에는 비즈니스 로직을 두지 않는다
- 슬라이스 내부에서만 해당 기능 로직을 유지한다
- 엔티티(`entities/meme`)는 생성 기능에 의존하지 않는다
- `shared/`는 어떤 feature에도 의존하지 않는다

의존 방향:

`app → features → entities → shared`

반대 방향 의존 금지.

---

## 3️⃣ Implementation Steps (실행 순서)

### Step 1 — Meme Registry

- `lib/memes/registry.ts`
- 정적 객체로 밈 1개 정의
- slug 검증 함수 포함

Acceptance:

- 존재하지 않는 slug는 404

---

### Step 2 — `/m/[slug]` 페이지

- 서버 컴포넌트
- `generateMetadata` 구현
- 밈 설명/예시/FAQ 텍스트 포함
- Client Component로 입력 폼 분리

SEO 체크:

- title
- description
- canonical
- OG

Acceptance:

- Lighthouse SEO 90+ 목표

---

### Step 3 — Input UI

- textarea + 생성 버튼
- 로딩 상태 처리
- 에러 메시지 UX
- Copy 버튼
  - navigator.clipboard
  - 실패 시 fallback 안내

Acceptance:

- 결과 복사 가능

---

### Step 4 — API Route `/api/generate/:slug`

Flow:

1. slug 검증
2. request schema(Zod)
3. rate limit 체크
4. prompt 구성 (policy + user_input 분리)
5. 모델 호출
6. output validation/sanitization
7. `{ output }` 반환

중요:

- 입력 원문 저장 금지
- 출력 로그 저장 금지

Acceptance:

- 위험 패턴 입력 시 거부
- 정상 입력 시 2초 이내 응답 목표

---

### Step 5 — Security Layer

구현 파일:

- `inputValidation.ts`
- `promptPolicy.ts`
- `outputSanitizer.ts`

검증 항목:

- 길이 제한
- URL 차단
- system:/developer: 등 차단
- ignore previous 등 차단
- 링크 제거
- HTML escape

Acceptance:

- 단순 prompt injection 시도 차단

---

### Step 6 — Rate Limit

- IP 기반 메모리 레이트리밋
- 예: 1분당 10회
- 반복 공격 시 강화

Acceptance:

- 초당 반복 호출 차단

---

### Step 7 — Performance Review

- LCP < 2.5s 목표
- 클라이언트 JS 최소화
- 이미지 최적화

---

# Milestone 2 — Multi Meme Support

## 목표

- 밈 5개 이상 추가
- 공통 템플릿 구조 정리
- 밈 목록 `/memes` 페이지 구현

---

# Milestone 3 — Toy Expansion

## 목표

- 밈 외 장난감 1개 추가
- 공통 생성 인터페이스 추상화
- 도메인 레이어 정리

---

# Milestone 4 — Production Hardening

## 목표

- Observability (에러율, 차단율)
- CSP 설정
- Bot 방어 강화
- 서버 타임아웃 설정

---

# Success Criteria

- Stateless 아키텍처 유지
- 사용자 데이터 저장 0
- Prompt Injection 대응 완료
- SEO 상위 노출 기반 확보
- 한국 바이럴 공유에 적합한 UX 확보

---

# Working Rules

- 모든 기능은 작은 단위로 구현
- 보안 > 기능 확장
- SEO 텍스트는 코드와 함께 관리
- 클라이언트 JS는 항상 최소화
