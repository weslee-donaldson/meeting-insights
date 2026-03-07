You are evaluating whether a meeting is related to a tracked thread.

## Thread
Title: {{thread_title}}
Description: {{thread_description}}
Evaluation criteria: {{criteria_prompt}}

## Meeting Context
{{meeting_context}}

## Instructions
Determine if this meeting contains discussion, decisions, or actions related to the thread.
Return ONLY valid JSON:
- `related` (boolean)
- `relevance_summary` (string): 1-2 sentences citing specific evidence. Empty string if not related.
- `relevance_score` (integer 0-100)
