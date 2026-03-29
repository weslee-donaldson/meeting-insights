import { Command } from "commander";
import { HttpClient } from "../http-client.ts";
import { loadConfig } from "../config.ts";
import { outputTable, outputJson, ColumnDef } from "../format.ts";

const CLIENT_COLUMNS: ColumnDef[] = [{ key: "name", header: "Name" }];

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

  clients.addCommand(list);
  program.addCommand(clients);
}
