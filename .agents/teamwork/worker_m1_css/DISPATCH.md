# Task Assignment: Milestone 1 — CSS Design System & Assets Foundation

## Context
Redesign Rubicweb into an interactive, high-performance web development agency site inspired by Room & Pillar. Establish the complete modern CSS3 architecture, design tokens, resets, grid systems, keyframe animations, and responsive stylesheets.

## Mandatory Reading
- `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\pkl\PKL\PROJECT.md`
- `c:\pkl\PKL\.agents\teamwork\spec_miner_design\handoff.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exclusively Owned Files
- `css/style.css`
- `css/animations.css`
- `css/responsive.css`
- `assets/` (optimize and organize SVGs, brand assets, icons)

## Instructions
1. Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`, `c:\pkl\PKL\PROJECT.md`, and `c:\pkl\PKL\.agents\teamwork\spec_miner_design\handoff.md`.
2. Implement `css/style.css`:
   - Design tokens (`:root`): obsidian backgrounds (`#131419`, `#1f212a`), crisp white plaster text (`#f2f2f6`), slate borders & metadata (`#63646a`), electric acid lime (`#d2fe71`), coral crimson (`#ff8588`), shadows, transitions, spacing, typography scales using Google Fonts (`Plus Jakarta Sans` / `JetBrains Mono`).
   - Architectural drafting dot grid pattern (`radial-gradient(circle, #f2f2f613 .5px, #0000 .5px)`).
   - Modern CSS resets and base element styling.
   - Layout grid, container utilities, typography hierarchy (display serif/sans feel with tight letter spacing `-0.04em` to `-0.02em`).
   - Component base styles: custom cursor (`.cursor-dot`, `.cursor-follower`), 3D tilt card base & specular glare gradient, trust pill badge, buttons, stats counter layout, portfolio card layout, pricing calculator card layout, testimonial carousel layout, FAQ accordion layout, navbar & mobile drawer styles, modal overlay styles, and form styles.
3. Implement `css/animations.css`:
   - Keyframes: `@keyframes ripple` (continuous pulse for WhatsApp), `@keyframes pulseGlow`, `@keyframes float`, `@keyframes shimmer`, `@keyframes textReveal`.
   - Hardware-accelerated transition utilities (`transform`, `opacity`, `will-change`).
   - `@media (prefers-reduced-motion: reduce)` fallbacks disabling intense motion and replacing with simple opacity transitions.
4. Implement `css/responsive.css`:
   - Media queries: mobile (320px+), tablet (768px+), desktop (1024px+), and ultra-wide (1440px+).
   - Fluid typography using `clamp()`, grid column adaptations (4-col -> 2-col -> 1-col), navbar hide/show on mobile, modal full-screen adaptations.
   - Touchscreen optimizations: `@media (hover: none) and (pointer: coarse)` hiding custom cursor and softening 3D card tilt into standard touch states.
5. Verify CSS syntax and ensure zero CSS syntax errors.
6. Write your handoff report to `c:\pkl\PKL\.agents\teamwork\worker_m1_css\handoff.md`.
7. Send a message to the orchestrator when finished.


## 2026-11-10T06:08:41Z
[Message] timestamp=2026-11-10T06:08:41Z sender=73fc147f-0148-4c0f-a31c-3c36c6daddd8 priority=MESSAGE_PRIORITY_HIGH content=You are assigned to implement Milestone 1: CSS Design System, Tokens, Keyframes & Responsive Breakpoints for the Rubicweb Redesign project.
Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`, `c:\pkl\PKL\PROJECT.md`, `c:\pkl\PKL\.agents\teamwork\spec_miner_design\handoff.md`, and `c:\pkl\PKL\.agents\teamwork\worker_m1_css\DISPATCH.md`.
Your working directory is `c:\pkl\PKL` and your state folder is `c:\pkl\PKL\.agents\teamwork\worker_m1_css\`.
Exclusively owned files: `css/style.css`, `css/animations.css`, `css/responsive.css`, and `assets/`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement:
1. `css/style.css`: Design tokens, dark obsidian theme, neo-grotesque & technical typography, layout grids, resets, architectural dot pattern, custom cursor base, 3D tilt card styling, pricing calculator layout, testimonial carousel layout, FAQ accordion grid layout, navbar & drawer styles.
2. `css/animations.css`: Keyframes (ripple, pulse, float, text-reveal), composite transitions, reduced-motion media query.
3. `css/responsive.css`: Breakpoint rules for 320px, 768px, 1024px, 1440px+, touch-device adaptations.
4. Organize and optimize `assets/`.
Ensure zero CSS syntax errors and verify with local tools if needed.
Write your handoff report to `c:\pkl\PKL\.agents\teamwork\worker_m1_css\handoff.md`.
Send a completion message back to the orchestrator when finished.
