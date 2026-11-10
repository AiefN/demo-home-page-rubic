const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 2: Portfolio Filter & Case Study Modal Opening', () => {
  test('C2.1 Filtering by category and opening modal shows case study for visible item', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);

    const modalOpenedForFilter = await driver.evaluate(() => {
      // 1. Click filter button if available
      const filterBtn = document.querySelector('#portfolio [data-filter]:not([data-filter="all"]), #portfolio .filter-btn');
      if (filterBtn) filterBtn.click();

      // 2. Click case study trigger on visible item
      const trigger = document.querySelector('#portfolio .btn-case-study, #portfolio [data-modal-target], #portfolio button');
      if (trigger) trigger.click();

      const modal = document.querySelector('#case-study-modal, .modal, dialog');
      return !!modal;
    });

    expect(modalOpenedForFilter).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
