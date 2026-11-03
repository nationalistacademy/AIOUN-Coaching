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

  test('exports and restores a versioned JSON backup without losing either assignment', async ({ page }) => {
    await page.locator('#s-code').fill('260');
    await page.locator('#s-q').fill('Explain data communication.');
    await page.locator('#s-editor').fill('Data communication transfers information between devices.');
    await page.locator('#s-add').click();
    await page.locator('#s-t2').click();
    await page.locator('#s-q').fill('Define a computer network.');
    await page.locator('#s-editor').fill('A network connects two or more devices.');
    await page.locator('#s-add').click();

    const backup = await page.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem('sab_v1'));
      return JSON.stringify({ ...saved, schemaVersion: 2, exportedAt: new Date().toISOString() });
    });
    await page.evaluate(() => localStorage.removeItem('sab_v1'));
    await page.reload();

    page.once('dialog', dialog => dialog.accept());
    await page.locator('#s-backup-file').setInputFiles({
      name: 'assignment-backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(backup)
    });
    await expect(page.locator('#sab-backup-status')).toContainText('Backup restored successfully');
    await expect(page.locator('#s-code')).toHaveValue('260');
    await expect(page.locator('#s-list')).toContainText('Explain data communication.');
    await page.locator('#s-t2').click();
    await expect(page.locator('#s-list')).toContainText('Define a computer network.');
    const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('sab_v1')));
    expect(restored.schemaVersion).toBe(2);
  });

  test('rejects malformed and unsupported JSON backups without changing the draft', async ({ page }) => {
    await page.locator('#s-code').fill('KEEP-ME');
    const unsupported = JSON.stringify({ schemaVersion: 99, S: { cur: 1, a: { 1: { qs: [], refs: '' }, 2: { qs: [], refs: '' } } } });
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#s-backup-file').setInputFiles({
      name: 'unsupported.json',
      mimeType: 'application/json',
      buffer: Buffer.from(unsupported)
    });
    await expect(page.locator('#sab-backup-status')).toContainText('Unsupported backup version');
    await expect(page.locator('#s-code')).toHaveValue('KEEP-ME');
  });

  test('does not overwrite corrupted local storage during autosave', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('sab_v1', '{broken-json'));
    await page.reload();
    await expect(page.locator('#sab-backup-status')).toContainText('Autosave is paused');
    await page.locator('#s-code').fill('SHOULD-NOT-OVERWRITE');
    await page.waitForTimeout(350);
    const raw = await page.evaluate(() => localStorage.getItem('sab_v1'));
    expect(raw).toBe('{broken-json');
  });

});
