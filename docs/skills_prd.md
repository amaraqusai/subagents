# Product Requirements Document (PRD) - Agent Debate Skills Plan

## 1. Context & Overview (סקירת הפרויקט והקשר)
This planning document outlines the specification for **Exercise 02 (AI Agent Debate)** under Dr. Yoram Segal's course, Lesson 05: "Agents, Subagents, Commands and Skills". 

The objective is to establish an autonomous AI debate platform composed of two competitor agents—**Pro (סוכן בעד)** and **Con (סוכן נגד)**—whose dialogue is dynamically moderated, evaluated, and resolved without stalemate by a centralized third agent, the **Father/Referee (אבא שופט)**.

Adhering strictly to the guidelines' layered SDK design boundaries (Section 4.1), this plan defines the required operational **Skills** each agent must possess. Following strict modular design principles, skills shared between the Pro and Con competitors are unified under the suffix **`_debator`** and operate dynamically depending on whether they support or oppose the target debate subject.

---

## 2. Problem Statement (תיאור בעיית המשתמש)
Building authentic multi-agent debate platforms presents critical engineering challenges:
1. **The Consensus Trap**: Without explicit stance polarization and structural reinforcement, Large Language Model (LLM) agents naturally drift toward agreement, dissolving the debate.
2. **Fact Verification & Hallucinations**: Competitors routinely hallucinate empirical claims or quote fake sources under pressure.
3. **Turn-Route Bypassing**: Direct connection between competitor agents is forbidden. All communication must run `Competitor A -> Judge -> Competitor B` (Section 8.3 point 7).
4. **Stalemate Indecision**: Human refactoring routinely results in grading ties. The guidelines strictly prohibit draws: **"Draws are prohibited. The judge must decide a winner and justify the rating"** (Section 8.3 point 6).
5. **Memory Bloat**: Repeated dialogue rounds (minimum 10 pings per side) easily exceed LLM context window limits, requiring local preprocessing, caching, and text compression skills.

---

## 3. Objectives & KPIs (יעדים מדידים ומדדי KPI)

- **Primary Goal**: Deploy a highly adversarial, objective, and structurally compliant autonomous multi-agent debate system.
- **Key Performance Indicators (KPIs)**:
  - **Debate Persistence**: Minimum **10 communication pings** per competitor (Section 8.3 point 3).
  - **Verdict Integrity**: **100%** resolution rate (Strictly **0% draws** allowed).
  - **Source Validation Accuracy**: **>95%** of claims backed by verified internet queries (Section 8.3 point 5).
  - **Execution Robustness**: **0%** system locks on agent timeouts (handled by Watchdog lifespans).
  - **Dialogue Sanitization**: **100%** compliance with standard JSON transmission schemas.

---

## 4. Requirements (דרישות)

### 4.1 Agent Skills Inventory (רשימת תונמויומ סוכנים)

To fulfill the "genuine contradiction" requirement and support analytical decision-making, the following **25 specific Skills** are allocated across the agents. Shared competitor capabilities are consolidated into unified `_debator` tools that adapt automatically to the active subject stance.

#### 4.1.1 Competitor Agents Skills (`_debator`)
These skills enable the debaters to synthesize facts, defend stances, dissect opposing logic, and persuade the referee. Each skill automatically determines whether it acts to prove (Affirmative) or disprove (Negative) the subject.

##### Stance Search & Validation
1. **`internet_search_debator`**
   - *Description*: Queries internet search APIs for external empirical references, news, and academic papers. 
     - *Affirmative (Pro)*: Applies search filters targeting supporting facts, statistics, and affirmative study validations.
     - *Negative (Con)*: Shifts search filters to extract counterarguments, risk portfolios, and opposing empirical data.
   - *Implementation*: Local search client filtering API results based on active player stance.
2. **`evidence_verification_debator`**
   - *Description*: Pre-verifies citations, statistics, and local quotes to prevent LLM hallucinations.
     - *Affirmative (Pro)*: Audits the constructive evidence set locally, confirming citation credibility before release.
     - *Negative (Con)*: Cross-checks opponent claims against alternative index caches to identify statistical skew.
   - *Implementation*: Text parser matching citation hashes against verified databases.

##### Argumentation & Persuasion Engine
3. **`argument_structure_debator`**
   - *Description*: Formulates arguments using standardized structural frames (Claim, Premise, Evidence, Impact) to optimize persuasion.
     - *Affirmative (Pro)*: Employs constructive modeling to build strong, unified support pillars.
     - *Negative (Con)*: Employs counter-claim modeling to construct targeted wedges against positive premises.
   - *Implementation*: Markdown script parsing LLM drafts, injecting structural headers.
4. **`rhetorical_storytelling_debator`**
   - *Description*: Crafts persuasive narrative loops and emotional hooks (pathos) to capture the judge's focus.
     - *Affirmative (Pro)*: Focuses on inspiring vision-building scenarios and positive future impacts.
     - *Negative (Con)*: Shifts to cautionary cost-focused storytelling, highlighting negative side-effects and hidden risks.
   - *Implementation*: Local prompting template applying rhetorical overlays on raw engine statements.
5. **`semantic_cross_examination_debator`**
   - *Description*: Analyzes and pivots on specific word choices, analogies, and semantic frames used by the opponent.
     - *Affirmative (Pro)*: Incorporates competitor vocabulary into the affirmative frame to show constructive compatibility.
     - *Negative (Con)*: Deconstructs competitor vocabulary to expose loaded terms, logical leaks, or bias assumptions.
   - *Implementation*: NLP parser identifying metaphorical keywords and returning reframing options.

##### Strategic Clash & Defense
6. **`rebuttal_generator_debator`**
   - *Description*: Dissects the opponent's previous JSON payload, targeting key logical vulnerabilities and weak citations.
     - *Affirmative (Pro)*: Rebuts opposition claims, focusing on rebuilding and reinforcing the constructive model.
     - *Negative (Con)*: Generates aggressive lines of clash, systematically eroding the affirmative model's feasibility.
   - *Implementation*: Comparison parser identifying clashing node IDs in Turn logs.
7. **`fallacy_protection_debator`**
   - *Description*: Automatically audits local drafts to block self-inflicted logical fallacies (strawman, ad hominem, confirmation bias).
     - *Affirmative (Pro)*: Keeps affirmative constructive arguments logically sound and robust.
     - *Negative (Con)*: Keeps defensive counter-rebuttals tight and free of logical gaps.
   - *Implementation*: Regex linter comparing outgoing sentences against fallacy patterns.
8. **`time_allocation_strategy_debator`**
   - *Description*: Manages argument pacing and information density based on the remaining turn counter.
     - *Affirmative (Pro)*: Front-loads core constructive points during early pings, using mid-turns for impact defense.
     - *Negative (Con)*: Reserves detailed line-by-line rebuttals for peak rounds to overwhelm the Pro model's defense.
   - *Implementation*: Counter-tracking state auditor optimizing text output length limits dynamically.
9. **`concession_pivoting_debator`**
   - *Description*: Gracefully concedes minor, un-winnable points while immediately pivot-linking back to primary core arguments.
     - *Affirmative (Pro)*: Concedes minor trade-offs while proving they are vastly outweighed by affirmative impacts.
     - *Negative (Con)*: Concedes trivial positive points while proving they are structurally irrelevant to the core flaws.
   - *Implementation*: Transition prompt map directing LLM generation on local concessions.
10. **`clarification_demand_debator`**
    - *Description*: Identifies and interrogates vague or shifting definitions in the competitor's statements.
      - *Affirmative (Pro)*: Forces the opponent to define vague negative boundaries, exposing defensive retreat.
      - *Negative (Con)*: Exposes shifting definitions and moving goalposts in the constructive affirmative setup.
    - *Implementation*: Linguistic scanner triggering custom question nodes on high-abstraction terms.

##### Closing & Impact
11. **`closing_impact_summary_debator`**
    - *Description*: Crafts a powerful closing speech, weighting the debate's central points of clash for the final decision.
      - *Affirmative (Pro)*: Weights constructive outcomes as the overriding victory metric for the debate.
      - *Negative (Con)*: Weights risks, logical failures, and structural costs as the decisive metrics.
    - *Implementation*: Markdown template formatting final summary impact reports.

---

#### 4.1.2 Judge/Referee Agent Skills (`_judge`)
These skills enable the referee to orchestrate the turn flow, enforce communication limits, verify facts, detect fallacies, and deliver a tie-free justified grading decision.

##### Moderation, Security & Liveness
12. **`dialogue_orchestration_judge`**
    - *Description*: Manages debate sequences, calling competitors iteratively, enforcing message schemas, and routing inputs (`Child -> Judge -> Child`).
    - *Implementation*: Central Python loop driving the state-machine and mapping Turn JSON structures.
13. **`watchdog_liveness_monitor_judge`**
    - *Description*: Implements keep-alive monitors (Section 8.6), auditing child response delays, and gracefully recovering/terminating on freeze states.
    - *Implementation*: Multiprocessing timer thread raising timeouts on response bottlenecks.
14. **`backpressure_budget_limit_judge`**
    - *Description*: Tracks token consumption, latency metrics, and API quotas for each session, triggering throttle/backpressure steps when limits are approached.
    - *Implementation*: Integration with the central RateLimit Config Manager.
15. **`cross_examination_trigger_judge`**
    - *Description*: Temporarily pauses the standard turn order when a competitor makes highly conflicting empirical statements, starting a brief cross-examination sub-phase.
    - *Implementation*: Sub-turn state-controller interrupting regular loops.
16. **`socratic_prompt_generator_judge`**
    - *Description*: Generates dynamic Socratic questions at debate milestones to challenge competitors and expose hidden assumptions.
    - *Implementation*: Prompt compiler selecting contextual question nodes based on current clash points.

##### Quality Auditing & Fact Checking
17. **`empirical_fact_checking_judge`**
    - *Description*: Extracts empirical claims and citations from competitor inputs, checking them against independent internet search queries.
    - *Implementation*: Local Google Search integration checking source validity and returning a truthfulness index.
18. **`logical_fallacy_detection_judge`**
    - *Description*: Scans competitor inputs to spot logical fallacies (strawman, ad hominem, circular reasoning) to apply penalties.
    - *Implementation*: Regex linter scanning for known fallacy phrasing patterns.
19. **`fallacy_weighting_matrix_judge`**
    - *Description*: Classifies and weights logical fallacy severity to calculate dynamic grade deductions (e.g. ad hominem carries a higher penalty than a minor slip-of-tongue).
    - *Implementation*: Scoring database returning deduction variables based on linter logs.
20. **`clash_map_tracker_judge`**
    - *Description*: Maps active points of clash to verify if debaters are actually addressing previous arguments or talking in parallel (responsiveness check).
    - *Implementation*: Graph node compiler tracking conversational overlap ratios between turns.
21. **`closing_summary_auditor_judge`**
    - *Description*: Audits final closing speeches to ensure no competitor introduces "new arguments" that weren't raised in previous rounds.
    - *Implementation*: Token matching script comparing closing round nouns against history data.

##### Evaluation & Verdict
22. **`bias_self_audit_judge`**
    - *Description*: Analyzes and adjusts the judge's own internal score vectors to filter out positive/negative confirmation bias before making a final decision.
    - *Implementation*: Mathematical normalization algorithm checking grading history to neutralize subjective drifts.
23. **`persuasiveness_evaluation_judge`**
    - *Description*: Evaluates structural argumentation, clash responsiveness, citation quality, and rhetorical strength to calculate final performance indices.
    - *Implementation*: Weighted matrix matching log files against criteria parameters (0-100 scale).
24. **`tie_breaker_resolution_judge`**
    - *Description*: Audits final calculations to force a strict winner, ensuring the "no draws allowed" rule is strictly upheld.
    - *Implementation*: Math processor using float value differentiation to guarantee a non-tie score.
25. **`grade_justification_report_judge`**
    - *Description*: Compiles turn logs, fact-checking ratios, fallacy records, and clash matrices into a comprehensive markdown report.
    - *Implementation*: Report compiler formatting final evaluation stats.

---

### 4.2 Non-Functional Requirements (דרישות לא-פונקציונליות)
- **High Concurrency & Thread-safety (Section 15)**: The orchestration loop must run each subagent process in a concurrent, non-blocking thread to prevent race conditions on shared memory logs.
- **Strict Size Limits (Section 3.2)**: Every skill code file must contain **less than 150 lines of Python code** (excluding standard inline JSON schemas).
- **Communication Standards (Section 8.3 point 8)**: Standardized structured exchange via strict, checked JSON schemas.

---

## 5. Scope & Constraints (הנחות, תלויות ומגבלות)
- **Assumptions**: Competitors are locked in absolute polarization (no agreement/folding permitted).
- **Dependencies**: Operates under standard `Python 3.10+` environments managed by the `uv` tool.
- **Out of Scope**: Audio voice debate translation, real-time web UI visual styling rendering.

---

## 6. Roadmap & Milestones (ציר זמן ואבני דרך)
- [ ] **Milestone 1**: Deploy the full `docs/skills_plan.md` plan matching project PRD formats.
- [ ] **Milestone 2**: Create matching subdirectories under the newly established [src/homework_2/skills/](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/skills/) folder.
- [ ] **Milestone 3**: Implement individual `.skill.md` definitions for the 25 defined skills.
- [ ] **Milestone 4**: Deploy the Python/Regex background hooks executing modular fact validation.
- [ ] **Milestone 5**: Integrate all shims into the central `Homework2SDK` to verify full 10-ping debate cycles.
