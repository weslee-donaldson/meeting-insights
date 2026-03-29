# Ketchup Plan: mti CLI Client (V1)

## Methodology Refinements (Ketchup + SDD Insights)

This project incorporates three refinements to the Ketchup technique, informed by comparing it against the Spec-Driven Development (SDD) approach described in Böckeler's analysis of Kiro/spec-kit/Tessl.

### 1. Context lives in the ketchup plan, not a separate file

CLAUDE.md defines *how we work* — policies, rules, guardrails independent of any feature. The ketchup plan defines *what we're building right now* — project context, API contract assumptions, UX decisions, and the burst checklist. Context lives and dies with the feature; when the plan moves to `completed-ketchup-plans/`, the context goes with it. No stale CONTEXT.md files lingering. Every burst already reads the plan, so the context is always in scope.

### 2. Behavioral sketches before each command group

Not a full SDD spec, but a 3-5 line sketch per command group capturing *user intent* in plain language. This is the useful part of spec-first (catching UX misalignment before writing the first test) without the overhead (no multi-file markdown artifacts, no separate review cycle). The sketch lives in the plan alongside the bursts it drives.

### 3. Customer-hat test naming

Since this is customer-facing, test titles describe what the user experiences, not what HTTP call gets made. The test name anchors to observable behavior from the customer's perspective.

```
// Yes: it("lists only the specified client's meetings")
// No:  it("sends GET /api/meetings with client query param")
```

Same Ketchup rules (one behavior, one assertion, whole-object match), but the naming convention ensures tests read as a user-facing spec.

---

## Context

- Pure HTTP client — talks to API server, no DB access, no `core/` imports
- Multi-tenant: auth token scopes all data server-side, CLI never handles user/org IDs
- Customer-facing: error messages must be actionable, no internal jargon or stack traces
- Auth layer being added separately — assume `Authorization: Bearer <token>` header
- **Auth independence**: CLI can be built and tested against the current unauthenticated API. The `Authorization` header is sent when a token is configured but the API won't reject requests without one until the auth layer lands. Multi-tenant scoping (user A sees only their clients) is an API-side concern — CLI code doesn't change when auth ships.
- API runs on port 3000 (configurable), returns 503 when optional deps unavailable
- V1 scope: clients, meetings, action items, notes. Threads/insights/milestones/search/chat deferred to V2+

## Dual Audience: Humans + LLM Agents

This CLI serves two users:
1. **Humans** at a terminal who need readable output and intuitive commands
2. **LLM agents** that discover capabilities via help text and parse structured output

The help system is the discovery API. Like an MCP server's tool definitions, every command's `--help` must give an agent everything it needs to invoke the command correctly and parse the result — without trial and error.

### Help system requirements (per command)

Every command's help includes:
- **Description**: What this command does (1-2 sentences, behavior-focused)
- **Arguments & options**: With types, defaults, and whether required
- **Output schema**: JSON shape returned by `--json` (field names, types, nullability)
- **Example**: At least one invocation with sample output
- **Errors**: Status codes and what they mean for this specific command

Example of what `mti meetings list --help` should produce:
```
Usage: mti meetings list [options]

List meetings for the authenticated user, optionally filtered by client and date range.

Options:
  --client <name>    Filter by client name
  --after <date>     Only meetings after this date (YYYY-MM-DD)
  --before <date>    Only meetings before this date (YYYY-MM-DD)
  --json             Output as JSON array

Output schema (--json):
  [{
    "id": "string",
    "title": "string",
    "date": "string (ISO 8601)",
    "client": "string",
    "series": "string",
    "actionItemCount": "number"
  }]

Example:
  $ mti meetings list --client Acme --after 2026-01-01
  ID         Title                    Date         Client  Items
  a1b2c3d4   Q1 Planning Review       2026-01-15   Acme    3
  e5f6g7h8   Sprint Retrospective     2026-02-01   Acme    7

Errors:
  401  Token invalid or expired
  503  Search service temporarily unavailable
```

### Global `--json` behavior

- All list/get commands support `--json`
- JSON output is always the full API response (no transformation or truncation)
- Agents should default to `--json` for reliable parsing
- Table output is the human default — formatted for readability, may truncate fields

### Global `mti --help` as capability discovery

Top-level `mti --help` lists all command groups with one-line descriptions, so an agent can enumerate capabilities. `mti <noun> --help` lists all verbs in that group. `mti <noun> <verb> --help` gives the full contract above.

## UX Principles

- Human-readable tables by default, `--json` flag on all list/get commands for scripting/agents
- Destructive actions (delete, ignore) require explicit `--confirm` flag
- 401 → "Token invalid or expired. Run `mti config set token <token>` to update."
- 403 → "You don't have access to this resource."
- 503 → "This feature is temporarily unavailable."
- Commands read as: `mti <noun> <verb> [options]`
- Config stored in `~/.mtirc` (JSON), overridable via `MTI_BASE_URL` and `MTI_TOKEN` env vars
- Exit codes: 0 = success, 1 = user error (bad args, 4xx), 2 = server error (5xx)

## Clients

- User lists their assigned clients (scoped by auth token, not all system clients)
- User views their default client
- User looks up glossary terms for a specific client

## Meetings

- User lists meetings filtered by client and/or date range
- User views a single meeting's full detail, raw transcript, or extracted artifact
- Rename and reassign are non-destructive edits with immediate feedback
- Delete accepts one or more IDs; requires confirmation
- Ignore/un-ignore toggles a meeting's visibility

## Action Items

- User lists action items across a client's meetings, filterable by date range
- User creates a new action item on a specific meeting
- User edits an existing action item's fields (description, owner, due date, priority)
- User marks an item complete with an optional note, or reverts completion
- User views completion history for a meeting
- User traces an item's cross-meeting history via canonical ID

## Notes

- User lists notes attached to a meeting
- User creates a note on a meeting with optional title
- User updates or deletes their own notes (API enforces user-type restriction)

## Architecture

- **Framework**: Commander.js — lightweight, subcommand-friendly, well-typed
- **Location**: `cli/mti/` (existing admin scripts move to `cli/admin-util/`)
- **Entry point**: `cli/mti/bin/mti.ts` (shebang: `#!/usr/bin/env tsx`)
- **Dependency**: `commander` (only new runtime dep)

## Testing

- Customer-hat test naming: tests describe what the user experiences, not HTTP internals
  - `it("lists only the specified client's meetings")` not `it("sends GET /api/meetings with client query param")`
- Stub `fetch` globally for http-client tests; stub `HttpClient` for command tests
- One behavior per test, whole-object assertions, stubs over mocks
- 100% coverage enforced on `cli/mti/`
- **Help text tests**: Each command group includes a test verifying `--help` output contains: description, output schema, example, and error section

## Pre-work: Reorganize cli/

Move existing admin scripts to `cli/admin-util/`:
- `setup.ts`, `run.ts`, `reset.ts`, `purge.ts`, `query.ts`, `eval.ts`, `assign-client.ts`, `all-items-dedupe.ts`, `import-external.ts`, `shared.ts`
- Update `package.json` script paths (e.g., `"setup": "tsx cli/admin-util/setup.ts"`)

## File Structure

```
cli/
  admin-util/               # Existing admin scripts (moved from cli/)
    shared.ts, setup.ts, run.ts, reset.ts, purge.ts,
    query.ts, eval.ts, assign-client.ts, all-items-dedupe.ts, import-external.ts
  mti/
    bin/
      mti.ts                # Entry point, program setup, subcommand registration
    src/
      http-client.ts        # Fetch wrapper: baseUrl, auth header, typed errors
      config.ts             # Load/save ~/.mtirc, env var overrides
      format.ts             # Table formatter + --json toggle
      commands/
        clients.ts          # clients list | default | glossary
        meetings.ts         # meetings list | get | transcript | artifact | rename | reassign | delete | ignore
        items.ts            # items list | create | edit | complete | uncomplete | completions | history
        notes.ts            # notes list | create | update | delete
        config.ts           # config show | set
    test/
      http-client.test.ts
      config.test.ts
      format.test.ts
      commands/
        clients.test.ts
        meetings.test.ts
        items.test.ts
        notes.test.ts
        config.test.ts
```

## Reference Files

- `electron-ui/ui/src/api-client.ts` — existing HTTP fetch client for same API endpoints
- `api/routes/meetings.ts` — authoritative route definitions for meetings + action items
- `api/routes/notes.ts` — authoritative route definitions for notes
- `api/server.ts` — route registration, middleware, error conventions

## Dependency Graph & Parallelization

```
Phase 1 — Sequential (main branch)
  Burst 0: reorganize cli/
  Burst 1: entry point + commander setup
      │
Phase 2 — 3 parallel agents (worktrees, merge after all complete)
      ├─── Agent A: Bursts 2,3 (config.ts)
      ├─── Agent B: Bursts 4,5 (http-client.ts)
      └─── Agent C: Burst 6 (format.ts)
      │
Phase 3 — 4 parallel agents (worktrees, merge after all complete)
      ├─── Agent A: Bursts 7,8,9 (clients commands)
      ├─── Agent B: Bursts 10-17 (meetings commands)
      ├─── Agent C: Bursts 18-24 (items commands)
      └─── Agent D: Bursts 25-28 (notes commands)
      │
Phase 4 — Sequential (main branch)
  Burst 29: config commands
  Burst 30: integration + end-to-end verification
```

**Why these boundaries:**
- Phase 2 tracks touch separate files (`config.ts`, `http-client.ts`, `format.ts`) — zero merge conflict risk
- Phase 3 tracks touch separate command files (`clients.ts`, `meetings.ts`, `items.ts`, `notes.ts`) — zero merge conflict risk, but all depend on the Phase 2 foundation
- Phase 4 is sequential because `config` commands wire into the entry point and integration touches everything

**Each agent receives:**
- This full ketchup plan (context + UX principles + behavioral sketches)
- The foundation files from prior phases (config, http-client, format)
- Reference to the specific API routes for their command group

## TODO

### Phase 1 — Sequential
- [ ] Burst 0: Move existing scripts to `cli/admin-util/`, update package.json paths, verify `pnpm` commands work
- [ ] Burst 1: Add commander dep, create `cli/mti/bin/mti.ts` entry point with version + help

### Phase 2 — Parallel (3 agents)

---

**Agent A — config.ts** (`cli/mti/src/config.ts` + `cli/mti/test/config.test.ts`)

Behavior: User configures CLI connection to the API server.
- `~/.mtirc` is a JSON file: `{ "baseUrl": "http://localhost:3000", "token": "..." }`
- If file doesn't exist, return defaults (`baseUrl: "http://localhost:3000"`, `token: null`)
- Env vars `MTI_BASE_URL` and `MTI_TOKEN` override file values (env wins)
- `loadConfig()` returns resolved `{ baseUrl: string; token: string | null }`
- `saveConfig(partial)` merges into existing file (don't clobber unrelated keys)

Bursts:
- [ ] Burst 2: `config.ts` — load/save `~/.mtirc` JSON (baseUrl, token)
- [ ] Burst 3: `config.ts` — env var overrides (`MTI_BASE_URL`, `MTI_TOKEN`)

---

**Agent B — http-client.ts** (`cli/mti/src/http-client.ts` + `cli/mti/test/http-client.test.ts`)

Behavior: Typed HTTP client that all commands use to talk to the API.
- Constructor: `new HttpClient({ baseUrl: string; token: string | null })`
- Auth: sends `Authorization: Bearer <token>` header when token is present
- Methods: `get(path, params?)`, `post(path, body?)`, `put(path, body?)`, `patch(path, body?)`, `delete(path, body?)`
- All methods return parsed JSON on success
- Typed error classes for non-2xx responses:
  - `AuthError` (401) — message: "Token invalid or expired. Run `mti config set token <token>` to update."
  - `ForbiddenError` (403) — message: "You don't have access to this resource."
  - `NotFoundError` (404) — message: "Resource not found."
  - `ServerError` (500) — message: includes server error text
  - `UnavailableError` (503) — message: "This feature is temporarily unavailable."
- For 204 No Content, return `null` (no body to parse)
- Base URL joining: `new URL(path, baseUrl)` with query params appended

Bursts:
- [ ] Burst 4: `http-client.ts` — fetch wrapper with auth header, base URL joining
- [ ] Burst 5: `http-client.ts` — typed error handling (401, 403, 404, 500, 503)

---

**Agent C — format.ts** (`cli/mti/src/format.ts` + `cli/mti/test/format.test.ts`)

Behavior: Formats API responses for terminal output.
- `formatTable(rows: Record<string, unknown>[], columns: ColumnDef[])` — renders aligned columns with headers
  - `ColumnDef: { key: string; header: string; width?: number }`
  - Left-align text, truncate to width if specified
  - Header row + separator line + data rows
- `formatJson(data: unknown)` — `JSON.stringify(data, null, 2)`
- `output(data: unknown, options: { json: boolean; columns?: ColumnDef[] })` — dispatches to table or JSON
- Writes to stdout via a writable stream (injectable for testing, defaults to `process.stdout`)

Bursts:
- [ ] Burst 6: `format.ts` — table formatter + `--json` toggle

---

### Phase 3 — Parallel (4 agents)

Each agent imports from the Phase 2 foundation: `HttpClient` from `../http-client.ts`, `output`/`formatTable` from `../format.ts`, `loadConfig` from `../config.ts`. Each command file exports a function that registers subcommands on a Commander `Command` instance.

**Help text contract**: Every command registered by an agent must include rich `--help` output designed for both humans and LLM agents. Each command's help includes: description, all arguments/options with types and defaults, output schema (JSON shape for `--json`), at least one example with sample output, and relevant error codes. See "Dual Audience" section above for the full template. Help text is tested — each agent section includes a burst for verifying help output.

---

**Agent A — clients commands** (`cli/mti/src/commands/clients.ts` + `cli/mti/test/commands/clients.test.ts`)

Behavior:
- User lists their assigned clients (scoped by auth token, not all system clients)
- User views their default client
- User looks up glossary terms for a specific client

API contracts:
```
GET /api/clients → string[]
GET /api/default-client → string | null
GET /api/glossary?client=<name> → Array<{ term: string; definition: string }>
```

Commands + help output schemas:
```
mti clients list [--json]
  Description: List your assigned clients.
  Output schema (--json): ["string"]
  Example:
    $ mti clients list
    Name
    ────
    Acme Corp
    Initech

mti clients default
  Description: Show your default client.
  Output: Client name or "No default client set."
  Example:
    $ mti clients default
    Acme Corp

mti clients glossary <name> [--json]
  Description: Show glossary terms for a client.
  Output schema (--json): [{ "term": "string", "definition": "string" }]
  Example:
    $ mti clients glossary "Acme Corp"
    Term                          Definition
    ────                          ──────────
    OKR                           Objectives and Key Results
    RACI                          Responsible, Accountable, Consulted, Informed
  Errors: 404 Client not found
```

Table formats:
- `clients list`: columns `[{ key: "name", header: "Name" }]` — transform string[] to `[{ name }]`
- `clients glossary`: columns `[{ key: "term", header: "Term", width: 30 }, { key: "definition", header: "Definition" }]`

Bursts:
- [ ] Burst 7: `clients list` — lists the user's assigned clients (with help text + schema)
- [ ] Burst 8: `clients default` — shows the user's default client (with help text)
- [ ] Burst 9: `clients glossary <name>` — shows glossary terms for a client (with help text + schema)

---

**Agent B — meetings commands** (`cli/mti/src/commands/meetings.ts` + `cli/mti/test/commands/meetings.test.ts`)

Behavior:
- User lists meetings filtered by client and/or date range
- User views a single meeting's full detail, raw transcript, or extracted artifact
- Rename and reassign are non-destructive edits with immediate feedback
- Delete accepts one or more IDs; requires `--confirm` flag
- Ignore/un-ignore toggles a meeting's visibility

API contracts:
```
GET /api/meetings?client=<name>&after=<date>&before=<date>
  → Array<{
      id: string; title: string; date: string; client: string;
      series: string; actionItemCount: number;
    }>

GET /api/meetings/:id
  → { id, title, meeting_type, date, participants (JSON string), raw_transcript, source_filename, created_at }

GET /api/meetings/:id/transcript → { transcript: string }

GET /api/meetings/:id/artifact → {
    summary: string;
    decisions: Array<{ text: string; decided_by: string }>;
    proposed_features: string[];
    action_items: Array<{ description, owner, requester, due_date, priority, short_id? }>;
    open_questions: string[];
    risk_items: Array<{ category: "relationship"|"architecture"|"engineering"; description }>;
    additional_notes: Array<Record<string, unknown>>;
    milestones?: Array<{ title, target_date, status_signal, excerpt }>;
  } | null

PATCH /api/meetings/:id/title   body: { title: string }        → 204
POST /api/meetings/:id/client   body: { clientName: string }    → 204
DELETE /api/meetings             body: { ids: string[] }         → 204
POST /api/meetings/:id/ignored  body: { ignored: boolean }      → 204
```

Commands + help output schemas:
```
mti meetings list [--client <name>] [--after <date>] [--before <date>] [--json]
  Description: List meetings for the authenticated user.
  Options:
    --client <name>   Filter by client name
    --after <date>    Only meetings after this date (YYYY-MM-DD)
    --before <date>   Only meetings before this date (YYYY-MM-DD)
  Output schema (--json):
    [{ "id": "string", "title": "string", "date": "string (ISO 8601)",
       "client": "string", "series": "string", "actionItemCount": "number" }]
  Example:
    $ mti meetings list --client Acme --after 2026-01-01
    ID         Title                    Date         Client  Items
    a1b2c3d4   Q1 Planning Review       2026-01-15   Acme    3
  Errors: 401 Invalid token, 503 Service unavailable

mti meetings get <id> [--json]
  Description: Show full details for a single meeting.
  Output schema (--json):
    { "id": "string", "title": "string", "meeting_type": "string|null",
      "date": "string (ISO 8601)", "participants": "string (JSON array)",
      "source_filename": "string", "created_at": "string (ISO 8601)" }
  Errors: 404 Meeting not found

mti meetings transcript <id>
  Description: Output the raw transcript text for a meeting.
  Output: Plain text (no JSON mode — transcripts are unstructured)
  Errors: 404 Meeting not found

mti meetings artifact <id> [--json]
  Description: Show the extracted summary, decisions, action items, and risks.
  Output schema (--json):
    { "summary": "string",
      "decisions": [{ "text": "string", "decided_by": "string" }],
      "proposed_features": ["string"],
      "action_items": [{ "description": "string", "owner": "string",
        "requester": "string", "due_date": "string|null",
        "priority": "critical|normal|low", "short_id": "string?" }],
      "open_questions": ["string"],
      "risk_items": [{ "category": "relationship|architecture|engineering",
        "description": "string" }],
      "milestones": [{ "title": "string", "target_date": "string|null",
        "status_signal": "string", "excerpt": "string" }]? }
  Errors: 404 Meeting not found, null if no artifact extracted yet

mti meetings rename <id> <title>
  Description: Rename a meeting.
  Errors: 404 Meeting not found

mti meetings reassign <id> <client>
  Description: Reassign a meeting to a different client.
  Errors: 404 Meeting not found

mti meetings delete <id...> --confirm
  Description: Delete one or more meetings. Requires --confirm flag.
  Options:
    --confirm   Required. Confirms deletion.
  Errors: Aborts with message if --confirm not provided

mti meetings ignore <id> [--undo]
  Description: Mark a meeting as ignored (hidden from default views).
  Options:
    --undo   Restore a previously ignored meeting
  Errors: 404 Meeting not found
```

Table formats:
- `meetings list`: columns `ID | Title | Date | Client | Action Items`
- `meetings get`: key-value display (not table) — Title, Date, Type, Client, Participants, Source
- `meetings artifact`: sectioned display — Summary paragraph, then Decisions / Action Items / Open Questions / Risks as bullet lists
- `meetings transcript`: raw text output, no formatting

Mutation feedback:
- rename/reassign: `"Meeting <id> updated."`
- delete: `"Deleted N meeting(s)."` or `"Aborted. Use --confirm to delete."`
- ignore: `"Meeting <id> ignored."` / `"Meeting <id> restored."`

Bursts:
- [ ] Burst 10: `meetings list` — with filters and help text + schema
- [ ] Burst 11: `meetings get <id>` — full detail with help text + schema
- [ ] Burst 12: `meetings transcript <id>` — raw transcript with help text
- [ ] Burst 13: `meetings artifact <id>` — formatted artifact with help text + schema
- [ ] Burst 14: `meetings rename <id> <title>` — with help text
- [ ] Burst 15: `meetings reassign <id> <client>` — with help text
- [ ] Burst 16: `meetings delete <id...>` — with confirmation + help text
- [ ] Burst 17: `meetings ignore <id> [--undo]` — with help text

---

**Agent C — items commands** (`cli/mti/src/commands/items.ts` + `cli/mti/test/commands/items.test.ts`)

Behavior:
- User lists action items across a client's meetings, filterable by date range
- User creates a new action item on a specific meeting
- User edits an existing action item's fields
- User marks an item complete with an optional note, or reverts completion
- User views completion history for a meeting
- User traces an item's cross-meeting history via canonical ID

API contracts:
```
GET /api/clients/:name/action-items?after=<date>&before=<date>
  → Array<{
      meeting_id, meeting_title, meeting_date, item_index: number,
      description, owner, requester, due_date: string|null,
      priority: "critical"|"normal", canonical_id?, total_mentions?, short_id?
    }>

POST /api/meetings/:id/action-items
  body: { description?, owner?, requester?, due_date?, priority? }  → 204

PUT /api/meetings/:id/action-items/:index
  body: { description?, owner?, requester?, due_date?, priority? }  → 204

POST /api/meetings/:id/action-items/:index/complete
  body: { note: string }  → 204

DELETE /api/meetings/:id/action-items/:index/complete  → 204

GET /api/meetings/:id/completions
  → Array<{ id, meeting_id, item_index: number, completed_at, note }>

GET /api/items/:canonicalId/history
  → Array<{
      canonical_id, meeting_id, item_type, item_index: number,
      item_text, first_mentioned_at, meeting_title, meeting_date
    }>
```

Commands + help output schemas:
```
mti items list <client> [--after <date>] [--before <date>] [--json]
  Description: List action items across all meetings for a client.
  Arguments:
    client              Client name (required)
  Options:
    --after <date>      Only items from meetings after this date (YYYY-MM-DD)
    --before <date>     Only items from meetings before this date (YYYY-MM-DD)
  Output schema (--json):
    [{ "meeting_id": "string", "meeting_title": "string",
       "meeting_date": "string", "item_index": "number",
       "description": "string", "owner": "string", "requester": "string",
       "due_date": "string|null", "priority": "critical|normal",
       "canonical_id": "string?", "total_mentions": "number?",
       "short_id": "string?" }]
  Example:
    $ mti items list Acme --after 2026-01-01
    Short ID  Description            Owner    Due          Priority  Meeting             Date
    ────────  ─────────────────────  ───────  ──────────  ────────  ──────────────────  ──────────
    f3a1b2    Draft Q2 roadmap       Alice    2026-04-01  critical  Q1 Planning Review  2026-01-15
  Errors: 404 Client not found

mti items create <meetingId> --desc <text> [--owner <name>] [--due <date>] [--priority critical|normal|low]
  Description: Add a new action item to a meeting.
  Arguments:
    meetingId           Meeting ID (required)
  Options:
    --desc <text>       Item description (required)
    --owner <name>      Person responsible
    --due <date>        Due date (YYYY-MM-DD)
    --priority <level>  critical, normal, or low (default: normal)
  Errors: 404 Meeting not found

mti items edit <meetingId> <index> [--desc <text>] [--owner <name>] [--due <date>] [--priority critical|normal|low]
  Description: Edit an existing action item's fields. Only specified fields are updated.
  Arguments:
    meetingId           Meeting ID (required)
    index               Action item index (required, 0-based)
  Errors: 404 Meeting or item not found

mti items complete <meetingId> <index> [--note <text>]
  Description: Mark an action item as complete.
  Arguments:
    meetingId           Meeting ID (required)
    index               Action item index (required, 0-based)
  Options:
    --note <text>       Completion note (default: empty string)
  Errors: 404 Meeting or item not found

mti items uncomplete <meetingId> <index>
  Description: Revert an action item's completion status.
  Errors: 404 Meeting or item not found

mti items completions <meetingId> [--json]
  Description: Show completion records for a meeting's action items.
  Output schema (--json):
    [{ "id": "string", "meeting_id": "string", "item_index": "number",
       "completed_at": "string (ISO 8601)", "note": "string" }]
  Errors: 404 Meeting not found

mti items history <canonicalId> [--json]
  Description: Show cross-meeting history for an action item by its canonical ID.
  Output schema (--json):
    [{ "canonical_id": "string", "meeting_id": "string",
       "item_type": "string", "item_index": "number",
       "item_text": "string", "first_mentioned_at": "string",
       "meeting_title": "string", "meeting_date": "string" }]
  Example:
    $ mti items history f3a1b2
    Meeting              Date         Description
    ──────────────────  ──────────  ─────────────────────
    Q1 Planning Review  2026-01-15  Draft Q2 roadmap
    Sprint Retro        2026-02-01  Draft Q2 roadmap (updated scope)
  Errors: 404 Canonical ID not found
```

Table formats:
- `items list`: columns `Short ID | Description | Owner | Due | Priority | Meeting | Date`
- `items completions`: columns `Item # | Completed At | Note`
- `items history`: columns `Meeting | Date | Description`

Mutation feedback:
- create: `"Action item added to meeting <id>."`
- edit: `"Action item <index> updated."`
- complete: `"Action item <index> marked complete."`
- uncomplete: `"Action item <index> completion reverted."`

Bursts:
- [ ] Burst 18: `items list <client>` — with filters, help text + schema
- [ ] Burst 19: `items create <meetingId>` — with help text
- [ ] Burst 20: `items edit <meetingId> <index>` — with help text
- [ ] Burst 21: `items complete <meetingId> <index>` — with help text
- [ ] Burst 22: `items uncomplete <meetingId> <index>` — with help text
- [ ] Burst 23: `items completions <meetingId>` — with help text + schema
- [ ] Burst 24: `items history <canonicalId>` — with help text + schema

---

**Agent D — notes commands** (`cli/mti/src/commands/notes.ts` + `cli/mti/test/commands/notes.test.ts`)

Behavior:
- User lists notes attached to a meeting
- User creates a note on a meeting with optional title
- User updates or deletes their own notes (API returns 403 for non-user notes)

API contracts:
```
GET /api/notes/meeting/:meetingId
  → Array<{
      id, objectType: "meeting", objectId, title: string|null,
      body: string, noteType: string, createdAt, updatedAt
    }>

POST /api/notes/meeting/:meetingId
  body: { title?: string; body: string }  → Note (201)

PATCH /api/notes/:id
  body: { title?: string|null; body?: string }  → Note
  Errors: 403 if noteType !== "user", 404 if not found

DELETE /api/notes/:id  → { ok: true }
  Errors: 403 if noteType !== "user"
```

Commands + help output schemas:
```
mti notes list <meetingId> [--json]
  Description: List notes attached to a meeting.
  Arguments:
    meetingId           Meeting ID (required)
  Output schema (--json):
    [{ "id": "string", "objectType": "meeting", "objectId": "string",
       "title": "string|null", "body": "string", "noteType": "string",
       "createdAt": "string (ISO 8601)", "updatedAt": "string (ISO 8601)" }]
  Example:
    $ mti notes list a1b2c3d4
    ID        Title             Body                    Created      Updated
    ────────  ────────────────  ──────────────────────  ───────────  ───────────
    n1x2y3    Follow-up needed  Check with legal on...  2026-01-15   2026-01-16
  Errors: 404 Meeting not found

mti notes create <meetingId> --body <text> [--title <text>]
  Description: Create a note on a meeting.
  Arguments:
    meetingId           Meeting ID (required)
  Options:
    --body <text>       Note body (required)
    --title <text>      Optional note title
  Output schema (--json): (the created Note object, same shape as list items)
  Errors: 404 Meeting not found

mti notes update <noteId> [--title <text>] [--body <text>]
  Description: Update a user-created note. Only specified fields are changed.
  Arguments:
    noteId              Note ID (required)
  Options:
    --title <text>      New title (pass empty string to clear)
    --body <text>       New body
  Errors: 403 Cannot modify notes not created by you, 404 Note not found

mti notes delete <noteId>
  Description: Delete a user-created note.
  Arguments:
    noteId              Note ID (required)
  Errors: 403 Cannot modify notes not created by you, 404 Note not found
```

Table formats:
- `notes list`: columns `ID | Title | Body (truncated) | Created | Updated`
- 403 errors surfaced as: `"Cannot modify this note — it was not created by you."`

Mutation feedback:
- create: `"Note created on meeting <meetingId>."`
- update: `"Note <noteId> updated."`
- delete: `"Note <noteId> deleted."`

Bursts:
- [ ] Burst 25: `notes list <meetingId>` — with help text + schema
- [ ] Burst 26: `notes create <meetingId>` — with help text + schema
- [ ] Burst 27: `notes update <noteId>` — with help text
- [ ] Burst 28: `notes delete <noteId>` — with help text

### Phase 4 — Sequential
- [ ] Burst 29: `config` show + `config set` commands
- [ ] Burst 30: Add `mti` script to package.json, verify end-to-end with running API

## DONE
