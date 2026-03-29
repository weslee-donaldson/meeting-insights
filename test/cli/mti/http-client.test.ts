import { describe, it, expect } from "vitest";
import { HttpClient, exitCodeForError } from "../../../cli/mti/src/http-client.ts";
import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnavailableError,
} from "../../../cli/mti/src/errors.ts";

function stubFetch(status: number, body: unknown, headers?: Record<string, string>) {
  return async (_url: string | URL | Request, _init?: RequestInit) => {
    const responseHeaders = new Headers(headers);
    if (status === 204) {
      return new Response(null, { status, headers: responseHeaders });
    }
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json", ...headers },
    });
  };
}

describe("HttpClient", () => {
  describe("auth header", () => {
    it("sends bearer token when token is configured", async () => {
      let capturedInit: RequestInit | undefined;
      const fetch = async (_url: string | URL | Request, init?: RequestInit) => {
        capturedInit = init;
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      };
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: "my-secret-token",
        fetch,
      });

      await client.get("/api/test");

      expect((capturedInit!.headers as Record<string, string>)["Authorization"]).toBe(
        "Bearer my-secret-token"
      );
    });

    it("omits authorization header when token is null", async () => {
      let capturedInit: RequestInit | undefined;
      const fetch = async (_url: string | URL | Request, init?: RequestInit) => {
        capturedInit = init;
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      };
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch,
      });

      await client.get("/api/test");

      expect(
        (capturedInit!.headers as Record<string, string>)["Authorization"]
      ).toBeUndefined();
    });
  });

  describe("base URL joining", () => {
    it("joins path to base URL", async () => {
      let capturedUrl: string | URL | Request | undefined;
      const fetch = async (url: string | URL | Request, _init?: RequestInit) => {
        capturedUrl = url;
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      };
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch,
      });

      await client.get("/api/meetings");

      expect(capturedUrl).toBe("http://localhost:3000/api/meetings");
    });

    it("appends query params to the URL", async () => {
      let capturedUrl: string | URL | Request | undefined;
      const fetch = async (url: string | URL | Request, _init?: RequestInit) => {
        capturedUrl = url;
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      };
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch,
      });

      await client.get("/api/meetings", { client: "Acme", after: "2026-01-01" });

      expect(capturedUrl).toBe(
        "http://localhost:3000/api/meetings?client=Acme&after=2026-01-01"
      );
    });
  });

  describe("HTTP methods", () => {
    it("sends GET request and returns parsed JSON", async () => {
      const data = { id: "m1", title: "Standup" };
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch: stubFetch(200, data),
      });

      const result = await client.get("/api/meetings/m1");

      expect(result).toEqual({ id: "m1", title: "Standup" });
    });

    it("sends POST request with JSON body", async () => {
      let capturedInit: RequestInit | undefined;
      const fetch = async (_url: string | URL | Request, init?: RequestInit) => {
        capturedInit = init;
        return new Response(JSON.stringify({ id: "n1" }), {
          status: 201,
          headers: { "content-type": "application/json" },
        });
      };
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch,
      });

      const result = await client.post("/api/notes", { text: "hello" });

      expect(capturedInit!.method).toBe("POST");
      expect(capturedInit!.body).toBe(JSON.stringify({ text: "hello" }));
      expect((capturedInit!.headers as Record<string, string>)["Content-Type"]).toBe(
        "application/json"
      );
      expect(result).toEqual({ id: "n1" });
    });

    it("sends PUT request with JSON body", async () => {
      let capturedMethod: string | undefined;
      const fetch = async (_url: string | URL | Request, init?: RequestInit) => {
        capturedMethod = init?.method;
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      };
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch,
      });

      const result = await client.put("/api/items/i1", { done: true });

      expect(capturedMethod).toBe("PUT");
      expect(result).toEqual({ ok: true });
    });

    it("sends PATCH request with JSON body", async () => {
      let capturedMethod: string | undefined;
      const fetch = async (_url: string | URL | Request, init?: RequestInit) => {
        capturedMethod = init?.method;
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      };
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch,
      });

      const result = await client.patch("/api/meetings/m1", { title: "New" });

      expect(capturedMethod).toBe("PATCH");
      expect(result).toEqual({ ok: true });
    });

    it("sends DELETE request with JSON body", async () => {
      let capturedMethod: string | undefined;
      let capturedBody: string | undefined;
      const fetch = async (_url: string | URL | Request, init?: RequestInit) => {
        capturedMethod = init?.method;
        capturedBody = init?.body as string;
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      };
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch,
      });

      const result = await client.delete("/api/meetings/m1", { confirm: true });

      expect(capturedMethod).toBe("DELETE");
      expect(capturedBody).toBe(JSON.stringify({ confirm: true }));
      expect(result).toEqual({ ok: true });
    });

    it("returns null for 204 No Content responses", async () => {
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch: stubFetch(204, null),
      });

      const result = await client.delete("/api/meetings/m1");

      expect(result).toBeNull();
    });
  });

  describe("error handling", () => {
    it("throws AuthError when server responds with 401", async () => {
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: "expired-token",
        fetch: stubFetch(401, { error: "Unauthorized" }),
      });

      await expect(client.get("/api/meetings")).rejects.toThrow(AuthError);
      await expect(client.get("/api/meetings")).rejects.toThrow(
        "Token invalid or expired. Run `mti config set token <token>` to update."
      );
    });

    it("throws ForbiddenError when server responds with 403", async () => {
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: "valid-token",
        fetch: stubFetch(403, { error: "Forbidden" }),
      });

      await expect(client.get("/api/meetings/m1")).rejects.toThrow(ForbiddenError);
      await expect(client.get("/api/meetings/m1")).rejects.toThrow(
        "You don't have access to this resource."
      );
    });

    it("throws NotFoundError when server responds with 404", async () => {
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch: stubFetch(404, { error: "Not found" }),
      });

      await expect(client.get("/api/meetings/nonexistent")).rejects.toThrow(
        NotFoundError
      );
      await expect(client.get("/api/meetings/nonexistent")).rejects.toThrow(
        "Resource not found."
      );
    });

    it("throws ServerError with server message when server responds with 500", async () => {
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch: stubFetch(500, { error: "Database connection failed" }),
      });

      await expect(client.get("/api/meetings")).rejects.toThrow(ServerError);
      await expect(client.get("/api/meetings")).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("throws UnavailableError when server responds with 503", async () => {
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch: stubFetch(503, { error: "Service unavailable" }),
      });

      await expect(client.get("/api/meetings")).rejects.toThrow(UnavailableError);
      await expect(client.get("/api/meetings")).rejects.toThrow(
        "This feature is temporarily unavailable."
      );
    });

    it("throws ServerError for unexpected non-2xx status codes", async () => {
      const client = new HttpClient({
        baseUrl: "http://localhost:3000",
        token: null,
        fetch: stubFetch(502, { error: "Bad gateway" }),
      });

      await expect(client.get("/api/meetings")).rejects.toThrow(ServerError);
      await expect(client.get("/api/meetings")).rejects.toThrow("Bad gateway");
    });
  });

  describe("exitCodeForError", () => {
    it("returns 1 for AuthError", () => {
      expect(exitCodeForError(new AuthError())).toBe(1);
    });

    it("returns 1 for ForbiddenError", () => {
      expect(exitCodeForError(new ForbiddenError())).toBe(1);
    });

    it("returns 1 for NotFoundError", () => {
      expect(exitCodeForError(new NotFoundError())).toBe(1);
    });

    it("returns 2 for ServerError", () => {
      expect(exitCodeForError(new ServerError("oops"))).toBe(2);
    });

    it("returns 2 for UnavailableError", () => {
      expect(exitCodeForError(new UnavailableError())).toBe(2);
    });
  });
});
