const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..', '..');
const BrowserDriver = require(path.join(rootDir, 'tests', 'helpers', 'browser-driver.js'));
const StaticServer = require(path.join(rootDir, 'tests', 'helpers', 'static-server.js'));

async function main() {
  const server = new StaticServer({ rootDir, port: 9894 });
  await server.start();
  console.log('Static server started at http://127.0.0.1:9894');

  const driver = new BrowserDriver();
  try {
    await driver.launch();
    console.log('Browser launched');

    const pages = ['index.html', 'services.html', 'portfolio.html', 'contact.html'];
    const results = {};

    for (const page of pages) {
      await driver.goto(`http://127.0.0.1:9894/${page}`);
      await new Promise(r => setTimeout(r, 600));

      const modalsState = await driver.evaluate(() => {
        const modals = Array.from(document.querySelectorAll('#case-study-modal, #service-modal, .modal-overlay, .modal-backdrop, .modal, dialog'));
        return modals.map(m => {
          const rect = m.getBoundingClientRect();
          const comp = window.getComputedStyle(m);
          const isStaticallyVisible = comp.display !== 'none' && comp.visibility !== 'hidden' && comp.opacity !== '0' && (rect.width > 0 && rect.height > 0);
          return {
            id: m.id,
            className: m.className,
            inlineStyle: m.getAttribute('style'),
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
            computed: {
              display: comp.display,
              position: comp.position,
              opacity: comp.opacity,
              visibility: comp.visibility,
              pointerEvents: comp.pointerEvents
            },
            isStaticallyVisible
          };
        });
      });

      results[page] = modalsState;
    }

    console.log('=== MULTI-PAGE MODAL INITIAL AUDIT RESULTS ===');
    console.log(JSON.stringify(results, null, 2));

  } catch (err) {
    console.error('Error during audit:', err);
  } finally {
    await driver.close();
    await server.stop();
  }
}

main();
