# Skill: `closing_impact_summary_debator`

Centralized closing speech formulation and impact weighting engine. Enables competitor agents to compile powerful closing remarks weighting the central points of clash.

---

## 🎭 Dynamic Stance-Aware Behavior

This skill automatically modifies concluding remarks and weights based on active stances:
- **Affirmative (Pro)**: Constructive impact scaling, formatting remarks to prioritize affirmative welfare benefits, resource optimizations, and positive scaling metrics.
- **Negative (Con)**: Precautionary risk prioritizing, formatting remarks to prioritize structural risks, liability costs, and backend failure cascades.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "primary_wins": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
    "competitor_leaks": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["primary_wins", "competitor_leaks"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "closing_markdown": { "type": "string" },
    "clash_voter_points_count": { "type": "integer" },
    "closing_report": { "type": "string" }
  },
  "required": ["stance", "closing_markdown", "clash_voter_points_count", "closing_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = ClosingImpactSummaryDebator;`.
