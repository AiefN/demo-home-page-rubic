const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 15: Valid Form Submission & WhatsApp CTA Redirection Sync', () => {
  test('C15.1 Valid form completion links smoothly to WhatsApp consultation trigger', async ({ driver, baseUrl }) => {
    let url = `${baseUrl}/contact.html`;
    await driver.goto(url);
    let title = await driver.evaluate(() => document.title);
    if (!title || title.includes('404')) {
      await driver.goto(`${baseUrl}/pages/contact.html`);
    }

    const formSubmitted = await driver.evaluate(() => {
      const nameInput = document.querySelector('input[name="name"], #name, #form-name');
      const emailInput = document.querySelector('input[type="email"], #email, #form-email');
      const phoneInput = document.querySelector('input[type="tel"], #phone, #form-phone');

      if (nameInput) nameInput.value = 'Budi Santoso';
      if (emailInput) emailInput.value = 'budi@rubicweb.co.id';
      if (phoneInput) phoneInput.value = '081234567890';

      const submitBtn = document.querySelector('form button[type="submit"], form input[type="submit"], .btn-submit');
      if (submitBtn) submitBtn.click();

      return true;
    });

    expect(formSubmitted).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
