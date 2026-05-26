# Skill: `time_allocation_strategy_debator`

Centralized turn pacing and text density strategy engine. Enables competitor agents to dynamically adjust argument length and word count allocations based on active round metrics.

---

## 🎭 Dynamic Stance-Aware Behavior

This skill automatically modifies argument pacing based on competitor roles:
- **Affirmative (Pro)**: Constructive scaling. Limits early turns to higher caps (800 words) to construct primary pillars, and shifts later turns to lower caps (400 words) to focus exclusively on defending impacts.
- **Negative (Con)**: Adversarial saturation. Limits early turns to lower caps (300 words) using brief Socratic queries to save context memory, and releases comprehensive counter-arguments in later turns (700 words).

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "current_round": { "type": "integer", "minimum": 1, "maximum": 10 },
    "total_rounds": { "type": "integer", "minimum": 10 }
  },
  "required": ["current_round"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "stance": { "type": "string", "enum": ["affirmative", "negative"] },
    "current_round": { "type": "integer" },
    "total_rounds": { "type": "integer" },
    "word_count_cap": { "type": "integer" },
    "tactical_focus": { "type": "string" },
    "strategy_report": { "type": "string" }
  },
  "required": ["stance", "current_round", "total_rounds", "word_count_cap", "tactical_focus", "strategy_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = TimeAllocationStrategyDebator;`.
