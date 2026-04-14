# core/llm/

LLM adapter and provider implementations.

## Files

| File | Purpose |
|------|---------|
| `adapter.ts` | `createLlmAdapter(config)` factory + `LlmAdapter` interface. Defines `LlmCapability` union: `extract_artifact`, `cluster_tags`, `generate_task`, `synthesize_answer`, `deep_search_filter`, `evaluate_thread`, `generate_insight`, `dedup_intent` |
| `helpers.ts` | `stripCodeFences`, `parseJsonOrThrow`, `withRepair(call, content)` -- retries once with a repair prefix on JSON parse failure, falls back to `{ __fallback: true, raw_text }` |
| `provider-anthropic.ts` | Anthropic SDK. `claude-sonnet-4-6` default. Capability-specific `max_tokens` |
| `provider-openai.ts` | OpenAI SDK. `gpt-4o` default |
| `provider-local.ts` | Ollama HTTP client at `MTNINSIGHTS_LOCAL_BASE_URL/api/chat` |
| `provider-claudecli.ts` | Shells out to `claude --print --output-format json`. Session cache for multi-turn via `--resume`. No API key required |
| `provider-claudeapi.ts` | HTTP client for a local Claude API proxy (port 8100 by default). Session cache for multi-turn |
| `provider-stub.ts` | Deterministic test fixtures. `STUB_FIXTURES` maps each capability to a fixed response |

## Parent

[core/llm-context.md](../llm-context.md)
