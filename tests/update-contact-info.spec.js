const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PARABANK_BASE_URL || 'http://localhost:8080/parabank';
const USERNAME = process.env.PARABANK_USERNAME || 'john';
const PASSWORD = process.env.PARABANK_PASSWORD || 'demo';

test.describe('ParaBank Update Contact Info', () => {
  test('updates address and phone and verifies persistence', async ({ page }) => {
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

    // 2) Verify Accounts Overview loaded
    await expect(page.getByRole('heading', { name: /Accounts Overview/i })).toBeVisible();

    // 3) Navigate to Update Contact Info / Profile page
    const profileLink = page
      .getByRole('link', { name: /Update Contact Info|Profile/i })
      .or(page.getByRole('link', { name: /Update Profile/i }))
      .or(page.locator('a:has-text("Update Contact Info"), a:has-text("Profile")'));
    await expect(profileLink).toBeVisible();
    await profileLink.click();

    // 4) Ensure the profile form is visible
   // Only target the heading
    const profileHeading = page.getByRole('heading', { name: /Update Profile/i });
    await expect(profileHeading).toBeVisible();

    // 5) Prepare new values
    const updated = {
      address: '456 Elm St',
      city: 'Metropolis',
      state: 'NY',
      zip: '10101',
      phone: '5559876543',
    };

    // 6) Fill the form using role-based / label fallbacks
    const addressInput = page.getByLabel(/address/i).or(page.locator('input[name="customer.address.street"]'));
    const cityInput = page.getByLabel(/city/i).or(page.locator('input[name="customer.address.city"]'));
    const stateInput = page.getByLabel(/state/i).or(page.locator('input[name="customer.address.state"]'));
    const zipInput = page.getByLabel(/zip/i).or(page.locator('input[name="customer.address.zipCode"]'));
    const phoneInput = page.getByLabel(/phone/i).or(page.locator('input[name="customer.phoneNumber"]'));

    await expect(addressInput).toBeVisible();
    await addressInput.fill(updated.address);
    await expect(cityInput).toBeVisible();
    await cityInput.fill(updated.city);
    await expect(stateInput).toBeVisible();
    await stateInput.fill(updated.state);
    await expect(zipInput).toBeVisible();
    await zipInput.fill(updated.zip);
    await expect(phoneInput).toBeVisible();
    await phoneInput.fill(updated.phone);

    // 7) Submit the form
    const submitButton = page.getByRole('button', { name: /update profile|submit|save/i })
      .or(page.locator('input[type="submit"][value="Update Profile"], input[type="submit"][value="Update"]'));
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // 8) Handle potential modal/confirmation gracefully (optional)
    const dialog = page.getByRole('dialog');
    try {
      if (await dialog.isVisible({ timeout: 2000 })) {
        const okButton = dialog.getByRole('button', { name: /ok|close|confirm/i });
        if (await okButton.isVisible()) {
          await okButton.click();
        }
      }
    } catch (_) {
      // no dialog appeared
    }

    // 9) Verify success message appears
    const heading = page.getByRole('heading', { name: /Profile Updated/i });
    await expect(heading).toBeVisible();


    // 10) Confirm the updated values persist in the form
    await expect(addressInput).toHaveValue(updated.address);
    await expect(cityInput).toHaveValue(updated.city);
    await expect(stateInput).toHaveValue(updated.state);
    await expect(zipInput).toHaveValue(updated.zip);
    await expect(phoneInput).toHaveValue(updated.phone);
  });
});


