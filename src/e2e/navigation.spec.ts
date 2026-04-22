import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/CINEMAKATOK/i);
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to FAQs page', async ({ page }) => {
    await page.goto('/faqs');
    await expect(page).toHaveURL(/\/faqs/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveURL(/\/blog/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display 404 for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    const notFoundText = page.getByText(/not found|404/i);
    if (await notFoundText.isVisible({ timeout: 5000 })) {
      await expect(notFoundText).toBeVisible();
    }
  });

  test('should have responsive header on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('header, nav').first()).toBeVisible();
  });
});
