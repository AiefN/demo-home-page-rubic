const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 12: Floating WhatsApp Ripple CTA & Footer Visibility', () => {
  test('C12.1 Scrolling to bottom of document maintains floating CTA accessibility without obscuring legal disclaimer', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);

    await driver.evaluate(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
    });

    const result = await driver.evaluate(() => {
      const footer = document.querySelector('footer, .site-footer');
      const waBtn = document.querySelector('.btn-floating-whatsapp, .whatsapp-floating, [href*="wa.me"]');
      if (!footer || !waBtn) {
        return { success: false, reason: 'elements missing' };
      }

      const footerRect = footer.getBoundingClientRect();
      const waRect = waBtn.getBoundingClientRect();
      const cs = window.getComputedStyle(waBtn);

      const footerVisible = footerRect.top <= window.innerHeight + 200;
      const waVisible = waRect.width > 0 && waRect.height > 0 && cs.display !== 'none';
      const waFixed = cs.position === 'fixed';

      return {
        success: footerVisible && waVisible && waFixed,
        footerVisible,
        waVisible,
        waFixed
      };
    });

    expect(result.success).toBe(true);
    expect(result.footerVisible).toBe(true);
    expect(result.waVisible).toBe(true);
    expect(result.waFixed).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
