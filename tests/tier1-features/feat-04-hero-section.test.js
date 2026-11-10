const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 4: Hero Section, Badge & CTAs', () => {
  test('4.1 Hero section element is rendered with proper semantics', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const heroInfo = await driver.evaluate(() => {
      const hero = document.querySelector('#hero, .hero-section');
      return {
        exists: !!hero,
        tagName: hero ? hero.tagName.toLowerCase() : null
      };
    });

    expect(heroInfo.exists).toBe(true);
    expect(heroInfo.tagName).toBe('section');
  });

  test('4.2 Hero editorial H1 heading is visible and contains engineering copy', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const headingText = await driver.evaluate(() => {
      const h1 = document.querySelector('#hero h1, .hero-section h1');
      return h1 ? h1.textContent.trim().toLowerCase() : '';
    });

    expect(headingText.length).toBeGreaterThan(10);
  });

  test('4.3 Guarantee pill badge is present with satisfaction / money-back copy', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasGuarantee = await driver.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      return text.includes('garansi') || text.includes('kepuasan') || text.includes('100%');
    });

    expect(hasGuarantee).toBe(true);
  });

  test('4.4 Primary WhatsApp consultation CTA is present with contact link', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasWaCta = await driver.evaluate(() => {
      const ctas = Array.from(document.querySelectorAll('#hero a, .hero-section a'));
      return ctas.some(a => {
        const href = (a.getAttribute('href') || '').toLowerCase();
        const text = a.textContent.toLowerCase();
        return href.includes('wa.me') || href.includes('whatsapp') || href.includes('#contact') || text.includes('konsultasi') || text.includes('whatsapp');
      });
    });

    expect(hasWaCta).toBe(true);
  });

  test('4.5 Secondary Portfolio exploration CTA is present', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasPortfolioCta = await driver.evaluate(() => {
      const ctas = Array.from(document.querySelectorAll('#hero a, .hero-section a'));
      return ctas.some(a => {
        const href = (a.getAttribute('href') || '').toLowerCase();
        const text = a.textContent.toLowerCase();
        return href.includes('portfolio') || href.includes('#portfolio') || text.includes('portofolio') || text.includes('portfolio');
      });
    });

    expect(hasPortfolioCta).toBe(true);
  });
});
