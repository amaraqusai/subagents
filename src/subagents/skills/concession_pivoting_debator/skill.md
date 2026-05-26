# Skill: `concession_pivoting_debator`

Centralized concession and rhetorical pivoting engine. Enables competitor agents to gracefully concede secondary claims while pivot-linking back to core structural winning arguments.

---

## 🎭 Dynamic Stance-Aware Behavior

This skill automatically modifies rhetorical transitions based on competitor roles:
- **Affirmative (Pro)**: Concedes minor operational setup friction or integration latencies, immediately pivoting to demonstrate how this is the precise precursor enabling long-term scale.
- **Negative (Con)**: Concedes superficial frontend usability benefits, immediately pivoting to show how they are completely irrelevant when weighed against total system failure.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "attack_claim": { "type": "string", "minLength": 5 }
  },
  "required": ["attack_claim"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "incoming_attack_ref": { "type": "string" },
    "conceded_element": { "type": "string" },
    "pivot_speech": { "type": "string" },
    "pivoted_target": { "type": "string" },
    "pivot_report": { "type": "string" }
  },
  "required": ["stance", "incoming_attack_ref", "conceded_element", "pivot_speech", "pivoted_target", "pivot_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = ConcessionPivotingDebator;`.
