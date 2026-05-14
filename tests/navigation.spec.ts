import { expect, test } from '@playwright/test';

test('bottom tabs, X/Tinder home feed, search, detail links, and MTS selector work', async ({ page }) => {
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
  await expect(page.getByRole('button', { name: /시장 선택/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /급상승/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /거래대금/ })).toBeVisible();

  const cardLinks = page.locator('a[href^="/cards/"]');
  const cardCount = await cardLinks.count();
  if (cardCount === 0) {
    await expect(page.getByText('데이터 준비중').first()).toBeVisible();
    return;
  }

  await expect(page.getByText('재무·가치 체크').first()).toBeVisible();
  await expect(page.getByText('같은 테마').first()).toBeVisible();

  await page.goto('/explore');
  await page.getByLabel('종목 검색').click();
  await expect(page).toHaveURL(/\/search$/);
  await expect(page.getByPlaceholder('종목명, 심볼, 테마 검색')).toBeVisible();

  await page.goto('/');
  await cardLinks.first().click();
  await expect(page).toHaveURL(/\/cards\/.+/);
  await expect(page.getByText('종목 진단')).toBeVisible();
  await expect(page.getByText('이 조건 알림 받기').first()).toBeVisible();
  await expect(page.getByText('이 종목을 증권앱에서 확인하기').first()).toBeVisible();

  await page.getByText('다른 MTS에서 보기').first().click();
  await expect(page).toHaveURL(/\/mts\/select/);
  await expect(page.getByText('이 종목을 증권앱에서 확인하기')).toBeVisible();
});
