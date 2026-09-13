# 2026 Snapshot (Frozen)

This branch is a frozen snapshot of `main` as of 2026-09-13 (commit `22fac74`),
kept in case the 2026 production codebase or data ever needs to be revisited.
It is not used for active development — ongoing work happens on `main` and
sprint/feature branches. This branch should be locked/protected on GitHub and
never pushed to directly.

## What this branch contains

- The full application codebase as of the last commit on `main` before 2027
  development began.
- `supabase/migrations/` up to and including
  `20260901000003_rls_normalize_policies.sql`, which defines the schema,
  roles, and RLS policies that match this snapshot.

## What this branch does NOT contain

- The actual production data. A separate backup (`data.sql` + `roles.sql` —
  data and cluster roles only, no schema) was taken around this same date and
  is stored outside this repository.

## To restore/inspect this snapshot

1. Check out this branch (or a copy of it) to get the codebase and the
   matching `supabase/migrations/`.
2. Apply those migrations to a fresh Postgres/Supabase project to recreate
   the schema, roles, and RLS policies as they were at this point in time.
3. Restore the corresponding data backup (`data.sql`, then `roles.sql`) into
   that project.
