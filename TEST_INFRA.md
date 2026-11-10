# E2E Test Infra: Rubicweb Redesign

## Test Philosophy
- **Opaque-Box & Requirement-Driven**: Tests are derived strictly from `ORIGINAL_REQUEST.md` user requirements and public interfaces, with zero dependencies on internal code variables.
- **Methodology**: Systematic 4-tier strategy: Category-Partition, Boundary Value Analysis (BVA), Pairwise Combinatorial Testing, and Real-World Workload Testing.
- **Zero-Dependency Automated Runner**: Built using Node.js standard libraries (`http`, `child_process`, `fs`, `path`) orchestrating Headless Google Chrome and Microsoft Edge via standard CLI flags (`--headless=new`, `--dump-dom`, `--remote-debugging-port`) and automated browser evaluation scripts.

---

## Feature Inventory & Test Matrix

| # | Feature | Requirement Source | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) |
|---|---------|---------------------|:-----------------:|:-----------------:|:----------------------:|
| 1 | Multi-Page Architecture & HTTP Status | ORIGINAL_REQUEST § R1, § Acceptance | 5 | 5 | ✓ |
| 2 | Pure HTML/CSS/JS (Zero External Frameworks) | ORIGINAL_REQUEST § R4, § Acceptance | 5 | 5 | ✓ |
| 3 | Responsive Layouts (320px, 768px, 1440px) | ORIGINAL_REQUEST § R4, § Acceptance | 5 | 5 | ✓ |
| 4 | Hero Section, Badge & CTAs | ORIGINAL_REQUEST § R2.1 | 5 | 5 | ✓ |
| 5 | Custom Trailing Cursor | ORIGINAL_REQUEST § R2.1 | 5 | 5 | ✓ |
| 6 | 4 Core Services & Tech Badges | ORIGINAL_REQUEST § R2.2 | 5 | 5 | ✓ |
| 7 | 3D Card Tilt & Border Glare | ORIGINAL_REQUEST § R2.2 | 5 | 5 | ✓ |
| 8 | Trust Pillars & Stats Counters | ORIGINAL_REQUEST § R2.3 | 5 | 5 | ✓ |
| 9 | Filterable Portfolio Gallery | ORIGINAL_REQUEST § R2.4, R3.2 | 5 | 5 | ✓ |
| 10 | Case Study Modal Previews | ORIGINAL_REQUEST § R2.4, R3.2 | 5 | 5 | ✓ |
| 11 | Dynamic Pricing Calculator | ORIGINAL_REQUEST § R2.5 | 5 | 5 | ✓ |
| 12 | Auto-Scrolling Testimonial Carousel | ORIGINAL_REQUEST § R2.6 | 5 | 5 | ✓ |
| 13 | Single-Active FAQ Accordion | ORIGINAL_REQUEST § R2.6 | 5 | 5 | ✓ |
| 14 | Dynamic Navbar & Mobile Menu | ORIGINAL_REQUEST § R2.7 | 5 | 5 | ✓ |
| 15 | 6-Stage Services Workflow Timeline | ORIGINAL_REQUEST § R3.1 | 5 | 5 | ✓ |
| 16 | Contact Consultation Form Inline Validation | ORIGINAL_REQUEST § R3.3 | 5 | 5 | ✓ |
| 17 | Floating WhatsApp Ripple Button | ORIGINAL_REQUEST § R3.3 | 5 | 5 | ✓ |
| 18 | Agency Information & Legal Footer | ORIGINAL_REQUEST § R2.7 | 5 | 5 | ✓ |

---

## Test Architecture
- **Test Runner**: `node tests/run-e2e.js`
- **Output Format**: Structured JSON summary + human-readable CLI report with pass/fail counts, execution time, and exact error traces.
- **Pass/Fail Semantics**: Exit code 0 if 100% of tests pass. Non-zero exit code if any test fails.
- **Directory Layout**:
  ```
  tests/
  ├── run-e2e.js               # Master test runner & local static HTTP server
  ├── helpers/
  │   └── browser-driver.js    # Headless Chrome/Edge automation wrapper
  ├── tier1-features/          # Basic presence & functional execution (≥ 5 per feature)
  ├── tier2-boundaries/        # Boundary value analysis & extreme input tests (≥ 5 per feature)
  ├── tier3-combinations/      # Pairwise interaction testing (navigation + calculator, filter + modal, etc.)
  └── tier4-scenarios/         # End-to-end user journeys & stress workloads
  ```

---

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Target Complexity |
|---|----------|--------------------|-------------------|
| 1 | Visitor explores services, opens workflow timeline, triggers service modal | Hero CTA, Services cards, 3D tilt, Modal engine, Navbar | High |
| 2 | Prospective client calculates custom web app price, selects add-ons, clicks WhatsApp | Pricing Calculator, sliders, checkboxes, WhatsApp link | High |
| 3 | Prospective client fills contact form, tests invalid email/phone, corrects, submits | Contact form, inline regex validation, status indicators | High |
| 4 | Enterprise visitor browses portfolio, filters by Web App, opens case study | Portfolio tabs, grid transitions, case study modal popup | High |
| 5 | Mobile visitor navigates via drawer menu, scrolls FAQs, clicks floating WhatsApp | Mobile drawer, FAQ accordion, floating ripple CTA, 320px | High |
| 6 | Performance audit: scroll-down shrink/hide, stats observer trigger, carousel pause | Navbar scroll hysteresis, IntersectionObserver, Carousel | High |

---

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: $\ge 5$ test cases per feature ($18 \times 5 = 90$ cases minimum)
- **Tier 2 (Boundary & Corner Cases)**: $\ge 5$ test cases per feature ($18 \times 5 = 90$ cases minimum)
- **Tier 3 (Cross-Feature Combinations)**: Major pairwise feature interactions ($18$ pairwise scenarios minimum)
- **Tier 4 (Real-World Scenarios)**: $\ge 6$ realistic end-to-end user journeys
- **Total Minimum Test Count**: $\ge 204$ automated test cases.
