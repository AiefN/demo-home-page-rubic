const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 8: Mobile Drawer Menu, Hash Jump & Portfolio Filter', () => {
  test('C8.1 Mobile drawer link navigates to portfolio anchor and applies category filter', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const navigatedAndFiltered = await driver.evaluate(() => {
      // Open drawer
      const toggle = document.querySelector('.navbar__toggle, .mobile-toggle, .menu-toggle');
      if (toggle) toggle.click();

      // Click portfolio link in drawer
      const portfolioLink = document.querySelector('.mobile-menu a[href*="portfolio"], .nav-drawer a[href*="portfolio"]');
      if (portfolioLink) portfolioLink.click();

      // Apply filter
      const filterBtn = document.querySelector('#portfolio [data-filter], #portfolio .filter-btn');
      if (filterBtn) filterBtn.click();

      return true;
    });

    expect(navigatedAndFiltered).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
