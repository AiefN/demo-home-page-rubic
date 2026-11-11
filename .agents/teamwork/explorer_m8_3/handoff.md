# Test Suite Regression & Compatibility Investigation Report
**Milestone:** Milestone 8 (Hero Corporate Profile Card & One-Page Anchor Navigation)  
**Agent:** explorer_m8_3  
**Working Directory:** `c:\pkl\PKL`  
**State Folder:** `c:\pkl\PKL\.agents\teamwork\explorer_m8_3\`  
**Date:** 2026-11-11  

---

## 1. Observation

### 1.1 Existing Test Suite Topology & Execution Status
A comprehensive inspection was conducted across the entire testing infrastructure in `tests/`:
- **Master Test Runner (`tests/run-e2e.js`)**:
  - Dynamically discovers and executes all `.test.js` files across 4 tiers:
    * `tier1-features/`: 18 feature test suites ($18 \times 5 = 90$ assertions).
    * `tier2-boundaries/`: 18 boundary value test suites ($18 \times 5 = 90$ assertions).
    * `tier3-combinations/`: 18 cross-feature combination test suites ($18 \times 1 = 18$ assertions).
    * `tier4-scenarios/`: 6 end-to-end user journey test suites ($6 \times 1 = 6$ assertions).
  - Total: **60 Suites, 204 Tests**.
  - Current baseline execution run:
    ```
    Total Suites : 60
    Total Tests  : 204
    Passed       : 204
    Failed       : 0
    Duration     : 43.69s
    E2E RUN PASSED: 100% test success!
    ```
- **Adversarial & Auditor Harnesses**:
  - `tests/adversarial-m7-interactive-physics.js`: 8 suites, 57 interactive checks covering custom cursor physics (LERP $\lambda=0.16$), 3D card tilt physics, stats counter observer monotonicity, carousel autoplay pause/resume, single-active FAQ accordion, navbar hysteresis, rapid frame budget, and subpage console cleanliness. Execution: **57/57 PASS (100% APPROVE)**.
  - `tests/adversarial-m5-verification.js`: 6 systems (cursor, tilt, stats, pricing, carousel, FAQ). Execution: **6/6 PASS (100% APPROVE)**.
  - `tests/reviewer-m7-2-visual-audit.js`: 55 assertions evaluating 4 pages $\times$ 6 viewports (24-matrix responsive layout), geometric balance, desktop container centering (diff $\le 2$px), wide desktop width ($\ge 1100$px), and clean typography. Execution: **55/55 PASS (100% APPROVE)**.

---

### 1.2 Target 1: Navbar Links on `index.html`
We inspected every test querying navbar, header, links, and drawer:

1. **`tests/tier1-features/feat-03-responsive-layout.test.js:82`**:
   ```javascript
   test('3.5 Desktop Viewport (1440px): Desktop navigation is available and rendered', async ({ driver, baseUrl }) => {
     await driver.setViewport({ width: 1440, height: 900, mobile: false });
     await driver.goto(`${baseUrl}/index.html`);
     const hasDesktopNav = await driver.evaluate(() => {
       const navLinks = document.querySelectorAll('header nav a, .floating-bottom-nav a, .navbar a');
       return navLinks.length >= 3;
     });
     expect(hasDesktopNav).toBe(true);
   });
   ```
   *Observation:* Asserts `navLinks.length >= 3`. It does not check `href` attributes. Converting links to `#hero`, `#services`, `#portfolio`, `#pricing`, `#contact` satisfies this test completely.

2. **`tests/tier1-features/feat-14-navbar-mobile-drawer.test.js`** (lines 4–74):
   - 14.1: Asserts `header, .site-header, .navbar, nav` exists.
   - 14.2: Asserts scrolling down document triggers `navbar--scrolled` or `scrolled` or `window.scrollY > 0`.
   - 14.3: Asserts clicking `.navbar__toggle` opens `.mobile-menu` / `.mobile-drawer` with `.is-open` or `.active`.
   - 14.4: Asserts opening drawer adds `no-scroll` or `overflow: hidden` to `document.body`.
   - 14.5: Asserts clicking toggle again restores state.
   *Observation:* Zero href assertions. Converting drawer links to in-page anchors has zero impact on this suite.

3. **`tests/tier2-boundaries/bnd-01-navigation-routing.test.js`** (lines 4–45):
   - B1.1: Direct navigation to `${baseUrl}/index.html#non-existent-anchor-test` produces 0 console errors.
   - B1.2: URL with query strings loads cleanly.
   - B1.4: Direct deep-anchor navigation resolves to corresponding target:
     ```javascript
     test('B1.4 Direct deep-anchor navigation resolves to corresponding section target', async ({ driver, baseUrl }) => {
       await driver.goto(`${baseUrl}/index.html#contact`);
       const targetExists = await driver.evaluate(() => {
         const el = document.getElementById('contact');
         return !!el;
       });
       expect(targetExists).toBe(true);
     });
     ```
     *Observation:* This test explicitly asserts that `document.getElementById('contact')` exists on `index.html`. In earlier milestones, line 583 placed a dummy `<div id="contact" class="anchor-target" aria-hidden="true"></div>`. Milestone 8 replaces this dummy with a true, fully featured `<section id="contact" ...>`, directly fulfilling B1.4.
   - B1.5: Asserts hash navigation cycling (`#services`, `#portfolio`, `#faq`, `''`) without error.

4. **`tests/tier3-combinations/comb-08-drawer-hash-navigation.test.js:14`**:
   ```javascript
   test('C8.1 Mobile drawer link navigates to portfolio anchor and applies category filter', async ({ driver, baseUrl }) => {
     ...
     const portfolioLink = document.querySelector('.mobile-menu a[href*="portfolio"], .nav-drawer a[href*="portfolio"]');
     if (portfolioLink) portfolioLink.click();
     ...
   });
   ```
   *Observation:* The selector `a[href*="portfolio"]` matches both `href="portfolio.html"` AND `href="#portfolio"`. Changing drawer link to `href="#portfolio"` passes seamlessly.

5. **`tests/tier4-scenarios/scen-01-discovery-to-workflow.test.js:12`**:
   ```javascript
   const servicesLink = await driver.evaluate(() => {
     const link = document.querySelector('a[href*="services"], a[href="#services"], nav a:nth-child(3)');
     return link ? link.getAttribute('href') : null;
   });
   ```
   *Observation:* The selector explicitly contains `a[href="#services"]`! Then in step 4 (line 27), the test directly calls `await driver.goto(servicesUrl)` to inspect `services.html`. Passing `href="#services"` is fully compliant.

6. **CRITICAL FINDING in `tests/challenger-m5-2-deep-verification.js:270`**:
   ```javascript
   const drawerNav = await this.driver.evaluate(() => {
     const toggle = document.querySelector('.navbar__toggle');
     if (!toggle) return { error: 'Navbar toggle button missing' };
     toggle.click();
     const menuOpen = document.querySelector('.mobile-menu.is-open');
     const servicesLink = document.querySelector('.mobile-menu a[href*="services.html"]');
     if (!servicesLink) return { error: 'Services link missing in mobile menu' };
     return {
       menuOpened: !!menuOpen,
       servicesHref: servicesLink.getAttribute('href')
     };
   });
   ```
   *Observation:* This is the **ONLY place across all test suites** that uses `querySelector('.mobile-menu a[href*="services.html"]')`. If the mobile menu link is replaced with `href="#services"`, this test in `challenger-m5-2-deep-verification.js` would return `{ error: 'Services link missing in mobile menu' }`.
   *Note:* `run-e2e.js` does NOT execute `challenger-m5-2-deep-verification.js`. However, for comprehensive multi-milestone regression defense, making the selector flexible (`.mobile-menu a[href*="services.html"], .mobile-menu a[href*="services"]`) ensures 100% compatibility across all test suites.

---

### 1.3 Target 2: Hero Visual Showcase Card
We inspected all assertions checking the Hero section:

1. **`tests/tier1-features/feat-04-hero-section.test.js`**:
   - 4.1: `#hero, .hero-section` is rendered with `tagName === 'section'`.
   - 4.2: `#hero h1, .hero-section h1` text content length $> 10$ chars.
   - 4.3: Guarantee pill badge contains 'garansi', 'kepuasan', or '100%'.
   - 4.4: Primary WhatsApp CTA href contains 'wa.me', 'whatsapp', or '#contact' OR text contains 'konsultasi', 'whatsapp'.
   - 4.5: Secondary Portfolio CTA href contains 'portfolio' or '#portfolio' OR text contains 'portofolio', 'portfolio'.
   *Observation:* **ZERO assertions** exist for `.code-window`, `rubicweb.engine.config.ts`, `<pre>`, `<code>`, `.showcase-code-body`, or programming syntax tokens.

2. **`tests/tier2-boundaries/bnd-04-hero-interactions.test.js`**:
   - B4.1: Rapid clicks on Hero CTA do not throw.
   - B4.2: Hero H1 text wraps on 320px viewport without clipping (`rect.width <= 320 && rect.right <= 325`).
   - B4.3: Reduced-motion media query respects suppressed keyframes.
   - B4.4: Hero CTA receives keyboard focus.
   - B4.5: Mousemove events over Hero badge (`.hero-badge-wrap, .hero-telemetry-bar`).
   *Observation:* Zero code editor assertions.

3. **`tests/tier1-features/feat-07-3d-tilt-cards.test.js` & `tests/tier2-boundaries/bnd-07-3d-tilt-physics.test.js`**:
   - 7.1: `document.querySelectorAll('.card-tilt, .interactive-spotlight, [data-tilt], .service-card, .portfolio-card').length >= 1`.
   - 7.2 & B7.1-B7.5: Verifies mouse position calculating `--mouse-x`, `--mouse-y`, `transform: rotateX() rotateY()`, and clamping $\le \pm 10^\circ$.
   *Observation:* By keeping the class `.card-tilt` on the new Hero Corporate Value Card, it participates in 3D tilt interaction smoothly.

4. **`tests/reviewer-m7-2-visual-audit.js:315-345`**:
   - Hero geometric balance verification at 1440px desktop:
     * `marginDiff = Math.abs(heroLayout.leftMargin - heroLayout.rightMargin) <= 2` px (symmetrically centered).
     * `heroLayout.containerWidth >= 1100` px.
   - Clean typography conciseness:
     * `.hero-subheadline` text length between 30 and 150 characters (`copyMetrics.heroSubLength <= 150 && copyMetrics.heroSubLength > 30`).
   *Observation:* The new Company Profile card must be housed within `.hero-showcase-col` inside `.container.hero-container`, preserving balanced two-column grid proportions (e.g., `1.15fr 0.85fr`) and keeping `.hero-subheadline` concise.

---

### 1.4 Target 3: Contact Form Selectors & Validation Tests
We analyzed where and how contact form validation is tested:

1. **`tests/tier1-features/feat-16-contact-form-validation.test.js`**:
   - Uses helper `loadContactPage(driver, baseUrl)` which explicitly loads `${baseUrl}/contact.html`.
   - 16.1: `form input, form textarea, form select` count $\ge 3$.
   - 16.2: `input[type="email"], #email, #form-email` flags invalid email.
   - 16.3: `input[type="tel"], #phone, #form-phone` flags invalid short phone.
   - 16.4: Valid email and phone clears error classes.
   - 16.5: Empty form submit triggers `.is-invalid, .error, .invalid` $\ge 1$.
   *Observation:* All Tier 1 form tests run against `contact.html`. Adding `#contact` on `index.html` has zero negative impact on Tier 1.

2. **`tests/tier2-boundaries/bnd-16-form-validation-regex-edge.test.js`**:
   - Uses helper `loadContact(driver, baseUrl)` which explicitly loads `${baseUrl}/contact.html`.
   - B16.1: Domainless emails rejected (`user@`, `user@domain`, `@domain.com`).
   - B16.2: Spaced email addresses handled safely.
   - B16.3: Alphanumeric characters in phone rejected.
   - B16.4: Indonesian phone prefixes (+62, 62, 08) accepted.
   - B16.5: Empty submit highlights $\ge 2$ invalid inputs.
   *Observation:* Runs against `contact.html`.

3. **`tests/tier3-combinations/comb-09-form-calc-sync.test.js:8-27`**:
   ```javascript
   test('C9.1 Toggling pricing calculator add-ons does not reset or corrupt contact form error validations', async ({ driver, baseUrl }) => {
     await driver.goto(`${baseUrl}/index.html`);
     const isolated = await driver.evaluate(() => {
       // Trigger invalid email in contact form if present on homepage
       const email = document.querySelector('input[type="email"], #email');
       if (email) {
         email.value = 'invalid';
         email.dispatchEvent(new Event('input', { bubbles: true }));
         email.dispatchEvent(new Event('blur', { bubbles: true }));
       }
       // Toggle calculator add-on
       const addon = document.querySelector('input[name="addon"], input[type="checkbox"]');
       if (addon) addon.click();
       return true;
     });
     expect(isolated).toBe(true);
     expect(driver.getConsoleErrors().length).toBe(0);
   });
   ```
   *Observation:* **Runs on `index.html`!** The test conditionally queries `document.querySelector('input[type="email"], #email')`. When `#contact` is added to `index.html`, this test will actively execute the validation branch. Since `index.html` already loads `js/contact.js` (line 1034), `initContactValidation()` will handle this event cleanly with 0 console errors.

4. **`tests/tier3-combinations/comb-15-form-valid-submit-cta.test.js:5-28`**:
   - Navigates to `contact.html`, fills `#name`, `#email`, `#phone`, clicks submit. Zero errors.

5. **`tests/tier4-scenarios/scen-04-mobile-consultation.test.js:16-46`**:
   - Sets mobile viewport 320x640, opens drawer on `index.html`, navigates to `contact.html` via `driver.goto(contactUrl)`, tests form validation and submission.

6. **`tests/challenger-m7-stress.js:486-516`**:
   - Explicitly loads `${baseUrl}/contact.html`.
   - Asserts empty submit errors: `#error-name` ('minimal 3 karakter'), `#error-email` ('tidak valid' / 'wajib diisi'), `#error-phone` ('08' / 'wajib diisi'), `#error-message` ('minimal 10 karakter'), and active element focus on `#name`.

---

### 1.4 Target 4: Subpages & HTTP 200 Invariants
1. **`tests/tier1-features/feat-01-architecture-http.test.js`**:
   - 1.1: `index.html` returns HTTP 200, HTML5 doctype, `lang="id"`, title includes `rubicweb`.
   - 1.2: `services.html` returns HTTP 200, viewport meta tag, title includes `rubicweb`.
   - 1.3: `portfolio.html` returns HTTP 200, viewport meta tag, title includes `rubicweb`.
   - 1.4: `contact.html` returns HTTP 200, viewport meta tag, title includes `rubicweb`.
   - 1.5: Core stylesheets (`css/style.css`, etc.) load without 404 network errors.
2. **`tests/tier1-features/feat-03-responsive-layout.test.js:3`**:
   - `PAGES = ['index.html', 'services.html', 'portfolio.html', 'contact.html']` checked across 320px, 768px, 1440px for zero horizontal overflow (`scrollWidth <= window.innerWidth`).
3. **`tests/tier3-combinations/comb-18-cross-page-clean-console.test.js:5`**:
   - Navigates sequentially through `['/index.html', '/services.html', '/portfolio.html', '/contact.html']`, asserting HTTP 200, zero console errors, zero asset 404s.
4. **`tests/reviewer-m7-2-visual-audit.js:34-39, 452-499`**:
   - Verifies all 4 pages across 6 viewports (24 combinations) with 0 horizontal overflow.
   - Verifies subpage architectural headers (`.page-hero-section`, `.breadcrumb-nav`, `.breadcrumb-text` including 'BERANDA', `.page-title`, `.page-subtitle`, telemetry/channel cards).
5. **`tests/adversarial-m7-interactive-physics.js:853`**:
   - Tests `['services.html', 'portfolio.html', 'contact.html']` for active scripts, tilt cards, and zero console errors.

*Observation:* All 4 HTML files (`index.html`, `services.html`, `portfolio.html`, `contact.html`) **MUST remain physically present on disk** and return HTTP 200 with zero console errors. The One-Page transformation applies strictly to `index.html` navigation while preserving full subpage integrity.

---

## 2. Logic Chain

```
[Observation 1.1 & 1.2]
Tests feat-03, feat-14, bnd-01, comb-08, scen-01 verify navbar presence, scroll behavior, drawer open/close, and hash targets (#services, #portfolio, #contact). Zero tests in run-e2e.js require navbar links to be "services.html" or "portfolio.html".
       │
       ▼
[Deduction 1]
Converting index.html navbar links, mobile drawer links, and floating dock links to in-page anchors (#hero, #services, #portfolio, #pricing-calculator / #pricing, #contact) causes ZERO test failures in run-e2e.js (204/204).
       │
       ▼
[Observation 1.3]
feat-04, feat-07, bnd-04, bnd-07, reviewer-m7-2 verify #hero semantics, H1 length > 10, guarantee text, WA/portfolio CTAs, 3D tilt, 1440px container width >= 1100px, and marginDiff <= 2px. Zero tests assert ".code-window", "rubicweb.engine.config.ts", or code formatting tokens.
       │
       ▼
[Deduction 2]
Replacing the right-side code window mockup with an executive Corporate Profile & Value Card (PT Rubic Kirana Solusindo, SCBD Jakarta, 100% guarantee, PageSpeed 95+, 30-day bug-free) retains 100% test compatibility, provided the card retains class ".card-tilt" and sits within ".hero-showcase-col" inside centered ".container.hero-container".
       │
       ▼
[Observation 1.4]
feat-16, bnd-16, comb-15, scen-04, challenger-m7-stress test contact form directly on "contact.html". comb-09 tests "index.html" conditionally for input[type="email"]. index.html already loads js/contact.js.
       │
       ▼
[Deduction 3]
Adding a dedicated in-page #contact section with form#contact-form to index.html will be seamlessly handled by js/contact.js, fulfilling user feedback and making comb-09 pass cleanly with 0 console errors.
       │
       ▼
[Observation 1.5 & Critical Finding]
All 4 HTML files are asserted across multiple suites for HTTP 200 and 0 console errors. challenger-m5-2-deep-verification.js line 270 queries ".mobile-menu a[href*='services.html']".
       │
       ▼
[Deduction 4]
Subpages (services.html, portfolio.html, contact.html) must remain on disk. challenger-m5-2-deep-verification.js line 270 should be broadened to query ".mobile-menu a[href*='services.html'], .mobile-menu a[href*='services']" to guarantee 100% pass rate in adversarial stress runs as well.
```

---

## 3. Caveats

1. **Subpage Preservation**:
   Although `index.html` transforms into a One-Page smooth-scrolling experience, `services.html`, `portfolio.html`, and `contact.html` **must not be deleted, renamed, or modified into redirects**. Automated tests (`feat-01`, `feat-03`, `comb-18`, `reviewer-m7-2`, `adversarial-m7`) load them directly via URL.
2. **Smooth Scroll Offset & Sticky Navbar**:
   When clicking in-page anchors, the target section heading must not be hidden behind the sticky navbar. CSS `scroll-margin-top: 100px;` (or dynamic calculation `targetOffset = target.getBoundingClientRect().top + window.scrollY - headerOffset`) must be applied to all section IDs (`#hero`, `#services`, `#stats`, `#portfolio`, `#pricing-calculator`, `#contact`, `#testimonials`, `#faq`).
3. **Double Form Validation Handlers**:
   Since `js/contact.js` binds to `.consultation-form, .contact-form, #contact-form` on `DOMContentLoaded`, having `#contact-form` on both `index.html` and `contact.html` is completely safe because each page is an independent DOM document.
4. **Hero Subheadline Character Bounds**:
   In `tests/reviewer-m7-2-visual-audit.js:434`, `.hero-subheadline` text length is strictly asserted to be between 30 and 150 characters (`copyMetrics.heroSubLength <= 150 && copyMetrics.heroSubLength > 30`). Any updates to Hero copy must respect this length invariant (current length is 94 characters).
5. **No caveats** regarding browser support: headless Chrome and Edge CDP drivers support CSS smooth scrolling and `scroll-margin-top` natively.

---

## 4. Conclusion & Test Compatibility Plan

### Summary Table of Test Expectations & Action Plan

| Test File / Harness | Existing Assertion / Query | Milestone 8 Impact | Compatibility Action Plan | Expected Result |
|---|---|---|---|---|
| `feat-01-architecture-http.test.js` | HTTP 200 on all 4 pages (`index`, `services`, `portfolio`, `contact`) | None | Retain all 4 files on disk with valid doctype and meta tags | **PASS (5/5)** |
| `feat-03-responsive-layout.test.js:82` | `header nav a, .floating-bottom-nav a, .navbar a >= 3` | None | Desktop navbar has 5 links (`#hero`, `#services`, `#portfolio`, `#pricing`, `#contact`) | **PASS (5/5)** |
| `feat-04-hero-section.test.js` | Checks `#hero`, `h1`, guarantee copy, WA CTA, portfolio CTA | None | Executive Corporate Profile Card preserves all hero elements & CTAs | **PASS (5/5)** |
| `feat-07-3d-tilt-cards.test.js` | Checks `.card-tilt` mousemove rotate/perspective | None | Corporate Profile Card retains `.card-tilt interactive-card` classes | **PASS (5/5)** |
| `feat-14-navbar-mobile-drawer.test.js` | Tests toggle open/close, `.navbar--scrolled`, body scroll lock | None | Mobile drawer structure and classes (`.mobile-menu`, `.is-open`, `no-scroll`) preserved | **PASS (5/5)** |
| `feat-16-contact-form-validation.test.js` | Runs on `contact.html` | None | `contact.html` remains intact with full validation | **PASS (5/5)** |
| `bnd-01-navigation-routing.test.js:25` | Asserts `document.getElementById('contact')` exists on `index.html` | Positive | Replace placeholder dummy `div#contact` with semantic `section#contact` | **PASS (5/5)** |
| `comb-08-drawer-hash-navigation.test.js:14` | Queries `.mobile-menu a[href*="portfolio"]` | None | Substring `portfolio` matches `#portfolio` | **PASS (1/1)** |
| `comb-09-form-calc-sync.test.js:8` | Queries `index.html` for `input[type="email"], #email` | Positive | `#contact` on `index.html` provides `#email`; `js/contact.js` validates cleanly | **PASS (1/1)** |
| `scen-01-discovery-to-workflow.test.js:12` | Queries `a[href*="services"], a[href="#services"]` | None | Substring matches `#services` directly | **PASS (1/1)** |
| `scen-04-mobile-consultation.test.js:16` | Opens drawer on `index.html`, navigates to `contact.html` | None | Both drawer toggle and `contact.html` remain fully operational | **PASS (1/1)** |
| `challenger-m5-2-deep-verification.js:270` | Queries `.mobile-menu a[href*="services.html"]` | Warning | Update selector to `.mobile-menu a[href*="services.html"], .mobile-menu a[href*="services"]` | **PASS (100%)** |
| `reviewer-m7-2-visual-audit.js:315-345` | Hero width $\ge 1100$px, centering diff $\le 2$px, subheadline length 30–150 | None | Keep Hero card inside `.hero-showcase-col` with balanced layout & concise copy | **PASS (55/55)** |
| `adversarial-m7-interactive-physics.js` | 8 physics & stress suites across `index.html` and subpages | None | Full interactive physics invariants maintained | **PASS (57/57)** |

---

## 5. Verification Method

To independently verify the test suite and confirm 100% compliance during and after Worker implementation:

### 5.1 Commands to Execute
1. **Master E2E Test Suite (Mandatory Gate)**:
   ```powershell
   node tests/run-e2e.js
   ```
   *Success Condition:* Total Suites: 60, Total Tests: 204, Passed: 204, Failed: 0, Exit Code: 0.

2. **Adversarial Interactive Physics Stress Suite**:
   ```powershell
   node tests/adversarial-m7-interactive-physics.js
   ```
   *Success Condition:* Total checks: 57, Passed: 57, Failed: 0, Verdict: APPROVE, Exit Code: 0.

3. **Adversarial Systems Suite**:
   ```powershell
   node tests/adversarial-m5-verification.js
   ```
   *Success Condition:* All 6 systems PASS, Final Verdict: APPROVE, Exit Code: 0.

4. **Independent Visual & Multi-Viewport Responsive Matrix**:
   ```powershell
   node tests/reviewer-m7-2-visual-audit.js
   ```
   *Success Condition:* Total Assertions: 55, Passed: 55, Failed: 0, Overall Verdict: APPROVE, Exit Code: 0.

### 5.2 Specific Checks for Smooth Scrolling & Anchor Landing
In addition to automated runner execution, verify:
- Inspect `index.html`:
  * Desktop navbar links: `<a href="#hero">`, `<a href="#services">`, `<a href="#portfolio">`, `<a href="#pricing-calculator">`, `<a href="#contact">`.
  * Mobile drawer links: `<a href="#hero">`, `<a href="#services">`, `<a href="#portfolio">`, `<a href="#pricing-calculator">`, `<a href="#contact">`.
  * Floating pill nav links: `<a href="#hero">`, `<a href="#services">`, `<a href="#portfolio">`, `<a href="#pricing-calculator">`, `<a href="#contact">`.
- Inspect `css/style.css`:
  * `html { scroll-behavior: smooth; }`
  * `section[id], .section-padding[id], #hero, #services, #stats, #portfolio, #pricing-calculator, #contact, #testimonials, #faq { scroll-margin-top: 100px; }`
- Invalidation Condition:
  * Any test failure in `tests/run-e2e.js` (less than 204/204 passed).
  * Any horizontal overflow on 320px viewport across any of the 4 pages.
  * Any HTTP 404 on `services.html`, `portfolio.html`, or `contact.html`.
