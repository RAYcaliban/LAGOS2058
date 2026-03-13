-- 00006_create_forum_posts.sql
-- Forum / NairaTwitter posts with threading support

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  parent_id uuid references public.forum_posts(id),
  title text,
  content text not null,
  category text not null default 'general'
    check (category in ('general', 'news', 'strategy', 'roleplay', 'gm_announcement')),
  is_gm_post bool not null default false,
  pinned bool not null default false,
  created_at timestamptz not null default now()
);

alter table public.forum_posts enable row level security;
