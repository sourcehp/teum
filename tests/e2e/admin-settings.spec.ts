import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { adminClient, LOCAL_ADMIN, sql } from "../db/helpers";

const PHOTO = path.join(process.cwd(), "tests", "e2e", "fixtures", "room.jpg");

let original: Record<string, unknown> | undefined;

test.beforeEach(async () => {
  const [row] = await sql<{ j: Record<string, unknown> }>(`select to_jsonb(s) as j from public.site_settings s where id = 1`);
  original = row.j;
});

// 설정을 바꾼 테스트가 있어도 원래 값으로 되돌린다.
test.afterEach(async () => {
  if (!original) return;
  await sql(`update public.site_settings s set (company_name, ceo_name, business_number, address, phone, email, hero_title, hero_subtitle, benefit_text, philosophy_text, ceo_greeting, instagram_url, blog_url, kakao_channel_url, notify_email, ga4_id, naver_site_verification, google_site_verification, logo_path, hero_image_path, ceo_image_path, stats, guarantees, partners) = (select company_name, ceo_name, business_number, address, phone, email, hero_title, hero_subtitle, benefit_text, philosophy_text, ceo_greeting, instagram_url, blog_url, kakao_channel_url, notify_email, ga4_id, naver_site_verification, google_site_verification, logo_path, hero_image_path, ceo_image_path, stats, guarantees, partners from jsonb_populate_record(null::public.site_settings, ($1::text)::jsonb)) where s.id = 1`, [JSON.stringify(original)]);
  // Storage 객체는 SQL 로 지울 수 없어 Storage API 로 지운다.
  const stale = await sql<{ name: string }>(`select name from storage.objects where bucket_id = 'media' and name like 'settings/%'`);
  if (stale.length) await (await adminClient()).storage.from("media").remove(stale.map((r) => r.name));
});

async function login(page: Page, next: string) {
  await page.goto(next);
  await page.getByLabel("이메일").fill(LOCAL_ADMIN.email);
  await page.getByLabel("비밀번호").fill(LOCAL_ADMIN.password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(new RegExp(next.replace(/[/?]/g, "\\$&") + "$"));
}

test("전화번호 변경 저장 → 정규화되어 공개 푸터에 표시", async ({ page }) => {
  await login(page, "/admin/settings");
  await page.getByLabel("대표 전화번호").fill("+82 10 7777 6666");
  await page.getByRole("button", { name: "설정 저장" }).click();
  await expect(page.getByText("저장했습니다")).toBeVisible();
  const [row] = await sql<{ phone: string }>(`select phone from public.site_settings where id = 1`);
  expect(row.phone).toBe("010-7777-6666");

  await page.goto("/");
  await expect(page.locator("footer")).toContainText("010-7777-6666");
});

test("잘못된 값은 항목별 오류를 보여 주고 입력을 지우지 않는다", async ({ page }) => {
  await login(page, "/admin/settings");
  await page.getByLabel("대표 전화번호").fill("abc");
  await page.getByLabel("인스타그램 주소").fill("javascript:alert(1)");
  await page.getByLabel("Google 애널리틱스 측정 ID").fill("UA-123");
  await page.getByRole("button", { name: "설정 저장" }).click();
  await expect(page.getByText("전화번호 형식이 맞지 않습니다")).toBeVisible();
  await expect(page.getByText(/인스타그램 주소는 https/)).toBeVisible();
  await expect(page.getByText(/G-로 시작하는 영문 대문자/)).toBeVisible();
  await expect(page.getByLabel("대표 전화번호")).toHaveValue("abc");
});

test("실적 편집: 예시 안내 → 수정·추가·이동 저장 → 홈에 반영", async ({ page }) => {
  await sql(`update public.site_settings set stats = '[{"label":"누적 시공 사례","value":"120","suffix":"건"},{"label":"고객 만족도","value":"4.8","suffix":"/ 5"},{"label":"평균 공사 기간","value":"7","suffix":"주"},{"label":"하자 접수 후 방문","value":"3","suffix":"일 이내"}]'::jsonb where id = 1`);
  await login(page, "/admin/settings");
  await expect(page.getByText("예시 값입니다. 실제 값으로 바꿔 주세요").first()).toBeVisible();

  await page.getByLabel("실적 1 숫자 (10자 이내)").fill("999");
  await expect(page.getByRole("note").filter({ hasText: "예시 값입니다" })).toHaveCount(1); // 보증 편집기의 안내만 남음
  await page.getByRole("button", { name: "실적 추가" }).click();
  await page.getByLabel("실적 5 이름 (20자 이내)").fill("E2E 신규");
  await page.getByLabel("실적 5 숫자 (10자 이내)").fill("55");
  await page.getByLabel("실적 5 위로").click();
  await page.getByRole("button", { name: "설정 저장" }).click();
  await expect(page.getByText("저장했습니다")).toBeVisible();

  const [row] = await sql<{ stats: { label: string; value: string }[] }>(`select stats from public.site_settings where id = 1`);
  expect(row.stats).toHaveLength(5);
  expect(row.stats[0].value).toBe("999");
  expect(row.stats[3]).toMatchObject({ label: "E2E 신규", value: "55" });

  await page.goto("/");
  await expect(page.locator("body")).toContainText("E2E 신규");
});

test("실적 6개 상한과 빈 행 거부, 로고 업로드 → 교체 시 이전 파일 삭제", async ({ page }) => {
  await login(page, "/admin/settings");
  // 6개 상한: 추가 버튼이 막힌다
  await sql(`update public.site_settings set stats = '[]'::jsonb where id = 1`);
  await page.reload();
  for (let i = 0; i < 6; i++) await page.getByRole("button", { name: "실적 추가" }).click();
  await expect(page.getByRole("button", { name: "실적 추가" })).toBeDisabled();
  // 빈 행은 저장 거부
  await page.getByRole("button", { name: "설정 저장" }).click();
  await expect(page.getByText("실적 항목 이름을 입력해 주세요")).toBeVisible();
  for (let i = 6; i >= 1; i--) await page.getByLabel(`실적 ${i} 삭제`).click();

  // 로고 업로드
  await page.getByLabel("로고 파일 선택").setInputFiles(PHOTO);
  await expect(page.getByRole("button", { name: "사진 바꾸기" }).or(page.getByText("사진 바꾸기"))).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "설정 저장" }).click();
  await expect(page.getByText("저장했습니다")).toBeVisible();
  const [a] = await sql<{ logo_path: string }>(`select logo_path from public.site_settings where id = 1`);
  expect(a.logo_path).toMatch(/^settings\/[0-9a-f-]{36}\.webp$/);

  // 교체
  await page.getByLabel("로고 파일 선택").setInputFiles(PHOTO);
  await expect(page.locator('input[name="logo_path"]')).not.toHaveValue(a.logo_path, { timeout: 30_000 });
  await page.getByRole("button", { name: "설정 저장" }).click();
  await expect
    .poll(async () => (await sql<{ logo_path: string }>(`select logo_path from public.site_settings where id = 1`))[0].logo_path)
    .not.toBe(a.logo_path);
  const [b] = await sql<{ logo_path: string }>(`select logo_path from public.site_settings where id = 1`);
  // 이전 파일 삭제는 DB 저장 직후에 이어지므로 잠시 기다린다.
  await expect
    .poll(async () => (await sql(`select 1 from storage.objects where bucket_id = 'media' and name = $1`, [a.logo_path])).length)
    .toBe(0);
  const cur = await sql(`select 1 from storage.objects where bucket_id = 'media' and name = $1`, [b.logo_path]);
  expect(cur).toHaveLength(1);
});

test("회사 정보가 비어 있으면 대시보드에 안내가 보인다", async ({ page }) => {
  await sql(`update public.site_settings set phone = '' where id = 1`);
  await login(page, "/admin");
  await expect(page.getByText("회사 정보가 비어 있습니다")).toBeVisible();
  await page.getByRole("link", { name: "사이트 설정" }).first().click();
  await expect(page).toHaveURL(/\/admin\/settings$/);
});

test("비로그인은 설정 화면에 들어갈 수 없다", async ({ page }) => {
  await page.goto("/admin/settings");
  await expect(page).toHaveURL(/\/admin\/login/);
});
