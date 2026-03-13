# Ketchup Plan: Client ID + Resolved Meeting Client

## Context

`clients` uses `name TEXT PRIMARY KEY` — renaming cascades across all FK references. API routes expose client names in URLs (guessable). `client_detections` stores multiple rows per meeting with varying confidence, leaking probabilistic data into downstream queries. Fix: add opaque GUID to clients, add resolved `client_id` to meetings, update all FKs and queries.

## TODO

- [ ] Burst 623: handleGetClients returns {id, name} objects, update API + channels
- [ ] Burst 624: API routes use client ID params instead of names
- [ ] Burst 625: UI App.tsx uses client IDs, resolves to names for display

### Feature: Action Item Editing

- [x] Burst E1: Core handler — handleEditActionItem in handlers/meetings.ts + test
- [x] Burst E2: Channel + ElectronAPI type — add EDIT_ACTION_ITEM channel and editActionItem method
- [x] Burst E3: API route — PUT /api/meetings/:id/action-items/:index + test
- [x] Burst E4: Preload + api-client — wire editActionItem through both transports
- [x] Burst E5: useMeetingState — add handleEditActionItem callbacks
- [x] Burst E6: EditActionItemDialog component + test
- [ ] Burst E7: Wire edit icon into MeetingDetail action items + test
- [ ] Burst E8: Wire edit into ClientActionItemsView + test
- [ ] Burst E9: Update READMEs for changed files

### Refactor: Break Up Large Files

- [x] Burst R1: Extract api/main.ts (bootstrap startup), slim api/server.ts to createApp only
- [x] Burst R2: Extract api/routes/debug.ts
- [x] Burst R3: Extract api/routes/meetings.ts
- [x] Burst R4: Extract api/routes/search.ts
- [x] Burst R5: Extract api/routes/threads.ts
- [x] Burst R6: Extract api/routes/insights.ts + milestones.ts, slim server.ts to wiring
- [x] Burst R7: Extract electron-ui/electron/handlers/meetings.ts
- [x] Burst R8: Extract electron-ui/electron/handlers/search.ts
- [x] Burst R9: Extract electron-ui/electron/handlers/threads.ts
- [x] Burst R10: Extract electron-ui/electron/handlers/insights.ts
- [x] Burst R11: Extract electron-ui/electron/handlers/milestones.ts, slim ipc-handlers.ts
- [x] Burst R12: Extract api-client/base.ts + api-client/meetings.ts
- [x] Burst R13: Extract api-client/chat.ts
- [x] Burst R14: Extract api-client/threads.ts
- [x] Burst R15: Extract api-client/insights.ts
- [x] Burst R16: Extract api-client/milestones.ts, slim to api-client/index.ts
- [x] Burst R17: Extract hooks/useMeetingState.ts
- [x] Burst R18: Extract hooks/useThreadState.ts
- [x] Burst R19: Extract hooks/useInsightState.ts
- [x] Burst R20: Extract hooks/useMilestoneState.ts
- [x] Burst R21: Extract pages/MeetingsPage.tsx
- [x] Burst R22: Extract pages/ActionItemsPage.tsx + ThreadsPage.tsx
- [x] Burst R23: Extract pages/InsightsPage.tsx + TimelinesPage.tsx
- [x] Burst R24: Slim App.tsx to layout shell
- [x] Burst 626: resolveMeetingSources + handleThreadChat/handleInsightChat return "Title (date)" labels
- [x] Burst 627: ChatPanel structured sources with onSourceClick prop
- [x] Burst 628: Wire onSourceClick to open meeting detail overlay without navigation

## DONE

- [x] Burst 610: Schema — add clients.id (GUID), meetings.client_id in migrate
- [x] Burst 611: seedClients generates client IDs, getAllClients/getClientByName return id
- [x] Burst 612: storeDetection resolves and sets meetings.client_id
- [x] Burst 613: handleGetMeetings + handleReassignClient + handleCreateMeeting use meetings.client_id (collapsed 615+622)
- [x] Burst 614: handleGetClientActionItems uses meetings.client_id (fixes bug)
- [x] Burst 616: discoverMeetingsForPeriod uses meetings.client_id
- [x] Burst 617: enrichFromDb (hybrid-search) uses meetings.client_id
- [x] Burst 618: handleReExtract + handleReEmbed + CLI use meetings.client_id
- [x] Burst 619-622: Skipped — threads/insights already use deterministic client_name, pipeline already calls storeDetection
