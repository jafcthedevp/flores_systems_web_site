import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/motion.e2e.ts",
  workers: 1,
  use: {
    baseURL: "http://localhost:3102",
    channel: process.platform === "win32" ? "msedge" : undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run build && npm run start -- --port 3102",
    url: "http://localhost:3102",
    timeout: 180000,
    env: {
      NEXT_DIST_DIR: ".next-motion",
      QUOTE_RATE_LIMIT_ENABLED: "false",
      SUPABASE_SECRET_KEY: "",
      FRONTEND_PREVIEW: "false",
    },
  },
});
