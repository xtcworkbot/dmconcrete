import puppeteer from 'puppeteer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function render(file, w, h, out){
  const browser = await puppeteer.launch({ headless:'new', defaultViewport:{ width:w, height:h, deviceScaleFactor:1 } });
  try{
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000/assets/og/${file}`, { waitUntil:'networkidle0', timeout:30000 });
    // Wait an extra moment for fonts to settle
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(__dirname, out), omitBackground:false });
    console.log(`Rendered ${out}`);
  } finally { await browser.close(); }
}

await render('og-template.html', 1200, 630, 'og-image.png');
await render('apple-template.html', 180, 180, 'apple-touch-icon.png');
await render('apple-template.html', 32, 32, 'favicon-32.png');
