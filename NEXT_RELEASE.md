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
- [ ] save mechanism fails (sometimes) in project review
- [ ] update timestamp columns (in db) are not set, except on insert.
- [ ] Show final project for 4th year students that have one this year
- [ ] Silent failures: `useEvents.js`, `useGantt.js`, `useLogs.js`, `useTime.js` use bare `throw error` instead of `toastsActions.addFromError`, so the user sees nothing
- [ ] `useStudy.js`: `updateStep` and `deleteStep` use a no-op `map(path => path.id === pathId ? path : path)` and mutate in place — state updates work by accident
- [ ] `npm run db:reset` is a PowerShell-only script — the README setup path is broken on macOS

## Improvements
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
