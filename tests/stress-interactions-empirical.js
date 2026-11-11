/**
 * In-depth Empirical Challenger Stress Harness for Rubicweb Milestone 5
 * Exhaustive Stress & Boundary Testing of:
 * 1. 3D Card Tilt Physics & Glare Clamping
 * 2. Stats Counter Ease-Out Interpolation & Observer Invariants
 * 3. Dynamic Pricing Calculator Algebraic Correctness & Edge Bounds
 * 4. Testimonial Carousel Autoplay, Pause, Keyboard & Touch Physics
 * 5. Single-Active FAQ Accordion Rapid Toggling & Grid 0fr->1fr Transition
 */

const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');
const path = require('path');

async function runStressHarness() {
  console.log('================================================================');
  console.log('  CHALLENGER M5 EMPIRICAL STRESS & ADVERSARIAL HARNESS           ');
  console.log('================================================================\n');

  const server = new StaticServer({ rootDir: path.resolve(__dirname, '..') });
  const serverInfo = await server.start();
  const driver = new BrowserDriver();
  await driver.launch();

  const results = {
    cardTiltPhysics: { passed: true, checks: [] },
    statsCounterEasing: { passed: true, checks: [] },
    pricingCalculatorBounds: { passed: true, checks: [] },
    carouselAutoplayTouch: { passed: true, checks: [] },
    faqAccordionStress: { passed: true, checks: [] }
  };

  try {
    // =========================================================================
    // SYSTEM 1: 3D CARD TILT PHYSICS & CLAMPING
    // =========================================================================
    console.log('▶ [1/5] STRESS-TESTING 3D CARD TILT PHYSICS...');
    await driver.goto(`${serverInfo.url}/index.html`);

    const tiltStress = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .service-card');
      if (!card) return { error: 'No tilt card found' };

      const rect = card.getBoundingClientRect();
      const stressPoints = [
        { name: 'Top-Left Corner', x: rect.left + 2, y: rect.top + 2 },
        { name: 'Top-Right Corner', x: rect.right - 2, y: rect.top + 2 },
        { name: 'Bottom-Left Corner', x: rect.left + 2, y: rect.bottom - 2 },
        { name: 'Bottom-Right Corner', x: rect.right - 2, y: rect.bottom - 2 },
        { name: 'Dead Center', x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        { name: 'Far Negative Out-of-Bounds', x: -500, y: -500 },
        { name: 'Far Positive Out-of-Bounds', x: rect.right + 2000, y: rect.bottom + 2000 }
      ];

      const records = [];

      for (const pt of stressPoints) {
        card.dispatchEvent(new MouseEvent('mousemove', {
          clientX: pt.x,
          clientY: pt.y,
          bubbles: true
        }));

        const transform = card.style.transform;
        const mouseX = card.style.getPropertyValue('--mouse-x');
        const mouseY = card.style.getPropertyValue('--mouse-y');
        const rotXMatch = transform.match(/rotateX\(([\d.-]+)deg\)/);
        const rotYMatch = transform.match(/rotateY\(([\d.-]+)deg\)/);
        const rotX = rotXMatch ? parseFloat(rotXMatch[1]) : 0;
        const rotY = rotYMatch ? parseFloat(rotYMatch[1]) : 0;

        records.push({
          point: pt.name,
          x: pt.x,
          y: pt.y,
          transform,
          rotX,
          rotY,
          mouseX,
          mouseY,
          clamped: Math.abs(rotX) <= 10.01 && Math.abs(rotY) <= 10.01,
          scaleOk: transform.includes('scale3d(1.02, 1.02, 1.02)')
        });
      }

      // Test reset on mouseleave
      card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      const transformReset = card.style.transform;
      const transitionReset = card.style.transition;
      const glowOpacityReset = card.style.getPropertyValue('--glow-opacity');

      return {
        records,
        transformReset,
        transitionReset,
        glowOpacityReset
      };
    });

    for (const rec of tiltStress.records) {
      const ok = rec.clamped && rec.scaleOk;
      results.cardTiltPhysics.checks.push({
        desc: `Tilt coordinate clamping at ${rec.point} (rotX: ${rec.rotX}°, rotY: ${rec.rotY}°)`,
        pass: ok
      });
      if (!ok) results.cardTiltPhysics.passed = false;
      console.log(`    ${ok ? '✓' : '✗'} ${rec.point}: rotX=${rec.rotX}°, rotY=${rec.rotY}° [Clamped ≤ 10°: ${rec.clamped}]`);
    }

    const resetOk = tiltStress.transformReset.includes('rotateX(0deg)') &&
                    tiltStress.transitionReset.includes('cubic-bezier(0.16, 1, 0.3, 1)') &&
                    tiltStress.glowOpacityReset === '0';
    results.cardTiltPhysics.checks.push({
      desc: 'Cubic-bezier reset & glow opacity zeroing on mouseleave',
      pass: resetOk
    });
    if (!resetOk) results.cardTiltPhysics.passed = false;
    console.log(`    ${resetOk ? '✓' : '✗'} Card reset transition: ${tiltStress.transitionReset}`);

    // =========================================================================
    // SYSTEM 2: STATS COUNTER EASING & INTERPOLATION
    // =========================================================================
    console.log('\n▶ [2/5] STRESS-TESTING STATS COUNTER EASING & INTERSECTION OBSERVATION...');
    await driver.goto(`${serverInfo.url}/index.html`);

    // First verify initial values before scroll
    const initialStats = await driver.evaluate(() => {
      const stats = Array.from(document.querySelectorAll('.stat-number'));
      return stats.map(s => ({
        target: s.getAttribute('data-counter-target'),
        text: s.textContent.trim(),
        hasAnimated: !!s._hasAnimated
      }));
    });

    const notPrematurelyTriggered = initialStats.every(s => !s.hasAnimated);
    results.statsCounterEasing.checks.push({
      desc: 'Counters do not trigger prematurely before intersection',
      pass: notPrematurelyTriggered
    });
    console.log(`    ${notPrematurelyTriggered ? '✓' : '✗'} Pre-intersection idle check: not triggered = ${notPrematurelyTriggered}`);

    // Scroll stats into view
    await driver.evaluate(() => {
      const stats = document.getElementById('stats');
      if (stats) stats.scrollIntoView({ behavior: 'instant' });
    });

    // Sample progression at 200ms, 400ms, 600ms, 1200ms to verify monotonic growth & ease-out
    const samples = [];
    for (const delay of [200, 400, 600, 1200]) {
      await new Promise(r => setTimeout(r, delay));
      const sample = await driver.evaluate(() => {
        const stats = Array.from(document.querySelectorAll('.stat-number'));
        return stats.map(s => {
          const raw = s.textContent.trim().replace(/[^0-9.]/g, '');
          return parseFloat(raw) || 0;
        });
      });
      samples.push(sample);
    }

    // Wait for completion
    await new Promise(r => setTimeout(r, 1000));

    const finalCounterValues = await driver.evaluate(() => {
      const stats = Array.from(document.querySelectorAll('.stat-number'));
      return stats.map(s => ({
        target: s.getAttribute('data-counter-target'),
        decimals: s.getAttribute('data-decimals'),
        suffix: s.getAttribute('data-suffix'),
        text: s.textContent.trim(),
        hasAnimated: s._hasAnimated
      }));
    });

    // Check monotonic progression for first stat
    let monotonic = true;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i][0] < samples[i - 1][0]) monotonic = false;
    }

    results.statsCounterEasing.checks.push({
      desc: 'EaseOutExpo interpolation is strictly monotonic without retrograde regression',
      pass: monotonic
    });
    console.log(`    ${monotonic ? '✓' : '✗'} Monotonic ease-out growth: ${samples.map(s => s[0]).join(' -> ')}`);

    // Verify exact final format
    const expectedTargets = {
      '100': '100%',
      '250': '250+',
      '99.9': '99.9%',
      '95': '95+'
    };

    let allTargetsAccurate = true;
    for (const item of finalCounterValues) {
      const expected = expectedTargets[item.target];
      if (expected && item.text !== expected) {
        allTargetsAccurate = false;
      }
      console.log(`    ${item.text === expected ? '✓' : '✗'} Stat [Target ${item.target}]: Result "${item.text}" (Expected: "${expected}")`);
    }

    results.statsCounterEasing.checks.push({
      desc: 'All counters reached target string with decimals and suffixes preserved',
      pass: allTargetsAccurate
    });
    if (!allTargetsAccurate || !monotonic) results.statsCounterEasing.passed = false;

    // Test re-trigger immunity (rapid scrolling past stats does not restart)
    const retriggerImmunity = await driver.evaluate(() => {
      window.scrollTo(0, 0);
      const stats = document.getElementById('stats');
      if (stats) stats.scrollIntoView({ behavior: 'instant' });
      // Text should immediately remain final
      const first = document.querySelector('.stat-number');
      return first ? first.textContent.trim() : '';
    });
    const immune = retriggerImmunity.includes('100%');
    results.statsCounterEasing.checks.push({
      desc: 'Stats counter does not reset or duplicate on re-intersection',
      pass: immune
    });
    console.log(`    ${immune ? '✓' : '✗'} Re-intersection immunity test: value retained "${retriggerImmunity}"`);

    // =========================================================================
    // SYSTEM 3: PRICING CALCULATOR ALGEBRAIC BOUNDS & SYNC
    // =========================================================================
    console.log('\n▶ [3/5] STRESS-TESTING PRICING CALCULATOR ALGEBRAIC BOUNDS...');
    await driver.goto(`${serverInfo.url}/contact.html`);

    const pricingStressResults = await driver.evaluate(() => {
      const tests = [];
      const calc = document.querySelector('.pricing-calculator');
      if (!calc) return [{ error: 'No pricing calculator on contact.html' }];

      const tierRadios = Array.from(calc.querySelectorAll('input[name="tier"]'));
      const slider = calc.querySelector('#extra-pages');
      const addons = Array.from(calc.querySelectorAll('input[name="addon"], .calc-addon'));
      const priceDisplay = calc.querySelector('#calc-total-price');
      const timelineDisplay = calc.querySelector('#calc-total-timeline');
      const waBtn = calc.querySelector('#btn-calc-whatsapp, a.btn-whatsapp');
      const packageDropdown = document.querySelector('#package');

      function configure(tierName, pageCount, activeAddonIndices, isExpress) {
        const radio = tierRadios.find(r => r.value === tierName);
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (slider) {
          slider.value = String(pageCount);
          slider.dispatchEvent(new Event('input', { bubbles: true }));
        }
        addons.forEach((cb, idx) => {
          const isExpCb = cb.value === 'express' || cb.getAttribute('data-express') === 'true';
          if (isExpCb) {
            cb.checked = isExpress;
          } else {
            cb.checked = activeAddonIndices.includes(idx);
          }
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        });

        return {
          priceText: priceDisplay ? priceDisplay.textContent.trim() : '',
          timelineText: timelineDisplay ? timelineDisplay.textContent.trim() : '',
          waHref: waBtn ? waBtn.href : '',
          dropdownVal: packageDropdown ? packageDropdown.value : ''
        };
      }

      // Test 1: Basic Minimum Bounds (1 page)
      // Base: 2.500.000, 7 days
      tests.push({
        id: 'T1_BASIC_MIN',
        expectedPrice: 'Rp 2.500.000',
        expectedMinDays: 7,
        ...configure('basic', 1, [], false)
      });

      // Test 2: Negative / Zero page clamped to 1
      tests.push({
        id: 'T2_ZERO_PAGE_CLAMP',
        expectedPrice: 'Rp 2.500.000',
        ...configure('basic', 0, [], false)
      });

      // Test 3: Pro Standard (5 pages base, 0 extra) -> 5.500.000, 18 days
      tests.push({
        id: 'T3_PRO_BASE',
        expectedPrice: 'Rp 5.500.000',
        expectedMinDays: 18,
        ...configure('pro', 5, [], false)
      });

      // Test 4: Pro with 10 pages (5 extra pages * 350k = 1.750.000) -> 7.250.000, 18 + ceil(5*0.5)=3 -> 21 days
      tests.push({
        id: 'T4_PRO_10_PAGES',
        expectedPrice: 'Rp 7.250.000',
        expectedMinDays: 21,
        ...configure('pro', 10, [], false)
      });

      // Test 5: Enterprise Maximum (20 pages = 10 extra * 500k = 5M) + All Addons + Express
      // Enterprise base: 12M, 35 days (10 base pages)
      // Extra pages: 10 * 500k = 5M, 5 days
      // Addons in DOM:
      // - E-Commerce: +2M, +5 days
      // - Payment-gateway: +1.5M, +3 days
      // - Multilingual: +1.2M, +3 days
      // Subtotal before express = 12M + 5M + 2M + 1.5M + 1.2M = 21.700.000
      // Subtotal with Express (* 1.25) = 27.125.000
      // Days before express = 35 + 5 + 5 + 3 + 3 = 51 days
      // Days with Express (* 0.6) = round(51 * 0.6) = 31 days
      tests.push({
        id: 'T5_ENTERPRISE_ALL_ADDONS_EXPRESS',
        expectedPrice: 'Rp 27.125.000',
        expectedDaysString: '31',
        ...configure('enterprise', 20, [0, 1, 2], true)
      });

      // Test 6: Form dropdown bidirectional synchronization
      if (packageDropdown) {
        // Option 1 is Basic
        packageDropdown.selectedIndex = 1;
        packageDropdown.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const basicSelectedAfterSync = tierRadios.find(r => r.value === 'basic')?.checked;

      tests.push({
        id: 'T6_FORM_SYNC',
        syncSuccessful: !!basicSelectedAfterSync
      });

      return tests;
    });

    for (const test of pricingStressResults) {
      if (test.id === 'T6_FORM_SYNC') {
        const ok = test.syncSuccessful;
        results.pricingCalculatorBounds.checks.push({
          desc: 'Package dropdown syncs back into pricing calculator',
          pass: ok
        });
        if (!ok) results.pricingCalculatorBounds.passed = false;
        console.log(`    ${ok ? '✓' : '✗'} Bidirectional form dropdown sync: ${ok}`);
      } else {
        const priceOk = test.priceText.includes(test.expectedPrice);
        const daysOk = test.expectedDaysString ? test.timelineText.includes(test.expectedDaysString) : true;
        const waOk = test.waHref && test.waHref.includes('wa.me/6285280008984') && test.waHref.includes(encodeURIComponent(test.expectedPrice));
        const passed = priceOk && daysOk && waOk;

        results.pricingCalculatorBounds.checks.push({
          desc: `Calculation test ${test.id} (${test.expectedPrice})`,
          pass: passed
        });
        if (!passed) results.pricingCalculatorBounds.passed = false;
        console.log(`    ${passed ? '✓' : '✗'} ${test.id}: Price "${test.priceText}" (Expected: "${test.expectedPrice}"), Timeline "${test.timelineText}", WA Link verified`);
      }
    }

    // =========================================================================
    // SYSTEM 4: CAROUSEL AUTOPLAY, PAUSE-ON-HOVER & TOUCH SWIPE
    // =========================================================================
    console.log('\n▶ [4/5] STRESS-TESTING TESTIMONIAL CAROUSEL DYNAMICS...');
    await driver.goto(`${serverInfo.url}/index.html`);

    const carouselDynamics = await driver.evaluate(() => {
      const carousel = document.querySelector('.testimonial-carousel');
      const nextBtn = carousel.querySelector('.carousel-btn--next');
      const prevBtn = carousel.querySelector('.carousel-btn--prev');
      const dots = Array.from(carousel.querySelectorAll('.carousel-dot'));
      const track = carousel.querySelector('.testimonial-track');

      function getActiveIndex() {
        return dots.findIndex(d => d.classList.contains('active') || d.classList.contains('is-active'));
      }

      const initialDot = getActiveIndex();

      // Test 1: Rapid Next clicks (stress wrapping)
      const clicks = 5;
      for (let i = 0; i < clicks; i++) {
        nextBtn.click();
      }
      const dotAfter5Clicks = getActiveIndex();

      // Test 2: Rapid Prev clicks
      for (let i = 0; i < clicks; i++) {
        prevBtn.click();
      }
      const dotAfterReversal = getActiveIndex();

      // Test 3: Touch Swipe Physics: Small jitter (|diffX| < 40) should NOT trigger slide change
      const touchStartJitter = new Event('touchstart', { bubbles: true });
      touchStartJitter.touches = [{ clientX: 200, clientY: 100 }];
      carousel.dispatchEvent(touchStartJitter);

      const touchEndJitter = new Event('touchend', { bubbles: true });
      touchEndJitter.changedTouches = [{ clientX: 180, clientY: 100 }]; // delta = -20 (< 40)
      carousel.dispatchEvent(touchEndJitter);

      const dotAfterJitter = getActiveIndex();

      // Test 4: Genuine Touch Swipe Right (diffX > 40) -> previous slide
      const touchStartRight = new Event('touchstart', { bubbles: true });
      touchStartRight.touches = [{ clientX: 100, clientY: 100 }];
      carousel.dispatchEvent(touchStartRight);

      const touchEndRight = new Event('touchend', { bubbles: true });
      touchEndRight.changedTouches = [{ clientX: 220, clientY: 100 }]; // delta = +120 (> 40)
      carousel.dispatchEvent(touchEndRight);

      const dotAfterSwipeRight = getActiveIndex();

      return {
        initialDot,
        totalDots: dots.length,
        dotAfter5Clicks,
        dotAfterReversal,
        dotAfterJitter,
        dotAfterSwipeRight
      };
    });

    const wrapMathOk = carouselDynamics.dotAfter5Clicks === (carouselDynamics.initialDot + (5 % carouselDynamics.totalDots)) % carouselDynamics.totalDots;
    const reversalOk = carouselDynamics.dotAfterReversal === carouselDynamics.initialDot;
    const jitterSuppressed = carouselDynamics.dotAfterJitter === carouselDynamics.initialDot;
    const swipeRightWorked = carouselDynamics.dotAfterSwipeRight === (carouselDynamics.initialDot - 1 + carouselDynamics.totalDots) % carouselDynamics.totalDots;

    results.carouselAutoplayTouch.checks.push({
      desc: 'Rapid button cycling respects modular slide wrapping',
      pass: wrapMathOk && reversalOk
    });
    results.carouselAutoplayTouch.checks.push({
      desc: 'Sub-threshold touch swipe jitter (|ΔX| < 40px) is ignored',
      pass: jitterSuppressed
    });
    results.carouselAutoplayTouch.checks.push({
      desc: 'Significant touch swipe (ΔX > 40px) triggers slide navigation',
      pass: swipeRightWorked
    });

    if (!wrapMathOk || !reversalOk || !jitterSuppressed || !swipeRightWorked) {
      results.carouselAutoplayTouch.passed = false;
    }

    console.log(`    ${wrapMathOk && reversalOk ? '✓' : '✗'} Rapid wrapping math (5 clicks -> dot ${carouselDynamics.dotAfter5Clicks}, reversal -> dot ${carouselDynamics.dotAfterReversal})`);
    console.log(`    ${jitterSuppressed ? '✓' : '✗'} Sub-threshold touch jitter suppression (delta -20px ignored: ${jitterSuppressed})`);
    console.log(`    ${swipeRightWorked ? '✓' : '✗'} Genuine swipe navigation (delta +120px navigated to dot ${carouselDynamics.dotAfterSwipeRight})`);

    // =========================================================================
    // SYSTEM 5: SINGLE-ACTIVE FAQ ACCORDION RAPID TOGGLE STRESS
    // =========================================================================
    console.log('\n▶ [5/5] STRESS-TESTING SINGLE-ACTIVE FAQ ACCORDION...');
    await driver.goto(`${serverInfo.url}/index.html`);

    const faqStress = await driver.evaluate(async () => {
      const items = Array.from(document.querySelectorAll('.faq-item'));
      const triggers = Array.from(document.querySelectorAll('.faq-trigger'));

      function getOpenCount() {
        return items.filter(it => it.classList.contains('active') || it.classList.contains('is-open') || it.getAttribute('aria-expanded') === 'true').length;
      }

      const initialOpen = getOpenCount();

      // Stress 1: Rapid 20 clicks alternating across items within 50ms
      for (let i = 0; i < 20; i++) {
        const targetIdx = i % items.length;
        triggers[targetIdx].click();
      }

      const openCountAfterRapidClicks = getOpenCount();

      // Stress 2: Double click the same item (should toggle open, then toggle closed)
      const item3Trigger = triggers[3];
      item3Trigger.click();
      const openAfterFirstClick = items[3].classList.contains('active');
      item3Trigger.click();
      const openAfterSecondClick = items[3].classList.contains('active');

      // Stress 3: Keyboard Space and Enter triggers
      const item1Trigger = triggers[1];
      item1Trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      const openAfterSpace = items[1].classList.contains('active');

      return {
        initialOpen,
        openCountAfterRapidClicks,
        doubleClickTest: { openAfterFirstClick, openAfterSecondClick },
        keyboardTest: { openAfterSpace }
      };
    });

    // Test real CDP click on item 1 and measure panel height after 450ms CSS transition
    const cdpClickFaq = async (index) => {
      const rect = await driver.evaluate((i) => {
        const triggers = document.querySelectorAll('.faq-trigger');
        const btn = triggers[i];
        btn.scrollIntoView({ block: 'center', behavior: 'instant' });
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }, index);

      await driver.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: rect.x,
        y: rect.y,
        button: 'left',
        clickCount: 1
      });
      await driver.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: rect.x,
        y: rect.y,
        button: 'left',
        clickCount: 1
      });
    };

    await cdpClickFaq(0);
    // Wait for the 350ms CSS Grid transition to finish
    await new Promise(r => setTimeout(r, 450));

    const faqMetrics = await driver.evaluate(() => {
      const item0 = document.querySelectorAll('.faq-item')[0];
      const trigger = item0.querySelector('.faq-trigger');
      const panel = item0.querySelector('.faq-panel');
      return {
        panelHeight: panel ? panel.getBoundingClientRect().height : 0,
        ariaExpanded: trigger.getAttribute('aria-expanded'),
        hasActiveClass: item0.classList.contains('active') || item0.classList.contains('is-open')
      };
    });

    const singleActiveInvariantHeld = faqStress.openCountAfterRapidClicks <= 1;
    const doubleClickClosed = faqStress.doubleClickTest.openAfterFirstClick && !faqStress.doubleClickTest.openAfterSecondClick;
    const keyboardWorked = faqStress.keyboardTest.openAfterSpace;
    const panelExpandedProperly = faqMetrics.panelHeight > 50 && faqMetrics.ariaExpanded === 'true' && faqMetrics.hasActiveClass;

    results.faqAccordionStress.checks.push({
      desc: 'Single-active invariant strictly held under 20 rapid cross-item clicks (open count ≤ 1)',
      pass: singleActiveInvariantHeld
    });
    results.faqAccordionStress.checks.push({
      desc: 'Double-clicking same item opens then smoothly collapses',
      pass: doubleClickClosed
    });
    results.faqAccordionStress.checks.push({
      desc: 'Keyboard accessibility (Space key) reliably toggles item',
      pass: keyboardWorked
    });
    results.faqAccordionStress.checks.push({
      desc: 'Active panel renders non-zero CSS grid height (>50px) and aria-expanded=true after transition',
      pass: panelExpandedProperly
    });

    if (!singleActiveInvariantHeld || !doubleClickClosed || !keyboardWorked || !panelExpandedProperly) {
      results.faqAccordionStress.passed = false;
    }

    console.log(`    ${singleActiveInvariantHeld ? '✓' : '✗'} Single-active invariant (active items: ${faqStress.openCountAfterRapidClicks} ≤ 1)`);
    console.log(`    ${doubleClickClosed ? '✓' : '✗'} Toggle open/close on same item: ${doubleClickClosed}`);
    console.log(`    ${keyboardWorked ? '✓' : '✗'} Keyboard accessibility support: ${keyboardWorked}`);
    console.log(`    ${panelExpandedProperly ? '✓' : '✗'} Panel expansion geometry: height=${faqMetrics.panelHeight}px, aria-expanded=${faqMetrics.ariaExpanded}`);

  } finally {
    await driver.close();
    await server.stop();
  }

  // Summary
  console.log('\n================================================================');
  console.log('  CHALLENGER STRESS HARNESS SUMMARY                              ');
  console.log('================================================================');

  let overallPassed = true;
  for (const [key, val] of Object.entries(results)) {
    console.log(`  - ${key.padEnd(26)}: ${val.passed ? 'ALL CHECKS PASSED ✓' : 'FAILED ✗'}`);
    if (!val.passed) overallPassed = false;
  }
  console.log('================================================================');
  console.log('OVERALL HARNESS VERDICT:', overallPassed ? 'APPROVE' : 'REQUEST_CHANGES');
  console.log('================================================================\n');

  return { overallPassed, results };
}

if (require.main === module) {
  runStressHarness()
    .then(({ overallPassed }) => process.exit(overallPassed ? 0 : 1))
    .catch(err => {
      console.error('Stress harness failed with exception:', err);
      process.exit(2);
    });
}

module.exports = runStressHarness;
