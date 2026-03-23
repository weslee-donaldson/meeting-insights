# Responsive UI — Mobile & Tablet Support
## Ketchup Plan

---

# 0. SYSTEM GOAL

Transform the Meeting Insights UI from a fixed-width desktop application into a responsive PWA that adapts to mobile phones (<768px), tablets (768–1279px), and desktop (1280+). The existing Hono web server (`web:dev`) serves as the PWA host. The app retains Electron support for desktop users.

This plan follows **The Ketchup Technique**. Each Burst is atomic: one test, one behavior, one commit.

---

# DESIGN REFERENCES

## Paper MCP Artboards (Meeting Insights.paper)

| Artboard | Viewport | Shows |
|----------|----------|-------|
| Responsive — Mobile Meeting List | 390×844 | Full-screen list, bottom tabs, series groups |
| Responsive — Mobile Meeting Detail | 390×844 | Drill-in with commands, accordion sections, chat FAB |
| Responsive — Mobile Chat Sheet | 390×844 | Bottom sheet chat over dimmed detail |
| Responsive — Mobile Notes Dialog | 390×844 | Bottom sheet with note cards |
| Responsive — Mobile Long Content | 390×1200 | Truncation, Show more, expanded accordions |
| Responsive — Mobile Breadcrumb Nav | 390×844 | Path breadcrumb (Meetings > LLSA > Series > ...) |
| Responsive — Tablet Meetings | 768×1024 | Split-pane list + detail |
| Responsive — Tablet Chat Panel | 768×1024 | Detail + chat side-by-side |

### Artboards DONE (all Phase 2 artboards created)

| Artboard | Section | Description |
|----------|---------|-------------|
| Responsive — Mobile Action Items | Phase 2 | Action items list with filters, grouped by priority |
| Responsive — Mobile Action Item Detail | Phase 2 | Single action item with breadcrumb, source meeting, context |
| Responsive — Tablet Action Items | Phase 2 | Annotation: follows Meetings tablet split-pane pattern |
| Responsive — Mobile Threads | Phase 2 | Thread list with shorthand badges, meeting counts |
| Responsive — Mobile Thread Detail | Phase 2 | Thread detail with summary, meeting relevance scores |
| Responsive — Tablet Threads | Phase 2 | Annotation: follows Meetings tablet split-pane pattern |
| Responsive — Mobile Insights | Phase 2 | Insight list with RAG dots, period labels, status badges |
| Responsive — Mobile Insight Detail | Phase 2 | Executive summary, topic details with RAG dots |
| Responsive — Tablet Insights | Phase 2 | Annotation: follows Meetings tablet split-pane pattern |
| Responsive — Mobile Timelines | Phase 2 | Milestone list with status dots, target dates, filter chips |
| Responsive — Mobile Timeline Detail | Phase 2 | Description, mentions with type badges, linked meetings |
| Responsive — Tablet Timelines | Phase 2 | Annotation: follows Meetings tablet split-pane pattern |

---

# ARCHITECTURAL DECISIONS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Target | PWA via Hono web server | Reuses existing `web:dev` infra, no native wrapper needed |
| Breakpoints | 3-tier: mobile (<768), tablet (768–1279), desktop (1280+) | Covers phone, iPad, laptop/desktop cleanly |
| Navigation | Bottom tab bar + breadcrumbs | Tabs for top-level views, breadcrumbs for depth within a view |
| Chat behavior | Matches desktop: persistent, meeting-scoped | Keep existing meeting_messages persistence model |
| Dialogs | All become bottom sheets on mobile | Consistent UX — Notes, Transcript, Create*, ItemHistory |
| Layout | New ResponsiveShell replaces LinearShell | Different layout strategy per breakpoint vs. media-query hacks |
| Design tokens | Add responsive overrides | `design-tokens.ts` gets per-breakpoint values |
| Tests | Viewport variants on existing e2e + fix selectClient | One suite, parameterized viewport, shared helpers |
| Offline | Not in scope | Assume connection |

---

# PLANNING RULES

1. Bursts are ordered within sections. Sections are sequential unless noted.
2. Each burst = one failing test -> minimal code -> TCR.
3. Plan updates go in the same commit as code.
4. Infrastructure commits (config, tokens, PWA manifest) need no tests.
5. **Refactoring bursts must not change behavior.** All existing tests must continue passing.
6. **Paper MCP artboard check is mandatory** before implementing any UI burst (see CLAUDE.md).
7. **Phase 2 artboards must be created** before implementing Phase 2 sections. Use the Meetings artboards as the visual language reference.

---

# PHASE 1: Infrastructure + Meetings

## SECTION 0: Prerequisites — Fix E2E & Cleanup (~3 bursts)

> **Spec:**
> Fix the broken `selectClient()` helper across all 6 e2e spec files. The helper uses `[role="option"]` (Radix) but the UI now uses native `<select>`. Also extract the helper into a shared utility to eliminate duplication.
>
> **Files affected:** `test/e2e/helpers.ts` (NEW), `test/e2e/insights.spec.ts`, `test/e2e/milestones.spec.ts`, `test/e2e/meeting-notes.spec.ts`, `test/e2e/thread-notes.spec.ts`, `test/e2e/milestone-notes.spec.ts`, `test/e2e/insight-notes.spec.ts`

- [x] Burst 1: Create `test/e2e/helpers.ts` with shared `selectClient()` using native `<select>` via `selectOption()`
- [x] Burst 2: Replace all 6 inline `selectClient()` definitions with import from helpers
- [x] Burst 3: Run full e2e suite, verify all 56 tests pass

## SECTION 1: Responsive Design Tokens (~2 bursts)

> **Spec:**
> Extend `design-tokens.ts` with per-breakpoint layout values and add CSS custom properties + Tailwind breakpoint config for the 3-tier responsive system.
>
> **Files affected:** `electron-ui/ui/src/design-tokens.ts`, `electron-ui/ui/src/index.css`, `tailwind.config.ts` (if exists)
>
> **New tokens:**
> - `breakpoints: { mobile: 768, tablet: 1280 }`
> - `layout.mobile: { navRailWidth: 0, bottomTabHeight: 56, sheetHandleHeight: 20 }`
> - `layout.tablet: { sidebarWidth: 280, chatPanelWidth: 320 }`
> - `layout.desktop: { ...existing values }`

- [x] Burst 4: Add responsive breakpoints and layout tokens to design-tokens.ts
- [x] Burst 5: Add CSS media query custom properties and bottom-tab/sheet variables to index.css

## SECTION 2: Bottom Tab Bar Component (~3 bursts)

> **Spec:**
> Create a `BottomTabBar` component matching the Paper artboard pattern. Renders the same 5 navigation items as NavRail but as a horizontal bottom bar with icons + labels. Visible on mobile and tablet, hidden on desktop.
>
> **Paper reference:** All "Responsive — Mobile *" artboards show the bottom tab bar.
>
> **Files affected:** `electron-ui/ui/src/components/BottomTabBar.tsx` (NEW), test file

- [x] Burst 6: Create BottomTabBar with 5 nav items, active state styling, test renders
- [x] Burst 7: Add responsive visibility — hidden on desktop (≥1280px), visible below
- [x] Burst 8: Wire currentView + onNavigate props, verify active state matches NavRail behavior

## SECTION 3: Breadcrumb Bar Component (~3 bursts)

> **Spec:**
> Create a `BreadcrumbBar` component for contextual navigation within a view. Horizontally scrollable on overflow. Each segment is tappable. Current location is highlighted with muted background.
>
> **Paper reference:** "Responsive — Mobile Breadcrumb Nav" artboard.
>
> **Files affected:** `electron-ui/ui/src/components/BreadcrumbBar.tsx` (NEW), test file

- [x] Burst 9: Create BreadcrumbBar with segments array prop, render chevron separators
- [x] Burst 10: Style active segment (dark bg pill), tappable amber links for ancestors
- [x] Burst 11: Add horizontal scroll overflow behavior, test segment click callbacks

## SECTION 4: Bottom Sheet Component (~4 bursts)

> **Spec:**
> Create a reusable `BottomSheet` component for mobile dialogs. Renders as a sheet sliding up from the bottom with drag handle, dimmed backdrop, and rounded top corners. On tablet/desktop, falls back to existing centered Dialog.
>
> **Paper reference:** "Responsive — Mobile Chat Sheet" and "Responsive — Mobile Notes Dialog" artboards.
>
> **Files affected:** `electron-ui/ui/src/components/ui/bottom-sheet.tsx` (NEW), test file

- [x] Burst 12: Create BottomSheet with backdrop, sheet container, drag handle, close on backdrop tap
- [x] Burst 13: Add height prop (percentage of viewport), scroll behavior for content
- [x] Burst 14: Add responsive breakpoint logic — renders as BottomSheet on mobile, Dialog on tablet+
- [x] Burst 15: Test open/close state, backdrop click, responsive switching

## SECTION 5: ResponsiveShell — Layout Engine (~6 bursts)

> **Spec:**
> Create `ResponsiveShell` to replace `LinearShell` as the top-level layout component. It uses different layout strategies per breakpoint:
>
> - **Desktop (≥1280):** NavRail + resizable panels + optional chat (existing LinearShell behavior)
> - **Tablet (768–1279):** Bottom tabs + split-pane (280px list + detail) OR detail + chat (320px). No NavRail.
> - **Mobile (<768):** Bottom tabs + single screen stack. Navigate between list, detail, and chat views.
>
> **Paper reference:** All responsive artboards.
>
> **Files affected:** `electron-ui/ui/src/components/ResponsiveShell.tsx` (NEW), `electron-ui/ui/src/hooks/useBreakpoint.ts` (NEW), test files

- [x] Burst 16: Create `useBreakpoint()` hook — returns "mobile" | "tablet" | "desktop" based on window.innerWidth, handles resize
- [x] Burst 17: Create ResponsiveShell desktop layout — delegates to LinearShell (preserves all existing behavior)
- [x] Burst 18: Add tablet layout — bottom tabs, split-pane with list + detail panels
- [x] Burst 19: Add mobile layout — bottom tabs, single-panel stack with navigation state (list | detail | chat)
- [x] Burst 20: Wire breadcrumb bar into tablet and mobile layouts, driven by navigation state
- [x] Burst 21: Replace LinearShell usage in App.tsx with ResponsiveShell, verify desktop behavior unchanged

## SECTION 6: Mobile WorkspaceBanner (~3 bursts)

> **Spec:**
> The TopBar/WorkspaceBanner is too wide for mobile. Create a compact mobile variant:
> - Client selector as a dropdown sheet
> - Search as an expandable icon → full-width input
> - Date filters hidden behind a "Filters" button that opens a sheet
>
> **Files affected:** `electron-ui/ui/src/components/TopBar.tsx`, `electron-ui/ui/src/components/shared/workspace-banner.tsx`, test files

- [x] Burst 22: Create compact mobile header — client name + search icon + filter icon
- [x] Burst 23: Search expand behavior — icon tap reveals full-width input, escape collapses
- [x] Burst 24: Filter sheet — date range + deep search toggle in a BottomSheet on mobile

## SECTION 7: Meetings — Mobile List View (~4 bursts)

> **Spec:**
> Adapt MeetingList for mobile viewport. Full-screen list with larger touch targets (48px min), series group headers, colored avatar badges, and chevron disclosure indicators.
>
> **Paper reference:** "Responsive — Mobile Meeting List" artboard.
>
> **Files affected:** `electron-ui/ui/src/components/MeetingList.tsx`, `electron-ui/ui/src/components/shared/list-item-row.tsx`, test files

- [ ] Burst 25: Add responsive row height — comfortable touch targets (48px min) on mobile
- [ ] Burst 26: Render colored avatar badges on mobile rows (first letters of meeting title)
- [ ] Burst 27: Add chevron disclosure indicator on mobile rows
- [ ] Burst 28: Test MeetingList renders correctly at 390px viewport width

## SECTION 8: Meetings — Mobile Detail View (~5 bursts)

> **Spec:**
> Adapt MeetingDetail for mobile. Summary uses "Show more" truncation. Accordion sections default collapsed with only-one-expanded behavior. Command buttons wrap horizontally.
>
> **Paper reference:** "Responsive — Mobile Meeting Detail" and "Responsive — Mobile Long Content" artboards.
>
> **Files affected:** `electron-ui/ui/src/components/MeetingDetail.tsx`, test files

- [ ] Burst 29: Add "Show more" truncation for Summary section (4-line clamp on mobile)
- [ ] Burst 30: Implement single-accordion-expanded behavior on mobile (auto-collapse others)
- [ ] Burst 31: Command buttons wrap to horizontal scroll on narrow viewports
- [ ] Burst 32: Chat FAB button on mobile detail (positioned bottom-right, above tab bar)
- [ ] Burst 33: Test MeetingDetail responsive behavior at 390px and 768px viewports

## SECTION 9: Meetings — Chat Integration (~3 bursts)

> **Spec:**
> Wire chat into responsive layouts. Mobile: FAB opens chat as BottomSheet. Tablet: Chat button opens right panel (replaces list panel).
>
> **Paper reference:** "Responsive — Mobile Chat Sheet" and "Responsive — Tablet Chat Panel" artboards.
>
> **Files affected:** `electron-ui/ui/src/components/ChatPanel.tsx`, `electron-ui/ui/src/components/ResponsiveShell.tsx`, test files

- [ ] Burst 34: Mobile chat FAB → opens ChatPanel inside BottomSheet
- [ ] Burst 35: Tablet chat button → swaps list panel for ChatPanel, shows back button
- [ ] Burst 36: Test chat open/close transitions on mobile and tablet viewports

## SECTION 10: Meetings — Dialog Migration (~4 bursts)

> **Spec:**
> Migrate all meeting-related dialogs to use BottomSheet on mobile. Includes NotesDialog, TranscriptDialog, and any meeting-scoped create dialogs.
>
> **Paper reference:** "Responsive — Mobile Notes Dialog" artboard.
>
> **Files affected:** `electron-ui/ui/src/components/NotesDialog.tsx`, `electron-ui/ui/src/components/ui/dialog.tsx`, test files

- [ ] Burst 37: Create responsive dialog wrapper — uses BottomSheet on mobile, Dialog on tablet+
- [ ] Burst 38: Migrate NotesDialog to responsive wrapper
- [ ] Burst 39: Migrate TranscriptDialog and remaining meeting dialogs
- [ ] Burst 40: Test dialog/sheet switching across breakpoints

## SECTION 11: PWA Manifest & Meta Tags (~2 bursts)

> **Spec:**
> Add PWA manifest, viewport meta tag, and touch-friendly defaults to `index-web.html`. Enables "Add to Home Screen" on mobile browsers.
>
> **Files affected:** `electron-ui/ui/index-web.html`, `electron-ui/ui/public/manifest.json` (NEW), `electron-ui/ui/public/icons/` (NEW)

- [ ] Burst 41: Add viewport meta tag, manifest.json link, theme-color to index-web.html
- [ ] Burst 42: Create manifest.json with app name, icons, display: standalone, orientation: any

## SECTION 12: E2E Viewport Variants — Meetings (~3 bursts)

> **Spec:**
> Add viewport variant tests for the Meetings flow. Parameterize existing meeting e2e tests to run at mobile (390×844), tablet (768×1024), and desktop (1400×900).
>
> **Files affected:** `test/e2e/helpers.ts`, `test/e2e/meeting-notes.spec.ts`, new viewport test file

- [ ] Burst 43: Add viewport helper to `test/e2e/helpers.ts` — `withViewport(page, "mobile" | "tablet" | "desktop")`
- [ ] Burst 44: Create `test/e2e/responsive-meetings.spec.ts` — meeting list → detail → chat flow at mobile and tablet viewports
- [ ] Burst 45: Add breadcrumb navigation test — verify tapping breadcrumb segments navigates correctly

---

# PHASE 2: Remaining Views

> **PREREQUISITE:** Before starting each section, create the Paper MCP artboards listed in "Artboards TODO" above. Use the Meetings artboards as the visual language reference — same bottom tabs, breadcrumbs, bottom sheets, typography, and spacing patterns.

## SECTION 13: Paper Artboards — Action Items (~1 burst)

> **Spec:** Create 3 artboards: Mobile Action Items list, Mobile Action Item detail, Tablet Action Items split-pane.

- [x] Burst 46: Create Action Items artboards in Paper MCP — Mobile list, Mobile detail, Tablet annotation

## SECTION 14: Action Items — Responsive (~5 bursts)

> **Spec:**
> Adapt ClientActionItemsView and action item detail for responsive viewports. Action items group by meeting with colored avatar badges. Filter chips (person, priority) scroll horizontally on mobile.
>
> **Files affected:** `electron-ui/ui/src/components/ClientActionItemsView.tsx`, `electron-ui/ui/src/pages/ActionItemsPage.tsx`, test files

- [ ] Burst 47: Mobile action items list — touch-friendly rows, horizontal filter chips
- [ ] Burst 48: Mobile action item detail — expandable description, priority badge prominent
- [ ] Burst 49: Tablet split-pane — list (280px) + action item detail
- [ ] Burst 50: Wire into ResponsiveShell with breadcrumbs (Action Items > LLSA > Meeting Name)
- [ ] Burst 51: E2E viewport variants for action items flow

## SECTION 15: Paper Artboards — Threads (~1 burst)

- [x] Burst 52: Create Threads artboards in Paper MCP — Mobile list, Mobile detail, Tablet annotation

## SECTION 16: Threads — Responsive (~5 bursts)

> **Spec:**
> Adapt ThreadsView and ThreadDetailView for responsive viewports. Thread list shows meeting count badges. Detail view shows candidate meetings with add/remove actions.
>
> **Files affected:** `electron-ui/ui/src/components/ThreadsView.tsx`, `electron-ui/ui/src/components/ThreadDetailView.tsx`, `electron-ui/ui/src/pages/ThreadsPage.tsx`, test files

- [ ] Burst 53: Mobile thread list — rows with meeting count badge, status indicator
- [ ] Burst 54: Mobile thread detail — candidate meetings as cards, add/remove actions
- [ ] Burst 55: Tablet split-pane threads
- [ ] Burst 56: Wire into ResponsiveShell with breadcrumbs
- [ ] Burst 57: E2E viewport variants for threads flow

## SECTION 17: Paper Artboards — Insights (~1 burst)

- [x] Burst 58: Create Insights artboards in Paper MCP — Mobile list, Mobile detail, Tablet annotation

## SECTION 18: Insights — Responsive (~5 bursts)

> **Spec:**
> Adapt InsightsPage for responsive viewports. Insight list shows status badges (Draft/Final). Detail shows generated content with source meetings. CreateInsightDialog becomes bottom sheet.
>
> **Files affected:** `electron-ui/ui/src/pages/InsightsPage.tsx`, `electron-ui/ui/src/components/CreateInsightDialog.tsx`, test files

- [ ] Burst 59: Mobile insight list — status badge prominent, period type label
- [ ] Burst 60: Mobile insight detail — sections for executive summary, source meetings
- [ ] Burst 61: CreateInsightDialog → responsive wrapper (bottom sheet on mobile)
- [ ] Burst 62: Tablet split-pane insights
- [ ] Burst 63: E2E viewport variants for insights flow

## SECTION 19: Paper Artboards — Timelines (~1 burst)

- [x] Burst 64: Create Timelines artboards in Paper MCP — Mobile list, Mobile detail, Tablet annotation

## SECTION 20: Timelines — Responsive (~5 bursts)

> **Spec:**
> Adapt TimelinesPage for responsive viewports. Timeline list shows milestone count. Detail shows milestones with linked meetings. CreateMilestoneDialog becomes bottom sheet.
>
> **Files affected:** `electron-ui/ui/src/pages/TimelinesPage.tsx`, `electron-ui/ui/src/components/CreateMilestoneDialog.tsx`, test files

- [ ] Burst 65: Mobile timeline list — milestone count badge, date range label
- [ ] Burst 66: Mobile timeline detail — milestones as cards with linked meeting chips
- [ ] Burst 67: CreateMilestoneDialog → responsive wrapper (bottom sheet on mobile)
- [ ] Burst 68: Tablet split-pane timelines
- [ ] Burst 69: E2E viewport variants for timelines flow

## SECTION 21: Cross-View Polish (~3 bursts)

> **Spec:**
> Final pass across all views to ensure consistent behavior: consistent toast positioning on mobile, consistent bottom sheet heights, consistent breadcrumb depth patterns.
>
> **Files affected:** Various component files

- [ ] Burst 70: Toast positioning — bottom-center on mobile (above tab bar), top-right on desktop
- [ ] Burst 71: Verify all create dialogs (Thread, Insight, Milestone) use responsive wrapper
- [ ] Burst 72: Visual verification loop — Playwright screenshots at all 3 viewports for every view, compare against Paper artboards

---

## DONE
