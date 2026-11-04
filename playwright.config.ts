import { readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// .env.test(로컬 Supabase 전용 값)를 읽어 서버와 테스트 프로세스에 모두 주입한다.
function loadEnv(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return out;
}

const env = loadEnv(".env.test");
Object.assign(process.env, env);
// 로컬 서버에는 프록시를 거치지 않는다.
process.env.NO_PROXY = [process.env.NO_PROXY, "localhost", "127.0.0.1"].filter(Boolean).join(",");
process.env.no_proxy = process.env.NO_PROXY;

const PORT = 3000;

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && npm run start",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { ...env, NO_PROXY: process.env.NO_PROXY, no_proxy: process.env.NO_PROXY, PORT: String(PORT) },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // 관리자 E2E는 데스크톱에서만 돈다(문의 접수만 모바일도 확인).
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /inquiry\.spec\.ts/ },
  ],
});
