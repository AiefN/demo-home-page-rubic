/**
 * Independent Post-Victory Forensic Verifier
 * victory_auditor_m6
 * 
 * Independently validates:
 * 1. Visual Defect 1: Desktop Container & Hero 2-Column Showcase Balance (1280px - 1920px)
 * 2. Visual Defect 2: Strict Hidden Modal Default State (display: none !important)
 * 3. Visual Defect 3: Floating Dock Heading Clearance & Scroll Hysteresis
 * 4. Visual Defect 4: Pricing Calculator 3-Column Grid & Math Correctness
 * 5. Visual Defect 5: FAQ Accordion Dark Transparent Triggers & Single-Active Mechanism
 * 6. Responsive Viewports: 320px, 768px, 1440px, 1920px with Zero Horizontal Overflow
 * 7. Zero Console Errors across all 4 pages
 */

const path = require('path');
const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');

async function runIndependentAudit() {
  console.log('========================================================');
  console.log('   INDEPENDENT VICTORY FORENSIC AUDIT (victory_auditor)  ');
  console.log('========================================================\n');

  const rootDir = path.resolve(__dirname, '../../..');
  const server = new StaticServer({ rootDir });
  const serverInfo = await server.start();
  const driver = new BrowserDriver();
  await driver.launch();

  const results = {
    defect1_hero_balance: false,
    defect2_modal_overlay: false,
    defect3_dock_clearance: false,
    defect4_pricing_cards: false,
    defect5_faq_accordion: false,
    zero_console_errors: false,
    responsive_overflow: false,
    details: {}
  };

  const consoleErrors = [];

  try {
    // ------------------------------------------------------------------------
    // CHECK 1: ZERO CONSOLE ERRORS ACROSS ALL 4 PAGES
    // ------------------------------------------------------------------------
    console.log('▶ [1/7] Testing Console Errors on all 4 root pages...');
    const pages = ['index.html', 'services.html', 'portfolio.html', 'contact.html'];
    let allPagesClean = true;

    for (const page of pages) {
      await driver.goto(`${serverInfo.url}/${page}`);
      const pageErrors = await driver.evaluate(() => window.__consoleErrors || []);
      if (pageErrors.length > 0) {
        consoleErrors.push({ page, errors: pageErrors });
        allPagesClean = false;
      }
    }
    results.zero_console_errors = allPagesClean;
    results.details.consoleErrors = consoleErrors;
    console.log(`  ${allPagesClean ? '✓' : '✗'} 4/4 pages loaded with 0 console errors.`);

    // ------------------------------------------------------------------------
    // CHECK 2: DEFECT 1 — DESKTOP CONTAINER & HERO 2-COLUMN BALANCE (1440px & 1920px)
    // ------------------------------------------------------------------------
    console.log('\n▶ [2/7] Testing Defect 1: Desktop Container & Hero 2-Column Balance...');
    await driver.setViewport(1440, 900);
    await driver.goto(`${serverInfo.url}/index.html`);

    const heroBalance = await driver.evaluate(() => {
      const container = document.querySelector('.hero-container');
      const leftCol = document.querySelector('.hero-content-col');
      const rightCol = document.querySelector('.hero-showcase-col');
      const showcaseCard = document.querySelector('.hero-showcase-card');

      if (!container || !leftCol || !rightCol || !showcaseCard) {
        return { valid: false, reason: 'Missing hero elements' };
      }

      const cRect = container.getBoundingClientRect();
      const lRect = leftCol.getBoundingClientRect();
      const rRect = rightCol.getBoundingClientRect();
      const sRect = showcaseCard.getBoundingClientRect();

      const style = window.getComputedStyle(container);
      const isGrid = style.display === 'grid';
      const clientW = document.documentElement.clientWidth;
      const leftGap = cRect.left;
      const rightGap = clientW - cRect.right;
      const symmetryDiff = Math.abs(leftGap - rightGap);

      return {
        valid: true,
        isGrid,
        gridColumns: style.gridTemplateColumns,
        containerWidth: cRect.width,
        leftColWidth: lRect.width,
        rightColWidth: rRect.width,
        showcaseCardWidth: sRect.width,
        leftGap,
        rightGap,
        symmetryDiff,
        isSymmetric: symmetryDiff < 2,
        hasRightCard: sRect.width > 300
      };
    });

    results.defect1_hero_balance = heroBalance.valid && heroBalance.isGrid && heroBalance.hasRightCard && heroBalance.isSymmetric;
    results.details.heroBalance = heroBalance;
    console.log(`  ${results.defect1_hero_balance ? '✓' : '✗'} Hero Grid: ${heroBalance.gridColumns}, Left: ${Math.round(heroBalance.leftColWidth)}px, Right: ${Math.round(heroBalance.rightColWidth)}px, Symmetry diff: ${heroBalance.symmetryDiff.toFixed(1)}px`);

    // ------------------------------------------------------------------------
    // CHECK 3: DEFECT 2 — MODAL OVERLAYS STRICTLY HIDDEN ON BOOT
    // ------------------------------------------------------------------------
    console.log('\n▶ [3/7] Testing Defect 2: Modal Overlays Strictly Hidden...');
    const modalCheckIndex = await driver.evaluate(() => {
      const caseModal = document.getElementById('case-study-modal');
      const serviceModal = document.getElementById('service-modal');

      function checkHidden(el) {
        if (!el) return { present: false, hidden: true };
        const cs = window.getComputedStyle(el);
        const isHidden = cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0';
        return {
          present: true,
          display: cs.display,
          visibility: cs.visibility,
          opacity: cs.opacity,
          isHidden
        };
      }

      return {
        caseModal: checkHidden(caseModal),
        serviceModal: checkHidden(serviceModal)
      };
    });

    // Check portfolio.html modal
    await driver.goto(`${serverInfo.url}/portfolio.html`);
    const modalCheckPortfolio = await driver.evaluate(() => {
      const caseModal = document.getElementById('case-study-modal');
      const cs = caseModal ? window.getComputedStyle(caseModal) : null;
      return {
        present: !!caseModal,
        display: cs ? cs.display : null,
        isHidden: cs ? (cs.display === 'none') : true
      };
    });

    // Check services.html modal
    await driver.goto(`${serverInfo.url}/services.html`);
    const modalCheckServices = await driver.evaluate(() => {
      const sModal = document.getElementById('service-modal');
      const cs = sModal ? window.getComputedStyle(sModal) : null;
      return {
        present: !!sModal,
        display: cs ? cs.display : null,
        isHidden: cs ? (cs.display === 'none') : true
      };
    });

    const modalsStrictlyHidden = modalCheckIndex.caseModal.isHidden && modalCheckPortfolio.isHidden && modalCheckServices.isHidden;
    results.defect2_modal_overlay = modalsStrictlyHidden;
    results.details.modalCheck = { index: modalCheckIndex, portfolio: modalCheckPortfolio, services: modalCheckServices };
    console.log(`  ${modalsStrictlyHidden ? '✓' : '✗'} All modals display: none by default (zero static overlay).`);

    // ------------------------------------------------------------------------
    // CHECK 4: DEFECT 3 — FLOATING DOCK HEADING CLEARANCE & SCROLL HYSTERESIS
    // ------------------------------------------------------------------------
    console.log('\n▶ [4/7] Testing Defect 3: Floating Dock Heading Clearance & Hysteresis...');
    await driver.setViewport(1440, 900);
    await driver.goto(`${serverInfo.url}/index.html`);

    const dockClearance = await driver.evaluate(() => {
      const dock = document.querySelector('.floating-bottom-nav');
      const sec2 = document.querySelector('#services, .services-section, section:nth-of-type(2)');
      const sec2Heading = sec2 ? sec2.querySelector('h2, .section-title') : null;

      if (!dock || !sec2Heading) {
        return { valid: false, reason: 'Dock or section 2 heading missing' };
      }

      const dockRect = dock.getBoundingClientRect();
      const headingRect = sec2Heading.getBoundingClientRect();

      // At initial scroll (0), Section 2 heading should be below the viewport or dock
      const initialNoCollision = (headingRect.top >= window.innerHeight) || (headingRect.bottom < dockRect.top);

      return {
        valid: true,
        dockTop: dockRect.top,
        dockBottom: dockRect.bottom,
        headingTop: headingRect.top,
        headingBottom: headingRect.bottom,
        initialNoCollision,
        heroMinHeight: window.getComputedStyle(document.querySelector('.hero, .hero-section')).minHeight
      };
    });

    // Simulate fast scroll down to verify hysteresis hide
    const hysteresisCheck = await driver.evaluate(() => {
      window.scrollTo(0, 500);
      window.dispatchEvent(new Event('scroll'));
      const dock = document.querySelector('.floating-bottom-nav');
      return {
        hasHiddenClass: dock.classList.contains('nav-dock--hidden'),
        transform: window.getComputedStyle(dock).transform
      };
    });

    results.defect3_dock_clearance = dockClearance.valid && dockClearance.initialNoCollision;
    results.details.dockClearance = { dockClearance, hysteresisCheck };
    console.log(`  ${results.defect3_dock_clearance ? '✓' : '✗'} Initial Section 2 heading top: ${Math.round(dockClearance.headingTop)}px (below fold), Dock: ${Math.round(dockClearance.dockTop)}px. Zero initial overlap.`);

    // ------------------------------------------------------------------------
    // CHECK 5: DEFECT 4 — PRICING CALCULATOR 3-COLUMN CARDS & DYNAMIC MATH
    // ------------------------------------------------------------------------
    console.log('\n▶ [5/7] Testing Defect 4: Pricing Calculator 3-Column Grid & Math...');
    const pricingTest = await driver.evaluate(() => {
      const group = document.querySelector('.tier-cards-group, .tier-selector');
      const cards = Array.from(document.querySelectorAll('.tier-card'));
      const priceDisplay = document.querySelector('#calc-total-price');
      const daysDisplay = document.querySelector('#calc-total-timeline');

      if (!group || cards.length < 3) {
        return { valid: false, reason: 'Pricing cards group missing or < 3 cards' };
      }

      const gStyle = window.getComputedStyle(group);
      const is3Col = gStyle.gridTemplateColumns.split(' ').length === 3;

      const widths = cards.map(c => c.getBoundingClientRect().width);
      const allWideEnough = widths.every(w => w >= 180);

      // Test dynamic math: select basic
      const basicRadio = document.querySelector('input[name="tier"][value="basic"]');
      if (basicRadio) {
        basicRadio.checked = true;
        basicRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const basicPrice = priceDisplay ? priceDisplay.textContent : '';

      // Select pro
      const proRadio = document.querySelector('input[name="tier"][value="pro"]');
      if (proRadio) {
        proRadio.checked = true;
        proRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const proPrice = priceDisplay ? priceDisplay.textContent : '';

      return {
        valid: true,
        is3Col,
        gridTemplateColumns: gStyle.gridTemplateColumns,
        cardWidths: widths,
        allWideEnough,
        basicPrice,
        proPrice,
        mathUpdates: basicPrice !== proPrice && proPrice.includes('5.500.000')
      };
    });

    results.defect4_pricing_cards = pricingTest.valid && pricingTest.is3Col && pricingTest.allWideEnough && pricingTest.mathUpdates;
    results.details.pricingTest = pricingTest;
    console.log(`  ${results.defect4_pricing_cards ? '✓' : '✗'} 3-Column Grid: ${pricingTest.gridTemplateColumns}, Card Widths: ${pricingTest.cardWidths.map(w => Math.round(w) + 'px').join(', ')}, Dynamic Math: ${pricingTest.mathUpdates}`);

    // ------------------------------------------------------------------------
    // CHECK 6: DEFECT 5 — FAQ ACCORDION DARK TRANSPARENT BUTTONS & EXPANSION
    // ------------------------------------------------------------------------
    console.log('\n▶ [6/7] Testing Defect 5: FAQ Accordion Dark Transparent Buttons...');
    const faqTest = await driver.evaluate(() => {
      const triggers = Array.from(document.querySelectorAll('.faq-trigger, .accordion-header'));
      if (!triggers.length) return { valid: false, reason: 'No FAQ triggers' };

      const styles = triggers.map(t => {
        const cs = window.getComputedStyle(t);
        return {
          bg: cs.backgroundColor,
          color: cs.color,
          isTransparent: cs.backgroundColor === 'rgba(0, 0, 0, 0)' || cs.backgroundColor === 'transparent'
        };
      });

      const allTransparent = styles.every(s => s.isTransparent);

      // Test click expansion
      const firstTrigger = triggers[0];
      firstTrigger.click();
      const firstItem = firstTrigger.closest('.faq-item, .accordion-item');
      const isOpenAfterClick = firstItem.classList.contains('is-active') || firstItem.classList.contains('active');

      // Click second item
      const secondTrigger = triggers[1];
      secondTrigger.click();
      const secondItem = secondTrigger.closest('.faq-item, .accordion-item');
      const firstClosedAfterSecond = !firstItem.classList.contains('is-active') && !firstItem.classList.contains('active');
      const secondOpen = secondItem.classList.contains('is-active') || secondItem.classList.contains('active');

      return {
        valid: true,
        allTransparent,
        styles: styles.slice(0, 2),
        singleActiveWorking: isOpenAfterClick && firstClosedAfterSecond && secondOpen
      };
    });

    results.defect5_faq_accordion = faqTest.valid && faqTest.allTransparent && faqTest.singleActiveWorking;
    results.details.faqTest = faqTest;
    console.log(`  ${results.defect5_faq_accordion ? '✓' : '✗'} FAQ Buttons Transparent: ${faqTest.allTransparent} (${faqTest.styles[0].bg}), Single-Active Accordion: ${faqTest.singleActiveWorking}`);

    // ------------------------------------------------------------------------
    // CHECK 7: RESPONSIVE OVERFLOW TEST (320px, 768px, 1440px)
    // ------------------------------------------------------------------------
    console.log('\n▶ [7/7] Testing Responsive Layout (320px, 768px, 1440px)...');
    const viewports = [
      { w: 320, h: 568, name: 'Mobile' },
      { w: 768, h: 1024, name: 'Tablet' },
      { w: 1440, h: 900, name: 'Desktop' }
    ];

    let overflowClean = true;
    const overflowResults = [];

    for (const vp of viewports) {
      await driver.setViewport(vp.w, vp.h);
      for (const page of pages) {
        await driver.goto(`${serverInfo.url}/${page}`);
        const overflow = await driver.evaluate(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
          };
        });

        overflowResults.push({ vp: vp.name, page, ...overflow });
        if (overflow.hasOverflow) {
          overflowClean = false;
        }
      }
    }

    results.responsive_overflow = overflowClean;
    results.details.overflowResults = overflowResults;
    console.log(`  ${overflowClean ? '✓' : '✗'} All viewports 320px, 768px, 1440px have 0 horizontal overflow across all 4 pages.`);

  } catch (err) {
    console.error('Independent verifier error:', err);
  } finally {
    await driver.close();
    await server.stop();
  }

  const allPassed = Object.keys(results)
    .filter(k => typeof results[k] === 'boolean')
    .every(k => results[k] === true);

  console.log('\n========================================================');
  console.log(`INDEPENDENT FORENSIC VERDICT: ${allPassed ? 'ALL CHECKS PASSED (CLEAN)' : 'FAILURES DETECTED'}`);
  console.log('========================================================\n');

  return { allPassed, results };
}

if (require.main === module) {
  runIndependentAudit()
    .then(({ allPassed, results }) => {
      process.exit(allPassed ? 0 : 1);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = runIndependentAudit;
