#!/usr/bin/env tsx
import { Command } from "commander";
import type { DatabaseSync as Database } from "node:sqlite";
import { registerOAuthClient } from "../core/auth/oauth-clients.js";
import { createApiKey } from "../core/auth/api-keys.js";
import type { Scope } from "../core/auth/scopes.js";

export function buildProgram(
  db: Database,
  tenantId: string,
  userId: string,
  print: (msg: string) => void,
): Command {
  const program = new Command();
  program.name("manage-auth").description("Manage OAuth clients and API keys");

  program
    .command("create-client")
    .requiredOption("--name <name>", "Client name")
    .requiredOption("--grant-types <types>", "Comma-separated grant types")
    .requiredOption("--scopes <scopes>", "Comma-separated scopes")
    .option("--redirect-uris <uris>", "Comma-separated redirect URIs")
    .action((opts) => {
      const grantTypes = opts.grantTypes.split(",");
      const scopes = opts.scopes.split(",");
      const redirectUris = opts.redirectUris ? opts.redirectUris.split(",") : undefined;

      const result = registerOAuthClient(db, {
        tenantId,
        name: opts.name,
        grantTypes,
        scopes,
        redirectUris,
      });

      const output: Record<string, string> = { client_id: result.clientId };
      if (result.clientSecret) {
        output.client_secret = result.clientSecret;
      }
      print(JSON.stringify(output));
    });

  program
    .command("create-api-key")
    .requiredOption("--name <name>", "Key name")
    .requiredOption("--scopes <scopes>", "Comma-separated scopes")
    .action((opts) => {
      const scopes = opts.scopes.split(",") as Scope[];
      const result = createApiKey(db, { tenantId, userId, name: opts.name, scopes });
      print(JSON.stringify({ key: result.key, prefix: result.prefix }));
    });

  return program;
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].replace(/^.*\//, ""));

if (isDirectRun) {
  const { createDb, migrate } = await import("../core/db.js");
  const { resolve, join } = await import("node:path");

  process.loadEnvFile?.(".env.local");

  const APP_ROOT = resolve(process.env.MTNINSIGHTS_APP_ROOT ?? process.cwd());
  const DB_PATH = process.env.MTNINSIGHTS_DB_PATH
    ? resolve(process.env.MTNINSIGHTS_DB_PATH)
    : join(APP_ROOT, "db/mtninsights.db");

  const db = createDb(DB_PATH);
  migrate(db);

  const tenant = db
    .prepare("SELECT id FROM tenants WHERE slug = 'default'")
    .get() as { id: string } | undefined;

  if (!tenant) {
    process.stderr.write("No default tenant found. Run setup first.\n");
    process.exit(1);
  }

  const owner = db
    .prepare("SELECT user_id FROM tenant_memberships WHERE tenant_id = ? AND role = 'owner' LIMIT 1")
    .get(tenant.id) as { user_id: string } | undefined;

  if (!owner) {
    process.stderr.write("No owner user found for default tenant.\n");
    process.exit(1);
  }

  const program = buildProgram(db, tenant.id, owner.user_id, (msg) => console.log(msg));
  program.parse();
}
