# Skill: `grade_justification_report_judge`

Centralized report compiler and grading scorecard builder. Compiles turn statistics, factual check results, logical infractions, and tie-broken scores into a single, beautifully detailed markdown scorecard report conforming strictly to the contract schema.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "debate_subject": { "type": "string" },
    "total_rounds": { "type": "integer", "minimum": 10 },
    "winner_id": { "type": "string", "enum": ["pro_agent", "con_agent"] },
    "final_pro_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
    "final_con_score": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
    "margin_differential": { "type": "number" },
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
    "pro_verified_ratio": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "con_verified_ratio": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "pro_overlap_index": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "con_overlap_index": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
  },
  "required": [
    "debate_subject",
    "total_rounds",
    "winner_id",
    "final_pro_score",
    "final_con_score",
    "margin_differential",
    "fallacy_infractions_log",
    "pro_verified_ratio",
    "con_verified_ratio",
    "pro_overlap_index",
    "con_overlap_index"
  ]
}
```

### 2. Output Contract (`OutputSchema`)
Strictly conforms to `RefereeReportSchema`:
```json
{
  "type": "object",
  "properties": {
    "debate_subject": { "type": "string" },
    "total_rounds": { "type": "integer" },
    "verdict": {
      "type": "object",
      "properties": {
        "winner_id": { "type": "string", "enum": ["pro_agent", "con_agent"] },
        "final_pro_score": { "type": "number" },
        "final_con_score": { "type": "number" },
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
        "pro_verified_ratio": { "type": "number" },
        "con_verified_ratio": { "type": "number" }
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
  "required": [
    "debate_subject",
    "total_rounds",
    "verdict",
    "fallacy_infractions_log",
    "fact_check_ratios",
    "clash_responsiveness_score",
    "grading_justification"
  ]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js using string interpolation/markdown formatting with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = GradeJustificationReportJudge;`.
