import { expect, test, type Page } from "@playwright/test";
import { LOCAL_ADMIN, sql } from "../db/helpers";

const NEW_PASSWORD = "teum-e2e-changed-9!";

// 비밀번호를 바꾼 테스트가 중간에 실패해도 다른 스펙이 로그인할 수 있도록 원래 값으로 되돌린다.
test.afterEach(async () => {
  await sql(`update auth.users set encrypted_password = crypt($1, gen_salt('bf')) where email = $2`, [LOCAL_ADMIN.password, LOCAL_ADMIN.email]);
});

async function login(page: Page, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("이메일").fill(LOCAL_ADMIN.email);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function changeTo(page: Page, password: string, confirm = password) {
  await page.goto("/admin/account");
  await page.getByLabel("새 비밀번호", { exact: true }).fill(password);
  await page.getByLabel("새 비밀번호 확인").fill(confirm);
  await page.getByRole("button", { name: "비밀번호 변경" }).click();
}

test("비밀번호를 바꾸면 새 비밀번호로 다시 로그인할 수 있다", async ({ page }) => {
  await login(page, LOCAL_ADMIN.password);
  await expect(page.getByRole("navigation", { name: "관리자 메뉴" }).getByRole("link", { name: "내 계정" })).toBeVisible();

  await changeTo(page, NEW_PASSWORD);
  await expect(page.getByText("비밀번호를 변경했습니다")).toBeVisible();

  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);

  // 예전 비밀번호는 더 이상 통하지 않는다.
  await page.getByLabel("이메일").fill(LOCAL_ADMIN.email);
  await page.getByLabel("비밀번호").fill(LOCAL_ADMIN.password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.locator("form [role=alert]")).toHaveText("이메일 또는 비밀번호가 올바르지 않습니다");

  await login(page, NEW_PASSWORD);

  // 원래 비밀번호로 되돌린다.
  await changeTo(page, LOCAL_ADMIN.password);
  await expect(page.getByText("비밀번호를 변경했습니다")).toBeVisible();
});

test("확인 값이 다르면 변경하지 않고 안내한다", async ({ page }) => {
  await login(page, LOCAL_ADMIN.password);
  await changeTo(page, NEW_PASSWORD, NEW_PASSWORD + "x");
  await expect(page.locator("form [role=alert]")).toHaveText("새 비밀번호와 확인 값이 일치하지 않습니다");
});
