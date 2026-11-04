-- 사이트 설정 1행은 샘플 콘텐츠 없이 운영 DB에 올려도 항상 있어야 한다.
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- 문의 RPC 비밀값이 빈 문자열로 저장돼 있으면 빈 비밀값으로도 통과하던 문제를 막는다.
-- 시그니처·권한은 20261104000002_security.sql 과 같다.
create or replace function private.assert_inquiry_secret(p_secret text)
returns void
language plpgsql
stable
set search_path = ''
as $$
declare
  v_expected text;
begin
  select c.value into v_expected from private.app_config c where c.key = 'inquiry_rpc_secret';
  if v_expected is null or v_expected = '' or p_secret is null or p_secret <> v_expected then
    raise exception 'forbidden';
  end if;
end;
$$;
revoke all on function private.assert_inquiry_secret(text) from public, anon, authenticated;
