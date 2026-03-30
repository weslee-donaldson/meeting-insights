# Technical Debt Tracker

## TD-001: Client handlers mixed into meetings.ts (SRP violation)

**Location:** `electron-ui/electron/handlers/meetings.ts`, `api/routes/meetings.ts`

**Issue:** Six client-specific handlers (`handleGetClients`, `handleGetClientList`, `handleGetClientDetail`, `handleGetDefaultClient`, `handleGetGlossary`, `handleGetClientActionItems`) are defined in the meetings handler file. The API routes for these are also registered in the meetings route module. This violates Single Responsibility — client logic should live in its own handler and route module.

**Fix:** Extract to `electron-ui/electron/handlers/clients.ts` and `api/routes/clients.ts`. Update re-exports in `ipc-handlers.ts` and route registration in `api/server.ts`.

**Impact:** No functional impact. Organizational debt that makes the codebase harder to navigate and increases merge conflict surface when client and meeting features are developed in parallel.

**Priority:** Low — refactor when next touching client or meeting handler code.
