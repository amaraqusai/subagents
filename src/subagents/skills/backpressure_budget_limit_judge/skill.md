# Skill: `backpressure_budget_limit_judge`

Centralized token budget and rate limit backpressure manager. Enables the referee agent to monitor session token consumption and enforce progressive throttle delays on reaching quota thresholds.

---

## 🛡️ Gateway Rate & Budget Auditor

This skill manages resource parameters dynamically during execution:
1. Audits total accumulated token consumption.
2. Monitors request frequency speeds against sliding 60-second windows.
3. If usage exceeds critical milestones (80% and 90%), it injects progressive latency spacer delays to manage API budgets securely.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "turn_token_usage": { "type": "integer", "minimum": 0 }
  },
  "required": ["turn_token_usage"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "total_tokens_used": { "type": "integer" },
    "quota_utilization_ratio": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "rate_utilization_ratio": { "type": "number", "minimum": 0.0 },
    "backpressure_delay_applied": { "type": "number" },
    "quota_status_report": { "type": "string" }
  },
  "required": ["total_tokens_used", "quota_utilization_ratio", "rate_utilization_ratio", "backpressure_delay_applied", "quota_status_report"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js using standard event-loop mechanisms with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = BackpressureBudgetLimitJudge;`.
