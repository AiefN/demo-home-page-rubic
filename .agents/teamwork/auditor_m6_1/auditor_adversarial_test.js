/**
 * Auditor Adversarial Stress Test Script
 */
const path = require('path');
const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');

const ROOT_DIR = path.resolve(__dirname, '../../..');
const PORT = 8097;

async function runAdversarialTest() {
  const server = new StaticServer({ rootDir: ROOT_DIR, port: PORT });
  await server.start();
  const baseUrl = `http://127.0.0.1:${PORT}`;
  const driver = new BrowserDriver({ headless: true });

  const stressResults = {
    serviceModalCycle: false,
    portfolioModalCycle: false,
    pricingSliderAndAddons: false,
    dockScrollHysteresis: false
  };

  try {
    await driver.launch();
    await driver.setViewport({ width: 1440, height: 900 });

    // 1. Service Modal Cycle on services.html
    await driver.goto(`${baseUrl}/services.html`);
    await new Promise(r => setTimeout(r, 400));
    stressResults.serviceModalCycle = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-service-modal, [data-service]');
      if (!trigger) return false;
      trigger.click();
      const modal = document.getElementById('service-modal');
      const opened = modal && (modal.style.display === 'flex' || window.getComputedStyle(modal).display === 'flex');
      const closeBtn = document.getElementById('service-modal-close') || modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.click();
      const closed = modal && (modal.style.display === 'none' || window.getComputedStyle(modal).display === 'none');
      return opened && closed;
    });

    // 2. Portfolio Modal Cycle on portfolio.html
    await driver.goto(`${baseUrl}/portfolio.html`);
    await new Promise(r => setTimeout(r, 400));
    stressResults.portfolioModalCycle = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study, [data-project-id]');
      if (!trigger) return false;
      trigger.click();
      const modal = document.getElementById('case-study-modal');
      const opened = modal && (modal.style.display === 'flex' || window.getComputedStyle(modal).display === 'flex');
      const closeBtn = document.getElementById('modal-close-btn') || modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.click();
      const closed = modal && (modal.style.display === 'none' || window.getComputedStyle(modal).display === 'none');
      return opened && closed;
    });

    // 3. Pricing Slider & Add-ons on index.html
    await driver.goto(`${baseUrl}/index.html`);
    await new Promise(r => setTimeout(r, 400));
    stressResults.pricingSliderAndAddons = await driver.evaluate(() => {
      const priceDisplay = document.querySelector('#calc-total-price');
      const initialPrice = priceDisplay ? priceDisplay.textContent.trim() : '';

      const slider = document.querySelector('#extra-pages, input[type="range"]');
      if (slider) {
        slider.value = 15;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const priceWithExtraPages = priceDisplay ? priceDisplay.textContent.trim() : '';

      const addon = document.querySelector('input[name="addon"]');
      if (addon) {
        addon.checked = true;
        addon.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const priceWithAddon = priceDisplay ? priceDisplay.textContent.trim() : '';

      return (initialPrice !== priceWithExtraPages) && (priceWithExtraPages !== priceWithAddon);
    });

    // 4. Floating Dock Scroll Hysteresis
    stressResults.dockScrollHysteresis = await driver.evaluate(async () => {
      const dock = document.querySelector('.floating-bottom-nav');
      if (!dock) return false;

      document.documentElement.style.scrollBehavior = 'auto';

      // Scroll step 1: set lastScrollY to 200
      window.scrollTo(0, 200);
      window.dispatchEvent(new Event('scroll'));
      await new Promise(r => setTimeout(r, 60));

      // Scroll step 2: scroll to 600 (currentY=600 > 400, delta=400 > 15)
      window.scrollTo(0, 600);
      window.dispatchEvent(new Event('scroll'));
      await new Promise(r => setTimeout(r, 60));

      const isHiddenOnScrollDown = dock.classList.contains('nav-dock--hidden');

      // Scroll step 3: scroll back to 100 (delta < -8 or currentY <= 300)
      window.scrollTo(0, 100);
      window.dispatchEvent(new Event('scroll'));
      await new Promise(r => setTimeout(r, 60));

      const isRevealedOnScrollUp = !dock.classList.contains('nav-dock--hidden');

      return isHiddenOnScrollDown && isRevealedOnScrollUp;
    });

  } finally {
    await driver.close();
    await server.stop();
  }

  console.log(JSON.stringify(stressResults, null, 2));
  const allPass = Object.values(stressResults).every(v => v === true);
  process.exit(allPass ? 0 : 1);
}

runAdversarialTest().catch(err => {
  console.error(err);
  process.exit(1);
});
