import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { loadCliConfig } from "./shared.js";

const command = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
const lastDay = process.argv.includes("--last-day");
const deepScan = process.argv.includes("--deepscan");
const dateArg = process.argv.find((a) => a.startsWith("--date="))?.split("=")[1];

if (command !== "run" && command !== "clear") {
  console.error("Usage: pnpm all-items-dedupe <run|clear> [options]");
  console.error("");
  console.error("Commands:");
  console.error("  run           Dedup items for all un-deduped meetings");
  console.error("  clear         Remove all dedup associations so thresholds can be re-tuned");
  console.error("");
  console.error("Flags:");
  console.error("  --dry-run           Show what would happen without writing anything");
  console.error("  --deepscan          Use LLM intent clustering (batch per client, critical+normal only)");
  console.error("  --last-day          Process only meetings from the most recent pending date");
  console.error("  --date=YYYY-MM-DD   Process only meetings from a specific date");
  console.error("");
  console.error("Threshold env vars (set in .env.local):");
  console.error("  MTNINSIGHTS_DEDUP_SEMANTIC_THRESHOLD  default: 0.80  (cosine similarity floor)");
  console.error("  MTNINSIGHTS_DEDUP_STRING_THRESHOLD    default: 0.90  (Jaro-Winkler floor)");
  console.error("  MTNINSIGHTS_DEDUP_BATCH_SIZE          default: 50    (max items per priority group for --deepscan)");
  process.exit(1);
}

const { dbPath: DB_PATH, vectorPath: VECTOR_PATH } = loadCliConfig();
const semanticThreshold = parseFloat(process.env.MTNINSIGHTS_DEDUP_SEMANTIC_THRESHOLD ?? "0.80");
const stringThreshold = parseFloat(process.env.MTNINSIGHTS_DEDUP_STRING_THRESHOLD ?? "0.90");
const batchSize = parseInt(process.env.MTNINSIGHTS_DEDUP_BATCH_SIZE ?? "50", 10);

const dryTag = dryRun ? " [DRY RUN \u2014 no changes]" : "";
if (deepScan) {
  console.log(`Mode: --deepscan (LLM intent clustering)  batch_size=${batchSize}${dryTag}\n`);
} else {
  console.log(`Thresholds: semantic=${semanticThreshold}  string=${stringThreshold}${dryTag}\n`);
}

const { createDb, migrate } = await import("../../core/db.js");
const db = createDb(resolve(DB_PATH));
migrate(db);

// ─── clear ────────────────────────────────────────────────────────────────────

if (command === "clear") {
  const mentionCount = (db.prepare("SELECT COUNT(*) AS n FROM item_mentions").get() as { n: number }).n;
  const autoCompCount = (db.prepare("SELECT COUNT(*) AS n FROM action_item_completions WHERE note LIKE '[auto-dedup]%' OR note LIKE '[auto-dedup-deep]%'").get() as { n: number }).n;

  if (dryRun) {
    console.log(`Would delete: ${mentionCount} item_mentions rows`);
    console.log(`Would delete: ${autoCompCount} auto-dedup completions`);

    if (existsSync(VECTOR_PATH)) {
      const { connectVectorDb } = await import("../../core/vector-db.js");
      const vdb = await connectVectorDb(resolve(VECTOR_PATH));
      const names = await vdb.tableNames();
      if (names.includes("item_vectors")) {
        const table = await vdb.openTable("item_vectors");
        const vecCount = await table.countRows();
        console.log(`Would delete: ${vecCount} item_vectors rows`);
      } else {
        console.log("item_vectors table does not exist \u2014 nothing to clear");
      }
    }
    console.log("\nDry run complete. No changes made.");
    process.exit(0);
  }

  db.prepare("DELETE FROM item_mentions").run();
  console.log(`\u2713 Deleted ${mentionCount} item_mentions`);

  db.prepare("DELETE FROM action_item_completions WHERE note LIKE '[auto-dedup]%' OR note LIKE '[auto-dedup-deep]%'").run();
  console.log(`\u2713 Deleted ${autoCompCount} auto-dedup completions`);

  if (existsSync(VECTOR_PATH)) {
    const { connectVectorDb, createItemTable } = await import("../../core/vector-db.js");
    const vdb = await connectVectorDb(resolve(VECTOR_PATH));
    const names = await vdb.tableNames();
    if (names.includes("item_vectors")) {
      const table = await vdb.openTable("item_vectors");
      const vecCount = await table.countRows();
      await vdb.dropTable("item_vectors");
      await createItemTable(vdb);
      console.log(`\u2713 Cleared ${vecCount} item_vectors (table recreated)`);
    }
  }

  console.log("\nClear complete. Run: pnpm all-items-dedupe run");
  process.exit(0);
}

// ─── run ─────────────────────────────────────────────────────────────────────

interface MeetingRow {
  id: string;
  date: string;
  title: string;
  client: string;
}

const pendingBase = db.prepare(`
  SELECT m.id, m.date, m.title,
         COALESCE(c.name, '') AS client
  FROM meetings m
  JOIN artifacts a ON a.meeting_id = m.id
  LEFT JOIN clients c ON m.client_id = c.id
  WHERE m.ignored = 0
    AND NOT EXISTS (SELECT 1 FROM item_mentions im WHERE im.meeting_id = m.id)
  ORDER BY m.date ASC
`).all() as MeetingRow[];

let targetDate: string | undefined;

if (dateArg) {
  targetDate = dateArg;
} else if (lastDay) {
  const latest = db.prepare(`
    SELECT MAX(DATE(m.date)) AS d
    FROM meetings m
    JOIN artifacts a ON a.meeting_id = m.id
    WHERE m.ignored = 0
      AND NOT EXISTS (SELECT 1 FROM item_mentions im WHERE im.meeting_id = m.id)
  `).get() as { d: string | null };
  targetDate = latest.d ?? undefined;
}

const pending = targetDate
  ? pendingBase.filter((m) => m.date.startsWith(targetDate!))
  : pendingBase;

const filterLabel = targetDate ? ` (date: ${targetDate})` : "";
console.log(`Meetings pending dedup: ${pending.length}${filterLabel}`);

if (pending.length === 0) {
  const hint = pendingBase.length === 0
    ? "Nothing to do. To re-run with new thresholds: pnpm all-items-dedupe clear && pnpm all-items-dedupe run"
    : "No meetings match the given date filter.";
  console.log(hint);
  process.exit(0);
}

console.log("Loading embedding model...");
const { loadModel } = await import("../../core/embedder.js");
const session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");
console.log("Model loaded.\n");

const { connectVectorDb, createItemTable } = await import("../../core/vector-db.js");
const vdb = await connectVectorDb(resolve(VECTOR_PATH));
const itemTable = await createItemTable(vdb);

interface ArtifactRow {
  summary: string;
  decisions: string;
  proposed_features: string;
  action_items: string;
  open_questions: string;
  risk_items: string;
  additional_notes: string;
  milestones: string;
}

function parseArtifact(row: ArtifactRow) {
  return {
    summary: row.summary ?? "",
    decisions: JSON.parse(row.decisions ?? "[]"),
    proposed_features: JSON.parse(row.proposed_features ?? "[]"),
    action_items: JSON.parse(row.action_items ?? "[]"),
    open_questions: JSON.parse(row.open_questions ?? "[]"),
    risk_items: JSON.parse(row.risk_items ?? "[]"),
    additional_notes: JSON.parse(row.additional_notes ?? "[]"),
    milestones: JSON.parse(row.milestones ?? "[]"),
  };
}

function getItemText(item: unknown, fieldType: string): string {
  if (typeof item === "string") return item;
  if (typeof item === "object" && item !== null) {
    const obj = item as Record<string, unknown>;
    if (fieldType === "action_items" || fieldType === "risk_items") return (obj.description as string) ?? "";
    if (fieldType === "decisions") return (obj.text as string) ?? "";
  }
  return String(item);
}

const DEDUP_FIELDS = ["action_items", "decisions", "proposed_features", "open_questions", "risk_items"] as const;

let totalMentions = 0;
let totalDupes = 0;

// ─── deepscan mode ───────────────────────────────────────────────────────────

if (deepScan) {
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  const PROVIDER = process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic";
  const LOCAL_BASE_URL = process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434";
  const LOCAL_MODEL = process.env.MTNINSIGHTS_LOCAL_MODEL ?? "deepseek-r1:8b";
  const CLAUDEAPI_URL = process.env.MTNINSIGHTS_CLAUDEAPI_URL ?? "http://localhost:8100";

  const { createLlmAdapter } = await import("../../core/llm/adapter.js");
  const llm = PROVIDER === "local"
    ? createLlmAdapter({ type: "local", baseUrl: LOCAL_BASE_URL, model: LOCAL_MODEL })
    : PROVIDER === "claudecli"
      ? createLlmAdapter({ type: "claudecli" })
      : PROVIDER === "local-claudeapi"
        ? createLlmAdapter({ type: "local-claudeapi", baseUrl: CLAUDEAPI_URL })
        : PROVIDER === "stub"
          ? createLlmAdapter({ type: "stub" })
          : PROVIDER === "openai"
            ? createLlmAdapter({ type: "openai", apiKey: process.env.OPENAI_API_KEY! })
            : createLlmAdapter({ type: "anthropic", apiKey: API_KEY! });

  const promptPath = "config/prompts/dedup-intent.md";
  const promptTemplate = existsSync(promptPath) ? readFileSync(promptPath, "utf8") : "{{items}}";

  const clientMap = new Map<string, MeetingRow[]>();
  for (const meeting of pending) {
    const key = meeting.client || "__no_client__";
    if (!clientMap.has(key)) clientMap.set(key, []);
    clientMap.get(key)!.push(meeting);
  }

  console.log(`Clients: ${clientMap.size}\n`);

  if (dryRun) {
    const { filterAndCapItems, buildBatchDedupPrompt, parseBatchDedupResponse } = await import("../../core/dedup/deep-dedup.js");
    type BatchDedupItem = { description: string; priority: "critical" | "normal" | "low"; meetingTitle: string; date: string };

    for (const [client, meetings] of clientMap) {
      const label = client === "__no_client__" ? "(no client)" : client;
      const allItems: BatchDedupItem[] = [];

      for (const meeting of meetings) {
        const row = db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meeting.id) as ArtifactRow | undefined;
        if (!row) continue;
        const artifact = parseArtifact(row);
        for (const item of artifact.action_items) {
          allItems.push({
            description: (item as Record<string, unknown>).description as string ?? "",
            priority: ((item as Record<string, unknown>).priority as "critical" | "normal" | "low") ?? "normal",
            meetingTitle: meeting.title,
            date: meeting.date,
          });
        }
      }

      const filtered = filterAndCapItems(allItems, batchSize);
      if (filtered.length < 2) {
        console.log(`${label}: ${allItems.length} items (${filtered.length} eligible) \u2014 skipped (need \u22652)`);
        continue;
      }

      const prompt = buildBatchDedupPrompt(promptTemplate, filtered);
      const response = await llm.complete("dedup_intent", prompt);
      const groups = parseBatchDedupResponse(response, filtered.length);
      const reasoning = (response.reasoning ?? {}) as Record<string, string>;

      console.log(`\n${label}: ${allItems.length} items \u2192 ${filtered.length} eligible \u2192 ${groups.length} group(s)`);
      for (const group of groups) {
        const key = group.join(",");
        const reason = reasoning[key] ?? "";
        const items = group.map((i) => `"${filtered[i].description.slice(0, 60)}"`).join(" + ");
        console.log(`  [${key}] ${items}`);
        if (reason) console.log(`    \u2192 ${reason}`);
        totalDupes += group.length - 1;
      }
      totalMentions += filtered.length;
    }

    console.log(`\nDry run: ${pending.length} meetings  ${totalMentions} eligible items  ${totalDupes} would be grouped`);
    console.log("No changes made.");
  } else {
    const { deepScanClient } = await import("../../core/dedup/deep-dedup.js");

    for (const [client, meetings] of clientMap) {
      const label = client === "__no_client__" ? "(no client)" : client;
      process.stdout.write(`${label} (${meetings.length} meetings) ... `);

      const result = await deepScanClient(db, itemTable, session, llm, client, meetings, promptTemplate);
      totalMentions += result.mentionsCreated;
      totalDupes += result.duplicatesAutoCompleted;
      console.log(`\u2713  mentions=${result.mentionsCreated}  dupes=${result.duplicatesAutoCompleted}`);
    }

    console.log(`\n\u2713 clients=${clientMap.size}  meetings=${pending.length}  mentions=${totalMentions}  dupes_auto_completed=${totalDupes}`);
  }
} else if (dryRun) {
  // ─── embedding-only dry run ────────────────────────────────────────────────

  const { searchSimilarItems } = await import("../../core/dedup/item-dedup.js");
  const { isSemanticDuplicate, isStringDuplicate } = await import("../../core/math.js");

  for (const meeting of pending) {
    const row = db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meeting.id) as ArtifactRow | undefined;
    if (!row) continue;

    const artifact = parseArtifact(row);
    const matchLines: string[] = [];

    for (const field of DEDUP_FIELDS) {
      const items = artifact[field] as unknown[];
      for (const item of items) {
        const text = getItemText(item, field);
        if (!text) continue;
        totalMentions++;

        const found = await searchSimilarItems(itemTable, session, text, { itemType: field, client: meeting.client, limit: 1 });
        if (found.length > 0 && found[0].meeting_id !== meeting.id) {
          const match = found[0];
          if (isStringDuplicate(text, match.item_text, stringThreshold) || isSemanticDuplicate(match.distance, semanticThreshold)) {
            matchLines.push(`  [${field}] "${text.slice(0, 70)}" \u2192 "${match.item_text.slice(0, 70)}" (${match.date.slice(0, 10)})`);
            totalDupes++;
          }
        }
      }
    }

    const label = `${meeting.title} (${meeting.date.slice(0, 10)})`;
    if (matchLines.length > 0) {
      console.log(`\n${label}: ${matchLines.length} match(es)`);
      for (const line of matchLines) console.log(line);
    } else {
      console.log(`${label}: no matches`);
    }
  }

  console.log(`\nDry run: ${pending.length} meetings  ${totalMentions} items  ${totalDupes} would be grouped`);
  console.log("No changes made.");
} else {
  // ─── embedding-only run ────────────────────────────────────────────────────

  const { deduplicateItems } = await import("../../core/dedup/item-dedup.js");

  for (let i = 0; i < pending.length; i++) {
    const meeting = pending[i];
    process.stdout.write(`[${i + 1}/${pending.length}] ${meeting.title} (${meeting.date.slice(0, 10)}) ... `);

    const row = db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meeting.id) as ArtifactRow | undefined;
    if (!row) {
      console.log("skip (no artifact)");
      continue;
    }

    const artifact = parseArtifact(row);
    const result = await deduplicateItems(db, itemTable, session, meeting.id, artifact, meeting.date, meeting.client);
    totalMentions += result.mentionsCreated;
    totalDupes += result.duplicatesAutoCompleted;
    console.log(`\u2713  mentions=${result.mentionsCreated}  dupes=${result.duplicatesAutoCompleted}`);
  }

  console.log(`\n\u2713 meetings=${pending.length}  mentions=${totalMentions}  dupes_auto_completed=${totalDupes}`);
}
