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

## Meeting Intelligence Explorer (UI)

A four-column desktop app for browsing, filtering, and chatting with your meeting knowledge store. Requires meetings already processed via `pnpm process`.

### Launch

```bash
pnpm ui:dev
```

This starts the Electron app with Vite hot-reload for development. The app connects directly to your local SQLite database.

**Note — `ELECTRON_RUN_AS_NODE`:** If this environment variable is set (it is automatically set inside Claude Code's shell), the Electron binary runs as plain Node.js and all Electron APIs are unavailable. The `ui:dev` script already prefixes with `unset ELECTRON_RUN_AS_NODE &&` to handle this. If you launch Electron by any other means and see errors about `app` being undefined, unset this variable first.

**Note — native module ABI:** `better-sqlite3` must be compiled against the Electron Node.js ABI to run inside the app, but against the system Node.js ABI to run tests. The `preui:dev` hook handles the Electron rebuild automatically. After running `pnpm ui:dev`, run `pnpm ui:restore` before running `pnpm test` to rebuild for system Node.

### Layout

```
┌─────────────┬───────────────────┬────────────────────┬─────────────────────┐
│   Clients   │     Meetings      │   Context View     │       Chat          │
│             │                   │                    │                     │
│  All        │ ▼ Mandalore DSU   │ ▼ Mandalore DSU    │  3 meetings ·       │
│  Mandalore  │   ☐ Feb 26        │   Summary: ...     │  12,400 chars       │
│  Revenium   │   ☑ Feb 25        │   Decisions: ...   │                     │
│  TQ         │   ☑ Feb 24        │   Action Items:... │  What risks remain? │
│             │ ▼ Architecture... │                    │  ─────────────────  │
│             │   ☐ Feb 24        │ ▼ Architecture...  │  Based on the       │
│             │                   │   Summary: ...     │  selected meetings, │
│             │                   │                    │  the open risks are │
└─────────────┴───────────────────┴────────────────────┴─────────────────────┘
```

**Column 1 — Clients**: Click to filter all columns to a single client. Click again (or use Reset) to show all clients.

**Column 2 — Meetings**: Grouped by recurring series (DSU, refinement, etc.). Check individual meetings or use "Select all" per group to add them to the chat context. Newest meetings appear first within each group.

**Column 3 — Context View**: Shows the raw structured artifact for every checked meeting, with collapsible sections for Summary, Decisions, Action Items, Open Questions, Risks, Proposed Features, Technical Topics, and Additional Notes. Empty sections are hidden automatically.

**Column 4 — Chat**: Grounded Q&A over the currently selected meetings. The context size indicator shows how many meetings and characters are loaded. Answers cite which meetings they drew from. Previous Q&A pairs accumulate in the session — start a new window to clear history.

### Scope bar

The scope bar above the columns controls what meetings are visible:

- **Client dropdown**: narrows to a single client
- **After / Before date inputs**: date-range filter (ISO format: `2026-02-24`)
- **Reset**: clears all filters and deselects all meetings

### Build for distribution

```bash
pnpm ui:build
```

Compiles the renderer and packages the Electron app into `dist/`.

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

---

## How it works

There are two distinct phases: **ingestion** fills the data stores from raw transcripts, and **querying** reads from those stores to answer questions. The two phases are completely independent — you can query any time without re-running the pipeline.

### System overview

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

### The ingestion pipeline

When you run `pnpm process`, each meeting passes through five sequential steps:

```
  Krisp batch export
  ┌──────────────────────────────────────────────────────────────────────┐
  │  manifest.json ──▶ title, date, meeting_id, folder name             │
  │  meeting-slug/transcript.md ──▶ speaker turns (**Name | MM:SS**)    │
  └───────────────────────────────────────┬──────────────────────────────┘
                                          │
                                          ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Step 1 · parse                                         parser.ts    │
  │                                                                      │
  │  Reads manifest for meeting metadata and transcript.md for turns.   │
  │  Normalises speaker names and timestamps.                            │
  │                                                                      │
  │  output → ParsedMeeting { title, date, participants, turns,         │
  │                           externalId }                               │
  └───────────────────────────────────────┬──────────────────────────────┘
                                          │
                                          ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Step 2 · ingest                                         ingest.ts   │
  │                                                                      │
  │  Writes the meeting row to SQLite. Uses the manifest-provided UUID  │
  │  as the meeting id — guarantees deduplication across re-runs.       │
  │                                                                      │
  │  stores → SQLite: meetings (id, title, date, participants,          │
  │                             raw_transcript, source_filename)         │
  └───────────────────────────────────────┬──────────────────────────────┘
                                          │
                                          ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Step 3 · extract                                      extractor.ts  │
  │                                                                      │
  │  Sends the transcript to Claude using config/prompts/extraction.md. │
  │  Claude returns a structured JSON artifact.                          │
  │                                                                      │
  │  fields extracted:                                                   │
  │    summary · decisions · action_items · open_questions              │
  │    risk_items · proposed_features · technical_topics                │
  │                                                                      │
  │  stores → SQLite: artifacts (one row per meeting, all fields JSON)  │
  └───────────────────────────────────────┬──────────────────────────────┘
                                          │
                                          ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Step 4 · embed                  embedder.ts + meeting-pipeline.ts  │
  │                                                                      │
  │  Concatenates the artifact fields into a single text string, then   │
  │  runs the local all-MiniLM-L6-v2 ONNX model to produce a           │
  │  384-dimensional float32 vector. No API call — fully local.         │
  │                                                                      │
  │  stores → LanceDB: meeting_vectors                                  │
  │           (meeting_id, vector[384], client, meeting_type, date)     │
  └───────────────────────────────────────┬──────────────────────────────┘
                                          │
                                          ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Step 5 · detect client                          client-detection.ts │
  │                                                                      │
  │  Compares meeting participants and title against the clients         │
  │  registry (data/clients/clients.json) and assigns a confidence      │
  │  score based on how the match was made.                              │
  │                                                                      │
  │  stores → SQLite: client_detections                                 │
  │           (meeting_id, client_name, confidence, method)             │
  └──────────────────────────────────────────────────────────────────────┘
```

The file is moved to `data/processed/` on success, or `data/failed-processing/` on any error, with a JSON audit entry written to `data/audit/`.

---

### What gets stored

```
  SQLite: db/mtninsights.db
  ┌────────────────────────────────────────────────────────────────────┐
  │ meetings                      artifacts                            │
  │ ─────────────────────         ──────────────────────────────────  │
  │ id           TEXT PK ◀─┐      meeting_id       TEXT PK  ──▶  ─┐  │
  │ title        TEXT      │      summary          TEXT           │  │
  │ date         TEXT      │      decisions        TEXT (JSON)    │  │
  │ participants TEXT(JSON) │      action_items     TEXT (JSON)    │  │
  │ raw_transcript TEXT    │      open_questions   TEXT (JSON)    │  │
  │                        │      risk_items       TEXT (JSON)    │  │
  │ clients                │      proposed_features TEXT (JSON)   │  │
  │ ──────────────         │      technical_topics TEXT (JSON)    │  │
  │ name  TEXT PK       ◀─┤                                      │  │
  │ aliases     TEXT(JSON)  │      client_detections               │  │
  │ known_parts TEXT(JSON)  │      ────────────────────────────── │  │
  │                        └──    meeting_id   TEXT  ─────────────┘  │
  │                               client_name  TEXT                  │
  │                               confidence   REAL                  │
  │                               method       TEXT                  │
  └────────────────────────────────────────────────────────────────────┘

  LanceDB: db/lancedb/meeting_vectors
  ┌────────────────────────────────────────────────────────────────────┐
  │ meeting_id    VARCHAR      ── links back to SQLite meetings.id    │
  │ vector        FLOAT32[384] ── embedding of the extracted artifact │
  │ client        VARCHAR      ── enables pre-filter by client        │
  │ meeting_type  VARCHAR                                             │
  │ date          VARCHAR      ── enables date-range pre-filter       │
  └────────────────────────────────────────────────────────────────────┘
```

SQLite holds everything human-readable and structured. LanceDB holds only what's needed for similarity search: the vector plus the filter columns that let you narrow the search space before ranking.

---

### Query modes

The three query modes use progressively more of the system:

#### `--list` — structured dumps (SQL only)

```
  pnpm query --client=Mandalore --list summary
  ─────────────────────────────────────────────────────────────────────

  resolveMeetingIds()
      reads SQLite: meetings        (date filter)
      reads SQLite: client_detects  (client filter)
      │
      ▼
  for each matched meeting:
      getMeeting()   ──▶  SQLite: meetings   ──▶  title, date
      getArtifact()  ──▶  SQLite: artifacts  ──▶  all 7 structured fields
      │
      ▼
  formatted console output

  No model loaded. No API calls. Runs in milliseconds.
```

#### `--search` — vector similarity (ONNX, no LLM)

```
  pnpm query --search "API versioning strategy" --client=Mandalore
  ─────────────────────────────────────────────────────────────────────

  loadModel("all-MiniLM-L6-v2.onnx")  ──▶  ONNX runtime  (local, ~2s startup)
      │
      ▼
  embed("API versioning strategy")    ──▶  384-dim float32 vector
      │
      ▼
  searchMeetings(vdb, session, query, { client: "Mandalore", limit: 6 })
      LanceDB: pre-filters rows where client = "Mandalore"
      LanceDB: ranks by cosine similarity to query vector
      returns top-N results with scores
      │
      ▼
  for each result:
      getArtifact() ──▶ SQLite: artifacts ──▶ summary excerpt (first 200 chars)
      │
      ▼
  [0.847]  Mandalore DSU  (2026-02-24)  [Mandalore]
           Covered sprint planning, API versioning...

  No LLM. No API calls after startup.
```

#### Ask mode — natural-language Q&A (ONNX + Claude)

```
  pnpm query "what decisions were made about authentication?" --client=TQ
  ─────────────────────────────────────────────────────────────────────

  loadModel("all-MiniLM-L6-v2.onnx")  ──▶  ONNX runtime  (local, ~2s startup)
      │
      ▼
  embed(question)                     ──▶  384-dim float32 vector
      │
      ▼
  searchMeetings(vdb, session, question, { client: "TQ", limit: 6 })
      LanceDB: pre-filter by client, rank by vector similarity
      returns top-6 most semantically relevant TQ meetings
      │
      ▼
  buildRichContext(db, results)
      for each result: getMeeting() + getArtifact()
      concatenates all 7 fields per meeting into a text block:
        summary · decisions · action items · open questions
        risks · proposed features · technical topics
      │
      ▼
  Anthropic API  (claude-sonnet-4-6)
      system: "Answer based only on the provided meeting notes."
      user:   <rich context>
              "Question: what decisions were made about authentication?"
      │
      ▼
  answer printed to stdout
  "Sources: TQ Architecture (2026-02-25), TQ DSU (2026-02-26)" printed below
```

---

### Client detection

Client detection runs automatically at the end of each meeting's ingestion. It compares meeting data against `data/clients/clients.json` and scores matches by method reliability:

```
  Meeting data
  ┌──────────────────────────────────────────────────────────────┐
  │  participants: [{ email: "alice@mandalore.com" }]            │
  │  title:        "Mandalore Sprint Planning"                   │
  │  raw_transcript: "...Mandalore API roadmap..."               │
  └──────────┬────────────────┬─────────────────┬───────────────┘
             │                │                 │
             ▼                ▼                 ▼
       domain check      alias in          alias in
                         title             transcript

    email domain        "Mandalore"       "Mandalore"
    ∈ known_parts?      ∈ aliases?        ∈ aliases?
       │                    │                 │
    confidence 0.95     confidence 0.50   confidence 0.80
    method "domain"     method "title"    method "transcript"
             │                │                 │
             └────────────────┴─────────────────┘
                              │
                        highest confidence wins
                              │
                              ▼
    client_detections: { "Mandalore", confidence: 0.95, method: "domain" }
```

Confidence tiers:

| Score | Method | Signal |
|---|---|---|
| 0.95 | `domain` | Participant email domain matches `known_participants` |
| 0.80 | `transcript` | Client alias found in the meeting transcript body |
| 0.50 | `title` | Client alias found only in the meeting title |

The `--client=X` filter in all query modes uses `client_name` from `client_detections`, so detection accuracy directly affects which meetings you see. If a meeting is misclassified, you can check `--list meetings` without a client filter to see all meetings and their detected clients.
