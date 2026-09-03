# Security & Permissions

Who can see what, and what you owe when you bypass the rules.

This is a school system holding records about minors — evaluations, workplaces, contact
phone numbers. **The repository is public.** Treat both facts as constraints on every
change.

Domain vocabulary is in [`domain.md`](domain.md).

---

## Roles

`users.role` is `student` or `staff`. Admin is not a role — it's a flag.

| Helper (`utils/store/useUser.js`) | True when |
|---|---|
| `isStaff()` | `role === 'staff'` |
| `isAdmin()` | `role === 'staff'` **and** `is_admin` |
| `isVocationStaff()` | staff whose `title` contains `תעסוקה` |

**Trap:** the `user_role` enum contains `admin`, but no row uses it. Comparing
`role === 'admin'` matches nobody and fails open or closed depending on how you wrote the
condition. Always use the helpers.

Current shape: ~98 students, ~25 staff, 3 admins.

## Impersonation

Staff can act as a student via `switchToStudent` in `useUser.js`. The original user is
kept in `originalUser` and restored by `switchBackToOriginal`.

This makes one rule load-bearing across the whole codebase:

> **Every store must reset its state when the user id changes.**
> ```js
> useUser.subscribe(state => state.user?.id, () => set({ project: null, tasks: [] }));
> ```

A store that doesn't do this will show the previous student's data to the next one. This
is not a theoretical concern — it's the exact failure impersonation produces. See
[`development.md` §2](development.md#2-the-data-layer--the-core-rule).

Note that impersonation is **client-side state**: it swaps which user the UI renders. It
does not re-issue the auth session, so RLS still evaluates against the *real* staff
member's identity. Don't rely on impersonation to test a student's permissions.

## The two Supabase clients

From [`utils/supabase/server.js`](../../utils/supabase/server.js):

| Client | Identity | RLS |
|---|---|---|
| `getSupabaseServerClient()` | the caller's cookies | **applies** |
| `getSupabaseAdminClient()` | service role key | **bypassed entirely** |

Plus `utils/supabase/client.js` — the browser client, always subject to RLS.

**Default to the server client.** Reach for the admin client only when the operation
genuinely cannot be expressed under RLS (creating auth users, cross-student staff
reporting, public unauthenticated pages).

### The rule for admin-client actions

Server actions are ordinary HTTP endpoints. Anyone who can load the app can invoke one
with arguments of their choosing. So:

> **An action using the admin client must authenticate and authorize the caller itself,
> and must never trust a user id passed in as a parameter.**

RLS is not protecting you there. Nothing else is either.

The pattern to copy — `createUser` in [`admin actions.js`](../../utils/actions/admin%20actions.js):

```js
const serverClient = await getSupabaseServerClient();
const { data: { user: callingUser } } = await serverClient.auth.getUser();
if (!callingUser) throw new Error('Not authenticated');
const { data: caller } = await supabase.from('users').select('is_admin').eq('id', callingUser.id).single();
if (!caller?.is_admin) throw new Error('Not authorized');
```

When an action legitimately operates on a given user, verify the caller *is* that user or
is staff — don't take the id on faith:

```js
const { data: { user: caller } } = await (await getSupabaseServerClient()).auth.getUser();
if (!caller) throw new Error('Not authenticated');
if (caller.id !== userId) {
    const { data: me } = await supabase.from('users').select('role').eq('id', caller.id).single();
    if (me?.role !== 'staff') throw new Error('Not authorized');
}
```

`initializeReportSemester` in `report actions.js` originally did none of this — it took a
`userId` argument, used the admin client, and returned `select('*')` from
`report_cards_private`. Any logged-in user who knew another student's uuid could read
their private evaluation. It now carries the check above. Don't reintroduce the shape.

## Row Level Security

RLS is **on** for every table in `public`, and a new table must ship its policies **in the
same migration** that creates it. A table with RLS enabled and no policies denies
everything; a table with RLS disabled allows everything to anyone holding the anon key —
which is public by design, shipped in the browser bundle.

### Role helpers

Policies use these instead of inlining the JWT expression or querying `users`:

| Helper | Definition | Use on |
|---|---|---|
| `is_staff()` | reads `auth.jwt() -> 'app_metadata' ->> 'role'` | any table, including `users` |
| `is_admin()` | reads `auth.jwt() -> 'app_metadata' ->> 'is_admin'` | any table, including `users` |
| `is_vocation_staff()` | `SECURITY DEFINER`; joins `users`+`user_profiles` for a `תעסוקה` title | **only** `vocation` and `vocation_checkins` |

**Never write a policy that subqueries `public.users` from a policy on `public.users`
itself** — `custom_access_token_hook` reads `users` during token issuance, so a
self-referencing policy recurses and locks out login for everyone, including whoever would
fix it. This is why `is_staff()`/`is_admin()` read the JWT rather than the table: they
have no table dependency, so they can't create this cycle. `is_vocation_staff()` does read
tables (`user_profiles.title` isn't in the JWT) — that's fine on `vocation`/`vocation_checkins`,
but never put it on `users` or `user_profiles`.

### Views bypass RLS unless told not to

A view runs with the privileges of its **owner** by default, not the querying role — so a
view over an RLS-protected table can silently read past every policy on the underlying
table. This bit us for real: `report_cards_public`, `staff_public`, `current_term`, and the
two audit views all lacked `security_invoker`, so `report_cards_public` — id number, name,
every evaluation field, attendance — was readable by the plain anon key, and separately by
*any logged-in student for any other student*, despite `report_cards_private`'s own
policies correctly denying the same read on the base table.

Any view over an RLS-protected table needs an explicit call:
`ALTER VIEW public.some_view SET (security_invoker = on);` — then the view enforces the
base table's policies for whoever queries it, instead of running as owner. The one
deliberate exception is `staff_public`: it **stays** security-definer, because
`get_user_groups()` depends on being able to join it to build a mentor list for students
who can't read `users` directly. Check any new view's `reloptions` before assuming it's
covered:

```sql
SELECT relname, relrowsecurity, reloptions FROM pg_class
WHERE relnamespace = 'public'::regnamespace AND relkind IN ('r', 'v') ORDER BY 1;
```

### Column-level protection needs a trigger, not a GRANT

RLS is row-level. When one column of a row must be writable by its owner but not by
others who can also write that row (e.g. a student writes their own report-card
self-evaluation, but must not overwrite the staff-authored `mentors` column) — column
`GRANT`s can't express it, since students and staff are both the `authenticated` role. Use
a `BEFORE INSERT OR UPDATE` trigger with an **allowlist** of student-writable columns
(fails closed for any column added later), short-circuited for staff. See
`report_cards_private_write_guard` and `tasks_write_guard`.

This only protects **columns**, not keys inside a JSONB column — see the report card note
under [Personal data](#personal-data).

### Historical exposure — fixed, not a precedent

`vocation`, `vocation_checkins` and `event_participants` used to have RLS disabled (or, for
`event_participants`, never enabled at all), so the anon key could read and write every
row — including `contact_phone` for every student's workplace placement. Fixed by
migrations `20260901000001`/`20260901000002`. **If you ever see
`ALTER TABLE … DISABLE ROW LEVEL SECURITY` in a new migration, that is a regression, not a
fix for a broken feature** — the actual fix for "RLS broke the feature" is almost always a
missing policy, not turning RLS off. That is exactly how this exposure happened the first
time (`20260527000002_vocation_disable_rls.sql`).

## Public by design

`app/screen/[groupId]` — the hallway display (students, their day, their tasks) — renders
**without authentication** and uses the admin client deliberately. Anything it selects is
effectively public to anyone with the URL. **Don't add fields to it casually**, and don't
widen `report_cards_public` to make it easier — that view is the boundary between what
staff write and what students see.

`app/print_report/[studentId]` is **not** on this list — it requires login (`WithAuth`),
and access is enforced by `report_cards_private`/`report_cards_public`'s own RLS (staff may
read any student; a student only their own), not by the route.

## Secrets

| Variable | Exposure |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **public** — in the browser bundle |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **public** — by design; RLS is what protects data |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** — full database access, bypasses RLS |
| `GOOGLE_CLIENT_SECRET`, `GOOGLE_CLOUD_API` | server only |

- Anything named `NEXT_PUBLIC_*` is readable by every user. Never put a secret behind that
  prefix to "make it work in a component".
- The service role key may only be referenced in `'use server'` files. If you find
  yourself needing it in a component, the logic belongs in a server action.
- `.env*` is gitignored and must stay that way. **The repo is public** — a committed key
  is a disclosed key, and rotating Supabase keys invalidates every session.
- CI uses placeholder env values, not secrets — see `.github/workflows/ci.yml`.

## Personal data

The database holds identifiable records about minors: names, photos, evaluations,
workplaces, and a named adult contact's phone number.

- Don't add student data to public routes, `console.log`, error messages, or toast text.
- Don't paste production rows into commit messages, PR descriptions, or issues — the repo
  is public.
- Prefer `staff_public` over `users` whenever a student's view needs staff details.
- When adding a column that holds anything personal, decide its RLS policy at the same
  time, not later.

**Known limitation — JSONB columns on `report_cards_private` have no sub-key protection.**
`report_cards_private_write_guard` stops a student writing the `mentors` *column*, but
`learning`, `liba`, `ikigai`, `special` and `end_eval` are JSONB blobs with keys written by
different parties — e.g. staff write `learning.englishMasterReview`
(`app/(app)/staff/english_report/page.js`) while a student's own save upserts the whole
`learning` object (`app/(app)/report/page.js`), so whichever saves last wins. This is a
concurrency/ownership problem, not an authorization one — a column-level guard can't
express "these keys within this column belong to staff." Tracked in `NEXT_RELEASE.md`;
likely fix is an edit-lock mechanism or splitting staff-authored keys into their own
columns.

## Audit trail

Changes to `projects.metadata`, `research.metadata` and `report_cards_private` are
recorded in `audit_log` by database triggers, readable through the `audit_log_readable`
view. Don't strip those triggers when writing a migration that touches those tables.

---

## Checklist for a change that touches data

1. Does this need the admin client, or would the server client do?
2. If admin: does it authenticate **and** authorize the caller, and does it avoid trusting
   any id passed in?
3. New table → RLS enabled **and** policies, same migration. Never disable RLS to "fix" a
   broken feature — add the missing policy instead.
4. New column holding personal data → policy decided now.
5. New view over an RLS-protected table → does it need `security_invoker = on`?
6. Does it widen anything reachable from `/screen`?
7. Any new `NEXT_PUBLIC_*` variable → confirm it is genuinely safe to publish.
