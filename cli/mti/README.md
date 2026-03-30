# mti -- Meeting Insights CLI

A command-line client for the Meeting Insights API. Designed for both human operators and LLM agents.

## Setup

### Install

```bash
pnpm install   # from project root
```

### Configure

Configuration is stored in `~/.mtirc` (JSON). Set connection details before first use:

```bash
pnpm mti config set baseUrl http://localhost:3000
pnpm mti config set token <your-api-token>
```

Verify your configuration:

```bash
pnpm mti config show
```

### Environment Variable Overrides

Environment variables take precedence over `~/.mtirc` values:

| Variable | Description |
|----------|-------------|
| `MTI_BASE_URL` | API server URL (overrides `baseUrl` in config file) |
| `MTI_TOKEN` | Auth token (overrides `token` in config file) |

## Usage

All commands follow the pattern `mti <noun> <verb> [options]`. Human-readable table output is the default; pass `--json` on any list/get command for structured JSON output.

### Clients

```bash
mti clients list [--json]              # List clients with IDs
mti clients info <id|name> [--json]    # Show client detail (team, aliases, glossary count)
mti clients default                     # Show your default client
mti clients glossary <name> [--json]   # Show glossary terms for a client
```

`clients info` accepts either a UUID or a client name (case-insensitive):

```bash
mti clients info LLSA                   # by name
mti clients info a1b2c3d4-...          # by UUID
```

### Meetings

```bash
mti meetings list [--client <name>] [--after <date>] [--before <date>] [--limit <n>] [--no-truncate] [--json]
mti meetings get <id> [--include-transcript] [--json]
mti meetings transcript <id>
mti meetings artifact <id> [--json]
mti meetings rename <id> <title> [--json]
mti meetings reassign <id> <client> [--json]
mti meetings delete <id...> --confirm [--json]
mti meetings ignore <id> [--undo] [--json]
```

### Action Items

```bash
mti items list <client> [--after <date>] [--before <date>] [--limit <n>] [--no-truncate] [--json]
mti items create <meetingId> [--description <text>] [--owner <name>] [--priority <level>] [--json]
mti items edit <meetingId> <index> [--description <text>] [--owner <name>] [--due-date <date>] [--priority <level>] [--json]
mti items complete <meetingId> <index> [--note <text>] [--json]
mti items uncomplete <meetingId> <index>
mti items completions <meetingId>
mti items history <canonicalId>
```

### Notes

```bash
mti notes list <meetingId> [--json]
mti notes create <meetingId> --body <text> [--title <text>] [--json]
mti notes update <noteId> [--title <text>] [--body <text>] [--json]
mti notes delete <noteId> [--json]
```

### Config

```bash
mti config show [--json]       # Display current resolved config (token masked)
mti config set <key> <value>   # Set a config key (baseUrl or token)
```

## The --json Flag

All list and get commands support `--json` for structured output. Mutation commands return `{ "ok": true }` (or the created object for POST 201 responses) in JSON mode.

The `--json` flag can be passed either on the subcommand or as a global option:

```bash
mti --json clients list      # global
mti clients list --json      # per-command
```

LLM agents should default to `--json` for reliable parsing.

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | User error (bad arguments, 401, 403, 404) |
| `2` | Server error (500, 503) |

## Help

Every command supports `--help` with full documentation including output schema, examples, and error codes:

```bash
mti --help                    # List all command groups
mti meetings --help           # List all meeting verbs
mti meetings list --help      # Full contract for meetings list
```

## Destructive Actions

Commands that delete data require explicit confirmation:

```bash
mti meetings delete abc123 --confirm   # required
mti meetings delete abc123             # aborts with message
```
