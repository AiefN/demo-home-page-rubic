const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');
const path = require('path');

async function testHScroll() {
  const server = new StaticServer({ rootDir: path.resolve(__dirname, '../../..'), port: 8107 });
  await server.start();
  const driver = new BrowserDriver({ headless: true });
  await driver.launch();

  try {
    await driver.setViewport({ width: 320, height: 568, mobile: true });
    await driver.goto('http://127.0.0.1:8107/index.html');
    await new Promise(r => setTimeout(r, 400));

    const scrollResult = await driver.evaluate(() => {
      window.scrollTo(100, 0);
      const afterScrollX = window.scrollX;
      return {
        initialScrollX: window.scrollX,
        canScrollHorizontally: afterScrollX > 0,
        docScrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth
      };
    });

    console.log('Horizontal Scroll Test:', JSON.stringify(scrollResult, null, 2));

  } finally {
    await driver.close();
    await server.stop();
  }
}

testHScroll().catch(console.error);
