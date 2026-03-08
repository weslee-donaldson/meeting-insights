# Ketchup Plan: Insights Feature

## TODO

### Phase 2: LLM integration
- [x] Burst 563: Add generate_insight to LlmCapability union + stub fixture
- [x] Burst 564: Create insight-generation.md prompt template
- [x] Burst 565: generateInsight calls LLM and stores structured result
- [x] Burst 566: getInsightChatContext builds system context from insight meetings

### Phase 3: IPC + API
- [x] Burst 567: Insight IPC channel constants + request/response types
- [x] Burst 568: ElectronAPI interface insight methods
- [ ] Burst 569: IPC handlers for insight CRUD
- [ ] Burst 570: IPC handlers for insight meetings + generation
- [ ] Burst 571: IPC handlers for insight messages + chat
- [ ] Burst 572: API routes for insights CRUD
- [ ] Burst 573: API routes for insight meetings + generation
- [ ] Burst 574: API routes for insight messages + chat
- [ ] Burst 575: api-client.ts insight methods

### Phase 4: UI
- [ ] Burst 576: NavRail adds Insights view with Brain icon
- [ ] Burst 577: App.tsx adds insights to currentView type and state
- [ ] Burst 578: InsightsView component (list with RAG badges)
- [ ] Burst 579: CreateInsightDialog (period picker + date selector)
- [ ] Burst 580: App.tsx wires insightsQuery and insight creation
- [ ] Burst 581: InsightDetailView header + RAG badge + executive summary
- [ ] Burst 582: InsightDetailView topic details + source meetings
- [ ] Burst 583: InsightDetailView regenerate + finalize/reopen buttons
- [ ] Burst 584: App.tsx wires insight detail + delete + update handlers
- [ ] Burst 585: App.tsx wires insight chat panel (persistent mode)

## DONE

### Phase 1: Core data layer
- [x] Burst 545: computePeriodBounds returns start/end for day period
- [x] Burst 546: computePeriodBounds returns start/end for week period (Monday-Sunday)
- [x] Burst 547: computePeriodBounds returns start/end for month period
- [x] Burst 548: insights table migration in db.ts
- [x] Burst 549: insight_meetings table migration in db.ts
- [x] Burst 550: insight_messages table migration in db.ts
- [x] Burst 551: createInsight stores and returns Insight
- [x] Burst 552: getInsight retrieves by id
- [x] Burst 553: listInsightsByClient returns insights for a client
- [x] Burst 554: updateInsight modifies fields and returns updated insight
- [x] Burst 555: deleteInsight removes insight and cascades
- [x] Burst 556: addInsightMeeting links a meeting to an insight
- [x] Burst 557: getInsightMeetings returns linked meetings with titles and dates
- [x] Burst 558: discoverMeetingsForPeriod queries meetings by client and date range
- [x] Burst 559: appendInsightMessage stores a message
- [x] Burst 560: getInsightMessages returns messages ordered by created_at
- [x] Burst 561: clearInsightMessages deletes all messages for an insight
- [x] Burst 562: markInsightMessagesStale marks messages when meetings are removed
