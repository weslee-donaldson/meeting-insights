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

### Section 2: Setup & Distribution

- [ ] Burst 7: Update `SETUP.md` with complete onboarding instructions. Quick start section: `git clone && ./setup.sh`. Manual setup steps for each component. Environment variable reference table. PM2 management commands (`pm2 start ecosystem.config.cjs`, `pm2 logs`, `pm2 restart`). Troubleshooting section (common issues: model download failures, missing API key, port conflicts). Development commands (`pnpm test`, `pnpm web:dev`, `pnpm ui:dev`).

  No test (documentation only, infra commit).

## DONE

- [x] Burst 1: `core/migrations/runner.ts` -- runMigrations, getCurrentVersion with schema_version table (e33d5e3)
- [x] Burst 2: `core/migrations/001-baseline.ts` + `index.ts` -- extract migrate() into versioned migration
- [x] Burst 3: Wire runner into setup/API/local-service via db.ts `migrate()` thin wrapper (499cf5b)
- [x] Burst 4: `.env.example` + ecosystem.config.cjs with mti-api entry (d23308a)
- [x] Burst 5: `scripts/download-models.ts` with hash-verified ONNX model download + uncommented dedup tuning defaults (178990f)
- [x] Burst 6: `setup.sh` one-command onboarding script

## Verification

1. **Migrations**: Run `pnpm setup` on fresh in-memory DB, verify schema_version table shows version 1 with description "Baseline schema".
2. **Idempotence**: Run `pnpm setup` twice, verify no errors and version stays at 1.
3. **Model download**: Delete models/, run `pnpm download-models`, verify both files appear with correct hashes.
4. **Setup script**: Clone repo to temp dir, run `./setup.sh`, verify models downloaded, .env.local created from example, DB initialized.
5. **PM2**: Run `pm2 start ecosystem.config.cjs`, verify both mti-api and webhook-watcher are online.
6. **Full suite**: `pnpm test --run` -- all existing + new tests pass.
