# MemePop

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://vercel.com/)

유행 밈 문구를 사용자 상황에 맞게 발음 유사/리듬 변형으로 리믹스해 주는 Next.js 16 기반 웹앱입니다.

## 핵심 기능

- 밈별 전용 경로: `/m/[slug]`
- 생성 API BFF: `POST /api/generate/[slug]`
- 입력 검증, 출력 정제, 레이트 리밋 포함
- 생성 결과 비저장(Stateless): 결과는 즉시 반환 후 폐기
- 라이트/다크 모드 지원

현재 기본 밈:

- `eotteokharago` (`/m/eotteokharago`)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind CSS v4
- Route Handlers 기반 BFF (`app/api/**`)
- OpenAI Responses API (서버 사이드 호출)

## 로컬 실행

1. 의존성 설치

```bash
npm install
```

2. 환경변수 설정 (`.env.local` 권장)

```bash
cp .env.example .env.local
```

3. 개발 서버 실행

```bash
npm run dev
```

4. 빌드 확인

```bash
npm run build
```

## 환경변수

| Key | Required | 설명 |
|---|---|---|
| `OPENAI_API_KEY` | Yes | 서버에서 OpenAI 호출 시 사용 |
| `OPENAI_MODEL` | Yes(권장) | 생성 모델명 고정값 (예: `gpt-4.1-mini`) |
| `NEXT_PUBLIC_SITE_URL` | Yes(권장) | canonical/OG 절대 URL 기준 도메인 |

`NEXT_PUBLIC_SITE_URL`를 설정하지 않으면 메타 URL이 기본값(`https://memepop.com`)으로 생성될 수 있어, 배포 도메인과 불일치할 수 있습니다.

## 주요 라우트

- `/` 홈 랜딩
- `/memes` 밈 목록
- `/m/[slug]` 밈 상세 + 생성 UI
- `/api/generate/[slug]` 생성 API (POST)

## API 예시

```bash
curl -X POST "http://localhost:3000/api/generate/eotteokharago" \
  -H "Content-Type: application/json" \
  -d '{"input":"배고프다고"}'
```

성공 응답:

```json
{ "output": "..." }
```

## Vercel 배포 (GitHub 연결)

1. Vercel에서 GitHub 저장소 Import
2. Environment Variables에 아래 값 추가
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `NEXT_PUBLIC_SITE_URL` (배포 도메인)
3. Deploy

프리뷰/프로덕션 모두 동일하게 서버에서만 키를 사용하며, 클라이언트로 비밀키가 노출되지 않도록 설계되어 있습니다.

## 보안/SEO 참고 문서

- `/Users/zakklee/dev/memepop/AGENTS.md`
- `/Users/zakklee/dev/memepop/docs/security-prompting.md`
- `/Users/zakklee/dev/memepop/docs/seo.md`
- `/Users/zakklee/dev/memepop/docs/memes.md`
