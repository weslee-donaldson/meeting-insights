export function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n\s*```$/);
  return match ? match[1].trim() : trimmed;
}

export function parseJsonOrThrow(text: string): Record<string, unknown> {
  try {
    return JSON.parse(stripCodeFences(text)) as Record<string, unknown>;
  } catch {
    throw new Error(`[json_parse] Response was not valid JSON: ${text.slice(0, 200)}`);
  }
}

export const REPAIR_PREFIX = "The previous response was not valid JSON. Return only a valid JSON object with no prose.\n\nOriginal request:\n";

export async function withRepair(
  call: (content: string) => Promise<Record<string, unknown>>,
  content: string,
): Promise<Record<string, unknown>> {
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
