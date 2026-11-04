-- 테이블, 제약, updated_at 트리거, 공개용 뷰.
-- 권한(grant/revoke)과 RLS 정책은 20261104000002_security.sql에서 정한다.

-- updated_at 자동 갱신 -------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- projects ----------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('residential', 'commercial', 'office', 'other')),
  location text not null default '',
  area_pyeong numeric check (area_pyeong > 0),
  budget_range text not null default 'undisclosed'
    check (budget_range in ('under_30m', '30m_50m', '50m_100m', 'over_100m', 'undisclosed')),
  duration_weeks int check (duration_weeks > 0),
  completed_on date,
  summary text not null default '',
  body text not null default '',
  cover_image_id uuid,
  before_image_id uuid,
  after_image_id uuid,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  is_sample boolean not null default false,
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- project_images ----------------------------------------------------------
create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  storage_path text not null,
  alt text not null default '',
  width int not null check (width > 0),
  height int not null check (height > 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_images_project_id_idx on public.project_images (project_id, sort_order);

-- 지정 사진을 지우면 지정만 해제된다.
alter table public.projects
  add constraint projects_cover_image_id_fkey
    foreign key (cover_image_id) references public.project_images (id) on delete set null,
  add constraint projects_before_image_id_fkey
    foreign key (before_image_id) references public.project_images (id) on delete set null,
  add constraint projects_after_image_id_fkey
    foreign key (after_image_id) references public.project_images (id) on delete set null;

-- testimonials ------------------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete set null,
  customer_label text not null,
  space_label text not null default '',
  rating int not null check (rating between 1 and 5),
  body text not null,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  is_sample boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- faqs --------------------------------------------------------------------
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- banners -----------------------------------------------------------------
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  link_url text,
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

-- inquiries ---------------------------------------------------------------
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  -- 1단계(필수)
  name text not null check (char_length(name) between 1 and 30),
  phone text not null check (char_length(phone) between 9 and 13),
  space_type text not null check (space_type in ('residential', 'commercial', 'office', 'other')),
  privacy_agreed_at timestamptz not null,
  -- 2단계(선택)
  email text,
  region text,
  area_pyeong numeric check (area_pyeong > 0),
  budget_range text
    check (budget_range in ('under_30m', '30m_50m', '50m_100m', 'over_100m', 'undisclosed')),
  desired_start text,
  message text check (char_length(message) <= 2000),
  -- 관리
  status text not null default 'new' check (status in ('new', 'in_progress', 'done', 'spam')),
  admin_memo text check (char_length(admin_memo) <= 5000),
  -- 유입
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  landing_path text,
  -- 보안
  detail_token_hash text,
  detail_token_expires_at timestamptz,
  ip_hash text not null,
  notify_status text not null default 'pending'
    check (notify_status in ('pending', 'sent', 'failed', 'skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_ip_hash_created_at_idx on public.inquiries (ip_hash, created_at);
create index inquiries_created_at_idx on public.inquiries (created_at desc);

-- site_settings (1행) ------------------------------------------------------
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default '',
  ceo_name text not null default '',
  business_number text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  hero_title text not null default '',
  hero_subtitle text not null default '',
  benefit_text text not null default '',
  philosophy_text text not null default '',
  ceo_greeting text not null default '',
  instagram_url text not null default '',
  blog_url text not null default '',
  kakao_channel_url text not null default '',
  notify_email text not null default '',
  ga4_id text not null default '',
  naver_site_verification text not null default '',
  google_site_verification text not null default '',
  logo_path text,
  hero_image_path text,
  ceo_image_path text,
  stats jsonb not null default '[]' check (jsonb_typeof(stats) = 'array'),
  guarantees jsonb not null default '[]' check (jsonb_typeof(guarantees) = 'array'),
  partners jsonb not null default '[]' check (jsonb_typeof(partners) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 공개용 설정 뷰: notify_email만 뺀다. 컬럼을 명시해 새 컬럼이 자동 노출되지 않게 한다.
-- security_invoker = false: 뷰 소유자 권한으로 읽으므로 방문자는 site_settings 자체에 접근하지 못해도 이 뷰는 읽는다.
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
  updated_at
from public.site_settings;

-- admins ------------------------------------------------------------------
create table public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 트리거 ---------------------------------------------------------
create trigger set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.project_images
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.faqs
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.banners
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.inquiries
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.admins
  for each row execute function public.set_updated_at();

-- RLS는 테이블을 만들자마자 켠다(정책이 생기기 전까지는 전부 거부). 정책은 다음 마이그레이션에서.
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.banners enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_settings enable row level security;
alter table public.admins enable row level security;
