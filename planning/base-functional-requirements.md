# Base Functional Requirements

Rules that apply to every interactive view in the application. Treat these as defaults — only deviate when explicitly justified.

## Destructive Actions

- Destructive operations (delete, remove, clear) require a confirmation dialog before execution.
- The dialog states what will happen and warns that it cannot be undone.
- The dialog offers Cancel (outline) and a destructive-styled confirm button.

## Notifications

- Every user-initiated mutation surfaces a toast on completion: success or error.
- Success toasts confirm what happened (e.g., "Insight deleted").
- Error toasts include the error message so the user can report or retry.
- Long-running operations (LLM generation, multi-step workflows) show an immediate "in progress" toast when the command is received, then a completion toast when the result arrives. The user should never wonder whether their click was registered.

## State Consistency

- After any mutation the affected query caches are invalidated so lists and detail views re-render with current data.
- When a selected entity is deleted, clear the selection so the detail panel does not show stale content.
- Optimistic UI updates are preferred for fast perceived performance; fall back to cache invalidation on error.

## Loading and Empty States

- Data-fetching views show a skeleton or spinner while loading.
- Empty collections show a descriptive placeholder, not a blank panel.
- Listing areas with zero records display a contextual message explaining why the list is empty and, when possible, how the user can populate it (e.g., "No source meetings found for this period. Try a wider date range or assign meetings to this client.").

## Form Validation

- Disable the submit button when required fields are missing.
- Show inline validation messages next to the offending field.
