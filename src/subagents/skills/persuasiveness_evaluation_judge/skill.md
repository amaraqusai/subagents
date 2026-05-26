# Skill: `persuasiveness_evaluation_judge`

Centralized persuasiveness evaluator and grading scorecard calculator. Enables the referee agent to mathematically compute weighted competitor performance scores based on responsiveness, factuality, and rhetorical elements, and then deduct liveness/fallacy penalties to yield a final grade.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "clash_index": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "factuality_ratio": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "rhetoric_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
    "penalty_deductibles": { "type": "number", "minimum": 0.0 }
  },
  "required": ["competitor_id", "clash_index", "factuality_ratio", "rhetoric_score", "penalty_deductibles"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "weighted_clash_score": { "type": "number" },
    "weighted_citation_score": { "type": "number" },
    "weighted_rhetoric_score": { "type": "number" },
    "applied_penalties": { "type": "number" },
    "final_performance_grade": { "type": "number" },
    "evaluation_report": { "type": "string" }
  },
  "required": [
    "competitor_id",
    "weighted_clash_score",
    "weighted_citation_score",
    "weighted_rhetoric_score",
    "applied_penalties",
    "final_performance_grade",
    "evaluation_report"
  ]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js using weighted grading mechanics with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = PersuasivenessEvaluationJudge;`.
