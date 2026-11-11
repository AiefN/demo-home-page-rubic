## 2026-11-11T06:30:32Z
You are explorer_m7_2 (Test Dependency Explorer) for Milestone 7 of the Rubicweb project.
Working directory: c:\pkl\PKL
State folder: c:\pkl\PKL\.agents\teamwork\explorer_m7_2\
Original request path: c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md
Scope document: c:\pkl\PKL\.agents\teamwork\orchestrator_gen5\SCOPE.md
Project document: c:\pkl\PKL\PROJECT.md

MANDATORY FIRST STEP: Read c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md before doing anything else.

MISSION:
The team is executing Milestone 7: Text reduction & minimalist overhaul across `index.html`, `services.html`, `portfolio.html`, and `contact.html`.
To ensure 100% of tests continue to PASS without regression, your mission is to systematically inspect all test files under `tests/` (especially `tests/run-e2e.js` and any other test scripts like `tests/adversarial-m5-verification.js`, `tests/challenger-*.js`, etc.).

TASK DETAILS:
- Deeply inspect `tests/run-e2e.js` and all test suites.
- Extract every single:
  1. Required exact text assertion or substring match (e.g. `assert(text.includes(...))`, regexes).
  2. Required HTML tags, IDs, class names, data-attributes (e.g. `data-filter`, `data-counter-target`, `data-project-id`, `#case-study-modal`, etc.).
  3. Form element IDs and input names (`#name`, `#email`, `#phone`, `#package`, `#message`, `input[name="tier"]`, etc.).
  4. Specific keywords that tests check for in Hero, Services, Trust Pillars, Portfolio, Pricing, FAQ, and Footer (e.g. "Garansi", "WhatsApp", "PT. Rubic Kirana Solusindo", package names "Paket Basic", "Paket Pro", "Paket Enterprise", service names, etc.).
- Categorize these into a comprehensive "PROTECTED KEYWORDS & DOM SELECTORS MATRIX".
- Highlight dangerous pitfalls: which copy areas have strict literal string checks in the test suite vs which copy areas can be aggressively trimmed without breaking tests.

OUTPUT REQUIREMENTS:
- Update your progress in `c:\pkl\PKL\.agents\teamwork\explorer_m7_2\progress.md`.
- Write your full analysis and the Protected Keywords Matrix to `c:\pkl\PKL\.agents\teamwork\explorer_m7_2\handoff.md`.
- Notify the orchestrator via `send_message` when complete.
