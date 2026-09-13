import path from "node:path";

import { defineConfig } from "vitest/config";

// Layer 2 (permission/RLS tests) runs against the live Supabase project over
// the network, so it's split from the fast, network-free unit suite in
// vitest.config.mts -- `npm test` stays instant; `npm run test:rls` is the
// slower, real-database one, and needs ADMIN_EMAIL/ADMIN_PASSWORD passed at
// invocation (see tests/rls/setup.ts).
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rls/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
