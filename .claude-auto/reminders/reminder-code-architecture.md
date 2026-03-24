---
when:
  hook: SessionStart
priority: 100
---

# Code Architecture Reminder

## Reusability

Before writing new code, check if the behavior already exists. Extract shared logic into focused functions that multiple callers can use. If two features need similar behavior, build one function that serves both — not two copies.

## Extensibility

Design functions and modules so new behavior can be added without rewriting existing code. Prefer composition (small functions combined) over monoliths that must be forked to extend. When adding a feature, ask: "Could someone add a similar feature without modifying what I just wrote?"

## No Duplicate Code

If you see the same logic in two places, extract it. If you're about to write something that already exists elsewhere, import it instead. During refactoring, actively scan for duplication introduced by earlier bursts and consolidate.

## No Bridging Code for Outdated Tests

When a design changes, update the tests to match the new design. Never add adapter functions, shim layers, or compatibility wrappers whose sole purpose is making old tests pass against a new implementation. If a refactor breaks tests, the tests need updating — not the code needs wrapping.

## No Monolithic Files

Each file should have a single clear responsibility. When a file grows beyond ~300 lines or handles multiple unrelated concerns, split it. Signs a file needs splitting: multiple unrelated export groups, functions that don't call each other, or a file name that requires "and" to describe its purpose.

| Smell | Response |
| --- | --- |
| Same logic in two files | Extract shared function, import from both |
| File over 300 lines with unrelated exports | Split by responsibility |
| Wrapper function that only exists so old tests pass | Delete wrapper, update tests |
| New feature copies structure of existing feature | Extract the shared pattern, parameterize the differences |
| Function takes 6+ parameters | Group into an options object or split the responsibility |
