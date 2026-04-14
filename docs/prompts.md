# Configuring Prompts

Every LLM call in this system is driven by a Markdown file under `config/`. Editing these files changes extraction quality, chat tone, and output shape — **without touching any code**. The files are read at runtime, so restart the API server (`pm2 restart mti-api`) after changes to pick them up.

This document covers:

- Where each prompt lives and what it drives
- Template variables (what the runtime interpolates)
- How to tweak safely (and what breaks if you don't)
- Per-client overrides

---

## File map

| Path | Role | Called by |
|---|---|---|
| `config/prompts/extraction.md` | Extracts structured artifacts (summary, decisions, action items, risks, milestones) from a transcript. | Ingestion pipeline — runs once per meeting. |
| `config/prompts/insight-generation.md` | Generates a client's executive insight report over a time period. | Insight generator (daily/weekly/monthly). |
| `config/prompts/deep-search.md` | Scores one meeting's relevance to a user search query. | Deep search feature. |
| `config/prompts/thread-evaluation.md` | Decides whether a meeting belongs to a tracked thread. | Thread watcher. |
| `config/prompts/dedup-intent.md` | Classifies whether two action items represent the same task. | Action-item dedup. |
| `config/prompts/llm-context.md` | Index/reference for the other prompt files. Not sent to the LLM. | Humans and the LLM context loader. |
| `config/chat-templates/*.md` | Output-shape templates the chat assistant uses when the user asks for a specific format (Jira ticket, Jira epic, team actions, thread discovery). | Chat assistant, selected by intent. |
| `config/chat-guidelines.md` | Global chat response rules (formatting, tone, refusals). Prepended to every chat call. | Chat assistant. |
| `config/system.json` | Numeric knobs: search `maxDistance`, `limit`, `displayLimit`, `chatContextLimit`. Not a prompt, but shapes what the prompt sees. | Search layer. |

---

## Template variables

Prompts use `{{variable}}` interpolation. The runtime injects values before sending to the LLM. If you reference a variable the runtime doesn't provide, it renders literally — a silent bug.

| Prompt | Variables |
|---|---|
| `extraction.md` | `{{client_context}}`, `{{transcript}}` |
| `insight-generation.md` | `{{client_name}}`, `{{period_type}}`, `{{period_start}}`, `{{period_end}}`, `{{meeting_artifacts}}` |
| `deep-search.md` | `{{query}}`, `{{meeting_context}}` |
| `thread-evaluation.md` | `{{thread_title}}`, `{{thread_description}}`, `{{criteria_prompt}}`, `{{meeting_context}}` |
| `dedup-intent.md` | See file header. |

**Rule:** when tweaking a prompt, do not rename or remove a variable. The calling code passes by name. Add prose around variables freely.

---

## Output contract

Extraction, insight-generation, deep-search, thread-evaluation, and dedup-intent all return **raw JSON** — no markdown fences, no preamble. The calling code does `JSON.parse()` on the response.

**Safe tweaks:**
- Rewording instructions, tightening criteria, adding examples
- Adding fields to the JSON output **only if** you also update the consumer (type + downstream handlers)
- Changing tone, adding domain constraints, raising/lowering extraction aggressiveness

**Breaking tweaks (will crash the pipeline):**
- Removing a required JSON field
- Renaming a field
- Instructing the model to wrap output in markdown fences
- Adding free-text preamble outside the JSON
- Relaxing "return ONLY JSON" — models will happily add commentary if given permission

When in doubt, run `pnpm eval` after a prompt change. It exercises the full pipeline against canned queries and will surface JSON-parse failures.

---

## Chat templates vs. chat guidelines

Two different knobs, commonly confused:

**`config/chat-guidelines.md`** — global rules prepended to every chat call. Use this for:
- Tone (no em-dashes, no emoji, no filler)
- Formatting defaults (bullet styles, heading use)
- Refusal behavior (what to do when context is missing)

**`config/chat-templates/*.md`** — output-shape templates selected by user intent. Use these for:
- "Give me a Jira ticket" → `jira-ticket.md`
- "Give me team actions" → `team-actions.md`
- Fixed-structure outputs where sections must match exactly

Edit `chat-guidelines.md` when the assistant's voice is off. Edit a template when a specific output format needs changes.

---

## Per-client customization

You can shape extraction for a single client without editing the shared prompt. See [docs/clients.md](clients.md):

- `additional_extraction_llm_prompt` — free-text guidance appended to `extraction.md`'s `{{client_context}}`. Use for authority rules, decision-making norms, client-specific priorities.
- `glossary` — domain terms and Krisp mis-transcriptions. Injected so the LLM normalizes jargon.
- `client_team` / `implementation_team` — roster and roles. The extractor uses these to assign ownership correctly.

**Prefer client config over prompt edits.** The shared prompts are hard to revert cleanly; client config is scoped and safe.

---

## Workflow for changing a prompt

1. Copy the current file aside: `cp config/prompts/extraction.md /tmp/extraction.before.md`
2. Edit the file. Keep variables intact. Keep the JSON contract.
3. Restart the API: `pm2 restart mti-api`
4. Run `pnpm eval` — confirms the JSON still parses end-to-end.
5. Reprocess a known meeting and inspect the result:
   ```bash
   pnpm mti meetings list <client>
   pnpm mti meetings reprocess <short_id>
   ```
6. Compare audit logs in `data/audit/` to see the actual request/response the LLM produced.

**If quality regresses**, `git diff config/prompts/` shows your change. Revert with `git checkout -- config/prompts/extraction.md`.

---

## Tuning the knobs in `system.json`

```json
{
  "search": {
    "maxDistance": 1.7,
    "limit": 50,
    "displayLimit": 20,
    "chatContextLimit": 10
  }
}
```

- `maxDistance` — cosine-distance cutoff. Lower = stricter relevance. Raise if searches miss obvious matches; lower if results feel noisy.
- `limit` — internal result cap before filtering.
- `displayLimit` — how many results the UI shows.
- `chatContextLimit` — how many meetings the chat assistant pulls as context per question. Raise for breadth, lower for speed/cost.

Changes take effect on API restart.

---

## Common tweaks

| Goal | Where |
|---|---|
| Assistant is too chatty / adds preamble | `config/chat-guidelines.md` |
| Extraction misses action items | `config/prompts/extraction.md` (loosen Trigger A/B) or per-client `additional_extraction_llm_prompt` |
| Extraction hallucinates action items | `config/prompts/extraction.md` (tighten triggers, add negative examples) |
| Jira ticket format is wrong | `config/chat-templates/jira-ticket.md` |
| Insight reports feel generic | `config/prompts/insight-generation.md` (tighten RAG criteria, require specifics) |
| Krisp mangles a jargon term | Per-client `glossary` in `config/clients.json` (see [docs/clients.md](clients.md)) |
| Search misses relevant meetings | `config/system.json` — raise `maxDistance` |
| Chat answers feel shallow | `config/system.json` — raise `chatContextLimit` |
