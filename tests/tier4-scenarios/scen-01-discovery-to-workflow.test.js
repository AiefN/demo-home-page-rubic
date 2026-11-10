const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 4 - Scenario 1: Complete Discovery Journey (Landing to Services Workflow)', () => {
  test('S1.1 End-to-end user discovery flow from homepage hero to services timeline inspection', async ({ driver, baseUrl }) => {
    // 1. Land on Homepage
    await driver.goto(`${baseUrl}/index.html`);
    const title = await driver.evaluate(() => document.title);
    expect(title.toLowerCase()).toContain('rubicweb');

    // 2. Read Hero & Trigger Secondary Portfolio CTA or Services Link
    const servicesLink = await driver.evaluate(() => {
      const link = document.querySelector('a[href*="services"], a[href="#services"], nav a:nth-child(3)');
      return link ? link.getAttribute('href') : null;
    });

    // 3. Hover 3D Service Cards
    await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .interactive-spotlight, .service-card');
      if (card) {
        card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        card.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 150, bubbles: true }));
      }
    });

    // 4. Navigate to Services Page
    let servicesUrl = `${baseUrl}/services.html`;
    await driver.goto(servicesUrl);
    let sTitle = await driver.evaluate(() => document.title);
    if (!sTitle || sTitle.includes('404')) {
      await driver.goto(`${baseUrl}/pages/services.html`);
    }

    // 5. Inspect 6-Stage Workflow Timeline
    const timelineInspected = await driver.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      return text.includes('workflow') || text.includes('tahap') || text.includes('alur') || text.includes('proses');
    });
    expect(timelineInspected).toBe(true);

    // 6. Verify zero console runtime errors across journey
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
