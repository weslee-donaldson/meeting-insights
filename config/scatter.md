# config/ — Runtime configuration files

Static configuration loaded at startup or on demand by the application. No build step required; files are read directly from disk.

## Files

| File | Purpose |
|------|---------|
| `clients.json` | Client definitions: names, aliases, and meeting name patterns used for client detection and seed data. Path is overridable via the `MTNINSIGHTS_CLIENTS_PATH` environment variable, allowing different client sets per deployment. |
| `system.json` | System-level search configuration: `search.maxDistance` (LanceDB L2 distance cutoff) and `search.limit` (max results returned). |
| `chat-guidelines.md` | Formatting and content rules injected as system context for all chat interactions. Enforces no em-dashes, no emoji, no filler phrases, direct answers from provided context only. |

## Related

- Parent: [Root gather](../gather.md)
- Children: [gather.md](gather.md)
