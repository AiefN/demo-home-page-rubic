# Milestone 7 — UI/UX & CSS Architecture Exploration Report

**Agent**: `explorer_m7_3` (UI/UX & CSS Architecture Explorer)  
**Roles**: explorer, design_analyst, css_architect  
**Date**: 2026-11-11T06:38:00Z  
**Verdict**: **READY FOR IMPLEMENTATION**  
**Working Directory**: `c:\pkl\PKL`  
**State Folder**: `c:\pkl\PKL\.agents\teamwork\explorer_m7_3\`  

---

## 1. Observation

### 1.1 Direct Baseline Verification
- **Zero-Dependency E2E Test Suite (`node tests/run-e2e.js`)**:
  * Executed on headless Chrome via local HTTP static server.
  * Verdict: **60 Suites, 204/204 Tests Passed (100% Pass, 0 Failures, 0 Console Errors, Duration: 53.66s)**.
  * Confirmed that all baseline functionality (HTTP 200, Vanilla stack, custom cursor, 3D tilt, stats observer, pricing calculator, carousel, FAQ, modals, and validation) is fully operational.
- **Empirical Adversarial Stress Suite (`node tests/adversarial-m5-verification.js`)**:
  * Verdict: **APPROVE (6/6 Systems: customCursor, cardTilt, statsCounters, pricingEstimator, testimonialCarousel, faqAccordion)**.

### 1.2 Inspection of Existing CSS Architecture
Direct code audit of `css/style.css` (2275 lines), `css/responsive.css` (585 lines), and `css/animations.css` (262 lines) revealed specific structural observations:

1. **The Section Spacing Defect (Unstyled `.section-padding`)**:
   - In `index.html`, every major section uses the class pattern `<section class="[name]-section section-padding" id="[id]">` (lines 235, 341, 420, 581, 719, 818).
   - In `css/style.css` line 311, only the generic `.section` selector was defined with padding:
     ```css
     .section {
       padding-top: var(--section-spacing);
       padding-bottom: var(--section-spacing);
       position: relative;
     }
     ```
   - Neither `.section-padding` nor `.services-section`, `.trust-section`, `.portfolio-section`, `.pricing-section`, etc. had padding declared in `style.css`.
   - **CDP Computed Style Measurement**:
     Running Chrome headless evaluation (`window.getComputedStyle(document.getElementById('services'))`) returned:
     * `#services`: `paddingTop: '0px'`, `paddingBottom: '0px'`
     * `#stats`: `paddingTop: '0px'`, `paddingBottom: '0px'`
     * `#portfolio`: `paddingTop: '0px'`, `paddingBottom: '0px'`
     * `#pricing-calculator`: `paddingTop: '0px'`, `paddingBottom: '0px'`
     * `#testimonials`: `paddingTop: '0px'`, `paddingBottom: '0px'`
     * `#faq`: `paddingTop: '0px'`, `paddingBottom: '0px'`
   - **Result**: Sections were physically slammed against each other with 0px vertical buffer, directly violating the Room & Pillar editorial whitespace ethos.

2. **The Services Grid Display Defect (`display: block` Fallback)**:
   - In `css/responsive.css`, `.services-grid` and `.capabilities-grid` were assigned `grid-template-columns` across media queries (line 23: `repeat(4, 1fr)`, line 51: `repeat(2, 1fr)`, line 94: `repeat(2, 1fr)`).
   - However, in `css/style.css`, `.services-grid` and `.capabilities-grid` were **never** assigned `display: grid;`.
   - **CDP Computed Style Measurement**:
     ```javascript
     const el = document.querySelector('.services-grid');
     window.getComputedStyle(el).display; // Returns: 'block'
     ```
   - **Result**: In the browser, the CSS Grid column template was ignored because the container was a standard block. On wide desktop, all 4 service cards stretched to 100% width and stacked vertically like giant slabs rather than a crisp 4-column architectural row.

3. **Subpage Header Disparity & Inline Styling Clutter**:
   - In `services.html` (lines 136-175), `portfolio.html` (lines 136-169), and `contact.html` (lines 136-174), subpage heroes rely on hardcoded inline styles:
     * `style="padding-top: 80px; padding-bottom: 40px;"`
     * `style="max-width: 960px;"`
     * `style="font-size: 1.25rem; line-height: 1.7; color: var(--text-secondary); margin-bottom: 32px;"`
     * `style="display: flex; gap: 20px; flex-wrap: wrap;"`
     * `style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;"` (in `contact.html`)
   - **Result**: Maintenance fragmentation, inconsistent mobile breakpoint behavior, and lack of a unified Room & Pillar design language across subpages.

4. **Milestone 6 Defensive Fix Status**:
   - Desktop 2-column hero balance: `.hero-container` grid `1.15fr 0.85fr` at `>= 1024px` intact. Subpixel centering diff: `0px` (`leftGap: 312.5px`, `rightGap: 312.5px`).
   - Modal overlay concealment: 3-layer defensive concealment (`display: none !important; opacity: 0; visibility: hidden; pointer-events: none;`) on `.modal-overlay`, `#case-study-modal`, and `#service-modal` verified active.
   - Floating bottom nav clearance: Hero has `min-height: 100vh; min-height: 100dvh;`. Dock sits in hero lower boundary at scrollY=0. Dock scroll hysteresis (`.nav-dock--hidden` on fast scroll-down past 400px) verified active.
   - Pricing calculator 3-column grid: `.tier-selector` has `grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;`. Desktop card width verified at 217px each.
   - FAQ transparent trigger styling: `.faq-trigger, button.faq-header, .accordion-header` has `background: transparent; border: none;` verified.

---

## 2. Logic Chain

1. **User Mandate & Aesthetic Alignment**:
   - The user requested: *"aku mau kamu membuat perubahan yang cukup besar pertama aku mau kamu jadikan web ini lebih simpel dan clean lalu tidak terlalu banyak memakai kata2 itu yang kamu buat memakai terlalu banyak tulisan /learn"*.
   - A minimalist, clean design requires two synchronized dimensions:
     a. **Content**: Reducing multi-sentence marketing rambling to 1 crisp, punchy sentence per section/card (handled by Worker M7.2 in collaboration with text analysis).
     b. **Visual Architecture**: Providing generous whitespace ("breathing room"), razor-sharp typography hierarchy, dark luxury obsidian surfaces, slate hairline dividers, and deliberate card padding.

2. **Resolving the Zero-Padding Defect**:
   - By creating a consolidated selector list for all section elements:
     ```css
     .section,
     .section-padding,
     .services-section,
     .trust-section,
     .portfolio-section,
     .pricing-section,
     .testimonials-section,
     .faq-section {
       padding-top: var(--section-spacing);
       padding-bottom: var(--section-spacing);
       position: relative;
       width: 100%;
       box-sizing: border-box;
     }
     ```
   - And establishing a fluid section spacing token:
     * Ultra-wide (>= 1440px): `--section-spacing: 120px;`
     * Laptop (1024px - 1439px): `--section-spacing: 100px;`
     * Tablet (768px - 1023px): `--section-spacing: 80px;`
     * Mobile (<= 767px): `--section-spacing: 60px;`
     * Small Mobile (<= 380px): `--section-spacing: 48px;`
   - This immediately restores rhythmic editorial pacing. Crucially, Section 2 (`#services`) will start at `top: 900px + 120px = 1020px` on desktop, increasing the clearance buffer from the floating bottom dock to > 120px at scrollY=0.

3. **Resolving the Services Grid Defect**:
   - Setting `display: grid;` and base columns in `css/style.css`:
     ```css
     .services-grid,
     .capabilities-grid {
       display: grid;
       grid-template-columns: repeat(4, 1fr);
       gap: 28px;
       width: 100%;
       box-sizing: border-box;
     }
     ```
   - Along with media query rules in `responsive.css` (4 cols >= 1440px, 2 cols at 768px-1439px, 1 col <= 767px), this converts the 4 service cards from vertical slabs into a balanced, luxury architectural card row.
   - In each `.service-card`, configuring `display: flex; flex-direction: column; justify-content: space-between;` ensures all 4 cards in the row share identical heights and balanced internal spacing regardless of slight text variations.

4. **Elevated Editorial Typography**:
   - For titles: Space Grotesk with `-0.03em` to `-0.04em` letter-spacing, `line-height: 1.12` to `1.15`, and high-contrast `#f2f2f6`.
   - For subtitles / 1-sentence descriptions: Plus Jakarta Sans, `color: #a1a3af`, `line-height: 1.65`, constrained to `max-width: 600px` to maintain an optimal reading measure (50-65 characters per line).
   - For category pills and badges: JetBrains Mono uppercase with `letter-spacing: 0.12em` and neon acid lime accent `#d2fe71`.

5. **Architectural Dark Luxury (Surfaces, Hairlines, Micro-Shadows)**:
   - Obsidian surface depth: Replacing flat card backgrounds with subtle gradients:
     `background: linear-gradient(165deg, rgba(26, 28, 36, 0.75) 0%, rgba(17, 18, 22, 0.95) 100%);`
   - Hairline slate borders: Replacing heavy borders with `1px solid rgba(242, 242, 246, 0.08)` (or `var(--border-hairline)`).
   - Soft ambient hover illumination: `box-shadow: 0 16px 36px rgba(0, 0, 0, 0.55), 0 0 20px rgba(210, 254, 113, 0.08);` with `border-color: rgba(210, 254, 113, 0.35);`.

6. **Unified Subpage Header System**:
   - Encapsulate all subpage header layouts into pure CSS classes in `css/style.css`:
     * `.page-hero-section` (standardized top/bottom padding)
     * `.breadcrumb-nav` & `.breadcrumb-text` (crisp monospace tracking)
     * `.page-header`, `.page-title`, `.page-subtitle` (consistent scale)
     * `.page-telemetry-bar` & `.page-telemetry-pill` (clean badges)
     * `.contact-channels-grid` & `.channel-card` (CSS grid with clean hover states)
   - Eliminates all inline style tags across `services.html`, `portfolio.html`, and `contact.html`.

---

## 3. Caveats

1. **Read-Only Explorer Scope**:
   - As an explorer subagent, this agent has investigated and formulated the exact CSS recommendations and selector rules without modifying the production source code files directly. The implementation will be executed by Worker M7.2.
2. **Text Reduction Coordination**:
   - Visual whitespace and typography rules work in synergy with concise copywriting. The Worker must simultaneously apply the concise 1-sentence copy and the CSS rules to achieve maximum editorial impact.
3. **Keyword Assertion Guard**:
   - When cleaning subpage headers and cards, all test assertion keywords (e.g. `100% Clean Code`, `PageSpeed 95+`, `Garansi`, `250+ Proyek`, etc.) must remain intact in markup.

---

## 4. Conclusion & Concrete CSS Implementation Blueprint

The CSS architecture is primed for a major Room & Pillar transformation. Below are the exact CSS selector rules and values recommended for Worker M7.2:

### 4.1 Master Spacing & Typography Tokens (`css/style.css` Section 1)
```css
/* --- UPDATED SPACING & DESIGN TOKENS --- */
:root {
  /* Fluid Section Spacing (Room & Pillar Editorial Rhythm) */
  --section-spacing: clamp(70px, 8vw, 120px);
  --section-spacing-sm: clamp(40px, 5vw, 64px);
  --container-max: 1280px;

  /* Architectural Hairlines */
  --border-hairline: rgba(242, 242, 246, 0.08);
  --border-subtle: rgba(242, 242, 246, 0.12);
  --border-hover: rgba(210, 254, 113, 0.35);

  /* Micro-Elevation Shadows */
  --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.45);
  --shadow-card-hover: 0 16px 40px rgba(0, 0, 0, 0.65), 0 0 24px rgba(210, 254, 113, 0.10);
}
```

### 4.2 Unified Section Spacing & Layout Grid (`css/style.css` Section 4)
```css
/* --- SECTION SPACING & ARCHITECTURAL BREATHING ROOM --- */
.section,
.section-padding,
.services-section,
.trust-section,
.portfolio-section,
.pricing-section,
.testimonials-section,
.faq-section {
  padding-top: var(--section-spacing);
  padding-bottom: var(--section-spacing);
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.section-header {
  margin-bottom: clamp(36px, 5vw, 56px);
}

.section-header--center {
  text-align: center;
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
}

.section-eyebrow,
.section-category {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: var(--text-mono-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: var(--accent-primary);
  margin-bottom: 12px;
}

.section-title {
  font-family: var(--font-heading);
  font-size: var(--text-display-xl);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--text-primary);
  margin-bottom: 14px;
}

.section-subtitle,
.section-desc {
  font-family: var(--font-display);
  font-size: var(--text-body-lg);
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 600px;
}

.section-header--center .section-subtitle,
.section-header--center .section-desc {
  margin-left: auto;
  margin-right: auto;
}
```

### 4.3 Services Grid & Card Refinement (`css/style.css` Section 8)
```css
/* --- SERVICES & CAPABILITIES GRID --- */
.services-grid,
.capabilities-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  width: 100%;
  box-sizing: border-box;
}

.service-card,
.interactive-spotlight {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 32px 26px;
  background: linear-gradient(175deg, rgba(26, 28, 36, 0.75) 0%, rgba(17, 18, 22, 0.95) 100%);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  box-sizing: border-box;
}

.service-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-card-hover);
}

.service-card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.service-num {
  font-family: var(--font-mono);
  font-size: var(--text-mono-xs);
  color: var(--accent-primary);
  letter-spacing: var(--tracking-widest);
  margin-bottom: 12px;
  display: inline-block;
}

.service-card-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.25;
}

.service-desc {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
  flex-grow: 1;
}

.tech-stack-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.service-card-footer {
  padding-top: 16px;
  border-top: 1px solid var(--border-hairline);
}

.service-link {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--accent-primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: gap var(--transition-fast);
}

.service-link:hover {
  gap: 10px;
}
```

### 4.4 Dark Luxury Card Refinements (`css/style.css` Sections 9, 10, 11)
```css
/* --- TRUST PILLARS & STAT CARDS --- */
.trust-pillar-card {
  background: linear-gradient(165deg, rgba(28, 30, 39, 0.6) 0%, rgba(18, 19, 25, 0.9) 100%);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-md);
  padding: 28px 24px;
  transition: border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
}

.trust-pillar-card:hover {
  border-color: var(--border-hover);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(210, 254, 113, 0.08);
  transform: translateY(-3px);
}

/* --- PORTFOLIO CARDS --- */
.portfolio-card {
  background: linear-gradient(165deg, rgba(24, 25, 32, 0.8) 0%, rgba(17, 18, 22, 0.95) 100%);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
}

.portfolio-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-4px);
}

.portfolio-thumb,
.preview-image-container {
  height: 260px;
  border-bottom: 1px solid var(--border-hairline);
}

/* --- PRICING CALCULATOR CONTAINER --- */
.pricing-calculator-widget,
.calc-card {
  background: linear-gradient(165deg, rgba(24, 25, 32, 0.9) 0%, rgba(17, 18, 22, 0.98) 100%);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: clamp(28px, 4vw, 44px);
  box-shadow: var(--shadow-lg);
}

.tier-card {
  background: rgba(32, 34, 43, 0.5);
  border: 1.5px solid var(--border-hairline);
}

.tier-card:hover {
  background: rgba(32, 34, 43, 0.7);
  border-color: rgba(210, 254, 113, 0.4);
}
```

### 4.5 Subpage Architectural Header Classes (`css/style.css` Section 15)
```css
/* --- SUBPAGE ARCHITECTURAL HEADER SYSTEM --- */
.page-hero-section {
  padding-top: clamp(100px, 10vw, 130px);
  padding-bottom: clamp(40px, 5vw, 60px);
  position: relative;
  border-bottom: 1px solid var(--border-hairline);
  background: linear-gradient(180deg, rgba(22, 23, 29, 0.5) 0%, rgba(17, 18, 22, 0) 100%);
}

.breadcrumb-nav {
  margin-bottom: 20px;
}

.breadcrumb-text {
  font-family: var(--font-mono);
  font-size: var(--text-mono-xs);
  letter-spacing: var(--tracking-wide);
  color: var(--text-muted);
}

.breadcrumb-text a {
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.breadcrumb-text a:hover {
  color: var(--accent-primary);
}

.page-header {
  max-width: 860px;
}

.page-title {
  font-family: var(--font-heading);
  font-size: clamp(2.2rem, 4.5vw, 3.75rem);
  font-weight: 700;
  letter-spacing: var(--tracking-tightest);
  line-height: 1.1;
  color: var(--text-primary);
  margin-top: 10px;
  margin-bottom: 16px;
}

.page-subtitle {
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 1.2vw, 1.2rem);
  line-height: 1.65;
  color: var(--text-secondary);
  max-width: 640px;
  margin-bottom: 28px;
}

.page-telemetry-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.page-telemetry-pill {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 500;
  background: var(--bg-secondary);
  border: 1px solid var(--border-hairline);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: border-color var(--transition-fast);
}

.page-telemetry-pill:hover {
  border-color: rgba(210, 254, 113, 0.3);
}

.page-telemetry-pill .pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.contact-channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.channel-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-md);
  padding: 20px 22px;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}

.channel-card:hover {
  border-color: rgba(210, 254, 113, 0.35);
  transform: translateY(-2px);
}
```

### 4.6 Responsive Breakpoint Tuning (`css/responsive.css`)
```css
/* 1440px+ (Ultra-wide Desktop) */
@media (min-width: 1440px) {
  :root {
    --section-spacing: 120px;
  }
  .services-grid,
  .capabilities-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
  }
}

/* 1024px - 1439px (Laptop) */
@media (max-width: 1439px) and (min-width: 1024px) {
  :root {
    --section-spacing: 100px;
  }
  .services-grid,
  .capabilities-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

/* 768px - 1023px (Tablet) */
@media (max-width: 1023px) {
  :root {
    --section-spacing: 80px;
  }
  .services-grid,
  .capabilities-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* Below 768px (Mobile) */
@media (max-width: 767px) {
  :root {
    --section-spacing: 60px;
  }
  .services-grid,
  .capabilities-grid {
    grid-template-columns: 1fr !important;
    gap: 20px !important;
  }
}

/* Below 380px (Small Mobile) */
@media (max-width: 380px) {
  :root {
    --section-spacing: 48px;
  }
}
```

---

## 5. Verification Method

To independently verify that the proposed changes meet all architectural, visual, and test requirements:

1. **Verify Section Computed Paddings & Grid Display via CDP**:
   ```powershell
   node -e "
   const StaticServer = require('./tests/helpers/static-server');
   const BrowserDriver = require('./tests/helpers/browser-driver');
   const path = require('path');
   (async () => {
     const server = new StaticServer({ rootDir: path.resolve(__dirname), port: 8250 });
     await server.start();
     const driver = new BrowserDriver({ headless: true });
     await driver.launch();
     await driver.setViewport({ width: 1440, height: 900 });
     await driver.goto('http://127.0.0.1:8250/index.html');
     const audit = await driver.evaluate(() => {
       const s = document.getElementById('services');
       const grid = document.querySelector('.services-grid');
       return {
         sectionPaddingTop: window.getComputedStyle(s).paddingTop,
         sectionPaddingBottom: window.getComputedStyle(s).paddingBottom,
         gridDisplay: window.getComputedStyle(grid).display,
         gridCols: window.getComputedStyle(grid).gridTemplateColumns
       };
     });
     console.log('Post-fix Audit:', audit);
     await driver.close();
     await server.stop();
   })();
   "
   ```
   *Expected Post-Fix*: `sectionPaddingTop: '120px'`, `gridDisplay: 'grid'`, `gridCols: '...'` (4 columns on 1440px).

2. **Run Master Zero-Dependency E2E Test Suite**:
   ```powershell
   node tests/run-e2e.js
   ```
   *Pass Condition*: 60/60 Suites, 204/204 Tests Passed, Exit Code 0, 0 Console Errors.

3. **Run Multi-Viewport Responsive Boundary Checks (320px, 768px, 1440px)**:
   ```powershell
   node -e "
   const { describe, test } = require('./tests/tier1-features/feat-03-responsive-layout.test.js');
   " # Or directly execute run-e2e.js Tier 1 Suite 3
   ```
   *Pass Condition*: `scrollOverflow === false` across all 4 pages on all 3 viewports.

4. **Run Milestone 6 Defect Regression Harnesses**:
   ```powershell
   node tests/challenger-m6-2-pricing-faq-stress.js
   node tests/adversarial-m5-verification.js
   ```
   *Pass Condition*: Unanimous APPROVE, 0 geometry overlaps, 0 transparent background violations.
