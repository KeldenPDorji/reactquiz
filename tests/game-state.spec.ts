import { test, expect } from '@playwright/test';

test.describe('Game State Management (TC008-TC009)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('TC018: Should maintain correct game state - start', async ({ page }) => {
    // Initial state should be start screen
    await expect(page.locator('h1')).toHaveText('Coding Quiz Game');
    await expect(page.getByTestId('question-card')).not.toBeVisible();
    await expect(page.getByTestId('game-over')).not.toBeVisible();
  });

  test('TC019: Should transition to playing state', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Should be in playing state
    await expect(page.getByTestId('question-card')).toBeVisible();
    await expect(page.getByTestId('timer')).toBeVisible();
    await expect(page.locator('h1')).not.toBeVisible();
  });

  test('TC020: Should transition to end state after completion', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Complete all questions
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('answer-option').first().click();
      await page.waitForTimeout(2000);
      
      const gameOver = page.getByTestId('game-over');
      if (await gameOver.isVisible()) {
        break;
      }
    }
    
    // Should be in end state
    await expect(page.getByTestId('game-over')).toBeVisible();
    await expect(page.getByTestId('question-card')).not.toBeVisible();
    await expect(page.getByTestId('timer')).not.toBeVisible();
  });

  test('TC021: Should reset state on restart', async ({ page }) => {
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
    
    // Restart
    await page.getByTestId('restart-button').click();
    
    // Should be back in playing state with reset values
    await expect(page.getByTestId('question-counter')).toContainText('Question 1 of');
    await expect(page.getByTestId('score')).toContainText('Score: 0/');
    await expect(page.getByTestId('timer')).toContainText('30s');
  });

  test('TC022: Should maintain score state during quiz', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    const initialScore = await page.getByTestId('score').textContent();
    expect(initialScore).toContain('Score: 0/');
    
    // Answer a question
    await page.getByTestId('answer-option').first().click();
    await page.waitForTimeout(2000);
    
    // Score should update (either stay 0 or become 1)
    const updatedScore = await page.getByTestId('score').textContent();
    expect(updatedScore).toMatch(/Score: [01]\//);
  });

  test('TC023: Should preserve question progression', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Answer first question
    await page.getByTestId('answer-option').first().click();
    await page.waitForTimeout(2000);
    
    // Should be on question 2
    await expect(page.getByTestId('question-counter')).toContainText('Question 2 of');
    
    // Answer second question
    await page.getByTestId('answer-option').first().click();
    await page.waitForTimeout(2000);
    
    // Should be on question 3
    await expect(page.getByTestId('question-counter')).toContainText('Question 3 of');
  });

  test('TC024: Should handle state transitions correctly', async ({ page }) => {
    // Test complete flow: start -> playing -> end -> start
    
    // Initial: start state
    await expect(page.locator('h1')).toBeVisible();
    
    // Transition to playing
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page.getByTestId('question-card')).toBeVisible();
    
    // Complete quiz to transition to end
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('answer-option').first().click();
      await page.waitForTimeout(2000);
      
      const gameOver = page.getByTestId('game-over');
      if (await gameOver.isVisible()) {
        break;
      }
    }
    
    // Should be in end state
    await expect(page.getByTestId('game-over')).toBeVisible();
    
    // Restart to go back to playing
    await page.getByTestId('restart-button').click();
    await expect(page.getByTestId('question-card')).toBeVisible();
  });
});
