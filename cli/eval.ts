import { readFileSync, mkdirSync, appendFileSync } from "node:fs";
import { createDb } from "../core/db.js";
import { connectVectorDb } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { searchMeetings } from "../core/vector-search.js";
import { getMeeting } from "../core/ingest.js";
import { getArtifact } from "../core/extractor.js";
import { renderNotesGroups, parseCitations } from "../core/display-helpers.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import type { DatabaseSync as Database } from "node:sqlite";

process.loadEnvFile?.(".env.local");

const DB_PATH      = process.env.MTNINSIGHTS_DB_PATH      ?? "db/mtninsights.db";
const VECTOR_PATH  = process.env.MTNINSIGHTS_VECTOR_PATH  ?? "db/lancedb";
const PROVIDER     = (process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic") as "anthropic" | "local" | "stub";
const API_KEY      = process.env.ANTHROPIC_API_KEY;
const LOCAL_BASE_URL = process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434";
const LOCAL_MODEL  = process.env.MTNINSIGHTS_LOCAL_MODEL  ?? "llama3.1:8b";
const QUESTIONS_PATH = process.env.MTNINSIGHTS_EVAL_QUESTIONS ?? "data/eval/questions.json";
const LIMIT        = parseInt(process.env.MTNINSIGHTS_EVAL_LIMIT ?? "6");

// ── Types ─────────────────────────────────────────────────────────────────────

interface EvalQuestion { question: string; client?: string; }
interface ActionItem  { description: string; owner: string; requester: string; due_date: string | null; }
interface Decision { text: string; decided_by: string }
interface SearchResult { meeting_id: string; score: number; client: string; meeting_type: string; date: string; }

function parseDecisions(json: string): Decision[] {
  const raw = JSON.parse(json) as unknown[];
  return raw.map((d) => (typeof d === "string" ? { text: d, decided_by: "" } : d as Decision));
}

// ── Context builder ───────────────────────────────────────────────────────────

function buildLabeledContext(db: Database, results: SearchResult[]): string {
  return results.map((r, i) => {
    const label = `[M${i + 1}]`;
    const mtg = getMeeting(db, r.meeting_id);
    const art = getArtifact(db, r.meeting_id);
    if (!art) return "";
    const decisions = parseDecisions(art.decisions);
    const actions   = JSON.parse(art.action_items) as ActionItem[];
    const questions = JSON.parse(art.open_questions) as string[];
    const risks     = JSON.parse(art.risk_items) as string[];
    const features  = JSON.parse(art.proposed_features) as string[];
    const topics    = JSON.parse(art.architecture) as string[];
    const notes = JSON.parse(art.additional_notes ?? "[]") as Array<Record<string, unknown>>;
    const notesText = renderNotesGroups(notes);
    const notesSection = notesText.length > 0
      ? `Notes:\n${notesText.length > 1000 ? notesText.slice(0, 1000) + "…" : notesText}`
      : "";
    return [
      `## ${label} ${mtg.title}  (${mtg.date.slice(0, 10)})`,
      `Summary: ${art.summary}`,
      decisions.length ? `Decisions: ${decisions.map(d => d.text).join(" | ")}` : "",
      actions.length   ? `Action items: ${actions.map(a => `${a.owner}: ${a.description}`).join(" | ")}` : "",
      questions.length ? `Open questions: ${questions.join(" | ")}` : "",
      risks.length     ? `Risks: ${risks.join(" | ")}` : "",
      features.length  ? `Proposed features: ${features.join(" | ")}` : "",
      topics.length    ? `Architecture: ${topics.join(", ")}` : "",
      notesSection,
    ].filter(Boolean).join("\n");
  }).filter(Boolean).join("\n\n---\n\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (PROVIDER === "anthropic" && (!API_KEY || API_KEY.startsWith("sk-ant-..."))) {
  console.error("Error: ANTHROPIC_API_KEY not set in .env.local");
  process.exit(1);
}

const questions = JSON.parse(readFileSync(QUESTIONS_PATH, "utf-8")) as EvalQuestion[];
console.log(`Loaded ${questions.length} eval questions from ${QUESTIONS_PATH}`);

process.stderr.write("Loading model... ");
const db  = createDb(DB_PATH);
const vdb = await connectVectorDb(VECTOR_PATH);
const session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");
process.stderr.write("ready.\n\n");

const llm = PROVIDER === "local"
  ? createLlmAdapter({ type: "local", baseUrl: LOCAL_BASE_URL, model: LOCAL_MODEL })
  : PROVIDER === "stub"
    ? createLlmAdapter({ type: "stub" })
    : createLlmAdapter({ type: "anthropic", apiKey: API_KEY! });

const modelLabel = PROVIDER === "local" ? LOCAL_MODEL : PROVIDER === "stub" ? "stub" : "claude-sonnet-4-6";

mkdirSync("data/eval", { recursive: true });
const timestamp = new Date().toISOString().replace(/:/g, "-");
const outPath = `data/eval/results-${PROVIDER}-${timestamp}.jsonl`;

for (let qi = 0; qi < questions.length; qi++) {
  const { question, client } = questions[qi];
  process.stdout.write(`[${qi + 1}/${questions.length}] ${question.slice(0, 60)}… `);

  const start = Date.now();
  const results = await searchMeetings(vdb, session, question, {
    limit: LIMIT,
    client,
  }) as SearchResult[];

  if (results.length === 0) {
    console.log("(no results)");
    appendFileSync(outPath, JSON.stringify({
      question, client, retrieved_meeting_ids: [], cited_ids: [],
      latency_ms: Date.now() - start, answer_length: 0, answer: "(no results)",
      provider: PROVIDER, model: modelLabel,
    }) + "\n");
    continue;
  }

  const labeledContext = buildLabeledContext(db, results);
  const systemPrompt = "You are a meeting assistant. Answer based only on the provided meeting notes. Be concise and specific. Cite the source meeting using its label (e.g. [M1], [M2]) when you draw on it. If the notes do not contain enough information to answer the question, say so clearly.";
  const prompt = `${systemPrompt}\n\n${labeledContext}\n\nQuestion: ${question}`;

  const llmResult = await llm.complete("synthesize_answer", prompt);
  const answer = typeof llmResult.answer === "string" ? llmResult.answer : "(no response)";
  const latency_ms = Date.now() - start;

  const citedIndices = parseCitations(answer);
  const cited_ids = citedIndices
    .filter(i => i >= 1 && i <= results.length)
    .map(i => results[i - 1].meeting_id);

  appendFileSync(outPath, JSON.stringify({
    question,
    client,
    retrieved_meeting_ids: results.map(r => r.meeting_id),
    cited_ids,
    latency_ms,
    answer_length: answer.length,
    answer,
    provider: PROVIDER,
    model: modelLabel,
  }) + "\n");

  console.log(`✓ (${latency_ms}ms, ${cited_ids.length}/${results.length} cited)`);
}

console.log(`\nResults written to ${outPath}`);
