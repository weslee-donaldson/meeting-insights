# src/ — Subdirectory index and cross-cutting learnings

## Subdirectories

| Dir | Summary | Scatter |
|-----|---------|---------|
| `components/` | Domain and layout UI components | [scatter.md](components/scatter.md) |
| `pages/` | Feature view composers rendered by App.tsx | [scatter.md](pages/scatter.md) |
| `hooks/` | Data query hooks and stateful feature hooks | [scatter.md](hooks/scatter.md) |
| `lib/` | Utility functions (cn, artifact merging) | [scatter.md](lib/scatter.md) |
| `api-client/` | HTTP fetch implementation of ElectronAPI for web mode | [scatter.md](api-client/scatter.md) |

## Key Learnings from Children

**From `components/`:** The app uses `ResponsiveShell` as the top-level layout, which delegates to `LinearShell` (three-zone: nav rail, left panel, right panel) on desktop, a split-pane layout on tablet, and a single-stack layout on mobile. `BottomTabBar` replaces `NavRail` on mobile/tablet, and `BreadcrumbBar` provides contextual depth navigation. Domain components receive typed props and never call `window.api` directly. The `list-item-row` shared component is the most reused element across all views (now with `touchTarget` and `MeetingAvatar` for mobile). `bottom-sheet.tsx` and `responsive-dialog.tsx` in `ui/` provide viewport-adaptive modal patterns. The Lexical rich-text editor in `components/ui/` is a non-trivial composition (multiple plugins, toolbar, HTML serialization).

**From `hooks/`:** `useBreakpoint` is the responsive layout driver — returns `"mobile"` / `"tablet"` / `"desktop"` and is consumed by `ResponsiveShell`, `BottomTabBar`, `responsive-dialog`, and any viewport-adaptive component. `useMobileNav` provides imperative navigation within the mobile single-stack layout (list/detail/chat transitions). `useMeetingState` is the largest and most complex hook — it orchestrates a chained search pipeline: `useSearch` (hybrid semantic) followed by `useDeepSearch` (LLM re-ranking). When 2+ meetings are checked, parallel artifact queries fire and results are merged via `mergeArtifactsDeduped`. All four feature hooks (meeting, thread, insight, milestone) are instantiated in `App.tsx` and passed as props to pages — components never instantiate hooks themselves.

**From `pages/`:** Pages are intentionally thin composers — they receive all state and callbacks as props, do no data fetching, and return arrays of `ReactNode` for `LinearShell`'s slot-based API. This makes them trivially testable and keeps business logic in hooks.

**From `lib/`:** `mergeArtifactsDeduped` handles multi-select artifact merging with case-insensitive deduplication. `computeActionItemOrigins` maintains a parallel index mapping merged items back to their source meeting, which is critical for routing completion mutations correctly.

**From `api-client/`:** The HTTP client satisfies the same `ElectronAPI` interface as the Electron preload bridge. Adding any new method to `ElectronAPI` in `channels.ts` requires implementing it in both `preload/index.ts` and `api-client/index.ts` — this is the cost of the dual-mode architecture.

## Related

- Scatter: [scatter.md](scatter.md)
- Parent: [../gather.md](../gather.md)
