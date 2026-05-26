# Referee Judge Agent Task Tracker (TODO List)

## 1. Release Phases & Milestone Plan

| Phase | Milestone | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | M1.1 | Establish Referee Judge specifications document (PRD) | Completed ✅ |
| **Phase 1** | M1.2 | Define technical design plan and C4 blueprints frameworks | Completed ✅ |
| **Phase 1** | M1.3 | Deploy dedicated Referee task tracking matrix (TODO) | Completed ✅ |
| **Phase 2** | M2.1 | Implement central turn dialogue orchestrator loops state-machine | Completed ✅ |
| **Phase 3** | M3.1 | Implement timeout watchdogs keep-alives and backpressure limiters | Completed ✅ |
| **Phase 4** | M4.1 | Implement real-time fact checkers, fallacy linters and clash trackers | Completed ✅ |
| **Phase 5** | M5.1 | Implement grading scorecard evaluators and float tie-breakers | Completed ✅ |
| **Phase 6** | M6.1 | Verify 10-ping debate simulations under >85% statement coverage | Completed ✅ |

---

## 2. Definition of Done (DoD) per Task

To mark any target Referee moderation or analytical capability as "Completed", the following criteria must be satisfied without exception:

1. **Bilingual Specs**: A valid descriptive markdown specification file named `skill.md` must exist in the designated skill folder outlining inputs/outputs JSON schemas.
2. **Implementation Script**: A valid Python execution script named `<skill_name>.py` must exist in the package namespace directory `src/homework_2/skills/<skill_name>/`.
3. **Complexity Constraints**: The python execution script must contain **less than 150 lines of code** (excluding standard inline JSON configuration schemas) (Section 3.2).
4. **Clean Import Structure**: The skill class must be formally registered and exported natively via `src/homework_2/skills/__init__.py`, completely free of any sys path hacks.
5. **Liveness Verification (Section 8.6)**: Audited and verified to run within insulated multiprocess thread shims under active keep-alive watchdog timing tracking.
6. **Draw Prevention (Section 8.3 point 6)**: Resolves scorecard rating evaluations decisively, ensuring the single winner float metric is absolute (no draw results allowed).
7. **Ruff Lints & Coverage**: Exited cleanly via `ruff check` (0 errors) and validated under automated pytest coverage to sit above the **85% statement coverage threshold**.

---

## 3. Detailed Tasks Matrix

### Phase 1: Specifications & Designs
- [x] **Grader Spec (PRD)**: Author standard [docs/judge_prd.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/docs/judge_prd.md) mapping input, moderator loop, and tie-breakers. *(Assigned: AI)*
- [x] **Technical Blueprint (PLAN)**: Author standard [docs/judge_plan.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/docs/judge_plan.md) mapping thread pools and ADRs. *(Assigned: AI)*
- [x] **Referee Task Tracker (TODO)**: Deploy standard [docs/judge_todo.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/docs/judge_todo.md). *(Assigned: AI)*

---

### Phase 2: Moderation Loop Core
- [x] **Dialogue Turn Orchestrator (`dialogue_orchestration_judge`)**:
  - Spec file: [src/homework_2/skills/dialogue_orchestration_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/skills/dialogue_orchestration_judge/skill.md)
  - Code file: [src/homework_2/skills/dialogue_orchestration_judge/dialogue_orchestration_judge.py](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/skills/dialogue_orchestration_judge/dialogue_orchestration_judge.py)
  - *Task*: Build the central alternating sequence loop routing payloads exclusively through parent boundaries (`Child -> Judge -> Child`).
- [x] **Turn Validation Envelope Checkers**:
  - *Task*: Code local validation checks verifying competitor inputs map natively to JSON contracts.

---

### Phase 3: Moderation Watchdogs & Security Gateways
- [x] **Liveness Watchdog timer (`watchdog_liveness_monitor_judge`)**:
  - Spec file: [src/homework_2/skills/watchdog_liveness_monitor_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/skills/watchdog_liveness_monitor_judge/skill.md)
  - Code file: [src/homework_2/skills/watchdog_liveness_monitor_judge/watchdog_liveness_monitor_judge.py](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/skills/watchdog_liveness_monitor_judge/watchdog_liveness_monitor_judge.py)
  - *Task*: Code concurrent threads monitor resetting competitor runs on delay boundaries (5s), applying ratings penalties, and skipped turns on timeouts.
- [x] **Rate & Token Auditor (`backpressure_budget_limit_judge`)**:
  - Spec file: [src/homework_2/skills/backpressure_budget_limit_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/skills/backpressure_budget_limit_judge/skill.md)
  - Code file: [src/homework_2/skills/backpressure_budget_limit_judge/backpressure_budget_limit_judge.py](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/skills/backpressure_budget_limit_judge/backpressure_budget_limit_judge.py)
  - *Task*: Enforce dynamic progressive sleep delays when token quota usage passes 80% and 90% milestones.
- [x] **Controversy Turn Interrupter (`cross_examination_trigger_judge`)**:
  - Spec file: [src/homework_2/skills/cross_examination_trigger_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/skills/cross_examination_trigger_judge/skill.md)
  - Code file: [src/homework_2/skills/cross_examination_trigger_judge/cross_examination_trigger_judge.py](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/skills/cross_examination_trigger_judge/cross_examination_trigger_judge.py)
  - *Task*: Code regex phrasing matchers detecting controversial statements, temporarily halting regular turns transitions for Socratic cross-exams.
- [x] **Socratic Prompt Generator (`socratic_prompt_generator_judge`)**:
  - Spec file: [src/homework_2/skills/socratic_prompt_generator_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/skills/socratic_prompt_generator_judge/skill.md)
  - Code file: [src/homework_2/skills/socratic_prompt_generator_judge/socratic_prompt_generator_judge.py](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/skills/socratic_prompt_generator_judge/socratic_prompt_generator_judge.py)
  - *Task*: Compile customized challenge queries targeted at specific milestone turns.

---

### Phase 4: Real-time Quality Checker
- [x] **Empirical Fact Checker (`empirical_fact_checking_judge`)**:
  - Spec file: [src/homework_2/skills/empirical_fact_checking_judge/skill.md](file:///src/homework_2/skills/empirical_fact_checking_judge/skill.md)
  - Code file: [src/homework_2/skills/empirical_fact_checking_judge/empirical_fact_checking_judge.py](file:///src/homework_2/skills/empirical_fact_checking_judge/empirical_fact_checking_judge.py)
  - *Task*: Cross-check competitor assertions against local caches to calculate factuality indexes.
- [x] **Logical Fallacy Detector (`logical_fallacy_detection_judge`)**:
  - Spec file: [src/homework_2/skills/logical_fallacy_detection_judge/skill.md](file:///src/homework_2/skills/logical_fallacy_detection_judge/skill.md)
  - Code file: [src/homework_2/skills/logical_fallacy_detection_judge/logical_fallacy_detection_judge.py](file:///src/homework_2/skills/logical_fallacy_detection_judge/logical_fallacy_detection_judge.py)
  - *Task*: Code regex parser detecting circular logic and ad hominem phrasing.
- [x] **Fallacy Penalty Weighting (`fallacy_weighting_matrix_judge`)**:
  - Spec file: [src/homework_2/skills/fallacy_weighting_matrix_judge/skill.md](file:///src/homework_2/skills/fallacy_weighting_matrix_judge/skill.md)
  - Code file: [src/homework_2/skills/fallacy_weighting_matrix_judge/fallacy_weighting_matrix_judge.py](file:///src/homework_2/skills/fallacy_weighting_matrix_judge/fallacy_weighting_matrix_judge.py)
  - *Task*: Compile penalty score deductibles maps based on infraction severity.
- [x] **Clash Map Overlap Tracker (`clash_map_tracker_judge`)**:
  - Spec file: [src/homework_2/skills/clash_map_tracker_judge/skill.md](file:///src/homework_2/skills/clash_map_tracker_judge/skill.md)
  - Code file: [src/homework_2/skills/clash_map_tracker_judge/clash_map_tracker_judge.py](file:///src/homework_2/skills/clash_map_tracker_judge/clash_map_tracker_judge.py)
  - *Task*: Build graph overlap index trackers verifying conversational overlap ratios.
- [x] **Closing Speech Auditor (`closing_summary_auditor_judge`)**:
  - Spec file: [src/homework_2/skills/closing_summary_auditor_judge/skill.md](file:///src/homework_2/skills/closing_summary_auditor_judge/skill.md)
  - Code file: [src/homework_2/skills/closing_summary_auditor_judge/closing_summary_auditor_judge.py](file:///src/homework_2/skills/closing_summary_auditor_judge/closing_summary_auditor_judge.py)
  - *Task*: Audit final round statements to block late argument injections.

---

### Phase 5: Scorecard Decisions & Verdict Mechanics
- [x] **Grader Bias Self-Auditor (`bias_self_audit_judge`)**:
  - Spec file: [src/homework_2/skills/bias_self_audit_judge/skill.md](file:///src/homework_2/skills/bias_self_audit_judge/skill.md)
  - Code file: [src/homework_2/skills/bias_self_audit_judge/bias_self_audit_judge.py](file:///src/homework_2/skills/bias_self_audit_judge/bias_self_audit_judge.py)
  - *Task*: Code rating average drift normalizer algorithm to balance subjective bias.
- [x] **Persuasiveness Evaluator (`persuasiveness_evaluation_judge`)**:
  - Spec file: [src/homework_2/skills/persuasiveness_evaluation_judge/skill.md](file:///src/homework_2/skills/persuasiveness_evaluation_judge/skill.md)
  - Code file: [src/homework_2/skills/persuasiveness_evaluation_judge/persuasiveness_evaluation_judge.py](file:///src/homework_2/skills/persuasiveness_evaluation_judge/persuasiveness_evaluation_judge.py)
  - *Task*: Code grading scorecard weighted calculations mapping out 0-100 scales.
- [x] **Tie-Breaker Resolver (`tie_breaker_resolution_judge`)**:
  - Spec file: [src/homework_2/skills/tie_breaker_resolution_judge/skill.md](file:///src/homework_2/skills/tie_breaker_resolution_judge/skill.md)
  - Code file: [src/homework_2/skills/tie_breaker_resolution_judge/tie_breaker_resolution_judge.py](file:///src/homework_2/skills/tie_breaker_resolution_judge/tie_breaker_resolution_judge.py)
  - *Task*: Enforce float vector differentiations (citation verification > clash index) on identical raw scores to resolve absolute winner.
- [x] **Scorecard Markdown justification Report (`grade_justification_report_judge`)**:
  - Spec file: [src/homework_2/skills/grade_justification_report_judge/skill.md](file:///src/homework_2/skills/grade_justification_report_judge/skill.md)
  - Code file: [src/homework_2/skills/grade_justification_report_judge/grade_justification_report_judge.py](file:///src/homework_2/skills/grade_justification_report_judge/grade_justification_report_judge.py)
  - *Task*: Compile all turn statistics, truthfulness logs and fallacy deductions into final report.

---

### Phase 6: Integration Quality & Liveness Verification
- [x] **automated liveness verification tests**:
  - *Task*: Write pytest simulated 10-ping debate loops verifying all 14 moderator skills pass with >85% statement coverage.
