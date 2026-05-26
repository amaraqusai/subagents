# Skill: `tie_breaker_resolution_judge`

Centralized mathematical tie-breaker engine and absolute winner resolver. Evaluates performance scorecard metrics to prevent stalemate draws and guarantees a decisive, non-draw victory.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "pro_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
    "con_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
    "pro_fact_ratio": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "con_fact_ratio": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "pro_clash_index": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "con_clash_index": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "pro_fallacies_count": { "type": "integer", "minimum": 0 },
    "con_fallacies_count": { "type": "integer", "minimum": 0 }
  },
  "required": [
    "pro_score",
    "con_score",
    "pro_fact_ratio",
    "con_fact_ratio",
    "pro_clash_index",
    "con_clash_index",
    "pro_fallacies_count",
    "con_fallacies_count"
  ]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "winner_id": { "type": "string", "enum": ["pro_agent", "con_agent"] },
    "final_pro_score": { "type": "number" },
    "final_con_score": { "type": "number" },
    "tie_broken": { "type": "boolean" },
    "tie_breaker_applied": { "type": "string" },
    "margin_differential": { "type": "number" },
    "justification": { "type": "string" }
  },
  "required": [
    "winner_id",
    "final_pro_score",
    "final_con_score",
    "tie_broken",
    "tie_breaker_applied",
    "margin_differential",
    "justification"
  ]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js using multi-vector mathematical differentiation with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = TieBreakerResolutionJudge;`.
