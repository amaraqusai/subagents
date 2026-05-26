# Product Requirements Document (PRD) - Referee Judge Agent

## 1. Context & Overview (סקירת הפרויקט והקשר)
This Product Requirements Document (PRD) details the specifications for the **Referee/Judge Agent (אבא שופט)**. The Judge is the central moderation and decision engine driving **Exercise 02 (AI Agent Debate)** under the supervision of the unified SDK client framework (Section 4.1).

The Judge takes an initial query topic input (e.g. `"ronaldo is better than messi"`), instantiates two adversarial child competitor subagents—**Pro (בעד)** and **Con (נגד)**—and moderates an alternating dialogue loop. Upon reaching a configurable turn limit, the Judge parses conversational data to enforce an absolute, draw-free rating decision.

---

## 2. Problem Statement (תיאור בעיית המשתמש)
Multi-agent adversarial setups frequently crash, fail rate-limit margins, or fall into logical stalemate drifts:
1. **Linguistic Drift**: Competitor subagents naturally drift to polite agreements, dissolving the debate stance. The Judge must enforce absolute polarization.
2. **Turn Routing Integrity**: Child competitor subagents cannot communicate directly (`pro_agent <-> con_agent` sockets are blocked). All dialogue must run `Child -> Judge -> Child` to allow real-time audits.
3. **Empirical Violations**: Competitors easily exaggerate data metrics or quote hallucinated references to win, demanding independent fact-checking controls.
4. **Grading Stalemate**: Standard evaluations resolve to simple 50/50 ties. The guidelines strictly prohibit draws: **"Draws are prohibited. The judge must decide a winner and justify the rating"** (Section 8.3 point 6).

---

## 3. Objectives & KPIs (יעדים מדידים ומדדי KPI)

- **Primary Goal**: Moderate, verify, and resolve a structurally compliant, adversarial multi-agent debate to award an absolute winner grading scorecard.
- **Key Performance Indicators (KPIs)**:
  - **Verdict Resolution Success**: **100%** (Strictly **0% draws** allowed).
  - **Turn Flow Sanitization**: **100%** of competitor turns routed through the Judge's gateway.
  - **Liveness Resilience**: **0%** system hangs on competitor timeouts (monitored via Watchdog keep-alives).
  - **API Budget Conservation**: **>50%** token budget saved via local pre-verification caching.
  - **Fact Audit Coverage**: **100%** empirical claims extracted and checked against verification queries.

---

## 4. Requirements (דרישות)

### 4.1 Functional Requirements (דרישות פונקציונליות)

#### 4.1.1 Input Parameter Interfaces
The Judge agent must accept the following initialization payload:
- **`debate_subject`** *(String, Required)*: The central debate target topic (e.g., `"ronaldo is better than messi"`).
- **`total_rounds_limit`** *(Integer, Optional)*: The configurable number of turns each subagent must execute before closing (Default: `10` rounds per competitor).
- **`pro_agent_profile` & `con_agent_profile`** *(Object, Required)*: Behavioral context maps establishing competitor roles.
- **`rate_limit_budget`** *(Object, Required)*: Token, latency, and API quota bounds enforced per session.

#### 4.1.2 Moderation Loop & Turn Routing Boundary
The Judge is the exclusive routing gateway managing the state-machine flow of the debate:
1. **Debate Bootstrap**:
   - The SDK client invokes the Judge with the subject topic `"ronaldo is better than messi"`.
   - The Judge instantiates `pro_agent` (Affirmative stance) and `con_agent` (Opposing stance).
2. **Round 1 (Affirmative Opening)**:
   - The Judge prompts Pro: *"Debate Topic: 'ronaldo is better than messi'. Present your opening constructive argument."*
   - Pro uses standard `_debator` skills, compiles the constructive speech, and returns a JSON payload matching `TurnPayloadSchema`.
3. **Round 1 (Negative Clash Setup)**:
   - The Judge audits Pro's payload (checking schemas, running fact-checks and fallacy checks).
   - The Judge routes Pro's speech to Con: *"Your opponent asserted: '<Pro Speech>'. Generate targeted clashes refuting their constructive premises."*
   - Con compiles the counter-wedge speech, returning a matching JSON payload.
4. **Alternating Loop (Rounds 2 to 9)**:
   - The Judge audits Con's payload, then routes it back to Pro.
   - The loop runs in an alternating `Child A -> Judge -> Child B` sequence. Direct competitor-to-competitor routing is strictly blocked.
5. **Round 10 (Closing Remarks)**:
   - Upon reaching the configurable turn limit (e.g., Round 10), the Judge signals the closing phase.
   - Competitors utilize `closing_impact_summary_debator` to draft final summary statements.
   - The Judge audits the summaries to block the injection of new arguments.

#### 4.1.3 Verdict Scoring & Draw Prevention
1. **Scorecard Calculation**:
   - Compiles fact-check accuracy ratios, clash responsiveness overlap indexes, and fallacy infraction deductibles.
   - Computes a final performance score on a `0.0 to 100.0` floating-point scale for both subagents.
2. **Strict Winner Resolution (Tie-Breaker)**:
   - If total grading results in identical scores, the Judge applies float-point differentiation based on priority metrics (Citation Verification Index > Direct Clash Index) to force a decisive winner:
     - `Winner = pro_agent` OR `Winner = con_agent`.
     - *No Draws Allowed*.
3. **Grading Justification Report**:
   - Compiles full turn logs, fact check verification databases, and logical fallacy records into a comprehensive evaluation report matching `RefereeReportSchema`.

#### 4.1.4 Enforced Skills Isolation (הגבלת מיומנויות לשופט)
To maintain structural security, modularity, and programmatic safety, the Judge is strictly isolated from the competitors' runtime environments and is **exclusively restricted to utilizing the 14 designated moderator skills ending with the suffix `_judge`**:
1. **Orchestration & Security**:
   - `dialogue_orchestration_judge` (Turn state transitions).
   - `watchdog_liveness_monitor_judge` (Liveness checks).
   - `backpressure_budget_limit_judge` (Token budgets backpressure spacing).
   - `cross_examination_trigger_judge` (Controversial interrupters).
   - `socratic_prompt_generator_judge` (Socratic challenge prompts compiler).
2. **Quality Auditing & Fact Checks**:
   - `empirical_fact_checking_judge` (Factual integrity verifiers).
   - `logical_fallacy_detection_judge` (Logical loopholes linting).
   - `fallacy_weighting_matrix_judge` (fallacy penalties score deductibles).
   - `clash_map_tracker_judge` (direct overlap clash index maps).
   - `closing_summary_auditor_judge` (blocks final speech new arguments).
3. **Decision & Scorecards**:
   - `bias_self_audit_judge` (neutralizes confirmation bias).
   - `persuasiveness_evaluation_judge` (normalizes performance scoring).
   - `tie_breaker_resolution_judge` (forces absolute winner resolutions).
   - `grade_justification_report_judge` (scorecard markdown report compiler).

Bypassing this skills boundary or invoking any general shell tools, subagent commands, or competitor-specific dynamic `_debator` skills is strictly prohibited.

---

### 4.2 Non-Functional Requirements (דרישות לא-פונקציונליות)
- **High Concurrency & Thread-safety**: Subagents must run in concurrent threads under non-blocking pools, preventing race states on debate log databases.
- **Strict Size Limits**: The Judge engine files must contain **less than 150 lines of code** (excluding standard docstrings and JSON contract schemas).
- **Graceful Timeout Degradation**: If a competitor hangs, the Keep-alive Watchdog resets the thread, allowing the Judge to terminate the round and deduct points rather than crashing the system.

---

## 5. Scope & Constraints (הנחות, תלויות ומגבלות)
- **Assumptions**: Competitors maintain strict, polarized stances throughout the 10-ping cycle.
- **Dependencies**: The framework operates natively under Python `3.10+` tracking via the `uv` tool.
- **Out of Scope**: Real-time voice translation streams, multi-referee collaboration networks.

---

## 6. Roadmap & Milestones (ציר זמן ואבני דרך)
- [ ] **Milestone 1**: Deploy the full `docs/judge_prd.md` specification detailing turn flow.
- [ ] **Milestone 2**: Author specs card for the 5 Referee Moderation & Governance skills under `src/homework_2/skills/`.
- [ ] **Milestone 3**: Implement Python shims for Judge orchestration loops and timeout watchdogs.
- [ ] **Milestone 4**: Integrate logical fallacies weighting matrices and floating-point tie-breakers.
- [ ] **Milestone 5**: Execute simulated 10-ping debate test suites to verify draw-free verdicts.
