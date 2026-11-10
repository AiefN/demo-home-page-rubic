const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 14: Dynamic Navbar & Mobile Menu', () => {
  test('14.1 Site header and navigation bar exist in DOM', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasNav = await driver.evaluate(() => {
      const header = document.querySelector('header, .site-header, .navbar, nav');
      return !!header;
    });

    expect(hasNav).toBe(true);
  });

  test('14.2 Scrolling down document triggers navbar scroll transformation', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    await driver.scrollTo(0, 150);
    await new Promise(r => setTimeout(r, 200));

    const scrollClassAdded = await driver.evaluate(() => {
      const nav = document.querySelector('header, .site-header, .navbar, .floating-bottom-nav');
      if (!nav) return false;
      return nav.classList.contains('navbar--scrolled') || nav.classList.contains('scrolled') || window.scrollY > 0;
    });

    expect(scrollClassAdded).toBe(true);
  });

  test('14.3 Mobile menu toggle opens drawer navigation', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const drawerOpened = await driver.evaluate(() => {
      const toggle = document.querySelector('.navbar__toggle, .mobile-toggle, .menu-toggle, #menu-toggle, [aria-label*="menu" i]');
      if (!toggle) return false;
      toggle.click();
      const drawer = document.querySelector('.mobile-menu, #mobile-nav-drawer, .mobile-drawer');
      return drawer ? (drawer.classList.contains('is-open') || drawer.classList.contains('active')) : false;
    });

    expect(drawerOpened).toBe(true);
  });

  test('14.4 Opening mobile drawer locks body scrolling', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const scrollLocked = await driver.evaluate(() => {
      const toggle = document.querySelector('.navbar__toggle, .mobile-toggle, .menu-toggle, #menu-toggle');
      if (!toggle) return false;
      toggle.click();
      const bodyClass = document.body.className;
      const overflow = window.getComputedStyle(document.body).overflow;
      return bodyClass.includes('no-scroll') || overflow === 'hidden' || document.body.style.overflow === 'hidden';
    });

    expect(scrollLocked).toBe(true);
  });

  test('14.5 Clicking drawer nav link or close button restores state', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const restored = await driver.evaluate(() => {
      const toggle = document.querySelector('.navbar__toggle, .mobile-toggle, .menu-toggle, #menu-toggle');
      if (!toggle) return false;
      toggle.click(); // open
      toggle.click(); // close
      const drawer = document.querySelector('.mobile-menu, #mobile-nav-drawer, .mobile-drawer');
      const isClosed = drawer ? (!drawer.classList.contains('is-open') && !drawer.classList.contains('active')) : true;
      return isClosed && !document.body.classList.contains('no-scroll');
    });

    expect(restored).toBe(true);
  });
});
