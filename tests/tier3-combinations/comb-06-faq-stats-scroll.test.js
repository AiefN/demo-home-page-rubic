const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 6: FAQ Accordion Expansion & Stats Counter Viewport Trigger', () => {
  test('C6.1 Expanding FAQ items changes layout flow without crashing IntersectionObserver counters', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);

    const handled = await driver.evaluate(() => {
      const faqTrigger = document.querySelector('#faq .faq-item header, #faq .faq-header, #faq summary, #faq button');
      if (faqTrigger) faqTrigger.click();

      // Scroll to stats
      const stats = document.querySelector('#why-us, .stats-cards-grid, [data-counter-target], [data-target]');
      if (stats) stats.scrollIntoView();
      window.dispatchEvent(new Event('scroll'));

      return true;
    });

    expect(handled).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
