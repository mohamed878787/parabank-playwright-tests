const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PARABANK_BASE_URL || 'http://localhost:8080/parabank';
const USERNAME = process.env.PARABANK_USERNAME || 'john';
const PASSWORD = process.env.PARABANK_PASSWORD || 'demo';

test.describe('ParaBank Logout', () => {
  test('logs out successfully', async ({ page }) => {
    // 1) Log in first
    await page.goto(BASE_URL);

    // 2) Enter username and password
    await page.locator('input[name="username"]').fill(USERNAME);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.getByRole('button', { name: /log in/i }).click();

    // 2) Verify Accounts Overview page
    await expect(page.getByRole('heading', { name: /Accounts Overview/i })).toBeVisible();

    // 3) Click Logout
    const logoutLink = page.getByRole('link', { name: /log out/i }).or(page.locator('a[href*="logout"]'));
    await expect(logoutLink).toBeVisible();
    await logoutLink.click();

    // 4) Verify redirection to login page
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
    await expect(page).toHaveURL(/.*(index|parabank).*\.htm.*/i);

  });
});
