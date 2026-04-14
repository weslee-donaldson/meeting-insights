# core/clients/

Client registry, detection, and resolution.

## Files

| File | Purpose |
|------|---------|
| `registry.ts` | `seedClients(db, path)` upserts from `config/clients.json`. Query helpers: `getClientByName`, `getClientByAlias`, `getClientById`, `getAllClients`, `getDefaultClient`. All accept optional `tenantId` for tenant-scoped lookups. `ClientRow` includes `id` (UUID) and `tenant_id`. Each client carries aliases, known_participants, meeting_names, client_team, implementation_team, glossary, refinement_prompt, additional_extraction_llm_prompt |
| `detection.ts` | `detectClient(db, meeting)` auto-matches via participant email domains, exact/alias name matching, and meeting name token matching. Returns `DetectionResult` with confidence tier. `storeDetection` persists it. Helpers: `normalizeTokens`, `parseSpeakerNames` |
| `resolve.ts` | `resolveClient(db, clientParam, tenantId?)` -- accepts name or UUID, returns matching `ClientRow` or null. Used by all API route files |

## Parent

[core/llm-context.md](../llm-context.md)
