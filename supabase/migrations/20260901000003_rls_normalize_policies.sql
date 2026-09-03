-- RLS remediation, phase 3: normalization. Lowest severity, highest churn, so it lands last.
-- Pure cleanup - no case in supabase/snippets/rls_check.sql should change behavior here; the
-- harness result before and after this migration should be identical (42/42).
--
-- 1. Policies `TO public` -> `TO authenticated`, except misc's and terms's "anyone can read",
--    which are load-bearing pre-auth reads for the login screen (utils/store/useTime.js:88-99).
-- 2. Explicit `WITH CHECK` on every `FOR ALL` policy. Postgres already defaults WITH CHECK to the
--    USING expression when omitted on a FOR ALL/UPDATE policy (this is documented core behavior,
--    not a per-project convention) - so this is documentation, not a behavior change. It makes
--    the impersonation rule (every WITH CHECK must be `<owner> OR is_staff()` or a bare
--    is_staff()/is_admin() check) auditable at a glance instead of implicit.
-- 3. Retire Pattern C (`EXISTS (SELECT 1 FROM users WHERE ...)`) on audit_log and topic_bank in
--    favor of is_staff()/is_admin() - see docs/rules/security.md's rule against ever querying
--    `users` from a policy on `users` itself (recursion hazard); these two tables aren't `users`,
--    so the hazard doesn't apply, but the helpers are the single source of truth now.
-- 4. Drop two dead functions found during the original audit.
-- 5. Add the missing user_profiles INSERT policy - there was none at all.

BEGIN;

-- Two policy names from the original schema carry an accidental trailing space
-- (`"staff have full access "` on tasks, `"admin "` on terms - confirmed via
-- encode(policyname::bytea,'hex'), not visible in any listing). Renamed here so the rest of this
-- migration - and anyone reading pg_policies from now on - doesn't have to know that.
ALTER POLICY "staff have full access " ON public.tasks RENAME TO "staff have full access";
ALTER POLICY "admin " ON public.terms RENAME TO "admin";

-- ─── 1 + 2 combined: tighten role and add WITH CHECK together where both are needed ──────────
ALTER POLICY "staff have full access" ON public.groups
  TO authenticated
  WITH CHECK ((( auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text);

ALTER POLICY "users manage their own data" ON public.logs
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

ALTER POLICY "users manage their own data" ON public.study_paths
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

ALTER POLICY "staff have full access" ON public.tasks
  TO authenticated
  WITH CHECK ((( auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text);

ALTER POLICY "admin" ON public.terms
  TO authenticated
  WITH CHECK (((( auth.jwt() -> 'app_metadata'::text) ->> 'is_admin'::text))::boolean = true);

-- ─── 2 only: already `TO authenticated`, just needs an explicit WITH CHECK ────────────────────
ALTER POLICY "staff have full access" ON public.logs
  WITH CHECK ((( auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text);
ALTER POLICY "staff have full access" ON public.study_paths
  WITH CHECK ((( auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text);
ALTER POLICY "users has full access to their own" ON public.tasks
  WITH CHECK (auth.uid() = student_id);
ALTER POLICY "staff have full access" ON public.events
  WITH CHECK ((( auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text);
ALTER POLICY "users manage their own data" ON public.events
  WITH CHECK (auth.uid() = created_by);
ALTER POLICY "staff have full access" ON public.mentorships
  WITH CHECK ((( auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text);
ALTER POLICY "staff have full access" ON public.projects
  WITH CHECK ((( auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text);
ALTER POLICY "users manage their own data" ON public.projects
  WITH CHECK (auth.uid() = student_id);
ALTER POLICY "staff have full access" ON public.research
  WITH CHECK ((( auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text);
ALTER POLICY "users manage their own data" ON public.research
  WITH CHECK (auth.uid() = student_id);
ALTER POLICY "admins have full access" ON public.student_presence
  WITH CHECK (((( auth.jwt() -> 'app_metadata'::text) ->> 'is_admin'::text))::boolean = true);
ALTER POLICY "staff have full access" ON public.student_presence
  WITH CHECK ((( auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text);
ALTER POLICY "staff has full access" ON public.users_groups
  WITH CHECK ((( auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text);

-- ─── 1 only: role tightening, no WITH CHECK needed (not FOR ALL) ─────────────────────────────
ALTER POLICY "admin have edit" ON public.misc TO authenticated;
ALTER POLICY "Users can update own profile" ON public.user_profiles TO authenticated;
ALTER POLICY "Users can view own profile" ON public.user_profiles TO authenticated;
ALTER POLICY "staff can update all" ON public.user_profiles TO authenticated;
ALTER POLICY "Users can view own official record" ON public.users TO authenticated;

-- misc's and terms's "anyone can read" are deliberately left `TO public` - current_term and the
-- login screen (useTime.js:88-99) read them pre-auth. Harness cases B1/B2 assert this stays true.

-- ─── 3: retire Pattern C on audit_log and topic_bank ─────────────────────────────────────────
ALTER POLICY "Admins can view audit log" ON public.audit_log
  USING ((SELECT public.is_admin()));
ALTER POLICY "Staff can view student audit logs" ON public.audit_log
  USING ((SELECT public.is_staff()));

ALTER POLICY "topic_bank_select" ON public.topic_bank TO authenticated;
ALTER POLICY "topic_bank_staff_delete" ON public.topic_bank
  TO authenticated
  USING ((SELECT public.is_staff()));
ALTER POLICY "topic_bank_staff_insert" ON public.topic_bank
  TO authenticated
  WITH CHECK ((SELECT public.is_staff()));
ALTER POLICY "topic_bank_staff_update" ON public.topic_bank
  TO authenticated
  USING ((SELECT public.is_staff()))
  WITH CHECK ((SELECT public.is_staff()));

-- ─── 4: drop two dead functions found during the original audit ─────────────────────────────
-- Stale 2-arg overload - the app only ever calls the 3-arg form (useGroups.js:95-99); this one
-- still references the `links` table dropped by 20260811000001_tasks_owner_columns.sql.
DROP FUNCTION IF EXISTS public.get_user_group_tasks_by_group(uuid, uuid);

-- Zero callers repo-wide (confirmed via grep); its own header already said "no longer used as of
-- 2026-05-11". Its `IF student_role != 'student'` gate also fails open (NULL != anything is NULL,
-- so the RAISE never fires) if the access-token hook ever stops firing - dropping beats patching
-- a function nothing calls.
DROP FUNCTION IF EXISTS public.update_student_ikigai(jsonb);

-- ─── 5: user_profiles had no INSERT policy at all ────────────────────────────────────────────
-- Only the admin client could create a profile row before this. `OR is_staff()` is the
-- impersonation escape hatch, matching the UPDATE policies on this table.
CREATE POLICY "user_profiles insert own or staff" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id OR (SELECT public.is_staff()));

COMMIT;
