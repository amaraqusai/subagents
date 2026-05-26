# Technical Architecture & Planning Document - Multi-Agent Debate System

## 1. System Architecture Blueprint (ארכיטקטורת המערכת)

This architecture blueprint specifies the technical execution plan for **Exercise 02 (AI Agent Debate)**. The system is engineered around a decoupled **Layered SDK Interface** (Section 4.1), driving a highly structured, moderated, and adversarial multi-agent interaction.

The moderation loop, fact audits, and communication constraints operate in a secure centralized boundary driven by the Referee Agent, preventing direct client-competitor coupling.

```mermaid
graph TD
    subgraph Client Application Layer
        CLI["💻 command_line_interface"]
        Test["🧪 automated_test_suite"]
    end

    subgraph Unified SDK Layer
        SDK["🧱 Homework2SDK Client Wrapper<br>(Unified Entry Point)"]
    end

    subgraph Moderation & Governance Layer (Referee Agent)
        Orch["⚙️ Dialogue Orchestrator Loop<br>(dialogue_orchestration_judge)"]
        Watch["🐕 Watchdog Liveness Monitor<br>(watchdog_liveness_monitor_judge)"]
        Audit["🛡️ Gateway Rate & Budget Auditor<br>(backpressure_budget_limit_judge)"]
        Verdict["⚖️ Decision & Scorecard Engine<br>(persuasiveness_evaluation_judge)"]
        Tie["🔨 Tie-Breaker Mathematical Resolver<br>(tie_breaker_resolution_judge)"]
    end

    subgraph Structural Verification (Referee Skills)
        Fact["🔍 Empirical Fact Checker<br>(empirical_fact_checking_judge)"]
        Fallacy["🚫 Fallacy Linter & Weighting<br>(logical_fallacy_detection_judge)"]
        Clash["🗺️ Clash-Map direct overlap tracker<br>(clash_map_tracker_judge)"]
        Summary["🚫 Closing Summary Auditor<br>(closing_summary_auditor_judge)"]
        Socratic["❓ Socratic Prompt compiler<br>(socratic_prompt_generator_judge)"]
    end

    subgraph Competitor Layer (Pro & Con Agents)
        Deb1["🗣️ Pro Competitor Agent<br>(Active: Affirmative Stance)"]
        Deb2["🗣️ Con Competitor Agent<br>(Active: Opposing Stance)"]
    end

    subgraph Stance-Aware Competitor Skills Block
        Search["🌐 Stance-filtered Web Search<br>(internet_search_debator)"]
        Verify["🛡️ Citations Pre-verifier<br>(evidence_verification_debator)"]
        Rhetoric["🎭 Rhetorical narrative compiler<br>(rhetorical_storytelling_debator)"]
        Linter["🚫 Logical fallacy protection<br>(fallacy_protection_debator)"]
        Rebut["⚔️ Targeted Rebuttal generator<br>(rebuttal_generator_debator)"]
        Pacing["⏳ Time allocation strategist<br>(time_allocation_strategy_debator)"]
        Pivot["🔄 Concession Pivot Linker<br>(concession_pivoting_debator)"]
    end

    Client Application Layer -->|Calls ONLY| SDK
    SDK -->|Bootstraps debate session| Orch
    
    Orch -->|Audits child delays & lifespans| Watch
    Orch -->|Enforces RateLimit budgets & quotas| Audit
    Orch -->|Prompts competitor turns via Socratic| Socratic
    
    Orch -->|Routes JSON Turn payload| Deb1
    Orch -->|Routes JSON Turn payload| Deb2
    
    Deb1 -->|Loads stance-aware skills| Search
    Deb1 -->|Loads stance-aware skills| Verify
    Deb1 -->|Loads stance-aware skills| Rhetoric
    Deb1 -->|Loads stance-aware skills| Linter
    Deb1 -->|Loads stance-aware skills| Rebut
    Deb1 -->|Loads stance-aware skills| Pacing
    
    Deb2 -->|Loads stance-aware skills| Search
    Deb2 -->|Loads stance-aware skills| Verify
    Deb2 -->|Loads stance-aware skills| Rhetoric
    Deb2 -->|Loads stance-aware skills| Linter
    Deb2 -->|Loads stance-aware skills| Rebut
    Deb2 -->|Loads stance-aware skills| Pacing

    Deb1 -->|Returns JSON Turn payload| Orch
    Deb2 -->|Returns JSON Turn payload| Orch

    Orch -->|Extracts competitor claims| Fact
    Orch -->|Scans inputs for logical fallacies| Fallacy
    Orch -->|Maps points of clash| Clash
    Orch -->|Blocks final round arguments injection| Summary

    Orch -->|Calculates final scoring metrics| Verdict
    Verdict -->|Enforces single absolute winner| Tie
```

---

## 2. Structural Layer Descriptions (תכולה ארכיטקטונית)

This technical specification guides the development and integration of the 25 operational agent skills mapped in [docs/skills_prd.md](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/docs/skills_prd.md).

### 2.1 Unified SDK Layer (Section 4.1)
All external modules (command-line scripts, test suites, frontends) boot and monitor debates exclusively through [src/homework_2/sdk/sdk.py](file:///Users/amirmt/Desktop/ME/Me/MSC-ComputerScience/2025-B/agent%20AI/hw2/Homework_2/src/homework_2/sdk/sdk.py). The SDK layer completely decouples competitor instances, turn-routing loops, subprocess signals, and socket connections from the external caller, providing a single diagnostic interface.

### 2.2 Decoupled Stance-Aware Competitor Layer (Section 16)
To satisfy modularity and memory footprint requirements under pyenv environments, competitors are constructed as stance-neutral instances. Instead of running separate code libraries, Pro and Con competitor agents utilize the exact same **`_debator`** class blocks.
At runtime, the orchestrator injects stance parameters (Affirmative vs. Negative) into each agent. The `_debator` skills dynamically adapt:
- **Web Query Filtering**: `internet_search_debator` automatically switches search query scopes (targeting supporting facts for Pro, or vulnerabilities/counterarguments for Con).
- **Rhetorical Compilers**: `rhetorical_storytelling_debator` shifts tone templates between positive, vision-building hooks and negative, risk-exposure warnings.
- **Strategic Reframing**: `semantic_cross_examination_debator` dynamically parses opponent payloads to either adopt the competitor's metaphors (Pro constructive compatibility) or deconstruct them to expose bias (Con).

### 2.3 Referee Moderation & Governance Layer (Sections 5 & 8)
The **`_judge`** orchestrator maintains strict execution parameters to keep debates clean, verified, and active:
- **Insulated Loop Routing**: Competitors are executed within isolated threads. Sockets or memory spaces between debaters are completely detached. All dialogue flows under parent supervision: `Child A -> Judge -> Child B`.
- **Factual & Fallacy Audits**: The judge extracts claims in real-time, calling `empirical_fact_checking_judge` against independent web search buffers, and runs `logical_fallacy_detection_judge` to penalize bad reasoning.
- **Direct Responsiveness Metrics**: `clash_map_tracker_judge` generates graph matrices monitoring linguistic overlap between turns. This validates that competitors are actually responding directly to arguments rather than speaking in parallel.
- **Absolute Tie Prevention**: If total metrics result in equivalent ratings, `tie_breaker_resolution_judge` applies floating-point differentiations to force a decisive, non-draw victory.

---

## 3. Architectural Decision Records (ADRs)

### ADR 01: Unified `_debator` Skill Interface vs Stance-Coupled Submodules
- **Status**: Accepted
- **Context**: Creating specialized, separate Pro and Con competitor classes duplicates the code footprint, increases compilation overhead, and violates the DRY (Don't Repeat Yourself) principle.
- **Decision**: Standardize all competitor abilities into unified `_debator` modules. The active stance is bound at runtime, enabling skills to shift logic dynamically.
- **Consequence**: Code duplication reduced by **50%**, ensuring high maintenance and modular consistency, and easing unified automated test suite integration.

### ADR 02: Centralized Loop Routing vs Peer-to-Peer Agent Sockets
- **Status**: Accepted
- **Context**: Dr. Yoram Segal's framework strictly requires a non-draw, moderate dialogue where one agent speaks and the other listens, avoiding direct connections between children.
- **Decision**: Route all JSON turn transactions exclusively through the parent Referee loop.
- **Consequence**: Enables real-time factual checking, fallacy monitoring, token usage logging, and liveness watchdog resets without introducing logic overhead into competitor agents.

### ADR 03: Multi-Dimensional Floating-Point Tie-Breaker Engine
- **Status**: Accepted
- **Context**: Competitor performance ratings frequently resolve to equivalent integer grades, causing stalemate draw events which are strictly forbidden by Section 8.3 point 6.
- **Decision**: Deploy a multi-vector float rating parser tracking responsiveness index ratios, empirical citation scores, and fallacy penalties.
- **Consequence**: Forces a clean final decision, supplies detailed mathematical justification reports, and eliminates stalemates without manual intervention.

---

## 4. API Schemas & Contract Specification (Section 8.3 point 8)

To enforce communication hygiene and enable structured turn tracking, all dialogue must conform to strict JSON schemas.

### 4.1 Competitor Turn Contract (`TurnPayloadSchema`)
Outgoing competitor JSON blocks must map to the following schema:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TurnPayloadSchema",
  "type": "object",
  "properties": {
    "round_id": { "type": "integer", "minimum": 1, "maximum": 10 },
    "competitor_id": { "type": "string", "enum": ["pro_agent", "con_agent"] },
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "speech": { "type": "string", "maxLength": 1000 },
    "evidence_citations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "source_url": { "type": "string", "format": "uri" },
          "extracted_claim": { "type": "string" }
        },
        "required": ["source_url", "extracted_claim"]
      }
    },
    "rebuttal_target_id": { "type": "integer" }
  },
  "required": ["round_id", "competitor_id", "stance", "speech", "evidence_citations"]
}
```

### 4.2 Referee Final Scorecard Contract (`RefereeReportSchema`)
The final debate grading diagnostic report must map to the following schema:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "RefereeReportSchema",
  "type": "object",
  "properties": {
    "debate_subject": { "type": "string" },
    "total_rounds": { "type": "integer", "minimum": 10 },
    "verdict": {
      "type": "object",
      "properties": {
        "winner_id": { "type": "string", "enum": ["pro_agent", "con_agent"] },
        "final_pro_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
        "final_con_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
        "margin_differential": { "type": "number" }
      },
      "required": ["winner_id", "final_pro_score", "final_con_score", "margin_differential"]
    },
    "fallacy_infractions_log": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "round_id": { "type": "integer" },
          "competitor_id": { "type": "string" },
          "fallacy_type": { "type": "string" },
          "deduction_penalty": { "type": "number" }
        },
        "required": ["round_id", "competitor_id", "fallacy_type", "deduction_penalty"]
      }
    },
    "fact_check_ratios": {
      "type": "object",
      "properties": {
        "pro_verified_ratio": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "con_verified_ratio": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
      },
      "required": ["pro_verified_ratio", "con_verified_ratio"]
    },
    "clash_responsiveness_score": {
      "type": "object",
      "properties": {
        "pro_overlap_index": { "type": "number" },
        "con_overlap_index": { "type": "number" }
      },
      "required": ["pro_overlap_index", "con_overlap_index"]
    },
    "grading_justification": { "type": "string" }
  },
  "required": ["debate_subject", "total_rounds", "verdict", "fallacy_infractions_log", "fact_check_ratios", "clash_responsiveness_score", "grading_justification"]
}
```
