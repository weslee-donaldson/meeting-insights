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

  program.addCommand(meetings);
}
