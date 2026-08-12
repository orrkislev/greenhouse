# Styling

What elements look like — type, colour, borders, spacing, states. Which *component* to
reach for and how pages are arranged is [`design.md`](design.md); the mechanics of
attaching classes (`tw`, `cn()`, `$` props) are in
[`development.md` §7](development.md#7-styling--mechanics).

Numbers below are counts from the current codebase, not aspirations. When a convention
says "this is the default", it's because it's what the majority of files already do.

---

## The look, in one paragraph

Quiet, dense, and defined by **thin borders rather than shadows**. Small text — `text-sm`
and `text-xs` are 90% of all type. White panels on a light background, hairline
`stone-300`-ish borders, generous rounding on interactive pills and modest rounding on
panels. Almost nothing is coloured except state and role. Detail appears on hover:
actions fade in, icons grow, labels darken. Nothing announces itself.

If a new element feels louder than what's around it, it's wrong.

## Typography

**Body font is Noto Sans Hebrew**, loaded in `app/layout.jsx` via `next/font/google` and
applied to `<body>`. Don't set a font family on app UI — inherit it.

**David Libre is the print font.** Applied as a bare `david-libre` class (not
`font-david-libre`), only inside `app/print_report/`. See [Print](#print).

### Scale

| Class | Uses | For |
|---|---:|---|
| `text-sm` | 245 | **body default** — labels, list rows, buttons, most content |
| `text-xs` | 185 | secondary — descriptions, captions, metadata, menu items |
| `text-lg` | 32 | a section heading inside a panel |
| `text-2xl` | 23 | page titles |
| `text-xl` | 18 | subtitles, occasional emphasis |
| `text-base` | 9 | rare — usually means someone forgot the default is `sm` |

**Default to `text-sm`. Drop to `text-xs` for anything supporting.** `text-base` and up
are for headings only. This app is a dense tool, not a document.

### Weight

`font-bold` (102), `font-semibold` (68), `font-medium` (69). Use `medium` for a label
that needs slight lift, `semibold` for an active/selected state, `bold` for headings and
numbers that matter. Everything else stays at default weight — don't reach for
`font-light`, it's used twice and looks broken in Hebrew.

## Colour

Four families coexist. This is the honest state, and the last two rows are drift:

| Family | Where it belongs | Examples |
|---|---|---|
| **`gh*` brand** | app chrome only — sidebar, panel strip, page ground | `ghdark` `#285447`, `ghgreen` `#45907C`, `ghwhite` `#E4EEEA`, `ghpale` `#8AC0B4`, `ghpurple` `#502C60`, `ghglow` `#5DFC37` |
| **semantic** | content — **prefer these for anything new** | `border-border` (74), `text-muted-foreground` (141), `text-foreground` (55), `bg-accent`, `text-destructive` |
| `stone-*` | the de facto neutral in older components | `border-stone-300` (37), `text-stone-500` (52) |
| `gray-*` | same role as `stone-*`, different hue — mixed in by accident | `border-gray-300` (20), `text-gray-600` (27) |

**Rules:**

- **New content code uses the semantic tokens.** They're the only family with dark-mode
  values defined, and `border-border` is already the global default (see below).
- **New chrome uses `gh*`.** Sidebar, dashboard panel, page background.
- **Never introduce `gray-*`.** If you're editing a file that already uses it, leave it
  alone — but don't spread it. `stone-*` and `gray-*` side by side is visible as a
  slight temperature mismatch.
- Don't mix three families inside one component. Match the file you're in.

`globals.css` also defines full `primary-*` / `secondary-*` / `slate-*` scales. They're
essentially unused in app code. Don't start using them — they overlap confusingly with the
shadcn `--primary` / `--secondary` tokens of the same name.

### Role colour

Button colour comes from `data-role`, never hand-written classes. Defined once in
[`components/Button.js`](../../components/Button.js):

| Role | Colour |
|---|---|
| `edit` | indigo |
| `delete` | rose |
| `save` | emerald |
| `new` | green (outline) |
| `main-new` | green (filled — the primary action on a page) |
| `cancel` / `close` | stone |

```jsx
<Button data-role="delete">מחיקה</Button>
```

Status colour elsewhere follows the report convention: red = missing, orange = partial,
yellow = needs staff action, green = complete. See `utils/reportConfig.js`.

## Borders, radius, shadows

**Borders do the work here.** `globals.css` sets `* { @apply border-border }` globally, so
a bare `border` already gets the semantic colour — you only need `border-stone-300` to
deliberately deviate.

| Radius | Uses | For |
|---|---:|---|
| `rounded-full` | 107 | pills, icon buttons, chips, avatars, tabs — **the signature shape** |
| `rounded-lg` | 65 | modals, cards, menu surfaces |
| `rounded-md` | 53 | menu items, inputs, small surfaces |
| `rounded-xl` | 13 | `Box2` and `Card` |
| `rounded-sm` | 16 | buttons |

`--radius` is `0.625rem` (10px); `sm`/`md`/`lg`/`xl` derive from it.

**Shadows are almost absent — about 28 uses in the entire app, nearly all on overlays.**
A panel gets a border, not a shadow. `shadow-sm` on a popper, `shadow-lg` on a confirm
dialog, and that's the vocabulary. Adding a shadow to an in-page element will make it look
foreign.

## Spacing and density

- **Padding**: `p-1` (tight icon buttons), `p-2` (default interactive), `p-4` (panel
  interiors — `Box2` uses `p-4`), `p-6`/`p-8` (page-level and print).
- **Gaps**: `gap-1` inside a control, `gap-2` between related items, `gap-3`/`gap-4`
  between cards in a grid, `gap-8` between major page regions.
- Prefer `gap` on a flex/grid parent over margins on children.

## Icons

**lucide-react**, always. `@iconify/react` exists for the user-facing icon *picker* only —
don't use it for chrome.

| Size | Uses | For |
|---|---:|---|
| `w-4 h-4` | 146 | **the standard** — buttons, list rows, menu headers, sidebar |
| `w-3 h-3` | 28 | small/inline — menu items, dense rows, `small` variants |
| `w-5 h-5` | 9 | mobile top-bar |
| `w-6 h-6`+ | 16 | empty states and feature illustrations |

`Button` auto-sizes any nested SVG to `size-4`, so inside a `<Button>` you don't need to
size the icon at all.

## Interaction states

**The house idiom is hover-reveal.** Detail is hidden until the pointer is on the row:

```jsx
<div className="group/item">
  <IconButton icon={Trash2} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
</div>
```

Variations already in use — pick one, don't invent a third:
- fade in: `opacity-0 → group-hover:opacity-100`
- grow from nothing: `w-0 → group-hover/box:w-3` (the `Box2` label icon)
- darken: `text-stone-500 → group-hover/box:text-stone-800`
- rotate on add: `group-hover/new:rotate-90` on a `Plus`

**Always name the group** (`group/item`, not bare `group`) — lists nest constantly here.

**Transitions**: `duration-200` (33 uses) and `duration-300` (34) are the norm.
`duration-500` is for the ContextBar collapse only. CSS transitions cover hover states;
`motion/react` covers mount/unmount at 0.15–0.2s (see
[`design.md` §10](design.md#10-motion)).

**Hover surface**: `hover:bg-stone-100` / `hover:bg-stone-200` for neutral controls,
`hover:bg-accent` in semantic components. **Focus**: `outline-none` plus
`focus-visible:ring-ring/50 focus-visible:ring-[3px]`, already baked into `Button`.

**Cursor**: interactive `div`s need an explicit `cursor-pointer` — much of this UI is
clickable divs rather than buttons, and the cursor is the only affordance.

## Inputs

Inputs are **transparent until touched**. `SmartText` / `SmartTextArea` render with
`bg-transparent` and no border, gaining `focus:bg-white/50` on focus, so text reads as
content until you interact with it.

For a bordered field, the pattern is an invisible outline that appears on hover:

```jsx
className="bg-white border border-border p-2 outline outline-transparent
           hover:outline-stone-300 focus:outline-stone-300 rounded-sm transition-all duration-200"
```

Disabled: `disabled:pointer-events-none disabled:opacity-50`.

## Decorative utilities

Defined in `globals.css`, use sparingly:

| Class | Effect |
|---|---|
| `.stripes` | 45° diagonal hatch, 1rem pitch — marks blocked/unavailable time |
| `.grid_bg` | graph-paper grid fading out to the right |
| `.grain` | SVG turbulence noise texture |
| `.flashing` | 2s opacity pulse — attention, use almost never |
| `.custom-delay` | 0.5s transition delay **only on hover-in**, for reveals that shouldn't fire on a passing cursor |

`BGGrads` in `ContextBar.js` renders blurred pastel blobs as a page background. It's
currently commented out in the app layout — leave it that way unless asked.

## Print

`app/print_report/` is a **different visual system** and does not follow the rules above.

- Page is a fixed `w-[793px] h-[1122px]` — A4 at 96dpi.
- Type is in **points**, not Tailwind steps: `text-[18pt]` section titles, `text-[14pt]`
  headings, `text-[12pt]` body, `text-[11pt]` dense.
- Font is `david-libre` (serif), not the app's Noto Sans.
- `[data-report-page]` strips all outlines so focus rings don't print.

Don't import app components into print pages or vice versa; the two systems will fight.

---

## Known drift — TO FIX

| # | Where | What |
|---|---|---|
| 1 | `app/layout.jsx` | David Libre is loaded via a render-blocking `<link>` on **every page**, but is only used in `print_report/`. Move it to the print route or self-host it. |
| 2 | `globals.css` `--font-sans` | Set to `'Segoe UI', Roboto…`, which conflicts with the Noto Sans Hebrew applied to `<body>`. The 10 `font-sans` uses in app code silently switch font mid-page. |
| 3 | app-wide | `gray-*` and `stone-*` used interchangeably (~37 vs ~100 uses) — two neutral families with different temperature. Consolidate on the semantic tokens. |
| 4 | `globals.css` lines ~248–450 | ~200 lines of hand-written `.col-1`…`.row-end-10` duplicating Tailwind's own grid utilities. Check whether anything still uses them, then delete. |
| 5 | `globals.css` | `primary-*`, `secondary-*` and `slate-*` scales are defined and effectively unused, and their names collide with the shadcn `--primary` / `--secondary` tokens. |
| 6 | `tailwind.config.js` | Declares `fontFamily["david-libre"]`, but print code uses the bare `.david-libre` CSS class instead — so `font-david-libre` is dead config. |
