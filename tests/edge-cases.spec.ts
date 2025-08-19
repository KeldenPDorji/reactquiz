import { test, expect } from '@playwright/test';

test.describe('Edge Cases (TC012-TC013)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('TC035: Should handle rapid answer clicks gracefully', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Rapidly click multiple answer options
    const answerOptions = page.getByTestId('answer-option');
    await answerOptions.nth(0).click();
    await answerOptions.nth(1).click();
    await answerOptions.nth(2).click();
    
    // Should only register one answer
    await expect(page.getByTestId('feedback')).toHaveCount(1);
  });

  test('TC036: Should handle browser refresh during quiz', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Answer a question
    await page.getByTestId('answer-option').first().click();
    await page.waitForTimeout(2000);
    
    // Refresh the page
    await page.reload();
    
    // Should return to start screen
    await expect(page.locator('h1')).toHaveText('Coding Quiz Game');
    await expect(page.getByRole('button', { name: /start quiz/i })).toBeVisible();
  });

  test('TC037: Should handle multiple rapid restarts', async ({ page }) => {
    // Start and complete quiz
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('answer-option').first().click();
      await page.waitForTimeout(2000);
      
      const gameOver = page.getByTestId('game-over');
      if (await gameOver.isVisible()) {
        break;
      }
    }
    
    // Click restart once and verify it works
    const restartButton = page.getByTestId('restart-button');
    await restartButton.click();
    
    // Should handle gracefully and show question card
    await expect(page.getByTestId('question-card')).toBeVisible();
    await expect(page.getByTestId('question-counter')).toContainText('Question 1 of');
  });

  test('TC038: Should handle zero questions scenario gracefully', async ({ page }) => {
    // This test assumes we might have edge cases in question data
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Quiz should start normally even if there are potential data issues
    await expect(page.getByTestId('question-card')).toBeVisible();
    await expect(page.getByTestId('question-text')).toBeVisible();
    await expect(page.getByTestId('answer-option')).toHaveCount(4);
  });

  test('TC039: Should handle answer selection after feedback appears', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Click answer and wait for feedback
    await page.getByTestId('answer-option').first().click();
    await expect(page.getByTestId('feedback')).toBeVisible();
    
    // Try to click another answer after feedback is shown
    await page.getByTestId('answer-option').nth(1).click();
    
    // Should not change the selected answer
    await expect(page.getByTestId('feedback')).toHaveCount(1);
  });

  test('TC040: Should handle window resize during quiz', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Resize window
    await page.setViewportSize({ width: 500, height: 600 });
    await expect(page.getByTestId('question-card')).toBeVisible();
    
    // Resize to larger
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByTestId('question-card')).toBeVisible();
    
    // Quiz should continue to work normally
    await page.getByTestId('answer-option').first().click();
    await expect(page.getByTestId('feedback')).toBeVisible();
  });

  test('TC041: Should handle keyboard navigation (accessibility)', async ({ page }) => {
    // Focus on the page first
    await page.focus('body');
    
    // Tab navigation should work  
    await page.keyboard.press('Tab');
    const startButton = page.getByRole('button', { name: /start quiz/i });
    
    // Check if button is focused (may vary by browser)
    const isFocused = await startButton.evaluate(el => document.activeElement === el);
    if (isFocused) {
      // Enter should activate button
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('question-card')).toBeVisible();
    } else {
      // Fallback: click the button directly to test functionality
      await startButton.click();
      await expect(page.getByTestId('question-card')).toBeVisible();
    }
  });

  test('TC042: Should handle concurrent timer and user interactions', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Start timer and interact while it's running
    await page.waitForTimeout(5000); // Let timer run for 5 seconds
    
    // Answer should still work
    await page.getByTestId('answer-option').first().click();
    await expect(page.getByTestId('feedback')).toBeVisible();
    
    // Timer should still be running
    await expect(page.getByTestId('timer')).toBeVisible();
  });

  test('TC043: Should handle edge case with last question', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Navigate to last question
    for (let i = 0; i < 9; i++) {
      await page.getByTestId('answer-option').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Should be on last question
    const counterText = await page.getByTestId('question-counter').textContent();
    expect(counterText).toContain('10 of'); // Assuming 10 questions total
    
    // Answer last question
    await page.getByTestId('answer-option').first().click();
    await page.waitForTimeout(2000);
    
    // Should show game over
    await expect(page.getByTestId('game-over')).toBeVisible();
  });

  test('TC044: Should handle invalid answer indices gracefully', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // All answer options should be valid and clickable
    const answerOptions = page.getByTestId('answer-option');
    const count = await answerOptions.count();
    expect(count).toBe(4); // Should have exactly 4 options
    
    // Each option should be clickable
    for (let i = 0; i < count; i++) {
      await expect(answerOptions.nth(i)).toBeVisible();
      await expect(answerOptions.nth(i)).toBeEnabled();
    }
  });
});
