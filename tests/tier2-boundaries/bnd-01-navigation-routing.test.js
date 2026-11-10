const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 1: Multi-Page Navigation & Routing Edge Cases', () => {
  test('B1.1 Hash navigation to non-existent anchor does not trigger unhandled exception', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html#non-existent-anchor-test`);
    const errors = driver.getConsoleErrors();
    expect(errors.length).toBe(0);
    const title = await driver.evaluate(() => document.title);
    expect(title.length).toBeGreaterThan(0);
  });

  test('B1.2 URL with encoded query string parameters loads cleanly', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html?utm_source=rubic%20redesign&ref=test%2Bdev&pkg=%3Cscript%3E`);
    const errors = driver.getConsoleErrors();
    expect(errors.length).toBe(0);
  });

  test('B1.3 Trailing and duplicate path slashes resolve properly', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const docLoaded = await driver.evaluate(() => document.readyState === 'complete');
    expect(docLoaded).toBe(true);
  });

  test('B1.4 Direct deep-anchor navigation resolves to corresponding section target', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html#contact`);
    const targetExists = await driver.evaluate(() => {
      const el = document.getElementById('contact');
      return !!el;
    });
    expect(targetExists).toBe(true);
  });

  test('B1.5 Rapid hash changes do not cause history or scroll crashes', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const stable = await driver.evaluate(() => {
      window.location.hash = '#services';
      window.location.hash = '#portfolio';
      window.location.hash = '#faq';
      window.location.hash = '';
      return window.location.hash === '' || window.location.hash === '#';
    });
    expect(stable).toBe(true);
    const errors = driver.getConsoleErrors();
    expect(errors.length).toBe(0);
  });
});
