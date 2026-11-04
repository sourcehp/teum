# 틈디자인스튜디오 홈페이지

Next.js 16 + Supabase + Vercel로 만드는 인테리어 업체 홈페이지.

## 로컬 실행 순서

사전 준비: Node.js 22, Docker.

```bash
npm install
npm run db:start                  # 로컬 Supabase 시작 (Docker 데몬이 없으면 함께 시작)
npm run db:reset                  # 마이그레이션과 시드 적용
cp .env.test .env.local           # 로컬 환경변수 사용
npm run dev                       # http://localhost:3000
```

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | 단위 테스트 (`tests/unit`) |
| `npm run test:db` | 로컬 Supabase 대상 RLS·RPC 테스트 (`tests/db`) |
| `npm run test:e2e` | Playwright E2E |
| `npm run db:types` | 로컬 DB에서 `src/lib/supabase/types.ts` 생성 |

환경변수 목록은 `.env.example`을 참고한다. `.env.test`는 로컬 Supabase용 공개 데모 값만 담고 있다.
