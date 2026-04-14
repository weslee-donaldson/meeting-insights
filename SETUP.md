# krisp-meeting-insights -- Setup

Transform Krisp meeting transcripts into a searchable, semantically clustered knowledge fabric.

---

## Quick Start

```bash
git clone <repo-url>
cd krisp-meeting-insights
./setup.sh
```

Then edit `.env.local` and set your `ANTHROPIC_API_KEY`, then:

```bash
pm2 start ecosystem.config.cjs   # starts mti-api + webhook-watcher
pnpm web:dev                      # launches the web UI
```

That's it. Re-run `./setup.sh` any time; it's idempotent.

---

## Prerequisites

- **Node.js 22+** (`brew install node@22` on macOS)
- **pnpm** (`npm install -g pnpm`)
- **PM2** for service management (`npm install -g pm2`)
- An **Anthropic API key** (or OpenAI / local Ollama -- see LLM providers below)

---

## What setup.sh does

1. Verifies Node 22+ and pnpm are installed
2. Runs `pnpm install`
3. Copies `.env.example` to `.env.local` (if missing)
4. Downloads the ONNX embedding model (`all-MiniLM-L6-v2`, ~90 MB) with SHA256 verification
5. Runs database migrations (creates SQLite + LanceDB stores)

All steps are idempotent -- safe to re-run after pulling updates.

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

### 4. Initialize the database
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
```bash
pm2 start ecosystem.config.cjs   # start both mti-api and webhook-watcher
pm2 status                        # check running services
pm2 logs                          # tail logs
pm2 restart mti-api               # restart just the API
pm2 stop all                      # stop everything
```

### Web UI
```bash
pnpm web:dev   # serves on http://localhost:5188
```

Requires `mti-api` running (either via PM2 or `pnpm api:dev`).

### Electron desktop app
```bash
pnpm ui:dev    # launches the desktop app
```

### CLI (mti)
```bash
pnpm mti clients list
pnpm mti meetings list Acme
pnpm mti items list Acme
pnpm mti items complete <short_id1> <short_id2>
```

---

## Environment variables

All configurable in `.env.local`. See `.env.example` for the full annotated list.

| Variable | Default | Purpose |
|----------|---------|---------|
| `ANTHROPIC_API_KEY` | — | Required when `LLM_PROVIDER=anthropic` |
| `MTNINSIGHTS_LLM_PROVIDER` | `anthropic` | `anthropic \| openai \| local \| claudecli \| stub` |
| `MTNINSIGHTS_DB_PATH` | `db/mtninsights.db` | SQLite path |
| `MTNINSIGHTS_VECTOR_PATH` | `db/lancedb` | LanceDB path |
| `PORT` | `3000` | API server port |
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

## Troubleshooting

**Model download fails**
The download pulls ~90 MB from Hugging Face. Retry `pnpm download-models` -- it will verify hashes and resume any missing files.

**Missing API key errors**
Check `.env.local` exists and `ANTHROPIC_API_KEY` is set. Restart `mti-api` after edits: `pm2 restart mti-api`.

**Port 3000 already in use**
Change `PORT` in `.env.local`, then `pm2 restart mti-api`.

**Database errors after pulling updates**
Run `pnpm setup` to apply pending migrations. Check `schema_version` in the DB to see the current version.

**PM2 services won't start**
`pm2 logs mti-api --err --lines 50` shows the last errors. Common causes: missing env vars, models not downloaded, port conflict.

---

## Utilities (advanced)

| Command | Purpose |
|---------|---------|
| `pnpm process` | Ingest new transcripts from `data/raw-transcripts/` |
| `pnpm query` | CLI query tool (list / search / ask) |
| `pnpm clear` | Wipe all state and restore transcripts for reprocessing |
| `pnpm purge` | Delete DB + vector store only (transcripts untouched) |
| `pnpm manage-auth` | Create/revoke API keys and OAuth clients |

See [docs/applications.md](docs/applications.md) for detailed usage.
