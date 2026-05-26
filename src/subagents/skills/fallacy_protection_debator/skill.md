# Skill: `fallacy_protection_debator`

Centralized local logical fallacy protection linter. Scans competitor drafts using robust regex phrasings to block self-inflicted logical loopholes.

---

## 🎭 Dynamic Stance-Aware Behavior

This skill automatically modifies linter warnings based on competitor roles:
- **Affirmative (Pro)**: Audits Pro's own statements. Blocks circular logic and slippery slope exaggerations, keeping constructive pillars structurally sound.
- **Negative (Con)**: Audits Con's own statements. Blocks ad hominem attacks and defensive strawman setups, keeping counter-rebuttals logically airtight.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "text": { "type": "string", "minLength": 10 }
  },
  "required": ["text"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "is_flagged_unsafe": { "type": "boolean" },
    "spotted_violations": {
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
    "fallacy_types_count": { "type": "integer" },
    "audit_verdict_report": { "type": "string" }
  },
  "required": ["stance", "is_flagged_unsafe", "spotted_violations", "fallacy_types_count", "audit_verdict_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Standard Node.js using regex engines.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = FallacyProtectionDebator;`.
