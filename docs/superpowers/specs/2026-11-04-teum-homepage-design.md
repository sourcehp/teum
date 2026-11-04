# (주)틈디자인스튜디오 홈페이지 기획서

- 작성일: 2026-11-04
- 상태: 검토 대기
- 구현 방식: Next.js + Supabase + Vercel (A안)

## 1. 목표와 성공 기준

### 1.1 배경
(주)틈디자인스튜디오는 주거·상업·오피스 공간의 인테리어 설계와 시공을 하는 회사다. 현재 홈페이지가 없고, 신규 고객 문의를 받을 온라인 창구가 필요하다.

### 1.2 1순위 목표
**상담 문의 확보.** 시공 사례를 본 방문자가 상담 문의를 남기게 하는 것이 목적이다.

### 1.3 성공 기준
1. 방문자가 어느 페이지에서든 한 번의 클릭으로 문의 폼이나 카카오톡 채널에 닿는다.
2. 1단계 문의(이름·연락처·공간 유형)는 30초 안에 작성할 수 있다.
3. 개발자가 아닌 직원이 관리자 화면만으로 시공 사례(사진 포함)를 등록·수정·숨김 처리할 수 있다.
4. 문의가 들어오면 관리자 화면에 저장되고 담당자 메일로 알림이 간다.
5. 관리자 화면에서 문의를 유입 채널별로 집계해 볼 수 있다.
6. 모바일 Lighthouse 성능·접근성·SEO 점수가 각각 90점 이상이다.

### 1.4 전제와 가정
- 한국어 단일 언어로 만든다.
- 실제 자료(로고, 사진, 소개문, 회사 정보)는 나중에 받는다. 그 전까지는 샘플 콘텐츠로 채우고 관리자 화면에서 교체한다.
- 도메인이 정해지기 전까지는 `*.vercel.app` 주소를 쓴다.
- 관리자 계정은 모두 같은 권한을 가진다.

### 1.5 범위 밖 (이번 차수에서 하지 않음)
블로그·뉴스, 다국어, 관리자 권한 등급, 온라인 견적 계산기, 인스타그램 피드 자동 연동, 지역별 랜딩 페이지.

## 2. 사이트 구조

### 2.1 공개 페이지

| 경로 | 페이지 | 구성 |
|---|---|---|
| `/` | 홈 | 이벤트 띠 배너 → 히어로(대표 사진 + 무료 상담 혜택 문구 + 상담 버튼) → 실적 숫자 → 대표 사례(홈 노출 지정, 최대 6개) → Before/After 하이라이트(Before·After 사진이 지정된 공개 사례 중 정렬 순서가 가장 앞선 1건, 없으면 섹션 숨김) → 보증·약속 → 고객 후기 → 진행 절차 요약 → FAQ(상위 4개) → 언론·파트너 로고(등록된 항목이 있을 때만) → 간편 문의 폼(1단계) |
| `/projects` | 시공 사례 목록 | 사진 그리드. 필터: 카테고리, 평형대, 예산대. 필터 상태는 URL 쿼리에 반영해 공유와 뒤로가기가 되게 한다. |
| `/projects/[slug]` | 시공 사례 상세 | 대표 사진, 정보(위치·평수·예산대·공사 기간·완공일·카테고리), 본문, Before/After 슬라이더(지정된 경우), 사진 갤러리(확대 보기), 연결된 후기, "이런 공간 상담받기" 버튼, 같은 카테고리의 다른 사례 3개 |
| `/about` | 스튜디오 소개 | "틈" 철학, 대표 인사말, 실적 숫자, 보증·약속, 회사 정보 |
| `/process` | 진행 절차 | 6단계(상담 → 실측 → 설계 → 견적 → 시공 → 사후관리), FAQ 전체 |
| `/contact` | 상담 문의 | 2단계 문의 폼, 카카오톡 채널 버튼, 전화, 주소, 지도 링크(네이버 지도), FAQ 상위 4개 |
| `/privacy` | 개인정보처리방침 | 수집 항목, 목적, 보유 기간(상담 완료 후 1년), 파기, 문의처 |

### 2.2 모든 페이지 공통
- 헤더: 로고, 메뉴(사례·소개·진행 절차·문의), "무료 상담 신청" 버튼(고정)
- 모바일: 하단 고정 바(전화 / 카카오톡 / 상담 신청)
- 데스크톱: 우측 하단 카카오톡 채널 버튼(채널 URL이 설정된 경우만)
- 푸터: 회사 정보(상호, 대표자, 사업자등록번호, 주소, 전화, 이메일), SNS 링크, 개인정보처리방침 링크
- 이벤트 띠 배너: 활성 상태이고 오늘이 노출 기간 안에 있는 배너 중 가장 최근에 시작한 1개를 보여준다. 방문자가 닫으면 해당 배너는 그 브라우저에서 다시 표시하지 않는다.

### 2.3 관리자 (`/admin`, 로그인 필요)

| 화면 | 기능 |
|---|---|
| 로그인 | 이메일·비밀번호. 공개 회원가입 없음. |
| 대시보드 | 신규 문의 수, 최근 문의 5건, 공개 사례 수, 샘플 콘텐츠 공개 경고 |
| 시공 사례 | 목록(공개 상태·샘플 배지), 등록·수정·삭제, 사진 다중 업로드, 사진 순서 드래그 변경, 대표·Before·After 사진 지정, 공개/비공개, 홈 노출, 사례 순서 변경, SEO 제목·설명 |
| 고객 후기 | 등록·수정·삭제, 사례 연결, 공개/홈 노출, 순서 변경 |
| FAQ | 등록·수정·삭제, 공개 여부, 순서 변경 |
| 이벤트 배너 | 등록·수정·삭제, 노출 기간, 활성 여부 |
| 상담 문의 | 목록(상태 필터, 신규 개수 배지), 상세, 상태 변경, 내부 메모, 전화 걸기 링크, CSV 내보내기 |
| 유입 통계 | 최근 30일·90일 채널별 문의 수와 상태별 건수 |
| 사이트 설정 | 회사 정보, 로고, 히어로 문구·사진, 무료 상담 혜택 문구, 실적 숫자, 보증·약속, 언론·파트너 로고, SNS·카카오톡 채널 URL, 알림 메일 주소, GA4 측정 ID, 네이버·구글 사이트 인증 값 |

## 3. 데이터 구조

모든 테이블은 `id`(uuid), `created_at`, `updated_at`을 가진다.

### 3.1 테이블

**`projects`**
| 컬럼 | 타입 | 설명 |
|---|---|---|
| slug | text, unique | URL 경로. 제목에서 자동 생성하고 수정 가능 |
| title | text | 예: "성수동 32평 아파트 인테리어" |
| category | enum: residential, commercial, office, other | 주거/상업/오피스/기타 |
| location | text | 예: "서울 성동구" |
| area_pyeong | numeric | 평수 |
| budget_range | enum: under_30m, 30m_50m, 50m_100m, over_100m, undisclosed | 예산대(3천만 미만 / 3천~5천만 / 5천만~1억 / 1억 이상 / 비공개) |
| duration_weeks | int, null | 공사 기간(주) |
| completed_on | date, null | 완공일 |
| summary | text | 목록 카드와 메타 설명 기본값 |
| body | text | 본문(문단 구분 일반 텍스트) |
| cover_image_id | uuid → project_images, null | 대표 사진 |
| before_image_id | uuid → project_images, null | Before 사진 |
| after_image_id | uuid → project_images, null | After 사진 |
| is_published | bool, 기본 false | |
| is_featured | bool, 기본 false | 홈 노출 |
| is_sample | bool, 기본 false | 샘플 콘텐츠 표시 |
| sort_order | int | 작을수록 앞 |
| seo_title, seo_description | text, null | 비우면 title, summary 사용 |

평형대는 `area_pyeong` 값으로 계산한다: 20평 미만 / 20~30평 / 30~40평 / 40평 이상.

**`project_images`**: project_id(→ projects, 사례 삭제 시 함께 삭제), storage_path, alt, width, height, sort_order

**`testimonials`**: project_id(null 허용), customer_label(예: "김○○ 고객님"), space_label(예: "32평 아파트"), rating(1~5), body, is_published, is_featured, is_sample, sort_order

**`faqs`**: question, answer, is_published, sort_order

**`banners`**: message, link_url(null 허용), starts_on(date), ends_on(date), is_active

**`inquiries`**
| 그룹 | 컬럼 |
|---|---|
| 1단계(필수) | name, phone, space_type(enum: residential, commercial, office, other), privacy_agreed_at |
| 2단계(선택) | email, region, area_pyeong, budget_range, desired_start(text), message |
| 관리 | status(enum: new, in_progress, done, spam, 기본 new), admin_memo |
| 유입 | utm_source, utm_medium, utm_campaign, referrer, landing_path |
| 보안 | detail_token_hash, detail_token_expires_at, ip_hash, notify_status(enum: pending, sent, failed, skipped) |

**`site_settings`**: 1행만 존재. 텍스트 컬럼(회사명, 대표자, 사업자등록번호, 주소, 전화, 이메일, 히어로 제목·부제, 혜택 문구, 소개 철학 문구, 대표 인사말, 인스타그램·블로그·카카오톡 채널 URL, 알림 메일, GA4 ID, 네이버·구글 인증 값), 이미지 경로(로고, 히어로 사진, 대표 사진), JSON 컬럼(`stats`: [{label, value, suffix}], `guarantees`: [{title, description}], `partners`: [{name, logo_path, url}]).

알림 메일, GA4 ID 등 일부 항목은 공개 페이지에 노출하지 않는다. 공개용 항목만 담은 뷰(`public_site_settings`)를 따로 둔다.

**`admins`**: user_id(→ auth.users)

### 3.2 파일 저장
- Supabase Storage 버킷 `media`: 공개 읽기, 쓰기·삭제는 관리자만.
- 경로 규칙: `projects/{project_id}/{uuid}.webp`, `settings/{uuid}.webp`, `partners/{uuid}.webp`
- 업로드 전 브라우저에서 긴 변 2560px 이하 WebP(품질 0.85)로 변환한다. 변환 후 10MB가 넘으면 거부한다.
- 사진이나 사례를 삭제하면 저장소 파일도 함께 지운다.

## 4. 보안

### 4.1 행 수준 권한(RLS)
| 대상 | 방문자(anon) | 관리자 |
|---|---|---|
| projects, project_images | 공개된 사례와 그 사진만 읽기 | 전체 읽기·쓰기 |
| testimonials, faqs | 공개된 항목만 읽기 | 전체 |
| banners | 활성 + 노출 기간 안만 읽기 | 전체 |
| public_site_settings | 읽기 | — |
| site_settings | 접근 불가 | 전체 |
| inquiries | **접근 불가** | 전체 |
| admins | 접근 불가 | 읽기 |

관리자 판정은 `auth.uid()`가 `admins`에 있는지로 한다(`is_admin()` 함수).

### 4.2 문의 접수
- 방문자 문의는 Next.js 서버 액션이 서비스 키로 저장한다. 서비스 키는 서버 환경변수에만 두며 클라이언트 번들에 들어가지 않는다.
- 2단계 저장: 1단계 접수 시 서버가 무작위 토큰을 만들어 방문자에게 돌려주고, DB에는 해시와 만료 시각(24시간)만 저장한다. 2단계 요청은 문의 ID와 토큰이 일치하고 만료 전일 때만 해당 문의 1건의 2단계 컬럼을 갱신한다. 2단계 저장 후 토큰은 폐기한다.
- 스팸 방어: 숨김 필드(값이 있으면 조용히 성공 응답만 하고 저장하지 않음), 폼 표시 후 3초 이내 제출 거부, 같은 IP 해시로 10분 내 5건 초과 거부. IP는 원문 대신 솔트를 붙인 해시로 저장한다.

### 4.3 관리자 인증
- Supabase Auth 이메일·비밀번호 로그인. 대시보드에서 공개 가입을 끈다.
- `/admin` 이하 모든 요청은 미들웨어에서 세션을 확인하고, 서버 액션마다 `is_admin`을 다시 확인한다.

## 5. 문의 접수 흐름

1. 첫 방문 때 UTM 3종, referrer, 첫 페이지 경로를 브라우저(sessionStorage)에 저장한다.
2. 1단계 제출 → 서버에서 zod 검증과 스팸 판정 → DB 저장(접수 확정).
3. 알림 메일 발송(Resend, 수신: 설정의 알림 메일). 결과를 `notify_status`에 기록한다. 실패해도 방문자 응답은 성공이다. API 키가 없으면 `skipped`.
4. 방문자 화면: "접수되었습니다. 영업일 기준 1일 안에 연락드립니다." + 2단계 상세 정보 입력 폼(선택).
5. 2단계 제출 → 토큰 검증 → 상세 컬럼 갱신 → 완료 메시지.
6. 분석 이벤트: `generate_lead`(1단계 완료), `inquiry_detail`(2단계 완료), `click_call`, `click_kakao`.

입력 규칙: 이름 1~30자, 연락처는 한국 전화번호 형식(숫자와 하이픈, 9~13자리), 메시지 최대 2000자, 개인정보 동의 필수.

## 6. 콘텐츠 갱신과 캐시
- 공개 페이지는 정적으로 생성하고 캐시한다.
- 관리자 저장 액션은 관련 경로를 즉시 재검증한다(사례 저장 → `/`, `/projects`, 해당 상세 / 설정 저장 → 전체 레이아웃).
- 배너 노출 기간이 날짜 경계에서 바뀌도록 공개 페이지는 1시간 주기 재검증도 병행한다.

## 7. 디자인

### 7.1 콘셉트: "틈 — 빛이 드는 여백"
사진이 주인공이고 UI는 절제한다. 넓은 여백과 1px 선, 큰 타이포그래피를 쓴다.

### 7.2 디자인 토큰
| 토큰 | 값 | 용도 |
|---|---|---|
| bg | #F7F5F2 | 바탕 |
| surface | #FFFFFF | 카드, 폼 |
| ink | #1F1E1C | 본문 글자 |
| muted | #6E6A64 | 보조 글자 |
| line | #E4E0DA | 구분선 |
| accent | #B8916A | 버튼, 강조선 |
| accent-ink | #8A6A4C | 밝은 바탕 위 강조 글자(명도 대비 4.5:1 이상) |

- 폰트: Pretendard(직접 호스팅). 영문 보조 표기는 대문자, 넓은 자간.
- 다크 모드는 지원하지 않는다(사진 위주 사이트로 밝은 톤 일관성 유지).

### 7.3 시그니처 모션
사진이 화면에 들어올 때 가운데의 가는 틈이 좌우로 벌어지며 드러난다(clip-path, 0.9초). `prefers-reduced-motion` 사용자에게는 모션 없이 바로 보인다.

### 7.4 반응형
모바일 우선. 기준 폭 360px / 768px / 1280px. 사례 그리드는 1열 / 2열 / 3열.

### 7.5 접근성
모든 사진에 대체 텍스트(관리자 입력, 비우면 사례 제목 사용), 키보드만으로 폼 작성·제출 가능, 포커스 표시, 폼 오류는 해당 필드 옆과 화면 낭독기에 함께 알림.

## 8. 검색 최적화(SEO)
- 페이지별 title·description·OG 이미지(사례는 대표 사진)
- `sitemap.xml`(공개 사례 포함), `robots.txt`(`/admin` 제외)
- 구조화 데이터: 홈·소개에 `LocalBusiness`(HomeAndConstructionBusiness), 사례 상세에 `CreativeWork`
- 네이버 서치어드바이저·구글 서치콘솔 인증 메타 태그(설정 값이 있을 때만 출력)
- 관리자 사례 제목 입력란에 "지역 + 평수 + 공간 유형" 작성 가이드 표시

## 9. 분석
- GA4: 설정에 측정 ID가 있으면 로드한다. 5절의 전환 이벤트를 보낸다.
- Vercel Analytics: 기본 활성.
- 관리자 유입 통계: `inquiries`의 utm_source(없으면 referrer 도메인, 둘 다 없으면 "직접") 기준 집계.

## 10. 기술 스택
| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js(App Router, TypeScript), 설치 시점 최신 안정판 고정 |
| 스타일 | Tailwind CSS |
| 폰트 | Pretendard |
| DB·인증·파일 | Supabase(서울 리전 ap-northeast-2), `@supabase/ssr` |
| 검증 | zod |
| 드래그 정렬 | dnd-kit |
| 메일 | Resend |
| 테스트 | Vitest, Playwright |
| 호스팅 | Vercel(함수 리전 icn1) |

### 10.1 환경변수
| 이름 | 위치 | 설명 |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | 공개 | |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | 공개 | |
| SUPABASE_SERVICE_ROLE_KEY | 서버 전용 | 문의 저장 |
| RESEND_API_KEY | 서버 전용 | 없으면 메일 생략 |
| MAIL_FROM | 서버 전용 | 발신 주소 |
| IP_HASH_SALT | 서버 전용 | |
| NEXT_PUBLIC_SITE_URL | 공개 | 절대 URL(OG, sitemap) |

## 11. 오류 처리
- 공개 페이지 데이터 조회 실패: 해당 섹션만 숨기고 페이지는 렌더링한다. 사례 상세에서 slug가 없거나 비공개면 404.
- 문의 저장 실패: 방문자에게 "일시적인 오류입니다. 전화로 연락 주세요"와 설정의 대표 전화번호를 보여주고 입력값은 유지한다.
- 관리자 저장 실패: 화면 상단에 오류 메시지, 입력값 유지.
- 사진 업로드 일부 실패: 성공한 파일은 유지하고 실패한 파일 목록과 재시도 버튼을 보여준다.
- 404, 500 전용 페이지 제공(상담 버튼 포함).

## 12. 샘플 콘텐츠
- 사례 6건(주거 3, 상업 2, 오피스 1), 후기 3건, FAQ 6건, 배너 1건, 실적 숫자 4개, 보증 3개.
- 사진은 Unsplash 라이선스 인테리어 사진을 쓰고 출처를 관리자 메모에 남긴다.
- 사례와 후기는 모두 `is_sample = true`. 대시보드에 "샘플 콘텐츠 N개 공개 중" 경고가 뜬다.
- 실적 숫자와 보증 문구는 "예시"임을 관리자 설정 화면에 표시하고, 운영 전환 전 실제 값으로 바꿔야 한다.

## 13. 테스트
- **단위(Vitest):** 문의 입력 검증, 스팸 판정(숨김 필드, 제출 시간, 빈도), 평형대 계산, 배너 노출 판정, slug 생성, 유입 채널 분류, 토큰 생성·검증
- **보안(실제 Supabase 대상):** anon 키로 ① inquiries 조회 ② inquiries 수정 ③ 비공개 사례 조회 ④ site_settings 조회 ⑤ media 업로드가 모두 거부되는지 확인
- **E2E(Playwright):** ① 1·2단계 문의 접수 → 관리자 목록에 표시 ② 관리자 로그인 → 사례 등록(사진 포함) → 공개 페이지 노출 ③ 비공개 전환 → 공개 페이지 404 ④ 비로그인 `/admin` 접근 → 로그인 화면으로 이동
- **품질:** 모바일 Lighthouse 성능·접근성·SEO 각 90 이상

## 14. 배포
1. Supabase 프로젝트 생성(NK 조직, 서울 리전) → 마이그레이션 적용 → 샘플 데이터 입력 → 공개 가입 비활성화
2. Vercel 프로젝트 생성(NK 팀, 함수 리전 icn1) → 환경변수 등록 → 배포
3. 작업과 미리보기 배포는 `claude/determined-brown-caf9fu` 브랜치에서 한다. 운영 반영(`main` 병합)은 승인 후 진행한다.
4. 관리자 첫 계정은 회사가 지정한 이메일로 발급한다.

### 14.1 운영 전환 전 확인 사항
- Vercel Hobby 요금제는 비상업적 용도 전용이므로 운영 전 Pro로 전환한다.
- Supabase 무료 요금제는 7일 비활성 시 일시정지되므로 운영 시 Pro를 권장한다.
- Resend 발신 주소를 회사 도메인으로 쓰려면 도메인 DNS 인증이 필요하다.
- 샘플 콘텐츠를 실제 콘텐츠로 교체하거나 비공개 처리한다.
- 개인정보처리방침의 회사 정보와 책임자를 실제 값으로 채운다.
