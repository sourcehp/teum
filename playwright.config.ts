import { defineConfig, devices } from "@playwright/test";

// 최소 설정. webServer/projects는 Task 9에서 완성한다.
export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
