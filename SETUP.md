# krisp-meeting-insights -- Setup

Transform Krisp meeting transcripts into a searchable, semantically clustered knowledge fabric.

---

## Quick Start

```bash
git clone <repo-url>
cd krisp-meeting-insights
./setup.sh
```

`setup.sh` is a guided installer. It explains each step before running it and lets you skip any prompt. End-to-end it will:

1. Install dependencies (including PM2 as a devDependency).
2. Create `.env.local` and offer to open it so you can set `ANTHROPIC_API_KEY`.
3. Create `config/clients.json` and offer to open it so you can define your real clients (see [docs/clients.md](docs/clients.md)). Skipping the edit exits setup so you can return later — re-run `./setup.sh` to continue.
4. Download ONNX models (~90 MB).
5. Seed the database.
6. Build the web UI production bundle.
7. Start `mti-api`, `mti-web`, and `webhook-watcher` under PM2 and snapshot the process list (`pm2 save`).
8. Offer to install the PM2 boot hook (`pm2 startup`) so services resurrect after a reboot.
9. Offer to link `mti` globally (`pnpm link --global`).

Verify with:

```bash
curl "http://localhost:${API_PORT:-3000}/api/clients"
```

Re-run `./setup.sh` any time; it's idempotent. Set `MTI_SETUP_SKIP_PROMPTS=1` to auto-accept every prompt for CI / unattended installs.

---

## Prerequisites

- **Node.js 22+** (`brew install node@22` on macOS)
- **pnpm** (`npm install -g pnpm`)
- An **Anthropic API key** (or OpenAI / local Ollama -- see LLM providers below)

---

## What setup.sh does

1. Verifies Node 22+ and pnpm are installed
2. Runs `pnpm install`
3. Copies `.env.example` to `.env.local` (if missing)
4. Copies `config/clients.example.json` to `config/clients.json` (if missing)
5. Downloads the ONNX embedding model (`all-MiniLM-L6-v2`, ~90 MB) with SHA256 verification
6. Runs database migrations and seeds clients from `config/clients.json`

All steps are idempotent -- safe to re-run after pulling updates.

---

## Configuration files

Everything that shapes behavior without a code change lives under `config/` and `.env.local`. You will revisit these as you tune the system.

| File | Purpose | Detailed docs |
|------|---------|---------------|
| `.env.local` | Environment variables: API keys, LLM provider, ports (`API_PORT`, `WEB_PORT`), auth, paths. Copied from `.env.example` by `setup.sh`. | [Environment variables](docs/reference.md) |
| `config/clients.json` | Client definitions: team members, aliases, meeting-name patterns, glossary, per-client extraction prompts. Drives client detection and seed data. | [docs/clients.md](docs/clients.md) |
| `config/system.json` | Numeric tuning knobs: search `maxDistance`, result `limit`, `displayLimit`, `chatContextLimit`. Shapes what context prompts see. Override path via `MTNINSIGHTS_SYSTEM_CONFIG_PATH`. | [docs/prompts.md#tuning-the-knobs-in-systemjson](docs/prompts.md), [docs/reference.md](docs/reference.md) |
| `config/prompts/*.md` | LLM prompt templates for extraction, tagging, insight generation, deep search, task generation. Edit the Markdown to reshape behavior. | [docs/prompts.md](docs/prompts.md) |
| `config/chat-templates/*.md` | Output-shape templates selected by chat intent (Jira ticket/epic, team actions, thread discovery). | [docs/prompts.md](docs/prompts.md) |
| `config/chat-guidelines.md` | Global chat-response rules (formatting, tone, refusals). Prepended to every chat call. | [docs/prompts.md](docs/prompts.md) |
| `ecosystem.config.cjs` | PM2 process definitions for `mti-api`, `mti-web`, `webhook-watcher`. Reads `WEB_PORT` from `.env.local`. | — |

After editing any of these, restart the relevant service: `pnpm exec pm2 restart mti-api` (for `.env.local`, `clients.json`, `system.json`, prompts) — the API loads them at startup.

---

## Manual setup (if you prefer)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Then edit .env.local and set your API keys.
```

### 3. Download the embedding model
```bash
pnpm download-models
```

This downloads:
- `models/all-MiniLM-L6-v2.onnx`
- `models/tokenizer.json`

Skips if already present with matching SHA256 hashes.

### 4. Configure your clients

`config/clients.json` defines the clients whose meetings you want to ingest. `setup.sh` seeds it from `config/clients.example.json` if it doesn't exist. **Edit it before running `pnpm setup`** — the seed step reads this file and writes the results into the database.

See [docs/clients.md](docs/clients.md) for the full schema, workflows (adding, editing, tuning detection/extraction), and glossary conventions.

### 4a. (Optional) Tweak prompts and search knobs

See the **Configuration files** table above for the list. Prompt templates live under `config/prompts/` and `config/chat-templates/`; numeric search/chat knobs live in `config/system.json`. Details in [docs/prompts.md](docs/prompts.md).

### 5. Initialize the database
```bash
pnpm setup
```

Creates SQLite database, LanceDB vector store, and seeds clients from `config/clients.json`. Applies any pending schema migrations.

---

## Updating after `git pull`

The migration system runs automatically. Either:
- **Restart the API server**: `pm2 restart mti-api` (runs pending migrations at startup)
- **Or run setup manually**: `pnpm setup`

Schema changes are forward-only and versioned via the `schema_version` table.

---

## Running the application

### PM2 (recommended for daily use)

PM2 manages three processes: `mti-api` (HTTP API), `mti-web` (built web UI), and `webhook-watcher`.

```bash
pnpm web:build                    # build the web UI bundle (required before first start and after UI changes)
pm2 start ecosystem.config.cjs    # start all three services
pm2 status                        # check running services
pm2 logs                          # tail logs
pm2 restart mti-api               # restart just the API
pm2 restart mti-web               # restart the web UI (after a new web:build)
pm2 stop all                      # stop everything
```

The web UI is served by `mti-web` on the port set by `WEB_PORT` in `.env.local` (default `5188`), via `vite preview` against the production bundle in `electron-ui/out/web`.

### Surviving system restarts

After `pm2 start`, persist the process list and install the boot hook:

```bash
pm2 save           # snapshot the current process list
pm2 startup        # prints a sudo command — run it to register PM2 at boot
```

All three services will resurrect on reboot.

### Web UI (development)
```bash
pnpm web:dev   # Vite dev server with hot reload (port set in vite.web.config.ts)
```

Use this instead of `mti-web` when iterating on the UI. Requires `mti-api` running (either via PM2 or `pnpm api:dev`).

### Electron desktop app
```bash
pnpm ui:dev    # launches the desktop app
```

### CLI (mti)

The `mti` CLI talks to the API via HTTP. It works out of the box when `MTNINSIGHTS_AUTH_ENABLED=0` (the default) -- no token needed.

**From the project directory** (works immediately after setup):
```bash
pnpm mti clients list
pnpm mti meetings list Acme
pnpm mti items complete <short_id1> <short_id2>
```

**Use `mti` from anywhere** (one-time setup):
```bash
pnpm link --global     # symlinks mti into your pnpm global bin dir
# Now you can run:
mti clients list
mti meetings list Acme
```

`pnpm link --global` installs the symlink into `~/Library/pnpm/` on macOS (ensure that's on your `PATH`, which `pnpm setup` configures automatically).

**Pointing at a different API or enabling auth:**
```bash
mti config show                                     # show current config
mti config set baseUrl https://api.example.com      # different API host
mti config set token <bearer-token>                 # required if AUTH_ENABLED=1
```

Config lives in `~/.mtirc`. Env vars `MTI_BASE_URL` and `MTI_TOKEN` override the file.

**Getting a token** (only needed if API auth is enabled):
```bash
pnpm manage-auth create-api-key --name "my-cli" --scopes "meetings:read,meetings:write,search:execute"
# Copy the printed mki_... token and:
mti config set token mki_...
```

---

## Verify your setup

After `./setup.sh` completes, run the eval harness to confirm the full pipeline works (LLM provider, embedder, search, chat):

```bash
pnpm eval
```

This runs canned queries from `data/eval/questions.json` through your configured LLM and writes results to `data/eval/results-{provider}-{timestamp}.jsonl`. If it finishes without errors, your setup is healthy. Edit `data/eval/questions.json` to add your own test queries.

---

## Data directory layout

`MTNINSIGHTS_DATA_DIR` (default `data`) is the root for all operational storage. `setup.sh` scaffolds these subdirectories:

| Path | Purpose |
|------|---------|
| `manual/raw-transcripts/` | Operator drop zone for Krisp batch exports |
| `manual/processed/` | Successfully ingested manual transcripts (moved here after processing) |
| `manual/failed/` | Manual transcripts that failed ingestion |
| `manual/external-transcripts/` | Non-Krisp transcripts (`.txt`, `.vtt`). Run `pnpm import-external` to convert and queue them for processing |
| `webhook/raw-transcripts/` | Incoming transcripts dropped by the webhook watcher |
| `webhook/processed/` | Webhook transcripts after successful ingestion |
| `webhook/failed/` | Webhook transcripts that failed ingestion |
| `assets/` | File attachments on meetings (stored as `{meetingId}/{uuid}-{filename}`). Uploaded via the UI and tracked in the `assets` DB table |
| `audit/` | Extraction audit logs (per-meeting LLM request/response records for debugging) |
| `eval/` | Eval harness: `questions.json` config + timestamped `results-*.jsonl` output |

All ten are gitignored. Back up `data/` along with `db/` and `models/` if you need to preserve state across machines.

---

## Environment variables

All configurable in `.env.local`. See `.env.example` for the full annotated list.

| Variable | Default | Purpose |
|----------|---------|---------|
| `ANTHROPIC_API_KEY` | — | Required when `LLM_PROVIDER=anthropic` |
| `MTNINSIGHTS_LLM_PROVIDER` | `anthropic` | `anthropic \| openai \| local \| claudecli \| stub` |
| `MTNINSIGHTS_DB_PATH` | `db/mtninsights.db` | SQLite path |
| `MTNINSIGHTS_VECTOR_PATH` | `db/lancedb` | LanceDB path |
| `API_PORT` | `3000` | API server port |
| `MTNINSIGHTS_AUTH_ENABLED` | `0` | Set to `1` to require Bearer tokens |
| `MTNINSIGHTS_OWNER_SECRET` | — | Required when auth enabled |
| `MTNINSIGHTS_LOG_LEVEL` | `info` | `error \| warn \| info \| debug` |
| `MTNINSIGHTS_LLM_CHUNK_TOKEN_LIMIT` | `30000` | Max tokens per extraction chunk |
| `MTNINSIGHTS_DEDUP_SEMANTIC_THRESHOLD` | `0.80` | Cosine similarity cutoff for item dedup |

---

## Development

```bash
pnpm test              # run full test suite
pnpm test:e2e          # Playwright e2e tests
pnpm web:dev           # web UI with hot reload
pnpm ui:dev            # Electron app with hot reload
pnpm api:dev           # API server in foreground (useful for debugging)
```

---

## Uninstall

```bash
./uninstall.sh
```

A guided teardown that removes only what this project created:

- **PM2 apps** registered by this project (`mti-api`, `mti-web`, `webhook-watcher`). Your PM2 installation, boot hook, and any other apps are untouched.
- The **`mti` pnpm global link** (pnpm itself is kept).
- **Generated artifacts**: `electron-ui/out/`, `models/`, `.keys/`.

Separate prompts let you decide about:

- **Config files** (`.env.local`, `config/clients.json`) — kept by default so a future `./setup.sh` picks up where you left off.
- **Database backup** — optionally tars `db/` (SQLite + LanceDB) to `../mti-db-backup-<timestamp>.tar.gz` before deletion.
- **All data** (`db/`, `data/manual/`, `data/webhook/`, `data/assets/`, `data/audit/`, `data/eval/`, `data/clients/`, `data/krisp-gdrive/`) — destructive; defaults to **No**.

`node_modules/` is left in place; remove it manually with `rm -rf node_modules` if you want a fully clean tree. To delete the checkout entirely, remove the directory after running the script.

---

## Troubleshooting

**Model download fails**
The download pulls ~90 MB from Hugging Face. Retry `pnpm download-models` -- it will verify hashes and resume any missing files.

**Missing API key errors**
Check `.env.local` exists and `ANTHROPIC_API_KEY` is set. Restart `mti-api` after edits: `pm2 restart mti-api`.

**Port 3000 already in use**
Change `API_PORT` in `.env.local`, then `pm2 restart mti-api`.

**Database errors after pulling updates**
Run `pnpm setup` to apply pending migrations. Check `schema_version` in the DB to see the current version.

**PM2 services won't start**
`pm2 logs mti-api --err --lines 50` shows the last errors. Common causes: missing env vars, models not downloaded, port conflict.

**Meetings ingest but no insights appear**
Extraction failed silently. Check these, in order:

1. **Audit logs** — every failed extraction writes a JSON file with `reason` and `error_type`:
   ```bash
   ls -lt data/audit/ | head -20
   cat data/audit/*.json | jq -s 'sort_by(.timestamp) | reverse | .[0:10]'
   ```
2. **Live API logs** — LLM request/response errors, rate limits, parse failures:
   ```bash
   pnpm exec pm2 logs mti-api --lines 200
   pnpm exec pm2 logs webhook-watcher --lines 200
   ```
3. **Failed meeting folders** — files moved out of `raw-transcripts/` on failure:
   ```bash
   ls data/webhook/failed/ data/manual/failed/
   ```
4. **system_errors table** — aggregated error history:
   ```bash
   sqlite3 db/mtninsights.db "SELECT timestamp, error_type, message, meeting_filename FROM system_errors ORDER BY timestamp DESC LIMIT 20;"
   ```

Common causes on a fresh machine: `ANTHROPIC_API_KEY` missing or invalid (→ `api_error`), `MTNINSIGHTS_LLM_PROVIDER` mismatch, or rate-limit throttling (→ `rate_limit`). For verbose LLM output, set `MTNINSIGHTS_LOG_LEVEL=debug` in `.env.local` and `pm2 restart mti-api`.

---

## Utilities (advanced)

| Command | Purpose |
|---------|---------|
| `pnpm process` | Ingest new transcripts from `data/raw-transcripts/` |
| `pnpm query` | CLI query tool (list / search / ask) |
| `pnpm clear` | Wipe all state and restore transcripts for reprocessing |
| `pnpm purge` | Delete DB + vector store only (transcripts untouched) |
| `pnpm manage-auth` | Create/revoke API keys and OAuth clients |

See [docs/cli-admin.md](docs/cli-admin.md) for detailed usage.
