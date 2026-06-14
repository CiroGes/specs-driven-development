import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "examples/**/*.test.ts"],
    environment: "node",
    // A fresh install has no features/tests yet — keep `npm test` green.
    passWithNoTests: true
  }
});
