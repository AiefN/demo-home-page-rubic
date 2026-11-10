/**
 * Independent Forensic Test Script by auditor_m5
 * Thoroughly verifies genuine algorithm execution, math accuracy, and zero-framework integrity.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const StaticServer = require('../../../tests/helpers/static-server');
const BrowserDriver = require('../../../tests/helpers/browser-driver');

async function runForensicAudit() {
  console.log('--- STARTING INDEPENDENT FORENSIC VERIFICATION ---');
  const server = new StaticServer({ rootDir: path.resolve(__dirname, '../../..') });
  const serverInfo = await server.start();
  const driver = new BrowserDriver();
  await driver.launch();

  const results = [];

  function record(checkName, pass, details) {
    results.push({ checkName, pass, details });
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${checkName}: ${details}`);
  }

  try {
    const baseUrl = serverInfo.url;

    // CHECK 1: ZERO EXTERNAL FRAMEWORKS & CLEAN CONSOLE ACROSS ALL 4 PAGES
    const pages = ['index.html', 'services.html', 'portfolio.html', 'contact.html'];
    for (const p of pages) {
      await driver.goto(`${baseUrl}/${p}`);
      const errors = driver.getConsoleErrors();
      record(`Zero Console Errors on ${p}`, errors.length === 0, `Found ${errors.length} errors: ${errors.join('; ')}`);

      const extScripts = await driver.evaluate(() => {
        return Array.from(document.querySelectorAll('script[src]'))
          .map(s => s.getAttribute('src'))
          .filter(src => src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//'));
      });
      record(`Zero External Script CDNs on ${p}`, extScripts.length === 0, `External scripts: ${JSON.stringify(extScripts)}`);

      const extStyles = await driver.evaluate(() => {
        return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .map(l => l.getAttribute('href'))
          .filter(href => (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) && !href.includes('fonts.googleapis.com'));
      });
      record(`Zero External CSS Frameworks on ${p}`, extStyles.length === 0, `External styles: ${JSON.stringify(extStyles)}`);

      const windowPollution = await driver.evaluate(() => {
        return {
          react: typeof window.React !== 'undefined',
          vue: typeof window.Vue !== 'undefined',
          jquery: typeof window.jQuery !== 'undefined' || typeof window.$ !== 'undefined',
          tailwind: typeof window.tailwind !== 'undefined'
        };
      });
      const hasPollution = windowPollution.react || windowPollution.vue || windowPollution.jquery || windowPollution.tailwind;
      record(`Vanilla Global Window on ${p}`, !hasPollution, `Pollution status: ${JSON.stringify(windowPollution)}`);
    }

    // CHECK 2: MATHEMATICAL ACCURACY OF PRICING CALCULATOR
    await driver.goto(`${baseUrl}/index.html`);
    const mathResults = await driver.evaluate(() => {
      const calcSection = document.getElementById('pricing-calculator') || document.querySelector('.pricing-calculator');
      if (!calcSection) return { error: 'Calculator not found' };

      const tierBasic = calcSection.querySelector('input[name="tier"][value="basic"]');
      const tierPro = calcSection.querySelector('input[name="tier"][value="pro"]');
      const tierEnterprise = calcSection.querySelector('input[name="tier"][value="enterprise"]');
      const extraPagesSlider = calcSection.querySelector('#extra-pages') || calcSection.querySelector('input[type="range"]');
      const priceDisplay = calcSection.querySelector('#calc-total-price');
      const timelineDisplay = calcSection.querySelector('#calc-total-timeline');
      const waLink = calcSection.querySelector('#btn-calc-whatsapp') || calcSection.querySelector('a.btn-whatsapp');

      const tests = [];

      // Test Pro (Default)
      if (tierPro) {
        tierPro.checked = true;
        tierPro.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (extraPagesSlider) {
        extraPagesSlider.value = '5';
        extraPagesSlider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      tests.push({ step: 'Pro default (5 pages)', price: priceDisplay.textContent, timeline: timelineDisplay.textContent, waHref: waLink ? waLink.href : '' });

      // Test Basic with 1 page
      if (tierBasic) {
        tierBasic.checked = true;
        tierBasic.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (extraPagesSlider) {
        extraPagesSlider.value = '1';
        extraPagesSlider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      tests.push({ step: 'Basic (1 page)', price: priceDisplay.textContent, timeline: timelineDisplay.textContent, waHref: waLink ? waLink.href : '' });

      // Test Basic with 3 pages (2 extra pages = +700.000 -> 3.200.000)
      if (extraPagesSlider) {
        extraPagesSlider.value = '3';
        extraPagesSlider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      tests.push({ step: 'Basic (3 pages)', price: priceDisplay.textContent, timeline: timelineDisplay.textContent, waHref: waLink ? waLink.href : '' });

      // Test Enterprise with 10 pages -> 12.000.000
      if (tierEnterprise) {
        tierEnterprise.checked = true;
        tierEnterprise.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (extraPagesSlider) {
        extraPagesSlider.value = '10';
        extraPagesSlider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      tests.push({ step: 'Enterprise (10 pages)', price: priceDisplay.textContent, timeline: timelineDisplay.textContent, waHref: waLink ? waLink.href : '' });

      return { success: true, tests };
    });

    record('Pricing Math Execution', mathResults.success, JSON.stringify(mathResults.tests));
    const isProCorrect = mathResults.tests[0].price.includes('5.500.000');
    const isBasic1Correct = mathResults.tests[1].price.includes('2.500.000');
    const isBasic3Correct = mathResults.tests[2].price.includes('3.200.000');
    const isEnterpriseCorrect = mathResults.tests[3].price.includes('12.000.000');
    record('Pricing Math Value Accuracy', isProCorrect && isBasic1Correct && isBasic3Correct && isEnterpriseCorrect,
      `Pro=5.5M (${isProCorrect}), Basic1=2.5M (${isBasic1Correct}), Basic3=3.2M (${isBasic3Correct}), Ent=12.0M (${isEnterpriseCorrect})`);

    // CHECK 3: 3D PERSPECTIVE TILT GENUINE CALCULATION
    const tiltTest = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .service-card');
      if (!card) return { error: 'Tilt card not found' };

      const rect = card.getBoundingClientRect();
      // Move mouse to top-right quadrant (x > center, y < center)
      const moveEvent = new MouseEvent('mousemove', {
        clientX: rect.left + rect.width * 0.8,
        clientY: rect.top + rect.height * 0.2,
        bubbles: true
      });
      card.dispatchEvent(moveEvent);

      const transformMoved = card.style.transform;
      const rotXMatch = transformMoved.match(/rotateX\(([-0-9.]+)deg\)/);
      const rotYMatch = transformMoved.match(/rotateY\(([-0-9.]+)deg\)/);

      // Move mouse to bottom-left quadrant (x < center, y > center)
      card.dispatchEvent(new MouseEvent('mousemove', {
        clientX: rect.left + rect.width * 0.2,
        clientY: rect.top + rect.height * 0.8,
        bubbles: true
      }));
      const transformOpposite = card.style.transform;
      const oppRotXMatch = transformOpposite.match(/rotateX\(([-0-9.]+)deg\)/);
      const oppRotYMatch = transformOpposite.match(/rotateY\(([-0-9.]+)deg\)/);

      // Mouseleave
      card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      const transformLeave = card.style.transform;

      return {
        moved: transformMoved,
        rotX: rotXMatch ? parseFloat(rotXMatch[1]) : null,
        rotY: rotYMatch ? parseFloat(rotYMatch[1]) : null,
        oppMoved: transformOpposite,
        oppRotX: oppRotXMatch ? parseFloat(oppRotXMatch[1]) : null,
        oppRotY: oppRotYMatch ? parseFloat(oppRotYMatch[1]) : null,
        leave: transformLeave
      };
    });

    const isTiltDynamic = tiltTest.rotX !== null && tiltTest.rotY !== null &&
                          tiltTest.oppRotX !== null && tiltTest.oppRotY !== null &&
                          Math.sign(tiltTest.rotX) !== Math.sign(tiltTest.oppRotX) &&
                          Math.sign(tiltTest.rotY) !== Math.sign(tiltTest.oppRotY);
    record('3D Tilt Dynamic Deflection', isTiltDynamic,
      `Quadrant 1 (rotX=${tiltTest.rotX}, rotY=${tiltTest.rotY}) vs Quadrant 3 (oppRotX=${tiltTest.oppRotX}, oppRotY=${tiltTest.oppRotY})`);
    const isTiltReset = tiltTest.leave.includes('rotateX(0deg)') && tiltTest.leave.includes('rotateY(0deg)');
    record('3D Tilt Mouseleave Reset', isTiltReset, `Leave transform: ${tiltTest.leave}`);

    // CHECK 4: LERP CURSOR MECHANISM
    const cursorTest = await driver.evaluate(async () => {
      const dot = document.querySelector('.cursor-dot');
      const follower = document.querySelector('.cursor-follower');
      if (!dot || !follower) return { error: 'Cursor elements not found' };

      // Dispatch mousemove to (500, 300)
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 500, clientY: 300 }));

      const immediateDotTransform = dot.style.transform;
      const immediateFollowerTransform = follower.style.transform;

      // Wait 100ms for LERP requestAnimationFrame to smoothly advance follower
      await new Promise(r => setTimeout(r, 100));
      const laterFollowerTransform = follower.style.transform;

      return {
        immediateDotTransform,
        immediateFollowerTransform,
        laterFollowerTransform
      };
    });

    const isLerpActive = cursorTest.immediateDotTransform.includes('500px') &&
                         cursorTest.laterFollowerTransform !== cursorTest.immediateFollowerTransform;
    record('Cursor LERP Dynamic Interpolation', isLerpActive,
      `Dot: ${cursorTest.immediateDotTransform}, Follower 0ms: ${cursorTest.immediateFollowerTransform}, Follower 100ms: ${cursorTest.laterFollowerTransform}`);

    // CHECK 5: REAL-TIME CONTACT FORM INLINE VALIDATION
    await driver.goto(`${baseUrl}/contact.html`);
    const formTest = await driver.evaluate(() => {
      const form = document.querySelector('#contact-form, .consultation-form');
      if (!form) return { error: 'Form not found' };

      const nameInput = form.querySelector('#name, input[name="name"], #form-name');
      const emailInput = form.querySelector('#email, input[type="email"], #form-email');
      const phoneInput = form.querySelector('#phone, input[type="tel"], #form-phone');
      const submitBtn = form.querySelector('button[type="submit"]');

      // Test invalid email
      emailInput.value = 'invalid-email-address';
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
      const emailInvalid = emailInput.classList.contains('is-invalid') || emailInput.getAttribute('aria-invalid') === 'true';

      // Test valid email
      emailInput.value = 'client@perusahaan.co.id';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
      const emailValid = emailInput.classList.contains('is-valid') && !emailInput.classList.contains('is-invalid');

      // Test invalid phone
      phoneInput.value = '12345';
      phoneInput.dispatchEvent(new Event('blur', { bubbles: true }));
      const phoneInvalid = phoneInput.classList.contains('is-invalid') || phoneInput.getAttribute('aria-invalid') === 'true';

      // Test valid Indonesian phone
      phoneInput.value = '081234567890';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      phoneInput.dispatchEvent(new Event('blur', { bubbles: true }));
      const phoneValid = phoneInput.classList.contains('is-valid') && !phoneInput.classList.contains('is-invalid');

      return { emailInvalid, emailValid, phoneInvalid, phoneValid };
    });

    const isFormValidationGenuine = formTest.emailInvalid && formTest.emailValid && formTest.phoneInvalid && formTest.phoneValid;
    record('Contact Form Inline Validation Logic', isFormValidationGenuine,
      `Email (invalid=${formTest.emailInvalid}, valid=${formTest.emailValid}), Phone (invalid=${formTest.phoneInvalid}, valid=${formTest.phoneValid})`);

  } catch (err) {
    record('Forensic Script Execution', false, `Encountered exception: ${err.message}\n${err.stack}`);
  } finally {
    await driver.close();
    await server.stop();
  }

  // Generate Summary
  const allPassed = results.every(r => r.pass);
  console.log('--- FORENSIC AUDIT COMPLETE ---');
  console.log(`Total Forensic Checks: ${results.length}`);
  console.log(`All Passed: ${allPassed}`);
  return { allPassed, results };
}

runForensicAudit().then(({ allPassed, results }) => {
  fs.writeFileSync(path.resolve(__dirname, 'forensic_results.json'), JSON.stringify({ allPassed, results }, null, 2));
  process.exit(allPassed ? 0 : 1);
}).catch(err => {
  console.error('Fatal error during forensic audit:', err);
  process.exit(1);
});
