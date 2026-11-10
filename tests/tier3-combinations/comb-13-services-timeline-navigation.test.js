const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 13: Services Timeline & Dedicated Service Deliverables', () => {
  test('C13.1 Navigating from homepage services card to services.html timeline inspects deliverables', async ({ driver, baseUrl }) => {
    let url = `${baseUrl}/services.html`;
    await driver.goto(url);
    let title = await driver.evaluate(() => document.title);
    if (!title || title.includes('404')) {
      await driver.goto(`${baseUrl}/pages/services.html`);
    }

    const hasTimelineAndServices = await driver.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      return (text.includes('workflow') || text.includes('tahap') || text.includes('alur')) &&
             (text.includes('layanan') || text.includes('service') || text.includes('deliverable'));
    });

    expect(hasTimelineAndServices).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
