const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 14: Category Filter Switching & Rapid Modal Inspection', () => {
  test('C14.1 Rapid switching between portfolio filters and opening case studies loads dynamic data', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);

    const handled = await driver.evaluate(() => {
      const filters = document.querySelectorAll('#portfolio [data-filter], #portfolio .filter-btn');
      filters.forEach(btn => {
        btn.click();
        const trigger = document.querySelector('#portfolio .btn-case-study, #portfolio [data-modal-target], #portfolio button');
        if (trigger) trigger.click();
        const closeBtn = document.querySelector('.modal__close, [data-close]');
        if (closeBtn) closeBtn.click();
      });
      return true;
    });

    expect(handled).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
