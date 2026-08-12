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

RLS is **on** for almost every table, and a new table must ship its policies **in the same
migration** that creates it. A table with RLS enabled and no policies denies everything;
a table with RLS disabled allows everything to anyone holding the anon key — which is
public by design, shipped in the browser bundle.

### Currently exposed — this is a bug, not a precedent

| Table | Contents |
|---|---|
| `vocation` | `place_of_work`, `position`, `contact_name`, **`contact_phone`**, `work_hours` |
| `vocation_checkins` | attendance hours and notes |
| `event_participants` | event ↔ user links |

RLS is disabled on all three, so anyone with the anon key can read and modify every row.
There's a migration named `20260527000002_vocation_disable_rls.sql`, so it was a
deliberate unblock at some point. It is tracked in `NEXT_RELEASE.md`.

**Do not "fix" this by running `ALTER TABLE … ENABLE ROW LEVEL SECURITY` on its own** —
with no policies, that blacks out the vocation feature completely. Policies first, in the
same migration.

Check the current state any time with the Supabase advisors, or:

```sql
SELECT relname, relrowsecurity FROM pg_class
WHERE relnamespace = 'public'::regnamespace AND relkind = 'r' ORDER BY 2, 1;
```

## Public by design

These render **without authentication** and use the admin client deliberately:

- `app/screen/[groupId]` — the hallway display. Shows students, their day, their tasks.
- `app/print_report/[studentId]` — printable report cards.

Anything these queries select is effectively public to anyone with the URL. **Don't add
fields to them casually**, and don't widen `report_cards_public` to make a print page
easier — that view is the boundary between what staff write and what students see.

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

## Audit trail

Changes to `projects.metadata`, `research.metadata` and `report_cards_private` are
recorded in `audit_log` by database triggers, readable through the `audit_log_readable`
view. Don't strip those triggers when writing a migration that touches those tables.

---

## Checklist for a change that touches data

1. Does this need the admin client, or would the server client do?
2. If admin: does it authenticate **and** authorize the caller, and does it avoid trusting
   any id passed in?
3. New table → RLS enabled **and** policies, same migration.
4. New column holding personal data → policy decided now.
5. Does it widen anything reachable from `/screen` or `/print_report`?
6. Any new `NEXT_PUBLIC_*` variable → confirm it is genuinely safe to publish.
