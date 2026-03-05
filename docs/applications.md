# Applications Reference

Detailed operational guide for each utility in krisp-meeting-insights. See the main [README](../README.md) for system overview and setup.

---

## Processing Pipeline (`pnpm process`)

The processing pipeline ingests raw Krisp transcript exports from `data/raw-transcripts/`, runs each meeting through a five-step sequence (parse, ingest, extract, embed, detect), and writes all results to SQLite and LanceDB. Already-processed meetings are skipped automatically. Each run produces a timestamped JSON log under `logs/`. The pipeline requires an Anthropic API key (or a configured local LLM) because it calls Claude to extract structured summaries from the transcript text.

### Ingestion pipeline steps

```
┌─────────────────────────────────────────────────────────────────┐
│                        pnpm process                             │
│                                                                 │
│  data/raw-transcripts/                                          │
│  ┌─────────────────────────────────┐                           │
│  │ manifest.json                   │                           │
│  │ meeting-slug-019c.../           │                           │
│  │   └── transcript.md            │                           │
│  └───────────────┬─────────────────┘                           │
│                  │                                              │
│         ┌────────▼────────┐                                    │
│         │  1. parse       │  parseKrispFolder / parseKrispFile │
│         │                 │  extract title, date, participants, │
│         │                 │  speaker turns from markdown        │
│         └────────┬────────┘                                    │
│                  │                                              │
│         ┌────────▼────────┐                                    │
│         │  2. ingest      │  insert into meetings table        │
│         │                 │  deduplicated by source_filename   │
│         └────────┬────────┘                                    │
│                  │                                              │
│         ┌────────▼────────┐                                    │
│         │  3. extract     │  Claude API (or local LLM)         │
│         │                 │  → summary, decisions, actions,    │
│         │                 │    features, questions, risks,     │
│         │                 │    technical_topics, notes         │
│         │                 │  stored in artifacts table         │
│         └────────┬────────┘                                    │
│                  │                                              │
│         ┌────────▼────────┐                                    │
│         │  4. embed       │  all-MiniLM-L6-v2 (ONNX, local)   │
│         │                 │  384-dim L2-normalized vector      │
│         │                 │  stored in LanceDB meeting_vectors │
│         └────────┬────────┘                                    │
│                  │                                              │
│         ┌────────▼────────┐                                    │
│         │  5. detect      │  match against clients registry    │
│         │                 │  participant domains, aliases,     │
│         │                 │  meeting name tokens, speaker names│
│         │                 │  stored in client_detections table │
│         └─────────────────┘                                    │
│                                                                 │
│  On success → data/processed/                                   │
│  On failure → data/failed-processing/  +  data/audit/          │
└─────────────────────────────────────────────────────────────────┘
```

### What gets stored

**SQLite** (`db/mtninsights.db`):

```
meetings
  id               TEXT  PRIMARY KEY   (UUID derived from transcript)
  title            TEXT                (meeting title from filename or manifest)
  meeting_type     TEXT
  date             TEXT                (ISO 8601)
  participants     TEXT                (JSON array of {first_name, last_name, email, id})
  raw_transcript   TEXT                (full original file content)
  source_filename  TEXT  UNIQUE        (prevents re-ingestion)
  created_at       TEXT

artifacts
  meeting_id       TEXT  PRIMARY KEY   → meetings.id
  summary          TEXT
  decisions        TEXT                (JSON array of strings)
  proposed_features TEXT               (JSON array of strings)
  action_items     TEXT                (JSON array of {description, owner, due_date})
  technical_topics TEXT                (JSON array of strings)
  open_questions   TEXT                (JSON array of strings)
  risk_items       TEXT                (JSON array of strings)
  additional_notes TEXT                (JSON array of note groups, DEFAULT '[]')
  needs_reextraction INTEGER DEFAULT 0

clients
  name             TEXT  PRIMARY KEY
  aliases          TEXT                (JSON array)
  known_participants TEXT              (JSON array)
  meeting_names    TEXT                (JSON array, DEFAULT '[]')
  refinement_prompt TEXT               (optional client-specific extraction context)

client_detections
  meeting_id       TEXT  → meetings.id
  client_name      TEXT  → clients.name
  confidence       REAL                (0.5 – 1.0)
  method           TEXT                (e.g. "participant+alias", "manual")

clusters
  cluster_id       TEXT  PRIMARY KEY
  generated_tags   TEXT
  centroid_snapshot TEXT
  updated_at       TEXT

meeting_clusters
  meeting_id       TEXT  → meetings.id
  cluster_id       TEXT  → clusters.cluster_id
```

**LanceDB** (`db/lancedb/`):

```
meeting_vectors
  id               STRING              (meeting UUID)
  vector           FIXED_SIZE_LIST     (384 float32 values, L2-normalized)
  client           STRING
  meeting_type     STRING              (meeting title)
  date             STRING              (ISO 8601)
```

### Transcript format

Krisp exports come in two shapes. The pipeline supports both.

**Folder-based export** (current, preferred):

```
data/raw-transcripts/
  manifest.json
  AppDev Leads DSU-019c9bc2.../
    transcript.md
  AppDev Leads DSU-a3f12e01.../
    transcript.md
```

`manifest.json` lists all meetings with their `meeting_id`, `meeting_title`, `meeting_date`, and `meeting_files`. The pipeline reads this first. Each folder's `transcript.md` uses markdown formatting with a `# Transcript` section header and speaker turns formatted as `**Name | HH:MM**`.

**Legacy flat-file export** (used by tests and older exports):

```
data/raw-transcripts/
  2024-03-15T14:00:00.000Z AppDev Leads DSU.txt
  2024-03-22T14:00:00.000Z AppDev Weekly Demo.txt
```

Each file begins with an `Attendance:` block (JSON-like participant records) followed by a `Transcript:` delimiter. Speaker turns are plain-text lines formatted as `Name | HH:MM`.

---

## Query CLI (`pnpm query`)

The query CLI reads from the SQLite database and LanceDB vector store to list, search, and answer questions about processed meetings. It operates in three distinct modes depending on the flags provided.

### List all meetings

```bash
pnpm query --list meetings
```

Prints a tabular list of all meetings with ID, title, date, client, and detection confidence. No model required.

Filter examples:

```bash
# Filter by client
pnpm query --list meetings --client=LLSA

# Filter by date range
pnpm query --list meetings --after=2024-01-01 --before=2024-06-30

# Filter by title substring or ID prefix
pnpm query --list meetings --meeting="AppDev Leads"

# Combine filters
pnpm query --list meetings --client=LLSA --after=2024-03-01
```

### Get a detailed summary

```bash
pnpm query --list summary
pnpm query --list summary --client=LLSA
pnpm query --list summary --meeting="AppDev Leads DSU"
```

Prints the full extracted artifact for each matching meeting: summary, decisions, proposed features, action items, technical topics, open questions, and risks.

### Focused dumps

Dump a single field across all (or filtered) meetings:

```bash
pnpm query --list decisions
pnpm query --list actions
pnpm query --list features
pnpm query --list questions
pnpm query --list risks
pnpm query --list notes

# Scoped
pnpm query --list actions --client=LLSA --after=2024-03-01
```

Each of these prints only the named field from each meeting artifact, grouped under a meeting header. Meetings with no entries for that field are silently skipped.

### Hybrid search (no LLM)

```bash
pnpm query --search "authentication token refresh"
pnpm query --search "DLQ dead letter queue" --client=LLSA
pnpm query --search "Recurly Commerce" --limit=10
```

Runs a hybrid search combining multi-table vector search with FTS5 keyword matching:

1. **Multi-table vector search** — embeds the query with the local ONNX model, then searches three LanceDB tables in parallel (`meeting_vectors`, `feature_vectors`, `item_vectors`). This finds meetings where the query is semantically similar to the summary, a proposed feature, or an action item/decision/risk.
2. **FTS5 keyword search** — runs a full-text search on `artifact_fts` (SQLite FTS5 with porter stemming). This catches exact keyword/acronym matches (e.g. "DLQ", "Recurly") that tokenize poorly in the embedding model.
3. **Reciprocal Rank Fusion** — merges the two ranked lists using RRF (`score = Σ 1/(k + rank)`), producing a single relevance-ordered result set.

Does not call Claude or any external API. Requires the ONNX model files.

### Ask a question (full Q&A)

```bash
pnpm query "What decisions were made about the authentication system?"
pnpm query "Who owns the deployment pipeline task?" --client=LLSA
pnpm query "What are the outstanding risks for the API project?" --after=2024-01-01 --limit=8
```

Embeds the question, finds the most relevant meetings via KNN search, assembles their artifacts into a labeled context block, and sends it to Claude with the question. Cites source meetings as [M1], [M2], etc. in the response. Requires `ANTHROPIC_API_KEY` in `.env.local`.

The `--limit` flag controls how many meetings are retrieved from the vector search for context (default: 6).

### Query mode flow diagrams

```
--list mode
───────────
  args → resolveMeetingIds()
            │
            ├─ filter by --client (client_detections JOIN)
            ├─ filter by --after / --before (date range)
            └─ filter by --meeting (title substring or ID prefix)
            │
            ▼
         printMeetingsList / printSummary / printField / printNotes
            │
            ▼
         stdout (no model loaded)


--search mode (hybrid)
─────────────────────
  query string
       │
       ▼
  loadModel()  ←  models/all-MiniLM-L6-v2.onnx
       │           models/tokenizer.json
       ▼
  embed(query)  →  384-dim vector
       │
       ├──────────────────────────────────┐
       ▼                                  ▼
  searchMeetingsByVector()          searchFts(db, query)
  searchFeaturesByVector()          ← SQLite FTS5 (bm25)
  searchSimilarItemsByVector()
  ← LanceDB KNN (3 tables)
       │                                  │
       └──────────┬───────────────────────┘
                  ▼
       reciprocalRankFusion()
                  │
                  ▼
       enrichFromDb() → metadata (client, type, date)
                  │
                  ▼
       ranked results  →  stdout
       [score]  title  (date)  [client]
                summary excerpt


ask mode
────────
  question string
       │
       ▼
  loadModel() + embed(question)
       │
       ▼
  searchMeetings()  →  top-N meetings
       │
       ▼
  buildLabeledContext()
       │  for each result:
       │    ## [M1] Title  (date)
       │    Summary: ...
       │    Decisions: ...
       │    Action items: ...
       │    ...
       ▼
  Claude API  (claude-sonnet or configured model)
       │  system: "Answer based only on provided meeting notes. Cite [M1] etc."
       ▼
  answer  →  stdout
  Sources: Meeting Title (date), ...
```

---

## Meeting Intelligence Explorer (`pnpm ui:dev`)

> The desktop app requires meetings already processed via `pnpm process` and a SQLite database at the path configured in `.env.local`.

The Meeting Intelligence Explorer is an Electron desktop app that provides a visual interface for browsing, filtering, and querying processed meetings. It runs a renderer (React + Vite) and a main process (Node.js) that communicates over IPC. The main process loads the SQLite database, initializes the LanceDB vector store, and handles all data access — the renderer has no direct DB access.

### Launch

```bash
pnpm ui:dev
```

If Electron fails to start with an ONNX-related error in dev mode, prefix with:

```bash
ELECTRON_RUN_AS_NODE=0 pnpm ui:dev
```

The app window opens at 1400x900 with a dark background. The main process prints the resolved `APP_ROOT`, `DB_PATH`, `VECTOR_PATH`, and `PROVIDER` to the terminal on startup — useful for diagnosing path issues.

### Layout

The app is a horizontal four-column panel layout, all columns resizable by dragging the separators.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Scope:  [Client ▾]  From [date]  to [date]  [Search…]   [Reset]  [theme]        │
├─────────────┬──────────────────────┬────────────────────────┬────────────────────┤
│   CLIENTS   │      MEETINGS        │       CONTEXT          │       CHAT         │
│             │                      │                        │                    │
│ • All       │  ▸ Series Group A    │  Meeting Title         │  [question input]  │
│ • LLSA      │    □ Meeting 1       │  ────────────────────  │                    │
│ • Revenium  │    □ Meeting 2       │  Summary               │  Answer text with  │
│ • ...       │  ▸ Series Group B    │  ...                   │  citations [M1]    │
│             │    □ Meeting 3       │                        │                    │
│             │    ...               │  Decisions             │  Sources:          │
│             │                      │  • ...                 │  Meeting A, ...    │
│             │                      │                        │                    │
│             │                      │  Action Items          │                    │
│             │                      │  • [owner] ...         │                    │
└─────────────┴──────────────────────┴────────────────────────┴────────────────────┘
```

**Clients column** — lists all client names from the registry. Click a client to scope the meetings list to that client. The selection propagates to all other columns and to the chat context.

**Meetings column** — shows meetings grouped by normalized series name (meeting title with whitespace normalized). Each meeting shows its title, date, and client tag. Check individual meetings to pin them into the context. If nothing is checked, the entire scoped list is used as context.

**Context column** — renders the extracted artifact for every meeting in the active context: summary, decisions, proposed features, action items, technical topics, open questions, risks, and additional notes. Can be collapsed to a thin icon bar to give more room to the chat panel.

**Chat column** — a conversational Q&A interface. The active context (all checked meetings, or the full scoped list) is assembled into a labeled prompt and sent to Claude with each question. Responses include [M1]-style citations. The context size (meeting count and character count) is shown above the input.

### Scope bar

The scope bar at the top of the window controls the global filter state:

- **Client dropdown** — filters meetings by client assignment. Selecting a client also constrains semantic searches to that client.
- **From / to date pickers** — narrow the meetings list to a date window.
- **Search field** — runs a live hybrid search as you type, combining multi-table vector search with FTS5 keyword matching. Supports natural language queries ("when did we discuss billing") and exact keyword/acronym matches ("DLQ", "Recurly"). Results appear in a dropdown; selecting a result pins those meetings into the active selection and clears the date/client scope.
- **Reset button** — clears all filters and selections, returning to the full unfiltered view.
- **Theme button** — cycles through available themes (Deep Sea, Daylight, Midnight).

### Build for distribution

```bash
pnpm ui:build
```

Compiles the renderer and packages the Electron app into `dist/`.

---

## HTTP API (`http://localhost:9988`)

The embedded HTTP API server runs alongside the Electron app and is also accessible independently once the app is launched. It exposes all meeting data over standard HTTP, enabling scripts, external clients, and future web or mobile interfaces.

**Default port**: `9988` (configurable via `MTNINSIGHTS_API_PORT` in `.env.local`)

### Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Returns `{ ok: true }` |
| `GET` | `/api/debug` | Returns DB paths and record counts — useful for diagnosing data issues |
| `GET` | `/api/clients` | List all client names |
| `GET` | `/api/meetings` | List meetings (filters: `?client=&after=&before=`) |
| `GET` | `/api/meetings/:id/artifact` | Structured artifact for a single meeting |
| `POST` | `/api/chat` | Natural-language Q&A (body: `{ meetingIds, question }`) |
| `GET` | `/api/search` | Hybrid search — vector + FTS5 keyword (params: `?q=&client=&limit=`) |

### Diagnostic endpoint

If the desktop app shows no data, verify the database is found:

```bash
curl http://localhost:9988/api/debug
# → { "APP_ROOT": "...", "DB_PATH": "...", "clientCount": 4, "meetingCount": 17 }
```

If `clientCount` is 0, the app is opening a fresh database at the wrong path. Fix by adding an absolute path to `.env.local`:

```
MTNINSIGHTS_DB_PATH=/absolute/path/to/krisp-meeting-insights/db/mtninsights.db
```

---

## Client Management

### Detection confidence tiers

The client detection step runs automatically during `pnpm process`. It scores each meeting against all registered clients using a combination of signals:

| Confidence | Method | Signals used |
|------------|--------|--------------|
| `0.95` | `participant+alias` | Known participant email/domain AND alias found in title or transcript |
| `0.95` | `participant+meeting_name` | Known participant AND meeting title tokens match a `meeting_names` entry |
| `0.95` | `participant+alias+meeting_name` | All three signals present |
| `0.95` | `speaker_name+alias` | Speaker name in transcript matches a `known_participants` name entry AND alias matches |
| `0.8` | `participant` | Known participant email/domain only (no alias or meeting name match) |
| `0.8` | `speaker_name` | Speaker name in transcript matches a `known_participants` name entry |
| `0.7` | `meeting_name` | Meeting title tokens match a `meeting_names` entry (no participant signal) |
| `0.7` | `meeting_name+alias` | Meeting name AND alias match (no participant signal) |
| `0.5` | `alias` | Alias string found in title or transcript body only |
| `1.0` | `manual` | Set explicitly via `pnpm assign-client` |

Multiple detections can be stored for a single meeting; queries and the UI use the highest-confidence detection.

### Client registry (`data/clients/clients.json`)

Each client entry supports the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Canonical client name (used in all filters and displays) |
| `aliases` | string[] | Strings matched against meeting title and transcript text |
| `known_participants` | string[] | Email domains (`@client.com`), email addresses, or plain names matched against participant attendance and speaker names in the transcript |
| `meeting_names` | string[] | Recurring meeting series names — matched against the meeting title via token intersection (handles folder-derived titles like `appdev_leads_dsu-019c...`) |
| `refinement_prompt` | string? | Client-specific context injected into the extraction prompt (e.g. "Jeff is the head client. His direction has highest weight.") |

Example entry:

```json
{
  "name": "LLSA",
  "aliases": ["Mandalore", "LLSA", "llsa"],
  "known_participants": [
    "@llsa.com",
    "antonio.falcao@xolv.io",
    "Yoelvis"
  ],
  "meeting_names": [
    "AppDev Leads DSU",
    "AppDev - Weekly Demo",
    "Architecture Solutioning"
  ],
  "refinement_prompt": "Stace is the CTO for the client. Action items and direction from Stace are high-priority explicit instructions."
}
```

### Manual assignment (`pnpm assign-client`)

When auto-detection misses or misclassifies a meeting, override it:

```bash
pnpm assign-client "AppDev Leads DSU" "LLSA"
pnpm assign-client "019c9bc2" "LLSA"    # by meeting ID prefix
```

The script matches by exact meeting ID or title substring, replaces any existing detection with confidence `1.0` and method `manual`. If multiple meetings match the title substring, all are updated.
