# shared/ — Cross-domain reusable UI primitives

Layout and interaction patterns used across multiple feature views. Unlike `ui/` primitives (which are domain-agnostic Radix wrappers), shared components encode application-level patterns like filtering, search, and density — but remain independent of any specific feature (meetings, threads, insights, etc.).

## Files

| File | Purpose |
|------|---------|
| `command-bar.tsx` | Global command palette overlay — keyboard-activated (Cmd+K), searches across meetings, threads, and insights; renders results grouped by domain with keyboard navigation |
| `unified-search.tsx` | Cross-domain search input that dispatches hybrid vector + FTS queries and renders a ranked result list with domain badges |
| `filter-bar.tsx` | Horizontal filter controls row — renders active `FilterChip` components and a dropdown for adding new filters (client, date range, type) |
| `filter-chip.tsx` | Individual removable filter pill — displays a filter label and value with a dismiss button |
| `list-item-row.tsx` | Reusable list row template — left icon slot, title, subtitle, trailing metadata, optional checkbox; used by MeetingList, ThreadsView, InsightsView, TimelinesView |
| `section-header.tsx` | Section heading with optional count badge and action button; used to separate groups within list views |
| `group-header.tsx` | Collapsible group heading for meeting series or date-grouped lists |
| `workspace-banner.tsx` | Top workspace status banner — shows active client name and processing status; supports a compact mobile mode with reduced padding |
| `density-toggle.tsx` | Compact/comfortable/spacious density switcher — persists preference to localStorage; affects row height and spacing across all list views |
| `show-more.tsx` | Text truncation with CSS line-clamp and a Show more/Show less toggle button |
| `chat-fab.tsx` | Floating action button that opens the chat panel; rendered in the bottom-right corner of the mobile detail view |
| `mobile-list-header.tsx` | Mobile-specific list header with large title, optional subtitle, filter slot, and a "+ New" action button; replaces TopBar controls on mobile viewports |
| `status-dot.tsx` | Colored circle indicator for status values; maps semantic names (`green`, `tracked`, `completed`, `missed`, etc.) to theme-aware CSS color variables |
| `filter-chip-button.tsx` | Toggleable pill button for filter options; shows active/inactive state with accent-colored highlight; used in horizontal filter rows |
| `SystemHealthBanner.tsx` | Full-width alert banner placed above the workspace. Hidden when healthy or loading. Red (`bg-red-600`) when `health.status === "critical"` — shows provider name, resolution hint, and affected meeting count badge, plus a dismiss button. Gray (`bg-gray-600`) when `isError` is true (health endpoint unreachable) with "Unable to reach server" message. Uses `AlertTriangle`, `WifiOff`, `X` icons from lucide-react. |

## Key Concepts

**`list-item-row.tsx` is the most reused component.** Every list view (meetings, threads, insights, timelines, action items) renders rows through this template. Changes to its layout, spacing, or slot API affect all views. It now accepts a `touchTarget` prop for mobile-friendly hit areas and exports a `MeetingAvatar` sub-component.

**Density is global.** The `density-toggle.tsx` state is read by `list-item-row.tsx` and other layout components. It controls row padding, font size, and icon size across the entire app — not per-view.

## Related

- Parent: [../gather.md](../gather.md)
- Primitive building blocks: `../ui/`
- Design tokens: `../../design-tokens.ts`
