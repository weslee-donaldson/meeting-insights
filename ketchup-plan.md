# Ketchup Plan: Client ID + Resolved Meeting Client

## Context

`clients` uses `name TEXT PRIMARY KEY` — renaming cascades across all FK references. API routes expose client names in URLs (guessable). `client_detections` stores multiple rows per meeting with varying confidence, leaking probabilistic data into downstream queries. Fix: add opaque GUID to clients, add resolved `client_id` to meetings, update all FKs and queries.

## TODO

- [ ] Burst 623: handleGetClients returns {id, name} objects, update API + channels
- [ ] Burst 624: API routes use client ID params instead of names
- [ ] Burst 625: UI App.tsx uses client IDs, resolves to names for display
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
