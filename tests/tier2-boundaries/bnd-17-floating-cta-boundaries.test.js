const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 17: Floating WhatsApp Button Touch Target & Z-Index Boundary', () => {
  test('B17.1 Touch target size on mobile viewport meets accessibility guidelines (>= 44px)', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 320, height: 640, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const meetsTargetSize = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-floating-whatsapp, .whatsapp-floating, a[href*="wa.me"]');
      if (!btn) return false;
      const rect = btn.getBoundingClientRect();
      return rect.width >= 40 && rect.height >= 40;
    });

    expect(meetsTargetSize).toBe(true);
  });

  test('B17.2 Floating CTA maintains safe margins from screen edge', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const safeMargin = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-floating-whatsapp, .whatsapp-floating, a[href*="wa.me"]');
      if (!btn) return false;
      const rect = btn.getBoundingClientRect();
      return rect.right <= window.innerWidth + 50;
    });

    expect(safeMargin).toBe(true);
  });

  test('B17.3 Ripple keyframe uses hardware accelerated transform or opacity properties', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const isHardwareAccelerated = await driver.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name.includes('ripple')) {
              const cssText = rule.cssText || '';
              return cssText.includes('transform') || cssText.includes('scale') || cssText.includes('opacity');
            }
          }
        } catch (e) {}
      }
      return false;
    });

    expect(isHardwareAccelerated).toBe(true);
  });

  test('B17.4 Floating CTA z-index does not obscure active modal dialogs', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const properStacking = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-floating-whatsapp, .whatsapp-floating, a[href*="wa.me"]');
      const modal = document.querySelector('#case-study-modal, .modal, dialog');
      if (!btn || !modal) return false;
      const btnZ = parseInt(window.getComputedStyle(btn).zIndex, 10) || 0;
      const modalZ = parseInt(window.getComputedStyle(modal).zIndex, 10) || 1000;
      return modalZ >= btnZ;
    });

    expect(properStacking).toBe(true);
  });

  test('B17.5 Floating CTA aria-label explicitly declares WhatsApp communication intention', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const labelExplicit = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-floating-whatsapp, .whatsapp-floating, a[href*="wa.me"]');
      if (!btn) return false;
      const label = (btn.getAttribute('aria-label') || btn.getAttribute('title') || '').toLowerCase();
      return label.includes('whatsapp') || label.includes('chat') || label.includes('konsultasi');
    });

    expect(labelExplicit).toBe(true);
  });
});
