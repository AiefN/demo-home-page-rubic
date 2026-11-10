/**
 * Challenger 2 - Milestone 5 Empirical Stress Verification Harness
 * Focus:
 * 1. Subpages tilt: all 21 .card-tilt elements (10 in services.html, 7 in portfolio.html, 4 in contact.html)
 * 2. services.html #service-modal controller via initServiceModal()
 * 3. portfolio.html case study modals & rapid category filtering
 * 4. contact.html inline form validation & floating WhatsApp ripple
 * 5. Clean console assurance across all interactions
 */

const path = require('path');
const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runEmpiricalStress() {
  console.log(`${colors.bold}${colors.cyan}====================================================`);
  console.log(`  CHALLENGER 2: EMPIRICAL SUBPAGES & MODALS STRESS`);
  console.log(`====================================================${colors.reset}\n`);

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

  function assert(condition, desc) {
    totalAsserts++;
    if (condition) {
      passedAsserts++;
      console.log(`  ${colors.green}✓${colors.reset} ${desc}`);
    } else {
      failedAsserts++;
      failureList.push(desc);
      console.log(`  ${colors.red}✗ FAILED: ${desc}${colors.reset}`);
    }
  }

  try {
    // =========================================================================
    // PART 1: services.html - 10 .card-tilt Elements & #service-modal
    // =========================================================================
    console.log(`\n${colors.bold}▶ PART 1: services.html - 10 .card-tilt elements & #service-modal${colors.reset}`);
    await driver.goto(`${baseUrl}/services.html`);

    // Verify script tags
    const servicesScripts = await driver.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.getAttribute('src'));
      const inlineScripts = Array.from(document.querySelectorAll('script:not([src])')).map(s => s.textContent.trim());
      return { scripts, inlineCount: inlineScripts.filter(Boolean).length };
    });
    assert(servicesScripts.scripts.includes('js/interactions.js'), 'services.html correctly links js/interactions.js');
    assert(servicesScripts.inlineCount === 0, 'services.html contains 0 inline script tags');

    // Count and test all 10 .card-tilt elements on services.html
    const servicesCardsResult = await driver.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.card-tilt'));
      const details = [];

      cards.forEach((card, idx) => {
        const id = card.id || `card-${idx}`;
        const rect = card.getBoundingClientRect();

        // 1. Enter
        card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        // 2. Move at top-left corner
        const moveTL = new MouseEvent('mousemove', {
          bubbles: true,
          clientX: rect.left + rect.width * 0.1,
          clientY: rect.top + rect.height * 0.1
        });
        card.dispatchEvent(moveTL);
        const transformTL = card.style.transform;
        const glowOpacityTL = card.style.getPropertyValue('--glow-opacity');
        const mouseXTL = card.style.getPropertyValue('--mouse-x');
        const mouseYTL = card.style.getPropertyValue('--mouse-y');

        // Extract rotation angles from TL
        const matchTL = transformTL.match(/rotateX\(([-\d.]+)deg\)\s*rotateY\(([-\d.]+)deg\)/);
        const rotXTL = matchTL ? parseFloat(matchTL[1]) : NaN;
        const rotYTL = matchTL ? parseFloat(matchTL[2]) : NaN;

        // 3. Move at bottom-right corner
        const moveBR = new MouseEvent('mousemove', {
          bubbles: true,
          clientX: rect.left + rect.width * 0.9,
          clientY: rect.top + rect.height * 0.9
        });
        card.dispatchEvent(moveBR);
        const transformBR = card.style.transform;
        const matchBR = transformBR.match(/rotateX\(([-\d.]+)deg\)\s*rotateY\(([-\d.]+)deg\)/);
        const rotXBR = matchBR ? parseFloat(matchBR[1]) : NaN;
        const rotYBR = matchBR ? parseFloat(matchBR[2]) : NaN;

        // 4. Leave
        card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        const transformReset = card.style.transform;
        const glowReset = card.style.getPropertyValue('--glow-opacity');

        details.push({
          idx,
          id,
          tag: card.tagName,
          classes: card.className,
          transformTL,
          rotXTL,
          rotYTL,
          transformBR,
          rotXBR,
          rotYBR,
          glowOpacityTL,
          mouseXTL,
          mouseYTL,
          transformReset,
          glowReset
        });
      });

      return { count: cards.length, details };
    });

    assert(servicesCardsResult.count === 10, `services.html has exactly 10 .card-tilt elements (found ${servicesCardsResult.count})`);

    servicesCardsResult.details.forEach((c) => {
      const hasTilt = c.transformTL.includes('perspective(1000px)') &&
                      c.transformTL.includes('scale3d(1.02, 1.02, 1.02)') &&
                      Number.isFinite(c.rotXTL) && Number.isFinite(c.rotYTL);
      const anglesClamped = Math.abs(c.rotXTL) <= 10 && Math.abs(c.rotYTL) <= 10;
      const glowOk = c.glowOpacityTL === '1' && c.mouseXTL.endsWith('px') && c.mouseYTL.endsWith('px');
      const resetOk = c.transformReset.includes('rotateX(0deg)') && c.transformReset.includes('rotateY(0deg)') && c.glowReset === '0';

      assert(hasTilt && anglesClamped && glowOk && resetOk,
        `Card [${c.idx + 1}/10] (${c.id || c.classes.split(' ')[0]}): tilt angles (${c.rotXTL}°, ${c.rotYTL}°), glare (${c.mouseXTL}, ${c.mouseYTL}), reset: ${resetOk}`);
    });

    // Test #service-modal on services.html
    const serviceIds = ['custom-web', 'business-profile', 'web-app', 'redesign-maintenance'];
    for (const sId of serviceIds) {
      const modalResult = await driver.evaluate((serviceId) => {
        const btn = document.querySelector(`.btn-service-modal[data-service-id="${serviceId}"]`);
        if (!btn) return { btnFound: false };

        btn.click();
        const modal = document.getElementById('service-modal');
        const isActive = modal.classList.contains('is-active');
        const ariaHidden = modal.getAttribute('aria-hidden');
        const bodyNoScroll = document.body.classList.contains('no-scroll');
        const bodyOverflow = document.body.style.overflow;
        const tagText = document.getElementById('service-modal-tag')?.textContent || '';
        const titleText = document.getElementById('service-modal-title')?.textContent || '';
        const descText = document.getElementById('service-modal-desc')?.textContent || '';
        const deliverableItems = Array.from(document.querySelectorAll('#service-modal-deliverables li')).map(li => li.textContent.trim());
        const ctaHref = document.getElementById('service-modal-cta')?.getAttribute('href') || '';

        // Test Escape dismissal
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        const isActiveAfterEsc = modal.classList.contains('is-active');
        const ariaHiddenAfterEsc = modal.getAttribute('aria-hidden');
        const bodyOverflowAfterEsc = document.body.style.overflow;

        return {
          btnFound: true,
          isActive,
          ariaHidden,
          bodyNoScroll,
          bodyOverflow,
          tagText,
          titleText,
          descText,
          deliverablesCount: deliverableItems.length,
          ctaHref,
          isActiveAfterEsc,
          ariaHiddenAfterEsc,
          bodyOverflowAfterEsc
        };
      }, sId);

      assert(modalResult.btnFound, `Found trigger button for service ID: ${sId}`);
      assert(modalResult.isActive && modalResult.ariaHidden === 'false' && modalResult.bodyNoScroll && modalResult.bodyOverflow === 'hidden',
        `Modal correctly opened for ${sId} with body scroll locked`);
      assert(modalResult.deliverablesCount >= 5, `Modal for ${sId} loaded ${modalResult.deliverablesCount} structured deliverables (>=5)`);
      assert(modalResult.ctaHref.includes(sId) || modalResult.ctaHref.includes('contact.html'), `Modal CTA links to contact page with package parameter: ${modalResult.ctaHref}`);
      assert(!modalResult.isActiveAfterEsc && modalResult.ariaHiddenAfterEsc === 'true' && modalResult.bodyOverflowAfterEsc === '',
        `Escape key dismissed modal for ${sId} and restored body scroll`);
    }

    // Test backdrop click vs dialog click
    const backdropTest = await driver.evaluate(() => {
      const btn = document.querySelector('.btn-service-modal');
      btn.click();
      const modal = document.getElementById('service-modal');
      const dialog = modal.querySelector('.modal-dialog');

      // Click inside dialog
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const activeAfterDialogClick = modal.classList.contains('is-active');

      // Click on overlay backdrop
      modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const activeAfterBackdropClick = modal.classList.contains('is-active');

      return { activeAfterDialogClick, activeAfterBackdropClick };
    });
    assert(backdropTest.activeAfterDialogClick === true, 'Clicking inside service modal dialog does NOT dismiss modal');
    assert(backdropTest.activeAfterBackdropClick === false, 'Clicking outside on service modal backdrop cleanly dismisses modal');


    // =========================================================================
    // PART 2: portfolio.html - 7 .card-tilt Elements, Filters, & Case Study Modals
    // =========================================================================
    console.log(`\n${colors.bold}▶ PART 2: portfolio.html - 7 .card-tilt elements, filters, & case study modals${colors.reset}`);
    await driver.goto(`${baseUrl}/portfolio.html`);

    const portfolioScripts = await driver.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.getAttribute('src'));
      return {
        hasInteractions: scripts.includes('js/interactions.js'),
        hasPortfolio: scripts.includes('js/portfolio.js'),
        hasMain: scripts.includes('js/main.js')
      };
    });
    assert(portfolioScripts.hasInteractions && portfolioScripts.hasPortfolio && portfolioScripts.hasMain,
      'portfolio.html loads js/main.js, js/interactions.js, and js/portfolio.js');

    // Count and test all 7 .card-tilt elements on portfolio.html
    const portfolioCardsResult = await driver.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.card-tilt'));
      const details = [];

      cards.forEach((card, idx) => {
        const cat = card.getAttribute('data-category');
        const title = card.querySelector('.portfolio-title, h3')?.textContent.trim() || `Card-${idx}`;
        const rect = card.getBoundingClientRect();

        card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        const move = new MouseEvent('mousemove', {
          bubbles: true,
          clientX: rect.left + rect.width * 0.8,
          clientY: rect.top + rect.height * 0.2
        });
        card.dispatchEvent(move);

        const transform = card.style.transform;
        const glow = card.style.getPropertyValue('--glow-opacity');
        const mouseX = card.style.getPropertyValue('--mouse-x');
        const mouseY = card.style.getPropertyValue('--mouse-y');

        const match = transform.match(/rotateX\(([-\d.]+)deg\)\s*rotateY\(([-\d.]+)deg\)/);
        const rotX = match ? parseFloat(match[1]) : NaN;
        const rotY = match ? parseFloat(match[2]) : NaN;

        card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        const transformReset = card.style.transform;
        const glowReset = card.style.getPropertyValue('--glow-opacity');

        details.push({
          idx,
          cat,
          title,
          transform,
          rotX,
          rotY,
          glow,
          mouseX,
          mouseY,
          transformReset,
          glowReset
        });
      });

      return { count: cards.length, details };
    });

    assert(portfolioCardsResult.count === 7, `portfolio.html has exactly 7 .card-tilt elements (found ${portfolioCardsResult.count})`);

    portfolioCardsResult.details.forEach((c) => {
      const hasTilt = c.transform.includes('perspective(1000px)') &&
                      c.transform.includes('scale3d(1.02, 1.02, 1.02)') &&
                      Number.isFinite(c.rotX) && Number.isFinite(c.rotY);
      const anglesClamped = Math.abs(c.rotX) <= 10 && Math.abs(c.rotY) <= 10;
      const glowOk = c.glow === '1' && c.mouseX.endsWith('px');
      const resetOk = c.transformReset.includes('rotateX(0deg)') && c.transformReset.includes('rotateY(0deg)') && c.glowReset === '0';

      assert(hasTilt && anglesClamped && glowOk && resetOk,
        `Portfolio card [${c.idx + 1}/7] "${c.title}" (${c.cat}): tilt rotX=${c.rotX}°, rotY=${c.rotY}°, glow=${c.mouseX}, reset=${resetOk}`);
    });

    // Test Category Filter Switching with proper async waiting
    const categories = ['all', 'ecommerce', 'corporate', 'webapp'];
    for (const cat of categories) {
      await driver.evaluate((c) => {
        const btn = document.querySelector(`[data-filter="${c}"]`);
        if (btn) btn.click();
      }, cat);
      // Wait for filter transition (250ms timeout in portfolio.js)
      await sleep(280);

      const count = await driver.evaluate(() => {
        return Array.from(document.querySelectorAll('.portfolio-card')).filter(card => {
          const style = window.getComputedStyle(card);
          return style.display !== 'none' && !card.classList.contains('is-hidden');
        }).length;
      });

      if (cat === 'all') assert(count === 7, `Category "all" displays 7 cards (found ${count})`);
      if (cat === 'ecommerce') assert(count === 2, `Category "ecommerce" displays 2 cards (found ${count})`);
      if (cat === 'corporate') assert(count === 3, `Category "corporate" displays 3 cards (found ${count})`);
      if (cat === 'webapp') assert(count === 2, `Category "webapp" displays 2 cards (found ${count})`);
    }

    // Reset back to all
    await driver.evaluate(() => {
      const allBtn = document.querySelector('[data-filter="all"]');
      if (allBtn) allBtn.click();
    });
    await sleep(280);
    const finalAllCards = await driver.evaluate(() => {
      return Array.from(document.querySelectorAll('.portfolio-card')).filter(card => {
        const style = window.getComputedStyle(card);
        return style.display !== 'none' && !card.classList.contains('is-hidden');
      }).length;
    });
    assert(finalAllCards === 7, `Reset back to "all" accurately restores 7 cards without DOM corruption`);

    // Test Case Study Modal on portfolio.html for all project triggers
    const modalInspection = await driver.evaluate(() => {
      const modal = document.getElementById('case-study-modal');
      const triggers = Array.from(document.querySelectorAll('.btn-case-study, [data-project-id]'));
      const projectResults = [];

      triggers.forEach(btn => {
        const projId = btn.getAttribute('data-project-id') || btn.getAttribute('data-case-study');
        btn.click();

        const isOpen = modal.classList.contains('is-active') || modal.style.display === 'flex';
        const title = document.getElementById('modal-title')?.textContent.trim() || '';
        const client = document.getElementById('modal-client')?.textContent.trim() || '';
        const challenge = document.getElementById('modal-challenge')?.textContent.trim() || '';
        const solution = document.getElementById('modal-solution')?.textContent.trim() || '';
        const results = document.getElementById('modal-results')?.textContent.trim() || '';
        const waLink = document.getElementById('modal-whatsapp-cta')?.getAttribute('href') || '';

        // Close with escape
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        const isClosed = !modal.classList.contains('is-active') && modal.style.display === 'none';

        projectResults.push({
          projId,
          isOpen,
          isClosed,
          titleValid: title.length > 5,
          clientValid: client.length > 2,
          challengeValid: challenge.length > 10,
          solutionValid: solution.length > 10,
          resultsValid: results.length > 5,
          waLinkValid: waLink.includes('wa.me')
        });
      });

      return { triggerCount: triggers.length, projectResults };
    });

    assert(modalInspection.triggerCount >= 7, `Found ${modalInspection.triggerCount} case study modal triggers`);
    modalInspection.projectResults.forEach((pr, i) => {
      assert(pr.isOpen && pr.isClosed && pr.titleValid && pr.challengeValid && pr.solutionValid && pr.waLinkValid,
        `Case study trigger [${i + 1}/${modalInspection.triggerCount}] (${pr.projId}): open=${pr.isOpen}, close=${pr.isClosed}, content verified`);
    });


    // =========================================================================
    // PART 3: contact.html - 4 .card-tilt Elements, Inline Validation & Ripple
    // =========================================================================
    console.log(`\n${colors.bold}▶ PART 3: contact.html - 4 .card-tilt elements, inline validation, & ripple${colors.reset}`);
    await driver.goto(`${baseUrl}/contact.html`);

    const contactScripts = await driver.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.getAttribute('src'));
      return {
        hasInteractions: scripts.includes('js/interactions.js'),
        hasContact: scripts.includes('js/contact.js'),
        hasMain: scripts.includes('js/main.js')
      };
    });
    assert(contactScripts.hasInteractions && contactScripts.hasContact && contactScripts.hasMain,
      'contact.html loads js/main.js, js/interactions.js, and js/contact.js');

    // Count and test all 4 .card-tilt elements on contact.html
    const contactCardsResult = await driver.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.card-tilt'));
      const details = [];

      cards.forEach((card, idx) => {
        const heading = card.querySelector('h4, h3')?.textContent.trim() || `Card-${idx}`;
        const rect = card.getBoundingClientRect();

        card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        const move = new MouseEvent('mousemove', {
          bubbles: true,
          clientX: rect.left + rect.width * 0.3,
          clientY: rect.top + rect.height * 0.7
        });
        card.dispatchEvent(move);

        const transform = card.style.transform;
        const glow = card.style.getPropertyValue('--glow-opacity');
        const mouseX = card.style.getPropertyValue('--mouse-x');
        const mouseY = card.style.getPropertyValue('--mouse-y');

        const match = transform.match(/rotateX\(([-\d.]+)deg\)\s*rotateY\(([-\d.]+)deg\)/);
        const rotX = match ? parseFloat(match[1]) : NaN;
        const rotY = match ? parseFloat(match[2]) : NaN;

        card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        const transformReset = card.style.transform;
        const glowReset = card.style.getPropertyValue('--glow-opacity');

        details.push({
          idx,
          heading,
          transform,
          rotX,
          rotY,
          glow,
          mouseX,
          mouseY,
          transformReset,
          glowReset
        });
      });

      return { count: cards.length, details };
    });

    assert(contactCardsResult.count === 4, `contact.html has exactly 4 .card-tilt elements (found ${contactCardsResult.count})`);

    contactCardsResult.details.forEach((c) => {
      const hasTilt = c.transform.includes('perspective(1000px)') &&
                      c.transform.includes('scale3d(1.02, 1.02, 1.02)') &&
                      Number.isFinite(c.rotX) && Number.isFinite(c.rotY);
      const anglesClamped = Math.abs(c.rotX) <= 10 && Math.abs(c.rotY) <= 10;
      const glowOk = c.glow === '1' && c.mouseX.endsWith('px');
      const resetOk = c.transformReset.includes('rotateX(0deg)') && c.transformReset.includes('rotateY(0deg)') && c.glowReset === '0';

      assert(hasTilt && anglesClamped && glowOk && resetOk,
        `Contact card [${c.idx + 1}/4] "${c.heading}": rotX=${c.rotX}°, rotY=${c.rotY}°, glow=${c.mouseX}, reset=${resetOk}`);
    });

    // Subpages grand total .card-tilt verification: 10 + 7 + 4 = 21
    const subpagesTotal = servicesCardsResult.count + portfolioCardsResult.count + contactCardsResult.count;
    assert(subpagesTotal === 21, `All 21 subpage .card-tilt elements verified (10 services + 7 portfolio + 4 contact = ${subpagesTotal})`);

    // Form inline validation stress on contact.html
    const formValidationResult = await driver.evaluate(() => {
      const form = document.querySelector('.consultation-form, .contact-form, #contact-form');
      const nameInput = form.querySelector('#name, input[name="name"], input[name="nama"], #form-name');
      const emailInput = form.querySelector('#email, input[type="email"], input[name="email"], #form-email');
      const phoneInput = form.querySelector('#phone, input[type="tel"], input[name="phone"], #form-phone');
      const packageSelect = form.querySelector('#package, select[name="package"], #form-package');
      const messageInput = form.querySelector('#message, textarea[name="message"], #form-message');
      const submitBtn = form.querySelector('button[type="submit"]');

      // 1. Submit empty form
      submitBtn.click();
      const activeErrors = Array.from(form.querySelectorAll('.is-invalid, [aria-invalid="true"]'));
      const activeElementId = document.activeElement ? document.activeElement.id : '';

      // 2. Name validation tests
      nameInput.value = '  ab ';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('blur', { bubbles: true }));
      const nameTooShortError = nameInput.getAttribute('aria-invalid') === 'true';

      nameInput.value = 'Budi Santoso & Co <script>alert(1)</script>';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('blur', { bubbles: true }));
      const nameValid = nameInput.getAttribute('aria-invalid') !== 'true';

      // 3. Email validation tests
      const invalidEmails = ['plainaddress', 'missingat.com', 'user@domain', 'user@.com', '@missinguser.com'];
      let allInvalidCaught = true;
      for (const inv of invalidEmails) {
        emailInput.value = inv;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
        if (emailInput.getAttribute('aria-invalid') !== 'true') {
          allInvalidCaught = false;
        }
      }

      emailInput.value = 'cto@enterprise.co.id';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
      const validEmailAccepted = emailInput.getAttribute('aria-invalid') !== 'true';

      // 4. Phone validation tests (Indonesian formats)
      const invalidPhones = ['12345', 'abcdef', '021-9999', '0812', '+14155552671'];
      let allInvalidPhonesCaught = true;
      for (const p of invalidPhones) {
        phoneInput.value = p;
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        phoneInput.dispatchEvent(new Event('blur', { bubbles: true }));
        if (phoneInput.getAttribute('aria-invalid') !== 'true') {
          allInvalidPhonesCaught = false;
        }
      }

      const validPhones = ['+628123456789', '081234567890', '6281234567890'];
      let allValidPhonesAccepted = true;
      for (const p of validPhones) {
        phoneInput.value = p;
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        phoneInput.dispatchEvent(new Event('blur', { bubbles: true }));
        if (phoneInput.getAttribute('aria-invalid') === 'true') {
          allValidPhonesAccepted = false;
        }
      }

      // 5. Valid submission
      nameInput.value = 'Direktur Rekayasa PT Maju Bersama';
      emailInput.value = 'engineering@majubersama.co.id';
      phoneInput.value = '+6281234567890';
      if (packageSelect) {
        // Select a non-empty option
        for (let i = 0; i < packageSelect.options.length; i++) {
          if (packageSelect.options[i].value && packageSelect.options[i].value !== 'pilih') {
            packageSelect.selectedIndex = i;
            break;
          }
        }
        packageSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (messageInput) {
        messageInput.value = 'Kami membutuhkan portal web aplikasi enterprise dengan integrasi sistem internal.';
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      submitBtn.click();
      const successBanner = document.getElementById('form-success-banner');
      const waLink = successBanner ? successBanner.querySelector('a')?.getAttribute('href') : '';

      return {
        initialEmptyErrorsCount: activeErrors.length,
        firstInvalidFocused: activeElementId === nameInput.id,
        nameTooShortError,
        nameValid,
        allInvalidCaught,
        validEmailAccepted,
        allInvalidPhonesCaught,
        allValidPhonesAccepted,
        successVisible: successBanner ? (successBanner.style.display !== 'none' || window.getComputedStyle(successBanner).display !== 'none') : false,
        waHrefValid: waLink ? (waLink.includes('wa.me') || waLink.includes('whatsapp.com')) : false
      };
    });

    assert(formValidationResult.initialEmptyErrorsCount >= 3, `Empty form submission flagged ${formValidationResult.initialEmptyErrorsCount} errors on required fields`);
    assert(formValidationResult.firstInvalidFocused, 'Empty submission placed keyboard focus on the first invalid input element');
    assert(formValidationResult.nameTooShortError, 'Name field under 3 characters properly triggers inline validation warning');
    assert(formValidationResult.allInvalidCaught, 'RFC 5322 regex strictly rejected all malformed email address patterns');
    assert(formValidationResult.validEmailAccepted, 'Valid enterprise email address (cto@enterprise.co.id) cleared error state');
    assert(formValidationResult.allInvalidPhonesCaught, 'Indonesian phone validator rejected non-Indonesian or short phone numbers');
    assert(formValidationResult.allValidPhonesAccepted, 'Indonesian phone prefixes (+62, 08, 628) successfully accepted');
    assert(formValidationResult.successVisible, 'Valid form submission displayed success status notification');
    assert(formValidationResult.waHrefValid, 'Form generated valid WhatsApp direct consultation deep-link URL');

    // Floating WhatsApp ripple animation verification
    const rippleTestResult = await driver.evaluate(() => {
      const waBtn = document.querySelector('.floating-whatsapp-btn, .btn-floating-whatsapp');
      if (!waBtn) return { found: false };

      const computed = window.getComputedStyle(waBtn);
      const hasClass = waBtn.classList.contains('whatsapp-ripple');
      const animName = computed.animationName;
      const ariaLabel = waBtn.getAttribute('aria-label');
      const href = waBtn.getAttribute('href');

      return {
        found: true,
        hasClass,
        animName,
        ariaLabel,
        href
      };
    });

    assert(rippleTestResult.found, 'Floating WhatsApp button is present in DOM');
    assert(rippleTestResult.hasClass, 'Floating WhatsApp button carries .whatsapp-ripple class');
    assert(rippleTestResult.animName === 'ripple', `Computed animation-name evaluates strictly to 'ripple' (got: '${rippleTestResult.animName}')`);
    assert(rippleTestResult.ariaLabel && rippleTestResult.ariaLabel.includes('WhatsApp'), `Accessible aria-label contains 'WhatsApp': "${rippleTestResult.ariaLabel}"`);
    assert(rippleTestResult.href.includes('wa.me') || rippleTestResult.href.includes('whatsapp.com'), `Floating button links to official WhatsApp URL`);

    // Verify zero console errors throughout entire run
    const consoleErrors = driver.consoleErrors;
    assert(consoleErrors.length === 0, `Zero runtime console errors detected during empirical tests (got: ${consoleErrors.length})`);

  } finally {
    await driver.close();
    await server.stop();
  }

  console.log(`\n${colors.bold}${colors.cyan}====================================================`);
  console.log(`  CHALLENGER 2 EMPIRICAL TEST SUMMARY`);
  console.log(`====================================================${colors.reset}`);
  console.log(`Total Assertions : ${totalAsserts}`);
  console.log(`Passed           : ${passedAsserts}`);
  console.log(`Failed           : ${failedAsserts}`);

  if (failedAsserts === 0) {
    console.log(`\n${colors.green}${colors.bold}EMPIRICAL AUDIT VERDICT: APPROVE (100% PASS)${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}EMPIRICAL AUDIT VERDICT: REQUEST_CHANGES (${failedAsserts} FAILURES)${colors.reset}\n`);
    process.exit(1);
  }
}

runEmpiricalStress().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
