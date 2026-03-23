# scripts/ — Developer utility scripts

Standalone scripts for development and operational tasks. Not part of the application runtime.

## Files

| File | Purpose |
|------|---------|
| `llm-check.ts` | Smoke test for the configured LLM provider. Reads `MTNINSIGHTS_LLM_PROVIDER`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `MTNINSIGHTS_LOCAL_BASE_URL`, and `MTNINSIGHTS_LOCAL_MODEL` from `.env.local`, creates an `LlmAdapter`, sends a minimal JSON-echo prompt, and prints the response and latency. Exits non-zero on failure. Run with `npx tsx scripts/llm-check.ts`. |
| `api-restart.sh` | Kills any process occupying port 3000, then starts the API server via `pnpm api:dev`. Useful when the dev server gets stuck after a crash. |

## Related

- Parent: [Root README](../README.md)
