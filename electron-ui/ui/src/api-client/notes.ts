import { API_BASE } from "./base.js";

export const notesMethods = {
  notesList: (objectType: string, objectId: string) =>
    fetch(`${API_BASE}/api/notes/${objectType}/${objectId}`).then((r) => r.json()),

  notesCreate: (objectType: string, objectId: string, title: string | null, body: string) =>
    fetch(`${API_BASE}/api/notes/${objectType}/${objectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    }).then((r) => r.json()),

  notesUpdate: (id: string, title?: string | null, body?: string) =>
    fetch(`${API_BASE}/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    }).then((r) => r.json()),

  notesDelete: (id: string) =>
    fetch(`${API_BASE}/api/notes/${id}`, { method: "DELETE" }).then(() => undefined),

  notesCount: (objectType: string, objectId: string) =>
    fetch(`${API_BASE}/api/notes/${objectType}/${objectId}/count`)
      .then((r) => r.json())
      .then((r: { count: number }) => r.count),
};
