import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const url = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3402/';
const outDir = 'artifacts/front-card-verify';
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
await page.screenshot({ path: `${outDir}/home-mobile.png`, fullPage: true });

const card = page.locator('article').first();
await card.waitFor({ state: 'visible', timeout: 30000 });
const text = (await card.textContent()) || '';
const checks = {
  hasSamsung: text.includes('삼성전자'),
  noPricePending: !text.includes('가격 확인중'),
  noTradePending: !text.includes('거래대금 확인중'),
  hasRelativeStrength: text.includes('지수대비'),
  hasPrevHigh: text.includes('전고점') || text.includes('고가권'),
  hasAlertRow: text.includes('알림 조건'),
};
const result = { url, text, checks };
await fs.writeFile(`${outDir}/front-card-result.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
if (Object.values(checks).some((v) => !v)) process.exit(2);
