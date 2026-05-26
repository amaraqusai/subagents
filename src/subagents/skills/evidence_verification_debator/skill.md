# Skill: `evidence_verification_debator`

Centralized local facts and citation pre-verification module. Enables competitor agents to cross-verify claims against structured research registries before publication.

---

## 🎭 Dynamic Stance-Aware Behavior

This skill automatically alters verification checks based on competitor roles:
- **Affirmative (Pro)**: Audits Pro's own statements. Verifies claims are factual and fully backed, generating warning triggers on low-integrity citation sources before payload transmission.
- **Negative (Con)**: Audits Pro competitor's statements. Systematically checks affirmative claims against alternative caches to expose logic leaks and empirical errors.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "citation": { "type": "string", "minLength": 5 },
    "verified_cache": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "keyword": { "type": "string" },
          "truthfulness_score": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
          "fact_check_report": { "type": "string" }
        },
        "required": ["keyword", "truthfulness_score", "fact_check_report"]
      }
    }
  },
  "required": ["citation", "verified_cache"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "citation_evaluated": { "type": "string" },
    "is_verified": { "type": "boolean" },
    "truthfulness_index": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "verification_status_report": { "type": "string" }
  },
  "required": ["stance", "citation_evaluated", "is_verified", "truthfulness_index", "verification_status_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Zero external package dependencies.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = EvidenceVerificationDebator;`.
