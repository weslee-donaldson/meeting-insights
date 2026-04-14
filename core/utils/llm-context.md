# core/utils/

Pure stateless utilities. No DB, no LLM, no network. Safe to import from anywhere.

## Files

| File | Purpose |
|------|---------|
| `math.ts` | `cosineSimilarity`, `l2ToCosineSim`, `isSemanticDuplicate`, `jaroWinklerSimilarity`, `isStringDuplicate`, `normalizeItemText` |
| `paths.ts` | `resolveDataPaths(dataDir)` returns typed data subdir paths. `ensureDataDirs(paths)` creates them. `DATA_SUBDIRS` list |
| `format-owner.ts` | Name string formatting for owner/requester fields. Density-aware (uses `DensityMode` from the UI package) |
| `display.ts` | `parseCitations`, `replaceCitations` -- transforms `[M1]`-style labels in LLM output into structured references |

## Parent

[core/llm-context.md](../llm-context.md)
