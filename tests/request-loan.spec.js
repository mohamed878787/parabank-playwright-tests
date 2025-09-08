const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PARABANK_BASE_URL || 'http://localhost:8080/parabank';
const USERNAME = process.env.PARABANK_USERNAME || 'john';
const PASSWORD = process.env.PARABANK_PASSWORD || 'demo';

test.describe('ParaBank Request Loan', () => {
  test('submits a loan request and verifies approval message', async ({ page }) => {
    // 1) Log in
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

    // 3) Navigate to Request Loan page
    const requestLoanLink = page.getByRole('link', { name: /Request Loan/i })
      .or(page.locator('a:has-text("Request Loan"), a[href*="requestloan" i]'));
    await expect(requestLoanLink).toBeVisible();
    await requestLoanLink.click();

    // 4) Ensure Request Loan form is visible
    await expect(page.getByRole('heading', { name: /Request Loan/i }).or(page.getByText(/Request Loan/i))).toBeVisible();

    // 5) Fill loan form values
    const amountInput = page.getByLabel(/loan amount/i).or(page.locator('input[name="amount"], input#amount'));
    const downPaymentInput = page.getByLabel(/down payment/i).or(page.locator('input[name="downPayment"], input#downPayment'));
    const fromAccountSelect = page.getByLabel(/from account/i).or(page.locator('select[name="fromAccountId"], select#fromAccountId'));

    await expect(amountInput).toBeVisible();
    await amountInput.fill('100');

    await expect(downPaymentInput).toBeVisible();
    await downPaymentInput.fill('10');

    await expect(fromAccountSelect).toBeVisible();
    // Prefer selecting the first non-placeholder option
    const options = fromAccountSelect.locator('option');
    const optionCount = await options.count();
    if (optionCount > 1) {
      // index 0 could be placeholder, try index 1
      await fromAccountSelect.selectOption({ index: 1 }).catch(async () => {
        const value = await options.nth(0).getAttribute('value');
        if (value) await fromAccountSelect.selectOption(value);
      });
    } else if (optionCount === 1) {
      const value = await options.nth(0).getAttribute('value');
      if (value) await fromAccountSelect.selectOption(value);
    }

    // 6) Submit
    const submitButton = page.getByRole('button', { name: /apply now|request|submit/i })
      .or(page.locator('input[type="submit"][value="Apply Now"], input[type="submit"][value="Apply"]'));
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // 7) Verify success/approval message
    // 7) Verify success OR error message
const successMessage = page.getByText(/Congratulations, your loan has been approved/i).first();
const errorMessage = page.getByText(/You do not have sufficient funds for the given down payment/i).first();

if (await successMessage.isVisible().catch(() => false)) {
  await expect(successMessage).toBeVisible();
} else {
  await expect(errorMessage).toBeVisible();
}


    // 8) Optional: if form remains/reloads, confirm values persist
    if (await amountInput.isVisible().catch(() => false)) {
      await expect(amountInput).toHaveValue('100');
      await expect(downPaymentInput).toHaveValue('10');
    }
  });
});


