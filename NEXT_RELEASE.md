# Next Release

## Features
- [ ] Track student report status in staff pages
- [~] Add assistance/legend in report pages
- [ ] Allow more than one review per project (for longer projects that span more than one term) 
- [ ] Add end_eval (summer/POL) indicator to StaffGroup_Evaluations table (missing/complete, label by end_eval.type)
- [x] Spring evaluation for 1st year - spring project
- [ ] spring evaluation for 2nd year - final review for long (winter-spring) project
- [ ] (later) report printing — full styling pass on Report_POL.js and Report_Majors.js (currently placeholder)

## Bug Fixes
- [ ] **SECURITY — `vocation`, `vocation_checkins` and `event_participants` have RLS disabled.** The `anon` and `authenticated` roles can read *and write* every row. `vocation` holds `place_of_work`, `position`, `contact_name`, `contact_phone` and `work_hours` for 28 students; the anon key ships in the browser bundle and the repo is public. Introduced by `20260527000002_vocation_disable_rls.sql`. **Do not simply `ENABLE ROW LEVEL SECURITY`** — with no policies that blacks out the vocation feature entirely. Write the policies (student sees own, vocation staff and admin see all) and enable in the same migration.
- [ ] save mechanism fails (sometimes) in project review
- [ ] update timestamp columns (in db) are not set, except on insert.
- [ ] Show final project for 4th year students that have one this year
- [ ] Silent failures: `useEvents.js`, `useGantt.js`, `useLogs.js`, `useTime.js` use bare `throw error` instead of `toastsActions.addFromError`, so the user sees nothing
- [ ] `useStudy.js`: `updateStep` and `deleteStep` use a no-op `map(path => path.id === pathId ? path : path)` and mutate in place — state updates work by accident
- [ ] `npm run db:reset` is a PowerShell-only script — the README setup path is broken on macOS

## Improvements
- [ ] Academic year vs semester B boundary: the academic year flips on Aug 1 but semester B now runs through Aug 31, so July resolves to `2026B` and August to `2027B`. Moving the academic-year boundary to Sep 1 (`getAcademicYear`, `month < 8`) would align them — check the impact on existing `report_semester` keys first.
- [ ] `AdminYearSchedule.js` still edits `end_month`/`end_day` for each report semester, but `getSemesterId` now only uses the start dates. Either hide the end fields or relabel the card so it's clear only the start date matters.
- [ ] Four `getReportSemester() ?? '2026A'` fallbacks (`staff/english_report/page.js` ×2, `StaffGroup_Evaluations.js` ×2) are now dead — `getReportSemester()` no longer returns null. Remove them.
- [ ] David Libre is loaded via a render-blocking `<link>` in `app/layout.jsx` on every page, but is only used in `print_report/` — move it to the print route or self-host
- [ ] `--font-sans` in `globals.css` is `'Segoe UI', Roboto…`, conflicting with the Noto Sans Hebrew set on `<body>` — the 10 `font-sans` uses silently switch font mid-page
- [ ] `gray-*` and `stone-*` used interchangeably as neutrals (~37 vs ~100 uses) — consolidate on the semantic tokens
- [ ] ~200 lines of hand-written `.col-1`…`.row-end-10` in `globals.css` duplicate Tailwind's grid utilities — check usage, then delete
- [ ] `primary-*` / `secondary-*` / `slate-*` scales in `globals.css` are unused and their names collide with the shadcn `--primary` / `--secondary` tokens
- [ ] `tailwind.config.js` declares `fontFamily["david-libre"]` but print code uses the bare `.david-libre` CSS class — `font-david-libre` is dead config
- [ ] Two tooltip systems in use — `components/ToolTip.js` (2 files) and `components/ui/tooltip.jsx` (4 files, all under `report/`). Consolidate on one.
- [ ] `components/ui/popover.jsx` is imported nowhere — delete it (`usePopper` is the real overlay system)
- [ ] 3 files import from `framer-motion`, which is not in `package.json` — it only resolves as a transitive dep of `motion`. Switch them to `motion/react`.
- [ ] A full dark-mode palette exists in `globals.css` but nothing toggles it — wire up a theme switch or remove it
- [ ] ESLint is completely non-functional — `next lint` was removed in Next 16, and `npx eslint .` crashes on the `FlatCompat` shim in `eslint.config.mjs` (circular structure in `next/core-web-vitals`). Migrate to a native flat config using `@next/eslint-plugin-next`, fix whatever it surfaces, then add `lint` to `.github/workflows/ci.yml` as a second required check.
- [ ] limit number of topics in learning report
- [ ] Ikigai warnings: limit number of items, duplicate items
- [ ] Add Undo to ikigai and pages containing radar chart / slider
- [ ] Move component-level Supabase queries into stores/actions — 9 files still query directly (`report/page.js`, `report/Learning.js`, `report/SummerEvaluation.js`, `TopicBankManager.js`, `staff/english_report/page.js`, `StaffGroup_Evaluations.js`, `PrintReportPage.js`, `SideBar.js`, `TaskModal.js`). `TaskModal.js` needs a planning-store action that accepts a full task payload, not just a title.
- [ ] Extract a `useReport` store so report sections subscribe directly instead of receiving `data` + `handleSave` drilled from `report/page.js`
- [ ] Remove unused dependencies: `@emotion/react`, `@emotion/styled`, `firebase`, `firebase-admin`, `react-google-picker`, `html2pdf.js` (imported nowhere)
- [ ] Delete the 34 commented-out code blocks (largest in `utils/supabase/server.js`, `useProject.js`)
- [ ] Delete the empty `utils/gamification/` and `components/gamification/` directories
- [ ] `useProject.js`: `continueProject` is an empty stub with a dangling `if (newTerm) { }` — implement or remove
- [ ] Decide npm vs pnpm — `package-lock.json` is committed but the standing instruction is pnpm-only

---

_In progress_


_Done (this release)_

- [x] Report semesters now cover the whole year — A runs Sep–Feb, B runs Mar–Aug, and `getSemesterId()` never returns null. The two start dates partition the year (each semester runs until the other begins) instead of being two narrow windows with months of nothing between them, so the הערכות section no longer disappears from the sidebar for most of the year. Mirrored in the server-side copy in `app/screen/[groupId]/page.js`.
- [x] Removed the unused AI image generation action (`utils/actions/ai actions.js`, `generateImage` via GETIMG) — nothing imported it; README updated.
- [x] **Security fix** — `initializeReportSemester` (`utils/actions/report actions.js`) used the RLS-bypassing admin client, took `userId` as a caller-supplied argument with no auth check, and returned the full `report_cards_private` row. Since server actions are browser-reachable, any logged-in user who knew another student's uuid could read their private evaluation. Now authenticates the caller and requires them to be that user or staff.
- [x] `docs/rules/domain.md` — the school's model: the terms (תקופה, a table, with gaps, `projects.term` is a `uuid[]`) vs report semesters (מחצית, A/B date windows in `misc`) distinction and the helpers for both, the Hebrew↔English glossary, roles and the `user_role` enum trap, master vs mentorship, group types, the four student-work tracks, report card structure and the private/public view split, `misc` as the config table, and the list of views that are part of the API.
- [x] `docs/rules/security.md` — roles and helpers, staff impersonation and why every store must reset on user change, the server vs admin client split and the caller-check rule, RLS expectations for new tables, the routes that are public by design, secrets and which env vars are exposed, personal-data handling, and a checklist for changes that touch data.
- [x] `docs/rules/styling.md` — the visual layer: Noto Sans Hebrew for app / David Libre for print, the `text-sm`+`text-xs` type scale, the four colour families and which to use for chrome vs content, borders-not-shadows, the radius vocabulary (`rounded-full` is the signature shape), spacing, lucide at `w-4 h-4`, the hover-reveal idiom and transition durations, transparent-until-focus inputs, the decorative utilities, and print as a separate system. Six drift items filed.
- [x] `docs/rules/design.md` — design architecture rules: the three page skeletons (DashboardLayout / PageMain / ContextBar), when to use `Box2` vs `Card` vs `WithLabel`, the stack-on-mobile-grid-on-desktop arrangement rule, the hover-reveal list pattern, an overlay decision table built on `usePopper` (and which shadcn components are dead), what earns a sidebar slot and what the marker dot means, save-on-blur, the three colour families, motion timings, and RTL.
- [x] Git workflow for the growing team: `main` is branch-protected (no direct pushes, admins included), all work lands via PR with 1 approval from anyone plus a green `build` check, branches must be current with `main`, merged branches auto-delete. Added `.github/workflows/ci.yml` (build only — lint is broken, filed above) and `docs/rules/git-workflow.md` covering the loop, review checklist, migration-vs-deploy ordering, the emergency unlock, and hard rules for AI agents.
- [x] Removed the generic `links` join table — task ownership is now `tasks.project_id` / `tasks.study_path_id` FKs alongside the existing `group_id`, with `ON DELETE CASCADE`. Migration `20260811000001_tasks_owner_columns.sql` backfills from `links`, archives 82 tasks whose parent had already been deleted, rewrites `get_user_orphaned_tasks`, and drops `links` plus `get_linked_items`, `get_next_project_tasks`, `get_studypath_next_tasks` and `project_get_master` (all callerless). Fixes along the way: duplicate `deleteTask` in `useProject.js`, missing `unlinkTaskFromProject` (moving a task out of a project used to throw), `path.id === path.id` in `useStudy.unlinkStepFromPath`, and `useStudy.loadPaths` doing one RPC per path — now a single query.
- [x] Development rulebook: `AGENTS.md` as the agent-agnostic entry point, `docs/rules/development.md` as the coding rulebook (style, data layer, errors, comments, DB workflow, agent behavior), `CLAUDE.md` reduced to a pointer. Design rules still to come.
- [x] Screen page: new `?view=report` view showing report card completion status per student — each student gets a card with color-coded section indicators (green = done, orange = missing, yellow = partial); data fetched server-side via admin client (works unauthenticated); not part of the rotation
- [x] "תכנון" — daily task planning system: sidebar task panel (personal/assigned/project/study tasks), drag-to-date onto weekly and semester calendar columns, planned-task chips in day headers, merged events+tasks on homepage, tasks shown in screen student cards

- [x] Centralized all report section definitions in `reportConfig.js`: enriched `SECTION_DEFS` with `printComponent`/`printVariant`, added `DASHBOARD_SECTIONS` (full ordered dashboard nav per year×semester), `PRINT_REPORT_PAGES` (A4 page layout per year×semester), and helpers `getDashboardSections`/`getPrintPages`
- [x] `report/page.js` dashboard panel and main now fully config-driven via `getDashboardSections` — no hardcoded section buttons or views
- [x] `PrintReportPage.js` layout now fully config-driven via `getPrintPages` — semester B layouts include POL/Majors page; semester-aware projects section
- [x] `Report_Projects.js` is now semester-aware (uses `getYearSections` to determine which term sections to display); year 1-2 semester B now correctly shows spring project instead of autumn+winter
- [x] New print components: `Report_POL.js` and `Report_Majors.js` (placeholder — key text fields + RadarChart; full styling TODO)

- [x] Fix `report_cards_public` view: multi-term projects now read review data from `review_<term>` key (e.g. `review_spring`) instead of always checking the generic `review` key; also set `name_en = 'autumn'` for the autumn term (was missing) and guard against null `name_en` in `ProjectReview.js`
- [x] Summer evaluation for 1st year semester B — portfolio (content + design + review) and majors acceptance (major dropdown, presentation + reflection sliders + review) with radar chart; stored in `end_eval` column (renamed from `pol`) with `type: 'summer_eval_1b'`
- [x] Renamed `pol` DB column to `end_eval`; added `type` field to POL save payload (`type: 'pol'`)
- [x] alignment issues in report Learning tables
- [x] Learning report tables unified to row-based style: removed separate detail column, attached detail/application text to topic line, enforced 10pt minimum text, and replaced dashed row dividers with dashed topic-to-evaluation arrow connectors
