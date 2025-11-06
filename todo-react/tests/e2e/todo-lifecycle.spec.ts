import { test, expect } from '@playwright/test';

test.describe('Todo Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /^login$/i }).click();

    // Wait for dashboard
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('should display todo form and empty state', async ({ page }) => {
    // Should see the form
    await expect(page.getByText(/title/i)).toBeVisible();

    // May see empty state if no todos exist
    const emptyState = page.getByText(/no todos found/i);
    const todoItems = page.locator('[data-testid*="todo"]');

    const isEmpty = await emptyState.isVisible().catch(() => false);
    const hasTodos = (await todoItems.count()) > 0;

    // Either empty state or todos should be visible
    expect(isEmpty || hasTodos).toBe(true);
  });

  test('should create a new todo', async ({ page }) => {
    const todoTitle = `Test Todo ${Date.now()}`;

    // Fill in the form
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);

    // Submit form (look for Add or Create button)
    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    // Wait for todo to appear
    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });
  });

  test('should create todo with description and priority', async ({ page }) => {
    const todoTitle = `Detailed Todo ${Date.now()}`;
    const todoDescription = 'This is a detailed description';

    // Fill in title
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);

    // Fill in description if available
    const descriptionInput = page.locator('textarea').first();
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill(todoDescription);
    }

    // Select priority
    const prioritySelect = page.locator('select').first();
    if (await prioritySelect.isVisible()) {
      await prioritySelect.selectOption('2'); // High priority
    }

    // Submit
    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    // Verify todo appears
    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

    // Verify description if it was added
    if (await descriptionInput.isVisible()) {
      await expect(page.getByText(todoDescription)).toBeVisible();
    }
  });

  test('should toggle todo completion', async ({ page }) => {
    // Create a todo first
    const todoTitle = `Toggle Todo ${Date.now()}`;
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);

    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

    // Find the checkbox for this todo
    const todoItem = page.locator(`text=${todoTitle}`).locator('..');
    const checkbox = todoItem.locator('input[type="checkbox"]').first();

    // Toggle completion
    await checkbox.check();

    // Wait a bit for the update
    await page.waitForTimeout(500);

    // Checkbox should be checked
    await expect(checkbox).toBeChecked();

    // Toggle back
    await checkbox.uncheck();
    await page.waitForTimeout(500);

    // Checkbox should be unchecked
    await expect(checkbox).not.toBeChecked();
  });

  test('should edit an existing todo', async ({ page }) => {
    // Create a todo first
    const originalTitle = `Original Todo ${Date.now()}`;
    const updatedTitle = `Updated Todo ${Date.now()}`;

    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(originalTitle);

    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    await expect(page.getByText(originalTitle)).toBeVisible({ timeout: 5000 });

    // Click Edit button
    const editButton = page.getByRole('button', { name: /edit/i }).first();
    await editButton.click();

    // Should see edit modal/form
    await page.waitForTimeout(500);

    // Find the title input in the modal
    const modalTitleInput = page.locator('input[type="text"]').last();
    await modalTitleInput.clear();
    await modalTitleInput.fill(updatedTitle);

    // Save changes
    const saveButton = page.getByRole('button', { name: /save/i }).first();
    await saveButton.click();

    // Verify updated title appears
    await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(originalTitle)).not.toBeVisible();
  });

  test('should delete a todo with confirmation', async ({ page }) => {
    // Create a todo first
    const todoTitle = `Delete Todo ${Date.now()}`;

    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);

    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

    // Setup dialog handler to accept confirmation
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('delete');
      await dialog.accept();
    });

    // Click Delete button
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    await deleteButton.click();

    // Todo should disappear
    await expect(page.getByText(todoTitle)).not.toBeVisible({ timeout: 5000 });
  });

  test('should cancel todo deletion', async ({ page }) => {
    // Create a todo first
    const todoTitle = `Keep Todo ${Date.now()}`;

    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);

    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

    // Setup dialog handler to reject confirmation
    page.once('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    // Click Delete button
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    await deleteButton.click();

    // Todo should still be visible
    await page.waitForTimeout(500);
    await expect(page.getByText(todoTitle)).toBeVisible();
  });

  test('should complete full todo lifecycle: create -> edit -> complete -> delete', async ({
    page,
  }) => {
    const originalTitle = `Lifecycle Todo ${Date.now()}`;
    const updatedTitle = `Updated ${originalTitle}`;

    // 1. CREATE
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(originalTitle);
    await page.getByRole('button', { name: /add|create/i }).first().click();
    await expect(page.getByText(originalTitle)).toBeVisible({ timeout: 5000 });

    // 2. EDIT
    await page.getByRole('button', { name: /edit/i }).first().click();
    await page.waitForTimeout(500);
    const modalTitleInput = page.locator('input[type="text"]').last();
    await modalTitleInput.clear();
    await modalTitleInput.fill(updatedTitle);
    await page.getByRole('button', { name: /save/i }).first().click();
    await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 5000 });

    // 3. COMPLETE
    const todoItem = page.locator(`text=${updatedTitle}`).locator('..');
    const checkbox = todoItem.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await page.waitForTimeout(500);
    await expect(checkbox).toBeChecked();

    // 4. DELETE
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.getByRole('button', { name: /delete/i }).first().click();
    await expect(page.getByText(updatedTitle)).not.toBeVisible({ timeout: 5000 });
  });

  test('should display multiple todos', async ({ page }) => {
    // Create multiple todos
    const todoTitles = [
      `First Todo ${Date.now()}`,
      `Second Todo ${Date.now() + 1}`,
      `Third Todo ${Date.now() + 2}`,
    ];

    for (const title of todoTitles) {
      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill(title);
      await page.getByRole('button', { name: /add|create/i }).first().click();
      await page.waitForTimeout(500);
    }

    // All todos should be visible
    for (const title of todoTitles) {
      await expect(page.getByText(title)).toBeVisible();
    }
  });
});
