import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts", "test/ui/**/*.test.tsx"],
    passWithNoTests: true,
    environmentMatchGlobs: [["test/ui/**", "jsdom"]],
  },
});
