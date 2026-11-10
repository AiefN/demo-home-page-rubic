# Project: Rubicweb Redesign (High-Performance Engineering Agency)

## Architecture
Rubicweb redesign transitions the agency web presence into an elite, high-performance, architectural digital engineering agency site inspired by the aesthetics, UI/UX, and micro-interactions of Room & Pillar (reformco, Awwwards Honorable Mention), incorporating authentic brand elements, guarantees, copywriting, and programming offerings from PT. Rubic Kirana Solusindo.

### Principles
- **Zero-Dependency Vanilla Web Stack**: Pure semantic HTML5, modern CSS3 (Custom Properties, Grid, Flexbox, Keyframes), and Vanilla JavaScript (ES6+). Zero external frameworks or libraries.
- **Micro-Interaction Precision**: 60fps hardware-accelerated animations (`transform`, `opacity`), smooth LERP cursor follower, 3D perspective card tilt with dynamic specular border glow, IntersectionObserver viewport counters, smooth CSS grid accordion transitions, auto-scrolling testimonial carousel, and real-time inline form validation.
- **Architectural Luxury Aesthetics**: Obsidian dark surfaces (`#131419`, `#1f212a`), crisp white plaster typography (`#f2f2f6`), architectural slate borders (`#63646a`, alpha hairlines), and electric neon acid lime (`#d2fe71`) interactive accents.
- **Strict Separation of Concerns**: 4 root pages, 3 dedicated stylesheets, 4 modular Vanilla JS engines.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | File Structure & Root Migration | 4 root HTML files (`index.html`, `services.html`, `portfolio.html`, `contact.html`), clean asset paths | M1, M2 | survey (tech) |
| 2 | Master CSS Design Tokens & Reset | CSS variables (colors, fonts, spacing, shadows, transitions), architectural drafting grid, resets | M1 | survey (design) |
| 3 | Keyframes & Micro-Animation Library | Hardware-accelerated keyframes (`animations.css`), ripple, pulse, float, text-reveal, reduced-motion | M1 | survey (design) |
| 4 | Responsive Breakpoint System | Fluid responsive rules (`responsive.css`) across 320px (mobile), 768px (tablet), and 1440px+ (desktop) | M1 | survey (tech) |
| 5 | Dynamic Scroll Navbar & Mobile Drawer | Scroll shrink, backdrop blur, hide down / show up hysteresis, full-screen drawer menu with focus trap | M2 | survey (rubicweb/tech) |
| 6 | Semantic Global Footer | SCBD Jakarta address, PT. Rubic Kirana Solusindo legal entity, links, social proof, copyright | M2 | survey (rubicweb) |
| 7 | Custom Magnetic Trailing Cursor | Dual-element (dot + ring) with linear interpolation ($\lambda = 0.15$), RAF ticking, hover expansion | M3 | survey (design/tech) |
| 8 | Hero Section & Entrance Reveals | Editorial H1, guarantee pill badge, CTAs, entrance stagger text-reveal, mousemove parallax | M3 | survey (rubicweb/design) |
| 9 | 3D Service Cards & Specular Glare | 4 core services cards with normalized 3D tilt perspective and cursor-following radial border glow | M3 | survey (design/tech) |
| 10 | Technology Badges on Services | Visual pills for HTML5/CSS3/JS, PHP/Laravel, REST API, MySQL on service cards | M3 | survey (rubicweb) |
| 11 | Viewport Stats Counters | Smooth numeric counter (100% Garansi, 250+ Proyek, 99.9% Uptime, PageSpeed 95+) via IntersectionObserver | M3 | survey (rubicweb/tech) |
| 12 | Trust Pillars & Guarantees Grid | 4 trust cards: PageSpeed 95+, Structured SEO, Free Domain & NVMe Hosting, 30-Day Bug-Free Warranty | M3 | survey (rubicweb) |
| 13 | Interactive Pricing Calculator | Tier selection (Basic, Pro, Enterprise), extra pages slider, add-on toggles, real-time cost & timeline math | M3 | survey (rubicweb/tech) |
| 14 | Auto-Scrolling Testimonial Carousel | Client testimonials track with auto-scroll (5s), pause-on-hover, next/prev controls, touch swipe | M3 | survey (rubicweb/tech) |
| 15 | Single-Active FAQ Accordion | 6 essential agency FAQs with smooth CSS Grid 0fr->1fr height transition and 45deg icon rotation | M3 | survey (rubicweb/tech) |
| 16 | Dedicated Services & 6-Stage Timeline | `services.html` with deep service breakdowns, deliverables, and 6-stage development workflow timeline | M4 | survey (rubicweb) |
| 17 | Filterable Portfolio Showcase & Modals | `portfolio.html` with instant category tabs (Semua, E-Commerce, Profile, Web App) & case study modals | M4 | survey (rubicweb/tech) |
| 18 | Interactive Consultation Form & Validation | `contact.html` with real-time inline validation (regex email & WhatsApp phone), package selector | M4 | survey (rubicweb/tech) |
| 19 | Floating WhatsApp Ripple Button | Persistent circular WhatsApp button in bottom-right corner with continuous ripple pulse animation | M4 | survey (rubicweb/design) |
| 20 | E2E Testing Suite & Zero-Console-Error Pass | Automated headless browser verification across 320px/768px/1440px with HTTP 200, 0 console errors | M5 | survey (tech) |
| 21 | Adversarial Hardening (Tier 5) | White-box edge cases, rapid tab clicks, negative slider inputs, window resize, focus management | M5 | survey (tech) |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | CSS Design System & Assets Foundation | `css/style.css`, `css/animations.css`, `css/responsive.css`, design tokens, grid, keyframes, typography | none | DONE |
| M2 | Core Layout, Global Navbar & Footer | Skeletal `index.html`, dynamic navigation engine (`js/main.js`), mobile drawer, semantic footer | M1 | DONE |
| M3 | Homepage Components & Vanilla JS Interactions | Full `index.html` content, hero, 3D tilt cards, stats observer, pricing calculator, carousel, accordion (`js/interactions.js`) | M2 | IN_PROGRESS (worker_m3_interactions: 5f7a8cf1-16da-498e-88c3-774e9b879fc9) |
| M4 | Dedicated Subpages & Specialized Engines | `services.html` (timeline & deliverables), `portfolio.html` & `js/portfolio.js` (filter & modals), `contact.html` & `js/contact.js` (form validation & WhatsApp) | M3 | IN_PROGRESS (worker_m4_subpages: f1615531-7566-4a67-b3cd-1d0caf5da49f) |
| M5 | Final E2E Integration, Test Pass & Adversarial Hardening | Phase 1: 100% Pass of Tiers 1-4 E2E Test Suite. Phase 2: Adversarial coverage hardening (Tier 5) | M4, TEST_READY | PLANNED |

---

## Interface Contracts

### 1. `js/main.js` ↔ DOM & CSS
- **Navbar Scroll State**: Adds `.navbar--scrolled` when `window.scrollY > 40`.
- **Navbar Hysteresis**: Adds `.navbar--hidden` when scrolling down past 120px; removes when scrolling up by > 10px.
- **Mobile Menu**: Toggle button `.navbar__toggle` triggers `.mobile-menu.is-open` and toggles `aria-expanded` and body overflow lock `.no-scroll`.

### 2. `js/interactions.js` ↔ DOM & Components
- **Custom Cursor**:
  - Coordinates: inner dot `.cursor-dot` at `(e.clientX, e.clientY)`. Follower ring `.cursor-follower` interpolated via `lerp(curr, target, 0.15)` on RAF.
  - Interactive targets (`a`, `button`, `.card-tilt`, `input`, `select`, `textarea`) add `.cursor-hover` class to expand follower ring.
  - Disabled automatically on `@media (hover: none) and (pointer: coarse)`.
- **3D Card Tilt**:
  - Class: `.card-tilt`.
  - Calculates normalized $x, y \in [-0.5, 0.5]$ relative to card width and height.
  - Applies `transform: perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`.
  - Sets CSS variables `--mouse-x: ${px}%` and `--mouse-y: ${py}%` for the radial specular glare highlight.
- **Stats Counter**:
  - Elements: `[data-counter-target]`.
  - Trigger: `IntersectionObserver` at `threshold: 0.2`.
  - Animation: Smooth numerical interpolation over 2000ms using easeOutExpo. Format with suffix (e.g., `+`, `%`).
- **Testimonial Carousel**:
  - Container: `.testimonial-carousel`.
  - Track: `.testimonial-track`.
  - Auto-scroll interval: 5000ms. Pauses on `mouseenter` or `focusin`. Resumes on `mouseleave` or `focusout`. Next/prev buttons advance slides.
- **FAQ Accordion**:
  - Items: `.faq-item`.
  - Behavior: Single-item active expansion. Clicking an inactive header expands its answer via `grid-template-rows: 1fr` and rotates icon 45deg; automatically collapses any open peer to `0fr`.

### 3. `js/portfolio.js` ↔ Gallery & Modals
- **Category Filter**:
  - Buttons: `[data-filter]`. Items: `[data-category]`.
  - Behavior: Clicking `data-filter="all"` shows all items. Clicking a specific category hides non-matching items with staggered fade/scale CSS transitions (`opacity: 0; transform: scale(0.95); display: none`).
- **Case Study Modal**:
  - Triggers: `.btn-case-study[data-project-id]`.
  - Modal: `#case-study-modal`. Populates title, client, challenge, architectural solution, and metrics.
  - Dismiss: Close button, backdrop click, or `Escape` keypress. Traps focus and restores body scroll.

### 4. `js/contact.js` ↔ Forms & Pricing Calculator
- **Pricing Calculator Engine**:
  - Inputs: Radio buttons `input[name="tier"]`, Range slider `#extra-pages`, Checkboxes `input[name="addon"]`.
  - Calculation:
    - Base: Basic (Rp 2.500.000 / 5d), Pro (Rp 5.500.000 / 14d), Enterprise (Rp 12.000.000 / 30d).
    - Pages: `(pages - base_pages) * 350.000` IDR, `(pages - base_pages) * 0.5` days.
    - Add-ons: E-Commerce (+Rp 2M / +5d), Payment Gateway (+Rp 1.5M / +3d), Multilingual (+Rp 1.2M / +3d).
    - Priority Express: `cost * 1.25`, `days * 0.6` (min 5 days).
  - Outputs: `#calc-total-price` (formatted in IDR), `#calc-total-timeline` (formatted in days), pre-filled WhatsApp consultation link.
- **Inline Validation Engine**:
  - Inputs: `#name`, `#email`, `#phone`, `#package`, `#message`.
  - Events: `input` and `blur`.
  - Regex: Email `^[^\s@]+@[^\s@]+\.[^\s@]+$`, Phone `^(\+62|62|0)8[1-9][0-9]{6,10}$`.
  - Feedback: Visual green border + check on valid; red border + descriptive error message in Indonesian on invalid.
- **Floating WhatsApp Button**:
  - Persistent fixed element `.btn-floating-whatsapp` with continuous ripple animation `.whatsapp-ripple`.

---

## Code Layout
```
c:\pkl\PKL\
├── index.html              # Main interactive homepage (Hero, Services, Stats, Portfolio preview, Calculator, Testimonials, FAQ, Footer)
├── services.html           # Comprehensive web services, deliverables, 6-stage workflow timeline
├── portfolio.html          # Filterable project gallery with category tabs and case study modals
├── contact.html            # Consultation form with real-time validation and WhatsApp integration
├── css/
│   ├── style.css           # Design tokens, resets, typography, layout grid, component styles
│   ├── animations.css      # Keyframes, transitions, micro-interactions, hardware acceleration
│   └── responsive.css      # Responsive media queries for 320px, 768px, and 1440px+
├── js/
│   ├── main.js             # Core layout, navbar scroll-shrink/blur/hysteresis, mobile drawer
│   ├── interactions.js     # Custom cursor, 3D tilt, parallax, stats counter, carousel, accordion
│   ├── portfolio.js        # Category tab filtering, hover states, case study modal previews
│   └── contact.js          # Real-time inline validation, dynamic pricing calculator, WhatsApp CTA
├── assets/                 # Brand logos, client logos, portfolio screenshots, SVG icons
├── tests/                  # E2E test harness and test suites
└── .agents/teamwork/       # Orchestrator & subagent state directories
```
