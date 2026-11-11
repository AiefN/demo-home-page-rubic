const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');
const path = require('path');
const fs = require('fs');

async function verifyAll() {
  const server = new StaticServer({ rootDir: path.resolve(__dirname, '../../..'), port: 8098 });
  await server.start();
  const driver = new BrowserDriver({ headless: true });
  await driver.launch();

  const results = {};

  try {
    // --------------------------------------------------------------------------
    // 1. DESKTOP 1440x900 VERIFICATION
    // --------------------------------------------------------------------------
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto('http://127.0.0.1:8098/index.html');
    await new Promise(r => setTimeout(r, 600));

    results.desktop1440 = await driver.evaluate(() => {
      // 1. Hero Balance & Columns
      const heroContainer = document.querySelector('.hero-container');
      const leftCol = document.querySelector('.hero-content-col');
      const rightCol = document.querySelector('.hero-showcase-col');
      const showcaseCard = document.querySelector('.hero-showcase-card');
      const containerRect = heroContainer ? heroContainer.getBoundingClientRect() : null;
      const leftRect = leftCol ? leftCol.getBoundingClientRect() : null;
      const rightRect = rightCol ? rightCol.getBoundingClientRect() : null;

      // 2. Stray Modal Default Hidden
      const modal = document.querySelector('#case-study-modal');
      const modalCS = modal ? window.getComputedStyle(modal) : null;
      const modalDialog = modal ? modal.querySelector('.modal-dialog') : null;
      const dialogCS = modalDialog ? window.getComputedStyle(modalDialog) : null;

      // 3. Floating Dock Clearance at scrollY = 0
      const dock = document.querySelector('.floating-bottom-nav');
      const dockRect = dock ? dock.getBoundingClientRect() : null;
      const servicesSection = document.getElementById('services');
      const servicesTitle = servicesSection ? servicesSection.querySelector('.section-title') : null;
      const servicesTitleRect = servicesTitle ? servicesTitle.getBoundingClientRect() : null;

      let dockCollidesTitle = false;
      if (dockRect && servicesTitleRect) {
        dockCollidesTitle = !(
          dockRect.bottom < servicesTitleRect.top ||
          dockRect.top > servicesTitleRect.bottom ||
          dockRect.right < servicesTitleRect.left ||
          dockRect.left > servicesTitleRect.right
        );
      }

      // 4. Pricing Calculator Tier Cards
      const tierContainer = document.querySelector('.tier-selector, .tier-options, .tier-cards-group');
      const tierCards = Array.from(document.querySelectorAll('.tier-card'));
      const tierCardWidths = tierCards.map(c => Math.round(c.getBoundingClientRect().width));

      // 5. FAQ Accordion Styling
      const faqBtn = document.querySelector('.faq-trigger');
      const faqCS = faqBtn ? window.getComputedStyle(faqBtn) : null;
      const faqQuestion = document.querySelector('.faq-question');
      const faqQCS = faqQuestion ? window.getComputedStyle(faqQuestion) : null;

      return {
        hero: {
          containerWidth: containerRect ? Math.round(containerRect.width) : 0,
          leftColWidth: leftRect ? Math.round(leftRect.width) : 0,
          rightColWidth: rightRect ? Math.round(rightRect.width) : 0,
          hasShowcaseCard: !!showcaseCard,
          isBalancedTwoColumn: leftRect && rightRect && leftRect.width > 500 && rightRect.width > 400
        },
        modalInitialState: {
          computedDisplay: modalCS ? modalCS.display : null,
          computedVisibility: modalCS ? modalCS.visibility : null,
          computedOpacity: modalCS ? modalCS.opacity : null,
          pointerEvents: modalCS ? modalCS.pointerEvents : null,
          isHidden: modalCS && (modalCS.display === 'none' || modalCS.visibility === 'hidden')
        },
        dockClearanceAtScrollY0: {
          dockTop: dockRect ? Math.round(dockRect.top) : null,
          dockBottom: dockRect ? Math.round(dockRect.bottom) : null,
          servicesTitleTop: servicesTitleRect ? Math.round(servicesTitleRect.top) : null,
          servicesTitleBottom: servicesTitleRect ? Math.round(servicesTitleRect.bottom) : null,
          isPushedBelowFold: servicesTitleRect ? servicesTitleRect.top >= 900 : false,
          dockCollidesTitle: dockCollidesTitle
        },
        pricingCalculator: {
          tierCardCount: tierCards.length,
          tierCardWidths: tierCardWidths,
          allCardsWide: tierCardWidths.every(w => w >= 200),
          isNotCollapsed: tierCardWidths.every(w => w > 100)
        },
        faqAccordion: {
          btnBg: faqCS ? faqCS.backgroundColor : null,
          btnColor: faqCS ? faqCS.color : null,
          btnBorder: faqCS ? faqCS.border : null,
          questionBg: faqQCS ? faqQCS.backgroundColor : null,
          questionColor: faqQCS ? faqQCS.color : null,
          isTransparentDarkTheme: faqCS && (faqCS.backgroundColor === 'rgba(0, 0, 0, 0)' || faqCS.backgroundColor === 'transparent') && faqCS.color !== 'rgb(0, 0, 0)'
        }
      };
    });

    // --------------------------------------------------------------------------
    // 2. MOBILE 375x667 VERIFICATION
    // --------------------------------------------------------------------------
    await driver.setViewport({ width: 375, height: 667 });
    await driver.goto('http://127.0.0.1:8098/index.html');
    await new Promise(r => setTimeout(r, 600));

    results.mobile375 = await driver.evaluate(() => {
      const tierCards = Array.from(document.querySelectorAll('.tier-card'));
      const tierWidths = tierCards.map(c => Math.round(c.getBoundingClientRect().width));
      const dock = document.querySelector('.floating-bottom-nav');
      const dockCS = dock ? window.getComputedStyle(dock) : null;

      return {
        tierWidths: tierWidths,
        isStackedSingleColumn: tierWidths.every(w => w >= 280),
        dockHiddenOnMobile: dockCS ? dockCS.display === 'none' : true
      };
    });

    // --------------------------------------------------------------------------
    // 3. SUBPAGES MODAL VERIFICATION
    // --------------------------------------------------------------------------
    await driver.goto('http://127.0.0.1:8098/services.html');
    await new Promise(r => setTimeout(r, 400));
    results.servicesPageModal = await driver.evaluate(() => {
      const serviceModal = document.querySelector('#service-modal');
      const cs = serviceModal ? window.getComputedStyle(serviceModal) : null;
      return {
        display: cs ? cs.display : null,
        visibility: cs ? cs.visibility : null,
        isHidden: cs ? (cs.display === 'none' || cs.visibility === 'hidden') : true
      };
    });

    await driver.goto('http://127.0.0.1:8098/portfolio.html');
    await new Promise(r => setTimeout(r, 400));
    results.portfolioPageModal = await driver.evaluate(() => {
      const caseModal = document.querySelector('#case-study-modal');
      const cs = caseModal ? window.getComputedStyle(caseModal) : null;
      return {
        display: cs ? cs.display : null,
        visibility: cs ? cs.visibility : null,
        isHidden: cs ? (cs.display === 'none' || cs.visibility === 'hidden') : true
      };
    });

  } finally {
    await driver.close();
    await server.stop();
  }

  const outputPath = path.resolve(__dirname, 'verification_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log('Verification Results written to:', outputPath);
  console.log(JSON.stringify(results, null, 2));
}

verifyAll().catch(e => {
  console.error('Verification failed:', e);
  process.exit(1);
});
