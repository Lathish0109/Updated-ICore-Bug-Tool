import path from "node:path";

import { expect, test } from "@playwright/test";

import { AUTH_DIR } from "./fixtures";

test.use({ storageState: path.resolve(AUTH_DIR, "admin.json") });

test.describe("Export CSV", () => {
  test("clicking Export CSV downloads a real file", async ({ page }) => {
    await page.goto("/bugs");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /export csv/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^bugs-export-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
