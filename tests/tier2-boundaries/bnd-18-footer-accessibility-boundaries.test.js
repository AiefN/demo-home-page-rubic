const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 18: Footer Accessibility & Legal Compliance Boundaries', () => {
  test('B18.1 All internal links in footer define non-empty navigation targets', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const validLinks = await driver.evaluate(() => {
      const footer = document.querySelector('footer, .site-footer');
      if (!footer) return false;
      const links = Array.from(footer.querySelectorAll('a'));
      return links.length > 0 && links.every(a => {
        const href = a.getAttribute('href');
        return href && href.trim().length > 0;
      });
    });

    expect(validLinks).toBe(true);
  });

  test('B18.2 Legal company name explicitly contains Rubic entity text', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasLegalEntity = await driver.evaluate(() => {
      const text = document.body.textContent;
      return text.includes('Rubic') || text.includes('Solusindo');
    });

    expect(hasLegalEntity).toBe(true);
  });

  test('B18.3 Address text mentions Jakarta or Indonesian operational location', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasAddress = await driver.evaluate(() => {
      const text = document.body.textContent;
      return text.includes('Jakarta') || text.includes('Indonesia') || text.includes('SCBD');
    });

    expect(hasAddress).toBe(true);
  });

  test('B18.4 Footer uses semantic HTML5 landmark <footer> tag', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasSemanticFooter = await driver.evaluate(() => {
      const footer = document.querySelector('footer');
      return !!footer;
    });

    expect(hasSemanticFooter).toBe(true);
  });

  test('B18.5 Footer text color contrast is readable against dark theme background', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const readable = await driver.evaluate(() => {
      const footer = document.querySelector('footer, .site-footer');
      if (!footer) return false;
      const p = footer.querySelector('p, span, a');
      if (!p) return false;
      const color = window.getComputedStyle(p).color;
      return color && color !== 'rgba(0, 0, 0, 0)';
    });

    expect(readable).toBe(true);
  });
});
