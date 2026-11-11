const path = require('path');
const fs = require('fs');
const rootDir = path.resolve(__dirname, '..', '..', '..');
const BrowserDriver = require(path.join(rootDir, 'tests', 'helpers', 'browser-driver.js'));
const StaticServer = require(path.join(rootDir, 'tests', 'helpers', 'static-server.js'));

async function main() {
  const server = new StaticServer({ rootDir, port: 9899 });
  await server.start();

  const driver = new BrowserDriver();
  try {
    await driver.launch();
    await driver.goto('http://127.0.0.1:9899/index.html');
    await new Promise(r => setTimeout(r, 1000));

    // Capture screenshot at top
    const snapTop = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, 'screenshot_top.png'), Buffer.from(snapTop.data, 'base64'));

    // Scroll to modal
    await driver.evaluate(() => {
      const modal = document.getElementById('case-study-modal');
      if (modal) modal.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 500));

    const snapModal = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, 'screenshot_modal.png'), Buffer.from(snapModal.data, 'base64'));

    console.log('Screenshots saved successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await driver.close();
    await server.stop();
  }
}

main();
