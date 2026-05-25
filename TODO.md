# 📝 Project Roadmap & TODO List (From Zero to Advanced Agentic Debate)

This document maps out the development lifecycle of the GOAT debate system, tracking progress from initial setup to production-grade robustness and future features.

---

## 🛠️ Phase 1: Core Setup & Configuration
- [x] **Project Initialization:** Set up Node.js project, install packages (`dotenv`, `@google/generative-ai`, `discord.js`).
- [x] **Secret Management:** Implement secure loading of API keys from `.env` and verify [.gitignore](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gitignore) ignores local configurations.
- [x] **Agent Persona Defs:** Write markdown agent files with frontmatter loaders under `.gemini/agents/`:
  - [x] [ronaldo-fan.md](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gemini/agents/ronaldo-fan.md) (Ronaldo persona + JSON schemas)
  - [x] [messi-fan.md](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gemini/agents/messi-fan.md) (Messi persona + JSON schemas)
  - [x] [referee.md](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gemini/agents/referee.md) (Neutral Judge + JSON schemas)

---

## ⚖️ Phase 2: Dialectical Routing & JSON Communication
- [x] **Referee-Routed Flow (Child $\rightarrow$ Judge $\rightarrow$ Child):** Refactor model queries so subagents do not communicate directly. The Referee acts as the central messaging post.
- [x] **Structured JSON Protocol:** Mandate JSON schemas in prompts so that thoughts, arguments, bluffs, and detected lies are communicated via structured objects.
- [x] **Google Search Grounding:** Integrate Gemini's `googleSearch` tool to dynamically query facts and verify statements.
- [x] **Robust JSON Parsing:** Implement regex-based JSON extraction in orchestrators to handle non-JSON markdown prose returned by models.

---

## 🛡️ Phase 3: Watchdog Timeout & Gatekeeper Security
- [x] **Watchdog Timeout Controller:** Create [watchdog.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/watchdog.js) to wrap agent requests in a timeout race (45s) and catch hung or stuck processes.
- [x] **Economic Gatekeeper Layer:** Build [gatekeeper.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/gatekeeper.js) to intercept model calls, extract prompt/candidate tokens, compute USD cost metrics, persist state, and enforce budget caps (default `$0.50`).

---

## 📋 Phase 4: rolling Logging & CLI Menu Interface
- [x] **Automated Rolling JSON Logger:** Develop [logger.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/logger.js) to write structured log records (level, timestamp, metadata) in JSON format.
- [x] **FIFO Rotation:** Limit active log files to 500 lines, rotating oldest files in a rolling buffer of up to 20 files.
- [x] **Interactive CLI Menu:** Build [menu.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/menu.js) using raw mode keyboard events to navigate operations using arrow keys.
- [x] **Unified CLI Launcher:** Wrap [debate-cli.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js) to run live debates, offline simulations, check budget limits, or run tests via the interactive menu.

---

## 🧪 Phase 5: Test-Driven Quality Assurance (TDD)
- [x] **Offline Mock Orchestration:** Write [verify_debate_flow.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/verify_debate_flow.js) to mock agent JSON responses and test 5-turn debate routing offline.
- [x] **TDD Unit Testing Suite:** Build tests under `test/` using Node's native test runner (`node --test`):
  - [x] [logger.test.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/test/logger.test.js) (verification of rolling bounds and log directory generation)
  - [x] [gatekeeper.test.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/test/gatekeeper.test.js) (verification of cost calculations and budget limits)
  - [x] [watchdog.test.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/test/watchdog.test.js) (verification of timeout triggers and error bubbling)
  - [x] [parser.test.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/test/parser.test.js) (verification of robust JSON parsing under prose)
  - [x] [personas.test.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/test/personas.test.js) (verification of markdown frontmatter loading)
- [x] **NPM Test Script:** Configure `package.json` to execute native test runners via `npm test`.

---

## 🤖 Phase 6: Discord Bot Porting & Future Upgrades
- [x] **Discord Integration:** Update [index.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/index.js) with the routed debate logic, watchdog timeouts, gatekeeper budget checks, and rolling logs.
- [x] **Custom Turn Counts:** Allow users to request custom debate turns in Discord (e.g. `!debate 5`).
- [ ] **Winner Voting:** Add reaction collectors at the end of the Discord debate to allow server users to vote on who won.
- [ ] **Live Match Integration:** Enable agents to fetch current real-time stats if a match is active.
- [ ] **TypeScript Conversion:** Rewrite the codebase in TypeScript for static type checking and modular architecture.
