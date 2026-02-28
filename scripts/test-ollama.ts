process.loadEnvFile?.(".env.local");

const BASE_URL = process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434";
const MODEL    = process.env.MTNINSIGHTS_LOCAL_MODEL    ?? "llama3.1:8b";

// ── 1. Check server reachability ─────────────────────────────────────────────

process.stdout.write(`Checking Ollama at ${BASE_URL} ... `);
let tagsRes: Response;
try {
  tagsRes = await fetch(`${BASE_URL}/api/tags`);
} catch (err) {
  console.error(`FAIL\n  Cannot connect: ${(err as Error).message}`);
  process.exit(1);
}
if (!tagsRes.ok) {
  console.error(`FAIL\n  HTTP ${tagsRes.status}`);
  process.exit(1);
}
const tags = await tagsRes.json() as { models: Array<{ name: string }> };
console.log("OK");

// ── 2. Confirm model is loaded ────────────────────────────────────────────────

const modelNames = tags.models.map(m => m.name);
const present = modelNames.some(n => n === MODEL || n.startsWith(MODEL + ":"));
console.log(`\nAvailable models:`);
for (const n of modelNames) console.log(`  ${n === MODEL || n.startsWith(MODEL + ":") ? "✓" : " "} ${n}`);
if (!present) {
  console.error(`\nModel "${MODEL}" not found. Run: ollama pull ${MODEL}`);
  process.exit(1);
}

// ── 3. Test inference ─────────────────────────────────────────────────────────

console.log(`\nSending test prompt to "${MODEL}" ...`);
const start = Date.now();
let chatRes: Response;
try {
  chatRes = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: "Reply with only the JSON object: {\"status\": \"ok\", \"model\": \"working\"}" }],
      stream: false,
    }),
  });
} catch (err) {
  console.error(`  Inference failed: ${(err as Error).message}`);
  process.exit(1);
}

if (!chatRes.ok) {
  console.error(`  HTTP ${chatRes.status}`);
  process.exit(1);
}

const body = await chatRes.json() as { message?: { content?: string } };
const content = body.message?.content ?? "(empty)";
const latency = Date.now() - start;

console.log(`  Latency: ${latency}ms`);
console.log(`  Response: ${content.slice(0, 300)}`);
console.log(`\n✓ Ollama local LLM is working`);
