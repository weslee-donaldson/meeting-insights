# lib/ — Shared UI utilities

General-purpose utility functions used across the React component tree. These have no React dependencies and no side effects.

## Files

| File | Purpose |
|------|---------|
| `utils.ts` | Exports `cn(...inputs)` — combines `clsx` for conditional class logic with `tailwind-merge` to eliminate conflicting Tailwind classes |
| `merge-artifacts.ts` | Exports `mergeArtifactsDeduped(artifacts)` and `computeActionItemOrigins(artifacts, meetingIds)` for combining artifacts from multiple selected meetings with deduplication by normalized text; also exports `ActionItemOrigin` type |

## Key Concepts

**`mergeArtifactsDeduped`:** When multiple meetings are checked in the UI, their artifacts are merged into one for display. Deduplication is case-insensitive and whitespace-normalized. Action items, decisions, and risks deduplicate by description/text; proposed features and open questions deduplicate as plain strings. Summaries are concatenated with newlines.

**`computeActionItemOrigins`:** Produces a parallel array of `{ meetingId, itemIndex }` records that maps each slot in the merged action items list back to its source meeting and original index. This is needed to route completion mutations to the correct meeting when the user completes a merged action item.

## Related

- Parent: [../README.md](../README.md)
- Consumer: `hooks/useMeetingState.ts`, `pages/ThreadsPage.tsx`
