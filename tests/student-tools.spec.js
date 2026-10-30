const { test, expect } = require('@playwright/test');

const studentTools = [
  'Aiou-solved-assignment-builder.html',
  'academic-report-generator.html',
  'aiou-course-advisor-spring-2027.html',
  'aiou-report-engine.html',
  'assignment-cover-page.html',
  'assignment-cover-sheet.html',
  'assignment-writer.html',
  'bs-bba-guess-paper.html',
  'bulk-downloader.html',
  'diagram-generator.html',
  'front-page.html',
  'generator.html',
  'guess-paper.html',
  'humanizer.html',
  'image-tools.html',
  'matric-to-master.html',
  'pdf-tools.html',
  'quiz-generator.html',
  'report-builder.html',
  'studio.html'
];

for (const tool of studentTools) {
  test(`student tool ${tool} loads on mobile and desktop without page errors`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    for (const viewport of [{ width: 390, height: 844 }, { width: 1365, height: 900 }]) {
      await page.setViewportSize(viewport);
      const response = await page.goto(`/tools/${tool}`);
      expect(response && response.ok(), `${tool} should return a successful response`).toBeTruthy();
      await expect(page.locator('body')).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth
      }));
      expect(
        dimensions.content,
        `${tool} horizontal overflow at ${viewport.width}px: ${JSON.stringify(dimensions)}`
      ).toBeLessThanOrEqual(dimensions.viewport + 1);
    }

    expect(pageErrors, `${tool} raised browser runtime errors`).toEqual([]);
  });
}

test('student tools do not request sensitive browser permissions on page load', async ({ page }) => {
  await page.addInitScript(() => {
    window.__sensitivePermissionCalls = [];
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition() { window.__sensitivePermissionCalls.push('geolocation'); },
        watchPosition() { window.__sensitivePermissionCalls.push('geolocation'); }
      }
    });
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia() { window.__sensitivePermissionCalls.push('camera-or-microphone'); }
      }
    });
  });

  for (const tool of studentTools) {
    await page.goto(`/tools/${tool}`);
    const calls = await page.evaluate(() => window.__sensitivePermissionCalls);
    expect(calls, `${tool} requested sensitive permissions without user action`).toEqual([]);
  }
});
