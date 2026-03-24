# components/ — Domain UI components

All React components that render domain data. Organized into layout, feature-view, detail-view, dialog, and utility groups. Components here accept typed domain props and call `window.api` only through callbacks passed from page components or hooks — they do not fetch data directly.

## Files

### Layout

| File | Purpose |
|------|---------|
| `ResponsiveShell.tsx` | Top-level responsive layout — delegates to `LinearShell` on desktop, split-pane on tablet, single-stack on mobile; uses `useBreakpoint()` to select strategy |
| `LinearShell.tsx` | Three-zone fixed layout (nav rail, left panel, right panel); used as the desktop delegate inside `ResponsiveShell` |
| `TopBar.tsx` | Application top bar — client selector, search bar, date filters, action buttons, theme switcher |
| `NavRail.tsx` | Left-side vertical navigation rail with icons for each view (meetings, action items, threads, insights, timelines) |
| `BottomTabBar.tsx` | Horizontal bottom navigation bar with 5 nav items (meetings, action items, threads, insights, timelines) for mobile and tablet viewports |
| `BreadcrumbBar.tsx` | Contextual navigation breadcrumbs with chevron separators; horizontally scrollable on narrow viewports |

### Meeting views

| File | Purpose |
|------|---------|
| `MeetingList.tsx` | Scrollable meeting list with grouping (by series or date), sorting (date or relevance), multi-select checkboxes, search score annotations, and deep search summaries |
| `MeetingDetail.tsx` | Right-panel meeting artifact viewer — shows summary, decisions, action items (with completion tracking), open questions, risks, proposed features, additional notes, and mention stats; includes chat panel trigger and re-extraction controls |

### Feature views (left panel)

| File | Purpose |
|------|---------|
| `ThreadsView.tsx` | Thread list for the selected client; supports create, select, and candidate count display |
| `InsightsView.tsx` | Insight list grouped by period; supports create and select |
| `TimelinesView.tsx` | Milestone list with status badges; supports create, calendar view, and Gantt view |
| `ClientActionItemsView.tsx` | Flat list of all incomplete action items for the selected client across all meetings, sortable by priority, with inline edit support |

### Detail views (right panel)

| File | Purpose |
|------|---------|
| `ThreadDetailView.tsx` | Thread detail — summary, linked meetings, candidate browser, meeting management, thread chat panel |
| `InsightDetailView.tsx` | Insight detail — executive summary (rich text), RAG status, linked meetings, generate/regenerate controls, insight chat panel |
| `TimelineDetailView.tsx` | Milestone detail — status, target date, date slippage history, linked action items, mention review queue, merge controls, milestone chat panel |
| `ChatPanel.tsx` | Reusable conversation chat panel — maintains message history, supports attachments (image/file), template selection, and transcript inclusion toggle; rendered inside MeetingDetail, ThreadDetailView, InsightDetailView, and TimelineDetailView |

### Dialogs

| File | Purpose |
|------|---------|
| `CreateThreadDialog.tsx` | Modal form for creating a new thread (title, shorthand, description, criteria prompt, keywords) |
| `CreateInsightDialog.tsx` | Modal form for creating a new insight (period type and date range) |
| `CreateMilestoneDialog.tsx` | Modal form for creating a new milestone (title, target date, description) |
| `NewMeetingDialog.tsx` | Modal form for manually importing a meeting (client, date, title, transcript format, raw transcript) |
| `ItemHistoryDialog.tsx` | Modal showing the mention history of a canonical action item or decision across all meetings |
| `EditActionItemDialog.tsx` | Modal form for editing an action item's description, owner, requester, due date, and priority |

### Utilities

| File | Purpose |
|------|---------|
| `HighlightText.tsx` | Renders a string with search query terms highlighted using `<mark>` spans |
| `SearchBar.tsx` | Controlled search input with debounce; used in TopBar |
| `MilestoneCalendarView.tsx` | Calendar grid view of milestones plotted by target date |
| `MilestoneGanttView.tsx` | Horizontal Gantt chart view of milestones with status color coding |

## Related

- Parent: [../gather.md](../gather.md)
- Gathered context: [gather.md](gather.md)
- Page composers: `../pages/`
- Primitives: `./ui/`
