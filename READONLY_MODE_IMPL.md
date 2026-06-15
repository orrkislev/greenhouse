# Readonly Mode — Implementation Reference

This document captures the full design and all lessons learned from the planning session.
Use it as the sole input for a clean implementation in a fresh session.

---

## What We're Building

Two independent features, controlled by flags in the `misc` table:

| Flag (`misc.name`) | Default data | Purpose |
|--------------------|--------------|---------|
| `readonly_mode` | `{"enabled": false}` | When `true`: RLS blocks all student writes at the DB level |
| `pinLoginAllowed` | `{"enabled": true}` | When `true`: students may log in with PIN. **Staff PIN login is always blocked** regardless of this flag |

**To activate end-of-year mode** (run in Supabase Studio → SQL Editor):
```sql
UPDATE public.misc SET data = '{"enabled": true}'::jsonb  WHERE name = 'readonly_mode';
UPDATE public.misc SET data = '{"enabled": false}'::jsonb WHERE name = 'pinLoginAllowed';
```
**To revert:** reverse the two updates. No migrations to add or remove.

---

## App Changes (2 files)

### 1. `utils/actions/auth actions.js` — new file

```js
'use server'
import { getSupabaseServerClient } from '../supabase/server';
import { prepareEmail, preparePassword } from './auth';

export async function signInWithPin(username, pin) {
    const supabase = await getSupabaseServerClient();

    // Check if PIN login is currently allowed
    const { data: flagRow } = await supabase
        .from('misc').select('data').eq('name', 'pinLoginAllowed').single();
    if (!flagRow?.data?.enabled) {
        return { error: 'התחברות עם PIN אינה זמינה כרגע' };
    }

    const email = prepareEmail(username);
    const password = preparePassword(pin);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Staff can never use PIN login — permanent security policy
    const { data: userData } = await supabase
        .from('users').select('role, is_admin').eq('id', data.user.id).single();
    if (userData?.role === 'staff' || userData?.is_admin) {
        await supabase.auth.signOut();
        return { error: 'אנשי צוות מתחברים עם Google בלבד' };
    }

    return { userId: data.user.id };
}
```

**Why a server action?** Supabase has no hook to reject `signInWithPassword` at the DB level.
A Next.js server action is the strongest server-side enforcement available without Supabase Pro hooks.
The session is set server-side via `getSupabaseServerClient()` (which uses `@supabase/ssr` cookie handling),
so the browser client picks it up automatically.

### 2. `utils/store/useUser.js` — update `signIn()`

Replace the existing `signIn` function (which calls `supabase.auth.signInWithPassword` directly)
with one that delegates to the server action. Remove the `prepareEmail`/`preparePassword` imports.

```js
// Remove this import:
// import { prepareEmail, preparePassword } from '@/utils/actions/auth';

// Add this import:
import { signInWithPin } from '../actions/auth actions';

// Replace signIn:
signIn: async (username, pinPass) => {
    set({ error: null });
    const result = await signInWithPin(username, pinPass);
    if (result.error) {
        set({ error: { message: result.error } });
        return;
    }
    await get().getUserData(result.userId);
},
```

---

## DB Migration (single file)

**File**: `supabase/migrations/YYYYMMDDNNNNNN_readonly_mode.sql`

### Part 1 — misc flags

```sql
INSERT INTO public.misc (id, name, data)
VALUES (gen_random_uuid(), 'readonly_mode', '{"enabled": false}'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.misc (id, name, data)
VALUES (gen_random_uuid(), 'pinLoginAllowed', '{"enabled": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;
```

### Part 2 — Helper function

```sql
CREATE OR REPLACE FUNCTION public.is_readonly_mode()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE((data->>'enabled')::boolean, false)
  FROM public.misc WHERE name = 'readonly_mode';
$$;
```

`STABLE`: result cached per query.
`SECURITY DEFINER`: runs as function owner, so it can read `misc` even after we lock down misc writes to staff.
`COALESCE(..., false)`: safe default if the row is missing.

### Part 3 — RLS policy changes (the tricky part — read carefully)

#### Background: existing RLS state in the DB

Most tables already have RLS **enabled** with existing policies (from `remote_schema.sql`).
The pattern is:
- `"staff have full access"` — `FOR ALL`, role = 'staff' — on most tables ✓ keep
- `"users manage their own data"` — `FOR ALL`, `auth.uid() = student_id` — on projects/research/study_paths/events ← must change
- `"users has full access to their own"` — `FOR ALL`, `auth.uid() = student_id` — on tasks ← must change
- `"full access to own row"` — `FOR ALL TO public`, `auth.uid() = id` — on report_cards_private ← DROP (students shouldn't write report cards; also wrongly `TO public`)
- `"Users can update own profile"` — `FOR UPDATE TO public`, `auth.uid() = id` — on user_profiles ← must change
- `"admin have edit"` — `FOR UPDATE`, `is_admin = true` — on misc ✓ keep

#### Key RLS lessons (what went wrong in previous attempts)

1. **PERMISSIVE policies use OR logic.** If _any_ permissive policy passes, the operation is allowed.
   Our mistake: adding a new `"xxx_write"` policy (with the readonly_mode check) while the old
   `"users manage their own data"` policy remained. The old policy bypassed the new one entirely.

2. **FOR ALL applies to SELECT too.** A `FOR ALL USING (expr)` policy filters SELECT results
   as well as gating writes. A RESTRICTIVE `FOR ALL` policy blocks SELECT visibility when the
   USING clause is false — which would stop students from reading their own data in readonly mode.
   Solution: don't use RESTRICTIVE, and don't use FOR ALL for the readonly gate.

3. **Overly broad write policies.** A policy like `FOR ALL USING (NOT is_readonly_mode())` means
   _any_ authenticated user can write _any_ row when readonly is off — worse than the original state.

#### Correct approach for student-writable tables

For each table where students normally write their own rows:
- **DROP** the existing student `FOR ALL` policy (it's a bypass with no readonly check)
- **ADD** a replacement that combines row-scoping AND the readonly_mode check in one policy:

```sql
-- pattern
CREATE POLICY "<table>_student_write" ON public.<table>
  FOR ALL TO authenticated
  USING  (auth.uid() = <own_field> AND NOT is_readonly_mode())
  WITH CHECK (auth.uid() = <own_field> AND NOT is_readonly_mode());
```

This way:
- `readonly_mode = false`: `NOT is_readonly_mode()` = true → student can write own rows ✓
- `readonly_mode = true`: `NOT is_readonly_mode()` = false → student write blocked ✓
- SELECT is NOT affected because there are separate `FOR SELECT` read policies that don't include the readonly check

#### Tables and their changes

**`projects`**
```sql
DROP POLICY "users manage their own data" ON public.projects;
CREATE POLICY "projects_student_write" ON public.projects
  FOR ALL TO authenticated
  USING  (auth.uid() = student_id AND NOT is_readonly_mode())
  WITH CHECK (auth.uid() = student_id AND NOT is_readonly_mode());
```

**`research`**
```sql
DROP POLICY "users manage their own data" ON public.research;
CREATE POLICY "research_student_write" ON public.research
  FOR ALL TO authenticated
  USING  (auth.uid() = student_id AND NOT is_readonly_mode())
  WITH CHECK (auth.uid() = student_id AND NOT is_readonly_mode());
```

**`study_paths`**
```sql
DROP POLICY "users manage their own data" ON public.study_paths;
CREATE POLICY "study_paths_student_write" ON public.study_paths
  FOR ALL TO authenticated
  USING  (auth.uid() = student_id AND NOT is_readonly_mode())
  WITH CHECK (auth.uid() = student_id AND NOT is_readonly_mode());
```

**`tasks`**
```sql
DROP POLICY "users has full access to their own" ON public.tasks;
CREATE POLICY "tasks_student_write" ON public.tasks
  FOR ALL TO authenticated
  USING  (auth.uid() = student_id AND NOT is_readonly_mode())
  WITH CHECK (auth.uid() = student_id AND NOT is_readonly_mode());
```

**`events`** (own field is `created_by`, not `student_id`)
```sql
DROP POLICY "users manage their own data" ON public.events;
CREATE POLICY "events_student_write" ON public.events
  FOR ALL TO authenticated
  USING  (auth.uid() = created_by AND NOT is_readonly_mode())
  WITH CHECK (auth.uid() = created_by AND NOT is_readonly_mode());
```

**`user_profiles`** (own field is `id`; UPDATE only — students don't insert/delete profiles)
```sql
DROP POLICY "Users can update own profile" ON public.user_profiles;
CREATE POLICY "user_profiles_student_write" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING  (auth.uid() = id AND NOT is_readonly_mode())
  WITH CHECK (auth.uid() = id AND NOT is_readonly_mode());
```

**`report_cards_private`** (students never write — drop the student write policy, fix the read policy)
```sql
-- Drop the pre-existing student write policy (wrong: TO public, FOR ALL)
DROP POLICY "full access to own row" ON public.report_cards_private;

-- Students may only read their own card.
-- "staff have full access" (existing) already covers staff reads.
CREATE POLICY "report_cards_private_read_own" ON public.report_cards_private
  FOR SELECT TO authenticated USING (auth.uid() = id);
```

**`misc`** (staff need to UPDATE flags, not just admins)
```sql
-- Existing "admin have edit" allows only is_admin=true to UPDATE.
-- Add a staff UPDATE policy so staff can toggle readonly_mode/pinLoginAllowed.
CREATE POLICY "misc_staff_update" ON public.misc
  FOR UPDATE TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin'))
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin'));
```

**`event_participants`** (no pre-existing policies; RLS may not have been enabled)
```sql
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_participants_read_all" ON public.event_participants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "event_participants_staff_write" ON public.event_participants
  FOR ALL TO authenticated
  USING  ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin'))
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') IN ('staff', 'admin'));
```
(If students should be able to RSVP themselves, add a student write policy analogous to events.)

#### Tables with NO changes needed

- `groups`, `users_groups`: no student write policy exists; staff-only via "staff have full access" ✓
- `users`: no student write policy; admin-only via "admins can update" ✓
- `audit_log`, `mentorships`, `task_assignments`, `terms`: staff/admin/service_role only ✓
- `vocation`, `vocation_checkins`: RLS explicitly disabled; app-layer security; out of scope
- `student_presence`: already has correct RLS from its own migration ✓
- `topic_bank`: already has correct staff-only RLS from its own migration ✓

---

## Staff "Switch to Student" — no changes needed

When staff uses `switchToStudent()`, it's a UI-only change in Zustand. The Supabase JWT still
belongs to the staff member (`role: 'staff'`), so RLS sees staff and allows all writes. ✓

---

## Verification checklist

1. `npm run db:reset` — apply migration locally
2. PIN login as student → "התחברות עם PIN אינה זמינה כרגע"
3. PIN login as staff → "אנשי צוות מתחברים עם Google בלבד"
4. Google login as staff → works
5. Google login as student → works (can view data)
6. As logged-in student, try any write (update project, research, etc.) → silently blocked
7. Set `readonly_mode = true`, try write as student → blocked
8. Set `readonly_mode = false`, try write as student on OWN row → works
9. Try write as student on ANOTHER student's row → blocked (row scope)
10. Staff in "switch to student" view → can still save (JWT is staff)
11. Print report page as logged-in staff → works (reads report_cards_private + public)
12. Screen page (`/screen/...`) → works (uses admin client, bypasses RLS)
