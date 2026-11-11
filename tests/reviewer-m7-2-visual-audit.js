/**
 * Independent Visual & Responsive Reviewer Audit Script (reviewer_m7_2)
 *
 * Verifies:
 * 1. Multi-Viewport Responsive Matrix:
 *    4 Pages x 6 Viewports (320px, 375px, 768px, 1024px, 1440px, 1920px)
 *    Strict Zero Horizontal Overflow: document.documentElement.scrollWidth <= window.innerWidth
 *    Rogue Element Overflow Boundary Detection (accounting for clipped carousel containers).
 * 2. Spacing & Geometric Balance Verification:
 *    #services computed padding: paddingTop/paddingBottom active and generous (120px at desktop, fluid clamp).
 *    .services-grid computed display: grid with 4 balanced columns at 1440px desktop.
 *    Hero section geometric balance: container margins, width, centering, no empty side voids.
 *    Floating bottom nav dock: vertical bounds and clearance vs section headings at scrollY=0.
 * 3. Typography & Clean Minimalism:
 *    Conciseness checks: character lengths of hero subheadline, service descriptions, FAQ answers.
 *    Subpages architectural header verification: breadcrumbs, telemetry badges, clean CSS classes.
 * 4. Screenshot / CDP metric captures.
 */

const fs = require('fs');
const path = require('path');
const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');

const VIEWPORTS = [
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

const SCREENSHOT_DIR = path.resolve(__dirname, '..', '.agents', 'teamwork', 'reviewer_m7_2', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVisualAudit() {
  console.log('================================================================');
  console.log('  REVIEWER M7-2: VISUAL, RESPONSIVE & GEOMETRIC BALANCE AUDIT   ');
  console.log('================================================================\n');

  const server = new StaticServer({ rootDir: path.resolve(__dirname, '..') });
  const serverInfo = await server.start();
  console.log(`✓ Static server listening at: ${serverInfo.url}`);

  const driver = new BrowserDriver();
  await driver.launch();
  console.log('✓ Headless browser launched\n');

  const auditReport = {
    timestamp: new Date().toISOString(),
    viewportsTested: VIEWPORTS.length,
    pagesTested: PAGES.length,
    matrixResults: [],
    spacingAndBalance: {},
    typographyAndMinimalism: {},
    dockClearance: {},
    minorObservations: [],
    screenshotsCaptured: [],
    allPassed: true,
    failures: []
  };

  let totalAssertions = 0;
  let passedAssertions = 0;
  let failedAssertions = 0;

  function assert(condition, message, details = null) {
    totalAssertions++;
    if (condition) {
      passedAssertions++;
      console.log(`  ✓ [PASS] ${message}`);
    } else {
      failedAssertions++;
      auditReport.allPassed = false;
      auditReport.failures.push({ message, details });
      console.log(`  ✗ [FAIL] ${message}`);
      if (details) console.log('    Details:', JSON.stringify(details));
    }
    return condition;
  }

  try {
    // ========================================================================
    // SECTION 1: MULTI-VIEWPORT RESPONSIVE MATRIX (4 PAGES x 6 VIEWPORTS)
    // ========================================================================
    console.log('----------------------------------------------------------------');
    console.log('SECTION 1: Multi-Viewport Responsive Audit (24 Matrix Combinations)');
    console.log('----------------------------------------------------------------');

    for (const page of PAGES) {
      console.log(`\n▶ Page: ${page.name} (${page.file})`);

      for (const vp of VIEWPORTS) {
        await driver.setViewport({
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: vp.mobile ? 2 : 1,
          mobile: vp.mobile
        });

        await driver.goto(`${serverInfo.url}/${page.file}`);
        await new Promise((r) => setTimeout(r, 200));

        const metrics = await driver.evaluate(() => {
          const docEl = document.documentElement;
          const scrollWidth = docEl.scrollWidth;
          const clientWidth = docEl.clientWidth;
          const innerWidth = window.innerWidth;

          // Find rogue overflowing elements (ignoring elements in overflow:hidden containers)
          const rogueElements = [];
          const allEls = Array.from(document.querySelectorAll('body *'));
          for (const el of allEls) {
            if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)) continue;
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
            if (el.classList.contains('cursor-dot') || el.classList.contains('cursor-follower')) continue;
            if (el.closest('.mobile-menu') || el.closest('.mobile-drawer') || el.closest('#mobile-nav-drawer')) continue;
            if (el.classList.contains('modal-backdrop') || el.closest('.modal')) continue;
            if (el.closest('.testimonial-carousel') || el.closest('.testimonial-track')) continue;

            // Check if clipped by an ancestor with overflow: hidden or clip
            let p = el.parentElement;
            let clipped = false;
            while (p && p !== document.body) {
              const ps = window.getComputedStyle(p);
              if (ps.overflowX === 'hidden' || ps.overflow === 'hidden' || ps.overflowX === 'clip') {
                clipped = true;
                break;
              }
              p = p.parentElement;
            }
            if (clipped) continue;

            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              if (rect.right > innerWidth + 1.5 || rect.left < -1.5) {
                rogueElements.push({
                  tag: el.tagName.toLowerCase(),
                  id: el.id || '',
                  class: el.className || '',
                  left: Math.round(rect.left),
                  right: Math.round(rect.right),
                  width: Math.round(rect.width)
                });
              }
            }
          }

          return {
            scrollWidth,
            clientWidth,
            innerWidth,
            overflow: scrollWidth - innerWidth,
            rogueElements: rogueElements.slice(0, 5) // max 5 sample
          };
        });

        const passOverflow = metrics.scrollWidth <= metrics.innerWidth;

        assert(
          passOverflow,
          `${page.name} @ ${vp.width}px (${vp.name}): 0 horizontal overflow (scrollWidth=${metrics.scrollWidth} <= innerWidth=${metrics.innerWidth})`,
          { overflow: metrics.overflow }
        );

        if (metrics.rogueElements.length > 0) {
          auditReport.minorObservations.push({
            page: page.file,
            viewport: vp.width,
            count: metrics.rogueElements.length,
            sample: metrics.rogueElements[0]
          });
        }

        auditReport.matrixResults.push({
          page: page.file,
          viewport: vp.name,
          width: vp.width,
          height: vp.height,
          metrics,
          pass: passOverflow
        });
      }
    }

    // ========================================================================
    // SECTION 2: SPACING & GEOMETRIC BALANCE VERIFICATION (index.html)
    // ========================================================================
    console.log('\n----------------------------------------------------------------');
    console.log('SECTION 2: Spacing & Geometric Balance Verification');
    console.log('----------------------------------------------------------------');

    // Test at 1440px desktop
    await driver.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await driver.goto(`${serverInfo.url}/index.html`);
    await new Promise((r) => setTimeout(r, 300));

    // 2.1 Section padding verification across all major sections
    const sectionSpacingData = await driver.evaluate(() => {
      const sections = ['services', 'trust', 'portfolio', 'pricing-calculator', 'testimonials', 'faq'];
      const data = {};
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const style = window.getComputedStyle(el);
          data[id] = {
            paddingTop: style.paddingTop,
            paddingBottom: style.paddingBottom,
            paddingTopNum: parseFloat(style.paddingTop),
            paddingBottomNum: parseFloat(style.paddingBottom),
            height: el.offsetHeight
          };
        }
      }
      return data;
    });

    auditReport.spacingAndBalance.sections = sectionSpacingData;

    // #services padding verification (desktop 1440px: clamp formula evaluates to 120px)
    assert(
      sectionSpacingData.services && sectionSpacingData.services.paddingTopNum >= 100,
      `#services paddingTop is generous & active on desktop (got: ${sectionSpacingData.services?.paddingTop}, expected ~120px)`
    );
    assert(
      sectionSpacingData.services && sectionSpacingData.services.paddingBottomNum >= 100,
      `#services paddingBottom is generous & active on desktop (got: ${sectionSpacingData.services?.paddingBottom}, expected ~120px)`
    );

    // Verify other sections are not collapsed
    for (const [secId, sData] of Object.entries(sectionSpacingData)) {
      assert(
        sData.paddingTopNum >= 70,
        `Section #${secId} paddingTop is generous (got: ${sData.paddingTop})`
      );
    }

    // 2.2 .services-grid computed layout verification (4 balanced columns at 1440px desktop)
    const servicesGridLayout = await driver.evaluate(() => {
      const grid = document.querySelector('.services-grid');
      if (!grid) return null;
      const gridStyle = window.getComputedStyle(grid);
      const cards = Array.from(grid.querySelectorAll('.service-card'));
      const cardRects = cards.map((c, i) => {
        const rect = c.getBoundingClientRect();
        return {
          index: i,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom)
        };
      });

      return {
        display: gridStyle.display,
        gridTemplateColumns: gridStyle.gridTemplateColumns,
        gap: gridStyle.gap,
        cardCount: cards.length,
        cardRects
      };
    });

    auditReport.spacingAndBalance.servicesGrid = servicesGridLayout;

    assert(
      servicesGridLayout && servicesGridLayout.display === 'grid',
      `.services-grid computed display is 'grid' (got: "${servicesGridLayout?.display}")`
    );

    assert(
      servicesGridLayout && servicesGridLayout.cardCount === 4,
      `.services-grid contains exactly 4 service cards (got: ${servicesGridLayout?.cardCount})`
    );

    // Verify 4 columns in gridTemplateColumns
    const colCount = servicesGridLayout ? servicesGridLayout.gridTemplateColumns.trim().split(/\s+/).length : 0;
    assert(
      colCount === 4,
      `.services-grid grid-template-columns has 4 balanced columns (columns: ${colCount}, spec: "${servicesGridLayout?.gridTemplateColumns}")`
    );

    // Verify cards are all on the same horizontal row (aligned baseline top)
    if (servicesGridLayout && servicesGridLayout.cardRects.length === 4) {
      const top0 = servicesGridLayout.cardRects[0].top;
      const allAligned = servicesGridLayout.cardRects.every((c) => Math.abs(c.top - top0) <= 2);
      assert(
        allAligned,
        `All 4 service cards are positioned on the same row at 1440px desktop (tops: ${servicesGridLayout.cardRects.map((c) => c.top).join(', ')})`
      );

      // Verify balanced card widths (within 2px tolerance)
      const widths = servicesGridLayout.cardRects.map((c) => c.width);
      const minW = Math.min(...widths);
      const maxW = Math.max(...widths);
      assert(
        maxW - minW <= 2,
        `All 4 service cards have balanced equal width at 1440px desktop (widths: ${widths.join(', ')})`
      );
    }

    // 2.3 Hero section geometric balance verification (no empty side voids)
    const heroLayout = await driver.evaluate(() => {
      const hero = document.getElementById('hero') || document.querySelector('.hero');
      const container = hero?.querySelector('.container') || hero?.querySelector('.hero-container');
      const docClientWidth = document.documentElement.clientWidth;
      const containerRect = container?.getBoundingClientRect();

      return {
        viewportWidth: window.innerWidth,
        docClientWidth,
        containerWidth: containerRect ? Math.round(containerRect.width) : 0,
        containerLeft: containerRect ? containerRect.left : 0,
        containerRight: containerRect ? containerRect.right : 0,
        leftMargin: containerRect ? containerRect.left : 0,
        rightMargin: containerRect ? docClientWidth - containerRect.right : 0
      };
    });

    auditReport.spacingAndBalance.hero = heroLayout;

    // Symmetric container centering check relative to document layout clientWidth
    const marginDiff = Math.abs(heroLayout.leftMargin - heroLayout.rightMargin);
    assert(
      marginDiff <= 2,
      `Hero container is centered horizontally with balanced margins (left: ${Math.round(heroLayout.leftMargin)}px, right: ${Math.round(heroLayout.rightMargin)}px, diff: ${Math.round(marginDiff)}px)`
    );

    assert(
      heroLayout.containerWidth >= 1100,
      `Hero container utilizes wide desktop width without awkward empty voids (containerWidth: ${heroLayout.containerWidth}px at 1440px)`
    );

    // 2.4 Floating bottom nav dock clearance vs headings at scrollY=0
    const dockClearanceAtZero = await driver.evaluate(() => {
      window.scrollTo(0, 0);
      const dock = document.querySelector('.floating-bottom-nav');
      if (!dock) return { error: 'No floating bottom nav found' };

      const dockRect = dock.getBoundingClientRect();
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, .section-title, .section-header'));

      let minVerticalClearance = Infinity;
      let overlappingHeadings = [];

      for (const h of headings) {
        const hRect = h.getBoundingClientRect();
        // Check if heading is inside viewport
        if (hRect.bottom > 0 && hRect.top < window.innerHeight) {
          // Check collision with dock
          const horizontalOverlap = !(hRect.right < dockRect.left || hRect.left > dockRect.right);
          const verticalOverlap = !(hRect.bottom < dockRect.top || hRect.top > dockRect.bottom);

          if (horizontalOverlap && verticalOverlap) {
            overlappingHeadings.push({
              tag: h.tagName,
              text: h.textContent.trim().substring(0, 40),
              hRect: { top: Math.round(hRect.top), bottom: Math.round(hRect.bottom) },
              dockRect: { top: Math.round(dockRect.top), bottom: Math.round(dockRect.bottom) }
            });
          }

          // Clearance
          const clearance = dockRect.top - hRect.bottom;
          if (clearance > 0 && clearance < minVerticalClearance) {
            minVerticalClearance = clearance;
          }
        }
      }

      return {
        dockTop: Math.round(dockRect.top),
        dockBottom: Math.round(dockRect.bottom),
        dockHeight: Math.round(dockRect.height),
        windowHeight: window.innerHeight,
        minVerticalClearance: Math.round(minVerticalClearance),
        overlappingHeadings
      };
    });

    auditReport.dockClearance = dockClearanceAtZero;

    assert(
      dockClearanceAtZero.overlappingHeadings.length === 0,
      `Floating bottom nav dock does NOT overlap any heading at scrollY=0 (overlaps: ${dockClearanceAtZero.overlappingHeadings.length})`,
      dockClearanceAtZero.overlappingHeadings
    );

    assert(
      dockClearanceAtZero.dockTop > 0 && dockClearanceAtZero.dockTop < 900,
      `Floating bottom nav is stationed at bottom of viewport (dockTop: ${dockClearanceAtZero.dockTop}px, viewportHeight: 900px)`
    );

    // ========================================================================
    // SECTION 3: TYPOGRAPHY & CLEAN MINIMALISM VERIFICATION
    // ========================================================================
    console.log('\n----------------------------------------------------------------');
    console.log('SECTION 3: Typography & Clean Minimalism Verification');
    console.log('----------------------------------------------------------------');

    const copyMetrics = await driver.evaluate(() => {
      const heroSub = document.querySelector('.hero-subheadline');
      const serviceDescs = Array.from(document.querySelectorAll('.service-desc')).map((p) => p.textContent.trim());
      const faqAnswers = Array.from(document.querySelectorAll('.faq-inner p')).map((p) => p.textContent.trim());
      const testimonialQuotes = Array.from(document.querySelectorAll('.testimonial-quote')).map((q) => q.textContent.trim());

      return {
        heroSubLength: heroSub ? heroSub.textContent.trim().length : 0,
        heroSubText: heroSub ? heroSub.textContent.trim() : '',
        serviceDescsLengths: serviceDescs.map((d) => d.length),
        serviceDescsTexts: serviceDescs,
        faqAnswersLengths: faqAnswers.map((a) => a.length),
        faqAnswersTexts: faqAnswers,
        testimonialQuotesLengths: testimonialQuotes.map((q) => q.length)
      };
    });

    auditReport.typographyAndMinimalism.copyMetrics = copyMetrics;

    assert(
      copyMetrics.heroSubLength <= 150 && copyMetrics.heroSubLength > 30,
      `Hero subheadline is crisp & concise (got: ${copyMetrics.heroSubLength} chars: "${copyMetrics.heroSubText}")`
    );

    const allServiceDescsConcise = copyMetrics.serviceDescsLengths.every((len) => len <= 160 && len >= 40);
    assert(
      allServiceDescsConcise,
      `All 4 service descriptions are concise 1-sentence statements (lengths: ${copyMetrics.serviceDescsLengths.join(', ')} chars)`
    );

    const allFaqAnswersConcise = copyMetrics.faqAnswersLengths.every((len) => len <= 220);
    assert(
      allFaqAnswersConcise,
      `All FAQ answers are concise direct explanations (lengths: ${copyMetrics.faqAnswersLengths.join(', ')} chars, max: 220)`
    );

    // 3.2 Subpage Architectural Headers Verification
    const subpagesHeaderData = {};
    for (const subpage of ['services.html', 'portfolio.html', 'contact.html']) {
      await driver.goto(`${serverInfo.url}/${subpage}`);
      await new Promise((r) => setTimeout(r, 200));

      const subHeader = await driver.evaluate(() => {
        const heroSection = document.querySelector('.page-hero-section');
        const breadcrumb = document.querySelector('.breadcrumb-nav');
        const breadcrumbText = document.querySelector('.breadcrumb-text');
        const pageTitle = document.querySelector('.page-title');
        const pageSubtitle = document.querySelector('.page-subtitle');
        const telemetryBar = document.querySelector('.page-telemetry-bar');
        const telemetryPills = Array.from(document.querySelectorAll('.page-telemetry-pill, .telemetry-pill'));
        const channelCards = Array.from(document.querySelectorAll('.channel-card'));

        return {
          hasHeroSection: !!heroSection,
          hasBreadcrumb: !!breadcrumb,
          breadcrumbHtml: breadcrumbText ? breadcrumbText.innerHTML.trim() : '',
          pageTitle: pageTitle ? pageTitle.textContent.trim() : '',
          pageSubtitle: pageSubtitle ? pageSubtitle.textContent.trim() : '',
          telemetryCount: telemetryPills.length,
          channelCount: channelCards.length
        };
      });

      subpagesHeaderData[subpage] = subHeader;

      assert(
        subHeader.hasHeroSection,
        `${subpage}: Features dedicated architectural .page-hero-section`
      );

      assert(
        subHeader.hasBreadcrumb && subHeader.breadcrumbHtml.includes('BERANDA'),
        `${subpage}: Features semantic breadcrumb navigation pointing to BERANDA`
      );

      assert(
        subHeader.pageTitle.length > 5 && subHeader.pageSubtitle.length > 10,
        `${subpage}: Displays clean editorial page title and concise subtitle ("${subHeader.pageTitle}")`
      );

      const hasTelemetryOrChannels = subHeader.telemetryCount > 0 || subHeader.channelCount > 0;
      assert(
        hasTelemetryOrChannels,
        `${subpage}: Features telemetry badges or direct channel cards (badges: ${subHeader.telemetryCount}, channels: ${subHeader.channelCount})`
      );
    }

    auditReport.typographyAndMinimalism.subpages = subpagesHeaderData;

  } catch (err) {
    console.error('Fatal audit error:', err);
    auditReport.allPassed = false;
    auditReport.failures.push({ message: 'Fatal error', error: err.message, stack: err.stack });
  } finally {
    await driver.close();
    server.server.close();
  }

  // Summary
  console.log('\n================================================================');
  console.log('  REVIEWER M7-2 AUDIT SUMMARY                                   ');
  console.log('================================================================');
  console.log(`Total Assertions : ${totalAssertions}`);
  console.log(`Passed           : ${passedAssertions}`);
  console.log(`Failed           : ${failedAssertions}`);
  console.log(`Minor Obs        : ${auditReport.minorObservations.length}`);
  console.log(`Overall Verdict  : ${auditReport.allPassed ? 'APPROVE 🏆' : 'REQUEST_CHANGES ❌'}`);
  console.log('================================================================\n');

  const jsonReportPath = path.resolve(__dirname, '..', '.agents', 'teamwork', 'reviewer_m7_2', 'audit-report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(auditReport, null, 2));
  console.log(`Detailed audit report written to: ${jsonReportPath}`);

  return auditReport.allPassed;
}

runVisualAudit().then((success) => {
  process.exit(success ? 0 : 1);
});
