# core/meetings/

Resources attached to a specific meeting.

## Files

| File | Purpose |
|------|---------|
| `messages.ts` | Per-meeting chat history: `appendMeetingMessage`, `getMeetingMessages`, `clearMeetingMessages` |
| `split.ts` | Split a multi-meeting recording into separate meetings by duration. `computeCutPoints`, `splitMeeting`, `reprocessSplitSegments`, `getSourceMeeting`, `getChildMeetings`, `getSplitLineage`. Preserves lineage in `meeting_lineage` |
| `assets.ts` | File attachments: `storeAsset`, `deleteAsset`, `getAssetData`. Stores under `{MTNINSIGHTS_DATA_DIR}/assets/{meetingId}/{uuid}-{filename}` |
| `action-item-resolver.ts` | `resolveShortIds(db, short_ids)` maps printable short IDs to `{ meetingId, itemIndex }` pairs. Used by batch complete/uncomplete endpoints |

## Parent

[core/llm-context.md](../llm-context.md)
