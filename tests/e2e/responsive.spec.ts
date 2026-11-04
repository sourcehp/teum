import { expect, test } from "@playwright/test";
import { sql } from "../db/helpers";

// 360px 폭에서 가로 스크롤이 생기지 않아야 한다(데스크톱 프로젝트에서 뷰포트만 좁혀 확인).
test.use({ viewport: { width: 360, height: 780 } });

async function firstProjectPath(): Promise<string> {
  const rows = await sql<{ slug: string }>(
    `select slug from public.projects where is_published order by created_at limit 1`,
  );
  if (!rows[0]) throw new Error("공개된 사례가 없습니다.");
  return `/projects/${encodeURIComponent(rows[0].slug)}`;
}

const STATIC_PATHS = ["/", "/projects", "/about", "/process", "/contact", "/privacy", "/없는-페이지-404"];

for (const path of STATIC_PATHS) {
  test(`360px 가로 스크롤 없음: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: "load" });
    // 스크롤 등장 모션(clip-path)이 끝나도록 페이지 끝까지 한 번 내려 본다.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(360);
  });
}

test("360px 가로 스크롤 없음: 사례 상세", async ({ page }) => {
  await page.goto(await firstProjectPath(), { waitUntil: "load" });
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(360);
});
