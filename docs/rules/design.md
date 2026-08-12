# Design Architecture

How the UI is composed: which container, which overlay, what goes where, how things are
arranged. This is about *structure and component choice*, not colour theory.

For code conventions see [`development.md`](development.md). Styling mechanics — the `tw`
proxy, `cn()`, `$`-prefixed props — are in [§7 there](development.md#7-styling--mechanics)
and not repeated here.

The app is Hebrew and `dir="rtl"` globally. Read [RTL](#rtl) before positioning anything.

---

## 1. Page skeletons

Three shells. Pick by whether the page has multiple views.

**`DashboardLayout`** — [`components/DashboardLayout.js`](../../components/DashboardLayout.js).
For a page with several views behind a tab strip. This is the dominant page type.

```jsx
<DashboardLayout>
  <DashboardPanel>
    <DashboardPanelButton onClick={() => setView('x')} $active={view === 'x'}>…</DashboardPanelButton>
  </DashboardPanel>
  <DashboardMain>{/* the active view */}</DashboardMain>
</DashboardLayout>
```

**`PageMain`** — exported from [`components/ContextBar.js`](../../components/ContextBar.js).
One scrolling surface, no tabs. The home dashboard and simple pages.

**`ContextBar`** — a collapsible side panel that sits *beside* the page shell, as a
sibling. Desktop only (`hidden md:flex`), 16rem open / 3rem collapsed.

```jsx
<>
  <DashboardLayout>…</DashboardLayout>
  <ContextBar name="מחציות" initialOpen={false}>
    <ReportContext />
  </ContextBar>
</>
```

Put in the ContextBar what is *about* the page but not *of* it: term/semester pickers,
related items, the "start something new" affordance. Never put primary content there —
it's invisible on mobile and collapsed by default on some pages.

Views inside a page switch on `useState` + a `?view=` param, not routes. See
[`development.md` §6](development.md#6-components).

## 2. Containers

| Use | When |
|---|---|
| **`Box2`** with `label` + `LabelIcon` | the default. A titled region of a page. |
| **`Box2`** with no label | a white panel that needs no title |
| **`Card`** (also in `Box2.js`) | same look, simpler — no label slot, no hover border |
| **`WithLabel`** | **not a container.** A small caption above a single field |
| plain `div` | anything *inside* a Box2 |

`Box2` is used in 29 files; it is the house container. Its label is deliberately quiet —
grey, small, and the icon only expands on hover (`w-0 group-hover/box:w-3`). Don't
reimplement a bordered white rounded panel; use `Box2`.

Nesting `Box2` inside `Box2` is not a pattern here. If a section needs internal grouping,
use spacing and a `WithLabel`, not a second border.

## 3. Arrangement

**The responsive rule, applied almost everywhere:** stack on mobile, grid on desktop.

```jsx
<div className="flex flex-col md:grid md:grid-cols-3 gap-2 auto-rows-fr">
```

- **Feature pages** — a 3-column grid of `Box2` sections, `auto-rows-fr` so they align.
  Sections claim space with `col-span-2` / `row-span-2`. See
  [`research/components/Research.js`](../../app/(app)/research/components/Research.js).
- **Home dashboard** — a 5-column grid where the schedule card is pinned
  (`col-start-1 row-start-1 row-span-4`) and the rest flow around it. See
  [`(main)/page.js`](../../app/(app)/(main)/page.js).
- **Vertical stacks** — `flex flex-col gap-3` inside a section; `gap-8` between major
  page regions; `gap-2`/`gap-4` for tighter groupings.
- **Horizontal pairs** — `flex flex-col-reverse md:flex-row justify-between gap-4`, so
  the secondary element drops *below* on mobile rather than above.

Grid class names must be **static strings**. `` className={`row-span-${n}`} `` does not
work — Tailwind scans source text and will never emit that class. There's a
commented-out example of exactly this bug in
[`MainNews.js`](../../app/(app)/(main)/components/MainNews.js).

## 4. Lists

The house list is a stack of rows with hover-revealed actions — not a table, unless the
data really is tabular (the report tables in `report/learning/` are the exception).

```jsx
<div className="flex flex-col">
  {items.map((item, i) => (
    <div key={i} className="flex justify-between items-center border-b border-border group/item">
      <TextInput value={item} onChange={v => update(i, v)} className="w-full" />
      <IconButton icon={Trash2} onClick={() => remove(i)}
        className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
    </div>
  ))}
  <div className="group/new p-2 cursor-pointer" onClick={add}>
    <Plus className="w-4 h-4 group-hover/new:rotate-90 group-hover/new:text-emerald-600 transition-transform" />
  </div>
</div>
```

Rules:

- **Separate rows with `divide-y divide-stone-200` on the container, or `border-b` on the
  row.** Not both, and not shadows.
- **Row actions are invisible until hover.** `opacity-0 group-hover/x:opacity-100`. This
  is near-universal here and keeps dense lists calm.
- **Name every group** — `group/question`, `group/source`, `group/task`. Bare `group` is
  ambiguous the moment lists nest, and nesting is common. ~25 named groups exist; follow
  the convention.
- **Adding is the last row**, a `Plus` that animates on hover. Not a button above the
  list.
- **Reordering** uses `Reorder.Group` / `Reorder.Item` with `useDragControls` and a
  `GripVertical` handle, and persists via `position`. See
  [`ListView.js`](../../app/(app)/project/components/Project%20Tasks/ListView.js).
- **Completed/inactive rows** stay in place, dimmed (`opacity-60`), not hidden.

## 5. Overlays

Everything overlay-shaped is built on **`usePopper`**
([`components/Popper.js`](../../components/Popper.js)). It portals to `document.body`,
dims and blurs the background, animates in and out, and nudges itself back on-screen when
it would overflow.

```jsx
const { open, close, Popper, baseRef } = usePopper()
<div ref={baseRef} onClick={open}>trigger</div>
<Popper>…</Popper>
```

**`baseRef` is the whole decision**: attach it and the panel appears anchored next to the
trigger; leave it off and the panel is centred as a modal.

| Need | Use |
|---|---|
| Menu of actions behind a `⋯` | `Menu` + `MenuList` / `MenuItem` / `MenuSeparator` |
| Panel anchored to a trigger | `usePopper` **with** `baseRef` |
| Centred modal | `usePopper` **without** `baseRef` |
| Edit a task | `TaskModal` |
| Destructive confirmation | `ConfirmDialog` |
| Hover hint | `components/ToolTip` |
| Search a long list | `components/ui/command` |
| Pick a project / study path | `ItemContextPicker` |

**Do not use `components/ui/popover.jsx`.** It's shadcn scaffolding that nothing imports;
`usePopper` is the real system. Same for `components/ui/dialog.jsx` — only `command.jsx`
uses it internally.

Two things about `usePopper` that look like mistakes and are not — the comments in the
file explain both, don't "fix" them:
- `PopperPortal` is defined at module level, so React doesn't remount the dialog on every
  parent render (which would replay the enter animation and break exit animations).
- The returned `Popper` is `useMemo(..., [])` with empty deps and reads live state from
  refs, for the same reason.

## 6. Sidebar and navigation

[`components/SideBar.js`](../../components/SideBar.js) is the app's spine. Desktop: a
fixed green rail. Mobile: an icon top-bar plus a hamburger sheet — both must be updated
together when a destination is added.

What earns a sidebar slot: a **top-level destination**, one route, with a lucide icon and
a Hebrew label. Nothing else. Actions don't go here; contextual things go in the
ContextBar.

- **Order and separators are meaningful.** Report · Home + Schedule · Study/Project/
  Research/Vocation · Staff/Admin. Keep new items inside the right group.
- **Active state** is an animated pill that slides in from the screen edge
  (`initial={{ x: '-100%' }}`), not a background colour swap.
- **Contextual sub-items** appear only on their own route — `pathname === '/study'`
  renders the user's study paths as `small` items. Use this for children of the current
  section, not for shortcuts.
- **Role gating** with `isStaff()` / `isAdmin()` from `useUser`.
- **Conditional slots** — `/report` only renders when `getSemesterId()` returns a
  semester.

### The marker dot

A two-element ping — a white `animate-ping` circle under a solid `bg-ghpurple` one — used
in exactly two places: `SideBarItem` and `DashboardPanelButton`. It means **"this needs
your attention"**, i.e. something is missing or unfinished. It is not a count and not a
generic "new" badge. Keep it rare; it stops working if everything pings.

## 7. Inputs and saving

- **`SmartTextArea`** for any multi-line text — it auto-grows with content. **`SmartText`**
  for single-line. Both are transparent-background and only show a surface on focus, so
  text reads as content until you touch it.
- **Text saves on blur** (`onBlur`), not per keystroke. Toggles, checkboxes and pickers
  save immediately.
- **Continuous edits** (sliders, drawing, rapid typing) go through the store's debounced
  `updateOnSupabase`, never a per-component timer. See
  [`development.md` §3](development.md#3-writing-to-supabase).
- Use `defaultValue` + `onBlur` for fields the store shouldn't re-render on every
  keystroke; `value` + `onChange` when it must stay controlled.

## 8. Feedback and empty states

- **Success and failure are toasts**, never inline banners —
  `toastsActions.addToast` / `addFromError`, Hebrew message. See
  [`development.md` §5](development.md#5-errors--user-feedback).
- **Empty state is a component, not a conditional string.** When a user has no research,
  `research/page.js` renders `<NoResearch />` — a full invitation to start one, not "no
  results". Follow that when adding a new empty case.
- **Destructive actions confirm** through `ConfirmDialog`. Its default `confirmLabel` is
  `'מחיקה'`, which also drives the red styling.
- **Loading** is generally not rendered. Stores start with empty arrays and the UI shows
  its empty state until data lands. Don't add spinners without a reason.

## 9. Colour, type and spacing

See [`styling.md`](styling.md) — type scale, the four colour families and which to use,
borders vs shadows, radius, spacing, icon sizes, hover states.

The two rules worth knowing before you write any markup: **default to `text-sm`**, and
**use a border, not a shadow**.

## 10. Motion

`motion/react`. Durations **0.15–0.2s**, `easeOut` or `easeInOut`. Anything slower feels
broken in a tool people use all day.

- Wrap conditional overlays in `AnimatePresence` or exit animations won't run.
- Standard overlay entrance: `{ y: 20, opacity: 0, scale: 0.98 }` → `{ y: 0, opacity: 1, scale: 1 }`.
- Lists that appear together stagger via `staggerChildren` or `delay: index * 0.1`.
- Hover affordances animate with CSS transitions, not motion.

## RTL

`dir="rtl"` is set once on `<html>` in `app/layout.jsx`. Everything inherits it.

- Tailwind's `left-*` / `right-*` / `border-l` / `border-r` are **physical**, not logical.
  They do not flip. Existing code uses them as *visual* directions and is correct as
  written — read them literally.
- The chrome convention: each side panel draws the border on the edge **facing the
  content**. `SideBar` sits visually right and uses `border-l`; `ContextBar` sits visually
  left and uses `border-r`.
- In an RTL flex row the first child renders rightmost. That's why `layout.jsx` orders
  `SideBar` then content, and pages render content then `ContextBar`.
- For genuinely new layout, logical utilities (`ps-`/`pe-`, `start`/`end`) are safer —
  but don't convert existing physical classes while doing something else; they're load-
  bearing.

---

## Known drift — TO FIX

Not precedent. Fix when you're already in the file.

| # | Where | What |
|---|---|---|
| 1 | `components/ToolTip.js` vs `components/ui/tooltip.jsx` | **Two tooltip systems.** The custom one in 2 files, the Radix one in 4 (all under `report/`). Pick one — the custom one has no dependency and matches the Popper approach. |
| 2 | `components/ui/popover.jsx` | Imported nowhere. Delete it. |
| 3 | `ListView.js`, and 2 others | Import from `framer-motion`, which is **not in `package.json`** — it resolves only as a transitive dep of `motion`. Switch to `motion/react` like the other 11 files. |
| 4 | `MainNews.js` | Commented-out `` `row-span-${groups.length}` `` — a dynamic class Tailwind can never emit. Left as a warning; delete it. |
| 5 | `globals.css` | A full dark-mode palette is defined but nothing toggles it — there is no theme switch. Either wire it up or drop it. |

Colour, font and CSS-level drift is listed in [`styling.md`](styling.md#known-drift--to-fix).
