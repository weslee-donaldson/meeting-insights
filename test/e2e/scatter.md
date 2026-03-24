# e2e/ — End-to-end browser tests for the Electron/web UI

Playwright tests that exercise the full application stack: API server (port 3000) and web UI (port 5173) must both be running. Servers are started automatically via `playwright.config.ts` `webServer` entries before each test run.

## Test Files

| File | Purpose |
|------|---------|
| `helpers.ts` | Shared e2e utilities — `selectClient` (client selector interaction) and `withViewport` (resize to named viewport size for responsive testing) |
| `insights.spec.ts` | Full lifecycle coverage for the Insights feature: navigation, empty state, create dialog (validation, period preview, cancel), detail panel (header elements, Executive Summary, Source Meetings), finalize/reopen status transitions, generate with toast feedback, delete with confirmation dialog, source meeting removal, client filtering (LLSA vs TerraQuantum isolation), chat panel visibility and clear-messages flow, and state consistency (detail panel cleared after delete, list badge updated after finalize) |
| `milestones.spec.ts` | Full lifecycle coverage for the Timelines/Milestones feature: navigation and empty state, create milestone dialog, detail panel (title, status badge, target date), edit mode (title and status changes), delete with confirmation (cancel preserves, confirm removes), Gantt view with today marker, Calendar view with month grid and navigation, chat panel visibility, and state consistency (detail cleared after delete) |
| `responsive-meetings.spec.ts` | Responsive layout verification for meetings view across desktop, tablet, and mobile viewports — validates layout delegation (NavRail vs BottomTabBar), panel arrangement, navigation transitions, and touch interactions |

## Key Concepts

**Server requirements**: Tests call `http://localhost:3000` directly via `fetch` for setup/teardown (create, list, delete resources via API) and drive the browser UI at `http://localhost:5173`. Both servers must be healthy before tests execute.

**Cleanup strategy**: Each spec uses `beforeEach`/`afterEach` hooks that call the API directly to delete all test records for the test client, ensuring a clean slate regardless of prior test failures.

**Conditional skips**: Some tests (source meeting removal, fuzzy match review) use `test.skip()` when required data is absent rather than failing with misleading errors.

**Timeout overrides**: The generate-insight test extends the timeout to 120 seconds to accommodate real LLM latency.

## Related

- Parent: [test/README.md](../README.md)
- Playwright config: `playwright.config.ts` (project root)
