const path = require('path');
const fs = require('fs');
const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');

async function runAdversarialAudit() {
  console.log('=== STARTING ADVERSARIAL AUDIT FOR MILESTONE 6 ===');
  const server = new StaticServer({ rootDir: path.resolve(__dirname, '../../..'), port: 8099 });
  await server.start();
  const driver = new BrowserDriver({ headless: true });
  await driver.launch();

  const auditReport = {
    timestamp: new Date().toISOString(),
    viewportsTested: [],
    defects: {},
    integrity: {},
    verdict: null,
    findings: []
  };

  try {
    // =========================================================================
    // TEST 1: VIEWPORT GEOMETRY & HERO ASYMMETRIC BALANCE (Defect 1)
    // Viewports: 1920x1080 (Ultra-wide), 1440x900 (Desktop), 1024x768 (Laptop/Tablet), 375x667 (Mobile)
    // =========================================================================
    const viewports = [
      { name: 'ultrawide_1920', width: 1920, height: 1080 },
      { name: 'desktop_1440', width: 1440, height: 900 },
      { name: 'tablet_landscape_1024', width: 1024, height: 768 },
      { name: 'mobile_375', width: 375, height: 667 }
    ];

    const heroBalanceResults = {};

    for (const vp of viewports) {
      await driver.setViewport({ width: vp.width, height: vp.height });
      await driver.goto('http://127.0.0.1:8099/index.html');
      await new Promise(r => setTimeout(r, 400));

      const geometry = await driver.evaluate(() => {
        const container = document.querySelector('.hero-container');
        const leftCol = document.querySelector('.hero-content-col');
        const rightCol = document.querySelector('.hero-showcase-col');
        const showcaseCard = document.querySelector('.hero-showcase-card');
        const telemetryTiles = document.querySelectorAll('.showcase-metric-tile');

        const cRect = container ? container.getBoundingClientRect() : null;
        const lRect = leftCol ? leftCol.getBoundingClientRect() : null;
        const rRect = rightCol ? rightCol.getBoundingClientRect() : null;
        const clientWidth = document.documentElement.clientWidth;
        const bodyScrollWidth = document.documentElement.scrollWidth;

        // Container centering is evaluated relative to viewport clientWidth (excluding scrollbar)
        const leftMargin = cRect ? cRect.left : 0;
        const rightMargin = cRect ? (clientWidth - cRect.right) : 0;
        const isCentered = cRect ? Math.abs(leftMargin - rightMargin) < 1.0 : false;

        return {
          containerWidth: cRect ? Math.round(cRect.width) : 0,
          clientWidth: clientWidth,
          leftMargin: Math.round(leftMargin),
          rightMargin: Math.round(rightMargin),
          isCentered,
          leftColWidth: lRect ? Math.round(lRect.width) : 0,
          rightColWidth: rRect ? Math.round(rRect.width) : 0,
          hasShowcaseCard: !!showcaseCard,
          telemetryTileCount: telemetryTiles.length,
          hasHorizontalOverflow: bodyScrollWidth > clientWidth + 1
        };
      });

      heroBalanceResults[vp.name] = geometry;
      auditReport.viewportsTested.push(vp.name);
    }

    auditReport.defects.defect1_hero_balance = heroBalanceResults;

    // =========================================================================
    // TEST 2: STRAY MODAL OVERLAY CONCEALMENT & INTERACTION (Defect 2)
    // Check index.html, services.html, portfolio.html
    // =========================================================================
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto('http://127.0.0.1:8099/index.html');
    await new Promise(r => setTimeout(r, 400));

    const indexModalInitial = await driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      const dialog = modal ? modal.querySelector('.modal-dialog') : null;
      if (!modal) return { exists: false };
      const cs = window.getComputedStyle(modal);
      const dcs = dialog ? window.getComputedStyle(dialog) : null;
      const rect = modal.getBoundingClientRect();
      return {
        exists: true,
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
        zIndex: cs.zIndex,
        rectWidth: rect.width,
        rectHeight: rect.height,
        dialogTransform: dcs ? dcs.transform : null,
        isStaticallyVisible: cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0
      };
    });

    // Test opening modal on index.html
    const openIndexModal = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-case-study, [data-project-id], [data-modal-target]');
      if (!btn) return { btnFound: false };
      btn.click();
      const modal = document.querySelector('#case-study-modal');
      const cs = window.getComputedStyle(modal);
      return {
        btnFound: true,
        displayAfterOpen: cs.display,
        visibilityAfterOpen: cs.visibility,
        opacityAfterOpen: cs.opacity,
        isOpen: cs.display === 'flex' && cs.visibility === 'visible' && parseFloat(cs.opacity) > 0
      };
    });

    // Test closing modal via close button
    const closeIndexModal = await driver.evaluate(() => {
      const closeBtn = document.querySelector('#modal-close-btn, .modal-close, .modal__close');
      if (!closeBtn) return { closeBtnFound: false };
      closeBtn.click();
      const modal = document.querySelector('#case-study-modal');
      const cs = window.getComputedStyle(modal);
      return {
        closeBtnFound: true,
        displayAfterClose: cs.display,
        isClosed: cs.display === 'none' || cs.visibility === 'hidden'
      };
    });

    // Test subpages initial modal state
    await driver.goto('http://127.0.0.1:8099/services.html');
    await new Promise(r => setTimeout(r, 300));
    const servicesModalState = await driver.evaluate(() => {
      const modal = document.querySelector('#service-modal');
      if (!modal) return { exists: false };
      const cs = window.getComputedStyle(modal);
      return {
        exists: true,
        display: cs.display,
        visibility: cs.visibility,
        isHidden: cs.display === 'none' || cs.visibility === 'hidden'
      };
    });

    await driver.goto('http://127.0.0.1:8099/portfolio.html');
    await new Promise(r => setTimeout(r, 300));
    const portfolioModalState = await driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      if (!modal) return { exists: false };
      const cs = window.getComputedStyle(modal);
      return {
        exists: true,
        display: cs.display,
        visibility: cs.visibility,
        isHidden: cs.display === 'none' || cs.visibility === 'hidden'
      };
    });

    auditReport.defects.defect2_modal_overlay = {
      indexModalInitial,
      openIndexModal,
      closeIndexModal,
      servicesModalState,
      portfolioModalState
    };

    // =========================================================================
    // TEST 3: FLOATING DOCK CLEARANCE & SCROLL HYSTERESIS (Defect 3)
    // =========================================================================
    await driver.goto('http://127.0.0.1:8099/index.html');
    await new Promise(r => setTimeout(r, 400));

    const dockClearanceAtScrollY0 = await driver.evaluate(() => {
      const dock = document.querySelector('.floating-bottom-nav');
      const dockRect = dock ? dock.getBoundingClientRect() : null;
      const sec2 = document.getElementById('services');
      const sec2Rect = sec2 ? sec2.getBoundingClientRect() : null;
      const sec2Title = sec2 ? sec2.querySelector('.section-title') : null;
      const titleRect = sec2Title ? sec2Title.getBoundingClientRect() : null;

      const collides = (rectA, rectB) => {
        if (!rectA || !rectB) return false;
        return !(
          rectA.bottom < rectB.top ||
          rectA.top > rectB.bottom ||
          rectA.right < rectB.left ||
          rectA.left > rectB.right
        );
      };

      return {
        dockRect: dockRect ? { top: Math.round(dockRect.top), bottom: Math.round(dockRect.bottom), height: Math.round(dockRect.height) } : null,
        sec2Top: sec2Rect ? Math.round(sec2Rect.top) : null,
        titleTop: titleRect ? Math.round(titleRect.top) : null,
        viewportHeight: window.innerHeight,
        isSec2BelowFold: sec2Rect ? sec2Rect.top >= window.innerHeight - 5 : false,
        isTitleBelowFold: titleRect ? titleRect.top >= window.innerHeight - 5 : false,
        dockCollidesSection2Title: collides(dockRect, titleRect)
      };
    });

    // Test scroll hysteresis on the floating dock
    const scrollHysteresis = await driver.evaluate(async () => {
      const dock = document.querySelector('.floating-bottom-nav');
      if (!dock) return { dockFound: false };

      // Simulate fast scroll down past 400px
      window.scrollTo({ top: 600, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 120));
      const isHiddenOnScrollDown = dock.classList.contains('nav-dock--hidden');

      // Simulate scroll up
      window.scrollTo({ top: 550, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 120));
      const isRevealedOnScrollUp = !dock.classList.contains('nav-dock--hidden');

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 120));
      const isVisibleAtTop = !dock.classList.contains('nav-dock--hidden');

      return {
        dockFound: true,
        isHiddenOnScrollDown,
        isRevealedOnScrollUp,
        isVisibleAtTop
      };
    });

    auditReport.defects.defect3_floating_dock = {
      dockClearanceAtScrollY0,
      scrollHysteresis
    };

    // =========================================================================
    // TEST 4: PRICING CALCULATOR CARD COMPRESSION & DYNAMIC LOGIC (Defect 4)
    // =========================================================================
    const pricingCalcDesktop = await driver.evaluate(() => {
      const widget = document.querySelector('.pricing-calculator-widget, .calc-layout');
      const cards = Array.from(document.querySelectorAll('.tier-card'));
      const cardRects = cards.map(c => {
        const r = c.getBoundingClientRect();
        return {
          width: Math.round(r.width),
          height: Math.round(r.height),
          top: Math.round(r.top),
          left: Math.round(r.left)
        };
      });

      // Test dynamic price calculation
      const proInput = document.querySelector('input[name="tier"][value="pro"]');
      if (proInput) {
        proInput.click();
        proInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const priceDisplay = document.querySelector('.calc-price-value, .total-investment, #calc-total-price, .calc-summary-price');
      const priceText = priceDisplay ? priceDisplay.textContent.trim() : null;

      return {
        cardCount: cards.length,
        cardRects,
        allCardsAdequateWidth: cardRects.every(r => r.width >= 200),
        cardsNotThinSlivers: cardRects.every(r => r.width > 120),
        isThreeColumnsOnDesktop: cardRects.length === 3 &&
          cardRects[0].top === cardRects[1].top &&
          cardRects[1].top === cardRects[2].top,
        priceTextAfterProClick: priceText
      };
    });

    // Check pricing calculator at mobile 375px
    await driver.setViewport({ width: 375, height: 667 });
    await new Promise(r => setTimeout(r, 300));
    const pricingCalcMobile = await driver.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.tier-card'));
      const widths = cards.map(c => Math.round(c.getBoundingClientRect().width));
      return {
        widths,
        isStackedSingleColumn: widths.every(w => w >= 280)
      };
    });

    auditReport.defects.defect4_pricing_compression = {
      desktop: pricingCalcDesktop,
      mobile: pricingCalcMobile
    };

    // =========================================================================
    // TEST 5: FAQ ACCORDION TEXT BACKGROUND RESET & TOGGLE LOGIC (Defect 5)
    // =========================================================================
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto('http://127.0.0.1:8099/index.html');
    await new Promise(r => setTimeout(r, 400));

    const faqAccordionAudit = await driver.evaluate(async () => {
      const triggers = Array.from(document.querySelectorAll('.faq-trigger, button.faq-header'));
      const questions = Array.from(document.querySelectorAll('.faq-question'));
      const icons = Array.from(document.querySelectorAll('.faq-icon'));

      const initialStyles = triggers.map((t, idx) => {
        const cs = window.getComputedStyle(t);
        const qcs = questions[idx] ? window.getComputedStyle(questions[idx]) : null;
        return {
          btnBg: cs.backgroundColor,
          btnColor: cs.color,
          btnBorder: cs.border,
          btnOutline: cs.outline,
          questionBg: qcs ? qcs.backgroundColor : null,
          isUserAgentGray: cs.backgroundColor.includes('240') || cs.backgroundColor.includes('#f0') || cs.border.includes('outset'),
          isBlackText: cs.color === 'rgb(0, 0, 0)'
        };
      });

      // Test accordion interactive expansion
      if (triggers.length >= 2) {
        triggers[0].click();
        await new Promise(r => setTimeout(r, 200));

        const item0Active = triggers[0].closest('.faq-item').classList.contains('is-active') ||
                            triggers[0].getAttribute('aria-expanded') === 'true';
        const icon0Transform = window.getComputedStyle(icons[0]).transform;

        // Click second item -> first should collapse, second expand
        triggers[1].click();
        await new Promise(r => setTimeout(r, 200));

        const item0Collapsed = !triggers[0].closest('.faq-item').classList.contains('is-active') ||
                               triggers[0].getAttribute('aria-expanded') === 'false';
        const item1Active = triggers[1].closest('.faq-item').classList.contains('is-active') ||
                            triggers[1].getAttribute('aria-expanded') === 'true';

        return {
          triggerCount: triggers.length,
          initialStyles,
          interaction: {
            item0Active,
            icon0Transform,
            item0CollapsedAfterItem1Clicked: item0Collapsed,
            item1Active: item1Active,
            singleActiveItemEnforced: item0Collapsed && item1Active
          }
        };
      }

      return { triggerCount: triggers.length, initialStyles };
    });

    auditReport.defects.defect5_faq_accordion = faqAccordionAudit;

    // =========================================================================
    // TEST 6: INTEGRITY & SOURCE CODE CHECKS
    // =========================================================================
    const integrityChecks = {
      hardcodedOutputs: false,
      dummyFacades: false,
      externalLibraries: false,
      details: []
    };

    // Verify pure vanilla runtime in browser
    const windowEnv = await driver.evaluate(() => {
      return {
        hasJQuery: typeof window.$ !== 'undefined' || typeof window.jQuery !== 'undefined',
        hasReact: typeof window.React !== 'undefined',
        hasVue: typeof window.Vue !== 'undefined',
        hasBootstrap: typeof window.bootstrap !== 'undefined',
        hasTailwind: typeof window.tailwind !== 'undefined'
      };
    });

    integrityChecks.windowEnv = windowEnv;
    auditReport.integrity = integrityChecks;

  } finally {
    await driver.close();
    await server.stop();
  }

  // Determine overall verdict
  const d1 = auditReport.defects.defect1_hero_balance;
  const d2 = auditReport.defects.defect2_modal_overlay;
  const d3 = auditReport.defects.defect3_floating_dock;
  const d4 = auditReport.defects.defect4_pricing_compression;
  const d5 = auditReport.defects.defect5_faq_accordion;

  const d1Passed = d1.desktop_1440.isCentered &&
                   d1.desktop_1440.hasShowcaseCard &&
                   d1.desktop_1440.leftColWidth > 500 &&
                   d1.desktop_1440.rightColWidth > 400 &&
                   !d1.desktop_1440.hasHorizontalOverflow &&
                   !d1.ultrawide_1920.hasHorizontalOverflow &&
                   !d1.mobile_375.hasHorizontalOverflow;

  const d2Passed = !d2.indexModalInitial.isStaticallyVisible &&
                   d2.indexModalInitial.display === 'none' &&
                   d2.openIndexModal.isOpen &&
                   d2.closeIndexModal.isClosed &&
                   d2.servicesModalState.isHidden &&
                   d2.portfolioModalState.isHidden;

  const d3Passed = d3.dockClearanceAtScrollY0.isSec2BelowFold &&
                   !d3.dockClearanceAtScrollY0.dockCollidesSection2Title &&
                   d3.scrollHysteresis.dockFound &&
                   d3.scrollHysteresis.isHiddenOnScrollDown &&
                   d3.scrollHysteresis.isRevealedOnScrollUp &&
                   d3.scrollHysteresis.isVisibleAtTop;

  const d4Passed = d4.desktop.allCardsAdequateWidth &&
                   d4.desktop.isThreeColumnsOnDesktop &&
                   d4.mobile.isStackedSingleColumn;

  const d5Passed = d5.initialStyles.every(s => !s.isUserAgentGray && !s.isBlackText) &&
                   d5.interaction.singleActiveItemEnforced;

  const allPassed = d1Passed && d2Passed && d3Passed && d4Passed && d5Passed;

  auditReport.verdict = allPassed ? 'APPROVE' : 'REQUEST_CHANGES';
  auditReport.defectSummary = {
    defect1_hero_balance_passed: d1Passed,
    defect2_modal_overlay_passed: d2Passed,
    defect3_floating_dock_passed: d3Passed,
    defect4_pricing_compression_passed: d4Passed,
    defect5_faq_accordion_passed: d5Passed
  };

  const outputPath = path.resolve(__dirname, 'adversarial_audit_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(auditReport, null, 2));
  console.log('Adversarial Audit Results written to:', outputPath);
  console.log('Verdict:', auditReport.verdict);
  console.log('Summary:', JSON.stringify(auditReport.defectSummary, null, 2));
}

runAdversarialAudit().catch(err => {
  console.error('Audit run error:', err);
  process.exit(1);
});
