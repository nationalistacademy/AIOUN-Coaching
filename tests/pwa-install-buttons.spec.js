const { test, expect } = require('@playwright/test');

test('home-screen install card shows browser fallback when install prompt is unavailable', async ({ page }) => {
  await page.goto('/');
  await page.locator('#pwa-install-card').click();
  await expect(page.locator('#pwa-status')).toContainText('Install option not available');
});

test('both PWA install buttons use the browser install prompt when available', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    event.prompt = () => { window.__installPromptCalled = true; };
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(event);
  });
  await expect(page.locator('#pwa-install')).toBeVisible();
  await page.locator('#pwa-install-card').click();
  await expect.poll(() => page.evaluate(() => window.__installPromptCalled)).toBe(true);
});
