# Ketchup Plan: Tenancy Model + OAuth Authorization Layer

## Context

The API (83 routes, 7 groups) has zero auth — all endpoints are public, CORS allows all origins, no users/tenants/tokens exist. The `clients` table uses `name TEXT` as primary key and has no ownership concept; all data is globally visible.

**Why now:** Before exposing the API as an MCP service, we need an authorization layer. Before adding auth, we need a tenant construct — otherwise tokens have nothing to scope data against. The tenant model also positions the app for multi-user/multi-org use if it goes public.

**Two phases, strict order:**
1. **Phase 1 — Tenancy data model:** Add tenants, users, memberships. Migrate `clients` PK from `name` to UUID `id`. Add `tenant_id` FK. Update all code that references `client_name` to use `client_id`. Auto-bootstrap a default tenant for existing data.
2. **Phase 2 — OAuth authorization:** Built-in OAuth 2.0 AS with API keys, client credentials, and authorization code + PKCE. Opt-in via env var — existing workflow unaffected.

**Auth independence:** Phase 2 is opt-in (`MTNINSIGHTS_AUTH_ENABLED=1`). When disabled, middleware is a no-op. Phase 1 can land and be tested independently. Phase 2 can land without breaking the Electron app or web dev mode.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth server | Built-in OAuth AS | Self-contained, no external IdP dependency, aligns with MCP spec |
| User model | Single owner | One admin account now, expandable to multi-user later |
| Scopes | Resource-type (`meetings:read`, etc.) | Controls operations, not data visibility — data isolation is via tenant |
| Client IDs | UUID | Non-enumerable (IDOR prevention), consistent with all other entities |
| Client PK | Full migration `name` → UUID `id` | Clean break — avoids tech debt of mixed identifier schemes |
| Tenant bootstrap | Auto-create default tenant | Zero-friction for single-owner, no manual setup step |
| User permissions | `role` column, no enforcement | Schema supports RBAC later; no middleware enforcement in this phase |
| Naming convention | Add `clientId` (camelCase) to all request types | Normalizes existing inconsistency |
| Vector DB metadata | Dual-write | New vectors get both `client` (name) + `client_id` (UUID); legacy vectors keep name-only; search tries UUID first, falls back to name |

## Tooling & Stack

- **Runtime**: Node.js (ESM, `"type": "module"` in package.json)
- **Language**: TypeScript 5.9, strict mode, `module: "NodeNext"`, `moduleResolution: "NodeNext"`
- **HTTP framework**: Hono 4.12 — middleware via `app.use()`, routes via `app.get/post/put/patch/delete`
- **Database**: SQLite via `node:sqlite` (`DatabaseSync` — synchronous API, no async), in-memory for tests (`:memory:`)
- **Vector DB**: LanceDB 0.26 — Arrow-based, async API, 384-dim float32 vectors
- **Embeddings**: ONNX Runtime 1.24 — `all-MiniLM-L6-v2`, loaded separately from DB
- **LLM**: Pluggable adapter pattern (`LlmAdapter` interface, 6 providers), stub provider for tests
- **Validation**: Zod v4 for schema validation
- **Testing**: Vitest 4.0, test files at `test/**/*.test.ts`, 100% branch coverage enforced
- **Package manager**: pnpm
- **New dependency**: `jose` (JWT signing/verification, RS256, Web Crypto API based, no native deps)
- **Hashing**: `node:crypto` (SHA-256 for API keys, randomUUID for IDs)

**Key patterns agents must follow:**
- All `core/` modules export pure functions that take `db: DatabaseSync` as first arg
- `core/` is the dependency sink — never imports from `api/` or `electron-ui/`
- `api/routes/` files export `registerXxxRoutes(app, db, llm?, searchDeps?)` functions
- API tests use `app.request(path)` on a Hono app created with in-memory SQLite
- Core tests use `createDb(":memory:")` + `migrate(db)` for isolation
- TCR: `pnpm test --run && git add -A && git commit -m "..." || git checkout -- .`

## Framework Quirks

1. **SQLite `node:sqlite` is synchronous** — `db.prepare().run()`, `.get()`, `.all()`. No promises. No `await`.
2. **SQLite FK enforcement is OFF** — `PRAGMA foreign_keys` never set. FK constraints are declarative documentation only.
3. **ALTER TABLE limitations** — SQLite cannot change PK or drop columns. Use table recreation pattern.
4. **Hono middleware ordering** — Middleware via `app.use()` runs in registration order. Auth middleware MUST be registered before route handlers.
5. **Hono context typing** — `c.set("auth", { tenantId, userId, scopes })` / `c.get("auth")`. Type via `new Hono<{ Variables: { auth: AuthContext } }>()`.
6. **`createApp` is a pure function** — Returns Hono app without starting listener. Auth config must be passed as parameter, not read from env inside.
7. **Migration is idempotent** — `migrate()` uses `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE` guards. Client PK migration must also be idempotent.
8. **`jose` CryptoKey objects** — `jose.generateKeyPair("RS256")` returns Web Crypto `CryptoKey` objects, NOT PEM strings. Save/load: `jose.exportPKCS8(privateKey)` → PEM, `jose.importPKCS8(pem, "RS256")` → CryptoKey. Do NOT `JSON.stringify` a CryptoKey.
9. **`jose` is async** — `SignJWT.sign()`, `jwtVerify()`, key import/export are all async. `core/auth/jwt.ts` and auth middleware must be async.

## Error Propagation Path

```
core/auth/* → throw typed errors (extend AppError from core/errors.ts)
  ↓
api/routes/oauth.ts → catch → HTTP status:
  InvalidGrantError → 400, InvalidClientError → 401,
  InsufficientScopeError → 403, TokenExpiredError → 401, TokenRevokedError → 401
  ↓
api/middleware/auth.ts → catch → 401 or 403
```

## Reference Files

| File | Why |
|------|-----|
| `core/db.ts` | Current schema — 21 tables, migration pattern |
| `core/client-registry.ts` | Client functions — all need tenant-scoping |
| `core/client-detection.ts` | `detectClient`, `storeDetection` — write `client_name` FK |
| `core/threads.ts` | `createThread`, `listThreadsByClient` — FK `client_name` |
| `core/insights.ts` | `createInsight`, `listInsightsByClient` — FK `client_name` |
| `core/timelines.ts` | `createMilestone`, `listMilestonesByClient`, `reconcileMilestones`, `rejectMilestoneMention` |
| `core/pipeline.ts` | End-to-end pipeline passes client name through all stages |
| `core/feedback.ts` | `overrideClient` writes `client_name` to client_detections |
| `core/deep-dedup.ts` | `deepScanClient` takes `clientName` param |
| `core/meeting-pipeline.ts` | Vector metadata stores `client` as name string |
| `core/context.ts` | Vector filter uses `client` name field |
| `core/vector-search.ts` | KNN search with client name filter |
| `core/hybrid-search.ts` | Hybrid search with client name filter |
| `api/server.ts` | Hono app creation, middleware, routes |
| `api/main.ts` | Server startup, env vars |
| `electron-ui/electron/channels.ts` | `ElectronAPI` interface — 58 methods |
| `electron-ui/electron/handlers/` | 4 handler files with direct `client_name` SQL |
| `electron-ui/ui/src/hooks/useThreadState.ts` | Passes `client_name` to createThread |
| `electron-ui/ui/src/hooks/useInsightState.ts` | Passes `client_name` to createInsight |
| `cli/admin-util/assign-client.ts` | Raw SQL with `client_name` |
| `cli/admin-util/all-items-dedupe.ts` | Raw SQL subselect on `client_name` |
| `test/api-debug.test.ts` | Example Hono `app.request()` test pattern |

## Testing Strategy

- **Per-burst TDD**: Every burst starts with a failing test, writes minimal passing code, then TCR
- **In-memory SQLite**: All tests use `createDb(":memory:")` + `migrate(db)`
- **Shared test helpers**: `test/helpers/seed-test-tenant.ts` provides `seedTestTenant(db)` and `seedTestClient(db, tenantId, name)` (created in Burst 1b)
- **Stub LLM**: Domain feature tests use stub adapter
- **100% coverage enforced**: No escape hatches on new files
- **Existing tests must pass**: Migration is backwards-compatible
- **Integration tests**: Phase 2 uses Hono `app.request()` for middleware → route → handler chain

**OAuth route test setup pattern:**
```ts
let app: ReturnType<typeof createApp>;
let db: DatabaseSync;
let keys: { publicKey: CryptoKey; privateKey: CryptoKey };

beforeAll(async () => {
  db = createDb(":memory:");
  migrate(db);
  keys = await generateKeyPair();
  const { tenantId, userId } = seedTestTenant(db);
  const { clientId, clientSecret } = registerOAuthClient(db, {
    tenantId, name: "test-client",
    grantTypes: ["client_credentials", "authorization_code"],
    scopes: ["meetings:read", "meetings:write"],
    redirectUris: ["http://localhost:8080/callback"],
  });
  app = createApp(db, ":memory:", undefined, undefined, undefined, { publicKey: keys.publicKey, enabled: true });
});
```

---

## Phase 1: Tenancy Data Model

### Phase 1 Behavioral Invariant

After Phase 1, **no user-visible behavior changes.** The same user sees the same meetings, threads, insights, milestones, and search results. The migration is purely internal:
- Client names still work as identifiers in API query params
- All existing data is preserved under a default tenant
- The Electron app and web dev mode continue to work without auth tokens
- Tests assert the same observable behavior via different query paths (`client_id` instead of `client_name`)

### New Tables

```sql
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenant_memberships (
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tenant_id, user_id)
);
```

### Client PK Migration Strategy

Bursts 2-4 are wrapped in a single idempotency guard:
```ts
const clientPkInfo = db.prepare("PRAGMA table_info(clients)").all();
const needsMigration = clientPkInfo.some(c => c.name === "name" && c.pk === 1);
if (needsMigration) { /* Bursts 2-4 */ }
```

1. Backfill NULL ids: `UPDATE clients SET id = <uuid> WHERE id IS NULL`
2. Create `clients_v2` with `id TEXT PRIMARY KEY`, `tenant_id TEXT`, `name TEXT` + all existing columns
3. Copy rows from `clients` → `clients_v2`
4. Add `client_id TEXT` to `threads`, `insights`, `milestones`, `client_detections`, populate via JOIN
5. Drop `clients`, rename `clients_v2` → `clients`
6. Auto-bootstrap: create default tenant, owner user, assign all clients

### Shared File Collision Map (Phase 1)

| File | Touched by | Strategy |
|------|------------|----------|
| `core/db.ts` | Bursts 1-4 (sequential) | No collision |
| Section 3 agent files | 3 separate agents, zero shared files | No collision |
| `api/server.ts` | Burst 17 only | No collision |

### Dependency Graph (Phase 1)

```
Section 1 — Sequential (schema, must be first)
  Burst 1 → 1b → 2 → 3 → 4
      │
Section 2 — Sequential (client-registry, depends on new schema)
  Burst 5 → 6 → 7 → 8
      │
Section 3 — 3 parallel agents (independent domain files)
      ├── Agent A: Bursts 9, 14, 15b
      ├── Agent B: Bursts 10, 11
      └── Agent C: Bursts 12, 13, 15
      │
Section 4 — Sequential (API layer, depends on all core changes)
  Burst 16 → 17 → 18 → 19 → 20 → 20b
      │
Section 5 — Sequential
  Burst 21
```

### Phase 1 Bursts

#### Section 1: Schema + Migration

- [x] Burst 1: Add `tenants`, `users`, `tenant_memberships` tables to `core/db.ts` `migrate()`
- [x] Burst 1b: Create `test/helpers/seed-test-tenant.ts` — `seedTestTenant(db)` returns `{ tenantId, userId }`, `seedTestClient(db, tenantId, name)` creates client with UUID
- [x] Burst 2: Client PK migration — backfill NULL ids, create `clients_v2`, copy data. Wrapped in idempotency guard.
- [x] Burst 3: Add `client_id TEXT` columns to `threads`, `insights`, `milestones`, `client_detections` + populate from JOIN
- [x] Burst 4: Drop old `clients`, rename `clients_v2` → `clients`, auto-bootstrap default tenant + owner user

#### Section 2: Core Functions — Client Registry

- [x] Burst 5: `seedClients(db, filePath, tenantId?)` — optional `tenantId` defaults to bootstrap tenant. Backwards-compatible for `local-service/main.ts`, `cli/admin-util/run.ts`, `cli/admin-util/setup.ts`. (a4fabc2)
- [x] Burst 6: `getClientByName(db, name, tenantId?)`, `getAllClients(db, tenantId?)` — tenant-scoped when provided
- [x] Burst 7: `getClientByAlias`, `getDefaultClient`, `getGlossaryForClient` — tenant-scoped
- [x] Burst 8: `buildClientContext` — callers look up client by ID, pass resolved data

#### Section 3: Core Functions — Domain Features (3 parallel agents)

**Agent A** — `core/client-detection.ts`, `core/pipeline.ts`, `core/feedback.ts`:
- [x] Burst 9: `client-detection.ts` — `DetectionResult` gains `client_id`. `storeDetection` writes `client_id`. `detectClient` returns `client_id`.
- [x] Burst 14: `pipeline.ts` — pass `client_id` through pipeline. Use `reconcileMilestones(db, clientId, ...)` (new signature from Agent C).
- [x] Burst 15b: `feedback.ts` — `overrideClient` writes `client_id` alongside `client_name`

**Agent B** — `core/threads.ts`, `core/insights.ts`:
- [x] Burst 10: `threads.ts` — `createThread` writes `client_id`. `listThreadsByClient(db, clientId)` queries by `client_id`. `Thread` and `CreateThreadInput` gain `client_id`.
- [x] Burst 11: `insights.ts` — same pattern. Plus: `generateInsight` resolves client name from `client_id` for `{{client_name}}` template substitution.

**Agent C** — `core/timelines.ts`, `core/deep-dedup.ts`, vector dual-write:
- [x] Burst 12: `timelines.ts` — ALL functions: `createMilestone`, `listMilestonesByClient`, `reconcileMilestones`, `rejectMilestoneMention`, `getMilestoneChatContext` — shift from `clientName` to `clientId`.
- [x] Burst 13: `deep-dedup.ts` — `deepScanClient` parameter `clientName` → `clientId`. Update log statements and `storeItemVector` calls. Note: no SQL `client_name` queries in this file.
- [x] Burst 15: Vector dual-write — `meeting-pipeline.ts` stores both `client` (name) + `client_id` (UUID) in vector metadata. `context.ts`, `vector-search.ts`, `hybrid-search.ts` use dual filter (try `client_id` first, fall back to `client` name).

#### Section 4: API + Handlers

- [x] Burst 16: New `core/resolve-client.ts` — `resolveClient(db, clientParam, tenantId?)` accepts name or UUID, returns `ClientRow | null`
- [x] Burst 17: Update meeting routes — `?client=` resolves via `resolveClient`. `GET /api/clients` returns objects with `id` field.
- [x] Burst 18: Update thread, insight, milestone routes — same `resolveClient` pattern
- [x] Burst 19: Update `ElectronAPI` interface (`channels.ts`), IPC handlers (4 handler files in `electron-ui/electron/handlers/`), and UI hooks (`useThreadState.ts`, `useInsightState.ts`) — add `clientId` fields
- [x] Burst 20: Update `api-client/` modules — pass client IDs
- [ ] Burst 20b: Update `cli/admin-util/assign-client.ts` and `cli/admin-util/all-items-dedupe.ts` — use `client_id`

#### Section 5: Documentation

- [ ] Burst 21: Update `core/scatter.md`, `api/scatter.md`, `api/routes/scatter.md` — tenant model, client PK change, `client_id` columns

---

## Phase 2: OAuth Authorization Layer

### Scopes

| Scope | Covers |
|-------|--------|
| `meetings:read` | GET meetings, artifacts, action items, transcripts, completions, mention-stats, templates, clients, glossary |
| `meetings:write` | POST/PUT/DELETE/PATCH meetings, action items, re-extract, reassign, ignored, rename, assets, chat, messages |
| `search:execute` | GET search, POST chat, conversation, deep-search |
| `threads:read` | GET threads, thread meetings, candidates, messages |
| `threads:write` | POST/PUT/DELETE threads, evaluate, regenerate, chat, messages |
| `insights:read` | GET insights, insight meetings, messages |
| `insights:write` | POST/PUT/DELETE insights, generate, discover, chat, messages |
| `milestones:read` | GET milestones, mentions, slippage, action-items, messages |
| `milestones:write` | POST/PUT/DELETE milestones, merge, confirm/reject, link/unlink, chat, messages |
| `notes:read` | GET notes, count |
| `notes:write` | POST/PATCH/DELETE notes |
| `admin` | debug, re-embed, re-embed-all, pipeline ops |

### Auth Tables

```sql
CREATE TABLE IF NOT EXISTS oauth_clients (
  client_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  client_secret_hash TEXT,
  name TEXT NOT NULL,
  grant_types TEXT NOT NULL,
  scopes TEXT NOT NULL,
  redirect_uris TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS oauth_tokens (
  jti TEXT PRIMARY KEY,
  oauth_client_id TEXT NOT NULL REFERENCES oauth_clients(client_id),
  user_id TEXT REFERENCES users(id),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  scopes TEXT NOT NULL,
  token_type TEXT NOT NULL,
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
  scopes TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  code_challenge_method TEXT NOT NULL DEFAULT 'S256',
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS api_keys (
  key_hash TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  scopes TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT,
  revoked INTEGER DEFAULT 0
);
```

### JWT Claims

```json
{
  "iss": "mtninsights",
  "sub": "<user_id or oauth_client_id>",
  "aud": "mtninsights-api",
  "tid": "<tenant_id>",
  "scope": "meetings:read meetings:write",
  "jti": "<uuid>",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Auth Middleware Flow

```
Request → Extract Authorization header
  ├─ No header + auth disabled → pass through
  ├─ No header + auth enabled → 401
  ├─ "Bearer <jwt>" → verify RS256 + expiry + not-revoked → extract { tenantId, userId, scopes }
  ├─ "Bearer mki_<key>" → SHA-256 hash → lookup api_keys → extract { tenantId, userId, scopes }
  └─ Invalid → 401

Then: check required scope for route
  ├─ Has scope → attach to Hono context → next()
  └─ Missing → 403
```

**Bypass list:** `/.well-known/oauth-authorization-server`, `/oauth/token`, `/oauth/authorize`, `/oauth/jwks`
**Requires owner secret:** `/oauth/register`

### OAuth Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/.well-known/oauth-authorization-server` | Server metadata (RFC 8414) |
| GET | `/oauth/jwks` | JSON Web Key Set (RFC 7517) |
| POST | `/oauth/register` | Dynamic client registration (RFC 7591, requires owner secret) |
| GET | `/oauth/authorize` | Consent form (owner passphrase check) |
| POST | `/oauth/authorize` | Process consent — issue auth code |
| POST | `/oauth/token` | Token endpoint — `client_credentials` + `authorization_code` + `refresh_token` |
| POST | `/oauth/revoke` | Token revocation (RFC 7009) |

### Token Details

- **Signing**: RS256, auto-generated RSA 2048 key pair in `.keys/` (gitignored)
- **Access token**: 1 hour
- **Refresh token**: 30 days
- **Authorization code**: 10 minutes
- **API keys**: no expiry, revocable
- **Owner auth**: `MTNINSIGHTS_OWNER_SECRET` env var

### Dependency Graph (Phase 2)

```
Section 6 — Sequential (auth primitives)
  Burst 22 → 23 → 24 → 25
      │
Sections 7-8 — 2 parallel agents
      ├── Agent A: Bursts 26, 27 (api-keys.ts)
      └── Agent B: Bursts 28, 29 (oauth-clients.ts)
      │
Sections 9-10 — 2 parallel agents
      ├── Agent A: Bursts 30, 31, 32 (token-service.ts)
      └── Agent B: Bursts 33, 34 (pkce.ts + auth-codes.ts)
      │
Section 11 — Sequential (middleware depends on all above)
  Burst 35 → 36
      │
Section 12 — Sequential (routes depend on middleware)
  Burst 37 → 38 → 39 → 40 → 41 → 41b → 42
      │
Section 13 — Sequential (CLI)
  Burst 43 → 44
      │
Section 14 — Sequential (integration)
  Burst 45 → 46 → 47
```

### Phase 2 Bursts

#### Section 6: Auth Infrastructure

- [ ] Burst 22: `core/auth/scopes.ts` — `Scope` type, `VALID_SCOPES`, `isValidScope`, `scopesForRoute` map, `AuthIdentity` interface. Test: `test/auth-scopes.test.ts`
- [ ] Burst 23: Auth tables in `core/db.ts` — `oauth_clients`, `oauth_tokens`, `oauth_authorization_codes`, `api_keys`. Test: add to `test/db.test.ts`
- [ ] Burst 24: `core/auth/jwt.ts` — `generateKeyPair`, `loadOrCreateKeys`, `signAccessToken`, `verifyAccessToken`. Test: `test/auth-jwt.test.ts`
- [ ] Burst 25: `core/auth/jwt.ts` — `signRefreshToken`, `verifyRefreshToken`. Test: `test/auth-jwt.test.ts`

#### Section 7: API Key Support (parallel Agent A)

- [ ] Burst 26: `core/auth/api-keys.ts` — `generateApiKey`, `hashApiKey`, `createApiKey`, `validateApiKey`. Test: `test/auth-api-keys.test.ts`
- [ ] Burst 27: `core/auth/api-keys.ts` — `revokeApiKey`, `listApiKeys`. Test: `test/auth-api-keys.test.ts`

#### Section 8: OAuth Client Management (parallel Agent B)

- [ ] Burst 28: `core/auth/oauth-clients.ts` — `registerOAuthClient`, `getOAuthClient`, `authenticateOAuthClient`. Test: `test/auth-oauth-clients.test.ts`
- [ ] Burst 29: `core/auth/oauth-clients.ts` — `revokeOAuthClient`, `listOAuthClients`. Test: `test/auth-oauth-clients.test.ts`

#### Section 9: Token Service (parallel Agent A)

- [ ] Burst 30: `core/auth/token-service.ts` — `issueTokenPair`. Test: `test/auth-token-service.test.ts`
- [ ] Burst 31: `core/auth/token-service.ts` — `refreshTokens`. Test: `test/auth-token-service.test.ts`
- [ ] Burst 32: `core/auth/token-service.ts` — `revokeToken`, `isTokenRevoked`. Test: `test/auth-token-service.test.ts`

#### Section 10: PKCE + Authorization Codes (parallel Agent B)

- [ ] Burst 33: `core/auth/pkce.ts` — `generateCodeVerifier`, `computeCodeChallenge`, `verifyCodeChallenge`. Test: `test/auth-pkce.test.ts`
- [ ] Burst 34: `core/auth/auth-codes.ts` — `createAuthorizationCode`, `exchangeAuthorizationCode`. Test: `test/auth-codes.test.ts`

#### Section 11: Auth Middleware

- [ ] Burst 35: `api/middleware/auth.ts` — `createAuthMiddleware(db, publicKey, enabled)` — bearer extraction, JWT + API key validation, scope checking. Test: `test/auth-middleware.test.ts`
- [ ] Burst 36: Wire middleware into `api/server.ts` — conditional on env, bypass list. Test: `test/auth-middleware.test.ts`

#### Section 12: OAuth Routes

- [ ] Burst 37: `api/routes/oauth.ts` — `POST /oauth/token` (client_credentials grant). Test: `test/api-oauth.test.ts`
- [ ] Burst 38: `api/routes/oauth.ts` — `GET+POST /oauth/authorize` (auth code + PKCE + owner consent). Test: `test/api-oauth.test.ts`
- [ ] Burst 39: `api/routes/oauth.ts` — `POST /oauth/token` (authorization_code grant). Test: `test/api-oauth.test.ts`
- [ ] Burst 40: `api/routes/oauth.ts` — `POST /oauth/revoke` (RFC 7009). Test: `test/api-oauth.test.ts`
- [ ] Burst 41: `api/routes/oauth.ts` — `GET /.well-known/oauth-authorization-server` (RFC 8414). Test: `test/api-oauth.test.ts`
- [ ] Burst 41b: `api/routes/oauth.ts` — `GET /oauth/jwks` (RFC 7517). Test: `test/api-oauth.test.ts`
- [ ] Burst 42: `api/routes/oauth.ts` — `POST /oauth/register` (RFC 7591, requires owner secret). Test: `test/api-oauth.test.ts`

#### Section 13: Management CLI

- [ ] Burst 43: `cli/manage-auth.ts` — `create-client`, `create-api-key` subcommands. Test: `test/cli/manage-auth.test.ts`
- [ ] Burst 44: `cli/manage-auth.ts` — `list-clients`, `list-api-keys`, `revoke`. Test: `test/cli/manage-auth.test.ts`

#### Section 14: Integration

- [ ] Burst 45: Update `api/server.ts` signature — `createApp(..., authConfig?)` accepts optional `AuthConfig`
- [ ] Burst 46: Update `api/main.ts` — load signing keys, read auth env vars, pass `AuthConfig` to `createApp`
- [ ] Burst 47: `.keys/` in `.gitignore`, update scatter/gather docs for `core/auth/`, `api/`

---

## Agent Context Manifests

Each parallel phase section below defines exactly what the orchestrator copy-pastes into each sub-agent prompt. See the plan file at `.claude/plans/buzzing-shimmying-kite.md` for the complete inline type definitions, before/after function signatures, DB schemas, and TCR revert scopes for every agent.

### Phase 1, Section 3 — 3 Parallel Agents

| Agent | Branch | Source files | Test files | Bursts |
|-------|--------|-------------|------------|--------|
| A | `tenancy/p1-detection-pipeline` | `core/client-detection.ts`, `core/pipeline.ts`, `core/feedback.ts` | `test/client-detection.test.ts`, `test/pipeline.test.ts`, `test/feedback.test.ts` | 9, 14, 15b |
| B | `tenancy/p1-threads-insights` | `core/threads.ts`, `core/insights.ts` | `test/threads-crud.test.ts`, `test/insights-crud.test.ts` | 10, 11 |
| C | `tenancy/p1-timelines-vector` | `core/timelines.ts`, `core/deep-dedup.ts`, `core/meeting-pipeline.ts`, `core/context.ts`, `core/vector-search.ts`, `core/hybrid-search.ts` | `test/timelines.test.ts` | 12, 13, 15 |

**Cross-agent dependency:** Agent C (Burst 12) changes `reconcileMilestones` signature from `clientName` → `clientId`. Agent A (Burst 14, pipeline.ts) must call with new signature.

### Phase 2, Sections 7-8 — 2 Parallel Agents

| Agent | Branch | Source file | Test file | Bursts |
|-------|--------|------------|-----------|--------|
| A | `oauth/p2-api-keys` | `core/auth/api-keys.ts` | `test/auth-api-keys.test.ts` | 26, 27 |
| B | `oauth/p2-oauth-clients` | `core/auth/oauth-clients.ts` | `test/auth-oauth-clients.test.ts` | 28, 29 |

### Phase 2, Sections 9-10 — 2 Parallel Agents

| Agent | Branch | Source files | Test files | Bursts |
|-------|--------|-------------|------------|--------|
| A | `oauth/p2-token-service` | `core/auth/token-service.ts` | `test/auth-token-service.test.ts` | 30, 31, 32 |
| B | `oauth/p2-pkce-codes` | `core/auth/pkce.ts`, `core/auth/auth-codes.ts` | `test/auth-pkce.test.ts`, `test/auth-codes.test.ts` | 33, 34 |

---

## Verification

### Phase 1
1. `pnpm test --run` — all existing tests pass with migrated schema
2. `seedClients(db, path, tenantId)` creates clients under the specified tenant
3. `getAllClients(db, tenantId)` returns only that tenant's clients
4. `getAllClients(db)` (no tenantId) returns all — backwards compat
5. API routes with `?client=<name>` still work
6. API routes with `?client=<uuid>` also work
7. Vector search with client filter works for both legacy (name) and new (UUID) vectors

### Phase 2
1. Auth disabled (default) → all routes open, all existing tests pass unchanged
2. Auth enabled → unauthenticated → 401
3. API key `Authorization: Bearer mki_...` → 200
4. Client credentials: POST /oauth/token → access_token → bearer → 200
5. Auth code + PKCE: authorize → code → token → bearer → 200
6. Token with `meetings:read` scope → GET → 200, DELETE → 403
7. Revoked token → 401
8. JWT `tid` claim scopes data to correct tenant
9. `GET /.well-known/oauth-authorization-server` returns valid metadata
10. `GET /oauth/jwks` returns public key
11. `POST /oauth/register` with owner secret creates functional OAuth client
