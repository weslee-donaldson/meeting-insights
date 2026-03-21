import { readFileSync, mkdirSync, appendFileSync } from "node:fs";
import { createDb } from "../core/db.js";
import { connectVectorDb } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { searchMeetings } from "../core/vector-search.js";
import { parseCitations } from "../core/display-helpers.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { loadCliConfig, buildSearchContext, type SearchResult } from "./shared.js";

const { dbPath: DB_PATH, vectorPath: VECTOR_PATH, provider: PROVIDER, apiKey: API_KEY, localBaseUrl: LOCAL_BASE_URL, localModel: LOCAL_MODEL } = loadCliConfig();
const QUESTIONS_PATH = process.env.MTNINSIGHTS_EVAL_QUESTIONS ?? "data/eval/questions.json";
const LIMIT        = parseInt(process.env.MTNINSIGHTS_EVAL_LIMIT ?? "6");

// ── Types (imported from cli/shared.ts) ───────────────────────────────────────

interface EvalQuestion { question: string; client?: string; }

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

  const labeledContext = buildSearchContext(db, results);
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
