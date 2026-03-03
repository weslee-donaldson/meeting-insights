import { readFileSync } from "node:fs";
import type { DatabaseSync as Database } from "node:sqlite";
import { createLogger } from "./logger.js";

const log = createLogger("client");

export interface ClientRow {
  name: string;
  aliases: string;
  known_participants: string;
  refinement_prompt: string | null;
  meeting_names: string;
}

interface ClientEntry {
  name: string;
  aliases: string[];
  known_participants: string[];
  refinement_prompt?: string;
  meeting_names?: string[];
  is_default?: boolean;
}

export function seedClients(db: Database, filePath: string): void {
  const entries: ClientEntry[] = JSON.parse(readFileSync(filePath, "utf-8"));
  for (const entry of entries) {
    if (!entry.name) throw new Error("Client entry missing name");
    if (!entry.aliases) throw new Error("Client entry missing aliases");
    db.prepare(
      "INSERT OR IGNORE INTO clients (name, aliases, known_participants, refinement_prompt, meeting_names, is_default) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(
      entry.name,
      JSON.stringify(entry.aliases),
      JSON.stringify(entry.known_participants ?? []),
      entry.refinement_prompt ?? null,
      entry.meeting_names ? JSON.stringify(entry.meeting_names) : "[]",
      entry.is_default ? 1 : 0,
    );
  }
  log("loaded %d clients", entries.length);
}

export function getClientByName(db: Database, name: string): ClientRow | null {
  return (db.prepare("SELECT * FROM clients WHERE name = ?").get(name) as ClientRow) ?? null;
}

export function getClientByAlias(db: Database, alias: string): ClientRow | null {
  const all = db.prepare("SELECT * FROM clients").all() as ClientRow[];
  return all.find((c) => (JSON.parse(c.aliases) as string[]).includes(alias)) ?? null;
}

export function getAllClients(db: Database): ClientRow[] {
  return db.prepare("SELECT * FROM clients").all() as ClientRow[];
}

export function getDefaultClient(db: Database): string | null {
  const row = db.prepare("SELECT name FROM clients WHERE is_default = 1 LIMIT 1").get() as { name: string } | undefined;
  return row?.name ?? null;
}
