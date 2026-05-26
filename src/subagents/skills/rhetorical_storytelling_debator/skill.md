# Skill: `rhetorical_storytelling_debator`

Centralized rhetorical storytelling and narrative template engine. Enables competitor agents to apply emotional hooks (pathos) and target analogies to grab the moderator's focus.

---

## 🎭 Dynamic Stance-Aware Behavior

This skill automatically shifts narrative overlays based on active stances:
- **Affirmative (Pro)**: Formulates encouraging analogies and constructive benefit-based future visions.
- **Negative (Con)**: Formulates precautionary warnings and cost/risk analogies exposing structural fragility.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "text_draft": { "type": "string", "minLength": 10 }
  },
  "required": ["text_draft"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "original_draft_length": { "type": "integer" },
    "rhetorical_speech": { "type": "string" },
    "has_rhetoric_hook": { "type": "boolean" }
  },
  "required": ["stance", "original_draft_length", "rhetorical_speech", "has_rhetoric_hook"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = RhetoricalStorytellingDebator;`.
