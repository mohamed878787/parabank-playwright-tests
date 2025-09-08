const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PARABANK_BASE_URL || 'http://localhost:8080/parabank';
const USERNAME = process.env.PARABANK_USERNAME || 'john';
const PASSWORD = process.env.PARABANK_PASSWORD || 'demo';

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe('ParaBank Account Details', () => {
  test('navigates to first account details and verifies account number', async ({ page }) => {
    // 1) Log in
    await page.goto(BASE_URL);
    await page.locator('input[name="username"]').fill(USERNAME);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.locator('input[type="submit"][value="Log In"]').click();

    // 2) Wait for Accounts Overview heading
    await expect(page.getByRole('heading', { name: /Accounts Overview/i })).toBeVisible();

    // 3) Click the first account number link in the accounts table
    const firstAccountLink = page.locator('#accountTable a').first();
    await expect(firstAccountLink).toBeVisible();
    const accountNumber = (await firstAccountLink.innerText()).trim();
    await firstAccountLink.click();

    // 4) Verify Account Details page is displayed
    await expect(page.getByRole('heading', { name: /Account Details/i })).toBeVisible();

    // 5) Verify the account number matches the one clicked
    const accountNumberRegex = new RegExp(`\\b${escapeRegex(accountNumber)}\\b`);
    await expect(page.getByText(accountNumberRegex)).toBeVisible();
  });
});


