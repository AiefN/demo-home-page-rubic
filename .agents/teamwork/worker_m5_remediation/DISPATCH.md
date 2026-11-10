# Dispatch: Worker M5 Remediation

## Objective
Implement all remediations formulated by Explorers 1, 2, and 3:
1. Replace `js/main.js` with `c:\pkl\PKL\.agents\teamwork\explorer_m5_remediation_2\proposed_main.js` (eliminates duplicate controllers and fixes FAQ accordion collision).
2. Update `js/interactions.js` to include `initServiceModal()` per Explorer 3's report (`c:\pkl\PKL\.agents\teamwork\explorer_m5_remediation_3\handoff.md`).
3. Update `index.html`:
   - Line 36: add `whatsapp-ripple` class to floating WhatsApp anchor.
   - Lines 984-988: replace `js/form.js` with `js/contact.js`.
4. Update `services.html`:
   - Delete inline modal script lines 668-787.
   - Replace `js/interactive.js` with `js/interactions.js`.
5. Update `portfolio.html` and `contact.html`:
   - Replace `js/interactive.js` with `js/interactions.js`.
6. Update `tests/tier1-features/` and `tests/tier2-boundaries/`:
   - Apply genuine assertion replacements from Explorer 1's report (`c:\pkl\PKL\.agents\teamwork\explorer_m5_remediation_1\handoff.md`).
   - Strip all `|| true` and unconditional `return true;`.
7. Run the verification commands:
   - `node tests/adversarial-m5-verification.js` (must pass 6/6 including FAQ mouse click)
   - `node tests/run-e2e.js` (must pass 204/204 with 0 failures and 0 console errors)
8. Deliver `handoff.md` in your state folder (`c:\pkl\PKL\.agents\teamwork\worker_m5_remediation\`).

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-10T07:56:16Z
[Message] timestamp=2026-11-10T07:56:16Z sender=3b2dba33-c708-4fac-902b-dadec017f43b priority=MESSAGE_PRIORITY_HIGH content=You are the Remediation Worker for Milestone 5.
Read your dispatch instructions at: c:\pkl\PKL\.agents\teamwork\worker_m5_remediation\DISPATCH.md
Read the original request at: c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md
Read the 3 Explorer reports:
- c:\pkl\PKL\.agents\teamwork\explorer_m5_remediation_1\handoff.md (Test Suite Integrity fixes)
- c:\pkl\PKL\.agents\teamwork\explorer_m5_remediation_2\handoff.md (js/main.js refactor & drop-in file proposed_main.js)
- c:\pkl\PKL\.agents\teamwork\explorer_m5_remediation_3\handoff.md (HTML markup, script tags, service modal in interactions.js)

Your state folder is: c:\pkl\PKL\.agents\teamwork\worker_m5_remediation\
