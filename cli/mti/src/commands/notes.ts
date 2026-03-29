import { Command } from "commander";
import { HttpClient } from "../http-client.ts";
import { loadConfig } from "../config.ts";
import { outputTable, outputJson, ColumnDef } from "../format.ts";

function writeln(stream: NodeJS.WritableStream, text: string): void {
  stream.write(text + "\n");
}

type ActionWrapper = (
  fn: (...args: unknown[]) => Promise<unknown>
) => (...args: unknown[]) => Promise<void>;

const LIST_COLUMNS: ColumnDef[] = [
  { key: "id", header: "ID" },
  { key: "title", header: "Title" },
  { key: "body", header: "Body", width: 40 },
  { key: "createdAt", header: "Created" },
  { key: "updatedAt", header: "Updated" },
];

export async function notesList(
  meetingId: string,
  opts: { json: boolean },
  deps: { client: HttpClient; stream: NodeJS.WritableStream }
): Promise<void> {
  const data = await deps.client.get(`/api/notes/meeting/${meetingId}`);

  if (opts.json) {
    outputJson(data, deps.stream);
    return;
  }

  const rows = (data as Array<Record<string, unknown>>).map((note) => ({
    ...note,
    title: note.title ?? "(untitled)",
  }));
  outputTable(rows, LIST_COLUMNS, deps.stream);
}

export async function notesCreate(
  meetingId: string,
  opts: { json: boolean; body: string; title?: string },
  deps: { client: HttpClient; stream: NodeJS.WritableStream }
): Promise<void> {
  const payload: Record<string, string> = { body: opts.body };
  if (opts.title !== undefined) {
    payload.title = opts.title;
  }

  const data = await deps.client.post(`/api/notes/meeting/${meetingId}`, payload);

  if (opts.json) {
    outputJson(data, deps.stream);
    return;
  }

  writeln(deps.stream, `Note created on meeting ${meetingId}.`);
}

export function registerNotes(program: Command, wrap?: ActionWrapper): void {
  const wrapFn: ActionWrapper = wrap ?? ((fn) => fn as (...args: unknown[]) => Promise<void>);
  const notes = new Command("notes").description("Manage meeting notes");

  notes
    .command("list")
    .description("List notes attached to a meeting.")
    .argument("<meetingId>", "Meeting ID")
    .option("--json", "Output as JSON")
    .addHelpText(
      "after",
      `
Output schema (--json):
  [{ "id": "string", "objectType": "meeting", "objectId": "string",
     "title": "string|null", "body": "string", "noteType": "string",
     "createdAt": "string (ISO 8601)", "updatedAt": "string (ISO 8601)" }]

Example:
  $ mti notes list a1b2c3d4
  ID        Title             Body                    Created      Updated
  ────────  ────────────────  ──────────────────────  ───────────  ───────────
  n1x2y3    Follow-up needed  Check with legal on...  2026-01-15   2026-01-16

Errors:
  404  Meeting not found`
    )
    .action(
      wrapFn(async (meetingId: string, cmdOpts: { json?: boolean }) => {
        const config = loadConfig();
        const client = new HttpClient({
          baseUrl: config.baseUrl,
          token: config.token,
          fetch: globalThis.fetch,
        });
        await notesList(meetingId, { json: cmdOpts.json ?? false }, { client, stream: process.stdout });
      })
    );

  notes
    .command("create")
    .description("Create a note on a meeting.")
    .argument("<meetingId>", "Meeting ID")
    .requiredOption("--body <text>", "Note body")
    .option("--title <text>", "Optional note title")
    .option("--json", "Output as JSON")
    .addHelpText(
      "after",
      `
Output schema (--json):
  { "id": "string", "objectType": "meeting", "objectId": "string",
    "title": "string|null", "body": "string", "noteType": "string",
    "createdAt": "string (ISO 8601)", "updatedAt": "string (ISO 8601)" }

Example:
  $ mti notes create a1b2c3d4 --body "Follow up with legal"
  Note created on meeting a1b2c3d4.

Errors:
  404  Meeting not found`
    )
    .action(
      wrapFn(async (meetingId: string, cmdOpts: { json?: boolean; body: string; title?: string }) => {
        const config = loadConfig();
        const client = new HttpClient({
          baseUrl: config.baseUrl,
          token: config.token,
          fetch: globalThis.fetch,
        });
        await notesCreate(
          meetingId,
          { json: cmdOpts.json ?? false, body: cmdOpts.body, title: cmdOpts.title },
          { client, stream: process.stdout }
        );
      })
    );

  program.addCommand(notes);
}
