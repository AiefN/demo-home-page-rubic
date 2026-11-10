# BRIEFING — 2026-11-10T06:00:00Z

## Mission
Redesign the Rubicweb website into an interactive, high-performance web development agency site inspired by the UI/UX, aesthetics, and micro-interactions of Room & Pillar, incorporating brand elements, guarantees, and programming service offerings from Rubicweb.

## 🔒 My Identity
- Archetype: orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: c:\pkl\PKL
- State folder: c:\pkl\PKL\.agents\teamwork\orchestrator\
- Original parent: parent
- Original parent conversation ID: 463eec9d-46c7-406a-a459-ed6b46710d67

## 🔒 My Workflow
- **Pattern**: Project Pattern
- **Scope document**: c:\pkl\PKL\PROJECT.md
1. **Decompose**: Map requirements into multi-milestone architectural decomposition and parallel E2E testing track.
2. **Dispatch & Execute** (pick ONE):
   - **Direct (iteration loop)**: Survey -> Milestone decomposition -> Explorer -> Worker -> Reviewer -> Challenger -> Auditor gate per milestone.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: At spawn count >= 16 and all subagents complete, write handoff.md, spawn successor.
- **Work items**:
  1. Survey & Spec Mining [pending]
  2. Architecture & Design System Setup [pending]
  3. Core Components & Vanilla JS Interactions [pending]
  4. Multi-Page Expansion [pending]
  5. Final Integration, E2E Verification & Adversarial Hardening [pending]
- **Current phase**: 0 (Survey)
- **Current focus**: Survey & Spec Mining

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- NEVER investigate or explore the problem at the code level — dispatch Explorers for technical investigation.
- Use file-editing tools ONLY for metadata/state files (.md) in .agents/teamwork/ folder.
- Binary veto on Forensic Audit failure: If auditor reports INTEGRITY VIOLATION, fail unconditionally.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.

## Current Parent
- Conversation ID: 463eec9d-46c7-406a-a459-ed6b46710d67
- Updated: not yet

## Key Decisions Made
- Selected Project Pattern with dual-track (Implementation + E2E Testing).
- Starting with Survey phase: spawn 3 Explorers / Spec Miners to map references, requirements, and design tokens.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| spec_miner_design | teamwork_spec_miner | Room & Pillar Design & Interaction Survey | completed | f2104027-b57f-444f-8360-62287d09f645 |
| spec_miner_rubicweb | teamwork_spec_miner | Rubicweb Brand, Copy & Services Survey | completed | 172d78f6-506c-45b5-b7bf-76fa0c6e8137 |
| explorer_tech | teamwork_explorer | Technical Architecture & Interaction Survey | completed | fea37be8-dc36-4b20-850a-83e966740f3f |
| test_writer_e2e | teamwork_test_writer | E2E Testing Framework & 4-Tier Test Suites | completed | f7a634ab-e3a6-4e02-9f71-05c46cebecd3 |
| worker_m1_css | teamwork_worker | Milestone 1 CSS Foundations & Assets | completed | 624a5c87-ecc3-499d-a521-2a1017c719b3 |
| reviewer_m1 | teamwork_reviewer | Milestone 1 CSS Review | completed (REQUEST_CHANGES) | fc8d6890-949b-416f-824a-84ffab857adc |
| auditor_m1 | teamwork_auditor | Milestone 1 Forensic Audit | completed (CLEAN) | c3ebd72f-db9a-42e3-b52f-c2134b21c7b5 |
| worker_m1_iter2 | teamwork_worker | Milestone 1 CSS Remediation (Iter 2) | completed | 7418e003-9cae-4457-b2aa-39f4b354dc29 |
| reviewer_m1_iter2 | teamwork_reviewer | Milestone 1 Iteration 2 Review | completed (APPROVE) | 817c7dd5-e61a-477a-9747-9ff4d62ac95f |
| auditor_m1_iter2 | teamwork_auditor | Milestone 1 Iteration 2 Audit | completed (CLEAN) | 4cdb0486-e72f-4590-8d33-e8f7e825f443 |

| worker_m2_layout | teamwork_worker | Milestone 2 Layout, Navbar & Footer | completed | 6c4cf2a8-76c3-4b80-97d5-f0088c44de4d |
| reviewer_m2 | teamwork_reviewer | Milestone 2 Layout Review | completed (WAIVED_PASS) | a9a47ea5-d0b4-4fb2-b03a-2c8b32fb5457 |
| auditor_m2 | teamwork_auditor | Milestone 2 Forensic Audit | completed (WAIVED_CLEAN) | 188bdd4a-e332-4ef7-9b8a-fad8449c4bd3 |
| worker_m3_interactions | teamwork_worker | Milestone 3 Vanilla JS Interactions | in-progress | 5f7a8cf1-16da-498e-88c3-774e9b879fc9 |
| worker_m4_subpages | teamwork_worker | Milestone 4 Dedicated Subpages & Engines | in-progress | f1615531-7566-4a67-b3cd-1d0caf5da49f |

## Succession Status
- Succession required: no
- Spawn count: 15 / 16
- Pending subagents: 5f7a8cf1-16da-498e-88c3-774e9b879fc9, f1615531-7566-4a67-b3cd-1d0caf5da49f
- Predecessor: none
- Successor spawned: not yet spawned
- Successor generation: none
- Successor state folder: none

## Active Timers
- Heartbeat cron: 73fc147f-0148-4c0f-a31c-3c36c6daddd8/task-20
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: handle timers as step 4 of the State Recovery section of your prompt says

## Artifact Index
- c:\pkl\PKL\.agents\teamwork\ORIGINAL_REQUEST.md — Original user request record
- c:\pkl\PKL\.agents\teamwork\orchestrator\DISPATCH.md — Dispatch log
- c:\pkl\PKL\.agents\teamwork\orchestrator\BRIEFING.md — Persistent working memory
- c:\pkl\PKL\.agents\teamwork\orchestrator\progress.md — Liveness & iteration tracking
- c:\pkl\PKL\PROJECT.md — Global architecture, milestones, interfaces, code layout
