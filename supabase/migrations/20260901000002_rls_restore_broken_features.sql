-- RLS remediation, phase 2: restore the features Migration 1's baseline proved RLS currently
-- breaks (group tasks, assigned tasks, the shared English study path), and close the
-- report_cards_private write hole (a student could rewrite `mentors`, and could delete their own
-- report card outright - see harness cases F5/F6).
--
-- Everything here either widens permissions or adds a trigger the current app never trips, so it
-- stays backwards-compatible with deployed code. Matching app changes (staff_public embeds,
-- print_report auth gate) ship in the same PR - see the RLS remediation plan.
--
-- Deliberately out of scope: the guard trigger below protects report_cards_private at COLUMN
-- granularity only. It does not police keys *inside* the JSONB columns (learning, liba, etc.),
-- so a student can still clobber staff-authored content nested there - e.g. staff write
-- learning.englishMasterReview while the student's own save upserts the whole `learning` object.
-- That is a concurrency/ownership problem, not an authorization one, and wants its own session
-- (likely an edit-lock mechanism) - tracked in NEXT_RELEASE.md and docs/rules/security.md.

BEGIN;

-- ─── report_cards_private: column-level write protection ────────────────────
--
-- Column GRANTs cannot express this: students and staff are both the `authenticated` role, so a
-- grant that stops a student writing `mentors` also stops staff writing it. A dedicated view
-- fails open when a column is added later and someone forgets to add it there too. A guard
-- trigger is one object, needs no app change, and fails *closed* (allowlist, not denylist) for
-- future columns.
--
-- Confirmed column set: id, ikigai, mentors, liba, learning, vocation, special, report_semester,
-- end_eval. Student-writable = everything except `mentors` (sole app-side writer:
-- StaffGroup_Evaluations.js:293 - MentorsEditor.save). Staff short-circuit at the top.
CREATE OR REPLACE FUNCTION public.report_cards_private_write_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  student_writable CONSTANT text[] := ARRAY[
    'id','report_semester','ikigai','liba','learning','vocation','special','end_eval'
  ];
  offending text;
BEGIN
  IF public.is_staff() THEN RETURN NEW; END IF;

  -- to_jsonb(NEW) always includes every column, even ones the caller never set - a column with
  -- no explicit value still appears as a key holding JSON null. So on INSERT, "changed" must mean
  -- "holds a real value", not "key is present" - otherwise every INSERT gets flagged for
  -- `mentors` (a column that is NULL by default) even when nobody touched it, which would block a
  -- student's very first save for a semester. Confirmed the hard way: this exact shape blocked a
  -- plain INSERT with only ikigai set.
  SELECT string_agg(n.k, ', ') INTO offending
  FROM jsonb_each(to_jsonb(NEW)) n(k, v)
  WHERE NOT (n.k = ANY (student_writable))
    AND (
      (TG_OP = 'INSERT' AND n.v IS DISTINCT FROM 'null'::jsonb)
      OR (TG_OP = 'UPDATE' AND n.v IS DISTINCT FROM (to_jsonb(OLD) -> n.k))
    );

  IF offending IS NOT NULL THEN
    RAISE EXCEPTION 'report card column(s) % are staff-authored' , offending
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER report_cards_private_write_guard
  BEFORE INSERT OR UPDATE ON public.report_cards_private
  FOR EACH ROW EXECUTE FUNCTION public.report_cards_private_write_guard();

-- Replace the single "full access to own row" policy (FOR ALL, no WITH CHECK, TO public - which
-- let a student INSERT/UPDATE/DELETE any column, including deleting their own report card
-- outright - confirmed exploitable at baseline via harness case F6) with explicit per-command
-- policies. No student DELETE.
DROP POLICY IF EXISTS "full access to own row" ON public.report_cards_private;
DROP POLICY IF EXISTS "staff have full access" ON public.report_cards_private;

CREATE POLICY "report card student read own" ON public.report_cards_private
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "report card student insert own" ON public.report_cards_private
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "report card student update own" ON public.report_cards_private
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "report card staff full access" ON public.report_cards_private
  FOR ALL TO authenticated
  USING ((SELECT public.is_staff())) WITH CHECK ((SELECT public.is_staff()));

-- ─── tasks: group tasks and assigned tasks ───────────────────────────────────
--
-- Confirmed broken at baseline (harness D1/D2/D5/D6): a student cannot see a task in their own
-- group, cannot tick it complete, cannot see a task assigned to them, and cannot drag it onto a
-- planned date - because the only student policy is `auth.uid() = student_id`, and none of these
-- rows are owned that way (group tasks have no student_id; assigned tasks are owned by whoever
-- created them, with the student only listed in `assigned_to`).
CREATE POLICY "tasks student read group and assigned" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    auth.uid() = ANY (assigned_to)
    OR (group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.users_groups ug
          WHERE ug.group_id = tasks.group_id AND ug.user_id = auth.uid()))
  );

CREATE POLICY "tasks student update group and assigned" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = ANY (assigned_to)
    OR (group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.users_groups ug
          WHERE ug.group_id = tasks.group_id AND ug.user_id = auth.uid()))
  )
  WITH CHECK (
    auth.uid() = ANY (assigned_to)
    OR (group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.users_groups ug
          WHERE ug.group_id = tasks.group_id AND ug.user_id = auth.uid()))
  );

-- The policy above alone would let any group member rewrite a task's title, due date or status -
-- GroupTaskModal.js gates that in the UI only (isMentor), not in the database. This trigger
-- allowlists exactly the columns the app actually sends for a non-owner: `completed_by`
-- (useGroups.js toggleGroupTaskStatus, {completed_by} only) and `planned_date`
-- (usePlanning.js setPlannedDate, {planned_date} only). `current_count` is included as it shares
-- the same shape (a student's own progress marker on a task they don't own). `updated_at` is
-- excluded from the check entirely - handle_updated_at (named alphabetically before this trigger)
-- already fires first and stamps NEW.updated_at, so by the time this trigger runs it always
-- differs from OLD regardless of what the caller sent.
CREATE OR REPLACE FUNCTION public.tasks_write_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE mutated text;
BEGIN
  IF public.is_staff() THEN RETURN NEW; END IF;
  IF OLD.student_id IS NOT NULL AND OLD.student_id = auth.uid() THEN RETURN NEW; END IF;

  SELECT string_agg(n.k, ', ') INTO mutated
  FROM jsonb_each(to_jsonb(NEW)) n(k, v)
  WHERE n.k NOT IN ('completed_by', 'planned_date', 'current_count', 'updated_at')
    AND n.v IS DISTINCT FROM (to_jsonb(OLD) -> n.k);
  IF mutated IS NOT NULL THEN
    RAISE EXCEPTION 'not allowed to modify task column(s) %', mutated USING ERRCODE = '42501';
  END IF;

  -- completed_by may only gain or lose the caller's own id - not mark another student complete.
  -- NOTE: the two EXCEPTs below MUST each be parenthesized. EXCEPT and UNION have equal
  -- precedence and associate left-to-right, so `a EXCEPT b UNION c EXCEPT d` parses as
  -- `((a EXCEPT b) UNION c) EXCEPT d`, not the symmetric difference - confirmed empirically to
  -- silently drop one side's distinct elements, which would have let a student mark ANOTHER
  -- student complete on a shared task undetected.
  IF NEW.completed_by IS DISTINCT FROM OLD.completed_by
     AND EXISTS (
       SELECT 1 FROM (
         (SELECT unnest(coalesce(NEW.completed_by, '{}')) EXCEPT SELECT unnest(coalesce(OLD.completed_by, '{}')))
         UNION
         (SELECT unnest(coalesce(OLD.completed_by, '{}')) EXCEPT SELECT unnest(coalesce(NEW.completed_by, '{}')))
       ) d(uid) WHERE d.uid IS DISTINCT FROM auth.uid())
  THEN
    RAISE EXCEPTION 'may only mark yourself complete' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER tasks_write_guard BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tasks_write_guard();

-- ─── study_paths: the shared English path ────────────────────────────────────
--
-- useStudy.js:37 fetches the fixed row 'd5b55c53-5f6b-4832-97cf-3fbb99037218' for every student;
-- the only existing student policy (auth.uid() = student_id) hides it from anyone who isn't its
-- owner - confirmed at baseline (harness E1).
--
-- The original version of this policy tested `student_id IS NULL`, on the assumption that a
-- NULL owner is how a shared template is marked. Production pre-flight (step 4) proved that
-- assumption wrong: the real row's student_id is NOT NULL - it's set to the English teacher's
-- own id, not a placeholder. A NULL test would have matched nothing in production and left this
-- feature exactly as broken as it is today. Match the known id directly instead; keep the NULL
-- test as a fallback in case a genuinely unowned template is ever added later.
CREATE POLICY "study_paths read shared" ON public.study_paths
  FOR SELECT TO authenticated
  USING (id = 'd5b55c53-5f6b-4832-97cf-3fbb99037218'::uuid OR student_id IS NULL);

COMMIT;
