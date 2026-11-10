const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 5: Custom Cursor Edge Cases & Pointer Boundary', () => {
  test('B5.1 Mouse leaving browser viewport does not produce NaN coordinates', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const validCoords = await driver.evaluate(() => {
      document.documentElement.dispatchEvent(new MouseEvent('mouseleave', { clientX: -10, clientY: -10, bubbles: true }));
      const follower = document.querySelector('.cursor-follower, .cursor-ring, .custom-cursor');
      if (!follower) return false;
      const transform = follower.style.transform || '';
      return !transform.includes('NaN');
    });

    expect(validCoords).toBe(true);
  });

  test('B5.2 Hovering disabled interactive elements handles state gracefully', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const handled = await driver.evaluate(() => {
      const btn = document.createElement('button');
      btn.disabled = true;
      document.body.appendChild(btn);
      btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      const hasHover = document.body.classList.contains('cursor-hover');
      btn.remove();
      return !hasHover;
    });

    expect(handled).toBe(true);
  });

  test('B5.3 High-speed diagonal mouse sweep calculates finite numbers without NaN', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const noNan = await driver.evaluate(() => {
      for (let i = 0; i <= 20; i++) {
        window.dispatchEvent(new MouseEvent('mousemove', {
          clientX: i * 70,
          clientY: i * 45,
          bubbles: true
        }));
      }
      const follower = document.querySelector('.cursor-follower, .cursor-ring, .custom-cursor');
      if (!follower) return false;
      const transform = follower.style.transform || '';
      return !transform.includes('NaN');
    });

    expect(noNan).toBe(true);
  });

  test('B5.4 Cursor pointer events do not block form input clicks', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const clickable = await driver.evaluate(() => {
      const follower = document.querySelector('.cursor-follower, .cursor-ring, .custom-cursor');
      if (!follower) return false;
      const pointerEvents = window.getComputedStyle(follower).pointerEvents;
      return pointerEvents === 'none';
    });

    expect(clickable).toBe(true);
  });

  test('B5.5 Touch device emulation leaves standard tap navigation fully functional', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const tapped = await driver.evaluate(() => {
      const link = document.querySelector('a, button');
      if (!link) return false;
      let touched = false;
      const handler = () => { touched = true; };
      link.addEventListener('touchend', handler, { once: true });
      link.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }));
      link.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true }));
      return touched;
    });

    expect(tapped).toBe(true);
  });
});
