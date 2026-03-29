# CLI Admin Utilities

Standalone Node scripts for bootstrapping, processing, querying, and maintaining the meeting insights pipeline. Every script imports from `core/` directly -- no IPC layer, no HTTP server required. Run them with `pnpm <script>` from the project root.

## Commands

| Script | File | Description |
|--------|------|-------------|
| `pnpm setup` | `setup.ts` | Create SQLite DB, run migrations, seed client registry, create LanceDB tables. When using `local` provider, validates Ollama reachability and auto-pulls the model. Safe to re-run. |
| `pnpm process` | `run.ts` | Ingest new transcripts from both `data/webhook-rawtranscripts/` and `data/raw-transcripts/`. Parses, detects client, extracts artifacts via LLM, embeds, and moves files to `data/processed/`. Pass a folder name as argument to reprocess a single manifest entry. |
| `pnpm query` | `query.ts` | Query the knowledge base in three modes: ask, search, or list. See [Query Tool](#query-tool) below. |
| `pnpm eval` | `eval.ts` | Batch evaluation. Reads questions from `data/eval/questions.json`, runs each through search + answer, writes JSONL results to `data/eval/`. |
| `pnpm assign-client` | `assign-client.ts` | Manually assign a client to one or more meetings. Usage: `pnpm assign-client "<title or ID>" "<client name>"`. Sets confidence to 1.0 with method `manual`. |
| `pnpm all-items-dedupe` | `all-items-dedupe.ts` | Deduplicate action items and other extracted items across meetings. Subcommands: `run` (dedupe) and `clear` (reset associations). Supports `--dry-run`, `--deepscan`, `--last-day`, `--date=`. |
| `pnpm import-external` | `import-external.ts` | Convert non-Krisp transcripts from `data/external-transcripts/` into the Krisp format under `data/raw-transcripts/` with a manifest entry, ready for `pnpm process`. |
| `pnpm purge` | `purge.ts` | Delete data. With a meeting ID: removes that meeting's SQL rows and vectors. Without arguments: deletes the entire DB and vector store. Run `pnpm setup` after a full purge. |
| `pnpm clear` | `reset.ts` | Full reset. Deletes DB and vector store, then moves all files from `data/processed/` and `data/failed-processing/` back to `data/raw-transcripts/` for reprocessing. |
| `pnpm llm:check` | `scripts/llm-check.ts` | Test Ollama connectivity, list models, and run a test prompt. Use to diagnose local LLM issues. |

## Query Tool

Three modes, all sharing the same filter flags.

### Modes

**Ask** -- embed a question, retrieve top-K meetings, synthesize an answer via LLM with citations:

```bash
pnpm query "What decisions were made about the API redesign?"
pnpm query "Who owns the migration task?" --client=Acme --limit=10
```

**Search** -- ranked list of matching meetings with score and summary excerpt:

```bash
pnpm query --search "onboarding flow"
pnpm query --search "auth tokens" --client=Acme --after=2025-06-01
pnpm query --search "deployment" --deepsearch   # LLM relevance filter
```

**List** -- dump structured artifact fields as formatted terminal output (no embedding model or LLM needed):

```bash
pnpm query --list meetings                       # tabular meeting index
pnpm query --list summary --client=Acme          # full summaries
pnpm query --list decisions --after=2025-01-01
pnpm query --list actions --meeting="Sprint"
pnpm query --list features
pnpm query --list questions
pnpm query --list risks
pnpm query --list notes
```

### Filter Flags

| Flag | Description |
|------|-------------|
| `--client=<name>` | Filter to meetings assigned to this client |
| `--meeting=<text>` | Filter by meeting title substring or ID prefix |
| `--after=YYYY-MM-DD` | Include meetings on or after this date |
| `--before=YYYY-MM-DD` | Include meetings on or before this date |
| `--limit=N` | Max results for ask/search modes (default: 6) |
| `--deepsearch` | With `--search`: run LLM relevance filter over vector results |

## Background Service

A pm2-managed watcher that auto-processes webhook payloads as they arrive.

| Script | Description |
|--------|-------------|
| `pnpm service:start` | Start the webhook watcher via pm2 |
| `pnpm service:stop` | Stop the watcher |
| `pnpm service:logs` | Tail watcher logs |
| `pnpm service:status` | Show pm2 process status |

The service watches `data/webhook-rawtranscripts/` for new `.json` files. When a file lands, it debounces (2s default), then runs the full pipeline: parse, ingest, detect client, extract artifacts, embed. Processed files move to `data/webhook-processed/`. The service auto-restarts on crash (up to 10 retries with 5s delay).

Configuration lives in `ecosystem.config.cjs`. The service loads `.env.local` for all environment variables through `shared.ts`.

## Environment Variables

Set these in `.env.local` at the project root.

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | -- | Required for `anthropic` provider (process and ask mode) |
| `MTNINSIGHTS_LLM_PROVIDER` | `anthropic` | LLM backend: `anthropic`, `local`, `claudecli`, `local-claudeapi`, `stub` |
| `MTNINSIGHTS_DB_PATH` | `db/mtninsights.db` | SQLite database file path |
| `MTNINSIGHTS_VECTOR_PATH` | `db/lancedb` | LanceDB vector store directory |
| `MTNINSIGHTS_LOCAL_BASE_URL` | `http://localhost:11434` | Ollama server URL (when provider is `local`) |
| `MTNINSIGHTS_LOCAL_MODEL` | `llama3.1:8b` | Ollama model name (when provider is `local`) |
| `MTNINSIGHTS_CLAUDEAPI_URL` | `http://localhost:8100` | Local Claude API proxy URL (when provider is `local-claudeapi`) |
| `MTNINSIGHTS_CLIENTS_PATH` | `config/clients.json` | Client registry seed file |
| `MTNINSIGHTS_EVAL_QUESTIONS` | `data/eval/questions.json` | Eval question set path |
| `MTNINSIGHTS_EVAL_LIMIT` | `6` | Max results per eval question |
| `MTNINSIGHTS_DEDUP_SEMANTIC_THRESHOLD` | `0.80` | Cosine similarity floor for item dedup |
| `MTNINSIGHTS_DEDUP_STRING_THRESHOLD` | `0.90` | Jaro-Winkler floor for item dedup |
| `MTNINSIGHTS_DEDUP_BATCH_SIZE` | `50` | Max items per priority group for `--deepscan` |

## Common Workflows

### Initial setup and first run

```bash
pnpm install
# Download ONNX model (see root SETUP.md for curl commands)
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
pnpm setup                         # create DB, seed clients, create vector tables
# Place Krisp batch export in data/raw-transcripts/ with manifest.json
pnpm process                       # ingest, extract, embed all new meetings
pnpm query --list meetings         # verify ingestion
```

### Querying after processing

```bash
pnpm query --list summary --client=Acme          # browse summaries
pnpm query --search "deployment timeline"         # find relevant meetings
pnpm query "What are the open risks for launch?"  # LLM-synthesized answer
```

### Webhook-driven continuous processing

```bash
pnpm service:start                 # start watching for webhook payloads
pnpm service:logs                  # verify it picks up new files
pnpm service:status                # check process health
pnpm service:stop                  # stop when done
```

### Reprocessing everything from scratch

```bash
pnpm clear                         # delete DB + vectors, restore transcripts
pnpm setup                         # reinitialize
pnpm process                       # reprocess all meetings
```
