# core/pipeline/

End-to-end ingestion: turn a raw transcript into a fully indexed, embedded, cross-referenced meeting.

## Files

| File | Purpose |
|------|---------|
| `pipeline.ts` | `processNewMeetings(config)` orchestrates the full batch. Emits `PipelineEvent` progress callbacks. `processWebhookMeetings` runs first when webhook dirs are configured. Per-meeting flow: parse, ingest, detect client, extract artifact, reconcile milestones, update FTS, dedup items, embed, evaluate threads |
| `parser.ts` | Parses Krisp files and webhook payloads. `parseKrispFile`, `parseKrispFolder`, `parseWebhookPayload`, `parseTranscriptBody`, `parseWebVttBody`, `parseMarkdownTranscriptBody`, `parseAttendance`, `parseFilename`, `listTranscriptFiles`, `listWebhookFiles` |
| `chunker.ts` | `chunkTranscript(turns, tokenLimit)` splits `SpeakerTurn[]` into sub-arrays for parallel LLM extraction |
| `ingest.ts` | `ingestMeeting(db, parsed)` inserts a row, generating a UUID if no externalId. `getMeeting(db, id)` fetches a `MeetingRow` |
| `lifecycle.ts` | `moveToProcessed(filePath)`, `moveToFailed(filePath)` -- rename between raw / processed / failed dirs. `processDirectory` -- batch triage without LLM or DB |
| `extractor.ts` | `extractSummary(adapter, turns, tokenLimit, prompt?, refinement?)` -- chunk, parallel LLM calls, validate with Zod, merge. `validateArtifact` normalizes legacy shapes. `storeArtifact`, `getArtifact`, `generateShortId` |
| `embedder.ts` | `loadModel(modelPath, tokenizerPath)` loads ONNX `all-MiniLM-L6-v2` with hand-rolled WordPiece tokenizer. `embed(session, text)` returns 384-dim L2-normalized `Float32Array` |
| `meeting-pipeline.ts` | `buildEmbeddingInput(artifact)`, `embedMeeting(session, artifact)`, `storeMeetingVector(vdb, id, vec, meta)` |
| `schemas.ts` | Zod schemas: `DecisionSchema`, `ActionItemSchema` (priority, short_id, requester defaults), `RiskItemSchema` (category enum), `MilestoneSchema`, top-level `ArtifactSchema` |

## Parent

[core/llm-context.md](../llm-context.md)
