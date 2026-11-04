// 모바일 프리셋 Lighthouse 점검. 먼저 `npm run build && npm run start`로 서버를 띄운다.
// 사용: node scripts/lighthouse.mjs [baseUrl]   (CHROME_PATH로 브라우저 지정 가능)
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium";
const THRESHOLD = 90;
process.env.NO_PROXY = [process.env.NO_PROXY, "localhost", "127.0.0.1"].filter(Boolean).join(",");

async function firstProjectPath() {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  const m = /<loc>([^<]*\/projects\/[^<]+)<\/loc>/.exec(xml);
  if (!m) throw new Error("sitemap.xml에서 사례 상세 주소를 찾지 못했습니다.");
  return new URL(m[1]).pathname; // 이미 인코딩된 경로
}

const paths = ["/", "/projects", await firstProjectPath(), "/contact"];
const categories = ["performance", "accessibility", "seo", "best-practices"];

const chrome = await launch({
  chromePath,
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

const rows = [];
try {
  for (const path of paths) {
    const result = await lighthouse(`${base}${path}`, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: categories,
    });
    const lhr = result.lhr;
    const scores = Object.fromEntries(categories.map((c) => [c, Math.round((lhr.categories[c].score ?? 0) * 100)]));
    rows.push({ path: decodeURIComponent(path), ...scores });
    if (process.env.LH_VERBOSE) {
      for (const a of Object.values(lhr.audits)) {
        if (a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "notApplicable") {
          console.error(`  [${path}] ${a.id}: ${a.score} ${a.displayValue ?? ""}`);
        }
      }
    }
  }
} finally {
  await chrome.kill();
}

console.table(rows);
const failed = rows.filter((r) => ["performance", "accessibility", "seo"].some((c) => r[c] < THRESHOLD));
if (failed.length) {
  console.error(`기준(${THRESHOLD}) 미달: ${failed.map((r) => r.path).join(", ")}`);
  process.exitCode = 1;
}
