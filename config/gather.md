# config/ — Child directory rollup

## Subdirectories

| Dir | Summary | Scatter |
|-----|---------|---------|
| `prompts/` | LLM prompt templates for extraction, insight generation, deep search, and thread evaluation | [prompts/scatter.md](prompts/scatter.md) |
| `chat-templates/` | Output structure templates for free-form chat tasks: thread discovery, Jira epic, Jira ticket | — |

## Key Learnings from Children

**From `prompts/`:** All prompt templates use `{{variable}}` placeholders and instruct the model to return strict JSON (no markdown fences, no preamble). The extraction prompt uses a two-trigger model for action items (explicit commitment vs. situation-based urgency) and restricts milestone extraction to client team members only. The insight generation prompt enforces two-step reasoning (analyze then summarize) with explicit RAG criteria. These design choices are load-bearing — changing a prompt's output format requires updating the corresponding parser in `core/`.

## Related

- Parent: [scatter.md](scatter.md)
