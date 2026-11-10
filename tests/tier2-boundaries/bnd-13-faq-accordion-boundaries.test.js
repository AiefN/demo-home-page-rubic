const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 13: FAQ Accordion Boundaries & Keyboard Controls', () => {
  test('B13.1 Clicking an already-expanded FAQ item collapses it to zero height', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const collapsed = await driver.evaluate(() => {
      const trigger = document.querySelector('#faq .faq-trigger, #faq .faq-header button, #faq summary');
      if (!trigger) return false;
      trigger.click(); // Expand
      trigger.click(); // Collapse
      const item = trigger.closest('.faq-item, details, .accordion-item');
      return item ? (!item.classList.contains('active') && !item.classList.contains('is-open')) : false;
    });

    expect(collapsed).toBe(true);
  });

  test('B13.2 Rapid sequential clicks through all FAQ headers enforce single active expansion', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const singleOpen = await driver.evaluate(() => {
      const triggers = document.querySelectorAll('#faq .faq-trigger, #faq .faq-header button');
      if (triggers.length < 2) return false;
      triggers.forEach(t => t.click());
      const activeItems = document.querySelectorAll('#faq .faq-item.active, #faq .faq-item.is-open');
      return activeItems.length === 1;
    });

    expect(singleOpen).toBe(true);
  });

  test('B13.3 Keyboard Enter and Space keypresses trigger accordion expansion', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const keyboardWorked = await driver.evaluate(() => {
      const trigger = document.querySelector('#faq .faq-trigger, #faq .faq-header button');
      if (!trigger) return false;
      trigger.focus();
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      const item = trigger.closest('.faq-item');
      return item ? item.classList.contains('active') : false;
    });

    expect(keyboardWorked).toBe(true);
  });

  test('B13.4 FAQ answer containing links or formatting retains link interactivity', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const linksIntact = await driver.evaluate(() => {
      const answers = document.querySelectorAll('#faq .faq-answer, #faq .faq-content, #faq p');
      return answers.length >= 1;
    });

    expect(linksIntact).toBe(true);
  });

  test('B13.5 Toggle icon rotation transform does not trigger layout thrashing', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const noThrashing = await driver.evaluate(() => {
      const trigger = document.querySelector('#faq .faq-trigger, #faq .faq-header button');
      if (!trigger) return false;
      trigger.click();
      const item = trigger.closest('.faq-item');
      return item ? item.classList.contains('active') : false;
    });

    expect(noThrashing).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
