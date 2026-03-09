You are generating an executive insight report for a client over a specific time period.

## Client
{{client_name}}

## Period
{{period_type}}: {{period_start}} to {{period_end}}

## Meeting Artifacts
{{meeting_artifacts}}

## Instructions

Work in two steps:

### Step 1: Analyze — build topic_details
Read all meeting artifacts and identify the top 3-5 themes for this period. For each topic, write a grounded 1-2 sentence summary of what happened. Assign a per-topic RAG status.

### Step 2: Summarize — distill topic_details into executive_summary
Using ONLY the topics you just produced, write a short executive summary. Do not go back to the transcripts. The summary is a distillation of the topics, not a separate analysis.

## RAG Criteria
- GREEN: On track, no blockers, commitments being met
- YELLOW: Minor concerns, open items needing attention, some risk
- RED: Significant blockers, stalled progress, relationship strain

## Audience
The reader is the head of an implementation company overseeing a portfolio of client engagements. They read dozens of these. They need to know which engagements need attention and why — not project-level details.

- Frame at the engagement level: Is delivery on track? Is the client relationship healthy? Staffing, capacity, or contractual risks?
- **Senior client stakeholders** (CTO, Engineering Manager, VP, Head of Client, Lead Product Owner, Principal Developer) — reference by first name only (e.g. "Stace"). The reader already knows who these people are.
- **Implementation team and junior client contributors** — abstract to role-level references ("the architecture lead," "a developer"). The reader does not track individual consultants or ICs.
- No ticket numbers, internal meeting cadences, or sprint-level detail.
- Mention technologies or systems only when they affect delivery risk or engagement health.

## Style Rules (apply to both executive_summary and topic summaries)
- Only include what the transcripts actually support. Do not invent concerns, risks, or praise.
- Direct and factual. Report what happened and what was decided.
- **No editorializing.** Do not speculate about schedule pressure, what "should have" happened, or what "could" go wrong. State facts.
- **No negative framing.** Avoid "On the positive side," or "not off the rails" — these imply the opposite.
- **Ground every claim.** Name the specific epic, decision, or feature. No vague abstractions ("epics confirmed", "decisions locked").
- **Do not fabricate narratives.** Report the decision, not a dramatized version of the problem.
- **Bullet lists** for sets of items. No dense prose with "Separately," or "Additionally,".
- **Frame forward.** "Team addressing X via Y" — not "X doesn't exist yet."
- **No filler speculation.** "If conversations slip, timeline compresses" adds nothing. Omit it.

## Executive Summary Structure
The summary distills your topic_details for a 30-second scan. Use markdown syntax (`**bold**`, `- bullet`, etc.).

1. **Verdict** — one sentence. On track, off track, or at an inflection point? Why?
2. **What moved forward** — bulleted list of concrete items from your topics.
3. **Open risks** — bulleted list, only if your topics surfaced real issues. Each bullet: what the issue is + what action is underway. Skip if clean.
4. **What to watch** — bulleted list, only if forward-looking items exist in your topics.

Omit any section with no supporting content in your topics.

## Output
Return ONLY valid JSON:
- `topic_details` (array, max 5): The top 3-5 themes. Each:
    - `topic` (string): Topic name (e.g. "Feature Delivery", "Team Capacity", "Architecture Risk")
    - `summary` (string): 1-2 grounded sentences covering what happened
    - `status` ("red" | "yellow" | "green"): Per-topic health
- `executive_summary` (string): Markdown distillation of topic_details following the structure above. Keep it concise — verdict + 2-4 bulleted sections.
- `rag_status` ("red" | "yellow" | "green"): Overall health assessment

Do not include meeting IDs in the response.
