# Investigation Report: Defect 4 (Pricing Calculator Card Compression) & Defect 5 (FAQ Accordion Text Background Bug)

**Author**: Explorer 3 (`explorer_m6_3`)  
**Date**: 2026-11-10T12:09:00Z  
**Target Project**: Rubicweb High-Performance Digital Engineering Agency  
**Target Scope**: `index.html`, `contact.html`, `css/style.css`, `css/responsive.css`, `js/interactions.js`

---

## 1. Observation

### Observation 1.1: Pricing Calculator DOM vs CSS Class Mismatch (Defect 4)
- **File**: `index.html`, lines 546-579:
  ```html
  <div class="pricing-calculator-widget">
    <!-- Left Column: Inputs & Toggles -->
    <div class="calc-config-col">
      <div class="calc-group">
        <label class="calc-label">1. Pilih Paket Dasar Website</label>
        <div class="tier-cards-group">
          <label class="tier-card">
            <input type="radio" name="tier" value="basic">
            <div class="tier-card-inner">
              <span class="tier-name">Paket Basic</span>
              <span class="tier-scope">Landing Page (1 Halaman)</span>
              <span class="tier-price font-mono">Rp 2.500.000</span>
            </div>
          </label>
          <label class="tier-card">
            <input type="radio" name="tier" value="pro" checked>
            <div class="tier-card-inner">
              <span class="tier-badge">Paling Populer</span>
              <span class="tier-name">Paket Pro</span>
              <span class="tier-scope">Corporate Profile (5 Halaman)</span>
              <span class="tier-price font-mono">Rp 5.500.000</span>
            </div>
          </label>
          <label class="tier-card">
            <input type="radio" name="tier" value="enterprise">
            <div class="tier-card-inner">
              <span class="tier-name">Paket Enterprise</span>
              <span class="tier-scope">Custom Web App &amp; Portal</span>
              <span class="tier-price font-mono">Rp 12.000.000</span>
            </div>
          </label>
        </div>
      </div>
  ```
- **File**: `css/style.css`, lines 1186-1268:
  ```css
  .pricing-calculator,
  .calc-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 40px;
    box-shadow: var(--shadow-md);
  }

  .calc-layout,
  .pricing-calculator-grid {
    display: grid;
    grid-template-columns: 1.25fr 0.75fr;
    gap: 40px;
    align-items: start;
  }
  ...
  /* Tier Selection Cards */
  .tier-selector,
  .tier-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .tier-card {
    position: relative;
    background-color: var(--bg-tertiary);
    border: 1.5px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 18px 14px;
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: center;
  }
  ```
- **Empirical DOM & Computed Style Inspection via CDP** (`tests/helpers/browser-driver.js`):
  - `.pricing-calculator-widget`: `display: "block"`, `width: 1320px`, `gridTemplateColumns: "none"`
  - `.tier-cards-group`: `display: "block"`, `width: 1320px`, `gridTemplateColumns: "none"`
  - `.tier-card`: `display: "inline"`, `width: 1320px`, `boxSizing: "border-box"`
  - Bounding rects on Desktop (1440px viewport):
    - Paket Basic: `width: 1320px`, `height: 135px`, `top: 5063px`
    - Paket Pro: `width: 1320px`, `height: 160px`, `top: 5142px` (Starts *before* Basic finishes: 5063 + 135 = 5198 > 5142, causing an irregular 56px vertical overlap)
    - Paket Enterprise: `width: 1320px`, `height: 135px`, `top: 5246px`

### Observation 1.2: Empirical Reproduction of the 53px Thin Vertical Sliver Collapse (Defect 4)
- **Tool execution via CDP Driver**:
  When `.pricing-calculator-widget` is placed into a two-column grid (`grid-template-columns: 1.25fr 0.75fr`) on viewports under 1024px without collapsing, or when `.calc-config-col` is squeezed by the min-content width of the summary receipt column (`calc-summary-col` scrollWidth ~651px):
  - Left column (`calc-config-col`) width shrinks to: **190px**
  - Child `.tier-cards-group` / `.tier-selector` with `repeat(3, 1fr)` has total available width of: **190px**
  - Resulting computed grid columns:
    ```json
    "gridCols": "52.5938px 52.5938px 52.5938px"
    ```
  - Card bounding client rects:
    - Card 1: `w: 53px`, `h: 295px`, `left: 65px`
    - Card 2: `w: 53px`, `h: 295px`, `left: 134px`
    - Card 3: `w: 53px`, `h: 295px`, `left: 202px`
  - Visual symptom: Three extreme 53px vertical slivers stuck on the left side of the container with words split character-by-character and text height quadrupling from 77px to 295px.
- **Reference Implementation in `contact.html`**:
  - `contact.html:299`: Uses `<div class="tier-selector tier-options">`.
  - `contact.html:300`: Each card has inline style `style="display: block; background: var(--bg-tertiary); ..."` specifically added to override the default inline display of the `<label>` tag.

### Observation 1.3: User-Agent Button Box and Typography Overrides on FAQ Accordion (Defect 5)
- **File**: `index.html`, lines 781-791:
  ```html
  <div class="faq-accordion-list">
    <!-- FAQ Item 1 -->
    <div class="faq-item">
      <header class="faq-header">
        <button type="button" class="faq-trigger" aria-expanded="false">
          <span class="faq-question">Apakah saya mendapatkan 100% hak milik atas kode sumber (source code) website?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </button>
      </header>
      <div class="faq-panel faq-content">
        <div class="faq-inner">
  ```
- **File**: `css/style.css`, lines 1570-1586:
  ```css
  .faq-header,
  .accordion-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 28px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
    gap: 20px;
  }
  ```
- **Empirical Computed Styles Inspection of FAQ via CDP**:
  - Element `<header class="faq-header">`:
    - `display`: `"flex"`
    - `padding`: `"24px 28px"`
    - `backgroundColor`: `"rgba(0, 0, 0, 0)"`
    - `fontFamily`: `'"Space Grotesk", "Plus Jakarta Sans", sans-serif'`
    - `color`: `"rgb(242, 242, 246)"`
  - Element `<button type="button" class="faq-trigger">`:
    - `backgroundColor`: **`"rgb(240, 240, 240)"`** (Light gray/white default button face from Chromium / WebKit user-agent stylesheet)
    - `color`: **`"rgb(0, 0, 0)"`** (Black user-agent text color)
    - `border`: **`"2px outset rgb(0, 0, 0)"`**
    - `fontFamily`: **`"Arial"`** (Browser user-agent default, fails to inherit `Plus Jakarta Sans` or `Space Grotesk`)
    - `fontSize`: **`"13.3333px"`**
    - `cursor`: **`"default"`**
    - `width`: **`510px`** (Shrink-wrapped to text content, not spanning the 1318px container width)
  - Element `<span class="faq-question">` & `<span class="faq-icon">`:
    - Because `<button class="faq-trigger">` has user-agent `display: block`, `.faq-question` (top: 6844) and `.faq-icon` (top: 6859) are stacked vertically on top of each other inside the white box, rather than spaced horizontally across the full card width.
- **CSS Base Reset Inspection**:
  - `css/style.css`, lines 125-140 contains only:
    ```css
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    ```
  - There is **no reset rule** for `button`, `input`, or `select` (`button { background: none; border: none; font: inherit; color: inherit; }` is completely missing from the stylesheet).

---

## 2. Logic Chain

### Logic Chain for Defect 4: Pricing Calculator Card Compression
1. **Root Cause A (Class Name Desynchronization)**: In `index.html:551`, the package tier selector container was marked with class `tier-cards-group`. However, `css/style.css:1221` defines rules only for `.tier-selector, .tier-options`. Similarly, `index.html:546` uses `pricing-calculator-widget`, while `css/style.css:1195` defines `.calc-layout, .pricing-calculator-grid`.
2. **Root Cause B (Inline `<label>` Display Anomaly)**: The individual tier cards in `index.html` are `<label class="tier-card">`. Per W3C HTML specifications, `<label>` elements default to `display: inline`. In `css/style.css:1228`, `.tier-card` has padding, borders, and margins, but **omits** `display: block` or `display: flex`. When `.tier-cards-group` has no grid/flex layout applied, the three cards render as inline elements containing block children (`<div class="tier-card-inner">`), leading to line-box collapse and overlapping vertical offsets.
3. **Root Cause C (Column Width Squeeze Mechanism)**: When the two-column grid (`1.25fr 0.75fr`) is activated (or if `.pricing-calculator-widget` has a two-column grid), the right summary column (`calc-summary-col`) contains wide content (`.summary-price-wrap`, `.summary-timeline-wrap`, `.summary-included-list`, `.btn-whatsapp`) whose intrinsic min-content width exceeds 350px. Because standard `fr` tracks default to `minmax(auto, 1fr)` rather than `minmax(0, 1fr)`, any viewport shrinkage (such as between 768px and 1024px) compresses the left configuration column down to ~190px.
4. **Compression to 53px Slivers**: When 3 items (`repeat(3, 1fr)`) are placed inside a 190px container without `min-width: 0`, the width per item drops to `(190px - 32px gap) / 3 = 52.6px` (53px). The text is forced into a 50px column, wrapping character-by-character across 20+ lines and ballooning card height from 77px to 295px.
5. **Inner Badging Void**: `<span class="tier-badge">Paling Populer</span>` in `Paket Pro` has no CSS definition in `css/style.css`. It renders as unstyled inline text, shifting the baseline and misaligning the Pro card typography relative to Basic and Enterprise.

### Logic Chain for Defect 5: FAQ Accordion Text Background Bug
1. **Target Selector Misplacement**: In `index.html:784-788`, the markup uses semantic nesting:
   ```html
   <header class="faq-header">
     <button type="button" class="faq-trigger" aria-expanded="false">
       <span class="faq-question">...</span>
       <span class="faq-icon" aria-hidden="true">+</span>
     </button>
   </header>
   ```
2. **Styling Applied to Outer Header, Not Button**: In `css/style.css:1570`, all interactive button styling (`display: flex`, `justify-content: space-between`, `background: none`, `border: none`, `cursor: pointer`, `font-family`, `font-size`) was assigned to `.faq-header, .accordion-header`.
3. **Zero CSS on `<button class="faq-trigger">`**: Neither `.faq-trigger` nor `.faq-question` has any matching CSS rules anywhere in `css/style.css` or `css/responsive.css`.
4. **Browser User-Agent Fallback**: In the absence of author styles or a CSS reset for `button`, modern browser engines (Chromium, Gecko, WebKit) apply native user-agent button styles:
   - `background-color`: System button face / light gray (`#f0f0f0` / `rgb(240, 240, 240)`)
   - `border`: `2px outset`
   - `color`: `#000000` (black)
   - `font-family`: `Arial`
   - `font-size`: `13.3333px`
   - `display`: `block` (causing `.faq-question` and `.faq-icon` to stack vertically instead of aligning horizontally)
5. **Aesthetic Breakdown**: Against the dark `#181920` / `#111216` obsidian card background, this unstyled button renders as a garish 510x43px light-gray/white box with harsh black text and an unaligned `+` icon, directly contradicting the Room & Pillar luxury dark editorial design.

---

## 3. Caveats

- **Caveat 1**: Existing Tier 1 E2E tests (`tests/run-e2e.js --tier=1`) test functional existence and CDP click events (`.faq-trigger.click()`, `input[name="tier"].checked`), but do not assert computed background color or bounding rect aspect ratios. Hence, automated tests passed 90/90 while visual defects were present.
- **Caveat 2**: In `contact.html`, the pricing calculator already works cleanly because it uses `.tier-selector.tier-options` and inline `style="display: block; ..."` on `.tier-card`. The recommended CSS rules must be placed in `css/style.css` and `css/responsive.css` to fix `index.html` globally without breaking `contact.html`.
- **No other caveats.**

---

## 4. Conclusion & Actionable Recommendations

### Recommendation for Defect 4: Pricing Calculator Card Compression

#### A. CSS Rules to Add/Update in `css/style.css`:
Update Section 11 (`INTERACTIVE PRICING CALCULATOR & ESTIMATOR`, around line 1184):

```css
/* Pricing Calculator Grid Container */
.pricing-calculator,
.pricing-calculator-widget,
.calc-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 40px;
  box-shadow: var(--shadow-md);
}

.calc-layout,
.pricing-calculator-grid,
.pricing-calculator-widget {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
  gap: 40px;
  align-items: start;
}

/* Tier Selection Cards Container - 3 Column Grid on Desktop */
.tier-selector,
.tier-options,
.tier-cards-group {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

/* Individual Tier Card */
.tier-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 22px 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.tier-card input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.tier-card:hover {
  border-color: rgba(210, 254, 113, 0.4);
  transform: translateY(-2px);
}

.tier-card.is-selected,
.tier-card:has(input:checked) {
  border-color: var(--accent-primary);
  background-color: var(--accent-primary-alpha);
  box-shadow: 0 0 16px rgba(210, 254, 113, 0.12);
}

/* Card Internal Structure & Typography */
.tier-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.tier-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--bg-primary);
  background-color: var(--accent-primary);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  margin-bottom: 2px;
}

.tier-name {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-primary);
  display: block;
  line-height: 1.25;
}

.tier-scope {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: block;
  line-height: 1.35;
}

.tier-price {
  font-family: var(--font-mono);
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--accent-primary);
  display: block;
  margin-top: 4px;
}
```

#### B. CSS Rules in `css/responsive.css`:
In `@media (max-width: 1023px)`:
```css
.calc-layout,
.pricing-calculator-grid,
.pricing-calculator-widget {
  grid-template-columns: 1fr;
  gap: 32px;
}
```

In `@media (max-width: 767px)`:
```css
.pricing-calculator,
.pricing-calculator-widget,
.calc-card {
  padding: 24px 18px !important;
}

.tier-options,
.tier-selector,
.tier-cards-group {
  grid-template-columns: 1fr !important;
  gap: 12px !important;
}
```

#### C. HTML Semantic Normalization in `index.html`:
At line 551, update class to support both naming schemes:
```html
<div class="tier-cards-group tier-selector tier-options">
```
At line 546, update container class:
```html
<div class="pricing-calculator-widget calc-layout pricing-calculator-grid">
```

---

### Recommendation for Defect 5: FAQ Accordion Text Background Bug

#### A. CSS Rules to Add/Update in `css/style.css`:
Update Section 13 (`SINGLE-ACTIVE FAQ ACCORDION`, around lines 1570-1605):

```css
/* FAQ Header Container Reset */
.faq-header {
  width: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
}

/* FAQ Trigger Button: Seamless Dark Editorial Styling */
.faq-trigger,
button.faq-header,
.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  background: transparent;
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  text-align: left;
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  gap: 20px;
  transition: color var(--transition-fast), background-color var(--transition-fast);
  appearance: none;
  -webkit-appearance: none;
}

/* Hover and Focus States */
.faq-trigger:hover,
.faq-item:hover .faq-trigger {
  color: var(--accent-primary);
  background: transparent;
}

.faq-trigger:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

/* Question Text */
.faq-question {
  flex: 1;
  text-align: left;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
  line-height: 1.4;
  background: transparent;
}

/* Accordion Toggle Icon (+ -> x / 45deg) */
.faq-icon,
.accordion-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1;
  color: var(--accent-primary);
  background: transparent;
  transition: transform 0.35s var(--ease-swift-out), color var(--transition-fast);
}

.faq-item.is-active .faq-icon,
.faq-item.active .faq-icon,
.faq-item.is-open .faq-icon,
.faq-item[aria-expanded="true"] .faq-icon,
.faq-trigger[aria-expanded="true"] .faq-icon {
  transform: rotate(45deg);
}
```

#### B. Responsive Mobile Rules in `css/responsive.css`:
In `@media (max-width: 767px)` (around line 374):
```css
/* FAQ Accordion Mobile */
.faq-trigger,
button.faq-header,
.accordion-header {
  padding: 18px 16px;
  font-size: 1.02rem;
  gap: 14px;
}

.faq-inner,
.accordion-inner {
  padding: 0 16px 0 16px;
  font-size: 0.9rem;
}

.faq-item.is-active .faq-inner,
.faq-item.active .faq-inner,
.faq-item.is-open .faq-inner,
.faq-item[aria-expanded="true"] .faq-inner {
  padding-bottom: 20px;
}
```

---

## 5. Verification Method

### Automated Independent Verification Script
Run the following zero-dependency Node.js CDP script:

```bash
node -e "
const StaticServer = require('./tests/helpers/static-server');
const BrowserDriver = require('./tests/helpers/browser-driver');

(async () => {
  const server = new StaticServer({ rootDir: '.', port: 8089 });
  await server.start();
  const driver = new BrowserDriver({ headless: true });
  await driver.launch();

  // 1. Verify Desktop 1440px
  await driver.setViewport({ width: 1440, height: 900 });
  await driver.goto('http://localhost:8089/index.html');
  await new Promise(r => setTimeout(r, 600));

  const desktop = await driver.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.tier-card'));
    const btn = document.querySelector('.faq-trigger');
    const csBtn = getComputedStyle(btn);
    return {
      tierWidths: cards.map(c => Math.round(c.getBoundingClientRect().width)),
      faqBg: csBtn.backgroundColor,
      faqColor: csBtn.color,
      faqBorder: csBtn.border
    };
  });
  console.log('Desktop 1440px Verification:', desktop);

  // Assertions:
  // - All 3 tier cards must have equal width >= 200px (e.g. ~240px each)
  // - faqBg must be 'rgba(0, 0, 0, 0)' (transparent)
  // - faqColor must be 'rgb(242, 242, 246)' (var(--text-primary))
  // - faqBorder must have 0px border

  // 2. Verify Mobile 375px
  await driver.setViewport({ width: 375, height: 667 });
  await driver.goto('http://localhost:8089/index.html');
  await new Promise(r => setTimeout(r, 600));

  const mobile = await driver.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.tier-card'));
    return {
      tierWidths: cards.map(c => Math.round(c.getBoundingClientRect().width))
    };
  });
  console.log('Mobile 375px Verification:', mobile);
  // - On mobile, tier cards must collapse to 1 column: width >= 300px each

  await driver.close();
  await server.stop();
})().catch(e => { console.error(e); process.exit(1); });
"
```

### Full E2E Test Suite Run
Execute:
```powershell
node tests/run-e2e.js --tier=1
node tests/challenger-m5-final-responsive.js
```

### Invalidation Conditions
The fix is considered **invalid** if:
1. Any tier card on desktop 1440px has width < 180px or cards overlap vertically.
2. Tier cards do not collapse to a single column on viewports <= 767px.
3. `<button class="faq-trigger">` has any background color other than `rgba(0, 0, 0, 0)` or `transparent`.
4. FAQ question text has `color: rgb(0, 0, 0)` or displays an outset border.
5. FAQ accordion icon fails to rotate 45 degrees upon expansion.
