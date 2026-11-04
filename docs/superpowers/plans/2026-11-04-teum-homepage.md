# 틈디자인스튜디오 홈페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 인테리어 회사 (주)틈디자인스튜디오의 문의 확보형 홈페이지와, 비개발자 직원이 쓰는 관리자 화면을 만들고 Vercel에 배포한다.

**Architecture:** Next.js App Router 한 프로젝트에 공개 사이트(정적 생성 + 1시간 재검증)와 `/admin`(서버 액션)을 함께 둔다. 데이터·인증·파일은 Supabase에 두고, 방문자 읽기는 RLS로 공개 행만 허용한다. 문의 저장은 비밀값으로 보호된 `security definer` RPC로만 한다. 앱은 서비스 키를 쓰지 않는다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase(@supabase/ssr), zod 4, dnd-kit, Resend, Vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-11-04-teum-homepage-design.md`

## Global Constraints

- 고정 버전(`package.json`에 `^` 없이): next 16.4.5, tailwindcss 4.3.4, @tailwindcss/postcss 4.3.4, @supabase/ssr 0.12.7, @supabase/supabase-js 2.118.0, zod 4.6.7, @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0, @dnd-kit/utilities(설치 시점 최신 고정), resend 6.37.0, vitest 5.1.0, @playwright/test 1.63.0(컨테이너에 설치된 Chromium과 맞춤), pretendard 1.3.9, supabase(CLI) 3.0.0, @vercel/analytics 2.0.1, browser-image-compression 2.0.2, yet-another-react-lightbox 3.33.0. react/react-dom은 next 16.4.5의 peer 범위 안 최신으로 고정.
- Next 16 규칙: 미들웨어 파일은 `src/proxy.ts`(export 함수명 `proxy`). 페이지 `params`/`searchParams`는 Promise. `next lint` 없음 → 정적 검사는 `tsc --noEmit`.
- 소스는 `src/` 아래. import 별칭 `@/*` → `src/*`.
- 사용자에게 보이는 모든 문구는 한국어. 영문은 브랜드 보조 표기(TEUM DESIGN STUDIO)만.
- 디자인 토큰(스펙 7.2): bg #F7F5F2, surface #FFFFFF, ink #1F1E1C, muted #6E6A64, line #E4E0DA, accent #B8916A, accent-ink #8A6A4C. 다크 모드 없음.
- 반응형 기준 폭 360 / 768 / 1280px. 사례 그리드 1 / 2 / 3열.
- 날짜 판정(배너 노출 등)은 항상 `Asia/Seoul` 기준.
- DB enum 값은 text + check 제약으로 둔다. 카테고리 `residential|commercial|office|other`, 예산 `under_30m|30m_50m|50m_100m|over_100m|undisclosed`, 문의 상태 `new|in_progress|done|spam`, 알림 상태 `pending|sent|failed|skipped`.
- 서비스 키(service_role/secret key)는 앱 코드·환경변수 어디에도 쓰지 않는다.
- 로컬 Supabase는 `SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io`로 띄운다(이 컨테이너는 public.ecr.aws 이미지 다운로드가 막혀 있음). Docker 데몬이 꺼져 있으면 `dockerd`를 백그라운드로 먼저 띄운다.
- 각 Task 끝의 커밋 메시지에는 저장소 규칙의 attribution 줄을 붙인다.

## Review Focus

1. **전화번호 형식 다양성:** `010 1234 5678`, `+82 10-1234-5678`, `02-123-4567` 입력 → 모두 `010-1234-5678` / `02-123-4567` 형식으로 정규화돼 접수돼야 한다. (Task 3 `normalizePhone` 테스트)
2. **한글 제목의 slug:** "성수동 32평 아파트 인테리어" → `성수동-32평-아파트-인테리어`. 중복이면 `-2`, `-3`. 특수문자만 있는 제목은 `project`로 대체. (Task 3 `slugify`/`uniqueSlug` 테스트)
3. **시간대 경계:** 서버는 UTC로 돈다. `2026-11-04T16:00:00Z`(서울 11월 5일 01시)에 `starts_on = 2026-11-05`인 배너는 보여야 한다. (Task 3 `isBannerVisible` 테스트)
4. **문의 중복 제출과 토큰 재사용:** 제출 버튼을 두 번 눌러도 한 건만 저장되고(버튼은 전송 중 비활성), 같은 2단계 토큰으로 두 번째 저장은 거부돼야 한다. (Task 2 RLS/RPC 테스트, Task 9 E2E)
5. **지정 사진 삭제:** 대표·Before·After로 지정된 사진을 지우면 지정이 해제되고(`on delete set null`), 대표 사진이 없는 사례도 공개 페이지에서 깨지지 않고 자리표시 배경으로 보여야 한다. (Task 2 마이그레이션 테스트, Task 8 컴포넌트 테스트)

---

## File Structure

```
supabase/
  config.toml                      # 로컬 설정: 가입 비활성, seed 경로 2개
  migrations/
    20261104000001_schema.sql      # 테이블, 제약, updated_at 트리거, 뷰
    20261104000002_security.sql    # is_admin, RLS 정책, private.app_config, 문의 RPC
    20261104000003_storage.sql     # media 버킷과 정책
  sample-content.sql               # 운영에도 넣는 샘플 콘텐츠(is_sample=true)
  seed-local.sql                   # 로컬 전용: 관리자 계정, RPC 비밀값
src/
  proxy.ts                         # /admin 세션 갱신 + 비로그인 리다이렉트
  app/
    layout.tsx                     # html/body, 폰트, 분석 스크립트
    globals.css                    # Tailwind + 토큰
    (site)/layout.tsx              # 배너, 헤더, 푸터, 모바일 하단 바
    (site)/page.tsx                # 홈
    (site)/projects/page.tsx, (site)/projects/[slug]/page.tsx
    (site)/about/page.tsx, (site)/process/page.tsx, (site)/contact/page.tsx, (site)/privacy/page.tsx
    not-found.tsx, global-error.tsx, sitemap.ts, robots.ts
    admin/login/page.tsx
    admin/(panel)/layout.tsx       # requireAdmin + 사이드 메뉴
    admin/(panel)/page.tsx         # 대시보드
    admin/(panel)/{projects,testimonials,faqs,banners,inquiries,stats,settings}/...
    admin/(panel)/inquiries/export/route.ts
  lib/
    supabase/{public,server,browser}.ts, supabase/types.ts (생성)
    domain/{labels,pyeong,banner,slug,channel,phone,csv,stats}.ts
    inquiry/{schema,spam,token,actions,notify}.ts
    data/public.ts                 # 공개 페이지 조회 함수
    admin/{auth,schemas,revalidate}.ts
    media.ts, attribution.ts, analytics.ts, image-resize.ts
  components/site/...              # 공개 UI
  components/admin/...             # 관리자 UI
tests/
  unit/*.test.ts(x)
  db/*.test.ts                     # 로컬 Supabase 대상 RLS·RPC
  e2e/*.spec.ts
public/samples/*.webp, public/samples/CREDITS.md
```

---

### Task 1: 프로젝트 골격과 개발 환경

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `.env.example`, `.env.test`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/(site)/page.tsx`(임시), `supabase/config.toml`, `scripts/db-start.sh`, `README.md`
- Test: `tests/unit/smoke.test.ts`

**Interfaces:**
- Produces: npm 스크립트 `dev`, `build`, `start`, `typecheck`(`tsc --noEmit`), `test`(vitest run tests/unit), `test:db`(vitest run tests/db), `test:e2e`(playwright), `db:start`(scripts/db-start.sh), `db:reset`(`supabase db reset`), `db:types`(`supabase gen types typescript --local > src/lib/supabase/types.ts`).
- Produces: Tailwind 테마 색 이름 `bg`, `surface`, `ink`, `muted`, `line`, `accent`, `accent-ink`(예: `bg-bg`, `text-ink`, `border-line`).

- [ ] **Step 1:** Next.js 16.4.5 + TypeScript 프로젝트를 저장소 루트에 수동 구성(create-next-app 대신 직접 파일 작성, Global Constraints의 고정 버전으로 `npm install`). `.gitignore`에 `.env.local`, `.next`, `node_modules`, `test-results`, `playwright-report`, `supabase/.temp`.
- [ ] **Step 2:** `globals.css`에 `@import "tailwindcss";`와 `@theme`로 토큰 7개, `--font-sans: "Pretendard Variable", Pretendard, system-ui, sans-serif`. Pretendard는 `pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css`를 layout에서 import.
- [ ] **Step 3:** `next.config.ts`: `images.remotePatterns`에 `NEXT_PUBLIC_SUPABASE_URL`의 프로토콜·호스트·`/storage/v1/object/public/**`. 개발·테스트(호스트가 127.0.0.1)일 때만 `images.dangerouslyAllowLocalIP = true`.
- [ ] **Step 4:** `supabase/config.toml`은 `supabase init` 결과에서 `[auth] enable_signup = false`, `[db.seed] sql_paths = ["./sample-content.sql", "./seed-local.sql"]`, `[studio] enabled = false`, `[analytics] enabled = false`, `[edge_runtime] enabled = false`로 수정. `project_id = "teum"`.
- [ ] **Step 5:** `scripts/db-start.sh`: Docker 데몬이 없으면 `dockerd`를 백그라운드로 띄우고 준비될 때까지 대기 → `SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io npx supabase start -x imgproxy,vector,logflare,supavisor,postgres-meta,studio,edge-runtime`.
- [ ] **Step 6:** `.env.example`에 스펙 10.1의 변수 목록(값 비움). `.env.test`(커밋함)에 로컬 값: URL `http://127.0.0.1:54321`, anon 키는 `supabase status -o env`의 `ANON_KEY`(로컬 데모 키, 공개값), `INQUIRY_RPC_SECRET=local-inquiry-secret`, `IP_HASH_SALT=local-salt`, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, `RESEND_API_KEY` 비움.
- [ ] **Step 7:** `tests/unit/smoke.test.ts` — `expect(1 + 1).toBe(2)`. `vitest.config.ts`는 `@` 별칭, 환경 `node`(컴포넌트 테스트 파일은 파일 상단 `// @vitest-environment jsdom`), `.env.test` 로드.
- [ ] **Step 8:** 실행: `npm run typecheck && npm test && npm run build`. Expected: 모두 성공.
- [ ] **Step 9:** README에 로컬 실행 순서(db:start → db:reset → `.env.test`를 `.env.local`로 복사 → dev) 기록 후 커밋 `chore: Next.js 프로젝트 골격과 로컬 Supabase 설정`.

---

### Task 2: DB 스키마, RLS, 문의 RPC, 스토리지

**Files:**
- Create: `supabase/migrations/20261104000001_schema.sql`, `..._security.sql`, `..._storage.sql`, `supabase/seed-local.sql`, `supabase/sample-content.sql`(빈 파일로 시작, Task 5에서 채움), `src/lib/supabase/types.ts`(생성)
- Test: `tests/db/helpers.ts`, `tests/db/rls.test.ts`, `tests/db/inquiry-rpc.test.ts`, `tests/db/schema.test.ts`

**Interfaces:**
- Produces 테이블·컬럼: 스펙 3.1 그대로. 추가 결정:
  - `projects.cover_image_id/before_image_id/after_image_id` → `project_images(id) on delete set null`. `project_images.project_id` → `projects(id) on delete cascade`.
  - `projects.slug` unique, `projects.body` text not null default ''.
  - `site_settings`는 `id int primary key default 1 check (id = 1)`. 공개 컬럼만 담은 뷰 `public_site_settings`(`security_invoker = false`로 만들고 anon에 select 허용). 뷰에서 빠지는 컬럼은 `notify_email` 하나다. `ga4_id`와 사이트 인증 값은 어차피 HTML에 출력되므로 뷰에 포함한다.
  - 길이 제약: inquiries.name 1~30, phone 9~13, message ≤ 2000, admin_memo ≤ 5000.
  - `updated_at` 자동 갱신 트리거 함수 `public.set_updated_at()`.
- Produces SQL 함수:
  - `public.is_admin() returns boolean` — `exists(select 1 from admins where user_id = auth.uid())`, `security definer`, `stable`.
  - `public.submit_inquiry_step1(p_secret text, p_name text, p_phone text, p_space_type text, p_ip_hash text, p_token_hash text, p_utm_source text, p_utm_medium text, p_utm_campaign text, p_referrer text, p_landing_path text) returns table(id uuid, notify_email text)` — 비밀값 불일치 시 `raise exception 'forbidden'`; 같은 `ip_hash`로 최근 10분 5건 이상이면 `raise exception 'rate_limited'`; insert(`privacy_agreed_at = now()`, `detail_token_expires_at = now() + interval '24 hours'`, `notify_status = 'pending'`) 후 새 id와 `site_settings.notify_email`을 한 행으로 반환(알림 메일 수신 주소를 anon 권한으로 얻는 유일한 경로).
  - `public.submit_inquiry_step2(p_secret text, p_id uuid, p_token_hash text, p_email text, p_region text, p_area_pyeong numeric, p_budget_range text, p_desired_start text, p_message text) returns boolean` — id·해시 일치 + 만료 전일 때만 갱신하고 `detail_token_hash = null`로 폐기. 갱신 행이 없으면 false.
  - `public.set_inquiry_notify_status(p_secret text, p_id uuid, p_status text) returns void`.
  - 세 RPC 모두 `security definer set search_path = ''`, `revoke all ... from public`, `grant execute ... to anon, authenticated`.
  - `private.app_config(key text primary key, value text not null)`; 스키마 `private`는 anon/authenticated에 usage 없음. 비밀값 키 이름 `inquiry_rpc_secret`.
- Produces RLS: 스펙 4.1 표 그대로. 관리자 정책은 `using (public.is_admin()) with check (public.is_admin())`.
- Produces Storage: 버킷 `media`(public = true). `storage.objects`에 insert/update/delete는 `bucket_id = 'media' and public.is_admin()`.
- Produces `seed-local.sql`: 로컬 관리자 `admin@teum.local` / `teum-local-admin-1!`(auth.users + auth.identities insert, 비밀번호는 `crypt(..., gen_salt('bf'))`), admins 등록, `private.app_config`에 `inquiry_rpc_secret = 'local-inquiry-secret'`, `site_settings` 1행.
- Produces `tests/db/helpers.ts`: `anonClient()`, `adminClient(): Promise<SupabaseClient>`(로컬 관리자로 로그인), `sql(query: string)`(로컬 DB에 `postgres` 패키지로 직접 접속, 테스트 준비·정리용).

- [ ] **Step 1: 실패하는 보안 테스트 작성** — `tests/db/rls.test.ts`:
  - `anon cannot select inquiries` → data 빈 배열 또는 error
  - `anon cannot update inquiries` → 영향 행 0
  - `anon cannot see unpublished project` → 비공개 사례 slug 조회 결과 없음
  - `anon cannot select site_settings` / `anon can select public_site_settings without notify_email`
  - `anon cannot upload to media` → error
  - `admin can select inquiries` / `admin can upload to media`
  - `non-admin authenticated user cannot write projects` (테스트에서 sql로 임시 사용자 생성)
- [ ] **Step 2: 실패하는 RPC 테스트 작성** — `tests/db/inquiry-rpc.test.ts`:
  - `step1 with wrong secret throws forbidden`
  - `step1 returns one row with id and notify_email, and stored row has status new, notify_status pending`
  - `6th step1 from same ip_hash within 10 minutes throws rate_limited`
  - `step2 with correct token updates details and returns true`
  - `step2 reusing same token returns false` (Review Focus 4)
  - `step2 after expiry returns false` (sql로 만료 시각을 과거로 바꾼 뒤)
- [ ] **Step 3: 실패하는 스키마 테스트 작성** — `tests/db/schema.test.ts`: `deleting cover image sets projects.cover_image_id to null` (Review Focus 5), `site_settings rejects second row`.
- [ ] **Step 4:** `npm run db:start && npm run test:db` → Expected: FAIL(테이블 없음).
- [ ] **Step 5:** 마이그레이션 3개와 `seed-local.sql` 작성.
- [ ] **Step 6:** `npx supabase db reset && npm run test:db` → Expected: 전부 PASS.
- [ ] **Step 7:** `npm run db:types`로 타입 생성, `npm run typecheck` 통과.
- [ ] **Step 8:** 커밋 `feat(db): 스키마, RLS, 문의 RPC, 스토리지 정책`.

---

### Task 3: 도메인 순수 함수

**Files:**
- Create: `src/lib/domain/labels.ts`, `pyeong.ts`, `banner.ts`, `slug.ts`, `channel.ts`, `phone.ts`, `csv.ts`, `stats.ts`
- Test: `tests/unit/domain.*.test.ts` (파일별 1개)

**Interfaces:**
- Produces `labels.ts`: `CATEGORY_LABELS: Record<Category, string>`(주거/상업/오피스/기타), `BUDGET_LABELS: Record<BudgetRange, string>`(3천만 원 미만 / 3천~5천만 원 / 5천만~1억 원 / 1억 원 이상 / 비공개), `STATUS_LABELS: Record<InquiryStatus, string>`(신규/상담중/완료/스팸), 타입 `Category`, `BudgetRange`, `InquiryStatus`, 상수 배열 `CATEGORIES`, `BUDGET_RANGES`, `INQUIRY_STATUSES`.
- Produces `pyeong.ts`: `type PyeongBucket = 'lt20'|'20to30'|'30to40'|'gte40'`, `pyeongBucket(area: number | null): PyeongBucket | null`, `PYEONG_LABELS`(20평 미만 / 20~30평 / 30~40평 / 40평 이상).
- Produces `banner.ts`: `todayInSeoul(now: Date): string`('YYYY-MM-DD'), `isBannerVisible(b: {is_active: boolean; starts_on: string; ends_on: string}, now: Date): boolean`(양 끝 포함), `pickBanner<T extends BannerLike>(list: T[], now: Date): T | null`(보이는 것 중 `starts_on` 가장 늦은 것).
- Produces `slug.ts`: `slugify(title: string): string`, `uniqueSlug(base: string, taken: string[]): string`.
- Produces `channel.ts`: `classifyChannel(i: {utm_source: string | null; referrer: string | null}): string` — utm_source 소문자 우선; 없으면 referrer 호스트로 `naver`(naver.com, m.naver.com, search.naver.com, blog.naver.com), `google`, `instagram`, `facebook`, `kakao`(kakao.com, daum.net), `youtube`, 그 외 호스트명; 둘 다 없으면 `direct`. `CHANNEL_LABELS`(네이버/구글/인스타그램/페이스북/카카오/유튜브/직접 방문).
- Produces `phone.ts`: `normalizePhone(input: string): string | null` — 공백·점·괄호 제거, `+82`/`82` 접두를 `0`으로, 숫자 9~11자리만 허용, 하이픈 형식으로 반환(02 지역번호, 010 등 3자리 국번 처리).
- Produces `csv.ts`: `toCsv(headers: string[], rows: (string | number | null)[][]): string` — UTF-8 BOM(`\uFEFF`) 시작, CRLF 줄바꿈, 쉼표·따옴표·줄바꿈 포함 값은 따옴표로 감싸고 내부 따옴표는 두 번.
- Produces `stats.ts`: `aggregateByChannel(rows: {utm_source: string|null; referrer: string|null; status: InquiryStatus; created_at: string}[], since: Date): {channel: string; total: number; byStatus: Record<InquiryStatus, number>}[]` — total 내림차순.

- [ ] **Step 1: 실패하는 테스트 작성.** 핵심 단언:
  - `pyeongBucket(19.9) === 'lt20'`, `(20) === '20to30'`, `(30) === '30to40'`, `(40) === 'gte40'`, `(null) === null`
  - `isBannerVisible({is_active:true, starts_on:'2026-11-05', ends_on:'2026-11-30'}, new Date('2026-11-04T16:00:00Z')) === true`; 같은 배너에 `'2026-11-04T14:59:59Z'` → false; `ends_on` 당일 23:59 KST → true; `is_active:false` → false
  - `pickBanner` 두 개 겹칠 때 늦게 시작한 것 반환, 없으면 null
  - `slugify('성수동 32평 아파트 인테리어') === '성수동-32평-아파트-인테리어'`, `slugify('Café  Teum!!') === 'café-teum'`, `slugify('!!!') === 'project'`; `uniqueSlug('a', ['a','a-2']) === 'a-3'`
  - `classifyChannel({utm_source:'Instagram', referrer:null}) === 'instagram'`, `({utm_source:null, referrer:'https://m.search.naver.com/x'}) === 'naver'`, `({null,null}) === 'direct'`, `referrer:'https://example.co.kr/'` → `'example.co.kr'`
  - `normalizePhone('010 1234 5678') === '010-1234-5678'`, `('+82 10-1234-5678') === '010-1234-5678'`, `('02-123-4567') === '02-123-4567'`, `('0212345678') === '02-1234-5678'`, `('031-123-4567') === '031-123-4567'`, `('12345') === null`
  - `toCsv(['a','b'], [['x,y', 'he said "hi"'], ['line\nbreak', null]])` === `'\uFEFFa,b\r\n"x,y","he said ""hi"""\r\n"line\nbreak",\r\n'`
  - `aggregateByChannel`: since 이전 행 제외, 채널별 total·상태별 집계, total 내림차순
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** 구현.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** 커밋 `feat: 도메인 유틸리티(평형대, 배너, slug, 유입 채널, 전화번호, CSV, 통계)`.

---

### Task 4: 문의 접수 로직(검증, 스팸, 토큰, 서버 액션, 메일 알림)

**Files:**
- Create: `src/lib/inquiry/schema.ts`, `spam.ts`, `token.ts`, `notify.ts`, `actions.ts`, `src/lib/supabase/public.ts`
- Test: `tests/unit/inquiry.schema.test.ts`, `tests/unit/inquiry.spam.test.ts`, `tests/unit/inquiry.token.test.ts`, `tests/db/inquiry-actions.test.ts`

**Interfaces:**
- Consumes: Task 2 RPC 시그니처, Task 3 `normalizePhone`, `CATEGORIES`, `BUDGET_RANGES`.
- Produces `public.ts`: `createPublicClient(): SupabaseClient<Database>` — anon 키, 세션 저장 안 함(`persistSession:false, autoRefreshToken:false`). 서버·서버 액션 공용.
- Produces `schema.ts`: `step1Schema`(name 1~30자 trim, phone → `normalizePhone` 결과가 null이면 "연락처 형식을 확인해 주세요", space_type ∈ CATEGORIES, privacy === 'on' 아니면 "개인정보 수집·이용에 동의해 주세요"), `step2Schema`(email 선택·형식, region ≤ 50, area_pyeong 선택 0 초과 10000 이하, budget_range 선택 ∈ BUDGET_RANGES, desired_start ≤ 50, message ≤ 2000). 빈 문자열은 undefined로 처리.
- Produces `spam.ts`: `checkSpam(i: {honeypot: string; renderedAt: number; now: number}): 'ok' | 'honeypot' | 'too_fast'` — honeypot 비어있지 않으면 'honeypot', `now - renderedAt < 3000`이면 'too_fast'.
- Produces `token.ts`: `createDetailToken(): {token: string; hash: string}`(32바이트 base64url, SHA-256 hex), `hashToken(t: string): string`, `hashIp(ip: string, salt: string): string`.
- Produces `notify.ts`: `notifyNewInquiry(i: {id: string; name: string; phone: string; space_type: Category; created_at: string}, to: string | null): Promise<'sent' | 'failed' | 'skipped'>` — `RESEND_API_KEY` 또는 `to`가 없으면 'skipped'. 제목 `[틈 홈페이지] 새 상담 문의 – {이름} ({공간 유형})`, 본문에 연락처와 관리자 문의 상세 링크 `${NEXT_PUBLIC_SITE_URL}/admin/inquiries/{id}`. 예외는 잡아서 'failed'.
- Produces `actions.ts`(`'use server'`):
  - `type Step1State = {status: 'idle'} | {status: 'success'; inquiryId: string; token: string} | {status: 'error'; message: string; fieldErrors?: Record<string, string>; values?: Record<string,string>}`
  - `submitInquiryStep1(prev: Step1State, fd: FormData): Promise<Step1State>` — FormData 키: `name, phone, space_type, privacy, website(honeypot), rendered_at, utm_source, utm_medium, utm_campaign, referrer, landing_path`. honeypot면 RPC 호출 없이 가짜 success(무작위 id, 빈 token). too_fast면 error "잠시 후 다시 시도해 주세요". IP는 `headers()`의 `x-forwarded-for` 첫 값. `rate_limited` 예외 → error "짧은 시간에 너무 많은 문의가 접수되었습니다. 전화로 연락 주세요". 기타 실패 → error "일시적인 오류입니다. 전화로 연락 주세요"(+ values로 입력값 유지). 성공 후 RPC가 돌려준 `notify_email`로 `notifyNewInquiry`를 호출하고 결과를 `set_inquiry_notify_status`로 기록(알림 실패해도 success).
  - `type Step2State = {status: 'idle'} | {status: 'success'} | {status: 'error'; message: string; fieldErrors?: Record<string,string>}`
  - `submitInquiryStep2(prev: Step2State, fd: FormData): Promise<Step2State>` — 키 `inquiry_id, token` + step2 필드. RPC false → error "입력 시간이 지났습니다. 추가 내용은 전화로 알려 주세요".

- [ ] **Step 1: 실패하는 단위 테스트 작성.**
  - schema: 정상 입력 통과 시 phone이 정규화돼 있음; 이름 빈 값/31자 실패; privacy 누락 시 해당 메시지; step2 빈 문자열 → undefined; message 2001자 실패
  - spam: honeypot 값 있음 → 'honeypot'; 2999ms → 'too_fast'; 3000ms → 'ok'
  - token: `hashToken(createDetailToken().token)`이 `hash`와 같음; 두 번 생성한 token이 다름; `hashIp('1.1.1.1','s')`가 64자 hex
- [ ] **Step 2: 실패하는 통합 테스트 작성** — `tests/db/inquiry-actions.test.ts`(로컬 DB, `next/headers`는 vi.mock으로 `x-forwarded-for: 10.0.0.1` 제공):
  - `step1 success stores normalized phone and notify_status skipped` (RESEND_API_KEY 없음)
  - `honeypot returns success without inserting`
  - `step2 with returned token stores details`
- [ ] **Step 3:** `npm test && npm run test:db` → FAIL.
- [ ] **Step 4:** 구현.
- [ ] **Step 5:** `npm test && npm run test:db` → PASS.
- [ ] **Step 6:** 커밋 `feat: 문의 접수 검증·스팸 방어·RPC 서버 액션·메일 알림`.

---

### Task 5: 공개 데이터 조회, 미디어 경로, 샘플 콘텐츠

**Files:**
- Create: `src/lib/data/public.ts`, `src/lib/media.ts`, `supabase/sample-content.sql`, `public/samples/*.webp`(12장), `public/samples/CREDITS.md`
- Test: `tests/unit/media.test.ts`, `tests/db/public-data.test.ts`

**Interfaces:**
- Consumes: Task 4 `createPublicClient`, Task 3 `pickBanner`.
- Produces `media.ts`: `mediaUrl(path: string | null | undefined): string | null` — null/빈 값 → null; `http`로 시작하거나 `/`로 시작하면 그대로; 그 외 `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`.
- Produces `public.ts`의 타입과 함수(모두 `server-only`, 실패 시 throw하지 않고 빈 값 반환 + `console.error`). `PublicSettings`, `Testimonial`, `Faq`, `Banner`는 `src/lib/supabase/types.ts`의 `Database` 행 타입(`public_site_settings` 뷰, `testimonials`, `faqs`, `banners`)을 그대로 별칭으로 export한다:
  - `type PublicImage = {id; url: string; alt: string; width: number; height: number}`
  - `type ProjectCard = {id; slug; title; category; location; area_pyeong; budget_range; summary; cover: PublicImage | null}`
  - `type ProjectDetail = ProjectCard & {duration_weeks; completed_on; body; images: PublicImage[]; before: PublicImage | null; after: PublicImage | null; seo_title; seo_description}`
  - `getPublicSettings(): Promise<PublicSettings>`(행이 없으면 기본값 객체 `DEFAULT_SETTINGS`)
  - `listPublishedProjects(): Promise<ProjectCard[]>`(sort_order, created_at desc)
  - `getFeaturedProjects(limit = 6): Promise<ProjectCard[]>`
  - `getProjectBySlug(slug: string): Promise<ProjectDetail | null>`
  - `getRelatedProjects(p: {id; category}, limit = 3): Promise<ProjectCard[]>`
  - `getBeforeAfterHighlight(): Promise<{project: ProjectCard; before: PublicImage; after: PublicImage} | null>`
  - `getTestimonials(opts?: {featuredOnly?: boolean; projectId?: string}): Promise<Testimonial[]>`
  - `getFaqs(limit?: number): Promise<Faq[]>`
  - `getActiveBanner(now = new Date()): Promise<Banner | null>`(활성 배너 전체 조회 후 `pickBanner`)
- Produces `sample-content.sql`: 스펙 12절 수량. 모든 사례·후기 `is_sample = true`. 사례 제목은 "지역 + 평수 + 공간 유형" 형식. 사진 `storage_path`는 `/samples/{파일명}.webp`. 사례 1건에 Before/After 지정, 3건 is_featured. `site_settings` upsert(회사명 "(주)틈디자인스튜디오", 나머지 회사 정보는 "입력 필요" 표시 문구, 실적 숫자 4개·보증 3개는 예시 값). 맨 앞에 `delete`로 기존 샘플(`is_sample = true`)을 지워 여러 번 실행해도 안전하게.

- [ ] **Step 1: 샘플 사진 확보.** 1순위: Figma MCP `generate_image`로 따뜻한 오프화이트 톤의 미니멀 인테리어 사진 12장(거실·주방·침실·카페·쇼룸·오피스, Before용 낡은 공간 1장 포함) 생성 후 저장소로 내려받기. 내려받을 수 없으면 2순위: Python Pillow로 토큰 색 기반 그라데이션 + "SAMPLE" 표기 자리표시 이미지 생성. 모두 긴 변 1600px WebP. 출처를 `CREDITS.md`에 기록.
- [ ] **Step 2: 실패하는 테스트 작성.**
  - `media.test.ts`: `mediaUrl('/samples/a.webp') === '/samples/a.webp'`, `mediaUrl('projects/x/y.webp')`가 `.../storage/v1/object/public/media/projects/x/y.webp`, `mediaUrl(null) === null`
  - `public-data.test.ts`(로컬 DB, 샘플 시드 상태): `listPublishedProjects` 6건; 비공개로 바꾼 사례는 `getProjectBySlug`가 null; `getBeforeAfterHighlight` 결과 존재; `getActiveBanner(new Date('2000-01-01'))` null; `getPublicSettings`에 `notify_email` 키 없음
- [ ] **Step 3:** FAIL 확인 → 구현 → `npx supabase db reset && npm test && npm run test:db` PASS.
- [ ] **Step 4:** 커밋 `feat: 공개 데이터 조회와 샘플 콘텐츠`.

---

### Task 6: 공개 사이트 공통 레이아웃

**Files:**
- Create: `src/app/(site)/layout.tsx`, `src/components/site/{Header,Footer,MobileActionBar,KakaoFloat,BannerStrip,Reveal,Container,Section,Button}.tsx`, `src/lib/attribution.ts`, `src/lib/analytics.ts`, `src/components/site/{AttributionCapture,Analytics}.tsx`, `src/app/not-found.tsx`, `src/app/global-error.tsx`
- Modify: `src/app/layout.tsx`
- Test: `tests/unit/attribution.test.ts`, `tests/unit/BannerStrip.test.tsx`

**Interfaces:**
- Consumes: Task 5 `getPublicSettings`, `getActiveBanner`.
- Produces `attribution.ts`: `captureAttribution(loc: {href: string}, referrer: string, store: Storage): void`(이미 저장돼 있으면 덮지 않음, 키 `teum_attr`), `readAttribution(store: Storage): Attribution`, `type Attribution = {utm_source; utm_medium; utm_campaign; referrer; landing_path}`(없으면 null). 같은 사이트 referrer는 null로 저장.
- Produces `analytics.ts`: `track(event: 'generate_lead' | 'inquiry_detail' | 'click_call' | 'click_kakao', params?: Record<string, string>): void` — `window.gtag` 있으면 호출, 없으면 무시.
- Produces 컴포넌트: `<Reveal>`(IntersectionObserver로 화면 진입 시 `clip-path: inset(0 50% 0 50%)` → `inset(0 0 0 0)`, 0.9s; `prefers-reduced-motion`이면 바로 표시), `<Button href variant="primary"|"ghost">`, `<Section eyebrow title>`, `<Container>`.
- Header: 로고(설정의 logo_path가 있으면 이미지, 없으면 "틈" 워드마크 + "TEUM DESIGN STUDIO"), 메뉴(시공 사례 /projects, 스튜디오 /about, 진행 절차 /process, 상담 문의 /contact), "무료 상담 신청" 버튼. 모바일은 메뉴 버튼 → 전체 화면 메뉴(Esc로 닫힘, 포커스 트랩).
- MobileActionBar(768px 미만): 전화(`tel:`, `track('click_call')`) / 카카오톡(URL 있을 때만, `track('click_kakao')`) / 상담 신청. KakaoFloat(768px 이상, URL 있을 때만).
- BannerStrip: 닫기 버튼 → `localStorage['teum_banner_closed'] = banner.id`, 같은 id면 표시 안 함(클라이언트 컴포넌트, 서버에서 받은 banner prop).
- Footer: 스펙 2.2 항목. 값이 비어 있는 항목은 줄째 생략.
- Root layout: `<html lang="ko">`, Vercel `<Analytics />`, 설정에 `ga4_id`가 있으면 gtag 스크립트(`next/script`, afterInteractive), `<meta name="naver-site-verification">`/`google-site-verification`은 값이 있을 때만(Task 10에서 metadata로 이동 가능).
- `(site)/layout.tsx`: `export const revalidate = 3600`.

- [ ] **Step 1: 실패하는 테스트 작성.**
  - attribution: `?utm_source=naver&utm_medium=cpc` 첫 방문 저장; 두 번째 capture가 덮어쓰지 않음; referrer가 같은 호스트면 null; landing_path는 pathname
  - BannerStrip(jsdom, @testing-library/react 설치): 렌더 시 문구 표시; 닫기 클릭 후 사라지고 localStorage에 id 저장; 같은 id 저장된 상태로 렌더 시 표시 안 함
- [ ] **Step 2:** FAIL → 구현 → `npm test` PASS, `npm run build` 성공.
- [ ] **Step 3:** `npm run dev` 후 Playwright 스크립트로 360px·1280px 스크린샷을 스크래치 디렉터리에 찍어 헤더·푸터·하단 바 배치 확인.
- [ ] **Step 4:** 커밋 `feat(site): 공통 레이아웃, 유입 경로 수집, 분석 이벤트`.

---

### Task 7: 홈 페이지와 간편 문의 폼

**Files:**
- Create: `src/app/(site)/page.tsx`(교체), `src/components/site/home/{Hero,Stats,FeaturedProjects,BeforeAfterHighlight,Guarantees,Testimonials,ProcessSummary,FaqPreview,Partners,QuickInquiry}.tsx`, `src/components/site/{ProjectCard,BeforeAfterSlider,FaqList,CountUp}.tsx`, `src/components/site/inquiry/{Step1Form,Step2Form,InquiryFlow}.tsx`, `src/lib/process-steps.ts`
- Test: `tests/unit/BeforeAfterSlider.test.tsx`, `tests/unit/InquiryFlow.test.tsx`, `tests/unit/ProjectCard.test.tsx`

**Interfaces:**
- Consumes: Task 4 `submitInquiryStep1/2`, `Step1State`, `Step2State`; Task 5 조회 함수; Task 6 `Reveal`, `Section`, `track`, `readAttribution`.
- Produces `process-steps.ts`: `PROCESS_STEPS: {no: number; title: string; description: string}[]` — 상담 / 실측 / 설계 / 견적 / 시공 / 사후관리 6개, 각 1~2문장.
- Produces `<ProjectCard project={ProjectCard}>`: cover가 null이면 `bg-line` 자리표시 박스(Review Focus 5). 카테고리·평수·위치 표시.
- Produces `<BeforeAfterSlider before after alt>`: `role="slider"`, `aria-valuemin=0 aria-valuemax=100 aria-valuenow`, 포인터 드래그와 ←/→ 키(5씩) 조작, 초기 50.
- Produces `<InquiryFlow variant="quick" | "full">`: 1단계 폼(`useActionState(submitInquiryStep1)`) → success면 `track('generate_lead')` 후 접수 완료 문구 "접수되었습니다. 영업일 기준 1일 안에 연락드립니다." + 2단계 폼(선택, "건너뛰기" 가능). `variant="full"`은 같은 흐름에 문의 페이지용 안내 문구가 붙는다. 1단계 폼은 hidden `rendered_at`(마운트 시 Date.now()), hidden 유입 필드 5개, 화면 밖 honeypot 입력 `website`(`tabIndex=-1`, `autoComplete="off"`, `aria-hidden`). 전송 중 버튼 `disabled` + "접수 중…"(Review Focus 4). 오류 시 필드 옆 메시지 + `aria-describedby`, 상단 `role="alert"` 요약.
- 홈 섹션 순서와 표시 조건은 스펙 2.1 그대로. 데이터가 없는 섹션은 렌더링하지 않는다. 히어로 사진은 설정의 hero_image_path, 없으면 첫 대표 사례 cover.

- [ ] **Step 1: 실패하는 컴포넌트 테스트 작성.**
  - BeforeAfterSlider: 초기 `aria-valuenow="50"`; ArrowRight 후 55; ArrowLeft 두 번 후 45
  - ProjectCard: cover null일 때 img 없이 자리표시 요소(`data-testid="cover-placeholder"`) 렌더
  - InquiryFlow: 서버 액션을 vi.mock으로 대체해 success 반환 → 완료 문구와 2단계 폼 표시; 대기 중 제출 버튼 disabled; error 반환 시 `role="alert"`에 메시지
- [ ] **Step 2:** FAIL → 구현 → `npm test` PASS → `npm run build` 성공.
- [ ] **Step 3:** 로컬 DB + `npm run dev`로 360/1280px 스크린샷 확인(섹션 순서, 틈 모션 정상, 가로 스크롤 없음).
- [ ] **Step 4:** 커밋 `feat(site): 홈 페이지와 2단계 간편 문의`.

---

### Task 8: 시공 사례 목록과 상세

**Files:**
- Create: `src/app/(site)/projects/page.tsx`, `src/app/(site)/projects/[slug]/page.tsx`, `src/components/site/projects/{ProjectFilters,ProjectGrid,Gallery,ProjectFacts}.tsx`, `src/lib/project-filters.ts`
- Test: `tests/unit/project-filters.test.ts`

**Interfaces:**
- Consumes: Task 5 `listPublishedProjects`, `getProjectBySlug`, `getRelatedProjects`, `getTestimonials({projectId})`; Task 7 `ProjectCard`, `BeforeAfterSlider`; Task 3 `pyeongBucket`, 라벨.
- Produces `project-filters.ts`: `type ProjectFilter = {category?: Category; pyeong?: PyeongBucket; budget?: BudgetRange}`, `parseProjectFilter(sp: URLSearchParams): ProjectFilter`(허용 값 외는 무시), `filterProjects(list: ProjectCard[], f: ProjectFilter): ProjectCard[]`, `filterToQuery(f: ProjectFilter): string`.
- 목록 페이지는 서버에서 전체 공개 사례를 받고, 클라이언트 `ProjectGrid`가 `useSearchParams`로 필터링(정적 페이지 유지, `<Suspense>`로 감쌈). 필터 변경은 `router.replace`로 URL 반영(스크롤 유지). 결과 0건이면 "조건에 맞는 사례가 없습니다" + 필터 초기화 버튼.
- 상세: `generateStaticParams`(공개 slug 전체), `dynamicParams = true`, 없거나 비공개면 `notFound()`. `params`는 Promise. 갤러리는 yet-another-react-lightbox로 확대. 하단 "이런 공간 상담받기" → `/contact?project={slug}`. 연결 후기, 관련 사례 3개.

- [ ] **Step 1: 실패하는 테스트 작성** — `parseProjectFilter(new URLSearchParams('category=office&pyeong=bad'))` → `{category:'office'}`; `filterProjects`가 category·pyeong·budget 교집합으로 거름; `filterToQuery({category:'residential', pyeong:'20to30'})` → `'category=residential&pyeong=20to30'`.
- [ ] **Step 2:** FAIL → 구현 → `npm test` PASS → `npm run build`에서 사례 상세가 정적 생성됨(빌드 출력의 ● 표시) 확인.
- [ ] **Step 3:** 커밋 `feat(site): 시공 사례 목록 필터와 상세 페이지`.

---

### Task 9: 소개, 진행 절차, 문의, 개인정보처리방침 페이지

**Files:**
- Create: `src/app/(site)/{about,process,contact,privacy}/page.tsx`

**Interfaces:**
- Consumes: Task 5 `getPublicSettings`, `getFaqs`; Task 7 `InquiryFlow`, `FaqList`, `PROCESS_STEPS`, `Stats`, `Guarantees`.
- `/about`: 철학 문구(설정 `philosophy`, 비면 기본 문구 "틈은 비어 있는 곳이 아니라 빛과 사람이 드나드는 자리입니다." 단락), 대표 인사말(설정, 비면 섹션 생략), 실적 숫자, 보증, 회사 정보 표.
- `/process`: 6단계 타임라인 + FAQ 전체.
- `/contact`: `InquiryFlow variant="full"`. 쿼리 `?project={slug}`가 있으면 2단계 message 기본값에 "관심 사례: {제목}" 채움. 오른쪽(모바일은 아래)에 전화·카카오톡·주소·네이버 지도 링크(`https://map.naver.com/p/search/{encodeURIComponent(주소)}`), FAQ 상위 4개.
- `/privacy`: 스펙 2.1 항목. 회사명·책임자·연락처는 설정 값으로 채우고 비면 "(입력 필요)".

- [ ] **Step 1:** 네 페이지 구현. 각 페이지 `metadata` 제목: "시공 사례"·"스튜디오 소개"·"진행 절차"·"상담 문의"·"개인정보처리방침"(템플릿은 Task 10).
- [ ] **Step 2:** E2E 테스트 작성 — `tests/e2e/inquiry.spec.ts`: `/contact`에서 1단계 입력(이름 `E2E-{timestamp}`, 연락처 `010 1234 5678`) → 3초 대기 → 제출 → 완료 문구 → 2단계 입력·제출 → 완료. 그리고 제출 버튼 더블클릭 시 DB에 해당 이름 1건만 존재(테스트 helper `sql`로 확인, Review Focus 4). 테스트 후 `E2E-` 문의 삭제.
- [ ] **Step 3:** `playwright.config.ts`: `webServer`는 `npm run build && npm run start`(env는 `.env.test`), Chromium 하나, 뷰포트 데스크톱 + `Pixel 7` 프로젝트 두 개. 실행 `npm run test:e2e -- inquiry` → PASS.
- [ ] **Step 4:** 커밋 `feat(site): 소개·진행 절차·문의·개인정보처리방침 페이지`.

---

### Task 10: 검색 최적화

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/seo.ts`, `src/app/opengraph-image.tsx`(기본 OG)
- Modify: `src/app/layout.tsx`, 각 공개 페이지 `generateMetadata`
- Test: `tests/unit/seo.test.ts`

**Interfaces:**
- Produces `seo.ts`: `localBusinessJsonLd(s: PublicSettings, siteUrl: string): object`(`@type: "HomeAndConstructionBusiness"`, name, telephone, address(streetAddress), url, image, sameAs: 인스타·블로그 중 값 있는 것), `projectJsonLd(p: ProjectDetail, siteUrl: string): object`(`@type: "CreativeWork"`, name, image, description, locationCreated), `pageTitle(t?: string): string`(템플릿 `{t} | 틈디자인스튜디오`, 없으면 `틈디자인스튜디오 | 공간 인테리어 설계·시공`).
- Root `metadata`: `metadataBase = NEXT_PUBLIC_SITE_URL`, 기본 description, `verification`(google·naver는 `other: {'naver-site-verification': ...}`)은 설정 값이 있을 때만 → root layout은 `generateMetadata`로.
- 사례 상세: title = `seo_title ?? title`, description = `seo_description ?? summary`, OG 이미지 = cover URL.
- `sitemap.ts`: 정적 페이지 6개 + 공개 사례 전부(`lastModified = updated_at`). `robots.ts`: `/admin` disallow, sitemap URL.

- [ ] **Step 1: 실패하는 테스트** — `localBusinessJsonLd`에 telephone 빈 값이면 키 없음, sameAs에 빈 URL 제외; `pageTitle('시공 사례') === '시공 사례 | 틈디자인스튜디오'`.
- [ ] **Step 2:** FAIL → 구현 → PASS. `npm run build && npm run start` 후 `curl localhost:3000/sitemap.xml`에 사례 URL 포함, `curl localhost:3000/robots.txt`에 `Disallow: /admin`.
- [ ] **Step 3:** 커밋 `feat(seo): 메타데이터, 구조화 데이터, sitemap, robots`.

---

### Task 11: 관리자 인증과 레이아웃

**Files:**
- Create: `src/proxy.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/browser.ts`, `src/lib/admin/auth.ts`, `src/lib/admin/revalidate.ts`, `src/app/admin/login/{page.tsx,actions.ts}`, `src/app/admin/(panel)/layout.tsx`, `src/components/admin/{AdminNav,PageHeader,FormField,SubmitButton,Toast,ConfirmButton}.tsx`
- Test: `tests/e2e/admin-auth.spec.ts`

**Interfaces:**
- Produces `server.ts`: `createServerSupabase(): Promise<SupabaseClient<Database>>`(@supabase/ssr, `cookies()`의 getAll/setAll).
- Produces `browser.ts`: `createBrowserSupabase(): SupabaseClient<Database>`.
- Produces `auth.ts`: `requireAdmin(): Promise<{supabase: SupabaseClient<Database>; userId: string}>` — 사용자 없음 또는 `is_admin()` false면 `redirect('/admin/login')`. 모든 관리자 서버 액션 첫 줄에서 호출.
- Produces `revalidate.ts`: `revalidateSite(): void` → `revalidatePath('/', 'layout')`.
- Produces login 액션: `signIn(prev, fd): Promise<{error?: string}>` — 실패 시 "이메일 또는 비밀번호가 올바르지 않습니다". 로그인됐지만 관리자가 아니면 즉시 로그아웃 후 "관리자 권한이 없는 계정입니다". 성공 시 `redirect(fd.get('next') ?? '/admin')`(`/admin`으로 시작하는 값만 허용). `signOut(): Promise<void>`.
- `proxy.ts`: matcher `['/admin/:path*']`. 세션 쿠키 갱신(@supabase/ssr 표준 패턴), `/admin/login` 외 경로에서 사용자 없으면 `/admin/login?next={원래 경로}`로 리다이렉트.
- 관리자 레이아웃: 좌측 메뉴(대시보드, 시공 사례, 고객 후기, FAQ, 이벤트 배너, 상담 문의(신규 개수 배지), 유입 통계, 사이트 설정, 로그아웃), 모바일은 상단 접이식. `robots: noindex`.
- 공통 폼 부품: `<FormField label name error hint>`, `<SubmitButton pendingText>`(useFormStatus), `<ConfirmButton message>`(삭제 확인 `confirm()`).

- [ ] **Step 1: 실패하는 E2E 작성** — 비로그인 `/admin/projects` 접근 → `/admin/login?next=%2Fadmin%2Fprojects`로 이동; 틀린 비밀번호 → 오류 문구; 로컬 관리자 로그인 → `next` 경로로 이동하고 메뉴 표시; 로그아웃 → 로그인 화면.
- [ ] **Step 2:** FAIL → 구현 → `npm run test:e2e -- admin-auth` PASS.
- [ ] **Step 3:** 커밋 `feat(admin): 로그인, 세션 프록시, 관리자 레이아웃`.

---

### Task 12: 관리자 대시보드, 상담 문의, 유입 통계

**Files:**
- Create: `src/app/admin/(panel)/page.tsx`, `src/app/admin/(panel)/inquiries/{page.tsx,[id]/page.tsx,actions.ts,export/route.ts}`, `src/app/admin/(panel)/stats/page.tsx`, `src/components/admin/{InquiryTable,StatusBadge,StatusSelect,SampleWarning}.tsx`
- Test: `tests/e2e/admin-inquiries.spec.ts`

**Interfaces:**
- Consumes: Task 11 `requireAdmin`; Task 3 `STATUS_LABELS`, `toCsv`, `aggregateByChannel`, `classifyChannel`, `CHANNEL_LABELS`.
- Produces 액션: `updateInquiry(id: string, prev, fd): Promise<{ok: boolean; error?: string}>` — status, admin_memo 갱신.
- 대시보드: 신규 문의 수, 최근 문의 5건(이름·공간 유형·접수 시각·상태), 공개 사례 수, `<SampleWarning>`(공개 상태의 `is_sample` 사례·후기 합계가 1 이상이면 "샘플 콘텐츠 N개가 공개 중입니다. 실제 콘텐츠로 교체하거나 비공개로 바꿔 주세요." + 링크).
- 문의 목록: 상태 필터 탭(전체/신규/상담중/완료/스팸, `?status=`), 20건 페이지네이션(`?page=`), 행 클릭 → 상세. 접수 시각은 `Asia/Seoul` `YYYY.MM.DD HH:mm`.
- 문의 상세: 1·2단계 전 항목, 유입 정보(채널 라벨 + 원본 값), 알림 상태, 연락처 `tel:` 링크, 상태 select + 메모 저장.
- CSV(`GET /admin/inquiries/export?status=`): `requireAdmin` 후 전체(필터 반영) → `toCsv`, 헤더 `Content-Type: text/csv; charset=utf-8`, 파일명 `inquiries-YYYYMMDD.csv`. 열: 접수일시, 이름, 연락처, 이메일, 공간 유형, 지역, 평수, 예산, 착공 시기, 내용, 상태, 메모, 유입 채널.
- 통계: `?range=30|90`(기본 30). 표: 채널, 총 문의, 신규·상담중·완료·스팸.

- [ ] **Step 1: 실패하는 E2E 작성** — RPC로 문의 1건 생성(helper) → 관리자 로그인 → 목록에 표시 → 상세에서 상태 "상담중" + 메모 저장 → 목록 "상담중" 탭에 표시 → CSV 다운로드 파일 첫 3바이트가 BOM이고 이름 포함 → 통계 페이지에 해당 채널 행 존재. 종료 시 정리.
- [ ] **Step 2:** FAIL → 구현 → PASS.
- [ ] **Step 3:** 커밋 `feat(admin): 대시보드, 문의 관리, CSV, 유입 통계`.

---

### Task 13: 관리자 시공 사례 관리(사진 업로드 포함)

**Files:**
- Create: `src/app/admin/(panel)/projects/{page.tsx,new/page.tsx,[id]/page.tsx,actions.ts}`, `src/components/admin/{ProjectForm,ImageManager,SortableList,UnsavedGuard}.tsx`, `src/lib/admin/schemas.ts`, `src/lib/image-resize.ts`
- Test: `tests/unit/admin.schemas.test.ts`, `tests/e2e/admin-projects.spec.ts`, `tests/e2e/fixtures/room.jpg`

**Interfaces:**
- Consumes: Task 11 `requireAdmin`, `revalidateSite`, `createBrowserSupabase`; Task 3 `slugify`, `uniqueSlug`; Task 5 `mediaUrl`.
- Produces `schemas.ts`: `projectSchema`(title 1~100, slug 선택(비면 title로 생성), category, location ≤ 50, area_pyeong 선택, budget_range, duration_weeks 선택 1~520 정수, completed_on 선택 날짜, summary ≤ 200, body ≤ 10000, is_published/is_featured/is_sample 체크박스 → boolean, seo_title ≤ 70, seo_description ≤ 160). 이후 Task 14·15가 `testimonialSchema`, `faqSchema`, `bannerSchema`(ends_on ≥ starts_on), `settingsSchema`를 같은 파일에 추가.
- Produces `image-resize.ts`: `resizeForUpload(file: File): Promise<{blob: Blob; width: number; height: number}>` — browser-image-compression, `maxWidthOrHeight: 2560`, `fileType: 'image/webp'`, `initialQuality: 0.85`; 결과 10MB 초과 시 `Error('파일이 너무 큽니다(10MB 초과)')`; 디코딩 실패 시 `Error('이 형식의 사진은 올릴 수 없습니다. JPG 또는 PNG로 저장해 다시 올려 주세요')`(HEIC 등).
- Produces 액션(`actions.ts`):
  - `saveProject(id: string | null, prev, fd): Promise<{ok: boolean; id?: string; fieldErrors?; error?}>` — 새로 만들면 `/admin/projects/{id}`로 redirect. slug 중복은 `uniqueSlug`로 해결.
  - `deleteProject(id: string): Promise<void>` — 저장소 `projects/{id}/` 파일 삭제 후 행 삭제.
  - `addProjectImages(projectId: string, items: {storage_path: string; width: number; height: number}[]): Promise<void>` — 첫 사진이고 cover 없으면 cover로 지정.
  - `updateImageAlt(imageId: string, alt: string): Promise<void>`
  - `deleteProjectImage(imageId: string): Promise<void>` — 저장소 파일 삭제(`/samples/` 경로는 건너뜀) + 행 삭제.
  - `setProjectImageRole(projectId: string, imageId: string, role: 'cover' | 'before' | 'after' | null): Promise<void>`
  - `reorderProjectImages(projectId: string, ids: string[]): Promise<void>`, `reorderProjects(ids: string[]): Promise<void>`
  - 모든 쓰기 액션 끝에 `revalidateSite()`.
- `<SortableList items renderItem onReorder>`: dnd-kit 기반, 키보드 정렬 지원. Task 14에서 재사용.
- `<ImageManager>`: 파일 여러 장 선택·드롭 → 순서대로 `resizeForUpload` → 브라우저 클라이언트로 `media/projects/{projectId}/{uuid}.webp` 업로드 → 성공 항목만 `addProjectImages`. 파일별 진행 상태, 실패 목록과 "다시 시도" 버튼. 썸네일마다 대표/Before/After 지정 버튼, alt 입력, 삭제.
- `<UnsavedGuard dirty>`: `beforeunload` 경고.
- 목록: 썸네일, 제목, 카테고리, 공개·홈 노출·샘플 배지, 드래그 정렬. 제목 입력 아래 힌트 "예: 성수동 32평 아파트 인테리어 — 지역·평수·공간 유형을 넣으면 검색에 잘 나옵니다".

- [ ] **Step 1: 실패하는 테스트 작성.**
  - schemas: 체크박스 미전송 → false; duration_weeks "abc" 실패; seo_description 161자 실패; 빈 slug 허용
  - E2E: 로그인 → 새 사례(제목 `E2E 성수동 32평 아파트`, 주거, 공개) 저장 → 사진 `fixtures/room.jpg` 업로드 → 대표로 지정 → 공개 페이지 `/projects/e2e-성수동-32평-아파트`(URL 인코딩)에 제목과 이미지 표시 → 관리자에서 공개 해제 → 같은 URL 404 → 사례 삭제. 대표 사진 삭제 후 공개 페이지가 자리표시로 렌더(Review Focus 5).
- [ ] **Step 2:** FAIL → 구현 → `npm test && npm run test:e2e -- admin-projects` PASS.
- [ ] **Step 3:** 커밋 `feat(admin): 시공 사례 관리와 사진 업로드`.

---

### Task 14: 관리자 후기, FAQ, 이벤트 배너

**Files:**
- Create: `src/app/admin/(panel)/{testimonials,faqs,banners}/{page.tsx,[id]/page.tsx,new/page.tsx,actions.ts}`, `src/components/admin/{TestimonialForm,FaqForm,BannerForm}.tsx`
- Modify: `src/lib/admin/schemas.ts`
- Test: `tests/unit/admin.schemas.test.ts`(추가), `tests/e2e/admin-content.spec.ts`

**Interfaces:**
- Consumes: Task 13 `SortableList`, 스키마 파일; Task 11 공통 부품.
- Produces 스키마: `testimonialSchema`(project_id 선택 uuid, customer_label 1~30, space_label ≤ 30, rating 1~5 정수, body 1~1000, 플래그 3개), `faqSchema`(question 1~200, answer 1~2000, is_published), `bannerSchema`(message 1~80, link_url 선택(`/`로 시작하거나 https URL), starts_on, ends_on ≥ starts_on → "종료일은 시작일 이후여야 합니다", is_active).
- Produces 액션(엔티티마다 같은 모양): `saveX(id: string | null, prev, fd)`, `deleteX(id)`, `reorderX(ids)`(배너 제외). 모두 `requireAdmin` + `revalidateSite()`.
- 배너 목록에 상태 표시: "노출 중" / "예약" / "종료" / "꺼짐"(`isBannerVisible`과 오늘 날짜로 계산).
- 후기 폼의 사례 선택은 전체 사례 select(공개 여부 무관).

- [ ] **Step 1: 실패하는 테스트** — bannerSchema 종료일 < 시작일 실패, link_url `javascript:alert(1)` 실패; E2E: FAQ 추가 → `/process`에 표시 → 삭제; 오늘 포함 기간 배너 생성 → 홈 상단에 문구 표시 → 끄기 → 사라짐.
- [ ] **Step 2:** FAIL → 구현 → PASS.
- [ ] **Step 3:** 커밋 `feat(admin): 고객 후기, FAQ, 이벤트 배너 관리`.

---

### Task 15: 관리자 사이트 설정

**Files:**
- Create: `src/app/admin/(panel)/settings/{page.tsx,actions.ts}`, `src/components/admin/{SettingsForm,JsonListEditor,SingleImageField}.tsx`
- Modify: `src/lib/admin/schemas.ts`
- Test: `tests/unit/admin.schemas.test.ts`(추가), `tests/e2e/admin-settings.spec.ts`

**Interfaces:**
- Produces `settingsSchema`: 텍스트 항목 각 ≤ 200(소개 문구·인사말 ≤ 3000), URL 항목은 빈 값 또는 https URL, `notify_email` 빈 값 또는 이메일, `ga4_id` 빈 값 또는 `/^G-[A-Z0-9]+$/`, `stats` 최대 6개 `{label 1~20, value 1~10, suffix ≤ 5}`, `guarantees` 최대 6개 `{title 1~30, description ≤ 100}`, `partners` 최대 20개 `{name 1~40, logo_path, url 선택}`. JSON 항목은 폼에서 hidden input에 JSON 문자열로 전달.
- Produces 액션: `saveSettings(prev, fd)`, 이미지 필드(로고·히어로·대표 사진·파트너 로고)는 `resizeForUpload` 후 `media/settings/` 또는 `media/partners/` 업로드, 교체 시 이전 파일 삭제(`/samples/` 제외).
- `<JsonListEditor fields>`: 행 추가·삭제·위아래 이동. 실적 숫자·보증 편집기 위에 "예시 값입니다. 실제 값으로 바꿔 주세요" 안내(값이 샘플 시드와 같을 때만).
- 화면 그룹: 회사 정보 / 홈 화면 / 소개 / 실적·보증·파트너 / 연락 채널 / 알림·분석·검색 등록.

- [ ] **Step 1: 실패하는 테스트** — ga4_id `UA-123` 실패, stats 7개 실패, notify_email 형식 오류; E2E: 전화번호 변경 저장 → 공개 푸터에 새 번호 표시.
- [ ] **Step 2:** FAIL → 구현 → PASS.
- [ ] **Step 3:** 커밋 `feat(admin): 사이트 설정`.

---

### Task 16: 전체 검증과 품질 점검

**Files:**
- Create: `scripts/lighthouse.mjs`
- Modify: 점검 결과에 따른 수정 파일

- [ ] **Step 1:** `npx supabase db reset && npm run typecheck && npm test && npm run test:db && npm run test:e2e` → 전부 PASS.
- [ ] **Step 2:** `scripts/lighthouse.mjs`: lighthouse(설치 시점 최신 고정, devDependency)를 `/opt/pw-browsers/chromium`으로 모바일 프리셋 실행, `/`, `/projects`, 사례 상세 1개, `/contact`의 성능·접근성·SEO 점수 출력. 각 90 이상이 아니면 원인 수정 후 재실행.
- [ ] **Step 3:** 키보드만으로 `/contact` 1·2단계 제출 가능 여부를 Playwright로 확인(Tab/Enter/Space만 사용) — `tests/e2e/a11y-keyboard.spec.ts`로 추가.
- [ ] **Step 4:** 360px에서 모든 공개 페이지 `document.documentElement.scrollWidth <= 360` 확인을 E2E에 추가.
- [ ] **Step 5:** 커밋 `test: 접근성·반응형 점검과 Lighthouse 스크립트`.

---

### Task 17: 배포(Supabase·Vercel) — 사용자 확인 단계 포함

**Files:**
- Modify: `README.md`(운영 절차 섹션)

- [ ] **Step 1: Supabase 운영 프로젝트 생성** — MCP `create_project`(조직 `evfgrphscnfkqtoigdae`, 이름 `teum`, 리전 `ap-northeast-2`). 무료 요금제임을 사용자에게 알리고 진행.
- [ ] **Step 2:** MCP `apply_migration`으로 마이그레이션 3개를 파일 내용 그대로 순서대로 적용 → `execute_sql`로 `sample-content.sql` 실행 → 무작위 32바이트 비밀값을 만들어 `insert into private.app_config values ('inquiry_rpc_secret', ...)`. `get_advisors`(security)로 경고 확인 후 해결.
- [ ] **Step 3:** 관리자 계정: 사용자에게 받은 이메일로 `seed-local.sql`과 같은 방식의 SQL로 생성(임시 비밀번호는 무작위 생성해 사용자에게만 전달, 첫 로그인 후 변경 안내) → admins 등록. 공개 가입 비활성화는 MCP로 불가하므로 사용자에게 대시보드 경로(Authentication → Sign In / Providers → "Allow new users to sign up" 끄기)를 안내. 꺼지지 않아도 `admins` 미등록 계정은 RLS로 아무것도 쓸 수 없음.
- [ ] **Step 4: Vercel 프로젝트** — 1순위: MCP로 GitHub 저장소 `sourcehp/teum` 연결 프로젝트 생성(팀 `team_fkqDrvd7ghgBIJoMUPycLg06`, 프레임워크 Next.js, 함수 리전 `icn1`). 저장소 접근 권한이 없으면 사용자에게 Vercel GitHub 앱 설치를 요청하거나, 2순위로 MCP 파일 업로드 배포를 사용.
- [ ] **Step 5:** 환경변수 등록(Production·Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`(MCP `get_publishable_keys`), `INQUIRY_RPC_SECRET`, `IP_HASH_SALT`(무작위), `NEXT_PUBLIC_SITE_URL`(배포 도메인), `RESEND_API_KEY`·`MAIL_FROM`(사용자가 키를 주면; 없으면 비워 두고 알림은 skipped).
- [ ] **Step 6:** 이 브랜치로 미리보기 배포 → MCP로 빌드 로그 확인 → `web_fetch_vercel_url`로 `/`, `/projects`, 사례 상세, `/contact`, `/sitemap.xml`, `/admin/login` 응답 확인. 문의 1건 실제 접수 시험 후 `execute_sql`로 확인·삭제.
- [ ] **Step 7:** 결과(URL, 관리자 로그인 방법, 남은 운영 전환 항목: 스펙 14.1)를 사용자에게 보고. `main` 병합(운영 배포)은 사용자 승인 후 진행.
- [ ] **Step 8:** README 운영 절차 섹션 커밋 `docs: 배포·운영 절차`.
