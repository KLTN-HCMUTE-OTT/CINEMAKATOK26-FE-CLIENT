import { test, expect } from '@playwright/test';

test.describe('Movie Browsing', () => {
  test('should display movie content on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to movies page', async ({ page }) => {
    await page.goto('/movies');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/movies/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to movie detail from movies list', async ({ page }) => {
    await page.goto('/movies');

    const movieLink = page.locator('a[href*="/movies/"]').first();
    if (await movieLink.isVisible({ timeout: 10000 })) {
      await movieLink.click();
      await expect(page).toHaveURL(/\/movies\/.+/);
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should display movie sections on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sections = page.locator('section, [data-testid]');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
  });
});
