# Skill: `argument_structure_debator`

Centralized argument and speech compilation engine. Enables competitor agents to structure raw claims into formal debate templates.

---

## 🎭 Dynamic Stance-Aware Behavior

This skill automatically shifts formatting frameworks based on competitor roles:
- **Affirmative (Pro)**: Formulates "Constructive Pillars", formatting logic to focus on affirmative impacts, welfare expansion, and vision scaling.
- **Negative (Con)**: Formulates "Defensive Counter-Wedges", formatting logic to focus on counter-claims, cost constraints, and negative impact scaling.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "claim": { "type": "string", "minLength": 5 },
    "premises": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
    "evidence": { "type": "array", "items": { "type": "string" } },
    "impacts": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["claim", "premises"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "claim_extracted": { "type": "string" },
    "speech_markdown": { "type": "string" },
    "structural_nodes_count": { "type": "integer" }
  },
  "required": ["stance", "claim_extracted", "speech_markdown", "structural_nodes_count"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js with zero external packaging imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = ArgumentStructureDebator;`.
