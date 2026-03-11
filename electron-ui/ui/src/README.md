# src/ — React application source

Top-level source files for the Meeting Intelligence Explorer UI. The application is a single React tree rendered into `#root`. All domain state is managed by four feature hooks instantiated in `App.tsx` and passed down as props to page components.

## Files

| File | Purpose |
|------|---------|
| `App.tsx` | Root application component — instantiates `useMeetingState`, `useThreadState`, `useInsightState`, `useMilestoneState`; fetches clients/templates/default-client; manages `currentView` and `selectedClient`; wires all dialogs (new meeting, create thread, create insight, create milestone); selects the active page based on `currentView` |
| `main.tsx` | Electron entry point — creates `QueryClient`, wraps `App` in `ThemeProvider` + `QueryClientProvider`, mounts to `#root`; relies on `window.api` being populated by the preload script |
| `main-web.tsx` | Web browser entry point — same as `main.tsx` but first assigns `window.api = apiClient` (from `api-client/index.ts`) so the HTTP fetch implementation is active |
| `api-client.ts` | Re-export shim — `export { apiClient } from "./api-client/index.js"` for use by `main-web.tsx` |
| `ThemeContext.tsx` | React context and `ThemeProvider` for the active theme name; persists selection to `localStorage` under `mtninsights-theme`; exposes `useTheme()` hook |
| `theme.ts` | Static theme definitions — `Theme` type, `ThemeName` union, `themes` array, `DEFAULT_THEME` constant |
| `index.css` | Global CSS including Tailwind directives and CSS custom properties for each theme |
| `env.d.ts` | Vite environment type declarations |

## Subdirectories

| Dir | Summary | README |
|-----|---------|--------|
| `components/` | Domain and layout UI components | [README](components/README.md) |
| `pages/` | Feature view composers rendered by App.tsx | [README](pages/README.md) |
| `hooks/` | Data query hooks and stateful feature hooks | [README](hooks/README.md) |
| `lib/` | Utility functions (cn, artifact merging) | [README](lib/README.md) |
| `api-client/` | HTTP fetch implementation of ElectronAPI for web mode | [README](api-client/README.md) |

## Related

- Parent: [../README.md](../README.md)
- `window.api` contract: `../../../electron/channels.ts`
