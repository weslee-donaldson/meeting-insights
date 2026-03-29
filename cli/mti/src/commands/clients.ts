import { Command } from "commander";
import { HttpClient } from "../http-client.ts";
import { loadConfig } from "../config.ts";
import { outputTable, outputJson, ColumnDef } from "../format.ts";

const CLIENT_COLUMNS: ColumnDef[] = [{ key: "name", header: "Name" }];

const GLOSSARY_COLUMNS: ColumnDef[] = [
  { key: "term", header: "Term", width: 30 },
  { key: "variants", header: "Variants", width: 22 },
  { key: "description", header: "Description" },
];

function makeClient(provided?: HttpClient): HttpClient {
  if (provided) return provided;
  const config = loadConfig();
  return new HttpClient({
    baseUrl: config.baseUrl,
    token: config.token,
    fetch: globalThis.fetch,
  });
}

export function registerClients(
  program: Command,
  deps?: { client?: HttpClient; stream?: NodeJS.WritableStream }
): void {
  const clients = new Command("clients").description(
    "Manage clients and glossary terms."
  );

  const list = new Command("list")
    .description("List your assigned clients.")
    .addHelpText(
      "after",
      `
Output schema (--json):
  ["string"]

Example:
  $ mti clients list
  Name
  ────
  Acme Corp
  Initech

Errors:
  401  Token invalid or expired
  503  Service temporarily unavailable`
    )
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      const parentOpts = program.opts();
      const json = opts.json || parentOpts.json;
      const http = makeClient(deps?.client);
      const data = (await http.get("/api/clients")) as string[];
      if (json) {
        outputJson(data, deps?.stream);
        return;
      }
      const rows = data.map((name) => ({ name }));
      outputTable(rows, CLIENT_COLUMNS, deps?.stream);
    });

  const defaultCmd = new Command("default")
    .description("Show your default client.")
    .addHelpText(
      "after",
      `
Example:
  $ mti clients default
  Acme Corp

Errors:
  401  Token invalid or expired
  503  Service temporarily unavailable`
    )
    .action(async () => {
      const http = makeClient(deps?.client);
      const data = await http.get("/api/default-client");
      const stream = deps?.stream ?? process.stdout;
      if (data === null) {
        stream.write("No default client set.\n");
        return;
      }
      stream.write(String(data) + "\n");
    });

  const glossary = new Command("glossary")
    .description("Show glossary terms for a client.")
    .argument("<name>", "Client name")
    .addHelpText(
      "after",
      `
Output schema (--json):
  [{ "term": "string", "variants": ["string"], "description": "string" }]

Example:
  $ mti clients glossary "Acme Corp"
  Term                          Variants              Description
  ────                          ────────              ───────────
  OKR                           OKRs                  Objectives and Key Results
  RACI                          RACI matrix           Responsible, Accountable, Consulted, Informed

Errors:
  404  Client not found
  401  Token invalid or expired
  503  Service temporarily unavailable`
    )
    .option("--json", "Output as JSON")
    .action(async (name: string, opts) => {
      const parentOpts = program.opts();
      const json = opts.json || parentOpts.json;
      const http = makeClient(deps?.client);
      const data = (await http.get("/api/glossary", { client: name })) as Array<{
        term: string;
        variants: string[];
        description: string;
      }>;
      if (json) {
        outputJson(data, deps?.stream);
        return;
      }
      const rows = data.map((entry) => ({
        term: entry.term,
        variants: entry.variants.join(", "),
        description: entry.description,
      }));
      outputTable(rows, GLOSSARY_COLUMNS, deps?.stream);
    });

  clients.addCommand(list);
  clients.addCommand(defaultCmd);
  clients.addCommand(glossary);
  program.addCommand(clients);
}
