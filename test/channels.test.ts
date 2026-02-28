import { describe, it, expect } from "vitest";
import { CHANNELS } from "../electron/channels.js";

describe("CHANNELS", () => {
  it("should have 4 unique non-empty channel strings", () => {
    const values = Object.values(CHANNELS);
    expect(values).toHaveLength(4);
    expect(new Set(values).size).toBe(4);
    for (const v of values) {
      expect(typeof v).toBe("string");
      expect(v.length).toBeGreaterThan(0);
    }
  });

  it("should define GET_CLIENTS channel", () => {
    expect(CHANNELS.GET_CLIENTS).toBe("get-clients");
  });

  it("should define GET_MEETINGS channel", () => {
    expect(CHANNELS.GET_MEETINGS).toBe("get-meetings");
  });

  it("should define GET_ARTIFACT channel", () => {
    expect(CHANNELS.GET_ARTIFACT).toBe("get-artifact");
  });

  it("should define CHAT channel", () => {
    expect(CHANNELS.CHAT).toBe("chat");
  });
});
