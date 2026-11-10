const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 2: Pure HTML/CSS/JS (Zero External Frameworks)', () => {
  test('2.1 No external JS framework scripts loaded', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const scriptSrcs = await driver.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(s => s.src.toLowerCase());
    });

    const bannedKeywords = ['react', 'vue', 'angular', 'jquery', 'bootstrap', 'tailwind'];
    for (const src of scriptSrcs) {
      for (const kw of bannedKeywords) {
        expect(src.includes(kw)).toBe(false);
      }
    }
  });

  test('2.2 No external CSS framework stylesheets linked', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const linkHrefs = await driver.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => (l.href || '').toLowerCase());
    });

    const bannedKeywords = ['bootstrap', 'tailwind', 'bulma', 'foundation', 'semantic-ui'];
    for (const href of linkHrefs) {
      for (const kw of bannedKeywords) {
        expect(href.includes(kw)).toBe(false);
      }
    }
  });

  test('2.3 Global window scope is pure vanilla with zero library pollution', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const globals = await driver.evaluate(() => ({
      hasJQuery: typeof window.jQuery !== 'undefined' || typeof window.$ !== 'undefined',
      hasReact: typeof window.React !== 'undefined',
      hasVue: typeof window.Vue !== 'undefined'
    }));

    expect(globals.hasJQuery).toBe(false);
    expect(globals.hasReact).toBe(false);
    expect(globals.hasVue).toBe(false);
  });

  test('2.4 Page loads cleanly with zero console runtime errors', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const errors = driver.getConsoleErrors();
    expect(errors.length).toBe(0);
  });

  test('2.5 CSS custom property design tokens are declared on document root', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const tokenCount = await driver.evaluate(() => {
      let count = 0;
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === ':root' || rule.selectorText === 'html') {
              for (const prop of rule.style) {
                if (prop.startsWith('--')) count++;
              }
            }
          }
        } catch (e) {
          // cross-origin stylesheets
        }
      }
      return count;
    });

    expect(tokenCount).toBeGreaterThanOrEqual(5);
  });
});
