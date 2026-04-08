export const API_BASE: string = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API_TOKEN: string | undefined = import.meta.env.VITE_API_TOKEN;

function authHeaders(): Record<string, string> {
  return API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {};
}

export async function fetchJson<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const headers = { ...authHeaders(), ...init?.headers };
  const hasHeaders = Object.keys(headers).length > 0;
  const r = init ? await fetch(url, { ...init, headers }) : hasHeaders ? await fetch(url, { headers }) : await fetch(url);
  if (!r.ok) {
    const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
    throw new Error(body.error);
  }
  if (r.status === 204) return undefined as T;
  return r.json() as Promise<T>;
}

export async function fetchJsonOrNull<T = unknown>(url: string, init?: RequestInit): Promise<T | null> {
  const headers = { ...authHeaders(), ...init?.headers };
  const hasHeaders = Object.keys(headers).length > 0;
  const r = init ? await fetch(url, { ...init, headers }) : hasHeaders ? await fetch(url, { headers }) : await fetch(url);
  if (r.status === 404) return null;
  if (!r.ok) {
    const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
    throw new Error(body.error);
  }
  if (r.status === 204) return null;
  return r.json() as Promise<T>;
}

export function jsonPost(url: string, body: unknown): Promise<unknown> {
  return fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function jsonPut(url: string, body: unknown): Promise<unknown> {
  return fetchJson(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function jsonPatch(url: string, body: unknown): Promise<unknown> {
  return fetchJson(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function jsonDelete(url: string): Promise<unknown> {
  return fetchJson(url, { method: "DELETE" });
}
