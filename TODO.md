# 📋 GOAT Debate System — Full Illustrated Roadmap & TODO

> This document maps **every component** of the GOAT Debate Agentic System from scratch.
> Every completed item is backed by **a code proof reference**.
> Every pending item has a clear description of **what must be built and why**.

---

## 🗺️ System Architecture (Big Picture)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ENTRY POINTS                           │
│                                                                     │
│   Terminal CLI Menu (debate-cli.js)   Discord Bot (index.js)        │
│           │                                   │                     │
│           └──────────────┬────────────────────┘                     │
│                          ▼                                          │
│              ┌─────────────────────┐                               │
│              │   REFEREE (JUDGE)   │  ← Central Message Hub        │
│              │  referee.md prompt  │                               │
│              │  Gemini LLM model   │                               │
│              └──────┬──────┬───────┘                               │
│                     │      │                                        │
│          ┌──────────┘      └──────────┐                            │
│          ▼                            ▼                             │
│  ┌───────────────┐          ┌───────────────┐                      │
│  │  Ronaldo Fan  │          │  Messi Fan    │                      │
│  │ (Child Agent) │          │ (Child Agent) │                      │
│  │ + Google      │          │ + Google      │                      │
│  │   Search      │          │   Search      │                      │
│  └───────────────┘          └───────────────┘                      │
│                                                                     │
│   Supporting Systems:                                               │
│   ┌──────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────────┐  │
│   │ Watchdog │  │ Gatekeeper  │  │  Logger  │  │  Menu (CLI)  │  │
│   │ 45s timer│  │ $0.50 budget│  │ FIFO 20f │  │ Arrow keys   │  │
│   └──────────┘  └─────────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Phase 1 — Project Foundation

### 1.1 Install Dependencies
- [x] Install `dotenv`, `@google/generative-ai`, `discord.js` via `npm install`
  > **Proof:** [`package.json` L13–L17](file:///c:/Users/USER/OneDrive/Desktop/subagents/package.json)

### 1.2 Secure Key Management
- [x] Read `GEMINI_API_KEY` and `DISCORD_TOKEN` from `.env` only (never hardcoded)
  > **Proof:** [`debate-cli.js` L1–L32](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L1-L32) — `require('dotenv').config()` then `process.env.GEMINI_API_KEY`
- [x] Block execution if key is missing with a readable error
  > **Proof:** [`debate-cli.js` L158–L161](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L158-L161)
- [x] `.env`, `logs/`, `gatekeeper_status.json` ignored via `.gitignore`
  > **Proof:** [`.gitignore` L1–L6](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gitignore)

---

## ✅ Phase 2 — Agent Persona Definitions

### 2.1 Ronaldo Fan Agent
- [x] Persona file with frontmatter name, model, description fields
- [x] JSON **input** schema from the Referee (referee instructions, opponent argument, debate history)
- [x] JSON **output** schema: `thought_process`, `search_query`, `lies_or_bluffs_detected`, `argument`, `intent_to_bluff_or_lie`, `bluff_or_lie_details`
- [x] Allowed to bluff or lie strategically with a declared flag
  > **Proof:** [`.gemini/agents/ronaldo-fan.md` L7–L46](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gemini/agents/ronaldo-fan.md#L7-L46)

### 2.2 Messi Fan Agent
- [x] Mirror schema and rules to Ronaldo Fan, focused on Messi's arguments
  > **Proof:** [`.gemini/agents/messi-fan.md`](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gemini/agents/messi-fan.md)

### 2.3 Referee (Judge) Agent — *What the Referee Does*
> The Referee is the **central message hub, scoring system, and final arbitrator**. It does NOT debate. It moderates and decides.

**During Each Turn — The Referee:**
1. **Receives** the last speaker's full private JSON response (including `intent_to_bluff_or_lie` and `bluff_or_lie_details`)
2. **Receives** the detected lies list from the opposing agent
3. **Analyzes** the argument for factual accuracy, rhetorical strength, and lie detection quality
4. **Updates** a private scorecard tracking bluffs told and bluffs caught per side
5. **Publishes** a short public `referee_commentary` directing the next speaker to counter specific claims
6. **Routes** the debate by declaring `next_speaker` (the only way turns are assigned)

**At Debate End — The Referee:**
1. **Compares** scorecards: who told bluffs? Who caught them?
2. **Evaluates** rhetorical persuasion across the full debate history
3. **Declares** a binary winner (no draws allowed)
4. **Outputs** structured verdict JSON: `summary_of_arguments`, `bluff_detection_summary`, `winner`, `verdict_explanation`

> **Proof (Turn Schema):** [`.gemini/agents/referee.md` L10–L44](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gemini/agents/referee.md#L10-L44)

> **Proof (Verdict Schema):** [`.gemini/agents/referee.md` L46–L58](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gemini/agents/referee.md#L46-L58)

> **Proof (Neutrality Rule):** [`.gemini/agents/referee.md` L60–L64](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gemini/agents/referee.md#L60-L64)

> **Proof (Routing in Code):** [`debate-cli.js` L247–L270](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L247-L270) — Referee prompt is assembled with the last speaker's private bluff data, then `currentSpeaker` is reassigned from `refData.next_speaker`

---

## ✅ Phase 3 — Communication Protocol

### 3.1 Judge-Routed Flow (Child → Judge → Child)
- [x] Child agents NEVER receive each other's private fields (`thought_process`, `intent_to_bluff_or_lie`, `bluff_or_lie_details`)
- [x] Child agents only receive: `referee_instructions` (public commentary), `opponent_argument` (public text only), `debate_history` (public log)
  > **Proof:** [`debate-cli.js` L211–L215](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L211-L215)

### 3.2 JSON Communication Protocol
- [x] All messages between the Referee and agents are structured JSON objects
- [x] Robust JSON parser with markdown-block stripping and bracket-extraction fallback
  > **Proof:** [`debate-cli.js` L80–L98](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L80-L98)

### 3.3 Google Search Grounding
- [x] Both fan agents initialized with `tools: [{ googleSearch: {} }]`
- [x] `groundingMetadata` extracted and printed (search queries + web domains)
  > **Proof:** [`debate-cli.js` L66–L73](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L66-L73) (model init)
  > **Proof:** [`debate-cli.js` L139–L155](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L139-L155) (source printing)

### 3.4 Turn Count Enforcement
- [x] Minimum **10 turns per side** (20 total) configurable via `--turns`
- [x] Budget-constrained fallback: run `--turns 5` with explicit README note
  > **Proof:** [`debate-cli.js` L13](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L13) — `let turns = 10`
  > **Proof:** [`README.md` L91–L97](file:///c:/Users/USER/OneDrive/Desktop/subagents/README.md#L91-L97)

---

## ✅ Phase 4 — Robustness & Safety Systems

### 4.1 Watchdog Timeout
- [x] Wraps every model API call in a `Promise.race` with a 45-second timer
- [x] Times out gracefully with a structured error log entry
  > **Proof:** [`watchdog.js`](file:///c:/Users/USER/OneDrive/Desktop/subagents/watchdog.js)
  > **Proof (integrated):** [`debate-cli.js` L109–L114](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L109-L114)

### 4.2 Retry Logic with Exponential Backoff
- [x] Up to 3 retry attempts with 15s → 30s → 45s wait periods between failures
  > **Proof:** [`debate-cli.js` L101–L135](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L101-L135)

### 4.3 Economic Gatekeeper
- [x] Tracks prompt tokens, candidate tokens, total tokens, and estimated USD cost
- [x] Persists cumulative stats in `gatekeeper_status.json` across runs
- [x] Throws a hard blocking error when estimated cost reaches the budget limit (`$0.50`)
- [x] Budget can be reset from the CLI menu
  > **Proof:** [`gatekeeper.js`](file:///c:/Users/USER/OneDrive/Desktop/subagents/gatekeeper.js)
  > **Proof (integrated before every API call):** [`debate-cli.js` L106](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L106)

---

## ✅ Phase 5 — Logging

### 5.1 Structured JSON Logs
- [x] Every event written as `{ timestamp, level, component, message, meta }` JSON
  > **Proof:** [`logger.js` L14–L25](file:///c:/Users/USER/OneDrive/Desktop/subagents/logger.js#L14-L25)

### 5.2 FIFO Rolling File Rotation
- [x] Active log file is `logs/app.log`
- [x] When file reaches **500 lines**, rotates to `app.1.log` (max **20 files**)
- [x] Oldest file (`app.20.log`) deleted automatically when the buffer is full
  > **Proof:** [`logger.js` L36–L72](file:///c:/Users/USER/OneDrive/Desktop/subagents/logger.js#L36-L72)

---

## ✅ Phase 6 — Keyboard-Driven CLI Menu

- [x] Arrow-key navigation with visual highlight using ANSI escape codes
- [x] Ctrl+C exits gracefully
- [x] Falls back to non-interactive mode when stdin is not a TTY
- [x] Menu options:
  - `1.` Run Live Debate via Gemini API
  - `2.` Run Mock Offline Simulation
  - `3.` View Gatekeeper token budget readout
  - `4.` Run unit tests (`npm test`)
  - `5.` Reset gatekeeper budget to zero
  - `6.` Exit
  > **Proof:** [`menu.js`](file:///c:/Users/USER/OneDrive/Desktop/subagents/menu.js)
  > **Proof (menu integration):** [`debate-cli.js` L313–L381](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js#L313-L381)

---

## ✅ Phase 7 — Discord Bot

- [x] Bot uses the same Referee-routing and JSON protocol as the CLI
- [x] Custom turn counts via `!debate [N]` (e.g. `!debate 5`)
- [x] Capped at 15 turns max to protect Discord channel message limits
- [x] Watchdog, Gatekeeper, and Logger integrated identically to CLI
- [x] Search query and web sources printed inline with debate messages
  > **Proof:** [`index.js`](file:///c:/Users/USER/OneDrive/Desktop/subagents/index.js)

---

## ✅ Phase 8 — Testing (TDD)

| Test File | What It Tests | Status |
|---|---|---|
| [`test/logger.test.js`](file:///c:/Users/USER/OneDrive/Desktop/subagents/test/logger.test.js) | File creation, JSON format, 500-line roll, 20-file FIFO cap | ✅ 4/4 pass |
| [`test/gatekeeper.test.js`](file:///c:/Users/USER/OneDrive/Desktop/subagents/test/gatekeeper.test.js) | Cost tracking, state persistence, budget blocking | ✅ 4/4 pass |
| [`test/watchdog.test.js`](file:///c:/Users/USER/OneDrive/Desktop/subagents/test/watchdog.test.js) | Success resolve, error rejection, timeout trigger | ✅ 3/3 pass |
| [`test/parser.test.js`](file:///c:/Users/USER/OneDrive/Desktop/subagents/test/parser.test.js) | Clean JSON, markdown-wrapped JSON, prose JSON, malformed JSON | ✅ 4/4 pass |
| [`test/personas.test.js`](file:///c:/Users/USER/OneDrive/Desktop/subagents/test/personas.test.js) | Frontmatter loading, name parsing, prompt body presence | ✅ 3/3 pass |

> **Run all tests:** `npm test`
> **Total:** ✅ **23 assertions — 0 failures**

---

## 🔲 Phase 9 — Planned Future Features

### 9.1 Discord Reaction Voting
- [ ] After the Referee declares a winner, post an embed with 🇵🇹 and 🇦🇷 reaction buttons
- [ ] Count reactions over 60 seconds and post a community vote result
- [ ] **Why:** Adds social interactivity and crowdsourced verdict alongside the AI judge

### 9.2 Live Football Stats Integration
- [ ] Integrate an API (e.g. `football-data.org` or `API-Football`) to pull real-time match stats
- [ ] Agents can reference live score data mid-debate
- [ ] **Why:** Makes the debate dynamic and tied to current events

### 9.3 TypeScript Migration
- [ ] Convert all `.js` files to `.ts` with strict type interfaces for JSON schemas
- [ ] Add `tsconfig.json`, update `package.json` build scripts
- [ ] **Why:** Catches type errors at compile time; improves long-term maintainability

### 9.4 Configurable Debate Topics
- [ ] Allow `!debate [topic]` (e.g. `!debate Pele vs Maradona`)
- [ ] Dynamically inject topic into persona prompts at runtime
- [ ] **Why:** Makes the system reusable beyond the Messi vs Ronaldo use case

### 9.5 Debate Session Replay
- [ ] Save each full debate as a structured JSON file with full turn history
- [ ] Add a `--replay [file]` CLI flag to re-render old debates in the terminal
- [ ] **Why:** Audit, share, and study past debates without API calls

---

## 📁 Full File Map

```
subagents/
├── .gemini/
│   └── agents/
│       ├── ronaldo-fan.md    ← Ronaldo agent prompt + JSON schemas
│       ├── messi-fan.md      ← Messi agent prompt + JSON schemas
│       └── referee.md        ← Referee prompt + turn + verdict schemas
│
├── test/
│   ├── logger.test.js        ← Rolling log unit tests
│   ├── gatekeeper.test.js    ← Budget tracking unit tests
│   ├── watchdog.test.js      ← Timeout controller unit tests
│   ├── parser.test.js        ← JSON parser unit tests
│   └── personas.test.js      ← Persona markdown integrity tests
│
├── logs/                     ← Auto-generated FIFO rolling logs (gitignored)
│
├── debate-cli.js             ← Main CLI orchestrator + menu launcher
├── index.js                  ← Discord bot orchestrator
├── verify_debate_flow.js     ← Offline mock debate simulation (no API)
├── logger.js                 ← Structured JSON FIFO rolling logger
├── gatekeeper.js             ← Economic token budget monitor
├── watchdog.js               ← 45s timeout race controller
├── menu.js                   ← Keyboard-driven arrow-key terminal menu
│
├── .env                      ← API keys (gitignored, NEVER committed)
├── .env.example              ← Template for keys
├── .gitignore                ← Excludes .env, logs/, gatekeeper_status.json
├── package.json              ← Dependencies + npm test script
├── README.md                 ← Full usage guide
└── TODO.md                   ← This file
```
