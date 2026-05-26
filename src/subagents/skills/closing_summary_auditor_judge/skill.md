# Skill: `closing_summary_auditor_judge`

Centralized closing summary and new logic auditor. Enables the referee agent to scan final summaries ensuring competitors do not introduce new arguments not raised in previous rounds.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "closing_speech_text": { "type": "string", "minLength": 10 }
  },
  "required": ["competitor_id", "closing_speech_text"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "has_new_arguments": { "type": "boolean" },
    "new_terms_spotted": { "type": "array", "items": { "type": "string" } },
    "total_new_terms": { "type": "integer" },
    "audit_verdict_report": { "type": "string" }
  },
  "required": ["competitor_id", "has_new_arguments", "new_terms_spotted", "total_new_terms", "audit_verdict_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js using robust set operations with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = ClosingSummaryAuditorJudge;`.
