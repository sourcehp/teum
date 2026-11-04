-- 시각 디자인(BI·로고) 포트폴리오. 공간 인테리어와 별개 목록이라 site_settings의
-- stats/guarantees/partners와 같은 방식(JSON 배열 컬럼)으로 둔다 — 새 테이블·RLS 없이
-- 기존 관리자 설정 화면 패턴을 그대로 재사용한다.
alter table public.site_settings
  add column visual_works jsonb not null default '[]' check (jsonb_typeof(visual_works) = 'array');

-- 공개용 뷰도 함께 노출한다(개인정보 아님).
drop view public.public_site_settings;
create view public.public_site_settings
with (security_invoker = false)
as
select
  id,
  company_name,
  ceo_name,
  business_number,
  address,
  phone,
  email,
  hero_title,
  hero_subtitle,
  benefit_text,
  philosophy_text,
  ceo_greeting,
  instagram_url,
  blog_url,
  kakao_channel_url,
  ga4_id,
  naver_site_verification,
  google_site_verification,
  logo_path,
  hero_image_path,
  ceo_image_path,
  stats,
  guarantees,
  partners,
  visual_works,
  updated_at
from public.site_settings;

-- 뷰를 지웠다 다시 만들면 권한도 함께 사라진다. 20261104000002_security.sql과 같은 권한을 다시 준다.
revoke all on table public.public_site_settings from public, anon, authenticated;
grant select on table public.public_site_settings to anon, authenticated;
