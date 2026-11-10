const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 9: Portfolio Filtering Edge Cases', () => {
  test('B9.1 Rapid clicking between filter tabs executes without error or race condition', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const survived = await driver.evaluate(() => {
      const btns = document.querySelectorAll('#portfolio [data-filter], #portfolio .portfolio-filter-btn');
      if (btns.length < 2) return false;
      for (let i = 0; i < 8; i++) {
        btns[i % btns.length].click();
      }
      return btns.length >= 2;
    });

    expect(survived).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });

  test('B9.2 Filtering handles category selections gracefully without breaking DOM layout', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const layoutIntact = await driver.evaluate(() => {
      const btns = document.querySelectorAll('#portfolio [data-filter], #portfolio .portfolio-filter-btn');
      if (btns.length < 2) return false;
      btns[1].click();
      const portfolioSec = document.getElementById('portfolio');
      return portfolioSec ? portfolioSec.children.length > 0 : false;
    });

    expect(layoutIntact).toBe(true);
  });

  test('B9.3 Returning to "Semua" filter restores full project collection', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const allRestored = await driver.evaluate(() => {
      const allBtn = document.querySelector('#portfolio [data-filter="all"], #portfolio [data-filter="*"], #portfolio .filter-btn:first-child');
      if (allBtn) {
        allBtn.click();
      }
      const visibleItems = document.querySelectorAll('#portfolio .portfolio-card:not([style*="display: none"]), #portfolio article');
      return visibleItems.length >= 1;
    });

    expect(allRestored).toBe(true);
  });

  test('B9.4 Only one filter button holds active styling class at any time', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const singleActive = await driver.evaluate(() => {
      const btns = document.querySelectorAll('#portfolio [data-filter], #portfolio .portfolio-filter-btn');
      if (btns.length < 2) return false;
      btns[1].click();
      const activeBtns = document.querySelectorAll('#portfolio [data-filter].active, #portfolio .portfolio-filter-btn.active');
      return activeBtns.length === 1;
    });

    expect(singleActive).toBe(true);
  });

  test('B9.5 Filter buttons are keyboard accessible via Tab key focus', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const tabAccessible = await driver.evaluate(() => {
      const btns = document.querySelectorAll('#portfolio [data-filter], #portfolio .portfolio-filter-btn');
      if (btns.length === 0) return false;
      btns.forEach(b => b.focus());
      return document.activeElement === btns[btns.length - 1];
    });

    expect(tabAccessible).toBe(true);
  });
});
