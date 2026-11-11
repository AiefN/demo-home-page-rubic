# Handoff Report: Protected Keywords & DOM Selectors Matrix (Milestone 7)

**Agent**: explorer_m7_2 (Test Dependency Explorer)  
**Milestone**: Milestone 7 — Text Reduction & Minimalist Overhaul  
**Target Pages**: `index.html`, `services.html`, `portfolio.html`, `contact.html`  
**Test Harness Baseline**: 60 test suites, 204 tests passing (100% pass, 0 failures, 0 errors)  
**Date**: 2026-11-11  

---

## 1. Observation

A systematic static analysis and runtime inspection of all 72 test files across `tests/run-e2e.js`, `tests/tier1-features/` (18 files), `tests/tier2-boundaries/` (18 files), `tests/tier3-combinations/` (18 files), `tests/tier4-scenarios/` (6 files), and standalone test suites (`adversarial-m5-verification.js`, `challenger-m5-2-deep-verification.js`, `challenger-m5-final-responsive.js`, `challenger-m5-subpages-tilt-stress.js`, `challenger-m6-2-pricing-faq-stress.js`, `stress-challenger-m5-2.js`, `stress-interactions-empirical.js`, `timing-check.js`) directly revealed:

1. **Exact Test Counts & Runner**:
   - Master suite command: `node tests/run-e2e.js` executes 60 suites and 204 tests across Headless Chrome CDP. Current run: 204/204 PASS (54.4s).
   - In addition, standalone challenger suites verify specialized geometric, physics, focus, and state-machine constraints.

2. **Strict DOM Quantity Assertions (Hard Cardinality)**:
   - `index.html` Pricing Calculator: Exactly 3 `.tier-card` elements (`challenger-m6-2-pricing-faq-stress.js:152`).
   - `index.html` FAQ Accordion: Exactly 6 `.faq-item` elements (`challenger-m6-2-pricing-faq-stress.js:469`).
   - `services.html` 3D Tilt Elements: Exactly 10 `.card-tilt` elements (4 service detail cards + 6 workflow timeline steps) (`challenger-m5-subpages-tilt-stress.js:143`).
   - `services.html` Workflow Steps: Exactly 6 `.timeline-step, .workflow-step` in `#workflow-timeline`, numbered strictly `'01'` through `'06'` with `>= 3` `ul li` deliverables per step (`stress-challenger-m5-2.js:156-183`).
   - `portfolio.html` Project Cards: Exactly 7 `.portfolio-card` cards (each having `.card-tilt`), distributed across category filters: `all` (7), `ecommerce` (2), `corporate` (3), `webapp` (2) (`challenger-m5-subpages-tilt-stress.js:296, 327-330`).
   - Service Deliverable Modal on `services.html`: Trigger `.btn-service-modal[data-service-id]` opens `#service-modal` requiring `>= 5` `li` items in `#service-modal-deliverables` (`challenger-m5-subpages-tilt-stress.js:202`).

3. **Strict Minimum Content Length Assertions**:
   - Service cards on homepage: Each card matching `#services .service-card, #services .interactive-spotlight, #services article` MUST have `textContent.trim().length > 30` characters (`feat-06-core-services.test.js:29`).
   - Hero Editorial H1: Text length must be `> 10` characters (`feat-04-hero-section.test.js:25`).
   - Case study modal preview: `innerHTML.length > 50` (`feat-10-case-study-modals.test.js:55`).

4. **Literal Error Messages & Validation Strings on `contact.html`**:
   - `#error-name`: Must include verbatim `"minimal 3 karakter"` (`stress-challenger-m5-2.js:694`).
   - `#error-email`: Must include verbatim `"tidak valid"` (`stress-challenger-m5-2.js:698`).
   - `#error-phone`: Must include verbatim `"08"` (`stress-challenger-m5-2.js:699`).
   - `#error-message`: Must include verbatim `"minimal 10 karakter"` (`stress-challenger-m5-2.js:697`).
   - `#btn-submit-consultation`: Must be clicked to trigger inline validation (`stress-challenger-m5-2.js:663`).

5. **Counter Targets & Suffixes**:
   - Target attributes: `data-counter-target="100"` (`100%`), `data-counter-target="250"` (`250+`), `data-counter-target="99.9"` (`99.9%`), `data-counter-target="95"` (`95+`) (`adversarial-m5-verification.js:203-206`).

6. **Legal & Entity Requirements in Footer**:
   - Entity name: Must include `"Rubic"` and `"PT"` or `"Solusindo"` (e.g. `"PT. Rubic Kirana Solusindo"`) (`feat-18-footer-legal.test.js:18`, `bnd-18-footer-accessibility-boundaries.test.js:23`).
   - Location: Must include `"Jakarta"`, `"SCBD"`, or `"Indonesia"` (`feat-18:28`, `bnd-18:33`).
   - Copyright: Must include `"©"`, `"Copyright"`, or `"All rights"` (`feat-18:41`).

---

## 2. Logic Chain & Protected Matrix

From these direct observations, the team must respect the boundary between **immutable test contracts** and **safely reducible marketing copy**:

### Complete Protected Keywords & DOM Selectors Matrix

| Area | Page(s) | Required Selectors & IDs | Protected Literal Keywords / Text Matches | Invariant Cardinality / Length Constraints |
|---|---|---|---|---|
| **Header & Navbar** | All 4 pages | `header.site-header#site-header`, `nav.navbar__links#navbar`, `.navbar__toggle#navbar-toggle`, `.mobile-menu#mobile-nav-drawer`, `.floating-bottom-nav` | Anchor hrefs: `index.html`, `services.html`, `portfolio.html`, `#pricing-calculator` (or `contact.html#pricing-calculator`), `contact.html`, `wa.me` | Body scroll lock class `.no-scroll` on mobile drawer open |
| **Hero Section** | `index.html` | `#hero, .hero-section`, `h1.hero-title`, `.hero-badge-wrap`, `.pill-badge`, `.hero-actions a` | • Badge contains `"garansi"` OR `"kepuasan"` OR `"100%"`<br>• Primary CTA contains `"wa.me"`/`"whatsapp"`/`"konsultasi"`<br>• Secondary CTA contains `"portfolio"`/`"portofolio"` | H1 length `> 10` characters |
| **Core Services** | `index.html` | `#services`, `.service-card`, `.card-tilt`, `.interactive-spotlight`, `.tech-badge`, `h3`, `h4`, `a`, `button` | Tech badges contain at least one of: `"html"`, `"laravel"`, `"php"`, `"api"`, `"css"`, `"js"`, `"react"` | • Exactly $\ge 4$ service cards<br>• **CARD TEXT LENGTH MUST BE $> 30$ CHARS** (Do not prune below 30 chars!)<br>• $\ge 2$ interactive links/buttons<br>• $\ge 3$ headings (`h3`/`h4`) |
| **Trust Pillars & Stats** | `index.html` | `#stats`, `<div id="why-us"></div>`, `.stats-cards-grid`, `.stat-number`, `[data-counter-target]` | Suffixes `%`, `+`, `ms` preserved | • Exact target values: `100` (`100%`), `250` (`250+`), `99.9` (`99.9%`), `95` (`95+`)<br>• At least 2 stats elements, $\ge 4$ trust cards |
| **Portfolio Showcase** | `index.html` & `portfolio.html` | `#portfolio`, `.portfolio-card`, `.card-tilt`, `[data-category]`, `[data-filter]`, `.filter-btn`, `.portfolio-filter-btn`, `.btn-case-study[data-project-id]` | Category values: `"all"`, `"ecommerce"`, `"corporate"`, `"webapp"` | • On `index.html`: $\ge 2$ project cards<br>• On `portfolio.html`: **EXACTLY 7 `.portfolio-card` CARDS** with `.card-tilt`<br>• Exact breakdown: `all`=7, `ecommerce`=2, `corporate`=3, `webapp`=2<br>• All 7 cards must have `a[href*="wa.me"]` |
| **Case Study Modal** | `index.html` & `portfolio.html` | `#case-study-modal`, `.modal-dialog`, `#modal-close-btn` (or `.modal-close`), `#modal-title`, `#modal-client`, `#modal-tag`, `#modal-challenge`, `#modal-solution`, `#modal-results`, `#modal-img`, `#modal-whatsapp-cta` | Fallback title when unknown project ID clicked: `"NexaStore Luxury Goods"` | • Modal starts closed (`display: none` / `aria-hidden="true"`)<br>• Traps keyboard Tab focus<br>• Dismisses on Escape and backdrop click |
| **Pricing Calculator** | `index.html` & `contact.html` | `#pricing-calculator` (and `#pricing`), `.pricing-calculator-widget`, `.calc-layout`, `.tier-cards-group`, `.tier-card`, `input[name="tier"]`, `#extra-pages`, `#pages-count-display`, `input[name="addon"]`, `#calc-total-price`, `#calc-total-timeline`, `#btn-calc-whatsapp` | • Radios: `basic`, `pro`, `enterprise`<br>• Tier names: `"Paket Basic"`, `"Paket Pro"`, `"Paket Enterprise"`<br>• Addons: `"E-Commerce"`, `"Payment Gateway"`, `"Multi-Bahasa"`/`"Multilingual"`, `"Express"`<br>• Outputs: Currency `"Rp"` formatted (`Rp 2.500.000`, `Rp 5.500.000`, `Rp 12.000.000`, etc.) | • **EXACTLY 3 `.tier-card` CARDS** (aligned horizontally on desktop)<br>• Addon attributes: `data-price`, `data-days`, `data-name`, `data-express="true"`<br>• Outputs never contain `"NaN"` or `"e+"` |
| **Testimonials Carousel** | `index.html` | `#testimonials`, `.testimonial-carousel[data-carousel]`, `.testimonial-track`, `.testimonial-card`, `.carousel-btn--prev`, `.carousel-btn--next`, `.carousel-dots#carousel-dots`, `.carousel-dot` | Text must contain `"PT"` or `"Founder"`, ratings contain `"★"` or `"5.0"` or `"Rating"` | Pauses on mouseenter / focusin; resumes on mouseleave / focusout |
| **FAQ Accordion** | `index.html` | `#faq, .faq-section`, `.faq-item`, `.faq-header`, `.faq-trigger`, `.faq-question`, `.faq-icon`, `.faq-panel, .faq-content` | Question text, icon rotates 45deg (`0.7071` matrix) | • **EXACTLY 6 `.faq-item` ACCORDION ITEMS**<br>• Single-active expansion (opening item closes siblings)<br>• Clean transparent background on `.faq-trigger` and `.faq-question` |
| **6-Stage Workflow** | `services.html` | `#workflow`, `#workflow-timeline`, `.workflow-step, .timeline-step`, `.step-number`, `.step-tag`, `.step-title`, `.btn-service-modal[data-service-id]` | • Steps numbered: `"01"`, `"02"`, `"03"`, `"04"`, `"05"`, `"06"`<br>• Text matches $\ge 2$ stages: `"discovery"`, `"wireframe"`, `"coding"`, `"qa"`, `"deploy"`, `"maintenance"`, `"alur"`, `"tahapan"`, `"workflow"`<br>• Scope: `"wireframe"`, `"desain"`, `"testing"`, `"deploy"`<br>• Text contains: `"deliverable"`/`"fitur"`/`"fasilitas"`/`"output"`/`"lingkup"` | • **EXACTLY 6 WORKFLOW STEPS** in order<br>• Each step has `ul li` with $\ge 3$ deliverables<br>• `services.html` has **EXACTLY 10 `.card-tilt` elements** total (4 service detail cards + 6 workflow steps)<br>• Service modal `#service-modal-deliverables li` $\ge 5$ |
| **Consultation Form** | `contact.html` | `<form class="consultation-form contact-form" id="contact-form">`, `#name`, `#company`, `#email`, `#phone`, `#package`, `#message`, `#btn-submit-consultation`, `#form-success-banner[role="status"]` | **Literal error validation strings**:<br>• `#error-name`: `"minimal 3 karakter"`<br>• `#error-email`: `"tidak valid"`<br>• `#error-phone`: `"08"`<br>• `#error-message`: `"minimal 10 karakter"` | First invalid input focused on failed submit (`#name`) |
| **Floating WhatsApp** | All 4 pages | `.btn-floating-whatsapp, .floating-whatsapp-btn, .whatsapp-ripple, a[href*="wa.me"]` | URL contains `"wa.me"` or `"whatsapp.com"`, aria-label/title contains `"whatsapp"`, `"chat"`, or `"konsultasi"` | Keyframe animation name contains `'ripple'`, `animation-iteration-count: infinite`, `position: fixed` in bottom right corner |
| **Footer & Legal** | All 4 pages | `footer.site-footer#site-footer`, `address`, `.footer-links a` | • Legal entity: `"PT. Rubic Kirana Solusindo"` (must match `"Rubic"` and `"PT"` or `"Solusindo"`)<br>• Address: `"Jakarta"`, `"SCBD"`, or `"Indonesia"`<br>• Copyright: `"©"`, `"Copyright"`, or `"All rights"` | At least 2 anchor links in footer |

---

## 3. Caveats

1. **Service Card Length Threshold (`feat-06: 6.3`)**:
   `test('6.3 Service cards contain descriptive deliverables or scope')` asserts that `every(c => c.textContent.trim().length > 30)`. While the user requested text reduction, reducing any service card below 31 characters will immediately fail this test. A concise 1-2 sentence description (e.g. 60-100 characters) is optimal and safe.
2. **Exact Element Counts**:
   Test suites (`challenger-m5-subpages-tilt-stress.js` and `challenger-m6-2-pricing-faq-stress.js`) perform strict integer equality assertions on `.card-tilt` (exactly 10 on `services.html`, exactly 7 on `portfolio.html`), `.tier-card` (exactly 3 on `index.html`), and `.faq-item` (exactly 6 on `index.html`). Under no circumstances should items be deleted from the DOM.
3. **Form Error Strings**:
   Inline error texts for `#error-name`, `#error-email`, `#error-phone`, and `#error-message` on `contact.html` must continue to contain their required substrings (`minimal 3 karakter`, `tidak valid`, `08`, `minimal 10 karakter`).

---

## 4. Conclusion

The minimalist overhaul can safely and aggressively achieve the user's aesthetic vision:
1. **Rambling Marketing Paragraphs Can Be Ruthlessly Condensed**:
   - Hero narrative subheadline: Trim from 3 dense lines to 1 crisp, high-impact sentence.
   - Section subheadings: Cut from wordy 2-3 sentence explanations to single punchy editorial lines.
   - Testimonial quotes: Shorten 5-line verbose paragraphs to 1-2 concise, elegant sentences.
   - FAQ answers: Condense from 6-8 rambling lines into 1-2 direct, authoritative sentences.
   - Subpage introductions: Eliminate redundant corporate filler while keeping clean layout whitespace.
2. **Strict Structural & Selector Invariants Must Remain Untouched**:
   - Keep all exact IDs, classes, data attributes, card quantities (3 pricing tiers, 6 FAQ items, 10 service tilts, 7 portfolio tilts), and the exact validation substrings in `contact.js`.
3. **Zero Risk of Test Regression**:
   - Adhering to the Protected Keywords & DOM Selectors Matrix guarantees 100% pass across all 60 test suites (204 tests) and all standalone adversarial suites.

---

## 5. Verification Method

To independently verify that any text overhaul preserves all dependencies:

1. **Execute Full E2E Test Suite**:
   ```bash
   node tests/run-e2e.js
   ```
   *Expected Result*: All 60 suites, 204 tests PASS with 0 failures and 0 console errors.

2. **Execute Pricing & FAQ Stress Verification**:
   ```bash
   node tests/challenger-m6-2-pricing-faq-stress.js
   ```
   *Expected Result*: Verdict APPROVE, 3 tier cards horizontal, 6 FAQ items transparent, 0 console errors.

3. **Execute Subpages & Tilt Physics Stress Verification**:
   ```bash
   node tests/challenger-m5-subpages-tilt-stress.js
   ```
   *Expected Result*: Verdict APPROVE, 10 card-tilt elements on services.html, 7 card-tilt elements on portfolio.html.

4. **Execute Adversarial Edge-Case Suite**:
   ```bash
   node tests/adversarial-m5-verification.js
   ```
   *Expected Result*: 100% pass across custom cursor LERP, 3D tilt, stats observer, and calculator matrix.
