import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

import {
  AUTH_DIR,
  E2E_PREFIX,
  E2E_PROJECT_KEY,
  E2E_USER_DEFS,
  E2E_USER_PASSWORD,
  FIXTURES_FILE,
  loadEnvLocal,
  type E2eFixtures,
  type E2eUserKey,
} from "./fixtures";

export default async function globalSetup() {
  loadEnvLocal();

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "E2E tests need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL and " +
        "ADMIN_PASSWORD set (the last two are passed at invocation, not stored anywhere).",
    );
  }

  mkdirSync(AUTH_DIR, { recursive: true });

  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: adminProfile, error: adminErr } = await service
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .single();
  if (adminErr || !adminProfile) {
    throw new Error("No admin profile found -- run scripts/seed-admin.mjs first.");
  }

  // Create (or reuse) one temp auth user per non-admin role this suite needs.
  const userIds = {} as Record<E2eUserKey, string>;
  const userNames = {} as Record<E2eUserKey, string>;
  const { data: existingUsers } = await service.auth.admin.listUsers();
  for (const [key, def] of Object.entries(E2E_USER_DEFS)) {
    let userId = existingUsers?.users.find((u) => u.email === def.email)?.id;
    if (!userId) {
      const { data, error } = await service.auth.admin.createUser({
        email: def.email,
        password: E2E_USER_PASSWORD,
        email_confirm: true,
      });
      if (error) throw error;
      userId = data.user.id;
    }
    const fullName = `${E2E_PREFIX} ${def.role}`;
    const { error: profileError } = await service.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      email: def.email,
      role: def.role,
      status: "active",
    });
    if (profileError) throw profileError;
    userIds[key as E2eUserKey] = userId;
    userNames[key as E2eUserKey] = fullName;
  }

  // Fresh project every run.
  await service.from("projects").delete().eq("key", E2E_PROJECT_KEY);
  const { data: project, error: projErr } = await service
    .from("projects")
    .insert({
      name: `${E2E_PREFIX} Project`,
      key: E2E_PROJECT_KEY,
      description: "Playwright E2E fixture",
      created_by: adminProfile.id,
    })
    .select("id")
    .single();
  if (projErr || !project) throw projErr ?? new Error("Failed to create E2E project");

  await service.from("project_members").insert([
    { project_id: project.id, user_id: userIds.developer },
    { project_id: project.id, user_id: userIds.tester },
    { project_id: project.id, user_id: userIds.viewer },
    // Manager membership isn't required for RLS (managers bypass
    // membership checks) but the @mention scan in addComment() queries
    // project_members directly, so a mention target needs a real row here.
    { project_id: project.id, user_id: userIds.manager },
  ]);

  const fixtures: E2eFixtures = { projectId: project.id, userIds, userNames };
  writeFileSync(FIXTURES_FILE, JSON.stringify(fixtures, null, 2));

  // Sign in as each role once and persist the session, so individual specs
  // don't each pay the cost (and flakiness risk) of driving the login form.
  const browser = await chromium.launch();
  const roles: [string, string, string][] = [
    ["admin", ADMIN_EMAIL, ADMIN_PASSWORD],
    ["manager", E2E_USER_DEFS.manager.email, E2E_USER_PASSWORD],
    ["developer", E2E_USER_DEFS.developer.email, E2E_USER_PASSWORD],
    ["tester", E2E_USER_DEFS.tester.email, E2E_USER_PASSWORD],
    ["viewer", E2E_USER_DEFS.viewer.email, E2E_USER_PASSWORD],
  ];
  for (const [name, email, password] of roles) {
    const page = await browser.newPage({ baseURL: "http://localhost:3000" });
    await page.goto("/login");
    await page.getByLabel(/work email/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByRole("button", { name: /login/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.context().storageState({ path: path.resolve(AUTH_DIR, `${name}.json`) });
    await page.close();
  }
  await browser.close();
}
