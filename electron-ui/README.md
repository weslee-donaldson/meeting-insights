# electron-ui

The Meeting Intelligence Explorer front-end. A single React codebase that runs in two modes: embedded inside an Electron desktop app (IPC to an in-process backend) or as a standalone web app in a browser (HTTP fetch to a Hono API server). Components, pages, and hooks are identical across both modes -- the only difference is how `window.api` gets populated.

## Two Runtime Modes

| Mode | Entry point | How `window.api` is set | Backend |
|------|-------------|-------------------------|---------|
| Electron | `ui/src/main.tsx` | Preload script via `contextBridge.exposeInMainWorld` | Main process (SQLite, LanceDB, ONNX in-process) |
| Web | `ui/src/main-web.tsx` | `window.api = apiClient` (HTTP fetch client) | Hono server (`api/`) |

`window.api` satisfies the `ElectronAPI` interface defined in `electron/channels.ts`. Every UI call goes through this seam -- components never import backend modules directly.

Adding a new API method requires changes in three places:
1. `electron/channels.ts` -- type definition and channel constant
2. `electron/preload/index.ts` -- IPC implementation
3. `ui/src/api-client/index.ts` -- HTTP fetch implementation

## Quick Start

**Electron mode:**

```bash
pnpm ui:dev
```

**Web mode** (two terminals):

```bash
pnpm api:dev    # starts Hono HTTP server
pnpm web:dev    # starts Vite dev server with hot reload
```

## Architecture

### State Hierarchy

```
App.tsx
  |-- useMeetingState     (meetings, search, artifacts, completions, multi-select)
  |-- useThreadState      (threads, candidates, thread chat)
  |-- useInsightState     (insights, generation, RAG, insight chat)
  |-- useMilestoneState   (milestones, mentions, merging, milestone chat)
  |-- useNotesState       (notes CRUD across all entity types)
  |-- useSearchState      (search view: query, filters, deep search, enrichment)
  |
  |-- Pages (thin composers -- receive all state as props, return slot arrays)
  |     |-- MeetingsPage, ActionItemsPage, ThreadsPage
  |     |-- InsightsPage, TimelinesPage, SearchPage
  |
  |-- Components (render domain data, never call window.api)
```

Pages are intentionally thin. They receive state and callbacks as props from `App.tsx`, do no data fetching themselves, and return arrays of `ReactNode` for the layout shell's slot-based API.

### Slot-Based Layout

`ResponsiveShell` is the top-level layout component. It delegates rendering based on viewport width:

| Breakpoint | Width | Layout | Navigation |
|------------|-------|--------|------------|
| Desktop | >= 1280px | `LinearShell` -- three zones: nav rail (56px), left panel, right panel | `NavRail` (vertical icons) |
| Tablet | 768-1279px | Split-pane | `BottomTabBar` |
| Mobile | < 768px | Single-stack with `BreadcrumbBar` | `BottomTabBar` |

`useBreakpoint()` returns `"mobile"` / `"tablet"` / `"desktop"` and drives all viewport-adaptive behavior. `useMobileNav` provides imperative navigation within the mobile stack (list / detail / chat transitions).

## Views

| View | Left Panel | Right Panel | Description |
|------|-----------|-------------|-------------|
| Meetings | `MeetingList` | `MeetingDetail` | Browse, search, and multi-select meetings; view artifacts, action items, chat |
| Action Items | `ClientActionItemsView` | `MeetingDetail` (preview) | All incomplete action items for a client, sortable by priority |
| Threads | `ThreadsView` | `ThreadDetailView` | Recurring topic threads with candidate discovery and meeting linking |
| Insights | `InsightsView` | `InsightDetailView` | Period-based insights with executive summaries and RAG generation |
| Timelines | `TimelinesView` | `TimelineDetailView` | Milestones with calendar view, Gantt chart, and date slippage tracking |
| Search | `SearchForm` + `SearchResultsList` | `MeetingDetail` | Hybrid semantic search with LLM re-ranking and field-level filtering |

## Design System

`design-tokens.ts` is the single source of truth for all visual values. Components import from this file or use CSS variable equivalents -- never hardcode colors, spacing, or font sizes.

### Key Tokens

| Category | Examples |
|----------|---------|
| Typography | `Space Grotesk` (display), `Inter` (body); sizes from 9px (nav label) to 40px (display lg) |
| Breakpoints | `mobile` < 768px, `tablet` < 1280px, `desktop` >= 1280px |
| Layout | Per-breakpoint nav height, panel width, spacing values |
| Colors | Defined as CSS variables per theme in `index.css` |

### Text Contrast Tiers

| Tier | Minimum Ratio | CSS Variable | Usage |
|------|--------------|--------------|-------|
| Primary/Body | 7:1+ | `--color-text-primary`, `--color-text-body` | All body text |
| Secondary | 4.5:1+ | `--color-text-secondary` | Supporting text |
| Muted | 3:1+ | `--color-text-muted` | Labels at 11px+ bold only |
| Decorative | -- | `--color-line` | Borders and dividers only, never for text |

### Themes

Four themes defined in `theme.ts`: `stone-light`, `stone-dark`, `teal-light`, `teal-dark`. Selection persists to `localStorage` under `mtninsights-theme`. The `ThemeProvider` in `ThemeContext.tsx` exposes `useTheme()`.

## Component Organization

```
components/
  ui/             UI primitives (design-system atoms)
    button, badge, dialog, toast, scroll-area, tag,
    checkbox, progress-bar, count-pill, hash-id,
    rich-text-editor, bottom-sheet, responsive-dialog

  shared/         Shared domain primitives (reusable across views)
    list-item-row, command-bar, filter-bar, filter-chip,
    density-toggle, unified-search, group-header,
    section-header, show-more, chat-fab, status-dot,
    mobile-list-header, workspace-banner

  Layout:         ResponsiveShell, LinearShell, TopBar, NavRail,
                  BottomTabBar, BreadcrumbBar

  Feature views:  MeetingList, ThreadsView, InsightsView,
                  TimelinesView, ClientActionItemsView

  Detail views:   MeetingDetail, ThreadDetailView,
                  InsightDetailView, TimelineDetailView, ChatPanel

  Dialogs:        CreateThreadDialog, CreateInsightDialog,
                  CreateMilestoneDialog, NewMeetingDialog,
                  ItemHistoryDialog, EditActionItemDialog, NotesDialog

  Search:         SearchForm, SearchResultsList, SearchResultCard,
                  CompactResultsSidebar, HighlightText
```

## Adding a New Page

1. **Create the page** in `ui/src/pages/NewPage.tsx`. It should accept all state as props and return `ReactNode[]` for the shell's slot-based layout (left panel, right panel).

2. **Create a state hook** in `ui/src/hooks/useNewState.ts` if the page needs its own data fetching or stateful logic. Instantiate it in `App.tsx`.

3. **Register the view** in `App.tsx`:
   - Add the view name to the `currentView` union type
   - Instantiate your hook alongside the others
   - Add a case to render `<NewPage>` inside `ResponsiveShell`

4. **Add navigation** -- add an icon entry to `NavRail.tsx` and `BottomTabBar.tsx`.

5. **If the page needs new API calls**, update the contract in all three places: `electron/channels.ts`, `electron/preload/index.ts`, and `ui/src/api-client/index.ts`.
