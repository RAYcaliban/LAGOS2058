-- 00023_wiki_revisions.sql
-- Version history for wiki pages, enabling canon approval of specific revisions

create table public.wiki_revisions (
  id uuid primary key default gen_random_uuid(),
  wiki_page_id uuid not null references public.wiki_pages(id) on delete cascade,
  title text not null,
  content text not null,
  edited_by uuid references public.profiles(id),
  revision_number integer not null default 1,
  created_at timestamptz not null default now()
);

create index idx_wiki_revisions_page on public.wiki_revisions(wiki_page_id, revision_number desc);

-- Track which specific revision was approved as canon
alter table public.wiki_pages add column if not exists approved_revision_id uuid references public.wiki_revisions(id);

-- RLS
alter table public.wiki_revisions enable row level security;

create policy "wiki_revisions_select"
  on public.wiki_revisions for select
  to authenticated
  using (true);

create policy "wiki_revisions_insert"
  on public.wiki_revisions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.wiki_pages wp
      where wp.id = wiki_page_id
      and (
        (wp.party_id = public.my_party_id() and wp.page_type in ('party', 'character'))
        or public.is_gm_or_admin()
      )
    )
  );
