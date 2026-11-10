const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 6: 4 Core Services & Tech Badges', () => {
  test('6.1 Services section renders at least 4 core agency service cards', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const serviceCardsCount = await driver.evaluate(() => {
      const cards = document.querySelectorAll('#services .service-card, #services .interactive-spotlight, #services .card-tilt, #services article, #services .grid-col');
      return cards.length;
    });

    expect(serviceCardsCount).toBeGreaterThanOrEqual(4);
  });

  test('6.2 Technology badges or stack pills are present on services', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const techBadges = await driver.evaluate(() => {
      const badges = document.querySelectorAll('#services .tech-badge, #services .badge, #services .tag, #services [data-tech], #services span');
      const texts = Array.from(badges).map(b => b.textContent.toLowerCase());
      return texts.some(t => t.includes('html') || t.includes('laravel') || t.includes('php') || t.includes('api') || t.includes('css') || t.includes('js') || t.includes('react'));
    });

    expect(techBadges).toBe(true);
  });

  test('6.3 Service cards contain descriptive deliverables or scope', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasDescriptions = await driver.evaluate(() => {
      const cards = document.querySelectorAll('#services .service-card, #services .interactive-spotlight, #services article');
      return Array.from(cards).every(c => c.textContent.trim().length > 30);
    });

    expect(hasDescriptions).toBe(true);
  });

  test('6.4 Service cards include interactive triggers or action links', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasTriggers = await driver.evaluate(() => {
      const triggers = document.querySelectorAll('#services a, #services button');
      return triggers.length >= 2;
    });

    expect(hasTriggers).toBe(true);
  });

  test('6.5 Service cards use semantic headings (h3 or h4)', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasHeadings = await driver.evaluate(() => {
      const headings = document.querySelectorAll('#services h3, #services h4');
      return headings.length >= 3;
    });

    expect(hasHeadings).toBe(true);
  });
});
