import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import type { LlmAdapter, LlmCapability, ImageAttachment } from "./llm-adapter.js";
import { createLogger, logLlmCall } from "./logger.js";
import { parseJsonOrThrow, withRepair } from "./llm-helpers.js";

const logLlm = createLogger("llm");

function execFileAsync(bin: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  const env = { ...process.env };
  delete env["CLAUDECODE"];
  delete env["CLAUDE_CODE_ENTRYPOINT"];
  delete env["CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING"];
  return new Promise((resolve, reject) => {
    execFile(bin, args, { env }, (err, stdout, stderr) => {
      if (err) reject(Object.assign(err, { stderr }));
      else resolve({ stdout, stderr });
    });
  });
}

interface CliEnvelope {
  result: string;
  session_id: string;
}

function prefixHash(system: string, messages: Array<{ role: string; content: string }>): string {
  return createHash("sha256").update(system + JSON.stringify(messages)).digest("hex");
}

function appendImageRefs(prompt: string, attachments: ImageAttachment[]): string {
  const refs = attachments.map((a) => `[Attached image: ${a.name} (${a.mimeType})]`).join("\n");
  return `${prompt}\n\nIMPORTANT — The user has attached images.\n${refs}`;
}

async function runCli(bin: string, args: string[]): Promise<{ result: string; sessionId: string; durationMs: number }> {
  const start = Date.now();
  logLlm("runCli bin=%s args=%o", bin, args);
  const { stdout } = await execFileAsync(bin, args).catch((err: Error & { stderr?: string }) => {
    const msg = ((err.stderr ?? "") + err.message).toLowerCase();
    if (msg.includes("rate limit")) throw new Error(`[rate_limit] ${err.message}`);
    throw new Error(`[api_error] ${err.message}`);
  });
  const envelope = JSON.parse(stdout) as CliEnvelope;
  return { result: envelope.result, sessionId: envelope.session_id, durationMs: Date.now() - start };
}

export function createClaudecliAdapter(bin = "claude"): LlmAdapter {
  const sessionCache = new Map<string, string>();

  async function cliComplete(capability: LlmCapability, content: string, attachments?: ImageAttachment[]): Promise<Record<string, unknown>> {
    let prompt = content;
    if (attachments && attachments.length > 0) {
      prompt = appendImageRefs(prompt, attachments);
    }
    const { result, durationMs } = await runCli(bin, ["--print", "--output-format", "json", prompt]);
    const tokens = Math.ceil(result.length / 4);
    logLlm("provider=claudecli capability=%s latency_ms=%d tokens=%d", capability, durationMs, tokens);
    logLlmCall({ capability, provider: "claudecli", model: bin, latency_ms: durationMs, tokens, prompt: content, raw_response: result });
    if (capability === "synthesize_answer") return { answer: result };
    const parsed = parseJsonOrThrow(result);
    logLlmCall({ capability, provider: "claudecli", model: bin, parsed_result: parsed });
    return parsed;
  }

  return {
    async complete(capability, content, attachments?) {
      return withRepair((c) => cliComplete(capability, c, attachments), content);
    },

    async converse(system, messages, attachments?) {
      const lastMsg = messages[messages.length - 1];
      const priorMessages = messages.slice(0, -1);
      const cacheKey = prefixHash(system, priorMessages);
      const existingSessionId = messages.length > 1 ? sessionCache.get(cacheKey) : undefined;

      let args: string[];
      if (existingSessionId) {
        let prompt = lastMsg.content;
        if (attachments && attachments.length > 0) {
          prompt = appendImageRefs(prompt, attachments);
        }
        args = ["--print", "--output-format", "json", "--resume", existingSessionId, prompt];
      } else {
        const turns = messages.map((m) => `[${m.role === "user" ? "User" : "Assistant"}]: ${m.content}`).join("\n\n");
        let prompt = turns;
        if (attachments && attachments.length > 0) {
          prompt = appendImageRefs(prompt, attachments);
        }
        args = ["--print", "--output-format", "json", "--system-prompt", system, prompt];
      }

      const { result, sessionId, durationMs } = await runCli(bin, args);
      sessionCache.set(prefixHash(system, [...messages, { role: "assistant", content: result }]), sessionId);
      logLlm("provider=claudecli converse latency_ms=%d tokens=%d", durationMs, Math.ceil(result.length / 4));
      return result;
    },
  };
}
