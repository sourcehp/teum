import { expect, test } from "@playwright/test";

const EMAIL = "admin@teum.local";
const PASSWORD = "teum-local-admin-1!";

test("비로그인으로 관리자 화면에 가면 로그인으로 이동한다", async ({ page }) => {
  await page.goto("/admin/projects");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fprojects$/);
  await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
});

test("틀린 비밀번호는 오류 문구를 보여준다", async ({ page }) => {
  await page.goto("/admin/login", { waitUntil: "load" });
  await page.getByLabel("이메일").fill(EMAIL);
  await page.getByLabel("비밀번호").fill("wrong-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.locator("form [role=alert]")).toHaveText("이메일 또는 비밀번호가 올바르지 않습니다");
});

test("로그인하면 원래 경로로 이동하고 로그아웃할 수 있다", async ({ page }) => {
  await page.goto("/admin?from=e2e");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%3Ffrom%3De2e$/);
  await page.getByLabel("이메일").fill(EMAIL);
  await page.getByLabel("비밀번호").fill(PASSWORD);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/admin\?from=e2e$/);
  const nav = page.getByRole("navigation", { name: "관리자 메뉴" });
  for (const label of ["대시보드", "시공 사례", "고객 후기", "FAQ", "이벤트 배너", "상담 문의", "유입 통계", "사이트 설정"]) {
    await expect(nav.getByRole("link", { name: new RegExp(label) })).toBeVisible();
  }
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin$/);
});
