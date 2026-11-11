const path = require('path');
const http = require('http');
const fs = require('fs');
const rootDir = path.resolve(__dirname, '..', '..', '..');
const BrowserDriver = require(path.join(rootDir, 'tests', 'helpers', 'browser-driver.js'));
const StaticServer = require(path.join(rootDir, 'tests', 'helpers', 'static-server.js'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const server = new StaticServer({ rootDir, port: 9898 });
  await server.start();
  console.log('Static server started at http://127.0.0.1:9898');

  const driver = new BrowserDriver();
  try {
    await driver.launch();
    console.log('Browser launched');

    await driver.goto('http://127.0.0.1:9898/index.html');
    await sleep(1000);

    // Evaluate modal state on index.html
    const modalInfo = await driver.evaluate(`
      (function() {
        const el = document.getElementById('case-study-modal');
        if (!el) return { error: 'Element #case-study-modal not found' };
        const rect = el.getBoundingClientRect();
        const comp = window.getComputedStyle(el);
        const dialog = el.querySelector('.modal-dialog');
        const dialogRect = dialog ? dialog.getBoundingClientRect() : null;
        const dialogComp = dialog ? window.getComputedStyle(dialog) : null;
        
        return {
          id: el.id,
          className: el.className,
          inlineStyle: el.getAttribute('style'),
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          computed: {
            display: comp.display,
            position: comp.position,
            opacity: comp.opacity,
            visibility: comp.visibility,
            pointerEvents: comp.pointerEvents,
            zIndex: comp.zIndex,
            top: comp.top,
            left: comp.left
          },
          dialog: dialog ? {
            rect: { top: dialogRect.top, left: dialogRect.left, width: dialogRect.width, height: dialogRect.height },
            computed: {
              display: dialogComp.display,
              position: dialogComp.position,
              transform: dialogComp.transform,
              opacity: dialogComp.opacity,
              visibility: dialogComp.visibility
            }
          } : null
        };
      })()
    `);

    console.log('=== INDEX.HTML MODAL INFO ===');
    console.log(JSON.stringify(modalInfo, null, 2));

    // Also check services.html and portfolio.html
    await driver.goto('http://127.0.0.1:9898/services.html');
    await sleep(1000);
    const servicesModals = await driver.evaluate(`
      (function() {
        return ['service-modal', 'case-study-modal'].map(id => {
          const el = document.getElementById(id);
          if (!el) return { id, notFound: true };
          const rect = el.getBoundingClientRect();
          const comp = window.getComputedStyle(el);
          return {
            id,
            className: el.className,
            inlineDisplay: el.style.display,
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
            computed: {
              display: comp.display,
              position: comp.position,
              opacity: comp.opacity,
              visibility: comp.visibility,
              pointerEvents: comp.pointerEvents,
              zIndex: comp.zIndex
            }
          };
        });
      })()
    `);
    console.log('=== SERVICES.HTML MODALS INFO ===');
    console.log(JSON.stringify(servicesModals, null, 2));

    await driver.goto('http://127.0.0.1:9898/portfolio.html');
    await sleep(1000);
    const portfolioModals = await driver.evaluate(`
      (function() {
        const el = document.getElementById('case-study-modal');
        if (!el) return { error: 'Element #case-study-modal not found' };
        const rect = el.getBoundingClientRect();
        const comp = window.getComputedStyle(el);
        return {
          id,
          className: el.className,
          inlineDisplay: el.style.display,
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          computed: {
            display: comp.display,
            position: comp.position,
            opacity: comp.opacity,
            visibility: comp.visibility,
            pointerEvents: comp.pointerEvents,
            zIndex: comp.zIndex
          }
        };
      })()
    `);
    console.log('=== PORTFOLIO.HTML MODAL INFO ===');
    console.log(JSON.stringify(portfolioModals, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await driver.close();
    await server.stop();
  }
}

main();
