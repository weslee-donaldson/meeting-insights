# cli/ -- CLI tools directory

Contains two subdirectories serving different audiences.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `admin-util/` | Operator and developer scripts that drive `core/` directly. Standalone Node scripts for bootstrapping, processing, querying, and maintaining the pipeline. See `admin-util/scatter.md` for file details. |
| `mti/` | Customer-facing CLI client that talks to the API server over HTTP. See `mti/scatter.md` for file details (coming soon). |

## Related

- Parent: [Root README](../README.md)
- Business logic: [core/README.md](../core/README.md)
- Admin scripts detail: [admin-util/scatter.md](admin-util/scatter.md)
