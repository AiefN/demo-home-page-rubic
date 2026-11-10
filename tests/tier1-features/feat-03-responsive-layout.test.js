const { describe, test, expect } = require('../helpers/test-harness');

const PAGES = ['index.html', 'services.html', 'portfolio.html', 'contact.html'];

describe('Tier 1 - Feature 3: Responsive Layouts (320px, 768px, 1440px)', () => {
  test('3.1 Mobile Viewport (320px): Zero horizontal scroll overflow across all 4 pages', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 320, height: 640, mobile: true });

    for (const page of PAGES) {
      await driver.goto(`${baseUrl}/${page}`);

      const overflowData = await driver.evaluate(() => {
        const doc = document.documentElement;
        const calc = document.querySelector('.consultation-calculator-wrapper');
        const calcClipped = calc ? calc.getBoundingClientRect().right > window.innerWidth : false;
        return {
          scrollOverflow: doc.scrollWidth > window.innerWidth,
          calcClipped
        };
      });

      expect(overflowData.scrollOverflow).toBe(false);
      expect(overflowData.calcClipped).toBe(false);
    }
  });

  test('3.2 Tablet Viewport (768px): Zero horizontal scroll overflow across all 4 pages', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 768, height: 1024, mobile: false });

    for (const page of PAGES) {
      await driver.goto(`${baseUrl}/${page}`);

      const overflowData = await driver.evaluate(() => {
        const doc = document.documentElement;
        const calc = document.querySelector('.consultation-calculator-wrapper');
        const calcClipped = calc ? calc.getBoundingClientRect().right > window.innerWidth : false;
        return {
          scrollOverflow: doc.scrollWidth > window.innerWidth,
          calcClipped
        };
      });

      expect(overflowData.scrollOverflow).toBe(false);
      expect(overflowData.calcClipped).toBe(false);
    }
  });

  test('3.3 Desktop Viewport (1440px): Zero horizontal scroll overflow across all 4 pages', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 1440, height: 900, mobile: false });

    for (const page of PAGES) {
      await driver.goto(`${baseUrl}/${page}`);

      const overflowData = await driver.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollOverflow: doc.scrollWidth > window.innerWidth
        };
      });

      expect(overflowData.scrollOverflow).toBe(false);
    }
  });

  test('3.4 Mobile Viewport (320px): Mobile menu toggle button is present in DOM', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 320, height: 640, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const hasMobileToggle = await driver.evaluate(() => {
      const btn = document.querySelector('.navbar__toggle, .menu-toggle, .mobile-toggle, [aria-label*="menu" i], [aria-label*="navigasi" i]');
      return !!btn;
    });

    expect(hasMobileToggle).toBe(true);
  });

  test('3.5 Desktop Viewport (1440px): Desktop navigation is available and rendered', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 1440, height: 900, mobile: false });
    await driver.goto(`${baseUrl}/index.html`);

    const hasDesktopNav = await driver.evaluate(() => {
      const navLinks = document.querySelectorAll('header nav a, .floating-bottom-nav a, .navbar a');
      return navLinks.length >= 3;
    });

    expect(hasDesktopNav).toBe(true);
  });
});
