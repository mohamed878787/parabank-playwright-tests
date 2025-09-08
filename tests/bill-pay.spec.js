const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PARABANK_BASE_URL || 'http://localhost:8080/parabank';

test.describe('ParaBank Bill Pay', () => {
  test('submits bill payment and shows confirmation with payee and amount', async ({ page }) => {
    // 1) Log in
    await page.goto(BASE_URL);
    await page.locator('input[name="username"]').fill('john');
    await page.locator('input[name="password"]').fill('demo');
    await page.locator('input[type="submit"][value="Log In"]').click();

    // 2) Wait for Accounts Overview page
    await expect(page.getByRole('heading', { name: /Accounts Overview/i })).toBeVisible();

    // 3) Navigate to Bill Pay page
    await page.getByRole('link', { name: /Bill Pay/i }).click();
    await expect(page.getByRole('heading', { name: /Bill Payment Service|Bill Pay/i })).toBeVisible();

    // 4) Fill out the bill pay form
    const payeeName = 'Utility Company';
    const amount = '200';

    // Be resilient: try by name, fallback to label-based selectors
    const fill = async (selectorCandidates, value) => {
      for (const selector of selectorCandidates) {
        const loc = page.locator(selector);
        if (await loc.count()) {
          await loc.fill(value);
          return;
        }
      }
      throw new Error(`No matching input for selectors: ${selectorCandidates.join(', ')}`);
    };

    await fill(['input[name="payee.name"]', 'input#payee\.name', 'input[ng-model="payee.name"]', page.getByLabel(/Payee Name/i)], payeeName);
    await fill(['input[name="payee.address.street"]', 'input#payee\.address\.street', 'input[ng-model="payee.address.street"]', page.getByLabel(/^Address/i)], '123 Main St');
    await fill(['input[name="payee.address.city"]', 'input#payee\.address\.city', 'input[ng-model="payee.address.city"]', page.getByLabel(/City/i)], 'Springfield');
    await fill(['input[name="payee.address.state"]', 'input#payee\.address\.state', 'input[ng-model="payee.address.state"]', page.getByLabel(/State/i)], 'IL');
    await fill(['input[name="payee.address.zipCode"]', 'input#payee\.address\.zipCode', 'input[ng-model="payee.address.zipCode"]', page.getByLabel(/Zip/i)], '62704');
    await fill(['input[name="payee.phoneNumber"]', 'input#payee\.phoneNumber', 'input[ng-model="payee.phoneNumber"]', page.getByLabel(/Phone/i)], '5551234567');
    await fill(['input[name="payee.accountNumber"]', 'input#payee\.accountNumber', 'input[ng-model="payee.accountNumber"]', page.getByLabel(/^Account$/i)], '12345');
    await fill(['input[name="verifyAccount"]', 'input#verifyAccount', 'input[ng-model="verifyAccount"]', page.getByLabel(/Verify Account/i)], '12345');
    await fill(['input[name="amount"]', 'input#amount', 'input[ng-model="amount"]', page.getByLabel(/Amount/i)], amount);

    // 5) Select the first available From Account
    const fromSelect = page.locator('select[name="fromAccountId"], select#fromAccountId');
    await expect(fromSelect).toBeVisible();
    const firstFromValue = await fromSelect.locator('option:not([disabled])').first().getAttribute('value');
    await fromSelect.selectOption(firstFromValue || { index: 0 });

    // 6) Submit the payment
    await page.getByRole('button', { name: /Send Payment/i }).click();

    // 7) Verify confirmation message
    await expect(page.getByText(/Bill Payment Complete/i).or(page.getByRole('heading', { name: /Bill Payment Complete/i }))).toBeVisible();

    // 8) Verify payee name and amount appear in confirmation details
    await expect(page.getByText(new RegExp(`${payeeName}`))).toBeVisible();
    await expect(page.getByText(new RegExp(`\\$?${amount}(?:\\.00)?`))).toBeVisible();
  });
});


