# Reference

Environment variables, data directory layout, and config files.

## Environment variables

All configurable via `.env.local`. See `.env.example` for the annotated template.

### LLM provider

| Variable | Default | Purpose |
|----------|---------|---------|
| `MTNINSIGHTS_LLM_PROVIDER` | `anthropic` | `anthropic \| openai \| local \| claudecli \| local-claudeapi \| stub` |
| `ANTHROPIC_API_KEY` | -- | Required when provider=`anthropic` |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` | Override the Claude model |
| `OPENAI_API_KEY` | -- | Required when provider=`openai` |
| `OPENAI_MODEL` | `gpt-4o` | Override the OpenAI model |
| `MTNINSIGHTS_LOCAL_BASE_URL` | `http://localhost:11434` | Ollama endpoint |
| `MTNINSIGHTS_LOCAL_MODEL` | `llama3.1:8b` | Ollama model tag |
| `MTNINSIGHTS_CLAUDEAPI_URL` | `http://localhost:8100` | Local Claude API shim URL |

### LLM token budgets

| Variable | Default | Purpose |
|----------|---------|---------|
| `MTNINSIGHTS_LLM_CHUNK_TOKEN_LIMIT` | `30000` | Max tokens per extraction chunk. Larger = fewer LLM calls, higher per-call cost |
| `MTNINSIGHTS_LLM_MAX_TOKENS_EXTRACT` | `16384` | Max output tokens for extraction calls |
| `MTNINSIGHTS_LLM_MAX_TOKENS_CONVERSE` | `10000` | Max output tokens for chat/converse calls |
| `MTNINSIGHTS_LLM_MAX_TOKENS_DEFAULT` | `8000` | Max output tokens for other LLM calls |

### Storage paths

| Variable | Default | Purpose |
|----------|---------|---------|
| `MTNINSIGHTS_APP_ROOT` | `$PWD` | Base directory for relative paths below |
| `MTNINSIGHTS_DB_PATH` | `db/mtninsights.db` | SQLite database file |
| `MTNINSIGHTS_VECTOR_PATH` | `db/lancedb` | LanceDB vector store directory |
| `MTNINSIGHTS_DATA_DIR` | `data` | Root for operational data (see layout below) |
| `MTNINSIGHTS_MODEL_DIR` | `models` | ONNX model + tokenizer directory |
| `MTNINSIGHTS_CLIENTS_PATH` | `config/clients.json` | Client registry seed file |

### API server

| Variable | Default | Purpose |
|----------|---------|---------|
| `API_PORT` | `3000` | API server port |
| `MTNINSIGHTS_AUTH_ENABLED` | `0` | Set to `1` to require Bearer tokens on all `/api/*` routes |
| `MTNINSIGHTS_OWNER_SECRET` | -- | Required when auth enabled; signs JWTs and gates `/oauth/register` |

### mti CLI

| Variable | Default | Purpose |
|----------|---------|---------|
| `MTI_BASE_URL` | `http://localhost:3000` | Overrides the `baseUrl` in `~/.mtirc` |
| `MTI_TOKEN` | -- | Overrides the `token` in `~/.mtirc` |

### Logging

| Variable | Default | Purpose |
|----------|---------|---------|
| `MTNINSIGHTS_LOG_LEVEL` | `info` | `error \| warn \| info \| debug` |

### Dedup tuning

| Variable | Default | Purpose |
|----------|---------|---------|
| `MTNINSIGHTS_DEDUP_SEMANTIC_THRESHOLD` | `0.80` | Cosine similarity threshold (0-1, higher = stricter) |
| `MTNINSIGHTS_DEDUP_STRING_THRESHOLD` | `0.90` | Jaro-Winkler threshold (0-1, higher = stricter) |
| `MTNINSIGHTS_DEDUP_BATCH_SIZE` | `40` | Max items per LLM deep-dedup batch |
| `MTNINSIGHTS_DEDUP_DEEP` | `0` | Set to `1` to run LLM deep dedup during `pnpm process` |

### Eval harness

| Variable | Default | Purpose |
|----------|---------|---------|
| `MTNINSIGHTS_EVAL_QUESTIONS` | `data/eval/questions.json` | Path to eval question set |
| `MTNINSIGHTS_EVAL_LIMIT` | `6` | Max results per question |

### Webhook alerts (SMTP)

| Variable | Default | Purpose |
|----------|---------|---------|
| `MTNINSIGHTS_SMTP_HOST` | -- | SMTP server for pipeline-failure alerts |
| `MTNINSIGHTS_SMTP_PORT` | `587` | SMTP port |
| `MTNINSIGHTS_SMTP_USER` | -- | SMTP username |
| `MTNINSIGHTS_SMTP_PASS` | -- | SMTP password |
| `MTNINSIGHTS_ALERT_EMAIL` | -- | Recipient for pipeline-failure alerts |

### Dev UI

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_TOKEN` | -- | Bearer token injected into the web dev UI when `AUTH_ENABLED=1` |

## Data directory layout

`MTNINSIGHTS_DATA_DIR` (default `data`) is the root for all operational storage. `setup.sh` scaffolds these subdirectories via `ensureDataDirs()`.

| Path | Purpose |
|------|---------|
| `manual/raw-transcripts/` | Operator drop zone for Krisp batch exports |
| `manual/processed/` | Successfully ingested manual transcripts (moved here after processing) |
| `manual/failed/` | Manual transcripts that failed ingestion |
| `manual/external-transcripts/` | Non-Krisp transcripts (`.txt`, `.vtt`). Run `pnpm import-external` to convert and queue them |
| `webhook/raw-transcripts/` | Incoming transcripts dropped by the webhook watcher (typically a symlink to Google Drive sync) |
| `webhook/processed/` | Webhook transcripts after successful ingestion |
| `webhook/failed/` | Webhook transcripts that failed ingestion |
| `assets/` | File attachments on meetings. Stored as `{meetingId}/{uuid}-{filename}` |
| `audit/` | Extraction audit logs (per-meeting LLM request/response records) |
| `eval/` | Eval harness: `questions.json` config + timestamped `results-*.jsonl` output |

All paths are gitignored. Back up `data/` alongside `db/` and `models/` to preserve state across machines.

## Config files

### `config/clients.json`
Seeded into the `clients` table at startup. Each entry:

```json
{
  "name": "Client Name",
  "is_default": false,
  "aliases": ["alt-name"],
  "meeting_names": ["Weekly with {Client}"],
  "client_team": [{ "name": "Jane", "email": "jane@co.com", "role": "PM" }],
  "implementation_team": [{ "name": "Alex", "email": "alex@xolv.io", "role": "Lead" }],
  "additional_extraction_llm_prompt": "Prefer vendor-specific terminology.",
  "glossary": [{ "term": "MVP", "variants": ["prototype"], "description": "..." }]
}
```

Override path with `MTNINSIGHTS_CLIENTS_PATH`. Re-running `pnpm setup` is idempotent -- existing entries are updated, new ones are added, removed entries are NOT deleted from the database.

### `config/system.json`
Search and chat tuning parameters. Override path with `MTNINSIGHTS_SYSTEM_CONFIG_PATH`.

```json
{
  "search": {
    "maxDistance": 1.7,
    "limit": 50,
    "displayLimit": 20,
    "chatContextLimit": 10
  }
}
```

### `config/chat-guidelines.md`
System-prompt prelude appended to every chat call. Formatting rules, tone, refusal patterns.

### `config/prompts/`
LLM prompt templates with `{{variable}}` placeholders:

- `extraction.md` -- Artifact extraction from transcripts
- `insight-generation.md` -- Executive insight generation
- `deep-search.md` -- Per-meeting relevance scoring
- `thread-evaluation.md` -- Meeting-to-thread relevance
- `dedup-intent.md` -- LLM intent clustering for deep dedup

### `config/chat-templates/`
Output-shape templates selected by `template` parameter in chat requests:

- `jira-ticket.md`
- `jira-epic.md`
- `team-actions.md`
- `thread-discovery.md`
