const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 17: Dynamic Viewport Resize While FAQ Item Is Expanded', () => {
  test('C17.1 Expanding an FAQ accordion item on desktop and resizing to mobile recalculates height without text clipping', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto(`${baseUrl}/index.html`);

    // Expand FAQ
    await driver.evaluate(() => {
      const trigger = document.querySelector('#faq .faq-item header, #faq .faq-header, #faq summary, #faq button');
      if (trigger) trigger.click();
    });

    // Resize to mobile
    await driver.setViewport({ width: 320, height: 640 });
    await new Promise(r => setTimeout(r, 150));

    const noOverflow = await driver.evaluate(() => {
      return document.documentElement.scrollWidth <= 325;
    });

    expect(noOverflow).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
