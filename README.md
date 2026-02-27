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

## Processing meetings

Drop your Krisp batch export folder into `data/raw-transcripts/`. The export should contain a `manifest.json` and one sub-folder per meeting, each with a `transcript.md`.

```bash
pnpm process
```

The pipeline parses each transcript, extracts structured fields (summary, decisions, action items, open questions, risks, proposed features, technical topics) via the Anthropic API, embeds the output with the local ONNX model, and moves processed meetings to `data/processed/`. Failures go to `data/failed-processing/` with an audit entry in `data/audit/`.

The extraction prompt is in `config/prompts/extraction.md` — edit it without touching code.

---

## Querying

### List all meetings

```bash
pnpm query --list meetings
```

Filter by client:

```bash
pnpm query --client=Mandalore --list meetings
```

Filter by date range:

```bash
pnpm query --list meetings --after=2026-02-24 --before=2026-02-26
```

### Get a detailed summary

All stored fields for every Mandalore meeting:

```bash
pnpm query --client=Mandalore --list summary
```

Single meeting by title substring:

```bash
pnpm query --meeting="TQ Architecture" --list summary
```

Single meeting by ID prefix:

```bash
pnpm query --meeting="019c9bc2" --list summary
```

With date range:

```bash
pnpm query --client=TQ --list summary --after=2026-02-25
```

### Focused dumps

Extract only the field you care about. All support `--client`, `--meeting`, `--after`, `--before`.

```bash
pnpm query --client=Mandalore --list decisions
pnpm query --client=TQ --list actions
pnpm query --client=Mandalore --list questions
pnpm query --client=Revenium --list risks
pnpm query --list features --after=2026-02-24
```

### Semantic search (no LLM)

Find meetings relevant to a topic using vector similarity. Returns score, title, client, date, and summary excerpt:

```bash
pnpm query --search "API versioning strategy" --client=Mandalore
pnpm query --search "authentication OAuth design"
pnpm query --search "sprint planning velocity" --limit=4
```

### Ask a question (full Q&A)

Natural-language questions answered using your meeting notes. Runs semantic search, builds rich context from all stored fields, and calls Claude:

```bash
pnpm query "what open risks remain for TQ?" --client=TQ
pnpm query "what action items does Wesley own?" --after=2026-02-24
pnpm query "summarise Mandalore decisions this week" --client=Mandalore --limit=8
pnpm query "which meetings covered OAuth or authentication?"
```

The response includes a `Sources:` line listing the meetings used to answer.

---

## Reset

Wipe all state and move processed/failed transcripts back to `data/raw-transcripts/` for reprocessing:

```bash
pnpm reset
```

---

## Transcript format

Krisp batch exports create a folder structure like:

```
data/raw-transcripts/
├── manifest.json
├── meeting-slug-019c9061.../
│   └── transcript.md
└── another-meeting-019c906f.../
    └── transcript.md
```

`manifest.json` maps meeting IDs to folders and provides titles and dates. `transcript.md` contains speaker turns in bold-header markdown format (`**Speaker Name | MM:SS**`).

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Required for `pnpm process` and ask mode |
| `MTNINSIGHTS_DB_PATH` | `db/mtninsights.db` | SQLite database path |
| `MTNINSIGHTS_VECTOR_PATH` | `db/lancedb` | LanceDB vector store path |
