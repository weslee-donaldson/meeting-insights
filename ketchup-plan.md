# Ketchup Plan: Local Distribution Readiness (Phase 1)

## Context

krisp-meeting-insights is a single-operator tool today. Preparing it for a second engineer to run locally requires: a versioned migration system (so pulling updates doesn't break their DB), setup automation (so onboarding is one command), and clear documentation.

This is Phase 1 of a two-phase effort. Phase 2 (hosted service with tenant isolation, dashboard, settings UI) is future work.

**What this plan delivers:**
1. A versioned migration system with `schema_version` table and numbered migration files
2. An `mti update` CLI command that runs pending migrations
3. Automated ONNX model download with hash verification
4. A `.env.example` with all required variables documented
5. Updated `ecosystem.config.cjs` with mti-api entry
6. A `setup.sh` script that handles deps, model download, env config, and DB init
7. Updated `SETUP.md` with complete onboarding instructions

**What this plan does NOT deliver (Phase 2):**
- Tenant isolation / route enforcement
- Cross-client dashboard
- Settings / prompt management UI
- Electron packaging

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Migration style | Forward-only versioned | Down migrations add complexity with little value for a small team |
| Baseline migration | Extract existing migrate() into 001 | Preserves exact current schema as version 1 |
| Migration runner location | `core/migrations/runner.ts` | Business logic in core/; follows existing patterns |
| Model download | scripts/download-models.ts with SHA256 | Deterministic, verifiable, skips if already present |
| Setup entry point | setup.sh (bash) | Universal on macOS/Linux; the target platforms |

## Data Shapes

### schema_version table
```sql
CREATE TABLE schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now')),
  description TEXT NOT NULL
);
```

### Migration file interface
```ts
// core/migrations/001-baseline.ts
export const version = 1;
export const description = "Baseline schema from existing migrate()";
export function up(db: DatabaseSync): void { ... }
```

## Reference Files

| File | Why |
|------|-----|
| `core/db.ts` | Current migrate() (~486 lines) to extract into baseline migration |
| `cli/admin-util/setup.ts` | Replace migrate() call with runMigrations() |
| `api/main.ts` | Replace migrate() call with runMigrations() |
| `ecosystem.config.cjs` | Add mti-api entry |
| `SETUP.md` | Rewrite with setup.sh instructions |

## Dependency Graph

```
Burst 1 -> 2 -> 3 -> 4 | 5 (parallel) -> 6 -> 7
(runner) (baseline) (wire) (env)  (models)  (setup.sh) (docs)
```

---

## TODO

### Section 1: Versioned Migration System

- [ ] Burst 2: `core/migrations/001-baseline.ts` -- extract entire existing `migrate()` body into migration 001. Version 1, description "Baseline schema". Create `core/migrations/index.ts` exporting `allMigrations` array sorted by version.

  Test: `test/migration-001-baseline.test.ts` -- up() on fresh DB creates all tables (compare table list against known set), up() adds all ALTER TABLE columns, schema matches what current migrate() produces. Running via runner twice applies once and skips second.

- [ ] Burst 3: Wire runner into setup and API startup. Replace `migrate(db)` calls in `cli/admin-util/setup.ts`, `api/main.ts`, and `local-service/main.ts` with `runMigrations(db, allMigrations)`. Keep `migrate()` in db.ts as thin wrapper calling `runMigrations()` for backward compat with existing tests. Add `mti update` CLI command that runs pending migrations and prints results.

  Test: `test/migration-integration.test.ts` -- runMigrations with allMigrations on empty DB produces same schema as old migrate(). Running on DB already at version 1 is a no-op.

### Section 2: Setup & Distribution

- [ ] Burst 4: `.env.example` with all required variables documented with inline comments. Grouped by section (LLM provider, database, auth, logging, search tuning). No actual secret values. Update `ecosystem.config.cjs` to include mti-api entry alongside webhook-watcher with correct script path and tsx interpreter.

  Test: `test/env-example.test.ts` -- .env.example file exists, contains all required keys (ANTHROPIC_API_KEY, MTNINSIGHTS_LLM_PROVIDER, MTNINSIGHTS_DB_PATH, PORT, MTNINSIGHTS_AUTH_ENABLED, MTNINSIGHTS_OWNER_SECRET), contains no actual API key values, ecosystem.config.cjs has mti-api entry with correct script path.

- [ ] Burst 5: `scripts/download-models.ts` -- downloads ONNX model + tokenizer from Hugging Face with SHA256 hash verification. Exports `downloadIfMissing(modelDir)` which checks if files exist with correct hashes, downloads only what's missing. Creates `models/` directory if absent. Uses native fetch() + node:crypto for verification. Add `pnpm download-models` script to package.json.

  Test: `test/download-models.test.ts` -- getModelUrls() returns correct Hugging Face URLs, verifyHash(filePath, expectedHash) returns true for matching SHA256, verifyHash with wrong hash returns false, downloadIfMissing skips when file exists with correct hash (mock fetch not called).

- [ ] Burst 6: `setup.sh` -- single entry point for new team members. Checks prerequisites (node >= 22, pnpm available), runs `pnpm install`, copies `.env.example` to `.env.local` if not present (prompts user to fill in API key), runs `pnpm download-models`, runs `pnpm setup`. Idempotent -- safe to re-run. Make executable with chmod +x.

  Test: `test/setup-script.test.ts` -- script file exists, is executable (file mode check), contains node version check, contains pnpm check, references pnpm install, references download-models, references pnpm setup.

- [ ] Burst 7: Update `SETUP.md` with complete onboarding instructions. Quick start section: `git clone && ./setup.sh`. Manual setup steps for each component. Environment variable reference table. PM2 management commands (`pm2 start ecosystem.config.cjs`, `pm2 logs`, `pm2 restart`). Troubleshooting section (common issues: model download failures, missing API key, port conflicts). Development commands (`pnpm test`, `pnpm web:dev`, `pnpm ui:dev`).

  No test (documentation only, infra commit).

## DONE

- [x] Burst 1: `core/migrations/runner.ts` -- runMigrations, getCurrentVersion with schema_version table

## Verification

1. **Migrations**: Run `pnpm setup` on fresh in-memory DB, verify schema_version table shows version 1 with description "Baseline schema".
2. **Idempotence**: Run `pnpm setup` twice, verify no errors and version stays at 1.
3. **Model download**: Delete models/, run `pnpm download-models`, verify both files appear with correct hashes.
4. **Setup script**: Clone repo to temp dir, run `./setup.sh`, verify models downloaded, .env.local created from example, DB initialized.
5. **PM2**: Run `pm2 start ecosystem.config.cjs`, verify both mti-api and webhook-watcher are online.
6. **Full suite**: `pnpm test --run` -- all existing + new tests pass.
