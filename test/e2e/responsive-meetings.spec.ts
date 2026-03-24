import { test, expect } from "@playwright/test";
import { selectClient, withViewport, type ViewportName } from "./helpers.js";

const CLIENT = "TestCo";

test.use({ viewport: { width: 1400, height: 900 } });

test.describe("Responsive Meetings — Mobile (390x844)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await withViewport(page, "mobile");
  });

  test("renders bottom tab bar on mobile", async ({ page }) => {
    await expect(page.getByTestId("bottom-tab-bar")).toBeVisible();
  });

  test("renders mobile banner with search and filter icons", async ({ page }) => {
    await selectClient(page, CLIENT);
    await expect(page.getByTestId("mobile-banner")).toBeVisible();
    await expect(page.getByLabel("Open search")).toBeVisible();
    await expect(page.getByLabel("Open filters")).toBeVisible();
  });

  test("search expands to full-width input on icon tap", async ({ page }) => {
    await selectClient(page, CLIENT);
    await page.getByLabel("Open search").click();
    await expect(page.getByTestId("mobile-search-expanded")).toBeVisible();
    await expect(page.getByLabel("Search meetings")).toBeVisible();
  });

  test("tapping a bottom tab navigates between views", async ({ page }) => {
    await selectClient(page, CLIENT);
    await page.getByRole("button", { name: "Threads" }).click();
    await expect(page.getByTestId("bottom-tab-bar")).toBeVisible();
  });
});

test.describe("Responsive Meetings — Tablet (768x1024)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await withViewport(page, "tablet");
  });

  test("renders tablet split-pane layout with bottom tab bar", async ({ page }) => {
    await expect(page.getByTestId("responsive-shell-tablet")).toBeVisible();
    await expect(page.getByTestId("bottom-tab-bar")).toBeVisible();
    await expect(page.getByTestId("tablet-list-panel")).toBeVisible();
    await expect(page.getByTestId("tablet-detail-panel")).toBeVisible();
  });

  test("tapping a bottom tab navigates between views", async ({ page }) => {
    await selectClient(page, CLIENT);
    await page.getByRole("button", { name: "Insights" }).click();
    await expect(page.getByTestId("bottom-tab-bar")).toBeVisible();
  });
});

test.describe("Responsive Meetings — Desktop (1400x900)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await withViewport(page, "desktop");
  });

  test("renders NavRail on desktop (no bottom tab bar)", async ({ page }) => {
    await expect(page.getByTestId("bottom-tab-bar")).not.toBeVisible();
    await expect(page.getByLabel("Meetings")).toBeVisible();
  });
});

test.describe("Breadcrumb Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await withViewport(page, "mobile");
  });

  test("breadcrumb bar not visible on list screen", async ({ page }) => {
    await expect(page.getByTestId("breadcrumb-bar")).not.toBeVisible();
  });
});
