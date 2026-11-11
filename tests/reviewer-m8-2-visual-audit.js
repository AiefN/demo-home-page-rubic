/**
 * Independent Visual, Responsive, and UX Layout Audit Suite (Milestone 8)
 * Agent: reviewer_m8_2
 *
 * Verifies:
 * 1. Multi-Viewport Responsiveness & Zero Horizontal Overflow (280px, 320px, 375px, 768px, 1024px, 1440px, 1920px)
 * 2. Hero Executive Corporate Profile Card & Room & Pillar Aesthetic
 * 3. Hero Section Desktop Geometric Centering & Balance (marginDiff <= 2px, width >= 1100px)
 * 4. Mobile 320px Hero Card Clean Stacking & Boundary Containment
 * 5. In-Page Anchor Navigation Architecture & Smooth Scroll Offset (scroll-margin-top: 100px)
 * 6. Dynamic ScrollSpy Active Link Synchronization
 * 7. In-Page `#contact` Section Channels, Form Validation & Conversion UX
 * 8. Subpages Anchor Forwarding Architecture
 * 9. Zero Console Runtime Errors Verification
 */

const fs = require('fs');
const path = require('path');
const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');

const VIEWPORTS = [
  { name: 'Fold Mobile', width: 280, height: 653, mobile: true },
  { name: 'Ultra-Compact Mobile', width: 320, height: 568, mobile: true },
  { name: 'Standard Mobile', width: 375, height: 667, mobile: true },
  { name: 'Tablet Portrait', width: 768, height: 1024, mobile: true },
  { name: 'Laptop / Tablet Landscape', width: 1024, height: 768, mobile: false },
  { name: 'Desktop Standard', width: 1440, height: 900, mobile: false },
  { name: 'Wide Desktop FHD', width: 1920, height: 1080, mobile: false }
];

const PAGES = [
  { name: 'Home', file: 'index.html' },
  { name: 'Services', file: 'services.html' },
  { name: 'Portfolio', file: 'portfolio.html' },
  { name: 'Contact', file: 'contact.html' }
];

const wait = (ms) => new Promise(r => setTimeout(r, ms));

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failures = [];

function assert(condition, message, details = '') {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedAssertions++;
    console.error(`  ✗ [FAIL] ${message} ${details ? '(' + details + ')' : ''}`);
    failures.push({ message, details });
  }
}

async function waitForScrollToSettle(driver, maxWaitMs = 2500) {
  let lastY = -1;
  let settledCount = 0;
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const currentY = await driver.evaluate(() => window.scrollY);
    if (Math.abs(currentY - lastY) < 2) {
      settledCount++;
      if (settledCount >= 2) return currentY;
    } else {
      settledCount = 0;
    }
    lastY = currentY;
    await wait(150);
  }
  return lastY;
}

async function runM8VisualAudit() {
  console.log('================================================================');
  console.log('  REVIEWER M8-2: VISUAL, RESPONSIVE & ANCHOR NAVIGATION AUDIT  ');
  console.log('================================================================\n');

  const server = new StaticServer({ rootDir: path.resolve(__dirname, '..') });
  const serverInfo = await server.start();
  console.log(`✓ Static server listening at: ${serverInfo.url}`);

  const driver = new BrowserDriver();
  await driver.launch();
  console.log('✓ Headless browser launched\n');

  try {
    // --------------------------------------------------------------------------
    // SECTION 1: Multi-Viewport Responsive Matrix & Zero Horizontal Overflow
    // --------------------------------------------------------------------------
    console.log('----------------------------------------------------------------');
    console.log('SECTION 1: Multi-Viewport Responsive Matrix (28 Combinations)');
    console.log('----------------------------------------------------------------\n');

    for (const p of PAGES) {
      console.log(`▶ Page: ${p.name} (${p.file})`);
      for (const vp of VIEWPORTS) {
        await driver.setViewport({
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: vp.mobile ? 2 : 1,
          mobile: vp.mobile
        });
        await driver.goto(`${serverInfo.url}/${p.file}`);
        await wait(200);

        const overflowCheck = await driver.evaluate(() => {
          const scrollWidth = document.documentElement.scrollWidth;
          const innerWidth = window.innerWidth;
          return {
            scrollWidth,
            innerWidth,
            overflow: scrollWidth > innerWidth,
            diff: scrollWidth - innerWidth
          };
        });

        assert(
          !overflowCheck.overflow,
          `${p.name} @ ${vp.width}px (${vp.name}): 0 horizontal overflow (scrollWidth=${overflowCheck.scrollWidth} <= innerWidth=${overflowCheck.innerWidth})`,
          `diff: +${overflowCheck.diff}px`
        );
      }
      console.log('');
    }

    // --------------------------------------------------------------------------
    // SECTION 2: Hero Executive Company Profile Card & Room & Pillar Aesthetic
    // --------------------------------------------------------------------------
    console.log('----------------------------------------------------------------');
    console.log('SECTION 2: Hero Executive Company Profile Card & Visual Styling');
    console.log('----------------------------------------------------------------\n');

    await driver.setViewport({ width: 1440, height: 900, mobile: false });
    await driver.goto(`${serverInfo.url}/index.html`);
    await wait(250);

    const cardDetails = await driver.evaluate(() => {
      const card = document.querySelector('.corporate-profile-card');
      if (!card) return null;

      const style = window.getComputedStyle(card);
      const entityName = card.querySelector('.corp-card__entity-name')?.textContent.trim() || '';
      const entityReg = card.querySelector('.corp-card__entity-reg')?.textContent.trim() || '';
      const statusPill = card.querySelector('.corp-card__status-pill')?.textContent.trim() || '';
      const pulseDot = card.querySelector('.badge-pulse-dot');
      const title = card.querySelector('.corp-card__title')?.textContent.trim() || '';
      const category = card.querySelector('.corp-card__category')?.textContent.trim() || '';
      const desc = card.querySelector('.corp-card__desc')?.textContent.trim() || '';

      const guarantees = Array.from(card.querySelectorAll('.corp-guarantee-item')).map(item => ({
        title: item.querySelector('.corp-guarantee-item__title')?.textContent.trim() || '',
        sub: item.querySelector('.corp-guarantee-item__sub')?.textContent.trim() || '',
        hasIcon: !!item.querySelector('.corp-guarantee-item__icon svg')
      }));

      const metricTiles = Array.from(card.querySelectorAll('.corp-metric-tile')).map(tile => ({
        val: tile.querySelector('.corp-metric-val')?.textContent.trim() || '',
        lbl: tile.querySelector('.corp-metric-lbl')?.textContent.trim() || ''
      }));

      const location = card.querySelector('.corp-card__location')?.textContent.trim() || '';

      // Check if obsolete code config window exists in DOM
      const codeEditor = document.querySelector('.code-mockup, .code-window, [data-filename="rubicweb.engine.config.ts"]');

      return {
        exists: true,
        entityName,
        entityReg,
        statusPill,
        hasPulseDot: !!pulseDot,
        title,
        category,
        desc,
        guarantees,
        metricTiles,
        location,
        hasCodeEditor: !!codeEditor,
        background: style.background,
        boxShadow: style.boxShadow,
        borderRadius: style.borderRadius
      };
    });

    assert(cardDetails && cardDetails.exists, 'Executive Company Profile card (.corporate-profile-card) is present in Hero DOM');
    assert(cardDetails.entityName.includes('PT RUBIC KIRANA SOLUSINDO'), `Card displays legal entity name: "${cardDetails.entityName}"`);
    assert(cardDetails.entityReg.includes('EST. 2020') && cardDetails.entityReg.includes('LEGAL ENTITY'), `Card displays registration badge: "${cardDetails.entityReg}"`);
    assert(cardDetails.statusPill.includes('VERIFIED AGENCY'), `Card displays verified status: "${cardDetails.statusPill}"`);
    assert(cardDetails.hasPulseDot, 'Status pill features animated beacon dot (.badge-pulse-dot)');
    assert(cardDetails.category === 'CORPORATE CREDENTIALS', `Card category is clean corporate branding: "${cardDetails.category}"`);
    assert(cardDetails.title === 'Boutique Web & Digital Engineering Agency', `Card headline is clean editorial title: "${cardDetails.title}"`);
    assert(cardDetails.guarantees.length === 5, `Card renders exactly 5 core corporate guarantees (got: ${cardDetails.guarantees.length})`);

    const expectedGuarantees = [
      '100% Garansi Uang Kembali',
      '100% Kepemilikan Source Code',
      '250+ Proyek Nasional Selesai',
      'Core Web Vitals 95+ & 99.9% SLA',
      '30-Day Bug-Free Guarantee'
    ];
    expectedGuarantees.forEach(expectedTitle => {
      const found = cardDetails.guarantees.find(g => g.title === expectedTitle);
      assert(found && found.hasIcon, `Guarantee "${expectedTitle}" is rendered with pristine SVG icon`);
    });

    assert(cardDetails.metricTiles.length === 3, `Metrics ribbon contains 3 key tiles (got: ${cardDetails.metricTiles.length})`);
    assert(cardDetails.location.includes('SCBD Jakarta'), `Location footprint displays prestige Jakarta address: "${cardDetails.location}"`);
    assert(!cardDetails.hasCodeEditor, 'Hero right-side code window (rubicweb.engine.config.ts) is fully eliminated from DOM');

    // --------------------------------------------------------------------------
    // SECTION 3: Hero Desktop Geometric Centering & Balance (1440px)
    // --------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('SECTION 3: Hero Desktop Geometric Centering & Stacking Mechanics');
    console.log('----------------------------------------------------------------\n');

    await driver.setViewport({ width: 1440, height: 900, mobile: false });
    const heroGeometry = await driver.evaluate(() => {
      const container = document.querySelector('.hero-section .container, .hero-container');
      const contentCol = document.querySelector('.hero-content-col, .hero-content');
      const showcaseCol = document.querySelector('.hero-showcase-col, .corporate-profile-card');
      const docClientWidth = document.documentElement.clientWidth;

      const cRect = container.getBoundingClientRect();
      const leftMargin = cRect.left;
      const rightMargin = docClientWidth - cRect.right;
      const marginDiff = Math.abs(leftMargin - rightMargin);

      const contentRect = contentCol.getBoundingClientRect();
      const showcaseRect = showcaseCol.getBoundingClientRect();
      const isSideBySide = Math.abs(contentRect.top - showcaseRect.top) < 50;

      return {
        containerWidth: cRect.width,
        leftMargin,
        rightMargin,
        marginDiff,
        isSideBySide,
        contentWidth: contentRect.width,
        showcaseWidth: showcaseRect.width
      };
    });

    assert(heroGeometry.marginDiff <= 2, `Desktop Hero container is centered (left: ${Math.round(heroGeometry.leftMargin)}px, right: ${Math.round(heroGeometry.rightMargin)}px, diff: ${Math.round(heroGeometry.marginDiff)}px <= 2px)`);
    assert(heroGeometry.containerWidth >= 1100, `Desktop Hero container width is wide without empty voids (got: ${Math.round(heroGeometry.containerWidth)}px >= 1100px)`);
    assert(heroGeometry.isSideBySide, `Desktop 1440px: Content column and corporate profile card are balanced side-by-side on the same plane`);

    // Verify Mobile Stacking at 320px
    await driver.setViewport({ width: 320, height: 600, mobile: true });
    await wait(200);
    const mobileStacking = await driver.evaluate(() => {
      const contentCol = document.querySelector('.hero-content-col, .hero-content');
      const showcaseCard = document.querySelector('.corporate-profile-card');
      const contentRect = contentCol.getBoundingClientRect();
      const cardRect = showcaseCard.getBoundingClientRect();

      return {
        isStacked: cardRect.top >= contentRect.bottom,
        cardWidth: cardRect.width,
        viewportWidth: window.innerWidth,
        fitsInViewport: cardRect.right <= window.innerWidth + 1
      };
    });

    assert(mobileStacking.isStacked, 'Mobile 320px: Corporate profile card stacks neatly below Hero headline and CTAs');
    assert(mobileStacking.fitsInViewport, `Mobile 320px: Corporate profile card fits within screen width (cardWidth: ${Math.round(mobileStacking.cardWidth)}px, viewport: ${mobileStacking.viewportWidth}px)`);

    // --------------------------------------------------------------------------
    // SECTION 4: In-Page Anchor Navigation Architecture & Smooth Scroll Offset
    // --------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('SECTION 4: In-Page Anchor Navigation & Scroll Offset Clearance');
    console.log('----------------------------------------------------------------\n');

    await driver.setViewport({ width: 1440, height: 900, mobile: false });
    await driver.goto(`${serverInfo.url}/index.html`);
    await wait(250);

    const navHrefs = await driver.evaluate(() => {
      const desktopLinks = Array.from(document.querySelectorAll('.site-header .nav-links a')).map(a => a.getAttribute('href'));
      const drawerLinks = Array.from(document.querySelectorAll('.mobile-menu__links a')).map(a => a.getAttribute('href'));
      const dockLinks = Array.from(document.querySelectorAll('.floating-bottom-nav .floating-nav-links a')).map(a => a.getAttribute('href'));

      return { desktopLinks, drawerLinks, dockLinks };
    });

    const expectedAnchors = ['#hero', '#services', '#portfolio', '#pricing-calculator', '#contact'];
    assert(
      JSON.stringify(navHrefs.desktopLinks) === JSON.stringify(expectedAnchors),
      `Desktop header nav links are pure in-page anchors (${navHrefs.desktopLinks.join(', ')})`
    );
    assert(
      JSON.stringify(navHrefs.drawerLinks) === JSON.stringify(expectedAnchors),
      `Mobile drawer nav links are pure in-page anchors (${navHrefs.drawerLinks.join(', ')})`
    );
    assert(
      navHrefs.dockLinks.includes('#hero') && navHrefs.dockLinks.includes('#services') && navHrefs.dockLinks.includes('#contact'),
      `Floating bottom dock links are pure in-page anchors (${navHrefs.dockLinks.join(', ')})`
    );

    // Verify CSS scroll-margin-top clearance on section IDs
    const scrollMargins = await driver.evaluate(() => {
      const sectionIds = ['hero', 'services', 'portfolio', 'pricing-calculator', 'contact'];
      return sectionIds.map(id => {
        const el = document.getElementById(id);
        const style = el ? window.getComputedStyle(el) : null;
        return {
          id,
          scrollMarginTop: style ? style.scrollMarginTop : 'none'
        };
      });
    });

    scrollMargins.forEach(sm => {
      assert(
        sm.scrollMarginTop === '100px',
        `Section #${sm.id} has scroll-margin-top: 100px for fixed header clearance (got: ${sm.scrollMarginTop})`
      );
    });

    // Test programmatic click on #services anchor and verify landing clearance
    await driver.evaluate(() => {
      const servicesLink = document.querySelector('.site-header .nav-links a[href="#services"]');
      if (servicesLink) servicesLink.click();
    });
    await waitForScrollToSettle(driver);

    const servicesLanding = await driver.evaluate(() => {
      const servicesSection = document.getElementById('services');
      const header = document.querySelector('.site-header');
      const sRect = servicesSection.getBoundingClientRect();
      const hRect = header.getBoundingClientRect();

      return {
        sectionTop: sRect.top,
        headerBottom: hRect.bottom,
        clearance: sRect.top - hRect.bottom,
        isObscured: sRect.top < hRect.bottom - 5
      };
    });

    assert(!servicesLanding.isObscured, `Clicking "#services" navigates cleanly without section title being obscured under fixed header (clearance: ${Math.round(servicesLanding.clearance)}px)`);

    // Test programmatic click on #contact anchor
    await driver.evaluate(() => {
      const contactLink = document.querySelector('.site-header .nav-links a[href="#contact"]');
      if (contactLink) contactLink.click();
    });
    await waitForScrollToSettle(driver);

    const contactLanding = await driver.evaluate(() => {
      const contactSection = document.getElementById('contact');
      const header = document.querySelector('.site-header');
      const cRect = contactSection.getBoundingClientRect();
      const hRect = header.getBoundingClientRect();

      return {
        sectionTop: cRect.top,
        headerBottom: hRect.bottom,
        clearance: cRect.top - hRect.bottom,
        isObscured: cRect.top < hRect.bottom - 5
      };
    });

    assert(!contactLanding.isObscured, `Clicking "#contact" navigates cleanly to dedicated consultation section (clearance: ${Math.round(contactLanding.clearance)}px)`);

    // --------------------------------------------------------------------------
    // SECTION 5: Dynamic ScrollSpy Active State Tracking
    // --------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('SECTION 5: ScrollSpy Active Link Synchronization');
    console.log('----------------------------------------------------------------\n');

    const activeAtContact = await driver.evaluate(() => {
      const activeDesktop = document.querySelector('.site-header .nav-links a.active')?.getAttribute('href');
      const activeDock = document.querySelector('.floating-bottom-nav .floating-nav-links a.active')?.getAttribute('href');
      return { activeDesktop, activeDock };
    });

    assert(activeAtContact.activeDesktop === '#contact', `ScrollSpy highlights "#contact" in desktop nav when scrolled to contact section (got: ${activeAtContact.activeDesktop})`);
    assert(activeAtContact.activeDock === '#contact', `ScrollSpy highlights "#contact" in floating bottom dock (got: ${activeAtContact.activeDock})`);

    // Scroll back to top
    await driver.evaluate(() => window.scrollTo(0, 0));
    await waitForScrollToSettle(driver);

    const activeAtHero = await driver.evaluate(() => {
      const activeDesktop = document.querySelector('.site-header .nav-links a.active')?.getAttribute('href');
      const activeDock = document.querySelector('.floating-bottom-nav .floating-nav-links a.active')?.getAttribute('href');
      return { activeDesktop, activeDock };
    });

    assert(activeAtHero.activeDesktop === '#hero', `ScrollSpy restores "#hero" active highlight at scrollY=0 (got: ${activeAtHero.activeDesktop})`);

    // --------------------------------------------------------------------------
    // SECTION 6: In-Page `#contact` Section Layout & Form Interaction
    // --------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('SECTION 6: In-Page Consultation Section & Form Validation');
    console.log('----------------------------------------------------------------\n');

    const contactSectionDetails = await driver.evaluate(() => {
      const section = document.getElementById('contact');
      if (!section) return null;

      const channels = Array.from(section.querySelectorAll('.channel-card')).map(card => card.textContent.trim());
      const form = section.querySelector('#contact-form');
      const nameInput = form?.querySelector('#name');
      const companyInput = form?.querySelector('#company');
      const emailInput = form?.querySelector('#email');
      const phoneInput = form?.querySelector('#phone');
      const packageSelect = form?.querySelector('#package');
      const messageInput = form?.querySelector('#message');
      const submitBtn = form?.querySelector('#btn-submit-consultation');
      const successBanner = section.querySelector('#form-success-banner');

      return {
        exists: true,
        channelCount: channels.length,
        hasForm: !!form,
        hasName: !!nameInput,
        hasCompany: !!companyInput,
        hasEmail: !!emailInput,
        hasPhone: !!phoneInput,
        hasPackage: !!packageSelect,
        hasMessage: !!messageInput,
        hasSubmitBtn: !!submitBtn,
        hasSuccessBanner: !!successBanner
      };
    });

    assert(contactSectionDetails && contactSectionDetails.exists, 'In-page consultation section (#contact) is present');
    assert(contactSectionDetails.channelCount === 3, `Channels grid displays 3 direct channels (WhatsApp, Email, SCBD Office)`);
    assert(
      contactSectionDetails.hasForm && contactSectionDetails.hasName && contactSectionDetails.hasEmail && contactSectionDetails.hasPhone && contactSectionDetails.hasPackage && contactSectionDetails.hasMessage && contactSectionDetails.hasSubmitBtn,
      'Consultation form includes all required fields (#name, #company, #email, #phone, #package, #message, #btn-submit-consultation)'
    );

    // Test form inline validation on index.html
    const validationTest = await driver.evaluate(() => {
      const form = document.querySelector('#contact-form');
      const nameInput = document.querySelector('#name');
      const emailInput = document.querySelector('#email');
      const phoneInput = document.querySelector('#phone');
      const messageInput = document.querySelector('#message');
      const submitBtn = document.querySelector('#btn-submit-consultation');

      // 1. Submit empty form
      submitBtn.click();

      const errorName = document.querySelector('#error-name');
      const errorEmail = document.querySelector('#error-email');
      const errorPhone = document.querySelector('#error-phone');
      const errorMessage = document.querySelector('#error-message');

      const isVisible = el => el && window.getComputedStyle(el).display !== 'none' && el.offsetHeight > 0;

      const errorNameVisible = isVisible(errorName);
      const errorEmailVisible = isVisible(errorEmail);
      const errorPhoneVisible = isVisible(errorPhone);
      const errorMessageVisible = isVisible(errorMessage);

      // 2. Fill invalid values
      emailInput.value = 'invalid-email';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));

      phoneInput.value = '123';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      phoneInput.dispatchEvent(new Event('blur', { bubbles: true }));

      const emailInvalidShown = isVisible(errorEmail);
      const phoneInvalidShown = isVisible(errorPhone);

      // 3. Fill valid values
      nameInput.value = 'Budi Santoso';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.value = 'budi@korporasi.co.id';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      phoneInput.value = '081234567890';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      messageInput.value = 'Kebutuhan rekayasa web enterprise berskala nasional.';
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));

      submitBtn.click();

      const successShown = window.getComputedStyle(document.querySelector('#form-success-banner')).display !== 'none';

      return {
        emptyTriggeredErrors: errorNameVisible && errorEmailVisible && errorPhoneVisible && errorMessageVisible,
        emailInvalidShown,
        phoneInvalidShown,
        successShown
      };
    });

    assert(validationTest.emptyTriggeredErrors, 'Empty submission triggers inline validation errors across required fields');
    assert(validationTest.emailInvalidShown, 'Invalid email format is caught and flagged inline');
    assert(validationTest.phoneInvalidShown, 'Invalid phone number format is caught and flagged inline');
    assert(validationTest.successShown, 'Valid consultation submission displays polite confirmation banner (#form-success-banner)');

    // --------------------------------------------------------------------------
    // SECTION 7: Subpages In-Page Anchor Forwarding Verification
    // --------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('SECTION 7: Subpages Anchor Forwarding Architecture');
    console.log('----------------------------------------------------------------\n');

    for (const sub of ['services.html', 'portfolio.html', 'contact.html']) {
      await driver.goto(`${serverInfo.url}/${sub}`);
      await wait(150);

      const subLinks = await driver.evaluate(() => {
        const desktopLinks = Array.from(document.querySelectorAll('.site-header .nav-links a')).map(a => a.getAttribute('href'));
        const drawerLinks = Array.from(document.querySelectorAll('.mobile-menu__links a')).map(a => a.getAttribute('href'));
        const dockLinks = Array.from(document.querySelectorAll('.floating-bottom-nav .floating-nav-links a')).map(a => a.getAttribute('href'));
        return { desktopLinks, drawerLinks, dockLinks };
      });

      const hasHomepageAnchor = subLinks.desktopLinks.some(h => h && h.startsWith('index.html#'));
      assert(hasHomepageAnchor, `${sub}: Desktop navbar routes back to homepage in-page anchors (${subLinks.desktopLinks[1]})`);
    }

    // --------------------------------------------------------------------------
    // SECTION 8: Zero Console Runtime Errors Verification
    // --------------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('SECTION 8: Zero Console Runtime Errors Verification');
    console.log('----------------------------------------------------------------\n');

    const consoleErrors = driver.getConsoleErrors();
    assert(consoleErrors.length === 0, `Page execution produced strictly 0 console errors (got: ${consoleErrors.length})`, consoleErrors.join(', '));

  } finally {
    await driver.close();
    await server.stop();
  }

  // --------------------------------------------------------------------------
  // AUDIT SUMMARY & VERDICT
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('  REVIEWER M8-2 AUDIT SUMMARY                                   ');
  console.log('================================================================');
  console.log(`Total Assertions : ${totalAssertions}`);
  console.log(`Passed           : ${passedAssertions}`);
  console.log(`Failed           : ${failedAssertions}`);
  console.log(`Overall Verdict  : ${failedAssertions === 0 ? 'APPROVE 🏆' : 'REQUEST_CHANGES ❌'}`);
  console.log('================================================================\n');

  const reportPath = path.resolve(__dirname, '..', '.agents', 'teamwork', 'reviewer_m8_2', 'audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalAssertions,
    passedAssertions,
    failedAssertions,
    verdict: failedAssertions === 0 ? 'APPROVE' : 'REQUEST_CHANGES',
    failures
  }, null, 2));

  console.log(`Detailed audit report written to: ${reportPath}`);

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

runM8VisualAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
