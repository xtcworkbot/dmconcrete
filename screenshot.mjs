import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.argv[2];
const label = process.argv[3];
const mode = process.argv[4]; // 'mobile' | 'desktop' (default desktop)
const full = process.argv[5] !== 'viewport'; // 'viewport' = visible only

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label] [mobile|desktop]');
  process.exit(1);
}

const viewports = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 2 },
  mobile:  { width: 390,  height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const viewport = viewports[mode] || viewports.desktop;

const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const existing = fs.readdirSync(outDir)
  .map((f) => f.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map((m) => parseInt(m[1], 10));
const next = existing.length ? Math.max(...existing) + 1 : 1;

const filename = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;
const outPath = path.join(outDir, filename);

const browser = await puppeteer.launch({
  headless: 'new',
  defaultViewport: viewport,
});

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.screenshot({ path: outPath, fullPage: full });
  console.log(`Saved: ${outPath}`);
} finally {
  await browser.close();
}
