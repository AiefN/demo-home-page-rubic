/**
 * Rubicweb — Milestone 8 Empirical Stress & Adversarial Challenge Harness
 * Agent: challenger_m8_1 (critic & specialist)
 *
 * Verifies Milestone 8:
 * 1. 3D Card Tilt & Interactive Glare Physics on .corporate-profile-card
 * 2. 60fps RAF Budget & Zero GPU Stalls (backdrop-filter verification)
 * 3. Smooth Anchor Navigation & Occlusion Clearance (scroll-margin-top: 100px)
 * 4. Mobile Drawer Navigation & Scroll Lock Restoration
 * 5. Dynamic ScrollSpy Active Link Updates & Rapid Scroll Stress
 * 6. Corporate Card Semantic & Content Integrity
 */

const path = require('path');
const fs = require('fs');
const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

class ChallengerM8Harness {
  constructor() {
    this.server = null;
    this.driver = null;
    this.baseUrl = '';
    this.report = {
      timestamp: new Date().toISOString(),
      summary: { total: 0, passed: 0, failed: 0 },
      suites: {},
      consoleErrors: [],
      verdict: 'PENDING'
    };
  }

  log(msg) {
    console.log(msg);
  }

  record(suiteName, testName, passed, details = {}) {
    this.report.summary.total++;
    if (!this.report.suites[suiteName]) {
      this.report.suites[suiteName] = { passed: true, checks: [] };
    }
    this.report.suites[suiteName].checks.push({ testName, passed, details });
    if (passed) {
      this.report.summary.passed++;
      console.log(`  ${colors.green}✓ PASS:${colors.reset} ${testName}`);
    } else {
      this.report.summary.failed++;
      this.report.suites[suiteName].passed = false;
      console.log(`  ${colors.red}❌ FAIL:${colors.reset} ${testName} -> ${JSON.stringify(details)}`);
    }
  }

  async run() {
    this.log(`\n${colors.bold}${colors.magenta}================================================================${colors.reset}`);
    this.log(`${colors.bold}${colors.magenta}  RUBICWEB M8: EMPIRICAL CHALLENGER STRESS HARNESS               ${colors.reset}`);
    this.log(`${colors.bold}${colors.magenta}================================================================${colors.reset}\n`);

    this.server = new StaticServer({ rootDir: path.resolve(__dirname, '..') });
    const srvInfo = await this.server.start();
    this.baseUrl = srvInfo.url;
    this.log(`${colors.cyan}Static Server started at:${colors.reset} ${this.baseUrl}`);

    this.driver = new BrowserDriver();
    await this.driver.launch();
    this.log(`${colors.cyan}Headless Browser launched successfully.${colors.reset}\n`);

    try {
      await this.testCorporateCardTiltPhysics();
      await this.testAnimationBudgetAndBackdropFilter();
      await this.testSmoothAnchorNavigationAndOcclusion();
      await this.testMobileDrawerAnchorTransitions();
      await this.testScrollSpyMechanicsAndStress();
      await this.testCorporateCardContentIntegrity();

      this.summarizeVerdict();
    } catch (err) {
      console.error(`${colors.red}Fatal harness error:${colors.reset}`, err);
      this.report.fatalError = err.message;
      this.report.verdict = 'REJECT';
    } finally {
      if (this.driver) await this.driver.close();
      if (this.server) await this.server.stop();

      const outPath = path.resolve(__dirname, 'challenger-m8-report.json');
      fs.writeFileSync(outPath, JSON.stringify(this.report, null, 2), 'utf-8');
      this.log(`\nDetailed report written to: ${outPath}`);
    }
  }

  /* --------------------------------------------------------------------------
   * 1. 3D CARD TILT & INTERACTIVE GLARE PHYSICS
   * -------------------------------------------------------------------------- */
  async testCorporateCardTiltPhysics() {
    this.log(`${colors.bold}${colors.yellow}▶ [SUITE 1/6] Corporate Profile Card 3D Tilt & Glare Physics...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    const tiltResult = await this.driver.evaluate(() => {
      const card = document.querySelector('.hero-showcase-card.corporate-profile-card.card-tilt');
      if (!card) return { error: 'Corporate profile card not found' };

      const rect = card.getBoundingClientRect();
      const points = [
        { name: 'Top-Left Corner', x: rect.left + 2, y: rect.top + 2, expectRotXPos: true, expectRotYNeg: true },
        { name: 'Top-Right Corner', x: rect.right - 2, y: rect.top + 2, expectRotXPos: true, expectRotYPos: true },
        { name: 'Bottom-Left Corner', x: rect.left + 2, y: rect.bottom - 2, expectRotXNeg: true, expectRotYNeg: true },
        { name: 'Bottom-Right Corner', x: rect.right - 2, y: rect.bottom - 2, expectRotXNeg: true, expectRotYPos: true },
        { name: 'Dead Center', x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, expectCenter: true },
        { name: 'Extreme Left-Top Out-of-Bounds', x: -9999, y: -9999, clampCheck: true },
        { name: 'Extreme Right-Bottom Out-of-Bounds', x: rect.right + 9999, y: rect.bottom + 9999, clampCheck: true }
      ];

      const checks = [];
      for (const pt of points) {
        card.dispatchEvent(new MouseEvent('mousemove', {
          clientX: pt.x,
          clientY: pt.y,
          bubbles: true
        }));

        const transform = card.style.transform;
        const rotXMatch = transform.match(/rotateX\(([\d.-]+)deg\)/);
        const rotYMatch = transform.match(/rotateY\(([\d.-]+)deg\)/);
        const rotX = rotXMatch ? parseFloat(rotXMatch[1]) : null;
        const rotY = rotYMatch ? parseFloat(rotYMatch[1]) : null;

        const mouseX = card.style.getPropertyValue('--mouse-x');
        const mouseY = card.style.getPropertyValue('--mouse-y');
        const glowOpacity = card.style.getPropertyValue('--glow-opacity');

        checks.push({
          name: pt.name,
          transform,
          rotX,
          rotY,
          mouseX,
          mouseY,
          glowOpacity,
          clamped: rotX !== null && rotY !== null && Math.abs(rotX) <= 10.01 && Math.abs(rotY) <= 10.01,
          hasPerspective: transform.includes('perspective(1000px)'),
          hasScale: transform.includes('scale3d(1.02, 1.02, 1.02)'),
          signValid: pt.expectCenter ? (Math.abs(rotX) < 0.2 && Math.abs(rotY) < 0.2) :
                     (pt.expectRotXPos ? rotX > 0 : (pt.expectRotXNeg ? rotX < 0 : true)) &&
                     (pt.expectRotYPos ? rotY > 0 : (pt.expectRotYNeg ? rotY < 0 : true))
        });
      }

      // Test mouseleave reset
      card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      const resetTransform = card.style.transform;
      const resetGlow = card.style.getPropertyValue('--glow-opacity');
      const resetTransition = card.style.transition;

      return {
        cardFound: true,
        rect: { width: rect.width, height: rect.height },
        checks,
        resetTransform,
        resetGlow,
        resetTransition
      };
    });

    this.record('CardTilt', 'Target .hero-showcase-card.corporate-profile-card.card-tilt exists and has non-zero size',
      tiltResult.cardFound && tiltResult.rect.width > 200 && tiltResult.rect.height > 200, tiltResult.rect);

    for (const c of tiltResult.checks || []) {
      this.record('CardTilt', `Tilt point [${c.name}] perspective & rotation clamped <= 10°`,
        c.clamped && c.hasPerspective && c.hasScale && c.signValid, c);
    }

    const mouseleaveOk = tiltResult.resetTransform.includes('rotateX(0deg)') &&
                         tiltResult.resetTransform.includes('rotateY(0deg)') &&
                         tiltResult.resetGlow === '0';
    this.record('CardTilt', 'Mouseleave smoothly resets tilt to 0deg and --glow-opacity to 0', mouseleaveOk, {
      resetTransform: tiltResult.resetTransform,
      resetGlow: tiltResult.resetGlow,
      resetTransition: tiltResult.resetTransition
    });
  }

  /* --------------------------------------------------------------------------
   * 2. ANIMATION BUDGET & ELIMINATION OF BACKDROP-FILTER GPU STALLS
   * -------------------------------------------------------------------------- */
  async testAnimationBudgetAndBackdropFilter() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 2/6] Animation Budget & GPU Performance Validation...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    const perfAudit = await this.driver.evaluate(async () => {
      const card = document.querySelector('.hero-showcase-card.corporate-profile-card');
      const computed = window.getComputedStyle(card);
      const backdropFilter = computed.backdropFilter || computed.webkitBackdropFilter || 'none';

      // 60-frame RAF benchmark during active high-frequency tilt
      const rect = card.getBoundingClientRect();
      const frameDeltas = [];
      let lastTime = performance.now();

      for (let i = 0; i < 60; i++) {
        // High frequency mousemove alternating coordinates
        const x = rect.left + (i % 2 === 0 ? 30 : rect.width - 30);
        const y = rect.top + (i % 3 === 0 ? 30 : rect.height - 30);

        card.dispatchEvent(new MouseEvent('mousemove', {
          clientX: x,
          clientY: y,
          bubbles: true
        }));

        await new Promise(resolve => {
          requestAnimationFrame((now) => {
            frameDeltas.push(now - lastTime);
            lastTime = now;
            resolve();
          });
        });
      }

      // Discard initial frame setup warmup
      const steadyFrames = frameDeltas.slice(5);
      const avgDelta = steadyFrames.reduce((a, b) => a + b, 0) / steadyFrames.length;
      const maxDelta = Math.max(...steadyFrames);

      return {
        backdropFilter,
        avgDelta,
        maxDelta,
        sampleCount: steadyFrames.length
      };
    });

    const isBackdropClean = perfAudit.backdropFilter === 'none' || perfAudit.backdropFilter === '' || !perfAudit.backdropFilter.includes('blur');
    this.record('PerfBudget', 'Backdrop-filter is eliminated on .corporate-profile-card to prevent GPU rasterization stalls',
      isBackdropClean, { backdropFilter: perfAudit.backdropFilter });

    const is60fps = perfAudit.avgDelta <= 20.0; // 60fps nominal is 16.67ms
    this.record('PerfBudget', `RAF 60-frame stress benchmark maintains 60fps budget (avg: ${perfAudit.avgDelta.toFixed(2)}ms <= 20ms, max: ${perfAudit.maxDelta.toFixed(2)}ms)`,
      is60fps, perfAudit);
  }

  /* --------------------------------------------------------------------------
   * 3. SMOOTH ANCHOR NAVIGATION & OCCLUSION CLEARANCE
   * -------------------------------------------------------------------------- */
  async testSmoothAnchorNavigationAndOcclusion() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 3/6] Smooth Anchor Navigation & Occlusion Clearance...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    // Verify html smooth scrolling and scroll-margin-top
    const cssChecks = await this.driver.evaluate(() => {
      const htmlScrollBehavior = window.getComputedStyle(document.documentElement).scrollBehavior;
      const sectionIds = ['hero', 'services', 'portfolio', 'pricing-calculator', 'contact'];
      const marginMap = {};

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        marginMap[id] = el ? window.getComputedStyle(el).scrollMarginTop : null;
      }

      return { htmlScrollBehavior, marginMap };
    });

    this.record('AnchorNav', 'html { scroll-behavior: smooth } is declared',
      cssChecks.htmlScrollBehavior === 'smooth', { scrollBehavior: cssChecks.htmlScrollBehavior });

    const allHave100pxMargin = ['hero', 'services', 'portfolio', 'pricing-calculator', 'contact']
      .every(id => cssChecks.marginMap[id] === '100px');
    this.record('AnchorNav', 'All target sections have scroll-margin-top: 100px declared',
      allHave100pxMargin, cssChecks.marginMap);

    // Test real clicking on header anchor links and verifying position & no occlusion
    const targets = [
      { id: 'services', selector: '.site-header .nav-links a[href="#services"]' },
      { id: 'portfolio', selector: '.site-header .nav-links a[href="#portfolio"]' },
      { id: 'pricing-calculator', selector: '.site-header .nav-links a[href="#pricing-calculator"]' },
      { id: 'contact', selector: '.site-header .nav-links a[href="#contact"]' },
      { id: 'hero', selector: '.site-header .nav-links a[href="#hero"]' }
    ];

    for (const tgt of targets) {
      const navTest = await this.driver.evaluate(async (selector, targetId) => {
        const link = document.querySelector(selector);
        if (!link) return { error: `Link ${selector} not found` };

        link.click();

        // Wait until smooth scroll settles
        let lastY = window.scrollY;
        for (let i = 0; i < 25; i++) {
          await new Promise(r => setTimeout(r, 100));
          if (Math.abs(window.scrollY - lastY) < 2) break;
          lastY = window.scrollY;
        }

        const targetEl = document.getElementById(targetId);
        if (!targetEl) return { error: `Target #${targetId} not found` };

        const header = document.querySelector('.site-header') || document.querySelector('.navbar');
        const headerBottom = header ? header.getBoundingClientRect().bottom : 70;

        // Find primary heading or title inside target section
        const heading = targetEl.querySelector('h1, h2, h3, .section-title, .section-heading') || targetEl;
        const headingRect = heading.getBoundingClientRect();
        const sectionRect = targetEl.getBoundingClientRect();

        // Check distance from bottom of fixed header to top of heading
        const clearance = headingRect.top - headerBottom;

        return {
          scrollY: window.scrollY,
          headerBottom,
          headingTop: headingRect.top,
          sectionTop: sectionRect.top,
          clearance,
          noOcclusion: clearance >= -5, // Heading must not be hidden behind header
          hash: window.location.hash
        };
      }, tgt.selector, tgt.id);

      this.record('AnchorNav', `Click nav link '${tgt.selector}' scrolls without occluding #${tgt.id} (clearance: ${navTest.clearance ? navTest.clearance.toFixed(1) : 'N/A'}px)`,
        navTest.noOcclusion && !navTest.error, navTest);
    }
  }

  /* --------------------------------------------------------------------------
   * 4. MOBILE DRAWER ANCHOR NAVIGATION & TRANSITIONS
   * -------------------------------------------------------------------------- */
  async testMobileDrawerAnchorTransitions() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 4/6] Mobile Drawer Navigation & Scroll Lock Restoration...${colors.reset}`);
    await this.driver.setViewport(375, 667);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    // Step 1 & 2: Test opening drawer and navigating to #portfolio
    const testPortfolio = await this.driver.evaluate(async () => {
      const toggle = document.querySelector('.navbar__toggle');
      const drawer = document.querySelector('.mobile-menu, #mobile-nav-drawer');
      if (!toggle || !drawer) return { error: 'Toggle or drawer not found' };

      // Open drawer
      toggle.click();
      await new Promise(r => setTimeout(r, 250));

      const isOpenAfterClick = drawer.classList.contains('is-open') || drawer.classList.contains('active');
      const ariaExpanded = toggle.getAttribute('aria-expanded');
      const bodyScrollLocked = document.body.classList.contains('no-scroll') || document.body.style.overflow === 'hidden';

      // Click drawer link #portfolio
      const portfolioLink = drawer.querySelector('a[href="#portfolio"]');
      if (!portfolioLink) return { error: 'Drawer link a[href="#portfolio"] not found' };
      portfolioLink.click();

      await new Promise(r => setTimeout(r, 200));
      const isClosedAfterAnchor = !drawer.classList.contains('is-open') && !drawer.classList.contains('active');
      const ariaCollapsed = toggle.getAttribute('aria-expanded');
      const bodyScrollRestored = !document.body.classList.contains('no-scroll') && document.body.style.overflow !== 'hidden';

      // Wait until smooth scroll settles
      let lastY = window.scrollY;
      for (let i = 0; i < 25; i++) {
        await new Promise(r => setTimeout(r, 100));
        if (Math.abs(window.scrollY - lastY) < 2) break;
        lastY = window.scrollY;
      }

      const portfolioSection = document.getElementById('portfolio');
      const portRect = portfolioSection ? portfolioSection.getBoundingClientRect() : null;

      return {
        isOpenAfterClick,
        ariaExpanded,
        bodyScrollLocked,
        isClosedAfterAnchor,
        ariaCollapsed,
        bodyScrollRestored,
        scrollY: window.scrollY,
        portfolioTop: portRect ? portRect.top : null,
        portfolioVisible: portRect && portRect.top < 300
      };
    });

    this.record('MobileDrawer', 'Toggle opens drawer with aria-expanded="true" and locks body scroll',
      testPortfolio.isOpenAfterClick && testPortfolio.ariaExpanded === 'true' && testPortfolio.bodyScrollLocked, testPortfolio);

    this.record('MobileDrawer', 'Clicking drawer link (#portfolio) closes drawer, restores body scroll, and scrolls smoothly',
      testPortfolio.isClosedAfterAnchor && testPortfolio.bodyScrollRestored && testPortfolio.portfolioVisible, testPortfolio);

    // Step 3: Test opening drawer again and navigating to #contact
    const testContact = await this.driver.evaluate(async () => {
      const toggle = document.querySelector('.navbar__toggle');
      const drawer = document.querySelector('.mobile-menu, #mobile-nav-drawer');
      if (!toggle || !drawer) return { error: 'Toggle or drawer not found' };

      toggle.click();
      await new Promise(r => setTimeout(r, 250));

      const contactLink = drawer.querySelector('a[href="#contact"]');
      if (!contactLink) return { error: 'Drawer link a[href="#contact"] not found' };
      contactLink.click();

      await new Promise(r => setTimeout(r, 200));
      const isClosed = !drawer.classList.contains('is-open') && !drawer.classList.contains('active');

      // Wait until smooth scroll settles
      let lastY = window.scrollY;
      for (let i = 0; i < 25; i++) {
        await new Promise(r => setTimeout(r, 100));
        if (Math.abs(window.scrollY - lastY) < 2) break;
        lastY = window.scrollY;
      }

      const contactSection = document.getElementById('contact');
      const contactRect = contactSection ? contactSection.getBoundingClientRect() : null;

      return {
        isClosed,
        scrollY: window.scrollY,
        contactTop: contactRect ? contactRect.top : null,
        contactVisible: contactRect && contactRect.top < 300
      };
    });

    this.record('MobileDrawer', 'Clicking drawer link (#contact) closes drawer and scrolls to consultation section',
      testContact.isClosed && testContact.contactVisible, testContact);

    // Reset viewport back to desktop
    await this.driver.setViewport(1440, 900);
  }

  /* --------------------------------------------------------------------------
   * 5. DYNAMIC SCROLLSPY MECHANICS & STRESS TESTING
   * -------------------------------------------------------------------------- */
  async testScrollSpyMechanicsAndStress() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 5/6] Dynamic ScrollSpy Mechanics & Rapid Scroll Stress...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    // Verify initial active link at top of page
    const topCheck = await this.driver.evaluate(() => {
      window.scrollTo(0, 0);
      const activeLink = document.querySelector('.site-header .nav-links a.active, .site-header .nav-links a.is-active');
      return {
        activeHref: activeLink ? activeLink.getAttribute('href') : null
      };
    });
    this.record('ScrollSpy', 'Initial state (scrollY=0) marks #hero as active',
      topCheck.activeHref === '#hero' || topCheck.activeHref === 'index.html#hero', topCheck);

    // Test ScrollSpy on scrolling to sections
    const sectionsToTest = [
      { id: 'services', expectedHref: '#services' },
      { id: 'portfolio', expectedHref: '#portfolio' },
      { id: 'pricing-calculator', expectedHref: '#pricing-calculator' },
      { id: 'contact', expectedHref: '#contact' }
    ];

    for (const sec of sectionsToTest) {
      const spyResult = await this.driver.evaluate(async (sectionId, expectedHref) => {
        const el = document.getElementById(sectionId);
        if (!el) return { error: `Element #${sectionId} not found` };

        // Scroll so element center is comfortably in viewport
        const rect = el.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.top - 80,
          behavior: 'instant'
        });

        // Allow IntersectionObserver & RAF fallback to fire
        await new Promise(r => setTimeout(r, 200));

        const activeLinks = Array.from(document.querySelectorAll('.site-header .nav-links a.active, .site-header .nav-links a.is-active'))
          .map(a => a.getAttribute('href'));

        return {
          scrollY: window.scrollY,
          activeLinks,
          isMatch: activeLinks.some(h => h === expectedHref || h === `index.html${expectedHref}`)
        };
      }, sec.id, sec.expectedHref);

      this.record('ScrollSpy', `Scrolling to #${sec.id} dynamically activates '${sec.expectedHref}' in header nav`,
        spyResult.isMatch, spyResult);
    }

    // Stress test: 50 rapid randomized scroll thrash cycles
    const stressResult = await this.driver.evaluate(async () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      let errorOccurred = false;

      for (let i = 0; i < 50; i++) {
        const randY = Math.floor(Math.random() * maxScroll);
        window.scrollTo(0, randY);
        // Dispatch synthetic scroll event
        window.dispatchEvent(new Event('scroll'));
      }

      await new Promise(r => setTimeout(r, 300));

      const activeLinks = Array.from(document.querySelectorAll('.site-header .nav-links a.active, .site-header .nav-links a.is-active'));
      return {
        activeLinksCount: activeLinks.length,
        hasSingleOrZeroActive: activeLinks.length <= 1
      };
    });

    this.record('ScrollSpy', '50 rapid scroll jumps execute safely without race conditions or multiple active links',
      stressResult.hasSingleOrZeroActive, stressResult);
  }

  /* --------------------------------------------------------------------------
   * 6. CORPORATE CARD CONTENT & SEMANTIC INTEGRITY
   * -------------------------------------------------------------------------- */
  async testCorporateCardContentIntegrity() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 6/6] Corporate Profile Card Content & Room & Pillar Aesthetic...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    const contentAudit = await this.driver.evaluate(() => {
      const card = document.querySelector('.hero-showcase-card.corporate-profile-card');
      if (!card) return { error: 'Card not found' };

      const cardText = card.textContent;
      const entityNamePresent = cardText.includes('PT RUBIC KIRANA SOLUSINDO');
      const estRegPresent = cardText.includes('EST. 2020') && cardText.includes('LEGAL ENTITY');
      const verifiedBadgePresent = !!card.querySelector('.corp-card__status-pill') && cardText.includes('VERIFIED AGENCY');
      const pulseDotPresent = !!card.querySelector('.badge-pulse-dot');
      const monogramPresent = !!card.querySelector('.corp-card__monogram svg');

      // 5 Guarantees
      const g1 = cardText.includes('100% Garansi Uang Kembali');
      const g2 = cardText.includes('100% Kepemilikan Source Code');
      const g3 = cardText.includes('250+ Proyek Nasional Selesai');
      const g4 = cardText.includes('Core Web Vitals 95+') && cardText.includes('99.9% SLA');
      const g5 = cardText.includes('30-Day Bug-Free Guarantee');

      // Metrics Ribbon
      const ribbon = card.querySelector('.corp-card__metrics-ribbon');
      const ribbon100 = ribbon && ribbon.textContent.includes('100%') && ribbon.textContent.includes('Garansi Kepuasan');
      const ribbon95 = ribbon && ribbon.textContent.includes('95+') && ribbon.textContent.includes('PageSpeed');
      const ribbon250 = ribbon && ribbon.textContent.includes('250+') && ribbon.textContent.includes('Proyek Nasional');

      // Location footprint
      const locationPresent = cardText.includes('District 8 Treasury Tower') && cardText.includes('SCBD Jakarta');

      // Critical check: Hero card must NOT use native <footer> tag
      const hasInnerNativeFooter = !!card.querySelector('footer');

      return {
        entityNamePresent,
        estRegPresent,
        verifiedBadgePresent,
        pulseDotPresent,
        monogramPresent,
        allGuaranteesPresent: g1 && g2 && g3 && g4 && g5,
        guarantees: { g1, g2, g3, g4, g5 },
        metricsRibbonPresent: ribbon100 && ribbon95 && ribbon250,
        locationPresent,
        hasNoInnerNativeFooter: !hasInnerNativeFooter
      };
    });

    this.record('CorpCardContent', 'Official Legal Entity (PT RUBIC KIRANA SOLUSINDO, EST. 2020, VERIFIED AGENCY) rendered',
      contentAudit.entityNamePresent && contentAudit.estRegPresent && contentAudit.verifiedBadgePresent && contentAudit.pulseDotPresent, contentAudit);

    this.record('CorpCardContent', 'All 5 Core Guarantees with descriptions rendered in card body',
      contentAudit.allGuaranteesPresent, contentAudit.guarantees);

    this.record('CorpCardContent', 'Obsidian metrics ribbon rendered with 100% Garansi, 95+ PageSpeed, 250+ Proyek Nasional',
      contentAudit.metricsRibbonPresent, contentAudit);

    this.record('CorpCardContent', 'District 8 Treasury Tower SCBD Jakarta footprint rendered',
      contentAudit.locationPresent, contentAudit);

    this.record('CorpCardContent', 'Hero card footer uses non-footer container (no collision with global site-footer selector)',
      contentAudit.hasNoInnerNativeFooter, { hasInnerNativeFooter: !contentAudit.hasNoInnerNativeFooter });
  }

  summarizeVerdict() {
    this.log(`\n${colors.bold}${colors.magenta}================================================================${colors.reset}`);
    this.log(`${colors.bold}${colors.magenta}  M8 CHALLENGER HARNESS VERDICT & SUMMARY                       ${colors.reset}`);
    this.log(`${colors.bold}${colors.magenta}================================================================${colors.reset}`);

    const { total, passed, failed } = this.report.summary;
    this.log(`Total checks executed : ${total}`);
    this.log(`Total checks passed   : ${passed}`);
    this.log(`Total checks failed   : ${failed}`);

    if (failed === 0) {
      this.report.verdict = 'APPROVE';
      this.log(`\n${colors.bold}${colors.green}🏆 HARNESS VERDICT: APPROVE${colors.reset}`);
      this.log(`${colors.green}All Milestone 8 interactive physics, animation budget, and anchor navigation checks passed empirically with 0 errors.${colors.reset}\n`);
    } else {
      this.report.verdict = 'REQUEST_CHANGES';
      this.log(`\n${colors.bold}${colors.red}❌ HARNESS VERDICT: REQUEST_CHANGES${colors.reset}`);
      this.log(`${colors.red}${failed} checks failed. See report for details.${colors.reset}\n`);
    }
  }
}

if (require.main === module) {
  const harness = new ChallengerM8Harness();
  harness.run().catch(err => {
    console.error('Unhandled harness exception:', err);
    process.exit(1);
  });
}

module.exports = ChallengerM8Harness;
