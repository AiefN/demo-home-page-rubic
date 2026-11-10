# Task Assignment: Milestone 4 — Dedicated Subpages & Specialized Engines

## Context
Implement the 3 dedicated subpages at project root (`services.html`, `portfolio.html`, `contact.html`) along with specialized Vanilla JS engines (`js/portfolio.js` and `js/contact.js`) conforming strictly to R1, R3, and Room & Pillar design language.

## Mandatory Reading
- `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\pkl\PKL\PROJECT.md`
- `c:\pkl\PKL\.agents\teamwork\spec_miner_rubicweb\handoff.md`
- `c:\pkl\PKL\.agents\teamwork\spec_miner_design\handoff.md`
- `c:\pkl\PKL\.agents\teamwork\explorer_tech\handoff.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exclusively Owned Files
- `services.html` (at root `c:\pkl\PKL\services.html`)
- `portfolio.html` (at root `c:\pkl\PKL\portfolio.html`)
- `contact.html` (at root `c:\pkl\PKL\contact.html`)
- `js/portfolio.js`
- `js/contact.js`

## Instructions
1. **`services.html`**:
   - Shared global `<header>`/`<nav>` and SCBD Jakarta `<footer>` matching `index.html`.
   - Comprehensive technical service breakdowns with deliverables and tech stack pills for all 4 services.
   - **6-Stage Development Workflow Timeline**:
     1. *Discovery & Requirements Analysis* (2-4 days)
     2. *UI/UX Wireframing & Design System* (5-10 days)
     3. *Custom Clean Coding & API Engineering* (10-25 days)
     4. *QA Testing, Security Audit & Performance Tuning* (3-7 days)
     5. *Deployment, Cloud Infrastructure & DNS Setup* (1-2 days)
     6. *Maintenance, SLA & 30-Day Bug-Free Warranty* (Ongoing)
     Visual progression steps with status badges and delivery metrics.
   - Click-to-expand service modals with deep technical architecture and deliverable checklists.
2. **`portfolio.html` & `js/portfolio.js`**:
   - Shared header and footer.
   - Full filterable gallery with category tabs (`Semua`, `E-Commerce`, `Company Profile`, `Web App`).
   - `js/portfolio.js`: Instant category filtering without page reload, using smooth CSS staggered scale/opacity transitions.
   - Rich project cards with hover zoom, translucent tech stack overlay, and action buttons ("Live Preview", "Lihat Studi Kasus").
   - Detailed Case Study Modal pop-ups: Client background, technical challenge, architectural solution, and measurable business results (e.g. PageSpeed 42->98, +3.2x conversion). Focus trapping and keyboard/backdrop dismissal.
3. **`contact.html` & `js/contact.js`**:
   - Shared header and footer.
   - Interactive consultation form with real-time inline validation (`input` and `blur` events):
     - Name (min 3 chars)
     - Email (RFC 5322 regex)
     - WhatsApp Phone Number (Indonesian format `08...` or `+628...`, converting to international WhatsApp format)
     - Package selection dropdown (`Paket Basic`, `Paket Pro`, `Paket Enterprise`, `Custom Architecture`)
     - Requirements brief textarea
     - Visual feedback: immediate green outline + checkmark on valid; red outline + descriptive Indonesian error message on invalid.
   - Dynamic Pricing Estimator integrated on contact page: real-time recalculation of investment total and timeline, generating pre-filled WhatsApp consultation message.
   - Floating WhatsApp button with continuous ripple animation (`.btn-floating-whatsapp` with `assets/icons/whatsapp.svg` and link to `https://wa.me/6285280008984`).
4. Ensure all pages link to `css/style.css`, `css/animations.css`, `css/responsive.css`, `js/main.js`, and `js/interactions.js`.
5. Verify zero console errors, HTTP 200 on all 4 pages, and run `node tests/run-e2e.js`.
6. Write handoff report to `c:\pkl\PKL\.agents\teamwork\worker_m4_subpages\handoff.md`.
7. Send completion message to orchestrator.


## 2026-11-10T07:08:41Z
You are assigned as Worker for Milestone 4: Dedicated Subpages & Specialized Engines.
Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`, `c:\pkl\PKL\PROJECT.md`, `c:\pkl\PKL\.agents\teamwork\spec_miner_rubicweb\handoff.md`, `c:\pkl\PKL\.agents\teamwork\spec_miner_design\handoff.md`, `c:\pkl\PKL\.agents\teamwork\explorer_tech\handoff.md`, and `c:\pkl\PKL\.agents\teamwork\worker_m4_subpages\DISPATCH.md`.
Your working directory is `c:\pkl\PKL` and your state folder is `c:\pkl\PKL\.agents\teamwork\worker_m4_subpages\`.
Exclusively owned files: `services.html`, `portfolio.html`, `contact.html`, `js/portfolio.js`, and `js/contact.js`.
