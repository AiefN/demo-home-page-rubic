const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 10: Service Modal Trigger, Escape Dismiss & Focus Restoration', () => {
  test('C10.1 Triggering modal and dismissing via Escape key restores keyboard focus to origin button', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/services.html`);

    const result = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-service-modal, #services a, #services button, .btn-case-study, [data-modal-target]');
      const modal = document.querySelector('#service-modal, #case-study-modal');
      if (!trigger || !modal) {
        return { success: false, reason: 'elements missing' };
      }

      trigger.focus();
      trigger.click();

      const opened = modal.classList.contains('is-active') && modal.getAttribute('aria-hidden') === 'false';

      // Dismiss with escape key
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      const closed = !modal.classList.contains('is-active') && modal.getAttribute('aria-hidden') === 'true';
      const focusRestored = document.activeElement === trigger;

      return {
        success: opened && closed && focusRestored,
        opened,
        closed,
        focusRestored
      };
    });

    expect(result.success).toBe(true);
    expect(result.opened).toBe(true);
    expect(result.closed).toBe(true);
    expect(result.focusRestored).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
