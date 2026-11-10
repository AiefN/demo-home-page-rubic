const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 4 - Scenario 5: Mobile Exploration, Testimonials & FAQ Journey', () => {
  test('S5.1 Mobile visitor browses hero, scrolls to stats, navigates carousel, and toggles FAQ items', async ({ driver, baseUrl }) => {
    // 1. Mobile viewport 375x812 (iPhone X/11/12)
    await driver.setViewport({ width: 375, height: 812, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    // 2. Scroll past Hero to Trust Stats
    await driver.scrollTo(0, 800);
    await new Promise(r => setTimeout(r, 400));

    // 3. Navigate Testimonials Carousel
    await driver.evaluate(() => {
      const nextBtn = document.querySelector('.carousel-btn--next, .carousel-next, [data-next]');
      if (nextBtn) nextBtn.click();
    });

    // 4. Scroll to FAQ Accordion
    await driver.evaluate(() => {
      const faq = document.getElementById('faq');
      if (faq) faq.scrollIntoView();
      window.dispatchEvent(new Event('scroll'));
    });

    // 5. Expand FAQ 1 then FAQ 2
    await driver.evaluate(() => {
      const triggers = document.querySelectorAll('#faq .faq-item header, #faq .faq-header, #faq summary, #faq button');
      if (triggers.length >= 2) {
        triggers[0].click();
        triggers[1].click();
      }
    });

    // 6. Verify Floating WhatsApp button is accessible
    const waExists = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-floating-whatsapp, .whatsapp-floating, a[href*="wa.me"]');
      return !!btn;
    });

    expect(waExists).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
