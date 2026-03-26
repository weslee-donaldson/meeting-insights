import { API_BASE, fetchJson, jsonPost, jsonPatch, jsonDelete } from "./base.js";

export const notesMethods = {
  notesList: (objectType: string, objectId: string) =>
    fetchJson(`${API_BASE}/api/notes/${objectType}/${objectId}`),

  notesCreate: (objectType: string, objectId: string, title: string | null, body: string, noteType?: string) =>
    jsonPost(`${API_BASE}/api/notes/${objectType}/${objectId}`, { title, body, noteType }),

  notesUpdate: (id: string, title?: string | null, body?: string) =>
    jsonPatch(`${API_BASE}/api/notes/${id}`, { title, body }),

  notesDelete: (id: string) =>
    jsonDelete(`${API_BASE}/api/notes/${id}`).then(() => undefined),

  notesCount: (objectType: string, objectId: string) =>
    fetchJson<{ count: number }>(`${API_BASE}/api/notes/${objectType}/${objectId}/count`)
      .then((r) => r.count),
};
