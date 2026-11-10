const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 7: 3D Tilt Physics & Angle Clamping', () => {
  test('B7.1 Tilt calculation at extreme card corners clamps to safe maximum angle', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const clamped = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .interactive-spotlight, .service-card');
      if (!card) return false;
      const rect = card.getBoundingClientRect();
      const corners = [
        { x: rect.left, y: rect.top },
        { x: rect.right, y: rect.top },
        { x: rect.left, y: rect.bottom },
        { x: rect.right, y: rect.bottom }
      ];

      let calculatedCount = 0;
      for (const pt of corners) {
        card.dispatchEvent(new MouseEvent('mousemove', { clientX: pt.x, clientY: pt.y, bubbles: true }));
        const transform = card.style.transform || '';
        const match = transform.match(/rotate[XY]\(([-0-9.]+)deg\)/);
        if (match) {
          calculatedCount++;
          const angle = Math.abs(parseFloat(match[1]));
          if (angle > 45) return false; // Exceeds safe 3D angle
        }
      }
      return calculatedCount > 0;
    });

    expect(clamped).toBe(true);
  });

  test('B7.2 Rapid enter/exit cycles do not leave stuck rotation transform', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const resetClean = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .interactive-spotlight, .service-card');
      if (!card) return false;
      for (let i = 0; i < 5; i++) {
        card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        card.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }));
        card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      }
      const transform = card.style.transform || '';
      return transform.includes('rotateX(0deg)') || transform.includes('scale3d(1, 1, 1)');
    });

    expect(resetClean).toBe(true);
  });

  test('B7.3 Touch scroll over tilt cards does not hijack native scroll motion', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const touchSafe = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .interactive-spotlight, .service-card');
      if (!card) return false;
      const touch = new TouchEvent('touchstart', { bubbles: true, cancelable: true });
      card.dispatchEvent(touch);
      return !touch.defaultPrevented;
    });

    expect(touchSafe).toBe(true);
  });

  test('B7.4 Dynamic card resize updates tilt bounding rectangle without NaN', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const noNan = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .interactive-spotlight, .service-card');
      if (!card) return false;
      window.dispatchEvent(new Event('resize'));
      card.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 150, bubbles: true }));
      return !card.style.transform.includes('NaN');
    });

    expect(noNan).toBe(true);
  });

  test('B7.5 Specular glare CSS position variables remain within finite bounds', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const validVars = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .interactive-spotlight, .service-card');
      if (!card) return false;
      const rect = card.getBoundingClientRect();
      card.dispatchEvent(new MouseEvent('mousemove', { clientX: rect.left + 50, clientY: rect.top + 50, bubbles: true }));
      const valX = card.style.getPropertyValue('--spotlight-x') || card.style.getPropertyValue('--mouse-x') || '';
      return !valX.includes('NaN');
    });

    expect(validVars).toBe(true);
  });
});
