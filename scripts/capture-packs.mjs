// Capture des heros de chaque STYLE PACK (desktop + mobile) depuis la galerie
// /preview/packs. Nécessite un serveur dev lancé (npm run dev).
// Usage : node scripts/capture-packs.mjs [baseUrl]
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2] || "http://localhost:3000";
const PAGE_URL = `${BASE}/preview/packs`;
const OUT = "./.captures/";

const PACKS = [
  "maison-premium",
  "atelier-industriel",
  "clair-frais",
  "pop-moderne",
  "terra-naturel",
];

async function shoot(page, file, clip) {
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(350); // laisse swap des polices + reveal se stabiliser
  await page.screenshot({ path: file, clip });
}

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  // ---- Desktop ----
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const dp = await desktop.newPage();
  await dp.goto(PAGE_URL, { waitUntil: "networkidle" });
  const sections = dp.locator("main > section");
  for (let i = 0; i < PACKS.length; i++) {
    const box = await sections.nth(i).boundingBox();
    if (box) await shoot(dp, `${OUT}${PACKS[i]}-desktop.png`, { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 760) });
  }
  await desktop.close();

  // ---- Mobile ----
  const mobile = await browser.newContext({ ...devices["iPhone 13"] });
  const mp = await mobile.newPage();
  await mp.goto(PAGE_URL, { waitUntil: "networkidle" });
  const msec = mp.locator("main > section");
  for (let i = 0; i < PACKS.length; i++) {
    const box = await msec.nth(i).boundingBox();
    if (box) await shoot(mp, `${OUT}${PACKS[i]}-mobile.png`, { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 900) });
  }
  await mobile.close();

  await browser.close();
  console.log("OK — captures dans", OUT);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
