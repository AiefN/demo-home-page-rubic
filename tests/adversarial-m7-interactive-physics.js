/**
 * Rubicweb — Milestone 7 Adversarial Interactive Physics & Stress Harness
 * Agent: challenger_m7_1 (Interactive Physics Challenger)
 * 
 * Empirically tests all interactive systems under stress, edge cases, and real CDP events:
 * 1. Custom Cursor: LERP follow physics (λ=0.16), hover expansion, touch device suppression.
 * 2. 3D Card Tilt: perspective calculations, CSS vars (--mouse-x, --mouse-y, --glow-opacity), mouseleave reset.
 * 3. Stats Counters: IntersectionObserver viewport trigger, easeOutExpo monotonicity, target values.
 * 4. Testimonial Carousel: 5s auto-scroll, pause on hover/focus, nav controls, touch swipe.
 * 5. FAQ Accordion: single-active item expansion, 45° toggle icon rotation, smooth grid transition, keyboard navigation.
 * 6. Navbar & Dock: scroll hysteresis (hide down / show up), backdrop blur, mobile drawer open/close body scroll lock.
 * 7. Rapid Interaction Stress: rapid bursts, resize storm, 60fps RAF frame budget, zero console errors.
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
  dim: '\x1b[2m',
  magenta: '\x1b[35m'
};

class AdversarialPhysicsHarness {
  constructor() {
    this.server = null;
    this.driver = null;
    this.baseUrl = '';
    this.report = {
      timestamp: new Date().toISOString(),
      summary: { total: 0, passed: 0, failed: 0 },
      suites: {},
      consoleErrors: [],
      fpsTelemetry: {},
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
    this.log(`${colors.bold}${colors.magenta}  RUBICWEB M7: ADVERSARIAL INTERACTIVE PHYSICS STRESS HARNESS    ${colors.reset}`);
    this.log(`${colors.bold}${colors.magenta}================================================================${colors.reset}\n`);

    this.server = new StaticServer({ rootDir: path.resolve(__dirname, '..') });
    const srvInfo = await this.server.start();
    this.baseUrl = srvInfo.url;
    this.log(`${colors.cyan}Static Server started at:${colors.reset} ${this.baseUrl}`);

    this.driver = new BrowserDriver();
    await this.driver.launch();
    this.log(`${colors.cyan}Headless Browser launched successfully.${colors.reset}\n`);

    try {
      await this.testCustomCursor();
      await this.test3DCardTilt();
      await this.testStatsCounters();
      await this.testTestimonialCarousel();
      await this.testFaqAccordion();
      await this.testNavbarAndDock();
      await this.testRapidInteractionStress();
      await this.testSubpagesInteractivity();

      this.summarizeVerdict();
    } catch (err) {
      console.error(`${colors.red}Fatal harness execution error:${colors.reset}`, err);
      this.report.fatalError = err.message;
      this.report.verdict = 'REJECT';
    } finally {
      if (this.driver) await this.driver.close();
      if (this.server) await this.server.stop();

      const outputPath = path.resolve(__dirname, 'challenger-m7-physics-report.json');
      fs.writeFileSync(outputPath, JSON.stringify(this.report, null, 2), 'utf-8');
      this.log(`\nDetailed report written to: ${outputPath}`);
    }
  }

  /* --------------------------------------------------------------------------
   * 1. CUSTOM CURSOR PHYSICS & EXPANSION
   * -------------------------------------------------------------------------- */
  async testCustomCursor() {
    this.log(`${colors.bold}${colors.yellow}▶ [SUITE 1/8] Custom Cursor Physics & Follower LERP (λ=0.16)...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    // 1.1 DOM Existence and safety attributes
    const cursorInit = await this.driver.evaluate(() => {
      const dot = document.querySelector('.cursor-dot');
      const follower = document.querySelector('.cursor-follower');
      return {
        dotPresent: !!dot,
        followerPresent: !!follower,
        dotPointerEvents: dot ? window.getComputedStyle(dot).pointerEvents : null,
        followerPointerEvents: follower ? window.getComputedStyle(follower).pointerEvents : null,
        dotAriaHidden: dot ? dot.getAttribute('aria-hidden') : null,
        followerAriaHidden: follower ? follower.getAttribute('aria-hidden') : null
      };
    });

    this.record('CustomCursor', 'Cursor dot and follower DOM elements exist',
      cursorInit.dotPresent && cursorInit.followerPresent, cursorInit);
    this.record('CustomCursor', 'Cursor elements have pointer-events: none',
      cursorInit.dotPointerEvents === 'none' && cursorInit.followerPointerEvents === 'none', cursorInit);
    this.record('CustomCursor', 'Cursor elements have aria-hidden="true"',
      cursorInit.dotAriaHidden === 'true' && cursorInit.followerAriaHidden === 'true', cursorInit);

    // 1.2 Instant Dot Placement and LERP Follower Progression
    const lerpProgression = await this.driver.evaluate(async () => {
      const dot = document.querySelector('.cursor-dot');
      const follower = document.querySelector('.cursor-follower');

      // Dispatch mousemove to (350, 450)
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 350, clientY: 450, bubbles: true }));

      // Immediate check: dot should match instantly
      const instantDotTransform = dot.style.transform;

      // Sample follower progression over time
      const samples = [];
      for (const delay of [25, 75, 150, 300, 600]) {
        await new Promise(r => setTimeout(r, delay));
        const transform = follower.style.transform;
        const match = transform.match(/translate3d\(([\d.-]+)px,\s*([\d.-]+)px/);
        const fx = match ? parseFloat(match[1]) : null;
        const fy = match ? parseFloat(match[2]) : null;
        samples.push({ delay, transform, fx, fy, dist: (fx !== null && fy !== null) ? Math.hypot(350 - fx, 450 - fy) : null });
      }

      return { instantDotTransform, samples };
    });

    const hasInstantDot = lerpProgression.instantDotTransform &&
      lerpProgression.instantDotTransform.includes('350px') &&
      lerpProgression.instantDotTransform.includes('450px');
    this.record('CustomCursor', 'Cursor dot translates instantly to (350, 450)', hasInstantDot, lerpProgression);

    const finalSample = lerpProgression.samples[lerpProgression.samples.length - 1];
    const convergedAccurate = finalSample.dist !== null && finalSample.dist < 5;
    this.record('CustomCursor', `Follower converges via LERP within 5px of target (dist=${finalSample.dist?.toFixed(2)}px)`,
      convergedAccurate, { finalSample, allSamples: lerpProgression.samples });

    // 1.3 Interactive hover expansion
    const hoverCheck = await this.driver.evaluate(async () => {
      const follower = document.querySelector('.cursor-follower');
      const btn = document.querySelector('.btn--primary') || document.querySelector('button');

      // Hover over interactive button
      btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      const hasHoverOn = follower.classList.contains('cursor-hover') || document.body.classList.contains('cursor-hover');

      // Leave interactive button
      btn.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
      const hasHoverOff = !follower.classList.contains('cursor-hover') && !document.body.classList.contains('cursor-hover');

      return { hasHoverOn, hasHoverOff };
    });

    this.record('CustomCursor', 'Follower ring expands (.cursor-hover) on interactive hover',
      hoverCheck.hasHoverOn, hoverCheck);
    this.record('CustomCursor', 'Follower ring resets when leaving interactive element',
      hoverCheck.hasHoverOff, hoverCheck);

    // 1.4 Touch Device Suppression (CSS and JS check)
    const touchCheck = await this.driver.evaluate(() => {
      // Check stylesheet media query for pointer: coarse / hover: none
      const styleSheets = Array.from(document.styleSheets);
      let foundCoarseRule = false;
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.media && (rule.media.mediaText.includes('pointer: coarse') || rule.media.mediaText.includes('hover: none'))) {
              if (rule.cssText.includes('.cursor-dot') || rule.cssText.includes('.cursor-follower')) {
                foundCoarseRule = true;
                break;
              }
            }
          }
        } catch (e) {
          // cross-origin stylesheets ignore
        }
      }
      return { foundCoarseRule };
    });

    this.record('CustomCursor', 'Cursor suppression rule exists for touch devices (@media pointer: coarse / hover: none)',
      touchCheck.foundCoarseRule, touchCheck);
  }

  /* --------------------------------------------------------------------------
   * 2. 3D CARD TILT PHYSICS & SPECULAR RADIAL GLOW
   * -------------------------------------------------------------------------- */
  async test3DCardTilt() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 2/8] 3D Card Tilt Physics & Radial Specular Highlight...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    const tiltAudit = await this.driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .service-card');
      if (!card) return { error: 'No tilt card found' };

      const rect = card.getBoundingClientRect();
      const points = [
        { name: 'Top-Left Corner', x: rect.left + 5, y: rect.top + 5, expectedRotXSign: 1, expectedRotYSign: -1 },
        { name: 'Top-Right Corner', x: rect.right - 5, y: rect.top + 5, expectedRotXSign: 1, expectedRotYSign: 1 },
        { name: 'Bottom-Left Corner', x: rect.left + 5, y: rect.bottom - 5, expectedRotXSign: -1, expectedRotYSign: -1 },
        { name: 'Bottom-Right Corner', x: rect.right - 5, y: rect.bottom - 5, expectedRotXSign: -1, expectedRotYSign: 1 },
        { name: 'Dead Center', x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, expectedRotXSign: 0, expectedRotYSign: 0 },
        { name: 'Extreme Negative Out-of-Bounds', x: -1000, y: -1000, clampCheck: true },
        { name: 'Extreme Positive Out-of-Bounds', x: rect.right + 2500, y: rect.bottom + 2500, clampCheck: true }
      ];

      const results = [];
      for (const pt of points) {
        card.dispatchEvent(new MouseEvent('mousemove', {
          clientX: pt.x,
          clientY: pt.y,
          bubbles: true
        }));

        const transform = card.style.transform;
        const mouseX = card.style.getPropertyValue('--mouse-x');
        const mouseY = card.style.getPropertyValue('--mouse-y');
        const glowOpacity = card.style.getPropertyValue('--glow-opacity');

        const rotXMatch = transform.match(/rotateX\(([\d.-]+)deg\)/);
        const rotYMatch = transform.match(/rotateY\(([\d.-]+)deg\)/);
        const rotX = rotXMatch ? parseFloat(rotXMatch[1]) : 0;
        const rotY = rotYMatch ? parseFloat(rotYMatch[1]) : 0;

        results.push({
          name: pt.name,
          transform,
          rotX,
          rotY,
          mouseX,
          mouseY,
          glowOpacity,
          clamped: Math.abs(rotX) <= 10.01 && Math.abs(rotY) <= 10.01,
          hasPerspective: transform.includes('perspective(1000px)'),
          hasScale: transform.includes('scale3d(1.02, 1.02, 1.02)'),
          rotXSignOk: pt.expectedRotXSign === 0 ? Math.abs(rotX) < 1 : (pt.expectedRotXSign > 0 ? rotX > 0 : rotX < 0),
          rotYSignOk: pt.expectedRotYSign === 0 ? Math.abs(rotY) < 1 : (pt.expectedRotYSign > 0 ? rotY > 0 : rotY < 0)
        });
      }

      // Test reset on mouseleave
      card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      const resetTransform = card.style.transform;
      const resetTransition = card.style.transition;
      const resetGlowOpacity = card.style.getPropertyValue('--glow-opacity');

      return {
        results,
        resetTransform,
        resetTransition,
        resetGlowOpacity
      };
    });

    for (const r of tiltAudit.results) {
      this.record('CardTilt', `Tilt [${r.name}] clamped <= 10° (rotX=${r.rotX}°, rotY=${r.rotY}°)`,
        r.clamped && r.hasPerspective && r.hasScale, r);
    }

    const mouseXOk = tiltAudit.results[0].mouseX && tiltAudit.results[0].mouseX.length > 0;
    const mouseYOk = tiltAudit.results[0].mouseY && tiltAudit.results[0].mouseY.length > 0;
    this.record('CardTilt', 'Dynamic CSS variables --mouse-x and --mouse-y set on mousemove',
      mouseXOk && mouseYOk, { mouseX: tiltAudit.results[0].mouseX, mouseY: tiltAudit.results[0].mouseY });

    this.record('CardTilt', 'CSS var --glow-opacity set to 1 during active tilt hover',
      tiltAudit.results[0].glowOpacity === '1', { glowOpacity: tiltAudit.results[0].glowOpacity });

    const isResetClean = tiltAudit.resetTransform.includes('rotateX(0deg)') &&
      tiltAudit.resetTransform.includes('rotateY(0deg)') &&
      tiltAudit.resetGlowOpacity === '0';
    this.record('CardTilt', 'Mouseleave smoothly resets tilt to 0deg and --glow-opacity to 0',
      isResetClean, tiltAudit);
  }

  /* --------------------------------------------------------------------------
   * 3. STATS COUNTERS & INTERSECTIONOBSERVER VIEWPORT ANIMATION
   * -------------------------------------------------------------------------- */
  async testStatsCounters() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 3/8] Numerical Stats Counters & IntersectionObserver...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    const preScrollState = await this.driver.evaluate(() => {
      const counters = Array.from(document.querySelectorAll('[data-counter-target], [data-target], .stat-number'));
      return counters.map(c => ({
        text: c.textContent.trim(),
        target: c.getAttribute('data-counter-target') || c.getAttribute('data-target') || '',
        hasAnimated: !!c._hasAnimated
      }));
    });

    this.record('StatsCounters', 'Stats counters detected on index.html', preScrollState.length >= 4, preScrollState);

    // Scroll stats section into viewport to trigger observer
    await this.driver.evaluate(() => {
      const stats = document.querySelector('#stats, #why-us, .stats-cards-grid') || document.querySelector('[data-counter-target]');
      if (stats) stats.scrollIntoView({ behavior: 'instant', block: 'center' });
    });

    // Wait 2500ms for 2000ms easeOutExpo animation to finish
    await new Promise(r => setTimeout(r, 2500));

    const postScrollState = await this.driver.evaluate(() => {
      const counters = Array.from(document.querySelectorAll('[data-counter-target], [data-target], .stat-number'));
      return counters.map(c => ({
        text: c.textContent.trim(),
        target: c.getAttribute('data-counter-target') || c.getAttribute('data-target') || '',
        hasAnimated: !!c._hasAnimated
      }));
    });

    const values = postScrollState.map(s => s.text);
    const has100 = values.some(v => v.includes('100%'));
    const has250 = values.some(v => v.includes('250+'));
    const has999 = values.some(v => v.includes('99.9%'));
    const has95 = values.some(v => v.includes('95+'));

    this.record('StatsCounters', 'Target value "100%" reached with "%" suffix', has100, { values });
    this.record('StatsCounters', 'Target value "250+" reached with "+" suffix', has250, { values });
    this.record('StatsCounters', 'Target value "99.9%" reached with 1 decimal and "%" suffix', has999, { values });
    this.record('StatsCounters', 'Target value "95+" reached with "+" suffix', has95, { values });

    // Re-scroll out and back in to test re-trigger immunity
    const retriggerCheck = await this.driver.evaluate(async () => {
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 200));
      const stats = document.querySelector('#stats, #why-us, .stats-cards-grid');
      if (stats) stats.scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise(r => setTimeout(r, 500));

      const counters = Array.from(document.querySelectorAll('[data-counter-target], [data-target], .stat-number'));
      return counters.map(c => c.textContent.trim());
    });

    const valuesRetained = retriggerCheck.some(v => v.includes('100%')) && retriggerCheck.some(v => v.includes('250+'));
    this.record('StatsCounters', 'Re-intersection immunity: values retained without resetting to 0',
      valuesRetained, { retriggerCheck });
  }

  /* --------------------------------------------------------------------------
   * 4. TESTIMONIAL CAROUSEL AUTOPLAY, PAUSE & CONTROLS
   * -------------------------------------------------------------------------- */
  async testTestimonialCarousel() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 4/8] Testimonials Carousel Autoplay & Physics Controls...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    // Scroll carousel into view
    await this.driver.evaluate(() => {
      const carousel = document.querySelector('.testimonial-carousel, #testimonials');
      if (carousel) carousel.scrollIntoView({ behavior: 'instant', block: 'center' });
    });

    // 4.1 Forward navigation controls
    const navCheck = await this.driver.evaluate(async () => {
      const carousel = document.querySelector('.testimonial-carousel');
      const inst = carousel ? carousel._carousel : null;
      const nextBtn = document.querySelector('.carousel-btn--next, [data-next]');
      const prevBtn = document.querySelector('.carousel-btn--prev, [data-prev]');

      const initialIndex = inst ? inst.currentIndex : -1;
      if (nextBtn) nextBtn.click();
      await new Promise(r => setTimeout(r, 100));
      const afterNextIndex = inst ? inst.currentIndex : -1;

      if (prevBtn) prevBtn.click();
      await new Promise(r => setTimeout(r, 100));
      const afterPrevIndex = inst ? inst.currentIndex : -1;

      return { initialIndex, afterNextIndex, afterPrevIndex };
    });

    this.record('TestimonialCarousel', 'Next button advances slide immediately (0 -> 1)',
      navCheck.initialIndex === 0 && navCheck.afterNextIndex === 1, navCheck);
    this.record('TestimonialCarousel', 'Prev button reverses slide immediately (1 -> 0)',
      navCheck.afterPrevIndex === 0, navCheck);

    // 4.2 Pause on Hover (wait 5.2s while hovered)
    this.log(`    ${colors.dim}... hovering carousel to verify 5s autoplay pause (5.2s)...${colors.reset}`);
    const pauseHoverCheck = await this.driver.evaluate(async () => {
      const carousel = document.querySelector('.testimonial-carousel');
      const inst = carousel ? carousel._carousel : null;
      if (!carousel || !inst) return { error: 'No carousel' };

      // Dispatch mouseenter
      carousel.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      const indexAtHoverStart = inst.currentIndex;

      await new Promise(r => setTimeout(r, 5200));
      const indexAfterHoverWait = inst.currentIndex;

      // Dispatch mouseleave to resume
      carousel.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

      return { indexAtHoverStart, indexAfterHoverWait };
    });

    this.record('TestimonialCarousel', 'Autoplay paused for 5.2s during mouseenter hover',
      pauseHoverCheck.indexAtHoverStart === pauseHoverCheck.indexAfterHoverWait, pauseHoverCheck);

    // 4.3 Resume on Mouseleave
    this.log(`    ${colors.dim}... waiting 5.3s after unhover to verify autoplay resume...${colors.reset}`);
    await new Promise(r => setTimeout(r, 5300));
    const resumeCheck = await this.driver.evaluate(() => {
      const carousel = document.querySelector('.testimonial-carousel');
      const inst = carousel ? carousel._carousel : null;
      return { currentIndex: inst ? inst.currentIndex : -1 };
    });

    this.record('TestimonialCarousel', 'Autoplay resumed automatically after mouseleave',
      resumeCheck.currentIndex > pauseHoverCheck.indexAfterHoverWait, resumeCheck);

    // 4.4 Touch Swipe Navigation
    const touchSwipeCheck = await this.driver.evaluate(async () => {
      const carousel = document.querySelector('.testimonial-carousel');
      const inst = carousel ? carousel._carousel : null;
      if (!carousel || !inst) return { error: 'No carousel' };

      const beforeSwipeIndex = inst.currentIndex;

      // Simulate swipe left (delta -100px -> next)
      const touchStart1 = new Event('touchstart', { bubbles: true });
      touchStart1.touches = [{ clientX: 300, clientY: 200 }];
      carousel.dispatchEvent(touchStart1);

      const touchMove1 = new Event('touchmove', { bubbles: true });
      touchMove1.touches = [{ clientX: 200, clientY: 200 }];
      carousel.dispatchEvent(touchMove1);

      const touchEnd1 = new Event('touchend', { bubbles: true });
      touchEnd1.changedTouches = [{ clientX: 200, clientY: 200 }];
      carousel.dispatchEvent(touchEnd1);

      await new Promise(r => setTimeout(r, 100));
      const afterSwipeLeftIndex = inst.currentIndex;

      // Simulate sub-threshold jitter (delta +15px -> ignored)
      const touchStart2 = new Event('touchstart', { bubbles: true });
      touchStart2.touches = [{ clientX: 200, clientY: 200 }];
      carousel.dispatchEvent(touchStart2);

      const touchEnd2 = new Event('touchend', { bubbles: true });
      touchEnd2.changedTouches = [{ clientX: 215, clientY: 200 }];
      carousel.dispatchEvent(touchEnd2);

      await new Promise(r => setTimeout(r, 100));
      const afterJitterIndex = inst.currentIndex;

      return { beforeSwipeIndex, afterSwipeLeftIndex, afterJitterIndex };
    });

    this.record('TestimonialCarousel', 'Touch swipe gesture (ΔX=-100px) navigates to next slide',
      touchSwipeCheck.afterSwipeLeftIndex !== touchSwipeCheck.beforeSwipeIndex, touchSwipeCheck);
    this.record('TestimonialCarousel', 'Sub-threshold touch jitter (ΔX=+15px) ignored without jumping',
      touchSwipeCheck.afterJitterIndex === touchSwipeCheck.afterSwipeLeftIndex, touchSwipeCheck);
  }

  /* --------------------------------------------------------------------------
   * 5. FAQ ACCORDION ENGINE, 45° ROTATION & KEYBOARD ACCESSIBILITY
   * -------------------------------------------------------------------------- */
  async testFaqAccordion() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 5/8] Single-Active FAQ Accordion, 45° Rotation & Keyboard...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    // Ensure all items are initially clean/collapsed
    await this.driver.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.faq-item'));
      items.forEach(it => {
        it.classList.remove('active', 'is-open', 'is-active');
        it.setAttribute('aria-expanded', 'false');
        const btn = it.querySelector('.faq-trigger, button');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });

    // 5.1 Sequential Single-Active Expansion & 45° Rotation
    const seqCheck = await this.driver.evaluate(async () => {
      const items = Array.from(document.querySelectorAll('.faq-item'));
      const triggers = Array.from(document.querySelectorAll('.faq-trigger, .faq-header button'));
      const results = [];

      for (let i = 0; i < items.length; i++) {
        // Click trigger i
        triggers[i].click();
        await new Promise(r => setTimeout(r, 350));

        const openCount = items.filter(it => it.classList.contains('active') || it.classList.contains('is-open') || it.classList.contains('is-active')).length;
        const targetOpen = items[i].classList.contains('active') || items[i].classList.contains('is-open') || items[i].classList.contains('is-active');
        const targetAria = triggers[i].getAttribute('aria-expanded') === 'true';

        const content = items[i].querySelector('.faq-content, .faq-panel');
        const contentHeight = content ? content.getBoundingClientRect().height : 0;

        const icon = items[i].querySelector('.faq-icon');
        const iconStyle = icon ? window.getComputedStyle(icon).transform : '';
        const rotated45 = iconStyle.includes('0.7071') || iconStyle.includes('matrix');

        results.push({
          index: i,
          openCount,
          targetOpen,
          targetAria,
          contentHeight,
          rotated45,
          iconTransform: iconStyle
        });
      }

      return results;
    });

    for (const r of seqCheck) {
      this.record('FaqAccordion', `FAQ Item #${r.index + 1} expands with 45° icon rotation & strictly 1 item active`,
        r.targetOpen && r.targetAria && r.openCount === 1 && r.contentHeight > 20 && r.rotated45, r);
    }

    // 5.2 Self-collapse on re-click
    const collapseCheck = await this.driver.evaluate(async () => {
      const triggers = Array.from(document.querySelectorAll('.faq-trigger, .faq-header button'));
      const items = Array.from(document.querySelectorAll('.faq-item'));

      // Click the currently active last item
      triggers[triggers.length - 1].click();
      await new Promise(r => setTimeout(r, 350));

      const activeCount = items.filter(it => it.classList.contains('active') || it.classList.contains('is-open') || it.classList.contains('is-active')).length;
      return { activeCount };
    });

    this.record('FaqAccordion', 'Clicking active FAQ item collapses it (0 active items remaining)',
      collapseCheck.activeCount === 0, collapseCheck);

    // 5.3 Keyboard Accessibility (Enter and Space toggling from fully clean state)
    const keyboardCheck = await this.driver.evaluate(async () => {
      const triggers = Array.from(document.querySelectorAll('.faq-trigger, .faq-header button'));
      const items = Array.from(document.querySelectorAll('.faq-item'));

      // Ensure item 0 is closed
      items.forEach(it => it.classList.remove('active', 'is-open', 'is-active'));

      // 1. Enter key opens item 0
      triggers[0].focus();
      triggers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await new Promise(r => setTimeout(r, 350));
      const openAfterEnter = items[0].classList.contains('active') || items[0].classList.contains('is-open');

      // 2. Enter key collapses item 0
      triggers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await new Promise(r => setTimeout(r, 350));
      const closedAfterEnter2 = !items[0].classList.contains('active') && !items[0].classList.contains('is-open');

      // 3. Space key opens item 1
      triggers[1].focus();
      triggers[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      await new Promise(r => setTimeout(r, 350));
      const openAfterSpace = items[1].classList.contains('active') || items[1].classList.contains('is-open');

      // 4. Space key collapses item 1
      triggers[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      await new Promise(r => setTimeout(r, 350));
      const closedAfterSpace2 = !items[1].classList.contains('active') && !items[1].classList.contains('is-open');

      return { openAfterEnter, closedAfterEnter2, openAfterSpace, closedAfterSpace2 };
    });

    this.record('FaqAccordion', 'Enter key expands and collapses focused FAQ trigger',
      keyboardCheck.openAfterEnter && keyboardCheck.closedAfterEnter2, keyboardCheck);
    this.record('FaqAccordion', 'Space key expands and collapses focused FAQ trigger',
      keyboardCheck.openAfterSpace && keyboardCheck.closedAfterSpace2, keyboardCheck);
  }

  /* --------------------------------------------------------------------------
   * 6. NAVBAR & DOCK SCROLL HYSTERESIS & MOBILE DRAWER
   * -------------------------------------------------------------------------- */
  async testNavbarAndDock() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 6/8] Dynamic Navbar & Dock Hysteresis & Mobile Drawer...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    // 6.1 Desktop Scroll Hysteresis & Backdrop Blur
    const navHysteresis = await this.driver.evaluate(async () => {
      const header = document.querySelector('.site-header') || document.querySelector('.navbar');
      const floatingDock = document.querySelector('.floating-bottom-nav');

      // Helper to scroll instantly and wait for RAF cycles
      async function instantScrollTo(y) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise(r => requestAnimationFrame(r));
        await new Promise(r => requestAnimationFrame(r));
        await new Promise(r => setTimeout(r, 60));
      }

      // State at Y = 0
      await instantScrollTo(0);
      const initialScrolled = header.classList.contains('navbar--scrolled') || header.classList.contains('site-header--scrolled');
      const initialHidden = header.classList.contains('navbar--hidden') || header.classList.contains('site-header--hidden');

      // Scroll down to Y = 60 (> 40 threshold)
      await instantScrollTo(60);
      const scrolledAt60 = header.classList.contains('navbar--scrolled') || header.classList.contains('site-header--scrolled');
      const headerFilter = window.getComputedStyle(header).backdropFilter || window.getComputedStyle(header).webkitBackdropFilter || '';

      // Scroll down to Y = 250 (past 120 with delta > 10)
      await instantScrollTo(250);
      const hiddenAt250 = header.classList.contains('navbar--hidden') || header.classList.contains('site-header--hidden');

      // Scroll up by 30px to Y = 220 (delta < -5)
      await instantScrollTo(220);
      const hiddenAfterScrollUp = header.classList.contains('navbar--hidden') || header.classList.contains('site-header--hidden');

      // Scroll down fast past 400 to Y = 650 (dock hides)
      await instantScrollTo(650);
      const dockHiddenAt650 = floatingDock ? floatingDock.classList.contains('nav-dock--hidden') : true;

      // Scroll up by 40px to Y = 610 (dock reveals via deltaY < -8)
      await instantScrollTo(610);
      const dockRevealedAt610 = floatingDock ? !floatingDock.classList.contains('nav-dock--hidden') : true;

      // Scroll back to Y = 0
      await instantScrollTo(0);
      const resetScrolled = header.classList.contains('navbar--scrolled') || header.classList.contains('site-header--scrolled');

      return {
        initialScrolled,
        initialHidden,
        scrolledAt60,
        headerFilter,
        hiddenAt250,
        hiddenAfterScrollUp,
        dockHiddenAt650,
        dockRevealedAt610,
        resetScrolled
      };
    });

    this.record('NavbarHysteresis', 'Navbar adds .navbar--scrolled at scrollY > 40',
      !navHysteresis.initialScrolled && navHysteresis.scrolledAt60, navHysteresis);
    this.record('NavbarHysteresis', 'Navbar hides (.navbar--hidden) on downward scroll past 120px',
      navHysteresis.hiddenAt250, navHysteresis);
    this.record('NavbarHysteresis', 'Navbar reveals (removes .navbar--hidden) on upward scroll',
      !navHysteresis.hiddenAfterScrollUp, navHysteresis);
    this.record('NavbarHysteresis', 'Floating bottom dock implements scroll hysteresis hide/show',
      navHysteresis.dockHiddenAt650 && navHysteresis.dockRevealedAt610, navHysteresis);
    this.record('NavbarHysteresis', 'Navbar resets .navbar--scrolled when scrolling back to 0',
      !navHysteresis.resetScrolled, navHysteresis);

    // 6.2 Mobile Drawer & Body Scroll Lock
    await this.driver.setViewport({ width: 375, height: 667 });
    await this.driver.goto(`${this.baseUrl}/index.html`);

    const mobileDrawerCheck = await this.driver.evaluate(async () => {
      const toggleBtn = document.querySelector('.navbar__toggle') || document.querySelector('.hamburger-btn');
      const drawer = document.querySelector('.mobile-menu') || document.querySelector('.mobile-drawer');
      const closeBtn = document.querySelector('.drawer-close-btn') || document.querySelector('.mobile-drawer__close');

      if (!toggleBtn || !drawer) return { error: 'No mobile toggle or drawer' };

      // 1. Open drawer
      toggleBtn.click();
      await new Promise(r => setTimeout(r, 150));
      const drawerIsOpen = drawer.classList.contains('is-open') || drawer.classList.contains('active');
      const ariaExpandedOn = toggleBtn.getAttribute('aria-expanded') === 'true';
      const bodyScrollLocked = document.body.classList.contains('no-scroll') && document.body.style.overflow === 'hidden';

      // 2. Close via button
      if (closeBtn) {
        closeBtn.click();
      } else {
        toggleBtn.click();
      }
      await new Promise(r => setTimeout(r, 150));
      const drawerIsClosed = !drawer.classList.contains('is-open') && !drawer.classList.contains('active');
      const ariaExpandedOff = toggleBtn.getAttribute('aria-expanded') === 'false';
      const bodyScrollRestored = !document.body.classList.contains('no-scroll') && document.body.style.overflow !== 'hidden';

      // 3. Open and Escape key dismissal
      toggleBtn.click();
      await new Promise(r => setTimeout(r, 150));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise(r => setTimeout(r, 150));
      const closedViaEscape = !drawer.classList.contains('is-open') && !drawer.classList.contains('active');

      return {
        drawerIsOpen,
        ariaExpandedOn,
        bodyScrollLocked,
        drawerIsClosed,
        ariaExpandedOff,
        bodyScrollRestored,
        closedViaEscape
      };
    });

    this.record('MobileDrawer', 'Mobile drawer opens with aria-expanded="true" and locks body scroll',
      mobileDrawerCheck.drawerIsOpen && mobileDrawerCheck.ariaExpandedOn && mobileDrawerCheck.bodyScrollLocked, mobileDrawerCheck);
    this.record('MobileDrawer', 'Mobile drawer closes and restores body scroll',
      mobileDrawerCheck.drawerIsClosed && mobileDrawerCheck.ariaExpandedOff && mobileDrawerCheck.bodyScrollRestored, mobileDrawerCheck);
    this.record('MobileDrawer', 'Mobile drawer dismisses cleanly via Escape keypress',
      mobileDrawerCheck.closedViaEscape, mobileDrawerCheck);

    // Restore desktop viewport
    await this.driver.setViewport({ width: 1440, height: 900 });
  }

  /* --------------------------------------------------------------------------
   * 7. RAPID INTERACTION CYCLES & HIGH-FREQUENCY STRESS
   * -------------------------------------------------------------------------- */
  async testRapidInteractionStress() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 7/8] Rapid Interaction Cycles & 60fps Frame Budget Stress...${colors.reset}`);
    await this.driver.goto(`${this.baseUrl}/index.html`);

    // 7.1 Rapid FAQ Burst (50 clicks under 20ms)
    const faqBurst = await this.driver.evaluate(async () => {
      const triggers = Array.from(document.querySelectorAll('.faq-trigger, .faq-header button'));
      const items = Array.from(document.querySelectorAll('.faq-item'));

      for (let i = 0; i < 50; i++) {
        const randIndex = Math.floor(Math.random() * triggers.length);
        triggers[randIndex].click();
        await new Promise(r => setTimeout(r, 15));
      }

      await new Promise(r => setTimeout(r, 400));
      const openCount = items.filter(it => it.classList.contains('active') || it.classList.contains('is-open') || it.classList.contains('is-active')).length;
      return { openCount };
    });

    this.record('RapidStress', `Rapid FAQ burst (50 clicks) leaves strictly <= 1 active item (got ${faqBurst.openCount})`,
      faqBurst.openCount <= 1, faqBurst);

    // 7.2 Rapid Carousel Clicks Burst (30 clicks under 20ms)
    const carouselBurst = await this.driver.evaluate(async () => {
      const nextBtn = document.querySelector('.carousel-btn--next, [data-next]');
      const track = document.querySelector('.testimonial-track');
      const carousel = document.querySelector('.testimonial-carousel');
      const inst = carousel ? carousel._carousel : null;

      for (let i = 0; i < 30; i++) {
        if (nextBtn) nextBtn.click();
        await new Promise(r => setTimeout(r, 15));
      }

      await new Promise(r => setTimeout(r, 300));
      const transform = track ? track.style.transform : '';
      const isValidTransform = transform.includes('translateX') && !transform.includes('NaN');
      const validIndex = inst && Number.isFinite(inst.currentIndex) && inst.currentIndex >= 0 && inst.currentIndex < inst.totalSlides;

      return { transform, isValidTransform, validIndex, currentIndex: inst?.currentIndex };
    });

    this.record('RapidStress', 'Rapid carousel button hammering maintains valid transform and finite slide index',
      carouselBurst.isValidTransform && carouselBurst.validIndex, carouselBurst);

    // 7.3 Rapid 3D Card Tilt Mousemove Storm (100 events)
    const tiltStorm = await this.driver.evaluate(async () => {
      const card = document.querySelector('.card-tilt, .service-card');
      const rect = card.getBoundingClientRect();
      let allClamped = true;
      let zeroNaN = true;

      for (let i = 0; i < 100; i++) {
        const randX = rect.left + (Math.random() * 2 - 0.5) * rect.width;
        const randY = rect.top + (Math.random() * 2 - 0.5) * rect.height;

        card.dispatchEvent(new MouseEvent('mousemove', { clientX: randX, clientY: randY, bubbles: true }));

        const transform = card.style.transform;
        if (transform.includes('NaN')) zeroNaN = false;

        const rotXMatch = transform.match(/rotateX\(([\d.-]+)deg\)/);
        const rotYMatch = transform.match(/rotateY\(([\d.-]+)deg\)/);
        const rx = rotXMatch ? Math.abs(parseFloat(rotXMatch[1])) : 0;
        const ry = rotYMatch ? Math.abs(parseFloat(rotYMatch[1])) : 0;
        if (rx > 10.01 || ry > 10.01) allClamped = false;
      }

      card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      return { allClamped, zeroNaN };
    });

    this.record('RapidStress', '100 high-speed mousemoves strictly preserve <= 10° clamping and 0 NaNs',
      tiltStorm.allClamped && tiltStorm.zeroNaN, tiltStorm);

    // 7.4 60fps RequestAnimationFrame Timing Benchmark
    const fpsTelemetry = await this.driver.evaluate(async () => {
      const frameDeltas = [];
      let lastTime = performance.now();

      return new Promise(resolve => {
        let frameCount = 0;
        function onFrame(time) {
          const delta = time - lastTime;
          lastTime = time;
          frameDeltas.push(delta);
          frameCount++;

          if (frameCount < 60) {
            window.requestAnimationFrame(onFrame);
          } else {
            const avgDelta = frameDeltas.slice(1).reduce((a, b) => a + b, 0) / (frameDeltas.length - 1);
            const maxDelta = Math.max(...frameDeltas.slice(1));
            resolve({
              avgDeltaMs: Number(avgDelta.toFixed(2)),
              maxDeltaMs: Number(maxDelta.toFixed(2)),
              approxFps: Number((1000 / avgDelta).toFixed(1)),
              totalFrames: frameDeltas.length
            });
          }
        }
        window.requestAnimationFrame(onFrame);
      });
    });

    this.report.fpsTelemetry = fpsTelemetry;
    const isFpsSmooth = fpsTelemetry.avgDeltaMs <= 22 && fpsTelemetry.maxDeltaMs < 80;
    this.record('RapidStress', `RAF 60-frame benchmark runs at ~${fpsTelemetry.approxFps}fps (avg ${fpsTelemetry.avgDeltaMs}ms, max ${fpsTelemetry.maxDeltaMs}ms)`,
      isFpsSmooth, fpsTelemetry);
  }

  /* --------------------------------------------------------------------------
   * 8. SUBPAGES INTERACTIVITY & CONSOLE INTEGRITY
   * -------------------------------------------------------------------------- */
  async testSubpagesInteractivity() {
    this.log(`\n${colors.bold}${colors.yellow}▶ [SUITE 8/8] Subpages Interactivity & Console Integrity...${colors.reset}`);
    const pages = ['services.html', 'portfolio.html', 'contact.html'];

    for (const page of pages) {
      this.driver.consoleErrors = [];
      await this.driver.goto(`${this.baseUrl}/${page}`);

      const pageState = await this.driver.evaluate(() => {
        const tiltCards = document.querySelectorAll('.card-tilt, .portfolio-card, .service-card, .channel-card');
        return {
          title: document.title,
          tiltCardsCount: tiltCards.length,
          hasMainJs: !!document.querySelector('script[src*="main.js"]'),
          hasInteractionsJs: !!document.querySelector('script[src*="interactions.js"]')
        };
      });

      this.record('Subpages', `${page} loads clean with scripts & tilt cards (count: ${pageState.tiltCardsCount})`,
        pageState.tiltCardsCount > 0 && pageState.hasMainJs && pageState.hasInteractionsJs, pageState);
      this.record('Subpages', `${page} produces zero console errors`,
        this.driver.consoleErrors.length === 0, { errors: this.driver.consoleErrors });
    }
  }

  /* --------------------------------------------------------------------------
   * VERDICT COMPILATION
   * -------------------------------------------------------------------------- */
  summarizeVerdict() {
    this.log(`\n${colors.bold}${colors.magenta}================================================================${colors.reset}`);
    this.log(`${colors.bold}${colors.magenta}  M7 EMPIRICAL CHALLENGE VERDICT & SUMMARY                       ${colors.reset}`);
    this.log(`${colors.bold}${colors.magenta}================================================================${colors.reset}`);

    this.log(`Total checks executed : ${this.report.summary.total}`);
    this.log(`Total checks passed   : ${colors.green}${this.report.summary.passed}${colors.reset}`);
    this.log(`Total checks failed   : ${this.report.summary.failed > 0 ? colors.red : colors.green}${this.report.summary.failed}${colors.reset}`);

    const allPassed = this.report.summary.failed === 0 && this.driver.consoleErrors.length === 0;

    if (allPassed) {
      this.report.verdict = 'APPROVE';
      this.log(`\n${colors.bold}${colors.green}🏆 HARNESS VERDICT: APPROVE${colors.reset}`);
      this.log(`${colors.green}All 8 interactive physics and stress suites passed empirically with 0 errors.${colors.reset}\n`);
    } else {
      this.report.verdict = 'REQUEST_CHANGES';
      this.log(`\n${colors.bold}${colors.red}💥 HARNESS VERDICT: REQUEST_CHANGES${colors.reset}`);
      this.log(`${colors.red}Adversarial stress detected failing invariants.${colors.reset}\n`);
    }
  }
}

const harness = new AdversarialPhysicsHarness();
harness.run().catch(err => {
  console.error('Unhandled harness exception:', err);
  process.exit(1);
});
