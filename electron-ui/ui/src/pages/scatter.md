# pages/ — Feature view composers

Page components are thin composers — they receive state and callbacks as props from `App.tsx` and arrange domain components into the layout zones expected by `LinearShell`. Each page returns an array of `React.ReactNode` elements (left panel, right panel, etc.) rather than a single root element, matching `LinearShell`'s slot-based layout API.

## Files

| File | Purpose |
|------|---------|
| `MeetingsPage.tsx` | Composes `MeetingList` (left panel) and `MeetingDetail` (right panel); handles single-select and multi-select display including merged artifact view |
| `ActionItemsPage.tsx` | Composes `ClientActionItemsView` (left panel) and a `MeetingDetail` preview panel (right panel) for meeting context when clicking into an action item |
| `ThreadsPage.tsx` | Composes `ThreadsView` (left panel), `ThreadDetailView` (right panel), and an optional `MeetingDetail` preview panel; includes inline artifact merging for thread-linked meetings |
| `InsightsPage.tsx` | Composes `InsightsView` (left panel), `InsightDetailView` (right panel), and a `MeetingDetail` preview panel |
| `TimelinesPage.tsx` | Composes `TimelinesView` (left panel) and `TimelineDetailView` (right panel) |
| `SearchPage.tsx` | Composes `SearchForm` (collapsible), `SearchResultsList` or `CompactResultsSidebar` (left panel), and `MeetingDetail` (right panel) for the selected result; manages search state, field filters, grouping, sorting, and deep search toggle |

## Key Concepts

**Props-only components:** Pages do not call `window.api` or use hooks themselves (with the exception of `ThreadsPage`, which issues `useQueries` for thread candidate artifacts). All data fetching is done in the stateful hooks (`useMeetingState`, `useThreadState`, etc.) and passed in as props. This keeps pages fast to render and easy to test in isolation.

**`App.tsx` controls which page is active** based on `currentView` state (`"meetings"`, `"action-items"`, `"threads"`, `"insights"`, `"timelines"`). Only the active page's nodes are rendered inside `LinearShell`.

## Related

- Parent: [../README.md](../README.md)
- Layout shell: `../components/LinearShell.tsx`
- State source: `../hooks/`
- Orchestrator: `../App.tsx`
