## 2026-11-11T07:00:38Z
You are challenger_m7_2 (Stress & Invariant Challenger) for Milestone 7 of the Rubicweb project.
Working directory: c:\pkl\PKL
State folder: c:\pkl\PKL\.agents\teamwork\challenger_m7_2\
Original request path: c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md
Scope document: c:\pkl\PKL\.agents\teamwork\orchestrator_gen5\SCOPE.md
Project document: c:\pkl\PKL\PROJECT.md
Worker handoff path: c:\pkl\PKL\.agents\teamwork\worker_m7_clean\handoff.md
Explorer m7_2 handoff path: c:\pkl\PKL\.agents\teamwork\explorer_m7_2\handoff.md

MANDATORY FIRST STEP: Read c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md before doing anything else.

MISSION:
Stress-test hard DOM invariants, modal lifecycles, pricing calculator dynamic recalculations, contact form validation, and empirically measure text brevity improvements.

TASKS:
1. Run and verify existing challenger stress suites:
   - `node tests/challenger-m6-2-pricing-faq-stress.js`
   - `node tests/challenger-m5-subpages-tilt-stress.js`
2. Invariant Cardinality Check:
   - Verify exactly 3 `.tier-card`s on `index.html`.
   - Verify exactly 6 `.faq-item`s on `index.html`.
   - Verify exactly 10 `.card-tilt` elements on `services.html` (4 services + 6 workflow steps).
   - Verify exactly 7 `.card-tilt` / `.portfolio-card` cards on `portfolio.html` (all=7, ecommerce=2, corporate=3, webapp=2).
   - Verify service card text lengths are strictly > 30 characters.
3. Pricing & Modal Stress:
   - Test pricing calculator with 20+ rapid input combinations (tier changes, slider moves, add-on toggles) — verify zero NaN, zero formatted price glitch.
   - Test modal lifecycles: trigger case study modal, verify backdrop and close button, verify Escape key dismissal, verify body scroll restoration.
4. Contact Form Validation Stress:
   - Test submitting empty and invalid inputs on `contact.html`. Verify that required error strings appear (`minimal 3 karakter`, `tidak valid`, `08`, `minimal 10 karakter`).
5. Text Brevity Measurement:
   - Programmatically compare word and character counts before and after Milestone 7 to quantify the reduction percentage across the 4 pages.
6. Provide a clear verdict (**APPROVE** or **REQUEST_CHANGES**).

OUTPUT REQUIREMENTS:
- Update progress in `c:\pkl\PKL\.agents\teamwork\challenger_m7_2\progress.md`.
- Write your comprehensive challenge report to `c:\pkl\PKL\.agents\teamwork\challenger_m7_2\handoff.md`.
- Notify the orchestrator via `send_message` with your verdict.
