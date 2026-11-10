# Task Assignment: Milestone 3 — Vanilla JS Interactions & Homepage Interactivity

## Context
Redesign Rubicweb homepage interactions to match Room & Pillar elegance and 60fps micro-interaction precision per R1 and R2.

## Mandatory Reading
- `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\pkl\PKL\PROJECT.md`
- `c:\pkl\PKL\.agents\teamwork\spec_miner_design\handoff.md`
- `c:\pkl\PKL\.agents\teamwork\explorer_tech\handoff.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exclusively Owned Files
- `js/interactions.js`
- `index.html` (refining scripts inclusion and interactive attribute hooks)

## Instructions
1. Implement `js/interactions.js` containing all required homepage micro-interactions:
   - **Custom Trailing Cursor**: Dual-element (`.cursor-dot`, `.cursor-follower`) tracking pointermove, smoothed via Linear Interpolation (LERP $\lambda = 0.16$) on `requestAnimationFrame`. Hover expansion (`.cursor-hover`) on interactive targets (`a`, `button`, `.card-tilt`, `input`, `select`, `textarea`). Automatically disabled on touch screens (`@media (hover: none) and (pointer: coarse)`).
   - **3D Card Tilt with Specular Glare**: Normalizes mouse coordinates relative to card center, applies `perspective(1000px) rotateX(...) rotateY(...) scale3d(1.02, 1.02, 1.02)`, and updates `--mouse-x` and `--mouse-y` for radial specular glare. Smooth reset on mouse leave.
   - **Viewport Numerical Stats Counters**: IntersectionObserver triggering smooth numerical animation (`100%`, `250+`, `99.9%`, `95+`) from 0 to target over 2000ms using exponential ease-out easing.
   - **Auto-Scrolling Testimonials Carousel**: Continuous or stepped auto-scrolling track (5000ms interval), smooth sliding transition, pause-on-hover/touch, next/prev navigation buttons, and indicator dots.
   - **Single-Active FAQ Accordion**: Enforces single-item expansion via CSS Grid 0fr->1fr height transition and 45-degree toggle icon rotation. Automatically collapses any open sibling when a new question is opened.
2. Ensure `index.html` loads `<script src="js/interactions.js" defer></script>` and has all proper event bindings.
3. Verify zero console errors and 100% test pass via `node tests/run-e2e.js`.
4. Write handoff report to `c:\pkl\PKL\.agents\teamwork\worker_m3_interactions\handoff.md`.
5. Send completion message to orchestrator.


## 2026-11-10T07:08:35Z
You are assigned as Worker for Milestone 3: Vanilla JS Interactions & Homepage Interactivity.
Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`, `c:\pkl\PKL\PROJECT.md`, `c:\pkl\PKL\.agents\teamwork\spec_miner_design\handoff.md`, `c:\pkl\PKL\.agents\teamwork\explorer_tech\handoff.md`, and `c:\pkl\PKL\.agents\teamwork\worker_m3_interactions\DISPATCH.md`.
Your working directory is `c:\pkl\PKL` and your state folder is `c:\pkl\PKL\.agents\teamwork\worker_m3_interactions\`.
Exclusively owned files: `js/interactions.js` and `index.html`.
