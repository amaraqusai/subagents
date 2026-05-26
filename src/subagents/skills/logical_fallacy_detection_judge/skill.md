# Skill: `logical_fallacy_detection_judge`

Centralized logical fallacy detection linter. Enables the referee agent to parse competitor inputs using regex phrasing patterns to detect logical infractions in real-time.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "round_id": { "type": "integer" },
    "speech_text": { "type": "string", "minLength": 10 }
  },
  "required": ["competitor_id", "round_id", "speech_text"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "round_id": { "type": "integer" },
    "is_logically_unsafe": { "type": "boolean" },
    "detected_infractions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "fallacy_type": { "type": "string" },
          "occurrences_count": { "type": "integer" },
          "phrases_flagged": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["fallacy_type", "occurrences_count", "phrases_flagged"]
      }
    },
    "verdict_report": { "type": "string" }
  },
  "required": ["competitor_id", "round_id", "is_logically_unsafe", "detected_infractions", "verdict_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js using robust regex phrasings with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = LogicalFallacyDetectionJudge;`.
