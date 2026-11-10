# Task Assignment: Milestone 2 — Core Layout, Global Navbar & Footer

## Context
Redesign Rubicweb into an interactive, high-performance web development agency site inspired by Room & Pillar. Implement the semantic HTML5 architecture, global header/nav with dynamic scroll reactivity, full-screen mobile drawer, and modern SCBD Jakarta agency footer.

## Mandatory Reading
- `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\pkl\PKL\PROJECT.md`
- `c:\pkl\PKL\.agents\teamwork\spec_miner_design\handoff.md`
- `c:\pkl\PKL\.agents\teamwork\spec_miner_rubicweb\handoff.md`
- `c:\pkl\PKL\.agents\teamwork\explorer_tech\handoff.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exclusively Owned Files
- `index.html` (layout skeleton, navigation, mobile drawer, sections scaffolding, and semantic footer)
- `js/main.js` (navigation engine, scroll hysteresis, mobile drawer toggle, focus trapping)

## Instructions
1. Read all mandatory reading files.
2. In `index.html`:
   - Valid HTML5 semantic structure, UTF-8, mobile viewport `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
   - Preconnect and stylesheet links for fonts (`Plus Jakarta Sans`, `Space Grotesk`, `JetBrains Mono`).
   - Links to `css/style.css`, `css/animations.css`, and `css/responsive.css`.
   - Custom cursor markup (`<div class="cursor-dot"></div><div class="cursor-follower"></div>`).
   - Global `<header class="site-header">` / `<nav class="navbar" id="navbar">`:
     - Rubicweb logo with architectural geometric rubic icon.
     - Desktop navigation links: `Beranda` (`index.html`), `Layanan & Workflow` (`services.html`), `Portofolio` (`portfolio.html`), `Estimator Biaya` (`#pricing-calculator`), `Kontak & Konsultasi` (`contact.html`).
     - Header CTA button: `Konsultasi WhatsApp` linking to official WhatsApp (`https://wa.me/6285280008984`).
     - Hamburger toggle button (`.navbar__toggle`, `aria-label="Toggle navigation menu"`, `aria-expanded="false"`).
   - Mobile navigation drawer (`.mobile-menu` / `.drawer`):
     - Drawer overlay and panel with smooth sliding transition.
     - Mobile navigation links matching desktop.
     - SCBD Jakarta office address and direct WhatsApp contact.
   - Semantic `<main id="main-content">` with semantic section landmarks (`#hero`, `#services`, `#stats`, `#portfolio`, `#pricing-calculator`, `#testimonials`, `#faq`).
   - Semantic `<footer class="site-footer">`:
     - Agency legal profile: PT. Rubic Kirana Solusindo, District 8 Treasury Tower Lt. 7, SCBD Jakarta Selatan.
     - Agency positioning: High-performance web development, custom applications, and clean-code engineering.
     - Quick links, service links, guarantees badge ("Garansi 100% Kepuasan / Uang Kembali"), and copyright notice.
   - Script tags linking `js/main.js`, `js/interactions.js`, `js/portfolio.js`, and `js/contact.js` with `defer`.
3. In `js/main.js`:
   - Initialize navigation controller inside `DOMContentLoaded`.
   - Implement scroll hysteresis via `requestAnimationFrame`:
     - When `window.scrollY > 40`, add `.navbar--scrolled` (triggers backdrop blur and shrink).
     - When scrolling down past 120px and delta > 10px, add `.navbar--hidden`.
     - When scrolling up and delta < -5px, remove `.navbar--hidden`.
   - Mobile menu toggle:
     - Click on `.navbar__toggle` toggles `.is-open` on mobile drawer, toggles `.navbar__toggle--active`, updates `aria-expanded`, and toggles `overflow: hidden` on `document.body`.
     - Clicking mobile link closes the drawer.
     - Focus trapping inside open mobile drawer and `Escape` key closes drawer.
   - Ensure zero console errors across all viewports.
4. Verify with test runner: run `node tests/run-e2e.js` or node verification scripts to confirm navigation tests pass.
5. Write your handoff report to `c:\pkl\PKL\.agents\teamwork\worker_m2_layout\handoff.md`.
6. Send a completion message to the orchestrator.


## 2026-11-10T06:44:36Z
You are assigned as Worker for Milestone 2: Core Layout, Global Navbar & Footer.
Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`, `c:\pkl\PKL\PROJECT.md`, `c:\pkl\PKL\.agents\teamwork\spec_miner_design\handoff.md`, `c:\pkl\PKL\.agents\teamwork\spec_miner_rubicweb\handoff.md`, `c:\pkl\PKL\.agents\teamwork\explorer_tech\handoff.md`, and `c:\pkl\PKL\.agents\teamwork\worker_m2_layout\DISPATCH.md`.
Your working directory is `c:\pkl\PKL` and your state folder is `c:\pkl\PKL\.agents\teamwork\worker_m2_layout\`.
Exclusively owned files: `index.html` and `js/main.js`.


## 2026-11-10T06:57:29Z
[Message] timestamp=2026-11-10T06:57:29Z sender=73fc147f-0148-4c0f-a31c-3c36c6daddd8 priority=MESSAGE_PRIORITY_HIGH content=**Context**: Milestone 2 Core Layout & Navigation
**Content**: Checking in on your progress for `index.html` and `js/main.js`.
**Action**: Please provide an update on current implementation and estimated completion.
