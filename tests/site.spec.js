const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);

test('all local HTML href/src references resolve to files or in-page anchors', async () => {
  const missing = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const ids = new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]));
    for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
      const raw = match[1].trim();
      if (!raw || /^(?:https?:|\/\/|mailto:|tel:|javascript:|data:|blob:)/i.test(raw)) continue;
      const clean = raw.split('#')[0].split('?')[0];
      if (!clean) {
        const hash = raw.includes('#') ? raw.slice(raw.indexOf('#') + 1) : '';
        if (hash && !ids.has(decodeURIComponent(hash))) missing.push(`${path.relative(root, file)} -> missing anchor #${hash}`);
        continue;
      }
      let target;
      try { target = clean.startsWith('/') ? path.resolve(root, decodeURIComponent(clean).slice(1)) : path.resolve(path.dirname(file), decodeURIComponent(clean)); }
      catch { missing.push(`${path.relative(root, file)} -> invalid path ${raw}`); continue; }
      if (!target.startsWith(root + path.sep) && target !== root) {
        missing.push(`${path.relative(root, file)} -> path escapes repository: ${raw}`);
      } else if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        missing.push(`${path.relative(root, file)} -> missing local target ${raw}`);
      }
    }
  }
  expect(missing, missing.join('\n')).toEqual([]);
});

test('homepage renders on desktop and mobile without horizontal overflow', async ({ page }) => {
  for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /AIOU Coaching/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Report Engine kholein/i })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth
    }));
    expect(dimensions.content, `horizontal overflow at ${viewport.width}px: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test('report engine supports mobile layout and report generation flow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tools/aiou-report-engine.html');
  await expect(page.getByRole('heading', { name: /Project setup/i })).toBeVisible();
  await page.locator('#program').fill('BS Economics');
  await page.locator('#student').fill('QA Student');
  await page.locator('#topic').fill('Effects of digital learning on student engagement');
  await page.locator('#agree').check();
  await page.locator('#generate').click();
  await expect(page.locator('#structurePanel')).toBeVisible();
  await page.locator('#toContent').click();
  await expect(page.locator('#contentPanel')).toBeVisible();
  await expect(page.locator('#sections textarea').first()).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth
  }));
  expect(dimensions.content, `report engine horizontal overflow: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test('DOCX export downloads a non-empty Office document', async ({ page }) => {
  await page.goto('/tools/aiou-report-engine.html');
  await page.locator('#program').fill('BS Economics');
  await page.locator('#student').fill('QA Student');
  await page.locator('#topic').fill('Effects of digital learning on student engagement');
  await page.locator('#agree').check();
  await page.locator('#generate').click();
  await page.locator('#toContent').click();
  await page.locator('#toExport').click();
  await expect(page.locator('#preview')).toContainText('Effects of digital learning');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#word').click();
  const download = await downloadPromise;
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const bytes = fs.readFileSync(filePath);
  expect(bytes.length).toBeGreaterThan(1000);
  expect(bytes.subarray(0, 2).toString()).toBe('PK');
  expect(download.suggestedFilename()).toMatch(/\.docx$/i);
});

test('PDF export opens a populated print document that Chromium can render as PDF', async ({ page, context }) => {
  await page.goto('/tools/aiou-report-engine.html');
  await page.locator('#program').fill('BS Economics');
  await page.locator('#student').fill('QA Student');
  await page.locator('#topic').fill('Effects of digital learning on student engagement');
  await page.locator('#agree').check();
  await page.locator('#generate').click();
  await page.locator('#toContent').click();
  await page.locator('#toExport').click();
  const popupPromise = context.waitForEvent('page');
  await page.locator('#pdf').click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  await expect(popup.locator('body')).toContainText('Effects of digital learning');
  const pdf = await popup.pdf({ format: 'A4', printBackground: true });
  expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
  expect(pdf.length).toBeGreaterThan(1000);
});
