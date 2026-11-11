## 2026-11-10T12:11:09Z

You are Worker (teamwork_worker) assigned to implement Milestone 6: UI/UX Visual Layout & Placement Defect Resolution for Rubicweb.

MANDATORY INPUTS:
- ORIGINAL REQUEST: c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md
- PROJECT SCOPE: c:\pkl\PKL\PROJECT.md
- Explorer 1 Report: c:\pkl\PKL\.agents\teamwork\explorer_m6_1\handoff.md
- Explorer 2 Report: c:\pkl\PKL\.agents\teamwork\explorer_m6_2\handoff.md
- Explorer 3 Report: c:\pkl\PKL\.agents\teamwork\explorer_m6_3\handoff.md
- Working directory: c:\pkl\PKL
- Your state folder: c:\pkl\PKL\.agents\teamwork\worker_m6_visual_fix\

WRITE OWNERSHIP:
You exclusively own and may edit:
- `index.html`
- `services.html`
- `portfolio.html`
- `css/style.css`
- `css/responsive.css`
- `js/main.js`
- `js/portfolio.js`
- `js/interactions.js`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK ASSIGNMENT:
Implement the complete, verified fixes for all 5 defects:

1. Desktop Container & Hero Balance ("kanan kirinya kosong"):
   - In `index.html` (Hero section, lines 139-183): Transform `.hero-container` into a 2-column asymmetric grid (`1.15fr 0.85fr`).
     * Left column (`.hero-content-col`): Guarantee badge, editorial H1, subheadline (`p.hero-subheadline`), dual CTAs (`.hero-actions`), and horizontal telemetry bar (`.hero-telemetry-bar`).
     * Right column (`.hero-showcase-col`): Interactive Architectural Showcase Card (`.hero-showcase-card.card-tilt.interactive-card`) with macOS window controls, file tab (`rubicweb.engine.config.ts`), live status badge, syntax-highlighted code block, and 3 metric tiles (99/100 PageSpeed, 60fps Animations, 100% Ownership).
   - In `css/style.css` & `css/responsive.css`:
     * Ensure `.container` has `max-width: 1280px; margin-left: auto; margin-right: auto; padding-left: 32px; padding-right: 32px; box-sizing: border-box;`.
     * Set `.hero, .hero-section { min-height: 100vh; min-height: 100dvh; display: flex; align-items: center; justify-content: center; }`.
     * Add 2-column grid rules for `.hero-container` at `>=1024px` and stacked flex on mobile.
     * Add styles for `.hero-subheadline`, `.hero-telemetry-bar`, and `.hero-showcase-card` matching Explorer 1's specifications.

2. Stray Modal Overlay Statically Visible:
   - In `index.html` (line 499): Set `#case-study-modal` class to `class="modal-overlay modal-backdrop"` with inline `style="display: none;"` and `.modal-close-btn` on the close button.
   - In `services.html` (line 542): Ensure `#service-modal` has inline `style="display: none;"` and `.modal-close-btn`.
   - In `portfolio.html`: Verify modal is properly hidden by default.
   - In `css/style.css` (Section 14): Update modal rules so that `.modal-overlay, .modal-backdrop, .modal, #case-study-modal, #service-modal` have `display: none !important; opacity: 0; visibility: hidden; pointer-events: none;` by default.
   - When active (`.is-active, .active, .is-open, [aria-hidden="false"]`), set `display: flex !important; opacity: 1; visibility: visible; pointer-events: auto;`.
   - In `js/portfolio.js` and `js/interactions.js`: Add boot-time initialization ensuring all modals have `display = 'none'` and `aria-hidden = "true"`. Ensure click-to-open and close handlers function smoothly.

3. Floating Dock Clearance:
   - Hero `100vh` ensures Section 2 headings are pushed below the visible viewport at `scrollY = 0`.
   - In `css/style.css`: Enhance `.floating-bottom-nav` with `background-color: rgba(17, 18, 22, 0.94); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); transition: transform 0.3s ease, opacity 0.3s ease;`.
   - In `js/main.js`: Add scroll hysteresis for `.floating-bottom-nav` (hide on rapid scroll-down past hero, show on scroll-up, ensure zero heading occlusion).

4. Pricing Calculator Card Compression:
   - In `index.html` (lines 546 & 551): Update classes to `<div class="pricing-calculator-widget calc-layout pricing-calculator-grid">` and `<div class="tier-cards-group tier-selector tier-options">`.
   - In `css/style.css` (Section 11): Style `.tier-selector, .tier-options, .tier-cards-group` as a 3-column CSS Grid (`grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; width: 100%;`).
   - Style `.tier-card` as `display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 0; width: 100%;`.
   - Style `.tier-badge`, `.tier-name`, `.tier-scope`, `.tier-price` with clean typography matching Room & Pillar.
   - In `css/responsive.css`: On mobile (`<=767px`), collapse `.tier-selector` to `grid-template-columns: 1fr; gap: 12px;`.

5. FAQ Accordion Text Background Bug:
   - In `css/style.css` (Section 13):
     * Reset `.faq-header`: `width: 100%; margin: 0; padding: 0; background: transparent; border: none;`.
     * Style `.faq-trigger, button.faq-header, .accordion-header`: `width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 24px 28px; background: transparent; background-color: transparent; border: none; outline: none; cursor: pointer; color: var(--text-primary); font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700;`.
     * Style hover/focus-visible states and ensure `.faq-question` has `background: transparent; color: inherit;`.

VERIFICATION REQUIREMENTS:
- Run `node tests/run-e2e.js` and verify that ALL 204 tests pass with 0 failures.
- Run a CDP headless browser script to verify:
  * No visual collision between floating dock and section headings at `scrollY = 0`.
  * `#case-study-modal` has computed `display: none` and `visibility: hidden` on initial load.
  * Pricing tier cards are wide (>250px on desktop) and not collapsed.
  * FAQ button background is transparent, text color is light (`#f2f2f6`), not white box on black text.
- Maintain `progress.md` in your state folder with timestamps.
- Write your complete handoff report to `c:\pkl\PKL\.agents\teamwork\worker_m6_visual_fix\handoff.md`.
- When finished, send a message back to the orchestrator.
