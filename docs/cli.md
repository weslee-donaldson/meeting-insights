# mti CLI

The `mti` CLI is an HTTP client for the API. It's used by humans and by external tools (Claude Code skills, scripts) to read and mutate state without touching the database directly.

## Installation

During `./setup.sh`, you're prompted to run `pnpm link --global`, which installs `mti` onto your PATH. If you skipped it, you can either:

- Run `pnpm link --global` later from the project root
- Run `pnpm mti <command>` from the project root without installing globally

## Configuration

Config lives at `~/.mtirc` (JSON). The CLI also accepts overrides via environment variables.

| Source | baseUrl default | token default |
|--------|-----------------|---------------|
| `~/.mtirc` | `http://localhost:3000` | `null` |
| `MTI_BASE_URL` env var | overrides file | -- |
| `MTI_TOKEN` env var | -- | overrides file |

**No setup is required for local development.** The default baseUrl points at the local API, and when `MTNINSIGHTS_AUTH_ENABLED=0` (the default) the CLI omits the `Authorization` header entirely.

### `mti config show [--json]`
Display the resolved configuration. Token is masked unless `--json` is passed.

### `mti config set <key> <value>`
Supported keys: `baseUrl`, `token`.

```bash
mti config set baseUrl https://api.example.com
mti config set token mki_abc123...
```

### `mti config unset <key>`
Clears a stored value.

## Global flags

- `--json` -- Output raw JSON instead of a formatted table. Available on every command.

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Auth failure, forbidden, or not found (`AuthError`, `ForbiddenError`, `NotFoundError`) |
| 2 | Server error or service unavailable (`ServerError`, `UnavailableError`) |

## Clients

### `mti clients list`
List all clients in the workspace.

### `mti clients default`
Show the configured default client.

### `mti clients show <client>`
Detailed client record: aliases, glossary, prompts, team rosters.

### `mti clients team <client>`
Print the client team and implementation team rosters.

### `mti clients glossary <client>`
Print the client's glossary entries.

## Meetings

### `mti meetings list [<client>] [flags]`
List meetings (optionally scoped to a client).

Flags:
- `--after <YYYY-MM-DD>` / `--before <YYYY-MM-DD>` -- Date range filter
- `--limit <n>` -- Max rows

### `mti meetings get <meetingId> [--include-transcript]`
Fetch a single meeting. Pass `--include-transcript` to include the raw transcript body.

## Action items

### `mti items list <client> [flags]`
All action items across meetings for a client.

Flags:
- `--after` / `--before` -- Date filter on source meetings
- `--open-only` -- Exclude completed items

### `mti items history <short_id>`
Cross-meeting history for a canonical action item (post-dedup).

### `mti items create <meetingId> --description <text> [flags]`
Add a new action item to a meeting.

Flags:
- `--owner <name>`
- `--requester <name>`
- `--due <YYYY-MM-DD>`
- `--priority <critical|normal|low>`

### `mti items complete <short_id> [<short_id>...] [--note <text>]`
Batch-complete one or more action items by short ID. Calls `POST /api/action-items/complete`.

```bash
mti items complete 242d5e 25d1b7 331ca6 --note "Shipped in PR #42"
```

The response reports per-item status: `completed` or `not_found`. A single missing ID doesn't fail the whole batch.

### `mti items uncomplete <short_id> [<short_id>...]`
Revert completion for one or more items.

### `mti items completions <meetingId>`
List completion events for a meeting's items.

## Notes

### `mti notes list <objectType> <objectId>`
`objectType` is one of `meeting`, `insight`, `milestone`, `thread`.

### `mti notes create <objectType> <objectId> --body <text> [--title <text>]`

### `mti notes update <noteId> [--body <text>] [--title <text>]`

### `mti notes delete <noteId>`

## Health

### `mti health status`
System health: DB reachable, LLM configured, outstanding system errors.

### `mti health acknowledge [--id <errorId>]`
Acknowledge system errors. Without `--id`, acknowledges all.

## Getting a token when auth is enabled

If you've set `MTNINSIGHTS_AUTH_ENABLED=1`, the CLI needs a bearer token. The simplest path is an API key:

```bash
pnpm manage-auth create-api-key \
  --name "my-cli" \
  --scopes "meetings:read,meetings:write,search:execute,threads:read,insights:read"
```

This prints an `mki_...` token once. Save it:

```bash
mti config set token mki_...
```

Full scope list and the scope-to-route mapping are documented in [api.md](api.md).
