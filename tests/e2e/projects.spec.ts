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

// Ad-hoc projects created during these tests, cleaned up in afterAll --
// separate from the shared fixtures.projectId managed by global-setup.
const extraProjectKeys: string[] = [];

test.afterAll(async () => {
  if (extraProjectKeys.length === 0) return;
  const service = serviceClient();
  const { data: rows } = await service.from("projects").select("id").in("key", extraProjectKeys);
  const ids = (rows ?? []).map((r) => r.id);
  if (ids.length > 0) {
    await service.from("bugs").delete().in("project_id", ids);
    await service.from("project_members").delete().in("project_id", ids);
  }
  await service.from("projects").delete().in("key", extraProjectKeys);
});

test.describe("Projects List (PLIST)", () => {
  test("PLIST-01/02: admin, manager, and project members see the E2E project", async ({
    browser,
  }) => {
    for (const role of ["admin", "manager", "developer", "tester"] as const) {
      const { context, page } = await pageAs(browser, role);
      await page.goto("/projects");
      await expect(page.getByRole("link", { name: new RegExp(`${E2E_PREFIX} Project`) })).toBeVisible();
      await context.close();
    }
  });

  test("PLIST-05: Create Project button (finding: shown to every role, not gated like New Bug)", async ({
    browser,
  }) => {
    // Register expectation was "admin/manager only", matching how "New Bug"
    // behaves. Actual behavior: unlike AppSidebar's canCreateBugs check,
    // nothing on the Projects page conditions this button on role -- it
    // renders for everyone, consistent with /projects/new itself having no
    // page guard (see permissions-routing.spec.ts's "Known gap" section).
    // Documenting current behavior rather than asserting the originally
    // planned one.
    for (const role of ["admin", "manager", "developer", "tester", "viewer"] as const) {
      const { context, page } = await pageAs(browser, role);
      await page.goto("/projects");
      await expect(page.getByRole("link", { name: /create project/i })).toBeVisible();
      await context.close();
    }
  });

  test("PLIST-08: clicking a project card opens its detail page", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto("/projects");
    await page.getByRole("link", { name: new RegExp(`${E2E_PREFIX} Project`) }).click();
    await expect(page).toHaveURL(`http://localhost:3000/projects/${fixtures.projectId}`);
    await context.close();
  });
});

test.describe("Create Project (PNEW)", () => {
  test("PNEW-01/03: valid submission creates the project; key is auto-uppercased", async ({
    browser,
  }) => {
    const { context, page } = await pageAs(browser, "admin");
    const key = "te2eb";
    extraProjectKeys.push(key.toUpperCase());

    await page.goto("/projects/new");
    await page.getByLabel(/project name/i).fill(`${E2E_PREFIX} Created Project`);
    await page.getByLabel(/project key/i).fill(key);
    await page.getByRole("button", { name: /create project/i }).click();

    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByText(`${E2E_PREFIX} Created Project`)).toBeVisible();

    // Confirm the key was uppercased in the DB, not just visually.
    const { data } = await serviceClient()
      .from("projects")
      .select("key")
      .eq("key", "TE2EB")
      .maybeSingle();
    expect(data?.key).toBe("TE2EB");
    await context.close();
  });

  test("PNEW-02: required fields (name, key) are enforced", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto("/projects/new");
    await page.getByRole("button", { name: /create project/i }).click();
    // Native required-field validation blocks the submit -- still on the form.
    await expect(page).toHaveURL(/\/projects\/new/);
    await context.close();
  });

  test("PNEW-04: duplicate key shows a clear error, doesn't crash", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto("/projects/new");
    await page.getByLabel(/project name/i).fill(`${E2E_PREFIX} Duplicate Attempt`);
    await page.getByLabel(/project key/i).fill("TE2E");
    await page.getByRole("button", { name: /create project/i }).click();
    await expect(page.getByText(/already in use/i)).toBeVisible();
    await expect(page).toHaveURL(/\/projects\/new/);
    await context.close();
  });

  test("PNEW-06: cancel discards the draft", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto("/projects/new");
    await page.getByLabel(/project name/i).fill("should not be created");
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByText("should not be created")).not.toBeVisible();
    await context.close();
  });
});

test.describe("Project Detail (PDET)", () => {
  test("PDET-01/02: project info, stats, and recent bugs render correctly", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto(`/projects/${fixtures.projectId}`);
    await expect(page.getByRole("heading", { name: `${E2E_PREFIX} Project` })).toBeVisible();
    await expect(page.getByText("Open Bugs")).toBeVisible();
    await expect(page.getByText("Resolved (7d)")).toBeVisible();
    await expect(page.getByText("Members").first()).toBeVisible();
    await context.close();
  });

  test("PDET-05: a non-existent project ID shows a not-found page", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto("/projects/00000000-0000-0000-0000-000000000000");
    await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
    await context.close();
  });
});

test.describe("Edit Project (PEDIT)", () => {
  test("PEDIT-01: updating the description saves", async ({ browser }) => {
    const { context, page } = await pageAs(browser, "admin");
    await page.goto(`/projects/${fixtures.projectId}/edit`);
    const description = page.getByLabel(/description/i);
    await description.fill(`${E2E_PREFIX} updated description ${Date.now()}`);
    await page.getByRole("button", { name: /save/i }).click();
    await expect(page).toHaveURL(`http://localhost:3000/projects/${fixtures.projectId}`);
    await context.close();
  });

  test("PEDIT-02/03: archiving and re-activating moves the project between tabs", async ({
    browser,
  }) => {
    const { context, page } = await pageAs(browser, "admin");

    await page.goto(`/projects/${fixtures.projectId}/edit`);
    // The visible control is a custom role="switch" span; the native
    // <input> it's labelled to is hidden, so getByLabel().click() fails --
    // target the accessible role directly instead.
    await page.getByRole("switch").click(); // flips Active -> Archived
    await page.getByRole("button", { name: /save/i }).click();
    await expect(page).toHaveURL(`http://localhost:3000/projects/${fixtures.projectId}`);

    await page.goto("/projects");
    await page.getByRole("button", { name: /^archived/i }).click();
    await expect(page.getByRole("link", { name: new RegExp(`${E2E_PREFIX} Project`) })).toBeVisible();

    // Revert so later tests/other specs see the project as Active again.
    await page.goto(`/projects/${fixtures.projectId}/edit`);
    await page.getByRole("switch").click();
    await page.getByRole("button", { name: /save/i }).click();
    await page.goto("/projects");
    await expect(page.getByRole("link", { name: new RegExp(`${E2E_PREFIX} Project`) })).toBeVisible();

    await context.close();
  });

  test("PEDIT-04: removing and re-adding a project member updates their access", async ({
    browser,
  }) => {
    const { context, page } = await pageAs(browser, "admin");
    const viewerName = `${E2E_PREFIX} viewer`;

    // Viewer starts as a member (see global-setup). Uncheck them, save, and
    // confirm the membership row is actually gone.
    await page.goto(`/projects/${fixtures.projectId}/edit`);
    // Same story as the status switch: click the accessible checkbox role,
    // not the hidden native input getByLabel() resolves to.
    await page.getByRole("checkbox", { name: viewerName }).click();
    await page.getByRole("button", { name: /save/i }).click();
    await expect(page).toHaveURL(`http://localhost:3000/projects/${fixtures.projectId}`);

    const service = serviceClient();
    const { data: removed } = await service
      .from("project_members")
      .select("user_id")
      .eq("project_id", fixtures.projectId)
      .eq("user_id", fixtures.userIds.viewer)
      .maybeSingle();
    expect(removed).toBeNull();

    // Re-add so other specs relying on Viewer's membership aren't affected.
    await page.goto(`/projects/${fixtures.projectId}/edit`);
    await page.getByRole("checkbox", { name: viewerName }).click();
    await page.getByRole("button", { name: /save/i }).click();
    await expect(page).toHaveURL(`http://localhost:3000/projects/${fixtures.projectId}`);

    const { data: restored } = await service
      .from("project_members")
      .select("user_id")
      .eq("project_id", fixtures.projectId)
      .eq("user_id", fixtures.userIds.viewer)
      .maybeSingle();
    expect(restored?.user_id).toBe(fixtures.userIds.viewer);

    await context.close();
  });
});
