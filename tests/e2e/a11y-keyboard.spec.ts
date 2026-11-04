import { expect, test } from "@playwright/test";
import { sql } from "../db/helpers";

// 1단계 서버 액션은 화면 표시 후 3초 안의 제출을 거부한다.
const WAIT_MS = 3500;

let name = "";

test.beforeEach(() => {
  name = `E2E-${Date.now()}-kbd`;
});

test.afterEach(async () => {
  await sql(`delete from public.inquiries where name like 'E2E-%'`);
});

test("키보드만으로 /contact 1단계와 2단계를 접수한다", async ({ page }) => {
  const kb = page.keyboard;
  await page.goto("/contact", { waitUntil: "load" });

  // 포커스를 첫 입력칸에 두고 시작한다(이후는 Tab/Shift+Tab/Space/Enter/문자 입력만 사용).
  await page.getByLabel("이름").focus();
  await kb.type(name);
  await kb.press("Tab");
  await expect(page.getByLabel("연락처")).toBeFocused();
  await kb.type("010 1234 5678");
  await kb.press("Tab");
  await expect(page.getByLabel("공간 유형")).toBeFocused();
  await kb.press("ArrowDown"); // 첫 선택지(주거)
  await expect(page.getByLabel("공간 유형")).toHaveValue("residential");
  await kb.press("Tab");
  await expect(page.getByLabel(/개인정보 수집·이용 동의/)).toBeFocused();

  // Shift+Tab으로 되돌아갔다가 다시 나아가도 값은 유지된다.
  await kb.press("Shift+Tab");
  await expect(page.getByLabel("공간 유형")).toBeFocused();
  await kb.press("Tab");
  await kb.press("Space");
  await expect(page.getByLabel(/개인정보 수집·이용 동의/)).toBeChecked();

  // 동의 문구 안의 "내용 보기" 링크를 지나 제출 버튼으로 간다.
  await kb.press("Tab");
  await expect(page.getByRole("link", { name: "내용 보기" })).toBeFocused();
  await kb.press("Tab");
  const submit = page.getByRole("button", { name: "무료 상담 신청" });
  await expect(submit).toBeFocused();
  await expect(submit).toHaveCSS("outline-style", "solid"); // 포커스 표시가 보인다.

  await page.waitForTimeout(WAIT_MS);
  await kb.press("Enter");
  await expect(page.getByText("접수되었습니다. 영업일 기준 1일 안에 연락드립니다.")).toBeVisible();

  // 2단계: 이메일부터 문의 내용까지 Tab으로 이동해 입력하고 Enter로 보낸다.
  const email = page.getByLabel("이메일");
  await email.focus();
  await kb.type("e2e-kbd@example.com");
  await page.getByLabel("문의 내용").focus();
  await kb.type("키보드 접수 확인");
  await kb.press("Shift+Tab"); // 희망 시기로 되돌아감
  await kb.press("Tab");
  await expect(page.getByLabel("문의 내용")).toBeFocused();
  await kb.press("Tab");
  const send = page.locator("form").filter({ has: page.getByLabel("문의 내용") }).locator("button[type=submit]");
  await expect(send).toBeFocused();
  await kb.press("Enter");
  await expect(page.getByText("추가 정보가 접수되었습니다.")).toBeVisible();

  const rows = await sql<{ email: string | null; message: string | null }>(
    `select email, message from public.inquiries where name = $1`,
    [name],
  );
  expect(rows).toHaveLength(1);
  expect(rows[0].message).toBe("키보드 접수 확인");
});

test("2단계는 키보드로 건너뛸 수 있다", async ({ page }) => {
  const kb = page.keyboard;
  await page.goto("/contact", { waitUntil: "load" });
  await page.getByLabel("이름").focus();
  await kb.type(name);
  await kb.press("Tab");
  await kb.type("02-123-4567");
  await kb.press("Tab");
  await kb.press("ArrowDown");
  await kb.press("Tab");
  await kb.press("Space");
  await kb.press("Tab");
  await kb.press("Tab");
  await page.waitForTimeout(WAIT_MS);
  await kb.press("Enter");
  await expect(page.getByText("접수되었습니다. 영업일 기준 1일 안에 연락드립니다.")).toBeVisible();

  await page.getByLabel("문의 내용").focus();
  await kb.press("Tab"); // 추가 정보 보내기
  await kb.press("Tab"); // 건너뛰기
  const skip = page.getByRole("button", { name: "건너뛰기" });
  await expect(skip).toBeFocused();
  await kb.press("Enter");
  await expect(skip).toHaveCount(0);
  await expect(page.getByText("접수되었습니다. 영업일 기준 1일 안에 연락드립니다.")).toBeVisible();
  const rows = await sql(`select id from public.inquiries where name = $1`, [name]);
  expect(rows).toHaveLength(1);
});
