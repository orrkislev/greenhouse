-- RLS verification harness.
--
-- Not run by `supabase db reset` (only files under supabase/migrations are). Run explicitly:
--   npm run db:reset
--   docker cp supabase/snippets/rls_check.sql supabase_db_greenhouse:/tmp/rls_check.sql
--   docker exec supabase_db_greenhouse psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/rls_check.sql
--
-- Everything runs inside one transaction that is ROLLBACK'd at the end, so fixtures never persist.
-- See docs/rules/security.md and the RLS remediation plan for the policy rules this checks.

\set ON_ERROR_STOP on
BEGIN;

-- ─── Assertion helper ────────────────────────────────────────────────────────
--
-- p_uid  NULL => run as anon (no JWT claims).
-- p_expect: 'deny' | 'allow' | 'rows>0' | 'rows=0'
--
-- Three mechanics that are easy to get wrong:
--   - A write blocked by USING (not WITH CHECK) does not raise - RLS filters the rows out, so an
--     UPDATE/DELETE just affects 0 rows. A write blocked by WITH CHECK (an INSERT, or an UPDATE
--     whose new values fail the check) DOES raise 42501. 'deny' treats either as a pass.
--   - Each call runs in its own PL/pgSQL exception block, which is an implicit savepoint, so a
--     denied write doesn't poison the surrounding transaction.
--   - For SELECTs, row *presence* is measured via array_agg(s), not count(*). This was found the
--     hard way: `SELECT count(*) FROM (SELECT some_func()) s` lets Postgres prove count(*) never
--     needs the subquery's column value, so it prunes the function call out of the plan entirely
--     - the permission check tied to actually invoking the function then never fires, and a call
--     that should raise 42501 silently "succeeds" with n=1. Confirmed empirically: this exact
--     shape made `custom_access_token_hook` look reachable even after REVOKE EXECUTE, for a
--     function call with no FROM clause. array_agg(s) must materialize the real row value to
--     build the array, which forces evaluation and lets the permission check fire correctly.
CREATE TABLE pg_temp.results(seq serial, label text, expected text, actual text, ok boolean);

CREATE FUNCTION pg_temp.check(p_label text, p_uid uuid, p_role text, p_admin boolean,
                               p_sql text, p_expect text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  n   bigint := -1;
  err text := NULL;
  got text;
  ok  boolean;
BEGIN
  IF p_uid IS NULL THEN
    PERFORM set_config('request.jwt.claims', '', true);
    EXECUTE 'SET LOCAL ROLE anon';
  ELSE
    PERFORM set_config('request.jwt.claims', jsonb_build_object(
      'sub', p_uid::text,
      'role', 'authenticated',
      'app_metadata', jsonb_build_object('role', p_role, 'is_admin', p_admin)
    )::text, true);
    EXECUTE 'SET LOCAL ROLE authenticated';
  END IF;

  BEGIN
    IF upper(left(btrim(p_sql), 6)) = 'SELECT' THEN
      EXECUTE 'SELECT jsonb_array_length(coalesce(to_jsonb(array_agg(s)), ''[]''::jsonb)) FROM (' || p_sql || ') s' INTO n;
    ELSE
      EXECUTE p_sql;
      GET DIAGNOSTICS n = ROW_COUNT;
    END IF;
  EXCEPTION WHEN others THEN
    err := SQLSTATE || ' ' || SQLERRM;
  END;

  EXECUTE 'RESET ROLE';
  PERFORM set_config('request.jwt.claims', '', true);

  got := coalesce(err, n::text);
  ok := CASE p_expect
          WHEN 'deny'   THEN err IS NOT NULL OR n = 0
          WHEN 'allow'  THEN err IS NULL AND n > 0
          WHEN 'rows>0' THEN err IS NULL AND n > 0
          WHEN 'rows=0' THEN err IS NULL AND n = 0
        END;
  INSERT INTO pg_temp.results(label, expected, actual, ok) VALUES (p_label, p_expect, got, ok);
END $$;

-- ─── Fixtures ─────────────────────────────────────────────────────────────────
--
-- Self-sufficient: fixed UUIDs, not dependent on seed rows (`tal`/`demo1` etc. may not exist
-- outside the local seed, and CI runs migrations without seed.sql at all - see plan, "Make the
-- harness self-sufficient"). All inserted as postgres, which bypasses RLS.
--
-- IDs use a 'facade0-...' prefix for students, 'facest0-...' for staff, purely to keep them
-- visually distinguishable in query output; the values themselves carry no meaning.
DO $$
DECLARE
  student_a   CONSTANT uuid := 'facade00-0000-0000-0000-00000000000a'; -- owns fixtures, acts in most cases
  student_b   CONSTANT uuid := 'facade00-0000-0000-0000-00000000000b'; -- "another student"
  staff_gen   CONSTANT uuid := 'face5700-0000-0000-0000-000000000001'; -- ordinary staff (not vocation, not admin)
  staff_voc   CONSTANT uuid := 'face5700-0000-0000-0000-000000000002'; -- vocation staff, is_admin = false - see plan trap
  staff_admin CONSTANT uuid := 'face5700-0000-0000-0000-000000000003'; -- staff + is_admin = true
  group_id    CONSTANT uuid := 'faceb01d-0000-0000-0000-000000000001';
  event_id    CONSTANT uuid := 'face3e17-0000-0000-0000-000000000001';
  group_task  CONSTANT uuid := 'facea5c1-0000-0000-0000-000000000001'; -- created by staff, no owner, in group_id
  assigned_task CONSTANT uuid := 'facea5c1-0000-0000-0000-000000000002'; -- owned by student_b, assigned to student_a
  english_path  CONSTANT uuid := 'd5b55c53-5f6b-4832-97cf-3fbb99037218'; -- the real shared-path id from useStudy.js:37
BEGIN
  -- auth.users rows are required for the public.users FK.
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  VALUES
    (student_a,   'authenticated', 'authenticated', 'rls-student-a@test.local',   crypt('x', gen_salt('bf')), now(), '{}', '{}'),
    (student_b,   'authenticated', 'authenticated', 'rls-student-b@test.local',   crypt('x', gen_salt('bf')), now(), '{}', '{}'),
    (staff_gen,   'authenticated', 'authenticated', 'rls-staff-gen@test.local',   crypt('x', gen_salt('bf')), now(), '{}', '{}'),
    (staff_voc,   'authenticated', 'authenticated', 'rls-staff-voc@test.local',   crypt('x', gen_salt('bf')), now(), '{}', '{}'),
    (staff_admin, 'authenticated', 'authenticated', 'rls-staff-admin@test.local', crypt('x', gen_salt('bf')), now(), '{}', '{}');

  INSERT INTO public.users (id, username, first_name, last_name, role, is_admin, active) VALUES
    (student_a,   'rls_student_a',   'Student', 'A', 'student', false, true),
    (student_b,   'rls_student_b',   'Student', 'B', 'student', false, true),
    (staff_gen,   'rls_staff_gen',   'Staff',   'Gen', 'staff', false, true),
    (staff_voc,   'rls_staff_voc',   'Staff',   'Voc', 'staff', false, true), -- vocation staff, NOT admin - see plan trap
    (staff_admin, 'rls_staff_admin', 'Staff',   'Admin', 'staff', true, true);

  INSERT INTO public.user_profiles (id, title) VALUES
    (staff_gen,   'מורה'),
    (staff_voc,   'רכזת תעסוקה'),  -- must contain תעסוקה for is_vocation_staff()
    (staff_admin, 'מנהל');

  -- group + membership: student_a is a member, student_b is not
  INSERT INTO public.groups (id, name, type) VALUES (group_id, 'RLS test group', 'class');
  INSERT INTO public.users_groups (user_id, group_id) VALUES (student_a, group_id);

  -- group task: no student_id owner, created by staff, lives in group_id
  INSERT INTO public.tasks (id, title, group_id, created_by, status, completed_by)
    VALUES (group_task, 'group task', group_id, staff_gen, 'todo', '{}');

  -- assigned task: owned by student_b, assigned to student_a (usePlanning.loadAllTasks shape)
  INSERT INTO public.tasks (id, title, student_id, assigned_to, status)
    VALUES (assigned_task, 'assigned task', student_b, ARRAY[student_a], 'todo');

  -- task_assignments is dead app-side (superseded by tasks.completed_by/assigned_to - see plan),
  -- but a row is still needed here so the anon-deny check is non-vacuous (an empty table denies
  -- everyone trivially, which proves nothing about the policy).
  INSERT INTO public.task_assignments (task_id, student_id, status)
    VALUES (group_task, student_a, 'todo');

  -- the real shared English study path. Owned by a specific staff member in production (not
  -- NULL) - confirmed via prod pre-flight step 4 - so the fixture must match: a real owner who
  -- is neither the reading student nor NULL, to actually exercise the policy's `id = ...` branch
  -- rather than its `student_id IS NULL` fallback.
  INSERT INTO public.study_paths (id, title, student_id)
    VALUES (english_path, 'English', staff_gen)
    ON CONFLICT (id) DO NOTHING;

  -- current_term / misc pre-auth reads (useTime.js:88-99, login screen) - do not depend on the
  -- seed's terms (which may not cover "today") or on report_semester_A/B existing in misc at all.
  INSERT INTO public.terms (name, start, "end")
    VALUES ('RLS test term', CURRENT_DATE - 1, CURRENT_DATE + 1);
  INSERT INTO public.misc (name, data) VALUES
    ('report_semester_A', '{"start":"09-01"}'::jsonb),
    ('report_semester_B', '{"start":"02-01"}'::jsonb)
    ON CONFLICT (name) DO NOTHING;

  -- vocation: student_a's placement and student_b's (so "cannot read others" has a real row to
  -- fail against, rather than trivially passing over an empty result set), owned/created by staff
  INSERT INTO public.vocation (id, user_id, place_of_work, contact_phone, is_active) VALUES
    (90001, student_a, 'Test Co',    '050-0000000', true),
    (90002, student_b, 'Other Co',   '050-1111111', true);

  -- vocation check-in for student_a
  INSERT INTO public.vocation_checkins (id, vocation_id, user_id, checkin_date)
    VALUES (90001, 90001, student_a, CURRENT_DATE);

  -- event created by student_a, with student_b as a participant
  INSERT INTO public.events (id, title, "start", "end", created_by, date)
    VALUES (event_id, 'RLS test event', '10:00', '11:00', student_a, CURRENT_DATE);
  INSERT INTO public.event_participants (event_id, user_id) VALUES (event_id, student_b);

  -- report cards: student_a's own row, student_b's row (to prove cross-student denial).
  -- report_cards_private_write_guard (added by Migration 2) checks is_staff() via JWT claims,
  -- which are empty for this fixture setup (running as postgres, no SET ROLE yet) - so writing
  -- `mentors` directly here would trip the very guard this harness is meant to test. Bypass
  -- triggers for fixture setup only, same convention scripts/db-reset.ps1 uses for seed.sql.
  SET session_replication_role = 'replica';
  INSERT INTO public.report_cards_private (id, report_semester, ikigai, mentors)
    VALUES (student_a, '2026A', '{"note":"a"}'::jsonb, '{"note":"staff-authored-a"}'::jsonb);
  INSERT INTO public.report_cards_private (id, report_semester, ikigai, mentors)
    VALUES (student_b, '2026A', '{"note":"b"}'::jsonb, '{"note":"staff-authored-b"}'::jsonb);
  SET session_replication_role = 'origin';
END $$;

-- ─── Assertions ─────────────────────────────────────────────────────────────
--
-- Note: everything runs in one outer transaction (see top of file), so a check that writes data
-- (e.g. A9's anon insert into `vocation`, which currently succeeds) leaves that row visible to
-- every later check in this same run. That's expected, not a bug - e.g. it's why C1's row count
-- may read >1 even though the fixtures only insert one row for student_a. Assertions use
-- rows>0/rows=0 rather than exact counts specifically so this doesn't cause false failures.
--
-- Group A: anon must be denied everywhere the anon key currently reaches.
SELECT pg_temp.check('A1 anon read vocation',              NULL, NULL, NULL, 'SELECT * FROM vocation', 'deny');
SELECT pg_temp.check('A2 anon read vocation_checkins',      NULL, NULL, NULL, 'SELECT * FROM vocation_checkins', 'deny');
SELECT pg_temp.check('A3 anon read event_participants',     NULL, NULL, NULL, 'SELECT * FROM event_participants', 'deny');
SELECT pg_temp.check('A4 anon read events',                 NULL, NULL, NULL, 'SELECT * FROM events', 'deny');
SELECT pg_temp.check('A5 anon read report_cards_public',    NULL, NULL, NULL, 'SELECT * FROM report_cards_public', 'deny');
SELECT pg_temp.check('A6 anon read audit_log_readable',     NULL, NULL, NULL, 'SELECT * FROM audit_log_readable', 'deny');
SELECT pg_temp.check('A7 anon read audit_log_simple',       NULL, NULL, NULL, 'SELECT * FROM audit_log_simple', 'deny');
SELECT pg_temp.check('A8 anon read task_assignments',       NULL, NULL, NULL, 'SELECT * FROM task_assignments', 'deny');
SELECT pg_temp.check('A9 anon write vocation',               NULL, NULL, NULL, $q$INSERT INTO vocation (id, user_id, place_of_work) VALUES (90099, 'facade00-0000-0000-0000-00000000000a', 'x')$q$, 'deny');

-- Group B: anon must still reach what the login screen needs pre-auth.
SELECT pg_temp.check('B1 anon read current_term (login screen)', NULL, NULL, NULL, 'SELECT * FROM current_term', 'allow');
SELECT pg_temp.check('B2 anon read misc report_semester (login screen)', NULL, NULL, NULL, $q$SELECT * FROM misc WHERE name IN ('report_semester_A','report_semester_B')$q$, 'allow');

-- Group C: student, own data.
SELECT pg_temp.check('C1 student read own vocation',   'facade00-0000-0000-0000-00000000000a', 'student', false, $q$SELECT * FROM vocation WHERE user_id = 'facade00-0000-0000-0000-00000000000a'$q$, 'rows>0');
SELECT pg_temp.check('C2 student read others vocation','facade00-0000-0000-0000-00000000000a', 'student', false, $q$SELECT * FROM vocation WHERE user_id <> 'facade00-0000-0000-0000-00000000000a'$q$, 'rows=0');
SELECT pg_temp.check('C3 student cannot update vocation','facade00-0000-0000-0000-00000000000a', 'student', false, $q$UPDATE vocation SET contact_phone = 'x' WHERE id = 90001$q$, 'deny');
SELECT pg_temp.check('C4 student checkin as self',      'facade00-0000-0000-0000-00000000000a', 'student', false, $q$INSERT INTO vocation_checkins (vocation_id, user_id, checkin_date) VALUES (90001, 'facade00-0000-0000-0000-00000000000a', CURRENT_DATE + 1)$q$, 'allow');
SELECT pg_temp.check('C5 student cannot checkin as other','facade00-0000-0000-0000-00000000000a', 'student', false, $q$INSERT INTO vocation_checkins (vocation_id, user_id, checkin_date) VALUES (90001, 'facade00-0000-0000-0000-00000000000b', CURRENT_DATE + 2)$q$, 'deny');

-- Group D: tasks - group tasks and assigned tasks (Severity-3 features, unproven until this runs).
SELECT pg_temp.check('D1 student sees group task',      'facade00-0000-0000-0000-00000000000a', 'student', false, $q$SELECT * FROM tasks WHERE id = 'facea5c1-0000-0000-0000-000000000001'$q$, 'rows>0');
SELECT pg_temp.check('D2 student ticks group task',     'facade00-0000-0000-0000-00000000000a', 'student', false, $q$UPDATE tasks SET completed_by = ARRAY['facade00-0000-0000-0000-00000000000a'::uuid] WHERE id = 'facea5c1-0000-0000-0000-000000000001'$q$, 'allow');
SELECT pg_temp.check('D3 student cannot rename group task','facade00-0000-0000-0000-00000000000a', 'student', false, $q$UPDATE tasks SET title = 'hijacked' WHERE id = 'facea5c1-0000-0000-0000-000000000001'$q$, 'deny');
SELECT pg_temp.check('D4 student cannot tick someone else in','facade00-0000-0000-0000-00000000000a', 'student', false, $q$UPDATE tasks SET completed_by = ARRAY['facade00-0000-0000-0000-00000000000b'::uuid] WHERE id = 'facea5c1-0000-0000-0000-000000000001'$q$, 'deny');
SELECT pg_temp.check('D5 student sees assigned task',   'facade00-0000-0000-0000-00000000000a', 'student', false, $q$SELECT * FROM tasks WHERE assigned_to @> ARRAY['facade00-0000-0000-0000-00000000000a'::uuid]$q$, 'rows>0');
SELECT pg_temp.check('D6 student sets planned_date on assigned task','facade00-0000-0000-0000-00000000000a', 'student', false, $q$UPDATE tasks SET planned_date = CURRENT_DATE WHERE id = 'facea5c1-0000-0000-0000-000000000002'$q$, 'allow');

-- Group E: the shared English study path.
SELECT pg_temp.check('E1 student reads shared English path','facade00-0000-0000-0000-00000000000a', 'student', false, $q$SELECT * FROM study_paths WHERE id = 'd5b55c53-5f6b-4832-97cf-3fbb99037218'$q$, 'rows>0');

-- Group F: report cards - cross-student denial, and the mentors column guard.
SELECT pg_temp.check('F1 student reads own report_cards_public','facade00-0000-0000-0000-00000000000a', 'student', false, $q$SELECT * FROM report_cards_public WHERE id = 'facade00-0000-0000-0000-00000000000a'$q$, 'rows>0');
SELECT pg_temp.check('F2 student cannot read others report_cards_public','facade00-0000-0000-0000-00000000000a', 'student', false, $q$SELECT * FROM report_cards_public WHERE id = 'facade00-0000-0000-0000-00000000000b'$q$, 'rows=0');
SELECT pg_temp.check('F3 student cannot read others report_cards_private','facade00-0000-0000-0000-00000000000a', 'student', false, $q$SELECT * FROM report_cards_private WHERE id = 'facade00-0000-0000-0000-00000000000b'$q$, 'rows=0');
SELECT pg_temp.check('F4 student writes own ikigai',    'facade00-0000-0000-0000-00000000000a', 'student', false, $q$UPDATE report_cards_private SET ikigai = '{"note":"updated"}'::jsonb WHERE id = 'facade00-0000-0000-0000-00000000000a'$q$, 'allow');
SELECT pg_temp.check('F5 student cannot write mentors',  'facade00-0000-0000-0000-00000000000a', 'student', false, $q$UPDATE report_cards_private SET mentors = '{"hijacked":true}'::jsonb WHERE id = 'facade00-0000-0000-0000-00000000000a'$q$, 'deny');
SELECT pg_temp.check('F6 student cannot delete report card','facade00-0000-0000-0000-00000000000a', 'student', false, $q$DELETE FROM report_cards_private WHERE id = 'facade00-0000-0000-0000-00000000000a'$q$, 'deny');
-- These two exist because a real manual test caught what no UPDATE-only case could: to_jsonb(NEW)
-- includes every column on INSERT (unset ones as JSON null), so a naive guard flags `mentors` as
-- "changed" on every single INSERT, blocking a student's first-ever save for a new semester. F7
-- proves a clean insert still works; F8 proves the fix didn't overcorrect into allowing `mentors`
-- through on insert.
SELECT pg_temp.check('F7 student inserts own report card (new semester)','facade00-0000-0000-0000-00000000000a', 'student', false, $q$INSERT INTO report_cards_private (id, report_semester, ikigai) VALUES ('facade00-0000-0000-0000-00000000000a', '2026B', '{"note":"insert path"}'::jsonb)$q$, 'allow');
SELECT pg_temp.check('F8 student cannot insert own report card with mentors set','facade00-0000-0000-0000-00000000000a', 'student', false, $q$INSERT INTO report_cards_private (id, report_semester, mentors) VALUES ('facade00-0000-0000-0000-00000000000a', '2026C', '{"hijacked":true}'::jsonb)$q$, 'deny');

-- Group G: users / staff_public / the hook itself.
SELECT pg_temp.check('G1 student cannot read others users row','facade00-0000-0000-0000-00000000000a', 'student', false, $q$SELECT * FROM users WHERE id <> 'facade00-0000-0000-0000-00000000000a'$q$, 'rows=0');
SELECT pg_temp.check('G2 student reads staff_public',   'facade00-0000-0000-0000-00000000000a', 'student', false, 'SELECT * FROM staff_public', 'rows>0');
SELECT pg_temp.check('G3 student cannot call access token hook', 'facade00-0000-0000-0000-00000000000a', 'student', false, $q$SELECT public.custom_access_token_hook('{}'::jsonb)$q$, 'deny');
-- "Users can view own audit log" legitimately lets a student see entries where THEY are the
-- subject or the actor (student_id = auth.uid() OR updating_user = auth.uid()) - that is by
-- design, not a hole. The thing to assert is that a student cannot see another student's entries.
SELECT pg_temp.check('G4 student cannot read others audit_log entries', 'facade00-0000-0000-0000-00000000000a', 'student', false, $q$SELECT * FROM audit_log WHERE student_id = 'facade00-0000-0000-0000-00000000000b' AND updating_user IS DISTINCT FROM 'facade00-0000-0000-0000-00000000000a'::uuid$q$, 'rows=0');

-- Group H: vocation staff - the branch the local seed cannot exercise without this fixture.
SELECT pg_temp.check('H1 vocation staff reads all vocation','face5700-0000-0000-0000-000000000002', 'staff', false, 'SELECT * FROM vocation', 'rows>0');
SELECT pg_temp.check('H2 ordinary staff cannot manage vocation','face5700-0000-0000-0000-000000000001', 'staff', false, $q$UPDATE vocation SET contact_phone = 'x' WHERE id = 90001$q$, 'deny');
SELECT pg_temp.check('H3 admin (non-vocation-staff) reaches vocation via is_admin','face5700-0000-0000-0000-000000000003', 'staff', true, 'SELECT * FROM vocation', 'rows>0');

-- Group I: staff, cross-cutting.
SELECT pg_temp.check('I1 staff reads any report card',   'face5700-0000-0000-0000-000000000001', 'staff', false, 'SELECT * FROM report_cards_public', 'rows>0');
SELECT pg_temp.check('I2 staff (impersonation) inserts task for student','face5700-0000-0000-0000-000000000001', 'staff', false, $q$INSERT INTO tasks (title, student_id) VALUES ('staff-on-behalf-of-student', 'facade00-0000-0000-0000-00000000000a')$q$, 'allow');
SELECT pg_temp.check('I3 staff cannot read audit_log_readable','face5700-0000-0000-0000-000000000001', 'staff', false, 'SELECT * FROM audit_log_readable', 'deny');

-- Group J: admin.
SELECT pg_temp.check('J1 admin reads audit_log', 'face5700-0000-0000-0000-000000000003', 'staff', true, 'SELECT * FROM audit_log', 'rows>0');

-- ─── Report ─────────────────────────────────────────────────────────────────
\echo '--- RLS check results (FAIL rows only; empty = all listed cases passed) ---'
SELECT seq, label, expected, actual FROM pg_temp.results WHERE NOT ok ORDER BY seq;

\echo '--- summary ---'
SELECT count(*) FILTER (WHERE ok)     AS passed,
       count(*) FILTER (WHERE NOT ok) AS failed,
       count(*)                       AS total
FROM pg_temp.results;

-- Full pass/fail table, useful for baseline runs where failures are expected.
\echo '--- full results ---'
SELECT seq, label, expected, actual, ok FROM pg_temp.results ORDER BY seq;

ROLLBACK;
