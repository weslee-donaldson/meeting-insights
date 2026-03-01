import { readFileSync } from "node:fs";
import type { DatabaseSync as Database } from "node:sqlite";
import { createLogger } from "./logger.js";

const log = createLogger("client");

export interface ClientRow {
  name: string;
  aliases: string;
  known_participants: string;
}

interface ClientEntry {
  name: string;
  aliases: string[];
  known_participants: string[];
}

export function seedClients(db: Database, filePath: string): void {
  const entries: ClientEntry[] = JSON.parse(readFileSync(filePath, "utf-8"));
  for (const entry of entries) {
    if (!entry.name) throw new Error("Client entry missing name");
    if (!entry.aliases) throw new Error("Client entry missing aliases");
    db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run(
      entry.name,
      JSON.stringify(entry.aliases),
      JSON.stringify(entry.known_participants ?? []),
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
