# Design System

Reference for all UI components in krisp-meeting-insights. Follow these patterns when building new views or modifying existing ones.

## Stack

- **Tailwind CSS 4** (utility-first, no custom CSS except `index.css` theme tokens)
- **shadcn/ui** primitives: Button, Badge, ScrollArea, Dialog, DialogContent, DialogTitle
- **Lucide React** icons
- **`cn()` utility** (`electron-ui/ui/src/lib/utils.ts`) for conditional className composition

## Color Tokens

Defined in `electron-ui/ui/src/index.css`. Three themes: `deep-sea`, `daylight`, `midnight`.

| Semantic Token | Tailwind Class | Usage |
|---|---|---|
| `--color-bg-base` | `bg-background` | Page background |
| `--color-bg-panel` | `bg-card` | Panel/card backgrounds |
| `--color-bg-elevated` | `bg-secondary`, `bg-muted` | Hover states, selected rows, group header backgrounds |
| `--color-text-primary` | `text-foreground` | Primary text |
| `--color-text-secondary` | `text-secondary-foreground` | Secondary text |
| `--color-text-muted` | `text-muted-foreground` | Metadata, labels, timestamps |
| `--color-line` | `border-border` | Borders and separators |
| `--color-accent` | `bg-primary`, `text-primary` | Active buttons, selection indicators |
| `--color-danger` | `bg-destructive` | Critical badges, delete actions |
| `--color-search-deep` | `border-l-[var(--color-search-deep)]` | Deep search result indicator |

## Layout

- **LinearShell**: top bar + nav rail + dynamic panels[] + optional chat sidebar
- **Panels**: flex row, first panel has fixed width (resizable), remaining panels flex-1
- **Chat sidebar**: appears on the right via `chatOpen` prop, fixed width (resizable)
- **Chat visibility**: show when meetings are selected OR when a thread has at least 1 meeting

## Component Patterns

### List Row
```
px-4 py-2 text-sm border-b border-border cursor-pointer hover:bg-secondary/60
```
- Use `border-b` separators between rows, never outlined cards
- Selection state: `bg-secondary` via `cn()`, not inline `style={}`
- Left accent border for special states: `border-l-2 border-l-[var(--color-accent)]`

### Group Header
```
px-4 py-1.5 text-xs font-semibold text-muted-foreground bg-secondary/60
```
- Subtle background tint to visually separate from rows
- Include per-group "Select all" / "Deselect all" text button when rows are checkable

### Section Header (panel top)
```
Container: px-4 py-3 border-b border-border
Title:     text-sm font-semibold
Subtitle:  text-xs text-muted-foreground
```

### Select All / Deselect All
```jsx
<Button size="sm" variant="outline" className="h-auto px-2 py-0.5 text-xs">
  {allSelected ? "Deselect all" : "Select all"}
</Button>
```
- Always use text labels, never icon-only buttons for bulk actions

### Group-By / Sort Buttons
```jsx
<Button
  size="sm"
  variant={active ? "default" : "outline"}
  className="h-auto px-2 py-0.5 text-xs"
>
  {label}
</Button>
```

### Metadata Text
```
text-xs text-muted-foreground
```
- Dates, scores, counts, attribution lines
- Monospace for numeric scores: `text-xs font-mono text-muted-foreground`

### Priority Badge
```
text-[0.6rem] font-bold px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground
```

### Status Badge
```jsx
<Badge variant="outline">{shorthand}</Badge>
<Badge variant={status === "open" ? "default" : "secondary"}>{status}</Badge>
```

### Indented Rows (under group headers)
```
pl-8 pr-4 py-2 text-sm border-b border-border
```

## Interaction Feedback

All `<Button>` components include built-in interaction states via the base cva class:

| State | Class | Effect |
|---|---|---|
| Hover | Per-variant (e.g. `hover:bg-primary/90`) | Background shift to signal interactivity |
| Active/pressed | `active:scale-[0.97]` | Subtle scale-down on click for tactile feedback |
| Disabled | `disabled:opacity-50 disabled:pointer-events-none` | Dimmed, non-interactive |
| Focus-visible | `focus-visible:outline-none` | Keyboard focus ring (browser default removed) |
| Transition | `transition-all` | Smooth animation across color and transform changes |

These are baked into the Button primitive — no per-usage overrides needed. For non-Button clickable elements (bare `<button>`, `<label>`, rows), add hover and active states explicitly:

```
cursor-pointer hover:bg-secondary/60 active:bg-secondary/80 transition-colors
```

## Do / Don't

| Do | Don't |
|---|---|
| Use `border-b border-border` row separators | Use `rounded-md border border-border` card outlines |
| Use text buttons for bulk actions ("Select all") | Use icon-only buttons for bulk actions |
| Use `text-xs` as the smallest readable size | Use `text-[0.65rem]` or smaller |
| Use `bg-secondary/60` for group header backgrounds | Use `bg-secondary/40` (too subtle) |
| Use `cn()` for conditional classes | Use inline `style={}` for selection state |
| Use semantic Tailwind classes (`bg-secondary`) | Use raw CSS variables in className strings |
| Keep horizontal padding consistent (`px-4`) | Mix `px-3`, `pl-6`, `pr-3` across views |

## Spacing Scale

| Element | Vertical | Horizontal |
|---|---|---|
| Section header | `py-3` | `px-4` |
| List row | `py-2` | `px-4` |
| Compact row (candidates) | `py-1.5` | `px-4` |
| Group header | `py-1.5` | `px-4` |
| Indented row | `py-2` | `pl-8 pr-4` |
| Inline button | `py-0.5` | `px-2` |

## File Locations

- Theme tokens: `electron-ui/ui/src/index.css`
- shadcn components: `electron-ui/ui/src/components/ui/`
- `cn()` utility: `electron-ui/ui/src/lib/utils.ts`
- Layout shell: `electron-ui/ui/src/components/LinearShell.tsx`
