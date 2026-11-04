import { expect, test, type Page } from "@playwright/test";
import { LOCAL_ADMIN, sql } from "../db/helpers";

async function cleanup() {
  await sql(`delete from public.faqs where question like 'E2E%'`);
  await sql(`delete from public.banners where message like 'E2E%'`);
  await sql(`delete from public.testimonials where customer_label like 'E2E%'`);
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

const seoulToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

test("FAQ 추가 → /process 표시 → 삭제", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  const Q = "E2E 공사 기간은 얼마나 걸리나요?";
  await login(page, "/admin/faqs/new");
  await page.getByLabel("질문").fill(Q);
  await page.getByLabel("답변").fill("평균 8주 정도 걸립니다.");
  await page.getByRole("button", { name: "FAQ 만들기" }).click();
  await expect(page).toHaveURL(/\/admin\/faqs\/[0-9a-f-]{36}$/);

  await page.goto("/process");
  await expect(page.locator("#faq")).toContainText(Q);

  await page.goto("/admin/faqs");
  await expect(page.getByText(Q)).toBeVisible();
  await page.getByText(Q).click();
  await page.getByRole("button", { name: "삭제" }).click();
  await expect(page).toHaveURL(/\/admin\/faqs$/);
  await expect(page.getByText(Q)).toHaveCount(0);

  await page.goto("/process");
  await expect(page.locator("body")).not.toContainText(Q);
});

test("배너 생성 → 홈 상단 표시 → 끄기 → 사라짐, 잘못된 링크와 날짜 거부", async ({ page }) => {
  const MSG = "E2E 가을 상담 이벤트";
  const today = seoulToday();
  await login(page, "/admin/banners/new");

  // 검사 오류: javascript: 링크, 그다음 종료일 < 시작일
  await page.getByLabel("배너 문구").fill(MSG);
  await page.getByLabel("연결 링크").fill("javascript:alert(1)");
  await page.getByLabel("시작일").fill(today);
  await page.getByLabel("종료일").fill(today);
  await page.getByRole("button", { name: "배너 만들기" }).click();
  await expect(page.getByText(/사이트 내부 주소나 https/).first()).toBeVisible();
  await expect(page.getByLabel("배너 문구")).toHaveValue(MSG);

  await page.getByLabel("연결 링크").fill("/contact");
  await page.getByLabel("종료일").fill("2000-01-01");
  await page.getByRole("button", { name: "배너 만들기" }).click();
  await expect(page.getByText("종료일은 시작일 이후여야 합니다")).toBeVisible();

  await page.getByLabel("연결 링크").fill("/contact");
  await page.getByLabel("종료일").fill(today);
  await page.getByRole("button", { name: "배너 만들기" }).click();
  await expect(page).toHaveURL(/\/admin\/banners\/[0-9a-f-]{36}$/);

  await page.goto("/admin/banners");
  await expect(page.getByRole("listitem").filter({ hasText: MSG })).toContainText("노출 중");

  await page.goto("/");
  await expect(page.getByRole("link", { name: MSG })).toBeVisible();

  await page.goto("/admin/banners");
  await page.getByText(MSG).click();
  await page.getByLabel(/^사용/).uncheck();
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page.getByText("저장했습니다", { exact: true })).toBeVisible();

  await page.goto("/admin/banners");
  await expect(page.getByRole("listitem").filter({ hasText: MSG })).toContainText("꺼짐");
  await page.goto("/");
  await expect(page.getByText(MSG)).toHaveCount(0);
});

test("후기 추가(사례 연결 안 함) → 목록 → 삭제", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  const NAME = "E2E 김OO님";
  await login(page, "/admin/testimonials/new");
  await page.getByLabel("고객 표기").fill(NAME);
  await page.getByLabel("공간 표기").fill("32평 아파트");
  await page.getByLabel("별점").selectOption("4");
  await page.getByLabel("후기 내용").fill("E2E 꼼꼼하게 시공해 주셨어요.");
  await expect(page.getByLabel("연결할 시공 사례")).toHaveValue("");
  await page.getByRole("button", { name: "후기 만들기" }).click();
  await expect(page).toHaveURL(/\/admin\/testimonials\/[0-9a-f-]{36}$/);
  const rows = await sql<{ rating: number; project_id: string | null }>(
    `select rating, project_id from public.testimonials where customer_label = $1`,
    [NAME],
  );
  expect(rows).toEqual([{ rating: 4, project_id: null }]);

  await page.goto("/admin/testimonials");
  await page.getByText(NAME).click();
  await page.getByRole("button", { name: "삭제" }).click();
  await expect(page).toHaveURL(/\/admin\/testimonials$/);
  await expect(page.getByText(NAME)).toHaveCount(0);
});
