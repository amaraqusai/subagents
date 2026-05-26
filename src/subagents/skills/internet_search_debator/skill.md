# Skill: `internet_search_debator`

Centralized stance-aware search client wrapper. Enables competitor agents to query independent search caches and automatically filters findings based on debate polarization.

---

## 🎭 Dynamic Stance-Aware Behavior

This skill operates dynamically depending on the competitor's current debate role:
- **Affirmative (Pro)**: Filters query matches to target supporting facts, affirmative study validations, and benefit metrics.
- **Negative (Con)**: Filters query matches to target opposing counterarguments, systemic cost risks, and failures.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string", "minLength": 3 },
    "search_cache": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "content": { "type": "string" },
          "tags": { "type": "array", "items": { "type": "string" } },
          "source_url": { "type": "string", "format": "uri" }
        },
        "required": ["content", "tags"]
      }
    }
  },
  "required": ["query", "search_cache"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string" },
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "total_raw_matches": { "type": "integer" },
    "filtered_matches_count": { "type": "integer" },
    "findings": { "type": "array", "items": { "type": "string" } },
    "sources": { "type": "array", "items": { "type": "string", "format": "uri" } }
  },
  "required": ["query", "stance", "total_raw_matches", "filtered_matches_count", "findings", "sources"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Credentials and API credentials must never be embedded; load dynamically from environment parameters.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = InternetSearchDebator;`.
