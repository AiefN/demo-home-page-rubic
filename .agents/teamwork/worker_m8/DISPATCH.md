## 2026-11-11T07:52:20Z
You are worker_m8. Your task is to execute the implementation of Milestone 8: Hero Executive Company Profile Card and One-Page In-Page Anchor Navigation Architecture.

MANDATORY FIRST STEP:
Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md` in full before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

WORKING DIRECTORY: c:\pkl\PKL
STATE FOLDER: c:\pkl\PKL\.agents\teamwork\worker_m8\
SCOPE DOCUMENT: c:\pkl\PKL\.agents\teamwork\orchestrator_gen6\SCOPE.md

FILES YOU OWN EXCLUSIVELY:
- `index.html`
- `css/style.css`
- `js/main.js`
- `services.html`
- `portfolio.html`
- `contact.html`
- `tests/challenger-m5-2-deep-verification.js`

DETAILED EXPLORER BLUEPRINTS (READ THESE BEFORE CODING):
1. `c:\pkl\PKL\.agents\teamwork\explorer_m8_1\handoff.md` (Hero Corporate Profile Card HTML5 & CSS rules)
2. `c:\pkl\PKL\.agents\teamwork\explorer_m8_2\handoff.md` (One-page anchor links, #contact section markup, scroll-margin-top: 100px, initScrollSpy in js/main.js)
3. `c:\pkl\PKL\.agents\teamwork\explorer_m8_3\handoff.md` (Test compatibility and invariants analysis)

CONCRETE TASKS:

Task 1: Replace Hero Showcase Card in `index.html` with Executive Corporate Profile & Value Card
- In `index.html` (lines ~186–228), replace the code editor window (`.hero-showcase-card.card-tilt.interactive-card`) containing `rubicweb.engine.config.ts` and `rubicwebStack` with the Executive Company Profile & Corporate Value Card:
  * Retain outer classes: `<article class="hero-showcase-card corporate-profile-card card-tilt interactive-card" aria-label="Profil Eksekutif & Kredensial Korporasi PT Rubic Kirana Solusindo">`
  * Corporate header with monogram, "PT RUBIC KIRANA SOLUSINDO", "EST. 2020 • LEGAL ENTITY", and status pill "VERIFIED AGENCY" with pulsating beacon (`badge-pulse-dot`).
  * Corporate headline group: category "CORPORATE CREDENTIALS", H2 "Boutique Web & Digital Engineering Agency", description "Mitra strategis rekayasa web kustom dan sistem digital enterprise berskala nasional dengan garansi kepuasan mutlak."
  * 5 Core Guarantees with pristine SVG icons:
    1. 100% Garansi Uang Kembali (Jaminan kepuasan mutlak atau pengembalian investasi penuh tanpa risiko)
    2. 100% Kepemilikan Source Code (Penyerahan seluruh kode sumber & aset digital tanpa keterikatan vendor)
    3. 250+ Proyek Nasional Selesai (Dipercaya oleh korporasi, institusi, dan enterprise terkemuka di Indonesia)
    4. Core Web Vitals 95+ & 99.9% SLA (Arsitektur kode ultra-cepat berstandar Google dengan reliabilitas server tinggi)
    5. 30-Day Bug-Free Guarantee (Garansi perbaikan bebas bug & pengawalan teknis pasca-peluncuran)
  * Obsidian metrics ribbon: 100% Garansi Kepuasan, 95+ PageSpeed, 250+ Proyek Nasional.
  * Location footprint: "District 8 Treasury Tower Lt. 7, SCBD Jakarta".
  * Add the CSS styling to `css/style.css` (see section 4.2 of explorer_m8_1/handoff.md).

Task 2: Convert `index.html` to One-Page In-Page Anchor Navigation
- Desktop Header (`.nav-links`):
  * "Beranda" -> `href="#hero"`
  * "Layanan & Workflow" -> `href="#services"`
  * "Portofolio" -> `href="#portfolio"`
  * "Estimator Biaya" -> `href="#pricing-calculator"`
  * "Kontak & Konsultasi" -> `href="#contact"`
- Mobile Menu Drawer (`.mobile-nav-links`):
  * Same anchor mapping (`#hero`, `#services`, `#portfolio`, `#pricing-calculator`, `#contact`).
  * Add the fallback utility container for crawler & test compatibility:
    `<div class="mobile-drawer__subpage-fallbacks" style="display:none;" aria-hidden="true"><a href="services.html">services.html</a><a href="portfolio.html">portfolio.html</a><a href="contact.html">contact.html</a></div>`
- Floating Bottom Nav (`.floating-nav-links`):
  * Same anchor mapping (`#hero`, `#services`, `#portfolio`, `#pricing-calculator`, `#contact`).
  * CTA link: `<a href="#contact" class="floating-nav-cta"><span>Konsultasi &rarr;</span></a>`
- Section Anchors Cleanup:
  * In `index.html` lines ~581–584, remove the dummy `<div id="contact" ...>` inside `#pricing-calculator` and keep `<div id="pricing" class="anchor-target" aria-hidden="true"></div>`.

Task 3: Integrate Dedicated `#contact` Section on `index.html`
- In `index.html`, right after Section 7 (`#faq`) and before `</main>`:
  * Insert `<section class="contact-section consultation-section section-padding" id="contact">` using the exact markup from Section 4.2 of `explorer_m8_2/handoff.md`.
  * Ensure it contains:
    - Operational channels grid (WhatsApp, Email, SCBD Jakarta).
    - `#form-success-banner` with WhatsApp follow-up CTA.
    - `<form class="consultation-form contact-form" id="contact-form" novalidate>`
    - All input fields: `#name`, `#company`, `#email`, `#phone`, `#package` (select with options), `#message` (textarea).
    - Validation error divs: `#error-name`, `#error-email`, `#error-phone`, `#error-package`, `#error-message`.
    - Submit button: `#btn-submit-consultation` / `.btn-submit`.

Task 4: Smooth Scrolling, CSS Offsets & Scroll Spy
- In `css/style.css`:
  * Add:
    ```css
    html {
      scroll-behavior: smooth;
    }
    #hero, #services, #stats, #portfolio, #pricing-calculator, #pricing, #testimonials, #faq, #contact, #site-footer, .anchor-target, section[id] {
      scroll-margin-top: 100px;
    }
    ```
- In `js/main.js`:
  * Update `initSmoothAnchors()` to close mobile drawer cleanly without scroll-jumping and scroll smoothly with header offset.
  * Add `initScrollSpy()` with `IntersectionObserver` (`rootMargin: '-20% 0px -60% 0px'`) and scroll boundary fallback to dynamically highlight the active navbar link (`.active`).
  * Call `initScrollSpy()` in `initApp()`.

Task 5: Subpages Alignment & Test Selector Flexibility
- In `services.html`, `portfolio.html`, `contact.html`:
  * Update navigation links to point back to homepage anchors: `index.html#hero`, `index.html#services`, `index.html#portfolio`, `index.html#pricing-calculator`, `index.html#contact`.
  * Keep all 3 subpages intact on disk.
- In `tests/challenger-m5-2-deep-verification.js` line 270:
  * Broaden selector: `.mobile-menu a[href*="services.html"], .mobile-menu a[href*="services"]`.

Task 6: Verification & Test Execution
- Run:
  1. `node tests/run-e2e.js` (MUST PASS 204/204 with 0 errors)
  2. `node tests/adversarial-m7-interactive-physics.js` (MUST PASS 57/57)
  3. `node tests/adversarial-m5-verification.js` (MUST PASS 6/6)
  4. `node tests/reviewer-m7-2-visual-audit.js` (MUST PASS 55/55)

DELIVERABLE:
Write a comprehensive report to `c:\pkl\PKL\.agents\teamwork\worker_m8\handoff.md` detailing:
- Observation (what was changed)
- Logic Chain
- Caveats
- Conclusion
- Verification results (test outputs, command logs, 204/204 pass)
Send a message when finished.


## 2026-11-11T08:08:39Z
[From orchestrator]: Checking in on your progress. It has been over 10 minutes since your last progress.md update. Are you currently editing index.html/css/js or running test suites?
