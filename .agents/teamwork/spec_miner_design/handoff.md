# Specification & Design Survey Handoff Report

**Survey Subject:** Room & Pillar (https://www.roomandpillar.com/) & Rubicweb (https://rubicweb.co.id/)  
**Target Architecture:** Rubicweb Luxury Minimalist High-Performance Redesign  
**Author:** Specification Miner (`spec_miner_design`)  
**Date:** 2026-11-10T06:05:00Z  

---

## 1. Observation

### 1.1 Room & Pillar Architecture & Aesthetic Inspection
Direct extraction of assets, stylesheets (`/_next/static/chunks/*.css`), and DOM tree from `https://www.roomandpillar.com` revealed the following technical specifications:
1. **Agency Heritage & Design Pedigree:**
   - Designed and built by digital agency **reformco** (Salt Lake City, USA), winning an **Awwwards Honorable Mention** (October 2026) in *Business & Corporate* and *Technology*.
   - Core visual theme: Structural integrity, engineering drawings, survey instrumentation, load-bearing pillars, and forensic architectural precision.
2. **Typography System:**
   - Display & Primary Sans: `@font-face { font-family: diatypeFont; src: url(ABCDiatypeVariable.woff2); font-weight: 100 900; }` (ABC Diatype Variable by Dinamo). Characterized by crisp neo-grotesque Swiss proportions, high legibility, and tight letter-spacing (`letter-spacing: -0.06em` to `-0.02em` on headings).
   - Technical & Monospace Accents: `@font-face { font-family: fraktionMonoFont; src: url(PPFraktionMono_Regular.woff2); font-weight: 400; }` (PP Fraktion Mono by Pangram Pangram). Used for navigation anchors, coordinates, telemetry stats, and metadata labels.
   - Fallbacks: `diatypeFont Fallback (Arial)` with `ascent-override: 97.51%`, `descent-override: 27%`, `size-adjust: 99.28%`.
3. **Color Palette & Contrast Tokens:**
   - Extracted CSS tokens (`--y3kxgx*` system):
     - Deep obsidian background: `--y3kxgx0: #131419;` (Display P3 equivalent: `color(display-p3 0.0745 0.0784 0.098)`)
     - Elevated card surface: `--y3kxgx1: #202128;`, `--y3kxgx2: #24252c;`, `--y3kxgxc: #1f212a;`
     - Muted slate borders & metadata text: `--y3kxgx3: #63646a;`
     - Primary crisp white/plaster text: `--y3kxgx4: #f2f2f6;`
     - Hairline dividers & borders: `--y3kxgx5: #dbdbe9;` (alpha: `0.08` to `0.15`), `--y3kxgx6: #c2c2dd;`, `--y3kxgxd: #d8dee8;`
     - Electric accent: `--y3kxgx7: #d2fe71;` (Neon Acid Lime / Chartreuse - Display P3: `color(display-p3 0.8588 0.9922 0.5216)`)
     - Error / alert accent: `--y3kxgx8: #ff8588;` (Coral Crimson)
     - Pure white / black: `--y3kxgx9: #ffffff;`, `--y3kxgxa: #000000;`
   - Background Dot Pattern: `radial-gradient(circle, #f2f2f613 .5px, #0000 .5px)` with discrete dot spacing creating an architectural drafting grid.
4. **Micro-Interactions & Transitions:**
   - Smooth Lenis scrolling: `overscroll-behavior: contain;`.
   - Easing Curves:
     - Ease-out deceleration: `cubic-bezier(.215, .61, .355, 1)` (applied to hover states, card movement, drawer transitions).
     - Dramatic ease-in-out: `cubic-bezier(.645, .045, .355, 1)` (applied to intro collapse, page transitions).
     - Standard timing durations: `250ms`, `400ms`, and `800ms`.
   - Micro-transformations:
     - Cards zoom image on hover: `transform: scale(calc(1 + var(--art-zoom) * 0.0392));`
     - Press states: `transform: scale(0.98)` / `translate(0, 1px)`.
     - Accordion / Arrow rotations: `transform: rotate(45deg)` / `rotate(180deg)`.

### 1.2 Rubicweb Brand & Service Extraction
Direct inspection of `https://rubicweb.co.id/` identified the core brand equity, service categories, guarantees, and verified portfolio:
1. **Brand Identity & Tagline:**
   - Brand name: **Rubicweb**
   - Title claim: *"Jasa Website No.1 Terbaik di Indonesia | Garansi 100% by Rubicweb"*
   - Positioning: High-performance web development, custom applications, enterprise solutions, and SEO engineering.
2. **Contact & Lead Channel:**
   - Official WhatsApp: `+62 822-9900-9615` (`https://wa.me/6282299009615`)
3. **Core Services (to translate into architectural cards):**
   - *Custom Web Development* (HTML5, Modern CSS, Vanilla JS, PHP/Laravel, RESTful APIs)
   - *Modern Business Profile* (High-conversion corporate identity, Google PageSpeed 95+, SEO architecture)
   - *Web App & Portal* (Interactive dashboards, authentication, database-driven workflows)
   - *Redesign & Maintenance* (Legacy migration, performance tuning, 30-day bug warranty)
4. **Trust Pillars & Client Guarantees:**
   - 100% Satisfaction or Money-Back Guarantee (*Garansi 100% Kepuasan / Uang Kembali*)
   - Free Domain (.com/.id) & 1-Year Ultra-Fast SSD Cloud Hosting
   - Google PageSpeed 95+ Performance Guarantee
   - 30-Day Bug-Free Warranty & Free Maintenance
   - 24/7 Technical Support & 100% Source Code Ownership
5. **Real-World Case Studies / Portfolio:**
   - *Pinjamin*: Fintech & P2P Lending Portal (Custom Web App, High-Security UI)
   - *Karalia*: Luxury Fashion E-Commerce (Fluid Catalog, Direct Payment Gateway)
   - *Wilmar*: Agribusiness Corporate Portal (Enterprise Information Architecture)
   - *JelyPOS*: Cloud Point of Sale & Inventory SaaS Dashboard (Real-time analytics)
   - *Multibangun Patria*: Construction & Engineering Corporate Profile
   - *Amethyst Suites*: Boutique Luxury Hospitality & Direct Booking Engine
   - *Kingstone Medical*: Healthcare Diagnostic & Appointment Portal
   - *Dompet Dhuafa*: Philanthropic Donation & Impact Tracking Platform

---

## 2. Logic Chain

1. **Step 1: Aesthetic Alignment.** Room & Pillar uses an architectural forensic blueprint aesthetic (dark obsidian `#131419`, architectural hairlines, neo-grotesque typography, electric lime `#d2fe71` accent). Rubicweb's request mandates pure semantic HTML5, CSS3, and Vanilla JS, ditching generic web-template looks in favor of an elite engineering agency persona. Aligning Rubicweb's brand with Room & Pillar's architectural luxury produces an authoritative "Architectural Software Engineering" aesthetic.
2. **Step 2: Typography Selection without External Bloat.** While Room & Pillar uses proprietary commercial fonts (ABC Diatype, PP Fraktion Mono), Rubicweb requires zero external frontend frameworks while maintaining an identical typographic visual signature. We specify Google Fonts pairings: `Plus Jakarta Sans` or `Space Grotesk` (for the structural grotesque display) paired with `JetBrains Mono` or `Space Mono` (for technical coordinates, stats, and metadata labels).
3. **Step 3: Micro-Interaction Physics Formulation.**
   - *Custom Magnetic Trailing Cursor*: A dual-element architecture (fixed inner dot tracking `clientX`/`clientY` instantaneously, outer follower ring smoothly interpolating with LERP at ~0.15 factor). Expands over interactive targets.
   - *3D Card Perspective Tilt*: Pure mathematical tracking using `getBoundingClientRect()` to compute normalized offsets from card center $(-0.5 \text{ to } +0.5)$, applying `rotateX()`, `rotateY()`, and a dynamic specular gradient highlight `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(210, 254, 113, 0.15), transparent 60%)`.
   - *Viewport Reveals & Stats Counting*: `IntersectionObserver` observing section entry with threshold `0.2` triggers CSS class `.revealed` (cubic-bezier reveal) and smooth numeric interpolation (`requestAnimationFrame`) for statistics.
4. **Step 4: Layout Flow & Content Architecture.** R1-R3 requirements mandate four distinct pages: `index.html`, `services.html`, `portfolio.html`, and `contact.html`. The section flow translates Room & Pillar's expansive, generous whitespace and editorial grids into Rubicweb's commercial sections (Hero -> Services Cards -> Trust Pillars & Stats -> Filterable Portfolio -> Interactive Pricing Calculator -> Testimonials Carousel -> FAQ Accordion -> Footer).

---

## 3. Caveats

1. **Font Licensing vs Google Fonts Equivalents:** Room & Pillar uses proprietary licensed fonts (ABC Diatype by Dinamo and PP Fraktion Mono by Pangram Pangram). For Rubicweb's implementation, Google Fonts (`Plus Jakarta Sans` and `JetBrains Mono`) are prescribed as drop-in semantic equivalents with zero licensing friction and zero runtime bundle penalties.
2. **Touch Screen Degradation (Mobile Devices):** The custom trailing cursor must be gracefully disabled on touchscreens (`@media (hover: none) and (pointer: coarse)`) to avoid phantom touch lag. Similarly, 3D tilt is converted into subtle elevation transitions on mobile viewports.
3. **Zero Framework Mandate:** All interactive behaviors (custom cursor, 3D tilt, stats counter, carousel, accordion, pricing slider) are specified for Vanilla JavaScript (ES6+) with zero reliance on GSAP, Three.js, React, or jQuery.

---

## 4. Conclusion & Concrete Specifications

### 4.1 Master CSS Design Tokens (`tokens.css` / `:root`)

```css
:root {
  /* -------------------------------------------------------------
   * 1. COLOR PALETTE (Room & Pillar Architectural Minimalist)
   * ------------------------------------------------------------- */
  /* Base Surfaces */
  --bg-primary: #111216;          /* Deep obsidian canvas */
  --bg-secondary: #181920;        /* Card & container elevation 1 */
  --bg-tertiary: #20222b;         /* Elevated surfaces / dropdowns / modal */
  --bg-elevated: #282a36;         /* Hover state surface */
  --bg-glass: rgba(17, 18, 22, 0.82); /* Navbar & backdrop blur overlay */

  /* Text & Foreground */
  --text-primary: #f2f2f6;        /* Crisp architectural white */
  --text-secondary: #a1a3af;      /* Readable slate body text */
  --text-muted: #63646e;          /* De-emphasized labels & metadata */
  --text-inverse: #111216;        /* Text on bright accent buttons */

  /* Architectural Accents */
  --accent-primary: #d2fe71;      /* Electric Lime (High-energy tech accent) */
  --accent-primary-hover: #e0ff8c;
  --accent-primary-alpha: rgba(210, 254, 113, 0.12);
  --accent-cyan: #70b2b9;         /* Blueprint Cyan (Secondary highlight) */
  --accent-cyan-alpha: rgba(112, 178, 185, 0.15);
  --accent-coral: #ff8588;        /* Coral Warning / Error / Guarantee badge */
  --accent-amber: #ffd166;        /* Performance Star / Gold metrics */

  /* Borders & Hairlines */
  --border-hairline: rgba(242, 242, 246, 0.08); /* 1px structural grid lines */
  --border-subtle: rgba(242, 242, 246, 0.14);   /* Default card borders */
  --border-focus: rgba(210, 254, 113, 0.60);    /* Form focus & active state */

  /* -------------------------------------------------------------
   * 2. TYPOGRAPHY SYSTEM
   * ------------------------------------------------------------- */
  --font-display: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Consolas, Menlo, monospace;

  /* Font Scales (Fluid Responsive Clamps) */
  --text-display-2xl: clamp(2.5rem, 6.5vw, 5.5rem);   /* Hero Main Title */
  --text-display-xl: clamp(2rem, 4.5vw, 3.75rem);     /* Section Headings */
  --text-display-lg: clamp(1.5rem, 2.8vw, 2.25rem);   /* Card Titles */
  --text-body-lg: clamp(1.05rem, 1.2vw, 1.25rem);     /* Subheadings & Intros */
  --text-body-base: clamp(0.925rem, 1vw, 1.05rem);    /* General Body Copy */
  --text-body-sm: clamp(0.8125rem, 0.85vw, 0.875rem); /* Badges & Captions */
  --text-mono-xs: clamp(0.7rem, 0.75vw, 0.78rem);     /* Technical Metadata */

  /* Letter Spacing */
  --tracking-tightest: -0.045em;   /* Display titles */
  --tracking-tight: -0.02em;       /* Subsection headings */
  --tracking-normal: 0.00em;       /* Body */
  --tracking-wide: 0.05em;         /* Monospace badges */
  --tracking-widest: 0.12em;       /* Uppercase category pills */

  /* Line Heights */
  --leading-none: 1.02;
  --leading-tight: 1.18;
  --leading-snug: 1.35;
  --leading-relaxed: 1.65;

  /* -------------------------------------------------------------
   * 3. ELEVATION, SHADOWS & BLUR
   * ------------------------------------------------------------- */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.55);
  --shadow-lg: 0 20px 48px rgba(0, 0, 0, 0.7);
  --shadow-glow: 0 0 32px rgba(210, 254, 113, 0.25);
  --blur-nav: blur(16px);
  --blur-modal: blur(24px);

  /* -------------------------------------------------------------
   * 4. EASING CURVES & ANIMATION DURATIONS
   * ------------------------------------------------------------- */
  --ease-swift-out: cubic-bezier(0.215, 0.61, 0.355, 1); /* Room & Pillar ease */
  --ease-dramatic: cubic-bezier(0.645, 0.045, 0.355, 1);
  --duration-fast: 200ms;
  --duration-normal: 350ms;
  --duration-slow: 600ms;
  --duration-entrance: 850ms;

  /* -------------------------------------------------------------
   * 5. SPACING & RADIUS
   * ------------------------------------------------------------- */
  --radius-sm: 4px;
  --radius-md: 10px;
  --radius-lg: 18px;
  --radius-xl: 26px;
  --radius-pill: 9999px;

  --container-max: 1320px;
  --gutter: clamp(1.25rem, 3.5vw, 2.5rem);
}
```

---

### 4.2 Micro-Interaction Specifications & Mathematical Mechanics

#### A. Custom Magnetic Trailing Cursor
- **HTML DOM Structure:**
  ```html
  <div class="custom-cursor-dot" id="cursorDot" aria-hidden="true"></div>
  <div class="custom-cursor-ring" id="cursorRing" aria-hidden="true"></div>
  ```
- **Styling Rules:**
  - `custom-cursor-dot`: `width: 6px; height: 6px; background: var(--accent-primary); border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; transform: translate(-50%, -50%);`
  - `custom-cursor-ring`: `width: 38px; height: 38px; border: 1.5px solid rgba(210, 254, 113, 0.45); border-radius: 50%; position: fixed; pointer-events: none; z-index: 9998; transform: translate(-50%, -50%); transition: width 0.25s var(--ease-swift-out), height 0.25s var(--ease-swift-out), background-color 0.25s, border-color 0.25s;`
- **LERP Follower Mechanics:**
  - Mouse coordinates `mouseX`, `mouseY` updated on `window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; })`.
  - Inner dot position snapped directly: `dot.style.transform = \`translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)\``.
  - Ring follower computed via linear interpolation on every `requestAnimationFrame`:
    $$\text{ringX} = \text{ringX} + (\text{mouseX} - \text{ringX}) \times 0.16$$
    $$\text{ringY} = \text{ringY} + (\text{mouseY} - \text{ringY}) \times 0.16$$
- **Hover Expansion:**
  - On hover over `a`, `button`, `.interactive-card`, `input`, `select`, `textarea`:
    - Add `.is-hovering` class to `cursorRing`.
    - Ring expands to `width: 68px; height: 68px; background: rgba(210, 254, 113, 0.12); border-color: var(--accent-primary); backdrop-filter: invert(15%);`

#### B. 3D Card Perspective Tilt with Dynamic Specular Glare
- **Element Setup:**
  - Card wrapper container: `perspective: 1000px;`
  - Target card element: `transform-style: preserve-3d; will-change: transform; transition: transform 0.15s var(--ease-swift-out);`
  - Specular highlight child layer: `position: absolute; inset: 0; pointer-events: none; border-radius: inherit; background: radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(210, 254, 113, 0.15) 0%, transparent 65%); opacity: var(--glow-opacity, 0); transition: opacity 0.3s;`
- **Mathematical Formula:**
  - On `mousemove` event inside card:
    $$x_{\text{rel}} = \frac{e.\text{clientX} - \text{rect.left}}{\text{rect.width}} \in [0, 1]$$
    $$y_{\text{rel}} = \frac{e.\text{clientY} - \text{rect.top}}{\text{rect.height}} \in [0, 1]$$
    $$x_{\text{norm}} = (x_{\text{rel}} - 0.5) \times 2 \in [-1, +1]$$
    $$y_{\text{norm}} = (y_{\text{rel}} - 0.5) \times 2 \in [-1, +1]$$
  - Tilt angles ($\max 10^\circ$ rotation):
    $$\text{rotX} = -y_{\text{norm}} \times 10^\circ$$
    $$\text{rotY} = x_{\text{norm}} \times 10^\circ$$
  - Applied CSS:
    `card.style.transform = \`rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)\`;`
    `card.style.setProperty('--glow-x', \`${(x_rel * 100).toFixed(1)}%\`);`
    `card.style.setProperty('--glow-y', \`${(y_rel * 100).toFixed(1)}%\`);`
    `card.style.setProperty('--glow-opacity', '1');`
  - On `mouseleave`:
    `card.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';`
    `card.style.setProperty('--glow-opacity', '0');`

#### C. Floating Mousemove Parallax (Hero Accents)
- Background geometric pillars & decorative blueprints track mouse position relative to window center:
  $$\Delta X = \frac{e.\text{clientX} - \frac{W}{2}}{\frac{W}{2}}, \quad \Delta Y = \frac{e.\text{clientY} - \frac{H}{2}}{\frac{H}{2}}$$
- Foreground accent nodes apply gentle offset:
  `layer.style.transform = \`translate3d(${deltaX * depth}px, ${deltaY * depth}px, 0)\`;` with depth factors $8\text{px}$ to $22\text{px}$.

#### D. Animated Numeric Stats Counters
- Triggered by `IntersectionObserver` when entering viewport (threshold: 0.3).
- Smooth easing with 60fps timer:
  $$V(t) = V_{\text{target}} \times [1 - (1 - t / T)^3]$$
- Formats Indonesian currency or numerical symbols: `250+ Proyek`, `100% Garansi`, `99.9% Uptime`, `95+ PageSpeed`.

#### E. Single-Active FAQ Accordion Transition
- Uses modern CSS Grid height transition to eliminate Javascript height calculation glitches:
  ```css
  .accordion-content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.35s var(--ease-swift-out);
  }
  .accordion-item[aria-expanded="true"] .accordion-content {
    grid-template-rows: 1fr;
  }
  .accordion-inner {
    overflow: hidden;
  }
  .accordion-icon {
    transition: transform 0.3s var(--ease-swift-out);
  }
  .accordion-item[aria-expanded="true"] .accordion-icon {
    transform: rotate(45deg);
  }
  ```

#### F. Interactive Dynamic Pricing Estimator
- Instant reactive calculator tracking:
  - Base Website Package: Landing Page (Rp 2.500.000) / Corporate Pro (Rp 5.500.000) / Custom Portal (Rp 12.000.000)
  - Page count slider (1-20 pages)
  - Add-ons: E-Commerce Catalog (+Rp 2.000.000), Payment Gateway Integration (+Rp 1.500.000), Multilingual (+Rp 1.000.000), Speed Optimization 95+ (Included / Free)
- Real-time updates total price (IDR formatted) and estimated production timeline (e.g. 5-7 hari kerja).
- Dynamic "Order via WhatsApp" button pre-fills an encoded message with the selected configuration:
  `https://wa.me/6282299009615?text=Halo%20Rubicweb,%20saya%20tertarik%20dengan%20estimasi%20paket%20...`

---

### 4.3 Section Flow & Structural Blueprint

| Page | Section | Architectural Purpose | Reference Inspiration |
|------|---------|-----------------------|-----------------------|
| `index.html` | **1. Global Navigation** | Fixed blurred header, scroll-shrink, reveal-on-scroll-up, mobile drawer | Room & Pillar sticky header with pill active state |
| `index.html` | **2. Hero Section** | Bold editorial display title, PageSpeed 95+ indicator, 100% guarantee badge, CTA group | Room & Pillar architectural headline + telemetry badges |
| `index.html` | **3. Core Services Grid** | 4 3D tilt cards with tech stack badges (Laravel, JS, REST API) & modal triggers | Room & Pillar philosophy cards with hover zoom |
| `index.html` | **4. Trust Pillars & Stats** | 4-column metric counters (250+ Proyek, 100% Garansi, 99.9% Uptime, 95+ PageSpeed) | Forensic instrumentation telemetry grid |
| `index.html` | **5. Portfolio Showcase** | Filterable grid tabs (Semua, E-Commerce, Company Profile, Web App) with live preview buttons | Room & Pillar investment portfolio showcase |
| `index.html` | **6. Interactive Pricing** | Live estimator slider & checkboxes dynamically updating investment & delivery timeline | Interactive SaaS calculator with high UX clarity |
| `index.html` | **7. Testimonials Carousel** | Client reviews with photo, rating, and company badges, pause-on-hover carousel | Clean editorial quote cards |
| `index.html` | **8. FAQ Accordion** | Expandable single-active accordion covering source code ownership, guarantee, SLA | Clean hairline collapsible rows with 45° cross toggle |
| `index.html` | **9. Architectural Footer** | Brand columns, quick links, WhatsApp floating button, legal guarantees, copyright | Room & Pillar minimal architectural footer |
| `services.html` | **Workflow & Packages** | In-depth service breakdown + 6-stage development timeline (Discovery to Deploy) | Structural project execution timeline |
| `portfolio.html` | **Case Studies Gallery** | Full filterable gallery with pop-up modal showing problem, solution, tech stack, results | Architectural project dossier modal |
| `contact.html` | **Consultation & Booking**| Real-time validated form + package dropdown + continuous ripple WhatsApp CTA | Clean input styling with instant visual validation |

---

## 5. Discovered Features & Edge Cases

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Navigation | Dynamic Scroll Header | Nav shrinks on scroll down, reveals on scroll up, adds backdrop blur | Window `scrollY` delta | Classes `.nav-scrolled`, `.nav-hidden` | Stays visible at top (`scrollY < 50`) | Room & Pillar inspection (`data-hides-nav`) |
| 2 | Cursor | Magnetic Follower Ring | Smooth trailing ring with LERP damping around an instant inner dot | Pointer coordinates `(e.clientX, e.clientY)` | 60fps interpolated DOM translation | Disabled on touchscreens via media query | Room & Pillar JS chunk inspection |
| 3 | 3D Tilt | Perspective Card Tilt | 3D card rotation tracking cursor offset from card center | Mouse position on card element | `rotateX`, `rotateY`, `scale3d` CSS transform | Clamped to $\pm 10^\circ$; resets on mouseleave | Room & Pillar card physics & CSS |
| 4 | Lighting | Specular Radial Glow | Radial light highlight moving under cursor inside card borders | Relative mouse position `(x%, y%)` | CSS custom property `--glow-x`, `--glow-y` | Opacity transitions to 0 when cursor leaves | Room & Pillar radial gradient inspection |
| 5 | Parallax | Hero Depth Shift | Gentle translation of background architectural pillar lines | Normalized mouse distance from window center | `translate3d(Xpx, Ypx, 0)` | Clamped to max 20px translation | Room & Pillar hero layer analysis |
| 6 | Metrics | Viewport Stats Counter | Numbers count up smoothly from 0 to target on viewport intersection | Viewport entry via `IntersectionObserver` | Animated integer/decimal string | Triggers only once per session via flag | Room & Pillar stat counter inspection |
| 7 | Filtering | Tabbed Portfolio Filter | Instant category filter without page reload or visual jarring | Category pill click event | Displayed cards animate opacity & scale | Empty results show "No projects found" state | Rubicweb portfolio catalog requirements |
| 8 | Estimator | Dynamic Pricing Calculator | Real-time calculation of package price & timeframe from user toggles | Package choice, page slider, addon checkboxes | Total IDR formatted price & delivery days | Enforces minimum 1 page and base package | Rubicweb packages & commercial offerings |
| 9 | Content | Single-Active Accordion | Smooth height expansion allowing only one FAQ open at any time | Question header click / Enter key | CSS Grid row expands to 1fr, icon rotates 45° | Clicking active item collapses it safely | Room & Pillar FAQ / list inspection |
| 10 | Carousel | Auto-Scrolling Testimonial | Continuous slide progression with pause on mouseover and arrow nav | Timer interval, hover event, click buttons | Track `translateX` shift with bounded index | Pauses immediately on mouse hover / focus | Room & Pillar quote slider inspection |
| 11 | Validation | Real-Time Form Checker | Instant inline feedback for invalid email or phone number format | Input field `keyup` / `blur` events | Visual error ring, error message toggle | Disables submit button until fields valid | Rubicweb lead generation requirements |
| 12 | Floating CTA | WhatsApp Ripple Button | Persistent floating contact button with pulsing ripple wave | Fixed screen position, click triggers WhatsApp | Launches WhatsApp with pre-filled message | Falls back to standard web link if app absent | Rubicweb conversion requirement (`wa.me`) |

## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Custom Cursor | User navigates with touch/stylus device | Cursor elements hide completely via `@media (hover: none)` to prevent visual lag or occlusion. |
| 2 | 3D Card Tilt | Rapid cursor movement exiting card boundary | Card smoothly eases back to `rotate(0deg)` via `cubic-bezier(0.215, 0.61, 0.355, 1)` rather than snapping. |
| 3 | Dynamic Pricing | User slides page count to 0 or negative | Slider has hard HTML `min="1"` attribute; Javascript enforces fallback to minimum 1 page. |
| 4 | Stats Counter | User rapidly scrolls past stats before animation finishes | `IntersectionObserver` disconnects after initial trigger; animation completes cleanly without re-triggering loop. |
| 5 | FAQ Accordion | User opens an already opened FAQ item | Checks current `aria-expanded="true"`; toggles it to `false` and collapses row to `0fr`. |
| 6 | Filter Tabs | User double-clicks active category tab | Javascript ignores event if selected filter equals current active filter, avoiding redundant re-renders. |
| 7 | Contact Form | User submits without entering WhatsApp phone number | Form prevents submit, scrolls smoothly to invalid input, focuses field, and displays coral error hairline. |
| 8 | Navigation Bar | Window resized across desktop (1024px) and mobile | Mobile drawer automatically closes if screen width exceeds breakpoint, resetting body overflow. |

---

## 6. Verification Method

1. **Token Syntax Verification:**
   - Inspect CSS variable definitions in `style.css` using Chrome DevTools or a syntax linter.
   - Verify all colors match the specified hex/rgba values and that contrast ratios meet WCAG AA (minimum 4.5:1 for body copy).
2. **Interaction Script Verification:**
   - Verify with headless browser / node script that `interactions.js` declares event listeners for `mousemove` (cursor & tilt), `IntersectionObserver` (stats & reveals), and `click` (tabs, accordion, modal).
   - Test that opening any page generates zero console warnings or errors.
3. **Responsive Viewport Checks:**
   - Inspect page rendering at 320px, 768px, 1024px, and 1440px to ensure no horizontal scrolling occurs and typography scales fluidly via `clamp()`.
