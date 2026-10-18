import { fileURLToPath } from "node:url";

export const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
export const testResultsDir = fileURLToPath(
  new URL("../../test-results/", import.meta.url),
);
