# Agent Debate Skills Task Tracker (TODO List)

## 1. Release Phases & Milestone Plan

| Phase | Milestone | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | M1.1 | Establish `src/subagents/skills/` directory layouts & gitkeep tags | Completed ✅ |
| **Phase 1** | M1.2 | Define Debate Skills PRD spec & bilingual C4 planning frames | Completed ✅ |
| **Phase 2** | M2.1 | Implement core debater search, structure & verification skills | Completed ✅ |
| **Phase 3** | M3.1 | Implement advanced debate rhetoric & strategic pivots skills | Completed ✅ |
| **Phase 4** | M4.1 | Implement referee loop, watchdog lifespans & socket security | Completed ✅ |
| **Phase 5** | M5.1 | Implement analytical checkers, fallacies weighting & tie-breakers | Completed ✅ |
| **Phase 6** | M6.1 | Deploy automated unit mock and full 10-ping debate test suites | Completed ✅ |

---

## 2. Definition of Done (DoD) per Skill Task

To mark any target agent capability block as "Completed", the following criteria must be satisfied without exception:

1. **Specification Document**: A valid markdown specification file named `skill.md` must exist in the skill folder describing parameters, inputs, outputs, and behaviors.
2. **Implementation Script**: A valid JavaScript execution script named `<skill_name>.js` must exist in the folder containing the core algorithm blocks.
3. **Complexity Constraints**: The javascript script must contain **less than 150 lines of code** (excluding standard docstrings and JSON configurations schemas) (Section 3.2).
4. **Bilingual Documentation**: All public classes, parameters, and return types must be fully documented using precise JSDoc comments (adapted for JS).
5. **Code Hygiene Verification**: Target files must execute through our tests with **0 errors or violations**.
6. **Token Protection & Cache**: The skill uses dynamic internal indexing or local pre-verifiers to prevent redundant network lookups, saving API execution budgets (Section 5.1).

---

## 3. Detailed Tasks Matrix

### Phase 1: Specifications & Base Frameworks
- [x] **Skills Directory Setup**: Create the [src/subagents/skills/](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/) tracking workspace. *(Assigned: AI)*
- [x] **Debate Product Spec**: Authors standard [docs/skills_prd.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/docs/skills_prd.md) mapping the 25 required skills. *(Assigned: AI)*
- [x] **Technical Blueprint Plan**: Deploy unified layered SDK architecture spec in [docs/skills_plan.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/docs/skills_plan.md). *(Assigned: AI)*

---

### Phase 2: Competitor Agent Foundations
- [x] **Internet Search Skill (`internet_search_debator`)**:
  - Spec file: [src/subagents/skills/internet_search_debator/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/internet_search_debator/skill.md)
  - Code file: [src/subagents/skills/internet_search_debator/internet_search_debator.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/internet_search_debator/internet_search_debator.js)
- [x] **Argument Structuring Skill (`argument_structure_debator`)**:
  - Spec file: [src/subagents/skills/argument_structure_debator/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/argument_structure_debator/skill.md)
  - Code file: [src/subagents/skills/argument_structure_debator/argument_structure_debator.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/argument_structure_debator/argument_structure_debator.js)
- [x] **Evidence Verification Skill (`evidence_verification_debator`)**:
  - Spec file: [src/subagents/skills/evidence_verification_debator/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/evidence_verification_debator/skill.md)
  - Code file: [src/subagents/skills/evidence_verification_debator/evidence_verification_debator.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/evidence_verification_debator/evidence_verification_debator.js)
- [x] **Logical Fallacy Protection Skill (`fallacy_protection_debator`)**:
  - Spec file: [src/subagents/skills/fallacy_protection_debator/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/fallacy_protection_debator/skill.md)
  - Code file: [src/subagents/skills/fallacy_protection_debator/fallacy_protection_debator.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/fallacy_protection_debator/fallacy_protection_debator.js)

---

### Phase 3: Adversarial Tactics & Pivot Strategies
- [x] **Rhetorical Storytelling Skill (`rhetorical_storytelling_debator`)**:
  - Spec file: [src/subagents/skills/rhetorical_storytelling_debator/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/rhetorical_storytelling_debator/skill.md)
  - Code file: [src/subagents/skills/rhetorical_storytelling_debator/rhetorical_storytelling_debator.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/rhetorical_storytelling_debator/rhetorical_storytelling_debator.js)
- [x] **Semantic Examination Skill (`semantic_cross_examination_debator`)**:
  - Spec file: [src/subagents/skills/semantic_cross_examination_debator/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/semantic_cross_examination_debator/skill.md)
  - Code file: [src/subagents/skills/semantic_cross_examination_debator/semantic_cross_examination_debator.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/semantic_cross_examination_debator/semantic_cross_examination_debator.js)
- [x] **Rebuttal Generator Skill (`rebuttal_generator_debator`)**:
  - Spec file: [src/subagents/skills/rebuttal_generator_debator/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/rebuttal_generator_debator/skill.md)
  - Code file: [src/subagents/skills/rebuttal_generator_debator/rebuttal_generator_debator.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/rebuttal_generator_debator/rebuttal_generator_debator.js)
- [x] **Time Allocation Strategy Skill (`time_allocation_strategy_debator`)**:
  - Spec file: [src/subagents/skills/time_allocation_strategy_debator/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/time_allocation_strategy_debator/skill.md)
  - Code file: [src/subagents/skills/time_allocation_strategy_debator/time_allocation_strategy_debator.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/time_allocation_strategy_debator/time_allocation_strategy_debator.js)
- [x] **Concession Pivoting Skill (`concession_pivoting_debator`)**:
  - Spec file: [src/subagents/skills/concession_pivoting_debator/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/concession_pivoting_debator/skill.md)
  - Code file: [src/subagents/skills/concession_pivoting_debator/concession_pivoting_debator.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/concession_pivoting_debator/concession_pivoting_debator.js)
- [x] **Clarification Demand Skill (`clarification_demand_debator`)**:
  - Spec file: [src/subagents/skills/clarification_demand_debator/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/clarification_demand_debator/skill.md)
  - Code file: [src/subagents/skills/clarification_demand_debator/clarification_demand_debator.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/clarification_demand_debator/clarification_demand_debator.js)
- [x] **Closing Impact Summary Skill (`closing_impact_summary_debator`)**:
  - Spec file: [src/subagents/skills/closing_impact_summary_debator/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/closing_impact_summary_debator/skill.md)
  - Code file: [src/subagents/skills/closing_impact_summary_debator/closing_impact_summary_debator.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/closing_impact_summary_debator/closing_impact_summary_debator.js)

---

### Phase 4: Moderator Governance & Security Lifespans
- [x] **Dialogue Orchestration Skill (`dialogue_orchestration_judge`)**:
  - Spec file: [src/subagents/skills/dialogue_orchestration_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/dialogue_orchestration_judge/skill.md)
  - Code file: [src/subagents/skills/dialogue_orchestration_judge/dialogue_orchestration_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/dialogue_orchestration_judge/dialogue_orchestration_judge.js)
- [x] **Watchdog Liveness Monitor Skill (`watchdog_liveness_monitor_judge`)**:
  - Spec file: [src/subagents/skills/watchdog_liveness_monitor_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/watchdog_liveness_monitor_judge/skill.md)
  - Code file: [src/subagents/skills/watchdog_liveness_monitor_judge/watchdog_liveness_monitor_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/watchdog_liveness_monitor_judge/watchdog_liveness_monitor_judge.js)
- [x] **Backpressure Budget Limit Skill (`backpressure_budget_limit_judge`)**:
  - Spec file: [src/subagents/skills/backpressure_budget_limit_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/backpressure_budget_limit_judge/skill.md)
  - Code file: [src/subagents/skills/backpressure_budget_limit_judge/backpressure_budget_limit_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/backpressure_budget_limit_judge/backpressure_budget_limit_judge.js)
- [x] **Cross-Examination Trigger Skill (`cross_examination_trigger_judge`)**:
  - Spec file: [src/subagents/skills/cross_examination_trigger_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/cross_examination_trigger_judge/skill.md)
  - Code file: [src/subagents/skills/cross_examination_trigger_judge/cross_examination_trigger_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/cross_examination_trigger_judge/cross_examination_trigger_judge.js)
- [x] **Socratic Prompt Generator Skill (`socratic_prompt_generator_judge`)**:
  - Spec file: [src/subagents/skills/socratic_prompt_generator_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/socratic_prompt_generator_judge/skill.md)
  - Code file: [src/subagents/skills/socratic_prompt_generator_judge/socratic_prompt_generator_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/socratic_prompt_generator_judge/socratic_prompt_generator_judge.js)

---

### Phase 5: Analytical Evaluation & Verdict Mechanics
- [x] **Empirical Fact Checking Skill (`empirical_fact_checking_judge`)**:
  - Spec file: [src/subagents/skills/empirical_fact_checking_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/empirical_fact_checking_judge/skill.md)
  - Code file: [src/subagents/skills/empirical_fact_checking_judge/empirical_fact_checking_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/empirical_fact_checking_judge/empirical_fact_checking_judge.js)
- [x] **Logical Fallacy Detection Skill (`logical_fallacy_detection_judge`)**:
  - Spec file: [src/subagents/skills/logical_fallacy_detection_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/logical_fallacy_detection_judge/skill.md)
  - Code file: [src/subagents/skills/logical_fallacy_detection_judge/logical_fallacy_detection_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/logical_fallacy_detection_judge/logical_fallacy_detection_judge.js)
- [x] **Fallacy Weighting Matrix Skill (`fallacy_weighting_matrix_judge`)**:
  - Spec file: [src/subagents/skills/fallacy_weighting_matrix_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/fallacy_weighting_matrix_judge/skill.md)
  - Code file: [src/subagents/skills/fallacy_weighting_matrix_judge/fallacy_weighting_matrix_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/fallacy_weighting_matrix_judge/fallacy_weighting_matrix_judge.js)
- [x] **Clash-Map Tracker Skill (`clash_map_tracker_judge`)**:
  - Spec file: [src/subagents/skills/clash_map_tracker_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/clash_map_tracker_judge/skill.md)
  - Code file: [src/subagents/skills/clash_map_tracker_judge/clash_map_tracker_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/clash_map_tracker_judge/clash_map_tracker_judge.js)
- [x] **Closing Summary Auditor Skill (`closing_summary_auditor_judge`)**:
  - Spec file: [src/subagents/skills/closing_summary_auditor_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/closing_summary_auditor_judge/skill.md)
  - Code file: [src/subagents/skills/closing_summary_auditor_judge/closing_summary_auditor_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/closing_summary_auditor_judge/closing_summary_auditor_judge.js)
- [x] **Bias Self-Audit Skill (`bias_self_audit_judge`)**:
  - Spec file: [src/subagents/skills/bias_self_audit_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/bias_self_audit_judge/skill.md)
  - Code file: [src/subagents/skills/bias_self_audit_judge/bias_self_audit_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/bias_self_audit_judge/bias_self_audit_judge.js)
- [x] **Persuasiveness Evaluation Skill (`persuasiveness_evaluation_judge`)**:
  - Spec file: [src/subagents/skills/persuasiveness_evaluation_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/persuasiveness_evaluation_judge/skill.md)
  - Code file: [src/subagents/skills/persuasiveness_evaluation_judge/persuasiveness_evaluation_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/persuasiveness_evaluation_judge/persuasiveness_evaluation_judge.js)
- [x] **Tie-Breaker Resolution Skill (`tie_breaker_resolution_judge`)**:
  - Spec file: [src/subagents/skills/tie_breaker_resolution_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/tie_breaker_resolution_judge/skill.md)
  - Code file: [src/subagents/skills/tie_breaker_resolution_judge/tie_breaker_resolution_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/tie_breaker_resolution_judge/tie_breaker_resolution_judge.js)
- [x] **Grade Justification Report Skill (`grade_justification_report_judge`)**:
  - Spec file: [src/subagents/skills/grade_justification_report_judge/skill.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/grade_justification_report_judge/skill.md)
  - Code file: [src/subagents/skills/grade_justification_report_judge/grade_justification_report_judge.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/src/subagents/skills/grade_justification_report_judge/grade_justification_report_judge.js)

---

### Phase 6: Release Quality & Full System Integration
- [x] **Test Fixtures Suite Setup**: Setup standard shared fixtures locally in [test/skills.test.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/test/skills.test.js). *(Assigned: AI)*
- [x] **Automated Skills Tests**: Execute full unit test coverage suite reaching a verified **100% passing** margin in [test/skills.test.js](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/subagents/test/skills.test.js). *(Assigned: AI)*
- [x] **Local Sandbox Demonstrations**: Execute sandbox integration validation scripts under private brain scratch space. *(Assigned: AI)*
