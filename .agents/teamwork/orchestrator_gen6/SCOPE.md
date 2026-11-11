# Scope: Milestone 8 — Hero Company Profile Card & One-Page In-Page Navigation

## Architecture
Transition `index.html` from multi-page links to a complete, seamless **One-Page Experience** with in-page anchor navigation (`#hero`, `#services`, `#portfolio`, `#pricing`, `#contact`), while preserving the subpages (`services.html`, `portfolio.html`, `contact.html`) for external/direct navigation. Transform the Hero right-side showcase card from a code editor window into an executive **Company Profile & Corporate Value Card** representing PT Rubic Kirana Solusindo.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Hero Company Profile & Corporate Value Card | Replace code editor with executive card (PT Rubic Kirana Solusindo, SCBD Jakarta, 100% guarantee, 100% source code ownership, 250+ enterprise projects, PageSpeed 95+, 30-day bug-free) | M8 | User feedback & attachment |
| 2 | In-Page Anchor Navigation | Convert navbar links, mobile menu drawer, and floating dock to `#hero`, `#services`, `#portfolio`, `#pricing`, `#contact` | M8 | User feedback |
| 3 | In-Page `#contact` Section on index.html | Dedicated consultation form, package selection sync, inline validation, and WhatsApp CTA directly on homepage | M8 | User feedback & spec |
| 4 | Smooth Scrolling & Offset Layout | `html { scroll-behavior: smooth; }`, `scroll-margin-top: 100px;` across all section IDs, vanilla JS smooth scroll handler | M8 | User spec |
| 5 | E2E & Adversarial Test Suite Compatibility | Maintain 100% pass across all 204 E2E tests (`tests/run-e2e.js`) and adversarial tests (`tests/adversarial-m5-verification.js`) | M8 | Regression guard |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M8.1 | Architectural Exploration | Explorers analyze Hero DOM/CSS, navbar links, contact form integration, test assertions | none | IN_PROGRESS |
| M8.2 | Implementation & Test Execution | Worker implements Hero card, anchor links, contact section, smooth scroll, runs E2E tests | M8.1 | PLANNED |
| M8.3 | Verification Gate | 2 Reviewers, 2 Challengers, 1 Forensic Auditor evaluate against criteria | M8.2 | PLANNED |
