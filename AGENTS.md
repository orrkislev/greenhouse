# AGENTS.md

Entry point for coding agents working on **Greenhouse** (החממה). Read this first, then
the rulebook in [`docs/rules/`](docs/rules/).

## What this is

Greenhouse is a Hebrew-language (RTL) school management system — students, projects,
research, study paths, schedules, reports and staff tooling. Next.js 16 App Router +
React 19 + Supabase. JavaScript only, no TypeScript.

## Commands

```bash
# First-time setup (full instructions in README.md)
npm install
npx supabase start        # prints Publishable + Secret keys → copy into .env.local
npm run db:reset          # migrations + seed; all users log in with PIN 1111
npm run dev               # http://localhost:3000

npm run build
npm run lint

# Schema change: edit in Studio (http://localhost:54323), then capture
npx supabase db diff -f <migration_name>
npx supabase db push      # deploy migrations to production
```

Docker Desktop must be running. `npm run dev` without `npx supabase start` fails
opaquely — the app has no offline fallback.

There is no test runner and no test files.

## Environments

- **Local** — Supabase in Docker, `.env.local`, Studio at `http://localhost:54323`.
- **Production** — Vercel + Supabase Cloud. Migrations must be pushed before or with
  the code deploy, or the live app throws "column not found".

## Where things live

```
app/
  (app)/            auth-protected group — layout wraps everything in <WithAuth>
    (main)/         dashboard
    project/ research/ study/ schedule/ report/ staff/ vocation/ admin/ topic-bank/
  api/              minimal route handlers (thumbnail, google-config)
  print_report/     print view, outside auth
  screen/           public hallway-display view, outside auth
  layout.jsx        sets lang="he" dir="rtl" globally

components/         shared UI primitives
components/ui/      shadcn output — generated, not hand-edited
utils/store/        Zustand stores, one per domain — the client data layer
utils/actions/      server actions ('use server') — all backend logic
utils/supabase/     client / server / admin clients + schema allow-lists
supabase/           migrations + seed.sql
docs/rules/         the coding rulebook
```

`@/*` resolves to the project root (`jsconfig.json`).

## The one rule to know before writing anything

All data fetching and saving lives in `utils/store/*` or `utils/actions/*`.
Components never query Supabase, and never receive shared state as props — they
subscribe to the store themselves. See [`docs/rules/development.md`](docs/rules/development.md).

## Git workflow

`main` is branch-protected — **direct pushes are rejected, for everyone**.

1. Branch from current `main` (`feature/...`, `fix/...`, `chore/...`).
2. Open a PR into `main`.
3. Needs 1 approval from anyone on the team, and a green `build` check, to merge.

Migrations are the exception: `supabase db push` goes straight to production and must
land *before* the PR merges. Full rules — reviewing, emergency unlock, agent-specific
constraints — in [`docs/rules/git-workflow.md`](docs/rules/git-workflow.md).

## Release tracking

`NEXT_RELEASE.md` is the running list for the current release cycle.

- **Finishing a task** — move or add the item to `_Done (this release)_` at the
  bottom, marked `[x]`.
- **Scope creep** — if a task surfaces something useful but out of scope, do not
  build it. Add a concise item under Features / Bug Fixes / Improvements and tell
  the user. Keep the current task focused.

## Rulebook

- [`docs/rules/development.md`](docs/rules/development.md) — code style, data flow,
  errors, comments, database workflow, agent behavior.
- [`docs/rules/git-workflow.md`](docs/rules/git-workflow.md) — branches, PRs, reviews,
  migrations vs deploys, branch-protection settings.
- `docs/rules/design.md` — visual and UI rules. *(not written yet)*
