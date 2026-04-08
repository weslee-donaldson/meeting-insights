# cli/mti/ -- Customer-facing CLI client for the Meeting Insights API

Pure HTTP client that talks to the API server. No `core/` imports, no direct DB access. Auth token scopes all data server-side.

## Files

| File | Purpose |
|------|---------|
| `bin/mti.ts` | Entry point. Creates the Commander program, registers all command groups (clients, config, items, meetings, notes), defines `wrapAction` for error-to-exit-code mapping (AuthError/ForbiddenError/NotFoundError -> exit 1, ServerError/UnavailableError -> exit 2). Conditionally calls `program.parse()` when run as a script. |
| `src/config.ts` | Load/save `~/.mtirc` JSON config file. `loadConfig(path?)` returns `{ baseUrl, token }` with defaults and env var overrides (`MTI_BASE_URL`, `MTI_TOKEN`). `saveConfig(partial, path?)` merges into existing file without clobbering unrelated keys. |
| `src/http-client.ts` | Typed fetch wrapper. `HttpClient({ baseUrl, token, fetch })` with methods `get`, `post`, `put`, `patch`, `delete`. Sends `Authorization: Bearer <token>` when token is present. Throws typed error classes for non-2xx responses. Returns `null` for 204 No Content. |
| `src/errors.ts` | Error classes for HTTP status codes: `AuthError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ServerError` (500), `UnavailableError` (503). Each has a user-facing message. |
| `src/format.ts` | Output formatters for terminal display. `formatTable` (aligned columns with headers), `formatKeyValue` (label-value pairs), `formatSections` (sectioned bullet lists), `formatJson` (pretty-printed JSON). Convenience functions `outputTable`, `outputJson`, `outputKv`, `outputSections` write to a stream. `output` dispatches based on `{ json, mode }` options. |
| `src/commands/clients.ts` | Client commands: `list` (GET /api/clients), `default` (GET /api/default-client), `glossary <name>` (GET /api/glossary?client=name). Exports `registerClients(program, deps?)`. |
| `src/commands/config.ts` | Config commands: `show` (displays resolved config with masked token, supports --json), `set <key> <value>` (validates key is baseUrl or token, persists via saveConfig). Exports `registerConfig(program)`, `configShow`, `configSet`. |
| `src/commands/items.ts` | Action item commands: `list <client>`, `create <meetingId>`, `edit <meetingId> <index>`, `complete <meetingId> <index>`, `uncomplete <meetingId> <index>`, `completions <meetingId>`, `history <canonicalId>`. Exports `registerItems(program)`. |
| `src/commands/meetings.ts` | Meeting commands: `list`, `get <id>`, `transcript <id>`, `artifact <id>`, `rename <id> <title>`, `reassign <id> <client>`, `delete <id...>` (requires --confirm), `ignore <id>` (with --undo). Exports `registerMeetings(program)`. |
| `src/commands/notes.ts` | Note commands: `list <meetingId>`, `create <meetingId>`, `update <noteId>`, `delete <noteId>`. ForbiddenError on update/delete maps to user-facing message. Exports `registerNotes(program, wrapAction?)`. |
| `src/commands/health.ts` | Health commands: `health status` (GET /api/health; shows Status: HEALTHY/CRITICAL with error groups, occurrence counts, and affected meeting count; `--json` outputs raw HealthStatus), `health acknowledge` (POST /api/health/acknowledge; `--ids err1,err2` for specific IDs, else acknowledges all; `--json` outputs `{ ok: true }`). Exports `registerHealth(program, deps?)`. |

## Test Files

All tests live under `test/cli/mti/`, matching the source structure:

| Test File | Covers |
|-----------|--------|
| `test/cli/mti/entry.test.ts` | Program name, version, global --json option, wrapAction error mapping |
| `test/cli/mti/config.test.ts` | loadConfig, saveConfig, env var overrides |
| `test/cli/mti/http-client.test.ts` | HttpClient methods, auth header, typed error classes |
| `test/cli/mti/format.test.ts` | formatTable, formatKeyValue, formatSections, formatJson, output dispatcher |
| `test/cli/mti/commands/clients.test.ts` | clients list, default, glossary commands + help text |
| `test/cli/mti/commands/config.test.ts` | config show, config set commands + help text |
| `test/cli/mti/commands/items.test.ts` | items list, create, edit, complete, uncomplete, completions, history commands + help text |
| `test/cli/mti/commands/meetings.test.ts` | meetings list, get, transcript, artifact, rename, reassign, delete, ignore commands + help text |
| `test/cli/mti/commands/notes.test.ts` | notes list, create, update, delete commands + help text |

## Related

- Parent: [cli/README.md](../README.md)
- API routes: [api/routes/](../../api/routes/)
- User-facing docs: [README.md](README.md)
