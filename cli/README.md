# cli/ — Developer and operator scripts that drive core/ directly

These are standalone Node scripts for one-off and batch operations. They import from `core/` directly — no IPC layer, no HTTP layer — which makes them useful for bootstrapping, debugging, and evaluation without a running Electron or API process.

## Files

| File | Purpose |
|------|---------|
| `run.ts` | Main ingestion script (`pnpm run`). Loads `.env.local`, initialises the DB and vector DB, loads the ONNX model, then calls `processNewMeetings` on `data/raw-transcripts/`. Prints per-file progress with client assignment and elapsed time. Writes a full event log to `logs/run-<timestamp>.json`. Run this after dropping new transcript files into the raw directory. |
| `setup.ts` | First-time and re-initialisation script (`pnpm setup`). Creates the SQLite DB, runs migrations, seeds clients from `config/clients.json`, and ensures LanceDB tables exist. When `MTNINSIGHTS_LLM_PROVIDER=local`, validates Ollama server reachability and pulls the configured model if absent. Run this once before the first `pnpm run`. |
| `query.ts` | Ad-hoc querying tool (`pnpm query`). Supports three modes: (1) **ask mode** — embeds a natural-language question, retrieves top-K meetings, builds labeled context, and synthesises an answer via LLM; (2) **search mode** (`--search`) — returns a ranked list of matching meetings with score and summary excerpt; (3) **list mode** (`--list <type>`) — dumps structured artifact fields (meetings, summary, decisions, features, actions, questions, risks, notes) as formatted terminal output. All modes accept `--client`, `--after`, `--before`, `--meeting`, and `--limit` filters. Pass `--deepsearch` with `--search` to run an LLM relevance filter over the vector results. |
| `eval.ts` | Batch evaluation script (`pnpm eval`). Reads a list of questions from `data/eval/questions.json`, runs each through the full search-and-answer pipeline, and appends JSONL records (question, retrieved IDs, cited IDs, answer, latency) to `data/eval/results-<provider>-<timestamp>.jsonl`. Used to measure retrieval quality and LLM answer quality across providers. |
| `assign-client.ts` | Client assignment utility (`pnpm assign-client "<title or ID>" "<client name>"`). Overwrites `client_detections` for matching meetings with `confidence=1.0, method=manual`. Also exports `assignClient(db, identifier, clientName)` for programmatic use. Use this to correct a misdetected or undetected client without re-running the full pipeline. |
| `purge.ts` | Selective or full data deletion (`pnpm purge [meetingId]`). With a meeting ID: removes all SQLite rows for that meeting and deletes its vectors from all LanceDB tables. Without an argument: deletes the entire SQLite DB and LanceDB directory. Run `pnpm setup` after a full purge to reinitialise. |
| `reset.ts` | Full pipeline reset (`pnpm reset`). Deletes the SQLite DB and LanceDB directory, then moves all files from `data/processed/` and `data/failed-processing/` back to `data/raw-transcripts/` so they can be reprocessed. Leaves client config and model files untouched. |
| `test-ollama.ts` | Ollama connectivity check (`pnpm test-ollama`). Verifies the configured Ollama server is reachable, lists available models, confirms the target model is present, and sends a minimal test prompt to validate inference end-to-end. Use this to diagnose local LLM issues before running `pnpm setup` or `pnpm run`. |

## Key Concepts

All scripts read `MTNINSIGHTS_DB_PATH`, `MTNINSIGHTS_VECTOR_PATH`, `MTNINSIGHTS_LLM_PROVIDER`, and related provider variables from `.env.local` via `process.loadEnvFile?.(".env.local")`.

CLI tools call `core/` functions directly and are responsible for their own DB and vector DB initialisation. They do not go through the HTTP API or Electron IPC.

## Related

- Parent: [Root README](../README.md)
- Business logic: [core/README.md](../core/README.md)
