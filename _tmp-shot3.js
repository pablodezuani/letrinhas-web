const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  page.on('console', (msg) => console.log('BROWSER:', msg.type(), msg.text()));

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('#email', 'admin@letrinhas.com');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(600);

  const before = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside ? aside.style.transform : 'NO_ASIDE';
  });
  console.log('transform BEFORE click:', before);

  await page.getByTitle('Abrir menu').click();
  await page.waitForTimeout(100);
  const mid = await page.evaluate(() => document.querySelector('aside')?.style.transform);
  console.log('transform +100ms:', mid);

  await page.waitForTimeout(400);
  const after = await page.evaluate(() => document.querySelector('aside')?.style.transform);
  console.log('transform +500ms:', after);

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
