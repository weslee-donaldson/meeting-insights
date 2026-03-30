import { Command } from "commander";
import { HttpClient } from "../http-client.ts";
import { loadConfig } from "../config.ts";
import { outputTable, outputJson, outputKv, ColumnDef } from "../format.ts";
import { NotFoundError } from "../errors.ts";

const CLIENT_COLUMNS: ColumnDef[] = [
  { key: "id", header: "ID" },
  { key: "name", header: "Name" },
];

const TEAM_COLUMNS: ColumnDef[] = [
  { key: "name", header: "Name" },
  { key: "role", header: "Role" },
  { key: "email", header: "Email" },
];

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
  const clients = new Command("clients")
    .description("Manage clients and glossary terms.")
    .enablePositionalOptions();

  const list = new Command("list")
    .description("List your assigned clients.")
    .addHelpText(
      "after",
      `
Output schema (--json):
  [{ "id": "string", "name": "string" }]

Example:
  $ mti clients list
  ID         Name
  ──         ────
  aaaa1111   Acme Corp
  bbbb1111   Initech

Errors:
  401  Token invalid or expired
  503  Service temporarily unavailable`
    )
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      const parentOpts = program.opts();
      const json = opts.json || parentOpts.json;
      const http = makeClient(deps?.client);
      const data = (await http.get("/api/clients/list")) as Array<{ id: string; name: string }>;
      if (json) {
        outputJson(data, deps?.stream);
        return;
      }
      outputTable(data, CLIENT_COLUMNS, deps?.stream);
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

  const info = new Command("info")
    .description("Show details for a client.")
    .argument("<id>", "Client ID or name")
    .addHelpText(
      "after",
      `
Output schema (--json):
  { "id": "string", "name": "string", "aliases": ["string"],
    "client_team": [{ "name": "string", "role": "string", "email": "string" }],
    "implementation_team": [{ "name": "string", "role": "string", "email": "string" }],
    "meeting_names": ["string"], "glossary_count": "number" }

Example:
  $ mti clients info LLSA
  Name:      LLSA
  Aliases:   LLSA, LS&A

  CLIENT TEAM
  Name              Role                   Email
  ────              ────                   ─────
  Stace Baal        CTO                    stace.baal@llsa.com
  Jennifer Karavakis Engineering Manager   jennifer.karavakis@llsa.com

  $ mti clients info a1b2c3d4-e5f6-...    # also accepts UUID

Errors:
  404  Client not found`
    )
    .option("--json", "Output as JSON")
    .action(async (idOrName: string, opts) => {
      const parentOpts = program.opts();
      const json = opts.json || parentOpts.json;
      const http = makeClient(deps?.client);
      const stream = deps?.stream ?? process.stdout;
      let data: Record<string, unknown>;
      try {
        data = (await http.get(`/api/clients/${idOrName}`)) as Record<string, unknown>;
      } catch (err) {
        if (!(err instanceof NotFoundError)) throw err;
        const clients = (await http.get("/api/clients/list")) as Array<{ id: string; name: string }>;
        const match = clients.find(
          (c) => c.name.toLowerCase() === idOrName.toLowerCase()
        );
        if (!match) {
          stream.write("Client not found.\n");
          return;
        }
        data = (await http.get(`/api/clients/${match.id}`)) as Record<string, unknown>;
      }
      if (json) {
        outputJson(data, stream);
        return;
      }
      outputKv([
        { label: "Name", value: String(data.name) },
        { label: "Aliases", value: (data.aliases as string[]).join(", ") },
      ], stream);
      stream.write("\n");
      const clientTeam = data.client_team as Array<{ name: string; role: string; email: string }>;
      if (clientTeam.length > 0) {
        stream.write("CLIENT TEAM\n");
        outputTable(clientTeam, TEAM_COLUMNS, stream);
        stream.write("\n");
      }
      const implTeam = data.implementation_team as Array<{ name: string; role: string; email: string }>;
      if (implTeam.length > 0) {
        stream.write("IMPLEMENTATION TEAM\n");
        outputTable(implTeam, TEAM_COLUMNS, stream);
        stream.write("\n");
      }
      const meetingNames = data.meeting_names as string[];
      if (meetingNames.length > 0) {
        stream.write("MEETING NAMES\n");
        for (const name of meetingNames) {
          stream.write(`  ${name}\n`);
        }
        stream.write("\n");
      }
      stream.write(`Glossary Terms:    ${data.glossary_count}\n`);
    });

  clients.addCommand(list);
  clients.addCommand(defaultCmd);
  clients.addCommand(glossary);
  clients.addCommand(info);
  program.addCommand(clients);
}
