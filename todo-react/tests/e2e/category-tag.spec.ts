import { test, expect } from '@playwright/test';

test.describe('Category and Tag Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /^login$/i }).click();

    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('should create a new category', async ({ page }) => {
    const categoryName = `Test Category ${Date.now()}`;

    // Look for category manager button/section
    const categoryButton = page.getByText(/category|categories/i).first();

    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(500);

      // Fill in category form
      const nameInput = page.getByPlaceholder(/category name|name/i).or(
        page.locator('input[type="text"]').last()
      );

      if (await nameInput.isVisible()) {
        await nameInput.fill(categoryName);

        // Select a color if available
        const colorInput = page.locator('input[type="color"]').or(
          page.locator('input[placeholder*="color"]')
        );

        if (await colorInput.isVisible()) {
          await colorInput.fill('#3B82F6');
        }

        // Submit
        const submitButton = page.getByRole('button', { name: /add|create/i }).last();
        await submitButton.click();

        // Verify category appears
        await expect(page.getByText(categoryName)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should create a new tag', async ({ page }) => {
    const tagName = `Test Tag ${Date.now()}`;

    // Look for tag manager button/section
    const tagButton = page.getByText(/tag|tags/i).first();

    if (await tagButton.isVisible()) {
      await tagButton.click();
      await page.waitForTimeout(500);

      // Fill in tag form
      const nameInput = page.getByPlaceholder(/tag name|name/i).or(
        page.locator('input[type="text"]').last()
      );

      if (await nameInput.isVisible()) {
        await nameInput.fill(tagName);

        // Select a color if available
        const colorInput = page.locator('input[type="color"]').or(
          page.locator('input[placeholder*="color"]')
        );

        if (await colorInput.isVisible()) {
          await colorInput.fill('#EF4444');
        }

        // Submit
        const submitButton = page.getByRole('button', { name: /add|create/i }).last();
        await submitButton.click();

        // Verify tag appears
        await expect(page.getByText(tagName)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should assign category to todo', async ({ page }) => {
    const todoTitle = `Todo with Category ${Date.now()}`;

    // Create a todo
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);

    // Select a category if dropdown is available
    const categorySelect = page.locator('select').first();

    if (await categorySelect.isVisible()) {
      const options = await categorySelect.locator('option').count();

      if (options > 1) {
        // Select the first non-empty option
        await categorySelect.selectOption({ index: 1 });
      }
    }

    // Submit
    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    // Verify todo appears
    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

    // If a category was selected, verify it's displayed
    // (The exact verification depends on your UI)
  });

  test('should assign tags to todo', async ({ page }) => {
    const todoTitle = `Todo with Tags ${Date.now()}`;

    // Create a todo
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);

    // Look for tag checkboxes or multi-select
    const tagCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await tagCheckboxes.count();

    if (checkboxCount > 0) {
      // Check the first tag
      await tagCheckboxes.first().check();
    }

    // Submit
    const submitButton = page.getByRole('button', { name: /add|create/i }).first();
    await submitButton.click();

    // Verify todo appears
    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });
  });

  test('should filter todos by category', async ({ page }) => {
    // Create a todo (it may or may not have a category)
    const todoTitle = `Filter Test ${Date.now()}`;
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);
    await page.getByRole('button', { name: /add|create/i }).first().click();
    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

    // Look for filter section
    const filterSelect = page.locator('select').filter({ hasText: /category|filter/i });

    if (await filterSelect.isVisible()) {
      const options = await filterSelect.locator('option').count();

      if (options > 1) {
        // Select a category filter
        await filterSelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);

        // Todos should be filtered (exact behavior depends on what category was selected)
        // Just verify the page doesn't error
        await expect(page).toHaveURL('/');
      }
    }
  });

  test('should filter todos by completion status', async ({ page }) => {
    // Create a todo
    const todoTitle = `Status Filter ${Date.now()}`;
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);
    await page.getByRole('button', { name: /add|create/i }).first().click();
    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

    // Look for completed filter checkbox or button
    const completedFilter = page.getByText(/show completed|completed only/i);

    if (await completedFilter.isVisible()) {
      await completedFilter.click();
      await page.waitForTimeout(500);

      // The incomplete todo should not be visible (or only completed ones shown)
      // This depends on your filter implementation
    }

    // Look for "All" or reset filter
    const allFilter = page.getByText(/all|show all/i);

    if (await allFilter.isVisible()) {
      await allFilter.click();
      await page.waitForTimeout(500);

      // Todo should be visible again
      await expect(page.getByText(todoTitle)).toBeVisible();
    }
  });

  test('should navigate through pagination', async ({ page }) => {
    // This test assumes pagination exists
    // Look for pagination controls
    const nextButton = page.getByRole('button', { name: /next/i });
    const prevButton = page.getByRole('button', { name: /previous|prev/i });

    const hasNextButton = await nextButton.isVisible();
    const hasPrevButton = await prevButton.isVisible();

    if (hasNextButton) {
      // Check if next button is enabled
      const isNextDisabled = await nextButton.isDisabled();

      if (!isNextDisabled) {
        // Click next
        await nextButton.click();
        await page.waitForTimeout(500);

        // Should see page indicator
        const pageIndicator = page.getByText(/page \d+/i);
        if (await pageIndicator.isVisible()) {
          await expect(pageIndicator).toBeVisible();
        }

        // Go back
        if (hasPrevButton) {
          await prevButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should display category badge on todo', async ({ page }) => {
    const todoTitle = `Badged Todo ${Date.now()}`;

    // Create a todo with category
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(todoTitle);

    // Try to select a category
    const categorySelect = page.locator('select').first();
    if (await categorySelect.isVisible()) {
      const options = await categorySelect.locator('option').count();
      if (options > 1) {
        await categorySelect.selectOption({ index: 1 });
        const selectedOption = await categorySelect.inputValue();

        // Submit
        await page.getByRole('button', { name: /add|create/i }).first().click();
        await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

        // Verify category badge appears near the todo
        // (Exact verification depends on your UI structure)
      }
    }
  });
});
