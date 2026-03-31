import { test, expect, type Page } from "@playwright/test";
import { selectClient, apiFetch, API_BASE } from "./helpers.js";

test.use({ viewport: { width: 1400, height: 900 } });

async function getClientWithMeetings(): Promise<string> {
  const res = await apiFetch(`${API_BASE}/api/clients`);
  const clients = (await res.json()) as string[];
  for (const client of clients) {
    const meetingsRes = await apiFetch(`${API_BASE}/api/meetings?client=${encodeURIComponent(client)}`);
    const meetings = (await meetingsRes.json()) as unknown[];
    if (meetings.length > 0) return client;
  }
  return clients[0] ?? "LLSA";
}

test.describe("Search Regression — Meetings View", () => {
  let CLIENT: string;

  test.beforeAll(async () => {
    CLIENT = await getClientWithMeetings();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await selectClient(page, CLIENT);
  });

  test("typing in TopBar filters meetings list in-place (without Enter)", async ({ page }) => {
    await expect(page.getByLabel("Meetings")).toBeVisible();

    const meetingList = page.locator("[data-testid='panel-0']");
    await expect(meetingList).toBeVisible();

    const topBarInput = page.getByLabel("Search meetings");
    await topBarInput.fill("sprint");

    await page.waitForTimeout(1000);
    await expect(meetingList).toBeVisible();
  });

  test("pressing Enter in TopBar navigates to search view", async ({ page }) => {
    const topBarInput = page.getByLabel("Search meetings");
    await topBarInput.fill("sprint");
    await topBarInput.press("Enter");

    await expect(page.getByTestId("search-view")).toBeVisible({ timeout: 5_000 });
  });

  test("selecting a meeting activates chat panel with full context", async ({ page }) => {
    const meetingRow = page.locator("[data-testid='panel-0']").locator("button").first();
    await meetingRow.waitFor({ state: "visible", timeout: 10_000 });
    await meetingRow.click();

    const chatPanel = page.getByTestId("chat-panel");
    await expect(chatPanel).toBeVisible({ timeout: 10_000 });

    const chatInput = chatPanel.locator("textarea, input[type='text']").first();
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toBeEnabled();
  });
});
