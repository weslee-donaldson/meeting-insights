import { Command } from "commander";
import { HttpClient } from "../http-client.ts";
import { loadConfig } from "../config.ts";
import {
  ColumnDef,
  outputJson,
  outputTable,
  outputKv,
  outputSections,
} from "../format.ts";

interface MeetingsDeps {
  client?: HttpClient;
  stream?: NodeJS.WritableStream;
}

function resolveClient(deps?: MeetingsDeps): HttpClient {
  if (deps?.client) return deps.client;
  const config = loadConfig();
  return new HttpClient({ baseUrl: config.baseUrl, token: config.token, fetch: globalThis.fetch });
}

function resolveStream(deps?: MeetingsDeps): NodeJS.WritableStream {
  return deps?.stream ?? process.stdout;
}

const LIST_COLUMNS: ColumnDef[] = [
  { key: "id", header: "ID" },
  { key: "title", header: "Title" },
  { key: "date", header: "Date" },
  { key: "client", header: "Client" },
  { key: "actionItemCount", header: "Items" },
];

const LIST_DESCRIPTION = `List meetings for the authenticated user.

Output schema (--json):
  [{ "id": "string", "title": "string", "date": "string (ISO 8601)",
     "client": "string", "series": "string", "actionItemCount": "number" }]

Example:
  $ mti meetings list --client Acme --after 2026-01-01
  ID         Title                    Date         Client  Items
  a1b2c3d4   Q1 Planning Review       2026-01-15   Acme    3

Errors:
  401  Token invalid or expired
  503  Service unavailable`;

const GET_DESCRIPTION = `Show full details for a single meeting.

Output schema (--json):
  { "id": "string", "title": "string", "meeting_type": "string|null",
    "date": "string (ISO 8601)", "participants": "string (JSON-encoded array)",
    "source_filename": "string", "created_at": "string (ISO 8601)" }
  With --include-transcript: adds "raw_transcript": "string"

Example:
  $ mti meetings get a1b2c3d4
  Title:          Sprint Review
  Date:           2026-01-15
  Type:           standup
  Participants:   Alice, Bob
  Source:         2026-01-15_sprint-review.txt

Errors:
  404  Meeting not found`;

export function registerMeetings(
  program: Command,
  deps?: MeetingsDeps
): void {
  const meetings = new Command("meetings").description(
    "Manage meetings — list, view, rename, reassign, delete, and ignore."
  );

  meetings
    .command("list")
    .description(LIST_DESCRIPTION)
    .option("--client <name>", "Filter by client name")
    .option("--after <date>", "Only meetings after this date (YYYY-MM-DD)")
    .option("--before <date>", "Only meetings before this date (YYYY-MM-DD)")
    .option("--json", "Output as JSON array")
    .action(async (opts: { client?: string; after?: string; before?: string; json?: boolean }) => {
      const client = resolveClient(deps);
      const stream = resolveStream(deps);
      const params: Record<string, string> = {};
      if (opts.client) params.client = opts.client;
      if (opts.after) params.after = opts.after;
      if (opts.before) params.before = opts.before;
      const data = await client.get("/api/meetings", params);
      if (opts.json) {
        outputJson(data, stream);
        return;
      }
      outputTable(data as Record<string, unknown>[], LIST_COLUMNS, stream);
    });

  meetings
    .command("get")
    .description(GET_DESCRIPTION)
    .argument("<id>", "Meeting ID")
    .option("--include-transcript", "Include raw transcript in output")
    .option("--json", "Output as JSON")
    .action(async (id: string, opts: { includeTranscript?: boolean; json?: boolean }) => {
      const client = resolveClient(deps);
      const stream = resolveStream(deps);
      const data = (await client.get(`/api/meetings/${id}`)) as Record<string, unknown>;
      if (opts.json) {
        if (!opts.includeTranscript) {
          const { raw_transcript, ...rest } = data;
          outputJson(rest, stream);
        } else {
          outputJson(data, stream);
        }
        return;
      }
      let participants = String(data.participants ?? "");
      try {
        const parsed = JSON.parse(participants);
        if (Array.isArray(parsed)) {
          participants = parsed.join(", ");
        }
      } catch {
        /* keep original string */
      }
      outputKv(
        [
          { label: "Title", value: String(data.title ?? "") },
          { label: "Date", value: String(data.date ?? "") },
          { label: "Type", value: String(data.meeting_type ?? "") },
          { label: "Participants", value: participants },
          { label: "Source", value: String(data.source_filename ?? "") },
        ],
        stream
      );
    });

  const TRANSCRIPT_DESCRIPTION = `Output the raw transcript text for a meeting.

Output: Plain text (no JSON mode — transcripts are unstructured)

Example:
  $ mti meetings transcript a1b2c3d4

Errors:
  404  Meeting not found`;

  meetings
    .command("transcript")
    .description(TRANSCRIPT_DESCRIPTION)
    .argument("<id>", "Meeting ID")
    .action(async (id: string) => {
      const client = resolveClient(deps);
      const stream = resolveStream(deps);
      const data = (await client.get(`/api/meetings/${id}/transcript`)) as { transcript: string };
      stream.write(data.transcript);
    });

  const ARTIFACT_DESCRIPTION = `Show the extracted summary, decisions, action items, and risks.

Output schema (--json):
  { "summary": "string",
    "decisions": [{ "text": "string", "decided_by": "string" }],
    "proposed_features": ["string"],
    "action_items": [{ "description": "string", "owner": "string",
      "requester": "string", "due_date": "string|null",
      "priority": "critical|normal|low", "short_id": "string?" }],
    "open_questions": ["string"],
    "risk_items": [{ "category": "relationship|architecture|engineering",
      "description": "string" }],
    "milestones": [{ "title": "string", "target_date": "string|null",
      "status_signal": "string", "excerpt": "string" }]? }

Example:
  $ mti meetings artifact a1b2c3d4
  SUMMARY
    Team discussed Q1 objectives and assigned follow-ups.

  DECISIONS
    • Use TypeScript for new services (decided by Alice)

Errors:
  404  Meeting not found`;

  meetings
    .command("artifact")
    .description(ARTIFACT_DESCRIPTION)
    .argument("<id>", "Meeting ID")
    .option("--json", "Output as JSON")
    .action(async (id: string, opts: { json?: boolean }) => {
      const client = resolveClient(deps);
      const stream = resolveStream(deps);
      const data = await client.get(`/api/meetings/${id}/artifact`);
      if (data === null) {
        stream.write("No artifact extracted yet.\n");
        return;
      }
      if (opts.json) {
        outputJson(data, stream);
        return;
      }
      const artifact = data as {
        summary: string;
        decisions: Array<{ text: string; decided_by: string }>;
        action_items: Array<{
          description: string;
          owner: string;
          due_date: string | null;
          priority: string;
        }>;
        open_questions: string[];
        risk_items: Array<{ category: string; description: string }>;
      };
      const sections: Array<{ heading: string; items: string[] }> = [];
      sections.push({ heading: "Summary", items: [artifact.summary] });
      if (artifact.decisions.length > 0) {
        sections.push({
          heading: "Decisions",
          items: artifact.decisions.map(
            (d) => `${d.text} (decided by ${d.decided_by})`
          ),
        });
      }
      if (artifact.action_items.length > 0) {
        sections.push({
          heading: "Action Items",
          items: artifact.action_items.map((item) => {
            const due = item.due_date ? `, due: ${item.due_date}` : "";
            return `[${item.priority}] ${item.description} (${item.owner}${due})`;
          }),
        });
      }
      if (artifact.open_questions.length > 0) {
        sections.push({
          heading: "Open Questions",
          items: artifact.open_questions,
        });
      }
      if (artifact.risk_items.length > 0) {
        sections.push({
          heading: "Risks",
          items: artifact.risk_items.map((r) => r.description),
        });
      }
      outputSections(sections, stream);
    });

  const RENAME_DESCRIPTION = `Rename a meeting.

Output schema (--json): { "ok": true }

Example:
  $ mti meetings rename a1b2c3d4 "New Meeting Title"
  Meeting a1b2c3d4 updated.

Errors:
  404  Meeting not found`;

  meetings
    .command("rename")
    .description(RENAME_DESCRIPTION)
    .argument("<id>", "Meeting ID")
    .argument("<title>", "New title")
    .option("--json", "Output as JSON")
    .action(async (id: string, title: string, opts: { json?: boolean }) => {
      const client = resolveClient(deps);
      const stream = resolveStream(deps);
      await client.patch(`/api/meetings/${id}/title`, { title });
      if (opts.json) {
        outputJson({ ok: true }, stream);
        return;
      }
      stream.write(`Meeting ${id} updated.\n`);
    });

  program.addCommand(meetings);
}
