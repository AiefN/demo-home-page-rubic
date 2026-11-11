const path = require('path');
const fs = require('fs');
const rootDir = path.resolve(__dirname, '..', '..', '..');
const BrowserDriver = require(path.join(rootDir, 'tests', 'helpers', 'browser-driver.js'));
const StaticServer = require(path.join(rootDir, 'tests', 'helpers', 'static-server.js'));

async function main() {
  const server = new StaticServer({ rootDir, port: 9897 });
  await server.start();

  const driver = new BrowserDriver();
  try {
    await driver.launch();
    await driver.goto('http://127.0.0.1:9897/index.html');
    await new Promise(r => setTimeout(r, 1000));

    // Scroll directly to #case-study-modal center
    await driver.evaluate(() => {
      const modal = document.getElementById('case-study-modal');
      if (modal) modal.scrollIntoView({ block: 'center' });
    });
    await new Promise(r => setTimeout(r, 500));

    const snapModalFull = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, 'screenshot_modal_center.png'), Buffer.from(snapModalFull.data, 'base64'));

    console.log('Saved screenshot_modal_center.png');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await driver.close();
    await server.stop();
  }
}

main();
