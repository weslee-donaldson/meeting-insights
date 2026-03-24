# Webhook Transcript Processing + Local Service
## Ketchup Plan

---

# 0. CONTEXT

The project processes Krisp meeting transcripts through a pipeline: parse → ingest → detect client → extract artifacts → embed → thread evaluation. The only source today is `data/raw-transcripts/` (markdown files + manifest.json), manually triggered via `pnpm process`.

A Firebase Cloud Function now receives Krisp webhook POST events and saves raw JSON payloads to Google Drive, which syncs locally to `data/webhook-rawtranscripts/`. These payloads are richer than the markdown transcripts (structured speakers with emails, Krisp-native meeting IDs, meeting URLs). The webhook is the preferred source going forward.

This plan adds: (1) a parser for webhook JSON, (2) pipeline integration with dedup, (3) a local background service that auto-processes new webhook files.

---

# 1. SYSTEM GOAL

Enable automatic ingestion of Krisp webhook JSON payloads as a first-class transcript source, prioritized over the existing markdown source, with a local background service that watches for new files and triggers the pipeline.

---

# ARCHITECTURAL DECISIONS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Parser location | `parseWebhookPayload` in `core/parser.ts` | All parsers live here. Pure function: JSON string → `ParsedMeeting` |
| Speaker names | `first_name + last_name`, fallback to email | Matches what Krisp already does in `content[].speaker` |
| rawTranscript format | Synthesize pipe-delimited lines from content array | `parseSpeakerNames` in client-detection.ts regex-matches `^([^\|]+)\|` — must be compatible |
| Dedup | Check `data.meeting.id` against `SELECT id FROM meetings` | No duplicates. Webhook processes first, naturally wins. |
| Lifecycle dirs | `data/webhook-processed/`, `data/webhook-failed/` | Separate from markdown lifecycle to avoid confusion |
| Event filtering | Only process `transcript_created` events | Multi-event correlation (notes, outline, recording) is a future enhancement |
| Local service | `local-service/` dir with file watcher + pm2 | Auto-detect new files, process immediately, restart on crash |
| Watcher strategy | `fs.watch` + periodic scan fallback (30s) | `fs.watch` can miss events on macOS with Google Drive sync |

---

# PLANNING RULES

1. Each burst = one failing test → minimal code → TCR
2. Plan updates go in the same commit as code
3. Infrastructure commits (config files, pm2) need no tests
4. 100% coverage on new code
5. Existing tests must continue passing
6. Update scatter.md/gather.md when adding files

---

# FUTURE ENHANCEMENTS (out of scope)

- **Multi-event correlation:** Krisp sends separate events (`notes_generated`, `outline_generated`, `recording_available`) for the same meeting. A future phase could correlate these by `data.meeting.id` to enrich meeting records with notes, outline, and recording URL.

---

# PHASE 1: Webhook Parser (~10 bursts)

## SECTION 1.1: parseWebhookPayload (~8 bursts)

> **Spec:**
> Pure function in `core/parser.ts`. Takes raw JSON string + filename, returns `ParsedMeeting | null`.
> Maps webhook fields to existing `ParsedMeeting` interface. Returns null for non-`transcript_created` events or malformed payloads.
>
> **Key compatibility detail:** `rawTranscript` must be synthesized as pipe-delimited lines (`Speaker Name | 00:00\ntext`) so `parseSpeakerNames()` in `core/client-detection.ts:32` continues to work via its `^([^|]+)\|` regex.
>
> **Files:** `core/parser.ts`, `test/parser.test.ts`

- [x] Burst 1: parseWebhookPayload returns ParsedMeeting with externalId from `data.meeting.id`
- [x] Burst 2: parseWebhookPayload maps `start_date` → timestamp, `title` → title, filename → sourceFilename
- [x] Burst 3: parseWebhookPayload maps `data.meeting.speakers` → Participant[] (first_name + last_name + email + id)
- [x] Burst 4: parseWebhookPayload handles speakers with null names (uses email as fallback in participant mapping)
- [x] Burst 5: parseWebhookPayload maps `data.content[]` → SpeakerTurn[] with "00:00" timestamps
- [x] Burst 6: parseWebhookPayload synthesizes rawTranscript as pipe-delimited lines compatible with parseSpeakerNames
- [x] Burst 7: parseWebhookPayload returns null for non-transcript_created events (notes_generated, etc.)
- [x] Burst 8: parseWebhookPayload returns null for malformed JSON / missing required fields

## SECTION 1.2: Webhook file discovery (~2 bursts)

> **Spec:**
> `listWebhookFiles(dir)` returns sorted `*.json` filenames. Parallels `listTranscriptFiles`.
>
> **Files:** `core/parser.ts`, `test/parser.test.ts`

- [x] Burst 9: listWebhookFiles returns sorted array of *.json filenames from directory
- [x] Burst 10: listWebhookFiles returns empty array for empty or non-existent directory; update `core/scatter.md`

---

# PHASE 2: Pipeline Integration (~12 bursts)

## SECTION 2.1: processWebhookMeetings (~8 bursts)

> **Spec:**
> New exported function in `core/pipeline.ts`. Scans a webhook directory for `*.json` files, parses each via `parseWebhookPayload`, deduplicates by meeting ID, delegates to existing `processEntry`. Returns `PipelineResult`.
>
> Reuses `processEntry` (the shared inner loop) and existing lifecycle functions. Webhook directories (`webhook-processed/`, `webhook-failed/`) are created automatically.
>
> **Files:** `core/pipeline.ts`, `test/pipeline.test.ts`

- [x] Burst 11: processWebhookMeetings returns PipelineResult with correct total count from directory scan
- [x] Burst 12: processWebhookMeetings parses JSON files via parseWebhookPayload and processes valid meetings
- [x] Burst 13: processWebhookMeetings skips meetings whose externalId already exists in DB
- [x] Burst 14: processWebhookMeetings moves processed files to webhook-processed directory
- [x] Burst 15: processWebhookMeetings moves failed files to webhook-failed directory with audit log
- [x] Burst 16: processWebhookMeetings emits PipelineEvent callbacks (processing, ok, failed, skipped)
- [x] Burst 17: processWebhookMeetings silently skips non-transcript_created events (not counted as failures)
- [x] Burst 18: processWebhookMeetings creates webhook-processed and webhook-failed dirs if missing

## SECTION 2.2: Orchestration (~4 bursts)

> **Spec:**
> Update `processNewMeetings` to accept optional webhook config. Webhook processing runs first; its processed meeting IDs feed into the manifest dedup set. Update `cli/run.ts` entry point.
>
> **Files:** `core/pipeline.ts`, `cli/run.ts`, `test/pipeline.test.ts`

- [x] Burst 19: PipelineConfig accepts optional webhookRawDir, webhookProcessedDir, webhookFailedDir
- [x] Burst 20: processNewMeetings calls processWebhookMeetings first when webhookRawDir is provided
- [x] Burst 21: Meeting IDs from webhook processing are included in the manifest dedup set
- [x] Burst 22: cli/run.ts passes webhook directory paths; update scatter.md and gather.md

---

# PHASE 3: Local Background Service (~12 bursts)

## SECTION 3.1: File watcher (~5 bursts)

> **Spec:**
> `local-service/watcher.ts` — a standalone module (not part of the API or web server) that detects new `*.json` files in the webhook directory and calls a callback. This runs as its own dedicated Node.js process managed by pm2 — it starts at boot, runs continuously in the background, and auto-restarts on crash. It is completely independent from the API server (`pnpm api:dev`) and web UI (`pnpm web:dev`).
>
> Uses `node:fs` watch with a periodic scan fallback (30s) since `fs.watch` is unreliable with Google Drive sync on macOS. Debounces rapid events for the same file (Drive may write incrementally).
>
> **Files:** `local-service/watcher.ts`, `test/watcher.test.ts`

- [x] Burst 23: createWatcher detects new JSON file and calls callback with filename
- [x] Burst 24: createWatcher debounces rapid events for the same file (wait for write to stabilize)
- [x] Burst 25: createWatcher periodic scan catches files that fs.watch missed
- [x] Burst 26: createWatcher ignores non-JSON and hidden files
- [ ] Burst 27: createWatcher stop() cleans up watchers and timers

## SECTION 3.2: Service entry point (~4 bursts)

> **Spec:**
> `local-service/main.ts` — pm2-managed process. Initializes DB, vector DB, embedder, LLM (same pattern as `cli/run.ts` using `cli/shared.ts`). Creates watcher, processes each detected file. Handles graceful shutdown.
>
> **Files:** `local-service/main.ts`, `local-service/scatter.md`

- [ ] Burst 28: Service initializes core dependencies (DB, vector DB, session, LLM) using shared config pattern
- [ ] Burst 29: Service processes newly detected webhook file through full pipeline
- [ ] Burst 30: Service handles SIGINT/SIGTERM — stops watcher, closes resources
- [ ] Burst 31: Service logs startup, processing events, and shutdown via createLogger

## SECTION 3.3: pm2 configuration (~3 bursts)

> **Spec:**
> `ecosystem.config.cjs` at project root. npm scripts for start/stop. Documentation.
>
> **Files:** `ecosystem.config.cjs`, `package.json`, `local-service/scatter.md`, root `gather.md`

- [x] Burst 32: ecosystem.config.cjs defines webhook-watcher app (script path, interpreter, restart policy, log config)
- [x] Burst 33: package.json scripts: `service:start`, `service:stop`, `service:logs`
- [x] Burst 34: Update local-service/scatter.md and root gather.md

---

# PHASE 4: Documentation (~2 bursts)

## SECTION 4.1: User-facing documentation (~2 bursts)

> **Spec:**
> Update README.md with instructions for the webhook ingestion pipeline: Firebase setup, Google Drive sync, how the local service works, and how to start/stop/monitor it. Update scatter.md and gather.md across all affected directories to reflect the new source, new files, and new service.
>
> **Files:** `README.md`, `core/scatter.md`, `cli/scatter.md`, `local-service/scatter.md`, root `gather.md`, `google-krisp-webhook/scatter.md`

- [ ] Burst 35: Update README.md — add Webhook Ingestion section (Firebase setup, Drive sync, service commands, troubleshooting)
- [ ] Burst 36: Update all scatter.md and gather.md files across affected directories (core, cli, local-service, google-krisp-webhook, root)

---

## TOTAL: ~36 bursts

## CRITICAL FILES

| File | Action | Phase |
|------|--------|-------|
| `core/parser.ts` | Add `parseWebhookPayload`, `listWebhookFiles` | 1 |
| `core/pipeline.ts` | Add `processWebhookMeetings`, update `processNewMeetings` | 2 |
| `core/lifecycle.ts` | Reuse existing `moveToProcessed`/`moveToFailed` (no changes needed) | — |
| `core/client-detection.ts` | No changes — rawTranscript synthesis ensures compatibility | — |
| `cli/run.ts` | Pass webhook directory paths | 2 |
| `local-service/watcher.ts` | New file — file watcher module | 3 |
| `local-service/main.ts` | New file — service entry point | 3 |
| `ecosystem.config.cjs` | New file — pm2 config | 3 |
| `test/parser.test.ts` | Add webhook parser tests | 1 |
| `test/pipeline.test.ts` | Add webhook pipeline tests | 2 |
| `test/watcher.test.ts` | New file — watcher tests | 3 |
| `README.md` | Add Webhook Ingestion section | 4 |
| `google-krisp-webhook/scatter.md` | Update with Firebase function docs | 4 |

## SEQUENCING & DEPENDENCY MAP

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1: Webhook Parser
├── Section 1.1: parseWebhookPayload (Bursts 1-8)
│   └── Each burst is sequential (builds on previous)
└── Section 1.2: listWebhookFiles (Bursts 9-10)
    └── INDEPENDENT of Section 1.1 — can run in parallel via subagent

Phase 2: Pipeline Integration (depends on ALL of Phase 1)
├── Section 2.1: processWebhookMeetings (Bursts 11-18)
│   ├── Depends on: parseWebhookPayload, listWebhookFiles
│   └── Each burst is sequential
└── Section 2.2: Orchestration (Bursts 19-22)
    └── Depends on: Section 2.1 (processWebhookMeetings must exist)

Phase 3: Local Background Service (depends on ALL of Phase 2)
├── Section 3.1: File watcher (Bursts 23-27)
│   └── INDEPENDENT of pipeline — can run in parallel via subagent
├── Section 3.2: Service entry point (Bursts 28-31)
│   └── Depends on: Section 3.1 (watcher) + Phase 2 (pipeline)
└── Section 3.3: pm2 configuration (Bursts 32-34)
    └── Depends on: Section 3.2 (main.ts must exist)

Phase 4: Documentation (depends on ALL of Phase 3)
├── Burst 35: README.md — INDEPENDENT
└── Burst 36: scatter/gather — INDEPENDENT
    └── Can run in parallel via subagent
```

### Parallel subagent opportunities

| Opportunity | What runs in parallel | Prerequisite |
|---|---|---|
| Phase 1 split | Section 1.1 (parser) ∥ Section 1.2 (file discovery) | None |
| Phase 3 split | Section 3.1 (watcher) ∥ Section 3.3 (pm2 config scaffolding) | Phase 2 complete |
| Phase 4 split | Burst 35 (README) ∥ Burst 36 (scatter/gather) | Phase 3 complete |

## VERIFICATION

1. **Unit tests:** `pnpm test --run` — all existing + new tests pass
2. **Manual E2E:** Copy a webhook JSON to `data/webhook-rawtranscripts/`, run `pnpm process`, verify meeting appears in DB and JSON moves to `data/webhook-processed/`
3. **Service E2E:** Start service via `pnpm service:start`, copy a webhook JSON to the watched directory, verify auto-processing within 30s
4. **Dedup:** Process same meeting via webhook then via raw-transcripts — second attempt should skip

## PREREQUISITE

Rename existing `ketchup-plan.md` → `mobile-ketchup-plan.old.md` before starting Burst 1.
