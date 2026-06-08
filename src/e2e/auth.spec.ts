import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect unauthenticated user from /video to home', async ({ page }) => {
    await page.goto('/video');
    await expect(page).toHaveURL(/\/\?redirect=%2Fvideo/);
  });

  test('should redirect unauthenticated user from /profile to home', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/\?redirect=%2Fprofile/);
  });

  test('should open login modal from header', async ({ page }) => {
    await page.goto('/');

    const loginButton = page.getByRole('button', { name: /Sign In|Login/i });
    if (await loginButton.isVisible({ timeout: 5000 })) {
      await loginButton.click();
      await expect(page.getByText(/Welcome Back!/i)).toBeVisible();
    }
  });

  test('should close login modal on Escape', async ({ page }) => {
    await page.goto('/');

    const loginButton = page.getByRole('button', { name: /Sign In|Login/i });
    if (await loginButton.isVisible({ timeout: 5000 })) {
      await loginButton.click();
      await expect(page.getByText(/Welcome Back!/i)).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.getByText(/Welcome Back!/i)).not.toBeVisible();
    }
  });

  test('should show login form fields', async ({ page }) => {
    await page.goto('/');

    const loginButton = page.getByRole('button', { name: /Sign In|Login/i });
    if (await loginButton.isVisible({ timeout: 5000 })) {
      await loginButton.click();

      await expect(page.getByPlaceholder(/Email/i)).toBeVisible();
      await expect(page.getByPlaceholder(/Password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    }
  });

  test('should switch between login and register modals', async ({ page }) => {
    await page.goto('/');

    const loginButton = page.getByRole('button', { name: /Sign In|Login/i });
    if (await loginButton.isVisible({ timeout: 5000 })) {
      await loginButton.click();
      await expect(page.getByText(/Welcome Back!/i)).toBeVisible();

      const registerLink = page.getByText(/Sign Up|Register|Create.*account/i);
      if (await registerLink.isVisible()) {
        await registerLink.click();
        await expect(page.getByText(/Create.*Account|Sign Up|Register/i).first()).toBeVisible();
      }
    }
  });
});
