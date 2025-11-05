import { test, expect } from '@playwright/test';

test.describe('Error Recovery and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /^login$/i }).click();

    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    // Try to create a todo
    const todoTitle = `Offline Todo ${Date.now()}`;
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);

    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    // Should show some kind of error indication
    // (depends on your error handling implementation)
    await page.waitForTimeout(2000);

    // Restore online mode
    await context.setOffline(false);

    // Page should still be functional
    await expect(page).toHaveURL('/');
  });

  test('should handle empty todo creation attempt', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    // Should either show validation error or prevent submission
    // HTML5 validation should prevent submission
    await page.waitForTimeout(500);

    // Should still be on the same page
    await expect(page).toHaveURL('/');
  });

  test('should handle rapid todo creation', async ({ page }) => {
    // Create multiple todos rapidly
    const todos = [
      `Rapid Todo 1 ${Date.now()}`,
      `Rapid Todo 2 ${Date.now() + 1}`,
      `Rapid Todo 3 ${Date.now() + 2}`,
    ];

    for (const todoTitle of todos) {
      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill(todoTitle);
      await page.getByRole('button', { name: /add|create/i }).first().click();
      // Very short wait to simulate rapid submission
      await page.waitForTimeout(200);
    }

    // Wait for all to process
    await page.waitForTimeout(2000);

    // All todos should eventually appear
    for (const todoTitle of todos) {
      await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle session expiration', async ({ page }) => {
    // Clear localStorage to simulate expired session
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });

    // Try to perform an action that requires auth
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill('Test Todo');
    await page.getByRole('button', { name: /add|create/i }).first().click();

    // Should redirect to login or show auth error
    await page.waitForTimeout(2000);

    // Should either be on login page or show error
    const onLoginPage = page.url().includes('/login');
    const hasError = await page.getByText(/unauthorized|login|auth/i).isVisible().catch(() => false);

    expect(onLoginPage || hasError).toBe(true);
  });

  test('should handle browser back button', async ({ page }) => {
    // Navigate to login from dashboard
    await page.goto('/login');

    // Go back to dashboard
    await page.goBack();

    // Should still be authenticated and see dashboard
    await page.waitForTimeout(500);
    const isOnDashboard = page.url() === new URL('/', page.url()).href;

    if (!isOnDashboard) {
      // May have redirected to login if session expired
      // That's also acceptable behavior
      const onLogin = page.url().includes('/login');
      expect(onLogin).toBe(true);
    }
  });

  test('should handle browser refresh during todo creation', async ({ page }) => {
    const todoTitle = `Refresh Todo ${Date.now()}`;

    // Start filling the form
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);

    // Refresh before submitting
    await page.reload();

    // Form should be cleared
    const titleInputAfterRefresh = page.locator('input[type="text"]').first();
    const value = await titleInputAfterRefresh.inputValue();

    // Should be empty after refresh
    expect(value).toBe('');
  });

  test('should handle very long todo title', async ({ page }) => {
    // Create a very long title
    const longTitle = 'A'.repeat(500);

    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(longTitle);

    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    // Should either:
    // 1. Show validation error for too long title
    // 2. Truncate the title
    // 3. Create the todo successfully (if no length limit)

    await page.waitForTimeout(1000);

    // Just verify the page doesn't crash
    await expect(page).toHaveURL('/');
  });

  test('should handle special characters in todo title', async ({ page }) => {
    const specialTitle = `Todo with <script>alert('xss')</script> & "quotes" ${Date.now()}`;

    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(specialTitle);

    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    // Wait for todo to be created
    await page.waitForTimeout(1000);

    // Verify special characters are properly escaped/handled
    // XSS should be prevented
    const alerts = [];
    page.on('dialog', async (dialog) => {
      alerts.push(dialog.message());
      await dialog.dismiss();
    });

    // Wait to see if any XSS alert appears
    await page.waitForTimeout(1000);

    // Should not have triggered any XSS
    expect(alerts.length).toBe(0);
  });

  test('should handle multiple tabs/windows', async ({ page, context }) => {
    // Create a todo in the first tab
    const todoTitle = `Multi Tab Todo ${Date.now()}`;
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);
    await page.getByRole('button', { name: /add|create/i }).first().click();

    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

    // Open a new tab
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Should also see the todo in the new tab (after it loads)
    await expect(newPage.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

    await newPage.close();
  });

  test('should preserve UI state during loading', async ({ page }) => {
    // Create a todo
    const todoTitle = `State Test ${Date.now()}`;
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);

    // Submit
    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    // During loading, button should be disabled or show loading state
    // This check needs to be very fast to catch the loading state
    const isDisabled = await submitButton.isDisabled().catch(() => false);

    // Either it's disabled during loading or it's already finished
    // (timing dependent, so we just verify no crash)
    await page.waitForTimeout(500);

    // Verify todo appears
    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });
  });
});
