-- media 버킷: 공개 읽기(공개 URL), 쓰기·삭제는 관리자만.
-- 업로드는 브라우저에서 WebP로 변환하고 10MB를 넘으면 거부한다(기획서 3.2). 서버에서도 같은 한도를 건다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 공개 버킷 파일은 공개 URL로 읽으므로 방문자 select 정책은 두지 않는다(목록 조회 차단).
-- 관리자 select는 덮어쓰기·삭제(삭제 대상 행을 읽어야 함)와 목록 조회에 필요하다.
create policy "media: admin select" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_admin());

create policy "media: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "media: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "media: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
