const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 16: Contact Consultation Form Inline Validation', () => {
  async function loadContactPage(driver, baseUrl) {
    await driver.goto(`${baseUrl}/contact.html`);
    const title = await driver.evaluate(() => document.title);
    if (!title || title.includes('404')) {
      await driver.goto(`${baseUrl}/pages/contact.html`);
    }
  }

  test('16.1 Contact consultation form rendered with input fields', async ({ driver, baseUrl }) => {
    await loadContactPage(driver, baseUrl);
    const formFields = await driver.evaluate(() => {
      const inputs = document.querySelectorAll('form input, form textarea, form select');
      return inputs.length;
    });

    expect(formFields).toBeGreaterThanOrEqual(3);
  });

  test('16.2 Inline email validation flags invalid email addresses', async ({ driver, baseUrl }) => {
    await loadContactPage(driver, baseUrl);
    const errorFlagged = await driver.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"], #email, #form-email');
      if (!emailInput) return false;
      emailInput.value = 'invalid-email-address';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
      const hasErrorClass = emailInput.classList.contains('invalid') || emailInput.classList.contains('error') || emailInput.classList.contains('is-invalid');
      const errEl = document.querySelector('.error-message, .form-feedback, .error, [role="alert"]');
      return hasErrorClass || (errEl && errEl.textContent.trim().length > 0) || emailInput.validity.valid === false;
    });

    expect(errorFlagged).toBe(true);
  });

  test('16.3 Inline phone validation verifies Indonesian number formats', async ({ driver, baseUrl }) => {
    await loadContactPage(driver, baseUrl);
    const phoneValidated = await driver.evaluate(() => {
      const phoneInput = document.querySelector('input[type="tel"], #phone, #form-phone');
      if (!phoneInput) return false;
      phoneInput.value = '12345'; // invalid short
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      phoneInput.dispatchEvent(new Event('blur', { bubbles: true }));
      return phoneInput.classList.contains('error') || phoneInput.classList.contains('invalid') || phoneInput.classList.contains('is-invalid');
    });

    expect(phoneValidated).toBe(true);
  });

  test('16.4 Entering valid email and phone clears error indicators', async ({ driver, baseUrl }) => {
    await loadContactPage(driver, baseUrl);
    const validCleared = await driver.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"], #email, #form-email');
      if (!emailInput) return false;
      emailInput.value = 'client@example.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
      return !emailInput.classList.contains('error') && !emailInput.classList.contains('invalid') && !emailInput.classList.contains('is-invalid');
    });

    expect(validCleared).toBe(true);
  });

  test('16.5 Form submission with empty required fields shows validation feedback', async ({ driver, baseUrl }) => {
    await loadContactPage(driver, baseUrl);
    const feedbackShown = await driver.evaluate(() => {
      const form = document.querySelector('form#contact-form, form');
      if (!form) return false;
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], .btn-submit');
      if (!submitBtn) return false;
      submitBtn.click();
      const errors = form.querySelectorAll('.is-invalid, .error, .invalid, [aria-invalid="true"]');
      return errors.length >= 1;
    });

    expect(feedbackShown).toBe(true);
  });
});
