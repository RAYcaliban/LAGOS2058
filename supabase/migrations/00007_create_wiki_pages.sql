-- 00007_create_wiki_pages.sql
-- Wiki pages for party lore, characters, events, and general game lore

create table public.wiki_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  content text not null default '',
  party_id uuid references public.parties(id),
  page_type text not null default 'general'
    check (page_type in ('party', 'character', 'event', 'lore', 'general')),
  last_edited_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wiki_pages enable row level security;
