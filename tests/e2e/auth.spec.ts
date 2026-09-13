import { expect, test } from "@playwright/test";

import { loadEnvLocal } from "./fixtures";

loadEnvLocal();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

// Runs with a fresh, signed-out context (no storageState) -- this is the one
// spec that needs to drive the actual login form itself.
test.describe("Login", () => {
  test("correct credentials land on the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/work email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/^password$/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /overview/i })).toBeVisible();
  });

  test("wrong password shows an inline error and stays on /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/work email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/^password$/i).fill("definitely-wrong-password");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
