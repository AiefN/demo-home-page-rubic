const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 10: Case Study Modal Edge Cases & Focus Trap', () => {
  test('B10.1 Rapid open and dismiss cycles execute without DOM race errors', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const survived = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study, [data-project-id], [data-modal-target], #portfolio button');
      if (!trigger) return false;
      for (let i = 0; i < 3; i++) {
        trigger.click();
        const closeBtn = document.querySelector('.modal__close, .modal-close, [data-close], #modal-close-btn');
        if (closeBtn) closeBtn.click();
      }
      const modal = document.querySelector('#case-study-modal, .modal, dialog');
      return modal ? (!modal.classList.contains('active') && !modal.classList.contains('is-active')) : true;
    });

    expect(survived).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });

  test('B10.2 Clicking inside modal content body does not trigger accidental backdrop close', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const staysOpen = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study, [data-project-id], [data-modal-target], #portfolio button');
      if (!trigger) return false;
      trigger.click();
      const content = document.querySelector('.modal-container, .modal-dialog, .modal__content');
      if (!content) return false;
      content.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const modal = document.querySelector('#case-study-modal, .modal, dialog');
      return modal ? (modal.classList.contains('active') || modal.classList.contains('is-active') || modal.style.display !== 'none') : false;
    });

    expect(staysOpen).toBe(true);
  });

  test('B10.3 Clicking outer backdrop overlay dismisses modal', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const backdropClosed = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study, [data-project-id], [data-modal-target], #portfolio button');
      if (!trigger) return false;
      trigger.click();
      const overlay = document.querySelector('#case-study-modal, .modal-overlay');
      if (!overlay) return false;
      overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const modal = document.querySelector('#case-study-modal, .modal, dialog');
      return modal ? (!modal.classList.contains('active') && !modal.classList.contains('is-active') && modal.style.display === 'none') : false;
    });

    expect(backdropClosed).toBe(true);
  });

  test('B10.4 Large case study content enables vertical scrolling within modal dialog', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const scrollable = await driver.evaluate(() => {
      const dialog = document.querySelector('.modal-container, .modal-dialog, .modal__content');
      if (!dialog) return false;
      const overflowY = window.getComputedStyle(dialog).overflowY;
      return overflowY === 'auto' || overflowY === 'scroll';
    });

    expect(scrollable).toBe(true);
  });

  test('B10.5 Modal dialog traps keyboard focus or prevents unfocused background navigation', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study, [data-project-id], [data-modal-target]');
      if (trigger) trigger.click();
    });
    await new Promise(r => setTimeout(r, 120));
    const focusTrapped = await driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal, .modal');
      return modal ? modal.contains(document.activeElement) : false;
    });

    expect(focusTrapped).toBe(true);
  });
});
