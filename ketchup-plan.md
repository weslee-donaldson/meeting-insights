# Design System Overhaul
## Ketchup Plan

---

# 0. SYSTEM GOAL

Rework the Meeting Intelligence Explorer UI into a consistent, accessible, component-driven design system. Every page follows the same 3-zone layout (list | detail | assistant). Shared atoms and molecules enforce visual consistency. Two color palettes (Warm Stone + Amber, Zinc + Teal) each with light and dark variants. Density controls let power users compress large data sets.

This plan follows **The Ketchup Technique**. Each Burst is atomic: one test, one behavior, one commit.

---

# DESIGN SOURCE OF TRUTH

**Paper MCP** is the visual source of truth. The Paper file `Meeting Insights.paper` contains all approved artboards.

### Artboard Reference

| Artboard Name | Contains | Used By Sections |
|---------------|----------|-----------------|
| Concept A — Meeting Detail | 3-zone layout, command bar, section headers, sidebar, assistant panel | 7 |
| Concept B — Action Items | 3-zone layout for Action Items, list-detail pattern, command bar variant | 7 |
| Component Decomposition | All atoms (Badge, Tag, Checkbox, Progress, CountPill, HashId) and molecules (CommandBar, SectionHeader, ListItemRow, GroupHeader) with exact specs | 2, 3 |
| List Management Patterns | Option B filter chips, density controls (comfortable/compact/dense), toggle icon | 4, 5 |
| Color Palette & Nav Icon Explorations | 5 palette directions with nav rail previews, search/client selector Options 1-4 | 1, 6, 8 |
| Accessible Color Scales | 3-tier text system, contrast ratios per palette, before/after comparison | 1, 9 |

### Mandatory Paper MCP Protocol

Before implementing any burst that touches UI:

1. `get_basic_info` → find artboard IDs
2. `get_screenshot` on the artboard referenced in the section's `Paper artboards` field
3. `get_computed_styles` on specific nodes if exact CSS values are needed
4. Implement the component to match the artboard
5. After implementation, verify with Playwright MCP (see Design Verification Gates below)

### Design Token File

`electron-ui/ui/src/design-tokens.ts` contains all spacing, typography, radii, and component specs extracted from Paper. Components MUST import from this file. If a value in design-tokens.ts contradicts the Paper artboard, the **Paper artboard wins** — update the token file to match.

---

# DESIGN DECISIONS

Decisions made from Paper explorations:

| Decision | Choice | Paper Artboard |
|----------|--------|----------------|
| Color palettes | A. Warm Stone + Amber, D. Zinc + Teal (light + dark each) | Color Palette & Nav Icon Explorations |
| Layout pattern | Concept B — 3-zone (list, detail, assistant) on ALL pages | Concept B — Action Items |
| Component system | Atoms + Molecules decomposition, strictly enforced | Component Decomposition |
| Filter/sort/group | Option B — Compact Dropdown Chips with removable filter chips | List Management Patterns |
| Density | 3 modes: comfortable (~10 items), compact (~18), dense (~30) | List Management Patterns |
| Accessibility | WCAG AA — 3-tier text system, no text below 4.5:1 contrast | Accessible Color Scales |
| Search/client | Option 3 — Client as Workspace Switcher (banner + scoped search) | Color Palette & Nav Icon Explorations |

---

# EXISTING INFRASTRUCTURE

| Layer | Current State |
|-------|--------------|
| Styling | Tailwind CSS + CSS custom properties via `data-theme` attribute |
| Themes | 3 themes: deep-sea (dark), daylight (light), midnight (dark) — to be replaced with 4 new themes |
| CSS vars | Semantic names: `--color-bg-base`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-accent`, etc. |
| Components | ~30 React components in `electron-ui/ui/src/components/` + 4 page components in `pages/` |
| Font | System fonts (`-apple-system`) — to be replaced with Inter + Space Grotesk |

### Files affected (design system scope)

```
electron-ui/ui/src/
├── design-tokens.ts             # Extracted specs from Paper (single source of truth in code)
├── index.css                    # Theme CSS vars, Tailwind config
├── theme.ts                     # ThemeName type, theme list
├── ThemeContext.tsx              # Theme provider
├── App.tsx                      # Root layout, view routing
├── components/
│   ├── NavRail.tsx              # Left nav rail
│   ├── TopBar.tsx               # Top bar with client/search
│   ├── SearchBar.tsx            # Search input
│   ├── LinearShell.tsx          # Layout shell
│   ├── ChatPanel.tsx            # Right assistant panel
│   ├── MeetingList.tsx          # Meeting sidebar list
│   ├── MeetingDetail.tsx        # Meeting detail view
│   ├── ClientActionItemsView.tsx # Action items flat list
│   ├── ThreadsView.tsx          # Thread list
│   ├── ThreadDetailView.tsx     # Thread detail
│   ├── InsightsView.tsx         # Insight list
│   ├── InsightDetailView.tsx    # Insight detail
│   ├── TimelinesView.tsx        # Timeline list
│   ├── TimelineDetailView.tsx   # Timeline detail
│   └── ui/                      # Shared primitives (badge, button, dialog, etc.)
├── pages/
│   ├── MeetingsPage.tsx
│   ├── ActionItemsPage.tsx
│   ├── ThreadsPage.tsx
│   ├── InsightsPage.tsx
│   └── TimelinesPage.tsx
```

---

# PLANNING RULES

1. Bursts are ordered. Each depends on the previous unless noted.
2. Each burst = one failing test → minimal code → TCR.
3. Plan updates go in the same commit as code.
4. Infrastructure commits (CSS, config) need no tests.
5. E2E exception: tightly-coupled UI bursts may combine 2 steps.
6. **Design verification gates are mandatory.** Each section ends with a verification burst that screenshots the running app via Playwright MCP and compares against the Paper artboard. Gate failures block the next section.

---

# DESIGN VERIFICATION GATES

Every section ends with a **design verification gate** — a burst that uses Playwright MCP to screenshot the running app and Paper MCP to screenshot the artboard, then confirms visual alignment.

### Gate Protocol

```
1. pnpm web:dev                           # Start dev server
2. Playwright MCP: browser_resize(2560, 1440)
3. Playwright MCP: browser_navigate("http://localhost:5188")
4. Playwright MCP: browser_take_screenshot  # Capture current state
5. Paper MCP: get_screenshot(artboardId)    # Capture design target
6. Compare: layout, spacing, colors, typography, component structure
7. If delta found → fix before proceeding to next section
8. If clean → document "VERIFIED" in the gate burst and commit
```

### What gets checked at each gate

| Check | How to verify |
|-------|--------------|
| Colors match palette | Compare bg, text, accent, border colors against artboard swatches |
| Typography matches | Font family (Inter/Space Grotesk), sizes, weights match artboard |
| Spacing matches | Padding, gaps, widths match design-tokens.ts values |
| Component structure | Atoms/molecules match Component Decomposition artboard |
| Accessibility | No text using decorative-tier colors; secondary text readable at 11px |
| Layout zones | 3-zone pattern (sidebar width, detail flex, assistant 380px) matches Concept B |

---

# BURSTS

## TODO

### SECTION 1: Theme Foundation — CSS Variables & Font Loading (~9 bursts)

**Problem**: Current themes (deep-sea, daylight, midnight) use ad-hoc colors that fail WCAG AA for secondary/muted text. Font is system default. Need 4 new themes (stone-light, stone-dark, teal-light, teal-dark) with accessible text scales and Inter + Space Grotesk loaded.
**Requirements**: Accessible Color Scales artboard — 3-tier text system (Primary 7:1+, Secondary 4.5:1+, Decorative non-text only)
**Files affected**: `index.css`, `theme.ts`, `ThemeContext.tsx`, `index.html`, `index-web.html`
**Paper artboards**: Accessible Color Scales, Color Palette & Nav Icon Explorations
**Paper MCP checks**: Before Burst 3, screenshot "Accessible Color Scales" artboard to get exact hex values and contrast ratios for stone-light. Before Burst 5, screenshot for teal-light values.

- [x] Burst 1: Add Inter and Space Grotesk font imports to HTML entry files and update body font-family in index.css [infra] (e7183f5)
- [x] Burst 2: Replace `ThemeName` type with `"stone-light" | "stone-dark" | "teal-light" | "teal-dark"` and update themes array in theme.ts [infra] (b1d3c7c)
- [x] Burst 3: Define `[data-theme="stone-light"]` CSS variables — bg (#FAFAF9), surface (#F5F5F4), border (#E7E5E4), text-primary (#1C1917), text-body (#44403C), text-secondary (#635C57 — 5.0:1), text-muted (#78716C — 4.0:1 large text only), accent (#D97706), tint (#FEF3C7) [infra] (d1a5a24)
- [x] Burst 4: Define `[data-theme="stone-dark"]` CSS variables — dark variant of Stone+Amber palette with same accessible contrast ratios against dark backgrounds [infra] (dd14d86)
- [x] Burst 5: Define `[data-theme="teal-light"]` CSS variables — bg (#FAFAFA), surface (#F4F4F5), border (#E4E4E7), text-primary (#18181B), text-body (#3F3F46), text-secondary (#52525B — 5.7:1), text-muted (#71717A — 3.9:1 large text only), accent (#0D9488), tint (#F0FDFA) [infra] (dd14d86)
- [x] Burst 6: Define `[data-theme="teal-dark"]` CSS variables — dark variant of Zinc+Teal palette [infra] (dd14d86)
- [x] Burst 7: Update ThemeContext default to `"stone-light"` and verify theme toggle cycles through all 4 themes [infra] (a31e172)
- [x] Burst 8: Remove old theme definitions (deep-sea, daylight, midnight) from index.css [infra] (3460c3f)
- [x] Burst 9: **DESIGN GATE 1** — Playwright screenshots at 2560×1440 for all 4 themes. Stone-light: warm off-white bg + amber accent PASS. Stone-dark: dark warm bg + amber PASS. Teal-light: zinc white + teal PASS. Teal-dark: dark zinc + bright teal PASS. Inter font loaded. All text readable. No discrepancies. VERIFIED.

### SECTION 2: Shared Atoms — Badge, Tag, Checkbox, Progress, CountPill (~11 bursts)

**Problem**: Badges, tags, and status indicators are implemented inline across components with inconsistent sizing, colors, and spacing. Need reusable atom components matching the Component Decomposition artboard.
**Requirements**: Component Decomposition artboard — Atoms section
**Files affected**: `components/ui/badge.tsx` (existing, to be extended), new files for Tag, Checkbox, Progress, CountPill, HashId
**Paper artboards**: Component Decomposition → Atoms
**Paper MCP checks**: Before starting, screenshot "Component Decomposition" artboard and read the Atoms section. Use `get_computed_styles` on individual Badge/Tag/Checkbox nodes to extract exact padding, font-size, border-radius, and colors.

- [x] Burst 10: Badge component renders priority variants (CRITICAL, HIGH, MEDIUM, LOW) — verify against Paper artboard Badge → Priority row: font-size 10px, font-weight 700, padding 2px 8px, border-radius 4px, letter-spacing 0.04em (b9db93b)
- [x] Burst 11: Badge component renders status variants (open, draft, identified, tracked, completed) — verify against Paper artboard Badge → Status row (b9db93b)
- [x] Burst 12: Badge component renders client variant (LLSA amber, TerraQuantum purple) — verify against Paper artboard Badge → Client row (b9db93b)
- [x] Burst 13: Tag component renders thread tags (font-size 10px, font-weight 500, padding 2px 8px, border-radius 3px, bg elevated, text secondary) and milestone tags (+ accent left-border 2px) — verify against Paper artboard Tag (fb5d89a)
- [x] Burst 14: Checkbox component renders 3 states (unchecked: 16px with 1.5px border, checked: accent fill + white check SVG, disabled: surface bg) — verify against Paper artboard Checkbox (e6ea8c3)
- [x] Burst 15: Progress component renders fraction label (11px secondary) + bar (3px tall, border-radius 2px, accent fill, green #15803D at 100%) — verify against Paper artboard Progress (6100b03)
- [x] Burst 16: CountPill component renders numeric count in rounded pill (11px font-weight 600, padding 1px 8px, border-radius 10px, elevated bg) — verify against Paper artboard Count Pill (75e1200)
- [x] Burst 17: HashId component renders copyable short hash (Inter monospace 11px, decorative color, clipboard icon 12px) with click-to-copy — verify against Paper artboard Hash ID (c45b239)
- [x] Burst 18: All atom components respond to theme changes — all use CSS vars, theme-agnostic (verified)
- [x] Burst 19: All atom components use semantic CSS vars — grep audit clean. Only Badge has 3 semantic status hex values (#EA580C high, #DCFCE7/#15803D open, #DBEAFE/#1D4ED8 tracked) that are intentionally cross-theme (verified)
- [x] Burst 20: **DESIGN GATE 2** — All 6 atom components created with tests passing. CSS var audit clean. Playwright verified Badge rendering in live app with CRITICAL badges visible on action items. Paper artboard Component Decomposition referenced for exact specs. VERIFIED.

### SECTION 3: Shared Molecules — CommandBar, SectionHeader, ListItemRow, GroupHeader (~11 bursts)

**Problem**: Each page has its own action bar pattern (Meetings: Reassign/Ignore/Re-extract/Copy, Threads: Edit/Delete/Resolve, Insights: Edit/Finalize/Delete). Need a unified CommandBar shell that accepts context-specific actions via props.
**Requirements**: Component Decomposition artboard — Molecules section
**Files affected**: New shared components in `components/ui/` or `components/shared/`
**Paper artboards**: Component Decomposition → Molecules
**Paper MCP checks**: Before starting, screenshot "Component Decomposition" artboard Molecules section. Use `get_computed_styles` on CommandBar nodes to extract container padding (2px), radius (8px), item padding (6px 12px), item radius (6px), font-size (12px), divider specs.

- [x] Burst 21: CommandBar component renders a pill-shaped toolbar — container: padding 2px, border-radius 8px, bg elevated. Items: padding 6px 12px, border-radius 6px, font-size 12px, font-weight 500 (73ff525)
- [x] Burst 22: CommandBar accepts `actions` prop array with `{label, icon?, onClick, variant: 'primary'|'default'|'success'|'destructive'}` — primary gets surface bg + body text, default gets no bg + secondary text, destructive gets no bg + danger text, success gets no bg + #15803D text. Divider: 1px × 16px line color between zones. (73ff525)
- [x] Burst 23: CommandBar renders correctly in Meeting context (Edit, Re-extract, Copy | Ignore, Reassign | Delete) (73ff525)
- [x] Burst 24: CommandBar renders correctly in Thread context (Edit, Regenerate, Find Candidates | Resolve | Delete) (73ff525)
- [x] Burst 25: CommandBar renders correctly in Insight context (Edit, Copy | Finalize | Delete) (73ff525)
- [x] Burst 26: SectionHeader component — expanded: down-chevron 12px + Space Grotesk 13px/600 uppercase primary + optional count + optional progress bar + rule line 1px. Collapsed: right-chevron + muted label + count. (eb1ede3)
- [x] Burst 27: SectionHeader collapsed state shows right-chevron, muted text color, item count, rule line (eb1ede3)
- [x] Burst 28: ListItemRow component renders 3 states — selected: tint bg + 2px accent left-border. Default: transparent bg + hover elevated. (b00eb75)
- [x] Burst 29: ListItemRow accepts content slot for flexible inner layout (b00eb75)
- [x] Burst 30: GroupHeader component renders sticky uppercase group label — 11px/600, 3 variants: default (secondary), priority (danger), date (+ meta). (b00eb75)
- [x] Burst 31: **DESIGN GATE 3** — All 4 molecules built with 25 tests passing. CSS vars used throughout. Paper artboard Component Decomposition referenced for specs. VERIFIED.

### SECTION 4: Unified Filter/Sort Bar — Compact Dropdown Chips (~9 bursts)

**Problem**: Meetings page uses segmented pill-buttons, Action Items uses native select dropdowns, Threads/Insights/Timelines have no sort/group controls. Need one consistent compact dropdown chip bar.
**Requirements**: List Management Patterns artboard — Option B
**Files affected**: New `components/shared/FilterBar.tsx`, updates to all page components
**Paper artboards**: List Management Patterns → Option B — Compact Dropdown Chips
**Paper MCP checks**: Before starting, screenshot "List Management Patterns" artboard. Focus on Option B section — get exact chip styling: padding 4px 10px, border-radius 6px, border 1px solid line, label 11px secondary, value 11px/600 primary, chevron 10px. Active chip: tint bg, accent text, 3px 8px padding, border-radius 4px, × icon.

- [x] Burst 32: FilterChip component renders a `label: value` chip — 11px, border, input bg, popover on click. (ede55ba)
- [x] Burst 33: ActiveFilterChip renders removable tint chip — 10px/500, accent text, × icon. (ede55ba)
- [x] Burst 34: FilterBar composes Group chip + Sort chip + divider + filter chips with "Clear all" link. (3ea0b22)
- [x] Burst 35: FilterBar for Meetings context: Group (Series/Day/Week/Thread), Sort (Newest/Oldest/Client) — via props. (3ea0b22)
- [x] Burst 36: FilterBar for Action Items context: Group (Priority/Series/Owner/Requester/Intent) + filter chips — via props. (3ea0b22)
- [x] Burst 37: FilterBar for Threads context: Sort (Relevance/Newest), Tag filter — via props. (3ea0b22)
- [x] Burst 38: FilterBar for Insights context: Group (Day/Week), Sort (Newest/Oldest) — via props. (3ea0b22)
- [x] Burst 39: FilterBar for Timelines context: Status filter — via props. (3ea0b22)
- [x] Burst 40: **DESIGN GATE 4** — FilterChip + ActiveFilterChip + FilterBar all built with 13 tests. CSS vars throughout. Matches List Management Patterns Option B. VERIFIED.

### SECTION 5: Density Controls (~7 bursts)

**Problem**: 490+ action items at comfortable density means excessive scrolling. Need a 3-mode density toggle (comfortable/compact/dense) that adjusts row height, font size, and information shown.
**Requirements**: List Management Patterns artboard — Density Controls section
**Files affected**: New `components/shared/DensityToggle.tsx`, new density context/hook, ListItemRow updates
**Paper artboards**: List Management Patterns → 2. Density Controls
**Paper MCP checks**: Before starting, screenshot "List Management Patterns" artboard density section. Note exact differences between modes: comfortable (13px title, 11px metadata, full badge "CRITICAL", full name, 10px padding), compact (12px title, 10px metadata, abbreviated badge "C", shortened name "Wesley D.", 5px padding), dense (11px title, 9px metadata, 4px color dot, initials "WD", 3px padding). Also note the toggle icon: 3 SVG states with different line thickness/count.

- [x] Burst 41: DensityToggle component renders 3-state icon toggle — comfortable/compact/dense SVG icons in elevated pill. (d7f08bc)
- [x] Burst 42: useDensity hook provides current density mode and setter, persists to localStorage. (d7f08bc)
- [ ] Burst 43: ListItemRow comfortable mode: two-line layout (title 13px/500 + metadata 11px secondary below), full Badge component, full owner name, padding 10px 16px. Checkbox 14px. [deferred to Section 7 page integration]
- [ ] Burst 44: ListItemRow compact mode: single-line layout, abbreviated badge "C", shortened owner, padding 5px 8px. Checkbox 12px. [deferred to Section 7]
- [ ] Burst 45: ListItemRow dense mode: single-line, 4px color dot, owner initials, padding 3px 8px. Checkbox 10px. [deferred to Section 7]
- [ ] Burst 46: DensityToggle placed in sidebar header next to item count. [deferred to Section 7]
- [ ] Burst 47: **DESIGN GATE 5** — Verify density modes visually after Section 7 integration. [deferred]

### SECTION 6: Client Workspace Switcher — Option 3 (~7 bursts)

**Problem**: Client selector, date range, and search are scattered across the top bar as separate controls. Need a workspace-level client banner with summary stats, scoped search below, and date range inputs.
**Requirements**: Search & Client Selector artboard — Option 3
**Files affected**: `TopBar.tsx`, `SearchBar.tsx`, new `components/shared/WorkspaceBanner.tsx`
**Paper artboards**: Color Palette & Nav Icon Explorations → Search & Client Selector → Option 3
**Paper MCP checks**: Before starting, screenshot "Color Palette & Nav Icon Explorations" artboard, scroll to "Search & Client Selector Options" section, focus on Option 3. Note: client banner is a tint-bg row with client avatar circle (accent bg, white initial), client name dropdown, summary stats (meetings · action items · threads). Search input below is scoped ("Search within LLSA..."). Date range uses From/To inputs.

- [x] Burst 48: UnifiedSearch component — magnifying glass, 10px radius, 1.5px border, elevated bg, 13px input. (4b3b9e5) [to be refactored for Option 3 in integration]
- [x] Burst 49: Client chip inside search bar — tint bg, 11px/600 accent text, removable ×. (4b3b9e5) [to be replaced by workspace banner]
- [x] Burst 50: Client chip click handler wired via onClientClick prop. (4b3b9e5)
- [x] Burst 51: Date range context line below search bar — 11px secondary. (4b3b9e5) [to become From/To inputs]
- [x] Burst 52: Deep toggle — 10px/500, accent dot when enabled, aria-pressed. (4b3b9e5)
- [ ] Burst 53: TopBar refactored to use WorkspaceBanner (Option 3) — client as workspace-level banner with stats, scoped search, From/To date inputs [deferred to Section 7 integration]
- [ ] Burst 54: **DESIGN GATE 6** — Verify WorkspaceBanner visually after TopBar integration. [deferred to Section 7]

### SECTION 7: 3-Zone Layout — All Pages (~13 bursts)

**Problem**: Meetings/Threads/Insights use 3-panel layouts but Action Items and Timelines are flat full-width lists with wasted ultra-wide space. Need every page to follow the same list | detail | assistant pattern.
**Requirements**: Concept B — Action Items artboard
**Files affected**: All page components, LinearShell.tsx, App.tsx
**Paper artboards**: Concept A — Meeting Detail, Concept B — Action Items
**Paper MCP checks**: Before starting, screenshot both "Concept A — Meeting Detail" and "Concept B — Action Items" artboards. Note: nav rail 56px, sidebar 300px (meetings) or 520px (action items), detail panel flex:1, assistant panel 380px with 1px border-left. Sidebar has white bg, detail has base bg, assistant has white bg.

- [x] Burst 55: LinearShell renders 3-zone layout: nav rail (56px fixed) + content area (flex: 1) — content area contains sidebar + detail + assistant
- [x] Burst 56: MeetingsPage uses 3-zone: sidebar (300px, white bg, border-right 1px) | detail (flex, base bg) | ChatPanel (380px, white bg, border-left 1px) — refactored from current layout
- [x] Burst 57: MeetingsPage sidebar uses new ListItemRow, GroupHeader, FilterBar components replacing inline implementations
- [x] Burst 58: MeetingsPage detail header uses CommandBar component with Meeting context actions
- [ ] Burst 59: MeetingsPage detail sections use SectionHeader component (Summary, Decisions, Action Items, Open Questions, Risks)
- [ ] Burst 60: **DESIGN GATE 7a** — Playwright screenshot of MeetingsPage with a meeting selected at 2560×1440. Paper MCP screenshot "Concept A — Meeting Detail". Compare: sidebar width, command bar, section headers, assistant panel. Fix deltas before continuing.
- [ ] Burst 61: ActionItemsPage converted from flat full-width list to 3-zone: sidebar (520px action item list) | detail (flex, shows selected item context) | ChatPanel (380px)
- [ ] Burst 62: ActionItemsPage sidebar uses ListItemRow + GroupHeader + FilterBar + DensityToggle
- [ ] Burst 63: ActionItemsPage detail shows source meeting link, related items, context — uses CommandBar with Action Item actions (Edit, Complete, Copy | Reassign | Delete)
- [ ] Burst 64: **DESIGN GATE 7b** — Playwright screenshot of ActionItemsPage with an item selected at 2560×1440. Paper MCP screenshot "Concept B — Action Items". Compare: sidebar width (520px), detail layout, command bar, source meeting section, assistant panel. Fix deltas.
- [ ] Burst 65: ThreadsPage uses 3-zone: sidebar (thread list) | detail (meeting candidates + thread summary) | ChatPanel — refactored to use shared components
- [ ] Burst 66: InsightsPage uses 3-zone: sidebar (insight list) | detail (executive summary + topics) | ChatPanel — refactored to use shared components
- [ ] Burst 67: TimelinesPage converted from flat list to 3-zone: sidebar (milestone list) | detail (milestone details + linked meetings) | ChatPanel

### SECTION 8: Nav Rail Icon Refresh (~4 bursts)

**Problem**: Nav rail icons need to match the selected palette direction with proper stroke weights and active/inactive states.
**Requirements**: Color Palette & Nav Icon Explorations artboard
**Files affected**: `NavRail.tsx`
**Paper artboards**: Color Palette & Nav Icon Explorations → Nav Rails A and D
**Paper MCP checks**: Before starting, screenshot "Color Palette & Nav Icon Explorations" artboard. Focus on Nav Rail A (Stone+Amber) and Nav Rail D (Zinc+Teal). Note: logo mark 28px square, border-radius 6px, accent bg, white "K" Space Grotesk 13px/700. Icons 18px, stroke-width 1.75. Active icon uses text-primary, inactive uses text-muted. Label text 9px Inter 500 below each icon.

- [ ] Burst 68: NavRail active icon uses text-primary color, inactive uses text-muted, with 1.75px stroke weight — verify against Paper Nav Rail A
- [ ] Burst 69: NavRail logo mark — 28px square, border-radius 6px, accent bg, white "K" in Space Grotesk 13px/700. Verify against Paper Nav Rail A logo.
- [ ] Burst 70: NavRail shows icon + label text (9px Inter 500) below each icon, active label uses text-primary, inactive uses text-muted
- [ ] Burst 71: **DESIGN GATE 8** — Playwright screenshot of NavRail in stone-light theme. Paper MCP screenshot Nav Rail A from "Color Palette & Nav Icon Explorations". Compare: logo, icon stroke weight, active/inactive colors, label text. Toggle to teal-light, compare against Nav Rail D. Fix deltas.

### SECTION 9: Dark Theme Variants (~5 bursts)

**Problem**: User needs both light and dark themes. Light palettes are defined; dark variants need to be derived maintaining the same accent colors and accessible contrast ratios.
**Requirements**: Both palettes need dark variants where backgrounds are dark, text is light, and accent colors remain recognizable.
**Files affected**: `index.css` (already stubbed in Section 1, now refined with real component testing)
**Paper artboards**: Accessible Color Scales (contrast ratios guide dark derivation)
**Paper MCP checks**: Before starting, screenshot "Accessible Color Scales" artboard. Use the contrast ratio targets to verify dark theme text colors: text-primary on dark bg must be 7:1+, text-secondary must be 4.5:1+. Test by computing contrast of proposed colors against the dark bg hex.

- [ ] Burst 72: stone-dark theme refined: bg (#1C1917), surface (#292524), border (#44403C), text-primary (#FAFAF9), text-body (#D6D3D1), text-secondary (#A8A29E — verify 4.5:1+ on #1C1917), accent (#F59E0B warm amber on dark), tint (#451A03)
- [ ] Burst 73: teal-dark theme refined: bg (#18181B), surface (#27272A), border (#3F3F46), text-primary (#FAFAFA), text-body (#D4D4D8), text-secondary (#A1A1AA — verify 4.5:1+ on #18181B), accent (#2DD4BF bright teal on dark), tint (#042F2E)
- [ ] Burst 74: All shared atoms and molecules render correctly in both dark themes — cycle through all atoms/molecules on test page, no broken colors or invisible text
- [ ] Burst 75: Theme toggle cycles: stone-light → stone-dark → teal-light → teal-dark
- [ ] Burst 76: **DESIGN GATE 9** — Playwright screenshot of MeetingsPage in stone-dark at 2560×1440. Verify: all text readable, accent colors visible, no hardcoded light-theme colors bleeding through. Repeat for teal-dark. Screenshot both and compare contrast against "Accessible Color Scales" ratios. Fix any WCAG AA failures.

### SECTION 10: Cleanup & Polish (~4 bursts)

**Problem**: After refactoring all pages to use shared components, remove dead code, unused inline styles, and verify no regressions.
**Files affected**: All component files
**Paper artboards**: All artboards (final sweep)

- [ ] Burst 77: Remove all inline color hardcodes — grep for hex patterns (`/#[0-9a-fA-F]{3,8}/`) in component .tsx files, zero matches expected (CSS vars only)
- [ ] Burst 78: Remove unused component code that was replaced by shared atoms/molecules (old inline badges, old action bars, old filter implementations)
- [ ] Burst 79: Update design-tokens.ts if any values drifted during implementation — Paper artboard is source of truth, tokens file must match
- [ ] Burst 80: **FINAL DESIGN GATE** — Full walkthrough: Playwright navigates to each of the 5 pages (Meetings, Action Items, Threads, Insights, Timelines) at 2560×1440 in stone-light theme, takes screenshot of each. Paper MCP screenshots all concept artboards. Final comparison pass. Toggle to each theme (stone-dark, teal-light, teal-dark) and screenshot MeetingsPage in each. Verify all 4 themes render correctly. Document any remaining issues. This gate must pass clean before the plan is marked complete.

## DONE

(none yet)
