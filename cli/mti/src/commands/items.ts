import { Command } from "commander";
import { HttpClient } from "../http-client.ts";
import { loadConfig } from "../config.ts";
import { ColumnDef, outputTable, outputJson } from "../format.ts";

interface Deps {
  client: HttpClient;
  stream: NodeJS.WritableStream;
}

function defaultDeps(): Deps {
  const config = loadConfig();
  return {
    client: new HttpClient({
      baseUrl: config.baseUrl,
      token: config.token,
      fetch: globalThis.fetch,
    }),
    stream: process.stdout,
  };
}

const LIST_COLUMNS: ColumnDef[] = [
  { key: "short_id", header: "Short ID", width: 10 },
  { key: "description", header: "Description", width: 22 },
  { key: "owner", header: "Owner", width: 10 },
  { key: "due_date", header: "Due", width: 12 },
  { key: "priority", header: "Priority", width: 10 },
  { key: "meeting_title", header: "Meeting", width: 20 },
  { key: "meeting_date", header: "Date", width: 12 },
];

function writeln(stream: NodeJS.WritableStream, text: string): void {
  stream.write(text + "\n");
}

export async function createItem(
  meetingId: string,
  options: {
    desc: string;
    owner?: string;
    due?: string;
    priority?: string;
    json?: boolean;
  },
  deps: Deps = defaultDeps()
): Promise<void> {
  const body: Record<string, string> = { description: options.desc };
  if (options.owner) body.owner = options.owner;
  if (options.due) body.due_date = options.due;
  if (options.priority) body.priority = options.priority;

  await deps.client.post(`/api/meetings/${meetingId}/action-items`, body);

  if (options.json) {
    outputJson({ ok: true }, deps.stream);
    return;
  }

  writeln(deps.stream, `Action item added to meeting ${meetingId}.`);
}

export async function listItems(
  clientName: string,
  options: { after?: string; before?: string; json?: boolean },
  deps: Deps = defaultDeps()
): Promise<void> {
  const params: Record<string, string> = {};
  if (options.after) params.after = options.after;
  if (options.before) params.before = options.before;

  const data = await deps.client.get(
    `/api/clients/${encodeURIComponent(clientName)}/action-items`,
    params
  );

  if (options.json) {
    outputJson(data, deps.stream);
    return;
  }

  outputTable(data as Record<string, unknown>[], LIST_COLUMNS, deps.stream);
}

export function registerItems(program: Command): void {
  const items = new Command("items").description(
    "Manage action items across meetings."
  );

  items
    .command("list <client>")
    .description("List action items across all meetings for a client.")
    .option("--after <date>", "Only items from meetings after this date (YYYY-MM-DD)")
    .option("--before <date>", "Only items from meetings before this date (YYYY-MM-DD)")
    .addHelpText(
      "after",
      `
Output schema (--json):
  [{ "meeting_id": "string", "meeting_title": "string",
     "meeting_date": "string", "item_index": "number",
     "description": "string", "owner": "string", "requester": "string",
     "due_date": "string|null", "priority": "critical|normal",
     "canonical_id": "string?", "total_mentions": "number?",
     "short_id": "string?" }]

Example:
  $ mti items list Acme --after 2026-01-01
  Short ID    Description            Owner       Due           Priority    Meeting               Date
  ────────    ─────────────────────  ──────────  ────────────  ──────────  ────────────────────  ────────────
  f3a1b2      Draft Q2 roadmap       Alice       2026-04-01    critical    Q1 Planning Review    2026-01-15

Errors:
  404  Client not found`
    )
    .action(async (clientName: string, opts: Record<string, string>) => {
      const json = opts.json ?? program.opts().json;
      await listItems(clientName, { ...opts, json }, defaultDeps());
    });

  items
    .command("create <meetingId>")
    .description("Add a new action item to a meeting.")
    .requiredOption("--desc <text>", "Item description (required)")
    .option("--owner <name>", "Person responsible")
    .option("--due <date>", "Due date (YYYY-MM-DD)")
    .option("--priority <level>", "critical, normal, or low (default: normal)")
    .addHelpText(
      "after",
      `
Output schema (--json): { "ok": true }

Errors:
  404  Meeting not found`
    )
    .action(async (meetingId: string, opts: Record<string, string>) => {
      const json = opts.json ?? program.opts().json;
      await createItem(meetingId, { ...opts, json }, defaultDeps());
    });

  program.addCommand(items);
}
