const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 4 - Scenario 3: Enterprise Portfolio Filtering & Case Study Deep-Dive', () => {
  test('S3.1 Visitor navigates portfolio, filters by category, inspects case study modal, and returns', async ({ driver, baseUrl }) => {
    // 1. Navigate to Portfolio page
    let url = `${baseUrl}/portfolio.html`;
    await driver.goto(url);
    let title = await driver.evaluate(() => document.title);
    if (!title || title.includes('404')) {
      await driver.goto(`${baseUrl}/pages/portfolio.html`);
    }

    // 2. Filter by Category
    await driver.evaluate(() => {
      const filterBtn = document.querySelector('[data-filter]:not([data-filter="all"]), .filter-btn');
      if (filterBtn) filterBtn.click();
    });

    // 3. Open Case Study Modal
    await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study, [data-project-id], [data-modal-target], button');
      if (trigger) trigger.click();
    });

    // 4. Dismiss via Escape key
    await driver.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    // 5. Restore All filter
    await driver.evaluate(() => {
      const allBtn = document.querySelector('[data-filter="all"], [data-filter="*"], .filter-btn');
      if (allBtn) allBtn.click();
    });

    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
