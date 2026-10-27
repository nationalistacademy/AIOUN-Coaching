const { test, expect } = require('@playwright/test');

test('Firebase workspace stays disconnected without real config and fits mobile/desktop', async ({ page }) => {
  for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/firebase/index.html');
    await expect(page.getByRole('heading', { name: /Your study companion, connected/i })).toBeVisible();
    await expect(page.locator('#status')).toContainText('Firebase is not configured');
    await expect(page.locator('#signout')).toBeDisabled();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth
    }));
    expect(dimensions.content, 'Firebase workspace horizontal overflow at ' + viewport.width + 'px').toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test('public PWA service worker excludes both LMS and Firebase account routes', async ({ request }) => {
  const response = await request.get('/sw.js');
  expect(response.ok()).toBeTruthy();
  const sw = await response.text();
  expect(sw).toContain('isLms');
  expect(sw).toContain('isFirebase');
  expect(sw).toContain('isLms(url) || isFirebase(url)');
  expect(sw).toContain('aiou-coaching-pwa-v2');
});
