-- 00014_character_party_rework.sql
-- Adds character fields to profiles, party ownership, and updated RLS policies.

-- ============================================================
-- 1. Character fields on profiles
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS character_name text,
  ADD COLUMN IF NOT EXISTS ethnicity text,
  ADD COLUMN IF NOT EXISTS religion text,
  ADD COLUMN IF NOT EXISTS bio text;

-- ============================================================
-- 2. Party ownership
-- ============================================================
ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id);

-- Backfill existing parties: first member by created_at becomes owner
UPDATE public.parties p SET owner_id = (
  SELECT pr.id FROM public.profiles pr
  WHERE pr.party_id = p.id ORDER BY pr.created_at ASC LIMIT 1
) WHERE p.owner_id IS NULL;

-- Make leader_name nullable (auto-derived from owner going forward)
ALTER TABLE public.parties ALTER COLUMN leader_name DROP NOT NULL;

-- ============================================================
-- 3. Helper function: is current user the owner of their party?
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_party_owner()
RETURNS bool AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parties
    WHERE owner_id = auth.uid() AND id = public.my_party_id()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 4. RLS: party update → owner only (replaces member-level)
-- ============================================================
DROP POLICY IF EXISTS "parties_update_member" ON public.parties;
CREATE POLICY "parties_update_owner" ON public.parties FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ============================================================
-- 5. RLS: action_submissions insert/update → owner only (or GM)
-- ============================================================
DROP POLICY IF EXISTS "action_submissions_insert" ON public.action_submissions;
CREATE POLICY "action_submissions_insert_owner" ON public.action_submissions FOR INSERT
  TO authenticated
  WITH CHECK (party_id = public.my_party_id() AND public.is_party_owner());

DROP POLICY IF EXISTS "action_submissions_update" ON public.action_submissions;
CREATE POLICY "action_submissions_update_owner" ON public.action_submissions FOR UPDATE
  TO authenticated
  USING ((party_id = public.my_party_id() AND public.is_party_owner()) OR public.is_gm_or_admin())
  WITH CHECK ((party_id = public.my_party_id() AND public.is_party_owner()) OR public.is_gm_or_admin());
