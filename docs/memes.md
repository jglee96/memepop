# memes.md — Meme Registry Specification

이 문서는 MemePop에서 사용하는 **밈 레지스트리 구조, 작성 기준, SEO/AEO 규칙**을 정의한다.

밈은 DB가 아닌 **정적 레지스트리(코드 기반 관리)** 로 운영한다.

---

# 1. Core Principles

- 밈은 기능이 아니라 **콘텐츠 자산**이다.
- slug는 SEO 자산이므로 절대 변경하지 않는다.
- 모든 밈은 동일한 구조를 따른다.
- 생성 기능보다 랜딩 콘텐츠 품질이 더 중요하다.

---

# 2. Slug Rules

정규식:

```
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

규칙:

- 소문자 영문 + 숫자 + 하이픈만 허용
- 공백 금지
- 한 번 생성하면 변경 금지
- 의미 있는 단어 조합 사용 (SEO 고려)
- 한국 사용자를 고려해 발음이 쉬운 영문 권장

예시:

- good-news-bad-news
- corporate-speak
- dramatic-reveal
- unexpected-twist

---

# 3. Meme Type Structure (권장 타입 정의)

```ts
export interface Meme {
  slug: string;
  title: string;
  description: string;
  useCases: string[];
  examples: string[];
  faq: { q: string; a: string }[];
  seo: {
    keywords: string[];
    ogImage: string;
    canonicalPath: string;
    summary: string;
  };
}
```

생성 입력 스키마/폼/프롬프트 지시는 `entities/meme`가 아닌 `features/meme-generate`의 밈별 프로파일에서 관리한다.

---

# 4. Landing Page Required Content Blocks

각 밈 랜딩(`/m/[slug]`)에는 반드시 아래 텍스트 블록이 포함되어야 한다.

## 4.1 밈 설명 (2~3문단)

포함 요소:

- 이 밈이 무엇인지
- 어떤 상황에서 쓰이는지
- 어떤 감정/톤인지 (풍자/자학/과장 등)

설명은 최소 300자 이상 권장.

---

## 4.2 사용 상황 (Bullet 3~5개)

예:

- 직장 상황에서 아이러니를 표현할 때
- 친구와의 농담에서
- 커뮤니티 댓글에서
- 예상과 다른 결과를 강조할 때

---

## 4.3 좋은 입력 예시 (3~5개)

사용자가 참고할 수 있는 고품질 예시를 제공한다.

- 단순 단어 나열 금지
- 실제 사용 가능한 문장 형태 권장

---

## 4.4 금지/주의

- 개인정보 포함 금지
- 특정 집단 비하 금지
- 폭력/위협 표현 금지
- 피싱/사기성 문구 금지

---

## 4.5 FAQ (2~5개)

AEO(Answer Engine Optimization)를 위해 반드시 포함.

예:

- 이 밈은 어떤 상황에서 쓰나요?
- 너무 공격적인 표현은 가능한가요?
- 회사에서 사용해도 괜찮나요?

---

# 5. SEO Writing Rules

## Title 구조

```
<밈 이름> - <한 줄 설명> | MemePop
```

## Description 규칙

- 150~160자 권장
- 핵심 키워드 1~2회 포함
- 클릭 유도 문구 포함
- 과장된 스팸형 문장 금지

## Keywords 전략

- "<밈 이름> 뜻"
- "<밈 이름> 예시"
- "<밈 이름> 생성"
- "<밈 이름> 변형"

자연스럽게 본문에 녹인다.

---

# 6. Content Quality Standard

- 설명은 최소 600자 이상 권장 (SEO/AEO 목적)
- 기능 설명만 있는 페이지 금지
- 반복 키워드 남용 금지
- 실제 검색 의도를 만족하는 설명 작성

---

# 7. Expansion Policy

새 밈 추가 시 반드시:

1. examples 작성
2. FAQ 작성
3. description SEO 검토
4. ogImage 준비
5. canonicalPath 확인

밈은 트래픽 유입의 핵심 자산이므로, 급하게 추가하지 않는다.
