const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');
const path = require('path');
const fs = require('fs');

async function runAdversarialAudit() {
  const server = new StaticServer({ rootDir: path.resolve(__dirname, '../../..'), port: 8105 });
  await server.start();
  const driver = new BrowserDriver({ headless: true });
  await driver.launch();

  const auditReport = {
    viewports: {},
    modalStateAudit: {},
    dockHysteresisAudit: {},
    calculatorInteractionAudit: {},
    faqInteractionAudit: {},
    overflowAudit: []
  };

  const pages = ['index.html', 'services.html', 'portfolio.html', 'contact.html'];
  const viewports = [
    { width: 320, height: 568, name: '320px_se' },
    { width: 375, height: 667, name: '375px_mobile' },
    { width: 768, height: 1024, name: '768px_tablet' },
    { width: 1024, height: 768, name: '1024px_desktop' },
    { width: 1280, height: 800, name: '1280px_standard' },
    { width: 1440, height: 900, name: '1440px_wide' },
    { width: 1920, height: 1080, name: '1920px_ultrawide' }
  ];

  try {
    // -------------------------------------------------------------------------
    // TEST 1: HORIZONTAL OVERFLOW ACROSS ALL 4 PAGES & 7 VIEWPORTS (28 Checks)
    // -------------------------------------------------------------------------
    for (const vp of viewports) {
      await driver.setViewport({ width: vp.width, height: vp.height, mobile: vp.width < 768 });
      for (const p of pages) {
        await driver.goto(`http://127.0.0.1:8105/${p}`);
        await new Promise(r => setTimeout(r, 200));

        const overflowCheck = await driver.evaluate((expectedWidth) => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const innerWidth = window.innerWidth;
          const hasOverflow = scrollWidth > innerWidth + 1; // 1px rounding tolerance
          return {
            scrollWidth,
            innerWidth,
            hasOverflow
          };
        }, vp.width);

        auditReport.overflowAudit.push({
          page: p,
          viewport: vp.name,
          expectedWidth: vp.width,
          scrollWidth: overflowCheck.scrollWidth,
          hasOverflow: overflowCheck.hasOverflow
        });

        if (overflowCheck.hasOverflow) {
          console.error(`OVERFLOW DETECTED: ${p} at ${vp.name} (scrollWidth: ${overflowCheck.scrollWidth} > innerWidth: ${vp.width})`);
        }
      }
    }

    // -------------------------------------------------------------------------
    // TEST 2: ULTRA-WIDE (1920px) & DESKTOP (1440px) CONTAINER CENTERING & HERO
    // -------------------------------------------------------------------------
    await driver.setViewport({ width: 1920, height: 1080 });
    await driver.goto('http://127.0.0.1:8105/index.html');
    await new Promise(r => setTimeout(r, 400));

    const wideHero = await driver.evaluate(() => {
      const container = document.querySelector('.hero-container');
      const rect = container.getBoundingClientRect();
      const style = window.getComputedStyle(container);
      const leftCol = document.querySelector('.hero-content-col');
      const rightCol = document.querySelector('.hero-showcase-col');
      const showcaseCard = document.querySelector('.hero-showcase-card');

      const bodyRect = document.body.getBoundingClientRect();
      const leftMargin = rect.left;
      const rightMargin = window.innerWidth - rect.right;

      return {
        containerWidth: Math.round(rect.width),
        leftMargin: Math.round(leftMargin),
        rightMargin: Math.round(rightMargin),
        isCentered: Math.abs(leftMargin - rightMargin) <= 2,
        leftColWidth: leftCol ? Math.round(leftCol.getBoundingClientRect().width) : 0,
        rightColWidth: rightCol ? Math.round(rightCol.getBoundingClientRect().width) : 0,
        hasShowcaseCard: !!showcaseCard
      };
    });
    auditReport.viewports['1920px_hero'] = wideHero;

    // Screenshot Hero at 1920px
    const shotHero1920 = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, 'audit_hero_1920.png'), Buffer.from(shotHero1920.data, 'base64'));

    // -------------------------------------------------------------------------
    // TEST 3: PRICING CALCULATOR INTERACTION & RESPONSIVENESS
    // -------------------------------------------------------------------------
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto('http://127.0.0.1:8105/index.html');
    await new Promise(r => setTimeout(r, 300));

    // Scroll to pricing calculator
    await driver.evaluate(() => {
      document.getElementById('pricing-calculator').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 400));

    const shotCalc1440 = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, 'audit_pricing_1440.png'), Buffer.from(shotCalc1440.data, 'base64'));

    const calcDesktop = await driver.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.tier-card'));
      const widths = cards.map(c => Math.round(c.getBoundingClientRect().width));
      const heights = cards.map(c => Math.round(c.getBoundingClientRect().height));
      const tops = cards.map(c => Math.round(c.getBoundingClientRect().top));
      const allOnSameRow = tops.every(t => Math.abs(t - tops[0]) < 5);
      return {
        cardCount: cards.length,
        widths,
        heights,
        allOnSameRow,
        allWideEnough: widths.every(w => w >= 200)
      };
    });
    auditReport.calculatorInteractionAudit.desktop1440 = calcDesktop;

    // Mobile Pricing Calculator
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto('http://127.0.0.1:8105/index.html');
    await new Promise(r => setTimeout(r, 300));
    await driver.evaluate(() => {
      document.getElementById('pricing-calculator').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 400));

    const shotCalc375 = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, 'audit_pricing_375.png'), Buffer.from(shotCalc375.data, 'base64'));

    const calcMobile = await driver.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.tier-card'));
      const widths = cards.map(c => Math.round(c.getBoundingClientRect().width));
      const tops = cards.map(c => Math.round(c.getBoundingClientRect().top));
      const isStackedVertically = tops[1] > tops[0] && tops[2] > tops[1];
      return {
        widths,
        isStackedVertically,
        allFullWidth: widths.every(w => w >= 280)
      };
    });
    auditReport.calculatorInteractionAudit.mobile375 = calcMobile;

    // -------------------------------------------------------------------------
    // TEST 4: DOCK CLEARANCE, HYSTERESIS & MOBILE HIDING
    // -------------------------------------------------------------------------
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto('http://127.0.0.1:8105/index.html');
    await new Promise(r => setTimeout(r, 300));

    // ScrollY = 0 clearance
    const dockAt0 = await driver.evaluate(() => {
      const dock = document.querySelector('.floating-bottom-nav');
      const dRect = dock.getBoundingClientRect();
      const sec2 = document.getElementById('services');
      const h2 = sec2 ? sec2.querySelector('h2') : null;
      const h2Rect = h2 ? h2.getBoundingClientRect() : null;

      return {
        dockVisible: dRect.width > 0 && dRect.height > 0,
        dockTop: Math.round(dRect.top),
        dockBottom: Math.round(dRect.bottom),
        headingTop: h2Rect ? Math.round(h2Rect.top) : null,
        isCleared: h2Rect ? h2Rect.top >= 900 : true
      };
    });
    auditReport.dockHysteresisAudit.scrollY0 = dockAt0;

    // Scroll down past 500px -> verify dock hides
    await driver.scrollTo(0, 600);
    await new Promise(r => setTimeout(r, 200));

    const dockAt600 = await driver.evaluate(() => {
      const dock = document.querySelector('.floating-bottom-nav');
      const cs = window.getComputedStyle(dock);
      const isHiddenClass = dock.classList.contains('nav-dock--hidden');
      return {
        hasHiddenClass: isHiddenClass,
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents
      };
    });
    auditReport.dockHysteresisAudit.scrollDown600 = dockAt600;

    // Scroll back up to 200px -> verify dock reappears
    await driver.scrollTo(0, 200);
    await new Promise(r => setTimeout(r, 200));

    const dockAt200 = await driver.evaluate(() => {
      const dock = document.querySelector('.floating-bottom-nav');
      const cs = window.getComputedStyle(dock);
      const isHiddenClass = dock.classList.contains('nav-dock--hidden');
      return {
        hasHiddenClass: isHiddenClass,
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents
      };
    });
    auditReport.dockHysteresisAudit.scrollUp200 = dockAt200;

    // -------------------------------------------------------------------------
    // TEST 5: MODAL LIFECYCLE (TRIGGER OPEN -> VERIFY -> CLOSE -> VERIFY ZERO LEAKAGE)
    // -------------------------------------------------------------------------
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto('http://127.0.0.1:8105/portfolio.html');
    await new Promise(r => setTimeout(r, 400));

    // Default hidden check
    const modalInitial = await driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      const cs = window.getComputedStyle(modal);
      return {
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
        isHidden: cs.display === 'none' || cs.visibility === 'hidden'
      };
    });
    auditReport.modalStateAudit.initial = modalInitial;

    // Click case study trigger
    await driver.evaluate(() => {
      const btn = document.querySelector('.btn-case-study, [data-project-id]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const modalOpened = await driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      const cs = window.getComputedStyle(modal);
      const dialog = modal.querySelector('.modal-dialog');
      const dRect = dialog ? dialog.getBoundingClientRect() : null;
      return {
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
        dialogWidth: dRect ? Math.round(dRect.width) : 0,
        dialogHeight: dRect ? Math.round(dRect.height) : 0,
        isOpen: cs.display === 'flex' && cs.visibility === 'visible' && cs.opacity === '1'
      };
    });
    auditReport.modalStateAudit.opened = modalOpened;

    // Screenshot opened modal
    const shotModal = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, 'audit_case_study_opened.png'), Buffer.from(shotModal.data, 'base64'));

    // Close via close button
    await driver.evaluate(() => {
      const closeBtn = document.querySelector('#modal-close-btn, .modal-close');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const modalClosed = await driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      const cs = window.getComputedStyle(modal);
      const bodyNoScroll = document.body.classList.contains('no-scroll');
      return {
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        bodyScrollUnlocked: !bodyNoScroll,
        isClosed: cs.display === 'none' || cs.visibility === 'hidden'
      };
    });
    auditReport.modalStateAudit.closed = modalClosed;

    // -------------------------------------------------------------------------
    // TEST 6: FAQ ACCORDION EXPANSION & SINGLE-ACTIVE MUTEX
    // -------------------------------------------------------------------------
    await driver.goto('http://127.0.0.1:8105/index.html');
    await new Promise(r => setTimeout(r, 300));
    await driver.evaluate(() => {
      document.getElementById('faq').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 400));

    // Click FAQ item 1
    await driver.evaluate(() => {
      const triggers = document.querySelectorAll('.faq-trigger');
      if (triggers[0]) triggers[0].click();
    });
    await new Promise(r => setTimeout(r, 400));

    const faqItem1Opened = await driver.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.faq-item'));
      const item0Open = items[0].classList.contains('active') || items[0].classList.contains('is-open');
      const content0 = items[0].querySelector('.faq-content');
      const cs0 = window.getComputedStyle(content0);
      return {
        item0Open,
        gridRows: cs0.gridTemplateRows
      };
    });

    // Capture screenshot of expanded FAQ
    const shotFaq = await driver.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, 'audit_faq_opened.png'), Buffer.from(shotFaq.data, 'base64'));

    // Now click FAQ item 2 -> verify item 1 collapses and item 2 expands
    await driver.evaluate(() => {
      const triggers = document.querySelectorAll('.faq-trigger');
      if (triggers[1]) triggers[1].click();
    });
    await new Promise(r => setTimeout(r, 400));

    const faqItem2OpenedItem1Collapsed = await driver.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.faq-item'));
      const item0Open = items[0].classList.contains('active') || items[0].classList.contains('is-open');
      const item1Open = items[1].classList.contains('active') || items[1].classList.contains('is-open');
      return {
        item0Open,
        item1Open,
        mutexMaintained: !item0Open && item1Open
      };
    });

    auditReport.faqInteractionAudit = {
      faqItem1Opened,
      faqItem2OpenedItem1Collapsed
    };

  } finally {
    await driver.close();
    await server.stop();
  }

  const outPath = path.resolve(__dirname, 'audit_results.json');
  fs.writeFileSync(outPath, JSON.stringify(auditReport, null, 2));
  console.log('AUDIT COMPLETED! Results written to:', outPath);
  console.log(JSON.stringify(auditReport, null, 2));
}

runAdversarialAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
