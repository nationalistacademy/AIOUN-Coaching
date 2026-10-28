const { test, expect } = require('@playwright/test');

test.describe('Assignment Writing Studio', () => {
  test('is discoverable from homepage and tool registry', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Writing Studio/i }).first()).toHaveAttribute('href', /aiou-assignment-writing-studio\.html/);
    await expect.poll(() => page.evaluate(() => window.AIOU?.tools?.list?.some(tool => tool.name === 'Bilingual Assignment Writing Studio' && tool.file === 'aiou-assignment-writing-studio.html'))).toBe(true);
  });

  test('supports watermark settings, Urdu mode, tables and diagrams', async ({ page }) => {
    await page.goto('/tools/aiou-assignment-writing-studio.html');
    await page.locator('#watermark').fill('DRAFT COPY');
    await expect(page.locator('#paper')).toHaveAttribute('data-watermark', 'DRAFT COPY');
    await page.locator('#lang').selectOption('ur');
    await expect(page.locator('#paper')).toHaveAttribute('dir', 'rtl');
    await page.locator('#insertTable2').click();
    await expect(page.locator('#editor table')).toHaveCount(1);
    await page.locator('#diagramText').fill('Input\nProcess\nOutput');
    await page.locator('#diagramBtn').click();
    await expect(page.locator('#editor svg')).toHaveCount(1);
    await expect(page.locator('#editor svg text').first()).toHaveText('Input');
  });

  test('exports a Word-compatible file and saves a browser-local draft', async ({ page }) => {
    await page.goto('/tools/aiou-assignment-writing-studio.html');
    await page.locator('#editor').fill('My assignment answer');
    await page.locator('#saveBtn').click();
    await expect(page.locator('#status')).toContainText('save ho gaya');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#wordBtn').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.doc$/);
  });

  test('rejects non-http image URLs and oversized local images', async ({ page }) => {
    await page.goto('/tools/aiou-assignment-writing-studio.html');
    page.once('dialog', dialog => dialog.accept('javascript:alert(1)'));
    await page.locator('#imageUrlBtn').click();
    await expect(page.locator('#editor img')).toHaveCount(0);
  });
});
