-- 00010_storage_buckets.sql
-- Storage bucket for GeoJSON files (Nigeria LGA boundaries, etc.)

insert into storage.buckets (id, name, public)
values ('geojson', 'geojson', true);

-- Public read access for the geojson bucket
create policy "geojson_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'geojson');

-- GM/admin can upload to geojson bucket
create policy "geojson_upload_gm"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'geojson'
    and public.is_gm_or_admin()
  );

-- GM/admin can update files in geojson bucket
create policy "geojson_update_gm"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'geojson'
    and public.is_gm_or_admin()
  )
  with check (
    bucket_id = 'geojson'
    and public.is_gm_or_admin()
  );

-- GM/admin can delete files in geojson bucket
create policy "geojson_delete_gm"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'geojson'
    and public.is_gm_or_admin()
  );
