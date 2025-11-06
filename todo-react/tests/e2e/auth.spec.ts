import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should display login page on initial visit', async ({ page }) => {
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Todo App')).toBeVisible();
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('should show validation for empty login form', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.getByRole('button', { name: /^login$/i });

    // Try to submit empty form - browser validation should prevent it
    await loginButton.click();

    // HTML5 validation should prevent submission
    // Check that we're still on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[type="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');

    await page.getByRole('button', { name: /^login$/i }).click();

    // Wait for error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Note: This test requires a valid test user in the backend
    // You may need to create a test user first or mock the API
    await page.goto('/login');

    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');

    await page.getByRole('button', { name: /^login$/i }).click();

    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL('/', { timeout: 5000 });

    // Should see todo list or empty state
    await expect(
      page.getByText(/no todos found|create todo/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page from login', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: /register/i }).click();

    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole('heading', { name: /register/i })).toBeVisible();
  });

  test('should show validation for short password on register', async ({ page }) => {
    await page.goto('/register');

    await page.locator('input[type="text"]').fill('newuser');
    await page.locator('input[type="email"]').fill('new@example.com');
    await page.locator('input[type="password"]').fill('short'); // Less than 6 chars

    await page.getByRole('button', { name: /^register$/i }).click();

    // Should show error message
    await expect(
      page.getByText(/password must be at least 6 characters/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should navigate back to login from register', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('link', { name: /login/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('should logout successfully', async ({ page, context }) => {
    // First login
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /^login$/i }).click();

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 5000 });

    // Look for logout button (adjust selector based on your UI)
    const logoutButton = page.getByRole('button', { name: /logout/i });

    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

      // Should not have auth token in localStorage
      const hasToken = await page.evaluate(() => {
        return localStorage.getItem('token') !== null;
      });
      expect(hasToken).toBe(false);
    }
  });

  test('should persist authentication after page reload', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /^login$/i }).click();

    await expect(page).toHaveURL('/', { timeout: 5000 });

    // Reload page
    await page.reload();

    // Should still be authenticated and on dashboard
    await expect(page).toHaveURL('/');

    // Should not redirect to login
    await page.waitForTimeout(1000);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Clear any existing auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Try to access root (protected route)
    await page.goto('/');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});
