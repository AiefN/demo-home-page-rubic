const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 16: Form Inline Validation Regex & Input Boundaries', () => {
  async function loadContact(driver, baseUrl) {
    await driver.goto(`${baseUrl}/contact.html`);
    const title = await driver.evaluate(() => document.title);
    if (!title || title.includes('404')) {
      await driver.goto(`${baseUrl}/pages/contact.html`);
    }
  }

  test('B16.1 Malformed email addresses without domain are rejected', async ({ driver, baseUrl }) => {
    await loadContact(driver, baseUrl);
    const rejected = await driver.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"], #email, #form-email');
      if (!emailInput) return false;
      const invalidEmails = ['user@', 'user@domain', '@domain.com', 'user@.com'];
      return invalidEmails.every(addr => {
        emailInput.value = addr;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
        return emailInput.classList.contains('error') || emailInput.classList.contains('invalid') || emailInput.classList.contains('is-invalid') || !emailInput.validity.valid;
      });
    });

    expect(rejected).toBe(true);
  });

  test('B16.2 Email with leading/trailing spaces or special chars is handled safely', async ({ driver, baseUrl }) => {
    await loadContact(driver, baseUrl);
    const handled = await driver.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"], #email, #form-email');
      if (!emailInput) return false;
      emailInput.value = ' test user @ domain . com ';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
      return emailInput.classList.contains('error') || emailInput.classList.contains('invalid') || emailInput.classList.contains('is-invalid');
    });

    expect(handled).toBe(true);
  });

  test('B16.3 Phone input containing letters or symbols is flagged as invalid', async ({ driver, baseUrl }) => {
    await loadContact(driver, baseUrl);
    const rejectedLetters = await driver.evaluate(() => {
      const phoneInput = document.querySelector('input[type="tel"], #phone, #form-phone');
      if (!phoneInput) return false;
      phoneInput.value = '081234abcd';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      phoneInput.dispatchEvent(new Event('blur', { bubbles: true }));
      return phoneInput.classList.contains('error') || phoneInput.classList.contains('invalid') || phoneInput.classList.contains('is-invalid');
    });

    expect(rejectedLetters).toBe(true);
  });

  test('B16.4 Phone validation supports Indonesian prefixes (+62, 62, 08)', async ({ driver, baseUrl }) => {
    await loadContact(driver, baseUrl);
    const prefixesSupported = await driver.evaluate(() => {
      const phoneInput = document.querySelector('input[type="tel"], #phone, #form-phone');
      if (!phoneInput) return false;
      const validNumbers = ['081234567890', '+6281234567890', '6281234567890'];
      return validNumbers.every(num => {
        phoneInput.value = num;
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        phoneInput.dispatchEvent(new Event('blur', { bubbles: true }));
        return !phoneInput.classList.contains('error') && !phoneInput.classList.contains('invalid') && !phoneInput.classList.contains('is-invalid');
      });
    });

    expect(prefixesSupported).toBe(true);
  });

  test('B16.5 Submitting empty form highlights all required fields simultaneously', async ({ driver, baseUrl }) => {
    await loadContact(driver, baseUrl);
    const submitted = await driver.evaluate(() => {
      const form = document.querySelector('form#contact-form, form');
      if (!form) return false;
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      const invalidInputs = form.querySelectorAll('.is-invalid, .error, .invalid, [aria-invalid="true"]');
      return invalidInputs.length >= 2;
    });

    expect(submitted).toBe(true);
  });
});
