# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup: install deps, start Supabase, create .env.local (see README), populate DB
npm install
npx supabase start        # prints Publishable + Secret keys → copy into .env.local
npm run db:reset          # applies migrations + seed; users login with PIN 1111
npm run dev

# Build & lint
npm run build
npm run lint

# Database: reset local DB (wipes all local data, re-applies migrations + seed + auth users)
npm run db:reset

# Database: capture a schema change as a migration after editing via Supabase Studio
npx supabase db diff -f <migration_name>

# Database: push migrations to production
npx supabase db push

# Seed export — write inside container first to avoid host encoding issues, then copy out
docker exec supabase_db_greenhouse pg_dump --data-only --username postgres --schema public -f /tmp/seed_new.sql
docker cp supabase_db_greenhouse:/tmp/seed_new.sql supabase/seed.sql
```

There are no test files or test runner configured in this project.

## Architecture

**Greenhouse** is a Hebrew-language (RTL) school management system built with Next.js 16 App Router + React 19. It manages students, projects, research, study paths, schedules, and staff reports.

### Environments
- **Local dev**: Supabase running in Docker (`supabase start`), `.env.local` with local keys, Supabase Studio at `http://localhost:54323`
- **Production**: Vercel + Supabase Cloud; migrations must be pushed (`supabase db push`) before or alongside code deploys to avoid schema drift

### Route structure (`app/`)
Uses Next.js route groups. The `(app)/` group is auth-protected:
- `(app)/(main)/` — dashboard
- `(app)/project/` — project management
- `(app)/research/` — research tracking
- `(app)/schedule/` — schedule builder
- `(app)/study/` — study tracking
- `(app)/report/` — learning reports
- `(app)/staff/` — staff view & English reports
- `(app)/vocation/` — career planning
- `(app)/admin/` — admin panel
- `api/` — minimal API routes (thumbnail generation)
- `print_report/`, `screen/` — public/print routes outside auth

Root layout (`app/layout.jsx`) sets `lang="he"` and `dir="rtl"` globally.

### State management (`utils/store/`)
Zustand stores, one per domain: `useAdmin`, `useEvents`, `useGantt`, `useGoogleCalendar`, `useGroups`, `useProject`, `useResearch`, `useStudy`, `useTime`, `useToasts`, plus user stores. Stores are the primary data layer on the client.

### Server actions (`utils/actions/`)
All backend logic lives here as async server action files — not in API routes:
- `auth.js` — email/password (@chamama.org domain)
- `admin actions.js` — admin ops
- `google actions.js` — Google Calendar & Drive integration
- `storage actions.js` — cloud storage
- `gantt actions.js` — Gantt chart data
- `ai actions.js` — AI features

### Database (`supabase/`)
PostgreSQL 17 via Supabase with RLS enabled. Migrations in `supabase/migrations/`, seed data in `supabase/seed.sql`. Key tables: `users`, `projects`, `research`, `groups` (type: `'class'`, `'major'`, `'club'`), `events`, `misc` (app config), `audit_log`.

### Key libraries
- **UI**: Tailwind CSS 4 + shadcn/ui (`components/ui/`) + Radix UI primitives + Emotion for styled components
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts; **Drag-and-drop**: Atlaskit Pragmatic DnD; **Drawing**: Tldraw
- **Dates**: date-fns; **Export**: ExcelJS (xlsx), jsPDF + html2canvas (PDF)
- **Auth**: Firebase (primary) + Supabase Auth
- **External**: Google APIs (Calendar, Drive, Workspace Picker), GetImg API

### Path aliases
`@/*` maps to the project root (configured in `jsconfig.json`).

## Release tracking (`NEXT_RELEASE.md`)

`NEXT_RELEASE.md` in the project root is the running list of planned and completed work for the current release cycle.

**When you finish a task:** move or add the completed item to the `_Done (this release)_` section at the bottom of the file, marked `[x]`.

**When you encounter scope creep:** if a bug fix or task surfaces something that would be useful but is clearly out of scope for the current task, do not implement it. Instead, add a concise item to the appropriate section of `NEXT_RELEASE.md` (Features, Bug Fixes, or Improvements) and note it to the user. Keep the current task focused.
