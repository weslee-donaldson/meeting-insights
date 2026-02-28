import { app, ipcMain, BrowserWindow } from "electron";
import { join } from "path";
import Database from "better-sqlite3";
import debug from "debug";
import "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
function createDb(path) {
  return new Database(path);
}
function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      title TEXT,
      meeting_type TEXT,
      date TEXT,
      participants TEXT,
      raw_transcript TEXT,
      source_filename TEXT UNIQUE,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS artifacts (
      meeting_id TEXT PRIMARY KEY,
      summary TEXT,
      decisions TEXT,
      proposed_features TEXT,
      action_items TEXT,
      technical_topics TEXT,
      open_questions TEXT,
      risk_items TEXT,
      needs_reextraction INTEGER DEFAULT 0,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id)
    );

    CREATE TABLE IF NOT EXISTS clients (
      name TEXT PRIMARY KEY,
      aliases TEXT,
      known_participants TEXT
    );

    CREATE TABLE IF NOT EXISTS client_detections (
      meeting_id TEXT,
      client_name TEXT,
      confidence REAL,
      method TEXT,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id),
      FOREIGN KEY (client_name) REFERENCES clients(name)
    );

    CREATE TABLE IF NOT EXISTS clusters (
      cluster_id TEXT PRIMARY KEY,
      generated_tags TEXT,
      centroid_snapshot TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS meeting_clusters (
      meeting_id TEXT,
      cluster_id TEXT,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id),
      FOREIGN KEY (cluster_id) REFERENCES clusters(cluster_id)
    );
  `);
  const cols = db.prepare("PRAGMA table_info(artifacts)").all();
  if (!cols.some((c) => c.name === "additional_notes")) {
    db.exec("ALTER TABLE artifacts ADD COLUMN additional_notes TEXT DEFAULT '[]'");
  }
}
const CHANNELS = {
  GET_CLIENTS: "get-clients",
  GET_MEETINGS: "get-meetings",
  GET_ARTIFACT: "get-artifact",
  CHAT: "chat"
};
function createLogger(namespace) {
  return debug(`mtninsights:${namespace}`);
}
createLogger("extract:chunk");
createLogger("extract");
createLogger("extract:validate");
function getArtifact(db, meetingId) {
  return db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meetingId);
}
createLogger("ingest");
function getMeeting(db, meetingId) {
  return db.prepare("SELECT * FROM meetings WHERE id = ?").get(meetingId);
}
function parseArtifactRow(row) {
  return {
    summary: row.summary,
    decisions: JSON.parse(row.decisions ?? "[]"),
    proposed_features: JSON.parse(row.proposed_features ?? "[]"),
    action_items: JSON.parse(row.action_items ?? "[]"),
    technical_topics: JSON.parse(row.technical_topics ?? "[]"),
    open_questions: JSON.parse(row.open_questions ?? "[]"),
    risk_items: JSON.parse(row.risk_items ?? "[]"),
    additional_notes: JSON.parse(row.additional_notes ?? "[]")
  };
}
function artifactBlock(artifact) {
  const lines = [];
  if (artifact.summary) lines.push(`Summary: ${artifact.summary}`);
  if (artifact.decisions.length > 0)
    lines.push(`Decisions:
${artifact.decisions.map((d) => `- ${d}`).join("\n")}`);
  if (artifact.action_items.length > 0)
    lines.push(
      `Action Items:
${artifact.action_items.map((a) => `- ${a.description} (${a.owner}${a.due_date ? ", due " + a.due_date : ""})`).join("\n")}`
    );
  if (artifact.open_questions.length > 0)
    lines.push(
      `Open Questions:
${artifact.open_questions.map((q) => `- ${q}`).join("\n")}`
    );
  if (artifact.risk_items.length > 0)
    lines.push(`Risks:
${artifact.risk_items.map((r) => `- ${r}`).join("\n")}`);
  if (artifact.proposed_features.length > 0)
    lines.push(
      `Proposed Features:
${artifact.proposed_features.map((f) => `- ${f}`).join("\n")}`
    );
  if (artifact.technical_topics.length > 0)
    lines.push(
      `Technical Topics:
${artifact.technical_topics.map((t) => `- ${t}`).join("\n")}`
    );
  return lines.join("\n");
}
function buildLabeledContext(db, meetingIds) {
  const rows = meetingIds.map((id) => {
    const mtg = getMeeting(db, id);
    const art = getArtifact(db, id);
    if (!mtg || !art) return null;
    return { mtg, art };
  }).filter((r) => r !== null).sort((a, b) => b.mtg.date.localeCompare(a.mtg.date));
  const meetings = [];
  const blocks = [];
  for (let i = 0; i < rows.length; i++) {
    const { mtg, art } = rows[i];
    const label = `[M${i + 1}]`;
    const artifact = parseArtifactRow(art);
    const body = artifactBlock(artifact);
    blocks.push(
      `${label} ${mtg.title} — ${mtg.date.slice(0, 10)}
${body}`
    );
    meetings.push({ id: mtg.id, title: mtg.title, date: mtg.date });
  }
  const contextText = blocks.join("\n\n---\n\n");
  return { contextText, charCount: contextText.length, meetings };
}
function parseCitations(text) {
  const matches = text.matchAll(/\[M(\d+)\]/g);
  const indices = /* @__PURE__ */ new Set();
  for (const m of matches) indices.add(parseInt(m[1], 10));
  return [...indices].sort((a, b) => a - b);
}
function handleGetClients(db) {
  const rows = db.prepare("SELECT name FROM clients ORDER BY name").all();
  return rows.map((r) => r.name);
}
function normalizeSeries(title) {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}
function topClientForMeeting(db, meetingId) {
  const row = db.prepare(
    "SELECT client_name FROM client_detections WHERE meeting_id = ? ORDER BY confidence DESC LIMIT 1"
  ).get(meetingId);
  return row?.client_name ?? "";
}
function handleGetMeetings(db, opts) {
  let rows = db.prepare("SELECT id, title, date FROM meetings ORDER BY date DESC").all();
  if (opts.after) rows = rows.filter((r) => r.date >= opts.after);
  if (opts.before)
    rows = rows.filter((r) => r.date <= opts.before + "T23:59:59Z");
  if (opts.client) {
    const clientIds = new Set(
      db.prepare(
        "SELECT meeting_id FROM client_detections WHERE client_name = ?"
      ).all(opts.client).map((r) => r.meeting_id)
    );
    rows = rows.filter((r) => clientIds.has(r.id));
  }
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    date: r.date,
    client: topClientForMeeting(db, r.id),
    series: normalizeSeries(r.title)
  }));
}
function handleGetArtifact(db, meetingId) {
  const row = getArtifact(db, meetingId);
  if (!row) return null;
  return {
    summary: row.summary,
    decisions: JSON.parse(row.decisions ?? "[]"),
    proposed_features: JSON.parse(row.proposed_features ?? "[]"),
    action_items: JSON.parse(row.action_items ?? "[]"),
    technical_topics: JSON.parse(row.technical_topics ?? "[]"),
    open_questions: JSON.parse(row.open_questions ?? "[]"),
    risk_items: JSON.parse(row.risk_items ?? "[]"),
    additional_notes: JSON.parse(row.additional_notes ?? "[]")
  };
}
const SYSTEM_PROMPT = `You are a meeting intelligence assistant. Answer the user's question using ONLY the provided meeting context.
Cite specific meetings using their labels [M1], [M2], etc. when referencing information.
If the answer cannot be found in the context, say so clearly.`;
async function handleChat(db, llm, req) {
  const { contextText, charCount, meetings } = buildLabeledContext(
    db,
    req.meetingIds
  );
  const prompt = `${SYSTEM_PROMPT}

Meeting Context:
${contextText}

Question: ${req.question}`;
  const result = await llm.complete("synthesize_answer", prompt);
  const answer = result.answer ?? String(result);
  const citations = parseCitations(answer);
  const sources = citations.length > 0 ? citations.map((i) => meetings[i - 1]?.title ?? "").filter(Boolean) : meetings.map((m) => m.title);
  return { answer, sources, charCount };
}
const logLlm = createLogger("llm");
const STUB_FIXTURES = {
  extract_artifact: {
    summary: "Stub summary of the meeting.",
    decisions: ["Decision A", "Decision B"],
    proposed_features: ["Feature X", "Feature Y"],
    action_items: [{ description: "Follow up", owner: "Wesley", due_date: null }],
    technical_topics: ["API design", "database schema"],
    open_questions: ["What is the timeline?"],
    risk_items: ["Scope creep risk"],
    additional_notes: [{ category: "Context", notes: ["Stub note about constraints and tradeoffs."] }]
  },
  cluster_tags: {
    tags: ["API integration", "client onboarding", "feature planning", "roadmap review"]
  },
  generate_task: {
    title: "Implement Feature X",
    description: "Based on meeting discussion, implement Feature X with the agreed approach.",
    acceptance_criteria: ["Feature X passes all unit tests", "Feature X is documented"]
  },
  synthesize_answer: {
    answer: "Stub answer based on meeting context."
  }
};
function parseJsonOrThrow(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`[json_parse] Response was not valid JSON: ${text.slice(0, 200)}`);
  }
}
const REPAIR_PREFIX = "The previous response was not valid JSON. Return only a valid JSON object with no prose.\n\nOriginal request:\n";
async function withRepair(call, content) {
  try {
    return await call(content);
  } catch (err) {
    if (!(err instanceof Error) || !err.message.startsWith("[json_parse]")) throw err;
    const firstRaw = err.message.slice("[json_parse] Response was not valid JSON: ".length);
    try {
      return await call(REPAIR_PREFIX + content);
    } catch {
      return { __fallback: true, raw_text: firstRaw.slice(0, 500) };
    }
  }
}
function createLlmAdapter(config) {
  if (config.type === "stub") {
    return {
      async complete(capability) {
        const start = Date.now();
        const result = STUB_FIXTURES[capability];
        logLlm("provider=stub capability=%s model=stub latency_ms=%d tokens=0", capability, Date.now() - start);
        return result;
      }
    };
  }
  if (config.type === "local") {
    const { baseUrl, model: model2 } = config;
    const localCall = async (capability, content) => {
      const start = Date.now();
      let res;
      try {
        res = await fetch(`${baseUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: model2, messages: [{ role: "user", content }], stream: false })
        });
      } catch (err) {
        throw new Error(`[api_error] Ollama unreachable: ${String(err)}`);
      }
      if (res.status === 429) throw new Error(`[rate_limit] Ollama rate limit (429)`);
      if (res.status >= 500) throw new Error(`[api_error] Ollama server error (${res.status})`);
      const json = await res.json();
      const text = json.message?.content ?? "";
      logLlm("provider=local capability=%s model=%s latency_ms=%d tokens=%d", capability, model2, Date.now() - start, text.length);
      if (capability === "synthesize_answer") return { answer: text };
      return parseJsonOrThrow(text);
    };
    return {
      async complete(capability, content) {
        return withRepair((c) => localCall(capability, c), content);
      }
    };
  }
  const client = new Anthropic({ apiKey: config.apiKey });
  const model = config.model ?? "claude-sonnet-4-6";
  const anthropicCall = async (capability, content) => {
    const start = Date.now();
    let text;
    try {
      const message = await client.messages.create({
        model,
        max_tokens: 2048,
        messages: [{ role: "user", content }]
      });
      text = message.content[0].type === "text" ? message.content[0].text : "";
      logLlm("provider=anthropic capability=%s model=%s latency_ms=%d tokens=%d", capability, model, Date.now() - start, message.usage.output_tokens);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("[")) throw err;
      if (err instanceof Anthropic.RateLimitError) throw new Error(`[rate_limit] ${err.message}`);
      if (err instanceof Anthropic.APIError) throw new Error(`[api_error] ${err.message}`);
      throw new Error(`[api_error] ${String(err)}`);
    }
    if (capability === "synthesize_answer") return { answer: text };
    return parseJsonOrThrow(text);
  };
  return {
    async complete(capability, content) {
      return withRepair((c) => anthropicCall(capability, c), content);
    }
  };
}
process.loadEnvFile?.(".env.local");
const DB_PATH = process.env.MTNINSIGHTS_DB_PATH ?? "db/mtninsights.db";
const PROVIDER = process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic";
const API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const LOCAL_BASE_URL = process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434";
const LOCAL_MODEL = process.env.MTNINSIGHTS_LOCAL_MODEL ?? "llama3.1:8b";
const isDev = process.env.NODE_ENV === "development" || !!process.env["ELECTRON_RENDERER_URL"];
function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0f0f0f",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}
app.whenReady().then(() => {
  const db = createDb(DB_PATH);
  migrate(db);
  const llmConfig = PROVIDER === "local" ? { type: "local", baseUrl: LOCAL_BASE_URL, model: LOCAL_MODEL } : PROVIDER === "stub" ? { type: "stub" } : { type: "anthropic", apiKey: API_KEY };
  const llm = createLlmAdapter(llmConfig);
  ipcMain.handle(CHANNELS.GET_CLIENTS, () => handleGetClients(db));
  ipcMain.handle(
    CHANNELS.GET_MEETINGS,
    (_e, opts) => handleGetMeetings(db, opts)
  );
  ipcMain.handle(
    CHANNELS.GET_ARTIFACT,
    (_e, meetingId) => handleGetArtifact(db, meetingId)
  );
  ipcMain.handle(CHANNELS.CHAT, (_e, opts) => handleChat(db, llm, opts));
  createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
