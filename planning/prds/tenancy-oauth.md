# PRD: Tenancy Model + OAuth Authorization Layer

## Context

The API (83 routes, 7 groups) has zero auth — all endpoints are public, CORS allows all origins, no users/tenants/tokens exist. The `clients` table uses `name TEXT` as primary key and has no ownership concept; all data is globally visible.

**Why now:** Before exposing the API as an MCP service, we need an authorization layer. Before adding auth, we need a tenant construct — otherwise tokens have nothing to scope data against. The tenant model also positions the app for multi-user/multi-org use if it goes public.

**Two phases, strict order:**
1. **Phase 1 — Tenancy data model:** Add tenants, users, memberships. Migrate `clients` PK from `name` to UUID `id`. Add `tenant_id` FK. Update all code that references `client_name` to use `client_id`. Auto-bootstrap a default tenant for existing data.
2. **Phase 2 — OAuth authorization:** Built-in OAuth 2.0 AS with API keys, client credentials, and authorization code + PKCE. Opt-in via env var — existing workflow unaffected.

**Auth independence:** Phase 2 is opt-in (`MTNINSIGHTS_AUTH_ENABLED=1`). When disabled, middleware is a no-op. This means Phase 1 can land and be tested independently. Phase 2 can land without breaking the Electron app or web dev mode.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth server | Built-in OAuth AS | Self-contained, no external IdP dependency, aligns with MCP spec |
| User model | Single owner | One admin account now, expandable to multi-user later |
| Scopes | Resource-type (`meetings:read`, etc.) | Controls operations, not data visibility — data isolation is via tenant |
| Client IDs | UUID | Non-enumerable (IDOR prevention), consistent with all other entities |
| Client PK | Full migration `name` → UUID `id` | Clean break — avoids tech debt of mixed identifier schemes |
| Tenant bootstrap | Auto-create default tenant | Zero-friction for single-owner, no manual setup step |
| User permissions | `role` column, no enforcement | Schema supports RBAC later; no middleware enforcement in this phase |

## Reference Files

These files are the source of truth for understanding the current codebase. Read them before implementing.

| File | Why |
|------|-----|
| `core/db.ts` | Current schema — 21 tables, migration pattern (CREATE IF NOT EXISTS + ALTER TABLE guards) |
| `core/client-registry.ts` | `seedClients`, `getClientByName`, `getAllClients`, `getDefaultClient`, `buildClientContext` — all need tenant-scoping |
| `core/client-detection.ts` | `detectClient`, `storeDetection` — write `client_name` FK, need `client_id` |
| `core/threads.ts` | `createThread`, `listThreadsByClient` — FK `client_name` |
| `core/insights.ts` | `createInsight`, `listInsightsByClient`, `discoverMeetingsForPeriod` — FK `client_name` |
| `core/timelines.ts` | `createMilestone`, `listMilestonesByClient`, `reconcileMilestones` — FK `client_name` |
| `core/pipeline.ts` | End-to-end pipeline passes client name through all stages |
| `api/server.ts` | Hono app creation, middleware attachment, route registration |
| `api/main.ts` | Server startup, env vars, dependency initialization |
| `api/routes/meetings.ts` | Largest route file — `?client=` query param pattern |
| `electron-ui/electron/channels.ts` | `ElectronAPI` interface — 58 methods, types used across IPC and HTTP |
| `electron-ui/ui/src/api-client/` | HTTP fetch implementation of ElectronAPI |

## Testing Strategy

- **Per-burst TDD**: Every burst starts with a failing test, writes minimal passing code, then TCR
- **In-memory SQLite**: All core/auth tests use `createDb(":memory:")` + `migrate(db)` — no disk I/O
- **Stub LLM**: Domain feature tests that trigger LLM calls use the stub adapter (already established pattern)
- **100% coverage enforced**: No escape hatches on new `core/auth/` files
- **Existing tests must pass**: Phase 1 migration is backwards-compatible (deprecated columns stay, new code reads `client_id`)
- **Integration tests for auth**: Phase 2 includes Hono `app.request()` tests that verify the full middleware → route → handler chain

---

## Phase 1: Tenancy Data Model

### New Tables

```sql
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,              -- UUID
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,        -- URL-safe identifier
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,              -- UUID
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT,               -- NULL for SSO-only users (future)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenant_memberships (
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL DEFAULT 'member',  -- owner | admin | member | viewer
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tenant_id, user_id)
);
```

### Client PK Migration Strategy

SQLite can't alter primary keys. The migration uses a table recreation pattern inside a transaction:

1. Create `clients_v2` with `id TEXT PRIMARY KEY`, `tenant_id TEXT NOT NULL`, plus all existing columns
2. Copy all rows from `clients` → `clients_v2`, using the existing `id` column values
3. Add `client_id TEXT` column to: `threads`, `insights`, `milestones`, `client_detections`
4. Populate `client_id` via `UPDATE threads SET client_id = (SELECT id FROM clients WHERE name = threads.client_name)`
5. Drop old `clients`, rename `clients_v2` → `clients`
6. `client_name` columns **remain** on referencing tables (deprecated, for rollback safety) — new code uses `client_id`

**Important:** The existing `clients.id` column already has UUID values (populated by `seedClients` via `randomUUID()`). The migration preserves these, so no data loss.

### Auto-Bootstrap

In `migrate()`, after creating tables and running the client PK migration:
- If `tenants` table is empty AND `clients` table has rows:
  - Create default tenant: `{ id: randomUUID(), name: "Default", slug: "default" }`
  - Create default owner user: `{ id: randomUUID(), email: MTNINSIGHTS_OWNER_EMAIL ?? "owner@localhost", display_name: "Owner" }`
  - Create membership: `{ tenant_id, user_id, role: "owner" }`
  - Set `tenant_id` on all existing clients to the default tenant's ID

### Files to Modify

| File | Change |
|------|--------|
| `core/db.ts` | Add 3 new tables, client PK migration transaction, bootstrap logic |
| `core/client-registry.ts` | `seedClients(db, filePath, tenantId)`, tenant-scoped queries |
| `core/client-detection.ts` | `storeDetection` writes `client_id`, `detectClient` returns `client_id` |
| `core/threads.ts` | `client_name` → `client_id` in queries |
| `core/insights.ts` | Same |
| `core/timelines.ts` | Same |
| `core/pipeline.ts` | Pass `client_id` through pipeline |
| `core/item-dedup.ts` | Client scoping via `client_id` |
| `core/deep-dedup.ts` | Same |
| `api/routes/meetings.ts` | `?client=` resolves to `client_id` internally |
| `api/routes/threads.ts` | Same |
| `api/routes/insights.ts` | Same |
| `api/routes/milestones.ts` | Same |
| `electron-ui/electron/channels.ts` | `ElectronAPI` types updated |
| `electron-ui/ui/src/api-client/` | Pass client IDs |

### New Files (Phase 1)

```
core/
  resolve-client.ts     — resolveClient(db, clientParam, tenantId?) — accepts name or UUID, returns ClientRow
```

### Dependency Graph & Parallelization (Phase 1)

```
Section 1 — Sequential (main branch, foundational schema)
  Burst 1: tenants + users + memberships tables
  Burst 2: clients_v2 table creation + data copy
  Burst 3: client_id columns on threads/insights/milestones/client_detections + populate
  Burst 4: drop old clients, rename, auto-bootstrap
      │
Section 2 — Sequential (depends on new schema)
  Burst 5-8: client-registry.ts updates (must be sequential — each builds on prior)
      │
Section 3 — 3 parallel agents (worktrees, independent domain files)
      ├── Agent A: Bursts 9, 14 (client-detection.ts, pipeline.ts)
      ├── Agent B: Bursts 10, 11 (threads.ts, insights.ts)
      └── Agent C: Bursts 12, 13, 15 (timelines.ts, dedup, context)
      │
Section 4 — Sequential (API layer, depends on all core changes)
  Burst 16: resolveClient helper
  Burst 17-18: route updates
  Burst 19-20: ElectronAPI + api-client updates
      │
Section 5 — Sequential
  Burst 21: scatter/gather docs
```

**Why these boundaries:**
- Section 1 is strictly sequential — each migration step depends on the prior
- Section 2 must follow Section 1 — `seedClients` needs the new schema
- Section 3 tracks touch separate core files (`threads.ts`, `insights.ts`, `timelines.ts`, `pipeline.ts`, `item-dedup.ts`) — zero merge conflict risk
- Section 4 must follow Section 3 — API routes call the updated core functions
- Section 5 is documentation cleanup

### Multi-Agent Orchestration (Phase 1, Section 3)

**Step 1 — Spawn 3 agents simultaneously** with `isolation: "worktree"`:

| Agent | Branch | Source files (modify) | Test files (modify) | Bursts |
|-------|--------|----------------------|---------------------|--------|
| A | `tenancy/p1-detection-pipeline` | `core/client-detection.ts`, `core/pipeline.ts` | `test/client-detection.test.ts`, `test/pipeline.test.ts` | 9, 14 |
| B | `tenancy/p1-threads-insights` | `core/threads.ts`, `core/insights.ts` | `test/threads.test.ts`, `test/insights.test.ts` | 10, 11 |
| C | `tenancy/p1-timelines-dedup-context` | `core/timelines.ts`, `core/item-dedup.ts`, `core/deep-dedup.ts`, `core/context.ts`, `core/labeled-context.ts` | respective test files | 12, 13, 15 |

**Step 2 — Wait for all 3 to complete.**

**Step 3 — Merge to main:**
```bash
git merge tenancy/p1-detection-pipeline --no-ff -m "feat(tenancy): client-detection + pipeline use client_id"
git merge tenancy/p1-threads-insights --no-ff -m "feat(tenancy): threads + insights use client_id"
git merge tenancy/p1-timelines-dedup-context --no-ff -m "feat(tenancy): timelines + dedup + context use client_id"
pnpm test --run  # ALL tests pass
```

**Step 4 — `/review` on merged diff, then tag:**
```bash
git tag tenancy-phase1-section3-done
git branch -d tenancy/p1-detection-pipeline tenancy/p1-threads-insights tenancy/p1-timelines-dedup-context
```

**Agent prompt template (Section 3):**
```
You are executing the Tenancy PRD, Phase 1, Section 3, Agent {letter}.

**Your scope:**
- Source files: {list}
- Test files: {list}
- Bursts: {list}

**Rules:**
- Follow all CLAUDE.md rules (TDD, TCR, 100% coverage, no comments)
- Read `planning/prds/tenancy-oauth.md` for the full migration context
- Read the reference files listed in the PRD before writing code
- The client PK migration is already complete (Section 1-2 landed)
- `clients.id` is now the PK (UUID). `client_name` columns still exist but are deprecated.
- Shift all queries from `client_name` to `client_id`
- Run `pnpm test --run` after each burst — all tests must pass
- Do NOT modify files outside your scope
- TCR revert scope: `git checkout -- {source files} {test files}`
```

### Phase 1 Ketchup Bursts (Detailed)

#### Section 1: Schema + Migration

**Burst 1: tenants, users, tenant_memberships tables**

Add 3 new CREATE TABLE statements to `core/db.ts` `migrate()`. Tables are self-contained — no FK dependencies on existing tables.

Test: `migrate(db)` succeeds, `PRAGMA table_info(tenants)` returns expected columns, inserting a tenant + user + membership works, duplicate membership PK is rejected.

---

**Burst 2: clients_v2 table creation + data copy**

In `migrate()`, detect if migration is needed (check if `clients` PK is still `name`). If so:
- BEGIN transaction
- Create `clients_v2` with schema: `id TEXT PRIMARY KEY, tenant_id TEXT, name TEXT NOT NULL, aliases TEXT, known_participants TEXT, refinement_prompt TEXT, meeting_names TEXT DEFAULT '[]', is_default INTEGER DEFAULT 0, client_team TEXT DEFAULT '[]', implementation_team TEXT DEFAULT '[]', additional_extraction_llm_prompt TEXT, glossary TEXT DEFAULT '[]'`
- `INSERT INTO clients_v2 SELECT id, NULL, name, aliases, known_participants, refinement_prompt, meeting_names, is_default, client_team, implementation_team, additional_extraction_llm_prompt, glossary FROM clients`
- COMMIT (don't drop old table yet — Burst 4)

Test: `migrate(db)` with pre-populated clients copies all rows to `clients_v2`. UUID `id` values are preserved. All columns transfer correctly.

---

**Burst 3: Add client_id columns to referencing tables**

Add `client_id TEXT` column to `threads`, `insights`, `milestones`, `client_detections` (via ALTER TABLE guards).

Populate from join:
```sql
UPDATE threads SET client_id = (SELECT id FROM clients_v2 WHERE name = threads.client_name) WHERE client_id IS NULL;
UPDATE insights SET client_id = (SELECT id FROM clients_v2 WHERE name = insights.client_name) WHERE client_id IS NULL;
UPDATE milestones SET client_id = (SELECT id FROM clients_v2 WHERE name = milestones.client_name) WHERE client_id IS NULL;
UPDATE client_detections SET client_id = (SELECT id FROM clients_v2 WHERE name = client_detections.client_name) WHERE client_id IS NULL;
```

Test: Create clients + threads + insights + milestones with `client_name` FK, run `migrate(db)`, verify `client_id` is populated with correct UUID.

---

**Burst 4: Drop old clients, rename, auto-bootstrap**

In `migrate()`:
- Drop `clients` table, rename `clients_v2` → `clients`
- If `tenants` is empty AND `clients` has rows: create default tenant + owner user + membership, set `tenant_id` on all clients

Test: Full migration from old schema → new schema with auto-bootstrap. Verify: tenant exists, owner user exists, membership with `role: "owner"` exists, all clients have `tenant_id` set.

---

#### Section 2: Core Functions — Client Registry

**Burst 5: seedClients(db, filePath, tenantId)**

Update `seedClients` to accept `tenantId` parameter. INSERT uses `id` as PK (already does `randomUUID()`). Sets `tenant_id` on new rows. UPDATE preserves `tenant_id`. Existing behavior preserved when `tenantId` defaults to the bootstrap tenant.

Test: `seedClients(db, path, tenantId)` creates clients under the specified tenant. Re-running upserts existing clients without changing `tenant_id`.

---

**Burst 6: getClientByName(db, name, tenantId), getAllClients(db, tenantId)**

Add `tenantId` parameter (optional for backwards compat during migration). When provided, queries add `WHERE tenant_id = ?`. `getAllClients(db)` without tenantId returns all (existing behavior for Electron app).

Test: Two tenants with same-named client → `getClientByName(db, "Acme", tenantA)` returns tenant A's client. `getAllClients(db, tenantA)` excludes tenant B's clients.

---

**Burst 7: getClientByAlias, getDefaultClient, getGlossaryForClient — tenant-scoped**

Add optional `tenantId` parameter to each. `getDefaultClient(db, tenantId)` returns the default client within the tenant.

Test: Tenant A has default client X, tenant B has default client Y → correct scoping.

---

**Burst 8: buildClientContext — callers pass client by ID**

No signature change to `buildClientContext` itself (it takes name + teams + prompt, not db). But verify that callers look up client by `id` (UUID) and pass the resolved data.

Test: Verify `buildClientContext` works unchanged. Integration test: look up client by ID, pass to `buildClientContext`.

---

#### Section 3: Core Functions — Domain Features

**Burst 9: client-detection.ts — storeDetection writes client_id**

`storeDetection(db, meetingId, results)` now writes `client_id` (UUID) from the detection result. `detectClient` returns `client_id` alongside `client_name` in `DetectionResult`.

Test: `detectClient` + `storeDetection` → `client_detections` row has both `client_name` and `client_id`.

---

**Burst 10: threads.ts — client_id in queries**

`createThread` stores `client_id`. `listThreadsByClient(db, clientId)` queries by `client_id`. Keep `client_name` writes for backwards compat.

Test: `createThread` with `client_id` → `listThreadsByClient(db, clientId)` returns it. Old `client_name` query still works.

---

**Burst 11: insights.ts — client_id in queries**

Same pattern as threads. `createInsight`, `listInsightsByClient`, `discoverMeetingsForPeriod` use `client_id`.

Test: Insight CRUD scoped by `client_id`.

---

**Burst 12: timelines.ts — milestones use client_id**

`createMilestone`, `listMilestonesByClient`, `reconcileMilestones` use `client_id`.

Test: Milestone CRUD scoped by `client_id`.

---

**Burst 13: item-dedup.ts + deep-dedup.ts — client scoping via client_id**

`deduplicateItems` and `deepScanClient` filter by `client_id` instead of `client_name` when querying meetings and items.

Test: Dedup finds items only within the correct client (by ID).

---

**Burst 14: pipeline.ts — pass client_id through pipeline**

`processNewMeetings` and `processWebhookMeetings` carry `client_id` (from `detectClient` result) through all downstream calls: extraction, FTS, dedup, embedding, thread evaluation.

Test: Pipeline with stub LLM → all downstream records have `client_id` set.

---

**Burst 15: context.ts + labeled-context.ts — client filtering by ID**

`buildContext` and `buildLabeledContext` filter meetings by `client_id` when a client filter is provided.

Test: Context building with two clients → only the filtered client's meetings appear.

---

#### Section 4: API + Handlers

**Burst 16: resolveClient helper**

New file `core/resolve-client.ts`:
```ts
function resolveClient(db: Database, clientParam: string, tenantId?: string): ClientRow | null
```
Accepts either a client name or UUID. If it looks like a UUID (matches UUID regex), queries by `id`. Otherwise queries by `name`. If `tenantId` provided, scopes to that tenant.

Test: Resolve by name, by UUID, by name+tenantId, not-found returns null.

---

**Burst 17: Update meeting routes**

`GET /api/meetings?client=X` — resolve `X` via `resolveClient(db, X)`, use resolved `client_id` for filtering. `GET /api/clients` returns client objects with `id` field (not just name strings).

Test: `GET /api/meetings?client=<uuid>` works. `GET /api/meetings?client=<name>` still works.

---

**Burst 18: Update thread, insight, milestone routes**

Same `resolveClient` pattern for `?client=` params on threads, insights, milestones routes.

Test: Thread/insight/milestone list endpoints accept both name and UUID.

---

**Burst 19: Update ElectronAPI interface + IPC handlers**

Add `clientId` fields to relevant request types in `channels.ts`. IPC handlers use `client_id`. Backwards-compatible — `client_name` still accepted.

Test: IPC calls with `clientId` parameter work.

---

**Burst 20: Update api-client/ modules**

HTTP client modules pass `clientId` when available. Falls back to `clientName` for backwards compat.

Test: api-client functions send correct query params.

---

#### Section 5: Documentation

**Burst 21: Update scatter.md files**

Update `core/scatter.md`, `api/scatter.md`, `api/routes/scatter.md` to reflect:
- Tenant model
- `clients` PK change
- `client_id` columns on domain tables
- `resolveClient` helper

---

## Phase 2: OAuth Authorization Layer

Auth is **opt-in** via `MTNINSIGHTS_AUTH_ENABLED=1` — existing workflow unaffected. When enabled, all routes require valid tokens except OAuth endpoints and health check.

### Dependencies

- `jose` — JWT signing/verification (RS256, Web Crypto API, no native deps)
- No other new runtime deps. Hashing via `node:crypto`.

### Scopes

| Scope | Covers |
|-------|--------|
| `meetings:read` | GET meetings, artifacts, action items, transcripts, completions, mention-stats, templates, clients, glossary |
| `meetings:write` | POST/PUT/DELETE/PATCH meetings, action items, re-extract, reassign, ignored, rename, assets, chat, messages |
| `search:execute` | GET search, POST chat, conversation, deep-search, re-embed |
| `threads:read` | GET threads, thread meetings, candidates, messages |
| `threads:write` | POST/PUT/DELETE threads, evaluate, regenerate, chat, messages |
| `insights:read` | GET insights, insight meetings, messages |
| `insights:write` | POST/PUT/DELETE insights, generate, discover, chat, messages |
| `milestones:read` | GET milestones, mentions, slippage, action-items, messages |
| `milestones:write` | POST/PUT/DELETE milestones, merge, confirm/reject, link/unlink, chat, messages |
| `notes:read` | GET notes, count |
| `notes:write` | POST/PATCH/DELETE notes |
| `admin` | debug endpoint, re-embed-all, pipeline ops |

### Auth Tables

```sql
CREATE TABLE IF NOT EXISTS oauth_clients (
  client_id TEXT PRIMARY KEY,             -- UUID (NOTE: this is an OAuth client, not a business client)
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  client_secret_hash TEXT,                -- NULL for public clients (PKCE-only)
  name TEXT NOT NULL,
  grant_types TEXT NOT NULL,              -- JSON array: ["client_credentials", "authorization_code"]
  scopes TEXT NOT NULL,                   -- JSON array of allowed scopes
  redirect_uris TEXT,                     -- JSON array, required for auth code flow
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS oauth_tokens (
  jti TEXT PRIMARY KEY,                   -- JWT ID for revocation lookup
  oauth_client_id TEXT NOT NULL REFERENCES oauth_clients(client_id),
  user_id TEXT REFERENCES users(id),      -- NULL for client_credentials flow
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  scopes TEXT NOT NULL,                   -- JSON array of granted scopes
  token_type TEXT NOT NULL,               -- 'access' | 'refresh'
  expires_at TEXT NOT NULL,
  revoked INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
  code TEXT PRIMARY KEY,
  oauth_client_id TEXT NOT NULL REFERENCES oauth_clients(client_id),
  user_id TEXT NOT NULL REFERENCES users(id),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  redirect_uri TEXT NOT NULL,
  scopes TEXT NOT NULL,                   -- JSON array
  code_challenge TEXT NOT NULL,           -- PKCE S256 challenge
  code_challenge_method TEXT NOT NULL DEFAULT 'S256',
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS api_keys (
  key_hash TEXT PRIMARY KEY,              -- SHA-256 hash of the plaintext key
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,                     -- human label, e.g. "My MCP Key"
  prefix TEXT NOT NULL,                   -- first 8 chars for display (mki_xxxx...)
  scopes TEXT NOT NULL,                   -- JSON array
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT,
  revoked INTEGER DEFAULT 0
);
```

**Naming note:** `oauth_clients` are OAuth application registrations (MCP server, CLI tool, etc.). `clients` are business clients (Emmett, etc.). The naming avoids collision.

### JWT Claims

```json
{
  "iss": "mtninsights",
  "sub": "<user_id or oauth_client_id>",
  "aud": "mtninsights-api",
  "tid": "<tenant_id>",
  "scope": "meetings:read meetings:write search:execute",
  "jti": "<uuid>",
  "iat": 1234567890,
  "exp": 1234571490
}
```

- `sub`: user ID for authorization_code flow, oauth_client_id for client_credentials flow
- `tid`: tenant ID — middleware uses this to scope all downstream queries
- `scope`: space-separated list of granted scopes

### Auth Middleware Flow

```
Request → Extract Authorization header
  ├─ No header + auth disabled → pass through (no tenant context attached)
  ├─ No header + auth enabled → 401 Unauthorized
  ├─ "Bearer <jwt>" → verify RS256 signature + expiry check + not-revoked (DB lookup)
  │     → extract { tenantId, userId, scopes } → attach to Hono context
  ├─ "Bearer mki_<key>" → SHA-256 hash → lookup in api_keys table → not-revoked check
  │     → extract { tenantId, userId, scopes } → attach to Hono context → update last_used_at
  └─ Invalid format → 401 Unauthorized

Then: check required scope for the matched route
  ├─ Route scope ⊆ context scopes → next()
  └─ Missing scope → 403 Forbidden

All downstream handlers receive tenantId from Hono context — enforced at middleware, not handler level.
```

**Bypass list** (no auth required): `/.well-known/oauth-authorization-server`, `/oauth/token`, `/oauth/authorize`, `/oauth/register`, `/oauth/revoke`, `GET /health` (if added)

### OAuth Endpoints (API Contracts)

```
GET /.well-known/oauth-authorization-server
  → {
      issuer: "mtninsights",
      authorization_endpoint: "/oauth/authorize",
      token_endpoint: "/oauth/token",
      registration_endpoint: "/oauth/register",
      revocation_endpoint: "/oauth/revoke",
      scopes_supported: ["meetings:read", "meetings:write", ...],
      response_types_supported: ["code"],
      grant_types_supported: ["client_credentials", "authorization_code"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["client_secret_post", "none"]
    }

POST /oauth/register
  body: { client_name: string, redirect_uris?: string[], grant_types: string[], scope: string }
  → 201 { client_id: string, client_secret?: string, client_name, redirect_uris, grant_types, scope }
  Note: client_secret only returned for confidential clients (client_credentials grant). Store it — not retrievable later.

GET /oauth/authorize?response_type=code&client_id=<id>&redirect_uri=<uri>&scope=<scopes>&code_challenge=<challenge>&code_challenge_method=S256&state=<state>
  → HTML consent form (single-owner: enter passphrase to approve)

POST /oauth/authorize
  body: { client_id, redirect_uri, scope, code_challenge, code_challenge_method, state, owner_secret }
  → 302 redirect to redirect_uri?code=<auth_code>&state=<state>
  Errors: 401 (bad owner_secret), 400 (invalid client_id or redirect_uri)

POST /oauth/token
  --- Client Credentials ---
  body: { grant_type: "client_credentials", client_id, client_secret, scope? }
  → { access_token: "<jwt>", token_type: "Bearer", expires_in: 3600, scope: "<granted scopes>" }

  --- Authorization Code ---
  body: { grant_type: "authorization_code", code, redirect_uri, client_id, code_verifier }
  → { access_token: "<jwt>", token_type: "Bearer", expires_in: 3600, refresh_token: "<jwt>", scope: "<granted scopes>" }

  --- Refresh ---
  body: { grant_type: "refresh_token", refresh_token, client_id, scope? }
  → { access_token: "<jwt>", token_type: "Bearer", expires_in: 3600, refresh_token: "<jwt>", scope: "<granted scopes>" }

  Errors: 400 (invalid grant), 401 (bad credentials/code), 403 (scope exceeds client's allowed scopes)

POST /oauth/revoke
  body: { token: "<access_token or refresh_token>", token_type_hint?: "access_token" | "refresh_token" }
  → 200 {} (always succeeds per RFC 7009, even if token is already invalid)
```

### Token Details

- **Signing**: RS256 (auto-generated RSA 2048 key pair on first startup, stored in `.keys/private.pem` + `.keys/public.pem`, directory gitignored)
- **Access token**: 1 hour (3600 seconds)
- **Refresh token**: 30 days
- **Authorization code**: 10 minutes
- **API keys**: no expiry, revocable via CLI or API
- **Owner auth**: `MTNINSIGHTS_OWNER_SECRET` env var, verified during authorization code consent flow

### New Files (Phase 2)

```
core/auth/
  scopes.ts             — scope enum, isValidScope, routeScopes map (route pattern → required scope)
  jwt.ts                — generateKeyPair, loadOrCreateKeys, signAccessToken, verifyAccessToken,
                          signRefreshToken, verifyRefreshToken
  api-keys.ts           — generateApiKey (prefix mki_ + 32 random bytes), hashApiKey,
                          createApiKey, validateApiKey, revokeApiKey, listApiKeys
  oauth-clients.ts      — registerOAuthClient, getOAuthClient, authenticateOAuthClient,
                          revokeOAuthClient, listOAuthClients
  token-service.ts      — issueTokenPair, refreshTokens, revokeToken, isTokenRevoked
  pkce.ts               — generateCodeVerifier, computeCodeChallenge, verifyCodeChallenge
  auth-codes.ts         — createAuthorizationCode, exchangeAuthorizationCode

api/middleware/
  auth.ts               — createAuthMiddleware(db, keys, enabled) — Hono middleware

api/routes/
  oauth.ts              — registerOAuthRoutes(app, db, keys) — all OAuth endpoints

cli/
  manage-auth.ts        — CLI for creating OAuth clients, API keys, owner setup
```

### Dependency Graph & Parallelization (Phase 2)

```
Section 6 — Sequential (foundational auth primitives)
  Burst 22: scopes.ts
  Burst 23: auth tables in db.ts
  Burst 24-25: jwt.ts (sign + verify)
      │
Section 7-8 — 2 parallel agents (independent modules)
      ├── Agent A: Bursts 26-27 (api-keys.ts)
      └── Agent B: Bursts 28-29 (oauth-clients.ts)
      │
Section 9-10 — 2 parallel agents (independent modules)
      ├── Agent A: Bursts 30-32 (token-service.ts)
      └── Agent B: Bursts 33-34 (pkce.ts + auth-codes.ts)
      │
Section 11 — Sequential (middleware depends on all above)
  Burst 35: auth middleware
  Burst 36: wire into server.ts
      │
Section 12 — Sequential (routes depend on middleware + all core/auth)
  Burst 37: POST /oauth/token (client_credentials)
  Burst 38: GET+POST /oauth/authorize (auth code + PKCE + consent)
  Burst 39: POST /oauth/token (authorization_code grant)
  Burst 40: POST /oauth/revoke
  Burst 41: GET /.well-known/oauth-authorization-server
  Burst 42: POST /oauth/register
      │
Section 13-14 — Sequential (CLI + integration wiring)
  Burst 43-44: manage-auth CLI
  Burst 45-47: integration + gitignore + docs
```

**Why these boundaries:**
- Sections 7-8 are parallel: `api-keys.ts` and `oauth-clients.ts` have no imports from each other
- Sections 9-10 are parallel: `token-service.ts` uses jwt.ts (already landed), `pkce.ts` + `auth-codes.ts` are self-contained
- Section 11 must follow all core/auth modules — middleware imports from all of them
- Section 12 is sequential because each route burst builds on the prior (shared `registerOAuthRoutes` function)

### Phase 2 Ketchup Bursts (Detailed)

#### Section 6: Auth Infrastructure

**Burst 22: core/auth/scopes.ts**

Scope definitions and route-to-scope mapping:
```ts
const VALID_SCOPES = ["meetings:read", "meetings:write", "search:execute", ...] as const;
type Scope = typeof VALID_SCOPES[number];
function isValidScope(s: string): s is Scope;
function scopesForRoute(method: string, path: string): Scope[];
```

`scopesForRoute` maps HTTP method + path pattern to required scopes. Patterns use simple prefix matching: `GET /api/meetings` → `meetings:read`, `POST /api/meetings` → `meetings:write`.

Test: `isValidScope` validates, `scopesForRoute` maps all 83 routes correctly.

---

**Burst 23: Auth tables in core/db.ts**

Add 4 new CREATE TABLE statements to `migrate()` for `oauth_clients`, `oauth_tokens`, `oauth_authorization_codes`, `api_keys`.

Test: `migrate(db)` creates all 4 tables. PRAGMA table_info verifies columns.

---

**Burst 24: core/auth/jwt.ts — key management + access tokens**

- `generateKeyPair()` → `{ publicKey, privateKey }` (RSA 2048, via `jose.generateKeyPair`)
- `loadOrCreateKeys(keysDir)` → loads from `.keys/` or generates + saves
- `signAccessToken(privateKey, claims)` → JWT string (RS256, 1 hour expiry)
- `verifyAccessToken(publicKey, token)` → decoded claims or throws

Test: Generate keys, sign token, verify token. Expired token → throws. Tampered token → throws.

---

**Burst 25: core/auth/jwt.ts — refresh tokens**

- `signRefreshToken(privateKey, claims)` → JWT string (RS256, 30 day expiry)
- `verifyRefreshToken(publicKey, token)` → decoded claims or throws

Test: Sign + verify refresh token. Different expiry from access token.

---

#### Section 7: API Key Support

**Burst 26: core/auth/api-keys.ts — generate + validate**

- `generateApiKey()` → `{ key: "mki_<64 hex chars>", hash: "<sha256>" }` (key shown once, hash stored)
- `hashApiKey(key)` → SHA-256 hex digest
- `createApiKey(db, { tenantId, userId, name, scopes })` → `{ key, prefix, hash }`
- `validateApiKey(db, key)` → `{ tenantId, userId, scopes }` or null (+ updates `last_used_at`)

Test: Generate → validate round-trip. Invalid key → null. Revoked key → null.

---

**Burst 27: core/auth/api-keys.ts — revoke + list**

- `revokeApiKey(db, keyHash)` → sets `revoked = 1`
- `listApiKeys(db, tenantId)` → `Array<{ prefix, name, scopes, created_at, last_used_at, revoked }>`

Test: List returns keys for tenant. Revoked key excluded from validation.

---

#### Section 8: OAuth Client Management

**Burst 28: core/auth/oauth-clients.ts — register + authenticate**

- `registerOAuthClient(db, { tenantId, name, grantTypes, scopes, redirectUris })` → `{ clientId, clientSecret? }`
  - Generates UUID `clientId`, random `clientSecret` (hashed with SHA-256 before storage)
  - `clientSecret` only generated for confidential clients (those with `client_credentials` grant)
- `getOAuthClient(db, clientId)` → `OAuthClientRow | null`
- `authenticateOAuthClient(db, clientId, clientSecret)` → `OAuthClientRow | null`

Test: Register → authenticate round-trip. Wrong secret → null. Public client (no secret) → authenticate with null secret works.

---

**Burst 29: core/auth/oauth-clients.ts — revoke + list**

- `revokeOAuthClient(db, clientId)` → sets `revoked = 1`
- `listOAuthClients(db, tenantId)` → client list (excludes secret hash)

Test: Revoked client fails authentication. List scoped by tenant.

---

#### Section 9: Token Service

**Burst 30: token-service.ts — issueTokenPair**

- `issueTokenPair(db, { oauthClientId, userId, tenantId, scopes }, keys)` → `{ access_token, refresh_token?, expires_in, scope }`
  - Creates `oauth_tokens` rows for both access + refresh (with JTIs)
  - `refresh_token` only for authorization_code flow (not client_credentials)

Test: Issue pair → decode JWTs → verify claims. Token rows exist in DB.

---

**Burst 31: token-service.ts — refreshTokens**

- `refreshTokens(db, refreshToken, keys)` → new token pair
  - Validates refresh token signature + expiry + not-revoked
  - Revokes old refresh token, issues new pair

Test: Refresh → old refresh token revoked, new pair valid.

---

**Burst 32: token-service.ts — revokeToken + isTokenRevoked**

- `revokeToken(db, jti)` → sets `revoked = 1`
- `isTokenRevoked(db, jti)` → boolean

Test: Revoke → isTokenRevoked returns true. Unrevoked → false.

---

#### Section 10: PKCE + Authorization Codes

**Burst 33: core/auth/pkce.ts**

- `generateCodeVerifier()` → random 43-128 char string (RFC 7636)
- `computeCodeChallenge(verifier)` → Base64URL(SHA256(verifier))
- `verifyCodeChallenge(verifier, challenge)` → boolean

Test: Generate verifier → compute challenge → verify succeeds. Wrong verifier → fails.

---

**Burst 34: core/auth/auth-codes.ts**

- `createAuthorizationCode(db, { oauthClientId, userId, tenantId, redirectUri, scopes, codeChallenge })` → code string (random 32 bytes, hex)
  - Stores in `oauth_authorization_codes` with 10-minute expiry
- `exchangeAuthorizationCode(db, { code, clientId, redirectUri, codeVerifier })` → `{ userId, tenantId, scopes }` or throws
  - Validates: code exists, not expired, not used, clientId matches, redirectUri matches, PKCE verifier matches challenge
  - Marks code as used

Test: Create → exchange round-trip. Expired code → throws. Used code → throws. Wrong verifier → throws. Wrong redirect → throws.

---

#### Section 11: Auth Middleware

**Burst 35: api/middleware/auth.ts**

`createAuthMiddleware(db, publicKey, enabled)` returns a Hono middleware:
- If `!enabled`, returns no-op middleware
- Extracts `Authorization: Bearer <token>` header
- If token starts with `mki_`: validates as API key via `validateApiKey(db, token)`
- Otherwise: validates as JWT via `verifyAccessToken(publicKey, token)` + `isTokenRevoked(db, jti)`
- On success: attaches `{ tenantId, userId, scopes }` to Hono context via `c.set("auth", {...})`
- On failure: returns `401 { error: "unauthorized" }`

Then a scope-checking middleware:
- Reads route's required scopes via `scopesForRoute(method, path)`
- Checks if `auth.scopes` includes the required scope
- Missing → `403 { error: "forbidden", required_scope: "..." }`

Test (using Hono `app.request()`): No header → 401. Valid JWT → 200. Expired JWT → 401. API key → 200. Wrong scope → 403. Revoked token → 401. Auth disabled → all pass.

---

**Burst 36: Wire middleware into api/server.ts**

Update `createApp` to accept optional auth config:
```ts
interface AuthConfig { publicKey: CryptoKey; enabled: boolean; }
```

Attach auth middleware before route registration. Bypass list for OAuth + health endpoints.

Test: `createApp` with auth enabled rejects unauthenticated requests. With auth disabled, passes all through.

---

#### Section 12: OAuth Routes

**Burst 37: POST /oauth/token (client_credentials)**

Validates `grant_type=client_credentials`, authenticates client via `client_id` + `client_secret`, issues access token (no refresh token). Scope is intersection of requested scope and client's allowed scopes.

Test: Valid credentials → token. Invalid secret → 401. Unknown client → 401. Scope exceeds allowed → 400.

---

**Burst 38: GET+POST /oauth/authorize**

GET renders a simple HTML consent form. POST validates `owner_secret` against `MTNINSIGHTS_OWNER_SECRET` env var, creates authorization code, redirects to `redirect_uri?code=...&state=...`.

Test: GET returns HTML. POST with valid secret → 302 redirect with code. Bad secret → 401. Missing PKCE challenge → 400.

---

**Burst 39: POST /oauth/token (authorization_code)**

Validates `grant_type=authorization_code`, exchanges code via `exchangeAuthorizationCode`, issues token pair (access + refresh).

Test: Valid code + verifier → token pair. Invalid code → 401. Invalid verifier → 401.

---

**Burst 40: POST /oauth/revoke**

Decodes token to extract JTI, revokes in DB. Always returns 200 per RFC 7009.

Test: Revoke valid token → 200, token is revoked. Revoke invalid token → 200 (no error).

---

**Burst 41: GET /.well-known/oauth-authorization-server**

Returns server metadata JSON per RFC 8414. All values derived from current configuration.

Test: Response matches expected schema. Scopes list is complete.

---

**Burst 42: POST /oauth/register (RFC 7591)**

Dynamic client registration. Creates OAuth client. Returns `client_id` + `client_secret` (for confidential clients). Required for MCP protocol compatibility.

Test: Register → get client → authenticates. Public client (no secret) → works for auth code flow.

---

#### Section 13: Management CLI

**Burst 43: cli/manage-auth.ts — create subcommands**

```
mti-auth create-client --name <name> --grant-types client_credentials,authorization_code --scopes meetings:read,meetings:write --redirect-uris http://localhost:8080/callback
mti-auth create-api-key --name "My Key" --scopes meetings:read,search:execute
```

Both print credentials to stdout (shown once).

Test: CLI creates records in DB. Credentials are valid.

---

**Burst 44: cli/manage-auth.ts — list + revoke**

```
mti-auth list-clients
mti-auth list-api-keys
mti-auth revoke-client <client_id>
mti-auth revoke-api-key <prefix>
```

Test: List returns records. Revoke marks as revoked.

---

#### Section 14: Integration

**Burst 45: Update api/main.ts**

Load signing keys from `.keys/` (auto-generate if absent). Read `MTNINSIGHTS_AUTH_ENABLED` and `MTNINSIGHTS_OWNER_SECRET`. Pass auth config to `createApp`.

Test: Server starts with auth enabled. Server starts with auth disabled (existing behavior).

---

**Burst 46: Update api/server.ts signature**

Accept optional `AuthConfig` parameter. Pass to middleware + OAuth route registration.

Test: `createApp` with and without auth config.

---

**Burst 47: gitignore + docs**

Add `.keys/` to `.gitignore`. Update `api/scatter.md` with new env vars and OAuth routes. Update `core/scatter.md` with `core/auth/` module descriptions. Create `core/auth/scatter.md`.

---

## Verification

### Phase 1

1. `pnpm test --run` — all existing tests pass with migrated schema
2. `seedClients(db, path, tenantId)` creates clients under the specified tenant
3. `getAllClients(db, tenantId)` returns only that tenant's clients
4. `getAllClients(db)` (no tenantId) returns all clients — backwards compat
5. API routes with `?client=<name>` still work
6. API routes with `?client=<uuid>` also work
7. Domain features (threads, insights, milestones) query by `client_id`

### Phase 2

1. Auth disabled (default) → all routes open, all existing tests pass unchanged
2. Auth enabled → unauthenticated request to `/api/meetings` → 401
3. API key in `Authorization: Bearer mki_...` → 200
4. Client credentials: POST /oauth/token → access_token → bearer → 200
5. Auth code + PKCE: GET /oauth/authorize → consent → POST → code → POST /oauth/token → tokens → bearer → 200
6. Token with `meetings:read` scope → `GET /api/meetings` → 200, `DELETE /api/meetings` → 403
7. Revoked token → 401
8. JWT `tid` claim scopes data to the correct tenant
9. `GET /.well-known/oauth-authorization-server` returns valid metadata
10. `POST /oauth/register` creates functional OAuth client
