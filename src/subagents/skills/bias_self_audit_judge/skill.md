# Skill: `bias_self_audit_judge`

Centralized subjective bias checker and score normalizer. Enables the referee agent to audit and mathematically balance raw scores to prevent confirmation grading drifts.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "raw_pro_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
    "raw_con_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 }
  },
  "required": ["raw_pro_score", "raw_con_score"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "is_bias_skew_flagged": { "type": "boolean" },
    "raw_pro_score": { "type": "number" },
    "raw_con_score": { "type": "number" },
    "normalized_pro_score": { "type": "number" },
    "normalized_con_score": { "type": "number" },
    "correction_applied": { "type": "number" },
    "bias_audit_report": { "type": "string" }
  },
  "required": ["is_bias_skew_flagged", "raw_pro_score", "raw_con_score", "normalized_pro_score", "normalized_con_score", "correction_applied", "bias_audit_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js using normalized mathematical correction logic with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = BiasSelfAuditJudge;`.
