# prompts/ — LLM prompt templates

Markdown files that are loaded at runtime and rendered with Handlebars-style `{{variable}}` interpolation before being sent to the configured LLM provider. Each file corresponds to a distinct LLM task.

## Files

| File | LLM Task | Output Format |
|------|----------|---------------|
| `extraction.md` | Extract structured artifacts from a meeting transcript | JSON object: `summary`, `decisions`, `proposed_features`, `action_items`, `open_questions`, `risk_items`, `additional_notes`, `milestones` |
| `insight-generation.md` | Generate an executive insight report for a client over a time period | JSON object: `topic_details` (array of up to 5 themes with per-topic RAG status), `executive_summary` (HTML), `rag_status` |
| `deep-search.md` | Score a single meeting's relevance to a user search query | JSON object: `relevant` (boolean), `relevance_summary` (string), `relevance_score` (0-100 integer) |
| `thread-evaluation.md` | Determine whether a meeting is related to a tracked thread | JSON object: `related` (boolean), `relevance_summary` (string), `relevance_score` (0-100 integer) |

## Key Concepts

**No system/user split**: All prompts are single-document templates passed as the user message. System-level behavioral constraints (tone, format rules) are embedded in the prompt body itself.

**Strict JSON output**: Extraction, insight-generation, deep-search, and thread-evaluation all instruct the model to return raw JSON only — no markdown fences, no preamble. The calling code parses the response directly.

**Template variables**: Each prompt uses `{{variable_name}}` placeholders. The `extraction.md` prompt includes `{{client_context}}` and `{{transcript}}`; `insight-generation.md` uses `{{client_name}}`, `{{period_type}}`, `{{period_start}}`, `{{period_end}}`, and `{{meeting_artifacts}}`; `deep-search.md` uses `{{query}}` and `{{meeting_context}}`; `thread-evaluation.md` uses `{{thread_title}}`, `{{thread_description}}`, `{{criteria_prompt}}`, and `{{meeting_context}}`.

**Extraction prompt design**: Uses a two-trigger model for action items (explicit commitment vs. situation-based urgency) and strict criteria for risk items (must be systemic, unresolved, and broadly impactful). Milestone extraction is restricted to client team members only.

**Insight generation prompt design**: Two-step reasoning (analyze → summarize) with explicit RAG criteria and a strict style guide (no editorializing, no vague characterizations, HTML output structure).

## Related

- Parent: [config/README.md](../README.md)
