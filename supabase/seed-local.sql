-- 로컬 개발·테스트 전용 시드. 운영 DB에 넣지 않는다.

-- 로컬 관리자: admin@teum.local / teum-local-admin-1!
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'admin@teum.local',
  extensions.crypt('teum-local-admin-1!', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '', '', '', ''
);

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  jsonb_build_object('sub', 'a0000000-0000-4000-8000-000000000001', 'email', 'admin@teum.local', 'email_verified', true),
  'email',
  now(),
  now(),
  now()
);

insert into public.admins (user_id) values ('a0000000-0000-4000-8000-000000000001');

-- 문의 RPC 비밀값(.env.test의 INQUIRY_RPC_SECRET과 같아야 한다)
insert into private.app_config (key, value) values ('inquiry_rpc_secret', 'local-inquiry-secret');

-- 사이트 설정 1행(sample-content.sql이 먼저 채웠으면 그대로 둔다)
insert into public.site_settings (id) values (1) on conflict (id) do nothing;
