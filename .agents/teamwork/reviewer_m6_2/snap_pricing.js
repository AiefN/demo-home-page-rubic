const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');
const path = require('path');
const fs = require('fs');

async function snapPricing() {
  const server = new StaticServer({ rootDir: path.resolve(__dirname, '../../..'), port: 8109 });
  await server.start();
  const driver = new BrowserDriver({ headless: true });
  await driver.launch();

  try {
    // Desktop 1440
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto('http://127.0.0.1:8109/index.html');
    await new Promise(r => setTimeout(r, 400));

    await driver.evaluate(() => {
      const el = document.querySelector('.tier-cards-group');
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 150;
        window.scrollTo({ top, behavior: 'instant' });
      }
    });
    await new Promise(r => setTimeout(r, 600));
    const shot1 = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, 'audit_pricing_cards_desktop.png'), Buffer.from(shot1.data, 'base64'));

    // Mobile 375
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto('http://127.0.0.1:8109/index.html');
    await new Promise(r => setTimeout(r, 400));

    await driver.evaluate(() => {
      const el = document.querySelector('.tier-cards-group');
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'instant' });
      }
    });
    await new Promise(r => setTimeout(r, 600));
    const shot2 = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, 'audit_pricing_cards_mobile.png'), Buffer.from(shot2.data, 'base64'));

    console.log('Pricing screenshots captured successfully.');
  } finally {
    await driver.close();
    await server.stop();
  }
}

snapPricing().catch(console.error);
