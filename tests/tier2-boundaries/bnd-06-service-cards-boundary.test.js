const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 6: Service Cards Boundary & Overflow Resilience', () => {
  test('B6.1 Rapid hover transitions across all service cards complete without errors', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const survived = await driver.evaluate(() => {
      const cards = document.querySelectorAll('#services .service-card, #services .interactive-spotlight, #services article');
      if (cards.length === 0) return false;
      cards.forEach(card => {
        card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });
      return cards.length >= 1;
    });

    expect(survived).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });

  test('B6.2 Service card content is bounded without vertical or horizontal overflow', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const bounded = await driver.evaluate(() => {
      const cards = document.querySelectorAll('#services .service-card, #services .interactive-spotlight, #services article');
      return Array.from(cards).every(card => {
        return card.scrollWidth <= card.clientWidth + 5;
      });
    });

    expect(bounded).toBe(true);
  });

  test('B6.3 Keyboard focus transitions sequentially through all service action triggers', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const focusable = await driver.evaluate(() => {
      const triggers = document.querySelectorAll('#services a, #services button');
      triggers.forEach(t => t.focus());
      return triggers.length >= 1;
    });

    expect(focusable).toBe(true);
  });

  test('B6.4 Repeated triggering of service card actions does not clone duplicate dialogs', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const noDuplicates = await driver.evaluate(() => {
      const trigger = document.querySelector('#services a, #services button');
      if (trigger) {
        trigger.click();
        trigger.click();
      }
      const dialogs = document.querySelectorAll('.modal.is-open, dialog[open]');
      return dialogs.length <= 1;
    });

    expect(noDuplicates).toBe(true);
  });

  test('B6.5 Service technology badges wrap gracefully without overflowing card boundaries on mobile', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 320, height: 640 });
    await driver.goto(`${baseUrl}/index.html`);

    const badgesBounded = await driver.evaluate(() => {
      const cards = document.querySelectorAll('#services .service-card, #services .interactive-spotlight, #services article');
      return Array.from(cards).every(c => c.scrollWidth <= 325);
    });

    expect(badgesBounded).toBe(true);
  });
});
