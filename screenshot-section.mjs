import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.argv[2];
const selector = process.argv[3];
const label = process.argv[4] || 'section';
const mode = process.argv[5] || 'mobile';

const viewports = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  mobile:  { width: 390,  height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const existing = fs.readdirSync(outDir).map(f => f.match(/^screenshot-(\d+)/)).filter(Boolean).map(m => parseInt(m[1], 10));
const next = existing.length ? Math.max(...existing) + 1 : 1;
const outPath = path.join(outDir, `screenshot-${next}-${label}.png`);

const browser = await puppeteer.launch({ headless: 'new', defaultViewport: viewports[mode] });
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  const el = await page.$(selector);
  if (!el) throw new Error(`Selector "${selector}" not found`);
  await el.screenshot({ path: outPath });
  console.log(`Saved: ${outPath}`);
} finally { await browser.close(); }
