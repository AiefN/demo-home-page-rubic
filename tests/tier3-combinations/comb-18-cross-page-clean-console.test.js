const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 18: Cross-Page Sequential Navigation & Clean Console Assurance', () => {
  test('C18.1 Navigating sequentially through all 4 core pages produces zero console errors and zero asset 404s', async ({ driver, baseUrl }) => {
    const pages = ['/index.html', '/services.html', '/portfolio.html', '/contact.html'];

    for (const page of pages) {
      await driver.goto(`${baseUrl}${page}`);
      const title = await driver.evaluate(() => document.title);
      if (!title || title.includes('404')) {
        await driver.goto(`${baseUrl}/pages${page}`);
      }

      const errors = driver.getConsoleErrors();
      expect(errors.length).toBe(0);

      const netErrors = driver.getNetworkErrors();
      expect(netErrors.length).toBe(0);
    }
  });
});
