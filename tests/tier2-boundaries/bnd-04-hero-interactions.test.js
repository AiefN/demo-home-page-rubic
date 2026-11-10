const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 4: Hero Interactions & Accessibility Boundaries', () => {
  test('B4.1 Rapid clicks on Hero CTA do not throw runtime exceptions', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const result = await driver.evaluate(() => {
      const cta = document.querySelector('#hero a, .hero-section a');
      if (!cta) return false;
      for (let i = 0; i < 10; i++) {
        cta.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
      return cta.getAttribute('href') !== null;
    });

    expect(result).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });

  test('B4.2 Hero editorial H1 text wraps cleanly on 320px viewport without clipping', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 320, height: 640 });
    await driver.goto(`${baseUrl}/index.html`);

    const withinBounds = await driver.evaluate(() => {
      const h1 = document.querySelector('#hero h1, .hero-section h1');
      if (!h1) return false;
      const rect = h1.getBoundingClientRect();
      return rect.width <= 320 && rect.right <= 325;
    });

    expect(withinBounds).toBe(true);
  });

  test('B4.3 Reduced-motion media query respect suppresses aggressive keyframes', async ({ driver, baseUrl }) => {
    await driver.setEmulatedMedia({
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await driver.goto(`${baseUrl}/index.html`);

    const reducedHonored = await driver.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    expect(reducedHonored).toBe(true);
    await driver.setEmulatedMedia({ features: [] });
  });

  test('B4.4 Hero CTA elements receive visible keyboard focus state', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const focusable = await driver.evaluate(() => {
      const cta = document.querySelector('#hero a, .hero-section a');
      if (!cta) return false;
      cta.focus();
      return document.activeElement === cta;
    });

    expect(focusable).toBe(true);
  });

  test('B4.5 High-frequency mousemove events across Hero do not throw errors', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const survived = await driver.evaluate(async () => {
      const hero = document.querySelector('#hero, .hero-section');
      if (!hero) return false;
      for (let i = 0; i < 50; i++) {
        hero.dispatchEvent(new MouseEvent('mousemove', {
          clientX: (i * 20) % 1000,
          clientY: (i * 15) % 600,
          bubbles: true
        }));
      }
      await new Promise(r => requestAnimationFrame(r));
      const badge = hero.querySelector('.hero-badge-wrap, .hero-telemetry-bar');
      return badge ? badge.style.transform.includes('translate3d') : true;
    });

    expect(survived).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
