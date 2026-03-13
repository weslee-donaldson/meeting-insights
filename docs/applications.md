# Applications Reference

Detailed operational guide for each utility in krisp-meeting-insights. See the main [README](../README.md) for system overview and setup.

---

## Processing Pipeline (`pnpm process`)

The processing pipeline ingests raw Krisp transcript exports from `data/raw-transcripts/`, runs each meeting through a six-step sequence (parse, ingest, extract, embed, detect, dedup), and writes all results to SQLite and LanceDB. Already-processed meetings are skipped automatically. Each run produces a timestamped JSON log under `logs/`. The pipeline requires an Anthropic API key (or a configured local LLM) because it calls Claude to extract structured summaries from the transcript text. An optional deep scan step (`MTNINSIGHTS_DEDUP_DEEP=1`) adds LLM-based intent clustering for action item deduplication after the standard embedding-based dedup.

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
│         │                 │    technical_topics, notes,        │
│         │                 │    milestones                      │
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
│         └────────┬────────┘                                    │
│                  │                                              │
│         ┌────────▼────────┐                                    │
│         │  6. dedup       │  embed items (action_items,        │
│         │                 │  decisions, risks, etc.) into      │
│         │                 │  item_vectors (LanceDB)            │
│         │                 │  match via cosine + Jaro-Winkler   │
│         │                 │  auto-complete duplicate actions   │
│         │                 │  optional: LLM intent clustering   │
│         │                 │  (MTNINSIGHTS_DEDUP_DEEP=1)        │
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
  decisions        TEXT                (JSON array of {text, decided_by})
  proposed_features TEXT               (JSON array of strings)
  action_items     TEXT                (JSON array of {description, owner, requester, due_date, priority})
                                       priority: "critical" | "normal" | "low"
  technical_topics TEXT                (JSON array of strings)
  open_questions   TEXT                (JSON array of strings)
  risk_items       TEXT                (JSON array of {category, description})
  additional_notes TEXT                (JSON array of note groups, DEFAULT '[]')
  milestones       TEXT                (JSON array of {title, target_date, status_signal, excerpt}, DEFAULT '[]')
  needs_reextraction INTEGER DEFAULT 0

milestones
  id               TEXT  PRIMARY KEY   (UUID)
  client_name      TEXT                → clients.name
  title            TEXT
  description      TEXT
  target_date      TEXT                (ISO date, nullable)
  status           TEXT                (identified | tracked | completed | missed | deferred)
  completed_at     TEXT
  created_at       TEXT
  updated_at       TEXT

milestone_mentions
  milestone_id     TEXT                → milestones.id
  meeting_id       TEXT                → meetings.id
  mention_type     TEXT                (introduced | updated | completed | deferred | referenced)
  excerpt          TEXT
  target_date_at_mention TEXT          (captures target date at mention time for slippage tracking)
  mentioned_at     TEXT                (meeting date, denormalized)
  pending_review   INTEGER DEFAULT 0   (1 = awaiting fuzzy match confirmation)
  PRIMARY KEY (milestone_id, meeting_id)

milestone_action_items
  milestone_id     TEXT                → milestones.id
  meeting_id       TEXT                → meetings.id
  item_index       INTEGER
  linked_at        TEXT
  PRIMARY KEY (milestone_id, meeting_id, item_index)

milestone_messages
  id               TEXT  PRIMARY KEY
  milestone_id     TEXT                → milestones.id
  role             TEXT                (user | assistant)
  content          TEXT
  sources          TEXT
  context_stale    INTEGER DEFAULT 0
  created_at       TEXT

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

item_mentions
  canonical_id     TEXT                (shared UUID for semantically equivalent items)
  meeting_id       TEXT  → meetings.id
  item_type        TEXT                (action_items, decisions, proposed_features, etc.)
  item_index       INTEGER
  item_text        TEXT
  first_mentioned_at TEXT             (ISO date of earliest mention)

action_item_completions
  id               TEXT  PRIMARY KEY   (meeting_id:item_index)
  meeting_id       TEXT  → meetings.id
  item_index       INTEGER
  completed_at     TEXT
  note             TEXT                ("[auto-dedup]" or "[auto-dedup-deep]" prefix for automatic)
```

**LanceDB** (`db/lancedb/`):

```
meeting_vectors
  id               STRING              (meeting UUID)
  vector           FIXED_SIZE_LIST     (384 float32 values, L2-normalized)
  client           STRING
  meeting_type     STRING              (meeting title)
  date             STRING              (ISO 8601)

feature_vectors
  id               STRING              (feature UUID)
  vector           FIXED_SIZE_LIST     (384 float32 values)
  feature_text     STRING
  meeting_id       STRING
  date             STRING

item_vectors
  canonical_id     STRING              (shared UUID for deduplicated items)
  vector           FIXED_SIZE_LIST     (384 float32 values)
  item_text        STRING
  item_type        STRING              (action_items, decisions, etc.)
  meeting_id       STRING
  date             STRING
  client           STRING              (scopes dedup to client boundary)
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

### Deep search (LLM-filtered results)

```bash
pnpm query --search --deepsearch "DLQ dead letter queue" --client=LLSA
```

Runs hybrid search first, then sends each result's summary and action items to the LLM individually. The LLM evaluates whether each meeting is genuinely relevant to the query and assigns a 0-100 relevance score. Only meetings where the LLM confirms relevance are shown, each with a 1-2 sentence evidence summary.

The evaluation prompt is loaded from `config/prompts/deep-search.md`. It uses two-axis scoring: **specificity** (how directly the content addresses the query) and **breadth** (what proportion of the meeting is about the topic). Each LLM call receives only one meeting's small artifact (~300-500 tokens), keeping costs manageable.

Requires `ANTHROPIC_API_KEY` in `.env.local`.

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

The app uses a left **NavRail** for switching between views, a resizable panel layout per view, and a sliding chat column on the right. The top **scope bar** persists across all views.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Scope:  [Client ▾]  From [date]  to [date]  [Search…]   [Reset]  [theme]        │
├───┬─────────────────────────┬──────────────────────────┬────────────────────────┤
│   │      MEETINGS           │       CONTEXT            │       CHAT             │
│ M │  ▸ Series Group A       │  Meeting Title           │  [question input]      │
│   │    □ Meeting 1          │  ─────────────────────   │                        │
│ A │    □ Meeting 2          │  Summary                 │  Answer with [M1]      │
│   │  ▸ Series Group B       │  Decisions               │  citations             │
│ T │    □ Meeting 3          │  Action Items            │                        │
│   │    ...                  │  ...                     │  Sources: ...          │
│ I │                         │                          │                        │
│   │                         │                          │                        │
│ C │                         │                          │                        │
└───┴─────────────────────────┴──────────────────────────┴────────────────────────┘
  NavRail: M=Meetings, A=Action Items, T=Threads, I=Insights, C=Timelines
```

The panel columns within each view are resizable by dragging the separators. The chat column opens alongside whichever view is active.

**NavRail** (left icon bar) — switches between five views:

| Icon | View | Description |
|------|------|-------------|
| Calendar | **Meetings** | Browse, filter, and query processed meetings |
| CheckSquare | **Action Items** | Cross-meeting action item tracking with date filters |
| GitMerge | **Threads** | Topic threads grouping meetings by subject |
| Lightbulb | **Insights** | Periodic insight reports generated from meeting clusters |
| Clock | **Timelines** | Milestone tracking for client directional commitments |

**Scope bar** (top) — controls the global filter state for all views:

- **Client dropdown** — filters meetings and milestones by client assignment.
- **From / to date pickers** — narrow the meetings list to a date window.
- **Search field** — hybrid search (vector + FTS5). Results appear in a dropdown; selecting a result pins matching meetings into the active context. **Deep Search** mode (checkbox, on by default) further filters results with LLM relevance evaluation.
- **Reset button** — clears all filters and selections.
- **Theme button** — cycles through available themes (Deep Sea, Daylight, Midnight).

### Meetings view

**Meetings column** — shows meetings grouped by normalized series name. Each meeting row shows its title, date, thread badges (clickable to navigate to that thread), and milestone badges (clickable to navigate to that milestone). Check individual meetings to pin them into the context; unchecked meetings are excluded from chat.

**Context column** — renders the extracted artifact for every checked meeting: summary, decisions, proposed features, action items, technical topics, open questions, risks, and additional notes. Collapses to a thin icon bar to give more room to chat.

**Chat column** — Q&A interface scoped to checked (or all scoped) meetings. Responses include [M1]-style citations. Shows context size above the input.

### Action Items view

Cross-meeting view showing all action items across a client's meetings. Grouped by owner or by meeting. Supports date range filtering that re-fetches from the current scope. Check/uncheck items to track completion with optional notes.

### Threads view

Threads group meetings around a recurring topic (e.g. "Commerce Migration", "Security Audit"). Each thread:
- Has a title, shorthand badge, description, and criteria prompt (used to evaluate whether new meetings belong)
- Shows all meetings that matched, with relevance scores
- Has an inline chat panel scoped to the thread's meetings

### Insights view

Periodic insight reports synthesized from a set of meetings. Each insight:
- Spans a date range (weekly, monthly, or custom)
- Contains an executive summary (rich text, editable) plus extracted topic clusters
- Has an inline chat panel

### Timelines view

The Timelines view tracks **milestones** — client directional commitments that span multiple meetings, like go-live dates, system launches, and migration phases. Unlike action items, milestones represent higher-level commitments rather than individual tasks.

```
┌───┬──────────────────────────────┬───────────────────────────────────────────────┐
│   │  [List|Gantt|Calendar] ▾     │  Milestone Title                              │
│ C │  Filter: [All ▾] [+ New]     │  ● tracked  Jun 15, 2026    [Edit] [Delete]   │
│   │  ────────────────────────    │  ─────────────────────────────────────────── │
│ l │  ● Launch v2.0   tracked     │  Jun 15, 2026                                 │
│   │    5  tracked  Mar 15        │  Description text...                          │
│ o │  ● Security audit identified │                                               │
│   │    identified  Unscheduled   │  ⚠ Target date has changed                    │
│ c │  ● API migration  completed  │  Date History                                 │
│   │    8  completed  Jan 20      │   Jan 15: Mar 15 → Feb 8: Mar 31             │
│   │  ...                         │                                               │
│   │                              │  Mentions                                     │
│   │                              │   introduced  Meeting A  (excerpt)            │
│   │                              │   updated     Meeting B  (excerpt)            │
│   │                              │                                               │
│   │                              │  Linked Action Items                          │
│   │                              │   #2 Meeting A  [Unlink]                      │
│   │                              │                                               │
│   │                              │  Review Pending Matches                       │
│   │                              │   Meeting C  (excerpt)                        │
│   │                              │   [Confirm Match] [Reject Match]              │
└───┴──────────────────────────────┴───────────────────────────────────────────────┘
```

**Milestone list panel** — shows all milestones for the selected client with status dots, mention counts, status badges, and target dates. A **Review** amber badge appears on milestones with pending fuzzy match confirmations. The panel supports three view modes (toggle in the header):

| Mode | Description |
|------|-------------|
| **List** | Flat list with status filter dropdown |
| **Gantt** | Horizontal bars from first mention → target date across month columns, with a blue today marker and auto-scroll |
| **Calendar** | Month grid with milestone pills on target date cells and an Unscheduled section below |

**Milestone detail panel** — appears when a milestone is selected:

- **Header** — title, status dot, status badge, target date, Edit and Delete buttons
- **Date History** — appears when the milestone's target date has shifted across meetings; shows an amber warning and a chronological table of date changes with meeting attribution
- **Mentions** — chronological list of all meetings where the milestone was discussed; each entry shows mention type badge (introduced/updated/completed/deferred/referenced), meeting title (clickable to navigate), and excerpt text; pending fuzzy matches show a "Pending" badge
- **Linked Action Items** — action items manually linked to this milestone, with an Unlink button per item
- **Review Pending Matches** — when the reconciliation pipeline found a similar-but-not-identical milestone title in a new meeting, the match is held for review; Confirm Match accepts it (sets the mention as confirmed), Reject Match creates a new separate milestone
- **Merge** — "Merge into..." button lets you consolidate duplicate milestones by moving all mentions, action items, and messages from this milestone into a target milestone and deleting this one
- **Edit mode** — pencil button toggles inline editing of title, description, target date, and status without leaving the view

**Chat** — when a milestone is selected, the right chat panel scopes Q&A to that milestone's meetings, the same way thread and insight chat work.

#### Milestone extraction

Milestones are extracted automatically during `pnpm process` (step 3). The extraction prompt identifies directional commitments spoken by client team members — launches, migrations, phase completions, go-live dates — and returns them with a target date and status signal. The pipeline then runs `reconcileMilestones` which:

1. **Exact match** — if a new extraction matches an existing milestone title (normalized), creates a new mention and updates status/date if warranted
2. **Fuzzy match** — if similarity is above 0.7 but not exact, creates a `pending_review = 1` mention for manual confirmation in the UI
3. **No match** — creates a new milestone with an initial mention

Re-extracting a meeting (via the Re-extract button in MeetingDetail) automatically cleans up old mentions for that meeting and re-runs reconciliation.

Status transitions:
- `identified → tracked` automatically on the second meeting mention
- `completed` and `deferred` from explicit LLM signal
- `missed` is manual only (set via the Edit mode status dropdown)

### Scope bar

The scope bar at the top of the window controls the global filter state:

- **Client dropdown** — filters meetings by client assignment. Selecting a client also constrains semantic searches to that client.
- **From / to date pickers** — narrow the meetings list to a date window.
- **Search field** — runs a live hybrid search as you type, combining multi-table vector search with FTS5 keyword matching. Supports natural language queries ("when did we discuss billing") and exact keyword/acronym matches ("DLQ", "Recurly"). Results appear in a dropdown; selecting a result pins those meetings into the active selection and clears the date/client scope. When **Deep Search** is enabled (checkbox next to the search input, on by default), hybrid results are further filtered by the LLM — each meeting's artifact is evaluated for genuine relevance. Matching meetings display an orange left border and a 1-2 sentence evidence summary. The LLM evaluation prompt can be customized in `config/prompts/deep-search.md`.
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

**Meetings and search:**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Returns `{ ok: true }` |
| `GET` | `/api/debug` | Returns DB paths and record counts |
| `GET` | `/api/clients` | List all client names |
| `GET` | `/api/meetings` | List meetings (filters: `?client=&after=&before=`) |
| `GET` | `/api/meetings/:id/artifact` | Structured artifact for a single meeting |
| `POST` | `/api/chat` | Natural-language Q&A (body: `{ meetingIds, question }`) |
| `GET` | `/api/search` | Hybrid search — vector + FTS5 keyword (params: `?q=&client=&limit=`) |
| `POST` | `/api/deep-search` | LLM-filtered search (body: `{ meetingIds, query }`) |

**Milestones:**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/milestones` | List milestones for a client (`?client=`) with mention counts |
| `POST` | `/api/milestones` | Create a milestone (body: `{ client_name, title, description?, target_date? }`) |
| `PUT` | `/api/milestones/:id` | Update a milestone (body: `{ title?, description?, targetDate?, status? }`) |
| `DELETE` | `/api/milestones/:id` | Delete milestone and all mentions, action item links, and messages |
| `GET` | `/api/milestones/:id/mentions` | List meeting mentions for a milestone (chronological) |
| `POST` | `/api/milestones/:id/mentions` | Add a meeting mention (body: `{ meeting_id, mention_type, excerpt?, target_date_at_mention? }`) |
| `GET` | `/api/milestones/:id/slippage` | Date change history — returns mentions where target date differed from prior mention |
| `POST` | `/api/milestones/:id/confirm-mention/:meetingId` | Confirm a fuzzy-matched pending mention (`pending_review → 0`) |
| `POST` | `/api/milestones/:id/reject-mention/:meetingId` | Reject a fuzzy match — deletes the pending mention and creates a new milestone from it |
| `POST` | `/api/milestones/:sourceId/merge/:targetId` | Merge source milestone into target, moving all mentions and links |
| `GET` | `/api/milestones/:id/action-items` | List action items linked to a milestone |
| `POST` | `/api/milestones/:id/action-items` | Link an action item (body: `{ meeting_id, item_index }`) |
| `DELETE` | `/api/milestones/:id/action-items/:meetingId/:itemIndex` | Unlink an action item |
| `GET` | `/api/milestones/:id/messages` | List chat messages for a milestone |
| `POST` | `/api/milestones/:id/chat` | Send a chat message (body: `{ question, includeTranscripts? }`) |
| `DELETE` | `/api/milestones/:id/messages` | Clear all chat messages for a milestone |

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

## Item Deduplication (`pnpm all-items-dedupe`)

The deduplication CLI retroactively identifies duplicate action items, decisions, proposed features, open questions, and risk items across meetings. It operates in two modes: embedding-based (default) and LLM intent clustering (`--deepscan`).

### Embedding-based dedup (default)

Embeds each item using the local ONNX model, searches the `item_vectors` LanceDB table for similar items scoped to the same client, and marks duplicates using cosine similarity and Jaro-Winkler string distance thresholds. Duplicate action items are auto-completed with a `[auto-dedup]` provenance note.

```bash
pnpm all-items-dedupe run
pnpm all-items-dedupe run --dry-run         # preview without writing
pnpm all-items-dedupe run --date=2026-03-01 # filter by date
pnpm all-items-dedupe run --last-day        # most recent day only
```

### Deep scan (`--deepscan`)

Adds LLM-based intent clustering on top of embedding dedup. Groups all action items per client into a single LLM call that returns intent groupings — items expressing the same task with different wording are clustered together regardless of surface-level similarity.

```bash
pnpm all-items-dedupe run --deepscan
pnpm all-items-dedupe run --deepscan --dry-run   # shows LLM groupings with reasoning
pnpm all-items-dedupe run --deepscan --last-day
```

Only `"critical"` and `"normal"` priority action items are sent to the LLM. `"low"` priority items are embedded for standard dedup but excluded from intent clustering to reduce noise. Within each priority group, only the most recent N items (by meeting date) are sent, capped by `MTNINSIGHTS_DEDUP_BATCH_SIZE` (default: 50).

Duplicate action items identified by deep scan are auto-completed with an `[auto-dedup-deep]` provenance note, distinct from the embedding-based `[auto-dedup]` notes.

### Clear dedup state

```bash
pnpm all-items-dedupe clear                 # remove all dedup completions and item vectors
```

Deletes all auto-dedup completions (both `[auto-dedup]` and `[auto-dedup-deep]`), item mentions, and item vectors. Does not affect the underlying artifacts or meeting data.

### Action item priority tiers

Action items are classified into three priority levels during extraction:

| Priority | Description |
|----------|-------------|
| `critical` | Trigger B (broken/blocked/degraded) or authority-directed tasks |
| `normal` | Standard committed tasks (Trigger A without authority) |
| `low` | Informational, aspirational, or nice-to-have tasks mentioned in passing without firm commitment |

### Environment variables

| Variable | Default | Effect |
|----------|---------|--------|
| `MTNINSIGHTS_DEDUP_SEMANTIC_THRESHOLD` | `0.80` | Cosine similarity floor for embedding dedup |
| `MTNINSIGHTS_DEDUP_STRING_THRESHOLD` | `0.90` | Jaro-Winkler similarity floor for string dedup |
| `MTNINSIGHTS_DEDUP_BATCH_SIZE` | `50` | Max items per priority group sent to LLM in deep scan |
| `MTNINSIGHTS_DEDUP_DEEP` | `0` | Set to `1` to enable deep scan during `pnpm process` pipeline |

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
