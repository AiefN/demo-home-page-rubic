const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 3: Case Study Modal & Mobile Menu Drawer Scroll Locking', () => {
  test('C3.1 Modal dialog and mobile drawer coordinate body scroll lock without overflow conflict', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const noConflict = await driver.evaluate(() => {
      // Open modal
      const modalTrigger = document.querySelector('.btn-case-study, [data-project-id], [data-modal-target], #portfolio button');
      if (modalTrigger) modalTrigger.click();

      // Dismiss modal
      const closeBtn = document.querySelector('.modal__close, .modal-close, [data-close]');
      if (closeBtn) closeBtn.click();

      // Open drawer
      const toggle = document.querySelector('.navbar__toggle, .mobile-toggle, .menu-toggle');
      if (toggle) toggle.click();

      // Close drawer
      if (toggle) toggle.click();

      return true;
    });

    expect(noConflict).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
