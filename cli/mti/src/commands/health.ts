import { Command } from "commander";
import { HttpClient } from "../http-client.ts";
import { loadConfig } from "../config.ts";
import { outputJson } from "../format.ts";

interface HealthDeps {
  client?: HttpClient;
  stream?: NodeJS.WritableStream;
  stderr?: NodeJS.WritableStream;
}

function resolveClient(deps?: HealthDeps): HttpClient {
  if (deps?.client) return deps.client;
  const config = loadConfig();
  return new HttpClient({ baseUrl: config.baseUrl, token: config.token, fetch: globalThis.fetch });
}

function resolveStream(deps?: HealthDeps): NodeJS.WritableStream {
  return deps?.stream ?? process.stdout;
}

export function registerHealth(program: Command, deps?: HealthDeps): void {
  const health = new Command("health").description("Check and manage system health.");

  health
    .command("status")
    .description("Show system health status.")
    .option("--json", "Output raw JSON")
    .action(async (opts: { json?: boolean }) => {
      const client = resolveClient(deps);
      const stream = resolveStream(deps);
      const data = await client.get("/api/health") as {
        status: string;
        error_groups: Array<{
          error_type: string;
          severity: string;
          count: number;
          latest_message: string;
          latest_meeting_filename: string | null;
          provider: string | null;
          resolution_hint: string;
        }>;
        meetings_without_artifact: number;
        last_error_at: string | null;
      };

      if (opts.json) {
        outputJson(data, stream);
        return;
      }

      stream.write(`Status: ${data.status.toUpperCase()}\n`);
      if (data.status === "healthy") {
        stream.write("\nNo issues detected.\n");
        return;
      }

      stream.write("\nErrors:\n");
      for (const group of data.error_groups) {
        const provider = group.provider ? ` ${group.provider}` : "";
        stream.write(`  [${group.error_type}]${provider} -- ${group.resolution_hint}\n`);
        stream.write(`    ${group.count} occurrence(s)`);
        if (group.latest_meeting_filename) {
          stream.write(`, latest: ${group.latest_meeting_filename}`);
        }
        stream.write("\n");
      }

      stream.write(`\nMeetings without insights: ${data.meetings_without_artifact}\n`);
      if (data.last_error_at) {
        stream.write(`Last error: ${data.last_error_at}\n`);
      }
    });

  health
    .command("acknowledge")
    .description("Acknowledge (dismiss) health errors.")
    .option("--ids <ids>", "Comma-separated error IDs to acknowledge (default: all)")
    .option("--json", "Output raw JSON")
    .action(async (opts: { ids?: string; json?: boolean }) => {
      const client = resolveClient(deps);
      const stream = resolveStream(deps);

      const errorIds = opts.ids ? opts.ids.split(",").map((s) => s.trim()) : undefined;
      const body = errorIds ? { errorIds } : {};
      const result = await client.post("/api/health/acknowledge", body) as { ok: boolean };

      if (opts.json) {
        outputJson(result, stream);
        return;
      }

      if (errorIds) {
        stream.write(`Acknowledged ${errorIds.length} error(s).\n`);
      } else {
        stream.write("Acknowledged all errors.\n");
      }
    });

  program.addCommand(health);
}
