const { test, expect } = require('@playwright/test');

test.describe('Dashboard and progress analysis', () => {
  test('dashboard includes active enrollments only', async ({ page }) => {
    await page.goto('/');
    await page.addScriptTag({ path: 'lms/dashboard-progress-utils.js' });
    const ids = await page.evaluate(() => [...window.AIOUDashboardUtils.activeCourseIds([
      { course_id: 'active-1', status: 'active' },
      { course_id: 'pending-1', status: 'pending' },
      { course_id: 'cancelled-1', status: 'cancelled' },
      { course_id: 'inactive-1', status: 'inactive' },
      { course_id: 'active-2', status: 'ACTIVE' },
      { course_id: 'missing-id', status: 'active' }
    ])]);
    expect(ids.sort()).toEqual(['active-1', 'active-2']);
  });

  test('latest quiz result is distinct from all-time average and trend', async ({ page }) => {
    await page.goto('/');
    await page.addScriptTag({ path: 'lms/progress-analysis-utils.js' });
    const result = await page.evaluate(() => {
      const attempts = [
        { id: 'a2', quiz_id: 'q1', score: 8, max_score: 10, submitted_at: '2026-10-02T10:00:00Z', quizzes: { title: 'Quiz 1' } },
        { id: 'a1', quiz_id: 'q1', score: 4, max_score: 10, submitted_at: '2026-10-01T10:00:00Z', quizzes: { title: 'Quiz 1' } },
        { id: 'b1', quiz_id: 'q2', score: 6, max_score: 10, submitted_at: '2026-10-01T09:00:00Z', quizzes: { title: 'Quiz 2' } }
      ];
      return window.AIOUProgressUtils.summarizeAttempts(attempts, new Map());
    });
    expect(result.gradedCount).toBe(3);
    expect(result.best).toBe(80);
    expect(result.average).toBe(60);
    expect(result.quizzes.find(q => q.quizId === 'q1').latestAccuracy).toBe(80);
    expect(result.quizzes.find(q => q.quizId === 'q1').delta).toBe(40);
  });

  test('topic analysis separates latest attempt from all-time history', async ({ page }) => {
    await page.goto('/');
    await page.addScriptTag({ path: 'lms/progress-analysis-utils.js' });
    const result = await page.evaluate(() => window.AIOUProgressUtils.topicBreakdown(
      [
        { attempt_id: 'old', question_id: 'q-old', is_correct: false },
        { attempt_id: 'new', question_id: 'q-new', is_correct: true },
        { attempt_id: 'new', question_id: 'q-old', is_correct: false }
      ],
      [{ id: 'q-old', topic: 'Algebra' }, { id: 'q-new', topic: 'Geometry' }],
      [
        { id: 'old', quiz_id: 'quiz', submitted_at: '2026-10-01T10:00:00Z' },
        { id: 'new', quiz_id: 'quiz', submitted_at: '2026-10-02T10:00:00Z' }
      ]
    ));
    expect(result.latest.find(t => t.topic === 'Geometry').correct).toBe(1);
    expect(result.latest.find(t => t.topic === 'Algebra').wrong).toBe(1);
    expect(result.allTime.find(t => t.topic === 'Algebra').wrong).toBe(2);
  });

  test('ungraded attempts do not distort accuracy averages', async ({ page }) => {
    await page.goto('/');
    await page.addScriptTag({ path: 'lms/progress-analysis-utils.js' });
    const result = await page.evaluate(() => window.AIOUProgressUtils.summarizeAttempts([
      { id: 'graded', quiz_id: 'q1', score: 5, max_score: 10, submitted_at: '2026-10-01T10:00:00Z' },
      { id: 'pending', quiz_id: 'q1', score: null, max_score: 10, submitted_at: '2026-10-02T10:00:00Z' }
    ], new Map()));
    expect(result.gradedCount).toBe(1);
    expect(result.average).toBe(50);
    expect(result.quizzes[0].latestAccuracy).toBe(50);
  });
});
