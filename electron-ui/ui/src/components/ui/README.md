# ui/ — shadcn/Radix UI primitives and Lexical editor

Low-level UI primitives used throughout the component tree. These are unstyled or minimally styled building blocks based on Radix UI and class-variance-authority, plus a full Lexical rich-text editor. Components here have no knowledge of domain data — they only accept style props and callbacks.

## Files

| File | Purpose |
|------|---------|
| `button.tsx` | `Button` component with five variants (`default`, `secondary`, `ghost`, `destructive`, `outline`) and four sizes; built with `cva` from class-variance-authority |
| `badge.tsx` | Small inline label for status indicators and tags |
| `dialog.tsx` | Modal dialog built on Radix UI Dialog; exports `Dialog`, `DialogContent`, `DialogTitle`, and related parts |
| `scroll-area.tsx` | Radix UI ScrollArea wrapper for styled, cross-platform scrollbars |
| `rich-text-editor.tsx` | Full Lexical editor with a formatting toolbar (bold, italic, underline, ordered/unordered list); supports HTML input/output, `HeadingNode`, `QuoteNode`, `ListNode`, `ListItemNode`, and history/undo; controlled via `onChange` callback |
| `toast.tsx` | Toast notification system; exports `ToastContainer`, `useToast` hook, and toast state management |

## Key Concepts

**`rich-text-editor.tsx` is non-trivial:** Unlike the other primitives, it is a full Lexical editor composition with multiple plugins (RichTextPlugin, HistoryPlugin, OnChangePlugin, ListPlugin), a toolbar, and bidirectional HTML serialization using `$generateHtmlFromNodes` / `$generateNodesFromDOM`. It is used in dialogs where free-form text with formatting is needed (e.g., insight summaries).

**Styling convention:** All components use Tailwind CSS utility classes combined via `cn()` (from `lib/utils.ts`) for conditional class merging. Variants are controlled by `cva` in `button.tsx`; other components use plain `cn()` calls.

## Related

- Parent: [../README.md](../README.md)
- `cn` utility: `../../lib/utils.ts`
