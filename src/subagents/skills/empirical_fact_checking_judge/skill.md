# Skill: `empirical_fact_checking_judge`

Centralized empirical claims and citations verifier. Enables the referee agent to extract competitor assertions and cross-reference them against verified index registries.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "claims": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
    "citations": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["competitor_id", "claims"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "truthfulness_ratio": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "checked_claims_log": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "claim": { "type": "string" },
          "is_verified": { "type": "boolean" },
          "truthfulness_score": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
        },
        "required": ["claim", "is_verified", "truthfulness_score"]
      }
    },
    "fact_check_report": { "type": "string" }
  },
  "required": ["competitor_id", "truthfulness_ratio", "checked_claims_log", "fact_check_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js with zero external packaging dependencies.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = EmpiricalFactCheckingJudge;`.
