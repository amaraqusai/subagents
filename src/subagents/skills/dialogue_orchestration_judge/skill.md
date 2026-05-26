# Skill: `dialogue_orchestration_judge`

Centralized turn routing and debate moderation gateway. Manages alternating turn pacing loops, isolates competitor execution runtimes, and enforces communication routing contracts.

---

## 🛡️ Moderation turn routing Boundary

This skill serves as the sole moderator managing debate sequencing (Section 8.3 point 7):
1. Drives competitor turn transitions based on subjects inputs.
2. Direct competitor socket coupling is blocked. Every speech transaction payload passes through the parent loop to prevent drift consensus.
3. Audits incoming competitor payloads against validation schemas before routing envelopes to opponents.

---

## ⚙️ REST/JSON Schema Interfaces

### 1. Input Contract (`InputSchema`)
```json
{
  "type": "object",
  "properties": {
    "sender_id": { "type": "string" },
    "receiver_id": { "type": "string" },
    "incoming_payload": {
      "type": "object",
      "properties": {
        "speech_markdown": { "type": "string" },
        "sources": { "type": "array", "items": { "type": "string", "format": "uri" } },
        "truthfulness_index": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
      },
      "required": ["speech_markdown"]
    }
  },
  "required": ["sender_id", "receiver_id", "incoming_payload"]
}
```

### 2. Output Contract (`OutputSchema`)
```json
{
  "type": "object",
  "properties": {
    "session_id": { "type": "string" },
    "active_round": { "type": "integer" },
    "debate_subject": { "type": "string" },
    "target_opponent_speech": { "type": "string" },
    "opponent_source_citations": { "type": "array", "items": { "type": "string", "format": "uri" } },
    "opponent_truthfulness_index": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "turn_count_remaining": { "type": "integer" }
  },
  "required": ["session_id", "active_round", "debate_subject", "target_opponent_speech", "opponent_source_citations", "opponent_truthfulness_index", "turn_count_remaining"]
}
```

---

## 🚫 Constraints & Boundaries
- Code implementation must fit within the strict limit of **150 lines** of JavaScript source code (Section 3.2).
- Zero direct competitor-to-competitor routing leakages.
- Pure standard Node.js with zero external package imports.
- Built using CommonJS Node.js standard patterns, exported via `module.exports = DialogueOrchestrationJudge;`.
