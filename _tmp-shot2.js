const { chromium } = require('playwright');

const OUT = 'C:\\Users\\pablo\\AppData\\Local\\Temp\\claude\\D--projetos-Pablo-letrinhasEncantadas\\46ccbc51-61ae-4c3d-8158-7ce72963dfb9\\scratchpad\\shots';
const BASE = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('#email', 'admin@letrinhas.com');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(600);

  const btn = page.getByTitle('Abrir menu');
  console.log('menu button count:', await btn.count());
  await btn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/03b-drawer.png` });

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  console.log('overflow check (dashboard):', overflow);

  for (const route of ['children', 'responsaveis', 'words', 'educators', 'reports', 'dashboard']) {
    await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const o = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    console.log(route, o, o.scrollWidth > o.clientWidth ? '<<< HORIZONTAL OVERFLOW' : 'ok');
  }

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
