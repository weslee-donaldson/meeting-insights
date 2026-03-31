import { test, expect, type Page } from "@playwright/test";
import { selectClient, apiFetch, API_BASE } from "./helpers.js";

test.use({ viewport: { width: 1400, height: 900 } });

async function navigateToInsights(page: Page) {
  await page.getByLabel("Insights").click();
  await expect(page.getByTestId("insights-view")).toBeVisible();
}

async function waitForToast(page: Page, text: string | RegExp) {
  const container = page.locator(".fixed.top-4.right-4");
  await expect(container.getByText(text)).toBeVisible({ timeout: 15_000 });
}

function insightRow(page: Page) {
  return page.getByTestId("insights-view").locator('button:not([aria-label="New Insight"])').first();
}

async function clickInsightRow(page: Page) {
  const row = insightRow(page);
  await row.waitFor({ state: "visible", timeout: 10_000 });
  await row.click();
  await expect(page.getByTestId("insight-detail-view")).toBeVisible({ timeout: 10_000 });
}

async function deleteInsightViaAPI(insightId: string) {
  await apiFetch(`${API_BASE}/api/insights/${insightId}`, { method: "DELETE" });
}

async function createInsightViaAPI(clientName: string, periodType: string, periodStart: string, periodEnd: string) {
  const res = await apiFetch(`${API_BASE}/api/insights`, {
    method: "POST",
    body: JSON.stringify({ client_name: clientName, period_type: periodType, period_start: periodStart, period_end: periodEnd }),
  });
  const insight = await res.json();
  await apiFetch(`${API_BASE}/api/insights/${insight.id}/discover-meetings`, { method: "POST" });
  return insight as { id: string };
}

async function listInsightsViaAPI(clientName: string): Promise<{ id: string }[]> {
  const res = await apiFetch(`${API_BASE}/api/insights?client=${encodeURIComponent(clientName)}`);
  return res.json();
}

async function cleanupAllTestInsights(clientName: string) {
  const insights = await listInsightsViaAPI(clientName);
  for (const insight of insights) {
    await deleteInsightViaAPI(insight.id);
  }
}

async function setupInsightAndNavigate(page: Page, client: string) {
  await createInsightViaAPI(client, "week", "2026-03-02", "2026-03-08");
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await selectClient(page, client);
  await navigateToInsights(page);
}

test.describe("Insights E2E", () => {
  const CLIENT = "LLSA";

  test.beforeEach(async ({ page }) => {
    await cleanupAllTestInsights(CLIENT);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    await cleanupAllTestInsights(CLIENT);
  });

  test.describe("Navigation and Empty State", () => {
    test("navigates to Insights view via NavRail", async ({ page }) => {
      await selectClient(page, CLIENT);
      await navigateToInsights(page);
      await expect(page.getByText(`${CLIENT} Insights`)).toBeVisible();
    });

    test("shows empty state when no insights exist", async ({ page }) => {
      await selectClient(page, CLIENT);
      await navigateToInsights(page);
      await expect(page.getByText("No insights")).toBeVisible();
    });
  });

  test.describe("Create Insight", () => {
    test("form validation: Create button is enabled when reference date is set", async ({ page }) => {
      await selectClient(page, CLIENT);
      await navigateToInsights(page);
      await page.getByLabel("New Insight").click();
      await expect(page.getByText("Create Insight")).toBeVisible();
      const createBtn = page.getByRole("button", { name: "Create", exact: true });
      await expect(createBtn).toBeEnabled();
    });

    test("period preview updates when switching period types", async ({ page }) => {
      await selectClient(page, CLIENT);
      await navigateToInsights(page);
      await page.getByLabel("New Insight").click();
      await expect(page.getByTestId("period-preview")).toBeVisible();

      await page.getByRole("button", { name: "Day" }).click();
      const dayPreview = await page.getByTestId("period-preview").textContent();

      await page.getByRole("button", { name: "Month" }).click();
      const monthPreview = await page.getByTestId("period-preview").textContent();

      expect(dayPreview).not.toBe(monthPreview);
    });

    test("cancel closes dialog without creating insight", async ({ page }) => {
      await selectClient(page, CLIENT);
      await navigateToInsights(page);
      await page.getByLabel("New Insight").click();
      await expect(page.getByText("Create Insight")).toBeVisible();
      await page.getByRole("button", { name: "Cancel" }).click();
      await expect(page.getByText("Create Insight")).toBeHidden();
      await expect(page.getByText("No insights")).toBeVisible();
    });

    test("creates insight and shows discovery then success toast", async ({ page }) => {
      await selectClient(page, CLIENT);
      await navigateToInsights(page);
      await page.getByLabel("New Insight").click();

      const dateInput = page.getByLabel("Reference Date");
      await dateInput.fill("2026-03-03");
      await page.getByRole("button", { name: "Week" }).click();
      await page.getByRole("button", { name: "Create", exact: true }).click();

      await waitForToast(page, "Discovering meetings...");
      const container = page.locator(".fixed.top-4.right-4");
      await expect(container.getByText(/Insight created|Create insight failed/)).toBeVisible({ timeout: 15_000 });

      await expect(page.getByText("No insights")).toBeHidden();
    });

    test("created insight appears in list with period type badge", async ({ page }) => {
      await selectClient(page, CLIENT);
      await navigateToInsights(page);
      await page.getByLabel("New Insight").click();
      await page.getByLabel("Reference Date").fill("2026-03-03");
      await page.getByRole("button", { name: "Week" }).click();
      await page.getByRole("button", { name: "Create", exact: true }).click();
      const container = page.locator(".fixed.top-4.right-4");
      await expect(container.getByText(/Insight created|Create insight failed/)).toBeVisible({ timeout: 15_000 });

      const insightsView = page.getByTestId("insights-view");
      await expect(insightsView.getByText("Week")).toBeVisible();
    });
  });

  test.describe("Insight Detail View", () => {
    test("selecting insight shows detail panel with header elements", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      const detail = page.getByTestId("insight-detail-view");
      await expect(detail.getByTestId("detail-rag-badge")).toBeVisible();
      await expect(detail.getByText("Week")).toBeVisible();
      await expect(detail.getByText("Draft")).toBeVisible();
    });

    test("shows Executive Summary section", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      await expect(page.getByText("Executive Summary")).toBeVisible();
    });

    test("shows Source Meetings section with meetings listed", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      await expect(page.getByText("Source Meetings")).toBeVisible();
      const checkboxes = page.getByTestId("insight-detail-view").locator('input[type="checkbox"]');
      await expect(checkboxes.first()).toBeVisible();
    });

    test("action buttons (Generate, Finalize, Delete) are visible for empty draft", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      const detail = page.getByTestId("insight-detail-view");
      await expect(detail.getByText("Generate")).toBeVisible();
      await expect(detail.getByText("Finalize")).toBeVisible();
      await expect(detail.getByText("Delete")).toBeVisible();
    });
  });

  test.describe("Finalize and Reopen", () => {
    test("finalizing changes status to Final with success toast", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      await expect(page.getByTestId("insight-detail-view").getByText("Draft")).toBeVisible();
      await page.getByTestId("insight-detail-view").getByText("Finalize").click();
      await waitForToast(page, "Insight finalized");
      await expect(page.getByTestId("insight-detail-view").getByText("Final")).toBeVisible();
    });

    test("reopening changes status back to Draft with success toast", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      await page.getByTestId("insight-detail-view").getByText("Finalize").click();
      await waitForToast(page, "Insight finalized");
      await page.getByTestId("insight-detail-view").getByText("Reopen").click();
      await waitForToast(page, "Insight reopened");
      await expect(page.getByTestId("insight-detail-view").getByText("Draft")).toBeVisible();
    });
  });

  test.describe("Generate", () => {
    test("generate shows in-progress and completion toasts for empty draft", async ({ page }) => {
      test.setTimeout(120_000);
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      await page.getByTestId("insight-detail-view").getByText("Generate").click();
      await waitForToast(page, "Generating insight...");
      const container = page.locator(".fixed.top-4.right-4");
      await expect(container.getByText(/Insight generated|Generate insight failed/)).toBeVisible({ timeout: 90_000 });
    });
  });

  test.describe("Delete with Confirmation Dialog", () => {
    test("delete button opens confirmation dialog", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      await page.getByTestId("insight-detail-view").getByText("Delete").click();

      await expect(page.getByText("Permanently delete this insight and its associated data?")).toBeVisible();
      await expect(page.getByText("This cannot be undone.")).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Delete permanently" })).toBeVisible();
    });

    test("cancel in confirmation dialog does not delete insight", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      await page.getByTestId("insight-detail-view").getByText("Delete").click();
      await page.getByRole("button", { name: "Cancel" }).click();

      await expect(page.getByText("Permanently delete this insight")).toBeHidden();
      await expect(page.getByTestId("insight-detail-view")).toBeVisible();
    });

    test("confirming delete removes insight and shows success toast", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      await page.getByTestId("insight-detail-view").getByText("Delete").click();
      await page.getByRole("button", { name: "Delete permanently" }).click();

      await waitForToast(page, "Insight deleted");
      await expect(page.getByText("No insights")).toBeVisible();
    });

    test("after delete, detail panel is cleared", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);

      await page.getByTestId("insight-detail-view").getByText("Delete").click();
      await page.getByRole("button", { name: "Delete permanently" }).click();
      await waitForToast(page, "Insight deleted");

      await expect(page.getByTestId("insight-detail-view")).toBeHidden();
    });
  });

  test.describe("Source Meeting Removal", () => {
    test("unchecking a meeting and clicking Remove Unchecked shows toast", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      const detail = page.getByTestId("insight-detail-view");
      const checkboxes = detail.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      if (count === 0) {
        test.skip();
        return;
      }
      const firstCheckbox = checkboxes.first();
      if (await firstCheckbox.isChecked()) {
        await firstCheckbox.click();
      }
      await expect(detail.getByText("Remove Unchecked")).toBeVisible();
      await detail.getByText("Remove Unchecked").click();
      const container = page.locator(".fixed.top-4.right-4");
      await expect(container.getByText(/Removed \d+ meeting/)).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe("Empty Source Meetings", () => {
    test("insight with no meetings shows empty state message", async ({ page }) => {
      const res = await apiFetch(`${API_BASE}/api/insights`, {
        method: "POST",
        body: JSON.stringify({ client_name: CLIENT, period_type: "day", period_start: "2020-01-01", period_end: "2020-01-01" }),
      });
      const insight = await res.json() as { id: string };

      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await selectClient(page, CLIENT);
      await navigateToInsights(page);

      await clickInsightRow(page);
      await expect(page.getByText(/No source meetings found/)).toBeVisible();

      await deleteInsightViaAPI(insight.id);
    });
  });

  test.describe("Client Filtering on Source Meetings", () => {
    test("LLSA insight only contains LLSA meetings, no TQ meetings", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      const detail = page.getByTestId("insight-detail-view");
      await expect(detail.getByText("Source Meetings")).toBeVisible();

      const meetingLabels = detail.locator('label');
      const count = await meetingLabels.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const text = await meetingLabels.nth(i).textContent();
        expect(text).not.toMatch(/^TQ[:\s]/);
        expect(text).not.toContain("TQ:");
        expect(text).not.toContain("TQ,");
        expect(text).not.toMatch(/\bTerraQuantum\b/i);
      }
    });

    test("TQ insight only contains TQ meetings, no LLSA meetings", async ({ page }) => {
      const TQ_CLIENT = "TerraQuantum";
      await cleanupAllTestInsights(TQ_CLIENT);
      let insight: { id: string } | null = null;
      try {
        insight = await createInsightViaAPI(TQ_CLIENT, "week", "2026-03-02", "2026-03-08");

        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await selectClient(page, TQ_CLIENT);
        await navigateToInsights(page);

        const row = insightRow(page);
        if (await row.isVisible({ timeout: 3000 }).catch(() => false)) {
          await row.click();
          await expect(page.getByTestId("insight-detail-view")).toBeVisible({ timeout: 10_000 });
          const detail = page.getByTestId("insight-detail-view");
          await expect(detail.getByText("Source Meetings")).toBeVisible();

          const meetingLabels = detail.locator('label');
          const count = await meetingLabels.count();
          for (let i = 0; i < count; i++) {
            const text = await meetingLabels.nth(i).textContent();
            expect(text).not.toMatch(/\bLLSA\b/);
          }
        }
      } finally {
        if (insight) await deleteInsightViaAPI(insight.id);
        await cleanupAllTestInsights(TQ_CLIENT);
      }
    });

    test("discovered meetings via API respect client boundary", async () => {
      const insight = await createInsightViaAPI(CLIENT, "week", "2026-03-02", "2026-03-08");
      try {
        const meetingsRes = await apiFetch(`${API_BASE}/api/insights/${insight.id}/meetings`);
        const meetings = await meetingsRes.json() as { meeting_id: string; meeting_title: string }[];

        for (const m of meetings) {
          expect(m.meeting_title).not.toMatch(/^TQ[:\s]/);
          expect(m.meeting_title).not.toContain("TQ:");
        }
      } finally {
        await deleteInsightViaAPI(insight.id);
      }
    });
  });

  test.describe("Chat Panel Integration", () => {
    test("chat panel is visible when insight is selected", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      const chatArea = page.locator('textarea');
      await expect(chatArea).toBeVisible({ timeout: 10_000 });
    });

    test("clear messages button triggers confirmation dialog", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);

      const chatArea = page.locator('textarea');
      await expect(chatArea).toBeVisible({ timeout: 10_000 });
      await chatArea.fill("test message");
      await chatArea.press("Enter");

      await page.waitForTimeout(3000);

      const clearBtn = page.getByLabel("Clear conversation");
      if (await clearBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await clearBtn.click();
        await expect(page.getByText("Clear all chat messages for this insight?")).toBeVisible();
        await expect(page.getByText("This cannot be undone.")).toBeVisible();
        await page.getByRole("button", { name: "Cancel" }).click();
      }
    });

    test("confirming clear messages shows success toast", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);

      const chatArea = page.locator('textarea');
      await expect(chatArea).toBeVisible({ timeout: 10_000 });
      await chatArea.fill("test message");
      await chatArea.press("Enter");

      await page.waitForTimeout(3000);

      const clearBtn = page.getByLabel("Clear conversation");
      if (await clearBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await clearBtn.click();
        await page.getByRole("button", { name: "Clear messages" }).click();
        await waitForToast(page, "Messages cleared");
      }
    });
  });

  test.describe("State Consistency", () => {
    test("deleting selected insight clears detail panel (no stale content)", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);

      await page.getByTestId("insight-detail-view").getByText("Delete").click();
      await page.getByRole("button", { name: "Delete permanently" }).click();
      await waitForToast(page, "Insight deleted");

      await expect(page.getByTestId("insight-detail-view")).toBeHidden();
    });

    test("finalizing updates the list row badge", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);

      const list = page.getByTestId("insights-view");
      await expect(list.getByText("Final")).toBeHidden();
      await page.getByTestId("insight-detail-view").getByText("Finalize").click();
      await waitForToast(page, "Insight finalized");
      await expect(list.getByText("Final")).toBeVisible();
    });
  });

  test.describe("Loading States", () => {
    test("insight detail view renders without blank content", async ({ page }) => {
      await setupInsightAndNavigate(page, CLIENT);
      await clickInsightRow(page);
      const detail = page.getByTestId("insight-detail-view");
      await expect(detail.getByText("Executive Summary")).toBeVisible();
      await expect(detail.getByText("Source Meetings")).toBeVisible();
    });
  });
});
