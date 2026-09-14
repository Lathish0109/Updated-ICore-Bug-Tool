import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import { expect, test, type Browser } from "@playwright/test";

import { AUTH_DIR, E2E_PREFIX, loadEnvLocal, readFixtures } from "./fixtures";

loadEnvLocal();
const fixtures = readFixtures();

function serviceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function pageAs(browser: Browser, role: "admin" | "manager" | "developer" | "tester" | "viewer") {
  const context = await browser.newContext({
    storageState: path.resolve(AUTH_DIR, `${role}.json`),
  });
  return { context, page: await context.newPage() };
}

const extraBugIds: string[] = [];
let isolatedBugId: string;
let isolatedProjectId: string;

test.beforeAll(async () => {
  // A bug in a project none of the E2E test users belong to, for the
  // non-member-cannot-access check (BDET-10).
  const service = serviceClient();
  await service.from("projects").delete().eq("key", "TE2EC");
  const { data: project } = await service
    .from("projects")
    .insert({ name: `${E2E_PREFIX} Isolated Project`, key: "TE2EC" })
    .select("id")
    .single();
  isolatedProjectId = project!.id;
  const { data: bug } = await service
    .from("bugs")
    .insert({
      project_id: isolatedProjectId,
      title: `${E2E_PREFIX} isolated bug`,
      steps_to_reproduce: "n/a",
      severity: "low",
      priority: "p4",
      source: "manual",
      reporter_id: fixtures.userIds.manager,
      sequence_number: 0,
    })
    .select("id")
    .single();
  isolatedBugId = bug!.id;
});

test.afterAll(async () => {
  const service = serviceClient();
  if (extraBugIds.length > 0) await service.from("bugs").delete().in("id", extraBugIds);
  await service.from("bugs").delete().eq("project_id", isolatedProjectId);
  await service.from("projects").delete().eq("key", "TE2EC");
});

test.describe("Create Bug validation (BNEW-02..05)", () => {
  test("required fields block submit: Title, Project, Severity, Steps", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto("/bugs/new");
    // Nothing filled in -- the submit button starts disabled, not clickable.
    await expect(page.getByRole("button", { name: /create bug/i })).toBeDisabled();

    // Title only -- Project/Severity still unselected, submit stays disabled.
    await page.getByLabel(/bug title/i).fill("Missing project and severity");
    await expect(page.getByRole("button", { name: /create bug/i })).toBeDisabled();
    await context.close();
  });

  test("BNEW-06: optional fields (Expected/Actual/Context) can be left blank", async ({
    browser,
  }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto("/bugs/new");
    await page.getByLabel(/bug title/i).fill(`${E2E_PREFIX} optional-fields-blank`);
    await page.getByLabel(/^project/i).click();
    await page.getByRole("option", { name: `${E2E_PREFIX} Project` }).click();
    await page.getByLabel(/^severity/i).click();
    await page.getByRole("option", { name: "Low" }).click();
    await page.getByLabel(/steps to reproduce/i).fill("n/a");
    await page.getByRole("button", { name: /create bug/i }).click();
    await expect(page).toHaveURL(/\/bugs\/[0-9a-f-]+$/);
    extraBugIds.push(page.url().split("/").pop()!);
    await context.close();
  });

  test("BNEW-08: assignee dropdown excludes Viewer", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto("/bugs/new");
    await page.getByLabel(/^assignee/i).click();
    await expect(page.getByRole("option", { name: `${E2E_PREFIX} developer` })).toBeVisible();
    await expect(page.getByRole("option", { name: `${E2E_PREFIX} viewer` })).toHaveCount(0);
    await context.close();
  });
});

test.describe("Bug Detail (BDET)", () => {
  test("BDET-01: bug fields render correctly", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto(`/bugs/${isolatedBugId}`);
    await expect(page.getByRole("heading", { name: `${E2E_PREFIX} isolated bug` })).toBeVisible();
    await expect(page.getByText("Steps to Reproduce")).toBeVisible();
    await expect(page.getByText(`${E2E_PREFIX} Isolated Project`)).toBeVisible();
    await context.close();
  });

  test("BDET-03: Edit is visible to the assignee, hidden from an uninvolved Developer", async ({
    browser,
  }) => {
    const service = serviceClient();
    const { data: bug } = await service
      .from("bugs")
      .insert({
        project_id: fixtures.projectId,
        title: `${E2E_PREFIX} edit-permission bug`,
        steps_to_reproduce: "n/a",
        severity: "low",
        priority: "p4",
        source: "manual",
        reporter_id: fixtures.userIds.manager,
        assignee_id: fixtures.userIds.tester,
        sequence_number: 0,
      })
      .select("id")
      .single();
    extraBugIds.push(bug!.id);

    const asTester = await pageAs(browser, "tester");
    await asTester.page.goto(`/bugs/${bug!.id}`);
    await expect(asTester.page.getByRole("link", { name: /edit/i })).toBeVisible();
    await asTester.context.close();

    const asDeveloper = await pageAs(browser, "developer");
    await asDeveloper.page.goto(`/bugs/${bug!.id}`);
    await expect(asDeveloper.page.getByRole("link", { name: /edit/i })).toHaveCount(0);
    await asDeveloper.context.close();
  });

  test("BDET-04: adding a comment shows it immediately", async ({ browser }) => {
    // manager, not tester -- the isolated project has no project_members
    // rows, and manager is the one role that bypasses that check.
    const { context, page } = await pageAs(browser, "manager");
    const body = `${E2E_PREFIX} comment ${Date.now()}`;
    await page.goto(`/bugs/${isolatedBugId}`);
    await page.getByPlaceholder(/add a comment/i).fill(body);
    await page.getByRole("button", { name: /^comment$/i }).click();
    await expect(page.getByText(body)).toBeVisible();
    await context.close();
  });

  test("BDET-10: a non-member cannot open a bug outside their projects", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "developer");
    await page.goto(`/bugs/${isolatedBugId}`);
    await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
    await context.close();
  });

  test("BDET-12: a non-existent bug ID shows a not-found page", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto("/bugs/00000000-0000-0000-0000-000000000000");
    await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
    await context.close();
  });
});

test.describe("Edit Bug (BEDIT)", () => {
  test("BEDIT-01: updating fields saves and redirects to detail", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto(`/bugs/${isolatedBugId}/edit`);
    const newTitle = `${E2E_PREFIX} isolated bug (edited)`;
    await page.getByLabel(/bug title/i).fill(newTitle);
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page).toHaveURL(`http://localhost:3000/bugs/${isolatedBugId}`);
    await expect(page.getByRole("heading", { name: newTitle })).toBeVisible();
    await context.close();
  });

  test("BEDIT-03: reassigning notifies the new assignee live", async ({ browser }) => {
    const devContext = await pageAs(browser, "developer");
    await devContext.page.goto("/dashboard");
    await expect(devContext.page.getByRole("heading", { name: /overview/i })).toBeVisible();
    await devContext.page.waitForTimeout(1500);

    const admin = await pageAs(browser, "admin");
    await admin.page.goto(`/bugs/${isolatedBugId}/edit`);
    await admin.page.getByLabel(/^assignee/i).click();
    await admin.page.getByRole("option", { name: `${E2E_PREFIX} developer` }).click();
    await admin.page.getByRole("button", { name: /save changes/i }).click();
    await expect(admin.page).toHaveURL(`http://localhost:3000/bugs/${isolatedBugId}`);
    await admin.context.close();

    await expect(devContext.page.getByText("Bug assigned")).toBeVisible({ timeout: 10000 });
    await devContext.context.close();
  });
});
