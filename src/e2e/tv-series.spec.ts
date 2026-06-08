import { test, expect } from '@playwright/test';

test.describe('TV Series Browsing', () => {
  test('should navigate to TV series page', async ({ page }) => {
    await page.goto('/tv_series');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/tv_series/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to TV series detail', async ({ page }) => {
    await page.goto('/tv_series');

    const seriesLink = page.locator('a[href*="/tv_series/"]').first();
    if (await seriesLink.isVisible({ timeout: 10000 })) {
      await seriesLink.click();
      await expect(page).toHaveURL(/\/tv_series\/.+/);
      await expect(page.locator('main')).toBeVisible();
    }
  });
});
