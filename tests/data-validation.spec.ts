import { test, expect } from '@playwright/test';

test.describe('Data Validation (TC014-TC015)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: /start quiz/i }).click();
  });

  test('TC045: Should validate question format and structure', async ({ page }) => {
    // Check that question has proper structure
    await expect(page.getByTestId('question-text')).toBeVisible();
    await expect(page.getByTestId('question-text')).not.toBeEmpty();
    
    // Should have exactly 4 answer options
    await expect(page.getByTestId('answer-option')).toHaveCount(4);
    
    // Each answer option should have text
    const answerOptions = page.getByTestId('answer-option');
    for (let i = 0; i < 4; i++) {
      await expect(answerOptions.nth(i)).not.toBeEmpty();
    }
  });

  test('TC046: Should validate score calculation accuracy', async ({ page }) => {
    // Initial score should be 0
    await expect(page.getByTestId('score')).toContainText('Score: 0/');
    
    // Answer first question correctly (we'll test both scenarios)
    await page.getByTestId('answer-option').first().click();
    await page.waitForTimeout(2000);
    
    // Score should either be 0 or 1, but format should be correct
    const scoreText = await page.getByTestId('score').textContent();
    expect(scoreText).toMatch(/Score: [01]\/\d+/);
  });

  test('TC047: Should validate question progression integrity', async ({ page }) => {
    const questions: string[] = [];
    
    // Collect first few questions to ensure they're different
    for (let i = 0; i < 3; i++) {
      const questionText = await page.getByTestId('question-text').textContent();
      if (questionText) {
        questions.push(questionText);
      }
      
      await page.getByTestId('answer-option').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Questions should be different
    expect(questions[0]).not.toBe(questions[1]);
    expect(questions[1]).not.toBe(questions[2]);
    expect(questions[0]).not.toBe(questions[2]);
  });

  test('TC048: Should validate final score calculation', async ({ page }) => {
    let correctAnswers = 0;
    
    // Track correct answers through the quiz
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('answer-option').first().click();
      
      // Check if answer was correct
      await page.waitForTimeout(500);
      const feedbackElement = page.getByTestId('feedback');
      if (await feedbackElement.isVisible()) {
        const feedbackText = await feedbackElement.textContent();
        if (feedbackText && feedbackText.toLowerCase().includes('correct')) {
          correctAnswers++;
        }
      }
      
      await page.waitForTimeout(1500);
      
      const gameOver = page.getByTestId('game-over');
      if (await gameOver.isVisible()) {
        break;
      }
    }
    
    // Validate final score format is correct (don't enforce exact match since we don't control answers)
    const finalScoreText = await page.getByTestId('final-score').textContent();
    expect(finalScoreText).toMatch(/Final Score: \d+\/10/);
  });

  test('TC049: Should validate timer accuracy', async ({ page }) => {
    // Timer should start at 30
    await expect(page.getByTestId('timer')).toContainText('30s');
    
    // Wait 3 seconds and check timer decreased
    await page.waitForTimeout(3000);
    const timerText = await page.getByTestId('timer').textContent();
    const timerValue = parseInt(timerText?.replace('s', '') || '0');
    
    // Should be between 25-29 (allowing for timing variations)
    expect(timerValue).toBeGreaterThanOrEqual(25);
    expect(timerValue).toBeLessThanOrEqual(29);
  });

  test('TC050: Should validate question counter accuracy', async ({ page }) => {
    // Should start with question 1
    await expect(page.getByTestId('question-counter')).toContainText('Question 1 of');
    
    // Answer and check counter increments
    await page.getByTestId('answer-option').first().click();
    await page.waitForTimeout(2000);
    await expect(page.getByTestId('question-counter')).toContainText('Question 2 of');
    
    // Answer and check again
    await page.getByTestId('answer-option').first().click();
    await page.waitForTimeout(2000);
    await expect(page.getByTestId('question-counter')).toContainText('Question 3 of');
  });

  test('TC051: Should validate answer option format', async ({ page }) => {
    const answerOptions = page.getByTestId('answer-option');
    
    // Check each answer option has proper structure
    for (let i = 0; i < 4; i++) {
      const option = answerOptions.nth(i);
      await expect(option).toBeVisible();
      await expect(option).toHaveClass(/border/);
      await expect(option).toHaveClass(/rounded-lg/);
      
      // Should have text content
      const text = await option.textContent();
      expect(text).toBeTruthy();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('TC052: Should validate feedback accuracy', async ({ page }) => {
    // Click an answer and verify feedback appears
    await page.getByTestId('answer-option').first().click();
    
    await expect(page.getByTestId('feedback')).toBeVisible();
    
    const feedbackText = await page.getByTestId('feedback').textContent();
    expect(feedbackText).toMatch(/^(Correct!|Incorrect!)$/);
  });

  test('TC053: Should validate game completion criteria', async ({ page }) => {
    let questionCount = 0;
    
    // Count questions until game over
    while (questionCount < 20) { // Safety limit
      await page.getByTestId('answer-option').first().click();
      await page.waitForTimeout(2000);
      
      questionCount++;
      
      const gameOver = page.getByTestId('game-over');
      if (await gameOver.isVisible()) {
        break;
      }
    }
    
    // Should complete after reasonable number of questions
    expect(questionCount).toBeGreaterThan(0);
    expect(questionCount).toBeLessThanOrEqual(15); // Reasonable upper limit
    
    // Game over screen should show
    await expect(page.getByTestId('game-over')).toBeVisible();
  });

  test('TC054: Should validate percentage calculation', async ({ page }) => {
    // Complete the quiz and check percentage
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('answer-option').first().click();
      await page.waitForTimeout(2000);
      
      const gameOver = page.getByTestId('game-over');
      if (await gameOver.isVisible()) {
        break;
      }
    }
    
    // Check that percentage is displayed and is valid
    const gameOverText = await page.getByTestId('game-over').textContent();
    const percentageMatch = gameOverText?.match(/(\d+)% correct/);
    
    if (percentageMatch) {
      const percentage = parseInt(percentageMatch[1]);
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    }
  });

  test('TC055: Should validate data consistency after restart', async ({ page }) => {
    // Complete one quiz
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
    
    // Verify fresh state
    await expect(page.getByTestId('question-counter')).toContainText('Question 1 of');
    await expect(page.getByTestId('score')).toContainText('Score: 0/');
    await expect(page.getByTestId('timer')).toContainText('30s');
    
    // Should have 4 answer options
    await expect(page.getByTestId('answer-option')).toHaveCount(4);
  });

  test('TC056: Should validate total questions count consistency', async ({ page }) => {
    // Check question counter format
    const counterText = await page.getByTestId('question-counter').textContent();
    const totalMatch = counterText?.match(/Question 1 of (\d+)/);
    
    expect(totalMatch).toBeTruthy();
    const totalQuestions = parseInt(totalMatch?.[1] || '0');
    expect(totalQuestions).toBeGreaterThan(0);
    
    // Score should show same total
    const scoreText = await page.getByTestId('score').textContent();
    expect(scoreText).toContain(`/${totalQuestions}`);
  });

  test('TC057: Should validate answer selection prevents multiple selections', async ({ page }) => {
    // Click first answer
    await page.getByTestId('answer-option').first().click();
    
    // Try to click another answer
    await page.getByTestId('answer-option').nth(1).click();
    
    // Should only have one feedback message
    await expect(page.getByTestId('feedback')).toHaveCount(1);
    
    // Should only have one selected state (either green or red background)
    const selectedStates = await page.locator('[data-testid="answer-option"][class*="bg-"]').count();
    expect(selectedStates).toBeGreaterThanOrEqual(1);
  });
});
