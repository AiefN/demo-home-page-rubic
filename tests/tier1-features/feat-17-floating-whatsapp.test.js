const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 17: Floating WhatsApp Ripple Button', () => {
  test('17.1 Floating WhatsApp button exists in DOM', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const exists = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-floating-whatsapp, .whatsapp-floating, .floating-whatsapp, [aria-label*="whatsapp" i], a[href*="wa.me"]');
      return !!btn;
    });

    expect(exists).toBe(true);
  });

  test('17.2 Continuous ripple or pulse animation is defined for WhatsApp CTA', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasAnimation = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-floating-whatsapp, .whatsapp-floating, a[href*="wa.me"]');
      if (!btn) return false;
      const ripple = btn.classList.contains('whatsapp-ripple') ? btn : (btn.querySelector('.whatsapp-ripple, .ripple') || btn);
      const style = window.getComputedStyle(ripple);
      return style.animationName !== 'none';
    });

    expect(hasAnimation).toBe(true);
  });

  test('17.3 Floating button provides accessible aria-label or title', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasAccessibleLabel = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-floating-whatsapp, .whatsapp-floating, a[href*="wa.me"]');
      if (!btn) return false;
      return !!(btn.getAttribute('aria-label') || btn.getAttribute('title') || btn.textContent.trim());
    });

    expect(hasAccessibleLabel).toBe(true);
  });

  test('17.4 Button contains valid WhatsApp API or wa.me URL', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const validUrl = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-floating-whatsapp, .whatsapp-floating, a[href*="wa.me"]');
      if (!btn) return false;
      const href = btn.getAttribute('href') || '';
      return href.includes('wa.me') || href.includes('whatsapp.com');
    });

    expect(validUrl).toBe(true);
  });

  test('17.5 Button maintains fixed or sticky positioning in bottom corner', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const isFixed = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-floating-whatsapp, .whatsapp-floating, a[href*="wa.me"]');
      if (!btn) return false;
      const pos = window.getComputedStyle(btn).position;
      return pos === 'fixed' || pos === 'sticky';
    });

    expect(isFixed).toBe(true);
  });
});
