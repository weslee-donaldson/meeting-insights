import { test, expect, type Page } from "@playwright/test";
import { selectClient, apiFetch, API_BASE } from "./helpers.js";

test.use({ viewport: { width: 1400, height: 900 } });

async function navigateToSearch(page: Page) {
  await page.getByLabel("Search").click();
  await expect(page.getByTestId("search-view")).toBeVisible();
}

async function typeInSearchForm(page: Page, query: string) {
  const input = page.getByLabel("Search query");
  await input.fill(query);
  await input.press("Enter");
}

async function waitForResults(page: Page) {
  await expect(page.getByTestId("search-results-list")).toBeVisible();
  await expect(
    page.getByTestId("search-results-list").locator("[data-testid^='search-result-card-']").first(),
  ).toBeVisible({ timeout: 15_000 });
}

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

test.describe("Search View E2E", () => {
  let CLIENT: string;

  test.beforeAll(async () => {
    CLIENT = await getClientWithMeetings();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await selectClient(page, CLIENT);
  });

  test.describe("Navigation", () => {
    test("navigates to Search view via NavRail and shows empty form", async ({ page }) => {
      await navigateToSearch(page);
      await expect(page.getByTestId("search-view")).toBeVisible();
      await expect(page.getByTestId("empty-state-initial")).toBeVisible();
      await expect(page.getByText("Search across all meetings")).toBeVisible();
    });
  });

  test.describe("TopBar Enter Navigation", () => {
    test("typing in TopBar and pressing Enter navigates to search view with query pre-filled", async ({ page }) => {
      const topBarInput = page.getByLabel("Search meetings");
      await topBarInput.fill("test query");
      await topBarInput.press("Enter");
      await expect(page.getByTestId("search-view")).toBeVisible();
      await expect(page.getByLabel("Search query")).toHaveValue("test query");
    });
  });

  test.describe("Search Form", () => {
    test("typing query and toggling field pills", async ({ page }) => {
      await navigateToSearch(page);
      const input = page.getByLabel("Search query");
      await input.fill("migration");
      await expect(input).toHaveValue("migration");

      const pills = page.getByTestId("search-field-pills");
      await expect(pills).toBeVisible();

      const summaryPill = page.getByLabel("Toggle Summary");
      await expect(summaryPill).toHaveAttribute("aria-pressed", "true");
      await summaryPill.click();
      await expect(summaryPill).toHaveAttribute("aria-pressed", "false");
      await summaryPill.click();
      await expect(summaryPill).toHaveAttribute("aria-pressed", "true");
    });

    test("expand and collapse search form", async ({ page }) => {
      await navigateToSearch(page);
      await expect(page.getByTestId("search-field-pills")).toBeVisible();

      await page.getByLabel("Hide search form").click();
      await expect(page.getByTestId("search-field-pills")).not.toBeVisible();

      await page.getByLabel("Show search form").click();
      await expect(page.getByTestId("search-field-pills")).toBeVisible();
    });
  });

  test.describe("Search Execution", () => {
    test("submitting a query shows results with title, date, and score", async ({ page }) => {
      await navigateToSearch(page);
      await typeInSearchForm(page, "meeting");
      await waitForResults(page);

      const firstCard = page.locator("[data-testid^='search-result-card-']").first();
      await expect(firstCard).toBeVisible();

      const scoreEl = firstCard.getByTestId("result-score");
      await expect(scoreEl).toBeVisible();
      const scoreText = await scoreEl.textContent();
      expect(scoreText).toMatch(/^\d+\.\d+$/);
    });
  });

  test.describe("Result Card Interactions", () => {
    test("checking a card adds orange border, unchecking removes it", async ({ page }) => {
      await navigateToSearch(page);
      await typeInSearchForm(page, "meeting");
      await waitForResults(page);

      const firstCard = page.locator("[data-testid^='search-result-card-']").first();
      await expect(firstCard).toHaveAttribute("data-checked", "false");

      const checkbox = firstCard.getByTestId("result-checkbox");
      await checkbox.click();
      await expect(firstCard).toHaveAttribute("data-checked", "true");

      await checkbox.click();
      await expect(firstCard).toHaveAttribute("data-checked", "false");
    });
  });

  test.describe("Load More Pagination", () => {
    test("'Load more' link appears when results exceed display limit", async ({ page }) => {
      await navigateToSearch(page);
      await typeInSearchForm(page, "meeting");
      await waitForResults(page);

      const resultsList = page.getByTestId("search-results-list");
      const allResults = await resultsList.getByText(/results/).first().textContent();
      const totalMatch = allResults?.match(/(\d+)\s+results/);
      if (totalMatch && parseInt(totalMatch[1]) > 20) {
        await expect(page.getByRole("button", { name: "Load more" })).toBeVisible();
      } else {
        await expect(page.getByText(/Showing all/)).toBeVisible();
      }
    });
  });

  test.describe("Detail Open", () => {
    test("clicking Open on a result shows detail panel", async ({ page }) => {
      await navigateToSearch(page);
      await typeInSearchForm(page, "meeting");
      await waitForResults(page);

      const firstCard = page.locator("[data-testid^='search-result-card-']").first();
      await firstCard.getByText("Open").click();

      await expect(page.getByText("Back to full view")).toBeVisible();
    });
  });

  test.describe("Back to Full View", () => {
    test("clicking Back restores full results list", async ({ page }) => {
      await navigateToSearch(page);
      await typeInSearchForm(page, "meeting");
      await waitForResults(page);

      const firstCard = page.locator("[data-testid^='search-result-card-']").first();
      await firstCard.getByText("Open").click();
      await expect(page.getByText("Back to full view")).toBeVisible();

      await page.getByText("Back to full view").click();
      await expect(page.getByTestId("search-view")).toBeVisible();
      await expect(page.locator("[data-testid^='search-result-card-']").first()).toBeVisible();
    });
  });

  test.describe("Empty State", () => {
    test("searching with nonsense query shows no results empty state", async ({ page }) => {
      await navigateToSearch(page);
      await typeInSearchForm(page, "zzzzxxxxxqqqqqnonsensequery12345");
      await expect(page.getByTestId("empty-state-no-results")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText("No meetings match your search")).toBeVisible();
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("Tab into results, arrow keys move focus, Enter opens", async ({ page }) => {
      await navigateToSearch(page);
      await typeInSearchForm(page, "meeting");
      await waitForResults(page);

      const resultsList = page.getByTestId("search-results-list");
      await resultsList.focus();

      const firstCard = page.locator("[data-testid^='search-result-card-']").first();
      await expect(firstCard).toBeVisible();

      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");

      await expect(page.getByText("Back to full view")).toBeVisible();
    });
  });
});
