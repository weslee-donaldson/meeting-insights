import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 1400, height: 900 } });

const criticalHealth = {
  status: "critical",
  error_groups: [
    {
      error_type: "api_error",
      severity: "critical",
      count: 12,
      latest_message: "[api_error] 402 Insufficient funds",
      latest_meeting_filename: "2026-04-01_standup.json",
      provider: "openai",
      resolution_hint: "Check your LLM provider account billing and API key validity",
    },
  ],
  meetings_without_artifact: 12,
  last_error_at: "2026-04-01 14:30:00",
};

const healthyHealth = {
  status: "healthy",
  error_groups: [],
  meetings_without_artifact: 0,
  last_error_at: null,
};

test("no health banner shown when system is healthy", async ({ page }) => {
  await page.route("**/api/health", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(healthyHealth) })
  );
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const banners = page.locator('[role="alert"]');
  await expect(banners).toHaveCount(0);
});

test("red banner visible when system has critical errors", async ({ page }) => {
  await page.route("**/api/health", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(criticalHealth) })
  );
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const banner = page.locator('[role="alert"]');
  await expect(banner).toBeVisible({ timeout: 5000 });
  await expect(banner).toHaveClass(/bg-red-600/);
  await expect(banner).toContainText("openai");
  await expect(banner).toContainText("Check your LLM provider account billing");
  await expect(banner).toContainText("12 meeting(s) affected");
  const dismissBtn = banner.getByRole("button", { name: /dismiss/i });
  await expect(dismissBtn).toBeVisible();
});

test("banner is positioned above main workspace content", async ({ page }) => {
  await page.route("**/api/health", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(criticalHealth) })
  );
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const banner = page.locator('[role="alert"]');
  await expect(banner).toBeVisible({ timeout: 5000 });
  const bannerBox = await banner.boundingBox();
  const mainContent = page.locator("main, [role='main'], nav").first();
  const mainBox = await mainContent.boundingBox();
  expect(bannerBox).not.toBeNull();
  expect(mainBox).not.toBeNull();
  expect(bannerBox!.y).toBeLessThan(mainBox!.y + mainBox!.height);
  expect(bannerBox!.y).toBeLessThanOrEqual(mainBox!.y);
});

test("gray banner when health endpoint is unreachable", async ({ page }) => {
  await page.route("**/api/health", (route) => route.abort("connectionrefused"));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const banner = page.locator('[role="alert"]');
  await expect(banner).toBeVisible({ timeout: 5000 });
  await expect(banner).toHaveClass(/bg-gray-600/);
  await expect(banner).toContainText("Unable to reach server");
});

test("dismiss button calls acknowledge API and hides banner", async ({ page }) => {
  let acknowledgeCallBody: string | null = null;
  await page.route("**/api/health", (route) => {
    if (acknowledgeCallBody !== null) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(healthyHealth) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(criticalHealth) });
  });
  await page.route("**/api/health/acknowledge", async (route) => {
    acknowledgeCallBody = route.request().postData();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const banner = page.locator('[role="alert"]');
  await expect(banner).toBeVisible({ timeout: 5000 });
  await banner.getByRole("button", { name: /dismiss/i }).click();
  expect(acknowledgeCallBody).not.toBeNull();
});
