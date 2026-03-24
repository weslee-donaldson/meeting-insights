# test/ — Subdirectory index and cross-cutting learnings

## Subdirectories

| Dir | Summary | Scatter |
|-----|---------|---------|
| `ui/` | React component and hook tests (jsdom + @testing-library/react) | [ui/scatter.md](ui/scatter.md) |
| `e2e/` | Playwright browser tests against live API + web servers | [e2e/scatter.md](e2e/scatter.md) |
| `fixtures/` | Shared test fixtures (transcript files, stub data) | — |
| `screenshots/` | Playwright failure screenshots (gitignored) | — |

## Key Learnings from Children

**From `ui/`:** All 50+ component tests mock `window.api` with a stub implementation — this is the key testing seam. Tests run under jsdom (simulated DOM, not a real browser), which keeps the suite fast but means visual rendering bugs can only be caught by `e2e/`. The `window.api` mock pattern means adding a new API method requires updating the mock in every test file that touches it. Responsive UI Phase 1 added 11 new test files covering `ResponsiveShell`, `BottomTabBar`, `BreadcrumbBar`, `BottomSheet`, `responsive-dialog`, `useBreakpoint`, `useMobileNav`, mobile variants of existing components (workspace-banner, list-item-row), and mobile-specific components (show-more, chat-fab).

**From `e2e/`:** Playwright tests run against the real web stack (`pnpm api:dev` + `pnpm web:dev`) and exercise the full transport path (HTTP fetch → Hono routes → core logic → SQLite). They catch issues that unit tests miss: CORS, serialization, real DOM rendering, and cross-component interaction. Shared helpers (`helpers.ts`) provide `selectClient` and `withViewport` utilities for consistent test setup. `responsive-meetings.spec.ts` validates layout across desktop, tablet, and mobile viewports.

## Related

- Parent: [Root gather](../gather.md)
- [scatter.md](scatter.md)
