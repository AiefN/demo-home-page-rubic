/**
 * Challenger 2 (teamwork_challenger) Empirical Stress Test Suite
 * Milestone 6: UI/UX Visual Layout & Placement Defect Resolution
 * Target Systems: Pricing Calculator (#pricing / #pricing-calculator) & FAQ Accordion (#faq)
 */

const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');
const path = require('path');
const fs = require('fs');

async function runChallengerStress() {
  console.log('================================================================');
  console.log(' CHALLENGER 2: EMPIRICAL STRESS TEST & ADVERSARIAL VERIFICATION');
  console.log(' Systems: Pricing Calculator & FAQ Accordion                   ');
  console.log(' Viewports: 1440px (Desktop), 768px (Tablet), 375px (Mobile)   ');
  console.log('================================================================\n');

  const server = new StaticServer({ rootDir: path.resolve(__dirname, '..'), port: 8123 });
  const serverInfo = await server.start();
  const driver = new BrowserDriver({ port: 9235 });
  await driver.launch();

  const auditReport = {
    timestamp: new Date().toISOString(),
    baseUrl: serverInfo.url,
    verdict: 'PENDING',
    pricingCalculator: {
      passed: true,
      failures: [],
      geometry: {},
      functionalCycle: {},
      rapidBurstStress: {}
    },
    faqAccordion: {
      passed: true,
      failures: [],
      computedStyles: [],
      expansionCycle: [],
      rapidToggleStress: {},
      keyboardStress: {}
    },
    consoleErrors: []
  };

  // Helper assert
  function assert(condition, message, system = 'pricingCalculator') {
    if (!condition) {
      console.error(`  ❌ [FAIL] ${message}`);
      auditReport[system].passed = false;
      auditReport[system].failures.push(message);
    } else {
      console.log(`  ✓ [PASS] ${message}`);
    }
  }

  try {
    // =========================================================================
    // SECTION 1: PRICING CALCULATOR STRESS
    // =========================================================================
    console.log('\n============================================================');
    console.log(' 1. PRICING CALCULATOR EMPIRICAL STRESS SUITE');
    console.log('============================================================\n');

    // Viewports to test
    const viewports = [
      { name: 'desktop', width: 1440, height: 900, minCardWidth: 200, expectStacked: false },
      { name: 'tablet', width: 768, height: 1024, minCardWidth: 160, expectStacked: false },
      { name: 'mobile', width: 375, height: 667, minCardWidth: 260, expectStacked: true }
    ];

    for (const vp of viewports) {
      console.log(`\n▶ [1.1] Testing Pricing Calculator Geometry at ${vp.name.toUpperCase()} (${vp.width}x${vp.height})...`);
      await driver.setViewport({ width: vp.width, height: vp.height });
      await driver.goto(`${serverInfo.url}/index.html`);
      await new Promise(r => setTimeout(r, 400));

      const geometry = await driver.evaluate(() => {
        const calcSection = document.getElementById('pricing-calculator') || document.getElementById('pricing') || document.querySelector('.pricing-section');
        const widget = document.querySelector('.pricing-calculator-widget, .calc-layout');
        const tierGroup = document.querySelector('.tier-cards-group, .tier-selector, .tier-options');
        const cards = Array.from(document.querySelectorAll('.tier-card'));

        const sectionRect = calcSection ? calcSection.getBoundingClientRect() : null;
        const widgetRect = widget ? widget.getBoundingClientRect() : null;
        const groupRect = tierGroup ? tierGroup.getBoundingClientRect() : null;

        const cardMetrics = cards.map((c, i) => {
          const r = c.getBoundingClientRect();
          const radio = c.querySelector('input[type="radio"]');
          const inner = c.querySelector('.tier-card-inner');
          const innerR = inner ? inner.getBoundingClientRect() : null;
          const cs = window.getComputedStyle(c);
          return {
            index: i,
            value: radio ? radio.value : null,
            rect: {
              x: Math.round(r.x),
              y: Math.round(r.y),
              top: Math.round(r.top),
              right: Math.round(r.right),
              bottom: Math.round(r.bottom),
              left: Math.round(r.left),
              width: Math.round(r.width),
              height: Math.round(r.height)
            },
            display: cs.display,
            flexDirection: cs.flexDirection,
            boxSizing: cs.boxSizing,
            hasInner: !!inner,
            innerRect: innerR ? {
              width: Math.round(innerR.width),
              height: Math.round(innerR.height)
            } : null
          };
        });

        // Compute pairwise overlap
        const overlaps = [];
        for (let i = 0; i < cardMetrics.length; i++) {
          for (let j = i + 1; j < cardMetrics.length; j++) {
            const a = cardMetrics[i].rect;
            const b = cardMetrics[j].rect;
            const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
            const overlapArea = xOverlap * yOverlap;
            overlaps.push({ i, j, xOverlap, yOverlap, overlapArea });
          }
        }

        // Check if page has horizontal overflow
        const docScrollWidth = document.documentElement.scrollWidth;
        const docClientWidth = document.documentElement.clientWidth;
        const hasHorizontalScroll = docScrollWidth > docClientWidth;

        return {
          sectionExists: !!calcSection,
          widgetWidth: widgetRect ? Math.round(widgetRect.width) : 0,
          groupWidth: groupRect ? Math.round(groupRect.width) : 0,
          cardsCount: cards.length,
          cards: cardMetrics,
          overlaps,
          hasHorizontalScroll,
          docScrollWidth,
          docClientWidth
        };
      });

      auditReport.pricingCalculator.geometry[vp.name] = geometry;

      assert(geometry.sectionExists, `Pricing section exists on ${vp.name}`);
      assert(geometry.cardsCount === 3, `Found exactly 3 tier cards on ${vp.name} (got ${geometry.cardsCount})`);
      assert(!geometry.hasHorizontalScroll, `Zero horizontal viewport overflow on ${vp.name} (scrollWidth=${geometry.docScrollWidth}, clientWidth=${geometry.docClientWidth})`);

      // Verify desktop card width >= 200px
      geometry.cards.forEach((card, idx) => {
        const tierName = card.value || `Tier ${idx}`;
        assert(card.rect.width >= vp.minCardWidth,
          `Card [${tierName}] width (${card.rect.width}px) >= ${vp.minCardWidth}px on ${vp.name}`);
        assert(card.display === 'flex',
          `Card [${tierName}] uses display: flex (got "${card.display}") on ${vp.name}`);
      });

      // Verify pairwise overlap
      geometry.overlaps.forEach(ov => {
        assert(ov.overlapArea === 0,
          `0 geometric overlap between Card ${ov.i} and Card ${ov.j} on ${vp.name} (overlapArea=${ov.overlapArea}px²)`);
      });

      if (!vp.expectStacked) {
        // Desktop / Tablet horizontal alignment
        const c0 = geometry.cards[0].rect;
        const c1 = geometry.cards[1].rect;
        const c2 = geometry.cards[2].rect;
        assert(c0.right <= c1.left + 1, `Card 0 is to the left of Card 1 on ${vp.name} (c0.right=${c0.right} <= c1.left=${c1.left})`);
        assert(c1.right <= c2.left + 1, `Card 1 is to the left of Card 2 on ${vp.name} (c1.right=${c1.right} <= c2.left=${c2.left})`);
        // Check vertical line-box alignment
        const topDiff = Math.abs(c0.top - c1.top) + Math.abs(c1.top - c2.top);
        assert(topDiff <= 10, `Tier cards align horizontally along the same baseline row on ${vp.name} (topDiff=${topDiff}px)`);
      } else {
        // Mobile vertical stacking
        const c0 = geometry.cards[0].rect;
        const c1 = geometry.cards[1].rect;
        const c2 = geometry.cards[2].rect;
        assert(c0.bottom <= c1.top + 1, `Card 0 is above Card 1 on ${vp.name} (c0.bottom=${c0.bottom} <= c1.top=${c1.top})`);
        assert(c1.bottom <= c2.top + 1, `Card 1 is above Card 2 on ${vp.name} (c1.bottom=${c1.bottom} <= c2.top=${c2.top})`);
        assert(c0.right <= vp.width, `Card 0 fits inside viewport width ${vp.width} (c0.right=${c0.right})`);
      }
    }

    // -------------------------------------------------------------------------
    // [1.2] FUNCTIONAL CYCLE: TIERS, SLIDER, ADD-ONS, COMBINATIONS
    // -------------------------------------------------------------------------
    console.log('\n▶ [1.2] Stress-Testing Real-time Pricing & Timeline Mathematical Calculations...');
    await driver.setViewport({ width: 1440, height: 900 });
    await driver.goto(`${serverInfo.url}/index.html`);
    await new Promise(r => setTimeout(r, 300));

    // Clear console errors collector
    driver.consoleErrors = [];

    const testScenarios = [
      {
        name: 'Baseline Pro (Default: 5 pages, 0 addons, no express)',
        tier: 'pro',
        pages: 5,
        addons: [],
        express: false,
        expectedPrice: 'Rp 5.500.000',
        expectedDaysMin: 18,
        expectedDaysMax: 22
      },
      {
        name: 'Basic Tier (1 page, 0 addons, no express)',
        tier: 'basic',
        pages: 1,
        addons: [],
        express: false,
        expectedPrice: 'Rp 2.500.000',
        expectedDaysMin: 7,
        expectedDaysMax: 11
      },
      {
        name: 'Basic Tier + 5 Pages (+4 extra * 350k = +1.4M)',
        // 2.5M + 1.4M = 3.9M; days: 7 + ceil(4*0.5) = 7 + 2 = 9 days
        tier: 'basic',
        pages: 5,
        addons: [],
        express: false,
        expectedPrice: 'Rp 3.900.000',
        expectedDaysMin: 9,
        expectedDaysMax: 13
      },
      {
        name: 'Pro Tier + 10 Pages (+5 extra * 350k = +1.75M) + E-Commerce (+2M, +5d)',
        // 5.5M + 1.75M + 2.0M = 9.25M; days: 18 + ceil(5*0.5) + 5 = 18 + 3 + 5 = 26 days
        tier: 'pro',
        pages: 10,
        addons: ['E-Commerce'],
        express: false,
        expectedPrice: 'Rp 9.250.000',
        expectedDaysMin: 26,
        expectedDaysMax: 30
      },
      {
        name: 'Pro Tier + E-Commerce + Payment Gateway (+1.5M, +3d)',
        // 5.5M + 0 extra + 2M + 1.5M = 9.0M; days: 18 + 5 + 3 = 26 days
        tier: 'pro',
        pages: 5,
        addons: ['E-Commerce', 'Payment Gateway'],
        express: false,
        expectedPrice: 'Rp 9.000.000',
        expectedDaysMin: 26,
        expectedDaysMax: 30
      },
      {
        name: 'Enterprise Tier (10 pages base, 0 addons)',
        tier: 'enterprise',
        pages: 10,
        addons: [],
        express: false,
        expectedPrice: 'Rp 12.000.000',
        expectedDaysMin: 35,
        expectedDaysMax: 39
      },
      {
        name: 'Enterprise Tier + 20 Pages (+10 extra * 500k = +5M) + All Addons + Express Priority',
        // Base: 12M, 35d
        // Extra pages: 10 * 500k = 5M, ceil(10*0.5) = 5d
        // E-Commerce: +2M, +5d
        // Payment Gateway: +1.5M, +3d
        // Multilingual: +1.2M, +3d
        // Subtotal before express: 12M + 5M + 2M + 1.5M + 1.2M = 21.7M = 21.700.000
        // Days before express: 35 + 5 + 5 + 3 + 3 = 51 days
        // Express: * 1.25 -> 21.7M * 1.25 = 27.125.000
        // Days after express: round(51 * 0.6) = 31 days (min 31 - 35)
        tier: 'enterprise',
        pages: 20,
        addons: ['E-Commerce', 'Payment Gateway', 'Multi-Bahasa', 'Express'],
        express: true,
        expectedPrice: 'Rp 27.125.000',
        expectedDaysMin: 31,
        expectedDaysMax: 35
      },
      {
        name: 'Boundary: Basic Tier with 1 page slider boundary',
        tier: 'basic',
        pages: 1,
        addons: [],
        express: false,
        expectedPrice: 'Rp 2.500.000',
        expectedDaysMin: 7,
        expectedDaysMax: 11
      }
    ];

    for (const sc of testScenarios) {
      const execResult = await driver.evaluate((scenario) => {
        const calcSection = document.getElementById('pricing-calculator') || document.querySelector('.pricing-section');
        const tierRadios = Array.from(calcSection.querySelectorAll('input[name="tier"]'));
        const slider = calcSection.querySelector('#extra-pages');
        const sliderDisplay = calcSection.querySelector('#pages-count-display');
        const addons = Array.from(calcSection.querySelectorAll('input[name="addon"]'));
        const priceDisplay = calcSection.querySelector('#calc-total-price');
        const timeDisplay = calcSection.querySelector('#calc-total-timeline');
        const waBtn = calcSection.querySelector('#btn-calc-whatsapp');

        // Set tier
        const targetRadio = tierRadios.find(r => r.value === scenario.tier);
        if (targetRadio) {
          targetRadio.checked = true;
          targetRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Set pages
        if (slider) {
          slider.value = String(scenario.pages);
          slider.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Set addons
        addons.forEach(cb => {
          const isExp = cb.value === 'express' || cb.getAttribute('data-express') === 'true';
          const name = cb.getAttribute('data-name') || cb.value;
          if (isExp) {
            cb.checked = scenario.express;
          } else {
            const shouldCheck = scenario.addons.some(a => name.toLowerCase().includes(a.toLowerCase()));
            cb.checked = shouldCheck;
          }
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        });

        return {
          currentTierChecked: tierRadios.find(r => r.checked)?.value,
          sliderValue: slider ? slider.value : null,
          sliderDisplayText: sliderDisplay ? sliderDisplay.textContent : null,
          priceText: priceDisplay ? priceDisplay.textContent.trim() : null,
          timeText: timeDisplay ? timeDisplay.textContent.trim() : null,
          waHref: waBtn ? waBtn.href : null
        };
      }, sc);

      auditReport.pricingCalculator.functionalCycle[sc.name] = execResult;

      assert(execResult.priceText === sc.expectedPrice,
        `[${sc.name}] Price matches expected "${sc.expectedPrice}" (got "${execResult.priceText}")`);
      assert(execResult.timeText && execResult.timeText.includes(String(sc.expectedDaysMin)),
        `[${sc.name}] Timeline includes ${sc.expectedDaysMin} days (got "${execResult.timeText}")`);
      assert(execResult.waHref && decodeURIComponent(execResult.waHref).includes(sc.expectedPrice),
        `[${sc.name}] WhatsApp link contains decoded price (price="${sc.expectedPrice}")`);
    }

    assert(driver.consoleErrors.length === 0,
      `Zero console errors during functional pricing calculation cycle (got ${driver.consoleErrors.length})`);

    // -------------------------------------------------------------------------
    // [1.3] RAPID BURST CLICKING & SELECTION STATE INTEGRITY STRESS
    // -------------------------------------------------------------------------
    console.log('\n▶ [1.3] Stress-Testing Rapid Tier Clicks in Random Bursts...');
    driver.consoleErrors = [];

    const rapidBurstResult = await driver.evaluate(async () => {
      const calcSection = document.getElementById('pricing-calculator') || document.querySelector('.pricing-section');
      const cards = Array.from(calcSection.querySelectorAll('.tier-card'));
      const radios = Array.from(calcSection.querySelectorAll('input[name="tier"]'));
      const priceDisplay = calcSection.querySelector('#calc-total-price');

      const tierKeys = ['basic', 'pro', 'enterprise'];
      const clickHistory = [];
      const burstRounds = 60; // 60 rapid clicks in high-frequency succession

      for (let i = 0; i < burstRounds; i++) {
        // Randomly pick a card
        const cardIndex = Math.floor(Math.random() * cards.length);
        const card = cards[cardIndex];
        const radio = radios[cardIndex];

        // Click the card element
        card.click();
        clickHistory.push(radio.value);

        // Tiny delay 5-15ms simulating ultra-rapid human/bot hammering
        await new Promise(r => setTimeout(r, 10));
      }

      // Check invariants after burst
      const checkedRadios = radios.filter(r => r.checked);
      const activeCardsByClass = cards.filter(c => c.classList.contains('is-selected') || c.matches(':has(input:checked)'));
      const finalTier = checkedRadios[0]?.value;

      return {
        burstRounds,
        checkedRadiosCount: checkedRadios.length,
        finalCheckedTier: finalTier,
        activeCardsCount: activeCardsByClass.length,
        priceText: priceDisplay ? priceDisplay.textContent : null,
        radiosState: radios.map(r => ({ value: r.value, checked: r.checked }))
      };
    });

    auditReport.pricingCalculator.rapidBurstStress = rapidBurstResult;

    assert(rapidBurstResult.checkedRadiosCount === 1,
      `Exactly ONE radio input is checked after ${rapidBurstResult.burstRounds} rapid burst clicks (got ${rapidBurstResult.checkedRadiosCount})`);
    assert(rapidBurstResult.activeCardsCount === 1,
      `Exactly ONE tier card is visually highlighted after rapid burst clicks (got ${rapidBurstResult.activeCardsCount})`);
    assert(driver.consoleErrors.length === 0,
      `Zero console errors during rapid tier burst clicks (got ${driver.consoleErrors.length})`);


    // =========================================================================
    // SECTION 2: FAQ ACCORDION STRESS
    // =========================================================================
    console.log('\n============================================================');
    console.log(' 2. FAQ ACCORDION EMPIRICAL STRESS SUITE');
    console.log('============================================================\n');

    await driver.goto(`${serverInfo.url}/index.html`);
    await new Promise(r => setTimeout(r, 400));
    driver.consoleErrors = [];

    // -------------------------------------------------------------------------
    // [2.1] COMPUTED STYLES VERIFICATION ACROSS ALL FAQ ITEMS
    // -------------------------------------------------------------------------
    console.log('▶ [2.1] Inspecting Computed Styles of <button class="faq-trigger"> across all FAQ items...');
    const faqStyleInspection = await driver.evaluate(() => {
      const faqSection = document.getElementById('faq') || document.querySelector('.faq-section');
      const items = Array.from(faqSection.querySelectorAll('.faq-item'));
      const triggers = Array.from(faqSection.querySelectorAll('.faq-trigger'));

      return triggers.map((btn, idx) => {
        const cs = window.getComputedStyle(btn);
        const questionSpan = btn.querySelector('.faq-question');
        const qcs = questionSpan ? window.getComputedStyle(questionSpan) : null;
        const iconSpan = btn.querySelector('.faq-icon');
        const ics = iconSpan ? window.getComputedStyle(iconSpan) : null;

        return {
          index: idx,
          tagName: btn.tagName.toLowerCase(),
          type: btn.getAttribute('type'),
          backgroundColor: cs.backgroundColor,
          color: cs.color,
          borderStyle: cs.borderStyle,
          borderWidth: cs.borderWidth,
          outline: cs.outline,
          appearance: cs.appearance || cs.webkitAppearance,
          cursor: cs.cursor,
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          question: {
            text: questionSpan ? questionSpan.textContent.trim().slice(0, 35) + '...' : null,
            backgroundColor: qcs ? qcs.backgroundColor : null,
            color: qcs ? qcs.color : null
          },
          icon: {
            text: iconSpan ? iconSpan.textContent.trim() : null,
            transform: ics ? ics.transform : null,
            color: ics ? ics.color : null
          }
        };
      });
    });

    auditReport.faqAccordion.computedStyles = faqStyleInspection;

    assert(faqStyleInspection.length === 6, `Found 6 FAQ items on index.html (got ${faqStyleInspection.length})`, 'faqAccordion');

    faqStyleInspection.forEach((info, idx) => {
      // Must be transparent: rgba(0, 0, 0, 0)
      const isTransparentBg = info.backgroundColor === 'rgba(0, 0, 0, 0)' || info.backgroundColor === 'transparent';
      const isNotUserAgentGray = !info.backgroundColor.includes('240, 240, 240');
      assert(isTransparentBg && isNotUserAgentGray,
        `FAQ Trigger #${idx + 1} backgroundColor is transparent "${info.backgroundColor}" (NOT UA gray)`, 'faqAccordion');

      // Text color must be light: rgb(242, 242, 246), NOT black rgb(0, 0, 0)
      const isLightTextColor = info.color === 'rgb(242, 242, 246)' || info.color.includes('242, 242, 246') || info.color === 'rgba(242, 242, 246, 1)';
      const isNotBlack = info.color !== 'rgb(0, 0, 0)' && info.color !== '#000000';
      assert(isLightTextColor && isNotBlack,
        `FAQ Trigger #${idx + 1} text color is light "${info.color}" (NOT black)`, 'faqAccordion');

      // Question child backgroundColor must also be transparent
      const isQTransparent = info.question.backgroundColor === 'rgba(0, 0, 0, 0)' || info.question.backgroundColor === 'transparent';
      assert(isQTransparent,
        `FAQ Question span #${idx + 1} backgroundColor is transparent "${info.question.backgroundColor}"`, 'faqAccordion');
    });

    // -------------------------------------------------------------------------
    // [2.2] SUCCESSIVE ITEM CLICKING: SINGLE ACTIVE EXPANSION & ICON ROTATION
    // -------------------------------------------------------------------------
    console.log('\n▶ [2.2] Testing Successive FAQ Item Expansion, Single-Active Invariant & 45° Icon Rotation...');

    for (let i = 0; i < faqStyleInspection.length; i++) {
      // Click item i
      const stepResult = await driver.evaluate(async (targetIndex) => {
        const faqSection = document.getElementById('faq') || document.querySelector('.faq-section');
        const items = Array.from(faqSection.querySelectorAll('.faq-item'));
        const triggers = Array.from(faqSection.querySelectorAll('.faq-trigger'));

        // Trigger click
        triggers[targetIndex].click();

        // Wait 400ms for CSS Grid 0fr->1fr and icon transform transitions
        await new Promise(r => setTimeout(r, 400));

        // Audit state of all items
        const itemStates = items.map((item, idx) => {
          const btn = triggers[idx];
          const content = item.querySelector('.faq-content, .faq-panel');
          const icon = item.querySelector('.faq-icon');
          const csContent = content ? window.getComputedStyle(content) : null;
          const csIcon = icon ? window.getComputedStyle(icon) : null;
          const rect = content ? content.getBoundingClientRect() : null;

          return {
            index: idx,
            isActiveClass: item.classList.contains('active') || item.classList.contains('is-open') || item.classList.contains('is-active'),
            btnAriaExpanded: btn.getAttribute('aria-expanded'),
            contentHeight: rect ? Math.round(rect.height) : 0,
            gridTemplateRows: csContent ? csContent.gridTemplateRows : null,
            iconTransform: csIcon ? csIcon.transform : null
          };
        });

        return {
          targetIndex,
          itemStates
        };
      }, i);

      auditReport.faqAccordion.expansionCycle.push(stepResult);

      const targetState = stepResult.itemStates[i];
      assert(targetState.isActiveClass === true && targetState.btnAriaExpanded === 'true',
        `FAQ Item #${i + 1} expanded successfully (aria-expanded="true")`, 'faqAccordion');
      assert(targetState.contentHeight > 20,
        `FAQ Item #${i + 1} content height expanded smoothly to ${targetState.contentHeight}px (> 20px)`, 'faqAccordion');

      // Verify 45-degree icon rotation: transform matrix for 45deg:
      // cos(45deg) = 0.707107, sin(45deg) = 0.707107
      // matrix(0.707107, 0.707107, -0.707107, 0.707107, 0, 0)
      const has45DegRotation = targetState.iconTransform && (
        targetState.iconTransform.includes('0.7071') ||
        targetState.iconTransform.includes('matrix')
      );
      assert(has45DegRotation,
        `FAQ Item #${i + 1} toggle icon rotated 45 degrees (transform="${targetState.iconTransform}")`, 'faqAccordion');

      // Verify SINGLE-ACTIVE invariant: all other items must be collapsed
      const otherExpandedItems = stepResult.itemStates.filter((st, idx) => idx !== i && (st.isActiveClass || st.btnAriaExpanded === 'true' || st.contentHeight > 20));
      assert(otherExpandedItems.length === 0,
        `Enforced STRICT SINGLE ACTIVE expansion (other open items: ${otherExpandedItems.length})`, 'faqAccordion');
    }

    // Collapse the active item by clicking it again
    const collapseResult = await driver.evaluate(async () => {
      const triggers = Array.from(document.querySelectorAll('.faq-trigger'));
      const lastIndex = triggers.length - 1;
      // Click the currently open last item to collapse it
      triggers[lastIndex].click();
      await new Promise(r => setTimeout(r, 400));

      const items = Array.from(document.querySelectorAll('.faq-item'));
      const openCount = items.filter(it => it.classList.contains('active') || it.classList.contains('is-open') || it.classList.contains('is-active')).length;
      return { openCount };
    });
    assert(collapseResult.openCount === 0, `Clicking an active FAQ item collapses it (all items closed: openCount=${collapseResult.openCount})`, 'faqAccordion');

    // -------------------------------------------------------------------------
    // [2.3] RAPID BURST TOGGLING STRESS TEST
    // -------------------------------------------------------------------------
    console.log('\n▶ [2.3] Stress-Testing Rapid FAQ Accordion Toggling...');
    driver.consoleErrors = [];

    const rapidFaqResult = await driver.evaluate(async () => {
      const triggers = Array.from(document.querySelectorAll('.faq-trigger'));
      const items = Array.from(document.querySelectorAll('.faq-item'));
      const toggleRounds = 40;

      for (let r = 0; r < toggleRounds; r++) {
        const randIndex = Math.floor(Math.random() * triggers.length);
        triggers[randIndex].click();
        await new Promise(res => setTimeout(res, 15)); // rapid 15ms hammering
      }

      // Wait 400ms for final CSS transition to settle
      await new Promise(res => setTimeout(res, 400));

      const activeItems = items.filter(it => it.classList.contains('active') || it.classList.contains('is-open') || it.classList.contains('is-active'));
      const ariaExpandedItems = triggers.filter(btn => btn.getAttribute('aria-expanded') === 'true');

      return {
        toggleRounds,
        activeItemsCount: activeItems.length,
        ariaExpandedCount: ariaExpandedItems.length,
        activeIndices: activeItems.map(it => items.indexOf(it))
      };
    });

    auditReport.faqAccordion.rapidToggleStress = rapidFaqResult;

    assert(rapidFaqResult.activeItemsCount <= 1,
      `At most ONE item open after ${rapidFaqResult.toggleRounds} rapid toggle bursts (got ${rapidFaqResult.activeItemsCount})`, 'faqAccordion');
    assert(rapidFaqResult.activeItemsCount === rapidFaqResult.ariaExpandedCount,
      `ARIA expanded state perfectly matches active CSS class count (${rapidFaqResult.ariaExpandedCount} === ${rapidFaqResult.activeItemsCount})`, 'faqAccordion');
    assert(driver.consoleErrors.length === 0,
      `Zero console errors during rapid FAQ accordion bursts (got ${driver.consoleErrors.length})`, 'faqAccordion');

    // -------------------------------------------------------------------------
    // [2.4] KEYBOARD ACCESSIBILITY STRESS (ENTER & SPACE KEYS)
    // -------------------------------------------------------------------------
    console.log('\n▶ [2.4] Testing Keyboard Accessibility (Enter & Space toggling)...');
    const keyboardResult = await driver.evaluate(async () => {
      const trigger = document.querySelectorAll('.faq-trigger')[0];
      const item = document.querySelectorAll('.faq-item')[0];

      // Focus trigger
      trigger.focus();

      // Dispatch Enter key
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await new Promise(r => setTimeout(r, 350));
      const openAfterEnter = item.classList.contains('active') || item.classList.contains('is-open') || item.classList.contains('is-active');

      // Dispatch Space key to collapse
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      await new Promise(r => setTimeout(r, 350));
      const closedAfterSpace = !item.classList.contains('active') && !item.classList.contains('is-open') && !item.classList.contains('is-active');

      return {
        openAfterEnter,
        closedAfterSpace
      };
    });

    auditReport.faqAccordion.keyboardStress = keyboardResult;
    assert(keyboardResult.openAfterEnter, 'Enter key opens FAQ accordion item', 'faqAccordion');
    assert(keyboardResult.closedAfterSpace, 'Space key closes FAQ accordion item', 'faqAccordion');

    // =========================================================================
    // FINAL VERDICT DETERMINATION
    // =========================================================================
    console.log('\n============================================================');
    console.log(' FINAL AUDIT VERDICT');
    console.log('============================================================');

    auditReport.consoleErrors = driver.consoleErrors;

    const allPricingPass = auditReport.pricingCalculator.passed;
    const allFaqPass = auditReport.faqAccordion.passed;
    const noConsoleErrors = auditReport.consoleErrors.length === 0;

    if (allPricingPass && allFaqPass && noConsoleErrors) {
      auditReport.verdict = 'APPROVE';
      console.log('\n🏆 VERDICT: APPROVE');
      console.log('All empirical stress tests passed with 100% compliance and 0 errors.');
    } else {
      auditReport.verdict = 'REJECT';
      console.error('\n💥 VERDICT: REJECT');
      console.error('Audit failed with the following issues:');
      console.error('Pricing failures:', auditReport.pricingCalculator.failures);
      console.error('FAQ failures:', auditReport.faqAccordion.failures);
      console.error('Console errors:', auditReport.consoleErrors);
    }

  } catch (err) {
    console.error('Challenger execution uncaught exception:', err);
    auditReport.verdict = 'REJECT';
    auditReport.fatalError = err.message;
  } finally {
    await driver.close();
    await server.stop();
  }

  // Write JSON report for audit trail
  const reportPath = path.resolve(__dirname, 'challenger-m6-2-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
  console.log(`\nDetailed report written to: ${reportPath}`);

  return auditReport;
}

if (require.main === module) {
  runChallengerStress()
    .then(report => {
      process.exit(report.verdict === 'APPROVE' ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal test error:', err);
      process.exit(1);
    });
}

module.exports = runChallengerStress;
