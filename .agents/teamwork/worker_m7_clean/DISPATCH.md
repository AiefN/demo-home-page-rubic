## 2026-11-11T06:40:10Z

You are worker_m7_clean (Minimalist Implementation Worker) for Milestone 7 of the Rubicweb project.
Working directory: c:\pkl\PKL
State folder: c:\pkl\PKL\.agents\teamwork\worker_m7_clean\
Original request path: c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md
Scope document: c:\pkl\PKL\.agents\teamwork\orchestrator_gen5\SCOPE.md
Project document: c:\pkl\PKL\PROJECT.md

MANDATORY FIRST STEP: Read c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md before doing anything else.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You exclusively own and may edit:
- `index.html`
- `services.html`
- `portfolio.html`
- `contact.html`
- `css/style.css`
- `css/responsive.css`
- `js/portfolio.js` (for modal case study copy brevity if needed)
You MUST NOT edit any test files under `tests/`!

INPUT SOURCES:
- Read `c:\pkl\PKL\.agents\teamwork\explorer_m7_1\handoff.md` for the exact Before -> After copy mappings across all 4 pages (cutting word count by 50-68%).
- Read `c:\pkl\PKL\.agents\teamwork\explorer_m7_2\handoff.md` for the Protected Keywords & Cardinality Matrix (invariants that MUST NOT be violated).
- Read `c:\pkl\PKL\.agents\teamwork\explorer_m7_3\handoff.md` for the exact CSS blueprints, spacing tokens, and selector rules.

OBJECTIVE:
Transform the Rubicweb website into an ultra-clean, minimalist, and concise web agency site inspired by Room & Pillar (https://www.roomandpillar.com/), eliminating text bloat while preserving all required features, semantic anchors, and interactive mechanisms.

KEY TASKS:
1. **Content Minimization (Text Reduction)**:
   - Apply the concise copy replacements from `explorer_m7_1/handoff.md` to `index.html`, `services.html`, `portfolio.html`, and `contact.html`.
   - Hero: Crisp editorial headline, 1 short positioning sentence.
   - Services: Exactly 1 elegant, punchy sentence per service card (card text length MUST be > 30 chars).
   - Portfolio: Minimal bullet-point metrics, brief summaries.
   - Pricing: Streamline feature explanations and tier highlights.
   - FAQ: Direct 1-2 sentence answers without rambling.
   - Subpages: Strip repetitive copy, simplify section descriptions, maximize clean typography.
2. **CSS Styling & Layout Refinement**:
   - Apply the design system updates from `explorer_m7_3/handoff.md` to `css/style.css` and `css/responsive.css`.
   - Section Spacing: Add `.section-padding` and section classes with fluid `--section-spacing: clamp(70px, 8vw, 120px);`, restoring rhythmic whitespace and expanding clearance from floating dock.
   - Services Grid: Add `display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px;` to `.services-grid, .capabilities-grid` in `style.css` and normalize card height with flex column.
   - Dark Luxury Surfaces: Add obsidian gradients, hairline slate borders (`rgba(242, 242, 246, 0.08)`), and soft hover illumination.
   - Subpage Headers: Implement `.page-hero-section`, `.breadcrumb-text`, `.page-title`, `.page-subtitle`, `.page-telemetry-bar`, and `.contact-channels-grid` eliminating inline styles.
3. **Strict Invariant Safeguards**:
   - Exactly 3 `.tier-card` elements on `index.html`.
   - Exactly 6 `.faq-item` elements on `index.html`.
   - Exactly 10 `.card-tilt` elements on `services.html` (4 service detail cards + 6 workflow steps).
   - Exactly 7 `.card-tilt` / `.portfolio-card` cards on `portfolio.html` (all=7, ecommerce=2, corporate=3, webapp=2).
   - Form error strings on `contact.html` intact (`minimal 3 karakter`, `tidak valid`, `08`, `minimal 10 karakter`).
   - Preserve Milestone 6 fixes: modal concealment (`display: none !important;`), floating dock clearance & scroll hysteresis, pricing 3-column grid, transparent FAQ trigger buttons.
4. **Verification & Regression Testing**:
   - Run `node tests/run-e2e.js` and verify that all 60 suites and 204 tests PASS with 0 failures and 0 console errors.
   - Run `node tests/adversarial-m5-verification.js` and any challenger test scripts.
   - Test responsive layout across 320px, 768px, and 1440px viewports with zero horizontal overflow.
