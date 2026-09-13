import path from "node:path";

import { expect, test } from "@playwright/test";

import { AUTH_DIR, E2E_PREFIX, readFixtures } from "./fixtures";

test.use({ storageState: path.resolve(AUTH_DIR, "admin.json") });

const fixtures = readFixtures();
const bugTitle = `${E2E_PREFIX} bug from Playwright`;

test.describe("Create bug", () => {
  test("a submitted bug appears in the Bugs list", async ({ page }) => {
    await page.goto("/bugs/new");
    await page.getByLabel(/bug title/i).fill(bugTitle);

    await page.getByLabel(/^project/i).click();
    await page.getByRole("option", { name: `${E2E_PREFIX} Project` }).click();

    await page.getByLabel(/^severity/i).click();
    await page.getByRole("option", { name: "High" }).click();

    await page.getByLabel(/steps to reproduce/i).fill("1. Open the app\n2. Observe the bug");

    await page.getByRole("button", { name: /create bug/i }).click();

    await expect(page).toHaveURL(/\/bugs\/[0-9a-f-]+$/);
    await expect(page.getByRole("heading", { name: bugTitle })).toBeVisible();

    await page.goto("/bugs?project=" + fixtures.projectId);
    await expect(page.getByRole("link", { name: bugTitle })).toBeVisible();
  });
});

test.describe("Bug status + activity", () => {
  test("changing status logs an activity entry", async ({ page }) => {
    await page.goto("/bugs?project=" + fixtures.projectId);
    const row = page.getByRole("link", { name: bugTitle });
    await expect(row).toBeVisible();
    await Promise.all([page.waitForURL(/\/bugs\/[0-9a-f-]+$/), row.click()]);
    await expect(page.getByRole("heading", { name: bugTitle })).toBeVisible();

    // StatusSelect's trigger shows the current status as its visible text.
    // force:true -- the Sonner toast region is fixed top-right, the same
    // corner this control sits in, and can transiently overlap it.
    const statusTrigger = page.getByTestId("status-select-trigger");
    await expect(statusTrigger).toBeVisible({ timeout: 10000 });
    await expect(statusTrigger).toContainText("Open");
    await statusTrigger.click({ force: true });
    await page.getByRole("option", { name: "In Progress" }).click();

    await expect(statusTrigger).toContainText("In Progress");
    const activityEntry = page.getByText(/changed status/i);
    await expect(activityEntry).toBeVisible();
    await expect(activityEntry).toContainText("Open");
    await expect(activityEntry).toContainText("In Progress");
  });
});

test.describe("Attachment validation", () => {
  test("an oversized file is rejected client-side with a toast, valid file is accepted", async ({
    page,
  }) => {
    await page.goto("/bugs/new");

    const oversized = {
      name: "too-big.png",
      mimeType: "image/png",
      buffer: Buffer.alloc(21 * 1024 * 1024), // just over the 20MB limit
    };
    await page.locator("#attachments").setInputFiles(oversized);
    await expect(page.getByText(/was skipped/i)).toBeVisible();
    await expect(page.getByText("too-big.png")).not.toBeVisible();

    const valid = {
      name: "screenshot.png",
      mimeType: "image/png",
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    };
    await page.locator("#attachments").setInputFiles(valid);
    await expect(page.getByText("screenshot.png")).toBeVisible();
  });
});
