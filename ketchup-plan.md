# Ketchup Plan: Batch Complete/Uncomplete Action Items by Short ID

## Context

The CLI commands `mti items complete` and `mti items uncomplete` currently require a `meetingId` and a 0-based `index`, forcing the user to manually resolve which meeting an action item belongs to before acting on it. Short IDs (6-char hex hashes) are already generated, stored in artifact JSON, and displayed in `items list` output -- but there is no way to use them for completion operations.

**Problem statement:** Completing or uncompleting an action item requires two pieces of information (meetingId + index) that are not directly visible in the primary workflow. The user sees short_ids in `items list` but cannot use them to act on items directly.

**What this plan delivers:**
1. A `core/action-item-resolver.ts` module with `resolveShortIds(db, shortIds)` that scans artifacts to map short_ids to `{ meetingId, itemIndex }` pairs
2. Batch handler functions `handleBatchCompleteItems` and `handleBatchUncompleteItems` in `electron-ui/electron/handlers/meetings.ts`
3. Two new API endpoints: `POST /api/action-items/complete` and `POST /api/action-items/uncomplete`
4. Updated CLI commands: `mti items complete <ids...>` and `mti items uncomplete <ids...>` accepting variadic short_ids

**What this plan does NOT deliver:**
- Batch edit (changing description/owner/priority by short_id)
- Changes to the Electron UI (it uses meetingId+index directly)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Resolver location | `core/action-item-resolver.ts` | Business logic belongs in core/; follows existing pattern |
| Resolver strategy | Full scan of artifacts table per call | Data volume is small (hundreds of meetings); simple and correct |
| Batch error handling | Partial success with per-item status | Failing the whole batch on one bad ID is frustrating; per-item reporting lets the user see what happened |
| Old CLI commands | Replace signatures with short_id-based | Short_ids are always visible in `items list`; the old meetingId+index interface requires extra lookups |
| Old per-meeting API endpoints | Keep as-is (backwards compatible) | The Electron UI uses them. New endpoints are additive at `/api/action-items/*` |
| Response shape | `{ results: [{ short_id, status }] }` | Matches the partial-success model |
| API response code | 200 (not 204) | CLI needs to parse per-item results from the JSON body; HttpClient returns null for 204 |

## Data Shapes

### Resolver types (`core/action-item-resolver.ts`)

```ts
interface ResolvedItem {
  short_id: string;
  meeting_id: string;
  item_index: number;
}

interface ResolveResult {
  resolved: ResolvedItem[];
  not_found: string[];
}
```

### Batch request/response (`api/routes/meetings.ts`)

```ts
// POST /api/action-items/complete
{ short_ids: string[], note?: string }

// POST /api/action-items/uncomplete
{ short_ids: string[] }

// Response (200)
{ results: [{ short_id: string, status: "completed" | "uncompleted" | "not_found" }] }
```

## Reference Files

| File | Why |
|------|-----|
| `core/extractor.ts` | `generateShortId` (line 13), `Artifact` type (line 19), `storeArtifact` (line 169) |
| `electron-ui/electron/handlers/meetings.ts` | `handleCompleteActionItem` (line 380), `handleUncompleteActionItem` (line 386) |
| `api/routes/meetings.ts` | `registerMeetingRoutes` -- add new batch endpoints alongside existing ones |
| `cli/mti/src/commands/items.ts` | `completeItem` (line 130), `uncompleteItem` (line 112), `registerItems` (line 222) |
| `test/cli/mti/commands/items.test.ts` | Existing CLI tests with `stubClient` pattern (line 30) |
| `core/db.ts` | `createDb`, `migrate` -- test setup; `action_item_completions` table (line 65) |

## Dependency Graph

```
Burst 1 -> 2 -> 3 -> 4 -> 5 -> 6
         (core)  (handlers)  (API)    (CLI)
```

---

## TODO

- [ ] Burst 1: `core/action-item-resolver.ts` -- `resolveShortIds(db, shortIds)`. Scans all rows from the `artifacts` table. For each row, parses the `action_items` JSON column and checks each item's `short_id` field against the requested set. Returns `{ resolved: ResolvedItem[], not_found: string[] }`. Edge cases: empty input returns empty results; unparseable JSON rows skipped; duplicate input short_ids deduplicated.

  Test: `test/action-item-resolver.test.ts` -- seed two meetings with artifacts via `createDb(":memory:")` + `migrate(db)` + `storeArtifact`. Resolve known short_ids (both found), resolve unknown ID (not_found), resolve mix of valid+invalid (partial), resolve empty array (empty result).

- [ ] Burst 2: `electron-ui/electron/handlers/meetings.ts` -- add `handleBatchCompleteItems(db, shortIds, note): BatchResponse` and `handleBatchUncompleteItems(db, shortIds): BatchResponse`. Each calls `resolveShortIds`, then iterates resolved items calling existing `handleCompleteActionItem`/`handleUncompleteActionItem`. Builds results array with per-item status. Not-found IDs get status `"not_found"`.

  Test: `test/batch-complete.test.ts` -- seed DB with meetings + artifacts + known short_ids. Batch complete two items, verify completion rows exist. Batch complete with unknown ID, verify `not_found` in results. Batch uncomplete, verify completion row deleted.

- [ ] Burst 3: `api/routes/meetings.ts` -- add `POST /api/action-items/complete`. Parses body as `{ short_ids: string[], note?: string }`. Validates `short_ids` is a non-empty array. Calls `handleBatchCompleteItems`. Returns 200 with `{ results }`. Empty array returns 400.

  Test: `test/api-action-items.test.ts` -- POST with valid short_ids (200 + correct results), POST with empty array (400), POST with mix of valid+invalid (200 + partial success).

- [ ] Burst 4: `api/routes/meetings.ts` -- add `POST /api/action-items/uncomplete`. Same pattern as Burst 3 but calls `handleBatchUncompleteItems`. Body is `{ short_ids: string[] }`.

  Test: `test/api-action-items.test.ts` -- seed + complete items first, POST uncomplete with their short_ids (200 + status "uncompleted"), POST with not-found IDs (200 + status "not_found").

- [ ] Burst 5: Replace `complete` CLI command in `cli/mti/src/commands/items.ts`. New signature: `mti items complete <ids...>` with `--note` and `--json`. Calls `POST /api/action-items/complete` with `{ short_ids, note }`. Displays results as table (Short ID + Status columns) or JSON.

  Test: `test/cli/mti/commands/items.test.ts` -- update complete tests. Stub returns `{ results: [...] }`, verify table output and JSON output. Verify correct URL (`/api/action-items/complete`) and body shape sent.

- [ ] Burst 6: Replace `uncomplete` CLI command in `cli/mti/src/commands/items.ts`. New signature: `mti items uncomplete <ids...>` with `--json`. Calls `POST /api/action-items/uncomplete`.

  Test: `test/cli/mti/commands/items.test.ts` -- update uncomplete tests. Same pattern as Burst 5.

## DONE
