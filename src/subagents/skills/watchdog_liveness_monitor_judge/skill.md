# Skill: `watchdog_liveness_monitor_judge`

Centralized concurrent liveness watchdog monitor. Enables the referee agent to track competitor response delays and trigger thread recoveries to protect against platform freezes.

---

## 🐕 Keep-Alive Watchdog Monitor (Section 8.6)

The watchdog operates as a non-blocking execution monitor:
1. Tracks execution response delay limits.
2. If competitor invocation exceeds the target timeout boundary, the watchdog interrupts the execution and issues a penalty scorecard entry.
3. Restores turn execution loops, ensuring the platform degrades gracefully.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "timeout_threshold_seconds": { "type": "number", "minimum": 1.0, "default": 5.0 }
  },
  "required": ["competitor_id"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "competitor_id": { "type": "string" },
    "status": { "type": "string", "enum": ["success", "liveness_timeout_failure"] },
    "latency_seconds": { "type": "number" },
    "score_deduction": { "type": "number" },
    "error_report": { "type": "string" }
  },
  "required": ["competitor_id", "status"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Pure standard Node.js using standard event-loop mechanisms with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = WatchdogLivenessMonitorJudge;`.
