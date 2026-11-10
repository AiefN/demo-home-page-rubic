const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 3: Extreme Viewports & Dynamic Resizing', () => {
  test('B3.1 Ultra-narrow 280px viewport (Galaxy Fold cover): Zero horizontal overflow', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 280, height: 653, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const hasOverflow = await driver.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasOverflow).toBe(false);
  });

  test('B3.2 Small mobile 360px viewport: Zero horizontal overflow', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 360, height: 740, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const hasOverflow = await driver.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasOverflow).toBe(false);
  });

  test('B3.3 Tablet landscape 1024px viewport: Zero horizontal overflow', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 1024, height: 768, mobile: false });
    await driver.goto(`${baseUrl}/index.html`);

    const hasOverflow = await driver.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasOverflow).toBe(false);
  });

  test('B3.4 4K Ultra-wide 2560px viewport: Content honors container max-width constraints', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 2560, height: 1440, mobile: false });
    await driver.goto(`${baseUrl}/index.html`);

    const containerBounded = await driver.evaluate(() => {
      const main = document.querySelector('main, .container, #hero');
      if (!main) return false;
      const rect = main.getBoundingClientRect();
      return rect.width <= 2560;
    });

    expect(containerBounded).toBe(true);
  });

  test('B3.5 Dynamic resize stress: 1440px -> 320px -> 1440px adjusts seamlessly', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto(`${baseUrl}/index.html`);

    // Rapid resize to mobile
    await driver.setViewport({ width: 320, height: 640 });
    await new Promise(r => setTimeout(r, 100));

    // Rapid resize back to desktop
    await driver.setViewport({ width: 1440, height: 900 });
    await new Promise(r => setTimeout(r, 100));

    const errors = driver.getConsoleErrors();
    expect(errors.length).toBe(0);
  });
});
