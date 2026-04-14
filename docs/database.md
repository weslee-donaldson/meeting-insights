# Database

Meeting Insights persists state in two stores:

- **SQLite** at `MTNINSIGHTS_DB_PATH` (default `db/mtninsights.db`) -- relational data, artifacts, auth, history
- **LanceDB** at `MTNINSIGHTS_VECTOR_PATH` (default `db/lancedb`) -- 384-dim vectors for semantic search

Both are local, gitignored, and reset-safe via `pnpm clear` or `pnpm purge`.

## SQLite schema

All tables are created by the baseline migration (`core/migrations/001-baseline.ts`). Subsequent migrations add columns additively.

### Core

| Table | Purpose |
|-------|---------|
| `meetings` | One row per meeting. Fields: `id`, `title`, `meeting_type`, `date`, `participants` (JSON), `raw_transcript`, `source_filename`, `created_at`, `ignored`, `client_id`, `recording_url` |
| `artifacts` | LLM-extracted content per meeting. Fields: `summary`, `decisions`, `proposed_features`, `action_items`, `architecture`, `open_questions`, `risk_items`, `additional_notes`, `milestones`. All structured fields stored as JSON strings |
| `artifact_fts` | SQLite FTS5 virtual table. Full-text search over artifact bodies |
| `meeting_lineage` | Split-meeting lineage: `source_meeting_id`, `result_meeting_id`, `segment_index`, `split_at_turn` |
| `assets` | File attachments: `id`, `meeting_id`, `filename`, `mime_type`, `file_size`, `storage_path` |

### Clients and detection

| Table | Purpose |
|-------|---------|
| `clients` | UUID-keyed client registry. Fields: `id`, `tenant_id`, `name`, `aliases`, `known_participants`, `refinement_prompt`, `client_team`, `implementation_team`, `additional_extraction_llm_prompt`, `meeting_names`, `is_default`, `glossary` |
| `client_detections` | Per-meeting detection results: `meeting_id`, `client_id` (or legacy `client_name`), `confidence`, `method` |

### Action items and dedup

| Table | Purpose |
|-------|---------|
| `action_item_completions` | Per-item completion records: `id` (`{meetingId}:{itemIndex}`), `meeting_id`, `item_index`, `completed_at`, `note` |
| `item_mentions` | Cross-meeting dedup: `canonical_id`, `meeting_id`, `item_type`, `item_index`, `item_text`, `first_mentioned_at` |

### Threads

| Table | Purpose |
|-------|---------|
| `threads` | `id`, `client_name`, `title`, `shorthand`, `description`, `status`, `summary`, `criteria_prompt`, `keywords`, `created_at`, `updated_at` |
| `thread_meetings` | Many-to-many `thread_id` <-> `meeting_id` with `relevance_summary` and `relevance_score` |
| `thread_messages` | Conversation history per thread |

### Insights

| Table | Purpose |
|-------|---------|
| `insights` | Period-scoped rollups: `id`, `client_name`, `name`, `period_type`, `period_start`, `period_end`, `status`, `rag_status`, `executive_summary`, `topic_details` (JSON) |
| `insight_meetings` | Many-to-many with `contribution_summary` |
| `insight_messages` | Conversation history per insight |

### Milestones

| Table | Purpose |
|-------|---------|
| `milestones` | `id`, `client_name`, `title`, `description`, `target_date`, `status`, `completed_at`, `ignored` |
| `milestone_mentions` | Meeting mentions with `excerpt`, `target_date_at_mention`, `pending_review` |
| `milestone_action_items` | Links milestones to specific action items |
| `milestone_messages` | Conversation history per milestone |

### Messages and notes

| Table | Purpose |
|-------|---------|
| `meeting_messages` | Per-meeting chat history |
| `notes` | Universal notes: `object_type` (meeting/insight/milestone/thread), `object_id`, `title`, `body`, `note_type` (user/auto) |

### Tenancy (schema present, enforcement deferred)

| Table | Purpose |
|-------|---------|
| `tenants` | `id`, `name`, `slug` |
| `users` | `id`, `email`, `display_name`, `password_hash` |
| `tenant_memberships` | `tenant_id` + `user_id` with `role` |

A default tenant is seeded automatically on first run of the v2 clients migration.

### Auth

| Table | Purpose |
|-------|---------|
| `oauth_clients` | OAuth 2.1 client registrations (`client_id`, `client_secret_hash`, `grant_types`, `scopes`, `redirect_uris`) |
| `oauth_tokens` | Issued access and refresh tokens (`jti` PK, `expires_at`, `revoked`) |
| `oauth_authorization_codes` | Authorization codes with PKCE challenges |
| `api_keys` | `mki_`-prefixed keys with SHA-256 hashes and per-key `scopes` |

### System

| Table | Purpose |
|-------|---------|
| `system_errors` | Operational errors (pipeline failures, LLM 5xx). `acknowledged`, `notified`, `severity` |
| `schema_version` | Migration tracking: `version`, `applied_at`, `description` |
| `clusters`, `meeting_clusters` | Legacy clustering (still present, not actively used) |

## LanceDB tables

All vectors are 384-dimensional float32, L2-normalized.

| Table | Row shape | Purpose |
|-------|-----------|---------|
| `meeting_vectors` | `meeting_id`, `client_name`, `meeting_type`, `date`, `title`, `vector` | One vector per meeting artifact. Used for hybrid search and thread discovery |
| `feature_vectors` | `meeting_id`, `feature_text`, `vector` | One vector per proposed feature (from extraction). Used to improve recall on feature-related queries |
| `item_vectors` | `meeting_id`, `item_type`, `item_index`, `canonical_id`, `item_text`, `vector` | One vector per action item (and other dedupable items). Used by the dedup pipeline |

**Important caveat:** Clustering and bulk vector retrieval use `table.query().limit(N).toArray()` -- a full scan. KNN search with a zero vector is unreliable for L2-normalized vectors and must not be used for "get all vectors" operations.

## Migrations

The versioned migration system lives in `core/migrations/`.

### How it works

On startup (API server, CLI setup, local-service), `migrate(db)` calls `runMigrations(db, allMigrations)` which:

1. Creates `schema_version` if it doesn't exist
2. Reads the current max applied version
3. Runs each pending migration (version > current) in order
4. Each migration runs inside a `BEGIN`/`COMMIT` transaction
5. On any error, the transaction rolls back and the runner throws

### Migration files

Each migration is a `.ts` file in `core/migrations/` exporting:
```ts
export const version: number;
export const description: string;
export function up(db: Database): void;
```

The baseline (`001-baseline.ts`) contains the full schema as of version 1. It runs `CREATE TABLE IF NOT EXISTS` for every table plus guarded `ALTER TABLE ... ADD COLUMN` for columns added before the versioned system existed. It is idempotent even on a populated DB.

Migrations are sorted by version in `core/migrations/index.ts` and exposed via `allMigrations`.

### Adding a new migration

1. Create `core/migrations/002-add-foo.ts`:
   ```ts
   import type { Database } from "../db.js";
   export const version = 2;
   export const description = "Add foo column to bar";
   export function up(db: Database): void {
     db.exec("ALTER TABLE bar ADD COLUMN foo TEXT");
   }
   ```
2. Add it to the `allMigrations` array in `core/migrations/index.ts`.
3. Add a test under `test/migration-002-*.test.ts`.
4. Next `pnpm setup` or API restart applies it automatically.

### Forward-only

There are no down migrations. To undo a schema change, write a new forward migration that reverses it. This keeps the migration runner simple and matches typical SQLite workflows.

### Updating when pulling changes

Pulling new migrations from main:

```bash
git pull
pm2 restart mti-api     # migrations run on startup
# or:
pnpm setup              # runs migrations as part of the setup flow
```

The runner is idempotent, so running `pnpm setup` twice in a row is safe.

## Backups

Back up `db/mtninsights.db` and the `db/lancedb/` directory together. They're independent stores but semantically linked -- a meeting in SQLite without its vectors in LanceDB (or vice versa) will behave inconsistently.

Quick backup:
```bash
tar czf mtninsights-backup-$(date +%Y%m%d).tgz db/
```

Restoration is a simple extract back into place before starting the API.
