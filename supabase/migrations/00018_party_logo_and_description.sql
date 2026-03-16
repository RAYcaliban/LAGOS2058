-- 00018_party_logo_and_description.sql
-- Add description and logo to parties; create party-logos storage bucket

alter table public.parties
  add column description text,
  add column logo_url text;

-- Public bucket for party logos
insert into storage.buckets (id, name, public)
values ('party-logos', 'party-logos', true);

-- Anyone can read party logos
create policy "party_logos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'party-logos');

-- Party owners can upload their own logo (file path starts with their user id)
create policy "party_logos_upload_owner"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'party-logos'
    and (storage.filename(name) like auth.uid()::text || '-%')
  );

-- Party owners can replace their own logo
create policy "party_logos_update_owner"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'party-logos'
    and (storage.filename(name) like auth.uid()::text || '-%')
  )
  with check (
    bucket_id = 'party-logos'
    and (storage.filename(name) like auth.uid()::text || '-%')
  );

-- Party owners can delete their own logo
create policy "party_logos_delete_owner"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'party-logos'
    and (storage.filename(name) like auth.uid()::text || '-%')
  );

-- GMs can manage all party logos
create policy "party_logos_manage_gm"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'party-logos'
    and public.is_gm_or_admin()
  )
  with check (
    bucket_id = 'party-logos'
    and public.is_gm_or_admin()
  );
