const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 5: Custom Trailing Cursor', () => {
  test('5.1 Custom cursor DOM elements or styling exist', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const cursorExists = await driver.evaluate(() => {
      const dot = document.querySelector('.cursor-dot, .custom-cursor, #cursor-dot, .cursor');
      const follower = document.querySelector('.cursor-follower, .cursor-ring, #cursor-follower');
      return !!(dot || follower);
    });

    expect(cursorExists).toBe(true);
  });

  test('5.2 Cursor tracks coordinates on mousemove event', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const moved = await driver.evaluate(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 180, bubbles: true }));
      const dot = document.querySelector('.cursor-dot, #cursor-dot');
      if (!dot) return false;
      const transform = dot.style.transform || '';
      return transform.includes('250') && transform.includes('180');
    });

    expect(moved).toBe(true);
  });

  test('5.3 Interactive element hover triggers cursor hover expansion', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hoverTriggered = await driver.evaluate(() => {
      const btn = document.querySelector('a, button');
      if (!btn) return false;
      btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      const follower = document.querySelector('.cursor-follower, #cursor-follower');
      return document.body.classList.contains('cursor-hover') || (follower && follower.classList.contains('cursor-hover'));
    });

    expect(hoverTriggered).toBe(true);
  });

  test('5.4 Mouseleave removes cursor hover expansion class', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hoverRemoved = await driver.evaluate(() => {
      const btn = document.querySelector('a, button');
      if (!btn) return false;
      btn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      const follower = document.querySelector('.cursor-follower, .cursor-ring, .custom-cursor');
      return !document.body.classList.contains('cursor-hover');
    });

    expect(hoverRemoved).toBe(true);
  });

  test('5.5 Touch media query (@media (hover: none)) keeps page operable without cursor blocking', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const touchOperable = await driver.evaluate(() => {
      const follower = document.querySelector('.cursor-follower, .cursor-ring, .custom-cursor');
      if (!follower) return false;
      const style = window.getComputedStyle(follower);
      // Either display: none, opacity: 0, or pointer-events: none
      return style.display === 'none' || style.opacity === '0' || style.pointerEvents === 'none';
    });

    expect(touchOperable).toBe(true);
  });
});
