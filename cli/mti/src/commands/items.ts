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

const HISTORY_COLUMNS: ColumnDef[] = [
  { key: "meeting_title", header: "Meeting" },
  { key: "meeting_date", header: "Date" },
  { key: "item_text", header: "Description" },
];

const COMPLETIONS_COLUMNS: ColumnDef[] = [
  { key: "item_index", header: "Item #" },
  { key: "completed_at", header: "Completed At" },
  { key: "note", header: "Note" },
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

export async function itemHistory(
  canonicalId: string,
  options: { json?: boolean },
  deps: Deps = defaultDeps()
): Promise<void> {
  const data = await deps.client.get(`/api/items/${canonicalId}/history`);

  if (options.json) {
    outputJson(data, deps.stream);
    return;
  }

  outputTable(data as Record<string, unknown>[], HISTORY_COLUMNS, deps.stream);
}

export async function listCompletions(
  meetingId: string,
  options: { json?: boolean },
  deps: Deps = defaultDeps()
): Promise<void> {
  const data = await deps.client.get(
    `/api/meetings/${meetingId}/completions`
  );

  if (options.json) {
    outputJson(data, deps.stream);
    return;
  }

  outputTable(
    data as Record<string, unknown>[],
    COMPLETIONS_COLUMNS,
    deps.stream
  );
}

export async function uncompleteItem(
  meetingId: string,
  index: string,
  options: { json?: boolean },
  deps: Deps = defaultDeps()
): Promise<void> {
  await deps.client.delete(
    `/api/meetings/${meetingId}/action-items/${index}/complete`
  );

  if (options.json) {
    outputJson({ ok: true }, deps.stream);
    return;
  }

  writeln(deps.stream, `Action item ${index} completion reverted.`);
}

export async function completeItem(
  meetingId: string,
  index: string,
  options: { note?: string; json?: boolean },
  deps: Deps = defaultDeps()
): Promise<void> {
  await deps.client.post(
    `/api/meetings/${meetingId}/action-items/${index}/complete`,
    { note: options.note ?? "" }
  );

  if (options.json) {
    outputJson({ ok: true }, deps.stream);
    return;
  }

  writeln(deps.stream, `Action item ${index} marked complete.`);
}

export async function editItem(
  meetingId: string,
  index: string,
  options: {
    desc?: string;
    owner?: string;
    due?: string;
    priority?: string;
    json?: boolean;
  },
  deps: Deps = defaultDeps()
): Promise<void> {
  const body: Record<string, string> = {};
  if (options.desc) body.description = options.desc;
  if (options.owner) body.owner = options.owner;
  if (options.due) body.due_date = options.due;
  if (options.priority) body.priority = options.priority;

  await deps.client.put(
    `/api/meetings/${meetingId}/action-items/${index}`,
    body
  );

  if (options.json) {
    outputJson({ ok: true }, deps.stream);
    return;
  }

  writeln(deps.stream, `Action item ${index} updated.`);
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

  items
    .command("edit <meetingId> <index>")
    .description("Edit an existing action item's fields. Only specified fields are updated.")
    .option("--desc <text>", "Item description")
    .option("--owner <name>", "Person responsible")
    .option("--due <date>", "Due date (YYYY-MM-DD)")
    .option("--priority <level>", "critical, normal, or low")
    .addHelpText(
      "after",
      `
Output schema (--json): { "ok": true }

Errors:
  404  Meeting or item not found`
    )
    .action(
      async (
        meetingId: string,
        index: string,
        opts: Record<string, string>
      ) => {
        const json = opts.json ?? program.opts().json;
        await editItem(meetingId, index, { ...opts, json }, defaultDeps());
      }
    );

  items
    .command("complete <meetingId> <index>")
    .description("Mark an action item as complete.")
    .option("--note <text>", "Completion note (default: empty string)")
    .addHelpText(
      "after",
      `
Output schema (--json): { "ok": true }

Errors:
  404  Meeting or item not found`
    )
    .action(
      async (
        meetingId: string,
        index: string,
        opts: Record<string, string>
      ) => {
        const json = opts.json ?? program.opts().json;
        await completeItem(meetingId, index, { ...opts, json }, defaultDeps());
      }
    );

  items
    .command("uncomplete <meetingId> <index>")
    .description("Revert an action item's completion status.")
    .addHelpText(
      "after",
      `
Output schema (--json): { "ok": true }

Errors:
  404  Meeting or item not found`
    )
    .action(
      async (
        meetingId: string,
        index: string,
        opts: Record<string, string>
      ) => {
        const json = opts.json ?? program.opts().json;
        await uncompleteItem(
          meetingId,
          index,
          { ...opts, json },
          defaultDeps()
        );
      }
    );

  items
    .command("completions <meetingId>")
    .description("Show completion records for a meeting's action items.")
    .addHelpText(
      "after",
      `
Output schema (--json):
  [{ "id": "string", "meeting_id": "string", "item_index": "number",
     "completed_at": "string (ISO 8601)", "note": "string" }]

Errors:
  404  Meeting not found`
    )
    .action(async (meetingId: string, opts: Record<string, string>) => {
      const json = opts.json ?? program.opts().json;
      await listCompletions(meetingId, { ...opts, json }, defaultDeps());
    });

  items
    .command("history <canonicalId>")
    .description(
      "Show cross-meeting history for an action item by its canonical ID."
    )
    .addHelpText(
      "after",
      `
Output schema (--json):
  [{ "canonical_id": "string", "meeting_id": "string",
     "item_type": "string", "item_index": "number",
     "item_text": "string", "first_mentioned_at": "string",
     "meeting_title": "string", "meeting_date": "string" }]

Example:
  $ mti items history f3a1b2
  Meeting              Date         Description
  ──────────────────  ──────────  ─────────────────────
  Q1 Planning Review  2026-01-15  Draft Q2 roadmap
  Sprint Retro        2026-02-01  Draft Q2 roadmap (updated scope)

Errors:
  404  Canonical ID not found`
    )
    .action(async (canonicalId: string, opts: Record<string, string>) => {
      const json = opts.json ?? program.opts().json;
      await itemHistory(canonicalId, { ...opts, json }, defaultDeps());
    });

  program.addCommand(items);
}
