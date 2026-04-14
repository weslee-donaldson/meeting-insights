# cli/ -- CLI tools directory

Contains two subdirectories and one standalone script serving different audiences.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `admin-util/` | Operator and developer scripts that drive `core/` directly. Standalone Node scripts for bootstrapping, processing, querying, and maintaining the pipeline. See `admin-util/llm-context.md` for file details. |
| `mti/` | Customer-facing CLI client that talks to the API server over HTTP. See [mti/llm-context.md](mti/llm-context.md) for file details. |

## Standalone Scripts

| File | Purpose |
|------|---------|
| `manage-auth.ts` | Auth management CLI (`pnpm manage-auth`). Subcommands: `create-client` (register OAuth client), `create-api-key` (mint API key), `list-clients`, `list-api-keys`, `revoke-client <client_id>`, `revoke-api-key <prefix>`. Reads DB from `MTNINSIGHTS_DB_PATH` or default, uses the default tenant's owner user. Exports `buildProgram(db, tenantId, userId, print)` for testability. |
| `split.ts` | Meeting split CLI (`pnpm split`). Accepts `meetingId` positional arg and `--durations` flag (comma-separated minutes). Calls `splitMeeting` from `core/meetings/split.ts` and prints a summary of created segments. Exports `runSplit(db, meetingId, durations)` for testability. |

## Related

- Parent: [root llm-context-summary](../llm-context-summary.md)
- Business logic: [core/llm-context.md](../core/llm-context.md)
- Admin scripts detail: [admin-util/llm-context.md](admin-util/llm-context.md)
