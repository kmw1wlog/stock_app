import { expect, test } from '@playwright/test';

test('home tabs, actions, detail links, and swipe gestures work', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  for (const [href, pattern] of [
    ['/rankings', /\/rankings$/],
    ['/report', /\/report$/],
    ['/explore', /\/explore$/],
    ['/saved', /\/saved$/],
    ['/', /\/$/],
  ] as const) {
    await page.locator(`nav a[href="${href}"]`).click();
    await expect(page).toHaveURL(pattern);
  }

  await page.locator('button').nth(1).click();
  await page.locator('button').nth(2).click();
  await expect(page.locator('a[href="/explore/movers"]').first()).toBeVisible();
  await expect(page.locator('a[href="/explore/news"]').first()).toBeVisible();
  await expect(page.locator('a[href="/explore/after-hours"]').first()).toBeVisible();
  expect(await page.locator('a[href^="/cards/"]').count()).toBeGreaterThan(2);

  const card = page.locator('article').first();
  const box = await card.boundingBox();
  expect(box).toBeTruthy();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 40, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 40, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
  }

  await page.locator('a[href^="/cards/"]').first().click();
  await expect(page).toHaveURL(/\/cards\/.+/);
});
