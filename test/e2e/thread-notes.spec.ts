import { test, expect, type Page } from "@playwright/test";
import { selectClient } from "./helpers.js";

const API = "http://localhost:3000";

test.use({ viewport: { width: 1400, height: 900 } });

async function createThreadViaAPI(clientName: string, title: string) {
  const res = await fetch(`${API}/api/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_name: clientName, title, shorthand: "TST", description: "test", criteria_prompt: "test" }),
  });
  return res.json() as Promise<{ id: string }>;
}

async function deleteThreadViaAPI(id: string) {
  await fetch(`${API}/api/threads/${id}`, { method: "DELETE" });
}

async function listThreadsViaAPI(clientName: string) {
  const res = await fetch(`${API}/api/threads?client=${encodeURIComponent(clientName)}`);
  return res.json() as Promise<Array<{ id: string }>>;
}

async function createNoteViaAPI(objectType: string, objectId: string, title: string | null, body: string) {
  const res = await fetch(`${API}/api/notes/${objectType}/${objectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body }),
  });
  return res.json() as Promise<{ id: string }>;
}

async function countNotesViaAPI(objectType: string, objectId: string) {
  const res = await fetch(`${API}/api/notes/${objectType}/${objectId}/count`);
  const data = await res.json() as { count: number };
  return data.count;
}

async function cleanupAllTestThreads(clientName: string) {
  const threads = await listThreadsViaAPI(clientName);
  for (const t of threads) {
    await deleteThreadViaAPI(t.id);
  }
}

test.describe("Thread Notes E2E", () => {
  const CLIENT = "LLSA";

  test.beforeEach(async ({ page }) => {
    await cleanupAllTestThreads(CLIENT);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    await cleanupAllTestThreads(CLIENT);
  });

  test("Notes button visible in thread detail header, opens dialog with correct subtitle", async ({ page }) => {
    const thread = await createThreadViaAPI(CLIENT, "Notes Test Thread");

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await selectClient(page, CLIENT);
    await page.locator('[aria-label="Threads"]').click();

    await expect(page.getByText("Notes Test Thread")).toBeVisible({ timeout: 10_000 });
    await page.getByText("Notes Test Thread").click();

    const notesBtn = page.getByRole("button", { name: "Notes" });
    await expect(notesBtn).toBeVisible({ timeout: 5_000 });
    await notesBtn.click();

    await expect(page.getByTestId("notes-dialog")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId("notes-dialog").getByText("Thread")).toBeVisible();
  });

  test("create note on thread, verify via API", async ({ page }) => {
    const thread = await createThreadViaAPI(CLIENT, "Thread With Note");

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await selectClient(page, CLIENT);
    await page.locator('[aria-label="Threads"]').click();
    await page.getByText("Thread With Note").click();

    await page.getByRole("button", { name: "Notes" }).click();
    await expect(page.getByTestId("notes-dialog")).toBeVisible({ timeout: 5_000 });

    await page.getByTestId("new-note-button").click();
    await page.getByTestId("note-title-input").fill("Thread Note");
    const editor = page.getByTestId("rte-content");
    await editor.click();
    await page.keyboard.type("Thread note body");
    await page.getByTestId("save-note-button").click();

    await expect(page.getByText("Note saved")).toBeVisible({ timeout: 5_000 });

    const count = await countNotesViaAPI("thread", thread.id);
    expect(count).toBe(1);
  });

  test("cascade delete: deleting thread removes its notes", async ({ page }) => {
    const thread = await createThreadViaAPI(CLIENT, "Thread To Delete");
    await createNoteViaAPI("thread", thread.id, "Cascade Test", "<p>should be deleted</p>");

    expect(await countNotesViaAPI("thread", thread.id)).toBe(1);

    await deleteThreadViaAPI(thread.id);

    expect(await countNotesViaAPI("thread", thread.id)).toBe(0);
  });
});
