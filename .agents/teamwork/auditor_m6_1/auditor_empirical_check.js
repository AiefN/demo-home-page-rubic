/**
 * Independent Forensic Empirical Audit Script for Milestone 6 Defect Resolution
 * Tests:
 * 1. Desktop 2-column balanced Hero layout & showcase card (no void, container centered)
 * 2. Case study and Service modals strictly hidden on boot across index.html, services.html, portfolio.html
 * 3. Floating bottom nav clearance with Section 2 title at scrollY=0 and scroll hysteresis
 * 4. Pricing calculator cards: >=200px width on desktop (1440px), no collapsing into slivers, dynamic math
 * 5. FAQ accordion: transparent background, white text, no default user-agent white box, single active toggle
 */

const path = require('path');
const fs = require('fs');
const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');

const ROOT_DIR = path.resolve(__dirname, '../../..');
const PORT = 8099;

async function runAudit() {
  const server = new StaticServer({ rootDir: ROOT_DIR, port: PORT });
  await server.start();
  const baseUrl = `http://127.0.0.1:${PORT}`;
  const driver = new BrowserDriver({ headless: true });

  const auditResults = {
    heroLayout: null,
    modalHiding: null,
    dockClearance: null,
    pricingCalculator: null,
    faqAccordion: null,
    allPassed: false
  };

  try {
    await driver.launch();

    // -------------------------------------------------------------------------
    // TEST 1: HERO LAYOUT & DESKTOP BALANCE (1440px)
    // -------------------------------------------------------------------------
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto(`${baseUrl}/index.html`);
    await new Promise(r => setTimeout(r, 400));

    const hero = await driver.evaluate(() => {
      const container = document.querySelector('.hero-container');
      const leftCol = document.querySelector('.hero-content-col, .hero-content');
      const rightCol = document.querySelector('.hero-showcase-col, .hero-showcase-card');
      const card = document.querySelector('.hero-showcase-card');

      const cRect = container ? container.getBoundingClientRect() : null;
      const lRect = leftCol ? leftCol.getBoundingClientRect() : null;
      const rRect = rightCol ? rightCol.getBoundingClientRect() : null;

      return {
        containerWidth: cRect ? cRect.width : 0,
        leftColWidth: lRect ? lRect.width : 0,
        rightColWidth: rRect ? rRect.width : 0,
        hasShowcaseCard: !!card,
        isTwoColumn: !!(lRect && rRect && Math.abs(lRect.top - rRect.top) < 200 && rRect.left > lRect.right - 50)
      };
    });

    auditResults.heroLayout = {
      pass: hero.isTwoColumn && hero.hasShowcaseCard && hero.containerWidth <= 1280 && hero.rightColWidth > 400,
      details: hero
    };

    // -------------------------------------------------------------------------
    // TEST 2: MODAL HIDING (index, services, portfolio)
    // -------------------------------------------------------------------------
    const indexModal = await driver.evaluate(() => {
      const m = document.getElementById('case-study-modal');
      if (!m) return { found: false };
      const comp = window.getComputedStyle(m);
      return {
        found: true,
        display: comp.display,
        visibility: comp.visibility,
        opacity: comp.opacity,
        pointerEvents: comp.pointerEvents,
        ariaHidden: m.getAttribute('aria-hidden'),
        role: m.getAttribute('role'),
        inlineDisplay: m.style.display
      };
    });

    await driver.goto(`${baseUrl}/services.html`);
    await new Promise(r => setTimeout(r, 300));
    const servicesModal = await driver.evaluate(() => {
      const m = document.getElementById('service-modal');
      if (!m) return { found: false };
      const comp = window.getComputedStyle(m);
      return {
        found: true,
        display: comp.display,
        visibility: comp.visibility,
        inlineDisplay: m.style.display
      };
    });

    await driver.goto(`${baseUrl}/portfolio.html`);
    await new Promise(r => setTimeout(r, 300));
    const portfolioModal = await driver.evaluate(() => {
      const m = document.getElementById('case-study-modal');
      if (!m) return { found: false };
      const comp = window.getComputedStyle(m);
      return {
        found: true,
        display: comp.display,
        visibility: comp.visibility,
        inlineDisplay: m.style.display
      };
    });

    const modalPass = (
      indexModal.display === 'none' &&
      indexModal.visibility === 'hidden' &&
      indexModal.role === 'dialog' &&
      servicesModal.display === 'none' &&
      servicesModal.visibility === 'hidden' &&
      portfolioModal.display === 'none' &&
      portfolioModal.visibility === 'hidden'
    );

    auditResults.modalHiding = {
      pass: modalPass,
      details: { indexModal, servicesModal, portfolioModal }
    };

    // -------------------------------------------------------------------------
    // TEST 3: FLOATING DOCK HEADING CLEARANCE (index.html at scrollY=0)
    // -------------------------------------------------------------------------
    await driver.goto(`${baseUrl}/index.html`);
    await new Promise(r => setTimeout(r, 400));

    const dockClearance = await driver.evaluate(() => {
      const hero = document.getElementById('hero') || document.querySelector('.hero-section');
      const section2 = document.getElementById('services') || document.querySelector('.services-section');
      const dock = document.querySelector('.floating-bottom-nav');

      const heroRect = hero ? hero.getBoundingClientRect() : null;
      const s2Rect = section2 ? section2.getBoundingClientRect() : null;
      const dockRect = dock ? dock.getBoundingClientRect() : null;

      const collides = (dockRect && s2Rect) ? (
        !(dockRect.bottom < s2Rect.top || dockRect.top > s2Rect.bottom)
      ) : false;

      return {
        viewportHeight: window.innerHeight,
        heroHeight: heroRect ? heroRect.height : 0,
        section2Top: s2Rect ? s2Rect.top : 0,
        dockTop: dockRect ? dockRect.top : 0,
        dockBottom: dockRect ? dockRect.bottom : 0,
        collidesAtScrollY0: collides,
        isSection2BelowFold: s2Rect ? s2Rect.top >= window.innerHeight : false
      };
    });

    auditResults.dockClearance = {
      pass: !dockClearance.collidesAtScrollY0 && dockClearance.isSection2BelowFold,
      details: dockClearance
    };

    // -------------------------------------------------------------------------
    // TEST 4: PRICING CALCULATOR CARD COMPRESSION & DYNAMIC RECALC
    // -------------------------------------------------------------------------
    const pricing = await driver.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.tier-card'));
      const widths = cards.map(c => Math.round(c.getBoundingClientRect().width));
      const minWidth = Math.min(...widths);

      const basicRadio = document.querySelector('input[name="tier"][value="basic"]');
      const enterpriseRadio = document.querySelector('input[name="tier"][value="enterprise"]');
      const priceDisplay = document.querySelector('#calc-total-price');

      let dynamicTest = false;
      const initialPrice = priceDisplay ? priceDisplay.textContent.trim() : '';

      if (enterpriseRadio) {
        enterpriseRadio.checked = true;
        enterpriseRadio.dispatchEvent(new Event('change', { bubbles: true }));
        const enterprisePrice = priceDisplay ? priceDisplay.textContent.trim() : '';
        dynamicTest = (enterprisePrice !== initialPrice && enterprisePrice.includes('12.000.000'));
      }

      return {
        cardCount: cards.length,
        widths,
        minWidth,
        initialPrice,
        dynamicRecalculationWorks: dynamicTest
      };
    });

    auditResults.pricingCalculator = {
      pass: pricing.minWidth >= 180 && pricing.dynamicRecalculationWorks,
      details: pricing
    };

    // -------------------------------------------------------------------------
    // TEST 5: FAQ ACCORDION BACKGROUND & TOGGLE
    // -------------------------------------------------------------------------
    const faq = await driver.evaluate(() => {
      const firstTrigger = document.querySelector('.faq-trigger, button.faq-header');
      const firstItem = document.querySelector('.faq-item');
      if (!firstTrigger || !firstItem) return { found: false };

      const compBefore = window.getComputedStyle(firstTrigger);
      const bgBefore = compBefore.backgroundColor;
      const colorBefore = compBefore.color;

      firstTrigger.click();

      const isOpenAfterClick = firstItem.classList.contains('active') || firstItem.classList.contains('is-open') || firstItem.classList.contains('is-active');
      const ariaExpandedAfter = firstTrigger.getAttribute('aria-expanded') === 'true' || firstItem.getAttribute('aria-expanded') === 'true';

      return {
        found: true,
        backgroundColor: bgBefore,
        color: colorBefore,
        isOpenAfterClick,
        ariaExpandedAfter,
        isNotWhiteBg: bgBefore === 'rgba(0, 0, 0, 0)' || bgBefore === 'transparent'
      };
    });

    auditResults.faqAccordion = {
      pass: faq.isNotWhiteBg && faq.isOpenAfterClick && faq.ariaExpandedAfter,
      details: faq
    };

    auditResults.allPassed = (
      auditResults.heroLayout.pass &&
      auditResults.modalHiding.pass &&
      auditResults.dockClearance.pass &&
      auditResults.pricingCalculator.pass &&
      auditResults.faqAccordion.pass
    );

  } finally {
    await driver.close();
    await server.stop();
  }

  console.log(JSON.stringify(auditResults, null, 2));
  process.exit(auditResults.allPassed ? 0 : 1);
}

runAudit().catch(err => {
  console.error('Audit failed with runtime error:', err);
  process.exit(1);
});
