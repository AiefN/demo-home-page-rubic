# Investigation Handoff Report: Defect 1 (Desktop Container & Hero Balance) & Defect 3 (Floating Dock Heading Collision)

- **Investigator**: Explorer 1 (`teamwork_explorer`, subagent id: `c92dc85c-1e52-46e4-b982-1b3487fd4e93`)
- **Recipient**: Orchestrator (`2f7dd111-5177-4fd4-992c-5df0c0d33d1a`)
- **Date**: 2026-11-10T12:06:00Z
- **Working Directory**: `c:\pkl\PKL`
- **State Directory**: `c:\pkl\PKL\.agents\teamwork\explorer_m6_1\`

---

## 1. Observation

### 1.1 Defect 1: Desktop Container & Hero Balance ("kanan kirinya kosong")

#### A. DOM Hierarchy in `index.html` (lines 139–183)
```html
<section class="hero-section" id="hero">
  <div class="container hero-container">
    <!-- Guarantee Pill Badge -->
    <div class="hero-badge-wrap">...</div>

    <!-- Editorial Display H1 -->
    <h1 class="hero-title">Membangun Website Berkinerja Tinggi &amp; Desain Kelas Dunia</h1>

    <!-- Agency Narrative Subheadline -->
    <p class="hero-subheadline body-copy">
      Rubicweb merekayasa website kustom dan aplikasi web enterprise...
    </p>

    <!-- Call-to-Action Group -->
    <div class="hero-actions hero-ctas">...</div>

    <!-- Hero Telemetry Metrics Bar -->
    <div class="hero-telemetry-bar">...</div>
  </div>
</section>
```
All 5 children are stacked directly inside `.hero-container` as a single vertical column. There is no right-hand column, no visual showcase element, and no wrapper separating copy from visual media.

#### B. CSS Analysis (`css/style.css` & `css/responsive.css`)
1. **Missing `.hero-container` Rules**:
   - `css/style.css` and `css/responsive.css` contain **zero rules** matching `.hero-container`. It defaults to standard block layout (`display: block`).
2. **Container Centering & Max-Width**:
   - `css/style.css:298`:
     ```css
     .container {
       width: 100%;
       max-width: var(--container-max); /* 1320px in style.css */
       margin-left: auto;
       margin-right: auto;
       padding-left: var(--gutter);
       padding-right: var(--gutter);
     }
     ```
   - `css/responsive.css:12`:
     ```css
     @media (min-width: 1440px) {
       :root {
         --container-max: 1400px;
         --gutter: 40px;
       }
     }
     ```
   - `.container` is centered horizontally (`margin-left: auto; margin-right: auto;`). However, at 1920px screen width, `1920px - 1400px = 520px` total margin (260px on the left, 260px on the right).
3. **Class Mismatch on Subheadline**:
   - `css/style.css:825` targets `.hero-subtitle, .hero-description { font-size: var(--text-body-lg); max-width: 720px; margin-bottom: 36px; }`.
   - `index.html:155` uses class `<p class="hero-subheadline body-copy">`.
   - Result: `.hero-subheadline` receives **none** of the intended styling, defaulting to raw `p` styling (`font-size: 1rem; margin-bottom: 1rem`).
4. **Missing Styling on Telemetry Bar**:
   - `.hero-telemetry-bar`, `.telemetry-item`, and `.telemetry-divider` have **no CSS definitions** in `css/style.css`.
   - In `portfolio.html:155` and `services.html:155`, developers resorted to inline styles (`style="display: flex; gap: 20px; flex-wrap: wrap;"`). In `index.html`, without inline styles or CSS, the telemetry items stack vertically as plain unstyled text blocks.
5. **Orphaned Background Blueprint Rule**:
   - `css/style.css:845` defines `.hero-parallax, .hero-blueprint { position: absolute; right: 0; width: 50%; opacity: 0.35; }`, but no element with these classes exists in `index.html`.

#### C. Empirical Geometry & Void Measurements via Chrome DevTools Protocol (CDP)
Ran headless browser measurement script (`.agents/teamwork/explorer_m6_1/inspect_defects.js`):
- **1280x800 Viewport**:
  - Hero container width: `1200px` (`left: 32.5px`, `right: 1232.5px`).
  - Hero title width: `1136px`.
  - Right-hand void within hero: text wraps to full width, but buttons and telemetry occupy only ~450px and ~600px width.
- **1440x900 Viewport**:
  - Hero container width: `1400px` (`left: 12.5px`, `right: 1412.5px`).
  - Hero title width: `1320px` (2 lines of text).
  - Subheadline text ends at X = 740px. Buttons end at X = 485px. Telemetry bar text ends at X = 250px.
  - **Empirical void width on right**: **~660px to 900px of completely vacant obsidian background** (exceeding 50% of the container width).
- **1920x1080 Viewport**:
  - Hero container width: `1400px` (`left: 252.5px`, `right: 1652.5px`).
  - Outside margin: `252.5px` on left, `267.5px` on right.
  - Inside container: all copy and buttons are clustered on the left (X <= 800px).
  - **Total visual empty space on right**: `1920px - 800px = 1120px` (58.3% of the entire display is blank).
- **Captured Visual Evidence**:
  - `screenshot_1280x800.png`
  - `screenshot_1440x900.png` (demonstrates awkward left alignment and massive black void)
  - `screenshot_1920x1080.png`

---

### 1.2 Defect 3: Floating Dock Colliding with Headings

#### A. DOM Hierarchy & Redundancy
1. **DOM Count**:
   - `document.querySelectorAll('.floating-bottom-nav').length === 1`. There is only one floating bottom nav element in the DOM.
2. **Redundant Top and Bottom Navbars**:
   - `index.html` lines 43–78 contains `<header class="site-header" id="site-header">` fixed at the top with: `RUBICWEB`, `Beranda`, `Layanan & Workflow`, `Portofolio`, `Estimator Biaya`, `Kontak & Konsultasi`, and CTA `Konsultasi WhatsApp`.
   - `index.html` lines 113–129 contains `<nav class="floating-bottom-nav">` fixed at the bottom with: `RUBICWEB`, `Beranda`, `Layanan`, `Portofolio`, `Estimator`, `Kontak`, and CTA `Konsultasi →`.
   - Both navbars are rendered simultaneously upon initial page load.

#### B. CSS Positioning & Sizing (`css/style.css:740–755`)
```css
.floating-bottom-nav {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 900;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 18px;
  background-color: var(--bg-glass);       /* rgba(17, 18, 22, 0.85) */
  backdrop-filter: var(--blur-nav);         /* blur(16px) */
  -webkit-backdrop-filter: var(--blur-nav);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.6);
}
```

#### C. Hero Height vs. Viewport Height vs. Heading Coordinate
- `css/style.css:799`:
  ```css
  .hero, .hero-section {
    position: relative;
    min-height: 88vh; /* <--- CRITICAL VALUE */
    display: flex;
    align-items: center;
    padding-top: 130px;
    padding-bottom: 70px;
  }
  ```
- **At 1440x900 viewport**:
  - `88vh = 792px`.
  - Section 2 (`#services`, `.services-section`) starts at `top: 792px`.
  - The section heading `<h2 class="section-title">Solusi Rekayasa Web Kustom Tanpa Template</h2>` is positioned at:
    - `top: 816.4px`
    - `bottom: 887.2px`
    - `height: 70.8px`
  - The floating nav (`position: fixed; bottom: 24px; height: 42.4px;`) is positioned at:
    - `top: 900 - 24 - 42.4 = 833.6px`
    - `bottom: 876.0px`
  - **Coordinate Intersect**:
    `833.6px` falls directly between `816.4px` and `887.2px`!
  - **Empirical Collision Check**:
    `Collision at scrollY=0: navIntersectsServicesTitle = true`
    The pill cuts horizontally across "Solusi Rekayasa Web Kustom Tanpa Template", rendering both unreadable.
- **At 1920x1080 viewport**:
  - `88vh = 950.4px`.
  - Section heading is positioned at `top: 978.1px` to `1048.9px`.
  - Floating nav with `bottom: 24px; height: 45.7px` is positioned at `top: 1010.3px` to `1056.0px`.
  - **Coordinate Intersect**:
    `1010.3px` falls directly between `978.1px` and `1048.9px`!
    `Collision at scrollY=0: navIntersectsServicesTitle = true`.
- **At Subpages (`services.html`)**:
  - Subpage hero has `padding-top: 80px; padding-bottom: 40px;` (no min-height).
  - Next heading begins at `top: 789.8px`.
  - Floating dock sits at `top: 833.6px`.
  - Result: `collides: true` on `services.html` as well.
- **JavaScript Scroll Controller Status**:
  - `js/main.js` only controls `.site-header` (`navbar--scrolled` and `navbar--hidden`). It has **zero logic** referencing `.floating-bottom-nav`.
  - `js/navigation.js` contained an experimental scroll controller, but it is **not linked** in `index.html` or any subpage.

---

## 2. Logic Chain

```
[Observation 1.1.B.1: .hero-container has display: block with no grid/flex columns]
                  +
[Observation 1.1.A: Hero DOM contains only 5 left-aligned text/CTA blocks; 0 right elements]
                  +
[Observation 1.1.C: Container is 1400px wide, but content only fills the left ~600px]
                  ↓
[Logic Step 1: Layout Asymmetry Root Cause]
Hero section is inherently unbalanced because desktop viewports (1280px–1920px) provide ample horizontal width for a 2-column layout (editorial copy on left, visual showcase on right), but the markup and CSS treat it as a single left-aligned column. This creates a 600px–1120px dead void on the right.

                  +
[Observation 1.1.B.3 & 1.1.B.4: Class mismatch (.hero-subheadline) & missing .hero-telemetry-bar styles]
                  ↓
[Logic Step 2: Styling Breakdown Root Cause]
The subheadline and telemetry items fail to receive intended font sizes, flex layouts, or dividers, collapsing into raw stacked text that intensifies the visual emptiness.

                  +
[Observation 1.2.C: .hero-section has min-height: 88vh; leaving bottom 12vh to bleed Section 2 into view]
                  +
[Observation 1.2.B: .floating-bottom-nav is fixed at bottom: 24px; top: 833.6px on 900px screen]
                  +
[Observation 1.2.C: Section 2 heading sits at top: 816.4px–887.2px on 900px screen]
                  ↓
[Logic Step 3: Heading Collision Root Cause]
Because 88vh does not fill the initial fold (900px * 0.88 = 792px), Section 2 peeks into the bottom 108px of the viewport. Its <h1>/<h2> title lands directly at Y = 816px–887px, precisely where the floating bottom pill nav sits (Y = 833px). This creates an unavoidable, static collision on page load across all standard desktop monitors.

                  +
[Observation 1.2.A.2 & 1.2.C: .site-header is already active at top; .floating-bottom-nav has no scroll hysteresis]
                  ↓
[Logic Step 4: Redundancy & Scroll Occlusion Root Cause]
Displaying two full navbars simultaneously on initial load is functionally redundant. Furthermore, because .floating-bottom-nav lacks scroll-based hiding in js/main.js, any heading that scrolls past the bottom 60px of the screen is temporarily blocked by the pill.
```

---

## 3. Caveats

1. **E2E Test Contract Preservation**:
   - The test suite (`node tests/run-e2e.js`) has 204 passing tests.
   - Specifically:
     - `feat-03-responsive-layout.test.js` checks `document.querySelectorAll('header nav a, .floating-bottom-nav a, .navbar a')`.
     - `feat-14-navbar-mobile-drawer.test.js` queries `.floating-bottom-nav`.
     - `feat-04-hero-section.test.js` verifies `.hero-section`, `.hero-title`, `.guarantee-badge.pill-badge`, `.hero-actions a[href*="wa.me"]`, and `.hero-actions a[href*="portfolio"]`.
   - **Crucial Rule**: Any HTML restructuring must **retain** all existing classes, IDs, links, and text content inside the left column so no tests regress.
2. **Mobile Viewports (< 768px)**:
   - In `css/responsive.css:219`, `.floating-bottom-nav` has `display: none !important;` on screens under 768px (where the mobile hamburger drawer takes precedence). This rule must remain intact.
   - In the Hero section, on screens under 1024px, the 2-column grid must collapse to 1 column (`grid-template-columns: 1fr`) with the showcase card positioned cleanly beneath the CTAs or hidden if vertical space is constrained.
3. **Subpages Consistency**:
   - `services.html`, `portfolio.html`, and `contact.html` utilize `.page-hero-section`. While Defect 1 focuses on the homepage Hero balance, Defect 3's fix (floating dock scroll hysteresis) benefits all pages globally.

---

## 4. Conclusion & Recommended Actionable Solution

### 4.1 Solution for Defect 1: Desktop Container & Hero Balance

#### A. Architecture: 2-Column Balanced Editorial Grid
Transform `.hero-container` into a responsive 2-column asymmetric grid matching Room & Pillar's aesthetic:
- **Left Column (`.hero-content-col`)**:
  1. Guarantee pill badge (`.hero-badge-wrap`)
  2. Display Headline (`h1.hero-title`) with neon lime accent span
  3. Lead Subheadline (`p.hero-subheadline`) with max-width 560px
  4. Dual CTAs (`.hero-actions`)
  5. Styled horizontal telemetry bar (`.hero-telemetry-bar`) with dividers
- **Right Column (`.hero-showcase-col`)**:
  An **Interactive Architectural Showcase Card** (`.hero-showcase-card.card-tilt.interactive-card`):
  - 3D perspective tilt (`perspective: 1000px`) with specular glare tracking mouse position
  - macOS obsidian header bar with traffic-light dots (`#ff5f56`, `#ffbd2e`, `#27c93f`), file tab (`rubicweb.engine.config.ts`), and pulsing status pill (`● PRODUCTION READY`)
  - Syntax-highlighted code block displaying Rubicweb's core architecture (PageSpeed 99, Pure Vanilla, Full Source Code Ownership)
  - 3 bottom metric telemetry tiles (`99/100 PageSpeed`, `60 fps Animations`, `100% Ownership`)

#### B. Exact HTML Patch for `index.html` (Hero Section)
Replace lines 139–183 of `index.html` with:
```html
    <section class="hero-section" id="hero">
      <div class="container hero-container">
        <!-- LEFT COLUMN: EDITORIAL COPY, CTAS & TELEMETRY -->
        <div class="hero-content-col">
          <!-- Guarantee Pill Badge -->
          <div class="hero-badge-wrap">
            <div class="guarantee-badge pill-badge">
              <span class="badge-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </span>
              <span class="badge-text">Garansi 100% Kepuasan / Uang Kembali</span>
            </div>
          </div>

          <!-- Editorial Display H1 -->
          <h1 class="hero-title">Membangun Website <span class="accent">Berkinerja Tinggi</span> &amp; Desain Kelas Dunia</h1>

          <!-- Agency Narrative Subheadline -->
          <p class="hero-subheadline body-copy">
            Rubicweb merekayasa website kustom dan aplikasi web enterprise dengan performa ultra-cepat, arsitektur kode bersih (clean code), dan pengalaman visual imersif tanpa kompromi untuk mempercepat pertumbuhan bisnis Anda.
          </p>

          <!-- Call-to-Action Group -->
          <div class="hero-actions hero-ctas">
            <a href="https://wa.me/6285280008984?text=Halo%20Rubicweb,%20saya%20ingin%20konsultasi%20pembuatan%20website%20berkinerja%20tinggi." class="btn btn--primary btn--lg" target="_blank" rel="noopener noreferrer">Konsultasi Gratis via WhatsApp</a>
            <a href="#portfolio" class="btn btn--secondary btn--lg">Jelajahi Portofolio</a>
          </div>

          <!-- Hero Telemetry Metrics Bar -->
          <div class="hero-telemetry-bar">
            <div class="telemetry-item">
              <span class="telemetry-value font-mono">95+</span>
              <span class="telemetry-label">Google PageSpeed</span>
            </div>
            <div class="telemetry-divider"></div>
            <div class="telemetry-item">
              <span class="telemetry-value font-mono">&lt; 1.0s</span>
              <span class="telemetry-label">First Contentful Paint</span>
            </div>
            <div class="telemetry-divider"></div>
            <div class="telemetry-item">
              <span class="telemetry-value font-mono">100%</span>
              <span class="telemetry-label">Source Code Ownership</span>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: INTERACTIVE ARCHITECTURAL SHOWCASE CARD -->
        <div class="hero-showcase-col">
          <div class="hero-showcase-card card-tilt interactive-card">
            <div class="showcase-window-header">
              <div class="window-controls">
                <span class="win-dot dot-red"></span>
                <span class="win-dot dot-yellow"></span>
                <span class="win-dot dot-green"></span>
              </div>
              <span class="window-filename font-mono">rubicweb.engine.config.ts</span>
              <span class="window-badge font-mono">
                <span class="badge-pulse-dot"></span> PRODUCTION READY
              </span>
            </div>
            <div class="showcase-code-body">
              <pre><code><span class="token-keyword">export const</span> <span class="token-variable">rubicwebStack</span> = {
  <span class="token-property">architecture</span>: <span class="token-string">"High-Performance Clean Code"</span>,
  <span class="token-property">frameworks</span>: <span class="token-string">"Zero-Dependency / Pure Vanilla"</span>,
  <span class="token-property">telemetry</span>: {
    <span class="token-property">pageSpeed</span>: <span class="token-number">99</span>,
    <span class="token-property">firstContentfulPaint</span>: <span class="token-string">"0.7s"</span>,
    <span class="token-property">uptimeSLA</span>: <span class="token-string">"99.9%"</span>
  },
  <span class="token-property">ownership</span>: <span class="token-string">"100% Full Source Code"</span>,
  <span class="token-property">guarantee</span>: <span class="token-string">"Money-Back Warranty"</span>
};</code></pre>
            </div>
            <div class="showcase-telemetry-grid">
              <div class="showcase-metric-tile">
                <div class="metric-num font-mono text-lime">99/100</div>
                <div class="metric-caption">PageSpeed</div>
              </div>
              <div class="showcase-metric-tile">
                <div class="metric-num font-mono text-cyan">60 fps</div>
                <div class="metric-caption">Animations</div>
              </div>
              <div class="showcase-metric-tile">
                <div class="metric-num font-mono text-gold">100%</div>
                <div class="metric-caption">Ownership</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
```

#### C. Exact CSS Rules for `css/style.css` & `css/responsive.css`
```css
/* --- Hero Section & Container Layout --- */
.hero,
.hero-section {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 120px;
  padding-bottom: 60px;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .hero-container {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: clamp(32px, 4vw, 56px);
    align-items: center;
    width: 100%;
  }

  .hero-content-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 1023px) {
  .hero-container {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
}

/* Subheadline Typography Fix */
.hero-subheadline,
.hero-subtitle,
.hero-description {
  font-size: var(--text-body-lg);
  line-height: var(--leading-snug);
  color: var(--text-secondary);
  max-width: 580px;
  margin-top: 16px;
  margin-bottom: 32px;
}

/* Hero Horizontal Telemetry Bar */
.hero-telemetry-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  padding: 16px 24px;
  background-color: rgba(24, 25, 32, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  margin-top: 12px;
}

.hero-telemetry-bar .telemetry-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-telemetry-bar .telemetry-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-primary);
  line-height: 1.1;
}

.hero-telemetry-bar .telemetry-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

.hero-telemetry-bar .telemetry-divider {
  width: 1px;
  height: 32px;
  background-color: var(--border-subtle);
}

/* Hero Showcase Card (Right Column) */
.hero-showcase-card {
  background: linear-gradient(145deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-lg), 0 0 32px rgba(210, 254, 113, 0.08);
  position: relative;
}

.showcase-window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--border-hairline);
  padding-bottom: 12px;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.win-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.dot-red { background-color: #ff5f56; }
.dot-yellow { background-color: #ffbd2e; }
.dot-green { background-color: #27c93f; }

.window-filename {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.window-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent-primary);
  background: var(--accent-primary-alpha);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}

.badge-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--accent-primary);
  box-shadow: 0 0 8px var(--accent-primary);
}

.showcase-code-body pre {
  font-family: var(--font-mono);
  font-size: clamp(0.78rem, 0.9vw, 0.85rem);
  line-height: 1.65;
  color: var(--text-primary);
  overflow-x: auto;
  margin-bottom: 20px;
}

.token-keyword { color: var(--accent-primary); font-weight: 600; }
.token-variable { color: var(--accent-cyan); }
.token-property { color: var(--accent-amber); }
.token-string { color: #a1a3af; }
.token-number { color: var(--accent-primary); }

.showcase-telemetry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  border-top: 1px solid var(--border-hairline);
  padding-top: 16px;
}

.showcase-metric-tile {
  background: rgba(32, 34, 43, 0.6);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  text-align: center;
  border: 1px solid var(--border-hairline);
}

.metric-num { font-size: 1.1rem; font-weight: 700; }
.metric-caption { font-size: 0.7rem; color: var(--text-muted); }
.text-lime { color: var(--accent-primary); }
.text-cyan { color: var(--accent-cyan); }
.text-gold { color: var(--accent-amber); }
```

---

### 4.2 Solution for Defect 3: Floating Dock Heading Collision

#### A. Full Viewport Hero Height (100vh)
- Setting `.hero, .hero-section { min-height: 100vh; min-height: 100dvh; }` pushes Section 2 (`#services`) entirely below the fold at `scrollY = 0`.
- **Empirical Measurement**:
  - Services title moves to `top: 924.4px` (on 900px screen) and `top: 1107.7px` (on 1080px screen).
  - Both are completely outside the visible viewport at `scrollY = 0`.
  - **Collision count drops to 0 immediately upon page load**.

#### B. Scroll Hysteresis & Glassmorphic Visibility in `js/main.js`
In `js/main.js`, add a dedicated controller for `.floating-bottom-nav`:
1. **Initial State (Hero view / `scrollY < 180`)**:
   - The primary navigation is `.site-header` at the top.
   - The floating dock can either:
     - Stay neatly docked at `bottom: 24px` (safe because Hero is now `100vh` and no headings are present), OR
     - Seamlessly hide (`transform: translate(-50%, 150%); opacity: 0; pointer-events: none;`) when `scrollY < 150`, and slide up smoothly into view (`transform: translate(-50%, 0); opacity: 1; pointer-events: auto;`) once the visitor scrolls down past the hero fold.
2. **Scroll Down Hysteresis**:
   - When scrolling down past 500px (`deltaY > 10`), `.floating-bottom-nav` translates down (`translate(-50%, 150%)`), keeping reading passages and headings completely unobstructed.
   - When scrolling up (`deltaY < -5`), it slides back into view.
3. **Enhanced Glassmorphic Opacity**:
   - Update `.floating-bottom-nav` background from `0.85` to `rgba(17, 18, 22, 0.95)` with `backdrop-filter: blur(20px)` and subtle border glow. This eliminates any ghosting artifacts when the dock passes over text during scrolling.

```javascript
// Add to js/main.js under initNavigation():
function initFloatingBottomNav() {
  const floatingNav = document.querySelector('.floating-bottom-nav');
  if (!floatingNav) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const currentY = window.scrollY;
    const deltaY = currentY - lastScrollY;

    // Fast scroll down past hero: hide to prevent heading occlusion
    if (currentY > 400 && deltaY > 15) {
      floatingNav.classList.add('nav-dock--hidden');
    } else if (deltaY < -8 || currentY <= 300) {
      floatingNav.classList.remove('nav-dock--hidden');
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
}
```

```css
/* In css/style.css: */
.floating-bottom-nav {
  /* ... existing styles ... */
  background-color: rgba(17, 18, 22, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: transform 0.35s var(--ease-swift-out), opacity 0.35s ease;
}

.floating-bottom-nav.nav-dock--hidden {
  transform: translate(-50%, 140%);
  opacity: 0;
  pointer-events: none;
}
```

---

## 5. Verification Method

To independently verify these findings and confirm the fix:

### 5.1 Run Empirical Inspection Script
Run the automated CDP inspection script:
```powershell
node .agents\teamwork\explorer_m6_1\inspect_defects.js
```
Expected output:
- `Collision at scrollY=0: navIntersectsServicesTitle = true` (reproduces Defect 3).
- Hero void measurement confirms > 600px–1100px empty right space (reproduces Defect 1).

### 5.2 Run Verification Test Script
Run the automated verification script:
```powershell
node .agents\teamwork\explorer_m6_1\test_proposed_fix.js
```
Expected output:
- `Services Title Top: 924.4px (Viewport Height: 900px)` -> safely below the fold.
- `Collision with Section Title at scrollY=0: false` across 1280x800, 1440x900, 1920x1080.
- `Left Col Width: 731px, Right Col Width: 540px, Right Col Right Edge: 1372px vs Container Right: 1412px` -> empty void completely eliminated.
- Inspect generated screenshots:
  - `.agents/teamwork/explorer_m6_1/verified_1280x800.png`
  - `.agents/teamwork/explorer_m6_1/verified_1440x900.png`
  - `.agents/teamwork/explorer_m6_1/verified_1920x1080.png`

### 5.3 Run Full E2E Test Suite
Confirm zero regression against all 204 existing automated tests:
```powershell
node tests\run-e2e.js
```
Expected output:
- `Total Tests: 204 | Passed: 204 | Failed: 0`
- `E2E RUN PASSED: 100% test success!`
