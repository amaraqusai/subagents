# Skill: `rebuttal_generator_debator`

Centralized clash and rebuttal engine. Enables competitor agents to dissect competitor arguments, locate logic leaks, and generate targeted counter-statements.

---

## 🎭 Dynamic Stance-Aware Behavior

This skill automatically alters logical clash tactics based on active stances:
- **Affirmative (Pro)**: Rebuts opposition counterarguments, defending positive pillars and demonstrating how risk variables are minor and outweighed.
- **Negative (Con)**: Attacks positive pillars, systematically auditing affirmative claims to expose systemic costs, failure cascades, and brittleness.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "opponent_claims": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
    "opponent_citations_count": { "type": "integer" }
  },
  "required": ["opponent_claims", "opponent_citations_count"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "incoming_clashes_count": { "type": "integer" },
    "generated_rebuttals": { "type": "array", "items": { "type": "string" } },
    "total_clash_points": { "type": "integer" },
    "rebuttal_report": { "type": "string" }
  },
  "required": ["stance", "incoming_clashes_count", "generated_rebuttals", "total_clash_points", "rebuttal_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js with zero external package dependencies.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = RebuttalGeneratorDebator;`.
