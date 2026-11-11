const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..', '..');
const BrowserDriver = require(path.join(rootDir, 'tests', 'helpers', 'browser-driver.js'));
const StaticServer = require(path.join(rootDir, 'tests', 'helpers', 'static-server.js'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const server = new StaticServer({ rootDir, port: 9896 });
  await server.start();

  const driver = new BrowserDriver();
  try {
    await driver.launch();
    console.log('Testing Index.html Modal with Proposed Fix Simulation...');
    await driver.goto('http://127.0.0.1:9896/index.html');
    await sleep(500);

    // 1. Check BEFORE state
    const beforeState = await driver.evaluate(() => {
      const el = document.getElementById('case-study-modal');
      const comp = window.getComputedStyle(el);
      return {
        display: comp.display,
        position: comp.position,
        opacity: comp.opacity,
        visibility: comp.visibility
      };
    });
    console.log('Before fix on index.html:', beforeState);

    // 2. Inject proposed CSS & HTML fix dynamically
    const injectionResult = await driver.evaluate(() => {
      // Add proposed CSS
      const style = document.createElement('style');
      style.id = 'defect2-fix';
      style.textContent = `
        .modal-overlay,
        .modal-backdrop,
        .modal,
        #case-study-modal,
        #service-modal {
          position: fixed !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background-color: rgba(10, 11, 14, 0.85) !important;
          backdrop-filter: var(--blur-modal) !important;
          -webkit-backdrop-filter: var(--blur-modal) !important;
          z-index: 10000 !important;
          display: none !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 24px !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transition: opacity 0.35s var(--ease-swift-out), visibility 0.35s ease !important;
        }

        .modal-overlay.is-active,
        .modal-overlay.active,
        .modal-overlay.is-open,
        .modal-overlay[aria-hidden="false"],
        .modal-backdrop.is-active,
        .modal-backdrop.active,
        .modal-backdrop.is-open,
        .modal-backdrop[aria-hidden="false"],
        .modal.is-active,
        .modal.active,
        .modal.is-open,
        .modal[aria-hidden="false"],
        #case-study-modal.is-active,
        #case-study-modal.active,
        #case-study-modal.is-open,
        #case-study-modal[aria-hidden="false"],
        #service-modal.is-active,
        #service-modal.active,
        #service-modal.is-open,
        #service-modal[aria-hidden="false"] {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
        }

        .modal-dialog {
          margin: auto !important;
        }

        .modal-close,
        .modal__close,
        .modal-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          z-index: 10;
        }
      `;
      document.head.appendChild(style);

      // Add modal-overlay class and inline display: none to modal
      const modal = document.getElementById('case-study-modal');
      modal.classList.add('modal-overlay');
      modal.style.display = 'none';

      const comp = window.getComputedStyle(modal);
      return {
        display: comp.display,
        position: comp.position,
        opacity: comp.opacity,
        visibility: comp.visibility,
        pointerEvents: comp.pointerEvents
      };
    });
    console.log('After fix applied (initial hidden state):', injectionResult);

    // 3. Test clicking trigger to open modal
    const openResult = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study[data-project-id="nexastore"]');
      if (!trigger) return { error: 'Trigger not found' };
      trigger.click();

      const modal = document.getElementById('case-study-modal');
      const comp = window.getComputedStyle(modal);
      const title = modal.querySelector('#modal-title') ? modal.querySelector('#modal-title').textContent : '';

      return {
        opened: modal.classList.contains('is-active'),
        display: comp.display,
        opacity: comp.opacity,
        visibility: comp.visibility,
        title
      };
    });
    console.log('After clicking trigger (opened state):', openResult);

    // 4. Test clicking close button
    const closeResult = await driver.evaluate(() => {
      const modal = document.getElementById('case-study-modal');
      const closeBtn = modal.querySelector('.modal__close, .modal-close');
      if (!closeBtn) return { error: 'Close button not found' };
      closeBtn.click();

      const comp = window.getComputedStyle(modal);
      return {
        closed: !modal.classList.contains('is-active'),
        display: comp.display,
        ariaHidden: modal.getAttribute('aria-hidden')
      };
    });
    console.log('After clicking close button (dismissed state):', closeResult);

    // 5. Test Escape key dismissal
    const escResult = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study[data-project-id="apex"]');
      trigger.click();

      const modal = document.getElementById('case-study-modal');
      // trigger Escape
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      const comp = window.getComputedStyle(modal);
      return {
        closed: !modal.classList.contains('is-active'),
        display: comp.display,
        ariaHidden: modal.getAttribute('aria-hidden')
      };
    });
    console.log('After Escape key dismissal:', escResult);

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await driver.close();
    await server.stop();
  }
}

main();
