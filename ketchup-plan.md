# Ketchup Plan: Client ID + Resolved Meeting Client

## Context

`clients` uses `name TEXT PRIMARY KEY` — renaming cascades across all FK references. API routes expose client names in URLs (guessable). `client_detections` stores multiple rows per meeting with varying confidence, leaking probabilistic data into downstream queries. Fix: add opaque GUID to clients, add resolved `client_id` to meetings, update all FKs and queries.

## TODO

- [ ] Burst 610: Schema — add clients.id (GUID), meetings.client_id in migrate
- [ ] Burst 611: seedClients generates client IDs, getAllClients/getClientByName return id
- [ ] Burst 612: storeDetection resolves and sets meetings.client_id
- [ ] Burst 613: handleGetMeetings uses meetings.client_id, remove topClientForMeeting
- [ ] Burst 614: handleGetClientActionItems uses meetings.client_id (fixes bug)
- [ ] Burst 615: handleReassignClient sets meetings.client_id
- [ ] Burst 616: discoverMeetingsForPeriod uses meetings.client_id
- [ ] Burst 617: enrichFromDb (hybrid-search) uses meetings.client_id
- [ ] Burst 618: handleReExtract + handleReEmbed use meetings.client_id
- [ ] Burst 619: threads — add client_id column, update CRUD + listByClient
- [ ] Burst 620: insights — add client_id column, update CRUD + listByClient
- [ ] Burst 621: pipeline.processEntry sets meetings.client_id
- [ ] Burst 622: handleCreateMeeting sets meetings.client_id
- [ ] Burst 623: handleGetClients returns {id, name} objects, update API + channels
- [ ] Burst 624: API routes use client ID params instead of names
- [ ] Burst 625: UI App.tsx uses client IDs, resolves to names for display

## DONE
