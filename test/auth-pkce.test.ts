import { describe, it, expect } from "vitest";
import {
  generateCodeVerifier,
  computeCodeChallenge,
  verifyCodeChallenge,
} from "../core/auth/pkce.js";

describe("generateCodeVerifier", () => {
  it("returns a 43-character base64url string", () => {
    const verifier = generateCodeVerifier();

    expect(verifier.length).toBe(43);
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("generates unique values on each call", () => {
    const a = generateCodeVerifier();
    const b = generateCodeVerifier();

    expect(a).not.toBe(b);
  });
});

describe("computeCodeChallenge", () => {
  it("returns a base64url-encoded SHA-256 hash of the verifier", () => {
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    const challenge = computeCodeChallenge(verifier);

    expect(challenge).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });
});

describe("verifyCodeChallenge", () => {
  it("returns true when the verifier matches the challenge", () => {
    const verifier = generateCodeVerifier();
    const challenge = computeCodeChallenge(verifier);

    expect(verifyCodeChallenge(verifier, challenge)).toBe(true);
  });

  it("returns false when the verifier does not match the challenge", () => {
    const verifier = generateCodeVerifier();
    const challenge = computeCodeChallenge(verifier);
    const wrongVerifier = generateCodeVerifier();

    expect(verifyCodeChallenge(wrongVerifier, challenge)).toBe(false);
  });
});
