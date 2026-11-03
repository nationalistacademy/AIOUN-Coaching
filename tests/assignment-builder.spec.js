const { test, expect } = require('@playwright/test');
const path = require('node:path');

test.describe('AIOU Solved Assignment Builder', () => {
  test.beforeEach(async ({ page }) => {
    // The builder's editor and data handling must work without an AI/API service.
    // External fonts and optional PDF libraries are deliberately blocked in these tests.
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin === 'http://127.0.0.1:4173') return route.continue();
      if (url.hostname === 'cdn.jsdelivr.net' && url.pathname === '/npm/docx@9.1.0/build/index.umd.js') {
        return route.fulfill({ path: path.join(__dirname, '../vendor/docx.min.js'), contentType: 'application/javascript' });
      }
      return route.abort();
    });
    await page.goto('/tools/Aiou-solved-assignment-builder.html');
  });

  test('starts without fabricated student identity and explains local storage', async ({ page }) => {
    await expect(page.locator('#s-name')).toHaveValue('');
    await expect(page.locator('#s-id')).toHaveValue('');
    await expect(page.getByText(/Demo\/random student identity generate nahi hoti/i)).toBeVisible();
    await expect(page.locator('#s-rnd')).toHaveCount(0);
    await expect(page.locator('#s-clear-data')).toBeVisible();
  });

  test('adds and persists student-authored question and answer content locally', async ({ page }) => {
    await page.locator('#s-code').fill('260');
    await page.locator('#s-title').fill('Information Technology Basics');
    await page.locator('#s-q').fill('Explain the role of an operating system.');
    await page.locator('#s-editor').fill('An operating system manages hardware and software resources.');
    await page.locator('#s-add').click();

    await expect(page.locator('#s-list')).toContainText('Explain the role of an operating system.');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sab_v1')));
    expect(saved.S.a[1].qs[0].q).toContain('operating system');
    expect(saved.S.a[1].qs[0].a).toContain('manages hardware');
    expect(saved.f['s-code']).toBe('260');
  });

  test('sanitizes pasted rich HTML and removes executable or unsupported elements', async ({ page }) => {
    await page.locator('#s-editor').evaluate(el => {
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      const clipboard = new DataTransfer();
      clipboard.setData('text/html', '<p onclick="window.__xss=1" style="background-image:url(https://tracker.invalid/x)">Safe text</p>' +
        '<script>window.__xss=2</script><svg onload="window.__xss=3"><text>bad</text></svg>' +
        '<img src="x" onerror="window.__xss=4">' +
        '<a href="javascript:alert(1)">unsafe link</a>');
      clipboard.setData('text/plain', 'Safe text unsafe link');
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: clipboard, bubbles: true, cancelable: true }));
    });

    const html = await page.locator('#s-editor').evaluate(el => el.innerHTML);
    expect(html).toContain('Safe text');
    expect(html).toContain('unsafe link');
    expect(html).not.toMatch(/<script|<svg|<img|onerror|onclick|javascript:|background-image/i);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  });

  test('similarity checker reports overlap, not a plagiarism-free verdict', async ({ page }) => {
    const answer = 'Scarcity forces every society to make choices and every choice has an opportunity cost.';
    await page.locator('#s-q').fill('Explain scarcity.');
    await page.locator('#s-editor').fill(answer);
    await page.locator('#s-add').click();
    await page.locator('#s-src').fill(answer);
    await page.locator('#s-check').click();

    await expect(page.locator('#s-res')).toContainText('High overlap');
    await expect(page.locator('#s-res')).not.toContainText('Looks original');
    await expect(page.getByText(/plagiarism detector nahi/i)).toBeVisible();
  });

  test('exports a native DOCX containing an inserted image and can clear local saved data', async ({ page }) => {
    await page.locator('#s-q').fill('What is a computer network?');
    await page.locator('#s-editor').fill('A computer network connects devices to share information and resources.');
    await page.locator('#s-inline-image').setInputFiles({
      name: 'network.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l8sAAAAASUVORK5CYII=', 'base64')
    });
    await expect(page.locator('#s-editor img.sab-inline-image')).toHaveCount(1);
    await page.locator('#s-add').click();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('#s-doc').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.docx$/);

    page.once('dialog', dialog => dialog.accept());
    await page.locator('#s-clear-data').click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('sab_v1'))).toBeNull();
    await expect(page.locator('#s-name')).toHaveValue('');
  });

  test('applies Urdu RTL direction and inserts a safe image into the answer', async ({ page }) => {
    await page.locator('#s-editor').fill('یہ ایک اردو جواب ہے۔');
    await page.locator('#sab-dir-rtl').click();
    await expect(page.locator('#s-editor [dir="rtl"]')).toHaveCount(1);

    await page.locator('#s-inline-image').setInputFiles({
      name: 'diagram.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l8sAAAAASUVORK5CYII=', 'base64')
    });
    await expect(page.locator('#s-editor img.sab-inline-image')).toHaveCount(1);
    await expect(page.locator('#s-editor img.sab-inline-image')).toHaveCount(1);
  });
});
