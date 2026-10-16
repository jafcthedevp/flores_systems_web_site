import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  testMatch: "**/frontend-preview.e2e.ts",
  use: { ...base.use, baseURL: "http://localhost:3101" },
  webServer: {
    command: "npm run dev -- --port 3101",
    url: "http://localhost:3101",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      FRONTEND_PREVIEW: "true",
      NEXT_DIST_DIR: '.next-frontend-preview',
      NEXT_PUBLIC_HERO_ORBITS: "true",
      QUOTE_RATE_LIMIT_ENABLED: "false",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      SUPABASE_SECRET_KEY: "",
    },
  },
});
