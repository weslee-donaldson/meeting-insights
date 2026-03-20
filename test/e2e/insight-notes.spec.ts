import { test, expect, type Page } from "@playwright/test";

const API = "http://localhost:3000";

test.use({ viewport: { width: 1400, height: 900 } });

async function selectClient(page: Page, clientName: string) {
  const trigger = page.locator('[aria-label="Client"]');
  await trigger.click();
  await page.locator('[role="option"]').filter({ hasText: clientName }).click();
  await expect(trigger).toContainText(clientName);
}

async function createInsightViaAPI(clientName: string, periodType: string, periodStart: string, periodEnd: string) {
  const res = await fetch(`${API}/api/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_name: clientName, period_type: periodType, period_start: periodStart, period_end: periodEnd }),
  });
  return res.json() as Promise<{ id: string }>;
}

async function deleteInsightViaAPI(id: string) {
  await fetch(`${API}/api/insights/${id}`, { method: "DELETE" });
}

async function listInsightsViaAPI(clientName: string) {
  const res = await fetch(`${API}/api/insights?client=${encodeURIComponent(clientName)}`);
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

async function cleanupAllTestInsights(clientName: string) {
  const insights = await listInsightsViaAPI(clientName);
  for (const i of insights) {
    await deleteInsightViaAPI(i.id);
  }
}

test.describe("Insight Notes E2E", () => {
  const CLIENT = "LLSA";

  test.beforeEach(async ({ page }) => {
    await cleanupAllTestInsights(CLIENT);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    await cleanupAllTestInsights(CLIENT);
  });

  test("Notes button visible in insight detail, opens dialog with Insight subtitle", async ({ page }) => {
    const insight = await createInsightViaAPI(CLIENT, "week", "2026-03-02", "2026-03-08");

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await selectClient(page, CLIENT);
    await page.locator('[aria-label="Insights"]').click();

    const insightRow = page.locator('button:not([aria-label="New Insight"])').first();
    await insightRow.waitFor({ state: "visible", timeout: 10_000 });
    await insightRow.click();

    await expect(page.getByTestId("insight-detail-view")).toBeVisible({ timeout: 10_000 });

    const notesBtn = page.getByRole("button", { name: /Notes/ });
    await expect(notesBtn).toBeVisible({ timeout: 5_000 });
    await notesBtn.click();

    await expect(page.getByTestId("notes-dialog")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Insight", { exact: false })).toBeVisible();
  });

  test("create note with rich text on insight, verify body persists on re-open", async ({ page }) => {
    const insight = await createInsightViaAPI(CLIENT, "week", "2026-03-02", "2026-03-08");

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await selectClient(page, CLIENT);
    await page.locator('[aria-label="Insights"]').click();

    const insightRow = page.locator('button:not([aria-label="New Insight"])').first();
    await insightRow.waitFor({ state: "visible", timeout: 10_000 });
    await insightRow.click();
    await expect(page.getByTestId("insight-detail-view")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: /Notes/ }).click();
    await expect(page.getByTestId("notes-dialog")).toBeVisible({ timeout: 5_000 });

    await page.getByTestId("new-note-button").click();
    await page.getByTestId("note-title-input").fill("Insight Rich Note");
    const editor = page.getByTestId("rte-content");
    await editor.click();
    await page.keyboard.type("Bold text here");
    await page.getByTestId("save-note-button").click();
    await expect(page.getByText("Note saved")).toBeVisible({ timeout: 5_000 });

    await expect(page.getByText("Insight Rich Note")).toBeVisible({ timeout: 5_000 });

    expect(await countNotesViaAPI("insight", insight.id)).toBe(1);
  });

  test("cascade delete: deleting insight removes its notes", async ({ page }) => {
    const insight = await createInsightViaAPI(CLIENT, "week", "2026-03-09", "2026-03-15");
    await createNoteViaAPI("insight", insight.id, "Cascade Test", "<p>should be deleted</p>");

    expect(await countNotesViaAPI("insight", insight.id)).toBe(1);

    await deleteInsightViaAPI(insight.id);

    expect(await countNotesViaAPI("insight", insight.id)).toBe(0);
  });
});
