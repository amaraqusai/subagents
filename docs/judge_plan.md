# Technical Architecture & Planning Document - Referee Judge Agent

## 1. System Architecture Blueprint (ארכיטקטורת המערכת)

This Technical Blueprint Plan specifies the systemic design and integration roadmap for the **Referee/Judge Agent (אבא שופט)**. Formulated by the Lead Architect and Designer, this plan maps how the 14 Moderator skills outlined in [docs/skills_prd.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/docs/skills_prd.md) are integrated into a robust concurrent orchestration framework.

The design relies on a decoupled, non-blocking moderation loop, isolated subagent execution runtimes, real-time quality auditing, and absolute, draw-free verdict scoring engines.

```mermaid
graph TD
    subgraph System Entry Boundary
        SDK["🧱 SDK Interface Wrapper<br>(Homework2SDK Client)"]
    end

    subgraph Central Moderation & Security Loop (Judge Agent)
        Loop["⚙️ Turn Orchestration Loop<br>(dialogue_orchestration_judge)"]
        Watch["🐕 Keep-Alive Watchdog Monitor<br>(watchdog_liveness_monitor_judge)"]
        Audit["🛡️ Gateway Rate & Token Auditor<br>(backpressure_budget_limit_judge)"]
        Trigger["🔄 Cross-Exam Turn Interrupter<br>(cross_examination_trigger_judge)"]
        Socratic["❓ Socratic Query Compiler<br>(socratic_prompt_generator_judge)"]
    end

    subgraph Real-Time Quality Auditing Layer
        Fact["🔍 Empirical Fact Checker<br>(empirical_fact_checking_judge)"]
        Fallacy["🚫 Fallacy Phrasing Linter<br>(logical_fallacy_detection_judge)"]
        Weight["📊 Fallacy Penalty Matrix<br>(fallacy_weighting_matrix_judge)"]
        Clash["🗺️ Conversational Overlap Tracker<br>(clash_map_tracker_judge)"]
        Summary["🚫 Closing Summary Auditor<br>(closing_summary_auditor_judge)"]
    end

    subgraph Performance Scorecard & Verdict Layer
        Scoring["⚖️ Persuasiveness Scoring Engine<br>(persuasiveness_evaluation_judge)"]
        Tie["🔨 Vector Tie-Breaker Resolver<br>(tie_breaker_resolution_judge)"]
        Report["📄 Scorecard Report Compiler<br>(grade_justification_report_judge)"]
    end

    subgraph Insulated Competitors Runtimes (Thread Pools)
        Pro["🗣️ Pro Subagent Thread"]
        Con["🗣️ Con Subagent Thread"]
    end

    SDK -->|Bootstraps debate session| Loop
    Loop -->|Enforces timeout lifespans| Watch
    Loop -->|Logs token budget quotas| Audit
    Loop -->|Triggers Socratic prompts| Socratic
    Loop -->|Controls sub-turn cross-exams| Trigger

    Loop -->|Routes Turn JSON payload| Pro
    Loop -->|Routes Turn JSON payload| Con

    Pro -->|Returns Turn JSON payload| Loop
    Con -->|Returns Turn JSON payload| Loop

    Loop -->|Extracts empirical claims| Fact
    Loop -->|Scans speech for fallacy phrases| Fallacy
    Fallacy -->|Maps penalty deductibles| Weight
    Loop -->|Tracks clash responsiveness| Clash
    Loop -->|Blocks closing round argument injects| Summary

    Loop -->|Invokes final analytical evaluation| Scoring
    Scoring -->|Resolves float differentiation winner| Tie
    Tie -->|Compiles final markdown scorecard| Report
    Report -->|Returns scorecard JSON to client| SDK
```

---

## 2. Structural Layer Descriptions (תכולה ארכיטקטונית)

### 2.1 The Central Orchestration & Turn Gateway (`dialogue_orchestration_judge`)
The Orchestrator Loop is the primary moderation gateway running in a secure, insulated background subprocess thread. It handles the alternating state-machine transition flow.
- **Strict Isolation**: Direct routing/sockets between child competitor agents is completely blocked. Turn payload transactions route exclusively through the Judge.
- **Payload Routing Contract**: Enforces strict JSON serialization contracts, checking incoming competitor messages against the validated JSON schema before routing them back to the opponent.

### 2.2 Watchdog & Security Lifespans (`watchdog_liveness_monitor_judge` & `backpressure_budget_limit_judge`)
To ensure system robustness and prevent crashes on subagent freeze states:
- **Watchdog keep-alives (Section 8.6)**: Implements a concurrent monitoring thread tracking subagent reply latencies. If a competitor hangs beyond the predefined timeout boundary (e.g. 5 seconds), the Watchdog terminates the subagent execution thread, applies a logical penalty to their debate scorecard, and instructs the loop to skip to the next round.
- **Quota & Token Auditor**: Real-time tracking log verifying token window consumption, memory budgets, and API call frequency indexes per session.

### 2.3 Real-Time Quality Auditing Layer
The Judge implements five automated checker engines to evaluate arguments:
- **Empirical Fact Checker (`empirical_fact_checking_judge`)**: Extracts empirical claims and figures, performing real-time validations against local caches or online indexes.
- **Logical Fallacy Detector & Weighting Matrix**: Employs regex phrasing matchers to locate fallacies in text drafts. On infraction matches, it queries the Penalty Matrix to dynamically deduct scores based on the severity of the fallacy (e.g., ad hominem carries high penalties).
- **Conversational Overlap Tracker (`clash_map_tracker_judge`)**: Compiles real-time overlap graphs tracing vocabulary and context links between turns. This guarantees competitor responsiveness and checks if agents are actually addressing earlier arguments.
- **Closing Summary Auditor (`closing_summary_auditor_judge`)**: Audits final summaries, ensuring no competitor injects "new arguments" in their closing statements.

### 2.4 Performance Scorecard & Verdict Layer (`tie_breaker_resolution_judge`)
- **Scoring Engine**: Normalizes the accumulated metrics (truthfulness ratios, clash responsiveness indexes, fallacy infractions, and rhetorical strengths) to compute a final performance scorecard on a `0.0 to 100.0` floating-point scale.
- **Strict Draw Prevention (Section 8.3 point 6)**: Ties are prohibited. If scores are equivalent, the Tie-Breaker Engine applies multi-vector float differentiation (Citation Truthfulness ratio weighting over Clash index weighting) to guarantee a single victor:
  - `Winner = pro_agent` OR `Winner = con_agent`.

### 2.5 Strict Skills Isolation and Execution Bounds (הגבלת מיומנויות לשופט)
The Judge agent is strictly decoupled from the competitors' runtime package namespaces. To guarantee strict architectural security, local sandboxing, and neutral evaluations, **the Referee's execution capabilities are limited exclusively to the 14 moderator skills ending with the suffix `_judge`**:
- *Moderation*: `dialogue_orchestration_judge`, `watchdog_liveness_monitor_judge`, `backpressure_budget_limit_judge`, `cross_examination_trigger_judge`, `socratic_prompt_generator_judge`.
- *Checking*: `empirical_fact_checking_judge`, `logical_fallacy_detection_judge`, `fallacy_weighting_matrix_judge`, `clash_map_tracker_judge`, `closing_summary_auditor_judge`.
- *Decisions*: `bias_self_audit_judge`, `persuasiveness_evaluation_judge`, `tie_breaker_resolution_judge`, `grade_justification_report_judge`.

Any attempts by the Judge subprocess to import, instantiate, or invoke competitor dynamic `_debator` packages or local OS shells will trigger a fatal system access boundary exception.

---

## 3. Architectural Decision Records (ADRs)

### ADR 01: Multi-threaded Insulated Subagent Thread Pools
- **Status**: Accepted
- **Context**: Executing subagents sequentially within the main orchestration thread runs the risk of a single subprocess freeze locking up the entire debate run, wasting token memory and causing cascading locks.
- **Decision**: Instantiate and drive competitor subagents in detached concurrent thread pools.
- **Consequence**: Secures absolute runtime insulation, permits clean subagent thread terminations on watchdog timeouts, and protects against concurrency memory corruption.

### ADR 02: Real-Time Fact Audits vs Post-Debate Scorecards
- **Status**: Accepted
- **Context**: Evaluating competitor factual accuracy only at the end of the 10-ping cycle prevents the opposing competitor from reacting to and exploiting the rival's false claims in real-time.
- **Decision**: Execute factual truthfulness verification in real-time at the end of every turn, injecting the truthfulness score into the JSON turn log payload before routing it to the opponent.
- **Consequence**: Enables active adversarial play, permitting Con to run semantic reframes and targeted rebuttals against un-backed Pro assertions.

### ADR 03: Float Vector Math Tie-Breaker
- **Status**: Accepted
- **Context**: Debate evaluations routinely resolve to 50/50 splits, which violates the strict draw prevention rule.
- **Decision**: Deploy an automated multi-vector floating-point resolution tracker based on priority sub-metrics weights.
- **Consequence**: Guarantees a clean final verdict without requiring manual referee intervention.

### ADR 04: Enforced Skills Segregation & Suffix Isolation
- **Status**: Accepted
- **Context**: Wasting token processing parameters or allowing the Moderator to import competitor-dynamic `_debator` scripts introduces code bloat and exposes the system to subjective self-grading loops.
- **Decision**: Insulate the Judge class, restricting its import and execution space strictly to the 14 skills ending with the suffix `_judge`.
- **Consequence**: Secures absolute modular boundary decoupling, guarantees grading neutrality, and blocks any malicious subagent logic escapes.

---

## 4. API Schemas & Contract Specification (Section 8.3 point 8)

The Judge Moderation Engine relies on two central JSON contracts:

### 4.1 Input Initiation Contract (`InitiationPayloadSchema`)
The entry payload accepted by the Judge agent:
```json
{
  "type": "object",
  "properties": {
    "debate_subject": { "type": "string", "minLength": 5 },
    "total_rounds_limit": { "type": "integer", "minimum": 10, "default": 10 },
    "pro_agent_profile": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "baseline_prompt": { "type": "string" }
      },
      "required": ["name", "baseline_prompt"]
    },
    "con_agent_profile": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "baseline_prompt": { "type": "string" }
      },
      "required": ["name", "baseline_prompt"]
    },
    "rate_limit_budget": {
      "type": "object",
      "properties": {
        "requests_per_minute": { "type": "integer" },
        "concurrent_max": { "type": "integer" }
      },
      "required": ["requests_per_minute", "concurrent_max"]
    }
  },
  "required": ["debate_subject", "pro_agent_profile", "con_agent_profile", "rate_limit_budget"]
}
```

### 4.2 Outgoing Turn Payload Routing Contract (`TurnRoutingSchema`)
The structured JSON routed by the Judge to target competitors:
```json
{
  "type": "object",
  "properties": {
    "session_id": { "type": "string" },
    "active_round": { "type": "integer" },
    "debate_subject": { "type": "string" },
    "target_opponent_speech": { "type": "string" },
    "opponent_source_citations": {
      "type": "array",
      "items": { "type": "string", "format": "uri" }
    },
    "opponent_truthfulness_index": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "turn_count_remaining": { "type": "integer" }
  },
  "required": ["session_id", "active_round", "debate_subject", "target_opponent_speech", "opponent_source_citations", "opponent_truthfulness_index", "turn_count_remaining"]
}
```
