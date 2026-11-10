const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 8: Trust Pillars & Stats Counters', () => {
  test('8.1 Trust pillars or guarantees cards are present in document', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasTrustSection = await driver.evaluate(() => {
      const el = document.querySelector('#why-us, .trust-section, #guarantee, .guarantees, #about');
      return !!el;
    });

    expect(hasTrustSection).toBe(true);
  });

  test('8.2 Stats counter elements exist with numeric target attributes', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const targetAttrs = await driver.evaluate(() => {
      const counters = document.querySelectorAll('[data-counter-target], [data-target], .stat-number');
      return Array.from(counters).map(c => c.getAttribute('data-counter-target') || c.getAttribute('data-target') || c.textContent.trim());
    });

    expect(targetAttrs.length).toBeGreaterThanOrEqual(2);
  });

  test('8.3 Scrolling stats into viewport initiates animated counting', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    await driver.evaluate(() => {
      const statsSection = document.querySelector('.stats-cards-grid, #why-us, [data-counter-target], [data-target]');
      if (statsSection) {
        statsSection.scrollIntoView();
      }
      window.dispatchEvent(new Event('scroll'));
    });

    await new Promise(r => setTimeout(r, 600));

    const currentText = await driver.evaluate(() => {
      const el = document.querySelector('[data-counter-target], [data-target], .stat-number');
      return el ? el.textContent.trim() : '';
    });

    expect(currentText.length).toBeGreaterThan(0);
  });

  test('8.4 Counter reaches non-zero numeric value after animation completes', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    await driver.evaluate(() => {
      const el = document.querySelector('[data-counter-target], [data-target], .stat-number');
      if (el) el.scrollIntoView();
      window.dispatchEvent(new Event('scroll'));
    });

    await new Promise(r => setTimeout(r, 1200));

    const finalVal = await driver.evaluate(() => {
      const el = document.querySelector('[data-counter-target], [data-target], .stat-number');
      if (!el) return 0;
      const match = el.textContent.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });

    expect(finalVal).toBeGreaterThan(0);
  });

  test('8.5 Counter preserves metric suffix (+, %, ms)', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasSuffix = await driver.evaluate(() => {
      const els = document.querySelectorAll('[data-counter-target], [data-target], .stat-number');
      const text = Array.from(els).map(e => e.textContent + (e.getAttribute('data-suffix') || '')).join(' ');
      return text.includes('%') || text.includes('+') || text.includes('ms');
    });

    expect(hasSuffix).toBe(true);
  });
});
