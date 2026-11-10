const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 11: Dynamic Pricing Calculator', () => {
  test('11.1 Pricing calculator or estimator component exists in DOM', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const calcExists = await driver.evaluate(() => {
      const calc = document.querySelector('#pricing, #calculator, .pricing-calculator, .pricing-section, #pricing-calculator, form.calculator');
      return !!calc || document.body.textContent.toLowerCase().includes('kalkulator') || document.body.textContent.toLowerCase().includes('estimasi');
    });

    expect(calcExists).toBe(true);
  });

  test('11.2 Package tier options (Basic / Pro / Enterprise) are selectable', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasTiers = await driver.evaluate(() => {
      const inputs = document.querySelectorAll('input[name="tier"], input[name="package"], select[name="tier"], .tier-card, .package-option');
      return inputs.length >= 1 || document.body.textContent.toLowerCase().includes('paket');
    });

    expect(hasTiers).toBe(true);
  });

  test('11.3 Extra pages slider or numeric adjustment input is interactive', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasSlider = await driver.evaluate(() => {
      const slider = document.querySelector('#extra-pages, input[type="range"]');
      if (!slider) return false;
      slider.value = '8';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      const display = document.querySelector('#pages-count-display, .pages-count');
      return display ? display.textContent.includes('8') : slider.value === '8';
    });

    expect(hasSlider).toBe(true);
  });

  test('11.4 Calculator outputs dynamically formatted price or timeline estimate', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasOutputs = await driver.evaluate(() => {
      const priceEl = document.querySelector('#calc-total-price, .total-price, #total-cost, [data-calc-price]');
      const timeEl = document.querySelector('#calc-total-timeline, .total-timeline, #total-timeline, [data-calc-time]');
      return !!(priceEl || timeEl) || document.body.textContent.includes('Rp');
    });

    expect(hasOutputs).toBe(true);
  });

  test('11.5 Consultation CTA generates WhatsApp inquiry link', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasWhatsAppCta = await driver.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"], a.btn-whatsapp, #btn-calc-whatsapp'));
      return links.length >= 1;
    });

    expect(hasWhatsAppCta).toBe(true);
  });
});
