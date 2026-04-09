# cli/ -- CLI tools directory

Contains two subdirectories and one standalone script serving different audiences.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `admin-util/` | Operator and developer scripts that drive `core/` directly. Standalone Node scripts for bootstrapping, processing, querying, and maintaining the pipeline. See `admin-util/scatter.md` for file details. |
| `mti/` | Customer-facing CLI client that talks to the API server over HTTP. See [mti/scatter.md](mti/scatter.md) for file details. |

## Standalone Scripts

| File | Purpose |
|------|---------|
| `manage-auth.ts` | Auth management CLI (`pnpm manage-auth`). Subcommands: `create-client` (register OAuth client), `create-api-key` (mint API key), `list-clients`, `list-api-keys`, `revoke-client <client_id>`, `revoke-api-key <prefix>`. Reads DB from `MTNINSIGHTS_DB_PATH` or default, uses the default tenant's owner user. Exports `buildProgram(db, tenantId, userId, print)` for testability. |
| `split.ts` | Meeting split CLI (`pnpm split`). Accepts `meetingId` positional arg and `--durations` flag (comma-separated minutes). Calls `splitMeeting` from `core/meeting-split.ts` and prints a summary of created segments. Exports `runSplit(db, meetingId, durations)` for testability. |

## Related

- Parent: [Root gather](../gather.md)
- Business logic: [core/scatter.md](../core/scatter.md)
- Admin scripts detail: [admin-util/scatter.md](admin-util/scatter.md)
