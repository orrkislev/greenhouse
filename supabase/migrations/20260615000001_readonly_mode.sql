-- End-of-year read-only mode + PIN login security hardening.
--
-- Two independent misc flags are added:
--   readonly_mode    - when enabled, RLS blocks all student writes at the DB level
--   pinLoginAllowed  - checked at the app layer; controls whether PIN login is available to students
--
-- To activate end-of-year mode (run in Supabase Studio → SQL Editor):
--   UPDATE public.misc SET data = '{"enabled": true}'::jsonb  WHERE name = 'readonly_mode';
--   UPDATE public.misc SET data = '{"enabled": false}'::jsonb WHERE name = 'pinLoginAllowed';
--
-- To revert (new school year):
--   UPDATE public.misc SET data = '{"enabled": false}'::jsonb WHERE name = 'readonly_mode';
--   UPDATE public.misc SET data = '{"enabled": true}'::jsonb  WHERE name = 'pinLoginAllowed';
--
-- The RLS policies remain in place year-round; they're harmless when readonly_mode is false.

-- ---------------------------------------------------------------
-- 1. Add flags to misc
-- ---------------------------------------------------------------
INSERT INTO public.misc (id, name, data)
VALUES (gen_random_uuid(), 'readonly_mode', '{"enabled": false}'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.misc (id, name, data)
VALUES (gen_random_uuid(), 'pinLoginAllowed', '{"enabled": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------
-- 2. Helper function used by RLS write policies
-- SECURITY DEFINER so it can read misc as the function owner,
-- bypassing the misc RLS policy we're about to add.
-- STABLE so Postgres can cache the result within a query.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_readonly_mode()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((data->>'enabled')::boolean, false)
  FROM public.misc
  WHERE name = 'readonly_mode';
$$;

-- ---------------------------------------------------------------
-- 3. misc — staff can always write (needed to toggle the flags);
--    students and others are read-only.
-- ---------------------------------------------------------------
ALTER TABLE public.misc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "misc_read_all" ON public.misc
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "misc_write_staff_only" ON public.misc
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin'))
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin'));

-- ---------------------------------------------------------------
-- 4. Student data tables
-- Read: all authenticated users.
-- Write: staff/admin always; students/others only when readonly_mode is off.
-- ---------------------------------------------------------------

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_read_all" ON public.projects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "projects_write" ON public.projects
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode())
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode());

ALTER TABLE public.research ENABLE ROW LEVEL SECURITY;
CREATE POLICY "research_read_all" ON public.research
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "research_write" ON public.research
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode())
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode());

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_read_all" ON public.tasks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "tasks_write" ON public.tasks
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode())
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode());

ALTER TABLE public.study_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "study_paths_read_all" ON public.study_paths
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "study_paths_write" ON public.study_paths
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode())
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode());

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_read_all" ON public.user_profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_profiles_write" ON public.user_profiles
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode())
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode());

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_all" ON public.users
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_write" ON public.users
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode())
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode());

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groups_read_all" ON public.groups
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "groups_write" ON public.groups
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode())
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode());

ALTER TABLE public.users_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_groups_read_all" ON public.users_groups
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_groups_write" ON public.users_groups
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode())
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode());

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_read_all" ON public.events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_write" ON public.events
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode())
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode());

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_participants_read_all" ON public.event_participants
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "event_participants_write" ON public.event_participants
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode())
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin') OR NOT is_readonly_mode());
