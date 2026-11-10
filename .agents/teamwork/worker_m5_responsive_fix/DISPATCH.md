# Dispatch: Worker M5 Responsive Fix

## Objective
Implement the responsive fix for `contact.html`, `css/style.css`, `css/responsive.css`, expand `feat-03-responsive-layout.test.js` to cover all 4 pages across viewports, and clean lingering Tier 3 bypass guards per Reviewer 2's handoff report (`c:\pkl\PKL\.agents\teamwork\reviewer_m5_iter1_2\handoff.md`).

## Scope & Inputs
- Original Request: `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`
- Gate Status: `c:\pkl\PKL\.agents\teamwork\orchestrator_gen2\GATE_STATUS.md`
- Reviewer 2 Report: `c:\pkl\PKL\.agents\teamwork\reviewer_m5_iter1_2\handoff.md`
- Files to modify:
  - `c:\pkl\PKL\contact.html`
  - `c:\pkl\PKL\css\style.css`
  - `c:\pkl\PKL\css\responsive.css`
  - `c:\pkl\PKL\tests\tier1-features\feat-03-responsive-layout.test.js`
  - `c:\pkl\PKL\tests\tier3-combinations\comb-05-cursor-tilt.test.js`
  - `c:\pkl\PKL\tests\tier3-combinations\comb-10-service-modal-focus.test.js`
  - `c:\pkl\PKL\tests\tier3-combinations\comb-12-floating-whatsapp-footer.test.js`
  - `c:\pkl\PKL\tests\tier3-combinations\comb-16-carousel-keyboard-controls.test.js`

## Detailed Implementation Tasks
1. In `contact.html:181`:
   Remove inline style from `.consultation-layout-grid`:
   Change: `<div class="consultation-layout-grid" style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: start;">`
   To: `<div class="consultation-layout-grid">`
2. In `contact.html:185`:
   Change: `<div class="form-container" style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 40px;">`
   To: `<div class="form-container consultation-form-box">`
3. In `css/style.css`:
   Add styling for `.consultation-layout-grid` and `.consultation-form-box`:
   ```css
   .consultation-layout-grid {
     display: grid;
     grid-template-columns: 1.1fr 0.9fr;
     gap: 40px;
     align-items: start;
   }
   .consultation-form-box {
     background: var(--bg-secondary);
     border: 1px solid var(--border-subtle);
     border-radius: var(--radius-lg);
     padding: 40px;
   }
   ```
4. In `css/responsive.css`:
   - Under `@media (max-width: 1023px)`:
     ```css
     .consultation-layout-grid {
       grid-template-columns: 1fr !important;
       gap: 32px !important;
     }
     ```
   - Under `@media (max-width: 767px)`:
     ```css
     .consultation-layout-grid {
       grid-template-columns: 1fr !important;
       gap: 24px !important;
     }
     .consultation-form-box {
       padding: 24px 18px !important;
     }
     ```
5. In `tests/tier1-features/feat-03-responsive-layout.test.js`:
   Expand tests 3.1, 3.2, and 3.3 to check all 4 pages (`index.html`, `services.html`, `portfolio.html`, `contact.html`) to ensure zero horizontal scroll overflow (`scrollWidth <= clientWidth`) across 320px, 768px, and 1440px.
6. In `tests/tier3-combinations/` (`comb-05`, `comb-10`, `comb-12`, `comb-16`):
   Replace `if (!el) return true;` with authentic assertions and clean returns.
7. Run empirical verification:
   - Check `contact.html` at 320px and 768px viewports: verify `calc.getBoundingClientRect().right <= window.innerWidth`.
   - Run `node tests/run-e2e.js`: verify 204/204 passing tests with 0 failures and 0 console errors.
   - Run `node tests/adversarial-m5-verification.js`: verify 6/6 systems pass.
8. Deliver `handoff.md` in `c:\pkl\PKL\.agents\teamwork\worker_m5_responsive_fix\`.

## MANDATORY INTEGRITY WARNING


## 2026-11-10T08:33:48Z
You are the Worker for Milestone 5 Responsive Fix.
Read your dispatch instructions at: c:\pkl\PKL\.agents\teamwork\worker_m5_responsive_fix\DISPATCH.md
Read the original request at: c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md
Read Reviewer 2's handoff report at: c:\pkl\PKL\.agents\teamwork\reviewer_m5_iter1_2\handoff.md
Your state folder is: c:\pkl\PKL\.agents\teamwork\worker_m5_responsive_fix\

Implement the responsive layout fixes:
1. In `contact.html:181`, remove the inline style from `<div class="consultation-layout-grid">`.
2. In `contact.html:185`, change `<div class="form-container" style="...">` to `<div class="form-container consultation-form-box">`.
3. In `css/style.css`, add the desktop CSS rules for `.consultation-layout-grid` and `.consultation-form-box`.
4. In `css/responsive.css`, add the media query overrides for `.consultation-layout-grid` and `.consultation-form-box` at `@media (max-width: 1023px)` and `@media (max-width: 767px)` so columns collapse to 1fr and padding adapts.
5. In `tests/tier1-features/feat-03-responsive-layout.test.js`, expand tests 3.1, 3.2, 3.3 to check all 4 pages (`index.html`, `services.html`, `portfolio.html`, `contact.html`) to verify zero horizontal scroll overflow across 320px, 768px, and 1440px.
6. In `tests/tier3-combinations/` (`comb-05`, `comb-10`, `comb-12`, `comb-16`), clean the lingering defensive bypass guards with authentic assertions.
7. Run verification commands:
   - Check `contact.html` at 320px and 768px in headless Chrome to ensure `.consultation-calculator-wrapper` does not overflow or clip off-screen.
   - Run `node tests/run-e2e.js` and verify all 204 tests pass with 0 failures and 0 console errors.
   - Run `node tests/adversarial-m5-verification.js` and verify 6/6 systems pass.
8. Write your handoff report to `c:\pkl\PKL\.agents\teamwork\worker_m5_responsive_fix\handoff.md`.

