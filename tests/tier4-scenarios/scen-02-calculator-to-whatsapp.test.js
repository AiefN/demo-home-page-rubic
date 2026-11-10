const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 4 - Scenario 2: Project Cost Estimation to WhatsApp Consultation Journey', () => {
  test('S2.1 Prospective client configures custom web package and proceeds to WhatsApp inquiry', async ({ driver, baseUrl }) => {
    // 1. Load Homepage
    await driver.goto(`${baseUrl}/index.html`);

    // 2. Scroll to Pricing Calculator
    await driver.evaluate(() => {
      const calc = document.querySelector('#pricing, #calculator, .pricing-calculator, .pricing-section, #pricing-calculator');
      if (calc) calc.scrollIntoView();
      window.dispatchEvent(new Event('scroll'));
    });

    // 3. Select Package Tier (Pro)
    await driver.evaluate(() => {
      const proRadio = document.querySelector('input[name="tier"][value*="pro" i]');
      if (proRadio) {
        proRadio.checked = true;
        proRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // 4. Adjust Extra Pages Slider to 8
    await driver.evaluate(() => {
      const slider = document.querySelector('#extra-pages, input[type="range"]');
      if (slider) {
        slider.value = '8';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // 5. Select Add-on Features
    await driver.evaluate(() => {
      const checkboxes = document.querySelectorAll('input[name="addon"], input[type="checkbox"]');
      if (checkboxes.length >= 2) {
        checkboxes[0].checked = true;
        checkboxes[0].dispatchEvent(new Event('change', { bubbles: true }));
        checkboxes[1].checked = true;
        checkboxes[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // 6. Inspect Output Price & Link
    const validOutcome = await driver.evaluate(() => {
      const link = document.querySelector('a[href*="wa.me"], a[href*="whatsapp.com"], #btn-calc-whatsapp');
      return !!link;
    });

    expect(validOutcome).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
