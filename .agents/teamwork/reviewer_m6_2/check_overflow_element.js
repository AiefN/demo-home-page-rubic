const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');
const path = require('path');

async function check() {
  const server = new StaticServer({ rootDir: path.resolve(__dirname, '../../..'), port: 8106 });
  await server.start();
  const driver = new BrowserDriver({ headless: true });
  await driver.launch();

  try {
    await driver.setViewport({ width: 320, height: 568, mobile: true });
    await driver.goto('http://127.0.0.1:8106/index.html');
    await new Promise(r => setTimeout(r, 400));

    const analysis = await driver.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;

      const overflowingElements = [];
      const allEls = document.querySelectorAll('*');
      for (const el of allEls) {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth + 1) {
          overflowingElements.push({
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            scrollWidth: el.scrollWidth
          });
        }
      }

      return {
        docScrollWidth: doc.scrollWidth,
        bodyScrollWidth: body.scrollWidth,
        windowInnerWidth: window.innerWidth,
        docClientWidth: doc.clientWidth,
        bodyClientWidth: body.clientWidth,
        overflowingCount: overflowingElements.length,
        overflowingTop5: overflowingElements.slice(0, 10)
      };
    });

    console.log('320px Analysis:', JSON.stringify(analysis, null, 2));

  } finally {
    await driver.close();
    await server.stop();
  }
}

check().catch(console.error);
