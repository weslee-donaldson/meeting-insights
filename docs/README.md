# Documentation

Operational and architectural reference for Meeting Insights. One file per top-level package or concern.

For first-time setup see [../SETUP.md](../SETUP.md). For project-level overview see [../README.md](../README.md).

## Contents

| Doc | Covers |
|-----|--------|
| [core.md](core.md) | Business logic: pipeline, extraction, embedding, dedup, client detection, threads, insights, milestones |
| [api.md](api.md) | HTTP endpoints: meetings, clients, action items, threads, insights, milestones, notes, search, OAuth |
| [cli.md](cli.md) | `mti` CLI (HTTP client for the API) |
| [cli-admin.md](cli-admin.md) | Admin pnpm scripts: setup, process, clear, purge, eval, manage-auth, PM2 services |
| [clients.md](clients.md) | Configuring `config/clients.json`: schema, aliases, teams, glossary, verification via API |
| [prompts.md](prompts.md) | Editing LLM prompts and chat templates under `config/`: variables, output contracts, tuning knobs |
| [ui.md](ui.md) | Electron desktop app + web UI (LinearShell, views, chat panel, design system) |
| [webhook.md](webhook.md) | Automated transcript ingestion: Firebase Cloud Function, Google Drive sync, local watcher |
| [database.md](database.md) | SQLite schema, LanceDB tables, versioned migration system |
| [reference.md](reference.md) | Environment variable reference, data directory layout, config files |

## Conventions

- Every file is self-contained -- cross-links are inline.
- Code identifiers use backticks: `functionName()`, `file.ts`.
- Paths relative to the repo root: `core/pipeline.ts`, not `/Users/.../core/pipeline.ts`.
- Command examples are copy-pasteable assuming `cwd` is the repo root.
