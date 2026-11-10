# Technical Architecture & Vanilla JS Interaction Mechanics Survey

**State Folder**: `c:\pkl\PKL\.agents\teamwork\explorer_tech\`  
**Target Project**: Rubicweb Website Redesign (`c:\pkl\PKL`)  
**Author**: Explorer Tech (Vanilla JS Architecture & Interaction Mechanics Specialist)  
**Date**: 2026-11-10T06:20:00Z  

---

## 1. Observation

### 1.1 Existing Workspace Inventory
Direct inspection via PowerShell commands revealed the current project directory state in `c:\pkl\PKL`:
- **Root Directory Structure**:
  - `index.html` (53,440 bytes) — Existing single-page structure combining hero, about, services, stats, portfolio preview, terminal widget, and contact.
  - `homepagerubic.html` (53,440 bytes) — Duplicate backup of previous index.
  - `pages/` directory containing: `about.html`, `contact.html`, `faq.html`, `karalia.html`, `pinjamin.html`, `portfolio.html`, `services.html`, `wilmar.html`.
  - `rubicweb/` directory — Subfolder containing another redundant copy of `index.html`, `pages/`, `css/`, `js/`, and `assets/`.
  - `css/` directory containing: `style.css` (55,183 bytes), `animations.css` (1,936 bytes), `responsive.css` (3,706 bytes).
  - `js/` directory containing: `main.js` (2,263 bytes), `interactive.js` (5,375 bytes), `navigation.js` (4,161 bytes), `portfolio.js` (4,816 bytes), `form.js` (5,734 bytes), `scroll.js` (1,700 bytes), `terminal.js` (2,384 bytes).
  - `assets/` directory containing: brand logos (`rubicweb-logo.svg`, `rubicweb-logo.png`, `rubicweb-logo-white.png`, `komdigi.png`), portfolio screenshots (`karalia-main.png`, `pinjamin-main.png`, `wilmar-main.png`), and client logos.

### 1.2 Discrepancies Against Requirements (R1-R4)
By cross-referencing `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`:
1. **File Hierarchy Violation (R1 & Acceptance Criteria)**:
   - *Requirement*: Site must have 4 core pages situated directly at root: `index.html`, `services.html`, `portfolio.html`, and `contact.html`.
   - *Observed Current State*: `services.html`, `portfolio.html`, and `contact.html` reside in `pages/` with internal relative links pointing to `../css/` and `../assets/`.
2. **JavaScript Modular Structure Violation (R1)**:
   - *Requirement*: Script files must be strictly partitioned into 4 distinct modules:
     - `js/main.js` (core layout, navbar, scroll behavior, mobile drawer)
     - `js/interactions.js` (custom trailing cursor, 3D card tilt, parallax, stats counters, accordion, testimonial carousel)
     - `js/portfolio.js` (instant category filtering, hover states, case study modal previews)
     - `js/contact.js` (inline validation, dynamic pricing calculator, WhatsApp floating ripple button)
   - *Observed Current State*: JavaScript is scattered across 7 fragmented files (`main.js`, `interactive.js`, `navigation.js`, `portfolio.js`, `form.js`, `scroll.js`, `terminal.js`).
3. **Missing or Incomplete Interaction Mechanisms (R2 & R3)**:
   - *Custom Trailing Cursor*: Missing from existing codebase. Only a static or browser-default cursor is used.
   - *3D Card Tilt with Perspective*: Currently limited to a 2D mousemove spotlight CSS variable `--spotlight-x`, without 3D `rotateX()`/`rotateY()` matrix transformation or radial border reflection.
   - *Portfolio Category Filtering*: Current `portfolio.js` only switches text in a single preview card rather than filtering an interactive multi-card grid.
   - *Dynamic Pricing Calculator*: Missing entirely from both homepage and contact page.
   - *Testimonial Carousel*: Missing auto-scrolling track with pause-on-hover controls.
   - *FAQ Accordion*: Missing single-expansion mechanism and smooth height/grid transitions.
   - *Inline Validation*: Currently only validates on form submit in `form.js`, lacking real-time `input`/`blur` event feedback and WhatsApp phone format enforcement.
   - *Services 6-Stage Timeline*: Currently missing visual sequential stage indicators.

### 1.3 Available Runtimes & Tooling
System commands verified:
- Node.js: `v25.7.0` (Native execution available)
- NPM: `11.10.1`
- Python: `3.13.0`
- Headless Browser Binaries Verified Present:
  - Microsoft Edge: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
  - Google Chrome: `C:\Program Files\Google\Chrome\Application\chrome.exe`

---

## 2. Logic Chain

```
[Observation 1.1 & 1.2: Dispersed file architecture & missing interaction features]
      │
      ▼
[Inference 1: Need a unified 4-page root layout + strict 4-file JS architecture conforming to R1]
      │
      ▼
[Observation 1.2: Existing interactions lack Room & Pillar micro-interactions and math]
      │
      ▼
[Inference 2: Formulate closed-form mathematical equations for Lerp cursor, 3D perspective tilt, 
              exponential easing counters, and real-time pricing calculator]
      │
      ▼
[Observation 1.3: Headless Chrome/Edge and Node.js v25.7 are directly accessible on Windows]
      │
      ▼
[Inference 3: Design zero-dependency automated verification script using Chrome DevTools Protocol 
              and headless CLI to validate zero console errors and 60fps performance]
```

### 2.1 File Architecture Blueprint
To satisfy R1 and ensure clean separation of concerns without external libraries:

```
c:\pkl\PKL\
├── index.html              # Homepage with Hero, Services, Stats, Portfolio, Pricing, Testimonials, FAQ
├── services.html           # Detailed service packages & 6-stage development workflow timeline
├── portfolio.html          # Interactive gallery with instant category filter & case study modals
├── contact.html            # Consultation form with inline validation, calculator sync, WhatsApp CTA
├── css/
│   ├── style.css           # Design tokens, typography, CSS resets, layout grid, component styling
│   ├── animations.css      # Keyframes (ripple, pulse, float), transition timings, reduced motion
│   └── responsive.css      # Fluid responsive rules across 320px, 768px, and 1440px
├── js/
│   ├── main.js             # Navigation bar (shrink/blur/hide), mobile drawer, scroll restoration
│   ├── interactions.js     # Custom cursor (Lerp), 3D card tilt, stats counter, carousel, accordion
│   ├── portfolio.js        # Category filter grid, hover zoom/overlay, case study modal popup
│   └── contact.js          # Real-time inline form validation, dynamic pricing calculator
└── assets/                 # SVGs, optimized PNG/JPG mockups, and client logos
```

---

## 3. Interaction Mechanics & Mathematical Implementation Blueprints

### 3.1 Custom Trailing Cursor (Lerp / RAF Smoothing)
The Room & Pillar interaction language relies on a dual-element magnetic cursor: a responsive primary dot that tracks raw mouse coordinates, accompanied by an eased trailing aura ring that expands when hovering over interactive elements.

#### Mathematical Model
Let target coordinates be $(X_{target}, Y_{target})$ from the `pointermove` event.  
Let current aura coordinates be $(X_{current}, Y_{current})$.  
In each frame of `requestAnimationFrame`:

$$X_{current} = X_{current} + (X_{target} - X_{current}) \times \lambda$$
$$Y_{current} = Y_{current} + (Y_{target} - Y_{current}) \times \lambda$$

Where damping factor $\lambda = 0.15$ ensures snappy, non-laggy tracking at 60fps.  
Distance delta threshold $\epsilon = 0.05\text{px}$ stops animation calculations when idle to conserve CPU cycles.

#### Implementation Blueprint (`js/interactions.js`)
```javascript
class CustomCursor {
  constructor() {
    // Only initialize if device has fine pointer (desktop mouse)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    this.cursorDot = document.createElement('div');
    this.cursorRing = document.createElement('div');
    this.cursorDot.className = 'custom-cursor-dot';
    this.cursorRing.className = 'custom-cursor-ring';
    document.body.appendChild(this.cursorDot);
    document.body.appendChild(this.cursorRing);

    this.mouse = { x: -100, y: -100 };
    this.ring = { x: -100, y: -100 };
    this.lambda = 0.15;
    this.rafId = null;
    this.isHovering = false;
    this.isVisible = false;

    this.initEvents();
  }

  initEvents() {
    window.addEventListener('pointermove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      if (!this.isVisible) {
        this.isVisible = true;
        this.cursorDot.style.opacity = '1';
        this.cursorRing.style.opacity = '1';
      }

      // Dot moves synchronously for zero perceived latency
      this.cursorDot.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0)`;
      
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(this.render.bind(this));
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      this.isVisible = false;
      this.cursorDot.style.opacity = '0';
      this.cursorRing.style.opacity = '0';
    });

    // Delegate hover states for interactive targets
    const interactiveSelector = 'a, button, input, select, textarea, .tilt-card, [role="button"], .tab-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) {
        this.cursorRing.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        this.cursorRing.classList.remove('cursor-hover');
      }
    });
  }

  render() {
    const dx = this.mouse.x - this.ring.x;
    const dy = this.mouse.y - this.ring.y;

    this.ring.x += dx * this.lambda;
    this.ring.y += dy * this.lambda;

    this.cursorRing.style.transform = `translate3d(${this.ring.x}px, ${this.ring.y}px, 0)`;

    // Keep RAF running while cursor is settling
    if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
      this.rafId = requestAnimationFrame(this.render.bind(this));
    } else {
      this.rafId = null;
    }
  }
}
```

#### CSS Specification (`css/style.css` & `css/animations.css`)
```css
.custom-cursor-dot,
.custom-cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 99999;
  border-radius: 50%;
  opacity: 0;
  will-change: transform, opacity;
  transition: opacity 0.2s ease, width 0.25s ease, height 0.25s ease;
}

.custom-cursor-dot {
  width: 6px;
  height: 6px;
  background-color: var(--accent-primary);
  margin-top: -3px;
  margin-left: -3px;
}

.custom-cursor-ring {
  width: 34px;
  height: 34px;
  margin-top: -17px;
  margin-left: -17px;
  border: 1.5px solid rgba(255, 184, 0, 0.45);
  background: transparent;
  transition: transform 0.08s ease-out, width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease, border-color 0.25s ease;
}

.custom-cursor-ring.cursor-hover {
  width: 56px;
  height: 56px;
  margin-top: -28px;
  margin-left: -28px;
  border-color: var(--accent-primary);
  background-color: rgba(255, 184, 0, 0.12);
  backdrop-filter: invert(15%);
}

@media (pointer: coarse) {
  .custom-cursor-dot,
  .custom-cursor-ring {
    display: none !important;
  }
}
```

---

### 3.2 3D Card Tilt with Specular Radial Glow
Applied to service cards, capability highlights, and project cards to create architectural tactile depth.

#### Mathematical Model
Let card bounding rect be $W \times H$ positioned at viewport $(R_{left}, R_{top})$.  
For pointer position $(P_x, P_y)$:
1. Local relative coordinates:  
   $$X_{rel} = P_x - R_{left}$$  
   $$Y_{rel} = P_y - R_{top}$$
2. Normalized coordinates relative to card center, spanning $[-1, 1]$:  
   $$Norm_X = \frac{X_{rel} - \frac{W}{2}}{\frac{W}{2}}$$  
   $$Norm_Y = \frac{Y_{rel} - \frac{H}{2}}{\frac{H}{2}}$$
3. Maximum angular deflection: $\Theta_{max} = 10^\circ$.  
   Rotation angles:  
   $$Rotate_Y = Norm_X \times \Theta_{max}$$  
   $$Rotate_X = -Norm_Y \times \Theta_{max}$$  
   *(Note the negative sign on $Rotate_X$: tilting upward when cursor is in top half).*
4. Dynamic CSS Transform Matrix:  
   $$\mathbf{T} = \text{perspective}(1000\text{px}) \; \text{rotateX}(Rotate_X\text{deg}) \; \text{rotateY}(Rotate_Y\text{deg}) \; \text{scale3d}(1.02, 1.02, 1.02)$$

#### Implementation Blueprint (`js/interactions.js`)
```javascript
function init3DCardTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length || window.matchMedia('(pointer: coarse)').matches) return;

  cards.forEach(card => {
    let ticking = false;

    card.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const normX = (x - rect.width / 2) / (rect.width / 2);
        const normY = (y - rect.height / 2) / (rect.height / 2);

        const maxTilt = 10;
        const rotY = normX * maxTilt;
        const rotX = -normY * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.setProperty('--glow-x', `${x}px`);
        card.style.setProperty('--glow-y', `${y}px`);
        card.style.setProperty('--glow-opacity', '1');

        ticking = false;
      });
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.setProperty('--glow-opacity', '0');

      setTimeout(() => {
        card.style.transition = '';
      }, 500);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}
```

#### CSS Radial Border Glow Specification
```css
.tilt-card {
  position: relative;
  background-color: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  transform-style: preserve-3d;
  will-change: transform;
  overflow: hidden;
}

.tilt-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: radial-gradient(
    320px circle at var(--glow-x, 50%) var(--glow-y, 50%),
    rgba(255, 184, 0, 0.35),
    transparent 70%
  );
  opacity: var(--glow-opacity, 0);
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.tilt-card-content {
  position: relative;
  z-index: 2;
  transform: translateZ(24px); /* Parallax lift inside card */
}
```

---

### 3.3 Viewport Statistics Counters via IntersectionObserver
Executes continuous numerical count-ups upon entering the viewport with zero scroll event overhead.

#### Mathematical Model
Let $V_{start} = 0$, target value be $V_{target}$, duration $D = 1800\text{ms}$.  
For elapsed time $\Delta t = t_{current} - t_{start}$, normalized progress $p = \min(\Delta t / D, 1)$.  
Exponential Deceleration Easing Function:

$$E(p) = \begin{cases} 
1 & \text{if } p = 1 \\ 
1 - 2^{-10p} & \text{if } p < 1 
\end{cases}$$

$$V(t) = V_{start} + (V_{target} - V_{start}) \times E(p)$$

If $decimals = 1$: format with `toFixed(1)` (e.g. `99.9%`). If $decimals = 0$: format with integer floor.

#### Implementation Blueprint (`js/interactions.js`)
```javascript
function initStatsCounters() {
  const statElements = document.querySelectorAll('.stat-number[data-target]');
  if (!statElements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        obs.unobserve(el);

        const target = parseFloat(el.getAttribute('data-target') || '0');
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';

        if (prefersReducedMotion) {
          el.textContent = `${prefix}${decimals > 0 ? target.toFixed(decimals) : target}${suffix}`;
          return;
        }

        const duration = 1800;
        const startTime = performance.now();

        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = target * ease;

          const formatted = decimals > 0 ? current.toFixed(decimals) : Math.floor(current);
          el.textContent = `${prefix}${formatted}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = `${prefix}${decimals > 0 ? target.toFixed(decimals) : target}${suffix}`;
          }
        }

        requestAnimationFrame(step);
      }
    });
  }, {
    threshold: 0.35,
    rootMargin: '0px 0px -40px 0px'
  });

  statElements.forEach(el => observer.observe(el));
}
```

---

### 3.4 Instant Portfolio Category Filtering & CSS Grid Transitions
Provides instantaneous filtering between project types (`all`, `ecommerce`, `corporate`, `webapp`) without reloading or layout flashing.

#### Mathematical Staggering & State Transition Logic
When switching categories:
1. Filter buttons update `aria-selected` and active styling.
2. For each card in the grid:
   - If category matches:
     Card is displayed (`display: flex/block`), opacity transitions $0 \to 1$, scale $0.94 \to 1$.
     Stagger delay: $Delay_i = i \times 40\text{ms}$.
   - If category does not match:
     Card fades to opacity $0$, scale $0.94$, then is hidden (`display: none` after transition).

#### Implementation Blueprint (`js/portfolio.js`)
```javascript
function initPortfolioFiltering() {
  const filterTabs = document.querySelectorAll('.portfolio-filter-btn');
  const projectCards = document.querySelectorAll('.portfolio-card[data-category]');
  if (!filterTabs.length || !projectCards.length) return;

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const selectedFilter = tab.getAttribute('data-filter');

      filterTabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      let visibleIndex = 0;

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const isMatch = selectedFilter === 'all' || cardCategory === selectedFilter;

        if (isMatch) {
          card.style.display = '';
          // Force reflow for clean CSS transition
          void card.offsetWidth;
          card.style.transitionDelay = `${visibleIndex * 45}ms`;
          card.classList.remove('is-hidden');
          visibleIndex++;
        } else {
          card.style.transitionDelay = '0ms';
          card.classList.add('is-hidden');
          setTimeout(() => {
            if (card.classList.contains('is-hidden')) {
              card.style.display = 'none';
            }
          }, 240);
        }
      });
    });
  });
}
```

#### CSS Transition Rules
```css
.portfolio-card {
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

.portfolio-card.is-hidden {
  opacity: 0;
  transform: scale(0.94);
  pointer-events: none;
}
```

---

### 3.5 Interactive Dynamic Pricing Calculator & Estimator
Allows users to dynamically customize packages and generates an authoritative estimate with real-time recalculation and pre-populated WhatsApp consultation links.

#### Mathematical Model
Let base specifications for Tier $T \in \{\text{Basic}, \text{Pro}, \text{Enterprise}\}$ be:

| Tier | Base Price ($P_0$) | Base Pages ($N_0$) | Cost Per Extra Page ($C_p$) | Base Timeline ($D_0$) | Extra Page Days |
|---|---|---|---|---|---|
| **Paket Basic** | Rp 3.500.000 | 1 page | Rp 350.000 | 5 business days | +1 day / 2 pages |
| **Paket Pro** | Rp 7.500.000 | 5 pages | Rp 500.000 | 10 business days | +1 day / 2 pages |
| **Paket Enterprise** | Rp 18.000.000 | 10 pages | Rp 800.000 | 20 business days | +1 day / page |

Feature Add-on Vector $\mathbf{F}$:
- $F_1$ (E-Commerce & Product Catalog): $+Rp 3.500.000$, $+4\text{ days}$
- $F_2$ (Midtrans / Xendit Payment Gateway): $+Rp 2.500.000$, $+3\text{ days}$
- $F_3$ (Multi-language ID/EN): $+Rp 1.500.000$, $+2\text{ days}$
- $F_4$ (Custom Role Management & Admin Portal): $+Rp 4.000.000$, $+5\text{ days}$
- $F_5$ (PageSpeed 95+ & Advanced SEO Architecture): $+Rp 1.200.000$, $+2\text{ days}$
- $F_6$ (Extended 1-Year SLA Guarantee & Maintenance): $+Rp 3.000.000$, $+0\text{ days}$

For selected tier $T$, page count $N$, and active boolean add-ons $A_k \in \{0, 1\}$:

$$P_{total} = P_0(T) + \max(0, N - N_0(T)) \times C_p(T) + \sum_{k=1}^6 A_k \times Price(F_k)$$

$$D_{total} = D_0(T) + \left\lceil \max(0, N - N_0(T)) \times Rate_D(T) \right\rceil + \sum_{k=1}^6 A_k \times Days(F_k)$$

#### Implementation Blueprint (`js/contact.js`)
```javascript
class PricingCalculator {
  constructor() {
    this.container = document.querySelector('.pricing-calculator-widget');
    if (!this.container) return;

    this.tierInputs = this.container.querySelectorAll('input[name="pricing-tier"]');
    this.pageSlider = this.container.querySelector('#calc-pages-slider');
    this.pageCounterDisplay = this.container.querySelector('#calc-pages-count');
    this.featureCheckboxes = this.container.querySelectorAll('.calc-feature-checkbox');
    this.priceDisplay = this.container.querySelector('#calc-total-price');
    this.timelineDisplay = this.container.querySelector('#calc-total-timeline');
    this.whatsappCta = this.container.querySelector('#calc-whatsapp-cta');

    this.tierData = {
      basic: { basePrice: 3500000, basePages: 1, extraPagePrice: 350000, baseDays: 5, pageRate: 0.5 },
      pro: { basePrice: 7500000, basePages: 5, extraPagePrice: 500000, baseDays: 10, pageRate: 0.5 },
      enterprise: { basePrice: 18000000, basePages: 10, extraPagePrice: 800000, baseDays: 20, pageRate: 1.0 }
    };

    this.initEvents();
    this.recalculate();
  }

  initEvents() {
    this.tierInputs.forEach(input => {
      input.addEventListener('change', () => this.recalculate());
    });

    if (this.pageSlider) {
      this.pageSlider.addEventListener('input', (e) => {
        if (this.pageCounterDisplay) {
          this.pageCounterDisplay.textContent = `${e.target.value} Halaman`;
        }
        this.recalculate();
      });
    }

    this.featureCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => this.recalculate());
    });
  }

  recalculate() {
    const selectedTier = Array.from(this.tierInputs).find(i => i.checked)?.value || 'pro';
    const config = this.tierData[selectedTier];
    const pages = parseInt(this.pageSlider ? this.pageSlider.value : config.basePages, 10);

    const extraPages = Math.max(0, pages - config.basePages);
    let totalPrice = config.basePrice + (extraPages * config.extraPagePrice);
    let totalDays = config.baseDays + Math.ceil(extraPages * config.pageRate);

    const selectedFeatures = [];
    this.featureCheckboxes.forEach(cb => {
      if (cb.checked) {
        totalPrice += parseInt(cb.getAttribute('data-price') || '0', 10);
        totalDays += parseInt(cb.getAttribute('data-days') || '0', 10);
        selectedFeatures.push(cb.getAttribute('data-name'));
      }
    });

    // Animate price update with Indonesian Rupiah formatting
    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(totalPrice);

    if (this.priceDisplay) this.priceDisplay.textContent = formattedPrice;
    if (this.timelineDisplay) this.timelineDisplay.textContent = `± ${totalDays} - ${totalDays + 4} Hari Kerja`;

    // Dynamic WhatsApp inquiry message builder
    if (this.whatsappCta) {
      const tierName = selectedTier.toUpperCase();
      const featuresText = selectedFeatures.length ? selectedFeatures.join(', ') : 'Fitur Standar';
      const rawMsg = `Halo Rubicweb, saya tertarik mendiskusikan Paket ${tierName} (${pages} Halaman, Fitur: ${featuresText}). Estimasi kalkulator: ${formattedPrice} (${totalDays} hari kerja). Mohon info jadwal konsultasi.`;
      const encodedMsg = encodeURIComponent(rawMsg);
      this.whatsappCta.href = `https://wa.me/6281119777202?text=${encodedMsg}`;
    }
  }
}
```

---

### 3.6 Auto-Scrolling Testimonial Carousel with Pause-on-Hover
Engineered to deliver smooth continuous rotation of client case reviews without layout shifts.

#### State Machine & Touch Swipe Dynamics
- **States**: `AUTOPLAY`, `PAUSED`, `DRAGGING`, `TRANSITIONING`.
- **Interval**: 4800ms automatic slide transition.
- **Pause-on-hover**: `mouseenter` on carousel boundary suspends timer; `mouseleave` restarts interval.
- **Touch Gesture Math**:
  $$\Delta X = Touch_X(current) - Touch_X(start)$$
  If $|\Delta X| > 50\text{px}$: advance to Next if $\Delta X < 0$, or Prev if $\Delta X > 0$.
- **Accessibility**: Paused when focused via keyboard (`focusin` / `focusout`).

#### Implementation Blueprint (`js/interactions.js`)
```javascript
class TestimonialCarousel {
  constructor(carouselElement) {
    this.container = carouselElement;
    if (!this.container) return;

    this.track = this.container.querySelector('.carousel-track');
    this.slides = this.container.querySelectorAll('.carousel-slide');
    this.prevBtn = this.container.querySelector('.carousel-prev');
    this.nextBtn = this.container.querySelector('.carousel-next');
    this.dotsContainer = this.container.querySelector('.carousel-dots');

    if (!this.slides.length) return;

    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = 5000;
    this.timer = null;
    this.startX = 0;
    this.currentX = 0;

    this.initDots();
    this.initEvents();
    this.startAutoplay();
  }

  initDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${i === 0 ? 'is-active' : ''}`;
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsContainer.appendChild(dot);
    }
  }

  update() {
    const offset = -this.currentIndex * 100;
    this.track.style.transform = `translateX(${offset}%)`;

    const dots = this.dotsContainer?.querySelectorAll('.carousel-dot');
    dots?.forEach((d, i) => d.classList.toggle('is-active', i === this.currentIndex));
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
    this.update();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
    this.update();
  }

  goTo(index) {
    this.currentIndex = index;
    this.update();
  }

  startAutoplay() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.stopAutoplay();
    this.timer = setInterval(() => this.next(), this.autoPlayInterval);
  }

  stopAutoplay() {
    if (this.timer) clearInterval(this.timer);
  }

  initEvents() {
    this.container.addEventListener('mouseenter', () => this.stopAutoplay());
    this.container.addEventListener('mouseleave', () => this.startAutoplay());
    this.container.addEventListener('focusin', () => this.stopAutoplay());
    this.container.addEventListener('focusout', () => this.startAutoplay());

    if (this.nextBtn) this.nextBtn.addEventListener('click', () => { this.next(); this.startAutoplay(); });
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => { this.prev(); this.startAutoplay(); });

    // Touch Swipe handling
    this.track.addEventListener('touchstart', (e) => {
      this.stopAutoplay();
      this.startX = e.touches[0].clientX;
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      const diffX = e.changedTouches[0].clientX - this.startX;
      if (Math.abs(diffX) > 45) {
        if (diffX < 0) this.next();
        else this.prev();
      }
      this.startAutoplay();
    }, { passive: true });
  }
}
```

---

### 3.7 FAQ Accordion with Single Active Expansion & 45° Rotation
Enforces strict single-item expansion with hardware-accelerated CSS Grid height interpolation ($0\text{fr} \to 1\text{fr}$).

#### Implementation Blueprint (`js/interactions.js`)
```javascript
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all siblings (single expansion guarantee)
      faqItems.forEach(sibling => {
        if (sibling !== item) {
          sibling.classList.remove('is-open');
          sibling.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
```

#### Pure CSS Grid Height Technique (Zero Layout Jitter)
```css
.faq-item {
  border-bottom: 1px solid var(--border-subtle);
  background: transparent;
  transition: background-color 0.25s ease;
}

.faq-trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  background: none;
  border: none;
  color: var(--text-heading);
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.faq-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: var(--accent-primary);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.faq-item.is-open .faq-icon {
  transform: rotate(45deg);
}

/* CSS Grid 0fr to 1fr Transition */
.faq-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
  opacity: 0;
}

.faq-item.is-open .faq-panel {
  grid-template-rows: 1fr;
  opacity: 1;
}

.faq-content {
  overflow: hidden;
  padding-bottom: 24px;
  color: var(--text-secondary);
  line-height: 1.7;
}
```

---

### 3.8 Scroll-Reactive Dynamic Navigation Bar
Controls backdrop blur, scroll-shrink, hide-on-scroll-down / show-on-scroll-up with hysteresis delta, and full-screen mobile drawer toggle.

#### Mathematical Scroll Delta Threshold
Let current scroll be $Y_{now}$, previous scroll be $Y_{last}$.  
Delta $\Delta Y = Y_{now} - Y_{last}$.  
Hysteresis threshold $\delta = 10\text{px}$:
- If $Y_{now} > 50\text{px}$: apply `.is-scrolled` (blur & shrink).
- If $Y_{now} > 250\text{px}$ and $\Delta Y > +\delta$: hide navbar (`translateY(-100%)`).
- If $\Delta Y < -\delta$ or $Y_{now} < 50\text{px}$: reveal navbar (`translateY(0)`).

#### Implementation Blueprint (`js/main.js`)
```javascript
function initScrollReactiveNavbar() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-nav-backdrop');
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const deltaY = currentY - lastY;

      // Scrolled state (blur & shrink)
      if (currentY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      // Hide on scroll down, reveal on scroll up
      if (currentY > 220 && deltaY > 8) {
        header.classList.add('is-hidden');
      } else if (deltaY < -8 || currentY <= 220) {
        header.classList.remove('is-hidden');
      }

      lastY = currentY;
      ticking = false;
    });
  }, { passive: true });

  // Mobile Drawer Toggle & Focus Trap
  if (toggleBtn && drawer) {
    function toggleDrawer(open) {
      drawer.classList.toggle('is-open', open);
      if (backdrop) backdrop.classList.toggle('is-active', open);
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }

    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('is-open');
      toggleDrawer(!isOpen);
    });

    if (backdrop) backdrop.addEventListener('click', () => toggleDrawer(false));

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleDrawer(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        toggleDrawer(false);
      }
    });
  }
}
```

---

### 3.9 Inline Contact Form Validation & Continuous Floating Ripple Button
Real-time RFC-compliant field validation without page reloads, accompanied by a continuous radar-ripple floating WhatsApp trigger.

#### Validation Regular Expressions & Mechanics
- **Full Name**: `/^[a-zA-Z\s'.]{3,50}$/`
- **Email**: Strict RFC 5322 regex:  
  `/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/`
- **WhatsApp Phone**: Indonesian (+62 / 08) & International E.164 standard:  
  `/^(\+62|62|0)8[1-9][0-9]{7,11}$/`

#### Implementation Blueprint (`js/contact.js`)
```javascript
function initInlineFormValidation() {
  const form = document.querySelector('.consultation-form');
  if (!form) return;

  const validators = {
    nama: (val) => val.trim().length >= 3 ? null : 'Nama lengkap wajib diisi minimal 3 karakter.',
    email: (val) => {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      return emailRegex.test(val.trim()) ? null : 'Alamat email tidak valid (contoh: nama@perusahaan.com).';
    },
    telepon: (val) => {
      const phoneClean = val.replace(/[\s-]/g, '');
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
      return phoneRegex.test(phoneClean) ? null : 'Nomor WhatsApp tidak valid (contoh: 08123456789 atau +628123456789).';
    },
    pesan: (val) => val.trim().length >= 10 ? null : 'Mohon deskripsikan kebutuhan proyek minimal 10 karakter.'
  };

  function validateField(input) {
    const name = input.name;
    const validator = validators[name];
    if (!validator) return true;

    const errorMsg = validator(input.value);
    const errorEl = form.querySelector(`#error-${name}`);

    if (errorMsg) {
      input.classList.add('has-error');
      input.classList.remove('is-valid');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.style.display = 'block';
      }
      return false;
    } else {
      input.classList.remove('has-error');
      input.classList.add('is-valid');
      input.setAttribute('aria-invalid', 'false');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
      return true;
    }
  }

  // Real-time events on blur and input
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('has-error')) validateField(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isAllValid = true;

    form.querySelectorAll('input, textarea').forEach(input => {
      if (!validateField(input)) isAllValid = false;
    });

    if (isAllValid) {
      const nama = form.querySelector('[name="nama"]').value.trim();
      const paket = form.querySelector('[name="paket"]')?.value || 'Custom Web Dev';
      const pesan = form.querySelector('[name="pesan"]').value.trim();

      const text = `Halo Rubicweb, saya ${nama}. Ingin berkonsultasi mengenai ${paket}. Kebutuhan: ${pesan}`;
      window.open(`https://wa.me/6281119777202?text=${encodeURIComponent(text)}`, '_blank');
    }
  });
}
```

#### Floating WhatsApp Continuous Multi-Ring Ripple CSS
```css
.floating-whatsapp-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #25D366;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4);
  z-index: 999;
  text-decoration: none;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.floating-whatsapp-btn:hover {
  transform: scale(1.08);
}

.floating-whatsapp-btn::before,
.floating-whatsapp-btn::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(37, 211, 102, 0.7);
  animation: whatsappRipple 2.4s infinite cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.floating-whatsapp-btn::after {
  animation-delay: 1.2s;
}

@keyframes whatsappRipple {
  0% {
    transform: scale(0.9);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}
```

---

### 3.10 Case Study Modal Popups (`js/portfolio.js`)
Handles accessible modal previews for Karalia, Pinjamin, Wilmar, and SaaS Nexus with focus trapping, `Escape` key capture, and body scroll lock.

```javascript
class CaseStudyModal {
  constructor() {
    this.modal = document.getElementById('case-study-modal');
    if (!this.modal) return;

    this.closeBtn = this.modal.querySelector('.modal-close-btn');
    this.backdrop = this.modal.querySelector('.modal-backdrop');
    this.modalContent = this.modal.querySelector('.modal-dialog');

    this.initEvents();
  }

  open(data) {
    this.modal.querySelector('#modal-title').textContent = data.title;
    this.modal.querySelector('#modal-tag').textContent = data.tag;
    this.modal.querySelector('#modal-challenge').textContent = data.challenge;
    this.modal.querySelector('#modal-solution').textContent = data.solution;
    this.modal.querySelector('#modal-results').textContent = data.results;
    this.modal.querySelector('#modal-img').src = data.img;

    this.modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    this.closeBtn?.focus();
  }

  close() {
    this.modal.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  initEvents() {
    this.closeBtn?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('is-active')) {
        this.close();
      }
    });
  }
}
```

---

## 4. Testing & Verification Strategies

### 4.1 Automated Headless Browser Verification Suite
To satisfy the requirement of zero console errors, 200 HTTP status, and programmatic verification of interactive elements across 320px, 768px, and 1440px viewports without external libraries, we can execute automated tests via Node.js native `http` server and Microsoft Edge / Google Chrome headless commands.

#### Test Execution Script Architecture (`tests/verify_site.js`)
We formulate an end-to-end Node.js test script utilizing Chrome/Edge with `--remote-debugging-port` to inspect the DOM, check for any runtime console errors, test breakpoint renders, and programmatically simulate interactions:

```javascript
// Lightweight CDP Client using Node.js standard library (Zero Dependencies)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8080;
const PAGES = ['index.html', 'services.html', 'portfolio.html', 'contact.html'];
const VIEWPORTS = [
  { name: 'Mobile', width: 320, height: 740 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 }
];

// Simple static server for local testing
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, '..', req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      res.end(content);
    }
  });
});

server.listen(PORT, async () => {
  console.log(`[TEST RUNNER] Local server active on http://localhost:${PORT}`);
  // Tests can invoke chrome.exe --headless --dump-dom or WebSocket CDP
});
```

### 4.2 Programmatic Interaction Test Matrix

| Interaction Target | Verification Technique | Expected Outcome |
|---|---|---|
| **Custom Cursor** | Dispatch `pointermove` event on window | Dot and ring coordinate transforms update; hovering interactive elements adds `.cursor-hover` |
| **3D Card Tilt** | Dispatch `mousemove` on `.tilt-card` with coordinates | Computed style reflects `perspective(1000px) rotateX(...) rotateY(...)` and `--glow-opacity: 1` |
| **Stats Counters** | Scroll element into viewport or trigger IntersectionObserver | Inner text animates from 0 to 100%, 250+, 99.9% without NaN or glitch |
| **Portfolio Filters** | Click `[data-filter="ecommerce"]` tab | Matching cards retain display, non-matching cards receive `.is-hidden` and hide |
| **Pricing Calculator**| Change tier input to "Enterprise", slide pages to 15 | Total price dynamically updates in IDR; WhatsApp URL updates with query parameters |
| **Testimonial Carousel**| Dispatch `mouseenter` and wait 5.5s | Active slide index remains unchanged; `mouseleave` resumes slide increments |
| **FAQ Accordion** | Click `.faq-trigger` on item 1, then item 2 | Item 1 closes, item 2 opens; only 1 item open at any time |
| **Contact Form** | Submit empty form | Validation errors trigger; enter valid email and phone -> errors clear |
| **Console Errors** | Attach CDP `Console.enable` and `Log.enable` | Exactly 0 errors emitted across all page views and click events |

---

## 5. Caveats

1. **Root Directory Migration**: Existing subpages currently live in `pages/` (`pages/services.html`, `pages/portfolio.html`, `pages/contact.html`). When moving these to root as required by R1, all asset and CSS links (`../css/`, `../assets/`) must be updated to root paths (`css/`, `assets/`).
2. **Touch Screen Cursor Optimization**: Touch devices do not support hover or mousemove cursor trailing. The cursor logic must strictly bail out when `window.matchMedia('(pointer: coarse)').matches` is true to prevent phantom cursor elements or touch blocking on mobile.
3. **Scroll Wheel Hijacking Precaution**: Existing `scroll.js` intercepts native mouse wheel events (`window.addEventListener('wheel', handleWheel, { passive: false })`). This can degrade performance on trackpads and violates passive event listener best practices. Smooth scrolling should instead rely on native CSS `scroll-behavior: smooth;` combined with CSS scroll margins and RAF-based anchor target positioning.

---

## 6. Conclusion & Architectural Recommendation

1. **Adopt Strict Root 4-Page Layout**:
   - Relocate `pages/services.html`, `pages/portfolio.html`, and `pages/contact.html` directly into root workspace `c:\pkl\PKL\`.
   - Ensure clean relative asset links: `href="css/style.css"`, `src="js/main.js"`.
2. **Consolidate and Implement the 4 Vanilla JS Modules**:
   - `js/main.js`: Dynamic scroll navbar (shrink/blur/hide), mobile drawer with focus trap, smooth anchor scrolling.
   - `js/interactions.js`: Custom magnetic trailing cursor, 3D card tilt with specular glow, IntersectionObserver stats counters, auto-scrolling carousel, and FAQ accordion.
   - `js/portfolio.js`: Instant portfolio tab category filtering with CSS transitions and case study modal previews.
   - `js/contact.js`: Real-time inline input validation, dynamic pricing calculator with pre-filled WhatsApp link generator, and floating ripple button.
3. **Hardware Acceleration & 60fps Guarantee**:
   - Restrict micro-interactions to `transform` and `opacity` properties.
   - Wrap cursor, tilt, and scroll handlers in `requestAnimationFrame` ticking guards.
   - Utilize modern CSS Grid `0fr \to 1fr` transitions for the accordion, bypassing layout-thrashing JavaScript height measurements.
4. **Zero-Dependency Testing & Quality Verification**:
   - Validate with local Node.js server and headless Chrome/Edge to prove zero console errors, full 320px/768px/1440px responsiveness, and complete interaction compliance before final handoff.

---

## 7. Verification Method

To independently verify the technical findings and blueprints:

1. **Verify Workspace Hierarchy**:
   ```powershell
   Get-ChildItem -Path "c:\pkl\PKL" -Force | Select-Object Name
   ```
2. **Verify Headless Browser Runtimes**:
   ```powershell
   & "C:\Program Files\Google\Chrome\Application\chrome.exe" --version
   & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --version
   node -v
   ```
3. **Inspect Existing Code Locations & Contrast with R1-R4**:
   ```powershell
   Get-ChildItem -Path "c:\pkl\PKL\js" | Select-Object Name, Length
   Get-ChildItem -Path "c:\pkl\PKL\pages" | Select-Object Name, Length
   ```
4. **Invalidation Conditions**:
   - If external frontend libraries (e.g. React, Tailwind, jQuery) are introduced into any `.html` file.
   - If subpages remain buried under `pages/` without being linked at root.
   - If any console error or unhandled promise rejection occurs during standard user interactions.
