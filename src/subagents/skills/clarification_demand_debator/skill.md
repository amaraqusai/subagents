# Skill: `clarification_demand_debator`

Centralized linguistic ambiguity interrogation and definition demand engine. Enables competitor agents to identify vague or shifting concepts in opponent claims and generate targeted Socratic queries.

---

## 🎭 Dynamic Stance-Aware Behavior

This skill automatically alters strategic Socratic queries based on active stances:
- **Affirmative (Pro)**: Forces the opponent to define concrete parameters and quantitative boundaries for their vague warnings (e.g. "risks", "costs"), exposing defensive retreat.
- **Negative (Con)**: Interrogates constructive benefit headers (e.g. "efficiency", "automation") to expose shifting goalposts and unbacked optimistic claims.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_statement": { "type": "string", "minLength": 10 }
  },
  "required": ["competitor_statement"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "target_key": { "type": "string" },
    "has_target_matched": { "type": "boolean" },
    "demand_query": { "type": "string" },
    "tactical_objective": { "type": "string" },
    "demand_report": { "type": "string" }
  },
  "required": ["stance", "target_key", "has_target_matched", "demand_query", "tactical_objective", "demand_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js with zero external package dependencies.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = ClarificationDemandDebator;`.
