import { describe, it, expect } from "vitest";
import { stripCodeFences, parseJsonOrThrow, withRepair, REPAIR_PREFIX } from "../core/llm/helpers.js";

describe("stripCodeFences", () => {
  it("returns plain JSON unchanged", () => {
    expect(stripCodeFences('{"a":1}')).toBe('{"a":1}');
  });

  it("strips ```json fences", () => {
    expect(stripCodeFences('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("strips bare ``` fences", () => {
    expect(stripCodeFences('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("trims whitespace around fenced content", () => {
    expect(stripCodeFences('  ```json\n  {"a":1}  \n  ```  ')).toBe('{"a":1}');
  });
});

describe("parseJsonOrThrow", () => {
  it("parses valid JSON", () => {
    expect(parseJsonOrThrow('{"key":"value"}')).toEqual({ key: "value" });
  });

  it("parses JSON inside code fences", () => {
    expect(parseJsonOrThrow('```json\n{"key":"value"}\n```')).toEqual({ key: "value" });
  });

  it("throws [json_parse] error for invalid JSON", () => {
    expect(() => parseJsonOrThrow("not json")).toThrow("[json_parse] Response was not valid JSON: not json");
  });

  it("truncates raw text to 200 chars in error message", () => {
    const longText = "x".repeat(300);
    expect(() => parseJsonOrThrow(longText)).toThrow(longText.slice(0, 200));
  });
});

describe("withRepair", () => {
  it("returns result on first success", async () => {
    const call = async (_content: string) => ({ ok: true });
    expect(await withRepair(call, "input")).toEqual({ ok: true });
  });

  it("retries with REPAIR_PREFIX on json_parse error", async () => {
    let callCount = 0;
    const call = async (content: string) => {
      callCount++;
      if (!content.startsWith(REPAIR_PREFIX)) {
        throw new Error("[json_parse] Response was not valid JSON: bad");
      }
      return { repaired: true };
    };
    expect(await withRepair(call, "input")).toEqual({ repaired: true });
    expect(callCount).toBe(2);
  });

  it("returns fallback when both attempts fail json_parse", async () => {
    const call = async (_content: string): Promise<Record<string, unknown>> => {
      throw new Error("[json_parse] Response was not valid JSON: rawdata");
    };
    expect(await withRepair(call, "input")).toEqual({ __fallback: true, raw_text: "rawdata" });
  });

  it("re-throws non-json_parse errors without retry", async () => {
    const call = async (_content: string): Promise<Record<string, unknown>> => {
      throw new Error("[rate_limit] Too many requests");
    };
    await expect(withRepair(call, "input")).rejects.toThrow("[rate_limit] Too many requests");
  });

  it("truncates raw_text in fallback to 500 chars", async () => {
    const longRaw = "z".repeat(600);
    const call = async (_content: string): Promise<Record<string, unknown>> => {
      throw new Error(`[json_parse] Response was not valid JSON: ${longRaw}`);
    };
    const result = await withRepair(call, "input");
    expect(result).toEqual({ __fallback: true, raw_text: longRaw.slice(0, 500) });
  });
});
