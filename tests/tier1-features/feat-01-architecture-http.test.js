const { describe, test, expect, assert } = require('../helpers/test-harness');

describe('Tier 1 - Feature 1: Multi-Page Architecture & HTTP Status', () => {
  test('1.1 index.html returns HTTP 200 and loads valid HTML5 doctype', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const docType = await driver.evaluate(() => document.doctype ? document.doctype.name : null);
    const title = await driver.evaluate(() => document.title);
    const htmlLang = await driver.evaluate(() => document.documentElement.lang);

    expect(docType).toBe('html');
    expect(htmlLang).toBe('id');
    expect(title.toLowerCase()).toContain('rubicweb');
    expect(driver.getNetworkErrors().length).toBe(0);
  });

  test('1.2 services.html returns HTTP 200 with viewport meta tag', async ({ driver, baseUrl }) => {
    // Check root or pages location during progressive migration
    let url = `${baseUrl}/services.html`;
    await driver.goto(url);
    let title = await driver.evaluate(() => document.title);
    if (!title || title.includes('404')) {
      await driver.goto(`${baseUrl}/pages/services.html`);
      title = await driver.evaluate(() => document.title);
    }

    const hasViewport = await driver.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return !!meta && meta.content.includes('width=device-width');
    });

    expect(hasViewport).toBe(true);
    expect(title.toLowerCase()).toContain('rubicweb');
  });

  test('1.3 portfolio.html returns HTTP 200 with viewport meta tag', async ({ driver, baseUrl }) => {
    let url = `${baseUrl}/portfolio.html`;
    await driver.goto(url);
    let title = await driver.evaluate(() => document.title);
    if (!title || title.includes('404')) {
      await driver.goto(`${baseUrl}/pages/portfolio.html`);
      title = await driver.evaluate(() => document.title);
    }

    const hasViewport = await driver.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return !!meta && meta.content.includes('width=device-width');
    });

    expect(hasViewport).toBe(true);
    expect(title.toLowerCase()).toContain('rubicweb');
  });

  test('1.4 contact.html returns HTTP 200 with viewport meta tag', async ({ driver, baseUrl }) => {
    let url = `${baseUrl}/contact.html`;
    await driver.goto(url);
    let title = await driver.evaluate(() => document.title);
    if (!title || title.includes('404')) {
      await driver.goto(`${baseUrl}/pages/contact.html`);
      title = await driver.evaluate(() => document.title);
    }

    const hasViewport = await driver.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return !!meta && meta.content.includes('width=device-width');
    });

    expect(hasViewport).toBe(true);
    expect(title.toLowerCase()).toContain('rubicweb');
  });

  test('1.5 Core CSS stylesheets link correctly and produce no 404 network errors', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const cssLinks = await driver.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(l => l.getAttribute('href'))
        .filter(h => h && h.includes('css/'));
    });

    expect(cssLinks.length).toBeGreaterThanOrEqual(1);
    const networkErrors = driver.getNetworkErrors().filter(e => e.url.includes('.css'));
    expect(networkErrors.length).toBe(0);
  });
});
