# 🥫 The Ketchup Technique

> Controlled Bursts | TDD | TCR | 100% Coverage | Emergent Design | Extreme Ownership

## Core Loop

```
Red → Green → TCR → Refactor → TCR → Done
TCR: test && commit || revert
- Pass → commit → continue
- Fail → REVERT → RETHINK (smaller steps or new design)
```

Never patch failing code. Revert, learn, try differently.

## Bursts

One test, one behavior, one commit. No exceptions.

Each burst: independent, valuable, small, testable, reviewable.

The constraint is scope, not time. Keep bursts small enough that:

- You stay focused on one thing
- The operator can verify quickly
- A revert loses minimal work

E2E exception: E2E tests may combine 2 tightly-coupled bursts when splitting creates artificial boundaries.

## Workflow

1. Create `ketchup-plan.md` with TODO/DONE sections, commit before coding
2. Write ONE failing test
3. Write MINIMAL passing code
4. TCR (update plan in same commit)
5. Refactor if needed → TCR
6. Move burst to DONE → TCR
7. Next burst

```markdown
# Ketchup Plan: [Feature]

## TODO

- [ ] Burst 1: [description]

## DONE

- [x] Burst N: [description] (hash)
```

## RETHINK After Revert

After a revert, do not immediately retry the same approach. Ask:

1. Was the burst too big? → Split it smaller
2. Was the design flawed? → Try a different approach
3. Was the test wrong? → Clarify the requirement first
4. Is the root cause unclear? → Run `/investigate` (trace code, form hypotheses, 3-strike rule, scope-lock edits)

Only then write the next failing test.

## Refactoring

Refactor for readability, not for explanation. If code is complex, rename variables or extract functions. Do not add comments.

## Coverage

100% enforced. No escape hatches.

Exclusions allowed ONLY for: barrel `index.ts` re-exports, `*.test.ts` files

Forbidden:

- Excluding files to avoid testing them
- Standalone type files (`types.ts`, `interfaces.ts`) — types live inline where used
- `@ts-ignore`, `any`, `as SomeType` casts

| Do                              | Don't                                    |
| ------------------------------- | ---------------------------------------- |
| Let tests drive all code        | Write code without a failing test first  |
| Add branches only when tested   | Defensive `??`, `?:`, `if/else` untested |
| Test all error paths            | Leave error handling unverified          |
| Remove dead code after each run | Keep unused code "just in case"          |

## Design

Behavior first. Types/interfaces emerge from tests.

```ts
// First test calls a function, asserts output
it("creates user with generated id", () => {
  const result = createUser({ name: "Alice" });
  expect(result).toEqual({ id: expect.any(String), name: "Alice" });
});
// Types emerge because the function needs them
```

## Testing Rules

**Title = Spec:** Test body proves exactly what `it('should...')` claims. One assertion per behavior.

**Assertion Strength:** Never use weak assertions (`toBeDefined`, `toBeTruthy`, `not.toBeNull`). Assert the exact shape and value. If you don't know the exact value, use `expect.any(String)` or `expect.any(Number)`.

**Stubs over mocks:** Deterministic stubs preferred. Mock only at boundaries.

**Assert whole objects:** `expect(result).toEqual({...})` not cherry-picked properties.

**Squint test:** All tests must follow: SETUP (data) → EXECUTE (function call) → VERIFY (whole object assertion). No multiple execute/verify cycles in one test.

**No state peeking:** Test observable behavior, not internal state.

Litmus Test: "If I changed the internal data structure (e.g., Map to Array), would this test still pass?" If no, the test is coupled to implementation.

| Forbidden (Implementation)                              | Allowed (Behavior)                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `expect(tracker.getActiveCount()).toBe(0)`              | Test via callbacks/events                                                 |
| `expect(manager.clientCount).toBe(3)`                   | `tracker.onEvent(e => events.push(e))`                                    |
| `expect(service["internalMap"].size).toBe(2)`           | Test via return values                                                    |
| `tracker.cleanup(); expect(tracker.getCount()).toBe(0)` | Test cleanup by re-triggering: start same id, verify callback fires again |

**Do NOT expose methods solely for testing.** If you're adding `.getCount()` or `.getActiveSessionCount()` just to make tests pass, you're testing implementation, not behavior.

## Guardrails

- No comments — write self-expressing code
- No excuses, no "you're right" — keep working
- JS files only in `dist/`
- When tests fail, assume you broke it. CI passed before; your change is the variable.
- If the project contains readme.md files, use those files to understand and navigation the project. Folders may leverage a scatter and gather pattern where each director has a readme that details all files and functionality within the directory. 

**Backwards compatibility:** Ask first. Default to clean breaks. No silent preservation unless explicitly requested.

Backwards-compatibility hacks to avoid:

- Re-exporting moved/renamed symbols
- Keeping unused parameters with `_` prefix
- Adding `// @deprecated` comments for removed code
- Wrapper functions that delegate to new implementations

## Extreme Ownership

Every problem is your problem. No deflection. No explaining why something is broken.

See a problem → fix it or add a burst to fix it. No third option.

If you read a file, you're responsible for its state when you're done.

| Situation                | Wrong Response                          | Ownership Response            |
| ------------------------ | --------------------------------------- | ----------------------------- |
| Bug in existing code     | "The existing code has a bug where..."  | Fix it or add burst to fix it |
| Test suite has gaps      | "Coverage was incomplete before..."     | Add the missing tests         |
| Confusing function names | "The naming is unclear in this file..." | Rename in refactor phase      |
| Missing error handling   | "Error handling wasn't implemented..."  | Add it now                    |
| Flaky test               | "This test appears to be unreliable..." | Stabilize it or add burst     |

## Infrastructure Commits

Config files need no tests: `package.json`, `tsconfig.json`, `wrangler.toml`, `vite.config.ts`, `vitest.config.ts`, `.gitignore`, `ketchup-plan.md`

Format: `chore(scope): description`

First behavioral `.ts` file requires a test.

## Documentation

Documentation is code. Outdated docs are bugs.

Update docs when: adding features, changing APIs, completing milestones.

Do not create new documentation files unless the feature explicitly requires them.

## TCR Command

```bash
pnpm test --run && git add -A && git commit -m "<MSG>" || git checkout -- .
```

Replace `git checkout -- .` with a specific path (e.g., `packages/<pkg>/`) to limit revert scope when working in a monorepo.

Check IDE diagnostics on all uncommitted files before committing.

## Plea System

If the commit validator rejects your commit but you believe it's valid, add `plea: <reason>` to your commit message.

**Valid pleas:**

- Files must be committed together for coherence
- Existing code lacked coverage before your changes

**Invalid pleas (will be rejected):**

- Skipping tests for new code
- Untested code paths
- Any other CLAUDE.md rule bypass

## Design System Compliance (Paper MCP)

The Paper MCP server provides access to the design artboards in `Meeting Insights.paper`. This is the visual source of truth.

**Mandatory artboard check:** Before implementing any UI burst that references a Paper artboard in the ketchup-plan, you MUST:

1. Use `get_basic_info` to find the artboard list
2. Use `get_screenshot` on the referenced artboard to see the exact design
3. Use `get_computed_styles` on specific nodes if you need exact CSS values
4. Implement the component matching the artboard exactly
5. After implementation, use Playwright MCP to navigate to the running app (`http://localhost:5188`) and `browser_take_screenshot` to compare your result against the artboard

**Design tokens file:** `electron-ui/ui/src/design-tokens.ts` contains all spacing, typography, radius, and component specs extracted from Paper. Components MUST import values from this file — never hardcode hex colors, pixel sizes, or font values inline.

**Accessibility:** All text must meet WCAG AA. Use the 3-tier text system from `design-tokens.ts`:
- Primary/Body text: 7:1+ contrast (use `--color-text-primary` or `--color-text-body`)
- Secondary text: 4.5:1+ contrast (use `--color-text-secondary`)
- Muted text: 3:1+ contrast, ONLY for labels at 11px+ bold (use `--color-text-muted`)
- NEVER use `--color-line` or any decorative color for readable text

**Visual verification loop (per section):** After completing all bursts in a ketchup-plan section:
1. Start the dev server (`pnpm web:dev`)
2. Use Playwright MCP to resize browser to 2560×1440
3. Navigate to the affected page
4. Take a screenshot
5. Compare against the Paper artboard using `get_screenshot`
6. Fix any visual discrepancies before moving to the next section

| Violation | Response |
| --- | --- |
| Hardcoded hex color in a component | Replace with CSS var or design-tokens import |
| Text using decorative-tier color | Upgrade to secondary-tier minimum |
| Component doesn't match artboard | Fix before moving to next burst |
| Skipping artboard check | Not acceptable — check first, code second |

## Plan Review (Pre-flight)

Before executing any ketchup plan, the orchestrator (or solo agent) MUST review the plan and flag gaps. Do not start coding until gaps are resolved.

**Checklist — flag if missing or ambiguous:**

1. **Data shape verification**: For every data contract in the plan (API responses, DB queries, IPC messages, props), read the actual source code that produces it. Verify field names, types, and nesting match. Plans often document simplified shapes that omit nested objects, optional fields, or serialized columns.
2. **Real fixture mandate**: If the plan provides example data for test fixtures, verify it matches production data by reading the source that produces it (DB schema, parser output types, API handlers, component props). Flag any fixture that uses simplified types.
3. **UX defaults for data display**: Any feature that renders lists, tables, or collections must specify: default result limit, sort order, and truncation behavior. If unspecified, flag it — "show everything" is a missing decision, not a default.
4. **Shared file collision map**: If multiple agents will modify the same file (e.g., an entry point, a router, a registry, package.json), the plan must specify the merge strategy and the exact pattern each agent follows.
5. **Error propagation path**: Trace errors from where they're thrown to where the user sees them. If there's a global error boundary, every code path must use it. Flag inconsistencies where some paths use it and others don't.
6. **Framework quirks**: Flag any framework behavior that could surprise agents (option inheritance, middleware ordering, lifecycle timing, state management gotchas). Add a note in the plan's context section so agents don't rediscover it independently.

**Output**: A numbered list of gaps with severity (blocking / non-blocking). Blocking gaps must be resolved before Burst 0. Non-blocking gaps become additional bursts or notes in the plan.

## Test Fixture Realism

Test fixtures must reflect production data shapes. Simplified or invented fixtures that pass tests but fail against real data are bugs.

**Rules:**

- Before writing a test fixture, read the actual source code that produces the data (handler, query, component, serializer). Use the real field names, types, and nesting.
- If a column stores serialized data (JSON string, blob), check what was serialized into it — the deserialized shape is what your fixture must match.
- If you don't have access to real data, trace the code path from origin to consumer. The type definitions closest to the data source are authoritative.
- Stub responses must match what the real consumer would receive after deserialization — not a simplified version.

| Violation | Response |
| --- | --- |
| Fixture uses a simpler type than production data | Fix fixture to match real shape |
| Fixture omits fields that exist in production | Add the fields |
| Test passes with wrong fixture but fails against real system | The test is the bug — fix the fixture first |

## Multi-Agent Orchestration Rules

When a ketchup plan uses parallel agents (worktrees), these rules apply in addition to all other CLAUDE.md rules.

### Consistency contract

Before spawning parallel agents, the orchestrator must define a **shared pattern** for every cross-cutting concern in the phase. Common concerns include:

- **Dependency injection**: How modules receive their dependencies. All agents in the same phase must use the same pattern. Specify the interface in the plan.
- **Registration/wiring**: The exact function signature for plugging into a shared entry point, router, registry, or composition root. All agents must export the same shape.
- **Error handling**: One error handling strategy per phase. If there's a global boundary (error handler, middleware, catch block), every code path must flow through it.
- **Shared state/options**: How global configuration, flags, or context are accessed. Specify the access pattern so agents don't each invent their own.

### Integration test after merge

After merging all agents in a phase, the orchestrator MUST:

1. Run the full test suite
2. Read every source file produced by every agent (not just spot-check)
3. Verify cross-agent consistency (naming, patterns, error messages)
4. Test at least one path **through the real entry point** — not just isolated unit tests. The integration point where agents' code meets is where bugs hide.
5. Flag and fix any inconsistencies before tagging the phase

### Agent prompt requirements

Every agent prompt must include:

- The shared interfaces and function signatures from the consistency contract (copy-paste the type definitions — don't reference them by description)
- Any framework quirks identified during pre-flight review
- Pointers to the actual source files that produce the data the agent will consume (so fixtures match reality)

## Misc

- No "Generated with Claude Code" in commits
