# Domain Model

What the words mean. Greenhouse (החממה) is a school; the code is full of terms that only
make sense if you know how the school works. Read this before writing a query.

The single most important fact: **"term" and "semester" are two different, unrelated time
systems**, and in Hebrew they sound similar. Getting them confused is the most likely way
to write a wrong query here. See [Time](#time).

---

## Glossary

| Hebrew | English / code | What it is |
|---|---|---|
| תקופה | **term** | A block of the school year — `terms` table |
| בין הזמנים | **between terms** | The gaps between terms. Not a term; a sentinel |
| מחצית | **report semester** | Evaluation period `A` or `B`. **Not a term** |
| פרויקט | **project** | A student's self-directed making project |
| חקר | **research** | A student's structured inquiry, alongside the project |
| תחום למידה | **study path** | A subject a student is teaching themselves |
| שלב | **step** | A stage in a study path — stored as a `task` |
| משימה | **task** | Unit of work; belongs to a project, study path, group, or nobody |
| מאסטר | **master** | The staff member guiding a *project* — `projects.master` |
| מנחה / חונך | **mentor** | Staff guiding a student generally — `mentorships` |
| הערכה | **report card** | Per-semester evaluation — `report_cards_private` |
| תעסוקה | **vocation** | A student's outside workplace and attendance |
| קבוצה | **group** | class, major, or club |
| מגמה | **major** | A specialisation group |
| חוג | **club** | An elective group |
| ניקוי רעלים | **detox** | The first term of the year |
| חניך | **student** | Literally "apprentice" — the school's word for its students |

---

## Time

Two systems. They do not align, they are not derived from each other, and both appear in
the UI with similar-sounding Hebrew names.

### Terms — `terms` table

Five rows, each with `name`, `name_en`, `start`, `end`:

| `name_en` | Hebrew |
|---|---|
| `detox` | ניקוי רעלים |
| `autumn` | סתו |
| `winter` | חורף |
| `spring` | אביב |
| `summer` | קיץ |

**Terms have gaps between them** — autumn can end on the 7th and winter start on the 23rd.
Those gaps are real school time, not an error. When "now" falls in a gap, `currTerm`
becomes the `BETWEEN_TERMS` sentinel (`{ id: '', name: 'בין הזמנים' }`) — note the **empty
string id**, so never use `currTerm.id` as a lookup key without checking.

`current_term` is a **database view**, not a column. The store loads from it on startup.

**`projects.term` is a `uuid[]`, not a single id** — a project can run across several
terms. Query it with `.contains('term', [termId])`, never `.eq()`.

### Report semesters — config, not a table

`A` and `B`. Stored in the `misc` config table (`report_semester_A` /
`report_semester_B`), with fallbacks in `REPORT_SEMESTER_DEFAULTS`:

| | Runs |
|---|---|
| A | Sep 1 – end of Feb (wraps the new year) |
| B | Mar 1 – end of Aug |

Consequences worth knowing:

- **Every date is in a semester.** The two *start* dates partition the year between them —
  each semester runs until the other begins — so `getSemesterId()` never returns `null`.
  The `end_month`/`end_day` values still exist for the admin UI to display a full window,
  but they don't decide the answer.
- The **academic year runs Aug–Jul and is named for its end year** — Aug 2025 to Jul 2026
  is academic year `2026`.
- A semester code combines them: `"2026A"`. That string is the `report_semester` key on
  every report card row.
- **Edge case, currently unresolved:** the academic year flips on Aug 1 but semester B runs
  through Aug 31, so July is `2026B` and August is `2027B`. If the academic-year boundary
  moved to Sep 1 the two would line up. Tracked in `NEXT_RELEASE.md`.

### Helpers — use these, never hand-roll

All in [`utils/store/useTime.js`](../../utils/store/useTime.js):

| Function | Returns |
|---|---|
| `getSemesterId(date?)` | `'A'` \| `'B'` — never null |
| `getAcademicYear(date?)` | `'2026'` |
| `getReportSemester(date?)` | `'2026A'` — never null |
| `previousSemester('2026A')` | `'2025B'` — wraps across the year boundary |
| `formatSemesterLabel('2026A')` | `"מחצית א' 2026"` |
| `getTermWeeks([termIds])` | week objects with `dates`, `isCurrent`, `weekNumber` |
| `dateRange(start, end)` | `'yyyy-MM-dd'` strings, inclusive |

Dates are `'yyyy-MM-dd'` strings in the DB and in most stores — `date-fns` `format`, not
`Date` objects, when comparing or keying.

---

## People

`users.role` is `student` or `staff`. **The `user_role` enum also contains `admin`, but no
row uses it** — an admin is `role = 'staff' AND is_admin = true`. Checking
`role === 'admin'` will silently match nobody. Use the helpers in `useUser.js`:

| Helper | Meaning |
|---|---|
| `isStaff()` | `role === 'staff'` |
| `isAdmin()` | staff **and** `is_admin` |
| `isVocationStaff()` | staff whose `title` contains `תעסוקה` |

Roughly 98 students, 25 staff, 3 admins.

`users` holds the account; `user_profiles` holds avatar, portfolio, CV, title and the
Google refresh token. `useUser` merges them into one flat object, so `user.avatar_url`
works even though it lives in the other table.

`staff_public` is a **view** exposing only `user_id, first_name, last_name, avatar_url` —
use it whenever a student needs to see staff, never the `users` table.

### Two kinds of guidance — don't conflate them

- **`projects.master`** — a single staff FK on a project. "Who is guiding this project."
  Joined as `master:staff_public!master(...)`.
- **`mentorships`** — a student↔staff table with `subject`, `description`, `is_active`,
  `started_at`/`ended_at`. A student can have several. Broader than one project.

## Groups

`groups.type` is `class` (5), `major` (3), or `club` (22). The enum also allows `custom`,
which is unused. Membership is `users_groups`.

- **class** (כיתה) — the year cohort. Its `description` holds the year number, which
  `reportConfig` uses to decide which report sections a student gets.
- **major** (מגמה) — specialisation.
- **club** (חוג) — elective.

Tasks can belong to a group via `tasks.group_id`, with `assigned_to` / `completed_by` as
uuid arrays.

## Student work

Four parallel tracks, all hanging off a student:

| | Table | Notes |
|---|---|---|
| **Project** | `projects` | status `draft\|active\|completed\|archived`; `term` is `uuid[]`; has a `master`; free-form content in `metadata` |
| **Research** | `research` | content in `metadata.sections` — questions, sources, quotes, vocabulary, summary, masters |
| **Study path** | `study_paths` | steps are rows in `tasks` linked by `study_path_id` |
| **Vocation** | `vocation` + `vocation_checkins` | outside workplace, contact, hours; check-ins record attendance |

Task ownership is a **FK column on `tasks`** — `project_id`, `study_path_id` or
`group_id`. A task with all three null is a personal task. (There used to be a generic
`links` join table; it was removed — see
[`development.md` §3](development.md#3-writing-to-supabase).)

`tasks.status` is `todo | in_progress | completed | archived | closed`. `archived` and
`closed` are both excluded from active views.

## Report cards

`report_cards_private` is keyed by **`(id, report_semester)`** — one row per student per
semester. Columns are JSON blobs, one per section:

`ikigai`, `mentors`, `liba`, `learning`, `vocation`, `special`, `end_eval`

`report_cards_public` is a **view** over it. The split is deliberate: the private table
carries staff-written evaluation content. Read the view unless you specifically need the
private side, and never widen the view casually.

Which sections a student sees depends on **class year × semester**, and that mapping is
**data, not code** — `SECTION_DEFS`, `DASHBOARD_SECTIONS` and `PRINT_REPORT_PAGES` in
[`utils/reportConfig.js`](../../utils/reportConfig.js). Add a section there, not with an
`if` in a component.

`end_eval` covers the end-of-year evaluation and carries a `type` discriminator
(`'pol'`, `'summer_eval_1b'`). It was renamed from `pol`.

Changes to `projects.metadata`, `research.metadata` and `report_cards_private` are
recorded in `audit_log` by triggers — readable via the `audit_log_readable` view.

## `misc` — the config table

Key + JSON. Current keys: `report_semester_A`, `report_semester_B`, `school_message`,
`study_groups`, `studySideContext`.

**App-level settings go here.** Don't create a settings table.

## Views are part of the API

`staff_public`, `current_term`, `report_cards_public`, `audit_log_readable`,
`audit_log_simple`. They're defined in migrations and the client reads them like tables.
Changing the underlying columns can break a view silently — check before you rename.

---

## See also

- Who is allowed to read what: [`security.md`](security.md)
- How this data is fetched and saved: [`development.md`](development.md)
