# Skill: `clash_map_tracker_judge`

Centralized direct responsiveness checker. Enables the referee agent to audit competitor statements for direct vocabulary overlap ratios, checking for structural clash.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "speech_text": { "type": "string", "minLength": 10 },
    "opponent_speech_text": { "type": "string", "minLength": 10 }
  },
  "required": ["competitor_id", "speech_text", "opponent_speech_text"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "overlap_index": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "matched_keywords": { "type": "array", "items": { "type": "string" } },
    "responsiveness_report": { "type": "string" }
  },
  "required": ["competitor_id", "overlap_index", "matched_keywords", "responsiveness_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js using robust set intersections and regex helpers with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = ClashMapTrackerJudge;`.
