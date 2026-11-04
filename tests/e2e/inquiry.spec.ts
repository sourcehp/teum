import { expect, test, type Page } from "@playwright/test";
import { sql } from "../db/helpers";

// 1단계 서버 액션은 화면 표시 후 3초 안의 제출을 거부한다.
const WAIT_MS = 3500;

let name = "";

test.beforeEach(({}, info) => {
  name = `E2E-${Date.now()}-${info.project.name}`;
});

test.afterEach(async () => {
  await sql(`delete from public.inquiries where name like 'E2E-%'`);
});

async function fillStep1(page: Page) {
  await page.goto("/contact", { waitUntil: "load" });
  await page.getByLabel("이름").fill(name);
  await page.getByLabel("연락처").fill("010 1234 5678");
  await page.getByLabel("공간 유형").selectOption("residential");
  await page.getByLabel(/개인정보 수집·이용 동의/).check();
  await page.waitForTimeout(WAIT_MS);
}

test("1단계와 2단계를 차례로 접수한다", async ({ page }) => {
  await fillStep1(page);
  await page.getByRole("button", { name: "무료 상담 신청" }).click();
  await expect(page.getByText("접수되었습니다. 영업일 기준 1일 안에 연락드립니다.")).toBeVisible();

  await page.getByLabel("문의 내용").fill("E2E 테스트 문의입니다.");
  await page.locator("form").filter({ has: page.getByLabel("문의 내용") }).locator("button[type=submit]").click();
  await expect(page.getByText("추가 정보가 접수되었습니다.")).toBeVisible();

  const rows = await sql<{ phone: string; message: string | null }>(
    `select phone, message from public.inquiries where name = $1`,
    [name],
  );
  expect(rows).toHaveLength(1);
  expect(rows[0].phone).toBe("010-1234-5678");
  expect(rows[0].message).toBe("E2E 테스트 문의입니다.");
});

test("제출 버튼을 연속으로 눌러도 한 건만 저장된다", async ({ page }) => {
  await fillStep1(page);
  await page.getByRole("button", { name: "무료 상담 신청" }).dblclick();
  await expect(page.getByText("접수되었습니다. 영업일 기준 1일 안에 연락드립니다.")).toBeVisible();
  const rows = await sql(`select id from public.inquiries where name = $1`, [name]);
  expect(rows).toHaveLength(1);
});
