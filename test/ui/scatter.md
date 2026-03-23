# ui/ — React component and hook tests

Vitest tests for the Electron/web UI layer, run under a jsdom environment with `@testing-library/react`. All tests stub `window.api` with a mock implementation to avoid real IPC calls (Electron) or HTTP calls (web:dev mode), keeping the suite fast and deterministic.

## Test Files

### Components

| File | Purpose |
|------|---------|
| `app.test.tsx` | Top-level `App` component rendering, client selection, and view switching |
| `linear-shell.test.tsx` | Three-zone layout shell (nav rail, list, detail) |
| `nav-rail.test.tsx` | Navigation rail icons, active state, and routing |
| `top-bar.test.tsx` | Top bar rendering and client selector behavior |
| `meeting-list.test.tsx` | Meeting list rendering, selection, checkbox state |
| `meeting-detail.test.tsx` | Meeting detail panel sections and artifact display |
| `insights-view.test.tsx` | Insights list rendering and empty state |
| `insight-detail-view.test.tsx` | Insight detail panel: summary, source meetings, status badges |
| `create-insight-dialog.test.tsx` | Create insight dialog form, period type selection, validation |
| `threads-view.test.tsx` | Thread list rendering and empty state |
| `thread-detail-view.test.tsx` | Thread detail panel sections and evaluation display |
| `create-thread-dialog.test.tsx` | Create thread dialog form and validation |
| `timelines-view.test.tsx` | Timelines/milestones list and view switching |
| `timeline-detail-view.test.tsx` | Timeline detail panel and milestone detail |
| `milestone-calendar-view.test.tsx` | Calendar view month grid and navigation |
| `milestone-gantt-view.test.tsx` | Gantt view bars and today marker |
| `create-milestone-dialog.test.tsx` | Create milestone dialog form |
| `search-bar.test.tsx` | Search bar input, query submission, and results display |
| `chat-panel.test.tsx` | Chat panel message display, input, and send behavior |
| `new-meeting-dialog.test.tsx` | New meeting dialog form and file upload |
| `item-history-dialog.test.tsx` | Item history dialog rendering and diff display |
| `rich-text-editor.test.tsx` | Rich text editor input and formatting |
| `client-action-items.test.tsx` | Client action items list rendering |
| `highlight-text.test.tsx` | Text highlighting component with search term matches |
| `scroll-area.test.tsx` | Scroll area component behavior |
| `shadcn-components.test.tsx` | Shared shadcn/ui component integration checks |
| `toast.test.tsx` | Toast notification rendering and dismissal |
| `theme.test.tsx` | Theme toggling and CSS variable application |

### Hooks and Utilities

| File | Purpose |
|------|---------|
| `hooks.test.tsx` | Custom React hooks (data fetching, state management) |
| `api-client.test.ts` | `api-client.ts` HTTP fetch adapter that implements `ElectronAPI` for web:dev mode |
| `artifact-search.test.ts` | Artifact search utility functions |
| `merge-artifacts.test.ts` | Artifact merge/dedup utility functions |

## Key Concepts

**Mock `window.api`**: Each test file configures a stub of the `window.api` object, which is the shared interface used by both the Electron preload (IPC) and the web API client (HTTP). Tests assert component behavior without network or process boundaries.

**jsdom environment**: Configured in `vitest.config.ts`. Tests run in a simulated browser DOM, not a real browser — Playwright handles real browser testing in `test/e2e/`.

## Related

- Parent: [test/README.md](../README.md)
- E2E tests: [test/e2e/README.md](../e2e/README.md)
