# Task Assignment: Technical Architecture & Vanilla JS Interaction Mechanics Survey

## Context
Redesign Rubicweb into an interactive, high-performance web development agency site using pure semantic HTML5, modern CSS3, and Vanilla JavaScript (ES6+). Zero external frameworks or libraries. Zero console errors. Smooth 60fps animations. Responsive across 320px, 768px, 1440px.

## Instructions
1. Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`.
2. Inspect the current workspace `c:\pkl\PKL` (enumerate any existing files, scripts, or assets).
3. Architect the technical implementation for all required files and mechanisms:
   - File structure:
     - `index.html`, `services.html`, `portfolio.html`, `contact.html`
     - `css/style.css`, `css/animations.css`, `css/responsive.css`
     - `js/main.js`, `js/interactions.js`, `js/portfolio.js`, `js/contact.js`
     - `assets/` (SVGs, icons, placeholder images)
   - Detailed Vanilla JS interaction algorithms and math:
     - Custom trailing cursor (lerp/RAF smoothing, scale on hover)
     - 3D card tilt with mouse X/Y calculation relative to card center (`perspective() rotateX() rotateY()`) & radial gradient border glow
     - Viewport-triggered statistics counter using `IntersectionObserver`
     - Instant category filtering for portfolio grid with smooth CSS transitions without page reload
     - Interactive dynamic pricing calculator with real-time recalculation of investment and timeline based on tiers, sliders, and checkboxes
     - Auto-scrolling testimonial carousel with pause-on-hover and next/prev controls
     - FAQ accordion with single active item expansion and 45-degree toggle rotation
     - Dynamic navbar (backdrop blur, scroll shrink, hide on scroll down, show on scroll up, mobile drawer)
     - Inline form validation for contact form (regex for email & WhatsApp phone) + floating ripple WhatsApp button
     - Case study modals
   - Performance & quality constraints:
     - 60fps animations via `requestAnimationFrame` and CSS hardware-accelerated transforms (`transform`, `opacity`)
     - Clean lifecycle handling, preventing duplicate event listeners and memory leaks
     - E2E and automated browser verification strategy (e.g. headless browser testing, Node.js Puppeteer/Playwright if available, or lightweight node verification scripts)
4. Write your full report to `c:\pkl\PKL\.agents\teamwork\explorer_tech\handoff.md`.
5. Send a completion message back to the orchestrator when finished.


## 2026-11-10T06:01:15Z
Sender: 73fc147f-0148-4c0f-a31c-3c36c6daddd8
Message:
You are assigned to conduct a technical architecture and interaction mechanics survey for the Rubicweb redesign.
Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md` and `c:\pkl\PKL\.agents\teamwork\explorer_tech\DISPATCH.md`.
Your working directory is `c:\pkl\PKL` and your state folder is `c:\pkl\PKL\.agents\teamwork\explorer_tech\`.
Inspect the current workspace directory `c:\pkl\PKL`.
Analyze the architectural requirements: pure semantic HTML5, modern CSS3 variables/grid/flexbox/keyframes, Vanilla ES6+ JS, zero external libraries, zero console errors, 60fps animations, mobile/tablet/desktop responsive breakpoints 320px/768px/1440px.
Detail the mathematical logic and implementation blueprints for all required vanilla JS interactions (custom trailing cursor, 3D card tilt with border glow, viewport stats counters via IntersectionObserver, instant portfolio category filtering, dynamic pricing calculator, auto-scrolling testimonial carousel, FAQ accordion, scroll-reactive navbar, and inline validation).
Evaluate testing and verification strategies (e.g. headless browser testing, programmatic interaction scripts).
Write your complete report to `c:\pkl\PKL\.agents\teamwork\explorer_tech\handoff.md`.
When finished, send a message to the orchestrator summarizing your key findings.
