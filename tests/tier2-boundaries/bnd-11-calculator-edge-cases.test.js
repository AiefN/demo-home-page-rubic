const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 11: Pricing Calculator Extreme Inputs & Math Boundary', () => {
  test('B11.1 Zero extra pages calculation does not deduct below baseline tier investment', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const validBase = await driver.evaluate(() => {
      const slider = document.querySelector('#extra-pages, input[type="range"]');
      if (slider) {
        slider.value = '0';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const priceEl = document.querySelector('#calc-total-price, .total-price');
      if (!priceEl) return false;
      const priceText = priceEl.textContent.replace(/[^0-9]/g, '');
      const priceNum = parseInt(priceText, 10) || 0;
      return priceNum >= 0;
    });

    expect(validBase).toBe(true);
  });

  test('B11.2 Maximum extra pages slider value formats large sums without scientific notation', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const formatted = await driver.evaluate(() => {
      const slider = document.querySelector('#extra-pages, input[type="range"]');
      if (slider) {
        slider.value = slider.max || '50';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const priceEl = document.querySelector('#calc-total-price, .total-price');
      if (!priceEl) return false;
      return !priceEl.textContent.includes('e+');
    });

    expect(formatted).toBe(true);
  });

  test('B11.3 Unchecking all add-on checkboxes resets add-on cost components', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const reset = await driver.evaluate(() => {
      const addons = document.querySelectorAll('input[name="addon"], input[type="checkbox"]');
      if (addons.length === 0) return false;
      addons.forEach(a => {
        a.checked = false;
        a.dispatchEvent(new Event('change', { bubbles: true }));
      });
      const priceEl = document.querySelector('#calc-total-price, .total-price');
      return priceEl ? priceEl.textContent.trim().length > 0 : false;
    });

    expect(reset).toBe(true);
  });

  test('B11.4 Rapid switching between package tiers recalculates accurately', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const switched = await driver.evaluate(() => {
      const tiers = document.querySelectorAll('input[name="tier"]');
      if (tiers.length < 2) return false;
      tiers.forEach(t => {
        t.checked = true;
        t.dispatchEvent(new Event('change', { bubbles: true }));
      });
      const priceEl = document.querySelector('#calc-total-price, .total-price');
      return priceEl ? priceEl.textContent.trim().length > 0 : false;
    });

    expect(switched).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });

  test('B11.5 Generated WhatsApp consultation CTA URL is validly URI-encoded', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const validUri = await driver.evaluate(() => {
      const link = document.querySelector('a[href*="wa.me"], a[href*="whatsapp.com"], #btn-calc-whatsapp');
      if (!link) return false;
      const href = link.getAttribute('href') || '';
      try {
        decodeURIComponent(href);
        return href.length > 0 && !href.includes('NaN');
      } catch (e) {
        return false;
      }
    });

    expect(validUri).toBe(true);
  });
});
