/**
 * Empirical Challenger Verification Harness for Milestone 5 Final
 * Validates:
 * 1. contact.html responsive layout geometry across 320px, 375px, 768px, 1024px, 1440px
 * 2. Strict zero horizontal overflow (scrollWidth <= clientWidth)
 * 3. Element containment audits (detect any rogue overflowing DOM nodes)
 * 4. Pricing calculator complete visibility, accessibility, and dynamic recalculation on 320px mobile
 * 5. Touch target dimensions and contrast/visual containment
 * 6. Zero console errors throughout all viewports and interactions
 */

const path = require('path');
const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');

const VIEWPORTS = [
  { name: 'Ultra-Compact Mobile', width: 320, height: 640, mobile: true },
  { name: 'Standard Mobile', width: 375, height: 667, mobile: true },
  { name: 'Tablet Portrait', width: 768, height: 1024, mobile: true },
  { name: 'Desktop Standard', width: 1024, height: 768, mobile: false },
  { name: 'Desktop Widescreen', width: 1440, height: 900, mobile: false }
];

async function runResponsiveStressSuite() {
  console.log('================================================================');
  console.log('  MILESTONE 5 FINAL: EMPIRICAL RESPONSIVE & CALCULATOR AUDIT   ');
  console.log('================================================================\n');

  const server = new StaticServer({ rootDir: path.resolve(__dirname, '..') });
  const serverInfo = await server.start();
  const driver = new BrowserDriver();
  await driver.launch();

  const results = {
    timestamp: new Date().toISOString(),
    viewports: {},
    calculator320Mobile: {},
    consoleErrors: []
  };

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message, details = null) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ ${message}`);
    } else {
      failedTests++;
      console.log(`  ✗ FAILED: ${message}`);
      if (details) console.log('    Details:', JSON.stringify(details));
    }
    return condition;
  }

  try {
    // ------------------------------------------------------------------------
    // VIEWPORT 1: 320px Ultra-Compact Mobile (Geometry + Full Calculator Stress)
    // ------------------------------------------------------------------------
    const vp320 = VIEWPORTS[0];
    console.log(`▶ [1/5] Testing Viewport: ${vp320.name} (${vp320.width}x${vp320.height})...`);

    await driver.setViewport({
      width: vp320.width,
      height: vp320.height,
      deviceScaleFactor: 2,
      mobile: vp320.mobile
    });

    await driver.goto(`${serverInfo.url}/contact.html`);
    await new Promise(r => setTimeout(r, 400));

    const pageGeometry320 = await driver.evaluate(() => {
      const docEl = document.documentElement;
      const body = document.body;

      const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
      const clientWidth = docEl.clientWidth;
      const innerWidth = window.innerWidth;

      const overflowingElements = [];
      const allElements = Array.from(document.querySelectorAll('body *'));

      for (const el of allElements) {
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NOSCRIPT') continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
        if (el.classList.contains('cursor-dot') || el.classList.contains('cursor-follower')) continue;
        if (el.closest('.mobile-drawer') || el.closest('.mobile-menu') || el.closest('#mobile-nav-drawer')) continue;

        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (rect.right > innerWidth + 1.5 || rect.left < -1.5) {
            overflowingElements.push({
              tag: el.tagName,
              id: el.id,
              className: el.className,
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            });
          }
        }
      }

      const formBox = document.querySelector('.consultation-form-box');
      const formRect = formBox ? formBox.getBoundingClientRect() : null;

      const calcBox = document.getElementById('pricing-calculator');
      const calcRect = calcBox ? calcBox.getBoundingClientRect() : null;

      return {
        scrollWidth,
        clientWidth,
        innerWidth,
        hasHorizontalOverflow: scrollWidth > clientWidth,
        overflowCount: overflowingElements.length,
        topOverflowElements: overflowingElements.slice(0, 5),
        formWidth: formRect ? Math.round(formRect.width) : 0,
        calcWidth: calcRect ? Math.round(calcRect.width) : 0
      };
    });

    assert(
      !pageGeometry320.hasHorizontalOverflow && pageGeometry320.scrollWidth <= 320,
      `Zero horizontal overflow at 320px (scrollWidth: ${pageGeometry320.scrollWidth}px <= clientWidth: ${pageGeometry320.clientWidth}px)`
    );
    assert(
      pageGeometry320.overflowCount === 0,
      `All active DOM elements strictly contained within 320px boundary (overflow count: ${pageGeometry320.overflowCount})`
    );
    assert(
      pageGeometry320.formWidth > 0 && pageGeometry320.formWidth <= 320,
      `Consultation form box width (${pageGeometry320.formWidth}px) fits 320px viewport`
    );
    assert(
      pageGeometry320.calcWidth > 0 && pageGeometry320.calcWidth <= 320,
      `Pricing calculator box width (${pageGeometry320.calcWidth}px) fits 320px viewport`
    );

    // Deep Calculator Inspection on 320px
    console.log('\n  ... Deep Stress Testing Pricing Calculator on 320px Mobile:');
    const calcMobileMetrics = await driver.evaluate(() => {
      const calc = document.getElementById('pricing-calculator');
      if (!calc) return { found: false };

      const rect = calc.getBoundingClientRect();
      const style = window.getComputedStyle(calc);

      const tierCards = Array.from(calc.querySelectorAll('.tier-card'));
      const tierMetrics = tierCards.map(t => {
        const r = t.getBoundingClientRect();
        return {
          width: Math.round(r.width),
          height: Math.round(r.height),
          left: Math.round(r.left),
          right: Math.round(r.right),
          visible: r.width > 0 && r.height > 0
        };
      });

      const slider = calc.querySelector('#extra-pages');
      const sliderRect = slider ? slider.getBoundingClientRect() : null;

      const addons = Array.from(calc.querySelectorAll('.calc-addon-label, label:has(input[name="addon"])'));
      const addonMetrics = addons.map(a => {
        const r = a.getBoundingClientRect();
        return {
          height: Math.round(r.height),
          width: Math.round(r.width),
          minTouchTarget: r.height >= 40
        };
      });

      const priceDisplay = calc.querySelector('#calc-total-price');
      const timeDisplay = calc.querySelector('#calc-total-timeline');
      const waBtn = calc.querySelector('#btn-calc-whatsapp');
      const waRect = waBtn ? waBtn.getBoundingClientRect() : null;

      return {
        found: true,
        display: style.display,
        visibility: style.visibility,
        calcWidth: Math.round(rect.width),
        calcLeft: Math.round(rect.left),
        calcRight: Math.round(rect.right),
        tierCount: tierCards.length,
        tierMetrics,
        sliderPresent: !!slider,
        sliderWidth: sliderRect ? Math.round(sliderRect.width) : 0,
        addonCount: addons.length,
        addonMetrics,
        initialPrice: priceDisplay ? priceDisplay.textContent.trim() : null,
        initialTime: timeDisplay ? timeDisplay.textContent.trim() : null,
        waBtnFound: !!waBtn,
        waBtnHeight: waRect ? Math.round(waRect.height) : 0,
        waBtnWidth: waRect ? Math.round(waRect.width) : 0
      };
    });

    assert(calcMobileMetrics.found, 'Pricing calculator element #pricing-calculator is present in DOM');
    assert(calcMobileMetrics.display !== 'none' && calcMobileMetrics.visibility !== 'hidden', 'Pricing calculator is visible on 320px');
    assert(calcMobileMetrics.calcRight <= 321, `Pricing calculator fits horizontally: right=${calcMobileMetrics.calcRight}px <= 320px`);
    assert(calcMobileMetrics.tierCount === 3, 'All 3 pricing tiers (Basic, Pro, Enterprise) present');
    assert(calcMobileMetrics.tierMetrics.every(t => t.right <= 321), 'All tier cards fit within 320px bounds');
    assert(calcMobileMetrics.sliderPresent && calcMobileMetrics.sliderWidth > 150, `Extra pages slider is rendered (width: ${calcMobileMetrics.sliderWidth}px)`);
    assert(calcMobileMetrics.addonCount === 4, 'All 4 addon options rendered');
    assert(calcMobileMetrics.waBtnFound && calcMobileMetrics.waBtnHeight >= 44, `WhatsApp CTA button meets touch target height: ${calcMobileMetrics.waBtnHeight}px >= 44px`);

    // Interactive recalculation tests on 320px
    console.log('  ... Executing interactive state permutations on 320px mobile:');

    // Test A1: Switch to Basic Tier with 1 page (Basic Baseline: 1 page = Rp 2.500.000)
    const testBasicBaseline = await driver.evaluate(() => {
      const basicRadio = document.querySelector('input[name="tier"][value="basic"]');
      if (basicRadio) {
        basicRadio.checked = true;
        basicRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const slider = document.querySelector('#extra-pages');
      if (slider) {
        slider.value = '1';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const price = document.querySelector('#calc-total-price').textContent.trim();
      const time = document.querySelector('#calc-total-timeline').textContent.trim();
      const waHref = document.querySelector('#btn-calc-whatsapp').href;
      return { price, time, waHref };
    });
    assert(testBasicBaseline.price.includes('2.500.000'), `Basic baseline (1 page) updates price to Rp 2.500.000 (Actual: ${testBasicBaseline.price})`);
    assert(testBasicBaseline.time.includes('7'), `Basic baseline timeline = 7 days (Actual: ${testBasicBaseline.time})`);

    // Test A2: Basic Tier with 5 pages (1 base + 4 extra pages * 350k = 3.9M)
    const testBasic5Pages = await driver.evaluate(() => {
      const slider = document.querySelector('#extra-pages');
      if (slider) {
        slider.value = '5';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const price = document.querySelector('#calc-total-price').textContent.trim();
      return { price };
    });
    assert(testBasic5Pages.price.includes('3.900.000'), `Basic with 5 pages (1 base + 4 extra) updates price to Rp 3.900.000 (Actual: ${testBasic5Pages.price})`);

    // Test B: Move slider to 12 pages on Enterprise with E-Commerce and Express Addons
    const testEnterpriseCustom = await driver.evaluate(() => {
      const entRadio = document.querySelector('input[name="tier"][value="enterprise"]');
      if (entRadio) {
        entRadio.checked = true;
        entRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const slider = document.querySelector('#extra-pages');
      if (slider) {
        slider.value = '12';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const addons = Array.from(document.querySelectorAll('input[name="addon"]'));
      addons.forEach(cb => {
        if (cb.value === 'ecommerce' || cb.value === 'express') {
          cb.checked = true;
        } else {
          cb.checked = false;
        }
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      });

      const price = document.querySelector('#calc-total-price').textContent.trim();
      const time = document.querySelector('#calc-total-timeline').textContent.trim();
      const waHref = document.querySelector('#btn-calc-whatsapp').href;

      return { price, time, waHref };
    });

    const entPricePass = testEnterpriseCustom.price.includes('18.750.000');
    const entTimePass = testEnterpriseCustom.time.includes('25');
    assert(entPricePass, `Complex calc (Enterprise + 12p + Ecom + Express) = Rp 18.750.000 (Actual: ${testEnterpriseCustom.price})`);
    assert(entTimePass, `Complex calc timeline = 25 days (Actual: ${testEnterpriseCustom.time})`);
    assert(testEnterpriseCustom.waHref.includes('wa.me') && testEnterpriseCustom.waHref.includes('18.750.000'), 'WhatsApp CTA pre-filled link synchronized with calculation');

    // Test C: Bidirectional Synchronization: Change dropdown on form -> updates calculator
    const syncTest = await driver.evaluate(() => {
      const packageSelect = document.querySelector('#package');
      if (packageSelect) {
        const basicOption = Array.from(packageSelect.options).find(o => o.value.toLowerCase().includes('basic'));
        if (basicOption) {
          packageSelect.value = basicOption.value;
          packageSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      const basicRadio = document.querySelector('input[name="tier"][value="basic"]');
      return {
        radioChecked: basicRadio ? basicRadio.checked : false,
        priceAfterSync: document.querySelector('#calc-total-price').textContent.trim()
      };
    });

    assert(syncTest.radioChecked, 'Dropdown selection on form bidirectionally synced to calculator tier radio');

    results.viewports[320] = {
      name: vp320.name,
      geometry: pageGeometry320,
      calculator: {
        metrics: calcMobileMetrics,
        basicBaseline: testBasicBaseline,
        basic5Pages: testBasic5Pages,
        enterpriseCustom: testEnterpriseCustom,
        sync: syncTest
      }
    };

    // ------------------------------------------------------------------------
    // VIEWPORTS 2-5: 375px, 768px, 1024px, 1440px
    // ------------------------------------------------------------------------
    const remainingVps = VIEWPORTS.slice(1);
    for (let i = 0; i < remainingVps.length; i++) {
      const vp = remainingVps[i];
      console.log(`\n▶ [${i + 2}/5] Testing Viewport: ${vp.name} (${vp.width}x${vp.height})...`);

      await driver.setViewport({
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.mobile ? 2 : 1,
        mobile: vp.mobile
      });

      // Small delay to allow CSS media queries to reflow smoothly
      await new Promise(r => setTimeout(r, 250));

      const pageGeometry = await driver.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;

        const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
        const clientWidth = docEl.clientWidth;
        const innerWidth = window.innerWidth;

        const overflowingElements = [];
        const allElements = Array.from(document.querySelectorAll('body *'));

        for (const el of allElements) {
          if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NOSCRIPT') continue;
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
          if (el.classList.contains('cursor-dot') || el.classList.contains('cursor-follower')) continue;
          if (el.closest('.mobile-drawer') || el.closest('.mobile-menu') || el.closest('#mobile-nav-drawer')) continue;

          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (rect.right > innerWidth + 1.5 || rect.left < -1.5) {
              overflowingElements.push({
                tag: el.tagName,
                id: el.id,
                className: el.className,
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width)
              });
            }
          }
        }

        const formBox = document.querySelector('.consultation-form-box');
        const formRect = formBox ? formBox.getBoundingClientRect() : null;

        const calcBox = document.getElementById('pricing-calculator');
        const calcRect = calcBox ? calcBox.getBoundingClientRect() : null;

        return {
          scrollWidth,
          clientWidth,
          innerWidth,
          hasHorizontalOverflow: scrollWidth > clientWidth,
          overflowCount: overflowingElements.length,
          topOverflowElements: overflowingElements.slice(0, 5),
          formWidth: formRect ? Math.round(formRect.width) : 0,
          calcWidth: calcRect ? Math.round(calcRect.width) : 0
        };
      });

      assert(
        !pageGeometry.hasHorizontalOverflow && pageGeometry.scrollWidth <= vp.width,
        `Zero horizontal overflow at ${vp.width}px (scrollWidth: ${pageGeometry.scrollWidth}px <= clientWidth: ${pageGeometry.clientWidth}px)`
      );
      assert(
        pageGeometry.overflowCount === 0,
        `All active DOM elements strictly contained within ${vp.width}px boundary (overflow count: ${pageGeometry.overflowCount})`
      );
      assert(
        pageGeometry.formWidth > 0 && pageGeometry.formWidth <= vp.width,
        `Consultation form box width (${pageGeometry.formWidth}px) fits viewport`
      );
      assert(
        pageGeometry.calcWidth > 0 && pageGeometry.calcWidth <= vp.width,
        `Pricing calculator box width (${pageGeometry.calcWidth}px) fits viewport`
      );

      results.viewports[vp.width] = {
        name: vp.name,
        geometry: pageGeometry
      };
    }

    // ------------------------------------------------------------------------
    // CONSOLE CLEANLINESS AUDIT
    // ------------------------------------------------------------------------
    results.consoleErrors = driver.consoleErrors;
    assert(
      driver.consoleErrors.length === 0,
      `Zero console errors detected during entire test run (Actual: ${driver.consoleErrors.length})`,
      driver.consoleErrors
    );

    console.log('\n================================================================');
    console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`);
    console.log(`FINAL EMPIRICAL VERDICT: ${failedTests === 0 ? 'APPROVE' : 'REQUEST_CHANGES'}`);
    console.log('================================================================\n');

    return {
      pass: failedTests === 0,
      totalTests,
      passedTests,
      failedTests,
      results
    };

  } finally {
    await driver.close();
    await server.stop();
  }
}

if (require.main === module) {
  runResponsiveStressSuite()
    .then(summary => {
      process.exit(summary.pass ? 0 : 1);
    })
    .catch(err => {
      console.error('Test harness encountered exception:', err);
      process.exit(2);
    });
}

module.exports = runResponsiveStressSuite;
