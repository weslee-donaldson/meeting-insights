You are evaluating whether a meeting is responsive to a user's search query.

## Search Query

{{query}}

## Meeting Context

{{meeting_context}}

## Instructions

Evaluate whether this meeting contains information that is responsive to the search query above. Consider two dimensions:

**Specificity**: How directly does the meeting content address the query? A decision or action item that directly answers the query scores higher than a passing mention.

**Breadth**: What proportion of the meeting is about the query topic? A meeting where the topic is the primary subject scores much higher than one where it appears in a single bullet point. A brief mention in a long meeting should score low; a meeting entirely focused on the topic should score high.

## Scoring Calibration

- 90-100: The meeting is primarily about this topic, with decisions or actions directly responsive to the query
- 60-89: Significant discussion of the topic across multiple items (summary, decisions, action items)
- 30-59: Moderate relevance — the topic is discussed but is not the main focus of the meeting
- 1-29: Brief mention only — a single action item or passing reference in the summary
- 0: Not relevant to the query at all

## Response Format

Return ONLY a valid JSON object with exactly these fields:

- `relevant` (boolean): true if relevance_score > 0
- `relevance_summary` (string): If relevant, 1-2 sentences citing specific evidence from the meeting that proves it is responsive to the query. If not relevant, return an empty string.
- `relevance_score` (integer 0-100): Combined specificity and breadth score using the calibration above.
