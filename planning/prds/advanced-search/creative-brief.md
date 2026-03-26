# Creative Brief: Advanced Search Results View

## For: Paper MCP AI Designer

## What We're Building

A dedicated **Search Results** view for a meeting intelligence app. Users search across hundreds of meeting transcripts and need to quickly triage results — understanding what was discussed, what was decided, and whether they should dive deeper.

## Product Context

This is a **knowledge-dense productivity tool**, not a consumer app. Users are consultants, project managers, and team leads who manage many client relationships. They're scanning results to answer questions like:
- "What did we discuss about billing migration?"
- "Which meetings had risk items related to the Q1 launch?"
- "What's the status of the phased rollout we agreed on?"

Every pixel should serve information density and scannability.

## Existing Visual Language

The app uses a **LinearShell** layout: narrow nav rail (56px) on the left, content panels in the center, optional chat sidebar (380px) on the right.

### Stack
- **Tailwind CSS 4** with semantic color tokens
- **shadcn/ui** primitives (Button, Badge, ScrollArea, Dialog)
- **Lucide React** icons
- **`cn()` utility** for conditional classes

### Typography
- Display: **Space Grotesk** (700 weight)
- Body: **Inter** (400 weight)
- Heading: 14px / 600 weight
- Body: 13px / 400 weight
- Caption: 12px
- Label: 11px / 500 weight

### Color Tokens (3 themes: deep-sea, daylight, midnight)
| Token | Tailwind | Usage |
|---|---|---|
| `--color-bg-base` | `bg-background` | Page background |
| `--color-bg-panel` | `bg-card` | Panel/card backgrounds |
| `--color-bg-elevated` | `bg-secondary` | Hover, selected rows |
| `--color-text-primary` | `text-foreground` | Primary text |
| `--color-text-secondary` | `text-secondary-foreground` | Secondary text |
| `--color-text-muted` | `text-muted-foreground` | Metadata, timestamps |
| `--color-line` | `border-border` | Borders, separators |
| `--color-accent` | `bg-primary` | Active states |
| `--color-search-deep` | custom | Deep search indicator |

### Spacing
| Element | Vertical | Horizontal |
|---|---|---|
| Section header | `py-3` | `px-4` |
| List row | `py-2` | `px-4` |
| Group header | `py-1.5` | `px-4` |
| Inline button | `py-0.5` | `px-2` |

### Component Patterns
- **Row separators**: `border-b border-border` (NOT card outlines)
- **Selection state**: `bg-secondary` via `cn()`, not inline style
- **Group headers**: `text-xs font-semibold text-muted-foreground bg-secondary/60`
- **Metadata**: `text-xs text-muted-foreground`; monospace for scores
- **Badges**: `<Badge variant="outline">` for tags; `<Badge variant="default">` for active states
- **Buttons**: `active:scale-[0.97]` tactile press, `transition-all`

### WCAG AA Text Tiers
- **Primary**: 7:1+ contrast (headings, body text)
- **Secondary**: 4.5:1+ (metadata)
- **Muted**: 3:1+ (labels at 11px+ bold only)
- Never use decorative colors (`--color-line`) for readable text

## Artboards to Design

### 1. Search Results — Quick Search (Desktop, 1440px)

Full-width layout: nav rail | results list | chat panel

**Results list** (scrollable):
- Section header: "SEARCH RESULTS" + result count + search time
- Filter bar (collapsed/minimal): just the search query displayed, with a small "Filters" expand button
- Result cards (see card spec below)
- "Save as Thread" button at bottom

**Chat panel** (380px):
- Header: "Chat (10 of 14 results)"
- Standard chat interface with message bubbles

### 2. Search Results — Advanced Filters (Desktop, 1440px)

Same layout but filter bar is expanded:
- Client dropdown
- Date range: "After" and "Before" date pickers
- Deep Search toggle (with visual indicator when active)
- "Group by cluster" toggle
- Sort dropdown: Relevance / Date
- Result count + search duration

### 3. Search Result Card — Standard (Component)

**Header row** (single line):
- Left: Checkbox (16px) · Meeting title (heading weight) · Client name (badge, outline variant)
- Right: Relevance score (monospace, muted) · Date (muted)

**Tags row** (below header):
- Cluster tag pills (small badges, outline variant, ~11px)

**Summary block**:
- Full artifact summary text (body weight, 13px)
- This is the main content area — give it room to breathe

**Highlights section** (compact):
- One decision: pin icon + text (single line, truncated)
- One action item: checkbox icon + description + "@owner" (muted) + "due date" (muted)
- One risk: warning icon + text (single line, truncated)
- Each line has a "+N more" link aligned right (accent color, caption size)

**Footer row** (single line):
- Left: participant names (muted, comma-separated)
- Right: "Open Meeting →" text button

**States**:
- Default: unchecked, collapsed
- Checked: checkbox filled, subtle left border accent
- Expanded: "+N more" clicked → full lists visible with section headers (DECISIONS, ACTION ITEMS, RISKS)

### 4. Search Result Card — Deep Search (Component)

Same as standard card but with an additional block between tags and summary:

**Relevance summary**:
- Distinct visual treatment (italic? different background? left accent border?)
- LLM-written text explaining WHY this result matched the query
- Should feel like an "AI annotation" — clearly different from the meeting's own summary
- Preceded by a small label: "Why it matched" or similar

### 5. Empty / Loading States

Three states for the results area:
- **Initial**: No query entered yet. Gentle prompt: "Search across all meetings" with search icon
- **Loading**: Skeleton cards or spinner
- **No results**: Query shown, "No meetings match your search" with suggestion to broaden filters

### 6. Cluster Group Headers (Component)

When grouping is active, results cluster under headers:
- Tag names joined (e.g., "onboarding · migration")
- Result count per group
- Subtle background tint (`bg-secondary/60`)
- "Select all in group" text button

## Design Principles for This View

1. **Information density over whitespace** — this is a power-user triage view. Don't oversimplify.
2. **Scan pattern**: header line (title/client/score/date) → tags → summary → highlights. Users will develop a rhythm scanning vertically.
3. **Hierarchy through typography, not decoration** — use weight/size/color differences, not boxes, shadows, or ornament.
4. **Cards separated by borders, not outlined** — follow the existing `border-b border-border` pattern, not floating cards with rounded corners.
5. **Chat panel is secondary** — the primary action is scanning results. Chat supports follow-up questions. Don't let it compete visually.
6. **Deep search annotation should feel "AI-generated"** — visually distinct from human-written content. Maybe a subtle left accent bar in `--color-search-deep`, or a different background tint.

## Reference: Existing Patterns to Match

The closest existing views to reference:
- **MeetingList** — for list row patterns, checkbox behavior, group headers
- **MeetingDetail** — for how decisions, action items, and risks are displayed
- **ThreadsPage** — for the "criteria + results" pattern and candidate cards
- **FilterBar** — for the filter control layout
