import { expect, type Page } from "@playwright/test";

export const API_BASE = "http://localhost:3000";
const E2E_TOKEN = process.env.VITE_API_TOKEN ?? process.env.MTI_TOKEN ?? "";

export function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = { ...init?.headers as Record<string, string> };
  if (E2E_TOKEN) {
    headers["Authorization"] = `Bearer ${E2E_TOKEN}`;
  }
  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(url, { ...init, headers });
}

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
