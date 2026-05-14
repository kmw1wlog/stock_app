import { expect, test } from '@playwright/test';

test('bottom tabs, condition CTAs, detail links, and MTS selector work', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  for (const [href, pattern] of [
    ['/rankings', /\/rankings$/],
    ['/alerts', /\/alerts$/],
    ['/explore', /\/explore$/],
    ['/saved', /\/saved$/],
    ['/', /\/$/],
  ] as const) {
    await page.locator('nav').locator(`a[href="${href}"]`).click();
    await expect(page).toHaveURL(pattern);
  }

  await expect(page.getByText('오늘의 흐름 포착')).toBeVisible();
  await expect(page.getByRole('button', { name: /알림/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /조건식/ }).first()).toBeVisible();

  const cardLinks = page.locator('a[href^="/cards/"]');
  const cardCount = await cardLinks.count();
  if (cardCount === 0) {
    await expect(page.getByText('데이터 준비중').first()).toBeVisible();
    return;
  }

  await cardLinks.first().click();
  await expect(page).toHaveURL(/\/cards\/.+/);
  await expect(page.getByText('종목 진단')).toBeVisible();
  await expect(page.getByText('이 조건 알림 받기').first()).toBeVisible();
  await expect(page.getByText('이 종목을 증권앱에서 확인하기').first()).toBeVisible();

  await page.getByText('다른 MTS에서 보기').first().click();
  await expect(page).toHaveURL(/\/mts\/select/);
  await expect(page.getByText('이 종목을 증권앱에서 확인하기')).toBeVisible();
});
