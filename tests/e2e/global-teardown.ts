import { createClient } from "@supabase/supabase-js";

import { E2E_PROJECT_KEY, loadEnvLocal, readFixtures } from "./fixtures";

export default async function globalTeardown() {
  loadEnvLocal();

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let fixtures;
  try {
    fixtures = readFixtures();
  } catch {
    return; // global-setup never got far enough to write fixtures.json
  }

  await service.from("bugs").delete().eq("project_id", fixtures.projectId);
  await service.from("project_members").delete().eq("project_id", fixtures.projectId);
  await service.from("projects").delete().eq("key", E2E_PROJECT_KEY);
  for (const userId of Object.values(fixtures.userIds)) {
    await service.auth.admin.deleteUser(userId);
  }
}
