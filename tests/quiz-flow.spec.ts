import { test, expect } from '@playwright/test';

test.describe('Quiz Flow Tests (TC001-TC005)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('TC001: Should display start screen with title and start button', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Coding Quiz Game');
    await expect(page.locator('text=Test your programming knowledge!')).toBeVisible();
    await expect(page.getByRole('button', { name: /start quiz/i })).toBeVisible();
  });

  test('TC002: Should start quiz when start button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page.getByTestId('question-card')).toBeVisible();
    await expect(page.getByTestId('timer')).toBeVisible();
    await expect(page.getByTestId('question-counter')).toBeVisible();
  });

  test('TC003: Should display first question with answer options', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page.getByTestId('question-counter')).toContainText('Question 1 of');
    await expect(page.getByTestId('question-text')).toBeVisible();
    await expect(page.getByTestId('answer-option')).toHaveCount(4);
  });

  test('TC004: Should provide feedback after answer selection', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    await page.getByTestId('answer-option').first().click();
    await expect(page.getByTestId('feedback')).toBeVisible();
    await expect(page.getByTestId('feedback')).toHaveText(/correct|incorrect/i);
  });

  test('TC005: Should progress to next question after answer', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    const initialQuestion = await page.getByTestId('question-text').textContent();
    await page.getByTestId('answer-option').first().click();
    await page.waitForTimeout(2000); // Wait for auto-advance
    const newQuestion = await page.getByTestId('question-text').textContent();
    expect(newQuestion).not.toBe(initialQuestion);
  });

  test('TC006: Should show game over screen after last question', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Answer all questions quickly
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('answer-option').first().click();
      await page.waitForTimeout(2000);
      
      // Check if game over screen is shown
      const gameOver = page.getByTestId('game-over');
      if (await gameOver.isVisible()) {
        break;
      }
    }
    
    await expect(page.getByTestId('game-over')).toBeVisible();
    await expect(page.getByTestId('final-score')).toBeVisible();
    await expect(page.getByTestId('restart-button')).toBeVisible();
  });

  test('TC007: Should restart quiz when play again button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    
    // Complete the quiz
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('answer-option').first().click();
      await page.waitForTimeout(2000);
      
      const gameOver = page.getByTestId('game-over');
      if (await gameOver.isVisible()) {
        break;
      }
    }
    
    await page.getByTestId('restart-button').click();
    await expect(page.getByTestId('question-card')).toBeVisible();
    await expect(page.getByTestId('question-counter')).toContainText('Question 1 of');
  });

  test('TC008: Should display correct question counter', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page.getByTestId('question-counter')).toContainText('Question 1 of');
    
    await page.getByTestId('answer-option').first().click();
    await page.waitForTimeout(2000);
    await expect(page.getByTestId('question-counter')).toContainText('Question 2 of');
  });

  test('TC009: Should display score during quiz', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page.getByTestId('score')).toBeVisible();
    await expect(page.getByTestId('score')).toContainText('Score:');
  });

  test('TC010: Should prevent multiple clicks on same answer', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    const answerButton = page.getByTestId('answer-option').first();
    
    await answerButton.click();
    await answerButton.click(); // Second click should be ignored
    
    // Verify feedback appears only once
    await expect(page.getByTestId('feedback')).toHaveCount(1);
  });
});
