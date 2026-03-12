import { resolve } from "node:path";
import { existsSync } from "node:fs";

process.loadEnvFile?.(".env.local");

const command = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
const lastDay = process.argv.includes("--last-day");
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
  console.error("  --last-day          Process only meetings from the most recent pending date");
  console.error("  --date=YYYY-MM-DD   Process only meetings from a specific date");
  console.error("");
  console.error("Threshold env vars (set in .env.local):");
  console.error("  MTNINSIGHTS_DEDUP_SEMANTIC_THRESHOLD  default: 0.80  (cosine similarity floor)");
  console.error("  MTNINSIGHTS_DEDUP_STRING_THRESHOLD    default: 0.90  (Jaro-Winkler floor)");
  process.exit(1);
}

const DB_PATH = process.env.MTNINSIGHTS_DB_PATH ?? "db/mtninsights.db";
const VECTOR_PATH = process.env.MTNINSIGHTS_VECTOR_PATH ?? "db/lancedb";
const semanticThreshold = parseFloat(process.env.MTNINSIGHTS_DEDUP_SEMANTIC_THRESHOLD ?? "0.80");
const stringThreshold = parseFloat(process.env.MTNINSIGHTS_DEDUP_STRING_THRESHOLD ?? "0.90");

const dryTag = dryRun ? " [DRY RUN — no changes]" : "";
console.log(`Thresholds: semantic=${semanticThreshold}  string=${stringThreshold}${dryTag}\n`);

const { createDb, migrate } = await import("../core/db.js");
const db = createDb(resolve(DB_PATH));
migrate(db);

// ─── clear ────────────────────────────────────────────────────────────────────

if (command === "clear") {
  const mentionCount = (db.prepare("SELECT COUNT(*) AS n FROM item_mentions").get() as { n: number }).n;
  const autoCompCount = (db.prepare("SELECT COUNT(*) AS n FROM action_item_completions WHERE note LIKE '[auto-dedup]%'").get() as { n: number }).n;

  if (dryRun) {
    console.log(`Would delete: ${mentionCount} item_mentions rows`);
    console.log(`Would delete: ${autoCompCount} auto-dedup action_item_completions`);

    if (existsSync(VECTOR_PATH)) {
      const { connectVectorDb } = await import("../core/vector-db.js");
      const vdb = await connectVectorDb(resolve(VECTOR_PATH));
      const names = await vdb.tableNames();
      if (names.includes("item_vectors")) {
        const table = await vdb.openTable("item_vectors");
        const vecCount = await table.countRows();
        console.log(`Would delete: ${vecCount} item_vectors rows`);
      } else {
        console.log("item_vectors table does not exist — nothing to clear");
      }
    }
    console.log("\nDry run complete. No changes made.");
    process.exit(0);
  }

  db.prepare("DELETE FROM item_mentions").run();
  console.log(`\u2713 Deleted ${mentionCount} item_mentions`);

  db.prepare("DELETE FROM action_item_completions WHERE note LIKE '[auto-dedup]%'").run();
  console.log(`\u2713 Deleted ${autoCompCount} auto-dedup completions`);

  if (existsSync(VECTOR_PATH)) {
    const { connectVectorDb, createItemTable } = await import("../core/vector-db.js");
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
}

const pendingBase = db.prepare(`
  SELECT m.id, m.date, m.title
  FROM meetings m
  JOIN artifacts a ON a.meeting_id = m.id
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
const { loadModel } = await import("../core/embedder.js");
const session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");
console.log("Model loaded.\n");

const { connectVectorDb, createItemTable } = await import("../core/vector-db.js");
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

if (dryRun) {
  const { searchSimilarItems } = await import("../core/item-dedup.js");
  const { isSemanticDuplicate, isStringDuplicate } = await import("../core/math.js");

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

        const found = await searchSimilarItems(itemTable, session, text, { itemType: field, limit: 1 });
        if (found.length > 0 && found[0].meeting_id !== meeting.id) {
          const match = found[0];
          if (isStringDuplicate(text, match.item_text, stringThreshold) || isSemanticDuplicate(match.distance, semanticThreshold)) {
            matchLines.push(`  [${field}] "${text.slice(0, 70)}" → "${match.item_text.slice(0, 70)}" (${match.date.slice(0, 10)})`);
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
  const { deduplicateItems } = await import("../core/item-dedup.js");

  for (let i = 0; i < pending.length; i++) {
    const meeting = pending[i];
    process.stdout.write(`[${i + 1}/${pending.length}] ${meeting.title} (${meeting.date.slice(0, 10)}) ... `);

    const row = db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meeting.id) as ArtifactRow | undefined;
    if (!row) {
      console.log("skip (no artifact)");
      continue;
    }

    const artifact = parseArtifact(row);
    const result = await deduplicateItems(db, itemTable, session, meeting.id, artifact, meeting.date);
    totalMentions += result.mentionsCreated;
    totalDupes += result.duplicatesAutoCompleted;
    console.log(`\u2713  mentions=${result.mentionsCreated}  dupes=${result.duplicatesAutoCompleted}`);
  }

  console.log(`\n\u2713 meetings=${pending.length}  mentions=${totalMentions}  dupes_auto_completed=${totalDupes}`);
}
