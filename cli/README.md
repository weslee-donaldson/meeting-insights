# CLI

Two toolsets live under `cli/`:

| Directory | Audience | Description |
|-----------|----------|-------------|
| `admin-util/` | Operators / developers | Standalone Node scripts for bootstrapping, processing, querying, and maintaining the meeting insights pipeline. Every script imports from `core/` directly -- no IPC layer, no HTTP server required. Run them with `pnpm <script>` from the project root. |
| `mti/` | End-users / LLM agents | Customer-facing CLI client (`mti`) that talks to the API server over HTTP. See `mti/README.md` for usage. |

## Quick Links

- Admin scripts: [admin-util/README.md](admin-util/README.md)
- mti CLI client: `mti/README.md` (coming soon)
- Business logic: [../core/README.md](../core/README.md)
