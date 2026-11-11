## 2026-11-11T07:39:47Z
You are explorer_m8_1. Your task is to investigate the Hero Section in `index.html` and design the architectural replacement of the code window card with the Executive Company Profile & Corporate Value Card.

MANDATORY FIRST STEP:
Read `c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md` in full before starting work.

WORKING DIRECTORY: c:\pkl\PKL
STATE FOLDER: c:\pkl\PKL\.agents\teamwork\explorer_m8_1\
SCOPE DOCUMENT: c:\pkl\PKL\.agents\teamwork\orchestrator_gen6\SCOPE.md

BACKGROUND & USER FEEDBACK:
The user provided critical feedback with an attached screenshot:
"ini kok begini harusnya tentang perusahaan dong bukan web nya skrng lalu aku mau kamu gak bikin page2 lain navbar diatas itu jadi kyk anchor buat ngasih ke bagian bawah bawah git lo misal porto kan udah ada tuh di bawah gausah bikin page navbar nya cuma untuk turunin kebawah"
Attachment shows the code editor window (`rubicweb.engine.config.ts`, `export const rubicwebStack = { ... }`) in the Hero section.
The user strictly requested that this card represent the COMPANY (PT Rubic Kirana Solusindo / Rubicweb), NOT the website code!

YOUR SPECIFIC INVESTIGATION TARGETS:
1. Inspect `index.html` around `.hero-visual`, `.engineering-card`, `.code-window` (and related markup).
2. Inspect `css/style.css`, `css/animations.css`, and `css/responsive.css` for how the engineering card, code blocks, syntax highlighting, and 3D tilt are currently styled.
3. Inspect `js/interactions.js` to see how 3D card tilt (`.card-tilt`) and radial specular border glow (`--mouse-x`, `--mouse-y`) interact with cards in the Hero.
4. Design the complete semantic HTML5 and CSS structure for the new Executive Company Profile & Corporate Value Card:
   - Header / Status Pill: "PT RUBIC KIRANA SOLUSINDO" & "VERIFIED DIGITAL AGENCY | SCBD JAKARTA"
   - Title / Tagline: "Boutique Web & Digital Engineering Agency"
   - Core Corporate Guarantees & Credentials:
     * 100% Garansi Uang Kembali / Kepuasan Mutlak
     * 100% Hak Milik Source Code & Aset Digital Tanpa Keterikatan
     * 250+ Proyek Enterprise & Bisnis Berskala Nasional
     * Standar Kinerja Core Web Vitals (Google PageSpeed 95+ & 99.9% SLA)
     * Tim Developer Berpengalaman & 30-Day Bug-Free Guarantee
   - Design: Ultra-luxurious Room & Pillar obsidian aesthetic, sleek glassmorphism, 3D card tilt physics, badges, pristine typography, ZERO pseudo-code clutter.
5. Identify any selectors used by tests in `tests/` that target the Hero visual card so we don't break existing tests.

DELIVERABLE:
Write a comprehensive report to `c:\pkl\PKL\.agents\teamwork\explorer_m8_1\handoff.md` and send a message when complete.
