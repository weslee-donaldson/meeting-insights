# local-service/ — Standalone file watcher service managed by pm2

This directory contains a background service that watches `data/webhook-rawtranscripts/` for new Krisp webhook JSON files and automatically processes them through the full pipeline. It runs as its own Node.js process, completely independent from the API server (`pnpm api:dev`) and web UI (`pnpm web:dev`).

**Managed by pm2** via `ecosystem.config.cjs` at the project root. Starts at boot, runs continuously, auto-restarts on crash (up to 10 times with 5s delay).

## Files

| File | Purpose |
|------|---------|
| `watcher.ts` | `createWatcher(options)` detects new `*.json` files via `fs.watch` with a periodic scan fallback (30s). Debounces rapid events for the same file (Drive may write incrementally). Ignores non-JSON and hidden files. Returns a `Watcher` with a `stop()` method. |
| `main.ts` | Service entry point. Exports `startService(config)` which initializes DB, vector DB, embedder, and LLM. Creates the watcher, processes each detected file through `processWebhookMeetings`. Handles SIGINT/SIGTERM for graceful shutdown. When run directly via pm2/tsx, loads config from `.env.local` via `loadCliConfig()`. |

## Commands

| Command | What it does |
|---------|--------------|
| `pnpm service:start` | Start the watcher via pm2 |
| `pnpm service:stop` | Stop the watcher |
| `pnpm service:logs` | Tail pm2 logs for the watcher |
| `pnpm service:status` | Show pm2 process status |

## How it works

1. pm2 starts `main.ts` via tsx
2. `main.ts` initializes core dependencies (DB, vector DB, ONNX embedder, LLM adapter)
3. `createWatcher` monitors `data/webhook-rawtranscripts/` for new `.json` files
4. When a file appears, the watcher debounces (2s default), then calls the processing callback
5. The callback runs the file through the full pipeline: parse → ingest → detect client → extract → embed
6. Processed files move to `data/webhook-processed/`; failures move to `data/webhook-failed/`

## Key Concepts

- `fs.watch` is unreliable on macOS with Google Drive sync, so a 30s periodic scan catches missed files
- Debouncing prevents processing partially-written files (Google Drive writes incrementally)
- The `seen` set prevents duplicate processing within a single service session

## Related

- Parent: [Root gather](../gather.md)
- Pipeline logic: [core/scatter](../core/scatter.md) (`pipeline.ts`)
- pm2 config: `ecosystem.config.cjs` at project root
