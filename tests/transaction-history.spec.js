const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PARABANK_BASE_URL || 'http://localhost:8080/parabank';
const USERNAME = process.env.PARABANK_USERNAME || 'john';
const PASSWORD = process.env.PARABANK_PASSWORD || 'demo';

test.describe('ParaBank Transaction History', () => {
  test('views recent transactions and validates table content', async ({ page }) => {
    // 1) Ensure user is logged in
    await page.goto(BASE_URL);

    const usernameInput = page.getByRole('textbox', { name: /username/i }).or(page.locator('input[name="username"]'));
    const passwordInput = page.getByRole('textbox', { name: /password/i }).or(page.locator('input[name="password"]'));
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill(USERNAME);
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(PASSWORD);

    const loginButton = page.getByRole('button', { name: /log in/i })
      .or(page.locator('input[type="submit"][value="Log In"]'));
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // 2) Verify Accounts Overview
    await expect(page.getByRole('heading', { name: /Accounts Overview/i })).toBeVisible();

    // 3) Select an account either from dropdown or accounts list
    const accountSelect = page.getByLabel(/account/i)
      .or(page.locator('select[name="accountId"], select#fromAccountId, select[name*="account" i]'));

    if (await accountSelect.isVisible().catch(() => false)) {
      // Dropdown path
      const options = accountSelect.locator('option');
      const count = await options.count();
      if (count > 1) {
        await accountSelect.selectOption({ index: 1 }).catch(async () => {
          const value = await options.nth(0).getAttribute('value');
          if (value) await accountSelect.selectOption(value);
        });
      } else if (count === 1) {
        const value = await options.nth(0).getAttribute('value');
        if (value) await accountSelect.selectOption(value);
      }

      // Click Go / View Transactions if present
      const goButton = page.getByRole('button', { name: /go|view transactions|view/i })
        .or(page.locator('input[type="submit"][value="Go"], input[type="submit"][value*="View" i]'));
      if (await goButton.isVisible().catch(() => false)) {
        await goButton.click();
      }
    } else {
      // Accounts list path - click the first account link in the table
      const firstAccountLink = page.locator('#accountTable a').first();
      await expect(firstAccountLink).toBeVisible();
      await firstAccountLink.click();
    }

    // 4) Verify transactions table is visible and has at least one row
    //const transactionsHeading = page.getByRole('heading', { name: /account details|transactions|activity/i });
    //await expect(transactionsHeading.or(page.getByText(/Transactions|Account Details|Activity/i))).toBeVisible();

    const transactionsTable = page.locator('#transactionTable');
    await expect(transactionsTable).toBeVisible();

    // Verify headers include Date, Description, Amount, Type
    const headerRow = transactionsTable.locator('thead tr').first().or(transactionsTable.locator('tr').first());
    await expect(headerRow).toBeVisible();
    await expect(headerRow.getByRole('columnheader').or(headerRow.locator('th:has-text("Date")'))).toContainText(/Date/i);
    await expect(headerRow.getByRole('columnheader').or(headerRow.locator('th:has-text("Transaction")'))).toContainText(/Transaction/i);
    await expect(headerRow.getByRole('columnheader').or(headerRow.locator('th:has-text("Debit")'))).toContainText(/Debit/i);
    await expect(headerRow.getByRole('columnheader').or(headerRow.locator('th:has-text("Credit")'))).toContainText(/Credit/i);

    // Ensure at least one data row
    const rows = transactionsTable.locator('tbody tr');
    const rowCount = await rows.count();
    await expect(rowCount).toBeGreaterThan(0);

    // Validate first transaction has visible, non-empty cells
    const firstRow = rows.nth(0);
    await expect(firstRow).toBeVisible();
    const dateCell = firstRow.locator('td').nth(0);
    const transactionCell = firstRow.locator('td').nth(1);
    const creditCell = firstRow.locator('td').nth(3);

    await expect(dateCell).toBeVisible();
    await expect((await dateCell.innerText()).trim().length).toBeGreaterThan(0);

    await expect(transactionCell).toBeVisible();
    await expect((await transactionCell.innerText()).trim().length).toBeGreaterThan(0);

    await expect(creditCell).toBeVisible();
    await expect((await creditCell.innerText()).trim().length).toBeGreaterThan(0);
  });
});


