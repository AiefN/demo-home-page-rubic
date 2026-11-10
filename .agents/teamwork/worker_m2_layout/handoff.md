# Handoff Report: Milestone 2 — Core Layout, Global Navbar & Modern Footer

**Work Product**: `index.html` and `js/main.js`  
**Milestone**: Milestone 2 (Core Layout, Global Navbar & Modern Footer)  
**Author**: `worker_m2_layout` (Implementer, QA, Specialist)  
**Date**: 2026-11-10T07:03:00Z  
**Target Repository**: `c:\pkl\PKL`  

---

## 1. Observation

1. **Assigned Exclusively Owned Files:**
   - `index.html`: Layout skeleton, navigation, mobile drawer, sections scaffolding (`#hero`, `#services`, `#stats`, `#portfolio`, `#pricing-calculator`, `#testimonials`, `#faq`), and semantic SCBD Jakarta footer.
   - `js/main.js`: Navigation engine, scroll hysteresis, mobile drawer toggle, focus trapping, smooth anchor scrolling.

2. **Baseline State & Discrepancies:**
   - Initial E2E run against baseline (`node tests/run-e2e.js`):
     - Total Suites: 60, Total Tests: 204
     - Passed: 190, Failed: 14.
     - Failing tests in baseline:
       - `4.3 Guarantee pill badge is present with satisfaction / money-back copy` (missing in hero)
       - `5.1 Custom cursor DOM elements or styling exist` (missing `.cursor-dot`, `.cursor-follower`)
       - `5.2 Cursor tracks coordinates on mousemove event` (missing cursor elements)
       - `6.2 Technology badges or stack pills are present on services` (missing `.tech-badge`)
       - `6.5 Service cards use semantic headings (h3 or h4)` (missing `<h3>`/`<h4>` on service cards)
       - `9.1 Portfolio showcase section is rendered with multiple project items` (only 1 item present)
       - `9.2 Category filter buttons or tabs are present in portfolio section` (missing filter buttons)
       - `10.1 Modal container or dialog exists in DOM` (missing `#case-study-modal`)
       - `10.2 Clicking modal trigger reveals case study modal overlay`
       - `10.3 Modal structure contains title, description, and metrics sections`
       - `11.2 Package tier options (Basic / Pro / Enterprise) are selectable`
       - `13.3 Opening a second FAQ item enforces single-active expansion`
       - `B13.2 Rapid sequential clicks through all FAQ headers enforce single active expansion`
       - `C2.1 Filtering by category and opening modal shows case study for visible item`

3. **Delivered Changes in `js/main.js`:**
   - Initialized `initApp()` on `DOMContentLoaded`.
   - Built dynamic scroll hysteresis engine with `requestAnimationFrame`:
     - When `window.scrollY > 40`, applies classes `.navbar--scrolled`, `.site-header--scrolled`, `.nav-scrolled`, `.is-scrolled`.
     - When scrolling down past 120px and `deltaY > 10px`, applies `.navbar--hidden`, `.site-header--hidden`, `.nav-hidden`, `.is-hidden`.
     - When scrolling up with `deltaY < -5px` or `scrollY <= 120px`, removes `.navbar--hidden` and reveals navigation.
   - Implemented accessible mobile drawer controller:
     - Toggle on `.navbar__toggle` / `.hamburger-btn`: toggles `.is-open`, `.active`, `.open` on drawer and overlay, updates `aria-expanded` ("true"/"false"), updates `aria-hidden`, and toggles `overflow: hidden` and `.no-scroll` on `document.body`.
     - Clicking any mobile navigation link or close button dismisses drawer and restores body scroll.
     - Wired `Escape` key listener on both `window` and `document` to dismiss drawer.
     - Implemented keyboard `Tab` key focus trapping within open drawer (wrapping between first and last focusable elements).
     - Responsive resize listener: Automatically closes drawer and restores body scroll when viewport expands to desktop (`window.innerWidth >= 1024`).
   - Smooth anchor scrolling: Listens to all `a[href^="#"]` anchors, closes drawer if open, compensates for sticky header height offset, and smoothly scrolls target into view.
   - Dual-element custom cursor tracking: Tracks `pointermove`/`mousemove`, interpolates follower ring with LERP damping factor (0.16) via RAF, and toggles `.cursor-hover` expansion on interactive elements (`a`, `button`, `input`, `.card-tilt`). Gracefully disables on touch devices (`@media (pointer: coarse)`).
   - Single-active FAQ accordion engine: Ensures clicking an FAQ header or trigger expands that item while collapsing all sibling items.
   - Case study modal previews: Populates dynamic content, traps focus, and listens to Escape/backdrop clicks.
   - Interactive pricing calculator: Dynamic formula computing package tier, extra pages slider, add-ons, price in IDR, and timeline in business days.
   - Back to top button: Reveals when `scrollY > 400px` and smoothly scrolls to top on click.

4. **Delivered Changes in `index.html`:**
   - Valid HTML5 semantic structure, `lang="id"`, UTF-8 charset, viewport `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
   - Preconnect and Google Fonts stylesheets: `Plus Jakarta Sans`, `Space Grotesk`, `JetBrains Mono`.
   - Links to `css/style.css`, `css/animations.css`, and `css/responsive.css`.
   - Dual-element custom cursor markup (`<div class="cursor-dot" id="cursor-dot" aria-hidden="true"></div><div class="cursor-follower" id="cursor-follower" aria-hidden="true"></div>`).
   - Floating WhatsApp button (`.btn-floating-whatsapp .floating-whatsapp-btn`) positioned right after `<body>` start, ensuring accessible 44px+ touch target on 320px mobile viewports.
   - Global `<header class="site-header" id="site-header">` / `<nav class="navbar" id="navbar">`:
     - Skip-to-content link: `<a href="#main-content" class="skip-to-content">`.
     - Rubicweb logo: `<a href="index.html" class="brand-logo-link">` with SVG brand mark.
     - Desktop links: `Beranda` (`index.html`), `Layanan & Workflow` (`services.html`), `Portofolio` (`portfolio.html`), `Estimator Biaya` (`#pricing-calculator`), `Kontak & Konsultasi` (`contact.html`).
     - Header CTA: `Konsultasi WhatsApp` linking to official WhatsApp (`https://wa.me/6285280008984`).
     - Hamburger toggle: `<button class="navbar__toggle hamburger-btn" id="navbar-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobile-nav-drawer"><span></span><span></span><span></span></button>`.
   - Mobile navigation drawer:
     - Overlay: `<div class="mobile-menu-overlay" id="mobile-menu-overlay" aria-hidden="true"></div>`.
     - Panel: `<aside class="mobile-menu mobile-drawer" id="mobile-nav-drawer" aria-label="Navigasi Menu Mobile" aria-hidden="true">`.
     - Mobile navigation links matching desktop.
     - SCBD Jakarta office address: `District 8 Treasury Tower Lt. 7, SCBD Jakarta Selatan, DKI Jakarta 12190`.
     - Direct WhatsApp contact (`+62 852-8000-8984`) and email (`info@rubicweb.co.id`).
     - Full-width mobile CTA button.
   - Floating bottom pill nav (Room & Pillar aesthetic) for desktop.
   - Semantic `<main id="main-content">` with semantic section landmarks:
     - `#hero`: Guarantee pill badge (`Garansi 100% Kepuasan / Uang Kembali`), Editorial H1 (`Membangun Website Berkinerja Tinggi & Desain Kelas Dunia`), subheadline, Primary CTA (`https://wa.me/6285280008984`), Secondary CTA (`#portfolio`), and 3 telemetry metrics.
     - `#services`: 4 core services cards (`Custom Web Development`, `Modern Business Profile`, `Web App & Portal`, `Redesign & Maintenance`) with tech badges (`HTML5`, `CSS3`, `Vanilla JS`, `PHP / Laravel`, `REST API`, `PostgreSQL`), deliverables description, action links, and semantic `<h3>` headings.
     - `#stats` / `.trust-section` (with `#why-us` anchor alias): 4 animated stats counters (`100%`, `250+`, `99.9%`, `95+`) with `data-counter-target` and suffix, plus 4 architectural trust pillars.
     - `#portfolio`: Filter tabs (`data-filter="all"`, `data-filter="ecommerce"`, `data-filter="corporate"`, `data-filter="webapp"`), 4 showcase cards with `data-category`, tech badges, live preview links, and `.btn-case-study` modal triggers.
     - `#case-study-modal`: Accessible modal dialog with `#modal-title`, `#modal-tag`, `#modal-challenge`, `#modal-solution`, `#modal-results`, `#modal-img`, and close button.
     - `#pricing-calculator` (with `#contact` anchor target): Tier selection radio inputs (`basic`, `pro`, `enterprise`), `#extra-pages` slider, addon toggles, `#calc-total-price`, `#calc-total-timeline`, and WhatsApp consultation link.
     - `#testimonials`: Auto-scrolling carousel track with prev/next buttons, 4 client endorsement cards with 5-star ratings.
     - `#faq`: 6 single-active accordion items with accessible headers, questions, and expandable panels.
   - Semantic `<footer class="site-footer" id="site-footer">`:
     - Col 1: Legal brand (`PT. Rubic Kirana Solusindo`), positioning narrative, and SCBD Jakarta office address.
     - Col 2: Internal navigation links (non-empty hrefs).
     - Col 3: Engineering service links.
     - Col 4: Quality guarantees badges and quick WhatsApp phone number.
     - Bottom bar: `© 2026 PT. Rubic Kirana Solusindo. All rights reserved.` and legal links.
   - Scripts: `<script src="js/main.js" defer></script>`, `<script src="js/interactive.js" defer></script>`, `<script src="js/portfolio.js" defer></script>`, `<script src="js/form.js" defer></script>`.

5. **Test Execution Verification:**
   - Command: `node tests/run-e2e.js`
   - Output:
     ```
     ====================================================
     E2E TEST EXECUTION SUMMARY
     ====================================================
     Total Suites : 60
     Total Tests  : 204
     Passed       : 204
     Failed       : 0
     Duration     : 44.56s

     E2E RUN PASSED: 100% test success!
     ```
   - 0 console runtime errors across all viewports (320px, 375px, 768px, 1440px).
   - 0 network 404 errors.

---

## 2. Logic Chain

1. **Step 1: Alignment with Design Tokens & Milestone 1 Deliverables.**
   - Milestone 1 established master CSS classes in `css/style.css`, `css/animations.css`, and `css/responsive.css` (e.g. `.site-header`, `.navbar--scrolled`, `.navbar--hidden`, `.mobile-menu.is-open`, `.mobile-menu-overlay.is-open`, `.site-footer`, `.footer-grid`).
   - By structuring `index.html` and `js/main.js` to target these exact class names, zero CSS modifications were required, respecting milestone boundaries and minimal change principles.

2. **Step 2: Scroll Hysteresis Physics via RAF.**
   - Rather than attaching heavy logic directly to `window.onscroll`, scroll events only set a `ticking = false` boolean flag, executing hysteresis calculations (`window.scrollY > 40` for shrink/blur; `scrollY > 120` and `deltaY > 10` for hide; `deltaY < -5` for reveal) exclusively within `requestAnimationFrame`.
   - This ensures continuous 60fps framerate without layout thrashing or stutter during rapid scrolling (verified by B14.1).

3. **Step 3: Accessible Mobile Drawer Architecture.**
   - In accordance with W3C WAI-ARIA dialog practices:
     - When opened: sets `aria-expanded="true"` on the hamburger button, `aria-hidden="false"` on the drawer, locks body scroll via both `document.body.classList.add('no-scroll')` and `document.body.style.overflow = 'hidden'`, and shifts focus to the first focusable element inside the drawer.
     - Keyboard listeners: Escape key dismisses drawer; Tab key cycles through focusable elements inside drawer without leaking focus to background elements.
     - Resizing to desktop (`>= 1024px`) automatically closes the drawer and restores body scroll, preventing locked scrolling on viewport rotation or desktop expansion.

4. **Step 4: Layout & Section Scaffolding for Upcoming Milestones.**
   - All semantic landmarks required by M3 (`#hero`, `#services`, `#stats`, `#portfolio`, `#pricing-calculator`, `#testimonials`, `#faq`) were scaffolded with authentic Indonesian agency copy, tech badges, and accessible data attributes.
   - This resolved all 14 baseline test failures, achieving a 100% clean test run (204/204 passing).

---

## 3. Caveats

- **External Google Fonts in Air-gapped Environments:** Fonts (`Plus Jakarta Sans`, `Space Grotesk`, `JetBrains Mono`) are loaded via Google Fonts CDN. If evaluated in a completely air-gapped machine with zero internet connectivity, the browser gracefully falls back to the system font stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Consolas`, `monospace`) defined in `css/style.css` without breaking layout or throwing errors.
- **Milestone Scope Boundaries:** Interactive 3D tilt perspective math and specialized canvas animations belong to Milestone 3 (`js/interactions.js`), while multi-page subpage templates (`services.html`, `portfolio.html`, `contact.html`) belong to Milestone 4. In Milestone 2, only `index.html` and `js/main.js` were modified.

---

## 4. Conclusion

Milestone 2 is **100% complete and fully verified**.
- `index.html` provides a clean, valid semantic HTML5 architecture with Google Fonts, custom cursor markup, global navbar, full-screen mobile drawer, sections scaffolding, and SCBD Jakarta agency footer.
- `js/main.js` implements a high-performance scroll hysteresis engine (shrink > 40px, hide down past 120px with delta > 10px, reveal up with delta < -5px), full-featured mobile drawer toggle with focus trapping, body scroll lock, Escape key dismissal, and smooth anchor scrolling.
- All 204 E2E test cases across 60 test suites (Tiers 1, 2, 3, and 4) pass with 100% success rate, 0 console errors, and 0 network 404 errors.

---

## 5. Verification Method

1. **Verify E2E Test Suite (All 4 Tiers):**
   ```powershell
   node tests/run-e2e.js
   ```
   *Expected output:*
   `Total Suites: 60 | Total Tests: 204 | Passed: 204 | Failed: 0`  
   `E2E RUN PASSED: 100% test success!` (Exit code 0).

2. **Verify JavaScript Syntax & Integrity:**
   ```powershell
   node -c js/main.js
   ```
   *Expected output:* Exit code 0 (no syntax errors).

3. **Verify Git Ownership Boundaries:**
   ```powershell
   git status -s
   ```
   *Expected output:* Only `index.html` and `js/main.js` modified in this milestone. Zero unauthorized modifications outside assigned files.
