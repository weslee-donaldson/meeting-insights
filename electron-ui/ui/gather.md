# ui/ — React UI package

The renderer-side package of the Meeting Intelligence Explorer. It is a standard Vite + React + TypeScript project with two entry points: one for running inside Electron, and one for running as a standalone web application backed by the Hono HTTP API.

## Key Concepts

**Two HTML entry points:**

| File | Entry script | Mode |
|------|-------------|------|
| `index.html` | `src/main.tsx` | Electron — `window.api` is populated by the preload context bridge |
| `index-web.html` | `src/main-web.tsx` | Web browser — `window.api` is assigned from `api-client/index.ts` before React mounts; includes PWA meta tags and manifest link |

Both entry points render the same `App` component. The only difference is how `window.api` is wired.

**PWA support:** `index-web.html` links to `public/manifest.json` (app name, icons, display mode) and `public/icons/` (icon-192.svg, icon-512.svg), enabling "Add to Home Screen" on mobile browsers.

## Subdirectories

| Dir | Summary | Docs |
|-----|---------|------|
| `src/` | All React application source | [scatter](src/scatter.md) · [gather](src/gather.md) |

## Key Learnings from Children

**From `src/`:** State architecture follows a strict hierarchy: `App.tsx` instantiates four feature hooks (`useMeetingState`, `useThreadState`, `useInsightState`, `useMilestoneState`) and passes slices of state down through pages to components. Components never call `window.api` or use hooks directly.

The search pipeline chains two stages: hybrid semantic search (vector + FTS via `useSearch`) then LLM re-ranking (`useDeepSearch`). Multi-select (2+ checked meetings) triggers parallel artifact queries merged via `mergeArtifactsDeduped` with a back-reference index for routing mutations.

The layout is responsive via `ResponsiveShell`, which delegates to `LinearShell` (three-zone: nav rail, left panel, right panel) on desktop, split-pane on tablet, and single-stack on mobile. `useBreakpoint()` drives the viewport tier, `BottomTabBar` replaces `NavRail` on mobile/tablet, and `BreadcrumbBar` provides contextual depth navigation. `useMobileNav` manages list/detail/chat transitions in the mobile stack. `design-tokens.ts` contains per-breakpoint layout values. `bottom-sheet.tsx` and `responsive-dialog.tsx` provide viewport-adaptive modal patterns.

Pages are thin composers that receive props and return slot arrays. The `list-item-row` shared component renders every list view's rows (with `touchTarget` for mobile).

Adding a new `ElectronAPI` method requires changes in three places: `channels.ts` (type), `preload/index.ts` (IPC bridge), and `api-client/index.ts` (HTTP client).

## Related

- Parent: [../gather.md](../gather.md)
- Electron main process: `../electron/` ([scatter](../electron/scatter.md) · [gather](../electron/gather.md))
