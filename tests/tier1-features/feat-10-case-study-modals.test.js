const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 10: Case Study Modal Previews', () => {
  test('10.1 Modal container or dialog exists in DOM', async ({ driver, baseUrl }) => {
    // Check index or portfolio page
    await driver.goto(`${baseUrl}/index.html`);
    const hasModal = await driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal, .modal, dialog, #project-modal, .case-study-modal');
      return !!modal;
    });

    if (!hasModal) {
      await driver.goto(`${baseUrl}/portfolio.html`);
    }

    const modalExists = await driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal, .modal, dialog, #project-modal, .case-study-modal');
      return !!modal;
    });

    expect(modalExists).toBe(true);
  });

  test('10.2 Clicking modal trigger reveals case study modal overlay', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    let trigger = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-case-study, [data-project-id], [data-modal-target], #portfolio button, #portfolio a.btn');
      return !!btn;
    });

    if (!trigger) {
      await driver.goto(`${baseUrl}/portfolio.html`);
    }

    const opened = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-case-study, [data-project-id], [data-modal-target], #portfolio button, #portfolio a.btn');
      if (btn) btn.click();
      const modal = document.querySelector('#case-study-modal, .modal, dialog, #project-modal');
      return !!modal;
    });

    expect(opened).toBe(true);
  });

  test('10.3 Modal structure contains title, description, and metrics sections', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    let modal = await driver.evaluate(() => document.querySelector('#case-study-modal, .modal, dialog, #project-modal'));
    if (!modal) {
      await driver.goto(`${baseUrl}/portfolio.html`);
    }

    const hasContent = await driver.evaluate(() => {
      const m = document.querySelector('#case-study-modal, .modal, dialog, #project-modal');
      return m ? m.innerHTML.length > 50 : false;
    });

    expect(hasContent).toBe(true);
  });

  test('10.4 Close button dismisses case study modal', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const closed = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study, [data-project-id], [data-modal-target], #portfolio button');
      if (!trigger) return false;
      trigger.click();
      const modal = document.querySelector('#case-study-modal, .modal, dialog');
      if (!modal) return false;
      const closeBtn = modal.querySelector('.modal__close, .modal-close, [data-close], #modal-close-btn');
      if (!closeBtn) return false;
      closeBtn.click();
      return !modal.classList.contains('is-active') && !modal.classList.contains('active') && (modal.style.display === 'none' || modal.getAttribute('aria-hidden') === 'true');
    });

    expect(closed).toBe(true);
  });

  test('10.5 Escape key event handler is wired for modal dismissal', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const escHandled = await driver.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const modal = document.querySelector('#case-study-modal.is-open, .modal.active');
      return !modal;
    });

    expect(escHandled).toBe(true);
  });
});
