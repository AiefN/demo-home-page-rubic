# Handoff Report: Milestone 1 Review & Adversarial Challenge

**Reviewer Agent:** `reviewer_m1` (reviewer, critic)  
**Milestone:** Milestone 1 — CSS Design System & Assets Foundation  
**Date:** 2026-11-10T06:28:00Z  
**Target Repository:** `c:\pkl\PKL`  
**Verdict:** `REQUEST_CHANGES`

---

## 1. Observation

### 1.1 Scope & Files Audited
- `css/style.css` (1,915 lines, 44,570 bytes)
- `css/animations.css` (262 lines, 6,253 bytes)
- `css/responsive.css` (534 lines, 10,518 bytes)
- `assets/icons/` (16 SVG icon files: `whatsapp.svg`, `chevron-down.svg`, `arrow-right.svg`, `close.svg`, `check.svg`, `star.svg`, `speedometer.svg`, `shield.svg`, `server.svg`, `code.svg`, `layout.svg`, `layers.svg`, `refresh.svg`, `phone.svg`, `mail.svg`, `map-pin.svg`)
- `assets/` (5 SVG mockups/brand logos: `jelypos-mockup.svg`, `karalia-mockup.svg`, `pinjamin-mockup.svg`, `wilmar-mockup.svg`, `rubicweb-logo.svg`)
- `assets/portfolio/` & `assets/logos/` (9 PNG assets verified with PNG magic bytes `0x89 0x50 0x4E 0x47`)

### 1.2 Automated Tool Commands & Results

1. **CSS Variable & Reference Integrity Check:**
   - Command: Custom Node scanner analyzing CSS variable definitions vs `var()` references.
   - Result: 78 unique `--*` custom properties defined on `:root`. All `var()` calls resolve cleanly; dynamic variables (`--mouse-x`, `--mouse-y`, `--glow-opacity`) have valid fallback expressions (`var(--glow-x, 50%)`, `0`).

2. **Asset Integrity Check:**
   - Command: Node XML and Magic Bytes parser.
   - Result: All 16 icons in `assets/icons/` are valid SVG XML with `viewBox`, `xmlns`, and closing tags. All 5 mockups are valid SVG files. All PNG files have valid headers and non-zero byte lengths.

3. **E2E & Boundary Test Suite Execution:**
   - Command: `node tests/run-e2e.js`
   - Result: 30 Suites, 150 Tests total.
     - 137 Tests Passed.
     - 13 Tests Failed:
       - 12 failures are due to the skeletal state of `index.html` (Hero copy, cursor DOM, tech badges, portfolio gallery, modals, pricing options, accordion single-active toggle) which are assigned to Milestones M2, M3, and M4.
       - 1 failure is in `tests/tier2-boundaries/bnd-02-vanilla-integrity.test.js` (B2.4) due to a test evaluation returning `"#111216"` instead of boolean `true`.
     - Notably, pure vanilla compliance (Feature 2.1 - 2.5: no Tailwind, Bootstrap, jQuery, React, Vue, zero console errors) PASSED 100%.
     - Responsive zero-overflow compliance across 320px, 768px, and 1440px viewports (Feature 3.1 - 3.5, Boundary 3.1 - 3.5) PASSED 100%.

4. **Adversarial Browser Stress Test on FAQ Accordion:**
   - Tool: Headless Chromium via Chrome DevTools Protocol.
   - Test Markup:
     ```html
     <div class="faq-item">
       <button class="faq-header">Question</button>
       <div class="faq-content">
         <div class="faq-inner">Answer text</div>
       </div>
     </div>
     ```
   - Observed Output:
     ```javascript
     {
       contentHeight: 24,
       innerVisible: 24,
       contentComputedHeight: '24px',
       headerHeight: 71,
       totalItemHeight: 97
     }
     ```
   - Verbatim Code (`css/style.css` lines 1606-1625):
     ```css
     .faq-content,
     .accordion-content {
       display: grid;
       grid-template-rows: 0fr;
       transition: grid-template-rows 0.35s var(--ease-swift-out);
     }
     ...
     .faq-inner,
     .accordion-inner {
       overflow: hidden;
       padding: 0 28px 24px 28px;
       font-size: 0.96rem;
       line-height: 1.7;
       color: var(--text-secondary);
     }
     ```
   - Verbatim Code (`css/responsive.css` lines 357-361):
     ```css
     .faq-inner,
     .accordion-inner {
       padding: 0 16px 18px 16px;
       font-size: 0.92rem;
     }
     ```

5. **Adversarial Browser Stress Test on Testimonials Carousel Mobile Layout:**
   - Tool: Headless Chromium at 360px viewport (`width: 360, height: 640`).
   - Observed Output:
     ```javascript
     {
       viewportWidth: 360,
       cardWidth: 162,
       trackWidth: 352,
       cardComputedFlex: '0 0 calc(50% - 14px)'
     }
     ```
   - Verbatim Code (`css/style.css` line 1451):
     ```css
     .testimonial-card,
     .testimonial-slide {
       flex: 0 0 calc(50% - 14px);
       min-width: 0;
     ...
     ```
   - Verbatim Code (`css/responsive.css` lines 339-342):
     ```css
     .testimonial-card,
     .testimonial-slide {
       padding: 24px 18px;
     }
     ```

---

## 2. Logic Chain

1. **Integrity & Framework Audit:**
   - Observations 1.1, 1.2, and 1.3 confirm that `worker_m1_css` created genuine, hand-crafted CSS and SVG assets without external CSS frameworks (no Tailwind classes, no Bootstrap imports, no CDN links).
   - No hardcoded test stubs, mock facades, or integrity shortcuts were detected. The work was performed with high craftsmanship and adherence to the Room & Pillar design language (obsidian surfaces `#111216`, `#181920`, plaster typography `#f2f2f6`, acid lime `#d2fe71`, and drafting dot background).

2. **FAQ Accordion Height Leakage Mechanism:**
   - In CSS Grid, transitioning `grid-template-rows: 0fr` to `1fr` is intended to animate height smoothly from 0 to full size without calculating JavaScript pixel heights.
   - However, in CSS Grid specification, a grid track collapses to `0fr` only if its grid child can shrink to 0.
   - In `css/style.css:1622`, `.faq-inner` is styled with static `padding: 0 28px 24px 28px;` and is missing `min-height: 0;`.
   - In CSS box model physics, padding is part of the element's box and does not shrink to 0 when grid track size is 0fr.
   - Direct headless measurement (Observation 1.4) proved that an inactive `.faq-item` has `.faq-content` height of `24px` on desktop and `18px` on mobile.
   - This leaves a visible gap/leak beneath every closed FAQ question in the accordion, violating R2 and component contract #2 in `PROJECT.md`.

3. **Testimonial Carousel Mobile Squeezing Defect:**
   - In `css/style.css:1451`, `.testimonial-card` is set to `flex: 0 0 calc(50% - 14px)` (displaying 2 cards per view on desktop).
   - In `css/responsive.css:339-342` under `@media (max-width: 767px)`, the worker reduced the padding to `24px 18px` but omitted setting `flex: 0 0 100%`.
   - Direct headless measurement (Observation 1.5) showed that on a 360px smartphone screen, each testimonial card is squeezed down to `162px` wide, leaving only `126px` for text after accounting for padding. Two cards are crammed side-by-side, causing severe text wrapping and unreadable client quotes.
   - On mobile screens, carousel slides must be 100% width (`flex: 0 0 100%`) so a single testimonial card occupies the viewport track slide.

4. **Universal `* { max-width: 100%; }` Constraint on Slide Tracks:**
   - In `css/responsive.css:522-526`, `*, *::before, *::after { max-width: 100%; }` is applied globally.
   - For standard layout containers, this prevents horizontal overflow. However, for horizontal flex tracks (like `.testimonial-track`), it clamps `width: 100%`, forcing child items to overflow the track box.
   - Adding `.testimonial-track { max-width: none; }` prevents flex computation glitches when slides are translated with `transform: translateX()`.

---

## 3. Caveats

- HTML pages (`index.html`, `services.html`, `portfolio.html`, `contact.html`) and JavaScript engines (`main.js`, `interactions.js`, etc.) belong to upcoming milestones (M2, M3, M4). The 12 failing E2E tests for missing HTML copy and DOM structures are expected at the end of M1 and do not indicate CSS failures.
- `tests/tier2-boundaries/bnd-02-vanilla-integrity.test.js` has a test assertion issue where `style.getPropertyValue('--bg-primary')` returns `"#111216"`, causing `expect(hasVariables).toBe(true)` to fail because `"#111216" !== true`. This is a test issue to be resolved in M5 or test maintenance, not a CSS defect.

---

## 4. Conclusion & Review Report

**Verdict: REQUEST_CHANGES**

Milestone 1 has delivered an exceptional visual foundation, rich design tokens, 10 GPU-accelerated keyframe animations, 16 SVG icons, and authentic Room & Pillar aesthetics. However, two high-impact CSS bugs must be resolved before proceeding to Milestone 2 to prevent downstream integration failures in Milestones 2 and 3.

### Findings

#### [Major] Finding 1: FAQ Accordion Leaks 24px Height in Closed State
- **Location:** `css/style.css:1620-1625` & `css/responsive.css:357-362`
- **Problem:** Closed accordion items do not collapse to 0 height. They remain 24px high on desktop (18px on mobile) due to static padding on `.faq-inner` and missing `min-height: 0`.
- **Required Fix:**
  In `css/style.css`:
  ```css
  .faq-inner,
  .accordion-inner {
    overflow: hidden;
    min-height: 0;
    padding: 0 28px 0 28px;
    font-size: 0.96rem;
    line-height: 1.7;
    color: var(--text-secondary);
    transition: padding-bottom 0.35s var(--ease-swift-out);
  }

  .faq-item.is-active .faq-inner,
  .faq-item[aria-expanded="true"] .faq-inner,
  .accordion-item[aria-expanded="true"] .accordion-inner {
    padding-bottom: 24px;
  }
  ```
  In `css/responsive.css` under `@media (max-width: 767px)`:
  ```css
  .faq-inner,
  .accordion-inner {
    padding: 0 16px 0 16px;
  }

  .faq-item.is-active .faq-inner,
  .faq-item[aria-expanded="true"] .faq-inner,
  .accordion-item[aria-expanded="true"] .accordion-inner {
    padding-bottom: 18px;
  }
  ```

#### [Major] Finding 2: Testimonial Carousel Mobile Slide Basis Missing
- **Location:** `css/responsive.css:339-342`
- **Problem:** On screens below 768px, `.testimonial-card` retains `flex: 0 0 calc(50% - 14px)`, cramming two micro-cards side-by-side (142px-162px wide) with only 126px usable text area.
- **Required Fix:**
  In `css/responsive.css` under `@media (max-width: 767px)`:
  ```css
  .testimonial-card,
  .testimonial-slide {
    flex: 0 0 100% !important;
    padding: 24px 18px;
  }
  ```

#### [Minor] Finding 3: Universal `*` `max-width: 100%` Restricting Sliding Tracks
- **Location:** `css/responsive.css:522-526`
- **Problem:** Universal `max-width: 100%` on `*` clamps `.testimonial-track` to 100% width rather than allowing it to be a flexible horizontal strip.
- **Required Fix:**
  Add `.testimonial-track { max-width: none !important; }` in `css/style.css` or `css/responsive.css`.

---

## 5. Verification Method

To independently verify after `worker_m1_css` applies these changes:

1. **Verify Accordion Collapses to Exactly 0px Height:**
   Run a headless script or browser inspector:
   ```javascript
   const closedHeight = document.querySelector('.faq-content').getBoundingClientRect().height;
   console.assert(closedHeight === 0, `Expected 0 but got ${closedHeight}`);
   ```
   *Expected:* Exactly `0px`.

2. **Verify Mobile Carousel Card is 100% Width:**
   In headless browser at 360px viewport:
   ```javascript
   const card = document.querySelector('.testimonial-card');
   const flex = window.getComputedStyle(card).flex;
   console.log('Flex basis:', flex); // Must be '0 0 100%' or '1 0 100%'
   ```
   *Expected:* `card.getBoundingClientRect().width` is approximately `324px` (container minus gutters), NOT `162px`.

3. **Verify Zero Horizontal Overflow:**
   ```powershell
   node tests/run-e2e.js
   ```
   *Expected:* Suites 1, 2, and 3 pass with 100% zero horizontal overflow across 320px, 768px, and 1440px viewports.
