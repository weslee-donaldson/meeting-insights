import { expect, type Page } from "@playwright/test";

export async function selectClient(page: Page, clientName: string) {
  const select = page.locator('select[aria-label="Client"]');
  await select.selectOption(clientName);
  await expect(select).toHaveValue(clientName);
}
