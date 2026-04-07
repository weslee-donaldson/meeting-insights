# Ketchup Plan: System Health Monitoring & Alert Notifications

## Context

The pipeline (`core/pipeline.ts`) catches LLM errors (402 insufficient funds, 401 auth, 429 rate limits) and writes audit JSON files to `data/audit/`, but nothing reads those files. Failed meetings are moved to `failedDir` and the UI has zero visibility into failures. A user can process an entire batch of meetings with an expired API key and never know extraction failed until they manually inspect individual meetings for missing artifacts.

**Why this matters:** The system runs unattended on webhooks. Meetings arrive and are processed automatically without an operator present. The operator consumes extracted insights programmatically via CLI/MCP throughout the workday. When extraction silently fails, the operator loses visibility into their meetings with no signal that anything is wrong -- potentially for days.

**Problem statement:** When the LLM provider becomes unavailable (insufficient funds, revoked API key, auth failure, sustained rate limiting), the system silently processes meetings without attaching any insights. The operator has no notification, no banner, no health status -- the failure is invisible.

**What this plan delivers:**
1. Persistent error tracking in SQLite (`system_errors` table)
2. Health query API (`GET /api/health`) that surfaces unacknowledged critical errors and failed meeting counts
3. Email alert notifications via SMTP when critical errors are recorded
4. A UI health banner (red) that appears when the system has critical errors, with actionable resolution hints
5. Acknowledge/dismiss flow with cooldown to prevent alert fatigue during sustained outages
6. MTI CLI `health` commands (`mti health status`, `mti health acknowledge`) for programmatic health checks
7. E2E Playwright tests proving the banner renders in the browser with correct content, position, and dismiss behavior
8. E2E CLI tests proving `mti health` commands work against a live API

**What this plan does NOT deliver:**
- Retry logic for failed meetings (future work)
- Per-meeting error status badges in the meeting list (future work)
- Circuit breaker / fail-fast on sustained LLM failures (future work)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Error persistence | SQLite `system_errors` table | Queryable, transactional, same DB as all other state -- no separate store |
| Severity model | `critical` (api_error) only at launch | Rate limits are transient/self-resolving; amber tier deferred to avoid alert fatigue (review feedback: showing transient warnings trains operator to ignore banners) |
| Email transport | nodemailer + SMTP (Gmail App Password or any SMTP) | Simple, no OAuth complexity, sender != receiver |
| Email trigger | On `critical` errors only, max 1 per 15-minute window | Prevents email floods during batch processing with dead API key |
| Email throttle | Dedicated `last_notified_at` column, decoupled from acknowledge | Review feedback: original throttle was coupled to acknowledged flag -- acknowledging errors would reset throttle window and trigger new email floods |
| Health poll interval | 30 seconds via React Query `refetchInterval` | Consistent with existing query patterns, low overhead |
| Acknowledge flow | POST `/api/health/acknowledge` with 1-hour cooldown | Review feedback: raw acknowledge without cooldown creates whack-a-mole during active outages. After dismiss, same error_type is suppressed for 1 hour |
| Health status levels | `healthy` / `critical` (no amber tier at launch) | Review feedback: amber for transient rate limits trains operator to ignore all banners. Ship red-only, add amber later once engagement is validated |
| Banner content | Error type + count + resolution hint | Review feedback: "api_error: 402" alone isn't actionable. Banner includes "what happened" + "what to do" + "how many meetings affected" |
| Error deduplication | Banner groups by error_type, shows count | Review feedback: 30 identical errors from one dead API key should show "API auth failed (affecting 30 meetings)" not "30 errors" |
| `meetings_without_artifact` | Time-gated: only meetings older than 5 minutes | Review feedback: freshly ingested meetings always briefly lack artifacts during pipeline processing, producing false positives |
| `recordSystemError` resilience | try/catch with stderr fallback | Review feedback: if the monitoring DB write itself fails, the system silently swallows the failure it was designed to catch |
| Table retention | Auto-prune errors older than 90 days | Review feedback: unbounded table growth on flaky providers. Prune runs inside `getHealthStatus()` |
| Banner placement | Top of app, above WorkspaceBanner, full-width | Unmissable, non-modal, dismissible |

## Tooling & Stack

- **Runtime**: Node.js (ESM, `"type": "module"` in package.json)
- **Language**: TypeScript 5.9, strict mode, `module: "NodeNext"`, `moduleResolution: "NodeNext"`
- **HTTP framework**: Hono 4.12
- **Database**: SQLite via `node:sqlite` (`DatabaseSync` -- synchronous API, no async)
- **Testing**: Vitest 4.0, test files at `test/**/*.test.ts`, 100% branch coverage enforced
- **Package manager**: pnpm
- **New dependency**: `nodemailer` (SMTP email transport)
- **New dev dependency**: `@types/nodemailer`
- **UI**: React 18, `@tanstack/react-query`, Tailwind CSS, lucide-react icons
- **Existing patterns**: `core/` pure functions with `db: DatabaseSync` first arg; `api/routes/` `registerXxxRoutes(app, db, ...)` pattern; `electron-ui/electron/channels.ts` `ElectronAPI` interface + `CHANNELS` const; `api-client/` HTTP fetch implementations

**Key patterns agents must follow:**
- All `core/` modules export pure functions that take `db: DatabaseSync` as first arg
- `core/` is the dependency sink -- never imports from `api/` or `electron-ui/`
- `api/routes/` files export `registerXxxRoutes(app, db, ...)` functions
- API tests use `app.request(path)` on a Hono app created with in-memory SQLite
- Core tests use `createDb(":memory:")` + `migrate(db)` for isolation
- TCR: `pnpm test --run && git add -A && git commit -m "..." || git checkout -- .`

## Framework Quirks

1. **SQLite `node:sqlite` is synchronous** -- `db.prepare().run()`, `.get()`, `.all()`. No promises. No `await`.
2. **Hono middleware ordering** -- Middleware via `app.use()` runs in registration order. Health routes should be registered alongside debug routes.
3. **`createApp` is a pure function** -- Returns Hono app without starting listener. Notification config must be passed as parameter, not read from env inside.
4. **React Query polling** -- `refetchInterval: 30000` on `useQuery` provides automatic polling. `enabled` flag gates the query.
5. **Toast system** -- Existing `useToast()` hook provides `addToast(message, "error" | "success")`. The health banner is NOT a toast -- it's a persistent banner that stays until acknowledged.
6. **ElectronAPI is the UI contract** -- Both Electron IPC and `api-client/` implement this interface. New methods must be added to both.
7. **nodemailer is callback/promise-based** -- `transporter.sendMail()` returns a Promise. Wrap in try/catch; notification failure must never crash the pipeline.

## Error Propagation Path

```
core/llm-provider-*.ts  -->  throw Error("[api_error] ...") or Error("[rate_limit] ...")
  |
core/extractor.ts       -->  throw ExtractionError (if all chunks fail)
  |
core/pipeline.ts processEntry()  -->  catch block:
  1. moveToFailed()
  2. writeFileSync(auditDir, ...)        <-- existing behavior
  3. try { recordSystemError(db, ...) }  <-- NEW: write to system_errors table
     catch { console.error(...) }        <-- NEW: stderr fallback if DB write fails
  4. sendAlertIfNeeded(notifier, ...)     <-- NEW: email notification (critical only, throttled)
  |
  returns { status: "failed", reason }
```

**Non-LLM errors:** Parse failures, file I/O errors, and DB errors also flow through this catch block. They will be classified as `error_type: "unknown"`, `severity: "warning"`. The `provider` field will be `null` for non-LLM errors. This is correct -- these are operational issues, not critical API failures requiring immediate attention.

## Data Shapes

### `system_errors` Table

```sql
CREATE TABLE IF NOT EXISTS system_errors (
  id TEXT PRIMARY KEY,
  error_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  meeting_filename TEXT,
  provider TEXT,
  acknowledged INTEGER DEFAULT 0,
  acknowledged_until TEXT,
  notified INTEGER DEFAULT 0,
  last_notified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

- `error_type`: `"rate_limit"` | `"api_error"` | `"json_parse"` | `"unknown"` (matches `extractErrorType()` return values)
- `severity`: `"critical"` | `"warning"` (derived: `api_error` -> critical, others -> warning)
- `provider`: LLM provider name at time of error (`"openai"`, `"anthropic"`, `"local"`, `"claudecli"`, etc.), `null` for non-LLM errors
- `notified`: 1 if an email alert was sent for this error, 0 otherwise
- `last_notified_at`: ISO timestamp of when the email was sent (used for throttle, decoupled from `acknowledged`)
- `acknowledged`: 1 after the user dismisses the banner via UI
- `acknowledged_until`: ISO timestamp -- when acknowledging, set to `datetime('now', '+1 hour')`. New errors of the same `error_type` created before this timestamp are auto-acknowledged. Prevents whack-a-mole during sustained outages.

### `SystemError` TypeScript Type

```ts
interface SystemError {
  id: string;
  error_type: "rate_limit" | "api_error" | "json_parse" | "unknown";
  severity: "critical" | "warning";
  message: string;
  meeting_filename: string | null;
  provider: string | null;
  acknowledged: boolean;
  created_at: string;
}
```

Note: `notified`, `last_notified_at`, and `acknowledged_until` are internal DB fields not exposed in the API response.

### `HealthStatus` Response Shape

```ts
interface HealthStatus {
  status: "healthy" | "critical";
  error_groups: ErrorGroup[];
  meetings_without_artifact: number;
  last_error_at: string | null;
}

interface ErrorGroup {
  error_type: string;
  severity: "critical" | "warning";
  count: number;
  latest_message: string;
  latest_meeting_filename: string | null;
  provider: string | null;
  resolution_hint: string;
}
```

- `status`: `"critical"` if any unacknowledged `severity=critical` errors exist; `"healthy"` otherwise (no amber tier at launch)
- `error_groups`: errors grouped by `error_type`, deduplicated. Each group has a count, the latest message, and a resolution hint
- `meetings_without_artifact`: count of meetings where `created_at < datetime('now', '-5 minutes')` with no artifact row and `ignored = 0`
- `last_error_at`: `created_at` of most recent system error (acknowledged or not), `null` if no errors exist

### Resolution Hints Map

```ts
const RESOLUTION_HINTS: Record<string, string> = {
  api_error: "Check your LLM provider account billing and API key validity",
  rate_limit: "Rate limiting is usually transient and self-resolves. If persistent, check your provider's rate limit tier",
  json_parse: "The LLM returned unparseable output. This is usually transient. If persistent, check the extraction prompt",
  unknown: "Check the application logs for details",
};
```

### SMTP / Notification Config

```ts
interface NotificationConfig {
  smtpHost: string;       // e.g. "smtp.gmail.com"
  smtpPort: number;       // e.g. 587
  smtpUser: string;       // sender account (e.g. "myapp@gmail.com")
  smtpPass: string;       // app password or SMTP password
  alertEmail: string;     // recipient (e.g. "admin@company.com") -- NOT necessarily same as sender
}
```

Environment variables:
- `MTNINSIGHTS_SMTP_HOST`
- `MTNINSIGHTS_SMTP_PORT` (default: 587)
- `MTNINSIGHTS_SMTP_USER`
- `MTNINSIGHTS_SMTP_PASS`
- `MTNINSIGHTS_ALERT_EMAIL`

Notifications are enabled only when ALL five env vars are set. When any is missing, `createNotifier` returns a no-op implementation.

### Email Throttle Logic (Decoupled from Acknowledge)

```
On critical error:
  1. Check system_errors for ANY row WHERE last_notified_at > datetime('now', '-15 minutes')
  2. If found: skip email (already notified recently), still mark notified=1 on the new error
  3. If not found: send email, UPDATE SET notified=1, last_notified_at=datetime('now') WHERE id=?
  4. If sendMail() throws: leave notified=0, log to stderr. Do NOT crash pipeline.
```

The throttle window is based on `last_notified_at`, not `acknowledged`. Acknowledging errors in the UI does NOT affect email throttling.

### Email Content

Subject: `[Meeting Insights] Critical: LLM API error`
Body (plain text):
```
Meeting Insights has detected a critical error.

Error type: api_error
Provider: openai
Message: [api_error] 402 Insufficient funds
Meeting: 2026-04-01_standup.json
Time: 2026-04-01T14:30:00Z

Affected meetings so far: 12 meeting(s) processed without insights.

Action required: Check your OpenAI account billing and API key validity.
Affected meetings will need to be reprocessed after the issue is resolved.
```

The "affected meetings so far" count comes from `meetings_without_artifact` at the time the email is sent.

## Reference Files

| File | Why |
|------|-----|
| `core/db.ts` | Migration target -- add `system_errors` table |
| `core/pipeline.ts` | Integration point -- `processEntry()` catch block writes errors |
| `core/errors.ts` | Error class hierarchy -- `AppError`, `ExtractionError`, etc. |
| `core/llm-adapter.ts` | `LlmAdapter` interface, provider config types |
| `core/logger.ts` | Logging patterns -- `createLogger`, `logLlmCall`, file logging |
| `api/server.ts` | `createApp()` -- wire health routes here |
| `api/routes/debug.ts` | Pattern for `registerXxxRoutes(app, db, ...)` |
| `api/main.ts` | Server startup -- read env vars, pass config to `createApp()` |
| `local-service/main.ts` | Pipeline caller -- passes `PipelineConfig` to `processNewMeetings` |
| `cli/admin-util/run.ts` | Pipeline caller -- another `processNewMeetings` call site |
| `electron-ui/electron/channels.ts` | `CHANNELS` const + `ElectronAPI` interface |
| `electron-ui/ui/src/api-client/base.ts` | `fetchJson`, `fetchJsonOrNull`, `jsonPost` helpers |
| `electron-ui/ui/src/api-client/index.ts` | `apiClient` object -- spread all method modules |
| `electron-ui/ui/src/App.tsx` | Root component -- health banner placement |
| `electron-ui/ui/src/components/ui/toast.tsx` | Existing toast pattern (banner is NOT a toast) |
| `electron-ui/ui/src/components/shared/workspace-banner.tsx` | Existing banner pattern for layout reference |

## Testing Strategy

- **Per-burst TDD**: Every burst starts with a failing test, writes minimal passing code, then TCR
- **In-memory SQLite**: All tests use `createDb(":memory:")` + `migrate(db)`
- **100% coverage enforced**: No escape hatches on new files
- **Existing tests must pass**: Migration adds new table, does not alter existing tables
- **Notifier tests**: Mock nodemailer transport -- test that `sendMail` is called with correct args, and that throttle logic prevents duplicate sends
- **Health API tests**: Use Hono `app.request()` pattern from `test/api-debug.test.ts`
- **UI tests**: jsdom env, mock `window.api.getHealth`, verify banner renders/hides

### Test Fixture: SystemError Row

```ts
// What the DB returns (raw row from db.prepare().all())
const rawRow = {
  id: "err-uuid-1",
  error_type: "api_error",
  severity: "critical",
  message: "[api_error] 402 Insufficient funds",
  meeting_filename: "2026-04-01_standup.json",
  provider: "openai",
  acknowledged: 0,
  acknowledged_until: null,
  notified: 0,
  last_notified_at: null,
  created_at: "2026-04-01 14:30:00",
};

// What the API returns (transformed for consumer -- internal fields stripped)
const apiError = {
  id: "err-uuid-1",
  error_type: "api_error",
  severity: "critical",
  message: "[api_error] 402 Insufficient funds",
  meeting_filename: "2026-04-01_standup.json",
  provider: "openai",
  acknowledged: false,
  created_at: "2026-04-01 14:30:00",
};
```

### Test Fixture: HealthStatus Response

```ts
const healthyResponse = {
  status: "healthy",
  error_groups: [],
  meetings_without_artifact: 0,
  last_error_at: null,
};

const criticalResponse = {
  status: "critical",
  error_groups: [{
    error_type: "api_error",
    severity: "critical",
    count: 12,
    latest_message: "[api_error] 402 Insufficient funds",
    latest_meeting_filename: "2026-04-01_standup.json",
    provider: "openai",
    resolution_hint: "Check your LLM provider account billing and API key validity",
  }],
  meetings_without_artifact: 12,
  last_error_at: "2026-04-01 14:30:00",
};
```

### Test Fixture: SystemError with null optional fields

```ts
const errorWithNulls = {
  id: "err-uuid-2",
  error_type: "unknown",
  severity: "warning",
  message: "parse failed",
  meeting_filename: null,
  provider: null,
  acknowledged: 0,
  acknowledged_until: null,
  notified: 0,
  last_notified_at: null,
  created_at: "2026-04-01 14:31:00",
};
```

---

## Phase 1: Error Tracking Infrastructure

### Dependency Graph (Phase 1)

```
Section 1 -- Sequential (schema + core functions)
  Burst 1 -> 2 -> 3 -> 4
      |
Section 2 -- Sequential (pipeline integration)
  Burst 5 -> 6
```

### Phase 1 Bursts

#### Section 1: Core Error Tracking

- [x] Burst 1: Add `system_errors` table to `core/db.ts` `migrate()`. Columns: `id TEXT PRIMARY KEY`, `error_type TEXT NOT NULL`, `severity TEXT NOT NULL`, `message TEXT NOT NULL`, `meeting_filename TEXT`, `provider TEXT`, `acknowledged INTEGER DEFAULT 0`, `acknowledged_until TEXT`, `notified INTEGER DEFAULT 0`, `last_notified_at TEXT`, `created_at TEXT NOT NULL DEFAULT (datetime('now'))`. Add index: `CREATE INDEX IF NOT EXISTS idx_system_errors_unack ON system_errors(acknowledged, severity, created_at)`. Test in `test/db.test.ts`:
  - Table exists after migration
  - All columns present with correct types/defaults
  - Index exists
  - Insert a row with all fields, verify defaults for `acknowledged` (0), `notified` (0), `acknowledged_until` (null), `last_notified_at` (null)

- [x] Burst 2: Create `core/system-health.ts` -- `recordSystemError(db, { error_type, message, meeting_filename?, provider? })`. Derives `severity` from `error_type` (`api_error` -> `critical`; `rate_limit` -> `warning`; `json_parse` -> `warning`; `unknown` -> `warning`). Generates UUID `id` via `randomUUID()`. Checks for an active cooldown: if `system_errors` has a row WHERE `error_type` matches AND `acknowledged_until > datetime('now')`, auto-set `acknowledged=1` on the new row. Returns the inserted `SystemError`. Wrap the entire function body in try/catch -- if the DB write fails, log to `console.error` and return `null`. Test in `test/system-health.test.ts`:
  - Insert with `error_type: "api_error"` -> severity is `"critical"`
  - Insert with `error_type: "rate_limit"` -> severity is `"warning"`
  - Insert with `error_type: "json_parse"` -> severity is `"warning"`
  - Insert with `error_type: "unknown"` -> severity is `"warning"`
  - Insert with `meeting_filename: undefined` -> stored as `null`
  - Insert with `provider: undefined` -> stored as `null`
  - Insert with both optional fields provided -> stored correctly
  - Verify returned object has exact `SystemError` shape (all fields)
  - Cooldown: acknowledge an error_type with `acknowledged_until` 1 hour in future, insert new error of same type -> auto-acknowledged. Insert error of *different* type -> NOT auto-acknowledged.

- [ ] Burst 3: `core/system-health.ts` -- `getHealthStatus(db)` returns `HealthStatus`. Steps:
  1. Auto-prune: `DELETE FROM system_errors WHERE created_at < datetime('now', '-90 days')`
  2. Query unacknowledged critical errors, GROUP BY `error_type` to produce `ErrorGroup[]` with count, latest message, latest meeting_filename, provider, and resolution hint from `RESOLUTION_HINTS` map
  3. Count meetings without artifacts: `SELECT COUNT(*) FROM meetings LEFT JOIN artifacts ON meetings.id = artifacts.meeting_id WHERE artifacts.meeting_id IS NULL AND meetings.ignored = 0 AND meetings.created_at < datetime('now', '-5 minutes')`
  4. Get `last_error_at`: `SELECT MAX(created_at) FROM system_errors`
  5. Derive status: `"critical"` if any group has `severity=critical`, else `"healthy"`

  Test in `test/system-health.test.ts`:
  - **Healthy**: no errors, no meetings -> `{ status: "healthy", error_groups: [], meetings_without_artifact: 0, last_error_at: null }`
  - **Critical**: insert 3 `api_error` rows -> single error_group with count 3, correct latest_message
  - **Mixed error types**: insert `api_error` + `rate_limit` -> critical wins, two error_groups returned
  - **meetings_without_artifact**: insert meeting without artifact row (created_at > 5 min ago) -> count = 1. Insert meeting with artifact -> count still 1. Insert ignored meeting without artifact -> not counted.
  - **Time gate**: insert meeting without artifact created NOW -> not counted (within 5-min window). Insert meeting created 10 min ago without artifact -> counted.
  - **last_error_at**: insert two errors with different created_at -> returns the later timestamp. No errors -> null.
  - **Acknowledged errors excluded**: insert error, acknowledge it, getHealthStatus -> healthy
  - **Auto-prune**: insert error with created_at 91 days ago, call getHealthStatus -> row deleted

- [ ] Burst 4: `core/system-health.ts` -- `acknowledgeErrors(db, errorIds: string[])` sets `acknowledged=1` and `acknowledged_until=datetime('now', '+1 hour')` for given IDs. `acknowledgeAllErrors(db)` does the same for all unacknowledged rows. Test in `test/system-health.test.ts`:
  - Record 3 errors, acknowledge 2 by ID -> only those 2 have `acknowledged=1` and `acknowledged_until` set
  - Acknowledge all -> remaining also acknowledged
  - `getHealthStatus` returns `healthy` after acknowledging all critical errors
  - `acknowledgeErrors(db, [])` -> no-op, no errors thrown
  - `acknowledgeErrors(db, ["nonexistent-id"])` -> no-op, no errors thrown
  - Verify `acknowledged_until` is approximately 1 hour from now (within 5s tolerance)

#### Section 2: Pipeline Integration

- [ ] Burst 5: Update `core/pipeline.ts` `processEntry()` catch block -- after writing audit JSON, call `recordSystemError(db, { error_type: extractErrorType(reason), message: reason, meeting_filename: name, provider })`. The `provider` must be passed into `processEntry` (add to function signature) and through from `PipelineConfig`. The `recordSystemError` call is wrapped in the existing try/catch that `recordSystemError` already has internally (belt and suspenders).

  **Signature changes:**
  - `PipelineConfig` gains `provider?: string`
  - `processEntry()` gains `provider: string` parameter (after `threadSimilarityThreshold`)
  - Callers in `processNewMeetings()` and `processWebhookMeetings()` pass `config.provider ?? "unknown"`

  Test in `test/pipeline.test.ts`:
  - Process a meeting with a stub LLM that throws `new Error("[api_error] 402 Insufficient funds")` -> verify `system_errors` table has a row with `error_type: "api_error"`, `severity: "critical"`, `message` containing "402", `meeting_filename` matching the input filename, `provider: "stub"`
  - Process a meeting with a stub that throws `new Error("[rate_limit] 429")` -> verify `severity: "warning"`
  - Verify `PipelineResult.failed` is still incremented (existing behavior preserved)
  - Verify audit JSON file is still written (existing behavior preserved)
  - Verify file is still moved to failedDir (existing behavior preserved)

- [ ] Burst 6: Update all `processNewMeetings` call sites to pass `provider` in `PipelineConfig`. Grep for `processNewMeetings` and `processWebhookMeetings` across the codebase. Known call sites: `local-service/main.ts`, `cli/admin-util/run.ts`. Each constructs a `PipelineConfig` -- add `provider: llmConfig.type` (or equivalent) to each.

  Test: For each call site, write or update an integration-style test that verifies the `PipelineConfig` object includes a non-empty `provider` string. If the call site is an entry point that cannot be unit-tested (e.g., `api/main.ts` top-level `if (isMain)`), document the exclusion and verify manually. At minimum, test that `processNewMeetings` called with `provider: "openai"` stores `"openai"` in `system_errors` rows on failure (this may already be covered by Burst 5 tests -- if so, note the overlap and add a test that specifically passes a non-default provider string).

---

## Phase 2: Email Notifications

### Dependency Graph (Phase 2)

```
Section 3 -- Sequential (notifier)
  Burst 7 -> 8 -> 9
```

### Phase 2 Bursts

#### Section 3: Notifier

- [ ] Burst 7: Create `core/notifier.ts` -- `Notifier` interface: `{ sendAlert(db: DatabaseSync, error: SystemError): Promise<void> }`. `createNotifier(config: NotificationConfig | null)` returns a `Notifier`. When `config` is null, returns a no-op (sendAlert does nothing, returns resolved promise). When config is provided, creates a nodemailer SMTP transport (`createTransport({ host, port, secure: port === 465, auth: { user, pass } })`). `sendAlert` composes an email:
  - Subject: `[Meeting Insights] Critical: LLM API error`
  - From: `smtpUser`
  - To: `alertEmail`
  - Body: includes error_type, provider, message, meeting_filename, timestamp, affected meeting count (query `meetings_without_artifact` from DB), and a resolution hint from `RESOLUTION_HINTS[error.error_type]`

  Test in `test/notifier.test.ts`:
  - Mock `nodemailer.createTransport` to return a mock transport with `sendMail` spy
  - Create notifier with config where `alertEmail: "admin@company.com"` and `smtpUser: "bot@gmail.com"` (different!)
  - Call `sendAlert` -> verify `sendMail` called with `to: "admin@company.com"`, `from: "bot@gmail.com"`, subject contains "Critical", body contains error message, provider, meeting filename, and resolution hint
  - Create no-op notifier (null config) -> `sendAlert` does not throw, returns resolved promise
  - Verify the body includes `meetings_without_artifact` count from the DB

- [ ] Burst 8: Add throttle logic to `sendAlert` in `core/notifier.ts`. Before sending:
  1. Query: `SELECT COUNT(*) as n FROM system_errors WHERE last_notified_at > datetime('now', '-15 minutes')`
  2. If `n > 0`: skip email, still `UPDATE system_errors SET notified=1 WHERE id=?`, return
  3. If `n === 0`: send email, then `UPDATE system_errors SET notified=1, last_notified_at=datetime('now') WHERE id=?`
  4. If `sendMail()` throws: log to `console.error`, leave `notified=0` and `last_notified_at=null`. Do NOT crash.

  Test in `test/notifier.test.ts`:
  - Record two critical errors 1 second apart. Call `sendAlert` for each -> first sends (sendMail called once), second is throttled (sendMail still called once total). Both have `notified=1`.
  - Insert a critical error with `last_notified_at` set to 20 minutes ago (manually via SQL). Record a new critical error, call `sendAlert` -> email sends (throttle window expired)
  - **Boundary test**: insert error with `last_notified_at` exactly 15 minutes ago -> verify behavior (the `>` operator means exactly-15-min IS outside the window, so email sends)
  - **Acknowledge does NOT affect throttle**: acknowledge the first error, record a new critical error within 15 min of the first -> still throttled (throttle uses `last_notified_at`, not `acknowledged`)
  - **sendMail failure**: mock sendMail to throw -> `notified` stays 0, `last_notified_at` stays null, no exception propagated

- [ ] Burst 9: Integrate notifier into `core/pipeline.ts`:
  - `PipelineConfig` gains optional `notifier?: Notifier`
  - In `processEntry()` catch block, after `recordSystemError`, if `error` is not null and `error.severity === "critical"` and `config.notifier` is provided: call `config.notifier.sendAlert(db, error)` wrapped in try/catch (notification failure logged to `console.error`, never crashes pipeline)
  - Update callers: `local-service/main.ts`, `cli/admin-util/run.ts` -- construct notifier from env vars (`MTNINSIGHTS_SMTP_*`, `MTNINSIGHTS_ALERT_EMAIL`), pass to `PipelineConfig`. If env vars missing, pass `notifier: createNotifier(null)`.

  Test in `test/pipeline.test.ts`:
  - Pipeline processes meeting with failing LLM stub, notifier mock provided -> `sendAlert` called with the recorded `SystemError`
  - Pipeline with `notifier: undefined` -> no error, pipeline completes normally
  - Pipeline with notifier that throws from `sendAlert` -> pipeline completes normally (error swallowed), `PipelineResult.failed` still incremented
  - Notifier is NOT called for `severity: "warning"` errors (e.g., rate_limit)

---

## Phase 3: Health API

### Dependency Graph (Phase 3)

```
Section 4 -- Sequential (API routes + IPC)
  Burst 10 -> 11
```

### Phase 3 Bursts

#### Section 4: Health Routes

- [ ] Burst 10: Create `api/routes/health.ts` -- `registerHealthRoutes(app, db)`. Endpoints:

  `GET /api/health`:
  - Calls `getHealthStatus(db)`
  - Returns JSON with `HealthStatus` shape
  - No auth required (health should be checkable even if auth is misconfigured)

  `POST /api/health/acknowledge`:
  - Accepts `{ errorIds?: string[] }`
  - If `errorIds` provided and non-empty: calls `acknowledgeErrors(db, errorIds)`
  - If `errorIds` omitted or empty: calls `acknowledgeAllErrors(db)`
  - Returns `{ ok: true }`

  Wire into `api/server.ts` -- add `import { registerHealthRoutes } from "./routes/health.js"` and `registerHealthRoutes(app, db)` after `registerDebugRoutes(...)`.

  Test in `test/api-health.test.ts` (Hono `app.request()` pattern):
  - **Healthy state**: empty DB -> GET returns `{ status: "healthy", error_groups: [], meetings_without_artifact: 0, last_error_at: null }` with status 200
  - **Critical state**: seed `system_errors` with an `api_error` row -> GET returns `status: "critical"`, `error_groups` has one entry with correct shape including `resolution_hint`
  - **Acknowledge by IDs**: POST with `{ errorIds: ["id1"] }` -> 200. Subsequent GET -> healthy
  - **Acknowledge all**: POST with `{}` -> 200. Subsequent GET -> healthy
  - **POST with empty errorIds**: POST with `{ errorIds: [] }` -> acknowledges all (same as omitted)
  - **Verify integer-to-boolean conversion**: raw DB has `acknowledged: 0`, API response has no `acknowledged` field in `error_groups` (it's grouped, not individual rows)

- [ ] Burst 11: Add health methods to `ElectronAPI` interface + `CHANNELS` const + IPC handler + `api-client/`.

  **channels.ts additions:**
  ```ts
  // Add to CHANNELS const:
  GET_HEALTH: "get-health",
  ACKNOWLEDGE_HEALTH_ERRORS: "acknowledge-health-errors",

  // Add to ElectronAPI interface:
  getHealth: () => Promise<HealthStatus>;
  acknowledgeHealthErrors: (errorIds?: string[]) => Promise<void>;
  ```

  **New file `electron-ui/ui/src/api-client/health.ts`:**
  ```ts
  import { API_BASE, fetchJson, jsonPost } from "./base.js";
  import type { HealthStatus } from "../../../electron/channels.js";

  export const healthMethods = {
    getHealth: (): Promise<HealthStatus> => fetchJson(`${API_BASE}/api/health`),
    acknowledgeHealthErrors: (errorIds?: string[]): Promise<void> =>
      jsonPost(`${API_BASE}/api/health/acknowledge`, { errorIds }).then(() => undefined),
  };
  ```

  **Update `api-client/index.ts`:** import `healthMethods`, spread into `apiClient`.

  **New file `electron-ui/electron/handlers/health.ts`:** Register IPC handlers:
  - `GET_HEALTH` -> calls `getHealthStatus(db)`, returns result
  - `ACKNOWLEDGE_HEALTH_ERRORS` -> calls `acknowledgeErrors(db, ids)` or `acknowledgeAllErrors(db)`, returns void

  **Export `HealthStatus` and `ErrorGroup` types** from `channels.ts` (or from `core/system-health.ts` and re-export).

  Test in `test/ipc-handlers.test.ts` (add to existing):
  - Register health handlers with in-memory DB, invoke `GET_HEALTH` -> returns `HealthStatus` shape
  - Seed errors, invoke `GET_HEALTH` -> returns critical status
  - Invoke `ACKNOWLEDGE_HEALTH_ERRORS` with IDs -> subsequent `GET_HEALTH` returns healthy

  Test in `test/api-health.test.ts` (add to existing or separate):
  - Verify `api-client` `getHealth()` calls correct URL
  - Verify `acknowledgeHealthErrors(["id1"])` posts correct body

---

## Phase 4: UI Health Banner

### Dependency Graph (Phase 4)

```
Section 5 -- Sequential (UI)
  Burst 12 -> 13 -> 14
```

### Phase 4 Bursts

#### Section 5: React UI

- [ ] Burst 12: Create `electron-ui/ui/src/hooks/useSystemHealth.ts` -- `useSystemHealth()` hook.
  - `useQuery` with key `["system-health"]`, `queryFn: () => window.api.getHealth()`, `refetchInterval: 30_000`, `staleTime: 15_000`
  - `refetchOnWindowFocus: true` (ensures stale state is refreshed when user returns to the app)
  - Returns `{ health: HealthStatus | undefined, isLoading: boolean, isError: boolean, acknowledgeAll: () => void, acknowledgeErrors: (ids: string[]) => void }`
  - `acknowledgeAll` and `acknowledgeErrors` are `useMutation` wrappers that call `window.api.acknowledgeHealthErrors(...)` and invalidate `["system-health"]` query on success

  Test in `test/ui/system-health-hook.test.tsx`:
  - Mock `window.api.getHealth` to return healthy -> hook returns health data
  - Mock `window.api.getHealth` to return critical -> hook returns critical data
  - Call `acknowledgeAll` -> verify `window.api.acknowledgeHealthErrors()` called with no args
  - Call `acknowledgeErrors(["id1"])` -> verify called with `["id1"]`
  - Verify `refetchInterval` is `30_000` (inspect query options or test that re-fetch fires)
  - Mock `window.api.getHealth` to reject -> `isError` is true, `health` is undefined

- [ ] Burst 13: Create `electron-ui/ui/src/components/shared/SystemHealthBanner.tsx`.

  Props: `health: HealthStatus | undefined`, `isError: boolean`, `onAcknowledge: () => void`.

  Renders nothing when `health` is undefined and `isError` is false (loading state).
  Renders nothing when `health.status === "healthy"`.

  When `isError` is true (health endpoint unreachable): gray banner (`bg-gray-600 text-white`), WifiOff icon, message: "Unable to reach server -- health status unknown".

  When `health.status === "critical"`: red banner (`bg-red-600 text-white`), AlertTriangle icon from lucide-react. Content:
  - Headline: "{provider} API error" (from first error_group) or "System error" if no provider
  - Detail: resolution_hint from the error_group
  - Badge: "{count} meeting(s) affected" if `meetings_without_artifact > 0`
  - Dismiss button (X icon, right side) calls `onAcknowledge`

  Test in `test/ui/system-health-banner.test.tsx`:
  - `health: undefined, isError: false` -> renders nothing
  - `health: { status: "healthy", ... }` -> renders nothing
  - `health: { status: "critical", error_groups: [...], meetings_without_artifact: 5 }` -> red banner visible, contains "API error", contains resolution hint, contains "5 meeting(s) affected", dismiss button present
  - `health: undefined, isError: true` -> gray banner with "Unable to reach server"
  - Click dismiss -> `onAcknowledge` called
  - `meetings_without_artifact: 0` -> no "affected" badge
  - Multiple error groups -> shows the critical one

- [ ] Burst 14: Wire `SystemHealthBanner` into `App.tsx`.
  - Import `useSystemHealth` hook
  - Place `<SystemHealthBanner>` as the first child inside the outermost layout container, above `ResponsiveShell`/`WorkspaceBanner`
  - Pass `health`, `isError`, and `onAcknowledge: acknowledgeAll` from the hook

  Test in `test/ui/app-health-banner.test.tsx`:
  - Mock `window.api.getHealth` to return critical status -> render App -> banner is visible with correct content
  - Mock `window.api.getHealth` to return healthy status -> render App -> no banner rendered
  - Mock `window.api.getHealth` to reject -> render App -> gray "unreachable" banner
  - Click dismiss on banner -> `window.api.acknowledgeHealthErrors` called

---

## Phase 5: MTI CLI Health Commands

### Dependency Graph (Phase 5)

```
Section 6 -- Sequential (CLI commands, depends on Phase 3 API routes)
  Burst 15 -> 16
```

### Phase 5 Bursts

#### Section 6: CLI

- [ ] Burst 15: Create `cli/mti/src/commands/health.ts` -- `registerHealth(program, deps?)`. Two subcommands:

  **`mti health status`** (default subcommand):
  - Calls `GET /api/health` via `HttpClient`
  - Human-readable output:
    ```
    Status: CRITICAL
    
    Errors:
      [api_error] openai — Check your LLM provider account billing and API key validity
        12 occurrence(s), latest: 2026-04-01_standup.json
    
    Meetings without insights: 12
    Last error: 2026-04-01 14:30:00
    ```
  - When healthy: `Status: HEALTHY\n\nNo issues detected.\n`
  - `--json` flag: output raw `HealthStatus` JSON

  **`mti health acknowledge`**:
  - Calls `POST /api/health/acknowledge` with `{}` (acknowledge all)
  - Optional `--ids <id1,id2>` flag to acknowledge specific error IDs
  - Human-readable: `Acknowledged all errors.\n` or `Acknowledged 2 error(s).\n`
  - `--json` flag: `{ "ok": true }`

  Follow the exact pattern from `cli/mti/src/commands/meetings.ts`:
  - `MeetingsDeps`-style deps interface with `client?: HttpClient`, `stream?`, `stderr?`
  - `resolveClient(deps)` / `resolveStream(deps)` pattern
  - `wrapAction` for error handling

  Test in `test/cli/mti/commands/health.test.ts`:
  - `mti health status` with healthy response -> output contains "HEALTHY" and "No issues detected"
  - `mti health status` with critical response -> output contains "CRITICAL", error type, provider, resolution hint, occurrence count, meetings without insights count
  - `mti health status --json` -> raw JSON output matching `HealthStatus` shape
  - `mti health acknowledge` -> calls POST /api/health/acknowledge with `{}`, output contains "Acknowledged all"
  - `mti health acknowledge --ids err1,err2` -> calls POST with `{ errorIds: ["err1", "err2"] }`, output contains "Acknowledged 2"
  - `mti health acknowledge --json` -> `{ "ok": true }`

- [ ] Burst 16: Wire `registerHealth` into `cli/mti/bin/mti.ts`. Add `import { registerHealth } from "../src/commands/health.ts"` and `registerHealth(program, wrapAction)` alongside the other `register*` calls.

  Test in `test/cli/mti/entry.test.ts` (add to existing):
  - Verify `health` command is registered on the program
  - Verify `health status` and `health acknowledge` subcommands exist

---

## Phase 6: E2E Playwright Tests

### Dependency Graph (Phase 6)

```
Section 7 -- Sequential (E2E, depends on all prior phases)
  Burst 17 -> 18
```

**Prerequisite:** The API server must be running with a seeded DB. E2E tests use `apiFetch` from `test/e2e/helpers.ts` to seed data via the API, then use Playwright to verify the UI.

### Phase 6 Bursts

#### Section 7: Browser + CLI E2E

- [ ] Burst 17: Create `test/e2e/health-banner.spec.ts` -- Playwright E2E tests for the health banner.

  **Setup pattern** (follows existing E2E specs like `insights.spec.ts`):
  - `test.use({ viewport: { width: 1400, height: 900 } })`
  - Use `apiFetch` from `test/e2e/helpers.ts` for API calls
  - Seed data via API before each test, clean up after

  **Seeding critical errors:**
  Since there's no direct "create error" API endpoint, seed via a helper that calls the DB directly, OR use the `/api/health` endpoint to verify state and seed errors by triggering a pipeline run with an invalid LLM config. The simpler approach: add a test-only helper that directly inserts into `system_errors` via `apiFetch` to a debug-style endpoint. However, to avoid adding test-only routes, the cleaner E2E approach is:
  1. Call `GET /api/health` to verify healthy baseline
  2. Directly insert a `system_errors` row via a test utility SQL endpoint (if one exists in debug routes), OR create the error state by calling `POST /api/meetings` with a request that will fail extraction (if LLM is stub/unavailable in E2E env)

  **Preferred approach**: Add a test-seeding helper. Since the E2E tests run against a live server with a real DB, and the existing debug endpoint (`GET /api/debug`) already exists, add a `POST /api/debug/seed-error` endpoint that only exists when `NODE_ENV=test` or similar guard. OR simply seed via direct DB access if the test harness supports it. Follow whatever pattern the existing E2E tests use for data setup (they use `apiFetch` to create/delete via existing API endpoints).

  **If no test-seeding route is practical**, the E2E test can:
  1. Verify the banner is NOT visible on a healthy system
  2. Use Playwright's `page.route()` to intercept `GET /api/health` and return a mocked critical response
  3. Verify the banner appears with correct content

  **Test cases:**
  - **Healthy state**: navigate to app -> no health banner visible anywhere on the page
  - **Critical state** (via route intercept or seeded error): navigate to app -> red banner visible at top of page, above the workspace content. Assert:
    - Banner contains text matching the provider name (e.g., "openai")
    - Banner contains the resolution hint text
    - Banner contains "{n} meeting(s) affected" if meetings_without_artifact > 0
    - Banner has a dismiss/close button
  - **Dismiss flow**: click the dismiss button -> banner disappears. If using real API (not route intercept), verify `GET /api/health` now returns healthy. If using route intercept, verify the acknowledge API was called (intercept the POST).
  - **Banner position**: verify the banner is above the main workspace content (banner `y` coordinate < workspace `y` coordinate via bounding box)
  - **Unreachable server state** (via route intercept returning network error): gray banner with "Unable to reach server" visible

- [ ] Burst 18: Create `test/e2e/health-cli.spec.ts` -- E2E test for the MTI CLI health commands. This tests the CLI binary against the live API server.

  **Approach**: Use Node `child_process.execFile` (or `execa` if available) to run `tsx cli/mti/bin/mti.ts health status --json` and parse the output. The CLI reads its config from `~/.mtirc` or env vars (`MTI_BASE_URL`, `MTI_TOKEN`). Set these in the test environment.

  **Alternative**: Since the unit tests in Burst 15 already test CLI output via stubbed `HttpClient`, the E2E test here verifies the CLI talks to the real API and gets a real response. This is a thin integration test.

  **Test cases:**
  - `mti health status --json` against a running server -> output parses as valid `HealthStatus` JSON, `status` is `"healthy"` or `"critical"` (depending on server state)
  - `mti health status` (human-readable) -> output contains "Status:" and either "HEALTHY" or "CRITICAL"
  - `mti health acknowledge --json` -> output is `{ "ok": true }`
  - Verify exit code is 0 for all successful commands
  - Verify exit code is 2 (server error) or non-zero when server is unreachable

---

## Phase 7: Documentation & Scatter Updates

- [ ] Burst 19: Update scatter.md files for new/changed files:
  - `core/scatter.md`: add `system-health.ts` (error recording, health status, acknowledgment), `notifier.ts` (SMTP email alerts with throttle)
  - `api/routes/scatter.md`: add `health.ts` (GET /api/health, POST /api/health/acknowledge)
  - `electron-ui/electron/handlers/scatter.md`: add `health.ts` (IPC handlers for health status and acknowledgment)
  - `electron-ui/ui/src/hooks/scatter.md`: add `useSystemHealth.ts` (health polling hook with 30s interval)
  - `electron-ui/ui/src/components/shared/scatter.md`: add `SystemHealthBanner.tsx` (critical error banner with resolution hints)
  - `electron-ui/ui/src/api-client/scatter.md`: add `health.ts` (HTTP fetch implementations for health endpoints)
  - `cli/mti/src/commands/scatter.md` (or equivalent): add `health.ts` (mti health status/acknowledge commands)
  - `test/e2e/scatter.md`: add `health-banner.spec.ts`, `health-cli.spec.ts`

---

## Verification

### Functional Requirements Checklist

| # | Requirement | Verified by |
|---|-------------|-------------|
| FR-1 | Pipeline LLM errors (402, 401, 429, 5xx) are recorded in `system_errors` table | Burst 5 test: failing LLM stub -> system_errors row |
| FR-2 | Error severity derived: `api_error` -> critical, `rate_limit`/`json_parse`/`unknown` -> warning | Burst 2 test: all four error_type values explicitly |
| FR-3 | `GET /api/health` returns status + grouped errors + failed meeting count | Burst 10 test: all status levels |
| FR-4 | `POST /api/health/acknowledge` dismisses errors with 1-hour cooldown | Burst 10 test: acknowledge then re-query |
| FR-5 | Email sent on first critical error | Burst 8 test: mock sendMail called |
| FR-6 | Email NOT sent if another critical email was sent within 15 minutes | Burst 8 test: second error throttled |
| FR-7 | Email throttle decoupled from acknowledge | Burst 8 test: acknowledge then new error within 15 min -> still throttled |
| FR-8 | Email recipient configurable independently from sender | Burst 7 test: `alertEmail` != `smtpUser` in test config |
| FR-9 | Notification disabled gracefully when SMTP env vars missing | Burst 7 test: null config -> no-op notifier |
| FR-10 | Notification failure does not crash pipeline | Burst 9 test: notifier throws, pipeline continues |
| FR-11 | UI banner appears (red) when critical errors exist | Burst 13 test + Burst 17 E2E: red banner visible in browser |
| FR-12 | UI banner hidden when healthy | Burst 13 test + Burst 17 E2E: no banner in healthy state |
| FR-13 | Dismiss button acknowledges errors and hides banner | Burst 14 test + Burst 17 E2E: click dismiss, banner disappears |
| FR-14 | Health polls every 30 seconds, refreshes on window focus | Burst 12 test: refetchInterval + refetchOnWindowFocus configured |
| FR-15 | Meetings without artifacts are counted (time-gated, 5 min) | Burst 3 test: recent meeting excluded, old meeting counted |
| FR-16 | Ignored meetings excluded from "without artifact" count | Burst 3 test: ignored meeting not counted |
| FR-17 | Provider name captured in system_errors | Burst 5 test: provider field matches config |
| FR-18 | Existing pipeline behavior unchanged when notifier absent | Burst 9 test: pipeline without notifier works |
| FR-19 | Health endpoint works in both Electron IPC and web API modes | Burst 11 test: both code paths |
| FR-20 | Acknowledged errors remain in DB for audit history | Burst 4 test: acknowledged errors still queryable |
| FR-21 | Errors grouped by type in health response with resolution hints | Burst 3 + 10 test: error_groups shape with count, hint |
| FR-22 | Acknowledgment cooldown prevents whack-a-mole (1 hour) | Burst 2 test: new error of same type auto-acknowledged during cooldown |
| FR-23 | `recordSystemError` failure does not crash pipeline | Burst 2 test: function returns null on DB error (stderr fallback) |
| FR-24 | Table auto-prunes errors older than 90 days | Burst 3 test: old error deleted by getHealthStatus |
| FR-25 | Email body includes affected meeting count and resolution hint | Burst 7 test: body contains meetings_without_artifact count and hint text |
| FR-26 | "Unable to reach server" state shown when health poll fails | Burst 13 test + Burst 17 E2E: gray banner |
| FR-27 | Optional fields (meeting_filename, provider) stored as null when omitted | Burst 2 test: undefined -> null in DB |
| FR-28 | Pipeline callers pass provider string from LLM config | Burst 6 test: config includes provider field |
| FR-29 | Email throttle boundary: exactly 15 min ago is outside window | Burst 8 test: boundary condition |
| FR-30 | Non-LLM pipeline errors classified as unknown/warning | Burst 5 test: parse failure -> error_type "unknown", severity "warning" |
| FR-31 | `mti health status` shows human-readable health output | Burst 15 test: healthy -> "HEALTHY", critical -> "CRITICAL" with details |
| FR-32 | `mti health status --json` returns raw HealthStatus JSON | Burst 15 test: parse output as JSON, verify shape |
| FR-33 | `mti health acknowledge` calls acknowledge API | Burst 15 test: POST called with correct body |
| FR-34 | `mti health acknowledge --ids` acknowledges specific errors | Burst 15 test: POST with errorIds array |
| FR-35 | CLI health commands registered in mti entrypoint | Burst 16 test: program has health command |
| FR-36 | Banner is positioned above workspace content in the browser | Burst 17 E2E: bounding box assertion |
| FR-37 | CLI health status returns valid response from live API | Burst 18 E2E: run CLI binary, parse output |
| FR-38 | CLI exits cleanly with code 0 on success | Burst 18 E2E: verify exit code |
