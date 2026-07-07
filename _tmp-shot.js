const { chromium } = require('playwright');

const OUT = process.env.SHOT_DIR || 'C:\\Users\\pablo\\AppData\\Local\\Temp\\claude\\D--projetos-Pablo-letrinhasEncantadas\\46ccbc51-61ae-4c3d-8158-7ce72963dfb9\\scratchpad\\shots';
const BASE = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${OUT}/01-login-mobile.png` });

  await page.fill('#email', 'admin@letrinhas.com');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/02-dashboard-mobile.png`, fullPage: true });

  // Open mobile sidebar drawer
  await page.click('button[title="Abrir menu"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/03-sidebar-drawer-mobile.png` });
  await page.keyboard.press('Escape').catch(() => {});

  for (const route of ['children', 'responsaveis', 'words', 'educators', 'reports']) {
    await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${route}-mobile.png`, fullPage: true });
  }

  // Desktop pass for comparison
  await context.close();
  const context2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page2 = await context2.newPage();
  await page2.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page2.fill('#email', 'admin@letrinhas.com');
  await page2.fill('#password', 'admin123');
  await page2.click('button[type="submit"]');
  await page2.waitForURL('**/dashboard', { timeout: 15000 });
  await page2.waitForTimeout(800);
  await page2.screenshot({ path: `${OUT}/02-dashboard-desktop.png`, fullPage: true });

  await browser.close();
  console.log('DONE');
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
