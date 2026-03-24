---
when:
  hook: SessionStart
priority: 100
---

# Project Navigation Reminder

This project uses a **scatter/gather documentation system**. `README.md` is user-owned — never modify it unless explicitly asked.

**`scatter.md`** — Claude-maintained. Documents all files and key concepts in the directory. Every directory with source files has one.

**`gather.md`** — Claude-maintained. Aggregates "Key Learnings from Children" from child directories. Parent directories have one.

**How to use it:**

1. Start at `gather.md` (root) for aggregated key learnings and the full directory index
2. Before working in any directory, read its `scatter.md` first
3. When a task spans multiple directories, read the nearest common parent's `gather.md`
4. When you add files, change APIs, or restructure directories, update the relevant `scatter.md` and/or `gather.md` in the same commit
5. Never modify `README.md` unless the user explicitly asks
