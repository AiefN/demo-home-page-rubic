# Task Assignment: Milestone 1 Remediation (Iteration 2)

## Context
Apply specific fixes requested by `reviewer_m1` in Milestone 1 review.

## Mandatory Reading
- `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\pkl\PKL\PROJECT.md`
- `c:\pkl\PKL\.agents\teamwork\reviewer_m1\handoff.md`
- `c:\pkl\PKL\.agents\teamwork\orchestrator\GATE_STATUS.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exclusively Owned Files
- `css/style.css`
- `css/responsive.css`

## Specific Remediation Instructions (from reviewer_m1)
1. **Fix 1: FAQ Accordion Height Leak in Closed State**:
   - In `css/style.css` and `css/responsive.css`:
   - Set `.faq-inner { min-height: 0; padding-bottom: 0; }` on closed state.
   - When open (`.faq-item.is-active .faq-inner` or `.faq-item.active .faq-inner`), apply `padding-bottom: 24px;` (and `18px` on mobile).
   - Ensure the closed item has exactly 0px height below the question header.
2. **Fix 2: Testimonial Carousel Mobile Sizing**:
   - In `css/responsive.css` under `@media (max-width: 767px)`:
   - Set `.testimonial-card, .testimonial-slide { flex: 0 0 100% !important; max-width: 100% !important; width: 100% !important; }`.
   - Ensure cards display a single full-width card on mobile viewports (320px to 767px).
3. **Fix 3: Testimonial Track Width Constraint**:
   - In `css/responsive.css`:
   - Add `.testimonial-track { max-width: none !important; }` so universal `* { max-width: 100%; }` does not crush the multi-card horizontal slider track.
4. Run syntax verification with Node.js to ensure 100% valid CSS.
5. Write handoff report to `c:\pkl\PKL\.agents\teamwork\worker_m1_iter2\handoff.md`.
6. Send completion message to orchestrator.


## 2026-11-10T06:28:27Z
You are assigned as Worker for Milestone 1 Remediation (Iteration 2).
Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`, `c:\pkl\PKL\PROJECT.md`, `c:\pkl\PKL\.agents\teamwork\reviewer_m1\handoff.md`, and `c:\pkl\PKL\.agents\teamwork\worker_m1_iter2\DISPATCH.md`.
Your working directory is `c:\pkl\PKL` and your state folder is `c:\pkl\PKL\.agents\teamwork\worker_m1_iter2\`.
Exclusively owned files: `css/style.css` and `css/responsive.css`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Apply the 3 exact fixes requested by the reviewer:
1. Fix FAQ accordion height leak in closed state (set .faq-inner min-height: 0; padding-bottom: 0; animate padding-bottom only when active).
2. Fix testimonial carousel mobile sizing (set flex: 0 0 100% on viewports < 768px).
3. Set .testimonial-track max-width: none !important; to avoid slider track crushing.
Verify CSS syntax with Node.js and write handoff report to `c:\pkl\PKL\.agents\teamwork\worker_m1_iter2\handoff.md`.
Send a completion message back to the orchestrator when finished.
