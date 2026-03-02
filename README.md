# krisp-meeting-insights

Transform Krisp meeting transcripts into a searchable, semantically clustered knowledge fabric. Process batch exports, extract structured summaries, embed them with a local ONNX model, and query across meetings with natural-language questions.

---

## Prerequisites

- Node.js 21+
- pnpm
- ONNX model files (see Setup)
- Anthropic API key (only required for ask mode — not for `--list` or `--search`)

---

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Download the embedding model

```bash
mkdir -p models
# Download all-MiniLM-L6-v2 ONNX model and tokenizer
curl -L -o models/all-MiniLM-L6-v2.onnx \
  https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx
curl -L -o models/tokenizer.json \
  https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json
```

### 3. Configure your API key

Create `.env.local` in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Initialize the database

```bash
pnpm setup
```

This creates the SQLite DB, LanceDB vector store, and seeds the client registry. Safe to re-run.

---

## Utilities

| Command | Description |
|---------|-------------|
| `pnpm setup` | Initialize database, vector store, and seed client registry |
| `pnpm process` | Ingest new transcripts from `data/raw-transcripts/` |
| `pnpm query` | Query meetings from the CLI (list, search, ask) |
| `pnpm assign-client` | Manually assign a meeting to a client |
| `pnpm clear` | Wipe all state and reset transcripts for reprocessing |
| `pnpm ui:dev` | Launch the Meeting Intelligence Explorer desktop app |
| `pnpm ui:build` | Build the Electron app for distribution |

See [docs/applications.md](docs/applications.md) for detailed usage of each utility.

---

## How it works

There are two distinct phases: **ingestion** fills the data stores from raw transcripts, and **querying** reads from those stores to answer questions. The two phases are completely independent — you can query any time without re-running the pipeline.

```
  Krisp batch export
  ┌──────────────────────┐
  │ manifest.json        │
  │ meeting-slug-019c.../│    pnpm process
  │   └── transcript.md  │──────────────────────────────────────────────────▶
  └──────────────────────┘       │
                                 │   parse → ingest → extract → embed → detect
                                 │             (parser)   (extractor)  (client)
                                 │                         Claude API
                                 │                          ONNX model
                                 │
                       ┌─────────▼────────┐        ┌───────────────────────┐
                       │     SQLite       │        │       LanceDB         │
                       │  db/mtninsights  │        │     db/lancedb/       │
                       │                 │        │                       │
                       │ meetings        │        │  meeting_vectors      │
                       │ artifacts       │        │  (384-dim embeddings) │
                       │ clients         │        │                       │
                       │ client_detect.  │        └───────────┬───────────┘
                       └────────┬────────┘                    │
                                │                             │
                       ┌────────▼─────────────────────────────▼──────────┐
                       │                 pnpm query                       │
                       │                                                  │
                       │  --list  ──────────▶  SQL only  (no model)      │
                       │  --search ─────────▶  embed query → LanceDB     │
                       │  ask ──────────────▶  embed → search → Claude   │
                       └──────────────────────────────────────────────────┘
```

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Required for `pnpm process` and ask mode |
| `MTNINSIGHTS_DB_PATH` | `db/mtninsights.db` | SQLite database path |
| `MTNINSIGHTS_VECTOR_PATH` | `db/lancedb` | LanceDB vector store path |
| `MTNINSIGHTS_API_PORT` | `9988` | HTTP API server port |
