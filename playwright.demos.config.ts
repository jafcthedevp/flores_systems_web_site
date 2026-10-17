import { defineConfig } from "@playwright/test";
import motionConfig from "./playwright.motion.config";

export default defineConfig({
  ...motionConfig,
  testMatch: "**/demos.e2e.ts",
});
