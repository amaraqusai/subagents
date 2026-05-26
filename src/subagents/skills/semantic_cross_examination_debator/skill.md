# Skill: `semantic_cross_examination_debator`

Centralized semantic reframing and vocabulary parsing module. Enables competitor agents to deconstruct, absorb, or reframe conversational terminology used by the opponent.

---

## 🎭 Dynamic Stance-Aware Behavior

This skill dynamically redirects vocabulary parsing based on active stances:
- **Affirmative (Pro)**: Semantic Absorption. Audits opponent warnings (e.g., costs, risks) and re-labels them locally as constructive components (e.g., strategic investments, managed variables).
- **Negative (Con)**: Semantic Deconstruction. Audits competitor constructs (e.g., efficiencies, automation) and deconstructs them locally as systemic weaknesses (e.g., brittle optimization, controlled volumes).

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "opponent_text": { "type": "string", "minLength": 10 }
  },
  "required": ["opponent_text"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "original_speech": { "type": "string" },
    "reframed_speech": { "type": "string" },
    "reframing_audit_log": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "opponent_keyword": { "type": "string" },
          "reframed_as": { "type": "string" }
        },
        "required": ["opponent_keyword", "reframed_as"]
      }
    },
    "total_reframes_count": { "type": "integer" },
    "reframing_report": { "type": "string" }
  },
  "required": ["stance", "original_speech", "reframed_speech", "reframing_audit_log", "total_reframes_count", "reframing_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = SemanticCrossExaminationDebator;`.
