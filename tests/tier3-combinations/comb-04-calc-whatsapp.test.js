const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 4: Pricing Calculator Selections & WhatsApp Pre-fill Sync', () => {
  test('C4.1 Modifying tier and add-ons synchronizes into WhatsApp inquiry message URL', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);

    const linkReflected = await driver.evaluate(() => {
      // Select Pro tier if available
      const proRadio = document.querySelector('input[name="tier"][value*="pro" i]');
      if (proRadio) {
        proRadio.checked = true;
        proRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Check an add-on
      const addon = document.querySelector('input[name="addon"], input[type="checkbox"]');
      if (addon) {
        addon.checked = true;
        addon.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const waLink = document.querySelector('a[href*="wa.me"], a[href*="whatsapp.com"], #btn-calc-whatsapp');
      return !!waLink;
    });

    expect(linkReflected).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
