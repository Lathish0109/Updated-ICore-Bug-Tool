// Safety net for the RLS test suite (tests/rls). If a run crashes between
// seeding and its afterAll cleanup, this sweeps any TEST_RLS-tagged rows and
// icoretest.local auth users left behind. Safe to run any time -- it's a
// no-op if there's nothing to clean up.
//
// Usage: node scripts/cleanup-test-data.mjs

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  try {
    const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of text.split("\n")) {
      const match = /^([A-Z_]+)=(.*)$/.exec(line.trim());
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  } catch {
    // assume already in env
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_PROJECT_KEYS = ["TRLSA", "TRLSB", "TRLSC", "TRLSD", "TRLSE"];

async function main() {
  let removed = 0;

  const { data: projects } = await supabase
    .from("projects")
    .select("id, key")
    .in("key", TEST_PROJECT_KEYS);
  if (projects?.length) {
    const ids = projects.map((p) => p.id);
    await supabase.from("bugs").delete().in("project_id", ids);
    await supabase.from("project_members").delete().in("project_id", ids);
    await supabase.from("projects").delete().in("id", ids);
    removed += projects.length;
    console.log(
      `Removed ${projects.length} leftover test project(s): ${projects.map((p) => p.key).join(", ")}`,
    );
  }

  const { data: strayBugs } = await supabase
    .from("bugs")
    .select("id, title")
    .like("title", "TEST_RLS%");
  if (strayBugs?.length) {
    await supabase
      .from("bugs")
      .delete()
      .in(
        "id",
        strayBugs.map((b) => b.id),
      );
    removed += strayBugs.length;
    console.log(`Removed ${strayBugs.length} leftover test bug(s).`);
  }

  const { data: users } = await supabase.auth.admin.listUsers();
  const testUsers = (users?.users ?? []).filter((u) => u.email?.endsWith("icoretest.local"));
  for (const user of testUsers) {
    await supabase.auth.admin.deleteUser(user.id);
    removed += 1;
  }
  if (testUsers.length > 0) {
    console.log(`Removed ${testUsers.length} leftover test auth user(s).`);
  }

  console.log(removed === 0 ? "Nothing to clean up." : `Done -- removed ${removed} item(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
