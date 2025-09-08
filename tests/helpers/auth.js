const { expect } = require('@playwright/test');

const BASE_URL = process.env.PARABANK_BASE_URL || 'http://localhost:8080/parabank';
const DEFAULT_USERNAME = process.env.PARABANK_USERNAME || 'john';
const DEFAULT_PASSWORD = process.env.PARABANK_PASSWORD || 'demo';

async function login(page, username = DEFAULT_USERNAME, password = DEFAULT_PASSWORD) {
  await page.goto(BASE_URL);

  const usernameInput = page.getByRole('textbox', { name: /username/i }).or(page.locator('input[name="username"]'));
  const passwordInput = page.getByRole('textbox', { name: /password/i }).or(page.locator('input[name="password"]'));
  await expect(usernameInput).toBeVisible();
  await usernameInput.fill(username);
  await expect(passwordInput).toBeVisible();
  await passwordInput.fill(password);

  const loginButton = page.getByRole('button', { name: /log in/i })
    .or(page.locator('input[type="submit"][value="Log In"]'));
  await expect(loginButton).toBeVisible();
  await loginButton.click();

  await expect(page.getByRole('heading', { name: /Accounts Overview/i })).toBeVisible();
}

async function logout(page) {
  const logoutLink = page.getByRole('link', { name: /Log Out/i })
    .or(page.getByRole('button', { name: /Log Out/i }))
    .or(page.locator('a:has-text("Log Out"), button:has-text("Log Out")'));
  await expect(logoutLink).toBeVisible();
  await logoutLink.click();

  const loginButton = page.getByRole('button', { name: /log in/i })
    .or(page.locator('input[type="submit"][value="Log In"]'));
  await expect(loginButton).toBeVisible();
}

module.exports = { login, logout };


