-- RLS remediation, phase 1: close everything reachable with the public anon key.
--
-- Requires no app changes - safe to push ahead of any PR. See the RLS remediation plan and
-- supabase/snippets/rls_check.sql for the reasoning and the verification harness. Baseline run
-- before this migration: 23/40 harness assertions failing, all matching the findings below.
--
-- Highest-risk statement in this file is part 8 (the access-token hook). A mistake there locks
-- every user out of every staff-gated policy, since the hook is what injects app_metadata.role
-- into the JWT. Test login on a fresh `npm run db:reset` before pushing this to production, and
-- have a staff member log in within 60 seconds of the production push.

BEGIN;

-- ─── 1. Role helpers ──────────────────────────────────────────────────────────
--
-- JWT-only, not a `users` lookup: custom_access_token_hook reads public.users during token
-- issuance, so a policy on `users` that queried `users` would recurse and lock out login itself.
-- These read no table, so they are safe on every table including `users` and `user_profiles`.
-- Cost is staleness until the next token refresh (useUser.getUserData refreshes on every page
-- load), which ~20 pre-existing policies already accept.
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SET search_path = ''
AS $$ SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'staff', false) $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SET search_path = ''
AS $$ SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) $$;

-- user_profiles.title is not in the JWT, so this one must read tables - SECURITY DEFINER so it
-- doesn't depend on the caller's own user_profiles visibility. Use ONLY on vocation and
-- vocation_checkins - never on users or user_profiles (defeats the point of the JWT-only rule
-- above, and user_profiles RLS could change independently of this function later).
CREATE OR REPLACE FUNCTION public.is_vocation_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.user_profiles up ON up.id = u.id
    WHERE u.id = auth.uid()
      AND u.role = 'staff'::public.user_role
      AND up.title ILIKE '%תעסוקה%'
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_vocation_staff() TO anon, authenticated, service_role;

-- ─── 2. anon may read, never write, anywhere in public ───────────────────────
--
-- The anon key ships in the browser bundle and the repo is public. Nothing in the app ever
-- writes as anon (login goes straight to GoTrue). Confirmed exploitable at baseline: harness
-- case A9 (anon INSERT into vocation) currently succeeds.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE ON TABLES FROM authenticated;

-- ─── 3. vocation + vocation_checkins ──────────────────────────────────────────
--
-- Reverses 20260527000002_vocation_disable_rls.sql. Root cause of the May disable: the original
-- policies (below, being replaced) gave students SELECT-own but no UPDATE, and something assumed
-- students needed to update their own row - useVocation.updateJob turns out to be dead code
-- (grep finds only its own definition), so no student-UPDATE policy is needed here.
--
-- Baseline confirms this is currently wide open, not just to anon: harness case C3 (student
-- updates their own vocation row) and H2 (an ORDINARY, non-vocation staff member updates ANY
-- vocation row) both currently succeed, because RLS is off and grants are wide.
DROP POLICY IF EXISTS "students_read_own_vocation"       ON public.vocation;
DROP POLICY IF EXISTS "vocation_staff_read_all"          ON public.vocation;
DROP POLICY IF EXISTS "vocation_staff_insert"            ON public.vocation;
DROP POLICY IF EXISTS "vocation_staff_update"             ON public.vocation;
DROP POLICY IF EXISTS "students_manage_own_checkins"     ON public.vocation_checkins;
DROP POLICY IF EXISTS "vocation_staff_read_all_checkins" ON public.vocation_checkins;

REVOKE ALL ON TABLE public.vocation, public.vocation_checkins FROM anon;

ALTER TABLE public.vocation          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocation_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vocation student read own" ON public.vocation
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "vocation staff manage" ON public.vocation
  FOR ALL TO authenticated
  USING      ((SELECT public.is_vocation_staff()) OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_vocation_staff()) OR (SELECT public.is_admin()));

-- Students own their check-ins outright. `OR is_staff()` in WITH CHECK is the impersonation
-- escape hatch (staff acting on a student's behalf send payloads stamped with the student's id).
CREATE POLICY "checkins student manage own" ON public.vocation_checkins
  FOR ALL TO authenticated
  USING      (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR (SELECT public.is_staff()));

CREATE POLICY "checkins vocation staff manage" ON public.vocation_checkins
  FOR ALL TO authenticated
  USING      ((SELECT public.is_vocation_staff()) OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_vocation_staff()) OR (SELECT public.is_admin()));

-- ─── 4. event_participants (RLS was never enabled) ────────────────────────────
--
-- get_user_events (SECURITY INVOKER) never touches this table - the only reader is
-- get_user_recurring_events, which is SECURITY DEFINER - so schedules are unaffected by enabling
-- RLS here. Confirmed via pg_proc during planning. The app's only direct access is
-- INSERT/DELETE from useEvents.js (addEvent, saveEvent, deleteEvent).
REVOKE ALL ON TABLE public.event_participants FROM anon;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_participants read own or own event" ON public.event_participants
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (SELECT public.is_staff())
    OR EXISTS (SELECT 1 FROM public.events e
               WHERE e.id = event_participants.event_id AND e.created_by = auth.uid())
  );

CREATE POLICY "event_participants managed by event owner" ON public.event_participants
  FOR ALL TO authenticated
  USING (
    (SELECT public.is_staff())
    OR EXISTS (SELECT 1 FROM public.events e
               WHERE e.id = event_participants.event_id AND e.created_by = auth.uid())
  )
  WITH CHECK (
    (SELECT public.is_staff())
    OR EXISTS (SELECT 1 FROM public.events e
               WHERE e.id = event_participants.event_id AND e.created_by = auth.uid())
  );

-- ─── 5. Views ─────────────────────────────────────────────────────────────────
--
-- None of these had security_invoker set, so all ran as owner and bypassed base-table RLS
-- entirely - the previously-undocumented hole. Confirmed at baseline: anon reads
-- report_cards_public (case A5) and audit_log_readable (case A6); an authenticated student reads
-- ANOTHER student's report_cards_public row (case F2), while report_cards_private correctly
-- denies the same read (case F3) - proving the view is the only broken layer.

-- No app code reads either audit view (grep confirms zero call sites). They completely bypassed
-- the admin-only audit_log policies, so revoke is strictly stronger than security_invoker here
-- and costs nothing.
REVOKE ALL ON TABLE public.audit_log_readable, public.audit_log_simple FROM anon, authenticated;
ALTER VIEW public.audit_log_readable SET (security_invoker = on);
ALTER VIEW public.audit_log_simple   SET (security_invoker = on);

-- report_cards_public: security_invoker (not revoke) - staff and students both legitimately read
-- it; the underlying report_cards_private / users / projects / research policies then do the
-- real work. Exposed public.report_cards_public also selects from public.staff_public, which
-- stays security-definer (see below), so nested views keep their own security context and this
-- does not need a matching grant beyond the SELECT authenticated already has.
ALTER VIEW public.report_cards_public SET (security_invoker = on);
REVOKE ALL ON TABLE public.report_cards_public FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.report_cards_public FROM authenticated;
GRANT SELECT ON TABLE public.report_cards_public TO authenticated;

-- current_term is read PRE-AUTH by the module-level IIFE in utils/store/useTime.js (lines
-- 88-99), which the login screen depends on - confirmed still working at baseline (harness B1).
-- security_invoker just makes terms' own "anyone can read" policy the single source of truth
-- instead of the view silently overriding it; anon SELECT is intentionally kept.
ALTER VIEW public.current_term SET (security_invoker = on);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.current_term FROM anon, authenticated;

-- staff_public deliberately STAYS security-definer: get_user_groups() (SECURITY INVOKER) depends
-- on being able to join it to build mentor lists for students who cannot read `users` directly.
-- Only the anon grant goes - authenticated legitimately reads this everywhere.
REVOKE ALL ON TABLE public.staff_public FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.staff_public FROM authenticated;
GRANT SELECT ON TABLE public.staff_public TO authenticated;

-- ─── 6. task_assignments is dead ──────────────────────────────────────────────
--
-- No app code touches it (superseded by tasks.completed_by/assigned_to). Confirmed exploitable
-- at baseline (harness case A8: anon reads it). RLS stays on with zero policies, which denies
-- everyone (service_role bypasses RLS regardless, so nothing legitimate is affected). Table drop
-- is a separate cleanup, not part of this security migration.
DROP POLICY IF EXISTS "anyone can read"       ON public.task_assignments;
DROP POLICY IF EXISTS "staff have full acess" ON public.task_assignments;
REVOKE ALL ON TABLE public.task_assignments FROM anon, authenticated;

-- ─── 7. events: stop anon reading the whole timetable ─────────────────────────
--
-- Nothing reads events pre-auth: /screen uses the admin client, and useEvents only runs inside
-- app/(app), which sits behind WithAuth. Confirmed exploitable at baseline (harness case A4).
DROP POLICY IF EXISTS "anyone can read" ON public.events;
CREATE POLICY "events readable by authenticated" ON public.events
  FOR SELECT TO authenticated USING (true);

-- ─── 8. The access-token hook ─────────────────────────────────────────────────
--
-- Any authenticated user can currently call this directly and read any user's role/is_admin by
-- passing an arbitrary user_id - confirmed at baseline (harness case G3). Stays SECURITY INVOKER
-- on purpose: it already works because supabase_auth_admin holds the "allow auth admin to read"
-- policy on public.users, and changing that would be a needless edit to the login path.
-- The body already schema-qualifies public.users, so SET search_path cannot change resolution -
-- this line closes the schema-shadowing class of attack as defence in depth, not because the
-- current body is vulnerable to it.
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
ALTER FUNCTION public.custom_access_token_hook(jsonb) SET search_path = public, pg_temp;

COMMIT;
