import { test, expect, type Page } from "@playwright/test";

const API = "http://localhost:3000";

test.use({ viewport: { width: 1400, height: 900 } });

async function selectClient(page: Page, clientName: string) {
  const trigger = page.locator('[aria-label="Client"]');
  await trigger.click();
  await page.locator('[role="option"]').filter({ hasText: clientName }).click();
  await expect(trigger).toContainText(clientName);
}

async function createMilestoneViaAPI(clientName: string, title: string, targetDate?: string) {
  const res = await fetch(`${API}/api/milestones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_name: clientName, title, description: "", target_date: targetDate ?? null }),
  });
  return res.json() as Promise<{ id: string }>;
}

async function deleteMilestoneViaAPI(id: string) {
  await fetch(`${API}/api/milestones/${id}`, { method: "DELETE" });
}

async function listMilestonesViaAPI(clientName: string) {
  const res = await fetch(`${API}/api/milestones?client=${encodeURIComponent(clientName)}`);
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

async function listNotesViaAPI(objectType: string, objectId: string) {
  const res = await fetch(`${API}/api/notes/${objectType}/${objectId}`);
  return res.json() as Promise<Array<{ id: string }>>;
}

async function deleteNoteViaAPI(id: string) {
  await fetch(`${API}/api/notes/${id}`, { method: "DELETE" });
}

async function cleanupAllTestMilestones(clientName: string) {
  const milestones = await listMilestonesViaAPI(clientName);
  for (const m of milestones) {
    await deleteMilestoneViaAPI(m.id);
  }
}

test.describe("Milestone Notes E2E", () => {
  const CLIENT = "LLSA";

  test.beforeEach(async ({ page }) => {
    await cleanupAllTestMilestones(CLIENT);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    await cleanupAllTestMilestones(CLIENT);
  });

  test("Notes button visible in milestone detail, opens dialog with Milestone subtitle", async ({ page }) => {
    await createMilestoneViaAPI(CLIENT, "E2E Milestone", "2026-06-01");

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await selectClient(page, CLIENT);
    await page.locator('[aria-label="Timelines"]').click();

    await expect(page.getByText("E2E Milestone")).toBeVisible({ timeout: 10_000 });
    await page.getByText("E2E Milestone").click();

    const notesBtn = page.getByRole("button", { name: "Notes" });
    await expect(notesBtn).toBeVisible({ timeout: 5_000 });
    await notesBtn.click();

    await expect(page.getByTestId("notes-dialog")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Milestone", { exact: false })).toBeVisible();
  });

  test("create note on milestone, edit it, verify changes persist", async ({ page }) => {
    const ms = await createMilestoneViaAPI(CLIENT, "Notes Milestone", "2026-07-01");

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await selectClient(page, CLIENT);
    await page.locator('[aria-label="Timelines"]').click();
    await page.getByText("Notes Milestone").click();

    await page.getByRole("button", { name: "Notes" }).click();
    await expect(page.getByTestId("notes-dialog")).toBeVisible({ timeout: 5_000 });

    await page.getByTestId("new-note-button").click();
    await page.getByTestId("note-title-input").fill("Original Note");
    const editor = page.getByTestId("rte-content");
    await editor.click();
    await page.keyboard.type("Original body");
    await page.getByTestId("save-note-button").click();
    await expect(page.getByText("Note saved")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Original Note")).toBeVisible({ timeout: 5_000 });

    await page.getByLabel("Note actions").click();
    await page.getByTestId("note-action-menu").getByText("Edit").click();
    const titleInput = page.getByTestId("note-title-input");
    await titleInput.clear();
    await titleInput.fill("Edited Note");
    await page.getByTestId("save-note-button").click();
    await expect(page.getByText("Note updated")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Edited Note")).toBeVisible({ timeout: 5_000 });

    expect(await countNotesViaAPI("milestone", ms.id)).toBe(1);
  });

  test("cascade delete: deleting milestone removes its notes", async ({ page }) => {
    const ms = await createMilestoneViaAPI(CLIENT, "Cascade Milestone", "2026-08-01");
    await createNoteViaAPI("milestone", ms.id, "Cascade Test", "<p>should be deleted</p>");

    expect(await countNotesViaAPI("milestone", ms.id)).toBe(1);

    await deleteMilestoneViaAPI(ms.id);

    expect(await countNotesViaAPI("milestone", ms.id)).toBe(0);
  });
});
