const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PARABANK_BASE_URL || 'http://localhost:8080/parabank';

test.describe('ParaBank Open New Account', () => {
  test('opens a new account and shows confirmation with account number', async ({ page }) => {
    // 1) Log in
    await page.goto(BASE_URL);
    await page.getByLabel(/username/i).or(page.locator('input[name="username"]')).fill('john');
    await page.getByLabel(/password/i).or(page.locator('input[name="password"]')).fill('demo');
    await page.getByRole('button', { name: /log in/i }).or(page.locator('input[type="submit"][value="Log In"]')).click();

    // 2) Wait for Accounts Overview
    await expect(page.getByRole('heading', { name: /Accounts Overview/i })).toBeVisible();

    // 3) Navigate to Open New Account
    await expect(page.getByRole('link', { name: /Open New Account/i })).toBeVisible();
    await page.getByRole('link', { name: /Open New Account/i }).click();
    await expect(page.getByRole('heading', { name: /Open New Account/i })).toBeVisible();

    // 4) Select account type (prefer Savings)
    const typeSelect = page.getByRole('combobox', { name: /account type|type/i }).or(page.locator('select#type, select[name="type"]'));
    await expect(typeSelect).toBeVisible();
    // Try selecting SAVINGS by label/value with fallbacks
    const typeOptions = typeSelect.locator('option');
    const optionsText = (await typeOptions.allTextContents()).map(t => t.trim().toUpperCase());
    if (optionsText.includes('SAVINGS')) {
      await typeSelect.selectOption({ label: 'SAVINGS' }).catch(async () => {
        await typeSelect.selectOption('SAVINGS').catch(async () => {
          await typeSelect.selectOption({ index: 0 });
        });
      });
    } else if (optionsText.includes('CHECKING')) {
      await typeSelect.selectOption({ label: 'CHECKING' }).catch(async () => {
        await typeSelect.selectOption('CHECKING').catch(async () => {
          await typeSelect.selectOption({ index: 0 });
        });
      });
    } else {
      await typeSelect.selectOption({ index: 0 });
    }

    // 5) Select an existing account to fund from
    const fromSelect = page.getByRole('combobox', { name: /from account|fund|from/i }).or(page.locator('select#fromAccountId, select[name="fromAccountId"]'));
    await expect(fromSelect).toBeVisible();
    const firstFromValue = await fromSelect.locator('option:not([disabled])').first().getAttribute('value');
    await fromSelect.selectOption(firstFromValue || { index: 0 });

    // 6) Click Open New Account
    const openBtn = page.getByRole('button', { name: /Open New Account/i }).or(page.locator('input[type="submit"][value="Open New Account"]'));
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // 7) Verify confirmation heading
    await expect(page.getByRole('heading', { name: /Account Opened!/i }).or(page.getByText(/Account Opened!/i))).toBeVisible();

    // 8) Confirm new account number is displayed
    // In ParaBank, the new account id is typically a link with id newAccountId
    const newAccountLink = page.getByRole('link', { name: /\d+/ }).or(page.locator('#newAccountId'));
    await expect(newAccountLink).toBeVisible();
    const newAccountNumber = (await newAccountLink.first().innerText()).trim();
    expect(newAccountNumber).toMatch(/^\d+$/);
  });
});


