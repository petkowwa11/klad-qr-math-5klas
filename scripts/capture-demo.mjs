import { chromium } from "playwright";
import { mkdirSync } from "fs";
import path from "path";

const OUT = "/cursor/stores/bc-66088044-0d94-4ecd-a515-00183ea56558/media/qr-treasure-hunt";
const ART = "/opt/cursor/artifacts/screenshots";
mkdirSync(OUT, { recursive: true });
mkdirSync(ART, { recursive: true });

async function shot(page, name) {
  const file = `${name}.png`;
  const outPath = path.join(OUT, file);
  const artPath = path.join(ART, file);
  await page.screenshot({ path: outPath, fullPage: false });
  await page.screenshot({ path: artPath, fullPage: false });
  console.log("saved", outPath);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  locale: "bg-BG",
});
const page = await context.newPage();

await page.goto("http://127.0.0.1:3847/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await shot(page, "landing_hero_klad");

await page.goto("http://127.0.0.1:3847/teacher", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await shot(page, "teacher_dashboard_demo");

await page.goto("http://127.0.0.1:3847/teacher/demo_drobi", { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await shot(page, "teacher_stations_editor");

await page.getByRole("button", { name: "QR лист" }).click();
await page.waitForTimeout(500);
await shot(page, "teacher_qr_sheet");

await page.getByRole("button", { name: "Преглед за ученик" }).click();
await page.waitForTimeout(800);
await shot(page, "teacher_student_preview");

// Open first station via encoded demo — load from page by clicking open link if present
const openLink = page.getByRole("link", { name: /Отвори в нов раздел/i });
if (await openLink.count()) {
  const href = await openLink.getAttribute("href");
  await page.goto(`http://127.0.0.1:3847${href}`, { waitUntil: "networkidle" });
} else {
  // Fallback: navigate using localStorage-seeded encode from teacher page content
  await page.goto("http://127.0.0.1:3847/teacher/demo_drobi", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "QR лист" }).click();
  await page.waitForTimeout(400);
  const urlText = await page.locator("article p.break-all").first().textContent();
  await page.goto(urlText.trim(), { waitUntil: "networkidle" });
}

await page.waitForTimeout(700);
await shot(page, "student_station_task");

const hintBtn = page.getByRole("button", { name: /Покажи подсказка/i });
if (await hintBtn.count()) {
  await hintBtn.click();
  await page.waitForTimeout(400);
  await shot(page, "student_hint_revealed");
}

await page.getByRole("button", { name: /Маркирай като решена/i }).click();
await page.waitForTimeout(500);
await shot(page, "student_marked_done");

const next = page.getByRole("link", { name: /следващата станция/i });
if (await next.count()) {
  await next.click();
  await page.waitForTimeout(600);
  await shot(page, "student_next_station");
}

await browser.close();
console.log("done");
