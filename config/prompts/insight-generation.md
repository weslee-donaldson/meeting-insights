You are generating an executive insight report for a client over a specific time period.

## Client
{{client_name}}

## Period
{{period_type}}: {{period_start}} to {{period_end}}

## Meeting Artifacts
{{meeting_artifacts}}

## Instructions
Analyze all meeting artifacts above and produce a structured executive report.

Assess overall client health using RAG criteria:
- GREEN: On track, no blockers, commitments being met
- YELLOW: Minor concerns, open items needing attention, some risk
- RED: Significant blockers, stalled progress, relationship strain

Return ONLY valid JSON:
- `executive_summary` (string): 3-5 sentence overview covering the most important developments, decisions, and concerns across the period. Write for a leadership audience who needs to understand client status quickly.
- `rag_status` ("red" | "yellow" | "green"): Overall health assessment
- `rag_rationale` (string): 1-2 sentences explaining the RAG assessment with specific evidence
- `topic_details` (array of objects): Group findings by topic. Each:
    - `topic` (string): Topic name (e.g. "Feature Delivery", "Team Capacity", "Client Relationship")
    - `summary` (string): 2-3 sentences covering what happened in this area
    - `status` ("red" | "yellow" | "green"): Per-topic health
    - `meeting_ids` (string[]): IDs of meetings that informed this topic
