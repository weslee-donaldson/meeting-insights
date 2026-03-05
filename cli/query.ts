import { createDb } from "../core/db.js";
import { connectVectorDb } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { searchMeetings } from "../core/vector-search.js";
import { getMeeting } from "../core/ingest.js";
import { getArtifact } from "../core/extractor.js";
import { renderNotesGroups, parseCitations } from "../core/display-helpers.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { deepSearch } from "../core/deep-search.js";
import { readFileSync, existsSync } from "node:fs";
import type { DatabaseSync as Database } from "node:sqlite";

process.loadEnvFile?.(".env.local");

const DB_PATH      = process.env.MTNINSIGHTS_DB_PATH      ?? "db/mtninsights.db";
const VECTOR_PATH  = process.env.MTNINSIGHTS_VECTOR_PATH  ?? "db/lancedb";
const PROVIDER     = (process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic") as "anthropic" | "local" | "stub";
const API_KEY      = process.env.ANTHROPIC_API_KEY;
const LOCAL_BASE_URL = process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434";
const LOCAL_MODEL  = process.env.MTNINSIGHTS_LOCAL_MODEL  ?? "llama3.1:8b";

// ── Arg parsing ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

const clientFilter  = args.find(a => a.startsWith("--client="))?.slice(9);
const meetingFilter = args.find(a => a.startsWith("--meeting="))?.slice(10);
const afterFilter   = args.find(a => a.startsWith("--after="))?.slice(8);
const beforeFilter  = args.find(a => a.startsWith("--before="))?.slice(9);
const limit         = parseInt(args.find(a => a.startsWith("--limit="))?.slice(8) ?? "6");
const searchMode    = args.includes("--search");
const deepSearchMode = args.includes("--deepsearch");

const listIdx  = args.indexOf("--list");
const listType = args.find(a => a.startsWith("--list="))?.slice(7)
  ?? (listIdx !== -1 && args[listIdx + 1] && !args[listIdx + 1].startsWith("-") ? args[listIdx + 1] : undefined);

const question = args.filter(a => !a.startsWith("-")).join(" ").trim();

// ── Types ─────────────────────────────────────────────────────────────────────

interface MeetingRow { id: string; title: string; date: string; }
interface ActionItem  { description: string; owner: string; requester: string; due_date: string | null; }
interface Decision { text: string; decided_by: string }

function parseDecisions(json: string): Decision[] {
  const raw = JSON.parse(json) as unknown[];
  return raw.map((d) => (typeof d === "string" ? { text: d, decided_by: "" } : d as Decision));
}
interface SearchResult { meeting_id: string; score: number; client: string; meeting_type: string; date: string; }

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveMeetingIds(db: Database, opts: { client?: string; meeting?: string; after?: string; before?: string }): string[] {
  let rows = db.prepare("SELECT id, title, date FROM meetings ORDER BY date ASC").all() as unknown as MeetingRow[];
  if (opts.after)   rows = rows.filter(r => r.date >= opts.after!);
  if (opts.before)  rows = rows.filter(r => r.date <= (opts.before! + "T23:59:59Z"));
  if (opts.meeting) rows = rows.filter(r =>
    r.title.toLowerCase().includes(opts.meeting!.toLowerCase()) || r.id.startsWith(opts.meeting!),
  );
  if (opts.client) {
    const clientIds = new Set(
      (db.prepare("SELECT meeting_id FROM client_detections WHERE client_name = ?").all(opts.client) as unknown as { meeting_id: string }[])
        .map(r => r.meeting_id),
    );
    rows = rows.filter(r => clientIds.has(r.id));
  }
  return rows.map(r => r.id);
}

function clientForMeeting(db: Database, meetingId: string): string {
  const row = db.prepare(
    "SELECT client_name FROM client_detections WHERE meeting_id = ? ORDER BY confidence DESC LIMIT 1",
  ).get(meetingId) as { client_name: string } | undefined;
  return row?.client_name ?? "";
}

function meetingHeader(title: string, date: string, client: string): string {
  const clientTag = client ? `  [${client}]` : "";
  const bar = "━".repeat(60);
  return `\n${bar}\n${title}   ${date.slice(0, 10)}${clientTag}\n${bar}`;
}

function buildLabeledContext(db: Database, results: SearchResult[]): string {
  return results.map((r, i) => {
    const label = `[M${i + 1}]`;
    const mtg = getMeeting(db, r.meeting_id);
    const art = getArtifact(db, r.meeting_id);
    if (!art) return "";
    const decisions  = parseDecisions(art.decisions ?? "[]");
    const actions    = JSON.parse(art.action_items ?? "[]") as ActionItem[];
    const questions  = JSON.parse(art.open_questions ?? "[]") as string[];
    const risks      = JSON.parse(art.risk_items ?? "[]") as string[];
    const features   = JSON.parse(art.proposed_features ?? "[]") as string[];
    const topics     = JSON.parse(art.architecture ?? "[]") as string[];
    const notes = JSON.parse(art.additional_notes ?? "[]") as Array<Record<string, unknown>>;
    const notesText = renderNotesGroups(notes);
    const notesSection = notesText.length > 0
      ? `Notes:\n${notesText.length > 1000 ? notesText.slice(0, 1000) + "…" : notesText}`
      : "";
    return [
      `## ${label} ${mtg.title}  (${mtg.date.slice(0, 10)})`,
      `Summary: ${art.summary}`,
      decisions.length  ? `Decisions: ${decisions.map(d => d.text).join(" | ")}` : "",
      actions.length    ? `Action items: ${actions.map(a => `${a.owner}: ${a.description}`).join(" | ")}` : "",
      questions.length  ? `Open questions: ${questions.join(" | ")}` : "",
      risks.length      ? `Risks: ${risks.join(" | ")}` : "",
      features.length   ? `Proposed features: ${features.join(" | ")}` : "",
      topics.length     ? `Architecture: ${topics.join(", ")}` : "",
      notesSection,
    ].filter(Boolean).join("\n");
  }).filter(Boolean).join("\n\n---\n\n");
}

// ── --list helpers ────────────────────────────────────────────────────────────

function printMeetingsList(db: Database, ids: string[]): void {
  if (ids.length === 0) { console.log("No meetings found."); return; }
  const header = ["ID".padEnd(10), "Title".padEnd(40), "Date".padEnd(12), "Client".padEnd(16), "Conf"].join("  ");
  console.log("\n" + header);
  console.log("─".repeat(header.length));
  for (const id of ids) {
    const mtg = getMeeting(db, id);
    const cd  = db.prepare(
      "SELECT client_name, confidence FROM client_detections WHERE meeting_id = ? ORDER BY confidence DESC LIMIT 1",
    ).get(id) as { client_name: string; confidence: number } | undefined;
    console.log([
      id.slice(0, 8).padEnd(10),
      (mtg.title.length > 38 ? mtg.title.slice(0, 37) + "…" : mtg.title).padEnd(40),
      mtg.date.slice(0, 10).padEnd(12),
      (cd?.client_name ?? "").padEnd(16),
      cd ? cd.confidence.toFixed(2) : "",
    ].join("  "));
  }
  console.log();
}

function printSummary(db: Database, ids: string[]): void {
  if (ids.length === 0) { console.log("No meetings found."); return; }
  for (const id of ids) {
    const mtg = getMeeting(db, id);
    const art = getArtifact(db, id);
    const client = clientForMeeting(db, id);
    console.log(meetingHeader(mtg.title, mtg.date, client));
    if (!art) { console.log("\n  (no artifact extracted)\n"); continue; }

    const decisions = parseDecisions(art.decisions ?? "[]");
    const actions   = JSON.parse(art.action_items ?? "[]") as ActionItem[];
    const questions = JSON.parse(art.open_questions ?? "[]") as string[];
    const risks     = JSON.parse(art.risk_items ?? "[]") as string[];
    const features  = JSON.parse(art.proposed_features ?? "[]") as string[];
    const topics    = JSON.parse(art.architecture ?? "[]") as string[];

    console.log("\nSUMMARY");
    console.log(`  ${art.summary}`);

    if (decisions.length)  { console.log("\nDECISIONS");        decisions.forEach(d => console.log(`  • ${d.text}${d.decided_by ? ` (${d.decided_by})` : ""}`)); }
    if (features.length)   { console.log("\nPROPOSED FEATURES"); features.forEach(f => console.log(`  • ${f}`)); }
    if (actions.length)    { console.log("\nACTION ITEMS");      actions.forEach(a => console.log(`  • [${a.owner || "?"}] ${a.description}${a.due_date ? `  (due: ${a.due_date})` : ""}`)); }
    if (topics.length)     { console.log("\nARCHITECTURE"); console.log(`  ${topics.join(", ")}`); }
    if (questions.length)  { console.log("\nOPEN QUESTIONS");    questions.forEach(q => console.log(`  • ${q}`)); }
    if (risks.length)      { console.log("\nRISKS");             risks.forEach(r => console.log(`  • ${r}`)); }
    console.log();
  }
}

function printField(db: Database, ids: string[], type: string): void {
  if (ids.length === 0) { console.log("No meetings found."); return; }
  for (const id of ids) {
    const mtg = getMeeting(db, id);
    const art = getArtifact(db, id);
    const client = clientForMeeting(db, id);
    if (!art) continue;

    let items: string[] = [];
    if (type === "decisions")  items = parseDecisions(art.decisions ?? "[]").map(d => d.text);
    if (type === "features")   items = JSON.parse(art.proposed_features ?? "[]") as string[];
    if (type === "questions")  items = JSON.parse(art.open_questions ?? "[]") as string[];
    if (type === "risks")      items = JSON.parse(art.risk_items ?? "[]") as string[];
    if (type === "actions") {
      items = (JSON.parse(art.action_items ?? "[]") as ActionItem[])
        .map(a => `[${a.owner || "?"}] ${a.description}${a.due_date ? `  (due: ${a.due_date})` : ""}`);
    }
    if (items.length === 0) continue;

    console.log(meetingHeader(mtg.title, mtg.date, client));
    items.forEach(i => console.log(`  • ${i}`));
    console.log();
  }
}

function printNotes(db: Database, ids: string[]): void {
  if (ids.length === 0) { console.log("No meetings found."); return; }
  for (const id of ids) {
    const mtg = getMeeting(db, id);
    const art = getArtifact(db, id);
    if (!art) continue;
    const notes = JSON.parse(art.additional_notes ?? "[]") as Array<Record<string, unknown>>;
    if (notes.length === 0) continue;
    console.log(meetingHeader(mtg.title, mtg.date, clientForMeeting(db, id)));
    console.log(renderNotesGroups(notes));
    console.log();
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const db = createDb(DB_PATH);

if (listType) {
  const ids = resolveMeetingIds(db, { client: clientFilter, meeting: meetingFilter, after: afterFilter, before: beforeFilter });
  if (listType === "meetings") {
    printMeetingsList(db, ids);
  } else if (listType === "summary") {
    printSummary(db, ids);
  } else if (["decisions", "features", "actions", "questions", "risks"].includes(listType)) {
    printField(db, ids, listType);
  } else if (listType === "notes" || listType === "additional_notes") {
    printNotes(db, ids);
  } else {
    console.error(`Unknown list type: ${listType}`);
    console.error("Valid types: meetings, summary, decisions, features, actions, questions, risks, notes");
    process.exit(1);
  }
  process.exit(0);
}

if (!question && !searchMode) {
  console.error("Usage:");
  console.error("  pnpm query \"<question>\" [--client=X] [--after=YYYY-MM-DD] [--limit=N]");
  console.error("  pnpm query --search \"<topic>\" [--client=X] [--deepsearch]");
  console.error("  pnpm query --list <meetings|summary|decisions|actions|questions|risks|features>");
  console.error("             [--client=X] [--meeting=\"title\"] [--after=YYYY-MM-DD] [--before=YYYY-MM-DD]");
  process.exit(1);
}

process.stderr.write("Loading model... ");
const vdb = await connectVectorDb(VECTOR_PATH);
const session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");
process.stderr.write("ready.\n\n");

const searchQuery = question || args.find(a => !a.startsWith("-")) || "";

const results = await searchMeetings(vdb, session, searchQuery, {
  limit,
  client: clientFilter,
  date_after: afterFilter,
  date_before: beforeFilter,
}) as SearchResult[];

if (searchMode) {
  if (results.length === 0) { console.log("No results found."); process.exit(0); }

  if (deepSearchMode) {
    const llm = PROVIDER === "local"
      ? createLlmAdapter({ type: "local", baseUrl: LOCAL_BASE_URL, model: LOCAL_MODEL })
      : PROVIDER === "stub"
        ? createLlmAdapter({ type: "stub" })
        : createLlmAdapter({ type: "anthropic", apiKey: API_KEY! });

    const promptPath = "config/prompts/deep-search.md";
    const promptTemplate = existsSync(promptPath) ? readFileSync(promptPath, "utf8") : undefined;

    process.stderr.write(`Deep searching ${results.length} meetings...\n`);
    const deepResults = await deepSearch(llm, db, results.map(r => r.meeting_id), searchQuery, promptTemplate);
    if (deepResults.length === 0) { console.log("No relevant meetings found after deep search."); process.exit(0); }

    const sorted = deepResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    for (const dr of sorted) {
      const mtg = getMeeting(db, dr.meeting_id);
      const r = results.find(r => r.meeting_id === dr.meeting_id)!;
      const clientTag = r.client ? `  [${r.client}]` : "";
      console.log(`[${dr.relevanceScore}]  ${mtg.title}  (${r.date.slice(0, 10)})${clientTag}`);
      console.log(`        ${dr.relevanceSummary}`);
      console.log();
    }
    process.exit(0);
  }

  for (const r of results) {
    const mtg = getMeeting(db, r.meeting_id);
    const art = getArtifact(db, r.meeting_id);
    const clientTag = r.client ? `  [${r.client}]` : "";
    console.log(`[${r.score.toFixed(3)}]  ${mtg.title}  (${r.date.slice(0, 10)})${clientTag}`);
    if (art) {
      const excerpt = art.summary.slice(0, 200);
      console.log(`        ${excerpt}${art.summary.length > 200 ? "…" : ""}`);
    }
    console.log();
  }
  process.exit(0);
}

// Ask mode
if (PROVIDER === "anthropic" && (!API_KEY || API_KEY.startsWith("sk-ant-..."))) {
  console.error("Error: ANTHROPIC_API_KEY not set in .env.local");
  process.exit(1);
}

if (results.length === 0) {
  console.log("No relevant meetings found for that query.");
  process.exit(0);
}

const llm = PROVIDER === "local"
  ? createLlmAdapter({ type: "local", baseUrl: LOCAL_BASE_URL, model: LOCAL_MODEL })
  : PROVIDER === "stub"
    ? createLlmAdapter({ type: "stub" })
    : createLlmAdapter({ type: "anthropic", apiKey: API_KEY! });

const labeledContext = buildLabeledContext(db, results);
const systemPrompt = "You are a meeting assistant. Answer based only on the provided meeting notes. Be concise and specific. Cite the source meeting using its label (e.g. [M1], [M2]) when you draw on it. If the notes do not contain enough information to answer the question, say so clearly.";
const prompt = `${systemPrompt}\n\n${labeledContext}\n\nQuestion: ${question}`;

const llmResult = await llm.complete("synthesize_answer", prompt);
const answer = typeof llmResult.answer === "string" ? llmResult.answer : "(no response)";

const citedIndices = parseCitations(answer);
const sourceList = citedIndices.length > 0
  ? citedIndices
      .filter(i => i >= 1 && i <= results.length)
      .map(i => {
        const r = results[i - 1];
        return `${getMeeting(db, r.meeting_id).title} (${r.date.slice(0, 10)})`;
      })
      .join(", ")
  : results.map(r => `${getMeeting(db, r.meeting_id).title} (${r.date.slice(0, 10)})`).join(", ");

console.log(`\n${answer}\n`);
console.log(`Sources: ${sourceList}`);
