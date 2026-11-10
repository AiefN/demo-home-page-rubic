# Remediation Investigation Report: HTML Markup, Script Inclusions & Ripple Animation

**Author**: Explorer 3 (`explorer_m5_remediation_3`)  
**Mission**: Milestone 5 Remediation Analysis — HTML Markup, Canonical Script Inclusions & Modal Modularization  
**Date**: 2026-11-10T07:53:00Z  
**Verdict**: **REMEDIATION STRATEGY DEFINED & READY FOR IMPLEMENTATION**  

---

## Executive Summary

This investigation analyzed the HTML markup and script inclusions across all four canonical pages (`index.html`, `services.html`, `portfolio.html`, `contact.html`) to formulate precise, non-breaking remediation steps for the issues highlighted in Gate Status Iteration 0 and Reviewer 1's report:
1. **Missing `whatsapp-ripple` on `index.html:36`**: The floating WhatsApp CTA on `index.html` omitted the `whatsapp-ripple` CSS class, disabling `@keyframes ripple` (computed `animationName` returns `'none'`). All three subpages already include this class.
2. **Deprecated `js/form.js` on `index.html:987`**: `index.html` links legacy `js/form.js` which searches for non-existent IDs (`#toggle-form-btn`, `#collapsible-form-wrapper`), while omitting the canonical `js/contact.js` required by R1 and R2.5 for pricing estimator synchronization.
3. **Deprecated `js/interactive.js` across Subpages**: `services.html:793`, `portfolio.html:616`, and `contact.html:559` load legacy `js/interactive.js` which only queries `.portfolio-preview-card`. Consequently, 21 `.card-tilt` elements across subpages (10 on `services.html`, 7 on `portfolio.html`, 4 on `contact.html`) are left without 3D perspective tilt or specular border glare.
4. **Large Inline `<script>` Block on `services.html:671-787`**: 117 lines of inline service detail modal dialog JavaScript violate R4 and the architectural principle of strict separation of concerns.

Concrete before-and-after diffs and step-by-step implementation plans have been constructed below.

---

## 5-Component Handoff Report

### 1. Observation

#### Observation 1.1: Missing `whatsapp-ripple` on `index.html:36`
Direct inspection of `index.html:34-38`:
```html
  <!-- ==========================================================================
       FLOATING WHATSAPP BUTTON WITH CONTINUOUS RIPPLE ANIMATION
       ========================================================================== -->
  <a href="https://wa.me/6285280008984?text=Halo%20Rubicweb,%20saya%20ingin%20konsultasi%20pembuatan%20website%20berkinerja%20tinggi." class="btn-floating-whatsapp floating-whatsapp-btn" target="_blank" rel="noopener noreferrer" aria-label="Konsultasi WhatsApp Langsung">
    <img src="assets/icons/whatsapp.svg" alt="WhatsApp Icon" width="28" height="28">
  </a>
```
Contrasted with the corresponding lines on the other three pages:
- `services.html:36`: `class="btn-floating-whatsapp floating-whatsapp-btn whatsapp-ripple"`
- `portfolio.html:36`: `class="btn-floating-whatsapp floating-whatsapp-btn whatsapp-ripple"`
- `contact.html:36`: `class="btn-floating-whatsapp floating-whatsapp-btn whatsapp-ripple"`

In `css/animations.css:216-218`:
```css
/* WhatsApp Continuous Ripple Pulse */
.whatsapp-ripple {
  animation: ripple 2.2s infinite cubic-bezier(0.4, 0, 0.2, 1);
}
```
And `css/animations.css:12-27`:
```css
/* Continuous Ripple Wave (WhatsApp Floating CTA & Live Beacon) */
@keyframes ripple {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.65), 0 0 0 0 rgba(210, 254, 113, 0.4);
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
  }
  70% {
    box-shadow: 0 0 0 18px rgba(37, 211, 102, 0), 0 0 0 28px rgba(210, 254, 113, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0), 0 0 0 0 rgba(210, 254, 113, 0);
    transform: scale(1);
  }
}
```
Because `whatsapp-ripple` is omitted on `index.html:36`, `window.getComputedStyle(btn).animationName` evaluates to `'none'`, directly failing authentic assertion of Requirement R3.3 / Acceptance Criteria.

#### Observation 1.2: Deprecated `js/form.js` on `index.html:987`
In `index.html:984-988`:
```html
  <script src="js/main.js" defer></script>
  <script src="js/interactions.js" defer></script>
  <script src="js/portfolio.js" defer></script>
  <script src="js/form.js" defer></script>
```
In `js/form.js:9-16`:
```javascript
function initCollapsibleForm() {
  const toggleBtn = document.getElementById('toggle-form-btn');
  const toggleBtnText = document.getElementById('toggle-form-btn-text');
  const closeBtn = document.getElementById('close-form-btn');
  const formWrapper = document.getElementById('collapsible-form-wrapper');

  if (!toggleBtn || !formWrapper) return;
  ...
}
```
Neither `#toggle-form-btn` nor `#collapsible-form-wrapper` exists in `index.html`. `js/form.js` is an orphaned prototype script. Meanwhile, `ORIGINAL_REQUEST.md:23` specifies:
> `js/`: `main.js` (core layout, navbar, mobile drawer), `interactions.js` (custom cursor, 3D tilt, parallax, stats counters, accordion, carousel), `portfolio.js` (filtering, modals), and `contact.js` (inline validation, dynamic pricing calculator).

And `index.html:534-644` contains the `#pricing-calculator` widget, whose canonical driver is `initDynamicPricing()` inside `js/contact.js:216-360`.

#### Observation 1.3: Deprecated `js/interactive.js` on Subpages & 21 Disabled `.card-tilt` Elements
In the subpages:
- `services.html:792-794`:
  ```html
  <script src="js/main.js" defer></script>
  <script src="js/interactive.js" defer></script>
  ```
- `portfolio.html:615-617`:
  ```html
  <script src="js/main.js" defer></script>
  <script src="js/interactive.js" defer></script>
  <script src="js/portfolio.js" defer></script>
  ```
- `contact.html:558-560`:
  ```html
  <script src="js/main.js" defer></script>
  <script src="js/interactive.js" defer></script>
  <script src="js/contact.js" defer></script>
  ```

In `js/interactive.js:128-132`:
```javascript
function initPortfolioTilt() {
  const card = document.querySelector('.portfolio-preview-card');
  if (!card) return;
  ...
}
```
`js/interactive.js` only attempts to bind tilt to a single element with class `.portfolio-preview-card`.

However, the subpages contain a total of 21 `.card-tilt` elements that require 3D perspective tilt:
1. `services.html` (10 elements):
   - Line 193: `<article class="service-detail-card card-tilt" id="custom-web-development">`
   - Line 238: `<article class="service-detail-card card-tilt" id="modern-business-profile">`
   - Line 282: `<article class="service-detail-card card-tilt" id="web-app-portal">`
   - Line 327: `<article class="service-detail-card card-tilt" id="redesign-maintenance">`
   - Lines 391, 411, 431, 451, 471, 491: 6x `<div class="timeline-step workflow-step card-tilt">`
2. `portfolio.html` (7 elements):
   - Lines 199, 234, 269, 304, 339, 373, 407: 7x `<article class="portfolio-card card-tilt">`
3. `contact.html` (4 elements):
   - Lines 426, 434, 442, 450: 4x `<div class="trust-pillar-card card-tilt">`

Because subpages load `js/interactive.js` instead of `js/interactions.js`, none of these 21 elements receive mousemove listeners for 3D tilt, nor do they set `--mouse-x` / `--mouse-y` for specular radial glare.

In contrast, `js/interactions.js:137-140` targets:
```javascript
const cards = document.querySelectorAll('.card-tilt, .interactive-spotlight, .service-card, .portfolio-card, [data-tilt]');
```

#### Observation 1.4: Inline Service Modal Script on `services.html:671-787`
In `services.html:671-787`:
A 117-line `<script>` tag is embedded inline containing `serviceData` object mapping (`custom-web`, `business-profile`, `web-app`, `redesign-maintenance`), `openModal(id)`, `closeModal()`, event listeners for `.btn-service-modal`, backdrop click, and Escape key.
This violates the zero-inline-script constraint of R4 and `PROJECT.md`.

---

### 2. Logic Chain

1. **Ripple Animation Execution**:
   - `css/animations.css:216-218` attaches `animation: ripple 2.2s infinite ...` strictly to the selector `.whatsapp-ripple`.
   - On `index.html:36`, the anchor tag has `class="btn-floating-whatsapp floating-whatsapp-btn"`.
   - Adding `whatsapp-ripple` to `index.html:36` restores parity with `services.html`, `portfolio.html`, and `contact.html`.
   - As a direct result, `window.getComputedStyle(btn).animationName` evaluates to `'ripple'`, satisfying R3.3 and allowing test 17.2 to pass genuinely without `|| true`.

2. **Canonical Script Engine Alignment on Homepage**:
   - `ORIGINAL_REQUEST.md:71` mandates that all four canonical engines (`main.js`, `interactions.js`, `portfolio.js`, `contact.js`) are linked.
   - `index.html:987` erroneously loads `js/form.js`.
   - `js/form.js` is an obsolete prototype with no matching DOM IDs on `index.html`.
   - `index.html` hosts `#pricing-calculator` (lines 534-644).
   - `js/contact.js` contains `initDynamicPricing()`.
   - Replacing `<script src="js/form.js" defer>` with `<script src="js/contact.js" defer>` satisfies R1/R2.5 and eliminates dead code loading.

3. **Restoring 3D Tilt Interactivity on Subpages**:
   - `services.html`, `portfolio.html`, and `contact.html` load `js/interactive.js`.
   - `js/interactive.js` queries only `.portfolio-preview-card`, ignoring all 21 `.card-tilt` elements across the subpages.
   - `js/interactions.js` queries `.card-tilt, .interactive-spotlight, .service-card, .portfolio-card, [data-tilt]`, calculating dynamic 3D perspective transforms (`perspective(1000px) rotateX(...) rotateY(...) scale3d(1.02, 1.02, 1.02)`) and setting specular glare custom properties (`--mouse-x`, `--mouse-y`, `--glow-opacity: 1`).
   - Replacing `<script src="js/interactive.js" defer>` with `<script src="js/interactions.js" defer>` on `services.html`, `portfolio.html`, and `contact.html` immediately enables 3D tilt across all 21 subpage cards, while also provisioning the custom magnetic cursor follower, scroll stats counters, and smooth micro-interactions across the entire site.

4. **Eliminating Inline Script on `services.html`**:
   - Moving the modal controller logic from `services.html:671-787` into `js/interactions.js` under `function initServiceModal()` encapsulates the modal behavior in external JS.
   - Because `initServiceModal()` checks `const modal = document.getElementById('service-modal'); if (!modal) return;`, it executes safely on `services.html` while remaining inert (0ms overhead, 0 console errors) on pages without `#service-modal`.
   - Deleting lines 668-787 from `services.html` eliminates 117 lines of inline script, achieving complete separation of concerns.

---

### 3. Caveats

1. **Engine Coordination**:
   - Explorer 1 and Explorer 2 are coordinating cleanup inside `js/main.js` and `js/interactions.js` (eliminating duplicate function declarations like `initFaqAccordion`, `initCustomCursor`, `initPricingCalculator`).
   - The implementer for `js/interactions.js` must ensure `initServiceModal()` is called within `initAllInteractions()` or directly on DOM ready.
2. **Backward Compatibility**:
   - Existing CSS classes in `css/style.css` (`.modal-overlay.is-active`, `.modal-overlay[aria-hidden="false"]`) already perfectly support the service modal styling; no CSS modifications are needed.
3. **No Unintended Side-Effects**:
   - `js/interactive.js` and `js/form.js` will no longer be referenced by any of the 4 production HTML files. They can either remain in `js/` for archival or be retained safely without being loaded.

---

### 4. Conclusion & Concrete Remediation Plan

All four remediation requirements have been fully analyzed and verified. Below are the exact drop-in replacements for each target file.

#### Remediation 1: `index.html:36` — Floating WhatsApp Ripple Class
**Target**: `c:\pkl\PKL\index.html`  
**Lines**: 36-38  
**Before**:
```html
  <a href="https://wa.me/6285280008984?text=Halo%20Rubicweb,%20saya%20ingin%20konsultasi%20pembuatan%20website%20berkinerja%20tinggi." class="btn-floating-whatsapp floating-whatsapp-btn" target="_blank" rel="noopener noreferrer" aria-label="Konsultasi WhatsApp Langsung">
    <img src="assets/icons/whatsapp.svg" alt="WhatsApp Icon" width="28" height="28">
  </a>
```
**After**:
```html
  <a href="https://wa.me/6285280008984?text=Halo%20Rubicweb,%20saya%20ingin%20konsultasi%20pembuatan%20website%20berkinerja%20tinggi." class="btn-floating-whatsapp floating-whatsapp-btn whatsapp-ripple" target="_blank" rel="noopener noreferrer" aria-label="Konsultasi WhatsApp Langsung">
    <img src="assets/icons/whatsapp.svg" alt="WhatsApp Icon" width="28" height="28">
  </a>
```

---

#### Remediation 2: `index.html:984-988` — Canonical Script Replacement
**Target**: `c:\pkl\PKL\index.html`  
**Lines**: 984-988  
**Before**:
```html
  <script src="js/main.js" defer></script>
  <script src="js/interactions.js" defer></script>
  <script src="js/portfolio.js" defer></script>
  <script src="js/form.js" defer></script>
```
**After**:
```html
  <script src="js/main.js" defer></script>
  <script src="js/interactions.js" defer></script>
  <script src="js/portfolio.js" defer></script>
  <script src="js/contact.js" defer></script>
```

---

#### Remediation 3: Subpage Script Replacement (`js/interactive.js` → `js/interactions.js`)

**Target 3A**: `c:\pkl\PKL\services.html:792-794`  
**Before**:
```html
  <script src="js/main.js" defer></script>
  <script src="js/interactive.js" defer></script>
```
**After**:
```html
  <script src="js/main.js" defer></script>
  <script src="js/interactions.js" defer></script>
```

**Target 3B**: `c:\pkl\PKL\portfolio.html:615-617`  
**Before**:
```html
  <script src="js/main.js" defer></script>
  <script src="js/interactive.js" defer></script>
  <script src="js/portfolio.js" defer></script>
```
**After**:
```html
  <script src="js/main.js" defer></script>
  <script src="js/interactions.js" defer></script>
  <script src="js/portfolio.js" defer></script>
```

**Target 3C**: `c:\pkl\PKL\contact.html:558-560`  
**Before**:
```html
  <script src="js/main.js" defer></script>
  <script src="js/interactive.js" defer></script>
  <script src="js/contact.js" defer></script>
```
**After**:
```html
  <script src="js/main.js" defer></script>
  <script src="js/interactions.js" defer></script>
  <script src="js/contact.js" defer></script>
```

---

#### Remediation 4: Inline Modal Script Modularization (`services.html` & `js/interactions.js`)

**Part 4A — Removal from `services.html`**:  
**Target**: `c:\pkl\PKL\services.html`  
**Lines**: 668-787  
**Action**: Delete lines 668 to 787 completely.

**Part 4B — Inclusion into `js/interactions.js`**:  
**Target**: `c:\pkl\PKL\js\interactions.js`  
**Code to Append before `initAllInteractions()`**:
```javascript
  /* --------------------------------------------------------------------------
   * 7. SERVICE DETAIL MODAL CONTROLLER
   * -------------------------------------------------------------------------- */
  function initServiceModal() {
    const modal = document.getElementById('service-modal');
    if (!modal) return;

    const serviceData = {
      'custom-web': {
        tag: 'SERVICE 01 • CUSTOM ARCHITECTURE',
        title: 'Custom Web Development — Rekayasa Kode Kustom Tanpa Template',
        desc: 'Arsitektur kode modular kustom dibangun dari baris pertama. Menghadirkan kecepatan kilat, keamanan tingkat tinggi, dan fleksibilitas tanpa batas untuk mengakomodasi kebutuhan logika bisnis unik korporasi Anda.',
        deliverables: [
          '100% Semantic Clean Source Code (kepemilikan penuh tanpa royalti atau vendor lock-in).',
          'Struktur database ternormalisasi & teroptimasi dengan pengindeksan query efisien.',
          'Integrasi REST API arsitektur modular lengkap dengan dokumentasi OpenAPI.',
          'Zero external library dependencies untuk core visual (bebas jQuery/bloatware).',
          'Dokumentasi teknis lengkap dan panduan pemeliharaan sistem sistematis.'
        ]
      },
      'business-profile': {
        tag: 'SERVICE 02 • CORPORATE AUTHORITY',
        title: 'Modern Business Profile — Transformasi Citra Digital Korporat',
        desc: 'Website korporat adalah wajah reputasi perusahaan Anda di hadapan mitra global, investor, dan klien premium. Kami merancang desain yang memancarkan kredibilitas, kemewahan modern, dan otoritas industri.',
        deliverables: [
          'Desain antarmuka eksklusif pixel-perfect dari prototipe Figma beresolusi tinggi.',
          'Optimalisasi skor Google PageSpeed 95+ (Desktop & Mobile).',
          'Skema SEO terstruktur (JSON-LD Organization, LocalBusiness, Breadcrumbs).',
          'Formulir penangkap prospek (lead capture) dengan validasi instan & integrasi WhatsApp.',
          'Integrasi multi-bahasa terindeks mesin pencari untuk jangkauan global.'
        ]
      },
      'web-app': {
        tag: 'SERVICE 03 • CLOUD SYSTEMS',
        title: 'Web Application & Enterprise Portal — Sistem Tangguh untuk Pertumbuhan Bisnis',
        desc: 'Dari otomasi proses bisnis internal hingga platform SaaS publik, kami merancang aplikasi web dengan logika backend solid, manajemen sesi terenkripsi, dan antarmuka responsif tanpa jeda.',
        deliverables: [
          'Autentikasi aman bertingkat (Multi-role Access Control / RBAC).',
          'Dashboard interaktif dengan visualisasi data grafik responsif real-time.',
          'Webhook & integrasi payment gateway (Midtrans, Xendit, QRIS, Virtual Account).',
          'Pencatatan log aktivitas sistem (Audit Trail) dan enkripsi data sensitif.',
          'Arsitektur siap auto-scaling pada infrastruktur cloud server modern.'
        ]
      },
      'redesign-maintenance': {
        tag: 'SERVICE 04 • PERFORMANCE & SLA',
        title: 'Redesign & Maintenance — Modernisasi dan Proteksi Maksimal',
        desc: 'Website yang lambat atau sering down secara langsung menghilangkan potensi omzet dan merusak kredibilitas brand. Kami membersihkan kode lama, menutup celah keamanan, dan menjaga server tetap prima setiap detik.',
        deliverables: [
          'Peningkatan skor Google PageSpeed dari kategori merah/oranye ke hijau (95+).',
          'Audit keamanan komprehensif dan perbaikan celah (SQLi, XSS, CSRF patch).',
          'Sistem pencadangan harian terenkripsi ke penyimpanan cloud terpisah.',
          'Pemantauan waktu aktif (uptime) server 24/7 dengan respons darurat cepat.',
          'SLA pemeliharaan teknis bulanan/tahunan bergaransi.'
        ]
      }
    };

    const closeBtn = document.getElementById('service-modal-close');
    const triggers = document.querySelectorAll('.btn-service-modal');
    let lastFocused = null;

    function openModal(id) {
      const data = serviceData[id] || serviceData['custom-web'];
      const tagEl = document.getElementById('service-modal-tag');
      const titleEl = document.getElementById('service-modal-title');
      const descEl = document.getElementById('service-modal-desc');
      const list = document.getElementById('service-modal-deliverables');
      const ctaEl = document.getElementById('service-modal-cta');

      if (tagEl) tagEl.textContent = data.tag;
      if (titleEl) titleEl.textContent = data.title;
      if (descEl) descEl.textContent = data.desc;

      if (list) {
        list.innerHTML = '';
        data.deliverables.forEach(function (item) {
          const li = document.createElement('li');
          li.textContent = item;
          list.appendChild(li);
        });
      }

      if (ctaEl) {
        ctaEl.href = 'contact.html?package=' + encodeURIComponent(id);
      }

      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      document.body.style.overflow = 'hidden';

      lastFocused = document.activeElement;
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-service-id') || 'custom-web';
        openModal(id);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });
  }
```
**Registration in `initAllInteractions()`**:
```javascript
  function initAllInteractions() {
    initCustomCursor();
    init3DCardTilt();
    initStatsCounters();
    initTestimonialsCarousel();
    initFaqAccordion();
    initHeroParallax();
    initServiceModal(); // Invoke service modal controller
  }
```

---

### 5. Verification Method

To independently verify these remediations post-implementation:

1. **Verify WhatsApp Ripple Class on `index.html`**:
   ```powershell
   Select-String -Path index.html -Pattern 'class="[^"]*whatsapp-ripple[^"]*"'
   ```
   *Expected*: Matches line 36 of `index.html`.

2. **Verify Browser Computed Animation on `index.html`**:
   Execute in test or headless CDP:
   ```javascript
   await driver.goto(`${baseUrl}/index.html`);
   const animName = await driver.evaluate(() => {
     const btn = document.querySelector('.btn-floating-whatsapp, .floating-whatsapp-btn');
     return window.getComputedStyle(btn).animationName;
   });
   // Must equal 'ripple'
   ```

3. **Verify Elimination of Deprecated Scripts**:
   ```powershell
   Select-String -Path index.html, services.html, portfolio.html, contact.html -Pattern 'interactive\.js|form\.js'
   ```
   *Expected*: Zero matches across all 4 production HTML files.

4. **Verify 3D Tilt Interactivity on Subpage `.card-tilt` Elements**:
   Execute in CDP:
   ```javascript
   await driver.goto(`${baseUrl}/services.html`);
   const tiltCalculated = await driver.evaluate(() => {
     const card = document.querySelector('.card-tilt');
     const rect = card.getBoundingClientRect();
     card.dispatchEvent(new MouseEvent('mousemove', { clientX: rect.left + 20, clientY: rect.top + 20, bubbles: true }));
     return card.style.transform.includes('rotateX') && card.style.transform.includes('rotateY');
   });
   // Must equal true
   ```

5. **Verify Elimination of Inline Scripts on `services.html`**:
   ```powershell
   Select-String -Path services.html -Pattern '<script>'
   ```
   *Expected*: Zero occurrences of inline `<script>` tags.

6. **Invalidation Conditions**:
   - If `window.getComputedStyle(btn).animationName !== 'ripple'` on `index.html`.
   - If any `.card-tilt` on `services.html` fails to respond to `mousemove` events.
   - If opening `#service-modal` on `services.html` produces any console error.
