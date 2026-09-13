import path from "node:path";

import { expect, test } from "@playwright/test";

import { AUTH_DIR, E2E_PREFIX } from "./fixtures";

let bugId: string;

test.describe("Live notifications", () => {
  test("assigning a bug notifies the assignee in real time, no refresh", async ({ browser }) => {
    // The developer is already signed in and sitting on the dashboard --
    // this is the tab that should update itself, live, via the Supabase
    // Realtime subscription in AppTopbar.
    const devContext = await browser.newContext({
      storageState: path.resolve(AUTH_DIR, "developer.json"),
    });
    const devPage = await devContext.newPage();
    await devPage.goto("/dashboard");
    await expect(devPage.getByRole("heading", { name: /overview/i })).toBeVisible();
    // Give the Realtime subscription a moment to reach SUBSCRIBED before
    // the assignment below fires.
    await devPage.waitForTimeout(1500);

    // Admin, in a separate context, creates a bug and assigns it to the
    // developer -- createBug() fires a "bug_assigned" notification.
    const adminContext = await browser.newContext({
      storageState: path.resolve(AUTH_DIR, "admin.json"),
    });
    const adminPage = await adminContext.newPage();
    await adminPage.goto("/bugs/new");
    await adminPage.getByLabel(/bug title/i).fill(`${E2E_PREFIX} assignment notif bug`);
    await adminPage.getByLabel(/^project/i).click();
    await adminPage.getByRole("option", { name: `${E2E_PREFIX} Project` }).click();
    await adminPage.getByLabel(/^severity/i).click();
    await adminPage.getByRole("option", { name: "Medium" }).click();
    await adminPage.getByLabel(/^assignee/i).click();
    await adminPage.getByRole("option", { name: `${E2E_PREFIX} developer` }).click();
    await adminPage.getByLabel(/steps to reproduce/i).fill("n/a");
    await adminPage.getByRole("button", { name: /create bug/i }).click();
    await expect(adminPage).toHaveURL(/\/bugs\/[0-9a-f-]+$/);
    bugId = adminPage.url().split("/").pop()!;

    // Back on the developer's already-open tab: no reload, no navigation.
    await expect(devPage.getByText("Bug assigned")).toBeVisible({ timeout: 10000 });

    await devContext.close();
    await adminContext.close();
  });

  test("an @mention notifies the mentioned user in real time", async ({ browser }) => {
    test.skip(!bugId, "depends on the bug created by the previous test");

    // Mention Manager, not Developer: Developer is the bug's assignee, and
    // addComment() deliberately skips a separate "mentioned" notification
    // for someone who already got a "comment_added" one for the same
    // comment (see services/bugs.ts). Manager has no relationship to this
    // bug, so mentioning them exercises the @mention path in isolation.
    const managerContext = await browser.newContext({
      storageState: path.resolve(AUTH_DIR, "manager.json"),
    });
    const managerPage = await managerContext.newPage();
    await managerPage.goto("/dashboard");
    await expect(managerPage.getByRole("heading", { name: /overview/i })).toBeVisible();
    await managerPage.waitForTimeout(1500);

    const testerContext = await browser.newContext({
      storageState: path.resolve(AUTH_DIR, "tester.json"),
    });
    const testerPage = await testerContext.newPage();
    await testerPage.goto(`/bugs/${bugId}`);
    await testerPage
      .getByPlaceholder(/add a comment/i)
      .fill(`Hey @${E2E_PREFIX} manager, can you take a look?`);
    await testerPage.getByRole("button", { name: /^comment$/i }).click();
    await expect(testerPage.getByText("can you take a look")).toBeVisible();

    await expect(managerPage.getByText("You were mentioned", { exact: true })).toBeVisible({
      timeout: 10000,
    });

    await managerContext.close();
    await testerContext.close();
  });
});
