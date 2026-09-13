import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { AUTH_DIR } from "./fixtures";

test.use({ storageState: path.resolve(AUTH_DIR, "admin.json") });

// Regression guard for the bug we actually hit once: wrapping each bar in a
// full-height tooltip container broke bottom alignment, so bars grew down
// from the top instead of up from the bottom. This asserts the geometry
// directly instead of trusting a screenshot.
async function expectBottomAnchored(page: Page, barTestId: string) {
  const bars = page.getByTestId(barTestId);
  const count = await bars.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const bar = bars.nth(i);
    const barBox = await bar.boundingBox();
    const containerBox = await bar
      .locator("xpath=ancestor::*[contains(@class,'flex') and contains(@class,'items-end')][1]")
      .boundingBox();
    if (!barBox || !containerBox) continue;
    // Bottom edges should line up (within a couple px of layout rounding).
    expect(
      Math.abs(barBox.y + barBox.height - (containerBox.y + containerBox.height)),
    ).toBeLessThan(3);
  }
}

test.describe("Charts render bottom-up, not inverted", () => {
  test("Dashboard Resolution Trend bars are bottom-anchored", async ({ page }) => {
    await page.goto("/dashboard");
    const chart = page.getByTestId("resolution-trend-chart");
    if ((await chart.count()) === 0) test.skip(true, "no bugs yet to chart");
    await expectBottomAnchored(page, "resolution-trend-bar");
  });

  test("Reports Opened-vs-Closed bars are bottom-anchored", async ({ page }) => {
    await page.goto("/reports");
    const chart = page.getByTestId("opened-closed-chart");
    if ((await chart.count()) === 0) test.skip(true, "no bugs yet to chart");
    await expectBottomAnchored(page, "opened-bar");
  });
});
