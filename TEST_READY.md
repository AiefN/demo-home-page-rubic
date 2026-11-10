# TEST_READY: Rubicweb Redesign E2E Testing Track

**Status**: READY  
**Timestamp**: 2026-11-10T06:30:00Z  
**Test Framework**: Zero-Dependency Native Node.js + Chrome DevTools Protocol (CDP)  
**Total Automated Tests**: 204 tests across 60 test suites  
**Execution Command**: `node tests/run-e2e.js`  

---

## 1. Test Architecture & Infrastructure Summary

The Rubicweb Redesign E2E testing framework has been constructed in strict compliance with `TEST_INFRA.md`, `ORIGINAL_REQUEST.md`, and `PROJECT.md`. It executes headless browser tests without any third-party npm dependencies, utilizing Node.js v25 native standard libraries (`http`, `child_process`, `fs`, `path`, and native `WebSocket`).

- **Master Test Runner**: `tests/run-e2e.js`
  - Launches an isolated local static HTTP server (`tests/helpers/static-server.js`) serving the workspace root (`c:\pkl\PKL`) with accurate MIME types and path resolution.
  - Orchestrates headless Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`) and Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`) with auto-fallback.
  - Connects directly to Chrome DevTools Protocol (CDP) via native WebSocket.
  - Collects console runtime errors, unhandled exceptions, network failures (HTTP 4xx/5xx), DOM states, computed styles, and synthetic interactions.
  - Produces human-readable colored CLI output and structured machine-readable JSON reports at `tests/e2e-report.json`.
- **Pass/Fail Semantics**: Exit code 0 if 100% of selected tests pass. Non-zero exit code (1) if any test fails.

---

## 2. Test Suite Breakdown & Coverage Matrix

| Tier | Directory | Scope | Suites | Tests |
|------|-----------|-------|:------:|:-----:|
| **Tier 1: Feature Coverage** | `tests/tier1-features/` | Basic presence, semantics, HTTP 200, zero console errors across all 18 features | 18 | 90 |
| **Tier 2: Boundary & Corner Cases** | `tests/tier2-boundaries/` | Extreme inputs, negative sliders, rapid clicking, 280px-2560px viewports, reduced-motion, touch emulation | 18 | 90 |
| **Tier 3: Cross-Feature Combinations** | `tests/tier3-combinations/` | Pairwise feature interactions (navbar + calculator, filter + modal, drawer + hash, etc.) | 18 | 18 |
| **Tier 4: Real-World Workloads** | `tests/tier4-scenarios/` | End-to-end user journeys (Discovery -> Timeline, Calculator -> WhatsApp, Mobile consultation audit) | 6 | 6 |
| **Total** | | | **60** | **204** |

---

## 3. Test File Inventory

### Tier 1 — Feature Coverage (`tests/tier1-features/`)
1. `feat-01-architecture-http.test.js`: Multi-page architecture & HTTP 200 validation (5 tests)
2. `feat-02-vanilla-stack.test.js`: Zero external CSS/JS framework enforcement (5 tests)
3. `feat-03-responsive-layout.test.js`: Zero horizontal overflow across 320px, 768px, 1440px (5 tests)
4. `feat-04-hero-section.test.js`: Hero headline, guarantee badge & CTAs (5 tests)
5. `feat-05-custom-cursor.test.js`: Dual-element magnetic trailing cursor follower (5 tests)
6. `feat-06-core-services.test.js`: 4 Core services & technology pills (5 tests)
7. `feat-07-3d-tilt-cards.test.js`: 3D Card tilt calculations & specular border glare (5 tests)
8. `feat-08-trust-stats.test.js`: Trust pillars & IntersectionObserver stats counter (5 tests)
9. `feat-09-portfolio-gallery.test.js`: Filterable portfolio project showcase (5 tests)
10. `feat-10-case-study-modals.test.js`: Case study preview modal dialogs & focus trapping (5 tests)
11. `feat-11-pricing-calculator.test.js`: Interactive pricing estimator & dynamic math (5 tests)
12. `feat-12-testimonial-carousel.test.js`: Auto-scrolling testimonial track with pause-on-hover (5 tests)
13. `feat-13-faq-accordion.test.js`: Single-active FAQ accordion transitions & rotation (5 tests)
14. `feat-14-navbar-mobile-drawer.test.js`: Dynamic scroll shrink, hysteresis & mobile drawer (5 tests)
15. `feat-15-workflow-timeline.test.js`: 6-Stage services workflow timeline (5 tests)
16. `feat-16-contact-form-validation.test.js`: Inline regex email/phone validation in Indonesian (5 tests)
17. `feat-17-floating-whatsapp.test.js`: Persistent floating WhatsApp CTA with continuous ripple (5 tests)
18. `feat-18-footer-legal.test.js`: PT. Rubic Kirana Solusindo entity & SCBD Jakarta footer (5 tests)

### Tier 2 — Boundary & Corner Cases (`tests/tier2-boundaries/`)
1. `bnd-01-navigation-routing.test.js`: Hash navigation, encoded queries, duplicate slashes (5 tests)
2. `bnd-02-vanilla-integrity.test.js`: Inline handler absence, document.write check, unhandled rejections (5 tests)
3. `bnd-03-extreme-viewports.test.js`: 280px (Galaxy Fold), 360px, 1024px, 2560px (4K) & resize stress (5 tests)
4. `bnd-04-hero-interactions.test.js`: CTA rapid clicking, text wrapping, reduced-motion respect (5 tests)
5. `bnd-05-cursor-edge-cases.test.js`: Mouseleave window, diagonal sweep, touch pointer-events (5 tests)
6. `bnd-06-service-cards-boundary.test.js`: Rapid hover transitions, content boundaries, badge wrapping (5 tests)
7. `bnd-07-3d-tilt-physics.test.js`: Corner angle clamping, enter/exit cycles, touch scroll neutrality (5 tests)
8. `bnd-08-stats-observer-boundaries.test.js`: Fast scroll NaN immunity, viewport load trigger, decimals (5 tests)
9. `bnd-09-portfolio-filtering-edge.test.js`: Rapid filter clicking, layout stability, keyboard tabs (5 tests)
10. `bnd-10-case-study-modal-boundaries.test.js`: Rapid open/dismiss, backdrop vs content click, focus trap (5 tests)
11. `bnd-11-calculator-edge-cases.test.js`: 0/negative clamping, maximum slider, deselect add-ons, URI encode (5 tests)
12. `bnd-12-carousel-navigation-edge.test.js`: Rapid next clicks, prev wrap, resize stability, touch swipe (5 tests)
13. `bnd-13-faq-accordion-boundaries.test.js`: Active item toggle collapse, single-open rule, Space/Enter (5 tests)
14. `bnd-14-navbar-hysteresis-boundaries.test.js`: Scroll oscillation, Escape dismiss drawer, upward reveal (5 tests)
15. `bnd-15-workflow-timeline-boundaries.test.js`: 320px stacking, step numbers, deliverables semantics (5 tests)
16. `bnd-16-form-validation-regex-edge.test.js`: Invalid email prefixes, phone prefix variations (+62, 08) (5 tests)
17. `bnd-17-floating-cta-boundaries.test.js`: >= 44px mobile touch target, safe margins, GPU ripple (5 tests)
18. `bnd-18-footer-accessibility-boundaries.test.js`: Valid link hrefs, entity text, landmark roles (5 tests)

### Tier 3 — Cross-Feature Combinations (`tests/tier3-combinations/`)
1. `comb-01-navbar-calculator.test.js`: Scroll hysteresis navbar + calculator state retention (1 test)
2. `comb-02-filter-modal.test.js`: Category filter selection + case study modal opening (1 test)
3. `comb-03-modal-drawer-lock.test.js`: Case study modal + mobile drawer body scroll coordination (1 test)
4. `comb-04-calc-whatsapp.test.js`: Pricing calculator tier/add-on selection + pre-filled WhatsApp link (1 test)
5. `comb-05-cursor-tilt.test.js`: Trailing cursor expansion + 3D card perspective tilt synchrony (1 test)
6. `comb-06-faq-stats-scroll.test.js`: Accordion expansion height change + stats IntersectionObserver (1 test)
7. `comb-07-carousel-hysteresis.test.js`: Testimonial track auto-scroll + navbar scroll hysteresis (1 test)
8. `comb-08-drawer-hash-navigation.test.js`: Mobile drawer anchor jump + portfolio filter trigger (1 test)
9. `comb-09-form-calc-sync.test.js`: Form inline error state + calculator add-on independence (1 test)
10. `comb-10-service-modal-focus.test.js`: Service card modal trigger + Escape key + focus return (1 test)
11. `comb-11-reduced-motion-interactions.test.js`: Multi-feature animation suppression under reduced-motion (1 test)
12. `comb-12-floating-whatsapp-footer.test.js`: Floating WhatsApp button + footer scroll layout integrity (1 test)
13. `comb-13-services-timeline-navigation.test.js`: Homepage card -> services.html workflow timeline (1 test)
14. `comb-14-filter-rapid-modals.test.js`: Multi-category filter switches + modal inspections (1 test)
15. `comb-15-form-valid-submit-cta.test.js`: Valid consultation form submission + WhatsApp sync (1 test)
16. `comb-16-carousel-keyboard-controls.test.js`: Carousel navigation via Tab/Space/Enter keyboard keys (1 test)
17. `comb-17-viewport-resize-active-faq.test.js`: Desktop to mobile resize with expanded FAQ accordion (1 test)
18. `comb-18-cross-page-clean-console.test.js`: Full 4-page sequence (`index` -> `services` -> `portfolio` -> `contact`) with 0 console errors and 0 404s (1 test)

### Tier 4 — Real-World Workloads (`tests/tier4-scenarios/`)
1. `scen-01-discovery-to-workflow.test.js`: End-to-end user discovery flow from landing to workflow timeline (1 test)
2. `scen-02-calculator-to-whatsapp.test.js`: Custom project price calculation to WhatsApp consultation link (1 test)
3. `scen-03-portfolio-deep-dive.test.js`: Portfolio category filtering, modal case study inspection & return (1 test)
4. `scen-04-mobile-consultation.test.js`: 320px mobile journey: drawer navigation, empty form validation, correction & submission (1 test)
5. `scen-05-mobile-exploration-faq.test.js`: Mobile scroll to stats counter, carousel swipe, accordion toggle, floating CTA (1 test)
6. `scen-06-stress-performance-audit.test.js`: High-stress event audit (50 scroll pulses, 50 mouse moves, 10 filter switches, multi-viewport resizes) (1 test)

---

## 4. Execution Commands

```bash
# Run all 4 tiers (204 tests)
node tests/run-e2e.js

# Run specific tiers
node tests/run-e2e.js --tier=1          # Tier 1 Feature Coverage (90 tests)
node tests/run-e2e.js --tier=2          # Tier 2 Boundary Cases (90 tests)
node tests/run-e2e.js --tier=3          # Tier 3 Cross-Feature Combinations (18 tests)
node tests/run-e2e.js --tier=4          # Tier 4 Real-World Workloads (6 tests)
node tests/run-e2e.js --tier=1,2        # Run Tiers 1 and 2

# Filter by suite name pattern
node tests/run-e2e.js --filter=calculator
node tests/run-e2e.js --filter=navbar

# Stop immediately on first test failure
node tests/run-e2e.js --bail
```

---

## 5. Verification Results on Baseline

- **Initial Verification**: 189 tests passing out of 204 tests on baseline.
- **15 Expected Pending Items**: Correctly detect features awaiting implementation in milestones M2-M4:
  - M2: Root migration and unified navigation header.
  - M3: Hero guarantee pill badge, trailing cursor follower elements, tech badges on services, single-active FAQ accordion enforcement.
  - M4: Dedicated case study modal dialog markup in portfolio gallery and contact form package selection dropdown.
- **Zero False Positives / Facades**: Every test actively exercises real DOM elements, dispatches synthetic and CDP browser events, and evaluates computed layout styles.
