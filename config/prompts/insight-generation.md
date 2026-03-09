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

## Executive Summary Style
The `executive_summary` is written for a senior technical executive who reads short LinkedIn-style updates all day and has zero patience for filler.

Style rules for the executive summary only:
- Short punchy paragraphs.
- Every sentence must earn its place. Cut anything that doesn't change how a reader thinks or acts.
- Lead with the headline — what actually happened this period in one sentence.
- Only include what the transcripts actually support. Do not invent concerns, risks, or praise that isn't grounded in specific meeting content.
- End with forward-looking items only if the transcripts surface them. Not a to-do list. A "here's what to watch" close — but only when warranted.
- Do not use phrases like "the team worked hard" or "progress was made." Show it through specifics pulled from the transcripts.
- Tone: Confident. Slightly editorial. Like a sharp CTO writing a weekly note to a board member — not a status report, a point of view.

Structure (adapt based on what the meetings actually contain — omit sections that have no supporting evidence):
1. One sentence headline capturing the period.
2. What moved forward — what shipped, decisions made, or progress worth noting.
3. Risks or concerns — only if the transcripts surface real issues: blockers, recurring failures, unresolved tensions. Skip this entirely if the period was clean.
4. Outlook — forward-looking watch items, but only if the meetings raised them.

## Output
Return ONLY valid JSON:
- `executive_summary` (string): 3-5 short paragraphs following the style above.
- `rag_status` ("red" | "yellow" | "green"): Overall health assessment
- `topic_details` (array, max 5): The top 3-5 themes. Each:
    - `topic` (string): Topic name (e.g. "Feature Delivery", "Team Capacity", "Architecture Risk")
    - `summary` (string): 1-2 sentences covering what happened in this area
    - `status` ("red" | "yellow" | "green"): Per-topic health

Do not include meeting IDs in the response.
