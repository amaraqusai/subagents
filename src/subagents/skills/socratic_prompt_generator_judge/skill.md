# Skill: `socratic_prompt_generator_judge`

Centralized Socratic prompt compiler. Enables the referee agent to compile dynamic, stance-aware Socratic challenge questions at targeted milestones to pressure subagent positions.

---

## ❓ Socratic Prompt compiler

This skill operates during active turn setups:
1. Detects current round indexes and competitor stances.
2. Selects a targeted challenge question mapping to structural milestones (e.g. Pro constructive claims or Con defensive counters).
3. Formats questions in a formal Socratic Challenge wrapper to drive adversarial argumentation.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "target_competitor_id": { "type": "string", "enum": ["pro", "con"] },
    "active_round_id": { "type": "integer", "minimum": 1, "maximum": 10 }
  },
  "required": ["target_competitor_id", "active_round_id"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "target_competitor": { "type": "string", "enum": ["pro", "con"] },
    "debate_subject": { "type": "string" },
    "socratic_question": { "type": "string" },
    "compiled_socratic_prompt": { "type": "string" },
    "objective_log": { "type": "string" }
  },
  "required": ["target_competitor", "debate_subject", "socratic_question", "compiled_socratic_prompt", "objective_log"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js with zero external package dependencies.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = SocraticPromptGeneratorJudge;`.
