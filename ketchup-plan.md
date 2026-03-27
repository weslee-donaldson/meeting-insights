# Ketchup Plan: Glossary Intelligence

## Context

The glossary in `clients.json` has been expanded to 66 terms (LLSA) and 60 terms (TerraQuantum). Currently, the full glossary (term + variants + description) is injected into every extraction prompt at ~4,800 tokens per call. Two improvements:

1. **Slim extraction prompt** — Only inject term → variants mapping (~1,200 tokens). Descriptions don't help the LLM normalize transcription errors.
2. **UI tooltips** — When glossary terms appear in rendered artifact text, show description on hover. Zero token cost, high user value.

**Key existing code:**
- `buildClientContext()` in `core/client-registry.ts` — renders glossary into extraction prompt (line 130-138)
- `getGlossaryForClient` in `core/client-registry.ts` — returns parsed glossary for a client name
- `MeetingDetail.tsx` — renders summary, action items, decisions with `dangerouslySetInnerHTML`
- `channels.ts` — defines `ElectronAPI` interface; already has `getClients`, `getDefaultClient`, `getGlossary`
- `@radix-ui/react-tooltip` — not installed but Radix is already a dependency pattern in the project

**Design principle:** Full glossary stays in `clients.json` and SQLite. Descriptions are a lookup resource, not prompt ballast. The UI already knows the selected client from meeting filters — glossary lookup is just `getGlossary(clientName) → GlossaryEntry[]`.

## Dependency Graph

```
#1 Slim Prompt ──────────────┐
(Bursts 1-2)                 │
                              │
#2 Glossary Lookup ──────────┤
(Burst 3)                    │
       │                     │
       ▼                     │
#3 UI Tooltips               │
(Bursts 4-6)                 │
```

Phase 1 (parallel): #1 + #2
Phase 2 (sequential): #3

---

## TODO

### Section 3: UI Tooltip Integration

- [x] Burst 4: `useGlossary` hook for client term lookup (CSS-only approach, no Radix dependency)
  - `useGlossary(clientName)` — React Query hook calling `window.api.getGlossary(clientName)`, caches by clientName
  - Test: hook returns glossary entries, disabled when null/undefined
  - Files: `electron-ui/ui/src/hooks/useGlossary.ts`, `test/ui/hooks.test.tsx`

- [x] Burst 5: `highlightGlossaryTerms` utility with CSS tooltip styling
  - Pure function: wraps first occurrence of each glossary term in `<span class="glossary-term">` with title attribute
  - Longest-match-first regex, word-boundary, HTML-safe escaping
  - CSS dotted underline + cursor:help for native tooltip
  - Test: 10 cases covering matching, variants, escaping, overlap, empty inputs
  - Files: `electron-ui/ui/src/lib/glossary-highlight.ts`, `electron-ui/ui/src/index.css`, `test/ui/glossary-highlight.test.ts`

- [ ] Burst 6: Wire `GlossaryHighlighter` into MeetingDetail sections
  - Pass `useGlossary(selectedClient)` into MeetingDetail
  - Wrap summary, decisions, action items, open questions, risk descriptions through highlighter
  - Test: MeetingDetail with glossary renders tooltip on matched term
  - Files: `electron-ui/ui/src/components/MeetingDetail.tsx`

## DONE

### Section 1: Slim Extraction Prompt

- [x] Burst 1: Slim glossary format — `buildClientContext` renders `term → variants` only, drops descriptions (ed4869c)
- [x] Burst 2: Pipeline test update — verify glossary assertion excludes description text (ed4869c)

### Section 2: Glossary Lookup API

- [x] Burst 3: `getGlossary(clientName)` channel end-to-end — core function, IPC, HTTP, api-client (fc8a02f)
