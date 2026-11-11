const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..', '..');
const BrowserDriver = require(path.join(rootDir, 'tests', 'helpers', 'browser-driver.js'));
const StaticServer = require(path.join(rootDir, 'tests', 'helpers', 'static-server.js'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const server = new StaticServer({ rootDir, port: 9895 });
  await server.start();

  const driver = new BrowserDriver();
  try {
    await driver.launch();
    console.log('Testing Services.html Service Modal with Proposed Fix Simulation...');
    await driver.goto('http://127.0.0.1:9895/services.html');
    await sleep(500);

    // 1. Check BEFORE state of #service-modal
    const beforeState = await driver.evaluate(() => {
      const el = document.getElementById('service-modal');
      const comp = window.getComputedStyle(el);
      return {
        display: comp.display,
        position: comp.position,
        opacity: comp.opacity,
        visibility: comp.visibility
      };
    });
    console.log('Before fix on services.html #service-modal:', beforeState);

    // 2. Inject proposed CSS & HTML fix dynamically
    const injectionResult = await driver.evaluate(() => {
      const style = document.createElement('style');
      style.id = 'defect2-fix-services';
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
      `;
      document.head.appendChild(style);

      const modal = document.getElementById('service-modal');
      const comp = window.getComputedStyle(modal);
      return {
        display: comp.display,
        position: comp.position,
        opacity: comp.opacity,
        visibility: comp.visibility,
        pointerEvents: comp.pointerEvents
      };
    });
    console.log('After fix applied on services.html (initial state):', injectionResult);

    // 3. Test opening service modal
    const openResult = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-service-modal[data-service-id="custom-web"]') ||
                      document.querySelector('.btn-service-modal');
      if (!trigger) return { error: 'Trigger not found' };
      trigger.click();

      const modal = document.getElementById('service-modal');
      const comp = window.getComputedStyle(modal);
      const title = modal.querySelector('#service-modal-title') ? modal.querySelector('#service-modal-title').textContent : '';

      return {
        opened: modal.classList.contains('is-active'),
        display: comp.display,
        opacity: comp.opacity,
        visibility: comp.visibility,
        title
      };
    });
    console.log('After opening service modal:', openResult);

    // 4. Test closing service modal via close button
    const closeResult = await driver.evaluate(() => {
      const modal = document.getElementById('service-modal');
      const closeBtn = document.getElementById('service-modal-close') || modal.querySelector('.modal-close');
      if (!closeBtn) return { error: 'Close button not found' };
      closeBtn.click();

      const comp = window.getComputedStyle(modal);
      return {
        closed: !modal.classList.contains('is-active'),
        display: comp.display,
        ariaHidden: modal.getAttribute('aria-hidden')
      };
    });
    console.log('After closing service modal:', closeResult);

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await driver.close();
    await server.stop();
  }
}

main();
