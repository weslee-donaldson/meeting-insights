# core/context/

LLM prompt context assembly: turn DB rows into the multi-meeting text that feeds chat and RAG.

## Files

| File | Purpose |
|------|---------|
| `context.ts` | Base context assembly primitives. Vector-search scored retrieval with metadata filters |
| `labeled.ts` | `buildLabeledContext(db, meetingIds)` -- `[M1]`-labeled multi-meeting context block with artifact fields, mention-count annotations, and milestone links. `buildDistilledContext` -- simpler variant without labels or annotations |

## Parent

[core/llm-context.md](../llm-context.md)
