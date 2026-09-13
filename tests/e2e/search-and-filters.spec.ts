import path from "node:path";

import { expect, test } from "@playwright/test";

import { AUTH_DIR, E2E_PREFIX, readFixtures } from "./fixtures";

test.use({ storageState: path.resolve(AUTH_DIR, "admin.json") });

const fixtures = readFixtures();

test.describe("Global search", () => {
  test("typing 2+ characters shows real matches in the dropdown", async ({ page }) => {
    await page.goto("/dashboard");
    const search = page.getByPlaceholder(/search bugs, projects, or users/i);
    await search.fill("TEST_E2E");
    await expect(page.getByRole("button", { name: `${E2E_PREFIX} Project` })).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe("Bugs filter bar", () => {
  test("project and status filters narrow the visible list", async ({ page }) => {
    const bugTitle = `${E2E_PREFIX} filter-bar bug`;

    await page.goto("/bugs/new");
    await page.getByLabel(/bug title/i).fill(bugTitle);
    await page.getByLabel(/^project/i).click();
    await page.getByRole("option", { name: `${E2E_PREFIX} Project` }).click();
    await page.getByLabel(/^severity/i).click();
    await page.getByRole("option", { name: "Low" }).click();
    await page.getByLabel(/steps to reproduce/i).fill("n/a");
    await page.getByRole("button", { name: /create bug/i }).click();
    await expect(page).toHaveURL(/\/bugs\/[0-9a-f-]+$/);

    await page.goto(`/bugs?project=${fixtures.projectId}`);
    await expect(page.getByRole("link", { name: bugTitle })).toBeVisible();

    // A fresh bug defaults to "open" -- filtering to "closed" should hide it.
    await page.goto(`/bugs?project=${fixtures.projectId}&status=closed`);
    await expect(page.getByRole("link", { name: bugTitle })).not.toBeVisible();
    await expect(page.getByText(/no bugs match your filters/i)).toBeVisible();
  });
});
