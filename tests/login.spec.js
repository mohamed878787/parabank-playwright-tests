// Playwright Test for ParaBank login
// URL: http://localhost:8080/parabank

const { test, expect } = require('@playwright/test');

// Use env vars if provided, otherwise fall back to sample creds
const PARABANK_BASE_URL = process.env.PARABANK_BASE_URL || 'http://localhost:8080/parabank';
const PARABANK_USERNAME = process.env.PARABANK_USERNAME || 'john';
const PARABANK_PASSWORD = process.env.PARABANK_PASSWORD || 'demo';

test.describe('ParaBank Login', () => {
  test('logs in and shows Accounts Overview', async ({ page }) => {
    // 1) Navigate to login page (ParaBank shows login form on the home page)
    await page.goto(PARABANK_BASE_URL);

    // 2) Enter username and password
    await page.locator('input[name="username"]').fill(PARABANK_USERNAME);
    await page.locator('input[name="password"]').fill(PARABANK_PASSWORD);

    // 3) Submit the form
    // The login button is an input[type=submit] with value "Log In" on ParaBank
    const loginButton = page.locator('input[type="submit"][value="Log In"]');
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // 4) Verify successful login by checking for "Accounts Overview" page content
    // Accept either a heading or visible text containing "Accounts Overview"
    //const accountsOverviewHeading = page.getByRole('heading', { name: /Accounts Overview/i });
   // await expect(accountsOverviewHeading.or(page.getByText(/Accounts Overview/i))).toBeVisible();
    const accountsOverviewHeading = page.getByRole('heading', { name: 'Accounts Overview' });
    await expect(accountsOverviewHeading).toBeVisible();

  });
});


