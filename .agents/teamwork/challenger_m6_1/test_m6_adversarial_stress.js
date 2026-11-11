/**
 * EMPIRICAL ADVERSARIAL STRESS TEST HARNESS — MILESTONE 6
 * Challenger 1 (teamwork_challenger)
 * 
 * Verifies:
 * 1. Modal Lifecycle & Trap Stress (#case-study-modal and #service-modal)
 *    - Initial state computed display: none & visibility: hidden
 *    - Click open -> display: flex, opacity: 1, visibility: visible
 *    - Close via close button (&times;) -> display: none
 *    - Reopen and close via Escape key press -> display: none
 *    - Reopen and close via backdrop click -> display: none
 *    - 10x rapid open/close succession -> no stuck overlays or corrupted state
 * 2. Hero Showcase & Floating Dock Stress:
 *    - Hero showcase card 3D tilt interaction doesn't cause overflow across coordinates
 *    - Floating bottom dock at scrollY = 0 does NOT intersect Section 2 title across viewports (1280, 1440, 1920)
 *    - Rapid scroll down and scroll up hysteresis hides and shows dock without jumping
 */

const path = require('path');
const fs = require('fs');
const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');

const ROOT_DIR = path.resolve(__dirname, '../../..');

class AdversarialRunner {
  constructor() {
    this.server = null;
    this.driver = null;
    this.baseUrl = '';
    this.results = {
      passed: 0,
      failed: 0,
      tests: [],
      metrics: {}
    };
  }

  async init() {
    this.server = new StaticServer({ rootDir: ROOT_DIR, port: 0 });
    const { port } = await this.server.start();
    this.baseUrl = `http://127.0.0.1:${port}`;
    this.driver = new BrowserDriver({ headless: true });
    await this.driver.launch();
    console.log(`[CHALLENGER-M6] Test environment initialized at ${this.baseUrl}`);
  }

  record(name, success, details = {}) {
    if (success) {
      this.results.passed++;
      console.log(`  ✓ [PASS] ${name}`);
    } else {
      this.results.failed++;
      console.error(`  ✗ [FAIL] ${name}`, details);
    }
    this.results.tests.push({ name, success, details });
  }

  async close() {
    if (this.driver) {
      await this.driver.close().catch(() => {});
    }
    if (this.server) {
      await this.server.stop().catch(() => {});
    }
  }

  // --------------------------------------------------------------------------
  // SUITE 1: MODAL LIFECYCLE & TRAP STRESS (case-study-modal & service-modal)
  // --------------------------------------------------------------------------
  async runModalStress() {
    console.log('\n======================================================');
    console.log('▶ SUITE 1: MODAL LIFECYCLE & TRAP STRESS');
    console.log('======================================================');

    // 1.1 #case-study-modal on index.html
    await this.driver.setViewport({ width: 1440, height: 900 });
    await this.driver.goto(`${this.baseUrl}/index.html`);
    await new Promise(r => setTimeout(r, 400));

    // Verify initial load state
    const csInit = await this.driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      if (!modal) return { exists: false };
      const cs = window.getComputedStyle(modal);
      return {
        exists: true,
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
        ariaHidden: modal.getAttribute('aria-hidden'),
        inlineDisplay: modal.style.display
      };
    });

    this.record(
      'Case study modal computed display:none and visibility:hidden at page load (index.html)',
      csInit.exists && csInit.display === 'none' && csInit.visibility === 'hidden' && csInit.ariaHidden === 'true',
      csInit
    );

    // Click case study button -> modal must open
    await this.driver.evaluate(() => {
      const btn = document.querySelector('.btn-case-study[data-project-id="nexastore"]') ||
                  document.querySelector('.btn-case-study');
      if (!btn) throw new Error('Case study trigger button not found');
      btn.click();
    });
    await new Promise(r => setTimeout(r, 150));

    const csOpen1 = await this.driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      const cs = window.getComputedStyle(modal);
      return {
        isActive: modal.classList.contains('is-active'),
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
        ariaHidden: modal.getAttribute('aria-hidden'),
        bodyOverflow: document.body.style.overflow,
        hasNoScroll: document.body.classList.contains('no-scroll')
      };
    });

    this.record(
      'Case study button click opens modal (display:flex, opacity:1, visibility:visible, body locked)',
      csOpen1.isActive && csOpen1.display === 'flex' && csOpen1.visibility === 'visible' &&
      csOpen1.ariaHidden === 'false' && csOpen1.bodyOverflow === 'hidden',
      csOpen1
    );

    // Trigger close via close button (&times;)
    await this.driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      const closeBtn = modal.querySelector('.modal-close, #modal-close-btn');
      if (!closeBtn) throw new Error('Close button not found');
      closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 150));

    const csCloseBtn = await this.driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      const cs = window.getComputedStyle(modal);
      return {
        isActive: modal.classList.contains('is-active'),
        display: cs.display,
        visibility: cs.visibility,
        bodyOverflow: document.body.style.overflow,
        ariaHidden: modal.getAttribute('aria-hidden')
      };
    });

    this.record(
      'Trigger close via close button (&times;) closes modal (display:none, body unlocked)',
      !csCloseBtn.isActive && csCloseBtn.display === 'none' && csCloseBtn.visibility === 'hidden' &&
      csCloseBtn.bodyOverflow === '' && csCloseBtn.ariaHidden === 'true',
      csCloseBtn
    );

    // Reopen and trigger close via Escape key press
    await this.driver.evaluate(() => {
      const btn = document.querySelector('.btn-case-study[data-project-id="apex"]') ||
                  document.querySelector('.btn-case-study');
      btn.click();
    });
    await new Promise(r => setTimeout(r, 150));

    // Dispatch Escape key
    await this.driver.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 150));

    const csCloseEsc = await this.driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      const cs = window.getComputedStyle(modal);
      return {
        isActive: modal.classList.contains('is-active'),
        display: cs.display,
        visibility: cs.visibility,
        bodyOverflow: document.body.style.overflow,
        ariaHidden: modal.getAttribute('aria-hidden')
      };
    });

    this.record(
      'Reopen and trigger close via Escape key press closes modal (display:none, body unlocked)',
      !csCloseEsc.isActive && csCloseEsc.display === 'none' && csCloseEsc.visibility === 'hidden' &&
      csCloseEsc.bodyOverflow === '',
      csCloseEsc
    );

    // Reopen and trigger close via backdrop click
    await this.driver.evaluate(() => {
      const btn = document.querySelector('.btn-case-study[data-project-id="lumina"]') ||
                  document.querySelector('.btn-case-study');
      btn.click();
    });
    await new Promise(r => setTimeout(r, 150));

    // Click backdrop directly (outer overlay element outside modal-dialog)
    await this.driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      const clickEvt = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 });
      modal.dispatchEvent(clickEvt);
    });
    await new Promise(r => setTimeout(r, 150));

    const csCloseBackdrop = await this.driver.evaluate(() => {
      const modal = document.querySelector('#case-study-modal');
      const cs = window.getComputedStyle(modal);
      return {
        isActive: modal.classList.contains('is-active'),
        display: cs.display,
        visibility: cs.visibility,
        bodyOverflow: document.body.style.overflow,
        ariaHidden: modal.getAttribute('aria-hidden')
      };
    });

    this.record(
      'Reopen and trigger close via backdrop click closes modal (display:none, body unlocked)',
      !csCloseBackdrop.isActive && csCloseBackdrop.display === 'none' && csCloseBackdrop.visibility === 'hidden' &&
      csCloseBackdrop.bodyOverflow === '',
      csCloseBackdrop
    );

    // Rapidly click open/close 10 times in succession on case-study-modal
    const rapidStressCaseStudy = await this.driver.evaluate(async () => {
      const modal = document.querySelector('#case-study-modal');
      const trigger = document.querySelector('.btn-case-study');
      const closeBtn = modal.querySelector('.modal-close, #modal-close-btn');

      const log = [];
      for (let i = 0; i < 10; i++) {
        // Open
        trigger.click();
        const openDisplay = window.getComputedStyle(modal).display;

        // Alternate close mechanisms: closeBtn (even), Escape (odd)
        if (i % 2 === 0) {
          closeBtn.click();
        } else {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
        }

        const closeDisplay = window.getComputedStyle(modal).display;
        log.push({ cycle: i + 1, openDisplay, closeDisplay });
      }

      const finalCS = window.getComputedStyle(modal);
      return {
        cycles: log,
        finalDisplay: finalCS.display,
        finalVisibility: finalCS.visibility,
        finalIsActive: modal.classList.contains('is-active'),
        bodyOverflow: document.body.style.overflow,
        noScrollPresent: document.body.classList.contains('no-scroll')
      };
    });

    this.record(
      'Rapidly click open/close 10 times in succession on case-study-modal (no stuck overlay, clean teardown)',
      rapidStressCaseStudy.finalDisplay === 'none' &&
      rapidStressCaseStudy.finalVisibility === 'hidden' &&
      !rapidStressCaseStudy.finalIsActive &&
      rapidStressCaseStudy.bodyOverflow === '' &&
      !rapidStressCaseStudy.noScrollPresent,
      rapidStressCaseStudy
    );

    // 1.2 #service-modal on services.html
    await this.driver.goto(`${this.baseUrl}/services.html`);
    await new Promise(r => setTimeout(r, 400));

    // Initial state on services.html
    const svcInit = await this.driver.evaluate(() => {
      const modal = document.querySelector('#service-modal');
      if (!modal) return { exists: false };
      const cs = window.getComputedStyle(modal);
      return {
        exists: true,
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
        ariaHidden: modal.getAttribute('aria-hidden')
      };
    });

    this.record(
      'Service modal computed display:none and visibility:hidden at page load (services.html)',
      svcInit.exists && svcInit.display === 'none' && svcInit.visibility === 'hidden' && svcInit.ariaHidden === 'true',
      svcInit
    );

    // Click service modal button -> opens
    await this.driver.evaluate(() => {
      const btn = document.querySelector('.btn-service-modal[data-service-id="custom-web"]') ||
                  document.querySelector('.btn-service-modal');
      btn.click();
    });
    await new Promise(r => setTimeout(r, 150));

    const svcOpen = await this.driver.evaluate(() => {
      const modal = document.querySelector('#service-modal');
      const cs = window.getComputedStyle(modal);
      const title = document.getElementById('service-modal-title')?.textContent || '';
      return {
        isActive: modal.classList.contains('is-active'),
        display: cs.display,
        visibility: cs.visibility,
        ariaHidden: modal.getAttribute('aria-hidden'),
        title: title.trim(),
        bodyOverflow: document.body.style.overflow
      };
    });

    this.record(
      'Service button click opens #service-modal (display:flex, visibility:visible, title populated)',
      svcOpen.isActive && svcOpen.display === 'flex' && svcOpen.visibility === 'visible' &&
      svcOpen.title.length > 5 && svcOpen.bodyOverflow === 'hidden',
      svcOpen
    );

    // Close via close button (&times;)
    await this.driver.evaluate(() => {
      const btn = document.getElementById('service-modal-close') ||
                  document.querySelector('#service-modal .modal-close');
      btn.click();
    });
    await new Promise(r => setTimeout(r, 150));

    const svcCloseBtn = await this.driver.evaluate(() => {
      const modal = document.querySelector('#service-modal');
      const cs = window.getComputedStyle(modal);
      return {
        isActive: modal.classList.contains('is-active'),
        display: cs.display,
        visibility: cs.visibility,
        bodyOverflow: document.body.style.overflow
      };
    });

    this.record(
      'Trigger close via #service-modal-close (&times;) closes service modal',
      !svcCloseBtn.isActive && svcCloseBtn.display === 'none' && svcCloseBtn.visibility === 'hidden' &&
      svcCloseBtn.bodyOverflow === '',
      svcCloseBtn
    );

    // Reopen and close via Escape
    await this.driver.evaluate(() => {
      const btn = document.querySelector('.btn-service-modal[data-service-id="business-profile"]') ||
                  document.querySelector('.btn-service-modal');
      btn.click();
    });
    await new Promise(r => setTimeout(r, 150));

    await this.driver.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 150));

    const svcCloseEsc = await this.driver.evaluate(() => {
      const modal = document.querySelector('#service-modal');
      const cs = window.getComputedStyle(modal);
      return {
        isActive: modal.classList.contains('is-active'),
        display: cs.display,
        visibility: cs.visibility,
        bodyOverflow: document.body.style.overflow
      };
    });

    this.record(
      'Reopen and trigger close via Escape key press closes service modal',
      !svcCloseEsc.isActive && svcCloseEsc.display === 'none' && svcCloseEsc.visibility === 'hidden' &&
      svcCloseEsc.bodyOverflow === '',
      svcCloseEsc
    );

    // Reopen and close via backdrop click
    await this.driver.evaluate(() => {
      const btn = document.querySelector('.btn-service-modal[data-service-id="web-app"]') ||
                  document.querySelector('.btn-service-modal');
      btn.click();
    });
    await new Promise(r => setTimeout(r, 150));

    await this.driver.evaluate(() => {
      const modal = document.querySelector('#service-modal');
      const clickEvt = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 });
      modal.dispatchEvent(clickEvt);
    });
    await new Promise(r => setTimeout(r, 150));

    const svcCloseBackdrop = await this.driver.evaluate(() => {
      const modal = document.querySelector('#service-modal');
      const cs = window.getComputedStyle(modal);
      return {
        isActive: modal.classList.contains('is-active'),
        display: cs.display,
        visibility: cs.visibility,
        bodyOverflow: document.body.style.overflow
      };
    });

    this.record(
      'Reopen and trigger close via backdrop click closes service modal',
      !svcCloseBackdrop.isActive && svcCloseBackdrop.display === 'none' && svcCloseBackdrop.visibility === 'hidden' &&
      svcCloseBackdrop.bodyOverflow === '',
      svcCloseBackdrop
    );

    // Rapid 10x cycle on #service-modal
    const rapidStressService = await this.driver.evaluate(async () => {
      const modal = document.querySelector('#service-modal');
      const trigger = document.querySelector('.btn-service-modal');
      const closeBtn = document.getElementById('service-modal-close') || modal.querySelector('.modal-close');

      const log = [];
      for (let i = 0; i < 10; i++) {
        trigger.click();
        const openDisplay = window.getComputedStyle(modal).display;

        if (i % 2 === 0) {
          closeBtn.click();
        } else {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
        }

        const closeDisplay = window.getComputedStyle(modal).display;
        log.push({ cycle: i + 1, openDisplay, closeDisplay });
      }

      const finalCS = window.getComputedStyle(modal);
      return {
        cycles: log,
        finalDisplay: finalCS.display,
        finalVisibility: finalCS.visibility,
        finalIsActive: modal.classList.contains('is-active'),
        bodyOverflow: document.body.style.overflow
      };
    });

    this.record(
      'Rapidly click open/close 10 times in succession on service-modal (no stuck overlay, clean teardown)',
      rapidStressService.finalDisplay === 'none' &&
      rapidStressService.finalVisibility === 'hidden' &&
      !rapidStressService.finalIsActive &&
      rapidStressService.bodyOverflow === '',
      rapidStressService
    );
  }

  // --------------------------------------------------------------------------
  // SUITE 2: HERO SHOWCASE 3D TILT & OVERFLOW STRESS
  // --------------------------------------------------------------------------
  async runHeroTiltStress() {
    console.log('\n======================================================');
    console.log('▶ SUITE 2: HERO SHOWCASE CARD 3D TILT & OVERFLOW STRESS');
    console.log('======================================================');

    await this.driver.setViewport({ width: 1440, height: 900 });
    await this.driver.goto(`${this.baseUrl}/index.html`);
    await new Promise(r => setTimeout(r, 500));

    const tiltStressResults = await this.driver.evaluate(async () => {
      const card = document.querySelector('.hero-showcase-card');
      if (!card) return { exists: false };

      const rect = card.getBoundingClientRect();
      const testCoordinates = [
        { label: 'Center (0, 0)', clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 },
        { label: 'Top-Left Corner', clientX: rect.left + 5, clientY: rect.top + 5 },
        { label: 'Top-Right Corner', clientX: rect.right - 5, clientY: rect.top + 5 },
        { label: 'Bottom-Left Corner', clientX: rect.left + 5, clientY: rect.bottom - 5 },
        { label: 'Bottom-Right Corner', clientX: rect.right - 5, clientY: rect.bottom - 5 },
        { label: 'Beyond Bounds (Clamping Test)', clientX: rect.right + 200, clientY: rect.bottom + 200 }
      ];

      const steps = [];

      for (const coord of testCoordinates) {
        card.dispatchEvent(new MouseEvent('mousemove', {
          clientX: coord.clientX,
          clientY: coord.clientY,
          bubbles: true,
          cancelable: true
        }));

        // Measure layout metrics
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const scrollX = window.scrollX;
        const transform = card.style.transform;
        const cardBox = card.getBoundingClientRect();

        steps.push({
          label: coord.label,
          transform,
          scrollWidth,
          innerWidth,
          hasOverflow: scrollWidth > innerWidth,
          scrollX,
          cardRight: Math.round(cardBox.right)
        });
      }

      // Test mouseleave reset
      card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 550));
      const resetTransform = card.style.transform;

      return {
        exists: true,
        steps,
        resetTransform,
        allZeroOverflow: steps.every(s => !s.hasOverflow && s.scrollX === 0)
      };
    });

    this.record(
      'Hero showcase card exists and receives 3D tilt perspective transforms',
      tiltStressResults.exists && tiltStressResults.steps.every(s => s.transform.includes('perspective')),
      tiltStressResults
    );

    this.record(
      '3D tilt across extreme corner coordinates causes ZERO horizontal overflow (scrollWidth <= innerWidth)',
      tiltStressResults.allZeroOverflow,
      tiltStressResults.steps
    );

    this.record(
      'Mouseleave resets Hero showcase card tilt to identity transform',
      tiltStressResults.resetTransform.includes('rotateX(0deg)') || tiltStressResults.resetTransform.includes('scale3d(1, 1, 1)'),
      { resetTransform: tiltStressResults.resetTransform }
    );
  }

  // --------------------------------------------------------------------------
  // SUITE 3: FLOATING DOCK HEADING CLEARANCE ACROSS VIEWPORTS AT scrollY = 0
  // --------------------------------------------------------------------------
  async runDockClearanceStress() {
    console.log('\n======================================================');
    console.log('▶ SUITE 3: FLOATING DOCK SECTION 2 COLLISION STRESS (scrollY = 0)');
    console.log('======================================================');

    const viewportsToTest = [
      { width: 1280, height: 720 },
      { width: 1280, height: 800 },
      { width: 1280, height: 900 },
      { width: 1280, height: 1024 },
      { width: 1440, height: 900 },
      { width: 1440, height: 1080 },
      { width: 1920, height: 1080 },
      { width: 1920, height: 1200 }
    ];

    for (const vp of viewportsToTest) {
      await this.driver.setViewport(vp);
      await this.driver.goto(`${this.baseUrl}/index.html`);
      await this.driver.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 200));

      const collisionCheck = await this.driver.evaluate(() => {
        const dock = document.querySelector('.floating-bottom-nav');
        const section2 = document.getElementById('services');
        const title = section2 ? section2.querySelector('.section-title') : null;

        if (!dock || !title) {
          return { error: 'Elements not found', hasDock: !!dock, hasTitle: !!title };
        }

        const dockRect = dock.getBoundingClientRect();
        const titleRect = title.getBoundingClientRect();

        // Strict 2D AABB intersection check
        const intersects = !(
          dockRect.bottom < titleRect.top ||
          dockRect.top > titleRect.bottom ||
          dockRect.right < titleRect.left ||
          dockRect.left > titleRect.right
        );

        // Clearance distance (dock.bottom to title.top)
        const verticalGap = Math.round(titleRect.top - dockRect.bottom);

        return {
          viewportHeight: window.innerHeight,
          dock: {
            top: Math.round(dockRect.top),
            bottom: Math.round(dockRect.bottom),
            left: Math.round(dockRect.left),
            right: Math.round(dockRect.right),
            height: Math.round(dockRect.height)
          },
          title: {
            top: Math.round(titleRect.top),
            bottom: Math.round(titleRect.bottom),
            left: Math.round(titleRect.left),
            right: Math.round(titleRect.right),
            height: Math.round(titleRect.height)
          },
          verticalGap,
          intersects,
          titleIsBelowFold: titleRect.top >= window.innerHeight
        };
      });

      this.record(
        `Floating dock does NOT intersect Section 2 title at scrollY=0 on viewport ${vp.width}x${vp.height}`,
        !collisionCheck.intersects && collisionCheck.verticalGap > 0,
        { viewport: `${vp.width}x${vp.height}`, ...collisionCheck }
      );
    }
  }

  // --------------------------------------------------------------------------
  // SUITE 4: FLOATING DOCK SCROLL HYSTERESIS & RAPID SCROLL STRESS
  // --------------------------------------------------------------------------
  async runDockHysteresisStress() {
    console.log('\n======================================================');
    console.log('▶ SUITE 4: FLOATING DOCK SCROLL HYSTERESIS STRESS');
    console.log('======================================================');

    await this.driver.setViewport({ width: 1440, height: 900 });
    await this.driver.goto(`${this.baseUrl}/index.html`);
    await this.driver.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 300));

    // Verify initial dock state at scrollY = 0
    const dockInitial = await this.driver.evaluate(() => {
      const dock = document.querySelector('.floating-bottom-nav');
      return {
        hasHiddenClass: dock.classList.contains('nav-dock--hidden'),
        computedOpacity: window.getComputedStyle(dock).opacity,
        computedTransform: window.getComputedStyle(dock).transform
      };
    });

    this.record(
      'Floating dock initially visible at scrollY = 0 (no nav-dock--hidden class)',
      !dockInitial.hasHiddenClass && dockInitial.computedOpacity === '1',
      dockInitial
    );

    // Rapid scroll down past 400px in rapid increments (0 -> 200 -> 450 -> 700)
    await this.driver.evaluate(async () => {
      window.scrollTo({ top: 200, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
      await new Promise(r => requestAnimationFrame(r));

      window.scrollTo({ top: 500, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
      await new Promise(r => requestAnimationFrame(r));

      window.scrollTo({ top: 750, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
      await new Promise(r => requestAnimationFrame(r));
    });
    // Wait for 350ms CSS transition to fully settle
    await new Promise(r => setTimeout(r, 450));

    const dockScrolledDown = await this.driver.evaluate(() => {
      const dock = document.querySelector('.floating-bottom-nav');
      const cs = window.getComputedStyle(dock);
      return {
        scrollY: window.scrollY,
        hasHiddenClass: dock.classList.contains('nav-dock--hidden'),
        computedOpacity: cs.opacity,
        numericOpacity: parseFloat(cs.opacity),
        pointerEvents: cs.pointerEvents,
        transform: cs.transform
      };
    });

    this.record(
      'Rapid scroll-down past 400px adds .nav-dock--hidden (hides dock with opacity:0, pointer-events:none)',
      dockScrolledDown.hasHiddenClass && dockScrolledDown.numericOpacity < 0.05 &&
      dockScrolledDown.pointerEvents === 'none',
      dockScrolledDown
    );

    // Rapid scroll up (750 -> 650 -> 500) with deltaY < -8: reveals dock smoothly
    await this.driver.evaluate(async () => {
      window.scrollTo({ top: 650, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
      await new Promise(r => requestAnimationFrame(r));

      window.scrollTo({ top: 500, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
      await new Promise(r => requestAnimationFrame(r));
    });
    // Wait for 350ms CSS transition to fully settle
    await new Promise(r => setTimeout(r, 450));

    const dockScrolledUp = await this.driver.evaluate(() => {
      const dock = document.querySelector('.floating-bottom-nav');
      const cs = window.getComputedStyle(dock);
      return {
        scrollY: window.scrollY,
        hasHiddenClass: dock.classList.contains('nav-dock--hidden'),
        computedOpacity: cs.opacity,
        numericOpacity: parseFloat(cs.opacity),
        pointerEvents: cs.pointerEvents,
        transform: cs.transform
      };
    });

    this.record(
      'Upward scroll delta removes .nav-dock--hidden (reveals dock smoothly without jumping)',
      !dockScrolledUp.hasHiddenClass && dockScrolledUp.numericOpacity > 0.95,
      dockScrolledUp
    );

    // 10x Rapid alternating scroll-down / scroll-up cycles to stress hysteresis logic
    const rapidScrollHysteresis = await this.driver.evaluate(async () => {
      const dock = document.querySelector('.floating-bottom-nav');
      const states = [];

      for (let i = 0; i < 10; i++) {
        // Fast scroll down to 800
        window.scrollTo({ top: 800, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
        await new Promise(r => setTimeout(r, 30));
        const downHidden = dock.classList.contains('nav-dock--hidden');

        // Fast scroll up to 600
        window.scrollTo({ top: 600, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
        await new Promise(r => setTimeout(r, 30));
        const upHidden = dock.classList.contains('nav-dock--hidden');

        states.push({ cycle: i + 1, downHidden, upHidden });
      }

      // Return to top
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
      await new Promise(r => setTimeout(r, 50));

      const finalHidden = dock.classList.contains('nav-dock--hidden');
      const finalOpacity = window.getComputedStyle(dock).opacity;

      return {
        states,
        finalHidden,
        finalOpacity,
        consistentTransitions: states.every(s => s.downHidden === true && s.upHidden === false)
      };
    });

    this.record(
      '10x rapid alternating scroll down/up hysteresis cycles execute deterministically without lockup or flicker',
      rapidScrollHysteresis.consistentTransitions && !rapidScrollHysteresis.finalHidden &&
      rapidScrollHysteresis.finalOpacity === '1',
      rapidScrollHysteresis
    );
  }

  // --------------------------------------------------------------------------
  // MASTER ORCHESTRATION
  // --------------------------------------------------------------------------
  async run() {
    try {
      await this.init();
      await this.runModalStress();
      await this.runHeroTiltStress();
      await this.runDockClearanceStress();
      await this.runDockHysteresisStress();

      console.log('\n======================================================');
      console.log('SUMMARY OF EMPIRICAL ADVERSARIAL STRESS RUN');
      console.log('======================================================');
      console.log(`Total Assertions : ${this.results.passed + this.results.failed}`);
      console.log(`Passed           : ${this.results.passed}`);
      console.log(`Failed           : ${this.results.failed}`);

      const verdict = this.results.failed === 0 ? 'APPROVE' : 'REJECT';
      console.log(`VERDICT          : ${verdict}`);

      const summaryPath = path.resolve(__dirname, 'stress_test_results.json');
      fs.writeFileSync(summaryPath, JSON.stringify(this.results, null, 2), 'utf8');
      console.log(`Saved detailed execution results to: ${summaryPath}`);

      return verdict;
    } finally {
      await this.close();
    }
  }
}

if (require.main === module) {
  const runner = new AdversarialRunner();
  runner.run().then(verdict => {
    process.exit(verdict === 'APPROVE' ? 0 : 1);
  }).catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}

module.exports = AdversarialRunner;
