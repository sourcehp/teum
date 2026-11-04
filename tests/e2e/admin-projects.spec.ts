import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { adminClient, LOCAL_ADMIN, sql } from "../db/helpers";

const TITLE = "E2E 성수동 32평 아파트";
const SLUG = "e2e-성수동-32평-아파트";
const PHOTO = path.join(process.cwd(), "tests", "e2e", "fixtures", "room.jpg");

async function cleanup() {
  const rows = await sql<{ id: string }>(`select id from public.projects where slug like 'e2e-%'`);
  for (const r of rows) {
    const storage = (await adminClient()).storage.from("media");
    const { data } = await storage.list(`projects/${r.id}`);
    if (data?.length) await storage.remove(data.map((f) => `projects/${r.id}/${f.name}`));
  }
  await sql(`delete from public.projects where slug like 'e2e-%'`);
}

test.beforeEach(cleanup);
test.afterEach(cleanup);

async function login(page: Page, next: string) {
  await page.goto(next);
  await page.getByLabel("이메일").fill(LOCAL_ADMIN.email);
  await page.getByLabel("비밀번호").fill(LOCAL_ADMIN.password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(new RegExp(next.replace(/[/?]/g, "\\$&") + "$"));
}

async function upload(page: Page, count: number) {
  await page.getByTestId("photo-input").setInputFiles(Array.from({ length: count }, () => PHOTO));
}

test("사례 등록, 사진 업로드, 공개, 비공개, 삭제", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await login(page, "/admin/projects/new");

  await page.getByLabel("제목", { exact: true }).fill(TITLE);
  await page.getByLabel("주거").check();
  await page.getByLabel(/^공개/).check();
  await page.getByRole("button", { name: "사례 만들기" }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f-]{36}$/);
  const projectId = page.url().split("/").pop()!;
  await expect(page.getByRole("heading", { name: TITLE })).toBeVisible();
  await expect(page.getByLabel("주소(URL)")).toHaveValue(SLUG);

  // 사진 2장 업로드: 첫 사진은 자동으로 대표가 된다.
  await upload(page, 1);
  const rows = page.getByTestId("photo-row");
  await expect(rows).toHaveCount(1, { timeout: 30_000 });
  await expect(rows.first()).toContainText("대표 사진");
  await upload(page, 1);
  await expect(rows).toHaveCount(2, { timeout: 30_000 });

  // 저장소에는 WebP 로 올라가 있다.
  const objs = await sql<{ name: string; mt: string }>(
    `select name, metadata->>'mimetype' as mt from storage.objects where bucket_id = 'media' and name like $1`,
    [`projects/${projectId}/%`],
  );
  expect(objs).toHaveLength(2);
  for (const o of objs) {
    expect(o.name).toMatch(/\.webp$/);
    expect(o.mt).toBe("image/webp");
  }

  // 두 번째 사진을 대표로 지정
  await rows.nth(1).getByRole("button", { name: "대표로 지정" }).click();
  await expect(rows.nth(1)).toContainText("대표 사진");
  await expect(rows.nth(0)).not.toContainText("대표 사진");
  await rows.nth(1).getByLabel("사진 설명(대체 텍스트)").fill("거실 전경");
  await rows.nth(1).getByLabel("사진 설명(대체 텍스트)").blur();
  await expect(page.getByText("사진 설명을 저장했습니다")).toBeVisible();

  // 공개 페이지
  const publicUrl = `/projects/${encodeURIComponent(SLUG)}`;
  await page.goto(publicUrl);
  await expect(page.getByRole("heading", { level: 1, name: TITLE })).toBeVisible();
  await expect(page.locator('img[alt="거실 전경"]').first()).toBeVisible();

  // 대표 사진을 지우면 자리표시로 렌더된다(깨지지 않음).
  await page.goto(`/admin/projects/${projectId}`);
  await expect(rows).toHaveCount(2);
  await rows.nth(1).getByRole("button", { name: "삭제" }).click();
  await expect(rows).toHaveCount(1);
  const left = await sql<{ n: string }>(`select count(*)::text as n from storage.objects where bucket_id = 'media' and name like $1`, [
    `projects/${projectId}/%`,
  ]);
  expect(left[0].n).toBe("1");
  const res = await page.goto(publicUrl);
  expect(res?.status()).toBe(200);
  await expect(page.getByTestId("cover-placeholder")).toBeVisible();

  // 공개 해제 → 404
  await page.goto(`/admin/projects/${projectId}`);
  await page.getByLabel(/^공개/).uncheck();
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page.getByText("저장했습니다", { exact: true })).toBeVisible();
  const hidden = await page.goto(publicUrl);
  expect(hidden?.status()).toBe(404);

  // 목록에 비공개 배지로 보이고, 삭제하면 행과 저장소 파일이 모두 사라진다.
  await page.goto("/admin/projects");
  await expect(page.getByRole("link", { name: new RegExp(TITLE) })).toContainText("비공개");
  await page.goto(`/admin/projects/${projectId}`);
  await page.getByRole("button", { name: "사례 삭제" }).click();
  await expect(page).toHaveURL(/\/admin\/projects$/);
  await expect(page.getByRole("link", { name: new RegExp(TITLE) })).toHaveCount(0);
  const gone = await sql<{ n: string }>(`select count(*)::text as n from storage.objects where bucket_id = 'media' and name like $1`, [
    `projects/${projectId}/%`,
  ]);
  expect(gone[0].n).toBe("0");
});

test("같은 제목이면 주소 뒤에 번호가 붙고, 빈 제목은 안내 문구를 보여준다", async ({ page }) => {
  await login(page, "/admin/projects/new");
  await page.getByLabel("제목", { exact: true }).fill(TITLE);
  await page.getByRole("button", { name: "사례 만들기" }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f-]{36}$/);

  await page.goto("/admin/projects/new");
  await page.getByLabel("제목", { exact: true }).fill(TITLE);
  await page.getByLabel("지역").fill("서울");
  await page.getByLabel("공사 기간(주)").fill("8");
  await page.getByRole("button", { name: "사례 만들기" }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f-]{36}$/);
  await expect(page.getByLabel("주소(URL)")).toHaveValue(`${SLUG}-2`);

  await page.getByLabel("제목", { exact: true }).fill("   ");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page.getByText("제목을 입력해 주세요").first()).toBeVisible();
  await expect(page.getByLabel("지역")).toHaveValue("서울"); // 입력한 내용이 지워지지 않는다
});

test("사진 한 장이 실패해도 나머지는 올라가고 다시 시도할 수 있다", async ({ page }) => {
  await login(page, "/admin/projects/new");
  await page.getByLabel("제목", { exact: true }).fill(TITLE);
  await page.getByRole("button", { name: "사례 만들기" }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f-]{36}$/);

  await page.getByTestId("photo-input").setInputFiles([
    { name: "broken.jpg", mimeType: "image/jpeg", buffer: Buffer.from("not an image") },
    { name: "room.jpg", mimeType: "image/jpeg", buffer: readFileSync(PHOTO) },
  ]);
  await expect(page.getByTestId("photo-row")).toHaveCount(1, { timeout: 30_000 });
  const status = page.getByRole("list", { name: "업로드 상태" });
  await expect(status).toContainText("이 형식의 사진은 올릴 수 없습니다");
  await expect(status.getByRole("button", { name: "다시 시도" })).toBeVisible();
});
