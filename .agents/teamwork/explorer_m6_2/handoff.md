# Handoff Report — Explorer 2: Defect 2 Investigation (Stray Modal Overlay Statically Visible)

## 1. Observation

### 1.1 Empirical Browser State on Page Load
Executing CDP automated inspection (`verify_all_modals.js`) across all four core HTML pages reveals the following computed properties and viewport bounding rectangles on initial load:

- **`index.html` (`#case-study-modal`)**:
  - `id`: `"case-study-modal"`
  - `className`: `"modal-backdrop"` (Notice: NOT `.modal-overlay`)
  - `inlineStyle`: `null` (NO `style="display: none;"`)
  - `rect`: `top: 4270.015px, left: 0px, width: 1407px, height: 673.1875px`
  - Computed styles:
    - `display: "block"` (Browser default block element in document flow)
    - `position: "static"` (NOT fixed overlay)
    - `opacity: "1"` (Completely opaque)
    - `visibility: "visible"` (Fully visible)
    - `pointerEvents: "auto"` (Captures clicks)
    - `zIndex: "auto"`
  - Child `.modal-dialog`:
    - `rect`: `top: 4305.845px, left: 20.5px, width: 779px, height: 639.528px`
    - Computed styles: `display: "block"`, `position: "relative"`, `transform: "matrix(0.95, 0, 0, 0.95, 0, 19)"`, `opacity: "1"`, `visibility: "visible"`
    - Rendered contents: Title ("Judul Studi Kasus"), tag ("KATEGORI PROYEK"), preview image mockup, "Tantangan Teknis", "Solusi Rekayasa Rubicweb", "Hasil Terukur", and close button `[x]`.
  - Visual proof: Saved in `.agents/teamwork/explorer_m6_2/screenshot_modal.png` and `screenshot_modal_center.png`, showing the gray modal card with vertical scrollbar sitting statically in normal document flow directly between `<section class="portfolio-section">` and `<section class="pricing-section">`.

- **`services.html` (`#service-modal` & `#case-study-modal`)**:
  - `#service-modal`:
    - `className`: `"modal-overlay"`
    - `inlineStyle`: `null`
    - Computed styles: `display: "flex"`, `position: "fixed"`, `opacity: "0"`, `visibility: "hidden"`, `pointerEvents: "none"`
    - Defect: Computed `display: "flex"` even while inactive; lacks `display: "none"`.
  - `#case-study-modal`:
    - `className`: `"modal-overlay"`
    - `inlineStyle`: `"display: none;"`
    - Computed styles: `display: "none"`, `position: "fixed"`

- **`portfolio.html` (`#case-study-modal`)**:
  - `className`: `"modal-overlay"`
  - `inlineStyle`: `"display: none;"`
  - Computed styles: `display: "none"`

- **`contact.html`**:
  - No modal elements in DOM.

---

### 1.2 Code Inspection

#### A. `index.html` (Lines 496–529)
```html
    <!-- ------------------------------------------------------------------------
         MODAL: CASE STUDY PREVIEW DIALOG
         ------------------------------------------------------------------------ -->
    <div class="modal-backdrop" id="case-study-modal" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="modal-dialog">
        <button type="button" class="modal__close modal-close-btn" aria-label="Tutup studi kasus">&times;</button>
        <div class="modal-header">
          <span class="modal-tag font-mono" id="modal-tag">KATEGORI PROYEK</span>
          <h3 class="modal-title" id="modal-title">Judul Studi Kasus</h3>
        </div>
        <div class="modal-body">
          <div class="modal-image-wrap">
            <img src="assets/portfolio/karalia-mockup.svg" alt="Preview Gambar Proyek" id="modal-img" class="modal-img" width="600" height="340">
          </div>
          <div class="modal-details">
            <div class="detail-block">
              <h4>Tantangan Teknis</h4>
              <p id="modal-challenge">Deskripsi tantangan teknis proyek klien.</p>
            </div>
            <div class="detail-block">
              <h4>Solusi Rekayasa Rubicweb</h4>
              <p id="modal-solution">Solusi arsitektur dan eksekusi clean code yang diterapkan.</p>
            </div>
            <div class="detail-block">
              <h4>Hasil Terukur</h4>
              <p id="modal-results">Peningkatan metrik bisnis dan kecepatan Core Web Vitals.</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <a href="contact.html" class="btn btn--primary">Konsultasi Proyek Serupa &rarr;</a>
        </div>
      </div>
    </div>
```
Direct Observations:
1. Class on `#case-study-modal` is `class="modal-backdrop"`. The project CSS (`css/style.css`) only targets `.modal-overlay`.
2. Missing inline `style="display: none;"`.
3. Close button uses `class="modal__close modal-close-btn"`, missing `modal-close` which is the only close class styled in `css/style.css:1691`.

#### B. `css/style.css` (Lines 1643–1714)
```css
/* --------------------------------------------------------------------------
   14. MODAL OVERLAY & CASE STUDY POPUPS
   -------------------------------------------------------------------------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(10, 11, 14, 0.85);
  backdrop-filter: var(--blur-modal);
  -webkit-backdrop-filter: var(--blur-modal);
  z-index: 10000;
  display: flex;                                    /* <-- DEFECT: Unconditional display: flex; missing display: none; */
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.35s var(--ease-swift-out), visibility 0.35s ease;
}

.modal-overlay.is-active,
.modal-overlay[aria-hidden="false"] {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  /* DEFECT: Missing display: flex ! When .modal-overlay is display: none by default, it must activate to display: flex */
}

.modal-container,
.modal-dialog {
  width: 100%;
  max-width: 820px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 40px;
  position: relative;
  box-shadow: var(--shadow-lg);
  transform: scale(0.95) translateY(20px);
  transition: transform 0.35s var(--ease-swift-out);
}
```
Direct Observations:
1. `display: none;` is completely absent from `.modal-overlay`.
2. `.modal-backdrop`, `.modal`, `#case-study-modal`, and `#service-modal` are missing from the CSS selector lists.
3. `.modal-dialog` is a broad, unscoped selector that styles any `.modal-dialog` element regardless of whether its parent overlay is active.
4. `.modal-close` is the only styled class; `.modal__close` and `.modal-close-btn` have no CSS rules.

#### C. `js/portfolio.js` (Lines 182–240)
```javascript
  function initCaseStudyModals() {
    const modal = document.getElementById('case-study-modal');
    if (!modal) return;

    const closeButtons = modal.querySelectorAll('.modal-close, .modal__close, [data-close], .btn-close');
    let lastFocusedElement = null;

    function openModal(projectId) {
      ...
      modal.classList.add('is-active', 'active', 'is-open');
      modal.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';
      ...
    }

    function closeModal() {
      modal.classList.remove('is-active', 'active', 'is-open');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      ...
    }
```
Direct Observations:
1. `initCaseStudyModals()` does NOT defensively enforce `modal.style.display = 'none'` or remove active classes on boot.
2. `closeModal()` does set `modal.style.display = 'none'`, but this only runs AFTER a user clicks to open and then close the modal. On initial page load, the modal stays unhidden if HTML/CSS fails to hide it.

#### D. `js/interactions.js` (Lines 570–672)
```javascript
  function initServiceModal() {
    const modal = document.getElementById('service-modal');
    if (!modal) return;
    ...
    function openModal(id) {
      ...
      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      document.body.style.overflow = 'hidden';
      ...
    }

    function closeModal() {
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      document.body.style.overflow = '';
      ...
    }
```
Direct Observations:
1. `initServiceModal()` never sets `modal.style.display`.
2. `openModal()` and `closeModal()` only toggle `.is-active` and `aria-hidden`, relying 100% on CSS for `display: flex` and `display: none`.
3. If `css/style.css` is updated to set `display: none` by default without `.is-active { display: flex !important; }`, `#service-modal` will fail to display on click.

---

## 2. Logic Chain

1. **Step 1 (Markup mismatch)**: In `index.html` line 499, `#case-study-modal` has `class="modal-backdrop"` instead of `class="modal-overlay"`.
2. **Step 2 (CSS rule absence)**: In `css/style.css`, there are zero rules matching `.modal-backdrop`, `.modal`, or `#case-study-modal`. All overlay rules are keyed strictly to `.modal-overlay`.
3. **Step 3 (Browser fallback)**: Because `#case-study-modal` matches neither `.modal-overlay` nor any other custom rule, the browser applies standard `<div>` default styling: `display: block; position: static; opacity: 1; visibility: visible;`.
4. **Step 4 (Child styling in document flow)**: Its child `<div class="modal-dialog">` matches the generic `.modal-dialog` selector in `css/style.css:1671`. This renders an 820px-wide card with background `#20222b`, borders, padding, and text ("Tantangan Teknis", "Solusi Rekayasa Rubicweb", "Hasil Terukur") right in the middle of `index.html` between the portfolio section and the pricing calculator.
5. **Step 5 (Lack of JavaScript defense on boot)**: On DOM ready, `js/portfolio.js` binds event listeners to triggers and close buttons, but does not execute a boot-time check to ensure `modal.style.display = 'none'` and `aria-hidden="true"`.
6. **Step 6 (Flawed test assertion gap)**: The existing test suite in `tests/tier1-features/feat-10-case-study-modals.test.js` only checked `document.querySelector('#case-study-modal') !== null` (DOM existence) and checked `aria-hidden === 'true'`, but never checked computed visibility or `display === 'none'` before user click. Tests passed 204/204 while human eyes immediately caught the prominent static card.
7. **Step 7 (Secondary flaw in `services.html` & `css/style.css`)**: While `services.html` used `class="modal-overlay"`, `.modal-overlay` had `display: flex;` defined unconditionally without `.is-active`, relying only on `opacity: 0; visibility: hidden; pointer-events: none;`. Best practice and robust cross-browser safety require `display: none;` by default.

---

## 3. Caveats

- **No Caveats Regarding Root Cause**: The defect is 100% deterministic, isolated, and empirically reproduced via headless browser CDP inspection.
- **Scope Consideration**: `contact.html` contains no modal elements and is unaffected. `portfolio.html` was masked from static visibility because someone had manually placed an inline `style="display: none;"` on line 472.
- **Interaction Dependency**: In `js/interactions.js`, `openModal()` does not touch `style.display`. Therefore, CSS rules for `.modal-overlay.is-active, #service-modal.is-active` MUST explicitly declare `display: flex !important;` so that hiding the modal by default via CSS does not break the click-to-expand feature on `services.html`.

---

## 4. Conclusion & Actionable Fixes

To resolve Defect 2 comprehensively across all pages, stylesheets, and scripts, apply the following 4-part fix:

### Fix 1: `index.html` (Line 499 & 501)
Update `#case-study-modal` markup to include both `modal-overlay` and `modal-backdrop`, add inline `style="display: none;"`, and ensure the close button includes `.modal-close`:

```html
<!-- BEFORE (lines 499-501) -->
<div class="modal-backdrop" id="case-study-modal" role="dialog" aria-modal="true" aria-hidden="true">
  <div class="modal-dialog">
    <button type="button" class="modal__close modal-close-btn" aria-label="Tutup studi kasus">&times;</button>

<!-- AFTER -->
<div class="modal-overlay modal-backdrop" id="case-study-modal" role="dialog" aria-modal="true" aria-hidden="true" style="display: none;">
  <div class="modal-dialog">
    <button type="button" class="modal-close modal__close modal-close-btn" id="modal-close-btn" aria-label="Tutup studi kasus">&times;</button>
```

### Fix 2: `services.html` (Line 542)
Add inline `style="display: none;"` and `.modal-close-btn` to `#service-modal`:

```html
<!-- BEFORE (lines 542-544) -->
<div class="modal-overlay" id="service-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
  <div class="modal-dialog">
    <button type="button" class="modal-close" id="service-modal-close" aria-label="Tutup rincian layanan">&times;</button>

<!-- AFTER -->
<div class="modal-overlay" id="service-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="service-modal-title" style="display: none;">
  <div class="modal-dialog">
    <button type="button" class="modal-close modal__close modal-close-btn" id="service-modal-close" aria-label="Tutup rincian layanan">&times;</button>
```

### Fix 3: `css/style.css` (Section 14, Lines 1644–1714)
Replace Section 14 in `css/style.css` with comprehensive multi-selector rules ensuring strict default concealment (`display: none; opacity: 0; visibility: hidden; pointer-events: none;`) and explicit activation (`display: flex !important; opacity: 1; visibility: visible;`):

```css
/* --------------------------------------------------------------------------
   14. MODAL OVERLAY & CASE STUDY POPUPS
   -------------------------------------------------------------------------- */
.modal-overlay,
.modal-backdrop,
.modal,
#case-study-modal,
#service-modal {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(10, 11, 14, 0.85);
  backdrop-filter: var(--blur-modal);
  -webkit-backdrop-filter: var(--blur-modal);
  z-index: 10000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.35s var(--ease-swift-out), visibility 0.35s ease;
}

.modal-overlay.is-active,
.modal-overlay.active,
.modal-overlay.is-open,
.modal-overlay[aria-hidden="false"],
.modal-backdrop.is-active,
.modal-backdrop.active,
.modal-backdrop.is-open,
.modal-backdrop[aria-hidden="false"],
.modal.is-active,
.modal.active,
.modal.is-open,
.modal[aria-hidden="false"],
#case-study-modal.is-active,
#case-study-modal.active,
#case-study-modal.is-open,
#case-study-modal[aria-hidden="false"],
#service-modal.is-active,
#service-modal.active,
#service-modal.is-open,
#service-modal[aria-hidden="false"] {
  display: flex !important;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.modal-container,
.modal-dialog {
  width: 100%;
  max-width: 820px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 40px;
  position: relative;
  box-shadow: var(--shadow-lg);
  transform: scale(0.95) translateY(20px);
  transition: transform 0.35s var(--ease-swift-out);
  margin: auto;
}

.modal-overlay.is-active .modal-container,
.modal-overlay.active .modal-container,
.modal-overlay[aria-hidden="false"] .modal-dialog,
.modal-overlay.is-active .modal-dialog,
.modal-overlay.active .modal-dialog,
.modal-backdrop.is-active .modal-dialog,
.modal-backdrop.active .modal-dialog,
.modal-backdrop[aria-hidden="false"] .modal-dialog,
#case-study-modal.is-active .modal-dialog,
#case-study-modal.active .modal-dialog,
#case-study-modal[aria-hidden="false"] .modal-dialog,
#service-modal.is-active .modal-dialog,
#service-modal.active .modal-dialog,
#service-modal[aria-hidden="false"] .modal-dialog {
  transform: scale(1) translateY(0);
}

.modal-close,
.modal__close,
.modal-close-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 10;
  font-size: 1.5rem;
  line-height: 1;
}

.modal-close:hover,
.modal__close:hover,
.modal-close-btn:hover {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--text-inverse);
  transform: rotate(90deg);
}
```

### Fix 4: Defensive JavaScript Boot Hiding
1. In `js/portfolio.js` (`initCaseStudyModals`):
```javascript
  function initCaseStudyModals() {
    const modal = document.getElementById('case-study-modal');
    if (!modal) return;

    // Defensive initialization: ensure modal overlay is strictly hidden on boot
    modal.classList.remove('is-active', 'active', 'is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';

    const closeButtons = modal.querySelectorAll('.modal-close, .modal__close, [data-close], .btn-close');
```

2. In `js/interactions.js` (`initServiceModal`):
```javascript
  function initServiceModal() {
    const modal = document.getElementById('service-modal');
    if (!modal) return;

    // Defensive initialization: ensure service modal is strictly hidden on boot
    modal.classList.remove('is-active', 'active', 'is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
```
And inside `openModal(id)` and `closeModal()`:
```javascript
    function openModal(id) {
      ...
      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';
      ...
    }

    function closeModal() {
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      ...
    }
```

---

## 5. Verification Method

To independently reproduce and verify this investigation and the proposed fix:

1. **Verify Baseline Defect via CDP**:
   Execute:
   ```powershell
   node .agents/teamwork/explorer_m6_2/verify_all_modals.js
   ```
   Inspect the JSON output: `index.html` reports `isStaticallyVisible: true`, `display: "block"`, `position: "static"`, height 673px.

2. **Verify Proposed Fix Simulation**:
   Execute:
   ```powershell
   node .agents/teamwork/explorer_m6_2/test_proposed_fix.js
   node .agents/teamwork/explorer_m6_2/test_services_modal.js
   ```
   Output confirms:
   - Initial state: `display: 'none'`, `position: 'fixed'`, `opacity: '0'`, `visibility: 'hidden'`, `pointerEvents: 'none'`.
   - On click trigger: `opened: true`, `display: 'flex'`, `opacity: '1'`, `visibility: 'visible'`.
   - On close click / Escape / backdrop click: `closed: true`, `display: 'none'`, `ariaHidden: 'true'`.

3. **Verify Regression Safety**:
   After the implementer applies the changes to `index.html`, `services.html`, `css/style.css`, `js/portfolio.js`, and `js/interactions.js`, run:
   ```powershell
   node tests/run-e2e.js
   ```
   Confirm all 204 tests continue to pass (100% success, 0 failures, 0 console errors).
