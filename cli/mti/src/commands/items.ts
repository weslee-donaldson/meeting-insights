import { Command } from "commander";
import { HttpClient } from "../http-client.ts";
import { loadConfig } from "../config.ts";
import { ColumnDef, outputTable, outputJson } from "../format.ts";

interface Deps {
  client: HttpClient;
  stream: NodeJS.WritableStream;
  stderr?: NodeJS.WritableStream;
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

const BATCH_RESULT_COLUMNS: ColumnDef[] = [
  { key: "short_id", header: "Short ID", width: 10 },
  { key: "status", header: "Status", width: 15 },
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
  ids: string[],
  options: { json?: boolean },
  deps: Deps = defaultDeps()
): Promise<void> {
  const data = await deps.client.post("/api/action-items/uncomplete", {
    short_ids: ids,
  });

  if (options.json) {
    outputJson(data, deps.stream);
    return;
  }

  const results = (data as { results: { short_id: string; status: string }[] }).results;
  outputTable(results, BATCH_RESULT_COLUMNS, deps.stream);
}

export async function completeItem(
  ids: string[],
  options: { note?: string; json?: boolean },
  deps: Deps = defaultDeps()
): Promise<void> {
  const data = await deps.client.post("/api/action-items/complete", {
    short_ids: ids,
    note: options.note ?? "",
  });

  if (options.json) {
    outputJson(data, deps.stream);
    return;
  }

  const results = (data as { results: { short_id: string; status: string }[] }).results;
  outputTable(results, BATCH_RESULT_COLUMNS, deps.stream);
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
  options: {
    after?: string;
    before?: string;
    json?: boolean;
    limit?: string;
    full?: boolean;
  },
  deps: Deps = defaultDeps()
): Promise<void> {
  const params: Record<string, string> = {};
  if (options.after) params.after = options.after;
  if (options.before) params.before = options.before;

  const allData = (await deps.client.get(
    `/api/clients/${encodeURIComponent(clientName)}/action-items`,
    params
  )) as Record<string, unknown>[];

  const limit = parseInt(options.limit ?? "25", 10);
  const total = allData.length;
  const truncated = limit > 0 && total > limit;
  const displayed = truncated ? allData.slice(0, limit) : allData;

  if (options.json) {
    outputJson(displayed, deps.stream);
    return;
  }

  const columns =
    options.full
      ? LIST_COLUMNS.map(({ width, ...rest }) => rest)
      : LIST_COLUMNS;
  outputTable(displayed, columns, deps.stream);

  if (truncated) {
    const stderr = deps.stderr ?? process.stderr;
    stderr.write(`Showing ${limit} of ${total} items. Use --limit 0 to show all.\n`);
  }
}

export function registerItems(program: Command): void {
  const items = new Command("items")
    .description("Manage action items across meetings.")
    .enablePositionalOptions();

  items
    .command("list <client>")
    .description("List action items across all meetings for a client.")
    .option("--after <date>", "Only items from meetings after this date (YYYY-MM-DD)")
    .option("--before <date>", "Only items from meetings before this date (YYYY-MM-DD)")
    .option("--json", "Output as JSON")
    .option("--limit <n>", "Max items to display (0 = all)", "25")
    .option("--full", "Show full column values without truncation")
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
    .option("--json", "Output as JSON")
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
    .description("Edit an existing action item's fields (index is 0-based, from items list output). Only specified fields are updated.")
    .option("--desc <text>", "Item description")
    .option("--owner <name>", "Person responsible")
    .option("--due <date>", "Due date (YYYY-MM-DD)")
    .option("--priority <level>", "critical, normal, or low")
    .option("--json", "Output as JSON")
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
    .command("complete <ids...>")
    .description("Mark action items as complete by Short ID (from items list output).")
    .option("--note <text>", "Completion note (default: empty string)")
    .option("--json", "Output as JSON")
    .addHelpText(
      "after",
      `
Output schema (--json):
  { "results": [{ "short_id": "string", "status": "completed|not_found" }] }

Example:
  $ mti items complete f3a1b2 d4e5f6 --note "Done via PR #42"
  Short ID    Status
  ────────    ──────────────
  f3a1b2      completed
  d4e5f6      completed

Errors:
  400  Empty short_ids array`
    )
    .action(
      async (
        ids: string[],
        opts: Record<string, string>
      ) => {
        const json = opts.json ?? program.opts().json;
        await completeItem(ids, { ...opts, json }, defaultDeps());
      }
    );

  items
    .command("uncomplete <ids...>")
    .description("Revert action item completion by Short ID (from items list output).")
    .option("--json", "Output as JSON")
    .addHelpText(
      "after",
      `
Output schema (--json):
  { "results": [{ "short_id": "string", "status": "uncompleted|not_found" }] }

Example:
  $ mti items uncomplete f3a1b2
  Short ID    Status
  ────────    ──────────────
  f3a1b2      uncompleted

Errors:
  400  Empty short_ids array`
    )
    .action(
      async (
        ids: string[],
        opts: Record<string, string>
      ) => {
        const json = opts.json ?? program.opts().json;
        await uncompleteItem(ids, { ...opts, json }, defaultDeps());
      }
    );

  items
    .command("completions <meetingId>")
    .description("Show completion records for a meeting's action items.")
    .option("--json", "Output as JSON")
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
    .command("history <id>")
    .description(
      "Show cross-meeting history for an action item. Use the Short ID from 'items list' output."
    )
    .option("--json", "Output as JSON")
    .addHelpText(
      "after",
      `
The <id> argument accepts the Short ID shown in the 'Short ID' column of 'items list' (e.g., f3a1b2).

Output schema (--json):
  [{ "canonical_id": "string", "meeting_id": "string",
     "item_type": "string", "item_index": "number",
     "item_text": "string", "first_mentioned_at": "string",
     "meeting_title": "string", "meeting_date": "string" }]

Example:
  $ mti items list Acme          # note the Short ID column
  $ mti items history f3a1b2     # pass the Short ID here
  Meeting              Date         Description
  ──────────────────  ──────────  ─────────────────────
  Q1 Planning Review  2026-01-15  Draft Q2 roadmap
  Sprint Retro        2026-02-01  Draft Q2 roadmap (updated scope)

Errors:
  404  ID not found`
    )
    .action(async (id: string, opts: Record<string, string>) => {
      const json = opts.json ?? program.opts().json;
      await itemHistory(id, { ...opts, json }, defaultDeps());
    });

  program.addCommand(items);
}
