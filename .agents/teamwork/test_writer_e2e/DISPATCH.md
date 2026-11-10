# Task Assignment: E2E Testing Track Architecture & Test Suite Construction

## Context
Redesign Rubicweb into an interactive, high-performance web development agency site. Build the complete opaque-box E2E testing framework and test suite per `TEST_INFRA.md`.

## Mandatory Reading
- `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\pkl\PKL\PROJECT.md`
- `c:\pkl\PKL\TEST_INFRA.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exclusively Owned Files
- `tests/` directory (all test files, helpers, and runner)
- `c:\pkl\PKL\TEST_READY.md`

## Instructions
1. Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`, `c:\pkl\PKL\PROJECT.md`, and `c:\pkl\PKL\TEST_INFRA.md`.
2. Implement the automated E2E test runner in `tests/run-e2e.js`:
   - Start a zero-dependency local static HTTP server in Node.js (serving root directory `c:\pkl\PKL`).
   - Implement browser driver helper (`tests/helpers/browser-driver.js`) that executes Headless Chrome or Edge (verified at `C:\Program Files\Google\Chrome\Application\chrome.exe` and `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`) using `--headless=new`, capturing DOM snapshots, console logs, network errors, and runtime evaluation scripts.
3. Build the 4-tier test suites satisfying all thresholds in `TEST_INFRA.md`:
   - **Tier 1 (Feature Coverage, ≥5 per feature, 90+ tests)**: Verify presence, semantics, and standard behavior for all 18 features across `index.html`, `services.html`, `portfolio.html`, and `contact.html`. Confirm HTTP 200 and zero console errors.
   - **Tier 2 (Boundary & Corner Cases, ≥5 per feature, 90+ tests)**: Extreme inputs, empty inputs, negative values on sliders, rapid clicks, missing query params, long strings, invalid email/phone regex edge cases, reduced-motion media query respect, and touch screen emulation (`@media (hover: none)`).
   - **Tier 3 (Cross-Feature Combinations, ≥18 tests)**: Pairwise interactions (e.g. navigation scroll + pricing calculator changes, category filter + modal opening, contact form validation + calculator pre-fill WhatsApp link).
   - **Tier 4 (Real-World Workloads, ≥6 application scenarios)**: End-to-end user journeys (Discovery -> Pricing calculation -> WhatsApp link generation; Portfolio browsing -> Case study modal inspection; Consultation form inline error -> correction -> submission).
4. Verify tests can be executed via `node tests/run-e2e.js`.
5. When the full test suite is implemented and ready to test against the application, write `TEST_READY.md` at `c:\pkl\PKL\TEST_READY.md` following the template in `PROJECT.md`.
6. Write your handoff report to `c:\pkl\PKL\.agents\teamwork\test_writer_e2e\handoff.md`.
7. Send a message to the orchestrator when finished.


## 2026-11-10T06:08:35Z
You are assigned to build the comprehensive E2E Testing Framework and test suites for the Rubicweb Redesign project.
Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md`, `c:\pkl\PKL\PROJECT.md`, `c:\pkl\PKL\TEST_INFRA.md`, and `c:\pkl\PKL\.agents\teamwork\test_writer_e2e\DISPATCH.md`.
Your working directory is `c:\pkl\PKL` and your state folder is `c:\pkl\PKL\.agents\teamwork\test_writer_e2e\`.
Exclusively owned files: `tests/` directory and `c:\pkl\PKL\TEST_READY.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement the automated test runner `tests/run-e2e.js`, headless browser driver helpers, and the 4-tier test suites (Tier 1 Feature Coverage, Tier 2 Boundary Cases, Tier 3 Pairwise Combinations, Tier 4 Real-World Workloads) per `TEST_INFRA.md`.
Ensure the test runner executes with `node tests/run-e2e.js`.
When complete, publish `c:\pkl\PKL\TEST_READY.md`.
Write your handoff report to `c:\pkl\PKL\.agents\teamwork\test_writer_e2e\handoff.md`.
Send a completion message back to the orchestrator when finished.
