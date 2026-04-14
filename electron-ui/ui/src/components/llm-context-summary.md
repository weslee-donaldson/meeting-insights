# components/ — Gathered context from child directories

## Subdirectories

| Dir | Summary | Scatter |
|-----|---------|---------|
| `shared/` | Cross-domain reusable patterns (command bar, filter bar, list rows, density toggle, show-more, chat FAB) | [llm-context.md](shared/llm-context.md) |
| `ui/` | Radix/shadcn primitives, Lexical rich-text editor, bottom-sheet, and responsive-dialog | [llm-context.md](ui/llm-context.md) |

## Key Learnings from Children

**From `shared/`:** `list-item-row.tsx` is the most reused component — every list view renders through it, so changes to its layout affect all views. It now supports a `touchTarget` prop for mobile-friendly hit areas and exports a `MeetingAvatar` sub-component. `workspace-banner.tsx` supports a compact mobile mode. `show-more.tsx` and `chat-fab.tsx` are mobile-specific interaction patterns. Density (compact/comfortable/spacious) is a global setting that controls row padding and spacing app-wide, not per-view.

**From `ui/`:** `rich-text-editor.tsx` is non-trivial — it is a full Lexical editor composition with multiple plugins, a formatting toolbar, and bidirectional HTML serialization. `bottom-sheet.tsx` provides a slide-up sheet on mobile that falls back to `Dialog` on desktop. `responsive-dialog.tsx` wraps this pattern so callers get viewport-adaptive dialogs without manual breakpoint checks. The other primitives are thin Radix wrappers. All styling uses `cn()` (clsx + tailwind-merge) and `cva` for variant-based class generation.

## Related

- Scatter file: [llm-context.md](llm-context.md)
- Parent: [../llm-context-summary.md](../llm-context-summary.md)
