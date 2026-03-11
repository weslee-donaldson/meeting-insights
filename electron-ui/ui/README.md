# ui/ — React UI package

The renderer-side package of the Meeting Intelligence Explorer. It is a standard Vite + React + TypeScript project with two entry points: one for running inside Electron, and one for running as a standalone web application backed by the Hono HTTP API.

## Key Concepts

**Two HTML entry points:**

| File | Entry script | Mode |
|------|-------------|------|
| `index.html` | `src/main.tsx` | Electron — `window.api` is populated by the preload context bridge |
| `index-web.html` | `src/main-web.tsx` | Web browser — `window.api` is assigned from `api-client/index.ts` before React mounts |

Both entry points render the same `App` component. The only difference is how `window.api` is wired.

## Subdirectories

| Dir | Summary | README |
|-----|---------|--------|
| `src/` | All React application source | [README](src/README.md) |

## Related

- Parent: [../README.md](../README.md)
- Electron main process: `../electron/` ([README](../electron/README.md))
