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

## Improvements
- [ ] limit number of topics in learning report
- [ ] Ikigai warnings: limit number of items, duplicate items
- [ ] Add Undo to ikigai and pages containing radar chart / slider

---

_In progress_


_Done (this release)_

- [x] End-of-year read-only mode: `readonly_mode` flag in `misc` table triggers DB-level RLS write-blocking for students across all data tables (projects, research, tasks, study_paths, user_profiles, users, groups, users_groups, events, event_participants, misc); staff/admins always have full write access
- [x] PIN login security hardening: `pinLoginAllowed` flag in `misc` controls student PIN access; staff PIN login permanently blocked; auth logic moved to `signInWithPin` server action in `utils/actions/auth actions.js`
- [x] To activate end-of-year mode: `UPDATE misc SET data='{"enabled":true}'::jsonb WHERE name='readonly_mode'` + same with `false` for `pinLoginAllowed`

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
