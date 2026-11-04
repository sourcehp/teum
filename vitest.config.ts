import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
      // server-only는 react-server 밖에서 import하면 던지므로 테스트에서는 빈 모듈로 대체
      "server-only": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "tests/stubs/empty.ts"),
    },
  },
  test: {
    // 컴포넌트 테스트는 파일 상단에 `// @vitest-environment jsdom` 지정
    environment: "node",
    env: loadEnv("test", process.cwd(), ""),
  },
});
