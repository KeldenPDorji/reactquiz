import { test, expect } from '@playwright/test';

test.describe('Basic App Tests', () => {
  test('should load the quiz app homepage', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.locator('h1')).toHaveText('Coding Quiz Game');
  });

  test('should have start quiz button visible', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.getByRole('button', { name: /start quiz/i })).toBeVisible();
  });
});
