import { test, expect, type Page } from "@playwright/test";
import { selectClient } from "./helpers.js";

const API = "http://localhost:3000";

test.use({ viewport: { width: 1400, height: 900 } });

async function createNoteViaAPI(objectType: string, objectId: string, title: string | null, body: string) {
  const res = await fetch(`${API}/api/notes/${objectType}/${objectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body }),
  });
  return res.json() as Promise<{ id: string }>;
}

async function deleteNoteViaAPI(id: string) {
  await fetch(`${API}/api/notes/${id}`, { method: "DELETE" });
}

async function listNotesViaAPI(objectType: string, objectId: string) {
  const res = await fetch(`${API}/api/notes/${objectType}/${objectId}`);
  return res.json() as Promise<Array<{ id: string; title: string | null; body: string }>>;
}

async function countNotesViaAPI(objectType: string, objectId: string) {
  const res = await fetch(`${API}/api/notes/${objectType}/${objectId}/count`);
  const data = await res.json() as { count: number };
  return data.count;
}

async function getFirstMeetingId(client: string): Promise<string> {
  const res = await fetch(`${API}/api/meetings?client=${encodeURIComponent(client)}`);
  const meetings = await res.json() as Array<{ id: string }>;
  return meetings[0].id;
}

async function cleanupNotes(objectType: string, objectId: string) {
  const notes = await listNotesViaAPI(objectType, objectId);
  for (const n of notes) {
    await deleteNoteViaAPI(n.id);
  }
}

test.describe("Meeting Notes E2E", () => {
  const CLIENT = "LLSA";
  let meetingId: string;

  test.beforeAll(async () => {
    meetingId = await getFirstMeetingId(CLIENT);
  });

  test.beforeEach(async ({ page }) => {
    await cleanupNotes("meeting", meetingId);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    await cleanupNotes("meeting", meetingId);
  });

  test("Notes button is visible in CommandBar when meeting is selected", async ({ page }) => {
    await selectClient(page, CLIENT);
    const firstRow = page.locator('[data-testid^="meeting-row-"]').first();
    await firstRow.waitFor({ state: "visible", timeout: 10_000 });
    await firstRow.click();
    await expect(page.getByRole("button", { name: "Notes", exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test("clicking Notes opens dialog with empty state", async ({ page }) => {
    await selectClient(page, CLIENT);
    const firstRow = page.locator('[data-testid^="meeting-row-"]').first();
    await firstRow.waitFor({ state: "visible", timeout: 10_000 });
    await firstRow.click();

    await page.getByText("Notes").first().click();
    await expect(page.getByTestId("notes-dialog")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId("notes-empty-state")).toBeVisible();
    await expect(page.getByText("No notes yet")).toBeVisible();
  });

  test("create note via dialog, note appears in list", async ({ page }) => {
    await selectClient(page, CLIENT);
    const firstRow = page.locator('[data-testid^="meeting-row-"]').first();
    await firstRow.waitFor({ state: "visible", timeout: 10_000 });
    await firstRow.click();

    await page.getByText("Notes").first().click();
    await expect(page.getByTestId("notes-dialog")).toBeVisible({ timeout: 5_000 });

    await page.getByTestId("new-note-button").click();
    await expect(page.getByTestId("notes-compose-form")).toBeVisible();

    await page.getByTestId("note-title-input").fill("E2E Test Note");

    const editor = page.getByTestId("rte-content");
    await editor.click();
    await page.keyboard.type("This is a test note body");

    await page.getByTestId("save-note-button").click();

    await expect(page.getByText("Note saved")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("E2E Test Note")).toBeVisible({ timeout: 5_000 });
  });

  test("edit note via three-dot menu updates note", async ({ page }) => {
    await createNoteViaAPI("meeting", meetingId, "Original Title", "<p>original body</p>");

    await selectClient(page, CLIENT);
    const firstRow = page.locator('[data-testid^="meeting-row-"]').first();
    await firstRow.waitFor({ state: "visible", timeout: 10_000 });
    await firstRow.click();

    await page.getByText("Notes").first().click();
    await expect(page.getByTestId("notes-dialog")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Original Title")).toBeVisible({ timeout: 5_000 });

    await page.getByLabel("Note actions").click();
    await page.getByTestId("note-action-menu").getByText("Edit").click();

    await expect(page.getByTestId("notes-compose-form")).toBeVisible();
    const titleInput = page.getByTestId("note-title-input");
    await titleInput.clear();
    await titleInput.fill("Updated Title");
    await page.getByTestId("save-note-button").click();

    await expect(page.getByText("Note updated")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Updated Title")).toBeVisible({ timeout: 5_000 });
  });

  test("delete note via three-dot menu with confirmation removes note", async ({ page }) => {
    await createNoteViaAPI("meeting", meetingId, "Delete Me", "<p>to be deleted</p>");

    await selectClient(page, CLIENT);
    const firstRow = page.locator('[data-testid^="meeting-row-"]').first();
    await firstRow.waitFor({ state: "visible", timeout: 10_000 });
    await firstRow.click();

    await page.getByText("Notes").first().click();
    await expect(page.getByTestId("notes-dialog")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Delete Me")).toBeVisible({ timeout: 5_000 });

    await page.getByLabel("Note actions").click();
    await page.getByTestId("note-action-menu").getByText("Delete").click();

    await expect(page.getByTestId("delete-confirmation")).toBeVisible();
    await page.getByTestId("delete-confirmation").getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Note deleted")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId("notes-empty-state")).toBeVisible({ timeout: 5_000 });

    const count = await countNotesViaAPI("meeting", meetingId);
    expect(count).toBe(0);
  });
});
