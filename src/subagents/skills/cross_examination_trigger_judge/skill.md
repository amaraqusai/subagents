# Skill: `cross_examination_trigger_judge`

Centralized turn interrupter and cross-examination trigger manager. Enables the referee agent to identify controversial competitor phrasing and temporarily pause debate sequences to demand structural definitions.

---

## 🔄 Cross-Exam Turn Interrupter

This skill manages loop scheduling boundaries:
1. Audits competitor statements for targeted controversial phrasing.
2. If alert parameters match, it interrupts dialogue turn advance, pausing regular loop transitions.
3. Compiles targeted Socratic clarification prompts to enforce factual debate.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "speech_text": { "type": "string", "minLength": 10 }
  },
  "required": ["speech_text"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "is_trigger_activated": { "type": "boolean" },
    "matched_alert_token": { "type": "string" },
    "interruption_prompt": { "type": "string" },
    "tactical_target": { "type": "string" },
    "audit_report": { "type": "string" }
  },
  "required": ["is_trigger_activated", "matched_alert_token", "interruption_prompt", "tactical_target", "audit_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = CrossExaminationTriggerJudge;`.
