-- 00009_rls_policies.sql
-- Row Level Security policies for all tables
-- Key principle: players see only their own party's sensitive data;
-- GMs and admins have elevated access.

-- ============================================================
-- Helper: check if the current user is a GM or admin
-- ============================================================
create or replace function public.is_gm_or_admin()
returns bool as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('gm', 'admin')
  );
$$ language sql security definer stable;

-- Helper: get current user's party_id
create or replace function public.my_party_id()
returns uuid as $$
  select party_id from public.profiles
  where id = auth.uid();
$$ language sql security definer stable;


-- ============================================================
-- PROFILES
-- ============================================================
-- All authenticated users can read all profiles
create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can insert their own profile (during registration)
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Users can update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());


-- ============================================================
-- PARTIES
-- ============================================================
-- All authenticated users can read parties
create policy "parties_select"
  on public.parties for select
  to authenticated
  using (true);

-- Authenticated users can create a party (during registration)
create policy "parties_insert"
  on public.parties for insert
  to authenticated
  with check (true);

-- Only members of a party can update it
create policy "parties_update_member"
  on public.parties for update
  to authenticated
  using (id = public.my_party_id())
  with check (id = public.my_party_id());


-- ============================================================
-- GAME_STATE
-- ============================================================
-- All authenticated users can read game state
create policy "game_state_select"
  on public.game_state for select
  to authenticated
  using (true);

-- Only GM/admin can insert game state
create policy "game_state_insert_gm"
  on public.game_state for insert
  to authenticated
  with check (public.is_gm_or_admin());

-- Only GM/admin can update game state
create policy "game_state_update_gm"
  on public.game_state for update
  to authenticated
  using (public.is_gm_or_admin())
  with check (public.is_gm_or_admin());


-- ============================================================
-- PARTY_STATE  (CRITICAL — own party only for players)
-- ============================================================
-- Players can only read their own party's state; GM/admin can read all
create policy "party_state_select"
  on public.party_state for select
  to authenticated
  using (
    party_id = public.my_party_id()
    or public.is_gm_or_admin()
  );

-- Only GM/admin can insert party state rows
create policy "party_state_insert_gm"
  on public.party_state for insert
  to authenticated
  with check (public.is_gm_or_admin());

-- Only GM/admin can update party state
create policy "party_state_update_gm"
  on public.party_state for update
  to authenticated
  using (public.is_gm_or_admin())
  with check (public.is_gm_or_admin());


-- ============================================================
-- ACTION_SUBMISSIONS
-- ============================================================
-- Players read own party's submissions; GM/admin reads all
create policy "action_submissions_select"
  on public.action_submissions for select
  to authenticated
  using (
    party_id = public.my_party_id()
    or public.is_gm_or_admin()
  );

-- Players insert submissions for own party only
create policy "action_submissions_insert"
  on public.action_submissions for insert
  to authenticated
  with check (
    party_id = public.my_party_id()
  );

-- Players update own party's submissions (e.g. draft -> submitted);
-- GM/admin can update any
create policy "action_submissions_update"
  on public.action_submissions for update
  to authenticated
  using (
    party_id = public.my_party_id()
    or public.is_gm_or_admin()
  )
  with check (
    party_id = public.my_party_id()
    or public.is_gm_or_admin()
  );


-- ============================================================
-- FORUM_POSTS
-- ============================================================
-- All authenticated users can read all posts
create policy "forum_posts_select"
  on public.forum_posts for select
  to authenticated
  using (true);

-- Authenticated users can create posts
create policy "forum_posts_insert"
  on public.forum_posts for insert
  to authenticated
  with check (author_id = auth.uid());

-- Author can update own posts; GM/admin can update any
create policy "forum_posts_update"
  on public.forum_posts for update
  to authenticated
  using (
    author_id = auth.uid()
    or public.is_gm_or_admin()
  )
  with check (
    author_id = auth.uid()
    or public.is_gm_or_admin()
  );


-- ============================================================
-- WIKI_PAGES
-- ============================================================
-- All authenticated users can read all wiki pages
create policy "wiki_pages_select"
  on public.wiki_pages for select
  to authenticated
  using (true);

-- Party owner can update their party/character pages;
-- GM/admin can update any page
create policy "wiki_pages_update"
  on public.wiki_pages for update
  to authenticated
  using (
    (party_id = public.my_party_id() and page_type in ('party', 'character'))
    or public.is_gm_or_admin()
  )
  with check (
    (party_id = public.my_party_id() and page_type in ('party', 'character'))
    or public.is_gm_or_admin()
  );

-- GM/admin can insert wiki pages; party members can insert for their party
create policy "wiki_pages_insert"
  on public.wiki_pages for insert
  to authenticated
  with check (
    (party_id = public.my_party_id() and page_type in ('party', 'character'))
    or public.is_gm_or_admin()
  );


-- ============================================================
-- GAME_CONFIG
-- ============================================================
-- All authenticated users can read config
create policy "game_config_select"
  on public.game_config for select
  to authenticated
  using (true);

-- Only GM/admin can insert config
create policy "game_config_insert_gm"
  on public.game_config for insert
  to authenticated
  with check (public.is_gm_or_admin());

-- Only GM/admin can update config
create policy "game_config_update_gm"
  on public.game_config for update
  to authenticated
  using (public.is_gm_or_admin())
  with check (public.is_gm_or_admin());
