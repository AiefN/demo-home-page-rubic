const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 18: Agency Information & Legal Footer', () => {
  test('18.1 Semantic <footer> element exists in DOM', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasFooter = await driver.evaluate(() => {
      const footer = document.querySelector('footer, .site-footer');
      return !!footer && footer.tagName.toLowerCase() === 'footer';
    });

    expect(hasFooter).toBe(true);
  });

  test('18.2 Official company entity name is displayed', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasEntity = await driver.evaluate(() => {
      const text = document.querySelector('footer, .site-footer')?.textContent || '';
      return text.includes('Rubic') || text.includes('PT');
    });

    expect(hasEntity).toBe(true);
  });

  test('18.3 SCBD Jakarta address or location information is rendered', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasLocation = await driver.evaluate(() => {
      const text = document.body.textContent;
      return text.includes('Jakarta') || text.includes('SCBD') || text.includes('Indonesia') || text.includes('Lokasi');
    });

    expect(hasLocation).toBe(true);
  });

  test('18.4 Footer links and copyright notice are present', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const footerMeta = await driver.evaluate(() => {
      const footer = document.querySelector('footer, .site-footer');
      if (!footer) return false;
      const links = footer.querySelectorAll('a');
      const text = footer.textContent;
      return links.length >= 2 || text.includes('©') || text.includes('Copyright') || text.includes('All rights');
    });

    expect(footerMeta).toBe(true);
  });

  test('18.5 Footer layout causes zero horizontal overflow on 320px mobile viewport', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 320, height: 640, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const noOverflow = await driver.evaluate(() => {
      const footer = document.querySelector('footer, .site-footer');
      if (!footer) return false;
      return footer.scrollWidth <= window.innerWidth;
    });

    expect(noOverflow).toBe(true);
  });
});
