const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');
const path = require('path');

async function testCentering() {
  const server = new StaticServer({ rootDir: path.resolve(__dirname, '../../..'), port: 8108 });
  await server.start();
  const driver = new BrowserDriver({ headless: true });
  await driver.launch();

  try {
    await driver.setViewport({ width: 1920, height: 1080 });
    await driver.goto('http://127.0.0.1:8108/index.html');
    await new Promise(r => setTimeout(r, 400));

    const centerData = await driver.evaluate(() => {
      const container = document.querySelector('.hero-container');
      const cRect = container.getBoundingClientRect();
      const clientWidth = document.documentElement.clientWidth;
      const leftGap = cRect.left;
      const rightGap = clientWidth - cRect.right;
      return {
        clientWidth,
        containerWidth: cRect.width,
        leftGap,
        rightGap,
        diff: Math.abs(leftGap - rightGap)
      };
    });

    console.log('Centering check:', JSON.stringify(centerData, null, 2));

  } finally {
    await driver.close();
    await server.stop();
  }
}

testCentering().catch(console.error);
