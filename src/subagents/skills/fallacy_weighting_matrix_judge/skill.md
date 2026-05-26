# Skill: `fallacy_weighting_matrix_judge`

Centralized logical fallacy penalty weighting linter. Enables the referee agent to map specific score deductions on competitor infractions based on severity levels.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "infractions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "fallacy_type": { "type": "string" },
          "occurrences_count": { "type": "integer", "minimum": 1 }
        },
        "required": ["fallacy_type", "occurrences_count"]
      }
    }
  },
  "required": ["competitor_id", "infractions"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "total_score_penalty": { "type": "number", "minimum": 0.0 },
    "deductions_breakdown": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "fallacy_type": { "type": "string" },
          "occurrences": { "type": "integer" },
          "penalty_multiplier": { "type": "number" },
          "total_deduction": { "type": "number" }
        },
        "required": ["fallacy_type", "occurrences", "penalty_multiplier", "total_deduction"]
      }
    },
    "penalty_report": { "type": "string" }
  },
  "required": ["competitor_id", "total_score_penalty", "deductions_breakdown", "penalty_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js using dynamic dictionary lookup models with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = FallacyWeightingMatrixJudge;`.
