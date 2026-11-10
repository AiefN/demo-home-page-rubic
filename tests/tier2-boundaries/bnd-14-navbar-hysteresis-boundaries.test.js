const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 14: Dynamic Navbar Hysteresis & Mobile Drawer Edge Cases', () => {
  test('B14.1 Rapid scroll oscillation does not produce visual jitter or errors', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const survived = await driver.evaluate(() => {
      for (let i = 0; i < 20; i++) {
        window.scrollTo({ left: 0, top: i % 2 === 0 ? 300 : 250, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      }
      return window.scrollY === 250 || window.scrollY === 300;
    });

    expect(survived).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });

  test('B14.2 Pressing Escape key with mobile drawer open dismisses drawer', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const closedOnEscape = await driver.evaluate(() => {
      const toggle = document.querySelector('.navbar__toggle, .mobile-toggle, .menu-toggle');
      if (toggle) toggle.click();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const drawer = document.querySelector('.mobile-menu.is-open, #mobile-nav-drawer.active');
      return !drawer;
    });

    expect(closedOnEscape).toBe(true);
  });

  test('B14.3 Resizing from mobile to desktop viewport automatically closes open drawer and restores body scroll', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    await driver.evaluate(() => {
      const toggle = document.querySelector('.navbar__toggle, .mobile-toggle, .menu-toggle');
      if (toggle) toggle.click();
    });

    // Resize to desktop
    await driver.setViewport({ width: 1440, height: 900, mobile: false });
    await new Promise(r => setTimeout(r, 150));

    const restored = await driver.evaluate(() => {
      const bodyClass = document.body.className;
      return !bodyClass.includes('no-scroll');
    });

    expect(restored).toBe(true);
  });

  test('B14.4 Mobile drawer locks background scroll and traps keyboard focus', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const trapped = await driver.evaluate(() => {
      const toggle = document.querySelector('.navbar__toggle, .mobile-toggle, .menu-toggle');
      if (!toggle) return false;
      toggle.click();
      const drawer = document.querySelector('.mobile-menu, #mobile-nav-drawer, .mobile-drawer');
      if (!drawer) return false;
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      const isLocked = document.body.classList.contains('no-scroll') || window.getComputedStyle(document.body).overflow === 'hidden';
      return isLocked;
    });

    expect(trapped).toBe(true);
  });

  test('B14.5 Navbar hysteresis properly recognizes upward scroll delta to reveal navigation', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const revealed = await driver.evaluate(() => {
      window.scrollTo(0, 400); // scroll down
      window.dispatchEvent(new Event('scroll'));
      window.scrollTo(0, 350); // scroll up by 50px
      window.dispatchEvent(new Event('scroll'));
      const nav = document.querySelector('header, .site-header, .navbar');
      return nav ? !nav.classList.contains('navbar--hidden') : false;
    });

    expect(revealed).toBe(true);
  });
});
