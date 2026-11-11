const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');
const path = require('path');
const fs = require('fs');

async function captureEvidence() {
  const server = new StaticServer({ rootDir: path.resolve(__dirname, '../../..'), port: 8099 });
  await server.start();
  const driver = new BrowserDriver({ headless: true });
  await driver.launch();

  try {
    // 1440x900 full-page screenshot
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto('http://127.0.0.1:8099/index.html');
    await new Promise(r => setTimeout(r, 600));

    // Capture Hero & Dock at scrollY = 0
    const shot1 = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, 'screenshot_hero_dock_clearance.png'), Buffer.from(shot1.data, 'base64'));

    // Scroll to pricing calculator
    await driver.evaluate(() => {
      document.getElementById('pricing-calculator').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 500));
    const shot2 = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, 'screenshot_pricing_calculator.png'), Buffer.from(shot2.data, 'base64'));

    // Scroll to FAQ
    await driver.evaluate(() => {
      document.getElementById('faq').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 500));
    const shot3 = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, 'screenshot_faq_accordion.png'), Buffer.from(shot3.data, 'base64'));

    console.log('Visual evidence screenshots successfully captured!');
  } finally {
    await driver.close();
    await server.stop();
  }
}

captureEvidence().catch(e => {
  console.error(e);
  process.exit(1);
});
