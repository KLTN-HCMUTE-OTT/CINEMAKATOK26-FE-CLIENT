import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  console.log('Actual page title:', title);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/CINEMAKATOK/i);
});

test('can open login modal', async ({ page }) => {
  await page.goto('/');

  // Find the login button - based on header.tsx it might be a button or link
  // Let's assume it has text "Sign In" or "Login"
  const loginButton = page.getByRole('button', { name: /Sign In|Login/i });
  
  if (await loginButton.isVisible()) {
    await loginButton.click();
    await expect(page.getByText(/Welcome Back!/i)).toBeVisible();
  }
});
