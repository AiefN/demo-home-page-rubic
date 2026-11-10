/**
 * Empirical Adversarial Stress Test Suite for Milestone 5 - Challenger 2
 * Scope:
 * 1. services.html: 4 core services, deliverables, 6-stage timeline, modal click-to-expand.
 * 2. portfolio.html: Rapid category tab switching (all, ecommerce, corporate, webapp) & DOM stability.
 * 3. Case study modals: Dynamic content population (7 projects + edge cases), focus trapping, Escape dismissal, backdrop click, body scroll lock.
 * 4. contact.html: Real-time inline form validation against malicious/invalid inputs, RFC 5322 regex, Indonesian phone formatting, visual error feedback, floating WhatsApp continuous ripple animation.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

class ChallengerTestRunner {
  constructor() {
    this.server = null;
    this.driver = null;
    this.baseUrl = '';
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.results = [];
  }

  log(msg) {
    console.log(msg);
  }

  pass(suite, testName, detail = '') {
    this.totalTests++;
    this.passedTests++;
    this.results.push({ suite, testName, status: 'PASS', detail });
    console.log(`  ${colors.green}✓${colors.reset} ${testName} ${detail ? colors.dim + '(' + detail + ')' + colors.reset : ''}`);
  }

  fail(suite, testName, error) {
    this.totalTests++;
    this.failedTests++;
    const errMsg = error instanceof Error ? error.message : String(error);
    this.results.push({ suite, testName, status: 'FAIL', error: errMsg });
    console.log(`  ${colors.red}✗${colors.reset} ${testName}`);
    console.log(`    ${colors.red}Error: ${errMsg}${colors.reset}`);
  }

  async runTest(suite, testName, fn) {
    try {
      await fn();
      this.pass(suite, testName);
    } catch (err) {
      this.fail(suite, testName, err);
    }
  }

  async setup() {
    this.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
    this.log(`${colors.bold}${colors.cyan}  RUBICWEB ADVERSARIAL EMPIRICAL STRESS SUITE (M5-2)${colors.reset}`);
    this.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

    this.server = new StaticServer({ rootDir: path.resolve(__dirname, '..') });
    const { port } = await this.server.start();
    this.baseUrl = `http://127.0.0.1:${port}`;
    this.log(`✓ Static server listening at: ${this.baseUrl}`);

    this.driver = new BrowserDriver();
    await this.driver.launch();
    this.log(`✓ Headless browser launched (${path.basename(this.driver.browserPath)})`);
  }

  async teardown() {
    if (this.driver) {
      await this.driver.close();
    }
    if (this.server) {
      await this.server.stop();
    }
  }

  // =========================================================================
  // SUITE 1: services.html - 4 Core Services, Deliverables, 6-Stage Timeline
  // =========================================================================
  async runSuiteServices() {
    const suite = 'Suite 1: services.html & Workflow Timeline';
    this.log(`\n${colors.bold}▶ ${suite}${colors.reset}`);

    await this.driver.goto(`${this.baseUrl}/services.html`);

    // 1.1 Verify 4 Core Services
    await this.runTest(suite, '1.1 services.html renders exactly 4 core service articles with valid IDs', async () => {
      const services = await this.driver.evaluate(() => {
        const expectedIds = ['custom-web-development', 'modern-business-profile', 'web-app-portal', 'redesign-maintenance'];
        const found = expectedIds.map(id => {
          const el = document.getElementById(id);
          return {
            id,
            exists: !!el,
            isArticle: el ? el.tagName.toLowerCase() === 'article' : false,
            hasHeading: el ? !!el.querySelector('h3') : false,
            headingText: el && el.querySelector('h3') ? el.querySelector('h3').textContent.trim() : ''
          };
        });
        return found;
      });

      if (services.some(s => !s.exists || !s.isArticle)) {
        throw new Error(`Missing service articles: ${JSON.stringify(services)}`);
      }
    });

    // 1.2 Verify Tech Badges & Deliverables for each service
    await this.runTest(suite, '1.2 Each service card contains tech badges and at least 5 structured deliverables', async () => {
      const details = await this.driver.evaluate(() => {
        const expectedIds = ['custom-web-development', 'modern-business-profile', 'web-app-portal', 'redesign-maintenance'];
        return expectedIds.map(id => {
          const card = document.getElementById(id);
          const badges = Array.from(card.querySelectorAll('.tech-badge')).map(b => b.textContent.trim());
          const deliverables = Array.from(card.querySelectorAll('ul li')).map(li => li.textContent.trim());
          const strongHeaders = Array.from(card.querySelectorAll('ul li strong')).map(s => s.textContent.trim());
          return {
            id,
            badgeCount: badges.length,
            badges,
            deliverableCount: deliverables.length,
            strongCount: strongHeaders.length
          };
        });
      });

      for (const d of details) {
        if (d.badgeCount < 4) {
          throw new Error(`Service ${d.id} has fewer than 4 tech badges (${d.badgeCount})`);
        }
        if (d.deliverableCount < 5) {
          throw new Error(`Service ${d.id} has fewer than 5 deliverables (${d.deliverableCount})`);
        }
        if (d.strongCount < 5) {
          throw new Error(`Service ${d.id} deliverables lack bold strong headings`);
        }
      }
    });

    // 1.3 6-Stage Timeline Chronology & Deliverables
    await this.runTest(suite, '1.3 6-Stage Development Workflow timeline has stages 01 through 06 in order', async () => {
      const stages = await this.driver.evaluate(() => {
        const container = document.getElementById('workflow-timeline');
        if (!container) return null;
        const steps = Array.from(container.querySelectorAll('.timeline-step, .workflow-step'));
        return steps.map(step => {
          const number = step.querySelector('.step-number')?.textContent.trim() || '';
          const tag = step.querySelector('.step-tag')?.textContent.trim() || '';
          const title = step.querySelector('.step-title')?.textContent.trim() || '';
          const deliverables = Array.from(step.querySelectorAll('ul li')).map(li => li.textContent.trim());
          return { number, tag, title, deliverableCount: deliverables.length };
        });
      });

      if (!stages || stages.length !== 6) {
        throw new Error(`Expected 6 workflow stages, found: ${stages ? stages.length : 0}`);
      }

      const expectedNumbers = ['01', '02', '03', '04', '05', '06'];
      for (let i = 0; i < 6; i++) {
        if (stages[i].number !== expectedNumbers[i]) {
          throw new Error(`Stage index ${i} expected number ${expectedNumbers[i]}, got ${stages[i].number}`);
        }
        if (!stages[i].title) {
          throw new Error(`Stage ${expectedNumbers[i]} title is empty`);
        }
        if (stages[i].deliverableCount < 3) {
          throw new Error(`Stage ${expectedNumbers[i]} has fewer than 3 deliverables (${stages[i].deliverableCount})`);
        }
      }
    });

    // 1.4 Service Detail Click-to-Expand Modal
    await this.runTest(suite, '1.4 Service modal opens on trigger click, populates data, locks scroll, and dismisses via Escape', async () => {
      const modalTest = await this.driver.evaluate(async () => {
        const trigger = document.querySelector('.btn-service-modal[data-service-id="custom-web"]');
        const modal = document.getElementById('service-modal');
        if (!trigger || !modal) return { success: false, reason: 'Trigger or modal missing' };

        trigger.click();

        const isOpen = modal.classList.contains('is-active') && modal.getAttribute('aria-hidden') === 'false';
        const bodyLocked = document.body.classList.contains('no-scroll') || document.body.style.overflow === 'hidden';
        const titleText = document.getElementById('service-modal-title')?.textContent.trim() || '';
        const items = document.querySelectorAll('#service-modal-deliverables li').length;

        // Dismiss via Escape
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        const isClosed = !modal.classList.contains('is-active') && modal.getAttribute('aria-hidden') === 'true';
        const bodyUnlocked = !document.body.classList.contains('no-scroll') && document.body.style.overflow !== 'hidden';

        return {
          success: isOpen && bodyLocked && titleText.length > 0 && items >= 5 && isClosed && bodyUnlocked,
          isOpen,
          bodyLocked,
          titleText,
          items,
          isClosed,
          bodyUnlocked
        };
      });

      if (!modalTest.success) {
        throw new Error(`Service modal lifecycle failed: ${JSON.stringify(modalTest)}`);
      }
    });

    // 1.5 Rapid succession open/close of all 4 service modals
    await this.runTest(suite, '1.5 Rapid successive open/close across all 4 service modals executes cleanly', async () => {
      const rapidTest = await this.driver.evaluate(async () => {
        const serviceIds = ['custom-web', 'business-profile', 'web-app', 'redesign-maintenance'];
        const modal = document.getElementById('service-modal');
        const results = [];

        for (const sid of serviceIds) {
          const btn = document.querySelector(`.btn-service-modal[data-service-id="${sid}"]`);
          if (!btn) {
            results.push({ sid, found: false });
            continue;
          }
          btn.click();
          const title = document.getElementById('service-modal-title')?.textContent || '';
          const active = modal.classList.contains('is-active');

          // Close via backdrop click
          modal.dispatchEvent(new MouseEvent('click', { bubbles: true, target: modal }));
          const closed = !modal.classList.contains('is-active');

          results.push({ sid, title, active, closed });
        }

        return results;
      });

      for (const r of rapidTest) {
        if (!r.active || !r.closed || !r.title) {
          throw new Error(`Rapid service modal failure for ${r.sid}: ${JSON.stringify(r)}`);
        }
      }
    });
  }

  // =========================================================================
  // SUITE 2: portfolio.html - Rapid Category Tab Switching & DOM Stability
  // =========================================================================
  async runSuitePortfolio() {
    const suite = 'Suite 2: portfolio.html Filtering & DOM Stability';
    this.log(`\n${colors.bold}▶ ${suite}${colors.reset}`);

    await this.driver.goto(`${this.baseUrl}/portfolio.html`);

    // 2.1 Verify filter tabs and initial 7 projects
    await this.runTest(suite, '2.1 Initial load renders 4 category tabs and 7 projects in Semua Proyek', async () => {
      const initial = await this.driver.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.filter-btn, .portfolio-filter-btn')).map(b => ({
          filter: b.getAttribute('data-filter'),
          text: b.textContent.trim(),
          isSelected: b.getAttribute('aria-selected') === 'true' || b.classList.contains('is-active')
        }));
        const cards = Array.from(document.querySelectorAll('.portfolio-card')).map(c => ({
          category: c.getAttribute('data-category'),
          title: c.querySelector('.portfolio-title')?.textContent.trim() || '',
          visible: c.style.display !== 'none' && !c.classList.contains('is-hidden')
        }));
        return { tabs, cards };
      });

      if (initial.tabs.length < 4) {
        throw new Error(`Expected at least 4 filter tabs, found ${initial.tabs.length}`);
      }
      if (initial.cards.length !== 7) {
        throw new Error(`Expected exactly 7 portfolio cards, found ${initial.cards.length}`);
      }
      const visibleCount = initial.cards.filter(c => c.visible).length;
      if (visibleCount !== 7) {
        throw new Error(`Expected 7 visible cards initially, got ${visibleCount}`);
      }
    });

    // 2.2 Sequential tab switching with expected card counts
    await this.runTest(suite, '2.2 Category filtering displays correct card counts per category', async () => {
      const filterExpectations = [
        { filter: 'ecommerce', expectedCount: 2 },
        { filter: 'corporate', expectedCount: 3 },
        { filter: 'webapp', expectedCount: 2 },
        { filter: 'all', expectedCount: 7 }
      ];

      for (const exp of filterExpectations) {
        await this.driver.evaluate((f) => {
          const btn = document.querySelector(`[data-filter="${f}"]`);
          if (btn) btn.click();
        }, exp.filter);

        // Wait 300ms for CSS transition to settle
        await new Promise(r => setTimeout(r, 300));

        const result = await this.driver.evaluate((f) => {
          const cards = Array.from(document.querySelectorAll('.portfolio-card'));
          const visibleCards = cards.filter(c => {
            const isHidden = c.classList.contains('is-hidden') || c.style.display === 'none';
            return !isHidden;
          });
          const activeBtn = document.querySelector(`[data-filter="${f}"]`);
          return {
            visibleCount: visibleCards.length,
            btnSelected: activeBtn ? activeBtn.getAttribute('aria-selected') === 'true' : false
          };
        }, exp.filter);

        if (result.visibleCount !== exp.expectedCount) {
          throw new Error(`Filter "${exp.filter}": expected ${exp.expectedCount} visible cards, got ${result.visibleCount}`);
        }
        if (!result.btnSelected) {
          throw new Error(`Filter "${exp.filter}": button aria-selected is not true`);
        }
      }
    });

    // 2.3 Rapid Tab Switching & DOM Stability Stress Test
    await this.runTest(suite, '2.3 Rapid category tab switching maintains DOM integrity, visual stability, and zero console errors', async () => {
      const initialErrorCount = this.driver.consoleErrors.length;

      // Part A: Rapid tab switching with 260ms pacing (at transition boundary) across 12 cycles
      const pacedResult = await this.driver.evaluate(async () => {
        const filters = ['ecommerce', 'webapp', 'corporate', 'all', 'ecommerce', 'corporate', 'webapp', 'all'];
        const buttons = Array.from(document.querySelectorAll('[data-filter]'));

        for (const f of filters) {
          const btn = buttons.find(b => b.getAttribute('data-filter') === f);
          if (btn) btn.click();
          await new Promise(r => setTimeout(r, 260));
        }

        // Final click to 'corporate'
        const corpBtn = buttons.find(b => b.getAttribute('data-filter') === 'corporate');
        if (corpBtn) corpBtn.click();
        await new Promise(r => setTimeout(r, 350));

        const allCards = Array.from(document.querySelectorAll('.portfolio-card'));
        const visibleCards = allCards.filter(c => !c.classList.contains('is-hidden') && c.style.display !== 'none');

        return {
          totalCards: allCards.length,
          visibleCount: visibleCards.length,
          visibleCategories: visibleCards.map(c => c.getAttribute('data-category'))
        };
      });

      if (pacedResult.totalCards !== 7) {
        throw new Error(`Total cards count corrupted: ${pacedResult.totalCards}`);
      }
      if (pacedResult.visibleCount !== 3) {
        throw new Error(`Expected 3 visible cards for corporate, got ${pacedResult.visibleCount}`);
      }
      if (!pacedResult.visibleCategories.every(cat => cat === 'corporate')) {
        throw new Error(`Mismatched categories: ${JSON.stringify(pacedResult.visibleCategories)}`);
      }

      // Part B: High-speed sub-250ms stress test (burst of 15 clicks at 30ms) to verify transition lock guards DOM from corruption
      const burstResult = await this.driver.evaluate(async () => {
        const filters = ['ecommerce', 'webapp', 'all', 'corporate', 'ecommerce'];
        const buttons = Array.from(document.querySelectorAll('[data-filter]'));

        for (let i = 0; i < 15; i++) {
          const f = filters[i % filters.length];
          const btn = buttons.find(b => b.getAttribute('data-filter') === f);
          if (btn) btn.click();
          await new Promise(r => setTimeout(r, 30));
        }

        // Allow settling after burst
        await new Promise(r => setTimeout(r, 350));

        // Now issue clean click to 'all' and verify full recovery
        const allBtn = buttons.find(b => b.getAttribute('data-filter') === 'all');
        if (allBtn) allBtn.click();
        await new Promise(r => setTimeout(r, 350));

        const allCards = Array.from(document.querySelectorAll('.portfolio-card'));
        const visibleCards = allCards.filter(c => !c.classList.contains('is-hidden') && c.style.display !== 'none');

        return {
          totalCards: allCards.length,
          visibleCount: visibleCards.length
        };
      });

      if (burstResult.totalCards !== 7 || burstResult.visibleCount !== 7) {
        throw new Error(`DOM failed to recover after burst clicking: ${JSON.stringify(burstResult)}`);
      }

      const errorsAfter = this.driver.consoleErrors.length;
      if (errorsAfter > initialErrorCount) {
        throw new Error(`Console errors emitted during rapid tab switching: ${JSON.stringify(this.driver.consoleErrors.slice(initialErrorCount))}`);
      }
    });

    // 2.4 Verify Card Hover Overlays & Actions
    await this.runTest(suite, '2.4 All 7 portfolio cards contain action buttons for modal and live preview', async () => {
      const overlays = await this.driver.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.portfolio-card'));
        return cards.map(c => {
          const modalBtn = c.querySelector('.btn-case-study, [data-project-id]');
          const previewLink = c.querySelector('a[href*="wa.me"]');
          return {
            hasModalBtn: !!modalBtn,
            projectId: modalBtn ? modalBtn.getAttribute('data-project-id') : null,
            hasPreviewLink: !!previewLink
          };
        });
      });

      if (overlays.length !== 7) {
        throw new Error(`Expected 7 cards, got ${overlays.length}`);
      }
      for (const o of overlays) {
        if (!o.hasModalBtn || !o.projectId) {
          throw new Error(`Card missing modal button or project ID: ${JSON.stringify(o)}`);
        }
        if (!o.hasPreviewLink) {
          throw new Error(`Card missing live preview link: ${JSON.stringify(o)}`);
        }
      }
    });
  }

  // =========================================================================
  // SUITE 3: Case Study Modals - Dynamic Content, Accessibility & Controls
  // =========================================================================
  async runSuiteCaseStudyModals() {
    const suite = 'Suite 3: Case Study Modals Accessibility & Dynamic Population';
    this.log(`\n${colors.bold}▶ ${suite}${colors.reset}`);

    await this.driver.goto(`${this.baseUrl}/portfolio.html`);

    // 3.1 Dynamic Population across all 7 projects
    await this.runTest(suite, '3.1 Modal dynamically populates all fields (client, challenge, solution, results, WhatsApp CTA) for all 7 projects', async () => {
      const projectIds = ['nexastore', 'apex', 'lumina', 'flowpulse', 'karalia', 'pinjamin', 'wilmar'];

      const popResults = await this.driver.evaluate(async (ids) => {
        const modal = document.getElementById('case-study-modal');
        const results = [];

        for (const pid of ids) {
          // Trigger click
          const trigger = document.querySelector(`.btn-case-study[data-project-id="${pid}"]`);
          if (!trigger) {
            results.push({ pid, found: false });
            continue;
          }

          trigger.click();

          const title = modal.querySelector('#modal-title')?.textContent.trim() || '';
          const client = modal.querySelector('#modal-client')?.textContent.trim() || '';
          const challenge = modal.querySelector('#modal-challenge')?.textContent.trim() || '';
          const solution = modal.querySelector('#modal-solution')?.textContent.trim() || '';
          const resultsText = modal.querySelector('#modal-results')?.textContent.trim() || '';
          const tag = modal.querySelector('#modal-tag')?.textContent.trim() || '';
          const imgSrc = modal.querySelector('#modal-img')?.getAttribute('src') || '';
          const waHref = modal.querySelector('#modal-whatsapp-cta')?.getAttribute('href') || '';
          const isOpen = modal.classList.contains('is-active') && modal.style.display !== 'none';
          const isScrollLocked = document.body.classList.contains('no-scroll') || document.body.style.overflow === 'hidden';

          // Dismiss
          const closeBtn = modal.querySelector('#modal-close-btn, .modal-close');
          if (closeBtn) closeBtn.click();

          results.push({
            pid,
            isOpen,
            isScrollLocked,
            titleLen: title.length,
            clientLen: client.length,
            challengeLen: challenge.length,
            solutionLen: solution.length,
            resultsLen: resultsText.length,
            tagLen: tag.length,
            hasImg: imgSrc.includes('assets/portfolio/'),
            waValid: waHref.includes('wa.me/6285280008984') && waHref.includes(encodeURIComponent(title))
          });
        }

        return results;
      }, projectIds);

      for (const r of popResults) {
        if (!r.isOpen) throw new Error(`Modal failed to open for project ${r.pid}`);
        if (!r.isScrollLocked) throw new Error(`Body scroll not locked for project ${r.pid}`);
        if (r.titleLen === 0 || r.clientLen === 0 || r.challengeLen === 0 || r.solutionLen === 0 || r.resultsLen === 0 || r.tagLen === 0) {
          throw new Error(`Incomplete content population for project ${r.pid}: ${JSON.stringify(r)}`);
        }
        if (!r.hasImg) throw new Error(`Missing project image mockup for project ${r.pid}`);
        if (!r.waValid) throw new Error(`WhatsApp CTA URL does not encode project title for ${r.pid}`);
      }
    });

    // 3.2 Unknown / Malformed project ID fallback
    await this.runTest(suite, '3.2 Triggering modal with unknown project ID falls back gracefully to default case study', async () => {
      const fallbackResult = await this.driver.evaluate(() => {
        const modal = document.getElementById('case-study-modal');
        // Synthesize trigger with unknown id
        const dummyBtn = document.createElement('button');
        dummyBtn.className = 'btn-case-study';
        dummyBtn.setAttribute('data-project-id', 'unknown-project-xyz');
        document.body.appendChild(dummyBtn);

        dummyBtn.click();
        const isOpen = modal.classList.contains('is-active');
        const title = modal.querySelector('#modal-title')?.textContent.trim() || '';

        // Close
        const closeBtn = modal.querySelector('#modal-close-btn');
        if (closeBtn) closeBtn.click();
        dummyBtn.remove();

        return { isOpen, title, success: isOpen && title === 'NexaStore Luxury Goods' };
      });

      if (!fallbackResult.success) {
        throw new Error(`Unknown project ID did not fallback gracefully: ${JSON.stringify(fallbackResult)}`);
      }
    });

    // 3.3 Keyboard Focus Trapping within Modal
    await this.runTest(suite, '3.3 Keyboard Tab navigation traps focus within modal dialog', async () => {
      const focusTrapResult = await this.driver.evaluate(async () => {
        const modal = document.getElementById('case-study-modal');
        const trigger = document.querySelector('.btn-case-study');
        trigger.click();

        await new Promise(r => setTimeout(r, 100));

        const focusable = Array.from(modal.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
        if (focusable.length < 2) return { success: false, reason: 'Too few focusable elements' };

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        // Focus last and simulate Tab
        last.focus();
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        window.dispatchEvent(tabEvent);

        // When Tab is pressed on last element, handler should preventDefault and focus first
        const wrappedToFirst = (document.activeElement === first);

        // Focus first and simulate Shift+Tab
        first.focus();
        const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
        window.dispatchEvent(shiftTabEvent);

        const wrappedToLast = (document.activeElement === last);

        // Close
        const closeBtn = modal.querySelector('#modal-close-btn');
        if (closeBtn) closeBtn.click();

        return {
          focusableCount: focusable.length,
          wrappedToFirst,
          wrappedToLast,
          success: wrappedToFirst && wrappedToLast
        };
      });

      if (!focusTrapResult.success) {
        throw new Error(`Modal focus trap failed: ${JSON.stringify(focusTrapResult)}`);
      }
    });

    // 3.4 Escape Key Dismissal & Focus Restoration
    await this.runTest(suite, '3.4 Pressing Escape key dismisses modal and restores keyboard focus to origin button', async () => {
      const escResult = await this.driver.evaluate(async () => {
        const modal = document.getElementById('case-study-modal');
        const trigger = document.querySelector('.btn-case-study[data-project-id="nexastore"]');
        trigger.focus();
        trigger.click();

        await new Promise(r => setTimeout(r, 100));

        const openState = modal.classList.contains('is-active');
        const bodyLocked = document.body.style.overflow === 'hidden';

        // Press Escape
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        await new Promise(r => setTimeout(r, 80));

        const closedState = !modal.classList.contains('is-active') && modal.getAttribute('aria-hidden') === 'true';
        const bodyUnlocked = document.body.style.overflow !== 'hidden';
        const focusRestored = (document.activeElement === trigger);

        return {
          openState,
          bodyLocked,
          closedState,
          bodyUnlocked,
          focusRestored,
          success: openState && bodyLocked && closedState && bodyUnlocked && focusRestored
        };
      });

      if (!escResult.success) {
        throw new Error(`Escape key dismissal or focus restore failed: ${JSON.stringify(escResult)}`);
      }
    });

    // 3.5 Backdrop Click Dismissal vs Inside Dialog Click
    await this.runTest(suite, '3.5 Clicking backdrop dismisses modal, while clicking inside dialog does not', async () => {
      const clickResult = await this.driver.evaluate(async () => {
        const modal = document.getElementById('case-study-modal');
        const dialog = modal.querySelector('.modal-dialog');
        const trigger = document.querySelector('.btn-case-study');
        trigger.click();

        await new Promise(r => setTimeout(r, 80));

        // Click inside dialog
        dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, target: dialog }));
        const stillOpen = modal.classList.contains('is-active');

        // Click backdrop
        modal.dispatchEvent(new MouseEvent('click', { bubbles: true, target: modal }));
        const closed = !modal.classList.contains('is-active');

        return { stillOpen, closed, success: stillOpen && closed };
      });

      if (!clickResult.success) {
        throw new Error(`Backdrop dismissal behavior failed: ${JSON.stringify(clickResult)}`);
      }
    });
  }

  // =========================================================================
  // SUITE 4: contact.html - Form Validation, Regex, Phone & Floating WhatsApp
  // =========================================================================
  async runSuiteContact() {
    const suite = 'Suite 4: contact.html Inline Validation & WhatsApp Ripple';
    this.log(`\n${colors.bold}▶ ${suite}${colors.reset}`);

    await this.driver.goto(`${this.baseUrl}/contact.html`);

    // 4.1 Empty Form Submission Rejection & Field Error Indicators
    await this.runTest(suite, '4.1 Empty form submission triggers inline visual errors in Indonesian and focuses first invalid field', async () => {
      const emptyTest = await this.driver.evaluate(() => {
        const form = document.getElementById('contact-form');
        const submitBtn = document.getElementById('btn-submit-consultation');

        // Clear all fields
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('message').value = '';

        submitBtn.click();

        const nameError = document.getElementById('error-name');
        const emailError = document.getElementById('error-email');
        const phoneError = document.getElementById('error-phone');
        const msgError = document.getElementById('error-message');

        const nameInvalid = document.getElementById('name').getAttribute('aria-invalid') === 'true';
        const emailInvalid = document.getElementById('email').getAttribute('aria-invalid') === 'true';
        const phoneInvalid = document.getElementById('phone').getAttribute('aria-invalid') === 'true';
        const msgInvalid = document.getElementById('message').getAttribute('aria-invalid') === 'true';

        const focusedElement = document.activeElement ? document.activeElement.id : '';

        // Now test malformed values for email and phone to verify format error messages
        document.getElementById('email').value = 'invalid-email-format';
        document.getElementById('phone').value = '12345';
        submitBtn.click();

        const emailFormatError = emailError.textContent.trim();
        const phoneFormatError = phoneError.textContent.trim();

        return {
          nameErrorVisible: nameError && nameError.style.display !== 'none' && nameError.textContent.includes('minimal 3 karakter'),
          emailEmptyMsg: emailError && emailError.style.display !== 'none',
          phoneEmptyMsg: phoneError && phoneError.style.display !== 'none',
          msgErrorVisible: msgError && msgError.style.display !== 'none' && msgError.textContent.includes('minimal 10 karakter'),
          emailFormatMsgValid: emailFormatError.includes('tidak valid'),
          phoneFormatMsgValid: phoneFormatError.includes('08'),
          nameInvalid,
          emailInvalid,
          phoneInvalid,
          msgInvalid,
          firstFocusedIsName: focusedElement === 'name'
        };
      });

      if (!emptyTest.nameErrorVisible || !emptyTest.emailEmptyMsg || !emptyTest.phoneEmptyMsg || !emptyTest.msgErrorVisible) {
        throw new Error(`Visual error feedback in Indonesian missing on empty submit: ${JSON.stringify(emptyTest)}`);
      }
      if (!emptyTest.emailFormatMsgValid || !emptyTest.phoneFormatMsgValid) {
        throw new Error(`Visual error feedback for malformed inputs missing: ${JSON.stringify(emptyTest)}`);
      }
      if (!emptyTest.nameInvalid || !emptyTest.emailInvalid || !emptyTest.phoneInvalid || !emptyTest.msgInvalid) {
        throw new Error(`aria-invalid="true" missing on invalid fields: ${JSON.stringify(emptyTest)}`);
      }
      if (!emptyTest.firstFocusedIsName) {
        throw new Error(`First invalid input (name) not focused on failed submit: ${emptyTest.firstFocusedIsName}`);
      }
    });

    // 4.2 Malicious Input Sanitization & Name Validation
    await this.runTest(suite, '4.2 Name field rejects short/whitespace inputs and safely handles XSS/SQLi vectors', async () => {
      const nameEdgeCases = [
        { val: 'A', expectedValid: false },
        { val: 'AB', expectedValid: false },
        { val: '     ', expectedValid: false },
        { val: '<script>alert(1)</script>', expectedValid: true }, // Long enough, handled as safe string
        { val: "Robert'); DROP TABLE Students;--", expectedValid: true },
        { val: 'Budi Santoso', expectedValid: true }
      ];

      for (const tc of nameEdgeCases) {
        const res = await this.driver.evaluate((v) => {
          const input = document.getElementById('name');
          const err = document.getElementById('error-name');
          input.value = v;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('blur', { bubbles: true }));

          const isValid = input.classList.contains('is-valid') && !input.classList.contains('is-invalid');
          const isInvalid = input.classList.contains('is-invalid') && err.style.display !== 'none';
          return { isValid, isInvalid };
        }, tc.val);

        if (tc.expectedValid && !res.isValid) {
          throw new Error(`Expected name "${tc.val}" to be valid, but got invalid`);
        }
        if (!tc.expectedValid && !res.isInvalid) {
          throw new Error(`Expected name "${tc.val}" to be invalid, but got valid`);
        }
      }
    });

    // 4.3 Strict RFC 5322 Email Validation Matrix
    await this.runTest(suite, '4.3 RFC 5322 email regex strictly discriminates invalid and valid addresses', async () => {
      const emailTestCases = [
        // Invalid emails
        { email: 'plainaddress', expectedValid: false },
        { email: '@missingusername.com', expectedValid: false },
        { email: 'user@.com', expectedValid: false },
        { email: 'user@domain..com', expectedValid: false },
        { email: 'user@domain', expectedValid: false },
        { email: 'user name@domain.com', expectedValid: false },
        { email: '<script>@domain.com', expectedValid: false },
        { email: 'user@domain,com', expectedValid: false },
        { email: 'user@', expectedValid: false },
        // Valid emails
        { email: 'info@rubicweb.co.id', expectedValid: true },
        { email: 'budi.santoso@corporate-group.com', expectedValid: true },
        { email: 'test+filter@sub.domain.co.id', expectedValid: true },
        { email: 'dev.team_123@enterprise.tech', expectedValid: true }
      ];

      for (const tc of emailTestCases) {
        const res = await this.driver.evaluate((e) => {
          const input = document.getElementById('email');
          const err = document.getElementById('error-email');
          input.value = e;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('blur', { bubbles: true }));

          const isValid = input.classList.contains('is-valid') && !input.classList.contains('is-invalid');
          const isInvalid = input.classList.contains('is-invalid') && err.style.display !== 'none';
          return { isValid, isInvalid, errorText: err.textContent.trim() };
        }, tc.email);

        if (tc.expectedValid && !res.isValid) {
          throw new Error(`Expected valid email "${tc.email}" was rejected: ${res.errorText}`);
        }
        if (!tc.expectedValid && !res.isInvalid) {
          throw new Error(`Expected invalid email "${tc.email}" was accepted`);
        }
      }
    });

    // 4.4 Indonesian Phone Formatting Validation Matrix
    await this.runTest(suite, '4.4 Indonesian phone validator enforces national mobile formats (+62, 08, 628) and rejects invalid patterns', async () => {
      const phoneTestCases = [
        // Invalid phones
        { phone: '12345', expectedValid: false },
        { phone: '07123456789', expectedValid: false }, // Landline/non-mobile 07
        { phone: '09123456789', expectedValid: false }, // Non-mobile 09
        { phone: '+12025550199', expectedValid: false }, // US country code
        { phone: '08', expectedValid: false },
        { phone: '08123', expectedValid: false },
        { phone: 'abcdefghijk', expectedValid: false },
        { phone: '0812345678901234567', expectedValid: false }, // Excessively long (> 15 digits)
        { phone: '+62', expectedValid: false },
        // Valid Indonesian phones
        { phone: '081234567890', expectedValid: true },
        { phone: '+6281234567890', expectedValid: true },
        { phone: '6281234567890', expectedValid: true },
        { phone: '0852-8000-8984', expectedValid: true },
        { phone: '+62 852 8000 8984', expectedValid: true },
        { phone: '(0852) 8000 8984', expectedValid: true },
        { phone: '08123456789', expectedValid: true }, // 11 digits
        { phone: '0812345678901', expectedValid: true } // 13 digits
      ];

      for (const tc of phoneTestCases) {
        const res = await this.driver.evaluate((p) => {
          const input = document.getElementById('phone');
          const err = document.getElementById('error-phone');
          input.value = p;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('blur', { bubbles: true }));

          const isValid = input.classList.contains('is-valid') && !input.classList.contains('is-invalid');
          const isInvalid = input.classList.contains('is-invalid') && err.style.display !== 'none';
          return { isValid, isInvalid, errorText: err.textContent.trim() };
        }, tc.phone);

        if (tc.expectedValid && !res.isValid) {
          throw new Error(`Expected valid phone "${tc.phone}" was rejected: ${res.errorText}`);
        }
        if (!tc.expectedValid && !res.isInvalid) {
          throw new Error(`Expected invalid phone "${tc.phone}" was accepted`);
        }
      }
    });

    // 4.5 Full Valid Form Submission & WhatsApp URL Pre-fill
    await this.runTest(suite, '4.5 Valid form submission displays success banner and synthesizes accurate WhatsApp deep-link URL', async () => {
      const validSubmission = await this.driver.evaluate(() => {
        // Intercept window.open
        let openedUrl = null;
        window.open = function (url) {
          openedUrl = url;
          return { closed: false };
        };

        const form = document.getElementById('contact-form');
        document.getElementById('name').value = 'Budi Wicaksono';
        document.getElementById('company').value = 'PT Inovasi Cipta Digital';
        document.getElementById('email').value = 'budi@inovasicipta.co.id';
        document.getElementById('phone').value = '0852-8000-8984';
        document.getElementById('package').value = 'Paket Pro — Business & Corporate (Mulai Rp 5.5 Jt)';
        document.getElementById('message').value = 'Membutuhkan redesain portal korporat enterprise dengan PageSpeed 95+ dan garansi 30 hari.';

        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        const banner = document.getElementById('form-success-banner');
        const bannerVisible = banner && banner.style.display === 'block';
        const bannerRole = banner ? banner.getAttribute('role') : '';

        return {
          bannerVisible,
          bannerRole,
          openedUrl
        };
      });

      if (!validSubmission.bannerVisible || validSubmission.bannerRole !== 'status') {
        throw new Error(`Success status banner failed to display with role="status": ${JSON.stringify(validSubmission)}`);
      }
      if (!validSubmission.openedUrl || !validSubmission.openedUrl.startsWith('https://wa.me/6285280008984')) {
        throw new Error(`WhatsApp redirect URL invalid: ${validSubmission.openedUrl}`);
      }
      const decodedMsg = decodeURIComponent(validSubmission.openedUrl);
      if (!decodedMsg.includes('Budi Wicaksono') || !decodedMsg.includes('PT Inovasi Cipta Digital') || !decodedMsg.includes('Paket Pro')) {
        throw new Error(`WhatsApp pre-fill message does not contain client form inputs: ${decodedMsg}`);
      }
    });

    // 4.6 Floating WhatsApp Continuous Ripple Animation
    await this.runTest(suite, '4.6 Floating WhatsApp button features continuous ripple keyframe animation across pages', async () => {
      const rippleTest = await this.driver.evaluate(() => {
        const btn = document.querySelector('.btn-floating-whatsapp, .floating-whatsapp-btn');
        if (!btn) return { exists: false };

        const hasRippleClass = btn.classList.contains('whatsapp-ripple');
        const computed = window.getComputedStyle(btn);
        const animName = computed.animationName;
        const animDuration = computed.animationDuration;
        const animIteration = computed.animationIterationCount;

        // Check keyframe declaration in document.styleSheets
        let hasRippleKeyframe = false;
        try {
          for (const sheet of Array.from(document.styleSheets)) {
            try {
              for (const rule of Array.from(sheet.cssRules || [])) {
                if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name === 'ripple') {
                  hasRippleKeyframe = true;
                  break;
                }
              }
            } catch (e) {
              // cross-origin stylesheet
            }
          }
        } catch (e) {}

        return {
          exists: true,
          hasRippleClass,
          animName,
          animDuration,
          animIteration,
          hasRippleKeyframe
        };
      });

      if (!rippleTest.exists) {
        throw new Error('Floating WhatsApp button element not found in DOM');
      }
      if (!rippleTest.hasRippleClass) {
        throw new Error('Button missing .whatsapp-ripple class');
      }
      if (!rippleTest.animName.includes('ripple')) {
        throw new Error(`Computed animation-name does not include "ripple": ${rippleTest.animName}`);
      }
      if (rippleTest.animIteration !== 'infinite') {
        throw new Error(`Computed animation-iteration-count is not infinite: ${rippleTest.animIteration}`);
      }
      if (!rippleTest.hasRippleKeyframe) {
        throw new Error('@keyframes ripple rule was not found in parsed stylesheets');
      }
    });
  }

  // =========================================================================
  // MAIN RUNNER
  // =========================================================================
  async run() {
    const startTime = Date.now();
    try {
      await this.setup();

      await this.runSuiteServices();
      await this.runSuitePortfolio();
      await this.runSuiteCaseStudyModals();
      await this.runSuiteContact();

    } catch (err) {
      console.error('Fatal test runner error:', err);
    } finally {
      await this.teardown();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      this.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
      this.log(`${colors.bold}${colors.cyan}  CHALLENGER 2 EMPIRICAL TEST EXECUTION SUMMARY     ${colors.reset}`);
      this.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}`);
      this.log(`Total Tests Executed : ${this.totalTests}`);
      this.log(`Passed               : ${colors.green}${this.passedTests}${colors.reset}`);
      this.log(`Failed               : ${this.failedTests > 0 ? colors.red + this.failedTests + colors.reset : '0'}`);
      this.log(`Execution Time       : ${elapsed}s`);

      // Write results to JSON artifact in state folder
      const reportPath = path.resolve(__dirname, '..', '.agents', 'teamwork', 'challenger_m5_2', 'challenger-test-report.json');
      fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalTests: this.totalTests,
        passedTests: this.passedTests,
        failedTests: this.failedTests,
        durationSeconds: parseFloat(elapsed),
        verdict: this.failedTests === 0 ? 'APPROVE' : 'REQUEST_CHANGES',
        results: this.results
      }, null, 2));

      this.log(`\nDetailed report written to: ${reportPath}`);

      if (this.failedTests > 0) {
        process.exitCode = 1;
      }
    }
  }
}

const runner = new ChallengerTestRunner();
runner.run().catch(err => {
  console.error(err);
  process.exit(1);
});
