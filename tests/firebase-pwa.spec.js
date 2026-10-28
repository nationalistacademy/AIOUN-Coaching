const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('Firebase workspace loads the supplied public config and fits mobile/desktop', async ({ page }) => {
  for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/firebase/index.html');
    await expect(page.getByRole('heading', { name: /Your study companion, connected/i })).toBeVisible();
    expect(await page.evaluate(() => window.AIOU_FIREBASE_CONFIG?.projectId)).toBe('aioucoaching');
    await expect(page.locator('#status')).not.toContainText('Firebase is not configured');
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

test('Firebase security scaffolding denies public private-data access and protects notification sender', async () => {
  const firestore = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
  const storage = fs.readFileSync(path.join(root, 'storage.rules'), 'utf8');
  const realtime = JSON.parse(fs.readFileSync(path.join(root, 'database.rules.json'), 'utf8'));
  const sender = fs.readFileSync(path.join(root, 'functions/index.js'), 'utf8');
  expect(firestore).toContain("request.auth.uid == uid");
  expect(firestore).toContain("request.auth.token.admin == true");
  expect(firestore).toContain("allow read, write: if false");
  expect(realtime.rules['.read']).toBe(false);
  expect(realtime.rules['.write']).toBe(false);
  expect(storage).toContain("request.auth.uid == uid");
  expect(storage).toContain("request.resource.size < 10 * 1024 * 1024");
  expect(storage).toContain("allow read, write: if false");
  expect(sender).toContain('request.auth.token.admin !== true');
  expect(sender).toContain('exports.sendUserNotification');
  expect(sender).toContain('sendEachForMulticast');
});
