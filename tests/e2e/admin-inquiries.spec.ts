import { expect, test, type Page } from "@playwright/test";
import { insertInquiry, LOCAL_ADMIN, sql } from "../db/helpers";

let id = "";

test.beforeEach(async () => {
  id = await insertInquiry();
  await sql(
    `update public.inquiries set name = '문의테스트고객', utm_source = 'e2e-channel', message = '=HYPERLINK("x")' where id = $1`,
    [id],
  );
});

test.afterEach(async () => {
  await sql(`delete from public.inquiries where id = $1`, [id]);
});

async function login(page: Page, next: string) {
  await page.goto(next);
  await page.getByLabel("이메일").fill(LOCAL_ADMIN.email);
  await page.getByLabel("비밀번호").fill(LOCAL_ADMIN.password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(new RegExp(next.replace(/[/?]/g, "\\$&") + "$"));
}

test("문의 확인, 상태 변경, CSV, 통계", async ({ page }) => {
  await login(page, "/admin/inquiries");

  const row = page.getByRole("row", { name: /문의테스트고객/ });
  await expect(row).toBeVisible();
  await expect(row).toContainText("신규");
  await row.getByRole("link", { name: "문의테스트고객" }).click();

  await expect(page).toHaveURL(new RegExp(`/admin/inquiries/${id}$`));
  await expect(page.getByRole("link", { name: "010-0000-0000" })).toHaveAttribute("href", "tel:01000000000");
  await page.getByLabel("상태").selectOption("in_progress");
  await page.getByLabel("메모").fill("E2E 메모");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page.getByRole("status")).toHaveText("저장했습니다");

  await page.goto("/admin/inquiries?status=in_progress");
  await expect(page.getByRole("row", { name: /문의테스트고객/ })).toContainText("상담중");
  await page.goto("/admin/inquiries?status=new");
  await expect(page.getByRole("row", { name: /문의테스트고객/ })).toHaveCount(0);

  const res = await page.request.get("/admin/inquiries/export");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("text/csv; charset=utf-8");
  expect(res.headers()["content-disposition"]).toMatch(/attachment; filename="inquiries-\d{8}\.csv"/);
  const body = await res.body();
  expect([...body.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
  const text = body.toString("utf8");
  expect(text).toContain("문의테스트고객");
  expect(text).toContain("E2E 메모");
  expect(text).toContain("'=HYPERLINK");

  await page.goto("/admin/stats");
  await expect(page.getByRole("row", { name: /e2e-channel/ })).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible();
});

test("로그인 없이 CSV 내보내기는 로그인으로 이동한다", async ({ request }) => {
  const res = await request.get("/admin/inquiries/export", { maxRedirects: 0 });
  expect([302, 303, 307, 308]).toContain(res.status());
  expect(res.headers()["location"]).toContain("/admin/login");
});
