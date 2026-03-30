import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { DatabaseSync as Database } from "node:sqlite";
import { createLogger } from "./logger.js";

const log = createLogger("client");

export interface Participant {
  name: string;
  email?: string;
  role: string;
}

export interface GlossaryEntry {
  term: string;
  variants: string[];
  description: string;
}

export interface ClientRow {
  id: string;
  tenant_id: string;
  name: string;
  aliases: string;
  known_participants: string;
  refinement_prompt: string | null;
  client_team: string;
  implementation_team: string;
  additional_extraction_llm_prompt: string | null;
  meeting_names: string;
  glossary: string;
}

interface ClientEntry {
  name: string;
  aliases: string[];
  client_team?: Participant[];
  implementation_team?: Participant[];
  additional_extraction_llm_prompt?: string;
  meeting_names?: string[];
  is_default?: boolean;
  glossary?: GlossaryEntry[];
}

function resolveDefaultTenantId(db: Database): string | null {
  const row = db.prepare("SELECT id FROM tenants WHERE slug = 'default'").get() as { id: string } | undefined;
  return row?.id ?? null;
}

export function seedClients(db: Database, filePath: string, tenantId?: string): void {
  const resolvedTenantId = tenantId ?? resolveDefaultTenantId(db);
  const entries: ClientEntry[] = JSON.parse(readFileSync(filePath, "utf-8"));
  for (const entry of entries) {
    if (!entry.name) throw new Error("Client entry missing name");
    if (!entry.aliases) throw new Error("Client entry missing aliases");
    const clientTeam = entry.client_team ?? [];
    const implTeam = entry.implementation_team ?? [];
    const knownParticipants = [
      ...clientTeam.map(p => p.email ?? p.name),
      ...implTeam.map(p => p.email ?? p.name),
    ].filter(Boolean);
    const existing = db.prepare("SELECT id FROM clients WHERE name = ?").get(entry.name) as { id: string | null } | undefined;
    if (existing) {
      db.prepare(
        "UPDATE clients SET aliases = ?, known_participants = ?, client_team = ?, implementation_team = ?, additional_extraction_llm_prompt = ?, meeting_names = ?, is_default = ?, glossary = ? WHERE name = ?",
      ).run(
        JSON.stringify(entry.aliases),
        JSON.stringify(knownParticipants),
        JSON.stringify(clientTeam),
        JSON.stringify(implTeam),
        entry.additional_extraction_llm_prompt ?? null,
        entry.meeting_names ? JSON.stringify(entry.meeting_names) : "[]",
        entry.is_default ? 1 : 0,
        entry.glossary ? JSON.stringify(entry.glossary) : "[]",
        entry.name,
      );
      continue;
    }
    db.prepare(
      "INSERT INTO clients (name, aliases, known_participants, client_team, implementation_team, additional_extraction_llm_prompt, meeting_names, is_default, glossary, id, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      entry.name,
      JSON.stringify(entry.aliases),
      JSON.stringify(knownParticipants),
      JSON.stringify(clientTeam),
      JSON.stringify(implTeam),
      entry.additional_extraction_llm_prompt ?? null,
      entry.meeting_names ? JSON.stringify(entry.meeting_names) : "[]",
      entry.is_default ? 1 : 0,
      entry.glossary ? JSON.stringify(entry.glossary) : "[]",
      randomUUID(),
      resolvedTenantId,
    );
  }
  log("loaded %d clients", entries.length);
}

export function getClientByName(db: Database, name: string, tenantId?: string): ClientRow | null {
  if (tenantId) {
    return (db.prepare("SELECT * FROM clients WHERE name = ? AND tenant_id = ?").get(name, tenantId) as ClientRow) ?? null;
  }
  return (db.prepare("SELECT * FROM clients WHERE name = ?").get(name) as ClientRow) ?? null;
}

export function getClientByAlias(db: Database, alias: string, tenantId?: string): ClientRow | null {
  const all = tenantId
    ? db.prepare("SELECT * FROM clients WHERE tenant_id = ?").all(tenantId) as ClientRow[]
    : db.prepare("SELECT * FROM clients").all() as ClientRow[];
  return all.find((c) => (JSON.parse(c.aliases) as string[]).includes(alias)) ?? null;
}

export function getAllClients(db: Database, tenantId?: string): ClientRow[] {
  if (tenantId) {
    return db.prepare("SELECT * FROM clients WHERE tenant_id = ?").all(tenantId) as ClientRow[];
  }
  return db.prepare("SELECT * FROM clients").all() as ClientRow[];
}

export function getDefaultClient(db: Database, tenantId?: string): string | null {
  if (tenantId) {
    const row = db.prepare("SELECT name FROM clients WHERE is_default = 1 AND tenant_id = ? LIMIT 1").get(tenantId) as { name: string } | undefined;
    return row?.name ?? null;
  }
  const row = db.prepare("SELECT name FROM clients WHERE is_default = 1 LIMIT 1").get() as { name: string } | undefined;
  return row?.name ?? null;
}

export function getGlossaryForClient(db: Database, clientName: string, tenantId?: string): GlossaryEntry[] {
  const client = getClientByName(db, clientName, tenantId);
  if (!client) return [];
  return JSON.parse(client.glossary) as GlossaryEntry[];
}

const ROLE_AUTHORITY_GUIDANCE = `When determining whether a request is critical, consider the role and domain:
- A CTO or VP has broad authority but may defer to domain experts (PO on product, Architect on technical)
- An Engineering Manager directing team work has high authority for delivery decisions
- A Principal Developer's technical direction carries elevated weight
- Trusted senior implementors (e.g., Architect) have authority on technical decisions comparable to senior client-side
- A Developer or Consultant without explicit endorsement from a senior = standard priority
- If a senior person explicitly delegates to someone junior, that direction carries the senior's weight`;

export function buildClientContext(
  name: string,
  clientTeam: Participant[],
  implTeam: Participant[],
  additionalPrompt: string | undefined,
  glossary?: GlossaryEntry[],
): string {
  const lines: string[] = [];
  lines.push(`## Client Context: ${name}`);
  lines.push("");

  if (clientTeam.length > 0) {
    lines.push("Client team (they direct the work — their words define your deliverables):");
    for (const p of clientTeam) {
      lines.push(`- ${p.name}, ${p.role}`);
    }
    lines.push("");
  }

  if (implTeam.length > 0) {
    lines.push("Implementation team (delivery partner):");
    for (const p of implTeam) {
      lines.push(`- ${p.name}, ${p.role}`);
    }
    lines.push("");
  }

  lines.push(ROLE_AUTHORITY_GUIDANCE);

  if (glossary && glossary.length > 0) {
    lines.push("");
    lines.push("## Terminology Glossary");
    lines.push("When the transcript contains any of the listed variants, use the canonical term in your output.");
    lines.push("");
    for (const entry of glossary) {
      const variantList = entry.variants.map(v => `"${v}"`).join(", ");
      lines.push(`- **${entry.term}** → ${variantList}`);
    }
  }

  if (additionalPrompt) {
    lines.push("");
    lines.push(additionalPrompt);
  }

  return lines.join("\n");
}
