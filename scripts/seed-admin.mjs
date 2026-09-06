// Seeds the permanent admin account. This app has no self-signup (see the
// auth-model-admin-seeded decision) -- the first admin must be created
// directly against Supabase, and every other user after that is created by
// this admin through the Users screen.
//
// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... ADMIN_NAME="Your Name" \
//     node scripts/seed-admin.mjs
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
// .env.local. Safe to re-run: it upserts rather than erroring on a repeat.

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
    // .env.local not present -- assume vars are already in the environment.
  }
}

loadEnvLocal();

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "Admin" } = process.env;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
  process.exit(1);
}
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: existing } = await supabase.auth.admin.listUsers();
  let userId = existing?.users.find((u) => u.email === ADMIN_EMAIL)?.id;

  if (userId) {
    console.log(`Auth user already exists for ${ADMIN_EMAIL}, reusing it.`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Created auth user ${ADMIN_EMAIL}.`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    role: "admin",
    status: "active",
  });
  if (profileError) throw profileError;

  console.log(`Admin profile ready for ${ADMIN_EMAIL}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
