-- 관리자 판정, 테이블 권한, RLS 정책, 비공개 설정, 문의 RPC.
-- Supabase 기본 권한(새 테이블·함수를 anon/authenticated에 노출)에 기대지 않고 모두 명시한다.

-- 비공개 스키마 -------------------------------------------------------------
create schema private;
revoke all on schema private from public, anon, authenticated;

create table private.app_config (
  key text primary key,
  value text not null
);
alter table private.app_config enable row level security;
revoke all on table private.app_config from public, anon, authenticated;

-- 문의 RPC 비밀값 확인. 일치하지 않으면 'forbidden'.
-- security definer인 문의 RPC 안에서만 호출된다(호출자는 함수 소유자 권한으로 실행 중).
create function private.assert_inquiry_secret(p_secret text)
returns void
language plpgsql
stable
set search_path = ''
as $$
declare
  v_expected text;
begin
  select c.value into v_expected from private.app_config c where c.key = 'inquiry_rpc_secret';
  if v_expected is null or p_secret is null or p_secret <> v_expected then
    raise exception 'forbidden';
  end if;
end;
$$;
revoke all on function private.assert_inquiry_secret(text) from public, anon, authenticated;

-- 관리자 판정 ---------------------------------------------------------------
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

revoke all on function public.set_updated_at() from public, anon, authenticated;

-- 테이블 권한 ---------------------------------------------------------------
-- 먼저 전부 회수하고 필요한 것만 다시 준다. 실제 행 접근은 아래 RLS 정책이 가른다.
revoke all on table
  public.projects, public.project_images, public.testimonials, public.faqs, public.banners,
  public.inquiries, public.site_settings, public.admins, public.public_site_settings
from public, anon, authenticated;

-- 공개 콘텐츠: 방문자 읽기, 관리자 쓰기
grant select on table
  public.projects, public.project_images, public.testimonials, public.faqs, public.banners
to anon;
grant select, insert, update, delete on table
  public.projects, public.project_images, public.testimonials, public.faqs, public.banners
to authenticated;

-- 공개용 설정 뷰만 방문자에게
grant select on table public.public_site_settings to anon, authenticated;

-- 관리자 전용
grant select, insert, update, delete on table public.site_settings to authenticated;
grant select, update, delete on table public.inquiries to authenticated;
grant select on table public.admins to authenticated;

-- RLS 정책 ------------------------------------------------------------------
-- projects
create policy "projects: public reads published" on public.projects
  for select to anon, authenticated
  using (is_published);
create policy "projects: admin all" on public.projects
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- project_images: 부모 사례가 공개일 때만
create policy "project_images: public reads published" on public.project_images
  for select to anon, authenticated
  using (exists (
    select 1 from public.projects p where p.id = project_images.project_id and p.is_published
  ));
create policy "project_images: admin all" on public.project_images
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- testimonials
create policy "testimonials: public reads published" on public.testimonials
  for select to anon, authenticated
  using (is_published);
create policy "testimonials: admin all" on public.testimonials
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- faqs
create policy "faqs: public reads published" on public.faqs
  for select to anon, authenticated
  using (is_published);
create policy "faqs: admin all" on public.faqs
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- banners: 활성 + 노출 기간(서울 날짜 기준) 안
create policy "banners: public reads active in period" on public.banners
  for select to anon, authenticated
  using (
    is_active
    and starts_on <= (now() at time zone 'Asia/Seoul')::date
    and ends_on >= (now() at time zone 'Asia/Seoul')::date
  );
create policy "banners: admin all" on public.banners
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- site_settings: 관리자만(방문자는 public_site_settings 뷰로)
create policy "site_settings: admin all" on public.site_settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- inquiries: 관리자만. 방문자 접수는 아래 RPC로만.
create policy "inquiries: admin all" on public.inquiries
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- admins: 관리자 읽기만. 쓰기는 API로 하지 않는다.
create policy "admins: admin reads" on public.admins
  for select to authenticated
  using (public.is_admin());

-- 문의 RPC ------------------------------------------------------------------
-- 1단계 접수. 같은 ip_hash로 최근 10분 5건 이상이면 거부.
-- 새 문의 id와 알림 메일 수신 주소를 한 행으로 돌려준다.
create function public.submit_inquiry_step1(
  p_secret text,
  p_name text,
  p_phone text,
  p_space_type text,
  p_ip_hash text,
  p_token_hash text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_referrer text,
  p_landing_path text
)
returns table (id uuid, notify_email text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_id uuid;
  v_recent int;
begin
  perform private.assert_inquiry_secret(p_secret);

  -- 같은 ip_hash의 동시 요청을 줄 세워 한도를 넘지 않게 한다.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('submit_inquiry_step1:' || coalesce(p_ip_hash, '')));

  select count(*) into v_recent
  from public.inquiries i
  where i.ip_hash = p_ip_hash
    and i.created_at > now() - interval '10 minutes';
  if v_recent >= 5 then
    raise exception 'rate_limited';
  end if;

  insert into public.inquiries as i (
    name, phone, space_type, privacy_agreed_at,
    utm_source, utm_medium, utm_campaign, referrer, landing_path,
    detail_token_hash, detail_token_expires_at, ip_hash, notify_status
  ) values (
    p_name, p_phone, p_space_type, now(),
    p_utm_source, p_utm_medium, p_utm_campaign, p_referrer, p_landing_path,
    p_token_hash, now() + interval '24 hours', p_ip_hash, 'pending'
  )
  returning i.id into v_id;

  return query
    select v_id, (select s.notify_email from public.site_settings s where s.id = 1);
end;
$$;

-- 2단계 저장. id·토큰 해시 일치 + 만료 전일 때만 갱신하고 토큰을 폐기한다.
create function public.submit_inquiry_step2(
  p_secret text,
  p_id uuid,
  p_token_hash text,
  p_email text,
  p_region text,
  p_area_pyeong numeric,
  p_budget_range text,
  p_desired_start text,
  p_message text
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  perform private.assert_inquiry_secret(p_secret);

  update public.inquiries i
  set email = p_email,
      region = p_region,
      area_pyeong = p_area_pyeong,
      budget_range = p_budget_range,
      desired_start = p_desired_start,
      message = p_message,
      detail_token_hash = null
  where i.id = p_id
    and i.detail_token_hash = p_token_hash
    and i.detail_token_expires_at > now();

  get diagnostics v_count = row_count;
  return v_count = 1;
end;
$$;

-- 알림 메일 발송 결과 기록.
create function public.set_inquiry_notify_status(p_secret text, p_id uuid, p_status text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  perform private.assert_inquiry_secret(p_secret);

  update public.inquiries i
  set notify_status = p_status
  where i.id = p_id;
end;
$$;

revoke all on function public.submit_inquiry_step1(text, text, text, text, text, text, text, text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.submit_inquiry_step2(text, uuid, text, text, text, numeric, text, text, text)
  from public, anon, authenticated;
revoke all on function public.set_inquiry_notify_status(text, uuid, text)
  from public, anon, authenticated;

grant execute on function public.submit_inquiry_step1(text, text, text, text, text, text, text, text, text, text, text)
  to anon, authenticated;
grant execute on function public.submit_inquiry_step2(text, uuid, text, text, text, numeric, text, text, text)
  to anon, authenticated;
grant execute on function public.set_inquiry_notify_status(text, uuid, text)
  to anon, authenticated;
