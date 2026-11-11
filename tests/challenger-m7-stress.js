/**
 * Challenger m7_2 — Comprehensive Empirical Stress & Invariant Test Suite
 * Milestone 7: Minimalist Redesign & Text Reduction Overhaul
 *
 * Verifies:
 * 1. Hard DOM Invariants & Cardinality
 * 2. Pricing Calculator 25+ Rapid Random Stress Cycles (Zero NaN, Zero Glitch)
 * 3. Case Study & Service Modal Lifecycles (Backdrop, Close Button, Escape, Scroll Lock)
 * 4. Contact Form Inline Validation Stress (Required Error Substrings, RFC 5322, ID Phone)
 * 5. Programmatic Text Brevity Measurement (Words & Chars Before vs After Milestone 7)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runEmpiricalStressSuite() {
  console.log(`${colors.bold}${colors.cyan}================================================================`);
  console.log(` CHALLENGER m7_2: EMPIRICAL STRESS & INVARIANT VERIFICATION`);
  console.log(` Milestone 7 — Ultra-Clean Minimalist Transformation`);
  console.log(`================================================================${colors.reset}\n`);

  const server = new StaticServer({ rootDir: path.resolve(__dirname, '..') });
  const { port } = await server.start();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`✓ Static server listening at: ${baseUrl}`);

  const driver = new BrowserDriver();
  await driver.launch();
  console.log(`✓ Headless browser launched (${path.basename(driver.browserPath)})`);

  let totalAsserts = 0;
  let passedAsserts = 0;
  let failedAsserts = 0;
  const failureList = [];
  const report = {
    timestamp: new Date().toISOString(),
    cardinality: {},
    pricingStress: {},
    modalLifecycles: {},
    contactValidation: {},
    textBrevity: {},
    totalAsserts: 0,
    passedAsserts: 0,
    failedAsserts: 0,
    verdict: 'PENDING'
  };

  function assert(condition, desc) {
    totalAsserts++;
    if (condition) {
      passedAsserts++;
      console.log(`  ${colors.green}✓ [PASS]${colors.reset} ${desc}`);
    } else {
      failedAsserts++;
      failureList.push(desc);
      console.log(`  ${colors.red}✗ [FAIL]${colors.reset} ${desc}`);
    }
  }

  try {
    // =========================================================================
    // SECTION 1: HARD DOM INVARIANTS & CARDINALITY CHECK
    // =========================================================================
    console.log(`\n${colors.bold}▶ [1] INVARIANT CARDINALITY & LENGTH CHECKS${colors.reset}`);

    // 1.1 index.html: 3 tier cards, 6 faq items, service cards length > 30 chars
    await driver.goto(`${baseUrl}/index.html`);
    const indexInvariants = await driver.evaluate(() => {
      const tierCards = document.querySelectorAll('.tier-card');
      const faqItems = document.querySelectorAll('.faq-item');
      const serviceCards = Array.from(document.querySelectorAll('#services .service-card, #services .interactive-spotlight, #services article'));
      const serviceLengths = serviceCards.map(c => ({
        tag: c.querySelector('h3, h4')?.textContent?.trim() || 'Service',
        length: c.textContent.trim().length,
        text: c.textContent.trim().substring(0, 60) + '...'
      }));

      return {
        tierCount: tierCards.length,
        faqCount: faqItems.length,
        serviceCount: serviceCards.length,
        serviceLengths,
        allServicesAbove30: serviceLengths.every(s => s.length > 30)
      };
    });

    assert(indexInvariants.tierCount === 3, `index.html has EXACTLY 3 .tier-card elements (got ${indexInvariants.tierCount})`);
    assert(indexInvariants.faqCount === 6, `index.html has EXACTLY 6 .faq-item elements (got ${indexInvariants.faqCount})`);
    assert(indexInvariants.serviceCount >= 4, `index.html has at least 4 service cards (got ${indexInvariants.serviceCount})`);
    assert(indexInvariants.allServicesAbove30, `All service cards have text length > 30 chars (got min ${Math.min(...indexInvariants.serviceLengths.map(s => s.length))} chars)`);
    indexInvariants.serviceLengths.forEach(s => {
      console.log(`    • ${s.tag}: ${s.length} chars (>30) — "${s.text.replace(/\s+/g, ' ')}"`);
    });

    report.cardinality.index = indexInvariants;

    // 1.2 services.html: 10 .card-tilt elements, 6 workflow steps
    await driver.goto(`${baseUrl}/services.html`);
    const servicesInvariants = await driver.evaluate(() => {
      const tiltCards = document.querySelectorAll('.card-tilt');
      const serviceCards = document.querySelectorAll('#services .service-card, .service-detail-card, [data-service-id]');
      const workflowSteps = document.querySelectorAll('#workflow-timeline .workflow-step, #workflow-timeline .timeline-step, .workflow-step');
      const stepNumbers = Array.from(workflowSteps).map(s => s.querySelector('.step-number, .step-num')?.textContent?.trim() || '');

      return {
        tiltCount: tiltCards.length,
        workflowCount: workflowSteps.length,
        stepNumbers
      };
    });

    assert(servicesInvariants.tiltCount === 10, `services.html has EXACTLY 10 .card-tilt elements (4 services + 6 workflow steps) (got ${servicesInvariants.tiltCount})`);
    assert(servicesInvariants.workflowCount === 6, `services.html has EXACTLY 6 workflow timeline steps (got ${servicesInvariants.workflowCount})`);
    report.cardinality.services = servicesInvariants;

    // 1.3 portfolio.html: 7 .card-tilt / .portfolio-card elements, category counts
    await driver.goto(`${baseUrl}/portfolio.html`);
    const portfolioInvariants = await driver.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.portfolio-card'));
      const tiltCards = document.querySelectorAll('.card-tilt');
      const catCounts = {
        all: cards.length,
        ecommerce: cards.filter(c => c.getAttribute('data-category') === 'ecommerce').length,
        corporate: cards.filter(c => c.getAttribute('data-category') === 'corporate').length,
        webapp: cards.filter(c => c.getAttribute('data-category') === 'webapp').length
      };

      return {
        cardCount: cards.length,
        tiltCount: tiltCards.length,
        catCounts
      };
    });

    assert(portfolioInvariants.cardCount === 7, `portfolio.html has EXACTLY 7 .portfolio-card elements (got ${portfolioInvariants.cardCount})`);
    assert(portfolioInvariants.tiltCount === 7, `portfolio.html has EXACTLY 7 .card-tilt elements (got ${portfolioInvariants.tiltCount})`);
    assert(portfolioInvariants.catCounts.ecommerce === 2, `Category 'ecommerce' has exactly 2 cards (got ${portfolioInvariants.catCounts.ecommerce})`);
    assert(portfolioInvariants.catCounts.corporate === 3, `Category 'corporate' has exactly 3 cards (got ${portfolioInvariants.catCounts.corporate})`);
    assert(portfolioInvariants.catCounts.webapp === 2, `Category 'webapp' has exactly 2 cards (got ${portfolioInvariants.catCounts.webapp})`);
    report.cardinality.portfolio = portfolioInvariants;

    // Test category filter buttons responsiveness
    const filterVerification = await driver.evaluate(async () => {
      const filterBtns = Array.from(document.querySelectorAll('.filter-btn, .portfolio-filter-btn, [data-filter]'));
      const cards = Array.from(document.querySelectorAll('.portfolio-card'));
      const results = {};

      for (const cat of ['all', 'ecommerce', 'corporate', 'webapp', 'all']) {
        const btn = filterBtns.find(b => b.getAttribute('data-filter') === cat);
        if (btn) {
          btn.click();
          await new Promise(r => setTimeout(r, 260));
          const visible = cards.filter(c => c.style.display !== 'none');
          results[cat + (results[cat] ? '_second' : '')] = visible.length;
        }
      }
      return results;
    });

    assert(filterVerification['all'] === 7, `Filter 'all' shows 7 cards (got ${filterVerification['all']})`);
    assert(filterVerification['ecommerce'] === 2, `Filter 'ecommerce' shows 2 cards (got ${filterVerification['ecommerce']})`);
    assert(filterVerification['corporate'] === 3, `Filter 'corporate' shows 3 cards (got ${filterVerification['corporate']})`);
    assert(filterVerification['webapp'] === 2, `Filter 'webapp' shows 2 cards (got ${filterVerification['webapp']})`);
    assert(filterVerification['all_second'] === 7, `Restoring 'all' smoothly restores 7 cards (got ${filterVerification['all_second']})`);

    // =========================================================================
    // SECTION 2: PRICING CALCULATOR RAPID STRESS (25+ CYCLES)
    // =========================================================================
    console.log(`\n${colors.bold}▶ [2] PRICING CALCULATOR RAPID STRESS (30 RANDOM CYCLES)${colors.reset}`);
    await driver.goto(`${baseUrl}/index.html`);

    const tiers = ['basic', 'pro', 'enterprise'];
    const addonNames = ['E-Commerce', 'Payment Gateway', 'Multi-Bahasa', 'Express Priority'];
    const stressCycles = [];

    // Pre-generate 30 deterministic/random combinations
    for (let i = 0; i < 30; i++) {
      const tier = tiers[i % tiers.length];
      const pages = 1 + ((i * 3 + 2) % 20); // 1 to 20
      const addons = [];
      if (i % 2 === 1) addons.push('E-Commerce');
      if (i % 3 === 0) addons.push('Payment Gateway');
      if (i % 4 === 1) addons.push('Multi-Bahasa');
      if (i % 5 === 0) addons.push('Express');
      stressCycles.push({ id: i + 1, tier, pages, addons });
    }

    const stressResults = await driver.evaluate((cycles) => {
      const calcSection = document.getElementById('pricing-calculator') || document.querySelector('.pricing-calculator-widget');
      if (!calcSection) return { error: 'Calculator section not found' };

      const tierInputs = Array.from(calcSection.querySelectorAll('input[name="tier"]'));
      const slider = calcSection.querySelector('#extra-pages');
      const addonCheckboxes = Array.from(calcSection.querySelectorAll('input[name="addon"]'));
      const priceDisplay = calcSection.querySelector('#calc-total-price');
      const timelineDisplay = calcSection.querySelector('#calc-total-timeline');
      const waBtn = calcSection.querySelector('#btn-calc-whatsapp');

      const CONFIG = {
        basic: { price: 2500000, days: 7, basePages: 1, extraPagePrice: 350000 },
        pro: { price: 5500000, days: 18, basePages: 5, extraPagePrice: 350000 },
        enterprise: { price: 12000000, days: 35, basePages: 10, extraPagePrice: 500000 }
      };

      const runLogs = [];
      let nanCount = 0;
      let formatGlitchCount = 0;
      let mathMismatchCount = 0;

      cycles.forEach(c => {
        // 1. Select tier
        const tInput = tierInputs.find(ti => ti.value === c.tier);
        if (tInput) {
          tInput.checked = true;
          tInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // 2. Set slider
        if (slider) {
          slider.value = c.pages;
          slider.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // 3. Set addons
        let isExpress = false;
        addonCheckboxes.forEach(cb => {
          const val = (cb.value || '').toLowerCase();
          const name = (cb.getAttribute('data-name') || '').toLowerCase();
          const isExp = cb.getAttribute('data-express') === 'true' || val === 'express';

          const shouldCheck = c.addons.some(a => {
            const al = a.toLowerCase();
            return val.includes(al) || name.includes(al) || (al === 'express' && isExp);
          });

          cb.checked = shouldCheck;
          if (shouldCheck && isExp) isExpress = true;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // 4. Capture rendered values
        const renderedPrice = priceDisplay ? priceDisplay.textContent.trim() : '';
        const renderedTimeline = timelineDisplay ? timelineDisplay.textContent.trim() : '';
        const waHref = waBtn ? waBtn.getAttribute('href') : '';

        // Invariant checks
        const hasNaN = renderedPrice.includes('NaN') || renderedTimeline.includes('NaN');
        const hasUndefined = renderedPrice.includes('undefined') || renderedTimeline.includes('undefined');
        const validPriceFormat = /^Rp\s+[\d\.]+$/.test(renderedPrice);
        const validTimelineFormat = /±?\s*\d+\s*-\s*\d+\s*Hari Kerja/i.test(renderedTimeline);

        if (hasNaN || hasUndefined) nanCount++;
        if (!validPriceFormat || !validTimelineFormat) formatGlitchCount++;

        // Calculate expected mathematical total
        const tierCfg = CONFIG[c.tier] || CONFIG.pro;
        const extraPages = Math.max(0, c.pages - tierCfg.basePages);
        let expectedSubtotal = tierCfg.price + (extraPages * tierCfg.extraPagePrice);
        let expectedDays = tierCfg.days + Math.ceil(extraPages * 0.5);

        addonCheckboxes.forEach(cb => {
          if (cb.checked) {
            const isExp = cb.getAttribute('data-express') === 'true' || cb.value === 'express';
            if (!isExp) {
              expectedSubtotal += parseInt(cb.getAttribute('data-price') || '0', 10);
              expectedDays += parseInt(cb.getAttribute('data-days') || '0', 10);
            }
          }
        });

        if (isExpress) {
          expectedSubtotal = Math.round(expectedSubtotal * 1.25);
          expectedDays = Math.max(5, Math.round(expectedDays * 0.6));
        }

        const expectedFormatted = 'Rp ' + expectedSubtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        if (renderedPrice !== expectedFormatted) {
          mathMismatchCount++;
        }

        runLogs.push({
          cycle: c.id,
          tier: c.tier,
          pages: c.pages,
          addons: c.addons,
          renderedPrice,
          renderedTimeline,
          expectedFormatted,
          match: renderedPrice === expectedFormatted
        });
      });

      return {
        totalCycles: cycles.length,
        nanCount,
        formatGlitchCount,
        mathMismatchCount,
        sampleLogs: runLogs.slice(0, 6)
      };
    }, stressCycles);

    assert(stressResults.nanCount === 0, `Zero NaN occurrences across ${stressResults.totalCycles} rapid pricing cycles (got ${stressResults.nanCount})`);
    assert(stressResults.formatGlitchCount === 0, `Zero price/timeline formatting glitches across ${stressResults.totalCycles} cycles (got ${stressResults.formatGlitchCount})`);
    assert(stressResults.mathMismatchCount === 0, `Zero mathematical mismatches across ${stressResults.totalCycles} cycles (got ${stressResults.mathMismatchCount})`);

    console.log(`    Sample Rapid Cycles:`);
    stressResults.sampleLogs.forEach(s => {
      console.log(`    • Cycle #${s.cycle} [${s.tier.toUpperCase()}, ${s.pages} pgs, addons: ${s.addons.join('/') || 'none'}]: ${s.renderedPrice} (${s.renderedTimeline})`);
    });

    report.pricingStress = stressResults;

    // =========================================================================
    // SECTION 3: MODAL LIFECYCLES (BACKDROP, CLOSE BTN, ESCAPE, SCROLL LOCK)
    // =========================================================================
    console.log(`\n${colors.bold}▶ [3] MODAL LIFECYCLES & SCROLL RESTORATION STRESS${colors.reset}`);

    // 3.1 Case Study Modal on portfolio.html
    await driver.goto(`${baseUrl}/portfolio.html`);

    // Verify initial hidden state
    const modalInitialState = await driver.evaluate(() => {
      const modal = document.getElementById('case-study-modal');
      const cs = window.getComputedStyle(modal);
      return {
        exists: !!modal,
        display: cs.display,
        ariaHidden: modal.getAttribute('aria-hidden'),
        bodyHasNoScroll: document.body.classList.contains('no-scroll')
      };
    });
    assert(modalInitialState.display === 'none', 'Case study modal starts hidden (display: none)');
    assert(modalInitialState.ariaHidden === 'true', 'Case study modal starts with aria-hidden="true"');
    assert(!modalInitialState.bodyHasNoScroll, 'Body scroll is not locked initially');

    // Test 1: Open modal -> Close via Close Button
    const testCloseButton = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study[data-project-id="nexastore"], [data-project-id="nexastore"]');
      if (trigger) trigger.click();

      const modal = document.getElementById('case-study-modal');
      const openDisplay = window.getComputedStyle(modal).display;
      const openAria = modal.getAttribute('aria-hidden');
      const openBodyNoScroll = document.body.classList.contains('no-scroll');
      const openTitle = modal.querySelector('#modal-title')?.textContent?.trim();

      // Click close button
      const closeBtn = modal.querySelector('.modal-close, [data-close], .btn-close');
      if (closeBtn) closeBtn.click();

      const closedDisplay = window.getComputedStyle(modal).display;
      const closedAria = modal.getAttribute('aria-hidden');
      const closedBodyNoScroll = document.body.classList.contains('no-scroll');

      return {
        openDisplay,
        openAria,
        openBodyNoScroll,
        openTitle,
        closedDisplay,
        closedAria,
        closedBodyNoScroll
      };
    });

    assert(testCloseButton.openDisplay === 'flex', `Modal opened with display: flex on trigger click (got ${testCloseButton.openDisplay})`);
    assert(testCloseButton.openAria === 'false', 'Modal has aria-hidden="false" when opened');
    assert(testCloseButton.openBodyNoScroll === true, 'Body scroll locked with .no-scroll on modal open');
    assert(testCloseButton.closedDisplay === 'none', 'Modal closed with display: none on close button click');
    assert(testCloseButton.closedAria === 'true', 'Modal has aria-hidden="true" after close button click');
    assert(testCloseButton.closedBodyNoScroll === false, 'Body scroll restored (no .no-scroll) after close button click');

    // Test 2: Open modal -> Close via Escape key
    const testEscapeKey = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study[data-project-id="flowpulse"], [data-project-id="flowpulse"]');
      if (trigger) trigger.click();

      const modal = document.getElementById('case-study-modal');
      const openDisplay = window.getComputedStyle(modal).display;

      // Dispatch Escape key
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));

      const closedDisplay = window.getComputedStyle(modal).display;
      const closedAria = modal.getAttribute('aria-hidden');
      const closedBodyNoScroll = document.body.classList.contains('no-scroll');

      return {
        openDisplay,
        closedDisplay,
        closedAria,
        closedBodyNoScroll
      };
    });

    assert(testEscapeKey.openDisplay === 'flex', 'Modal opened for flowpulse project');
    assert(testEscapeKey.closedDisplay === 'none', 'Escape key dismissed modal cleanly (display: none)');
    assert(testEscapeKey.closedAria === 'true', 'Escape key restored aria-hidden="true"');
    assert(testEscapeKey.closedBodyNoScroll === false, 'Escape key restored body scroll');

    // Test 3: Open modal -> Close via Backdrop click
    const testBackdropClick = await driver.evaluate(() => {
      const trigger = document.querySelector('.btn-case-study[data-project-id="karalia"], [data-project-id="karalia"]');
      if (trigger) trigger.click();

      const modal = document.getElementById('case-study-modal');
      const openDisplay = window.getComputedStyle(modal).display;

      // Click backdrop (modal element itself outside dialog)
      modal.dispatchEvent(new MouseEvent('click', { bubbles: true, target: modal }));

      const closedDisplay = window.getComputedStyle(modal).display;
      const closedAria = modal.getAttribute('aria-hidden');
      const closedBodyNoScroll = document.body.classList.contains('no-scroll');

      return {
        openDisplay,
        closedDisplay,
        closedAria,
        closedBodyNoScroll
      };
    });

    assert(testBackdropClick.openDisplay === 'flex', 'Modal opened for karalia project');
    assert(testBackdropClick.closedDisplay === 'none', 'Backdrop click dismissed modal cleanly (display: none)');
    assert(testBackdropClick.closedAria === 'true', 'Backdrop click restored aria-hidden="true"');
    assert(testBackdropClick.closedBodyNoScroll === false, 'Backdrop click restored body scroll');

    // 3.2 Service Detail Modal on services.html
    await driver.goto(`${baseUrl}/services.html`);
    const serviceModalTest = await driver.evaluate(() => {
      const modal = document.getElementById('service-modal');
      const trigger = document.querySelector('.btn-service-modal[data-service-id="custom-web"], [data-service-id="custom-web"]');
      if (!modal || !trigger) return { error: 'Service modal or trigger missing' };

      // Open
      trigger.click();
      const openDisplay = window.getComputedStyle(modal).display;
      const openAria = modal.getAttribute('aria-hidden');
      const openScroll = document.body.classList.contains('no-scroll');

      // Dismiss via Escape
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
      const closedDisplay = window.getComputedStyle(modal).display;
      const closedAria = modal.getAttribute('aria-hidden');
      const closedScroll = document.body.classList.contains('no-scroll');

      return {
        openDisplay,
        openAria,
        openScroll,
        closedDisplay,
        closedAria,
        closedScroll
      };
    });

    assert(serviceModalTest.openDisplay === 'flex', 'Service modal opened with display: flex');
    assert(serviceModalTest.openScroll === true, 'Service modal open locked body scroll');
    assert(serviceModalTest.closedDisplay === 'none', 'Service modal dismissed cleanly with Escape');
    assert(serviceModalTest.closedScroll === false, 'Service modal close restored body scroll');

    report.modalLifecycles = { testCloseButton, testEscapeKey, testBackdropClick, serviceModalTest };

    // =========================================================================
    // SECTION 4: CONTACT FORM INLINE VALIDATION STRESS
    // =========================================================================
    console.log(`\n${colors.bold}▶ [4] CONTACT FORM VALIDATION STRESS${colors.reset}`);
    await driver.goto(`${baseUrl}/contact.html`);

    // 4.1 Empty Submission Stress
    const emptySubmitResult = await driver.evaluate(() => {
      const form = document.getElementById('contact-form') || document.querySelector('.consultation-form');
      const submitBtn = document.getElementById('btn-submit-consultation') || form.querySelector('button[type="submit"]');

      // Click submit on completely empty form
      submitBtn.click();

      const errName = document.getElementById('error-name')?.textContent || '';
      const errEmail = document.getElementById('error-email')?.textContent || '';
      const errPhone = document.getElementById('error-phone')?.textContent || '';
      const errMessage = document.getElementById('error-message')?.textContent || '';

      const activeElementId = document.activeElement ? document.activeElement.id : '';

      return {
        errName,
        errEmail,
        errPhone,
        errMessage,
        activeElementId
      };
    });

    assert(emptySubmitResult.errName.includes('minimal 3 karakter'), `Name error contains 'minimal 3 karakter' (got: "${emptySubmitResult.errName}")`);
    assert(emptySubmitResult.errEmail.includes('tidak valid') || emptySubmitResult.errEmail.includes('wajib diisi'), `Email error flagged on empty submit (got: "${emptySubmitResult.errEmail}")`);
    assert(emptySubmitResult.errPhone.includes('08') || emptySubmitResult.errPhone.includes('wajib diisi'), `Phone error flagged on empty submit (got: "${emptySubmitResult.errPhone}")`);
    assert(emptySubmitResult.errMessage.includes('minimal 10 karakter'), `Message error contains 'minimal 10 karakter' (got: "${emptySubmitResult.errMessage}")`);
    assert(emptySubmitResult.activeElementId === 'name', `First invalid field (#name) receives focus on failed submit (got #${emptySubmitResult.activeElementId})`);

    // 4.2 Malformed Inputs Stress
    const malformedInputsResult = await driver.evaluate(() => {
      const form = document.getElementById('contact-form') || document.querySelector('.consultation-form');
      const submitBtn = document.getElementById('btn-submit-consultation') || form.querySelector('button[type="submit"]');
      const nameInp = form.querySelector('#name');
      const emailInp = form.querySelector('#email');
      const phoneInp = form.querySelector('#phone');
      const msgInp = form.querySelector('#message');

      // 1. Invalid values
      nameInp.value = 'Ab'; // < 3 chars
      emailInp.value = 'user@domain_invalid'; // invalid RFC email
      phoneInp.value = '021123456'; // not 08 or +628
      msgInp.value = 'pendek'; // < 10 chars

      submitBtn.click();

      const errName = document.getElementById('error-name')?.textContent || '';
      const errEmail = document.getElementById('error-email')?.textContent || '';
      const errPhone = document.getElementById('error-phone')?.textContent || '';
      const errMessage = document.getElementById('error-message')?.textContent || '';

      return {
        errName,
        errEmail,
        errPhone,
        errMessage
      };
    });

    assert(malformedInputsResult.errName.includes('minimal 3 karakter'), `Short name flagged with 'minimal 3 karakter'`);
    assert(malformedInputsResult.errEmail.includes('tidak valid'), `Malformed email flagged with 'tidak valid' (got: "${malformedInputsResult.errEmail}")`);
    assert(malformedInputsResult.errPhone.includes('08'), `Non-08 phone flagged with '08' requirement (got: "${malformedInputsResult.errPhone}")`);
    assert(malformedInputsResult.errMessage.includes('minimal 10 karakter'), `Short message flagged with 'minimal 10 karakter'`);

    // 4.3 Valid Input Clearance & Submission
    const validSubmitResult = await driver.evaluate(() => {
      const form = document.getElementById('contact-form') || document.querySelector('.consultation-form');
      const submitBtn = document.getElementById('btn-submit-consultation') || form.querySelector('button[type="submit"]');
      const nameInp = form.querySelector('#name');
      const compInp = form.querySelector('#company');
      const emailInp = form.querySelector('#email');
      const phoneInp = form.querySelector('#phone');
      const pkgSel = form.querySelector('#package');
      const msgInp = form.querySelector('#message');
      const banner = document.getElementById('form-success-banner');

      nameInp.value = 'PT Rubic Engineering Client';
      compInp.value = 'Global Technology PT';
      emailInp.value = 'cto@globaltech.co.id';
      phoneInp.value = '081234567890';
      if (pkgSel) pkgSel.value = pkgSel.options[1].value;
      msgInp.value = 'Kami membutuhkan rekayasa web kustom dengan standar clean code dan PageSpeed 95+.';

      // Clear window.open to prevent popup in headless test
      window.open = function(url) { window.__lastOpenedUrl = url; };

      submitBtn.click();

      const bannerVisible = banner && (window.getComputedStyle(banner).display !== 'none');
      const bannerRole = banner?.getAttribute('role');
      const waUrl = window.__lastOpenedUrl || '';

      const errNameDisplay = window.getComputedStyle(document.getElementById('error-name')).display;
      const errEmailDisplay = window.getComputedStyle(document.getElementById('error-email')).display;

      return {
        bannerVisible,
        bannerRole,
        waUrl,
        errorsCleared: errNameDisplay === 'none' && errEmailDisplay === 'none'
      };
    });

    assert(validSubmitResult.bannerVisible === true, 'Success banner is displayed upon valid submission');
    assert(validSubmitResult.bannerRole === 'status', 'Success banner has role="status" for accessibility');
    assert(validSubmitResult.waUrl.includes('6285280008984'), 'WhatsApp direct link generated with correct target number');
    assert(validSubmitResult.waUrl.includes('PT%20Rubic%20Engineering%20Client') || validSubmitResult.waUrl.includes('PT+Rubic+Engineering+Client') || decodeURIComponent(validSubmitResult.waUrl).includes('PT Rubic Engineering Client'), 'WhatsApp message contains submitted client name');
    assert(validSubmitResult.errorsCleared === true, 'All inline error labels cleanly cleared upon valid submission');

    report.contactValidation = { emptySubmitResult, malformedInputsResult, validSubmitResult };

    // =========================================================================
    // SECTION 5: PROGRAMMATIC TEXT BREVITY MEASUREMENT
    // =========================================================================
    console.log(`\n${colors.bold}▶ [5] EMPIRICAL TEXT BREVITY MEASUREMENT (BEFORE vs AFTER M7)${colors.reset}`);

    function extractVisibleText(html) {
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z0-9#]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    const pages = ['index.html', 'services.html', 'portfolio.html', 'contact.html'];
    let grandBeforeWords = 0;
    let grandAfterWords = 0;
    let grandBeforeChars = 0;
    let grandAfterChars = 0;
    const pageBrevityStats = {};

    for (const p of pages) {
      const beforeHtml = execSync(`git show HEAD:${p}`, { shell: 'powershell.exe' }).toString();
      const afterHtml = fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8');

      const beforeText = extractVisibleText(beforeHtml);
      const afterText = extractVisibleText(afterHtml);

      const beforeWords = beforeText.split(/\s+/).filter(Boolean).length;
      const afterWords = afterText.split(/\s+/).filter(Boolean).length;

      const beforeChars = beforeText.length;
      const afterChars = afterText.length;

      const wordReductionPct = ((beforeWords - afterWords) / beforeWords * 100).toFixed(1);
      const charReductionPct = ((beforeChars - afterChars) / beforeChars * 100).toFixed(1);

      grandBeforeWords += beforeWords;
      grandAfterWords += afterWords;
      grandBeforeChars += beforeChars;
      grandAfterChars += afterChars;

      pageBrevityStats[p] = {
        beforeWords,
        afterWords,
        wordReductionPct: `${wordReductionPct}%`,
        beforeChars,
        afterChars,
        charReductionPct: `${charReductionPct}%`
      };

      console.log(`  📄 ${p}:`);
      console.log(`     • Word count: ${beforeWords} -> ${afterWords} (-${wordReductionPct}%)`);
      console.log(`     • Char count: ${beforeChars} -> ${afterChars} (-${charReductionPct}%)`);
      assert(afterWords < beforeWords, `${p} word count is strictly reduced (${beforeWords} -> ${afterWords})`);
      assert(afterChars < beforeChars, `${p} character count is strictly reduced (${beforeChars} -> ${afterChars})`);
    }

    const totalWordReductionPct = ((grandBeforeWords - grandAfterWords) / grandBeforeWords * 100).toFixed(1);
    const totalCharReductionPct = ((grandBeforeChars - grandAfterChars) / grandBeforeChars * 100).toFixed(1);

    console.log(`\n  🏆 OVERALL TEXT REDUCTION METRICS:`);
    console.log(`     • Total Words: ${grandBeforeWords} -> ${grandAfterWords} (${grandBeforeWords - grandAfterWords} words cut, -${totalWordReductionPct}%)`);
    console.log(`     • Total Chars: ${grandBeforeChars} -> ${grandAfterChars} (${grandBeforeChars - grandAfterChars} chars cut, -${totalCharReductionPct}%)`);

    assert(parseFloat(totalWordReductionPct) >= 20.0, `Site-wide word count reduced by at least 20% (achieved -${totalWordReductionPct}%)`);
    assert(parseFloat(totalCharReductionPct) >= 20.0, `Site-wide character count reduced by at least 20% (achieved -${totalCharReductionPct}%)`);

    report.textBrevity = {
      pages: pageBrevityStats,
      grandTotal: {
        beforeWords: grandBeforeWords,
        afterWords: grandAfterWords,
        wordsCut: grandBeforeWords - grandAfterWords,
        totalWordReductionPct: `${totalWordReductionPct}%`,
        beforeChars: grandBeforeChars,
        afterChars: grandAfterChars,
        charsCut: grandBeforeChars - grandAfterChars,
        totalCharReductionPct: `${totalCharReductionPct}%`
      }
    };

  } finally {
    await driver.close();
    await server.stop();
  }

  // Final Summary
  report.totalAsserts = totalAsserts;
  report.passedAsserts = passedAsserts;
  report.failedAsserts = failedAsserts;
  report.verdict = failedAsserts === 0 ? 'APPROVE' : 'REQUEST_CHANGES';

  const reportPath = path.resolve(__dirname, 'challenger-m7-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n${colors.bold}${colors.cyan}================================================================`);
  console.log(` CHALLENGER m7_2 TEST SUITE SUMMARY`);
  console.log(`================================================================${colors.reset}`);
  console.log(`Total Assertions : ${totalAsserts}`);
  console.log(`Passed           : ${passedAsserts}`);
  console.log(`Failed           : ${failedAsserts}`);
  console.log(`Report written   : ${reportPath}`);

  if (failedAsserts === 0) {
    console.log(`\n${colors.bold}${colors.green}🏆 AUDIT VERDICT: APPROVE (100% PASS, 0 REGRESSIONS)${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.bold}${colors.red}❌ AUDIT VERDICT: REQUEST_CHANGES (${failedAsserts} failures)${colors.reset}\n`);
    process.exit(1);
  }
}

runEmpiricalStressSuite().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
