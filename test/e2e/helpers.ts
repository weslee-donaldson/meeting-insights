import { expect, type Page } from "@playwright/test";

export async function selectClient(page: Page, clientName: string) {
  const select = page.locator('select[aria-label="Client"]');
  await select.selectOption(clientName);
  await expect(select).toHaveValue(clientName);
}

export type ViewportName = "mobile" | "tablet" | "desktop";

const VIEWPORTS: Record<ViewportName, { width: number; height: number }> = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1400, height: 900 },
};

export async function withViewport(page: Page, viewport: ViewportName) {
  await page.setViewportSize(VIEWPORTS[viewport]);
}

export { VIEWPORTS };
