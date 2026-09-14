import path from "node:path";

import { expect, test, type Browser } from "@playwright/test";

import { AUTH_DIR, readFixtures } from "./fixtures";

const fixtures = readFixtures();
const ALL_ROLES = ["admin", "manager", "developer", "tester", "viewer"] as const;

async function pageAs(browser: Browser, role: (typeof ALL_ROLES)[number]) {
  const context = await browser.newContext({
    storageState: path.resolve(AUTH_DIR, `${role}.json`),
  });
  return { context, page: await context.newPage() };
}

test.describe("Sidebar nav visibility per role (GLOBAL-11, GLOBAL-12)", () => {
  for (const role of ALL_ROLES) {
    test(`Users nav item: ${role} ${role === "admin" ? "sees it" : "does not"}`, async ({
      browser,
    }) => {
      const { context, page } = await pageAs(browser, role);
      await page.goto("/dashboard");
      const usersLink = page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "Users" });
      if (role === "admin") {
        await expect(usersLink).toBeVisible();
      } else {
        await expect(usersLink).toHaveCount(0);
      }
      await context.close();
    });

    test(`"New Bug" quick action: ${role} ${role === "viewer" ? "does not" : "does"} see it`, async ({
      browser,
    }) => {
      const { context, page } = await pageAs(browser, role);
      await page.goto("/dashboard");
      const newBugButton = page.getByRole("link", { name: /new bug/i });
      if (role === "viewer") {
        await expect(newBugButton).toHaveCount(0);
      } else {
        await expect(newBugButton).toBeVisible();
      }
      await context.close();
    });
  }
});

test.describe("Route guards match nav visibility (ULIST-01, UNEW-08, UEDIT-05, PEDIT-06, GLOBAL-15)", () => {
  for (const role of ["manager", "developer", "tester", "viewer"] as const) {
    test(`${role} is redirected away from /users`, async ({ browser }) => {
      const { context, page } = await pageAs(browser, role);
      await page.goto("/users");
      await expect(page).toHaveURL(/\/dashboard/);
      await context.close();
    });

    test(`${role} is redirected away from /users/new`, async ({ browser }) => {
      const { context, page } = await pageAs(browser, role);
      await page.goto("/users/new");
      await expect(page).toHaveURL(/\/dashboard/);
      await context.close();
    });
  }

  test("Developer is redirected away from another user's /users/[id]/edit", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "developer");
    await page.goto(`/users/${fixtures.userIds.tester}/edit`);
    await expect(page).toHaveURL(/\/dashboard/);
    await context.close();
  });

  test("Developer cannot open /projects/[id]/edit and is sent to the project detail page instead", async ({
    browser,
  }) => {
    const { context, page } = await pageAs(browser, "developer");
    await page.goto(`/projects/${fixtures.projectId}/edit`);
    await expect(page).toHaveURL(`http://localhost:3000/projects/${fixtures.projectId}`, {
      timeout: 10000,
    });
    await context.close();
  });

  test("Manager can open /projects/[id]/edit even without being a project member", async ({
    browser,
  }) => {
    const { context, page } = await pageAs(browser, "manager");
    await page.goto(`/projects/${fixtures.projectId}/edit`);
    await expect(page).toHaveURL(`http://localhost:3000/projects/${fixtures.projectId}/edit`);
    await context.close();
  });
});

test.describe("Settings and Reports are open to every role (SETTINGS-01)", () => {
  for (const role of ALL_ROLES) {
    test(`${role} can reach /settings and /reports`, async ({ browser }) => {
      const { context, page } = await pageAs(browser, role);
      await page.goto("/settings");
      await expect(page).toHaveURL(/\/settings/);
      await page.goto("/reports");
      await expect(page).toHaveURL(/\/reports/);
      await context.close();
    });
  }
});

test.describe("Known gap: /projects/new and /bugs/new have no page-level guard", () => {
  // These two forms render for every role -- unlike /users/* and
  // /bugs/[id]/edit, which redirect at the page level. The write itself is
  // still correctly blocked by RLS (bugs_insert / projects_insert), so nothing
  // is created, but the user sees a raw failed-submit rather than being kept
  // off the page like every other restricted screen. Documented here as
  // current behavior, not asserted as "correct" -- see conversation notes.
  test("Viewer can open /bugs/new; submitting is silently rejected by RLS", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "viewer");
    await page.goto("/bugs/new");
    await expect(page.getByRole("heading", { name: /report new issue/i })).toBeVisible();

    await page.getByLabel(/bug title/i).fill("should be rejected by RLS");
    await page.getByLabel(/^project/i).click();
    await page.getByRole("option").first().click();
    await page.getByLabel(/^severity/i).click();
    await page.getByRole("option", { name: "Low" }).click();
    await page.getByLabel(/steps to reproduce/i).fill("n/a");
    await page.getByRole("button", { name: /create bug/i }).click();

    // No redirect to a new bug's detail page -- the insert never happened.
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/bugs\/new/);
    await context.close();
  });

  for (const role of ["developer", "tester", "viewer"] as const) {
    test(`${role} can open /projects/new (form renders, no redirect)`, async ({ browser }) => {
      const { context, page } = await pageAs(browser, role);
      await page.goto("/projects/new");
      await expect(page.getByLabel(/project name/i)).toBeVisible();
      await context.close();
    });
  }
});
