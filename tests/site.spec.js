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

test('repository-local HTML links and in-page anchors resolve', async () => {
  const missing = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const ids = new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]));
    for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
      const raw = match[1].trim();
      // Firebase config is injected only during Pages deployment from repository variables.
      if (raw === './config.js' && path.relative(root, file).split(path.sep).join('/') === 'firebase/index.html') continue;
      if (!raw || ['http:', 'https:', '//', 'mailto:', 'tel:', 'javascript:', 'data:', 'blob:'].some(prefix => raw.toLowerCase().startsWith(prefix))) continue;
      if (raw.includes('$' + '{') || /PASTE_YOUR_|YOUR_.*_HERE/i.test(raw)) continue;
      // /p/ URLs are Blogger-hosted page routes, not repository file paths.
      if (/^\/p\//i.test(raw)) continue;
      const clean = raw.split('#')[0].split('?')[0];
      if (!clean) {
        const hash = raw.includes('#') ? decodeURIComponent(raw.slice(raw.indexOf('#') + 1)) : '';
        if (hash && !ids.has(hash)) missing.push(path.relative(root, file) + ' -> missing anchor #' + hash);
        continue;
      }
      let target;
      try {
        target = clean.startsWith('/')
          ? path.resolve(root, decodeURIComponent(clean).slice(1))
          : path.resolve(path.dirname(file), decodeURIComponent(clean));
      } catch {
        missing.push(path.relative(root, file) + ' -> invalid path ' + raw);
        continue;
      }
      if (!target.startsWith(root + path.sep) && target !== root) {
        missing.push(path.relative(root, file) + ' -> path escapes repository: ' + raw);
      } else if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        missing.push(path.relative(root, file) + ' -> missing local target ' + raw);
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


test('mobile navigation and site search are interactive', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ui/index.html');
  const menu = page.locator('.menu');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.locator('.mobile-nav a[href="#assignments"]').click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#assignments')).toBeVisible();

  const search = page.getByRole('button', { name: 'Search this site' });
  await search.click();
  await page.getByRole('searchbox', { name: 'Search AIOU Coaching' }).fill('Assignment Writer');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('.search-status')).toContainText('matching section');
});

test('report engine supports mobile and desktop layouts and report generation flow', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1365, height: 900 }]) {
  await page.setViewportSize(viewport);
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
  expect(dimensions.content, `report engine horizontal overflow at ${viewport.width}px: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test('DOCX export downloads a non-empty Office document', async ({ page }) => {
  await page.goto('/tools/aiou-report-engine.html');
  await expect.poll(() => page.evaluate(() => Boolean(window.docx && window.docx.Packer && typeof window.saveAs === 'function')), { timeout: 20000, message: 'DOCX/FileSaver libraries failed to load from primary and fallback CDNs' }).toBe(true);
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
  const zipListing = execFileSync('unzip', ['-l', filePath], { encoding: 'utf8' });
  expect(zipListing).toContain('word/document.xml');
  const documentXml = execFileSync('unzip', ['-p', filePath, 'word/document.xml'], { encoding: 'utf8' });
  expect(documentXml).toContain('Effects of digital learning');
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
  const pdfSource = pdf.toString('latin1');
  const pageObjects = pdfSource.match(/\/Type\s*\/Page\b/g) || [];
  expect(pageObjects.length, 'PDF should paginate cover, contents and report sections').toBeGreaterThanOrEqual(3);
  await expect(popup.locator('body')).toContainText('Chapter 1 — Introduction');
  await expect(popup.locator('body')).toContainText('References');
});


test('PWA manifest and offline shell are wired without exposing LMS routes to cache', async ({ page, request }) => {
  await page.goto('/');
  const manifestResponse = await request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json();
  expect(manifest.name).toContain('AIOU Coaching');
  expect(manifest.start_url).toContain('source=pwa');
  expect(manifest.scope).toBe('./');
  expect(manifest.theme_color).toBe('#f67938');

  const swResponse = await request.get('/sw.js');
  expect(swResponse.ok()).toBeTruthy();
  const sw = await swResponse.text();
  expect(sw).toContain('offline.html');
  expect(sw).toMatch(/isLms\s*=\s*url\s*=>/);
  expect(sw).toContain('/lms');
  expect(sw).toContain('isFirebase');
  expect(sw).toContain('/firebase');
  await expect(page.locator('#pwa-install-card')).toBeVisible();
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
});


test('AIOU workshop reminder saves events and generates Google Calendar and ICS reminders', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tools/aiou-workshop-reminder.html');
  await expect(page.getByRole('heading', { name: /AIOU Workshop Reminder/i })).toBeVisible();
  await page.locator('#scheduleText').fill('Course Code 1429 | Workshop 1 | 12 November 2026 | 10:00 AM - 11:00 AM');
  await page.locator('#parseBtn').click();
  await expect(page.locator('#course')).toHaveValue('1429');
  await expect(page.locator('#date')).toHaveValue('2026-11-12');
  await expect(page.locator('#start')).toHaveValue('10:00');
  await expect(page.locator('#end')).toHaveValue('11:00');
  await expect(page.locator('#title')).toHaveValue(/AIOU Workshop/);

  await page.locator('#joinUrl').fill('https://aaghi.aiou.edu.pk/');
  await page.getByRole('button', { name: 'Save workshop in this browser' }).click();
  await expect(page.locator('#status')).toContainText('Reminder browser mein save ho gaya');
  await expect(page.locator('.wr-event')).toHaveCount(1);

  const calendarHref = await page.getByRole('link', { name: 'Add to Google Calendar' }).getAttribute('href');
  const calendarUrl = new URL(calendarHref);
  expect(calendarUrl.hostname).toBe('calendar.google.com');
  expect(calendarUrl.searchParams.get('ctz')).toBe('Asia/Karachi');
  expect(calendarUrl.searchParams.get('dates')).toContain('20261112T100000/20261112T110000');
  expect(calendarUrl.searchParams.get('details')).toContain('Course: 1429');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download .ics' }).click();
  const download = await downloadPromise;
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const ics = fs.readFileSync(filePath, 'utf8');
  expect(ics).toContain('BEGIN:VCALENDAR');
  expect(ics).toContain('DTSTART;TZID=Asia/Karachi:20261112T100000');
  expect(ics).toContain('DTEND;TZID=Asia/Karachi:20261112T110000');
  expect(ics).toContain('TRIGGER:-PT30M');
  expect(ics).toContain('END:VCALENDAR');
  await page.reload();
  await expect(page.locator('.wr-event')).toHaveCount(1);
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('.wr-event')).toHaveCount(0);
});


test('AIOU workshop Student ID launcher opens only the official lookup and does not persist the ID', async ({ page, context }) => {
  await page.goto('/tools/aiou-workshop-reminder.html');
  await page.locator('#studentId').fill('00ABC123456');
  const popupPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: /Copy ID & open AIOU lookup/i }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/online\.aiou\.edu\.pk\/live_site\/WorkshopAP\/schedule\/index6\.aspx/);
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toContain('00ABC123456');
  await expect(page.locator('#lookupStatus')).toContainText(/clipboard|manually copy/i);
});
