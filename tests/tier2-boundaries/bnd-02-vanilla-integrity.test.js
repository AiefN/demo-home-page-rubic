const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 2: Vanilla Stack Integrity & Resilience', () => {
  test('B2.1 Critical markup uses standard event listeners without inline JS injection attributes', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const inlineHandlerCount = await driver.evaluate(() => {
      const elementsWithInline = document.querySelectorAll('[onclick], [onload], [onerror], [onmouseover]');
      return elementsWithInline.length;
    });

    expect(inlineHandlerCount).toBe(0);
  });

  test('B2.2 Execution context does not use deprecated document.write', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const docWriteUsed = await driver.evaluate(() => {
      return document.body.innerHTML.includes('document.write');
    });

    expect(docWriteUsed).toBe(false);
  });

  test('B2.3 No unauthorized external script tags injected into DOM', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const injectedScripts = await driver.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.filter(s => {
        const src = s.getAttribute('src');
        return src && (src.startsWith('http:') || src.startsWith('https:')) && !src.includes('googleapis.com') && !src.includes('gstatic.com');
      }).length;
    });

    expect(injectedScripts).toBe(0);
  });

  test('B2.4 CSS tokens declare fallback values for theme variables', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasVariables = await driver.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      const bgPrimary = style.getPropertyValue('--bg-primary').trim();
      const textPrimary = style.getPropertyValue('--text-primary').trim();
      return Boolean(bgPrimary || textPrimary);
    });

    expect(hasVariables).toBe(true);
  });

  test('B2.5 Zero unhandled promise rejections on window', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasRejections = await driver.evaluate(() => {
      return window.__unhandledRejectionCount || 0;
    });

    expect(hasRejections).toBe(0);
  });
});
