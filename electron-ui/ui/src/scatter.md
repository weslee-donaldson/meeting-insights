# src/ — React application source

Top-level source files for the Meeting Intelligence Explorer UI. The application is a single React tree rendered into `#root`. All domain state is managed by four feature hooks instantiated in `App.tsx` and passed down as props to page components.

## Files

| File | Purpose |
|------|---------|
| `App.tsx` | Root application component — instantiates `useMeetingState`, `useThreadState`, `useInsightState`, `useMilestoneState`; fetches clients/templates/default-client; manages `currentView` and `selectedClient`; wires all dialogs; wraps content in `ResponsiveShell` (replaced `LinearShell` as top-level layout) |
| `main.tsx` | Electron entry point — creates `QueryClient`, wraps `App` in `ThemeProvider` + `QueryClientProvider`, mounts to `#root`; relies on `window.api` being populated by the preload script |
| `main-web.tsx` | Web browser entry point — same as `main.tsx` but first assigns `window.api = apiClient` (from `api-client/index.ts`) so the HTTP fetch implementation is active |
| `api-client.ts` | Re-export shim — `export { apiClient } from "./api-client/index.js"` for use by `main-web.tsx` |
| `ThemeContext.tsx` | React context and `ThemeProvider` for the active theme name; persists selection to `localStorage` under `mtninsights-theme`; exposes `useTheme()` hook |
| `theme.ts` | Static theme definitions — `Theme` type, `ThemeName` union, `themes` array, `DEFAULT_THEME` constant |
| `design-tokens.ts` | Design system constants — breakpoints (`mobile` < 768, `tablet` < 1280, `desktop`), per-breakpoint layout tokens (nav height, panel width, spacing), typography scale, color roles, and component-level specs; all UI components import values from here |
| `index.css` | Global CSS including Tailwind directives, CSS custom properties for each theme, and responsive layout custom properties |
| `env.d.ts` | Vite environment type declarations |

## Related

- Parent: [../gather.md](../gather.md)
- Gather: [gather.md](gather.md)
- `window.api` contract: `../../../electron/channels.ts`
