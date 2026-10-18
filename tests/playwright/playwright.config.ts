import { defineConfig } from "@playwright/test";
import { projectRoot, testResultsDir } from "./paths";
export default defineConfig({
  testDir: ".",
  outputDir: testResultsDir,
  testMatch: "**/frontend.e2e.ts",
  workers: 1,
  use: {
    baseURL: "http://localhost:3100",
    channel:
      process.env.PLAYWRIGHT_CHANNEL ||
      (process.platform === "win32" ? "msedge" : undefined),
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    cwd: projectRoot,
    command: "npm run build && npm run start -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      QUOTE_RATE_LIMIT_ENABLED: "false",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      SUPABASE_SECRET_KEY: "",
      FRONTEND_PREVIEW: "false",
    },
    timeout: 180000,
  },
});
