import { defineConfig } from "@playwright/test";
import motionConfig from "./playwright.motion.config";

export default defineConfig({
  ...motionConfig,
  testMatch: ["**/scroll.e2e.ts", "**/motion.e2e.ts", "**/demos.e2e.ts"],
});
