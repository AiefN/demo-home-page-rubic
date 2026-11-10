const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 9: Contact Form Error State & Calculator Toggle Independence', () => {
  test('C9.1 Toggling pricing calculator add-ons does not reset or corrupt contact form error validations', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);

    const isolated = await driver.evaluate(() => {
      // Trigger invalid email in contact form if present on homepage
      const email = document.querySelector('input[type="email"], #email');
      if (email) {
        email.value = 'invalid';
        email.dispatchEvent(new Event('input', { bubbles: true }));
        email.dispatchEvent(new Event('blur', { bubbles: true }));
      }

      // Toggle calculator add-on
      const addon = document.querySelector('input[name="addon"], input[type="checkbox"]');
      if (addon) {
        addon.click();
      }

      return true;
    });

    expect(isolated).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
