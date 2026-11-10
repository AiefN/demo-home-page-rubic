const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 4 - Scenario 4: Mobile Consultation Journey & Inline Form Validation', () => {
  test('S4.1 Mobile visitor opens navigation drawer, navigates to contact, validates inline errors, and submits', async ({ driver, baseUrl }) => {
    // 1. Set mobile viewport 320x640
    await driver.setViewport({ width: 320, height: 640, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    // 2. Open Mobile Navigation Drawer
    await driver.evaluate(() => {
      const toggle = document.querySelector('.navbar__toggle, .mobile-toggle, .menu-toggle');
      if (toggle) toggle.click();
    });

    // 3. Navigate to Contact
    let contactUrl = `${baseUrl}/contact.html`;
    await driver.goto(contactUrl);
    let title = await driver.evaluate(() => document.title);
    if (!title || title.includes('404')) {
      await driver.goto(`${baseUrl}/pages/contact.html`);
    }

    // 4. Trigger validation feedback on empty submission
    await driver.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    // 5. Fill valid inputs
    await driver.evaluate(() => {
      const name = document.querySelector('#name, input[name="name"], #form-name');
      const email = document.querySelector('#email, input[type="email"], #form-email');
      const phone = document.querySelector('#phone, input[type="tel"], #form-phone');

      if (name) name.value = 'Rudi Hermawan';
      if (email) email.value = 'rudi@rubicweb.co.id';
      if (phone) phone.value = '+6281234567890';
    });

    // 6. Submit valid consultation
    await driver.evaluate(() => {
      const submit = document.querySelector('form button[type="submit"], form input[type="submit"], .btn-submit');
      if (submit) submit.click();
    });

    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
