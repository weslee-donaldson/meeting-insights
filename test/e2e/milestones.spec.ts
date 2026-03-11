import { test, expect, type Page } from "@playwright/test";

const API_BASE = "http://localhost:3000";

test.use({ viewport: { width: 1400, height: 900 } });

async function createMilestoneViaAPI(clientName: string, title: string, targetDate?: string) {
  const res = await fetch(`${API_BASE}/api/milestones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_name: clientName, title, description: "", target_date: targetDate ?? null }),
  });
  return res.json() as Promise<{ id: string }>;
}

async function deleteMilestoneViaAPI(id: string) {
  await fetch(`${API_BASE}/api/milestones/${id}`, { method: "DELETE" });
}

async function listMilestonesViaAPI(clientName: string) {
  const res = await fetch(`${API_BASE}/api/milestones?client=${encodeURIComponent(clientName)}`);
  return res.json() as Promise<Array<{ id: string; title: string; status: string }>>;
}

async function cleanupAllTestMilestones(clientName: string) {
  const milestones = await listMilestonesViaAPI(clientName);
  for (const m of milestones) {
    await deleteMilestoneViaAPI(m.id);
  }
}

async function selectClient(page: Page, clientName: string) {
  const trigger = page.locator('[aria-label="Client"]');
  await trigger.click();
  await page.locator('[role="option"]').filter({ hasText: clientName }).click();
  await expect(trigger).toContainText(clientName);
}

async function navigateToTimelines(page: Page) {
  await page.locator('[aria-label="Timelines"]').click();
}

test.describe("Milestones E2E", () => {
  const CLIENT = "TestCo";

  test.beforeEach(async ({ page }) => {
    await cleanupAllTestMilestones(CLIENT);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    await cleanupAllTestMilestones(CLIENT);
  });

  test.describe("Navigation and Empty State", () => {
    test("navigates to Timelines view and shows empty state", async ({ page }) => {
      await selectClient(page, CLIENT);
      await navigateToTimelines(page);
      await expect(page.getByText("No milestones")).toBeVisible();
    });
  });

  test.describe("Create Milestone", () => {
    test("opens Create Milestone dialog, creates milestone, milestone appears in list", async ({ page }) => {
      await selectClient(page, CLIENT);
      await navigateToTimelines(page);
      await page.getByRole("button", { name: "New Milestone" }).click();
      await page.getByLabel("Title").fill("Launch v3.0");
      await page.getByRole("button", { name: "Create" }).click();
      await expect(page.getByText("Milestone created")).toBeVisible();
      await expect(page.getByText("Launch v3.0")).toBeVisible();
    });
  });

  test.describe("Milestone Detail", () => {
    test("selecting a milestone shows detail panel with header, status badge, and target date", async ({ page }) => {
      const { id } = await createMilestoneViaAPI(CLIENT, "API Rollout", "2026-06-15");

      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await selectClient(page, CLIENT);
      await navigateToTimelines(page);
      await page.getByText("API Rollout").click();
      await expect(page.getByText("Jun 15, 2026")).toBeVisible();
      await expect(page.getByText("identified")).toBeVisible();

      await deleteMilestoneViaAPI(id);
    });
  });

  test.describe("Edit Milestone", () => {
    test("edit mode allows changing title and status; save updates values", async ({ page }) => {
      const { id } = await createMilestoneViaAPI(CLIENT, "Original Title", "2026-07-01");

      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await selectClient(page, CLIENT);
      await navigateToTimelines(page);
      await page.getByText("Original Title").click();
      await page.getByRole("button", { name: "Edit" }).click();
      await page.getByLabel("Title").fill("Updated Title");
      await page.getByLabel("Status").selectOption("tracked");
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByText("Updated Title")).toBeVisible();

      await deleteMilestoneViaAPI(id);
    });
  });

  test.describe("Delete with Confirmation", () => {
    test("delete opens confirmation, cancel preserves milestone, confirm removes it", async ({ page }) => {
      const { id } = await createMilestoneViaAPI(CLIENT, "To Delete", undefined);

      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await selectClient(page, CLIENT);
      await navigateToTimelines(page);
      await page.getByText("To Delete").click();
      await page.getByRole("button", { name: "Delete" }).click();
      await page.getByRole("button", { name: "Cancel" }).click();
      await expect(page.getByText("To Delete")).toBeVisible();

      await page.getByRole("button", { name: "Delete" }).click();
      await page.getByRole("button", { name: "Confirm" }).click();
      await expect(page.getByText("To Delete")).not.toBeVisible({ timeout: 5000 });

      await deleteMilestoneViaAPI(id).catch(() => {});
    });
  });

  test.describe("Date Slippage", () => {
    test.skip("date slippage section visible when target date changed across mentions", async ({ page }) => {
      // Requires milestone mentions with different target dates
      // Needs a real meeting in the database — skip for now
    });
  });

  test.describe("Mentions Timeline", () => {
    test.skip("mentions timeline shows chronological list with meeting links", async ({ page }) => {
      // Requires meeting data and milestone mentions
      // Skip for automated E2E without seed data
    });
  });

  test.describe("Chat Panel", () => {
    test("chat panel is visible when milestone is selected", async ({ page }) => {
      const { id } = await createMilestoneViaAPI(CLIENT, "Chat Test Milestone", undefined);

      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await selectClient(page, CLIENT);
      await navigateToTimelines(page);
      await page.getByText("Chat Test Milestone").click();
      await expect(page.getByPlaceholder(/ask/i)).toBeVisible({ timeout: 5000 });

      await deleteMilestoneViaAPI(id);
    });
  });

  test.describe("Milestone Badges on Meetings", () => {
    test.skip("milestone badges appear on meeting cards and are clickable", async ({ page }) => {
      // Requires meeting data with milestone_tags from reconcileMilestones pipeline
      // Skip for automated E2E
    });
  });

  test.describe("Gantt View", () => {
    test("switching to Gantt view shows Gantt chart with today marker", async ({ page }) => {
      const { id } = await createMilestoneViaAPI(CLIENT, "Gantt Milestone", "2026-06-01");

      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await selectClient(page, CLIENT);
      await navigateToTimelines(page);
      await page.getByRole("button", { name: "Gantt view" }).click();
      await expect(page.locator('[data-testid="today-marker"]')).toBeVisible();

      await deleteMilestoneViaAPI(id);
    });
  });

  test.describe("Calendar View", () => {
    test("switching to Calendar view shows month grid with navigation", async ({ page }) => {
      const { id } = await createMilestoneViaAPI(CLIENT, "Calendar Milestone", "2026-03-15");

      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await selectClient(page, CLIENT);
      await navigateToTimelines(page);
      await page.getByRole("button", { name: "Calendar view" }).click();
      await expect(page.getByRole("button", { name: "Previous month" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Next month" })).toBeVisible();
      await expect(page.getByText("Sun")).toBeVisible();

      await deleteMilestoneViaAPI(id);
    });
  });

  test.describe("State Consistency", () => {
    test("deleting selected milestone clears detail panel", async ({ page }) => {
      const { id } = await createMilestoneViaAPI(CLIENT, "State Test", undefined);

      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await selectClient(page, CLIENT);
      await navigateToTimelines(page);
      await page.getByText("State Test").click();

      await page.getByRole("button", { name: "Delete" }).click();
      await page.getByRole("button", { name: "Confirm" }).click();
      await expect(page.getByText("State Test")).not.toBeVisible({ timeout: 5000 });

      await deleteMilestoneViaAPI(id).catch(() => {});
    });
  });

  test.describe("Fuzzy Match Review", () => {
    test.skip("fuzzy match review shows Review badge and confirm/reject flow", async ({ page }) => {
      // Requires reconcileMilestones pipeline processing
      // Skip for automated E2E without full pipeline
    });
  });
});
