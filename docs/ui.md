# UI

Meeting Insights ships a single React application that runs in two modes:

- **Electron desktop app** (`pnpm ui:dev`) -- `window.api` is populated by the IPC preload bridge; the main process owns the database.
- **Web app** (`pnpm web:dev`) -- `window.api` is populated by an HTTP client pointed at the API server. Both modes share the same React components.

The seam is `window.api`. React components never import from IPC or HTTP directly -- they only call `window.api.*`.

## Launch

### Electron
```bash
pnpm ui:dev
```

Launches Vite in dev mode and starts Electron. Hot reload works for the renderer. Main-process changes require an Electron restart.

### Web
```bash
# Terminal 1:
pm2 start ecosystem.config.cjs   # or: pnpm api:dev
# Terminal 2:
pnpm web:dev
```

Opens at http://localhost:5188. Requires the API at http://localhost:3000 (override with `MTI_BASE_URL`).

## Layout: LinearShell

The top-level layout is the **LinearShell**: a 3-zone horizontal split with a left NavRail (56px), a middle main content area (draggable/resizable panels), and an optional right ChatPanel (380px).

```
┌──────────────────────────────────────────────┐
│               TopBar (WorkspaceBanner)        │  ← client selector, search, filters
├────┬─────────────────────────────┬────────────┤
│Nav │  Main content (1-2 panels)   │ Chat panel │
│Rail│  (list + detail, resizable)  │ (optional) │
│56px│                              │   380px    │
└────┴─────────────────────────────┴────────────┘
```

**Responsive:** The `ResponsiveShell` wraps `LinearShell` and adapts:

- **Desktop 1280px+** -- full LinearShell
- **Tablet 768-1280px** -- bottom tab bar + 2-column split
- **Mobile <768px** -- bottom tab bar + single column with breadcrumbs

## Views

The NavRail offers six views. All views are scoped to the currently selected client.

| View | Icon | Shows |
|------|------|-------|
| Meetings | CalendarDays | Meeting list with filters; detail panel with artifact, transcript, chat |
| Action Items | CircleCheck | Consolidated cross-meeting items. Group by priority/series/owner/requester/intent/day/week |
| Threads | Link2 | User-defined topic threads with auto-discovery and LLM relevance scoring |
| Insights | Brain | Period-scoped executive summaries with RAG status |
| Timelines | Milestone | Milestones in calendar or Gantt view with date slippage |
| Search | Search | Cross-meeting search (hybrid + optional deep LLM re-rank) |

## TopBar (WorkspaceBanner)

- **Client selector** -- Dropdown of all clients. Selection is persisted to `localStorage` (`mtninsights-client`)
- **Stats** -- Meeting count, action item count, thread count for the selected client
- **Search bar** -- Quick query; navigates to the Search view with results
- **Date range filters** -- "From" and "to" date pickers with a "Deep" toggle for LLM re-ranking
- **Theme toggle** -- Cycles through 4 themes: stone-light, stone-dark, teal-light, teal-dark
- **Reset** -- Clears all filters and selections

## Chat panel

The right panel appears when:

- A meeting, thread, insight, or milestone is selected
- Search is active with results

It uses the appropriate chat endpoint for context:

- Selected meeting -> `POST /api/meetings/:id/chat`
- Selected thread -> `POST /api/threads/:id/chat`
- Selected insight -> `POST /api/insights/:id/chat`
- Selected milestone -> `POST /api/milestones/:id/chat`
- Search results -> `POST /api/chat/conversation` with the matching meeting IDs

Templates (`jira-ticket`, `jira-epic`, `team-actions`, `thread-discovery`) can constrain output structure. Attachments (images, files) are sent as base64. Notes referenced by ID are inlined into the prompt.

## Pages

Each view is composed from page modules under `electron-ui/ui/src/pages/`:

- `MeetingsPage.tsx` -- `[MeetingList, MeetingDetail]`
- `ActionItemsPage.tsx` -- Multi-panel with preview
- `ThreadsPage.tsx` -- `[ThreadList, ThreadDetail]`
- `InsightsPage.tsx` -- `[InsightList, InsightDetail]`
- `TimelinesPage.tsx` -- `[MilestoneList, TimelineDetail]`
- `SearchPage.tsx` -- Search results + deep-search controls

## Design system

- Tokens live in `electron-ui/ui/src/design-tokens.ts`: spacing, typography, radius, component widths
- 3-tier text color system (primary 7:1, secondary 4.5:1, muted 3:1). Never use decorative colors for readable text
- Radix UI primitives via shadcn
- Tailwind 4 for layout
- Lexical for rich text (editable insight summaries)

## State

- **Client selection** -- `localStorage` (`mtninsights-client`)
- **Panel widths** -- `localStorage` (`mtninsights:columns:<viewId>`)
- **Theme** -- `localStorage` (`mtninsights-theme`)
- **Server state** -- React Query hooks in `electron-ui/ui/src/hooks/`, keyed by client + filters

## Building

### Electron desktop distributable
```bash
pnpm ui:build
```

Outputs to `electron-ui/out/` -- main, preload, and renderer bundles. Packaging into `.dmg` / `.app` is not currently scripted (add `electron-builder` config as a future step).

### Web bundle
`pnpm web:dev` is a dev-only command. For production web deployment, add a production Vite build step and serve the `dist/` output behind any static host; the bundle expects the API to be reachable at `MTI_BASE_URL`.
