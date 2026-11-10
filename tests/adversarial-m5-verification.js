/**
 * Empirical Adversarial Verification Suite for Milestone 5
 * Tests all 6 interaction systems under stress, edge cases, and real CDP events.
 */

const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');
const path = require('path');

async function runAdversarialAudit() {
  console.log('====================================================');
  console.log('  MILESTONE 5: EMPIRICAL ADVERSARIAL STRESS SUITE   ');
  console.log('====================================================\n');

  const server = new StaticServer({ rootDir: path.resolve(__dirname, '..') });
  const serverInfo = await server.start();
  const driver = new BrowserDriver();
  await driver.launch();

  const auditReport = {
    timestamp: new Date().toISOString(),
    baseUrl: serverInfo.url,
    systems: {}
  };

  try {
    // ------------------------------------------------------------------------
    // 1. CUSTOM TRAILING CURSOR
    // ------------------------------------------------------------------------
    console.log('▶ [1/6] Testing Custom Trailing Cursor...');
    await driver.goto(`${serverInfo.url}/index.html`);

    const cursorData = await driver.evaluate(() => {
      const dot = document.querySelector('.cursor-dot');
      const follower = document.querySelector('.cursor-follower');

      // Dispatch mousemove to (200, 300)
      const moveEvent = new MouseEvent('mousemove', {
        clientX: 200,
        clientY: 300,
        bubbles: true
      });
      window.dispatchEvent(moveEvent);

      return {
        dotPresent: !!dot,
        followerPresent: !!follower,
        dotTransform: dot ? dot.style.transform : null,
        followerTransformInitial: follower ? follower.style.transform : null
      };
    });

    // Wait 600ms for LERP animation frames to fully converge
    await new Promise(r => setTimeout(r, 600));

    const cursorLerp = await driver.evaluate(() => {
      const follower = document.querySelector('.cursor-follower');
      const dot = document.querySelector('.cursor-dot');

      // Hover over interactive element
      const btn = document.querySelector('.btn--primary');
      const overEvent = new MouseEvent('mouseover', {
        target: btn,
        bubbles: true
      });
      btn.dispatchEvent(overEvent);

      const hasHoverClass = follower.classList.contains('cursor-hover') || document.body.classList.contains('cursor-hover');

      // Check coarse pointer media query simulation
      const coarseMediaMatches = window.matchMedia('(pointer: coarse)').matches;

      return {
        followerTransformAfterLerp: follower.style.transform,
        hasHoverClass,
        coarseMediaMatches
      };
    });

    // Check LERP convergence math: follower should be close to 200, 300
    const matchTransform = cursorLerp.followerTransformAfterLerp.match(/translate3d\(([\d.-]+)px,\s*([\d.-]+)px/);
    const fx = matchTransform ? parseFloat(matchTransform[1]) : 0;
    const fy = matchTransform ? parseFloat(matchTransform[2]) : 0;
    const lerpAccurate = Math.abs(fx - 200) < 5 && Math.abs(fy - 300) < 5;

    auditReport.systems.customCursor = {
      pass: cursorData.dotPresent && cursorData.followerPresent && lerpAccurate && cursorLerp.hasHoverClass,
      details: {
        dotPresent: cursorData.dotPresent,
        followerPresent: cursorData.followerPresent,
        dotTransform: cursorData.dotTransform,
        followerTransform: cursorLerp.followerTransformAfterLerp,
        lerpConvergedNear200_300: lerpAccurate,
        hoverExpansionClass: cursorLerp.hasHoverClass
      }
    };
    console.log(`  ✓ Cursor LERP (λ=0.16) converged to (${fx}, ${fy}) [Target: 200, 300]`);
    console.log(`  ✓ Hover expansion active: ${cursorLerp.hasHoverClass}`);

    // ------------------------------------------------------------------------
    // 2. 3D CARD TILT & RADIAL SPECULAR HIGHLIGHT
    // ------------------------------------------------------------------------
    console.log('\n▶ [2/6] Testing 3D Card Tilt & Radial Specular Highlight...');
    const tiltData = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .service-card');
      if (!card) return { cardFound: false };

      const rect = card.getBoundingClientRect();
      // Simulate cursor at bottom-right corner: x = rect.left + rect.width * 0.9, y = rect.top + rect.height * 0.9
      const mouseX = rect.left + rect.width * 0.9;
      const mouseY = rect.top + rect.height * 0.9;

      const moveEvt = new MouseEvent('mousemove', {
        clientX: mouseX,
        clientY: mouseY,
        bubbles: true
      });
      card.dispatchEvent(moveEvt);

      const transformActive = card.style.transform;
      const mouseXVar = card.style.getPropertyValue('--mouse-x');
      const mouseYVar = card.style.getPropertyValue('--mouse-y');
      const glowOpacity = card.style.getPropertyValue('--glow-opacity');

      // Now mouseleave
      const leaveEvt = new MouseEvent('mouseleave', { bubbles: true });
      card.dispatchEvent(leaveEvt);
      const transformLeave = card.style.transform;
      const transitionLeave = card.style.transition;

      return {
        cardFound: true,
        transformActive,
        mouseXVar,
        mouseYVar,
        glowOpacity,
        transformLeave,
        transitionLeave
      };
    });

    const rotMatch = tiltData.transformActive ? tiltData.transformActive.match(/rotateX\(([\d.-]+)deg\)\s+rotateY\(([\d.-]+)deg\)/) : null;
    const rotX = rotMatch ? parseFloat(rotMatch[1]) : 0;
    const rotY = rotMatch ? parseFloat(rotMatch[2]) : 0;
    // With cursor at bottom-right, normX ~ 0.8, normY ~ 0.8
    // rotX = -normY * 10 = -8 deg (clamped to <= 10 deg)
    // rotY = normX * 10 = +8 deg (clamped to <= 10 deg)
    const tiltClamped = Math.abs(rotX) <= 10 && Math.abs(rotY) <= 10 && rotX < 0 && rotY > 0;
    const resetCubic = tiltData.transitionLeave && tiltData.transitionLeave.includes('cubic-bezier(0.16, 1, 0.3, 1)');

    auditReport.systems.cardTilt = {
      pass: tiltData.cardFound && tiltClamped && resetCubic && tiltData.glowOpacity === '1',
      details: {
        transformActive: tiltData.transformActive,
        rotX,
        rotY,
        tiltClampedTo10Deg: tiltClamped,
        specularMouseX: tiltData.mouseXVar,
        specularMouseY: tiltData.mouseYVar,
        glowOpacityActive: tiltData.glowOpacity,
        resetCubicBezier: resetCubic
      }
    };
    console.log(`  ✓ 3D Tilt angles: rotX=${rotX}deg, rotY=${rotY}deg (clamped within ±10°)`);
    console.log(`  ✓ Specular highlight CSS vars: --mouse-x=${tiltData.mouseXVar}, --mouse-y=${tiltData.mouseYVar}`);
    console.log(`  ✓ Reset cubic-bezier transition: ${resetCubic}`);

    // ------------------------------------------------------------------------
    // 3. STATS COUNTER easeOutExpo & IntersectionObserver
    // ------------------------------------------------------------------------
    console.log('\n▶ [3/6] Testing Stats Counter easeOutExpo & Observer Thresholds...');
    // Scroll stats section into viewport
    await driver.evaluate(() => {
      const statsSection = document.getElementById('stats');
      if (statsSection) statsSection.scrollIntoView();
    });

    // Wait 500ms (quarter animation duration) to measure easeOutExpo progression
    await new Promise(r => setTimeout(r, 500));

    const midStats = await driver.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.stat-number'));
      return items.map(el => ({
        target: el.getAttribute('data-counter-target'),
        currentText: el.textContent.trim()
      }));
    });

    // Wait remaining 2600ms for full completion (total duration 2000ms + IO observer dispatch latency)
    await new Promise(r => setTimeout(r, 2600));

    const finalStats = await driver.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.stat-number'));
      return items.map(el => ({
        target: el.getAttribute('data-counter-target'),
        finalText: el.textContent.trim(),
        suffix: el.getAttribute('data-suffix') || ''
      }));
    });

    // Verify all targets reached with suffixes
    const allCountersReached = finalStats.every(s => {
      if (s.target === '100') return s.finalText === '100%';
      if (s.target === '250') return s.finalText === '250+';
      if (s.target === '99.9') return s.finalText === '99.9%';
      if (s.target === '95') return s.finalText === '95+';
      return true;
    });

    auditReport.systems.statsCounters = {
      pass: allCountersReached,
      details: {
        midValues: midStats,
        finalValues: finalStats,
        allReachedTargetWithSuffix: allCountersReached
      }
    };
    console.log(`  ✓ Stats counters final values: ${JSON.stringify(finalStats.map(f => f.finalText))}`);
    console.log(`  ✓ Target values with suffixes reached: ${allCountersReached}`);

    // ------------------------------------------------------------------------
    // 4. DYNAMIC PRICING ESTIMATOR CALCULATION BOUNDS & TIMELINE MATH
    // ------------------------------------------------------------------------
    console.log('\n▶ [4/6] Testing Dynamic Pricing Estimator Math & Bounds...');
    const pricingTests = await driver.evaluate(() => {
      const results = [];
      const calcSection = document.getElementById('pricing-calculator');
      const tierInputs = Array.from(calcSection.querySelectorAll('input[name="tier"]'));
      const slider = calcSection.querySelector('#extra-pages');
      const addons = Array.from(calcSection.querySelectorAll('input[name="addon"]'));
      const priceDisplay = calcSection.querySelector('#calc-total-price');
      const timeDisplay = calcSection.querySelector('#calc-total-timeline');
      const waBtn = calcSection.querySelector('#btn-calc-whatsapp');

      function setConfig(tierVal, pagesVal, addonIndices, expressVal) {
        const tRadio = tierInputs.find(t => t.value === tierVal);
        if (tRadio) {
          tRadio.checked = true;
          tRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (slider) {
          slider.value = String(pagesVal);
          slider.dispatchEvent(new Event('input', { bubbles: true }));
        }
        addons.forEach((cb, idx) => {
          const isExp = cb.value === 'express' || cb.getAttribute('data-express') === 'true';
          if (isExp) {
            cb.checked = !!expressVal;
          } else {
            cb.checked = addonIndices.includes(idx);
          }
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      // Case 1: Baseline Pro (5 pages, 0 addons, no express)
      setConfig('pro', 5, [], false);
      results.push({
        case: 'Pro baseline (5 pages)',
        price: priceDisplay.textContent,
        time: timeDisplay.textContent,
        wa: waBtn.href
      });

      // Case 2: Basic Tier (1 page, 0 addons, no express)
      setConfig('basic', 1, [], false);
      results.push({
        case: 'Basic baseline (1 page)',
        price: priceDisplay.textContent,
        time: timeDisplay.textContent,
        wa: waBtn.href
      });

      // Case 3: Enterprise Tier + 20 pages + E-Commerce addon (idx 0) + Express
      // Enterprise base: 12M, 35 days, 10 base pages, extraPage = 500k
      // 20 pages => 10 extra pages = 5M
      // E-Commerce addon => 2M, 5 days
      // Subtotal before express = 12M + 5M + 2M = 19M
      // Subtotal after express (+25%) = 19M * 1.25 = 23.750.000
      // Days before express = 35 + ceil(10 * 0.5) + 5 = 35 + 5 + 5 = 45 days
      // Days after express (* 0.6) = round(45 * 0.6) = 27 days
      setConfig('enterprise', 20, [0], true);
      results.push({
        case: 'Enterprise + 20 pages + E-Commerce + Express',
        price: priceDisplay.textContent,
        time: timeDisplay.textContent,
        wa: waBtn.href
      });

      // Case 4: Zero / negative boundary test
      setConfig('basic', 0, [], false);
      results.push({
        case: 'Zero pages input',
        price: priceDisplay.textContent,
        time: timeDisplay.textContent
      });

      return results;
    });

    const c1 = pricingTests[0];
    const c2 = pricingTests[1];
    const c3 = pricingTests[2];
    const c4 = pricingTests[3];

    const case1Pass = c1.price.includes('5.500.000');
    const case2Pass = c2.price.includes('2.500.000');
    const case3Pass = c3.price.includes('23.750.000') && c3.time.includes('27');
    const case4Pass = c4.price.includes('2.500.000'); // Did not drop below baseline 2.5M

    auditReport.systems.pricingEstimator = {
      pass: case1Pass && case2Pass && case3Pass && case4Pass,
      details: {
        case1ProBaseline: { expected: 'Rp 5.500.000', actual: c1.price, pass: case1Pass },
        case2BasicBaseline: { expected: 'Rp 2.500.000', actual: c2.price, pass: case2Pass },
        case3EnterpriseExpress: { expectedPrice: 'Rp 23.750.000', actualPrice: c3.price, expectedDays: '27', actualDays: c3.time, pass: case3Pass },
        case4ZeroPageBoundary: { expected: 'Rp 2.500.000', actual: c4.price, pass: case4Pass }
      }
    };
    console.log(`  ✓ Case 1 (Pro Baseline): ${c1.price} (Pass: ${case1Pass})`);
    console.log(`  ✓ Case 2 (Basic Baseline): ${c2.price} (Pass: ${case2Pass})`);
    console.log(`  ✓ Case 3 (Enterprise + 20p + Ecom + Express): ${c3.price}, ${c3.time} (Pass: ${case3Pass})`);
    console.log(`  ✓ Case 4 (Zero Pages Bound): ${c4.price} (Pass: ${case4Pass})`);

    // ------------------------------------------------------------------------
    // 5. TESTIMONIAL CAROUSEL AUTOPLAY & PAUSE ON HOVER/FOCUS
    // ------------------------------------------------------------------------
    console.log('\n▶ [5/6] Testing Testimonial Carousel Autoplay & Pause Controls...');
    const carouselInitial = await driver.evaluate(() => {
      const track = document.querySelector('.testimonial-track');
      const dots = Array.from(document.querySelectorAll('.carousel-dot'));
      const initialActiveDot = dots.findIndex(d => d.classList.contains('is-active') || d.classList.contains('active'));
      return {
        initialTransform: track ? track.style.transform : null,
        initialDot: initialActiveDot
      };
    });

    // Test next button click
    await driver.evaluate(() => {
      const nextBtn = document.querySelector('.carousel-btn--next');
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const carouselNextState = await driver.evaluate(() => {
      const track = document.querySelector('.testimonial-track');
      const dots = Array.from(document.querySelectorAll('.carousel-dot'));
      const activeDot = dots.findIndex(d => d.classList.contains('is-active') || d.classList.contains('active'));
      return {
        nextTransform: track ? track.style.transform : null,
        activeDot
      };
    });

    // Test pause on hover: mouseenter carousel container
    await driver.evaluate(() => {
      const container = document.querySelector('.testimonial-carousel');
      container.dispatchEvent(new MouseEvent('mouseenter'));
    });

    // Wait 5200ms (longer than autoplay interval 5000ms)
    console.log('  ... waiting 5.2s while hovered to verify autoplay pause');
    await new Promise(r => setTimeout(r, 5200));

    const carouselHoverState = await driver.evaluate(() => {
      const dots = Array.from(document.querySelectorAll('.carousel-dot'));
      const activeDot = dots.findIndex(d => d.classList.contains('is-active') || d.classList.contains('active'));
      return {
        activeDotDuringHover: activeDot
      };
    });

    // Test mouseleave to resume autoplay
    await driver.evaluate(() => {
      const container = document.querySelector('.testimonial-carousel');
      container.dispatchEvent(new MouseEvent('mouseleave'));
    });

    // Wait 5200ms for autoplay to advance
    console.log('  ... waiting 5.2s after unhovering to verify autoplay resume');
    await new Promise(r => setTimeout(r, 5200));

    const carouselResumedState = await driver.evaluate(() => {
      const dots = Array.from(document.querySelectorAll('.carousel-dot'));
      const activeDot = dots.findIndex(d => d.classList.contains('is-active') || d.classList.contains('active'));
      return {
        activeDotAfterResume: activeDot
      };
    });

    // Test touch swipe
    const touchSwipeResult = await driver.evaluate(() => {
      const container = document.querySelector('.testimonial-carousel');
      const dotsBefore = Array.from(document.querySelectorAll('.carousel-dot')).findIndex(d => d.classList.contains('active'));

      // Simulate left swipe (diffX < -40) -> should advance to next
      const touchStart = new Event('touchstart', { bubbles: true });
      touchStart.touches = [{ clientX: 200, clientY: 100 }];
      container.dispatchEvent(touchStart);

      const touchMove = new Event('touchmove', { bubbles: true });
      touchMove.touches = [{ clientX: 100, clientY: 100 }];
      container.dispatchEvent(touchMove);

      const touchEnd = new Event('touchend', { bubbles: true });
      touchEnd.changedTouches = [{ clientX: 100, clientY: 100 }];
      container.dispatchEvent(touchEnd);

      return {
        dotsBefore
      };
    });
    await new Promise(r => setTimeout(r, 600));

    const touchFinalState = await driver.evaluate(() => {
      const dotsAfter = Array.from(document.querySelectorAll('.carousel-dot')).findIndex(d => d.classList.contains('active'));
      return { dotsAfter };
    });

    const advanceOnNext = carouselNextState.activeDot === (carouselInitial.initialDot + 1);
    const pauseOnHoverWorks = carouselHoverState.activeDotDuringHover === carouselNextState.activeDot;
    const resumeOnLeaveWorks = carouselResumedState.activeDotAfterResume !== carouselHoverState.activeDotDuringHover;
    const swipeWorks = touchFinalState.dotsAfter !== touchSwipeResult.dotsBefore;

    auditReport.systems.testimonialCarousel = {
      pass: advanceOnNext && pauseOnHoverWorks && resumeOnLeaveWorks && swipeWorks,
      details: {
        advanceOnNext,
        pauseOnHoverWorks,
        resumeOnLeaveWorks,
        swipeWorks,
        states: {
          initial: carouselInitial.initialDot,
          afterNext: carouselNextState.activeDot,
          after5sHover: carouselHoverState.activeDotDuringHover,
          after5sResume: carouselResumedState.activeDotAfterResume,
          afterSwipe: touchFinalState.dotsAfter
        }
      }
    };
    console.log(`  ✓ Next button advanced slide: ${advanceOnNext} (dot ${carouselInitial.initialDot} -> ${carouselNextState.activeDot})`);
    console.log(`  ✓ Hover paused autoplay for 5.2s: ${pauseOnHoverWorks} (remained at dot ${carouselHoverState.activeDotDuringHover})`);
    console.log(`  ✓ Mouseleave resumed autoplay: ${resumeOnLeaveWorks} (moved to dot ${carouselResumedState.activeDotAfterResume})`);
    console.log(`  ✓ Touch swipe delta advanced slide: ${swipeWorks}`);

    // ------------------------------------------------------------------------
    // 6. SINGLE-ACTIVE FAQ ACCORDION
    // ------------------------------------------------------------------------
    console.log('\n▶ [6/6] Testing Single-Active FAQ Accordion & Grid Transition...');
    // Real CDP click test on the button
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

    // Step 1: Click Item 0
    await cdpClickFaq(0);
    await new Promise(r => setTimeout(r, 450));

    const faqState1 = await driver.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.faq-item'));
      return items.map((item, i) => {
        const panel = item.querySelector('.faq-panel');
        const trigger = item.querySelector('.faq-trigger');
        return {
          index: i,
          active: item.classList.contains('active') || item.classList.contains('is-open'),
          aria: trigger.getAttribute('aria-expanded'),
          height: panel ? panel.getBoundingClientRect().height : 0
        };
      });
    });

    const item0Expanded = faqState1[0].active && faqState1[0].height > 0;
    console.log(`  ? Real CDP Mouse Click on FAQ 0: active=${faqState1[0].active}, height=${faqState1[0].height}px`);

    // Step 2: Keyboard Enter on Item 1 to test keyboard expansion
    await driver.evaluate(() => {
      const trigger1 = document.querySelectorAll('.faq-trigger')[1];
      const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      trigger1.dispatchEvent(ev);
    });
    await new Promise(r => setTimeout(r, 450));

    const faqState2 = await driver.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.faq-item'));
      return items.map((item, i) => {
        const panel = item.querySelector('.faq-panel');
        const trigger = item.querySelector('.faq-trigger');
        return {
          index: i,
          active: item.classList.contains('active') || item.classList.contains('is-open'),
          aria: trigger.getAttribute('aria-expanded'),
          height: panel ? panel.getBoundingClientRect().height : 0
        };
      });
    });

    const item1KeyboardExpanded = faqState2[1].active && faqState2[1].height > 0;
    const item0Collapsed = !faqState2[0].active && faqState2[0].height === 0;
    console.log(`  ? Keyboard Enter on FAQ 1: active=${faqState2[1].active}, height=${faqState2[1].height}px`);
    console.log(`  ? Single active constraint enforced (FAQ 0 collapsed): ${item0Collapsed}`);

    auditReport.systems.faqAccordion = {
      pass: item0Expanded && item1KeyboardExpanded && item0Collapsed,
      details: {
        mouseClickFaq0Pass: item0Expanded,
        mouseClickFaq0State: faqState1[0],
        keyboardFaq1Pass: item1KeyboardExpanded,
        singleActiveEnforced: item0Collapsed,
        bugIdentified: !item0Expanded ? 'DUPLICATE_EVENT_LISTENER_COLLISION: main.js and interactions.js both bind click to .faq-trigger, causing immediate collapse on real mouse click.' : null
      }
    };

    console.log('\n====================================================');
    console.log('ADVERSARIAL STRESS TEST SUMMARY:');
    for (const [sys, res] of Object.entries(auditReport.systems)) {
      console.log(`  - ${sys}: ${res.pass ? 'PASS ✓' : 'FAIL ✗'}`);
    }
    console.log('====================================================\n');

  } finally {
    await driver.close();
    await server.stop();
  }

  return auditReport;
}

if (require.main === module) {
  runAdversarialAudit()
    .then(report => {
      const hasFailures = Object.values(report.systems).some(s => !s.pass);
      console.log('Final Verdict:', hasFailures ? 'REQUEST_CHANGES' : 'APPROVE');
      process.exit(hasFailures ? 1 : 0);
    })
    .catch(err => {
      console.error('Audit run failed with error:', err);
      process.exit(2);
    });
}

module.exports = runAdversarialAudit;
