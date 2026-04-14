# core/dedup/

Cross-meeting deduplication for action items, decisions, features, questions, and risks.

## Files

| File | Purpose |
|------|---------|
| `item-dedup.ts` | `deduplicateItems(db, vdb, session, meetingId, artifact)` -- embeds items, searches `item_vectors` scoped by client, applies `isStringDuplicate` (Jaro-Winkler) and `isSemanticDuplicate` (cosine) to assign `canonical_id`. Duplicate action items auto-complete with `[auto-dedup]` provenance notes. Also: `recordMention`, `getMentionStats` for the `item_mentions` table |
| `deep-dedup.ts` | `deepScanClient(llm, db, clientId)` -- gathers items per client, filters out `low` priority, caps per priority group, single LLM `dedup_intent` call that returns intent groupings. Duplicates auto-complete with `[auto-dedup-deep]` notes. Prompt at `config/prompts/dedup-intent.md`. Invoked during ingestion when `MTNINSIGHTS_DEDUP_DEEP=1` |

## Parent

[core/llm-context.md](../llm-context.md)
