# Admin CLI (pnpm scripts)

Operational scripts that talk to the database directly (no HTTP layer). These are for setup, batch processing, maintenance, and one-off tasks. The user-facing CLI for day-to-day queries is [mti](cli.md).

## Setup and bootstrap

### `pnpm setup`
First-time initialization. Creates the SQLite database, LanceDB vector store, scaffolds all `data/` subdirectories, seeds clients from `config/clients.json`, and applies any pending migrations. Safe to re-run.

Reads: `MTNINSIGHTS_DB_PATH`, `MTNINSIGHTS_VECTOR_PATH`, `MTNINSIGHTS_DATA_DIR`, `MTNINSIGHTS_CLIENTS_PATH`, `MTNINSIGHTS_LLM_PROVIDER` (validates Ollama when `local`).

### `pnpm download-models`
Downloads the ONNX embedding model and tokenizer (~90 MB total) with SHA256 verification. Skips files already present with the correct hash.

### `./setup.sh`
Orchestrates the full first-run: checks prerequisites, runs `pnpm install`, copies `.env.example` to `.env.local` if missing, runs `pnpm download-models` and `pnpm setup`, and prompts whether to run `pnpm link --global` for the `mti` CLI.

## Ingestion

### `pnpm process [folder-name]`
Run the full ingestion pipeline. Processes webhook files first (from `data/webhook/raw-transcripts/`), then manual files (from `data/manual/raw-transcripts/`).

> **Note:** When `webhook-watcher` is running under PM2, manual folders are auto-processed 60s after they go quiet (see [docs/webhook.md](webhook.md)). `pnpm process` is mainly useful for one-off folder reprocessing (`pnpm process <folder-name>`) or for environments where PM2 isn't running.

With an optional folder name, reprocesses only that meeting (purges existing DB rows, removes from `data/manual/processed/`, runs pipeline). Useful for iterating on extraction prompts.

Pipeline steps per meeting: parse, ingest, detect client, extract artifact, reconcile milestones, rebuild FTS, dedup items, embed, evaluate threads. See [core.md](core.md) for details.

Flags: none. Env vars: `MTNINSIGHTS_LLM_PROVIDER`, `ANTHROPIC_API_KEY`, `MTNINSIGHTS_DEDUP_DEEP=1` (optional LLM deep dedup per client), SMTP alert vars.

### `pnpm import-external`
Import non-Krisp transcripts (plain `.txt`, `.vtt`) from `data/manual/external-transcripts/`. Each file is parsed, renamed to Krisp format, and moved into `data/manual/raw-transcripts/` with a new manifest entry. After import, run `pnpm process` to run them through the pipeline.

### `pnpm to-webvtt <source>`
Convert a plain-text transcript to WebVTT format.

## Reset and cleanup

### `pnpm clear`
Wipe all processing state: deletes the SQLite database, LanceDB store, and restores files from `data/manual/processed/` and `data/manual/failed/` back to `data/manual/raw-transcripts/`. Keeps the `.env.local`, config files, and models.

### `pnpm purge [<meetingId>]`
Without arguments: deletes the SQLite database and LanceDB store (but does NOT move transcripts). Use when you want to reprocess everything without losing the transcript files' processed/failed state.

With a meeting ID: removes just that meeting from the DB and vector store.

## Query and search

### `pnpm query <mode> [args]`
Direct SQL/vector query from the command line. Modes:

- `pnpm query list <entity> [flags]` -- Dump structured artifact fields as formatted terminal output (no embedding model or LLM). `<entity>` is one of `meetings`, `summary`, `decisions`, `actions`, `features`, `questions`, `risks`, `notes`.
- `pnpm query search <query> [flags]` -- Hybrid semantic + FTS search with ranked results. Add `--deepsearch` to run an LLM relevance filter over vector results.
- `pnpm query ask <question> [flags]` -- Embed the question, retrieve top-K meetings, and synthesize an answer via LLM with citations.

Shared filter flags across all modes: `--client=<name>`, `--meeting=<title-or-id-prefix>`, `--after=YYYY-MM-DD`, `--before=YYYY-MM-DD`, `--limit=<n>` (default 6).

For richer interactions, use the [mti](cli.md) CLI or the web UI.

## Common workflows

### First run

```bash
pnpm install
pnpm download-models              # ONNX model + tokenizer
cp .env.example .env.local        # add ANTHROPIC_API_KEY
pnpm setup                        # create DB, seed clients, create vector tables
# Drop Krisp batch export into data/manual/raw-transcripts/
pnpm process                      # ingest, extract, embed
pnpm query list meetings          # verify
```

### Continuous webhook ingestion

```bash
pnpm service:start                # start the watcher
pnpm service:logs                 # tail activity
pnpm service:stop                 # stop when done
```

### Reprocess everything

```bash
pnpm clear                        # delete DB + vectors, restore transcripts
pnpm setup
pnpm process
```

## Eval harness

### `pnpm eval`
Run canned queries from `data/eval/questions.json` through the configured LLM and write per-result metrics to `data/eval/results-{provider}-{timestamp}.jsonl`. Useful as a health check after provider changes and for side-by-side comparisons (`stub` vs `local` vs `anthropic`).

Edit `data/eval/questions.json` to add your own queries. Each entry is `{ "question": "...", "client": "optional client name" }`.

Env vars: `MTNINSIGHTS_EVAL_QUESTIONS` (override path), `MTNINSIGHTS_EVAL_LIMIT` (cap per question, default 6).

### `pnpm llm:check`
Quick sanity check that the configured LLM provider responds. Prints the raw response.

### `pnpm test-ollama`
(Run via `tsx cli/admin-util/test-ollama.ts` -- no pnpm alias.) Probe the configured Ollama endpoint and list available models.

## Client and action item management

### `pnpm assign-client <meeting-title-or-id-prefix> <client>`
Manually override client detection for a meeting. Sets confidence to `1.0` (highest tier).

### `pnpm all-items-dedupe`
Run deep dedup (LLM intent clustering) across all clients' action items. Complement to the per-meeting dedup that runs automatically during ingestion.

Flags:
- `--semantic-threshold <0-1>` (default `0.80`)
- `--string-threshold <0-1>` (default `0.90`)
- `--batch-size <n>` (default `40`)
- `--priority <critical|normal|low>` -- Process only items at or above this tier
- `--deep` -- Enable LLM intent clustering (otherwise pure semantic + string)

## Auth management

### `pnpm manage-auth <subcommand>`
Used when `MTNINSIGHTS_AUTH_ENABLED=1`. Requires `MTNINSIGHTS_OWNER_SECRET`.

Subcommands:
- `create-client --name <n> --scopes <csv> [--grant-types <csv>] [--redirect-uris <csv>]` -- Register an OAuth client
- `list-clients`
- `revoke-client <client_id>`
- `create-api-key --name <n> --scopes <csv>` -- Prints an `mki_...` token (only shown once)
- `list-api-keys`
- `revoke-api-key <key_prefix>`

## Services (PM2)

### `pnpm service:start` / `pnpm service:stop` / `pnpm service:logs` / `pnpm service:status`
Manage the webhook watcher service (`local-service/`). See [webhook.md](webhook.md).

### `pnpm api:start` / `pnpm api:stop` / `pnpm api:restart` / `pnpm api:logs`
Manage the API server via PM2. Equivalent to `pm2 <cmd> mti-api`.

### `pm2 start ecosystem.config.cjs`
Brings up both `mti-api` and `webhook-watcher` in one command.

## Development

### `pnpm test`
Run the full vitest suite (~2650 tests, ~15s).

### `pnpm test:e2e`
Run Playwright end-to-end tests.

### `pnpm api:dev`
Start the API server in foreground (useful for debugging). Port 3000 by default.

### `pnpm web:dev`
Start the web UI (port 5188). Requires the API running.

### `pnpm ui:dev`
Launch the Electron desktop app.

### `pnpm ui:build`
Build the Electron app for distribution.
