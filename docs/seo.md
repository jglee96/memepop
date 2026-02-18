# seo.md — SEO & AEO Strategy for MemePop

이 문서는 MemePop의 검색 최적화(SEO) 및 Answer Engine Optimization(AEO) 전략을 정의한다.

MemePop은 “기능 중심 웹앱”이 아니라 **콘텐츠 중심 랜딩 페이지 집합**으로 설계한다.
검색 유입은 `/m/[slug]` 페이지를 중심으로 발생하도록 구조화한다.

---

# 1. SEO Philosophy

## 1.1 랜딩 우선 원칙

- 각 밈 페이지는 독립적인 콘텐츠 페이지다.
- 생성 기능은 보조 기능이다.
- 검색 의도를 충족하는 설명 텍스트가 핵심이다.

## 1.2 Stateless SEO 전략

- 생성 결과 URL을 만들지 않는다.
- 파라미터 기반 페이지를 생성하지 않는다.
- 색인 대상은 정적 밈 랜딩 페이지로 한정한다.

---

# 2. URL & Indexing Strategy

## 2.1 Index 대상

- `/m/[slug]`
- `/memes` (밈 목록 페이지)

## 2.2 Index 제외 대상

- `/api/*`
- 내부 테스트 라우트
- 생성 요청 관련 경로

## 2.3 Canonical 정책

각 밈 페이지는 반드시:

```
<link rel="canonical" href="https://memepop.com/m/[slug]" />
```

을 명시한다.

- slug는 절대 변경하지 않는다.
- 동일 밈에 여러 URL을 허용하지 않는다.

---

# 3. Metadata Rules

Next.js App Router에서는 `generateMetadata`를 사용한다.

## 3.1 Title 규칙

```
<밈 이름> - <한 줄 설명> | MemePop
```

예:

```
Good News Bad News - 반전 밈 생성기 | MemePop
```

권장 길이: 50~60자

---

## 3.2 Description 규칙

- 150~160자 권장
- 핵심 키워드 1~2회 자연스럽게 포함
- 클릭 유도 문구 포함
- 키워드 나열 금지

---

## 3.3 OpenGraph 규칙

필수 태그:

- og:title
- og:description
- og:image
- og:url

규칙:

- og:image는 밈 대표 이미지 사용
- 결과별 이미지 생성 없음
- SNS 공유 시 랜딩 페이지로 유입 유도

---

# 4. AEO Strategy (Answer Engine Optimization)

AI 검색 엔진(ChatGPT, Perplexity 등)이 페이지를 “답변 가능한 콘텐츠”로 인식하도록 구성한다.

## 4.1 필수 텍스트 블록

각 밈 페이지에는 반드시:

- 밈 설명 (2~3문단)
- 사용 상황
- 예시
- FAQ

가 포함되어야 한다.

---

## 4.2 FAQ 구조화 데이터

가능하면 JSON-LD로 `FAQPage` 추가.

예:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "이 밈은 어떤 상황에서 쓰이나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}
```

---

# 5. Content Depth Rule

## 5.1 텍스트 분량

- 최소 600자 이상 권장
- 단순 기능 설명만 있는 페이지 금지
- "생성 버튼" 중심 페이지 금지

## 5.2 검색 의도 만족

페이지는 다음 질문에 답해야 한다:

- 이 밈은 무슨 뜻인가?
- 언제 쓰는가?
- 예시는 무엇인가?
- 어떻게 변형하면 좋은가?

---

# 6. Performance & Core Web Vitals

SEO는 성능과 직결된다.

## 6.1 목표 지표

- LCP < 2.5s
- CLS < 0.1
- INP < 200ms

## 6.2 구현 전략

- 밈 랜딩은 Server Component 중심
- Client Component 최소화
- 이미지 최적화(Next Image)
- 폰트 preload 최소화
- JS 번들 최소화

---

# 7. Keyword Strategy

각 밈은 다음 키워드를 자연스럽게 포함한다:

- "<밈 이름> 뜻"
- "<밈 이름> 예시"
- "<밈 이름> 생성기"
- "<밈 이름> 변형"

키워드는 본문 흐름을 해치지 않도록 삽입한다.

---

# 8. Internal Linking Strategy (확장 대비)

밈이 5개 이상이 되면:

- 관련 밈 추천 블록 추가
- `/memes` 목록 페이지에서 내부 링크 최적화
- Topic cluster 구조 고려

---

# 9. Non-Goals

- 결과 페이지 색인
- 파라미터 기반 랜딩 생성
- 자동 대량 밈 생성 후 색인

---

# 10. Core SEO Principle

SEO는 기술이 아니라 콘텐츠 전략이다.

- 좋은 설명이 가장 강력한 최적화다.
- 밈 페이지는 단순 생성 툴이 아니라 “설명 페이지”여야 한다.
- Stateless 구조를 유지하면서도 콘텐츠 깊이를 확보한다.
