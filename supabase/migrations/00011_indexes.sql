-- 00011_indexes.sql
-- Performance indexes for common query patterns

-- party_state: fast lookup by party + turn (most frequent query)
create index idx_party_state_party_turn
  on public.party_state (party_id, turn);

-- game_state: fast lookup by turn
create index idx_game_state_turn
  on public.game_state (turn);

-- action_submissions: filter by turn + party (turn resolution)
create index idx_action_submissions_turn_party
  on public.action_submissions (turn, party_id);

-- action_submissions: filter by party + status (dashboard views)
create index idx_action_submissions_party_status
  on public.action_submissions (party_id, status);

-- forum_posts: chronological feed
create index idx_forum_posts_created_at
  on public.forum_posts (created_at desc);

-- forum_posts: thread lookups
create index idx_forum_posts_parent
  on public.forum_posts (parent_id);

-- wiki_pages: slug-based routing
create index idx_wiki_pages_slug
  on public.wiki_pages (slug);

-- wiki_pages: party-specific pages
create index idx_wiki_pages_party
  on public.wiki_pages (party_id);
