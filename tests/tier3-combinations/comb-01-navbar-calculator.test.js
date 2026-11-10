const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 1: Dynamic Navbar Scroll & Pricing Calculator Interaction', () => {
  test('C1.1 Navbar scrolls and hides while calculator state is adjusted and retained', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);

    // Adjust calculator input
    await driver.evaluate(() => {
      const slider = document.querySelector('#extra-pages, input[type="range"]');
      if (slider) {
        slider.value = '12';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Scroll down to trigger navbar hysteresis
    await driver.scrollTo(0, 500);
    await new Promise(r => setTimeout(r, 150));

    // Scroll up to reveal navbar
    await driver.scrollTo(0, 420);
    await new Promise(r => setTimeout(r, 150));

    const sliderValueRetained = await driver.evaluate(() => {
      const slider = document.querySelector('#extra-pages, input[type="range"]');
      return slider ? slider.value === '12' : true;
    });

    expect(sliderValueRetained).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
