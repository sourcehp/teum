-- 홈 각 섹션의 제목(소제목)과 진행 절차 내용을 어드민에서 고칠 수 있게 한다.
-- 영문 eyebrow 태그(PROJECTS, REVIEWS 등)는 디자인 요소로 보고 코드에 그대로 둔다.
alter table public.site_settings
  add column section_title_projects text not null default '최근 시공 사례',
  add column section_title_before_after text not null default '같은 공간, 달라진 하루',
  add column section_title_visual text not null default '공간을 넘어, 브랜드까지',
  add column section_title_testimonials text not null default '함께한 분들의 이야기',
  add column section_title_process text not null default '상담에서 사후관리까지, 여섯 단계',
  add column section_title_faq text not null default '자주 묻는 질문',
  add column section_title_guarantees text not null default '틈 없이 지키는 약속',
  add column process_steps jsonb not null default '[
    {"title": "상담", "description": "전화나 방문으로 원하는 공간과 예산, 일정을 듣습니다. 상담은 무료입니다."},
    {"title": "실측", "description": "현장을 직접 방문해 치수와 상태를 확인하고 구조와 설비를 점검합니다."},
    {"title": "설계", "description": "생활 방식에 맞춰 평면과 디자인을 제안하고, 마감재와 조명을 함께 정합니다."},
    {"title": "견적", "description": "공정별로 항목을 나눈 확정 견적서를 드립니다. 계약 범위가 같으면 추가 비용은 없습니다."},
    {"title": "시공", "description": "전담 현장 책임자가 일정을 관리하고, 공정마다 사진으로 진행 상황을 공유합니다."},
    {"title": "사후관리", "description": "준공 후에도 하자 접수를 받아 약속한 기간 안에 방문해 보수합니다."}
  ]'::jsonb check (jsonb_typeof(process_steps) = 'array');

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
  section_title_projects,
  section_title_before_after,
  section_title_visual,
  section_title_testimonials,
  section_title_process,
  section_title_faq,
  section_title_guarantees,
  process_steps,
  updated_at
from public.site_settings;

-- 뷰를 지웠다 다시 만들면 권한도 함께 사라진다. 20261104000002_security.sql과 같은 권한을 다시 준다.
revoke all on table public.public_site_settings from public, anon, authenticated;
grant select on table public.public_site_settings to anon, authenticated;
