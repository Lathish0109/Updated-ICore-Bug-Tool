import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

// Layer 3 (E2E). Runs against a real dev server + the live Supabase
// project -- see tests/e2e/global-setup.ts for how fixtures are seeded and
// tests/e2e/global-teardown.ts for how they're torn down. Serial/single
// worker on purpose: tests share one real project's data, and the
// live-notification test specifically needs two browser contexts talking to
// the same running server without another test's writes interleaving.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 30000,
  globalSetup: path.resolve(__dirname, "tests/e2e/global-setup.ts"),
  globalTeardown: path.resolve(__dirname, "tests/e2e/global-teardown.ts"),
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
