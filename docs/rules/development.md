# Development Rules

How code is written in this repo. Read [`AGENTS.md`](../../AGENTS.md) first for the
project map and commands.

These rules describe what the codebase already does. Where the code contradicts them,
that's listed in [Known drift](#12-known-drift--to-fix) — those are bugs to fix, not
patterns to copy.

---

## 1. Language & file conventions

- **JavaScript only.** No TypeScript, no `.ts`/`.tsx`. `.js` for everything including
  components; `.jsx` is used only for layouts (`app/layout.jsx`, `app/(app)/layout.jsx`).
- 4-space indent. Quote style and semicolons vary between files — **match the file
  you're editing, don't reformat it.** Reformatting an untouched region is noise in
  the diff.
- Imports: `@/*` for anything outside the current feature folder, relative paths
  inside it.
- Naming:
  | Kind | Convention | Example |
  |---|---|---|
  | Component file | PascalCase | `ProjectGoals.js` |
  | Store | `use` + PascalCase | `useProject.js` |
  | Server action file | lowercase, **space** in the name | `admin actions.js` |
  | Sub-section component | `Section_` prefix | `Section_Questions.js` |
  | Migration | `YYYYMMDDHHMMSS_snake_case.sql` | `20260612000001_student_presence.sql` |

  The space in server-action filenames is deliberate and consistent across all seven
  files. Keep it.
- Feature layout: `app/(app)/<feature>/page.js` plus `app/(app)/<feature>/components/*`.
  Components used by exactly one feature live in that feature's folder, never in
  the shared `components/`.

---

## 2. The data layer — the core rule

**All fetching and saving logic lives in the store file.** Not in components — not
even "just this one query". Components never import `utils/supabase/client`.

If a component needs data no store exposes, the fix is a new action or selector in
the store. It is never a `useEffect` with a query inside it.

**Prop drilling is kept at zero.** A component that needs shared state subscribes to
the store itself. It does not receive that state as a prop, and a parent does not
fetch on a child's behalf. Props are for genuinely local, parent-owned config — an
`index`, a label, a layout variant — not for shared state or save handlers.

The model is `app/(app)/research/components/sections/*`: every section reads
`useResearchData(state => state.research)` on its own and calls
`researchActions.updateSections(...)` on its own. The parent renders
`<Section_Questions />` with nothing passed down.

### Store anatomy

Every store in `utils/store/` follows the same shape (see `useProject.js`,
`useEvents.js`):

```js
export const useXData   = create((set, get) => ({ … }))                   // state + async ops
export const xActions   = createStoreActions(useXData)                    // imperative, callable anywhere
export const useX       = createDataLoadingHook(useXData, 'x', 'loadX')   // component hook, auto-loads
export const xSelectors = { … }   // pure (data, args) => data   — see eventSelectors
export const xUtils     = { … }   // pure derivations             — see projectUtils.getContext
```

The three helpers come from `utils/store/utils/storeUtils.js`. Use them; don't
hand-roll equivalents.

### Rules that follow

- **Read with a selector.** `useProjectData(state => state.project)`. Never subscribe
  to the whole store — it re-renders on every unrelated change.
- **Mutate through actions.** `projectActions.updateProject({...})`. Never call `set`
  from a component.
- **Reset on user switch.** Every store starts its `create` body with:
  ```js
  useUser.subscribe(state => state.user?.id, () => set({ project: null, tasks: [] }));
  ```
  Staff impersonation (`switchToStudent`) depends on this. A new store without it
  will leak the previous student's data into the next student's view.
- **Wrap user-dependent actions in `withUser`.** It injects the current user as the
  first argument and no-ops when there is none:
  ```js
  loadProject: withUser(async (user) => { … })
  ```
  Don't read `useUser.getState().user` inline in an action.
- **Cross-store reads use `getState()`, never a hook**: `useTime.getState().currTerm`.
  Hooks in a store body would break the rules of hooks.

---

## 3. Writing to Supabase

- **Always run the payload through `prepareForXTable()`** from
  `utils/supabase/schema.js` before an `insert` or `update` on a mapped table. These
  are field allow-lists. A key that isn't listed is silently dropped — no error, no
  warning, the write just quietly loses data.
- **Optimistic then persist.** Set local state first, fire the network call second:
  ```js
  updateProject: async (updates) => {
      set(state => ({ project: { ...state.project, ...updates } }));
      get().updateOnSupabase();
  }
  ```
- **Debounce at the store, not in the component.** High-frequency saves go through a
  store-level `debounce(fn, 1000)` from lodash — see `useProject.updateOnSupabase`
  and `useResearch.updateOnSupabase`.
- **Use `updateOrThrow()`** from `utils/supabase/utils.js` when a silent no-op would
  be dangerous. A plain Supabase `update` reports an RLS-blocked write as a *success*
  with zero rows affected; `updateOrThrow` turns that into an error.
- **Relationships are FK columns, not join tables.** A task's owner is
  `tasks.project_id` / `tasks.study_path_id` / `tasks.group_id` — a plain
  `.eq('project_id', id)` to read, `ON DELETE CASCADE` to clean up. There was a
  generic `links` join table; it was removed in `20260811000001_tasks_owner_columns.sql`
  because it cost extra round-trips on every write, blocked PostgREST embedding, and
  orphaned rows on every parent delete. Don't reintroduce one — add a column.
- **Complex or multi-table reads are Postgres RPCs** defined in migrations —
  `get_user_events`, `get_user_recurring_events`, `group_full_state`,
  `get_user_groups`. Prefer extending an RPC over issuing N round-trips from the
  client. Conversely, don't reach for an RPC when a filtered select will do.

---

## 4. Server actions

- `'use server'` on the first line, file lives in `utils/actions/`.
- Two clients, from `utils/supabase/server.js`:
  - `getSupabaseServerClient()` — the user's cookies, **RLS applies**.
  - `getSupabaseAdminClient()` — service role, **RLS is bypassed entirely**.
- **Any action using the admin client must authenticate and authorize the caller itself,
  and must never trust a user id passed in as a parameter.** RLS is not protecting you
  there, and server actions are HTTP endpoints anyone can call with arguments of their
  choosing. This is non-negotiable — see [`security.md`](security.md) for the pattern to
  copy and a real example of what happens without it.
- Server actions **throw**. The calling store catches and toasts.

---

## 5. Errors & user feedback

- Client-side failures go to a toast with a **Hebrew** context string:
  ```js
  if (error) toastsActions.addFromError(error, 'שגיאה בטעינת הפרויקט');
  ```
  This is the dominant pattern — roughly 90 call sites.
- `addFromError` deliberately swallows Postgres `23505` (duplicate key) and `23502`
  (not-null) as non-events. Don't add local special-casing for those codes.
- Success: `toastsActions.addToast({ message: 'נשמר בהצלחה!', type: 'success' })`.
- A bare `throw` inside a store means the user sees nothing at all. New code toasts
  instead. (~19 legacy sites remain — see [drift #4](#12-known-drift--to-fix).)
- `console.log` is not a feedback mechanism. Eight exist; they shouldn't grow.

---

## 6. Components

- `'use client'` goes on `page.js` and `layout.jsx` files under `(app)/`. Leaf
  components inherit it — don't paste the directive into every file. (Current split:
  51 files have it, ~140 don't.)
- Function components. Default export for the main component, named exports for
  co-located sub-components — `ProjectDashboard.js` also exports `ProjectImage` and
  `ProjectName`.
- **Views within a page switch on local state + a `?view=` search param, not routes:**
  ```js
  const viewParam = useSearchParams().get('view');
  const [view, setView] = useState(viewParam || 'dashboard');
  useEffect(() => { if (viewParam) setView(viewParam); }, [viewParam]);
  ```
  This keeps deep links working (staff pages link straight into a student's section)
  without a route explosion. See `project/page.js` and `report/page.js`.
- **Config-driven over hardcoded.** `utils/reportConfig.js` is the model: section
  lists, print page layouts and staff-table columns are *data*, and the page maps
  over them. When UI varies by year / semester / role, extend the config rather than
  growing an `if` chain in the component.
- Shared primitives go in `components/`. `components/ui/` is shadcn output — regenerate
  it, don't hand-edit it.

---

## 7. Styling — mechanics

Which container and how things are arranged is [`design.md`](design.md); what things look
like — type, colour, borders, spacing — is [`styling.md`](styling.md). This section is
only about *how* styles are attached.

- Tailwind 4 utility classes, written inline in JSX.
- `cn()` from `utils/tw.js` merges conditional classes (`clsx` + `tailwind-merge`).
- Repeated or state-dependent styling uses the local `tw` proxy — a tagged template
  that returns a styled component:
  ```js
  const DashboardPanelButtonBase = tw`relative text-xs rounded-full px-3 py-2
      ${props => props.$active ? 'bg-ghwhite font-semibold' : ''}
  `;
  ```
  Props prefixed with `$` are interpolated into the class string and **stripped before
  reaching the DOM** (`filterProps` in `utils/tw.js`). That's what `$active` is for —
  a plain `active` prop would leak an unknown attribute onto the element.
- **No Emotion, no styled-components, no CSS modules.** `@emotion/*` is in
  `package.json` but is imported nowhere; don't start.
- `dir="rtl"` is global. Prefer logical properties (`ps-`/`pe-`, `start`/`end`) in new
  layout code. Be aware that `left`/`right` in existing code mean *visual* left/right
  under RTL, not logical start/end.

---

## 8. Comments

Of 496 existing comments, exactly 2 are in Hebrew. The convention is settled:

- **Comments in English. UI strings in Hebrew.** No exceptions in either direction.
- **Comment the *why*, not the *what*.** Good examples already in the tree:
  - `utils/store/useProject.js` — why `master` needs a shape check before saving.
  - `utils/supabase/utils.js` — why `updateOrThrow` exists at all.
  - `utils/reportConfig.js` — the legend for the four `status` states.
- Long store and config files use section banners:
  ```js
  // ------------------------------
  // ------ Project Tasks ---------
  // ------------------------------
  ```
- `// DIRTY HACK:` for knowingly-wrong code, and it must explain the constraint that
  forced it. Existing example: the 0-100 → 25-100 radar rescale in `report/Term.js`.
- `// TODO:` only with a concrete next step. Anything bigger belongs in
  `NEXT_RELEASE.md`.
- **Delete commented-out code.** 34 blocks are rotting in the tree already; git has
  the history. Don't add more, and clear them out of any region you're editing anyway.

---

## 9. Dependencies & scope

- **No new dependency without asking.** 45 are already installed — check first.
  lodash, date-fns, motion, lucide-react, recharts and zod cover most needs.
- Scope creep goes to `NEXT_RELEASE.md`, not into the diff. See the release-tracking
  section in `AGENTS.md`.

---

## 10. Database changes

Full workflow in `README.md` → *Schema Change Workflow*. In short:

1. Make the change in local Supabase Studio (`http://localhost:54323`).
2. Capture it: `npx supabase db diff -f <feature_name>`. Don't hand-write a migration
   that Studio could have generated.
3. **Update `utils/supabase/schema.js` in the same commit.** A new or renamed column
   that isn't added to the matching `prepareForXTable` allow-list is silently dropped
   on every write — no error, no warning. This is the single easiest way to ship a bug
   in this codebase.
4. RLS is on. A new table needs its policies in the same migration.
5. Push to production *before or with* the code deploy: `npx supabase db push`.

Two hard don'ts, both from painful experience documented in the README:

- **Never run `npx supabase db reset` directly** — use `npm run db:reset`, which works
  around a CLI crash on `seed.sql` (SQLSTATE 08P01).
- **Never write `seed.sql` through a shell redirect.** Export via the
  `docker exec` → `docker cp` pair in the README, or the Hebrew text is corrupted.

---

## 11. Agent behavior

How to work in this repo, as distinct from how the code should look.

- **Don't build, lint, typecheck, or run tests to "verify" a change** unless explicitly
  asked, or unless the task *is* the build. Read the code and trust it.
- **Don't add tests or a test runner.** None exists and none is planned. After a
  meaningful change, *suggest* what to test — the concrete steps or cases worth
  checking — and let the user decide. Suggesting is the deliverable; writing test
  files is not.
- **Running the app means running Supabase too.** `npx supabase start` must be up
  before `npm run dev`. Check `npx supabase status` before assuming the stack is
  running — against a dead local DB the app fails opaquely.
- Don't run the app or open a browser to check UI work unless asked.
- Read a file rather than running a command to learn something the file already states.
- **Don't commit or push until asked.** Leave finished work in the working tree and
  report it — the diff is how the user reviews you, and committing first removes that.
- **Never commit or push to `main`** — it is branch-protected and the push will be
  rejected. When asked to commit, use a branch. See
  [`git-workflow.md`](git-workflow.md), which has a section of hard rules for agents.

---

## 12. Known drift — TO FIX

Places where the code violates the rules above. These are **not** precedent — don't
copy them, and fix them when you're already in the file. Mirrored into
`NEXT_RELEASE.md`.

| # | Where | What | Fix |
|---|---|---|---|
| 1 | `report/page.js`, `report/Learning.js`, `report/SummerEvaluation.js`, `topic-bank/TopicBankManager.js`, `staff/english_report/page.js`, `StaffGroup_Evaluations.js`, `PrintReportPage.js`, `SideBar.js`, `TaskModal.js` | Import `utils/supabase/client` and query directly from the component — bypasses §2 entirely. | Move each query into a store or action. |
| 2 | `report/page.js` | Worst case of #1 and the last real prop-drilling site: the page owns `data` + `handleSave` and passes both down to all ten section components. | Extract a `useReport` store each section subscribes to; drop the props. |
| 3 | `useEvents.js`, `useGantt.js`, `useLogs.js`, `useTime.js` | Bare `throw error` instead of `toastsActions.addFromError` — the failure is invisible to the user. | Convert to toasts. |
| 4 | `package.json` → `db:reset` | PowerShell-only script. Unusable on macOS, so the README's documented setup path is broken on the current dev machine. | Add a shell equivalent. |
| 5 | `package-lock.json` | Present, but the standing instruction is pnpm-only. | Pick one and align. |
| 6 | ~34 sites, largest in `utils/supabase/server.js` | Commented-out code blocks. | Delete on touch. |
| 7 | `utils/gamification/`, `components/gamification/` | Both directories are empty. | Delete. |
| 8 | `useProject.js` → `continueProject` | Empty stub with a dangling `if (newTerm) { }` and a `// TODO`. | Implement or remove. |
| 9 | `package.json` | `@emotion/react`, `@emotion/styled`, `firebase`, `firebase-admin`, `react-google-picker`, `html2pdf.js` are imported nowhere in `app/`, `components/` or `utils/`. (The only `firebase` hit is a link URL in `Hannukah.js`, not an import.) | Verify and uninstall. |
| 10 | `useStudy.js` → `updateStep`, `deleteStep` | Both contain `state.paths.map(path => path.id === pathId ? path : path)` — a no-op map — then mutate the found object in place. State updates work by accident. | Rewrite as real immutable updates. |
