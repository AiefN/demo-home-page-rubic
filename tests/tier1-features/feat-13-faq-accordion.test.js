const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 13: Single-Active FAQ Accordion', () => {
  test('13.1 FAQ section contains multiple agency questions', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const faqCount = await driver.evaluate(() => {
      const items = document.querySelectorAll('#faq .faq-item, #faq details, #faq .accordion-item');
      return items.length;
    });

    expect(faqCount).toBeGreaterThanOrEqual(3);
  });

  test('13.2 Clicking FAQ header expands corresponding answer', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const expanded = await driver.evaluate(() => {
      const trigger = document.querySelector('#faq .faq-trigger, #faq .faq-header button, #faq summary');
      if (!trigger) return false;
      trigger.click();
      const item = trigger.closest('.faq-item, details, .accordion-item');
      return item ? (item.classList.contains('active') && trigger.getAttribute('aria-expanded') === 'true') : false;
    });

    expect(expanded).toBe(true);
  });

  test('13.3 Opening a second FAQ item enforces single-active expansion', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const singleActive = await driver.evaluate(() => {
      const triggers = document.querySelectorAll('#faq .faq-trigger, #faq .faq-header button');
      if (triggers.length < 2) return false;
      triggers[0].click();
      triggers[1].click();
      const activeItems = document.querySelectorAll('#faq .faq-item.active, #faq .faq-item.is-open');
      return activeItems.length === 1;
    });

    expect(singleActive).toBe(true);
  });

  test('13.4 Clicking an active FAQ item collapses it', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const collapsed = await driver.evaluate(() => {
      const trigger = document.querySelector('#faq .faq-trigger, #faq .faq-header button');
      if (!trigger) return false;
      trigger.click(); // open
      trigger.click(); // close
      const item = trigger.closest('.faq-item, details, .accordion-item');
      return item ? (!item.classList.contains('active') && trigger.getAttribute('aria-expanded') === 'false') : false;
    });

    expect(collapsed).toBe(true);
  });

  test('13.5 FAQ items maintain accessible headings or buttons', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const accessible = await driver.evaluate(() => {
      const headers = document.querySelectorAll('#faq h3, #faq h4, #faq button, #faq summary');
      return headers.length >= 2;
    });

    expect(accessible).toBe(true);
  });
});
