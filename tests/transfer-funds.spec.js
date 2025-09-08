const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PARABANK_BASE_URL || 'http://localhost:8080/parabank';

test.describe('ParaBank Transfer Funds', () => {
  test('transfers funds and shows confirmation with amount', async ({ page }) => {
    // 1) Log in
    await page.goto(BASE_URL);
    await page.locator('input[name="username"]').fill('john');
    await page.locator('input[name="password"]').fill('demo');
    await page.locator('input[type="submit"][value="Log In"]').click();

    // 2) Wait for Accounts Overview
    await expect(page.getByRole('heading', { name: /Accounts Overview/i })).toBeVisible();

    // 3) Navigate to Transfer Funds via nav link
    await page.getByRole('link', { name: /Transfer Funds/i }).click();
    await expect(page.getByRole('heading', { name: /Transfer Funds/i })).toBeVisible();

    // 4) Enter an amount
    const transferAmount = 100;
    await page.locator('input#amount, input[name="amount"]').fill(String(transferAmount));

    // 5) Select the first available From and To accounts
    const fromSelect = page.locator('select#fromAccountId, select[name="fromAccountId"]');
    const toSelect = page.locator('select#toAccountId, select[name="toAccountId"]');

    await expect(fromSelect).toBeVisible();
    await expect(toSelect).toBeVisible();

    const firstFromValue = await fromSelect.locator('option:not([disabled])').first().getAttribute('value');
    const firstToValue = await toSelect.locator('option:not([disabled])').first().getAttribute('value');

    await fromSelect.selectOption(firstFromValue || { index: 0 });
    await toSelect.selectOption(firstToValue || { index: 0 });

    // 6) Click Transfer button
    await page.locator('input[type="submit"][value="Transfer"], input[type="submit"][value="Transfer Funds"], button:has-text("Transfer")').click();

    // 7) Verify confirmation message
    await expect(page.getByText(/Transfer Complete!/i)).toBeVisible();

    // 8) Verify amount is present in confirmation details
    const amountRegex = new RegExp(`\\$?${transferAmount}(?:\\.00)?`);
    await expect(page.getByText(amountRegex)).toBeVisible();
  });
});


