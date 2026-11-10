# Handoff Report — Challenger 1 (Milestone 5)

**Verdict**: `REQUEST_CHANGES`

---

## 1. Observation

### O1. Single-Active FAQ Accordion Mouse-Click Collision Bug (CRITICAL)
- **File**: `c:\pkl\PKL\js\main.js`, lines 285–321:
  ```javascript
  function initFaqAccordion() {
    const faqSection = document.getElementById('faq') || document.querySelector('.faq-section');
    if (!faqSection) return;
    const faqItems = faqSection.querySelectorAll('.faq-item, .accordion-item');
    if (!faqItems.length) return;

    faqItems.forEach(function (item) {
      const header = item.querySelector('.faq-header') || item.querySelector('header');
      const trigger = item.querySelector('.faq-trigger') || item.querySelector('button');

      function toggleFaq(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        const isCurrentlyOpen = item.classList.contains('active') || item.classList.contains('is-open');
        faqItems.forEach(function (sibling) {
          sibling.classList.remove('active', 'is-open');
          sibling.removeAttribute('open');
          const siblingBtn = sibling.querySelector('.faq-trigger') || sibling.querySelector('button');
          if (siblingBtn) siblingBtn.setAttribute('aria-expanded', 'false');
        });
        if (!isCurrentlyOpen) {
          item.classList.add('active', 'is-open');
          if (trigger) trigger.setAttribute('aria-expanded', 'true');
        }
      }
      if (header) header.addEventListener('click', toggleFaq);
      if (trigger && trigger !== header) trigger.addEventListener('click', toggleFaq);
    });
  }
  ```
- **File**: `c:\pkl\PKL\js\interactions.js`, lines 463–522:
  ```javascript
  function initFaqAccordion() {
    const faqSection = document.getElementById('faq') || document.querySelector('.faq-section');
    if (!faqSection) return;
    const faqItems = Array.from(faqSection.querySelectorAll('.faq-item, .accordion-item'));
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const header = item.querySelector('.faq-header') || item.querySelector('header');
      const trigger = item.querySelector('.faq-trigger') || item.querySelector('button');

      function toggleAccordionItem(e) {
        if (e) {
          if (item._lastToggledEvent === e) return;
          item._lastToggledEvent = e;
          if (e.stopPropagation) e.stopPropagation();
        }
        const isCurrentlyOpen = item.classList.contains('active') || item.classList.contains('is-open') || item.classList.contains('is-active');
        faqItems.forEach(sibling => {
          sibling.classList.remove('active', 'is-open', 'is-active');
          sibling.removeAttribute('open');
          sibling.setAttribute('aria-expanded', 'false');
          const sibBtn = sibling.querySelector('.faq-trigger') || sibling.querySelector('button');
          if (sibBtn) sibBtn.setAttribute('aria-expanded', 'false');
        });
        if (!isCurrentlyOpen) {
          item.classList.add('active', 'is-open', 'is-active');
          item.setAttribute('aria-expanded', 'true');
          if (trigger) trigger.setAttribute('aria-expanded', 'true');
        }
      }
      if (trigger) {
        trigger.addEventListener('click', toggleAccordionItem);
        trigger.addEventListener('keydown', function (e) { ... });
      }
    });
  }
  ```
- **Empirical Execution Command**:
  ```bash
  node tests/adversarial-m5-verification.js
  ```
- **Verbatim Empirical Result**:
  ```
  ▶ [6/6] Testing Single-Active FAQ Accordion & Grid Transition...
    ? Real CDP Mouse Click on FAQ 0: active=false, height=0px
    ? Keyboard Enter on FAQ 1: active=true, height=102.328125px
    ? Single active constraint enforced (FAQ 0 collapsed): true
  ```
  A real mouse click on the question button `<button class="faq-trigger">` never expands the FAQ accordion item. The element remains collapsed at `height: 0px` with `aria-expanded="false"`.

### O2. Monolithic Code Duplication across `js/main.js` and Other Engines
- In `c:\pkl\PKL\js\main.js`, lines 17–25:
  ```javascript
  function initApp() {
    initNavigation();
    initCustomCursor();
    initSmoothAnchors();
    initFaqAccordion();
    initPricingCalculator();
    initCaseStudyModal();
    initBackToTop();
  }
  ```
  `main.js` registers duplicate controllers for:
  - Custom Cursor (`initCustomCursor`) — duplicates `js/interactions.js` lines 20–132, causing double RAF loops and double event listeners.
  - FAQ Accordion (`initFaqAccordion`) — duplicates `js/interactions.js` lines 463–524.
  - Pricing Calculator (`initPricingCalculator`) — duplicates `js/contact.js` lines 216–347.
  - Case Study Modal (`initCaseStudyModal`) — duplicates `js/portfolio.js` lines 120–220.

### O3. Script Inclusion in `c:\pkl\PKL\index.html`
- In `c:\pkl\PKL\index.html`, lines 984–988:
  ```html
  <script src="js/main.js" defer></script>
  <script src="js/interactions.js" defer></script>
  <script src="js/portfolio.js" defer></script>
  <script src="js/form.js" defer></script>
  ```
  `index.html` includes legacy `js/form.js` instead of the 4 defined engines (`main.js`, `interactions.js`, `portfolio.js`, `contact.js`).

### O4. Custom Trailing Cursor Verification
- In `c:\pkl\PKL\js\interactions.js` lines 60–77:
  - LERP interpolation: `followerX += dx * 0.16; followerY += dy * 0.16;` ($\lambda = 0.16$).
  - RAF shutdown: `if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) { rafId = requestAnimationFrame(renderCursor); } else { rafId = null; }`.
  - Coarse pointer suppression: `window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches` sets `display: 'none'`.
- Empirical result: Mouse moved to `(200, 300)`. Follower converged to `(199.53, 299.37)` within 600ms. Interactive target hover adds `.cursor-hover` and `document.body.cursor-hover`. Status: **PASS**.

### O5. 3D Card Perspective Tilt & Radial Specular Highlight Verification
- In `c:\pkl\PKL\js\interactions.js` lines 137–190:
  - Normalized coordinates: $normX = (x - W/2)/(W/2)$, $normY = (y - H/2)/(H/2)$, clamped to $[-1, 1]$.
  - Rotation deflection: $rotY = normX \cdot 10^\circ$, $rotX = -normY \cdot 10^\circ$ (clamped to max $10^\circ$).
  - CSS variables: `--mouse-x: ${x}px`, `--mouse-y: ${y}px`, `--glow-opacity: 1`.
  - Mouseleave reset: `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)`.
- Empirical result: Deflection at corner $(0.9W, 0.9H)$ produced $rotX = -7.99^\circ, rotY = 7.98^\circ$ ($|\theta| \le 10^\circ$). Specular CSS variables set to `--mouse-x=1021.5px, --mouse-y=221.8px`. Reset cubic-bezier confirmed. Status: **PASS**.

### O6. Viewport Stats Counters Verification
- In `c:\pkl\PKL\js\interactions.js` lines 195–273:
  - IntersectionObserver threshold: `0.25`, `rootMargin: '0px 0px -30px 0px'`.
  - Curve: $ease = 1 - 2^{-10 \cdot progress}$ (easeOutExpo).
  - Target formatting: formats numbers and preserves suffixes (`%`, `+`).
- Empirical result: Scrolled into viewport, counters animated and reached targets: `["100%", "250+", "99.9%", "95+"]`. Status: **PASS**.

### O7. Dynamic Pricing Estimator Math & Bounds Verification
- In `c:\pkl\PKL\js\main.js` lines 339–399 and `c:\pkl\PKL\js\contact.js` lines 229–307:
  - Baseline tiers: Basic (Rp 2.500.000 / 1 page / 7d), Pro (Rp 5.500.000 / 5 pages / 18d), Enterprise (Rp 12.000.000 / 10 pages / 35d).
  - Extra pages: $\max(0, pages - basePages) \cdot 350.000$ (Enterprise: 500.000). Zero/negative bound strictly enforced (`Math.max(0, ...)`).
  - Priority Express: $subtotal \cdot 1.25$, $totalDays \cdot 0.6$ (min 5d).
  - WhatsApp link pre-filled with URI-encoded summary.
- Empirical result:
  - Pro Baseline (5 pages): `Rp 5.500.000` (Pass)
  - Basic Baseline (1 page): `Rp 2.500.000` (Pass)
  - Enterprise + 20 pages + E-Commerce + Express: `Rp 23.750.000`, `± 27 - 31 Hari Kerja` (Pass)
  - Zero pages boundary: clamped at baseline `Rp 2.500.000` (Pass). Status: **PASS**.

### O8. Testimonial Carousel Autoplay & Pause Controls Verification
- In `c:\pkl\PKL\js\interactions.js` lines 278–453:
  - Autoplay interval: 5000ms.
  - Hover pause: `mouseenter` calls `stopAutoplay()`.
  - Hover resume: `mouseleave` calls `startAutoplay()`.
  - Touch swipe: horizontal delta $|\Delta X| > 40$ triggers `next()` / `prev()`.
- Empirical result:
  - Next button advances slide: dot 0 -> 1.
  - Autoplay paused for 5.2s on hover: remained frozen on dot 1.
  - Autoplay resumed after unhovering: advanced to dot 2 after 5.2s.
  - Touch swipe delta advanced slide. Status: **PASS**.

---

## 2. Logic Chain

1. **Step 1 (Root Cause of FAQ Failure)**: Both `js/main.js` (O1) and `js/interactions.js` (O1) contain active `initFaqAccordion()` functions that attach `click` event listeners to `.faq-trigger`.
2. **Step 2 (Execution Sequence on Click)**: When a user clicks `.faq-trigger` with a mouse, the browser dispatches a single `MouseEvent`.
3. **Step 3 (First Listener Execution)**: The first listener (from `main.js`) runs. It reads `isCurrentlyOpen = false`. It adds `.active` and `.is-open` to the `.faq-item` and calls `e.stopPropagation()`. Note: `stopPropagation()` prevents bubbling to ancestor elements, but DOES NOT prevent other listeners registered on the same element from running (`stopImmediatePropagation()` would be required).
4. **Step 4 (Second Listener Execution & Immediate Collapse)**: The second listener (from `interactions.js`) runs on the same element in the same event dispatch. It reads `isCurrentlyOpen = item.classList.contains('active')`. Because the first listener just added `.active`, `isCurrentlyOpen` evaluates to `true`! The second listener executes its collapse branch, removing `.active`, `.is-open`, and `.is-active` from the item and setting `aria-expanded="false"`.
5. **Step 5 (Empirical Confirmation)**: Running a real CDP mouse click via `node tests/adversarial-m5-verification.js` produces `active: false, height: 0px` (O1). A real user clicking on any FAQ question is completely unable to open the accordion.
6. **Step 6 (Keyboard Enter Path)**: When the user presses Enter on the button, only `interactions.js` handles `keydown` (`main.js` has no keydown listener). Because only one listener runs, the item expands (`panelHeight: 102.3px`, O1). This isolates and proves that the failure on mouse click is 100% caused by the duplicate click listener collision.
7. **Step 7 (Architectural Drift)**: `main.js` (O2) contains duplicated code from M2 that was intended to be superseded by M3 (`interactions.js`), M4 (`portfolio.js`, `contact.js`). Retaining these duplicate modules in `main.js` directly breaks the single responsibility principle defined in `PROJECT.md` and causes runtime collision bugs.

---

## 3. Caveats

- **Reduced Motion**: The test harness verified `prefers-reduced-motion` bypass logic on counter and cursor; operating system-level media query emulation in Chrome CDP was utilized.
- **Safari / WebKit CSS Grid 0fr Transitions**: Chrome CDP was used for testing; Safari WebKit may render CSS grid 0fr transitions with slightly different fractional subpixel heights during animation, though final heights are identical.
- **No other caveats**: All 6 micro-interaction systems were directly tested under real browser CDP execution.

---

## 4. Conclusion

The mathematical models for the trailing cursor ($\lambda = 0.16$), 3D card tilt (clamped $\pm 10^\circ$, `--mouse-x`/`--mouse-y`), stats counter (easeOutExpo $1 - 2^{-10p}$), dynamic pricing estimator (tiers, extra pages bound, add-ons, express multiplier), and testimonial carousel (5s autoplay, hover/focus pause, touch delta) are **sound and mathematically verified**.

However, **a critical functional bug blocks approval**:
1. **The FAQ accordion cannot be expanded by mouse click**. Real mouse clicks instantly cancel out due to duplicate listener collisions between `js/main.js` and `js/interactions.js`.
2. **`js/main.js` violates the architectural separation of concerns** by containing redundant duplicate implementations of cursor, FAQ, pricing calculator, and case study modals.
3. **`index.html` loads legacy `js/form.js`** instead of adhering to the clean 4-engine stack (`main.js`, `interactions.js`, `portfolio.js`, `contact.js`).

**Actionable Mitigation Steps Required**:
1. In `c:\pkl\PKL\js\main.js`: Remove `initFaqAccordion()`, `initCustomCursor()`, `initPricingCalculator()`, and `initCaseStudyModal()`. Limit `main.js` strictly to navigation, scroll hysteresis, and mobile drawer per `PROJECT.md` Interface Contract 1.
2. In `c:\pkl\PKL\index.html`: Replace `<script src="js/form.js" defer></script>` with `<script src="js/contact.js" defer></script>`.
3. Re-run `node tests/adversarial-m5-verification.js` to verify that real CDP mouse clicks expand FAQ items (`active: true`, `panelHeight > 0px`).

---

## 5. Verification Method

To independently reproduce this finding:

1. Run the empirical adversarial verification suite:
   ```bash
   node tests/adversarial-m5-verification.js
   ```
2. Observe console output under `▶ [6/6] Testing Single-Active FAQ Accordion & Grid Transition...`:
   - `? Real CDP Mouse Click on FAQ 0: active=false, height=0px`
   - Overall suite output: `faqAccordion: FAIL ✗` -> `Final Verdict: REQUEST_CHANGES`.
3. Invalidation condition: When `js/main.js` duplicate listeners are removed, `node tests/adversarial-m5-verification.js` outputs:
   - `✓ Real CDP Mouse Click on FAQ 0: active=true, height > 0px`
   - `faqAccordion: PASS ✓` -> `Final Verdict: APPROVE`.
