# Next Release

## Features
- [ ] Track student report status in staff pages
- [~] Add assistance/legend in report pages
- [ ] Allow more than one review per project (for longer projects that span more than one term) 
- [ ] Add end_eval (summer/POL) indicator to StaffGroup_Evaluations table (missing/complete, label by end_eval.type)
- [x] Spring evaluation for 1st year - spring project
- [ ] spring evaluation for 2nd year - final review for long (winter-spring) project
- [ ] (later) report printing

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

- [x] Fix `report_cards_public` view: multi-term projects now read review data from `review_<term>` key (e.g. `review_spring`) instead of always checking the generic `review` key; also set `name_en = 'autumn'` for the autumn term (was missing) and guard against null `name_en` in `ProjectReview.js`
- [x] Summer evaluation for 1st year semester B — portfolio (content + design + review) and majors acceptance (major dropdown, presentation + reflection sliders + review) with radar chart; stored in `end_eval` column (renamed from `pol`) with `type: 'summer_eval_1b'`
- [x] Renamed `pol` DB column to `end_eval`; added `type` field to POL save payload (`type: 'pol'`)
- [x] alignment issues in report Learning tables
