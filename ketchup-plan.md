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
- Mutation commands also support `--json` — returns `{ "ok": true }` (or the created object for POST 201 responses) so agents can confirm success programmatically without parsing human-readable strings
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
- `setup.ts`, `run.ts`, `reset.ts`, `purge.ts`, `query.ts`, `eval.ts`, `assign-client.ts`, `all-items-dedupe.ts`, `import-external.ts`, `shared.ts`, `test-ollama.ts`
- Update `package.json` script paths (e.g., `"setup": "tsx cli/admin-util/setup.ts"`)
- Update `local-service/main.ts` import: `loadCliConfig` from `"../cli/admin-util/shared.js"`

## File Structure

```
cli/
  admin-util/               # Existing admin scripts (moved from cli/)
    shared.ts, setup.ts, run.ts, reset.ts, purge.ts,
    query.ts, eval.ts, assign-client.ts, all-items-dedupe.ts, import-external.ts, test-ollama.ts
    README.md               # User-facing docs for admin scripts
    scatter.md              # LLM scatter doc for admin-util/
  mti/
    bin/
      mti.ts                # Entry point, program setup, subcommand registration
    src/
      http-client.ts        # Fetch wrapper: baseUrl, auth header, typed errors
      config.ts             # Load/save ~/.mtirc, env var overrides
      format.ts             # Table/key-value/section formatter + --json toggle
      commands/
        clients.ts          # clients list | default | glossary
        meetings.ts         # meetings list | get | transcript | artifact | rename | reassign | delete | ignore
        items.ts            # items list | create | edit | complete | uncomplete | completions | history
        notes.ts            # notes list | create | update | delete
        config.ts           # config show | set
    README.md               # User-facing docs for mti CLI
    scatter.md              # LLM scatter doc for mti/

test/
  cli/
    mti/
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

**Test location rationale:** All project tests live under `test/` (matched by vitest.config.ts `include: ["test/**/*.test.ts"]`). CLI tests follow this convention at `test/cli/mti/`.

## Reference Files

- `electron-ui/ui/src/api-client.ts` — existing HTTP fetch client for same API endpoints
- `api/routes/meetings.ts` — authoritative route definitions for meetings + action items
- `api/routes/notes.ts` — authoritative route definitions for notes
- `api/server.ts` — route registration, middleware, error conventions

## Dependency Graph & Parallelization

```
Phase 1 — Sequential (main branch)
  Burst 0: reorganize cli/ + docs
  Burst 1: entry point + commander setup + vitest config
      │
Phase 2 — 3 parallel agents (worktrees, merge after all complete)
      ├─── Agent A: Bursts 2,3 (config.ts)
      ├─── Agent B: Bursts 4,5 (http-client.ts)
      └─── Agent C: Bursts 6a,6b,6c (format.ts)
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
  Burst 31: documentation (README, scatter, gather)
```

**Why these boundaries:**
- Phase 2 tracks touch separate files (`config.ts`, `http-client.ts`, `format.ts`) — zero merge conflict risk
- Phase 3 tracks touch separate command files (`clients.ts`, `meetings.ts`, `items.ts`, `notes.ts`) — zero merge conflict risk, but all depend on the Phase 2 foundation
- Phase 4 is sequential because `config` commands wire into the entry point and integration touches everything

**Each agent receives:**
- This full ketchup plan (context + UX principles + behavioral sketches)
- The foundation files from prior phases (config, http-client, format)
- Reference to the specific API routes for their command group

### Multi-Agent Orchestration Protocol

This section defines the exact steps the operator (human or meta-agent) must follow to coordinate parallel agents. It is designed so that each step is unambiguous and mechanically executable.

#### Prerequisites

- All agents run in **git worktrees** (`isolation: "worktree"` in Claude Code Agent tool)
- Each worktree gets its own branch: `mti-cli/<phase>-<agent>` (e.g., `mti-cli/p2-config`, `mti-cli/p2-http-client`, `mti-cli/p2-format`)
- The `main` branch is the merge target for all phases
- TCR in worktrees uses scoped revert: `git checkout -- cli/ test/cli/` (not `git checkout -- .`)

#### Single-Agent Fallback

If running with a single agent (no worktree support), execute all bursts sequentially on `main`:
1. Phase 1: Bursts 0, 1
2. Phase 2: Bursts 2, 3, 4, 5, 6a, 6b, 6c (any order within phase)
3. Phase 3: Bursts 7-28 (any order within phase, but each agent's bursts must be sequential)
4. Phase 4: Bursts 29, 30, 31

No merging required. Skip the rest of this protocol.

#### Phase 1 Execution (Sequential, on main)

```bash
# Operator runs on main branch
1. Execute Burst 0 (reorganize cli/)
2. Execute Burst 1 (entry point + vitest config)
3. Verify: `pnpm test --run` passes (existing 274+ tests unaffected)
4. Verify: `ls cli/admin-util/setup.ts` exists
5. Verify: `ls cli/mti/bin/mti.ts` exists
6. Verify: `ls test/cli/mti/` directory exists
7. Tag checkpoint: `git tag mti-cli-phase1-done`
```

#### Phase 2 Execution (3 Parallel Agents)

**Step 1 — Spawn all 3 agents simultaneously:**

Each agent is spawned with `isolation: "worktree"`. Provide each agent with:
- The full `ketchup-plan.md`
- Instruction: "You are Agent [A/B/C] in Phase 2. Execute ONLY your assigned bursts. Do NOT modify any files outside your scope. Run `pnpm test --run` after each burst to verify no regressions."

| Agent | Branch | Source files (create) | Test files (create) | Bursts |
|-------|--------|----------------------|---------------------|--------|
| A | `mti-cli/p2-config` | `cli/mti/src/config.ts` | `test/cli/mti/config.test.ts` | 2, 3 |
| B | `mti-cli/p2-http-client` | `cli/mti/src/http-client.ts` | `test/cli/mti/http-client.test.ts` | 4, 5 |
| C | `mti-cli/p2-format` | `cli/mti/src/format.ts` | `test/cli/mti/format.test.ts` | 6a, 6b, 6c |

**Step 2 — Wait for all 3 agents to complete.**

**Step 3 — Merge (operator executes on main):**

```bash
# Merge order does not matter — files are disjoint
git merge mti-cli/p2-config --no-ff -m "feat(mti): config.ts — load/save ~/.mtirc with env var overrides"
git merge mti-cli/p2-http-client --no-ff -m "feat(mti): http-client.ts — typed fetch wrapper with error classes"
git merge mti-cli/p2-format --no-ff -m "feat(mti): format.ts — table, key-value, and section formatters"
```

**Step 4 — Post-merge verification:**

```bash
pnpm test --run                      # ALL tests pass (existing + new)
ls cli/mti/src/config.ts             # exists
ls cli/mti/src/http-client.ts        # exists
ls cli/mti/src/format.ts             # exists
ls test/cli/mti/config.test.ts       # exists
ls test/cli/mti/http-client.test.ts  # exists
ls test/cli/mti/format.test.ts       # exists
```

**Step 4.5 — `/review` on merged Phase 2 diff:**

Run `/review` against the aggregate diff from all 3 agents. Focus areas:
- Consistent error handling patterns across config.ts, http-client.ts, format.ts
- Type safety (no `any`, no `as` casts introduced by independent agents)
- API contract alignment between http-client.ts and format.ts (do formatters handle all response shapes the client can return?)
- Scope drift: did any agent touch files outside their assigned scope?

Auto-fix mechanical issues. Resolve findings before tagging.

```bash
git tag mti-cli-phase2-done
```

**Step 5 — Cleanup worktree branches:**

```bash
git branch -d mti-cli/p2-config mti-cli/p2-http-client mti-cli/p2-format
```

#### Phase 2 Failure Recovery

If an agent fails (tests don't pass, code doesn't compile):
1. Do NOT merge the failed agent's branch
2. Merge the successful agents' branches first
3. If the failure may be caused by a bug in merged foundation code (not the agent's fault), run `/investigate` on main before re-spawning — the root cause may be in the merged code, not the failed agent's work
4. Create a new agent on a fresh worktree from the updated `main`
5. Re-assign the failed agent's bursts to the new agent
6. The new agent has visibility into the merged code from other agents

If a merge produces unexpected conflicts (should not happen with disjoint files):
1. Abort the merge: `git merge --abort`
2. Inspect which files conflict — this indicates an agent modified files outside its scope
3. Re-run the offending agent with stricter scope instructions
4. If conflicts are in shared files (e.g., `package.json`), resolve manually: both sides' changes are additive

#### Phase 3 Execution (4 Parallel Agents)

Identical protocol to Phase 2, with these agent assignments:

| Agent | Branch | Source files (create) | Test files (create) | Bursts |
|-------|--------|----------------------|---------------------|--------|
| A | `mti-cli/p3-clients` | `cli/mti/src/commands/clients.ts` | `test/cli/mti/commands/clients.test.ts` | 7, 8, 9 |
| B | `mti-cli/p3-meetings` | `cli/mti/src/commands/meetings.ts` | `test/cli/mti/commands/meetings.test.ts` | 10-17 |
| C | `mti-cli/p3-items` | `cli/mti/src/commands/items.ts` | `test/cli/mti/commands/items.test.ts` | 18-24 |
| D | `mti-cli/p3-notes` | `cli/mti/src/commands/notes.ts` | `test/cli/mti/commands/notes.test.ts` | 25-28 |

**Each Phase 3 agent imports from Phase 2 foundation files** (already merged to main and available in worktree):
- `import { HttpClient } from "../http-client.ts"`
- `import { output, formatTable, formatKeyValue, formatSections } from "../format.ts"`
- `import { loadConfig } from "../config.ts"`

**Each agent also modifies `cli/mti/bin/mti.ts`** to register its command group. This IS a shared file. To minimize merge conflicts across 4 agents, each command file must export a `register(program: Command): void` function. The entry point imports and calls each. Agents add both the import line and the `register*(program)` call. Imports should be added alphabetically and register calls should be added alphabetically — this reduces positional conflicts. If merge conflicts still occur in this file, accept both sides (all changes are additive).

**Merge order for Phase 3:** Merge in order of fewest commits first (clients → notes → items → meetings) to minimize conflict surface. But any order works since the only shared file (`mti.ts`) has trivially-resolvable additive changes.

```bash
git merge mti-cli/p3-clients --no-ff -m "feat(mti): clients commands — list, default, glossary"
git merge mti-cli/p3-notes --no-ff -m "feat(mti): notes commands — list, create, update, delete"
git merge mti-cli/p3-items --no-ff -m "feat(mti): items commands — list, create, edit, complete, uncomplete, completions, history"
git merge mti-cli/p3-meetings --no-ff -m "feat(mti): meetings commands — list, get, transcript, artifact, rename, reassign, delete, ignore"
pnpm test --run
```

**Post-merge `/review` on Phase 3 diff:**

Run `/review` against the aggregate diff from all 4 agents. This is the most important review checkpoint -- 4 independent agents wrote 22 bursts of command code that must feel like one person wrote it. Focus areas:
- Consistent error message wording across command groups (clients, meetings, items, notes)
- Consistent `--help` output structure (description, schema, example, errors per the help text contract)
- Consistent table column naming and formatting conventions
- Consistent mutation feedback patterns ("Meeting <id> updated." vs "Note <noteId> updated.")
- HttpClient usage patterns: are all agents handling 401/403/404/503 the same way?
- `mti.ts` entry point: do all `program.addCommand(...)` registrations follow the same pattern?
- Scope drift: files changed outside each agent's assigned scope

Auto-fix mechanical issues. Resolve findings before tagging.

```bash
git tag mti-cli-phase3-done
git branch -d mti-cli/p3-clients mti-cli/p3-notes mti-cli/p3-items mti-cli/p3-meetings
```

#### Phase 4 Execution (Sequential, on main)

```bash
# Back on main, all foundation + command code merged
1. Execute Burst 29 (config commands)
2. Execute Burst 30 (integration: add mti script to package.json, test end-to-end)
3. Execute Burst 31 (documentation: README.md, scatter.md, gather.md updates)
4. Final verification: `pnpm test --run` — all tests pass
5. Run `/review` — final aggregate review of the full CLI diff against this plan
6. Run `/ship` — creates PR with test results, coverage audit, plan completion summary
```

#### Agent Prompt Template

Use this template when spawning each agent:

```
You are executing the mti CLI v1 ketchup plan, Phase {N}, Agent {letter}.

**Your scope:**
- Source file: `cli/mti/src/{file}.ts`
- Test file: `test/cli/mti/{file}.test.ts`
- Bursts: {list}
- Entry point registration: add `program.addCommand(...)` in `cli/mti/bin/mti.ts` (Phase 3 only)

**Rules:**
- Follow all CLAUDE.md rules (TDD, TCR, 100% coverage, no comments)
- Read `ketchup-plan.md` for the full behavioral sketch and API contracts for your command group
- Read the reference files listed in the plan before writing code
- Run `pnpm test --run` after each burst — all tests must pass
- Do NOT modify files outside your scope
- TCR revert scope: `git checkout -- cli/mti/src/{file}.ts test/cli/mti/{file}.test.ts`

**Foundation imports (Phase 3 only):**
- `import { HttpClient, AuthError, ForbiddenError, NotFoundError, ServerError, UnavailableError } from "../http-client.ts"`
- `import { output, formatTable, formatKeyValue, formatSections } from "../format.ts"`
- `import { loadConfig } from "../config.ts"`
```

## TODO

### Phase 1 — Sequential
- [x] Burst 0: Move existing scripts (including `test-ollama.ts`) to `cli/admin-util/`, update package.json paths, verify `pnpm` commands work. Update `local-service/main.ts` import of `loadCliConfig` to point to `../cli/admin-util/shared.js`. Update `cli/README.md` and `cli/scatter.md` to reflect new structure. Create `cli/admin-util/README.md` and `cli/admin-util/scatter.md`.
- [ ] Burst 1: Add commander dep, create `cli/mti/bin/mti.ts` entry point with version + help + error-to-exit-code wrapper. Add `test/cli/mti/` directory. (No vitest.config.ts change needed — existing `test/**/*.test.ts` glob already matches `test/cli/`)

### Phase 2 — Parallel (3 agents)

---

**Agent A — config.ts** (`cli/mti/src/config.ts` + `test/cli/mti/config.test.ts`)

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

**Agent B — http-client.ts** (`cli/mti/src/http-client.ts` + `test/cli/mti/http-client.test.ts`)

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

Exit code contract (wired in entry point, Burst 1, using error classes from Burst 5):
- `AuthError` / `ForbiddenError` / `NotFoundError` → `process.exit(1)` (user error / 4xx)
- `ServerError` / `UnavailableError` → `process.exit(2)` (server error / 5xx)
- Commander validation errors (missing args, bad options) → Commander's default exit(1)
- The entry point wraps each command's `.action()` in a try/catch that maps error class → exit code and prints the error message to stderr.

Bursts:
- [ ] Burst 4: `http-client.ts` — fetch wrapper with auth header, base URL joining
- [ ] Burst 5: `http-client.ts` — typed error handling (401, 403, 404, 500, 503) + exit code mapping helper (`exitCodeForError(err): 1 | 2`)

---

**Agent C — format.ts** (`cli/mti/src/format.ts` + `test/cli/mti/format.test.ts`)

Behavior: Formats API responses for terminal output. Three display modes: table, key-value, and sectioned.
- `formatTable(rows: Record<string, unknown>[], columns: ColumnDef[])` — renders aligned columns with headers
  - `ColumnDef: { key: string; header: string; width?: number }`
  - Left-align text, truncate to width if specified
  - Header row + separator line + data rows
- `formatKeyValue(entries: Array<{ label: string; value: string }>)` — renders label-value pairs for detail views
  - Label right-padded, colon, value. Used by `meetings get` and `clients default`.
  - Example: `Title:   Q1 Planning Review\nDate:    2026-01-15\nClient:  Acme`
- `formatSections(sections: Array<{ heading: string; items: string[] }>)` — renders sectioned bullet lists
  - Heading in bold/caps, then indented bullet items. Used by `meetings artifact`.
  - Example: `SUMMARY\n  Full summary text...\n\nDECISIONS\n  • Decision one (decided by Alice)\n  • Decision two`
- `formatJson(data: unknown)` — `JSON.stringify(data, null, 2)`
- `output(data: unknown, options: { json: boolean; columns?: ColumnDef[]; mode?: "table" | "kv" | "sections" })` — dispatches to appropriate formatter or JSON
- Writes to stdout via a writable stream (injectable for testing, defaults to `process.stdout`)

Bursts:
- [ ] Burst 6a: `format.ts` — table formatter + `--json` toggle
- [ ] Burst 6b: `format.ts` — key-value formatter (`formatKeyValue`) for detail views
- [ ] Burst 6c: `format.ts` — sectioned formatter (`formatSections`) for artifact display

---

### Phase 3 — Parallel (4 agents)

Each agent imports from the Phase 2 foundation: `HttpClient` from `../http-client.ts`, `output`/`formatTable` from `../format.ts`, `loadConfig` from `../config.ts`. Each command file exports a function that registers subcommands on a Commander `Command` instance.

**Help text contract**: Every command registered by an agent must include rich `--help` output designed for both humans and LLM agents. Each command's help includes: description, all arguments/options with types and defaults, output schema (JSON shape for `--json`), at least one example with sample output, and relevant error codes. See "Dual Audience" section above for the full template. Help text is tested — each command burst includes a test asserting `--help` output contains: description, output schema (if applicable), example, and error section.

---

**Agent A — clients commands** (`cli/mti/src/commands/clients.ts` + `test/cli/mti/commands/clients.test.ts`)

Behavior:
- User lists their assigned clients (scoped by auth token, not all system clients)
- User views their default client
- User looks up glossary terms for a specific client

API contracts:
```
GET /api/clients → string[]
GET /api/default-client → string | null
GET /api/glossary?client=<name> → Array<{ term: string; variants: string[]; description: string }>
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
  Output schema (--json): [{ "term": "string", "variants": ["string"], "description": "string" }]
  Example:
    $ mti clients glossary "Acme Corp"
    Term                          Variants              Description
    ────                          ────────              ───────────
    OKR                           OKRs                  Objectives and Key Results
    RACI                          RACI matrix           Responsible, Accountable, Consulted, Informed
  Errors: 404 Client not found
```

Table formats:
- `clients list`: columns `[{ key: "name", header: "Name" }]` — transform string[] to `[{ name }]`
- `clients glossary`: columns `[{ key: "term", header: "Term", width: 30 }, { key: "variants", header: "Variants", width: 22 }, { key: "description", header: "Description" }]` — join `variants[]` with ", " for display

Bursts:
- [ ] Burst 7: `clients list` — lists the user's assigned clients (with help text + schema)
- [ ] Burst 8: `clients default` — shows the user's default client (with help text)
- [ ] Burst 9: `clients glossary <name>` — shows glossary terms for a client (with help text + schema)

---

**Agent B — meetings commands** (`cli/mti/src/commands/meetings.ts` + `test/cli/mti/commands/meetings.test.ts`)

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
      thread_tags?: Array<{ thread_id: string; title: string; shorthand: string }>;
      milestone_tags?: Array<{ milestone_id: string; title: string; target_date: string | null; status: string }>;
    }>
  Note: `series` is a normalized title (lowercase, whitespace trimmed).
  `actionItemCount` is camelCase (not snake_case). `thread_tags` and
  `milestone_tags` are present but V1 CLI ignores them — they are V2 scope.

GET /api/meetings/:id
  → { id, title, meeting_type, date, participants (JSON string), raw_transcript, source_filename, created_at }
  Note: API always returns raw_transcript. CLI strips it unless --include-transcript is passed.

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

mti meetings get <id> [--include-transcript] [--json]
  Description: Show full details for a single meeting.
  Options:
    --include-transcript   Include raw transcript in output (omitted by default; use `meetings transcript` for standalone access)
  Output schema (--json):
    { "id": "string", "title": "string", "meeting_type": "string|null",
      "date": "string (ISO 8601)", "participants": "string (JSON-encoded array)",
      "source_filename": "string", "created_at": "string (ISO 8601)" }
    With --include-transcript: adds "raw_transcript": "string"
  Note: `participants` is a JSON string in the API response, not a parsed array.
    For table display, parse it with JSON.parse() and join names with ", ".
    For --json output, strip `raw_transcript` from response unless --include-transcript is passed.
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

mti meetings rename <id> <title> [--json]
  Description: Rename a meeting.
  Output schema (--json): { "ok": true }
  Errors: 404 Meeting not found

mti meetings reassign <id> <client> [--json]
  Description: Reassign a meeting to a different client.
  Output schema (--json): { "ok": true }
  Errors: 404 Meeting not found

mti meetings delete <id...> --confirm [--json]
  Description: Delete one or more meetings. Requires --confirm flag.
  Options:
    --confirm   Required. Confirms deletion.
  Output schema (--json): { "ok": true, "count": "number" }
  Errors: Aborts with message if --confirm not provided

mti meetings ignore <id> [--undo] [--json]
  Description: Mark a meeting as ignored (hidden from default views).
  Options:
    --undo   Restore a previously ignored meeting
  Output schema (--json): { "ok": true }
  Errors: 404 Meeting not found
```

Display formats:
- `meetings list`: table — columns `ID | Title | Date | Client | Action Items`
- `meetings get`: key-value (`formatKeyValue`) — Title, Date, Type, Participants (JSON.parse → join with ", "), Source. `raw_transcript` is stripped from both table and `--json` output unless `--include-transcript` is passed. Use `meetings transcript` for standalone transcript access.
- `meetings artifact`: sectioned (`formatSections`) — Summary paragraph, then Decisions / Action Items / Open Questions / Risks as bullet lists. Each decision shows `(decided by X)`. Each action item shows `[priority] description (owner, due: date)`.
- `meetings transcript`: raw text output via `process.stdout.write()`, no formatting

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

**Agent C — items commands** (`cli/mti/src/commands/items.ts` + `test/cli/mti/commands/items.test.ts`)

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
      priority: "critical"|"normal"|"low", canonical_id?, total_mentions?, short_id?
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

mti items create <meetingId> --desc <text> [--owner <name>] [--due <date>] [--priority critical|normal|low] [--json]
  Description: Add a new action item to a meeting.
  Arguments:
    meetingId           Meeting ID (required)
  Options:
    --desc <text>       Item description (required)
    --owner <name>      Person responsible
    --due <date>        Due date (YYYY-MM-DD)
    --priority <level>  critical, normal, or low (default: normal)
  Output schema (--json): { "ok": true }
  Errors: 404 Meeting not found

mti items edit <meetingId> <index> [--desc <text>] [--owner <name>] [--due <date>] [--priority critical|normal|low] [--json]
  Description: Edit an existing action item's fields. Only specified fields are updated.
  Arguments:
    meetingId           Meeting ID (required)
    index               Action item index (required, 0-based)
  Output schema (--json): { "ok": true }
  Errors: 404 Meeting or item not found

mti items complete <meetingId> <index> [--note <text>] [--json]
  Description: Mark an action item as complete.
  Arguments:
    meetingId           Meeting ID (required)
    index               Action item index (required, 0-based)
  Options:
    --note <text>       Completion note (default: empty string)
  Output schema (--json): { "ok": true }
  Errors: 404 Meeting or item not found

mti items uncomplete <meetingId> <index> [--json]
  Description: Revert an action item's completion status.
  Output schema (--json): { "ok": true }
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

**Agent D — notes commands** (`cli/mti/src/commands/notes.ts` + `test/cli/mti/commands/notes.test.ts`)

Behavior:
- User lists notes attached to a meeting
- User creates a note on a meeting with optional title
- User updates or deletes their own notes (API returns 403 for non-user notes)

API contracts:
```
GET /api/notes/:objectType/:objectId
  → Array<{
      id, objectType: "meeting", objectId, title: string|null,
      body: string, noteType: string, createdAt, updatedAt
    }>
  Note: API uses generic `:objectType/:objectId` pattern (supports "meeting",
  "insight", "milestone", "thread"). For V1 CLI, always pass "meeting" as objectType.
  There is also GET /api/notes/:objectType/:objectId/count → { count: number }
  which V1 does not use.

POST /api/notes/:objectType/:objectId
  body: { title?: string; body: string }  → Note (201)
  Note: For V1 CLI, objectType is always "meeting", objectId is the meetingId.

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

mti notes update <noteId> [--title <text>] [--body <text>] [--json]
  Description: Update a user-created note. Only specified fields are changed.
  Arguments:
    noteId              Note ID (required)
  Options:
    --title <text>      New title (pass empty string to clear)
    --body <text>       New body
  Output schema (--json): (the updated Note object, same shape as list items)
  Errors: 403 Cannot modify notes not created by you, 404 Note not found

mti notes delete <noteId> [--json]
  Description: Delete a user-created note.
  Arguments:
    noteId              Note ID (required)
  Output schema (--json): { "ok": true }
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
- [ ] Burst 29: `config` show + `config set` commands (test at `test/cli/mti/commands/config.test.ts`)
- [ ] Burst 30: Add `"mti": "tsx cli/mti/bin/mti.ts"` script to package.json. Infrastructure commit — manual smoke test against running API (`pnpm mti clients list`, `pnpm mti meetings list`), no automated test file.
- [ ] Burst 31: Documentation — create `cli/mti/README.md` (user-facing: install, usage, examples for each command group) + `cli/mti/scatter.md` (LLM scatter doc listing all files and their purposes). Update root `cli/README.md` and `cli/scatter.md` to reference both `admin-util/` and `mti/`. Update root `gather.md` to include `cli/mti/` learnings.

## DONE
