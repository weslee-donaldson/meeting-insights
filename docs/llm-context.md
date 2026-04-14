# docs/ — Operational documentation

Human-readable reference split by top-level package/concern. One file per area; cross-links are inline. See [README.md](README.md) for the index.

## Files

| File | Purpose |
|------|---------|
| `README.md` | Index of the docs folder with a one-line description of each file |
| `core.md` | Business logic layer: pipeline, parser, extractor, embedder, vector store, client registry/detection, item dedup, meeting split, search layers, LLM adapter, migrations, paths, logging, errors |
| `api.md` | Full HTTP API reference. Every endpoint in `api/routes/*.ts` with method, path, body shape, response shape, status codes, and required scope. Includes the scope-to-route mapping table and OAuth 2.1 flows |
| `cli.md` | mti CLI (HTTP client): installation, configuration (`~/.mtirc`, `MTI_BASE_URL`, `MTI_TOKEN`), exit codes, all subcommands (clients, meetings, items, notes, config, health), auth token setup |
| `cli-admin.md` | Admin pnpm scripts: setup, process, clear, purge, query, eval, assign-client, all-items-dedupe, manage-auth, import-external, download-models, PM2 services, dev commands |
| `ui.md` | Electron desktop + web UI: launch modes, LinearShell 3-zone layout, ResponsiveShell breakpoints, 6 views (Meetings, Action Items, Threads, Insights, Timelines, Search), TopBar, chat panel, design tokens, state persistence, build commands |
| `webhook.md` | Automated ingestion pipeline: Firebase Cloud Function (`webhook-transcript-handler/`), Google Drive sync, local watcher (`local-service/`), PM2 commands, SMTP alerts, troubleshooting |
| `database.md` | SQLite schema (all tables with fields), LanceDB tables, versioned migration system (`core/migrations/`), adding new migrations, backup strategy |
| `reference.md` | Environment variable reference by category (LLM provider, paths, API, CLI, logging, dedup, eval, SMTP), data directory layout, config files (`clients.json`, `system.json`, prompt templates, chat templates) |

## Conventions

- Each file is self-contained; cross-links are inline where relevant
- Code identifiers in backticks: `functionName()`, `file.ts`
- Paths are relative to the repo root: `core/pipeline.ts`, not absolute
- Command examples assume `cwd` is the repo root

## Related

- Parent: [Root README](../README.md)
- First-time setup: [SETUP.md](../SETUP.md)
